'use client';

import * as React from 'react';
import { useState } from 'react';
import { Check, Copy, AlertTriangle } from 'lucide-react';
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
import { createApiKey } from '@/lib/api';
import { ApiKeyResponse } from '@messagejs/shared-types';

interface CreateApiKeyModalProps {
  projectId: string;
  children: React.ReactNode;
  onSuccess: (newKey: ApiKeyResponse) => void;
}

type Step = 'confirm' | 'loading' | 'success' | 'error';

export function CreateApiKeyModal({ projectId, children, onSuccess }: CreateApiKeyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('confirm');
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const handleGenerateKey = async () => {
    setStep('loading');
    setError(null);

    try {
      const response = await createApiKey(projectId);
      setNewApiKey(response.apiKey);
      setStep('success');
      // We call onSuccess here, but the API response for create doesn't match the list response.
      // For now, we'll just signal a refresh is needed. A better way would be to pass the full new object.
      // For simplicity, we'll just trigger a refresh in the parent.
      onSuccess({} as ApiKeyResponse); // Signal to parent to refetch
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setStep('error');
    }
  };

  const copyToClipboard = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
      setStep('confirm');
      setNewApiKey(null);
      setError(null);
      setHasCopied(false);
    }, 300);
  };

  const renderContent = () => {
    switch (step) {
      case 'loading':
        return <p className="text-center text-gray-400">Generating your API key...</p>;

      case 'error':
        return (
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-4 text-red-400">{error}</p>
          </div>
        );

      case 'success':
        return (
          <div>
            <ModalHeader>
              <ModalTitle>API Key Generated Successfully</ModalTitle>
              <ModalDescription className="text-yellow-400">
                Please copy this key and store it securely. You will not be able to see it again.
              </ModalDescription>
            </ModalHeader>
            <div className="my-4 flex items-center gap-2 rounded-md border border-gray-700 bg-black/50 p-3">
              <pre className="flex-1 truncate font-mono text-sm text-gray-300">
                {newApiKey}
              </pre>
              <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );

      case 'confirm':
      default:
        return (
          <ModalHeader>
            <ModalTitle>Create New API Key</ModalTitle>
            <ModalDescription>
              This will generate a new API key for this project. Are you sure you want to continue?
            </ModalDescription>
          </ModalHeader>
        );
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        {renderContent()}
        <ModalFooter>
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleGenerateKey}>Generate Key</Button>
            </>
          )}
          {(step === 'success' || step === 'error') && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
