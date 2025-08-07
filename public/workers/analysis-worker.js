/**
 * Analysis Web Worker
 * Handles complex data analysis and processing tasks
 */

class AnalysisProcessor {
  constructor() {
    this.isProcessing = false;
  }

  analyzeSessionComplexity(data) {
    const { nodes, connections } = data;
    
    try {
      const analysis = {
        nodeComplexity: this.calculateNodeComplexity(nodes),
        connectionComplexity: this.calculateConnectionComplexity(connections),
        overallComplexity: 0,
        bottlenecks: this.identifyBottlenecks(nodes, connections),
        criticalPath: this.findCriticalPath(nodes, connections),
        recommendations: []
      };
      
      // Calculate overall complexity score (1-10 scale)
      analysis.overallComplexity = Math.min(10, 
        (analysis.nodeComplexity.averageComplexity * 0.6) + 
        (analysis.connectionComplexity.density * 0.4)
      );
      
      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);
      
      return analysis;
    } catch (error) {
      throw new Error(`Session complexity analysis failed: ${error.message}`);
    }
  }

  calculateNodeComplexity(nodes) {
    const complexityScores = nodes.map(node => {
      let score = 1; // Base complexity
      
      // Factor in node type
      const typeComplexity = {
        'task': 2,
        'code': 4,
        'component': 3,
        'file': 1,
        'folder': 1,
        'reference': 1,
        'comment': 1
      };
      score += typeComplexity[node.type] || 1;
      
      // Factor in content complexity
      if (node.content) {
        score += (node.content.todos?.length || 0) * 0.5;
        score += (node.content.codeSnippets?.length || 0) * 2;
        score += (node.content.references?.length || 0) * 0.3;
      }
      
      // Factor in estimated complexity
      if (node.complexity?.storyPoints) {
        score += node.complexity.storyPoints;
      }
      
      return Math.min(10, score);
    });
    
    return {
      scores: complexityScores,
      totalComplexity: complexityScores.reduce((sum, score) => sum + score, 0),
      averageComplexity: complexityScores.length > 0 ? 
        complexityScores.reduce((sum, score) => sum + score, 0) / complexityScores.length : 0,
      maxComplexity: Math.max(...complexityScores, 0),
      distribution: this.calculateDistribution(complexityScores)
    };
  }

  calculateConnectionComplexity(connections) {
    const typeWeights = {
      'dependency': 3,
      'sequence': 2,
      'reference': 1,
      'blocks': 4,
      'dataflow': 3,
      'navigation': 2,
      'api': 3,
      'import': 2
    };
    
    const weightedConnections = connections.map(conn => 
      typeWeights[conn.type] || 1
    );
    
    return {
      totalConnections: connections.length,
      weightedComplexity: weightedConnections.reduce((sum, weight) => sum + weight, 0),
      averageWeight: weightedConnections.length > 0 ? 
        weightedConnections.reduce((sum, weight) => sum + weight, 0) / weightedConnections.length : 0,
      density: connections.length > 0 ? connections.length / Math.max(1, connections.length) : 0,
      typeDistribution: this.calculateTypeDistribution(connections)
    };
  }

  identifyBottlenecks(nodes, connections) {
    const bottlenecks = [];
    
    // Find nodes with many incoming connections (potential bottlenecks)
    const incomingCounts = new Map();
    const outgoingCounts = new Map();
    
    connections.forEach(conn => {
      incomingCounts.set(conn.targetNodeId, (incomingCounts.get(conn.targetNodeId) || 0) + 1);
      outgoingCounts.set(conn.sourceNodeId, (outgoingCounts.get(conn.sourceNodeId) || 0) + 1);
    });
    
    nodes.forEach(node => {
      const incoming = incomingCounts.get(node.id) || 0;
      const outgoing = outgoingCounts.get(node.id) || 0;
      
      // High incoming connections = potential bottleneck
      if (incoming > 3) {
        bottlenecks.push({
          nodeId: node.id,
          type: 'convergence',
          severity: incoming > 5 ? 'high' : 'medium',
          description: `Node has ${incoming} incoming dependencies`,
          impact: incoming * 2
        });
      }
      
      // High outgoing connections = potential fan-out issue
      if (outgoing > 4) {
        bottlenecks.push({
          nodeId: node.id,
          type: 'divergence',
          severity: outgoing > 6 ? 'high' : 'medium',
          description: `Node has ${outgoing} outgoing dependencies`,
          impact: outgoing * 1.5
        });
      }
      
      // Blocked status
      if (node.status === 'blocked') {
        bottlenecks.push({
          nodeId: node.id,
          type: 'blocked',
          severity: 'high',
          description: 'Node is currently blocked',
          impact: 5
        });
      }
      
      // High complexity nodes
      if (node.complexity?.storyPoints > 4) {
        bottlenecks.push({
          nodeId: node.id,
          type: 'complexity',
          severity: 'medium',
          description: `High complexity node (${node.complexity.storyPoints} story points)`,
          impact: node.complexity.storyPoints
        });
      }
    });
    
    return bottlenecks.sort((a, b) => b.impact - a.impact);
  }

  findCriticalPath(nodes, connections) {
    // Simplified critical path analysis
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const graph = new Map();
    
    // Build adjacency list
    nodes.forEach(node => graph.set(node.id, []));
    connections.forEach(conn => {
      if (conn.type === 'dependency' || conn.type === 'sequence') {
        graph.get(conn.sourceNodeId)?.push(conn.targetNodeId);
      }
    });
    
    // Calculate longest path (critical path)
    const visited = new Set();
    const pathLengths = new Map();
    
    const dfs = (nodeId, currentPath = []) => {
      if (visited.has(nodeId)) return pathLengths.get(nodeId) || 0;
      
      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      const nodeWeight = node?.timeEstimate?.estimated || node?.complexity?.storyPoints || 1;
      
      let maxChildPath = 0;
      const neighbors = graph.get(nodeId) || [];
      
      for (const neighborId of neighbors) {
        if (!currentPath.includes(neighborId)) { // Avoid cycles
          maxChildPath = Math.max(maxChildPath, dfs(neighborId, [...currentPath, nodeId]));
        }
      }
      
      const totalPath = nodeWeight + maxChildPath;
      pathLengths.set(nodeId, totalPath);
      return totalPath;
    };
    
    // Find the longest path from any starting node
    let criticalPath = [];
    let maxLength = 0;
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const length = dfs(node.id);
        if (length > maxLength) {
          maxLength = length;
          // Reconstruct path (simplified)
          criticalPath = this.reconstructPath(node.id, graph, pathLengths);
        }
      }
    });
    
    return {
      path: criticalPath,
      totalDuration: maxLength,
      nodes: criticalPath.map(nodeId => nodeMap.get(nodeId)).filter(Boolean)
    };
  }

  reconstructPath(startNodeId, graph, pathLengths) {
    const path = [startNodeId];
    let currentNode = startNodeId;
    
    while (true) {
      const neighbors = graph.get(currentNode) || [];
      let nextNode = null;
      let maxLength = 0;
      
      for (const neighborId of neighbors) {
        const length = pathLengths.get(neighborId) || 0;
        if (length > maxLength) {
          maxLength = length;
          nextNode = neighborId;
        }
      }
      
      if (!nextNode) break;
      path.push(nextNode);
      currentNode = nextNode;
    }
    
    return path;
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Complexity recommendations
    if (analysis.overallComplexity > 7) {
      recommendations.push({
        type: 'complexity',
        priority: 'high',
        title: 'High Session Complexity',
        description: 'Consider breaking down complex nodes into smaller, manageable tasks',
        action: 'Split high-complexity nodes into subtasks'
      });
    }
    
    // Bottleneck recommendations
    analysis.bottlenecks.forEach(bottleneck => {
      if (bottleneck.severity === 'high') {
        recommendations.push({
          type: 'bottleneck',
          priority: 'high',
          title: `${bottleneck.type} Bottleneck Detected`,
          description: bottleneck.description,
          action: `Review and optimize node ${bottleneck.nodeId}`
        });
      }
    });
    
    // Critical path recommendations
    if (analysis.criticalPath.totalDuration > 20) {
      recommendations.push({
        type: 'timeline',
        priority: 'medium',
        title: 'Long Critical Path',
        description: `Critical path duration is ${analysis.criticalPath.totalDuration} units`,
        action: 'Consider parallelizing tasks or reducing scope'
      });
    }
    
    return recommendations;
  }

  calculateDistribution(values) {
    const ranges = [
      { min: 0, max: 2, label: 'Low' },
      { min: 2, max: 5, label: 'Medium' },
      { min: 5, max: 8, label: 'High' },
      { min: 8, max: 10, label: 'Very High' }
    ];
    
    const distribution = {};
    ranges.forEach(range => {
      distribution[range.label] = values.filter(
        value => value >= range.min && value < range.max
      ).length;
    });
    
    return distribution;
  }

  calculateTypeDistribution(connections) {
    const distribution = {};
    connections.forEach(conn => {
      distribution[conn.type] = (distribution[conn.type] || 0) + 1;
    });
    return distribution;
  }

  analyzeProgress(data) {
    const { nodes, timeline, timeRange } = data;
    
    try {
      const now = Date.now();
      const startTime = timeRange?.start || (now - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
      const endTime = timeRange?.end || now;
      
      const relevantEvents = timeline.filter(event => 
        event.timestamp >= startTime && event.timestamp <= endTime
      );
      
      const completedNodes = nodes.filter(node => node.status === 'completed');
      const totalStoryPoints = nodes.reduce((sum, node) => 
        sum + (node.complexity?.storyPoints || 1), 0
      );
      const completedStoryPoints = completedNodes.reduce((sum, node) => 
        sum + (node.complexity?.storyPoints || 1), 0
      );
      
      // Calculate velocity (story points per day)
      const daysDiff = Math.max(1, (endTime - startTime) / (24 * 60 * 60 * 1000));
      const velocity = completedStoryPoints / daysDiff;
      
      // Analyze completion trend
      const dailyCompletions = this.groupEventsByDay(relevantEvents.filter(
        event => event.type === 'node_completed'
      ));
      
      return {
        summary: {
          totalNodes: nodes.length,
          completedNodes: completedNodes.length,
          completionPercentage: (completedNodes.length / nodes.length) * 100,
          totalStoryPoints,
          completedStoryPoints,
          velocity,
          estimatedCompletion: this.estimateCompletion(nodes, velocity)
        },
        trends: {
          dailyCompletions,
          velocityTrend: this.calculateVelocityTrend(dailyCompletions),
          burndownData: this.calculateBurndown(nodes, timeline)
        },
        insights: this.generateProgressInsights(nodes, relevantEvents, velocity)
      };
    } catch (error) {
      throw new Error(`Progress analysis failed: ${error.message}`);
    }
  }

  groupEventsByDay(events) {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  }

  calculateVelocityTrend(dailyCompletions) {
    const dates = Object.keys(dailyCompletions).sort();
    const trend = [];
    
    for (let i = 0; i < dates.length; i++) {
      const windowSize = Math.min(3, i + 1); // 3-day moving average
      const windowStart = Math.max(0, i - windowSize + 1);
      const windowDates = dates.slice(windowStart, i + 1);
      const windowAverage = windowDates.reduce((sum, date) => 
        sum + dailyCompletions[date], 0
      ) / windowSize;
      
      trend.push({
        date: dates[i],
        velocity: windowAverage,
        completions: dailyCompletions[dates[i]]
      });
    }
    
    return trend;
  }

  calculateBurndown(nodes, timeline) {
    const totalWork = nodes.reduce((sum, node) => 
      sum + (node.complexity?.storyPoints || 1), 0
    );
    
    const completionEvents = timeline
      .filter(event => event.type === 'node_completed')
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const burndown = [{ date: Date.now() - 30 * 24 * 60 * 60 * 1000, remaining: totalWork }];
    let remainingWork = totalWork;
    
    completionEvents.forEach(event => {
      const node = nodes.find(n => n.id === event.nodeId);
      if (node) {
        remainingWork -= (node.complexity?.storyPoints || 1);
        burndown.push({
          date: event.timestamp,
          remaining: remainingWork
        });
      }
    });
    
    return burndown;
  }

  estimateCompletion(nodes, velocity) {
    const remainingWork = nodes
      .filter(node => node.status !== 'completed')
      .reduce((sum, node) => sum + (node.complexity?.storyPoints || 1), 0);
    
    if (velocity <= 0) return null;
    
    const daysRemaining = remainingWork / velocity;
    return new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);
  }

  generateProgressInsights(nodes, events, velocity) {
    const insights = [];
    
    // Velocity insights
    if (velocity < 1) {
      insights.push({
        type: 'velocity',
        severity: 'warning',
        title: 'Low Velocity',
        description: `Current velocity is ${velocity.toFixed(2)} story points per day`,
        suggestion: 'Consider breaking down large tasks or removing blockers'
      });
    } else if (velocity > 5) {
      insights.push({
        type: 'velocity',
        severity: 'positive',
        title: 'High Velocity',
        description: `Excellent velocity of ${velocity.toFixed(2)} story points per day`,
        suggestion: 'Maintain current momentum and consider taking on additional scope'
      });
    }
    
    // Blocked nodes insight
    const blockedNodes = nodes.filter(node => node.status === 'blocked');
    if (blockedNodes.length > 0) {
      insights.push({
        type: 'blockers',
        severity: 'warning',
        title: 'Blocked Tasks',
        description: `${blockedNodes.length} tasks are currently blocked`,
        suggestion: 'Review and resolve blockers to improve flow'
      });
    }
    
    // Completion pattern insights
    const recentCompletions = events.filter(
      event => event.type === 'node_completed' && 
      event.timestamp > Date.now() - 3 * 24 * 60 * 60 * 1000
    );
    
    if (recentCompletions.length === 0) {
      insights.push({
        type: 'activity',
        severity: 'warning',
        title: 'No Recent Completions',
        description: 'No tasks completed in the last 3 days',
        suggestion: 'Review current tasks and identify any impediments'
      });
    }
    
    return insights;
  }
}

const processor = new AnalysisProcessor();

self.onmessage = async function(event) {
  const { id, type, data } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'analyze-complexity':
        result = processor.analyzeSessionComplexity(data);
        break;
      case 'analyze-progress':
        result = processor.analyzeProgress(data);
        break;
      default:
        throw new Error(`Unknown analysis operation type: ${type}`);
    }
    
    self.postMessage({
      id,
      type: 'success',
      result
    });
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      error: error.message
    });
  }
};

// Handle worker termination
self.onclose = function() {
  processor.isProcessing = false;
};