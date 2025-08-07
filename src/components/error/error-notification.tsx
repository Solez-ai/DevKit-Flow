import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import type { AppError } from '@/types';

interface ErrorNotificationProps {
  error: AppError;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function ErrorNotification({ 
  error, 
  onDismiss, 
  onRetry, 
  className = '' 
}: ErrorNotificationProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {getErrorTitle(error.code)}
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertTitle>
      <AlertDescription>
        {error.message}
        {error.timestamp && (
          <div className="text-xs text-muted-foreground mt-1">
            {error.timestamp.toLocaleString()}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

function getErrorTitle(errorCode: string): string {
  const errorTitles: Record<string, string> = {
    'SESSION_CREATE_FAILED': 'Session Creation Failed',
    'SESSION_UPDATE_FAILED': 'Session Update Failed',
    'SESSION_DELETE_FAILED': 'Session Deletion Failed',
    'SESSION_LOAD_FAILED': 'Session Loading Failed',
    'SESSION_VALIDATION_FAILED': 'Session Validation Failed',
    'TEMPLATE_CREATE_FAILED': 'Template Creation Failed',
    'TEMPLATE_UPDATE_FAILED': 'Template Update Failed',
    'TEMPLATE_DELETE_FAILED': 'Template Deletion Failed',
    'TEMPLATE_LOAD_FAILED': 'Template Loading Failed',
    'TEMPLATE_APPLY_FAILED': 'Template Application Failed',
    'TEMPLATE_EXPORT_FAILED': 'Template Export Failed',
    'TEMPLATE_IMPORT_FAILED': 'Template Import Failed',
    'AI_INIT_FAILED': 'AI Service Initialization Failed',
    'AI_CONFIG_UPDATE_FAILED': 'AI Configuration Update Failed',
    'EXPORT_FAILED': 'Export Failed',
    'EXPORT_MARKDOWN_FAILED': 'Markdown Export Failed',
    'EXPORT_TEMPLATES_FAILED': 'Template Export Failed',
    'IMPORT_FAILED': 'Import Failed',
    'STORAGE_ERROR': 'Storage Error',
    'NETWORK_ERROR': 'Network Error',
    'VALIDATION_ERROR': 'Validation Error',
  };

  return errorTitles[errorCode] || 'Error';
}