import React from 'react'
import { AlertTriangle, Clock, Link, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { ProgressAnalytics } from '@/lib/progress-analytics'

interface BlockedNodesPanelProps {
  analytics: ProgressAnalytics
  className?: string
  onNodeClick?: (nodeId: string) => void
}

export function BlockedNodesPanel({ 
  analytics, 
  className = '',
  onNodeClick 
}: BlockedNodesPanelProps) {
  const { blockedNodeDetails, commonBlockingReasons } = analytics

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      const minutes = Math.floor(milliseconds / (1000 * 60))
      return `${minutes}m`
    }
  }

  const getBlockingReasonColor = (reason: string): string => {
    switch (reason.toLowerCase()) {
      case 'waiting for dependencies':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'incomplete todos':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'missing references or documentation':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Blocked Nodes Analysis
          <Badge variant="destructive" className="ml-2">
            {blockedNodeDetails.length} blocked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Common Blocking Reasons */}
        {commonBlockingReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Most Common Blockers</h4>
            <div className="space-y-2">
              {commonBlockingReasons.slice(0, 3).map((reason, index) => (
                <div key={reason.reason} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-medium text-destructive">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{reason.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg duration: {formatDuration(reason.averageDuration)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {reason.frequency} nodes
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Individual Blocked Nodes */}
        <div>
          <h4 className="text-sm font-medium mb-3">Currently Blocked Nodes</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {blockedNodeDetails.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No blocked nodes found
              </p>
            ) : (
              blockedNodeDetails.map((detail) => (
                <div key={detail.node.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">{detail.node.title}</h5>
                        <Badge variant="outline" className="text-xs">
                          {detail.node.type}
                        </Badge>
                      </div>
                      {detail.node.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {detail.node.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(detail.blockedDuration)}
                    </div>
                  </div>

                  {/* Blocking Reasons */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Blocking Reasons:</p>
                    <div className="flex flex-wrap gap-1">
                      {detail.blockingReasons.map((reason, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className={`text-xs ${getBlockingReasonColor(reason)}`}
                        >
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Dependencies */}
                  {detail.dependencies.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Dependencies:</p>
                      <div className="space-y-1">
                        {detail.dependencies.map((dep, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Link className="h-3 w-3 text-muted-foreground" />
                            <span>{dep}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {onNodeClick && (
                    <div className="pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => onNodeClick(detail.node.id)}
                      >
                        View Node
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {blockedNodeDetails.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  Review Dependencies
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Update Blockers
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}