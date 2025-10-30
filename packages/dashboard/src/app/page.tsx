'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects } from '../lib/api';
import { Project } from '@messagejs/shared-types';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.projects);
      } catch (err: any) {
        // If fetching fails, it's likely due to an invalid/missing token,
        // so we redirect to the login page.
        if (err.message === 'Authentication token not found.') {
          router.push('/login');
        } else {
          setError(err.message || 'Failed to fetch projects.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="rounded-md bg-red-900/50 p-4 text-center text-red-300">
          <p>Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 shadow-md">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>
      <main className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">
            Create Project
          </button>
        </div>
        {projects.length > 0 ? (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-lg bg-gray-800 p-4 transition-transform hover:scale-[1.02]"
              >
                <h3 className="font-bold">{project.name}</h3>
                <p className="text-sm text-gray-400">{project.id}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 p-12 text-center">
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 text-gray-400">
              Get started by creating your first project.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
