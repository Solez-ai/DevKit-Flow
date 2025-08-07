/**
 * Progress Reporter Component
 * Shows progress for long-running worker tasks
 */

import React, { useState, useEffect } from 'react';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export interface TaskProgress {
  id: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  stage?: string;
  status: 'running' | 'completed' | 'error' | 'cancelled';
  error?: string;
  startTime: number;
  endTime?: number;
  estimatedDuration?: number;
}

interface ProgressReporterProps {
  tasks: TaskProgress[];
  onCancelTask?: (taskId: string) => void;
  onDismissTask?: (taskId: string) => void;
  className?: string;
}

export function ProgressReporter({
  tasks,
  onCancelTask,
  onDismissTask,
  className = ''
}: ProgressReporterProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusIcon = (status: TaskProgress['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: TaskProgress['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {tasks.map((task) => {
        const isExpanded = expandedTasks.has(task.id);
        const duration = task.endTime 
          ? task.endTime - task.startTime 
          : Date.now() - task.startTime;

        return (
          <Card key={task.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.status)}
                  <CardTitle className="text-sm font-medium">
                    {task.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {task.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {task.status === 'running' && onCancelTask && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelTask(task.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {(task.status === 'completed' || task.status === 'error' || task.status === 'cancelled') && onDismissTask && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissTask(task.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {task.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {task.description}
                </p>
              )}
              
              {task.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{task.stage || 'Processing...'}</span>
                    <span>{Math.round(task.progress)}%</span>
                  </div>
                  <Progress 
                    value={task.progress} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Elapsed: {formatDuration(duration)}</span>
                    {task.estimatedDuration && (
                      <span>
                        ETA: {formatDuration(Math.max(0, task.estimatedDuration - duration))}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {task.status === 'completed' && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="text-green-600">Completed successfully</span>
                  <span>Duration: {formatDuration(duration)}</span>
                </div>
              )}
              
              {task.status === 'error' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-red-600">Failed</span>
                    <span>Duration: {formatDuration(duration)}</span>
                  </div>
                  {task.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-700">{task.error}</p>
                    </div>
                  )}
                </div>
              )}
              
              {task.status === 'cancelled' && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="text-gray-600">Cancelled</span>
                  <span>Duration: {formatDuration(duration)}</span>
                </div>
              )}
            </CardContent>
            
            {/* Progress indicator bar */}
            <div 
              className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ${getStatusColor(task.status)}`}
              style={{ 
                width: task.status === 'running' ? `${task.progress}%` : '100%',
                opacity: task.status === 'running' ? 1 : 0.3
              }}
            />
          </Card>
        );
      })}
    </div>
  );
}

// Hook for managing task progress
export function useTaskProgress() {
  const [tasks, setTasks] = useState<TaskProgress[]>([]);

  const addTask = (task: Omit<TaskProgress, 'id' | 'startTime' | 'status'>) => {
    const newTask: TaskProgress = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      status: 'running'
    };
    
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  };

  const updateTask = (taskId: string, updates: Partial<TaskProgress>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            ...updates,
            endTime: updates.status && updates.status !== 'running' 
              ? Date.now() 
              : task.endTime
          }
        : task
    ));
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const cancelTask = (taskId: string) => {
    updateTask(taskId, { status: 'cancelled' });
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => 
      task.status === 'running'
    ));
  };

  const clearAll = () => {
    setTasks([]);
  };

  return {
    tasks,
    addTask,
    updateTask,
    removeTask,
    cancelTask,
    clearCompleted,
    clearAll
  };
}

// Progress reporter with auto-cleanup
export function AutoProgressReporter({
  autoCleanupDelay = 5000,
  maxTasks = 10,
  ...props
}: ProgressReporterProps & {
  autoCleanupDelay?: number;
  maxTasks?: number;
}) {
  const [cleanedTasks, setCleanedTasks] = useState<TaskProgress[]>(props.tasks);

  useEffect(() => {
    // Auto-cleanup completed/error/cancelled tasks after delay
    const completedTasks = props.tasks.filter(task => 
      task.status === 'completed' || task.status === 'error' || task.status === 'cancelled'
    );

    if (completedTasks.length > 0) {
      const timeouts = completedTasks.map(task => {
        const timeSinceCompletion = task.endTime ? Date.now() - task.endTime : 0;
        const remainingDelay = Math.max(0, autoCleanupDelay - timeSinceCompletion);

        return setTimeout(() => {
          setCleanedTasks(prev => prev.filter(t => t.id !== task.id));
        }, remainingDelay);
      });

      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [props.tasks, autoCleanupDelay]);

  useEffect(() => {
    // Limit number of tasks shown
    const runningTasks = props.tasks.filter(task => task.status === 'running');
    const otherTasks = props.tasks.filter(task => task.status !== 'running')
      .slice(-Math.max(0, maxTasks - runningTasks.length));
    
    setCleanedTasks([...runningTasks, ...otherTasks]);
  }, [props.tasks, maxTasks]);

  return (
    <ProgressReporter
      {...props}
      tasks={cleanedTasks}
    />
  );
}