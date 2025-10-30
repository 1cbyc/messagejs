/**
 * @file Defines the BullMQ worker for processing message sending jobs.
 *
 * This worker listens to the 'message-sending' queue, picks up jobs, and
 * executes the logic required to send a message via the appropriate connector.
 * This should be run as a separate process from the main API server.
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { MESSAGE_QUEUE_NAME, MessageJobData } from './messageQueue';
import prisma from '../lib/prisma';
import { ConnectorFactory } from '../connectors/connectorFactory';
import { decrypt } from '../utils/encryption';
import logger from '../lib/logger';

// Load environment variables from .env file.
dotenv.config();

// Create a dedicated Redis connection for the worker.
const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

/**
 * The core processing function for a message job.
 * This function contains the logic that will be executed for each job in the queue.
 *
 * @param {Job<MessageJobData>} job The BullMQ job object, containing the job data.
 */
const processMessageJob = async (job: Job<MessageJobData>) => {
  const { messageLogId } = job.data;
  logger.info({ jobId: job.id, messageLogId }, 'Processing message job');

  // Step 1: Fetch all necessary data from the database.
  const messageLog = await prisma.messageLog.findUnique({
    where: { id: messageLogId },
    include: {
      service: true, // Include the related service configuration
      project: {     // Include the related project to get the template
        include: {
          templates: {
            // This is a placeholder; in a real scenario, the templateId would be on the messageLog.
            // For now, we assume a single template for simplicity.
            take: 1,
          },
        },
      },
    },
  });

  if (!messageLog) {
    throw new Error(`MessageLog with ID ${messageLogId} not found.`);
  }

  if (!messageLog.service) {
    throw new Error(`Service configuration not found for MessageLog ID: ${messageLogId}`);
  }

  const template = messageLog.project.templates[0];
  if (!template) {
    throw new Error(`No template found for project associated with MessageLog ID: ${messageLogId}`);
  }

  // Step 2: Decrypt the service credentials.
  let credentials;
  try {
    const decryptedCredentialsString = decrypt(messageLog.service.credentials);
    credentials = JSON.parse(decryptedCredentialsString);
  } catch (error: any) {
    // If decryption or parsing fails, the job cannot proceed.
    // Throwing an error will cause BullMQ to retry the job according to our backoff strategy.
    logger.error({ jobId: job.id, messageLogId, err: error }, 'Critical error: Failed to decrypt or parse credentials.');
    throw new Error(`Failed to decrypt credentials for MessageLog ID: ${messageLogId}. Reason: ${error.message}`);
  }

  // Step 3: Instantiate the connector using the factory.
  const connector = ConnectorFactory.create(messageLog.service.type, credentials);

  // Step 4: Send the message via the connector.
  const result = await connector.sendMessage({
    to: messageLog.recipient,
    template: template,
    variables: {}, // TODO: In a real implementation, variables would be stored on the messageLog.
  });

  // Step 5: Update the message log in the database with the result.
  await prisma.messageLog.update({
    where: { id: messageLogId },
    data: {
      status: result.success ? 'SENT' : 'FAILED',
      externalMessageId: result.externalId,
      error: result.error,
    },
  });

  logger.info({ jobId: job.id, result }, `Successfully processed job. Result: ${result.success ? 'Success' : 'Failure'}`);

  return { externalId: result.externalId, status: result.success ? 'SENT' : 'FAILED' };
};

// --- Worker Initialization ---

/**
 * The singleton instance of the message sending worker.
 * It connects to Redis and starts listening for jobs on the MESSAGE_QUEUE_NAME.
 */
const messageWorker = new Worker<MessageJobData>(
  MESSAGE_QUEUE_NAME,
  processMessageJob,
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
    limiter: {      // Optional: Rate limit jobs to avoid overwhelming third-party APIs
      max: 10,      // Max 10 jobs
      duration: 1000, // per 1000 ms (1 second)
    },
  },
);

// --- Worker Event Listeners ---
// These are crucial for logging and monitoring the health of the worker.

messageWorker.on('completed', (job, returnValue) => {
  logger.info({ jobId: job.id, returnValue }, 'Job completed successfully');
});

messageWorker.on('failed', (job, err) => {
  logger.error({ jobId: job.id, err }, 'Job failed');
  // Here, you could add logic to send a notification (e.g., to Sentry).
});

messageWorker.on('error', err => {
  logger.error({ err }, 'A BullMQ worker error occurred');
});

logger.info('🚀 Message worker is running and listening for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing message worker...');

  try {
    // Close the BullMQ worker
    await messageWorker.close();
    logger.info('Message worker closed.');

    // Disconnect Prisma client
    await prisma.$disconnect();
    logger.info('Prisma client disconnected.');

    // Close Redis connection
    await redisConnection.quit();
    logger.info('Redis connection closed.');

    // Exit the process
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during graceful shutdown');
    process.exit(1);
  }
});
