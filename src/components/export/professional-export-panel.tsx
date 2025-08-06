/**
 * Professional Export Panel Component
 * Task 13: Professional export and sharing interface
 */

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Download, 
  Share2, 
  FileText, 
  Image, 
  Globe, 
  Code, 
  Archive,
  Settings,
  Palette,
  Layout,
  Users,
  Link,
  Eye,
  Lock,
  Calendar
} from 'lucide-react'
import { 
  professionalExportSystem,
  type ExportConfiguration,
  type ExportStyling,
  type ExportLayout,
  type ShareConfiguration,
  type InteractiveHTMLOptions
} from '../../lib/professional-export-system'
import type { DevFlowSession, RegexPattern } from '../../types'

interface ProfessionalExportPanelProps {
  session?: DevFlowSession
  pattern?: RegexPattern
  isVisible: boolean
  onClose: () => void
}

export function ProfessionalExportPanel({ 
  session, 
  pattern, 
  isVisible, 
  onClose 
}: ProfessionalExportPanelProps) {
  const [exportConfig, setExportConfig] = useState<ExportConfiguration>({
    format: 'html',
    quality: 'high',
    includeMetadata: true,
    includeTimeline: true,
    includeAnalytics: true,
    theme: 'light'
  })
  
  const [shareConfig, setShareConfig] = useState<ShareConfiguration>({
    isPublic: false,
    allowComments: false,
    allowDownload: true,
    permissions: {
      canView: true,
      canComment: false,
      canEdit: false,
      canShare: false,
      canDownload: true,
      canDelete: false
    }
  })
  
  const [customStyling, setCustomStyling] = useState<Partial<ExportStyling>>({})
  const [customLayout, setCustomLayout] = useState<Partial<ExportLayout>>({})
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('format')

  const handleExport = async () => {
    if (!session && !pattern) return

    setIsExporting(true)
    try {
      const config: ExportConfiguration = {
        ...exportConfig,
        customStyling: Object.keys(customStyling).length > 0 ? customStyling as ExportStyling : undefined,
        layout: Object.keys(customLayout).length > 0 ? customLayout as ExportLayout : undefined
      }

      let result
      if (session) {
        result = await professionalExportSystem.exportSession(session, config)
      } else if (pattern) {
        result = await professionalExportSystem.exportPattern(pattern, config, true)
      }

      setExportResult(result)
      
      // Trigger download
      if (result && typeof result.content === 'string') {
        const blob = new Blob([result.content], { 
          type: result.format === 'html' ? 'text/html' : 
                result.format === 'json' ? 'application/json' : 
                'text/plain' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${session?.name || pattern?.name || 'export'}.${result.format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    if (!exportResult) return

    try {
      const shareUrl = await professionalExportSystem.createShareableLink(exportResult, shareConfig)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      
      // Show success message (would use toast in real implementation)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const generateInteractiveHTML = async () => {
    if (!session) return

    const options: InteractiveHTMLOptions = {
      includeNavigation: true,
      includeSearch: true,
      includeFilters: true,
      enableZoom: true,
      enablePanning: true,
      responsive: true,
      offlineCapable: false
    }

    try {
      const html = await professionalExportSystem.createInteractiveHTML(session, options)
      
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${session.name || 'session'}-interactive.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Interactive HTML generation failed:', error)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Professional Export & Sharing
              </CardTitle>
              <CardDescription>
                Export your {session ? 'session' : 'pattern'} in multiple formats with professional styling
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
              <TabsTrigger value="format" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Format
              </TabsTrigger>
              <TabsTrigger value="styling" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Styling
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-1">
                <Layout className="h-3 w-3" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="share" className="flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                Share
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto mt-4">
              <TabsContent value="format" className="space-y-6">
                <FormatTab 
                  config={exportConfig} 
                  onChange={setExportConfig}
                  onExport={handleExport}
                  onGenerateInteractive={generateInteractiveHTML}
                  isExporting={isExporting}
                  hasSession={!!session}
                />
              </TabsContent>

              <TabsContent value="styling" className="space-y-6">
                <StylingTab 
                  styling={customStyling} 
                  onChange={setCustomStyling}
                  theme={exportConfig.theme}
                />
              </TabsContent>

              <TabsContent value="layout" className="space-y-6">
                <LayoutTab 
                  layout={customLayout} 
                  onChange={setCustomLayout}
                />
              </TabsContent>

              <TabsContent value="share" className="space-y-6">
                <ShareTab 
                  config={shareConfig} 
                  onChange={setShareConfig}
                  onShare={handleShare}
                  exportResult={exportResult}
                />
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <AdvancedTab 
                  config={exportConfig} 
                  onChange={setExportConfig}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Format Tab Component
function FormatTab({ 
  config, 
  onChange, 
  onExport, 
  onGenerateInteractive,
  isExporting,
  hasSession
}: {
  config: ExportConfiguration
  onChange: (config: ExportConfiguration) => void
  onExport: () => void
  onGenerateInteractive: () => void
  isExporting: boolean
  hasSession: boolean
}) {
  const formats = [
    { value: 'html', label: 'HTML', icon: Globe, description: 'Interactive web page' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Professional document' },
    { value: 'png', label: 'PNG', icon: Image, description: 'High-quality image' },
    { value: 'json', label: 'JSON', icon: Code, description: 'Structured data' },
    { value: 'markdown', label: 'Markdown', icon: FileText, description: 'Documentation format' },
    { value: 'zip', label: 'ZIP', icon: Archive, description: 'Complete package' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
          <CardDescription>Choose the format for your export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formats.map((format) => {
              const Icon = format.icon
              return (
                <div
                  key={format.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    config.format === format.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => onChange({ ...config, format: format.value as any })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{format.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{format.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quality">Quality</Label>
              <Select 
                value={config.quality} 
                onValueChange={(value) => onChange({ ...config, quality: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select 
                value={config.theme} 
                onValueChange={(value) => onChange({ ...config, theme: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="print">Print</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="metadata">Include Metadata</Label>
              <Switch
                id="metadata"
                checked={config.includeMetadata}
                onCheckedChange={(checked) => onChange({ ...config, includeMetadata: checked })}
              />
            </div>

            {hasSession && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="timeline">Include Timeline</Label>
                  <Switch
                    id="timeline"
                    checked={config.includeTimeline}
                    onCheckedChange={(checked) => onChange({ ...config, includeTimeline: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics">Include Analytics</Label>
                  <Switch
                    id="analytics"
                    checked={config.includeAnalytics}
                    onCheckedChange={(checked) => onChange({ ...config, includeAnalytics: checked })}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={onExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>

            {hasSession && (
              <Button 
                onClick={onGenerateInteractive} 
                variant="outline"
                className="flex-1"
              >
                Interactive HTML
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Export will download automatically when complete.</p>
            {hasSession && (
              <p>Interactive HTML includes search, zoom, and navigation features.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Styling Tab Component
function StylingTab({ 
  styling, 
  onChange, 
  theme 
}: {
  styling: Partial<ExportStyling>
  onChange: (styling: Partial<ExportStyling>) => void
  theme: string
}) {
  const updateColors = (colors: Partial<any>) => {
    onChange({
      ...styling,
      colors: { ...styling.colors, ...colors }
    })
  }

  const updateFonts = (fonts: Partial<any>) => {
    onChange({
      ...styling,
      fonts: { ...styling.fonts, ...fonts }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
          <CardDescription>Customize the colors for your export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary">Primary Color</Label>
              <Input
                id="primary"
                type="color"
                value={styling.colors?.primary || '#007bff'}
                onChange={(e) => updateColors({ primary: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="secondary">Secondary Color</Label>
              <Input
                id="secondary"
                type="color"
                value={styling.colors?.secondary || '#6c757d'}
                onChange={(e) => updateColors({ secondary: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="accent">Accent Color</Label>
              <Input
                id="accent"
                type="color"
                value={styling.colors?.accent || '#28a745'}
                onChange={(e) => updateColors({ accent: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="background">Background Color</Label>
              <Input
                id="background"
                type="color"
                value={styling.colors?.background || '#ffffff'}
                onChange={(e) => updateColors({ background: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Customize fonts and text styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="heading-font">Heading Font</Label>
            <Input
              id="heading-font"
              value={styling.fonts?.heading || ''}
              onChange={(e) => updateFonts({ heading: e.target.value })}
              placeholder="e.g., 'Helvetica Neue', Arial, sans-serif"
            />
          </div>
          <div>
            <Label htmlFor="body-font">Body Font</Label>
            <Input
              id="body-font"
              value={styling.fonts?.body || ''}
              onChange={(e) => updateFonts({ body: e.target.value })}
              placeholder="e.g., 'Helvetica Neue', Arial, sans-serif"
            />
          </div>
          <div>
            <Label htmlFor="code-font">Code Font</Label>
            <Input
              id="code-font"
              value={styling.fonts?.code || ''}
              onChange={(e) => updateFonts({ code: e.target.value })}
              placeholder="e.g., 'Monaco', 'Menlo', monospace"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Add your company branding to exports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={styling.branding?.companyName || ''}
              onChange={(e) => onChange({
                ...styling,
                branding: { ...styling.branding, companyName: e.target.value }
              })}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={styling.branding?.website || ''}
              onChange={(e) => onChange({
                ...styling,
                branding: { ...styling.branding, website: e.target.value }
              })}
              placeholder="https://yourcompany.com"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Layout Tab Component
function LayoutTab({ 
  layout, 
  onChange 
}: {
  layout: Partial<ExportLayout>
  onChange: (layout: Partial<ExportLayout>) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Layout Type</CardTitle>
          <CardDescription>Choose the overall layout style</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'standard', label: 'Standard', description: 'Balanced layout with good readability' },
              { value: 'compact', label: 'Compact', description: 'Dense layout to save space' },
              { value: 'detailed', label: 'Detailed', description: 'Comprehensive layout with all information' },
              { value: 'presentation', label: 'Presentation', description: 'Large text and visuals for presentations' }
            ].map((type) => (
              <div
                key={type.value}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  layout.type === type.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onChange({ ...layout, type: type.value as any })}
              >
                <div className="font-semibold mb-1">{type.label}</div>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Settings</CardTitle>
          <CardDescription>Configure page size and orientation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page-size">Page Size</Label>
              <Select 
                value={layout.pageSize || 'a4'} 
                onValueChange={(value) => onChange({ ...layout, pageSize: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="a3">A3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="orientation">Orientation</Label>
              <Select 
                value={layout.orientation || 'portrait'} 
                onValueChange={(value) => onChange({ ...layout, orientation: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="toc">Include Table of Contents</Label>
              <Switch
                id="toc"
                checked={layout.includeTableOfContents || false}
                onCheckedChange={(checked) => onChange({ ...layout, includeTableOfContents: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="page-numbers">Include Page Numbers</Label>
              <Switch
                id="page-numbers"
                checked={layout.includePageNumbers || false}
                onCheckedChange={(checked) => onChange({ ...layout, includePageNumbers: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="header">Include Header</Label>
              <Switch
                id="header"
                checked={layout.includeHeader || false}
                onCheckedChange={(checked) => onChange({ ...layout, includeHeader: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="footer">Include Footer</Label>
              <Switch
                id="footer"
                checked={layout.includeFooter || false}
                onCheckedChange={(checked) => onChange({ ...layout, includeFooter: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Share Tab Component
function ShareTab({ 
  config, 
  onChange, 
  onShare, 
  exportResult 
}: {
  config: ShareConfiguration
  onChange: (config: ShareConfiguration) => void
  onShare: () => void
  exportResult: any
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Settings</CardTitle>
          <CardDescription>Configure how others can access your export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public">Public Access</Label>
              <p className="text-sm text-muted-foreground">Anyone with the link can view</p>
            </div>
            <Switch
              id="public"
              checked={config.isPublic}
              onCheckedChange={(checked) => onChange({ ...config, isPublic: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="comments">Allow Comments</Label>
              <p className="text-sm text-muted-foreground">Viewers can leave comments</p>
            </div>
            <Switch
              id="comments"
              checked={config.allowComments}
              onCheckedChange={(checked) => onChange({ ...config, allowComments: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="download">Allow Download</Label>
              <p className="text-sm text-muted-foreground">Viewers can download the export</p>
            </div>
            <Switch
              id="download"
              checked={config.allowDownload}
              onCheckedChange={(checked) => onChange({ ...config, allowDownload: checked })}
            />
          </div>

          <div>
            <Label htmlFor="password">Password Protection</Label>
            <Input
              id="password"
              type="password"
              value={config.password || ''}
              onChange={(e) => onChange({ ...config, password: e.target.value })}
              placeholder="Optional password"
            />
          </div>

          <div>
            <Label htmlFor="expires">Expiration Date</Label>
            <Input
              id="expires"
              type="datetime-local"
              value={config.expiresAt ? config.expiresAt.toISOString().slice(0, 16) : ''}
              onChange={(e) => onChange({ 
                ...config, 
                expiresAt: e.target.value ? new Date(e.target.value) : undefined 
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onShare} 
            disabled={!exportResult}
            className="w-full"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Generate Share Link
          </Button>

          {!exportResult && (
            <p className="text-sm text-muted-foreground text-center">
              Export your content first to enable sharing
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Advanced Tab Component
function AdvancedTab({ 
  config, 
  onChange 
}: {
  config: ExportConfiguration
  onChange: (config: ExportConfiguration) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Options</CardTitle>
          <CardDescription>Fine-tune your export settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="custom-css">Custom CSS</Label>
            <Textarea
              id="custom-css"
              placeholder="/* Add custom CSS styles here */"
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="custom-js">Custom JavaScript</Label>
            <Textarea
              id="custom-js"
              placeholder="// Add custom JavaScript here"
              rows={6}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your export"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}