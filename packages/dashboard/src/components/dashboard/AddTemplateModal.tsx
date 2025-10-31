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
import { createTemplate } from '@/lib/api';
import { TemplateResponse, ConnectorType } from '@messagejs/shared-types';

// This list should be updated as more connector types are fully supported.
const supportedConnectors: ConnectorType[] = [
  'whatsapp',
  'telegram',
  'twilio',
];

interface AddTemplateModalProps {
  projectId: string;
  children: React.ReactNode;
  onSuccess: (newTemplate: TemplateResponse) => void;
}

export function AddTemplateModal({ projectId, children, onSuccess }: AddTemplateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [connectorType, setConnectorType] = useState<ConnectorType>('whatsapp');
  const [variablesStr, setVariablesStr] = useState(''); // Variables as a comma-separated string
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setContent('');
    setConnectorType('whatsapp');
    setVariablesStr('');
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form state after a short delay to allow for the closing animation.
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Parse the comma-separated variables string into an array of strings, trimming whitespace.
    const variables = variablesStr.split(',').map(v => v.trim()).filter(Boolean);

    try {
      const newTemplate = await createTemplate(projectId, {
        name,
        content,
        connectorType,
        variables,
      });
      onSuccess(newTemplate);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while creating the template.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        <ModalHeader>
          <ModalTitle>Create a New Message Template</ModalTitle>
          <ModalDescription>
            Define the content that will be sent to your users. Use {'{{variable}}'} syntax for personalization.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm text-gray-400">Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Order Confirmation"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="connectorType" className="text-right text-sm text-gray-400">Service</label>
              <select
                id="connectorType"
                value={connectorType}
                onChange={(e) => setConnectorType(e.target.value as ConnectorType)}
                className="col-span-3 flex h-10 w-full rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#f45817] focus:outline-none"
              >
                {supportedConnectors.map(type => (
                  <option key={type} value={type} className="capitalize bg-gray-800 text-white">{type}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="content" className="text-right text-sm text-gray-400 pt-2">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3 flex min-h-[120px] w-full rounded-md border border-gray-700 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 transition-colors focus:border-[#f45817] focus:outline-none"
                placeholder="Hello {{name}}, your order #{{orderId}} has been shipped."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="variables" className="text-right text-sm text-gray-400">Variables</label>
              <Input
                id="variables"
                value={variablesStr}
                onChange={(e) => setVariablesStr(e.target.value)}
                className="col-span-3"
                placeholder="e.g., name, orderId (comma-separated)"
              />
            </div>
            {error && (
              <div className="col-span-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Template'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
