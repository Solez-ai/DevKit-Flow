import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Loader2
} from 'lucide-react';
import type { RecoveryAction } from '@/lib/error-recovery';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: any;
  errorType: string;
  actions: RecoveryAction[];
}

export function RecoveryModal({ 
  isOpen, 
  onClose, 
  error, 
  errorType, 
  actions 
}: RecoveryModalProps) {
  const [selectedAction, setSelectedAction] = useState<RecoveryAction | null>(null);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [actionResults, setActionResults] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedAction(null);
      setExecutingAction(null);
      setActionResults({});
      setProgress(0);
    }
  }, [isOpen]);

  const handleExecuteAction = async (action: RecoveryAction) => {
    setExecutingAction(action.id);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const success = await action.execute();
      
      clearInterval(progressInterval);
      setProgress(100);

      setActionResults(prev => ({
        ...prev,
        [action.id]: success
      }));

      if (success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Recovery action failed:', error);
      setActionResults(prev => ({
        ...prev,
        [action.id]: false
      }));
    } finally {
      setExecutingAction(null);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const getPriorityColor = (priority: RecoveryAction['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: RecoveryAction['priority']) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <RefreshCw className="h-4 w-4" />;
      case 'medium': return <Download className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Error Recovery Assistant
          </DialogTitle>
          <DialogDescription>
            An error occurred that requires manual intervention. Please select a recovery action below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Error Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Type:</span>
                <Badge variant="outline" className="ml-2">{errorType}</Badge>
              </div>
              <div>
                <span className="font-medium">Message:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {error?.message || String(error)}
                </p>
              </div>
              {error?.stack && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Technical Details
                  </summary>
                  <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>

          {/* Recovery Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recovery Actions</CardTitle>
              <CardDescription>
                Select an action to attempt recovery. Actions are ordered by priority.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actions.map((action) => (
                  <div
                    key={action.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedAction?.id === action.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(action.priority)}
                          <h4 className="font-medium">{action.name}</h4>
                          <Badge variant={getPriorityColor(action.priority) as any}>
                            {action.priority}
                          </Badge>
                          {actionResults[action.id] !== undefined && (
                            <Badge variant={actionResults[action.id] ? 'default' : 'destructive'}>
                              {actionResults[action.id] ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {actionResults[action.id] ? 'Success' : 'Failed'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant={selectedAction?.id === action.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedAction(action)}
                          disabled={executingAction !== null}
                        >
                          Select
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleExecuteAction(action)}
                          disabled={executingAction !== null}
                        >
                          {executingAction === action.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Execute
                        </Button>
                      </div>
                    </div>
                    
                    {executingAction === action.id && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Executing recovery action...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Action Details */}
          {selectedAction && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Action: {selectedAction.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Description:</strong> {selectedAction.description}
                    <br />
                    <strong>Priority:</strong> {selectedAction.priority}
                    <br />
                    <strong>Warning:</strong> This action will attempt to recover from the error. 
                    Some data or settings may be affected. Consider exporting your data first if possible.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Export error report
                  const errorReport = {
                    error: {
                      type: errorType,
                      message: error?.message,
                      stack: error?.stack
                    },
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    actions: actions.map(a => ({ id: a.id, name: a.name, priority: a.priority })),
                    results: actionResults
                  };

                  const blob = new Blob([JSON.stringify(errorReport, null, 2)], { 
                    type: 'application/json' 
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `error-report-${Date.now()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Error Report
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {selectedAction && (
                <Button
                  onClick={() => handleExecuteAction(selectedAction)}
                  disabled={executingAction !== null}
                >
                  {executingAction === selectedAction.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    getPriorityIcon(selectedAction.priority)
                  )}
                  Execute {selectedAction.name}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage recovery modal state
export function useRecoveryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<any>(null);
  const [errorType, setErrorType] = useState<string>('');
  const [actions, setActions] = useState<RecoveryAction[]>([]);

  useEffect(() => {
    const handleShowRecoveryModal = (event: CustomEvent) => {
      const { error, errorType, actions } = event.detail;
      setError(error);
      setErrorType(errorType);
      setActions(actions);
      setIsOpen(true);
    };

    window.addEventListener('show-recovery-modal', handleShowRecoveryModal as EventListener);

    return () => {
      window.removeEventListener('show-recovery-modal', handleShowRecoveryModal as EventListener);
    };
  }, []);

  return {
    isOpen,
    error,
    errorType,
    actions,
    onClose: () => setIsOpen(false)
  };
}