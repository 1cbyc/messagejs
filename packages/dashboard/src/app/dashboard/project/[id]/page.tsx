'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiKeys, getConnectors } from '@/lib/api';
import { getApiKeys, getConnectors, getTemplates, deleteTemplate } from '@/lib/api';
import { ApiKeyResponse, ConnectorResponse, TemplateResponse } from '@messagejs/shared-types';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { CreateApiKeyModal } from '@/components/dashboard/CreateApiKeyModal';
import { AddConnectorModal } from '@/components/dashboard/AddConnectorModal';
import { AddTemplateModal } from '@/components/dashboard/AddTemplateModal';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id: projectId } = params as { id: string };

  const [apiKeys, setApiKeys] = useState<ApiKeyResponse[]>([]);
  const [connectors, setConnectors] = useState<ConnectorResponse[]>([]);
  const [templates, setTemplates] = useState<TemplateResponse[]>([]);
  const [projectName, setProjectName] = useState<string>('Loading...'); // Placeholder for project name
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [apiKeysResponse, connectorsResponse, templatesResponse] = await Promise.all([
        getApiKeys(projectId),
        getConnectors(projectId),
        getTemplates(projectId),
      ]);
      setApiKeys(apiKeysResponse.apiKeys);
      setConnectors(connectorsResponse.connectors);
      setTemplates(templatesResponse.templates);
    } catch (err: any) {
      if (err.message.includes('Authentication token not found')) {
        router.push('/login');
      } else {
        setError(err.message || 'Failed to fetch project data.');
      }
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const initialLoad = async () => {
      setIsLoading(true);
      // TODO: Fetch project name
      setProjectName(`Project Details`);
      await fetchData();
      setIsLoading(false);
    };

    initialLoad();
  }, [projectId, router]);

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(projectId, templateId);
        setTemplates(prev => prev.filter(t => t.id !== templateId));
      } catch (err: any) {
        setError(err.message || 'Failed to delete template.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p>Loading project details...</p>
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
      <header className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="mx-auto max-w-7xl">
          <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">
            &larr; Back to All Projects
          </Link>
          <h1 className="mt-2 text-2xl font-bold truncate">{projectName}</h1>
        </div>
      </header>

      <main className="p-8 mx-auto max-w-7xl">
        <div className="mb-8">
          <Link href={`/dashboard/project/${projectId}/logs`}>
            <Button variant="outline">View Message Logs</Button>
          </Link>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">API Keys</h2>
          <CreateApiKeyModal projectId={projectId} onSuccess={fetchData}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </CreateApiKeyModal>
        </div>

        {apiKeys.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
            <ul className="divide-y divide-gray-700">
              {apiKeys.map((key) => (
                <li key={key.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/50">
                  <div>
                    <p className="font-mono text-sm text-gray-300">{key.publicKey}</p>
                    <p className="text-xs text-gray-500">
                      Created on {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 p-12 text-center">
            <h3 className="text-lg font-semibold">No API Keys Found</h3>
            <p className="mt-2 text-gray-400">
              Get started by creating your first API key to use with the SDK.
            </p>
          </div>
        )}

        <div className="mt-12 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Connectors</h2>
          <AddConnectorModal projectId={projectId} onSuccess={fetchData}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Connector
            </Button>
          </AddConnectorModal>
        </div>

        {connectors.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
            <ul className="divide-y divide-gray-700">
              {connectors.map((connector) => (
                <li key={connector.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/50">
                  <div>
                    <p className="font-semibold text-sm text-gray-300 capitalize">{connector.type}</p>
                    <p className="text-xs text-gray-500">
                      Created on {new Date(connector.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 p-12 text-center">
            <h3 className="text-lg font-semibold">No Connectors Found</h3>
            <p className="mt-2 text-gray-400">
              Add a connector to start sending messages from this project.
            </p>
          </div>
        )}

        <div className="mt-12 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Message Templates</h2>
          <AddTemplateModal projectId={projectId} onSuccess={() => fetchData()}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </AddTemplateModal>
        </div>

        {templates.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
            <ul className="divide-y divide-gray-700">
              {templates.map((template) => (
                <li key={template.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-semibold text-sm text-gray-300">{template.name}</p>
                      <p className="text-xs text-gray-500">
                        For <span className="capitalize">{template.connectorType.toLowerCase()}</span> - Created on {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 p-12 text-center">
            <h3 className="text-lg font-semibold">No Templates Found</h3>
            <p className="mt-2 text-gray-400">
              Create your first message template to start sending messages.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
