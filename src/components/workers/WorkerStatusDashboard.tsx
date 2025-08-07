/**
 * Worker Status Dashboard
 * Shows the status and statistics of all worker pools
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Activity, 
  Brain, 
  Search, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useWorkers, useWorkerHealth } from '../../hooks/useWorkers';

interface WorkerPoolStatsProps {
  name: string;
  icon: React.ReactNode;
  stats: any;
  rateLimitStatus?: any;
}

function WorkerPoolStats({ name, icon, stats, rateLimitStatus }: WorkerPoolStatsProps) {
  if (!stats.enabled) {
    return (
      <Card className="opacity-60">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            {icon}
            <CardTitle className="text-sm">{name}</CardTitle>
            <Badge variant="secondary">Disabled</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            This worker pool is currently disabled
          </p>
        </CardContent>
      </Card>
    );
  }

  const utilizationPercentage = stats.totalWorkers > 0 
    ? (stats.busyWorkers / stats.totalWorkers) * 100 
    : 0;

  const errorRate = stats.totalCompletedTasks > 0 
    ? (stats.totalErrors / stats.totalCompletedTasks) * 100 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <CardTitle className="text-sm">{name}</CardTitle>
            <Badge variant={stats.busyWorkers > 0 ? "default" : "secondary"}>
              {stats.busyWorkers > 0 ? "Active" : "Idle"}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.busyWorkers}/{stats.totalWorkers} busy
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Utilization */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Utilization</span>
            <span>{Math.round(utilizationPercentage)}%</span>
          </div>
          <Progress value={utilizationPercentage} className="h-1" />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="font-medium">{stats.totalCompletedTasks}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-muted-foreground">Queued</span>
            </div>
            <div className="font-medium">{stats.queuedTasks}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-muted-foreground">Errors</span>
            </div>
            <div className="font-medium">{stats.totalErrors}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3 text-purple-500" />
              <span className="text-muted-foreground">Avg/Worker</span>
            </div>
            <div className="font-medium">{Math.round(stats.averageTasksPerWorker)}</div>
          </div>
        </div>

        {/* Error Rate */}
        {errorRate > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Error Rate</span>
              <span className={errorRate > 10 ? "text-red-500" : "text-yellow-500"}>
                {errorRate.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(errorRate, 100)} 
              className="h-1"
            />
          </div>
        )}

        {/* Rate Limit Status (for AI worker) */}
        {rateLimitStatus && (
          <div className="space-y-1 border-t pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rate Limit</span>
              <span>
                {rateLimitStatus.remainingRequests}/{rateLimitStatus.maxRequestsPerMinute}
              </span>
            </div>
            <Progress 
              value={(rateLimitStatus.remainingRequests / rateLimitStatus.maxRequestsPerMinute) * 100} 
              className="h-1"
            />
            <div className="text-xs text-muted-foreground">
              Resets in {Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000)}s
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface HealthStatusProps {
  healthStatus: any;
  isChecking: boolean;
  onCheckHealth: () => void;
}

function HealthStatus({ healthStatus, isChecking, onCheckHealth }: HealthStatusProps) {
  if (!healthStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Health status not available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>System Health</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCheckHealth}
            disabled={isChecking}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          {healthStatus.healthy ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {healthStatus.healthy ? 'All Systems Operational' : 'Issues Detected'}
          </span>
        </div>

        {/* Pool Health Status */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Pool Status</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(healthStatus.pools).map(([poolName, isHealthy]) => (
              <div key={poolName} className="flex items-center space-x-1">
                {isHealthy ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs capitalize">{poolName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues */}
        {healthStatus.issues.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Issues</div>
            <div className="space-y-1">
              {healthStatus.issues.map((issue: string, index: number) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {issue}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WorkerStatusDashboard() {
  const { stats, isInitialized, isInitializing, error, updateStats } = useWorkers();
  const { healthStatus, isChecking, checkHealth } = useWorkerHealth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await updateStats();
      await checkHealth();
    } finally {
      setRefreshing(false);
    }
  };

  if (!isInitialized && !isInitializing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
            <p className="text-sm font-medium">Workers Not Initialized</p>
            <p className="text-xs text-muted-foreground">
              Worker pools are not currently active
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isInitializing) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 text-blue-500 mx-auto animate-spin" />
            <p className="text-sm font-medium">Initializing Workers</p>
            <p className="text-xs text-muted-foreground">
              Setting up worker pools...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm font-medium">Worker Error</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Clock className="h-8 w-8 text-gray-500 mx-auto" />
            <p className="text-sm font-medium">Loading Stats</p>
            <p className="text-xs text-muted-foreground">
              Gathering worker statistics...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Worker Status</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Health Status */}
          <HealthStatus
            healthStatus={healthStatus}
            isChecking={isChecking}
            onCheckHealth={checkHealth}
          />

          {/* Worker Pool Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <WorkerPoolStats
              name="Regex Processing"
              icon={<Search className="h-4 w-4 text-blue-500" />}
              stats={stats.pools.regex}
            />
            
            <WorkerPoolStats
              name="AI Assistant"
              icon={<Brain className="h-4 w-4 text-purple-500" />}
              stats={stats.pools.ai}
              rateLimitStatus={stats.pools.ai.rateLimitStatus}
            />
            
            <WorkerPoolStats
              name="Analysis Engine"
              icon={<BarChart3 className="h-4 w-4 text-green-500" />}
              stats={stats.pools.analysis}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Initialized</span>
                  <span>{stats.initialized ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Workers</span>
                  <span>
                    {Object.values(stats.pools).reduce((sum: number, pool: any) => 
                      sum + (pool.enabled ? pool.totalWorkers || 0 : 0), 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Tasks</span>
                  <span>
                    {Object.values(stats.pools).reduce((sum: number, pool: any) => 
                      sum + (pool.enabled ? pool.activeTasks || 0 : 0), 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Queued Tasks</span>
                  <span>
                    {Object.values(stats.pools).reduce((sum: number, pool: any) => 
                      sum + (pool.enabled ? pool.queuedTasks || 0 : 0), 0
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Completed</span>
                  <span>
                    {Object.values(stats.pools).reduce((sum: number, pool: any) => 
                      sum + (pool.enabled ? pool.totalCompletedTasks || 0 : 0), 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Errors</span>
                  <span>
                    {Object.values(stats.pools).reduce((sum: number, pool: any) => 
                      sum + (pool.enabled ? pool.totalErrors || 0 : 0), 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span>
                    {(() => {
                      const totalCompleted = Object.values(stats.pools).reduce((sum: number, pool: any) => 
                        sum + (pool.enabled ? pool.totalCompletedTasks || 0 : 0), 0
                      );
                      const totalErrors = Object.values(stats.pools).reduce((sum: number, pool: any) => 
                        sum + (pool.enabled ? pool.totalErrors || 0 : 0), 0
                      );
                      const total = totalCompleted + totalErrors;
                      return total > 0 ? `${((totalCompleted / total) * 100).toFixed(1)}%` : 'N/A';
                    })()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}