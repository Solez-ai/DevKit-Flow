import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, Database, Zap, Download, Upload, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LoadingStateProps {
  message?: string;
  progress?: number;
  type?: 'default' | 'data' | 'ai' | 'export' | 'import' | 'settings';
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  message = 'Loading...', 
  progress, 
  type = 'default',
  size = 'md' 
}: LoadingStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'data': return <Database className="h-6 w-6" />;
      case 'ai': return <Zap className="h-6 w-6" />;
      case 'export': return <Download className="h-6 w-6" />;
      case 'import': return <Upload className="h-6 w-6" />;
      case 'settings': return <Settings className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'p-4 gap-2';
      case 'lg': return 'p-8 gap-4';
      default: return 'p-6 gap-3';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className={`flex flex-col items-center text-center ${getSizeClasses()}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-primary"
        >
          {getIcon()}
        </motion.div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">{message}</p>
          
          {progress !== undefined && (
            <div className="w-full space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton loading components
export function NodeSkeleton() {
  return (
    <div className="w-64 h-32 bg-card border border-border rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-muted rounded w-1/4"></div>
          <div className="h-6 w-6 bg-muted rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function SessionListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-48"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-muted rounded w-24"></div>
              <div className="h-2 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CanvasSkeleton() {
  return (
    <div className="flex-1 bg-muted/20 relative animate-pulse">
      <div className="absolute inset-4 space-y-4">
        <div className="flex justify-between">
          <NodeSkeleton />
          <NodeSkeleton />
        </div>
        <div className="flex justify-center">
          <NodeSkeleton />
        </div>
        <div className="flex justify-between">
          <NodeSkeleton />
          <NodeSkeleton />
        </div>
      </div>
    </div>
  );
}

// Contextual loading states
export function SessionLoadingState() {
  return (
    <LoadingState 
      message="Loading your sessions..." 
      type="data"
      size="lg"
    />
  );
}

export function AIProcessingState({ progress }: { progress?: number }) {
  return (
    <LoadingState 
      message="AI is processing your request..." 
      type="ai"
      progress={progress}
    />
  );
}

export function ExportLoadingState({ progress }: { progress?: number }) {
  return (
    <LoadingState 
      message="Preparing your export..." 
      type="export"
      progress={progress}
    />
  );
}

export function ImportLoadingState({ progress }: { progress?: number }) {
  return (
    <LoadingState 
      message="Importing your data..." 
      type="import"
      progress={progress}
    />
  );
}

// Animated dots loading
export function DotsLoading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  
  return (
    <div className="flex items-center space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSize} bg-primary rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

// Pulse loading animation
export function PulseLoading({ 
  children, 
  isLoading 
}: { 
  children: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <motion.div
      animate={isLoading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
      transition={isLoading ? { duration: 1.5, repeat: Infinity } : {}}
    >
      {children}
    </motion.div>
  );
}

// Shimmer loading effect
export function ShimmerLoading({ 
  width = '100%', 
  height = '1rem',
  className = '' 
}: { 
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div 
      className={`bg-muted rounded overflow-hidden relative ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Progress ring component
export function ProgressRing({ 
  progress, 
  size = 40, 
  strokeWidth = 4,
  children 
}: { 
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}