import React, { useEffect } from 'react';
import { useErrors } from '@/hooks/use-app-store';
import { useToast } from '@/hooks/use-toast';

export function GlobalErrorHandler() {
  const { errors, removeError } = useErrors();
  const { toast } = useToast();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      toast({
        title: 'Application Error',
        description: 'A JavaScript error occurred. Please refresh the page.',
        variant: 'destructive',
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [toast]);

  // Show toast notifications for app store errors
  useEffect(() => {
    errors.forEach((error) => {
      toast({
        title: getErrorTitle(error.code),
        description: error.message,
        variant: 'destructive',
        // action: removed due to type issues
      });
    });
  }, [errors, toast, removeError]);

  return null; // This component doesn't render anything
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