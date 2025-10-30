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
import { MessageStatus as PrismaMessageStatus } from '@prisma/client';
import { MessageStatus as SharedMessageStatus } from '@messagejs/shared-types';

// Load environment variables from .env file.
dotenv.config();

// Create a dedicated Redis connection for the worker.
const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

/**
 * Maps the lowercase status from the shared-types package to the uppercase
 * Prisma enum status.
 * @param status The lowercase status from a connector result.
 * @returns The corresponding uppercase Prisma enum value.
 */
const mapToPrismaStatus = (
  status: SharedMessageStatus,
): PrismaMessageStatus => {
  switch (status) {
    case 'sent':
      return 'SENT';
    case 'delivered':
      return 'DELIVERED';
    case 'failed':
      return 'FAILED';
    case 'pending':
      return 'QUEUED';
    case 'read':
      return 'DELIVERED';
    default:
      return 'FAILED';
  }
};

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
      service: true,
      project: true,
    },
  });

  if (!messageLog) {
    throw new Error(`MessageLog with ID ${messageLogId} not found.`);
  }

  if (!messageLog.service) {
    throw new Error(`Service configuration not found for MessageLog ID: ${messageLogId}`);
  }

  // Fetch the template explicitly using templateId from the message log
  const template = await prisma.template.findFirst({
    where: { id: messageLog.templateId, projectId: messageLog.projectId },
  });
  if (!template) {
    throw new Error(`Template with ID ${messageLog.templateId} not found for project ${messageLog.projectId}`);
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

  // Step 4: Render the template with the variables.
  let renderedMessage = template.body;
  const variables = (messageLog.variables as Record<string, any>) ?? {};
  for (const key in variables) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    renderedMessage = renderedMessage.replace(
      new RegExp(`{{${escapedKey}}}`, 'g'),
      variables[key],
    );
  }

  // Step 5: Send the message via the connector using the new signature.
  const result = await connector.sendMessage(
    messageLog.recipient,
    renderedMessage,
  );

  // Step 6: Update the message log in the database with the result.
  await prisma.messageLog.update({
    where: { id: messageLogId },
    data: {
      status: mapToPrismaStatus(result.status),
      externalMessageId: result.externalId,
      error: result.error,
      // The `sentAt` timestamp is set only on a successful dispatch.
      ...(result.success && { sentAt: new Date() }),
    },
  });

  logger.info(
    { jobId: job.id, result },
    `Successfully processed job. Result: ${result.status}`,
  );

  return { externalId: result.externalId, status: result.status };
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
  if (job) {
    logger.error({ jobId: job.id, err }, 'Job failed');
  } else {
    logger.error({ err }, 'An unknown job failed');
  }
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
