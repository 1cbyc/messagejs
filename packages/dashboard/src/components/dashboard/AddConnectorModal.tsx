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
import { createConnector } from '@/lib/api';
import { ConnectorType } from '@messagejs/shared-types';
import { ArrowLeft, MessageSquare, Phone } from 'lucide-react';

// Define the structure for the fields required by each connector type
interface ConnectorField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password';
}

// Configuration object for dynamic form generation
const CONNECTOR_CONFIG: Record<string, { name: string; fields: ConnectorField[] }> = {
  whatsapp: {
    name: 'WhatsApp',
    fields: [
      { id: 'phoneNumberId', label: 'Phone Number ID', placeholder: 'e.g., 123456789012345', type: 'text' },
      { id: 'accessToken', label: 'Access Token', placeholder: 'Your permanent access token', type: 'password' },
    ],
  },
  twilio: {
    name: 'Twilio SMS',
    fields: [
      { id: 'accountSid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'text' },
      { id: 'authToken', label: 'Auth Token', placeholder: 'Your Twilio auth token', type: 'password' },
      { id: 'fromNumber', label: 'From Number', placeholder: 'Your Twilio phone number', type: 'text' },
    ],
  },
  // Add other connectors like 'telegram' here in the future
};

interface AddConnectorModalProps {
  projectId: string;
  children: React.ReactNode;
  onSuccess: () => void;
}

type Step = 'selection' | 'form';

export function AddConnectorModal({ projectId, children, onSuccess }: AddConnectorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('selection');
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectType = (type: ConnectorType) => {
    setSelectedType(type);
    // Initialize credentials state for the selected type
    const initialCreds = CONNECTOR_CONFIG[type].fields.reduce((acc, field) => {
      acc[field.id] = '';
      return acc;
    }, {} as Record<string, string>);
    setCredentials(initialCreds);
    setStep('form');
  };

  const handleCredentialChange = (fieldId: string, value: string) => {
    setCredentials(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsLoading(true);
    setError(null);

    try {
      await createConnector(projectId, { type: selectedType, credentials });
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after a short delay for the closing animation
    setTimeout(() => {
      setStep('selection');
      setSelectedType(null);
      setCredentials({});
      setError(null);
      setIsLoading(false);
    }, 300);
  };

  const renderSelectionStep = () => (
    <>
      <ModalHeader>
        <ModalTitle>Add a New Connector</ModalTitle>
        <ModalDescription>
          Choose a service you want to connect to this project.
        </ModalDescription>
      </ModalHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        {Object.keys(CONNECTOR_CONFIG).map(key => (
          <button
            key={key}
            onClick={() => handleSelectType(key as ConnectorType)}
            className="flex flex-col items-center justify-center space-y-2 rounded-lg border border-gray-700 p-6 text-center transition-colors hover:bg-gray-800 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {key === 'whatsapp' && <MessageSquare className="h-8 w-8 text-green-500" />}
            {key === 'twilio' && <Phone className="h-8 w-8 text-red-500" />}
            <span className="font-semibold text-white">{CONNECTOR_CONFIG[key].name}</span>
          </button>
        ))}
      </div>
    </>
  );

  const renderFormStep = () => {
    if (!selectedType) return null;
    const config = CONNECTOR_CONFIG[selectedType];

    return (
      <>
        <ModalHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setStep('selection')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <ModalTitle>Configure {config.name}</ModalTitle>
          </div>
          <ModalDescription className="pl-10">
            Enter your credentials. These will be encrypted and stored securely.
          </ModalDescription>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {config.fields.map(field => (
              <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                <label htmlFor={field.id} className="text-right text-sm text-gray-400">
                  {field.label}
                </label>
                <Input
                  id={field.id}
                  type={field.type}
                  value={credentials[field.id] || ''}
                  onChange={(e) => handleCredentialChange(field.id, e.target.value)}
                  className="col-span-3"
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}
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
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Connector'}
            </Button>
          </ModalFooter>
        </form>
      </>
    );
  };

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        {step === 'selection' ? renderSelectionStep() : renderFormStep()}
      </ModalContent>
    </Modal>
  );
}
