'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProjectStats } from '@/lib/api';
import { ProjectStatsResponse } from '@messagejs/shared-types';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, XCircle, Clock, Send, TrendingUp } from 'lucide-react';

export default function ProjectStatsPage() {
  const params = useParams();
  const router = useRouter();
  const { id: projectId } = params as { id: string };

  const [stats, setStats] = useState<ProjectStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getProjectStats(projectId);
        setStats(data);
      } catch (err: any) {
        if (err.message.includes('Authentication token not found')) {
          router.push('/login');
        } else {
          setError(err.message || 'Failed to fetch statistics.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [projectId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="rounded-md bg-red-900/50 p-4 text-center text-red-300">
          <p>Error:</p>
          <p>{error || 'Failed to load statistics.'}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }: {
    title: string;
    value: string | number;
    icon: typeof Activity;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/50',
      green: 'bg-green-500/10 text-green-400 border-green-500/50',
      red: 'bg-red-500/10 text-red-400 border-red-500/50',
      yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/50',
    };

    return (
      <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 opacity-50" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="mx-auto max-w-7xl">
          <Link href={`/dashboard/project/${projectId}`} className="text-sm text-blue-400 hover:underline">
            &larr; Back to Project
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Analytics & Statistics</h1>
        </div>
      </header>

      <main className="p-8 mx-auto max-w-7xl">
        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            icon={Activity}
            color="blue"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Delivery Rate"
            value={`${stats.deliveryRate.toFixed(1)}%`}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Failed Messages"
            value={stats.statusCounts.failed.toLocaleString()}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Status Breakdown */}
        <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Message Status Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-blue-400">
                {stats.statusCounts.queued}
              </div>
              <div className="text-sm text-gray-400">Queued</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-yellow-400">
                {stats.statusCounts.sent}
              </div>
              <div className="text-sm text-gray-400">Sent</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-green-400">
                {stats.statusCounts.delivered}
              </div>
              <div className="text-sm text-gray-400">Delivered</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-red-400">
                {stats.statusCounts.failed}
              </div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-orange-400">
                {stats.statusCounts.undelivered}
              </div>
              <div className="text-sm text-gray-400">Undelivered</div>
            </div>
          </div>
        </div>

        {/* Connector Distribution */}
        <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Messages by Connector</h2>
          {Object.keys(stats.connectorDistribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.connectorDistribution).map(([connector, count]) => {
                const percentage = stats.totalMessages > 0
                  ? ((count / stats.totalMessages) * 100).toFixed(1)
                  : '0';
                return (
                  <div key={connector}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize">{connector}</span>
                      <span className="font-semibold">
                        {count.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">No messages sent yet.</p>
          )}
        </div>

        {/* Time Series Chart */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">Messages Over Time (Last 30 Days)</h2>
          {stats.timeSeries.length > 0 ? (
            <div className="space-y-4">
              {/* Simple bar chart representation */}
              <div className="space-y-2">
                {stats.timeSeries.slice(-14).map((day) => {
                  const maxValue = Math.max(
                    ...stats.timeSeries.map((d) => d.total),
                  );
                  const barHeight = maxValue > 0 ? (day.total / maxValue) * 100 : 0;

                  return (
                    <div key={day.date} className="flex items-center space-x-4">
                      <div className="w-24 text-xs text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="relative h-8 overflow-hidden rounded bg-gray-700">
                          <div
                            className="absolute left-0 top-0 h-full bg-blue-500"
                            style={{ width: `${barHeight}%` }}
                          />
                          <div className="absolute left-0 top-0 flex h-full items-center px-2 text-xs font-semibold text-white">
                            {day.total}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span className="text-green-400">✓{day.delivered}</span>
                        <span className="text-yellow-400">→{day.sent}</span>
                        <span className="text-red-400">✗{day.failed}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No message activity in the last 30 days.</p>
          )}
        </div>
      </main>
    </div>
  );
}

