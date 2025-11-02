'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProjects } from '../lib/api';
import { Project } from '@messagejs/shared-types';
import { Button } from '@/components/ui/button';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
        if (err.message.includes('Authentication token not found')) {
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

  const handleProjectCreated = (newProject: Project) => {
    // Add the new project to the top of the list for a real-time feel,
    // and sort the list by creation date to be safe.
    setProjects((prevProjects) =>
      [newProject, ...prevProjects].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="border-b border-gray-700 bg-gray-800 p-4 shadow-md">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </header>
        <main className="p-8 mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Projects</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-gray-800 p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="rounded-md bg-red-900/50 p-4 text-center text-red-300">
          <h3 className="font-bold">An Error Occurred</h3>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-800 p-4 shadow-md">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </header>
      <main className="p-8 mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <CreateProjectModal onSuccess={handleProjectCreated}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CreateProjectModal>
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/project/${project.id}`}
                className="block rounded-lg bg-gray-800 p-4 transition-transform hover:scale-[1.02] hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <h3 className="font-bold truncate">{project.name}</h3>
                <p className="text-sm text-gray-400 font-mono truncate">{project.id}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
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
