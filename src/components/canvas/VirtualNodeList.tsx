/**
 * Virtual Node List Component
 * Efficiently renders large lists of nodes using virtual scrolling
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { DevFlowNode } from '../../types';
import { useVirtualRendering } from '../../lib/virtual-rendering';
import { NodeComponent } from '../nodes/NodeComponent';
import { cn } from '../../lib/utils';

interface VirtualNodeListProps {
  nodes: DevFlowNode[];
  onNodeSelect?: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<DevFlowNode>) => void;
  selectedNodes?: string[];
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
}

export const VirtualNodeList: React.FC<VirtualNodeListProps> = ({
  nodes,
  onNodeSelect,
  onNodeUpdate,
  selectedNodes = [],
  className,
  itemHeight = 120,
  containerHeight = 600
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { visibleItems, totalHeight, handleScroll } = useVirtualRendering(nodes, {
    itemHeight,
    containerHeight,
    overscan: 3,
    predictiveLoadingFactor: 0.3,
    aiOptimizationEnabled: true,
    memoryThreshold: 100
  });

  // Handle container scroll
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    handleScroll(scrollTop);
  }, [handleScroll]);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    onNodeSelect?.(nodeId);
  }, [onNodeSelect]);

  // Handle node updates
  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<DevFlowNode>) => {
    onNodeUpdate?.(nodeId, updates);
  }, [onNodeUpdate]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "virtual-node-list overflow-auto",
        className
      )}
      style={{ height: containerHeight }}
      onScroll={onScroll}
    >
      {/* Virtual container with total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map((virtualItem) => {
          const node = virtualItem.data;
          const isSelected = selectedNodes.includes(node.id);
          
          return (
            <div
              key={virtualItem.id}
              style={{
                position: 'absolute',
                top: virtualItem.index * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight
              }}
              className="virtual-item"
            >
              <NodeComponent
                node={node}
                isSelected={isSelected}
                onSelect={() => handleNodeSelect(node.id)}
                onUpdate={(updates) => handleNodeUpdate(node.id, updates)}
                compact={true}
              />
            </div>
          );
        })}
      </div>
      
      {/* Loading indicator for predictive loading */}
      {visibleItems.length === 0 && nodes.length > 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading nodes...</span>
        </div>
      )}
    </div>
  );
};

/**
 * Virtual Pattern List Component for Regexr++
 */
interface VirtualPatternListProps {
  patterns: any[]; // RegexPattern type would be imported
  onPatternSelect?: (patternId: string) => void;
  selectedPattern?: string;
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
}

export const VirtualPatternList: React.FC<VirtualPatternListProps> = ({
  patterns,
  onPatternSelect,
  selectedPattern,
  className,
  itemHeight = 80,
  containerHeight = 400
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { visibleItems, totalHeight, handleScroll } = useVirtualRendering(patterns, {
    itemHeight,
    containerHeight,
    overscan: 5,
    predictiveLoadingFactor: 0.4,
    aiOptimizationEnabled: true,
    memoryThreshold: 50
  });

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    handleScroll(scrollTop);
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "virtual-pattern-list overflow-auto border rounded-md",
        className
      )}
      style={{ height: containerHeight }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((virtualItem) => {
          const pattern = virtualItem.data;
          const isSelected = selectedPattern === pattern.id;
          
          return (
            <div
              key={virtualItem.id}
              style={{
                position: 'absolute',
                top: virtualItem.index * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight
              }}
              className={cn(
                "virtual-pattern-item p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                isSelected && "bg-primary/10 border-primary"
              )}
              onClick={() => onPatternSelect?.(pattern.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{pattern.name}</h4>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {pattern.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {pattern.category}
                  </span>
                  {pattern.isCustom && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      Custom
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Virtual Canvas Renderer for complex canvases
 */
interface VirtualCanvasProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
  aiOptimization?: boolean;
}

export const VirtualCanvas: React.FC<VirtualCanvasProps> = ({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className,
  aiOptimization = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { visibleItems, totalHeight, handleScroll } = useVirtualRendering(items, {
    itemHeight,
    containerHeight,
    overscan: 2,
    predictiveLoadingFactor: 0.2,
    aiOptimizationEnabled: aiOptimization,
    memoryThreshold: 200
  });

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    handleScroll(scrollTop);
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={cn("virtual-canvas overflow-auto", className)}
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
            {renderItem(virtualItem.data, virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
};