/**
 * @file Contains the controller logic for handling analytics and statistics requests.
 *
 * This controller provides aggregated statistics about messages, including counts,
 * success rates, and time-series data for dashboard visualization.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import logger from '../../lib/logger';

/**
 * @controller getProjectStats
 * @description Fetches aggregated statistics for a specific project.
 *
 * @route GET /api/v1/projects/:projectId/analytics
 * @access Private (requires JWT authentication)
 */
export const getProjectStats = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { projectId } = req.params;

  try {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or you do not have permission to access it.',
        },
      });
    }

    // Get total message count
    const totalMessages = await prisma.messageLog.count({
      where: { projectId },
    });

    // Get counts by status
    const statusCountsRaw = await prisma.messageLog.groupBy({
      by: ['status'],
      where: { projectId },
      _count: true,
    }) as Array<{ status: string; _count: number }>;

    // Convert status counts to a more usable format
    const statusStats = {
      queued: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      undelivered: 0,
    };

    statusCountsRaw.forEach((item) => {
      const status = item.status;
      const count = item._count;
      const statusKey = status.toLowerCase() as keyof typeof statusStats;
      if (statusKey in statusStats) {
        statusStats[statusKey] = count;
      }
    });

    // Calculate success rate (sent + delivered) / total
    const successfulMessages = statusStats.sent + statusStats.delivered;
    const successRate =
      totalMessages > 0 ? (successfulMessages / totalMessages) * 100 : 0;

    // Calculate delivery rate (delivered / sent)
    const messagesAttempted = statusStats.sent + statusStats.delivered;
    const deliveryRate =
      messagesAttempted > 0 ? (statusStats.delivered / messagesAttempted) * 100 : 0;

    // Get messages from last 30 days for time-series data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMessages = await prisma.messageLog.findMany({
      where: {
        projectId,
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        timestamp: true,
        status: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Group by date for time-series
    const dailyStats: Record<string, { total: number; sent: number; delivered: number; failed: number }> = {};
    
    recentMessages.forEach((msg) => {
      const date = msg.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, sent: 0, delivered: 0, failed: 0 };
      }
      dailyStats[date].total++;
      if (msg.status === 'SENT') dailyStats[date].sent++;
      if (msg.status === 'DELIVERED') dailyStats[date].delivered++;
      if (msg.status === 'FAILED' || msg.status === 'UNDELIVERED') dailyStats[date].failed++;
    });

    // Convert to array format for charts
    const timeSeries = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get messages by connector type
    const messagesByConnector = await prisma.messageLog.groupBy({
      by: ['serviceId'],
      where: { projectId },
      _count: true,
    }) as Array<{ serviceId: string; _count: number }>;

    // Fetch service types for each serviceId
    const connectorStats = await Promise.all(
      messagesByConnector.map(async (item) => {
        const serviceId = item.serviceId;
        const count = item._count;
        const service = await prisma.service.findUnique({
          where: { id: serviceId },
          select: { type: true },
        });
        return {
          connectorType: service?.type || 'UNKNOWN',
          count: count,
        };
      }),
    );

    // Aggregate by connector type
    const connectorCounts: Record<string, number> = {};
    connectorStats.forEach((stat) => {
      const type = stat.connectorType.toLowerCase();
      connectorCounts[type] = (connectorCounts[type] || 0) + stat.count;
    });

    return res.status(200).json({
      totalMessages,
      statusCounts: statusStats,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      timeSeries,
      connectorDistribution: connectorCounts,
    });
  } catch (error) {
    logger.error({ err: error, userId, projectId }, 'Failed to get project stats.');
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve project statistics.',
      },
    });
  }
};

