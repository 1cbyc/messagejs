/**
 * @file Initializes and exports the BullMQ queue for processing message sending jobs.
 *
 * This module creates a single, reusable instance of the message queue, which
 * is connected to the Redis server specified in the environment variables.
 * The queue is responsible for holding jobs that represent messages to be sent.
 * A separate worker process will listen to this queue and process the jobs.
 */

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables from .env file to ensure REDIS_URL is available.
dotenv.config();

/**
 * The name of the queue. This is used to identify the queue in BullMQ
 * and should be consistent between the producer (API) and the consumer (worker).
 */
export const MESSAGE_QUEUE_NAME = 'message-sending';

/**
 * A strongly-typed interface for the data that will be stored in each job.
 * This ensures type safety when adding jobs to the queue and when processing them.
 */
export interface MessageJobData {
  messageLogId: string;
}

// Create a single, reusable Redis connection instance for BullMQ.
// Using a single connection instance is a best practice for efficiency.
// `maxRetriesPerRequest: null` is recommended by the BullMQ documentation.
const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

/**
 * The singleton instance of the message sending queue.
 * It is configured with a default connection to Redis. It also specifies
 * default job options, such as retrying failed jobs and cleaning up old jobs.
 *
 * @example
 * import { messageQueue } from '@/queues/messageQueue';
 *
 * await messageQueue.add('send-whatsapp', { messageLogId: 'some-id' });
 */
export const messageQueue = new Queue<MessageJobData>(MESSAGE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry a failed job up to 3 times
    backoff: {
      type: 'exponential', // Use exponential backoff strategy for retries
      delay: 5000, // Initial delay of 5 seconds before the first retry
    },
    removeOnComplete: {
      count: 1000, // Keep the last 1000 completed jobs for auditing
      age: 24 * 3600, // Keep completed jobs for up to 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep a larger number of failed jobs for debugging
      age: 7 * 24 * 3600, // Keep failed jobs for up to 7 days
    },
  },
});

// A simple event listener to log any connection errors with the queue itself.
messageQueue.on('error', (err) => {
  console.error(`[MessageQueue] BullMQ Queue Error: ${err.message}`);
});
