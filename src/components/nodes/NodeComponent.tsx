import React from 'react';
import type { DevFlowNode } from '../../types';

interface NodeComponentProps {
  node: DevFlowNode;
  onUpdate?: (updates: any) => void;
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export const NodeComponent: React.FC<NodeComponentProps> = ({ 
  node, 
  onUpdate, 
  className,
  isSelected,
  onSelect,
  compact
}) => {
  return (
    <div 
      className={`node-component ${className || ''} ${isSelected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
      onClick={onSelect}
    >
      <div className="node-header">
        <h3>{node.title}</h3>
      </div>
      <div className="node-content">
        {node.content && (
          <div className="node-description">
            {typeof node.content === 'string' ? node.content : JSON.stringify(node.content)}
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeComponent;