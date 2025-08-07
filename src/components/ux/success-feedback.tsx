import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Save, Download, Upload, Copy, Trash2, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SuccessFeedbackProps {
  action: 'save' | 'delete' | 'create' | 'update' | 'export' | 'import' | 'copy' | 'custom';
  message?: string;
  icon?: React.ReactNode;
  duration?: number;
  onComplete?: () => void;
}

export function SuccessFeedback({ 
  action, 
  message, 
  icon, 
  duration = 2000,
  onComplete 
}: SuccessFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const getDefaultIcon = () => {
    switch (action) {
      case 'save': return <Save className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'create': return <Plus className="h-4 w-4" />;
      case 'update': return <Edit className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'import': return <Upload className="h-4 w-4" />;
      case 'copy': return <Copy className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getDefaultMessage = () => {
    switch (action) {
      case 'save': return 'Saved successfully';
      case 'delete': return 'Deleted successfully';
      case 'create': return 'Created successfully';
      case 'update': return 'Updated successfully';
      case 'export': return 'Exported successfully';
      case 'import': return 'Imported successfully';
      case 'copy': return 'Copied to clipboard';
      default: return 'Action completed successfully';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30 
          }}
          className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
          >
            {icon || getDefaultIcon()}
          </motion.div>
          <span className="text-sm font-medium">
            {message || getDefaultMessage()}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for showing success feedback
export function useSuccessFeedback() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<SuccessFeedbackProps | null>(null);

  const showSuccess = (props: SuccessFeedbackProps) => {
    setFeedback(props);
    
    // Also show toast for accessibility
    toast({
      title: "Success",
      description: props.message || getDefaultMessage(props.action),
      variant: "default",
    });
  };

  const clearFeedback = () => {
    setFeedback(null);
  };

  return {
    showSuccess,
    clearFeedback,
    feedback
  };
}

function getDefaultMessage(action: SuccessFeedbackProps['action']): string {
  switch (action) {
    case 'save': return 'Saved successfully';
    case 'delete': return 'Deleted successfully';
    case 'create': return 'Created successfully';
    case 'update': return 'Updated successfully';
    case 'export': return 'Exported successfully';
    case 'import': return 'Imported successfully';
    case 'copy': return 'Copied to clipboard';
    default: return 'Action completed successfully';
  }
}

// Contextual success messages for specific actions
export function SessionSavedFeedback() {
  return (
    <SuccessFeedback 
      action="save" 
      message="Session saved successfully"
      icon={<Save className="h-4 w-4" />}
    />
  );
}

export function NodeCreatedFeedback() {
  return (
    <SuccessFeedback 
      action="create" 
      message="Node created successfully"
      icon={<Plus className="h-4 w-4" />}
    />
  );
}

export function PatternExportedFeedback() {
  return (
    <SuccessFeedback 
      action="export" 
      message="Pattern exported successfully"
      icon={<Download className="h-4 w-4" />}
    />
  );
}

export function DataImportedFeedback() {
  return (
    <SuccessFeedback 
      action="import" 
      message="Data imported successfully"
      icon={<Upload className="h-4 w-4" />}
    />
  );
}

// Batch operation feedback
export function BatchOperationFeedback({ 
  operation, 
  count, 
  total 
}: { 
  operation: string;
  count: number;
  total: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((count / total) * 100);
  }, [count, total]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg min-w-[200px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CheckCircle className="h-4 w-4" />
        </motion.div>
        <span className="text-sm font-medium">{operation}</span>
      </div>
      <div className="text-xs text-blue-100 mb-2">
        {count} of {total} completed
      </div>
      <div className="w-full bg-blue-400 rounded-full h-2">
        <motion.div
          className="bg-white h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

// Confirmation feedback for destructive actions
export function DestructiveActionFeedback({ 
  action, 
  itemName, 
  onUndo 
}: { 
  action: string;
  itemName: string;
  onUndo?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Longer duration for destructive actions

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed bottom-4 right-4 z-50 bg-orange-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">
              {action} "{itemName}"
            </span>
          </div>
          {onUndo && (
            <button
              onClick={() => {
                onUndo();
                setIsVisible(false);
              }}
              className="text-xs bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded transition-colors"
            >
              Undo
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}