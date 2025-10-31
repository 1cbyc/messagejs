'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createProject } from '@/lib/api';
import { Project } from '@messagejs/shared-types';

interface CreateProjectModalProps {
  children: React.ReactNode;
  onSuccess: (newProject: Project) => void;
}

export function CreateProjectModal({ children, onSuccess }: CreateProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newProject = await createProject({ name });
      onSuccess(newProject);
      setIsOpen(false); // Close the modal on success
      // Reset form fields for the next time it opens
      setName('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Create a New Project</ModalTitle>
          <ModalDescription>
            Projects are containers for your API keys, connectors, and message templates.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm text-gray-400">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="My Awesome Project"
                required
              />
            </div>
            {error && (
              <div className="col-span-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
