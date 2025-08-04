import React, { useState } from 'react'
import { 
  Download, 
  FileText, 
  Image, 
  Share2, 
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ProgressAnalytics } from '@/lib/progress-analytics'

interface ExportableProgressReportsProps {
  analytics: ProgressAnalytics
  sessionName?: string
  className?: string
}

type ReportFormat = 'markdown' | 'json' | 'csv' | 'html'
type ReportType = 'summary' | 'detailed' | 'trends' | 'custom'

interface ReportSection {
  id: string
  name: string
  description: string
  enabled: boolean
}

export function ExportableProgressReports({ 
  analytics, 
  sessionName = 'Session',
  className = '' 
}: ExportableProgressReportsProps) {
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('markdown')
  const [selectedType, setSelectedType] = useState<ReportType>('summary')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const [reportSections, setReportSections] = useState<ReportSection[]>([
    { id: 'overview', name: 'Overview Metrics', description: 'Basic completion and progress stats', enabled: true },
    { id: 'velocity', name: 'Velocity Analysis', description: 'Completion velocity and trends', enabled: true },
    { id: 'time', name: 'Time Analysis', description: 'Time spent and estimation accuracy', enabled: true },
    { id: 'productivity', name: 'Productivity Insights', description: 'Peak times and work patterns', enabled: false },
    { id: 'blockers', name: 'Blockers & Issues', description: 'Blocked nodes and common issues', enabled: false },
    { id: 'trends', name: 'Historical Trends', description: 'Progress trends over time', enabled: false },
    { id: 'recommendations', name: 'Recommendations', description: 'AI-generated improvement suggestions', enabled: false }
  ])

  const formatDuration = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const toggleSection = (sectionId: string) => {
    setReportSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, enabled: !section.enabled }
          : section
      )
    )
  }

  const generateMarkdownReport = (): string => {
    const enabledSections = reportSections.filter(s => s.enabled)
    const timestamp = new Date().toISOString().split('T')[0]
    
    let report = `# ${sessionName} - Progress Report\n\n`
    report += `**Generated:** ${timestamp}\n`
    report += `**Report Type:** ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}\n\n`

    if (enabledSections.find(s => s.id === 'overview')) {
      report += `## Overview Metrics\n\n`
      report += `- **Total Nodes:** ${analytics.totalNodes}\n`
      report += `- **Completed Nodes:** ${analytics.completedNodes}\n`
      report += `- **Completion Rate:** ${analytics.completionPercentage.toFixed(1)}%\n`
      report += `- **Active Nodes:** ${analytics.activeNodes}\n`
      report += `- **Blocked Nodes:** ${analytics.blockedNodes}\n`
      report += `- **Idle Nodes:** ${analytics.idleNodes}\n\n`
    }

    if (enabledSections.find(s => s.id === 'velocity')) {
      report += `## Velocity Analysis\n\n`
      report += `- **Completion Velocity:** ${analytics.completionVelocity.toFixed(1)} nodes/day\n`
      report += `- **Todo Completion Rate:** ${analytics.todoCompletionRate.toFixed(1)} todos/day\n`
      report += `- **Average Node Completion Time:** ${formatDuration(analytics.averageNodeCompletionTime)}\n\n`
    }

    if (enabledSections.find(s => s.id === 'time')) {
      report += `## Time Analysis\n\n`
      report += `- **Total Time Spent:** ${formatDuration(analytics.totalTimeSpent)}\n`
      report += `- **Average Time per Node:** ${formatDuration(analytics.averageTimePerNode)}\n`
      report += `- **Estimated Time Remaining:** ${formatDuration(analytics.estimatedTimeRemaining)}\n`
      report += `- **Average Session Length:** ${formatDuration(analytics.averageSessionLength)}\n\n`
    }

    if (enabledSections.find(s => s.id === 'productivity')) {
      report += `## Productivity Insights\n\n`
      report += `- **Most Productive Time:** ${analytics.mostProductiveTimeOfDay}\n`
      report += `- **Most Productive Day:** ${analytics.mostProductiveDayOfWeek}\n`
      report += `- **Longest Work Session:** ${formatDuration(analytics.longestWorkSession)}\n`
      report += `- **Average Break Time:** ${formatDuration(analytics.averageBreakBetweenSessions)}\n\n`
    }

    if (enabledSections.find(s => s.id === 'blockers') && analytics.blockedNodes > 0) {
      report += `## Blockers & Issues\n\n`
      report += `### Common Blocking Reasons\n\n`
      analytics.commonBlockingReasons.slice(0, 5).forEach((reason, index) => {
        report += `${index + 1}. **${reason.reason}** - ${reason.frequency} nodes (avg: ${formatDuration(reason.averageDuration)})\n`
      })
      report += `\n`
    }

    if (enabledSections.find(s => s.id === 'trends')) {
      report += `## Historical Trends\n\n`
      report += `### Recent Completion Trend (Last 7 Days)\n\n`
      const recentTrend = analytics.completionTrend.slice(-7)
      recentTrend.forEach(day => {
        report += `- **${day.date}:** ${day.completed} completed, ${day.created} created (net: ${day.netProgress >= 0 ? '+' : ''}${day.netProgress})\n`
      })
      report += `\n`
    }

    if (enabledSections.find(s => s.id === 'recommendations')) {
      report += `## Recommendations\n\n`
      
      if (analytics.completionPercentage < 50) {
        report += `- Focus on completing existing tasks before creating new ones\n`
      }
      if (analytics.blockedNodes > 0) {
        report += `- Address ${analytics.blockedNodes} blocked nodes to improve overall progress\n`
      }
      if (analytics.completionVelocity < 1) {
        report += `- Consider breaking down large tasks into smaller, manageable pieces\n`
      }
      if (analytics.workPatterns.length > 0) {
        report += `- Review identified work patterns for optimization opportunities\n`
      }
      report += `\n`
    }

    report += `---\n\n`
    report += `*Report generated by DevKit Flow Analytics*\n`

    return report
  }

  const generateJSONReport = (): string => {
    const enabledSections = reportSections.filter(s => s.enabled)
    const reportData: any = {
      metadata: {
        sessionName,
        generatedAt: new Date().toISOString(),
        reportType: selectedType,
        includedSections: enabledSections.map(s => s.id)
      }
    }

    if (enabledSections.find(s => s.id === 'overview')) {
      reportData.overview = {
        totalNodes: analytics.totalNodes,
        completedNodes: analytics.completedNodes,
        completionPercentage: analytics.completionPercentage,
        activeNodes: analytics.activeNodes,
        blockedNodes: analytics.blockedNodes,
        idleNodes: analytics.idleNodes
      }
    }

    if (enabledSections.find(s => s.id === 'velocity')) {
      reportData.velocity = {
        completionVelocity: analytics.completionVelocity,
        todoCompletionRate: analytics.todoCompletionRate,
        averageNodeCompletionTime: analytics.averageNodeCompletionTime
      }
    }

    if (enabledSections.find(s => s.id === 'time')) {
      reportData.timeAnalysis = {
        totalTimeSpent: analytics.totalTimeSpent,
        averageTimePerNode: analytics.averageTimePerNode,
        estimatedTimeRemaining: analytics.estimatedTimeRemaining,
        averageSessionLength: analytics.averageSessionLength
      }
    }

    if (enabledSections.find(s => s.id === 'productivity')) {
      reportData.productivity = {
        mostProductiveTimeOfDay: analytics.mostProductiveTimeOfDay,
        mostProductiveDayOfWeek: analytics.mostProductiveDayOfWeek,
        longestWorkSession: analytics.longestWorkSession,
        averageBreakBetweenSessions: analytics.averageBreakBetweenSessions
      }
    }

    if (enabledSections.find(s => s.id === 'blockers')) {
      reportData.blockers = {
        blockedNodeDetails: analytics.blockedNodeDetails,
        commonBlockingReasons: analytics.commonBlockingReasons
      }
    }

    if (enabledSections.find(s => s.id === 'trends')) {
      reportData.trends = {
        completionTrend: analytics.completionTrend,
        velocityTrend: analytics.velocityTrend
      }
    }

    return JSON.stringify(reportData, null, 2)
  }

  const generateCSVReport = (): string => {
    let csv = 'Metric,Value,Unit\n'
    
    const enabledSections = reportSections.filter(s => s.enabled)
    
    if (enabledSections.find(s => s.id === 'overview')) {
      csv += `Total Nodes,${analytics.totalNodes},count\n`
      csv += `Completed Nodes,${analytics.completedNodes},count\n`
      csv += `Completion Percentage,${analytics.completionPercentage.toFixed(1)},percent\n`
      csv += `Active Nodes,${analytics.activeNodes},count\n`
      csv += `Blocked Nodes,${analytics.blockedNodes},count\n`
      csv += `Idle Nodes,${analytics.idleNodes},count\n`
    }

    if (enabledSections.find(s => s.id === 'velocity')) {
      csv += `Completion Velocity,${analytics.completionVelocity.toFixed(1)},nodes/day\n`
      csv += `Todo Completion Rate,${analytics.todoCompletionRate.toFixed(1)},todos/day\n`
      csv += `Average Node Completion Time,${(analytics.averageNodeCompletionTime / (1000 * 60 * 60)).toFixed(1)},hours\n`
    }

    if (enabledSections.find(s => s.id === 'time')) {
      csv += `Total Time Spent,${(analytics.totalTimeSpent / (1000 * 60 * 60)).toFixed(1)},hours\n`
      csv += `Average Time per Node,${(analytics.averageTimePerNode / (1000 * 60 * 60)).toFixed(1)},hours\n`
      csv += `Estimated Time Remaining,${(analytics.estimatedTimeRemaining / (1000 * 60 * 60)).toFixed(1)},hours\n`
    }

    return csv
  }

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(false)

    try {
      let content: string
      let filename: string
      let mimeType: string

      switch (selectedFormat) {
        case 'markdown':
          content = generateMarkdownReport()
          filename = `${sessionName.replace(/\s+/g, '-')}-progress-report.md`
          mimeType = 'text/markdown'
          break
        case 'json':
          content = generateJSONReport()
          filename = `${sessionName.replace(/\s+/g, '-')}-progress-report.json`
          mimeType = 'application/json'
          break
        case 'csv':
          content = generateCSVReport()
          filename = `${sessionName.replace(/\s+/g, '-')}-progress-report.csv`
          mimeType = 'text/csv'
          break
        case 'html':
          // Convert markdown to basic HTML
          content = `<!DOCTYPE html>
<html>
<head>
    <title>${sessionName} - Progress Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #333; }
        .metric { margin: 10px 0; }
        .value { font-weight: bold; color: #0066cc; }
    </style>
</head>
<body>
    ${generateMarkdownReport().replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
</body>
</html>`
          filename = `${sessionName.replace(/\s+/g, '-')}-progress-report.html`
          mimeType = 'text/html'
          break
        default:
          throw new Error('Unsupported format')
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const content = generateMarkdownReport()
        await navigator.share({
          title: `${sessionName} - Progress Report`,
          text: content
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      const content = generateMarkdownReport()
      await navigator.clipboard.writeText(content)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Exportable Progress Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Type</label>
            <Select value={selectedType} onValueChange={(value: ReportType) => setSelectedType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="trends">Trends & Patterns</SelectItem>
                <SelectItem value="custom">Custom Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={selectedFormat} onValueChange={(value: ReportFormat) => setSelectedFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown (.md)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="html">HTML (.html)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Sections */}
        <div>
          <h4 className="text-sm font-medium mb-3">Include Sections</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportSections.map((section) => (
              <div key={section.id} className="flex items-start space-x-2">
                <Checkbox
                  id={section.id}
                  checked={section.enabled}
                  onCheckedChange={() => toggleSection(section.id)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor={section.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {section.name}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Report Preview */}
        <div>
          <h4 className="text-sm font-medium mb-3">Report Preview</h4>
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{sessionName} - Progress Report</span>
              <Badge variant="outline">{selectedFormat.toUpperCase()}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span>{analytics.completionPercentage.toFixed(1)}% Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>{analytics.completionVelocity.toFixed(1)} nodes/day</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>{formatDuration(analytics.totalTimeSpent)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span>{reportSections.filter(s => s.enabled).length} sections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Success Message */}
        {exportSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Report exported successfully! Check your downloads folder.
            </AlertDescription>
          </Alert>
        )}

        {/* Report Statistics */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Report Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{reportSections.filter(s => s.enabled).length}</p>
              <p className="text-muted-foreground">Sections</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{analytics.totalNodes}</p>
              <p className="text-muted-foreground">Data Points</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{analytics.completionTrend.length}</p>
              <p className="text-muted-foreground">Trend Days</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
              <p className="text-muted-foreground">Generated</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}