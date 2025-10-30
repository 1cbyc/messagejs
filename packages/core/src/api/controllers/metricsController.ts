/**
 * @file Contains the controller and configuration for exposing Prometheus metrics.
 *
 * This module uses the 'prom-client' library to register and collect
 * application-level metrics, which can be scraped by a Prometheus server.
 */

import { Request, Response } from 'express';
import { register, Counter, collectDefaultMetrics } from 'prom-client';

// --- 1. Metric Definitions ---

// Enable the collection of default Node.js and process metrics.
// This includes things like CPU usage, memory usage, event loop lag, etc.,
// which are useful for monitoring the overall health of the service.
collectDefaultMetrics();

/**
 * A counter to track the total number of messages that have been queued.
 * This metric is incremented every time a message is successfully added to the queue.
 *
 * Labels:
 * - `projectId`: The project the message belongs to, allowing for per-project monitoring.
 * - `connectorId`: The connector used, to track usage per integration.
 */
export const messagesQueuedCounter = new Counter({
  name: 'messagejs_messages_queued_total',
  help: 'Total number of messages successfully queued for sending',
  labelNames: ['projectId', 'connectorId'],
});

// --- 2. Metrics Controller ---

/**
 * @controller getMetrics
 * @description An Express controller that serves the collected Prometheus metrics.
 * It sets the appropriate content type and returns the metrics registry.
 *
 * @route GET /metrics
 * @access Public (typically firewalled to be accessible only by a Prometheus server)
 */
export const getMetrics = async (_req: Request, res: Response) => {
  try {
    // Set the content type to the one Prometheus expects.
    res.set('Content-Type', register.contentType);
    // Return the collected metrics as a string.
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).send('Error collecting metrics');
  }
};
