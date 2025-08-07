/**
 * Advanced Virtual Canvas Component
 * Combines virtual rendering, smart lazy loading, and performance monitoring
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DevFlowNode } from '../../types';
import { useVirtualRendering } from '../../lib/virtual-rendering';
import { useSmartLazyLoading } from '../../lib/smart-lazy-loading';
import { usePerformanceMonitor, PerformanceAlert } from '../../lib/performance-monitor';
import { NodeComponent } from '../nodes/NodeComponent';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';
import { 
  AlertTriangle, 
  Activity, 
  Zap, 
  Settings, 
  TrendingUp,
  Memory,
  Clock
} from 'lucide-react';

interface AdvancedVirtualCanvasProps {
  nodes: DevFlowNode[];
  onNodeSelect?: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<DevFlowNode>) => void;
  selectedNodes?: string[];
  className?: string;
  aiOptimizationEnabled?: boolean;
  showPerformanceMetrics?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

export const AdvancedVirtualCanvas: React.FC<AdvancedVirtualCanvasProps> = ({
  nodes,
  onNodeSelect,
  onNodeUpdate,
  selectedNodes = [],
  className,
  aiOptimizationEnabled = true,
  showPerformanceMetrics = false,
  itemHeight = 120,
  containerHeight = 600
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Virtual rendering with AI optimization
  const { visibleItems, totalHeight, handleScroll, engine } = useVirtualRendering(nodes, {
    itemHeight,
    containerHeight,
    overscan: optimizationLevel === 'high' ? 2 : optimizationLevel === 'medium' ? 3 : 5,
    predictiveLoadingFactor: optimizationLevel === 'high' ? 0.8 : optimizationLevel === 'medium' ? 0.5 : 0.3,
    aiOptimizationEnabled,
    memoryThreshold: optimizationLevel === 'high' ? 200 : optimizationLevel === 'medium' ? 100 : 50
  });

  // Smart lazy loading for node content
  const { 
    registerItem, 
    observe, 
    unobserve, 
    isLoaded, 
    isLoading, 
    getLoadedData 
  } = useSmartLazyLoading({
    aiPredictionEnabled: aiOptimizationEnabled,
    maxConcurrentLoads: optimizationLevel === 'high' ? 5 : optimizationLevel === 'medium' ? 3 : 2,
    cacheSize: optimizationLevel === 'high' ? 200 : optimizationLevel === 'medium' ? 100 : 50
  });

  // Performance monitoring
  const { currentMetrics, alerts, generateReport } = usePerformanceMonitor({
    maxRenderTime: optimizationLevel === 'high' ? 8 : optimizationLevel === 'medium' ? 16 : 32,
    maxMemoryUsage: optimizationLevel === 'high' ? 200 : optimizationLevel === 'medium' ? 100 : 50,
    maxInteractionLatency: optimizationLevel === 'high' ? 50 : optimizationLevel === 'medium' ? 100 : 200
  });

  // Register nodes for lazy loading
  useEffect(() => {
    nodes.forEach(node => {
      registerItem({
        id: node.id,
        data: node,
        priority: node.status === 'active' ? 0.8 : node.status === 'completed' ? 0.3 : 0.5
      });
    });
  }, [nodes, registerItem]);

  // Handle scroll with performance tracking
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    
    // Mark performance measurement
    performance.mark('scroll-start');
    
    handleScroll(scrollTop);
    
    performance.mark('scroll-end');
    performance.measure('scroll-handling', 'scroll-start', 'scroll-end');
  }, [handleScroll]);

  // Handle node selection with interaction tracking
  const handleNodeSelect = useCallback((nodeId: string) => {
    performance.mark('node-select-start');
    onNodeSelect?.(nodeId);
    performance.mark('node-select-end');
    performance.measure('node-selection', 'node-select-start', 'node-select-end');
  }, [onNodeSelect]);

  // Handle node updates with change tracking
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<DevFlowNode>) => {
    performance.mark('node-update-start');
    onNodeUpdate?.(nodeId, updates);
    performance.mark('node-update-end');
    performance.measure('node-update', 'node-update-start', 'node-update-end');
  }, [onNodeUpdate]);

  // Node item renderer with lazy loading
  const renderNodeItem = useCallback((node: DevFlowNode, index: number) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const isSelected = selectedNodes.includes(node.id);
    const loaded = isLoaded(node.id);
    const loading = isLoading(node.id);

    useEffect(() => {
      if (itemRef.current) {
        observe(itemRef.current, node.id);
        return () => {
          if (itemRef.current) {
            unobserve(itemRef.current);
          }
        };
      }
    }, []);

    return (
      <div
        ref={itemRef}
        className={cn(
          "virtual-node-item transition-all duration-200",
          loading && "opacity-50",
          !loaded && "bg-muted/20"
        )}
      >
        {loaded ? (
          <NodeComponent
            node={node}
            isSelected={isSelected}
            onSelect={() => handleNodeSelect(node.id)}
            onUpdate={(updates) => handleNodeUpdate(node.id, updates)}
            compact={true}
          />
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span className="text-sm">Scroll to load</span>
          </div>
        )}
      </div>
    );
  }, [selectedNodes, isLoaded, isLoading, observe, unobserve, handleNodeSelect, handleNodeUpdate]);

  // Performance metrics display
  const renderPerformanceMetrics = () => {
    if (!showPerformanceMetrics || !currentMetrics) return null;

    return (
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Performance</span>
          <Activity className="h-4 w-4 text-primary" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Render Time
            </span>
            <span className={cn(
              currentMetrics.renderTime > 16 ? "text-red-500" : 
              currentMetrics.renderTime > 8 ? "text-yellow-500" : "text-green-500"
            )}>
              {currentMetrics.renderTime.toFixed(1)}ms
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center">
              <Memory className="h-3 w-3 mr-1" />
              Memory
            </span>
            <span className={cn(
              currentMetrics.memoryUsage > 100 ? "text-red-500" : 
              currentMetrics.memoryUsage > 50 ? "text-yellow-500" : "text-green-500"
            )}>
              {currentMetrics.memoryUsage.toFixed(1)}MB
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>Items Rendered</span>
            <span>{currentMetrics.itemsRendered}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>Cache Hit Rate</span>
            <span className="text-green-500">
              {(currentMetrics.cacheHitRate * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Performance alerts display
  const renderPerformanceAlerts = () => {
    if (alerts.length === 0) return null;

    return (
      <div className="absolute top-4 left-4 space-y-2 max-w-sm">
        {alerts.slice(0, 3).map((alert, index) => (
          <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {alert.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    );
  };

  // Optimization controls
  const renderOptimizationControls = () => {
    if (!showSettings) return null;

    return (
      <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 space-y-3 min-w-[250px]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">AI Optimization</span>
          <Zap className="h-4 w-4 text-primary" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Optimization Level</span>
            <div className="flex space-x-1">
              {(['low', 'medium', 'high'] as const).map(level => (
                <Button
                  key={level}
                  size="sm"
                  variant={optimizationLevel === level ? 'default' : 'outline'}
                  onClick={() => setOptimizationLevel(level)}
                  className="text-xs px-2 py-1 h-6"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>Visible Items</span>
            <Badge variant="secondary">{visibleItems.length}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>Total Items</span>
            <Badge variant="outline">{nodes.length}</Badge>
          </div>
          
          {currentMetrics && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground mb-1">Performance Score</div>
              <Progress 
                value={Math.max(0, 100 - (currentMetrics.renderTime * 2 + currentMetrics.memoryUsage / 2))} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main virtual canvas */}
      <div
        ref={containerRef}
        className="virtual-canvas overflow-auto"
        style={{ height: containerHeight }}
        onScroll={onScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((virtualItem) => (
            <div
              key={virtualItem.id}
              style={{
                position: 'absolute',
                top: virtualItem.index * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight
              }}
            >
              {renderNodeItem(virtualItem.data, virtualItem.index)}
            </div>
          ))}
        </div>
      </div>

      {/* Performance metrics overlay */}
      {renderPerformanceMetrics()}

      {/* Performance alerts */}
      {renderPerformanceAlerts()}

      {/* Optimization controls */}
      {renderOptimizationControls()}

      {/* Control buttons */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
        
        {aiOptimizationEnabled && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const report = generateReport?.();
              console.log('Performance Report:', report);
            }}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Report
          </Button>
        )}
      </div>

      {/* Loading indicator for empty state */}
      {visibleItems.length === 0 && nodes.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Initializing virtual canvas...</p>
          </div>
        </div>
      )}
    </div>
  );
};