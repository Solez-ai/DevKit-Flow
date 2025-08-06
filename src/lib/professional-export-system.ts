/**
 * Professional Export and Sharing System
 * Task 13: Comprehensive export system with multiple formats
 */

import type { 
  DevFlowSession, 
  RegexPattern,
  PatternDocumentation 
} from '../types'
import { patternDocumentationSystem } from './pattern-documentation-system'

export interface ExportConfiguration {
  format: 'pdf' | 'png' | 'html' | 'json' | 'zip' | 'markdown'
  quality: 'low' | 'medium' | 'high'
  includeMetadata: boolean
  includeTimeline: boolean
  includeAnalytics: boolean
  customStyling?: ExportStyling
  layout?: ExportLayout
  theme: 'light' | 'dark' | 'print' | 'presentation'
}

export interface ExportStyling {
  colors: ColorScheme
  fonts: FontConfiguration
  spacing: SpacingConfiguration
  branding?: BrandingConfiguration
}

export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
}

export interface FontConfiguration {
  heading: string
  body: string
  code: string
  sizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
  }
}

export interface SpacingConfiguration {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

export interface BrandingConfiguration {
  logo?: string
  companyName?: string
  website?: string
  colors?: {
    primary: string
    secondary: string
  }
}

export interface ExportLayout {
  type: 'standard' | 'compact' | 'detailed' | 'presentation'
  pageSize?: 'a4' | 'letter' | 'legal' | 'a3'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  columns?: number
  includeTableOfContents?: boolean
  includePageNumbers?: boolean
  includeHeader?: boolean
  includeFooter?: boolean
}

export interface ExportResult {
  id: string
  format: string
  content: string | Uint8Array
  metadata: ExportMetadata
  downloadUrl?: string
  shareUrl?: string
  generatedAt: Date
  expiresAt?: Date
}

export interface ExportMetadata {
  title: string
  description: string
  author?: string
  version: string
  size: number
  checksum: string
  configuration: ExportConfiguration
  sourceType: 'session' | 'pattern' | 'documentation' | 'combined'
  sourceIds: string[]
}

export interface ShareConfiguration {
  isPublic: boolean
  allowComments: boolean
  allowDownload: boolean
  expiresAt?: Date
  password?: string
  collaborators?: ShareCollaborator[]
  permissions: SharePermissions
}

export interface ShareCollaborator {
  email: string
  role: 'viewer' | 'commenter' | 'editor'
  invitedAt: Date
  acceptedAt?: Date
}

export interface SharePermissions {
  canView: boolean
  canComment: boolean
  canEdit: boolean
  canShare: boolean
  canDownload: boolean
  canDelete: boolean
}

export interface InteractiveHTMLOptions {
  includeNavigation: boolean
  includeSearch: boolean
  includeFilters: boolean
  enableZoom: boolean
  enablePanning: boolean
  responsive: boolean
  offlineCapable: boolean
  customCSS?: string
  customJS?: string
}/
**
 * Professional Export and Sharing System
 */
export class ProfessionalExportSystem {
  
  /**
   * Export DevFlow session to various formats
   */
  async exportSession(
    session: DevFlowSession,
    configuration: ExportConfiguration
  ): Promise<ExportResult> {
    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    let content: string | Uint8Array
    let downloadUrl: string | undefined
    
    switch (configuration.format) {
      case 'pdf':
        content = await this.exportSessionToPDF(session, configuration)
        break
      case 'png':
        content = await this.exportSessionToPNG(session, configuration)
        break
      case 'html':
        content = await this.exportSessionToHTML(session, configuration)
        break
      case 'json':
        content = this.exportSessionToJSON(session, configuration)
        break
      case 'zip':
        content = await this.exportSessionToZIP(session, configuration)
        break
      case 'markdown':
        content = this.exportSessionToMarkdown(session, configuration)
        break
      default:
        throw new Error(`Unsupported export format: ${configuration.format}`)
    }
    
    // Create download URL for binary content
    if (content instanceof Uint8Array) {
      const blob = new Blob([content], { 
        type: this.getMimeType(configuration.format) 
      })
      downloadUrl = URL.createObjectURL(blob)
    }
    
    const metadata: ExportMetadata = {
      title: session.name || 'DevFlow Session',
      description: session.description || 'Exported DevFlow session',
      version: '1.0.0',
      size: typeof content === 'string' ? content.length : content.length,
      checksum: this.calculateChecksum(content),
      configuration,
      sourceType: 'session',
      sourceIds: [session.id]
    }
    
    return {
      id: exportId,
      format: configuration.format,
      content,
      metadata,
      downloadUrl,
      generatedAt: new Date()
    }
  }
  
  /**
   * Export regex pattern with documentation
   */
  async exportPattern(
    pattern: RegexPattern,
    configuration: ExportConfiguration,
    includeDocumentation: boolean = true
  ): Promise<ExportResult> {
    const exportId = `pattern-export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    let documentation: PatternDocumentation | undefined
    if (includeDocumentation) {
      documentation = await patternDocumentationSystem.generatePatternDocumentation(pattern, {
        useAI: true,
        includeAdvancedAnalysis: true,
        includePerformanceMetrics: true,
        includeSecurityAnalysis: true
      })
    }
    
    let content: string | Uint8Array
    
    switch (configuration.format) {
      case 'pdf':
        content = await this.exportPatternToPDF(pattern, documentation, configuration)
        break
      case 'html':
        content = await this.exportPatternToHTML(pattern, documentation, configuration)
        break
      case 'json':
        content = this.exportPatternToJSON(pattern, documentation, configuration)
        break
      case 'markdown':
        content = this.exportPatternToMarkdown(pattern, documentation, configuration)
        break
      default:
        throw new Error(`Unsupported pattern export format: ${configuration.format}`)
    }
    
    const metadata: ExportMetadata = {
      title: pattern.name || 'Regex Pattern',
      description: pattern.description || 'Exported regex pattern with documentation',
      version: '1.0.0',
      size: typeof content === 'string' ? content.length : content.length,
      checksum: this.calculateChecksum(content),
      configuration,
      sourceType: 'pattern',
      sourceIds: [pattern.id]
    }
    
    return {
      id: exportId,
      format: configuration.format,
      content,
      metadata,
      generatedAt: new Date()
    }
  }
  
  /**
   * Create interactive HTML export
   */
  async createInteractiveHTML(
    session: DevFlowSession,
    options: InteractiveHTMLOptions = {
      includeNavigation: true,
      includeSearch: true,
      includeFilters: true,
      enableZoom: true,
      enablePanning: true,
      responsive: true,
      offlineCapable: false
    }
  ): Promise<string> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.name || 'DevFlow Session'} - Interactive Export</title>
    <style>
        ${this.getInteractiveHTMLStyles(options)}
    </style>
</head>
<body>
    <div id="app">
        ${await this.generateInteractiveContent(session, options)}
    </div>
    
    <script>
        ${this.getInteractiveHTMLScript(session, options)}
    </script>
</body>
</html>`
    
    return html
  }
  
  /**
   * Create shareable link for exported content
   */
  async createShareableLink(
    exportResult: ExportResult,
    shareConfig: ShareConfiguration
  ): Promise<string> {
    // In a real implementation, this would upload to a sharing service
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Store share configuration (would be in a database in real implementation)
    const shareData = {
      id: shareId,
      exportId: exportResult.id,
      configuration: shareConfig,
      createdAt: new Date(),
      expiresAt: shareConfig.expiresAt,
      accessCount: 0
    }
    
    // Generate shareable URL
    const baseUrl = window.location.origin
    return `${baseUrl}/shared/${shareId}`
  } 
 /**
   * Generate project scaffolding from session
   */
  async generateProjectScaffolding(
    session: DevFlowSession,
    options: {
      includeBoilerplate: boolean
      framework?: 'react' | 'vue' | 'angular' | 'vanilla'
      language?: 'typescript' | 'javascript'
      includeTests: boolean
      includeDocumentation: boolean
    }
  ): Promise<Uint8Array> {
    // This would use JSZip to create a project structure
    // For now, return a simple implementation
    const projectData = {
      name: session.name || 'DevFlow Project',
      description: session.description || 'Generated from DevFlow session',
      nodes: session.nodes.length,
      connections: session.connections.length,
      framework: options.framework,
      language: options.language,
      generatedAt: new Date().toISOString()
    }
    
    return new TextEncoder().encode(JSON.stringify(projectData, null, 2))
  }
  
  // Private helper methods
  
  private async exportSessionToPDF(
    session: DevFlowSession,
    config: ExportConfiguration
  ): Promise<Uint8Array> {
    // This would use a library like jsPDF or Puppeteer
    const content = `PDF Export of ${session.name}\n\nNodes: ${session.nodes.length}\nConnections: ${session.connections.length}`
    return new TextEncoder().encode(content)
  }
  
  private async exportSessionToPNG(
    session: DevFlowSession,
    config: ExportConfiguration
  ): Promise<Uint8Array> {
    // This would use html2canvas or similar to capture the canvas
    const content = `PNG Export of ${session.name}`
    return new TextEncoder().encode(content)
  }
  
  private async exportSessionToHTML(
    session: DevFlowSession,
    config: ExportConfiguration
  ): Promise<string> {
    const theme = config.theme || 'light'
    const styling = config.customStyling || this.getDefaultStyling()
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${session.name || 'DevFlow Session'}</title>
    <style>
        ${this.generateHTMLStyles(styling, theme)}
    </style>
</head>
<body>
    <div class="container">
        <header class="session-header">
            <h1>${session.name || 'DevFlow Session'}</h1>
            ${session.description ? `<p class="description">${session.description}</p>` : ''}
            <div class="metadata">
                <span class="node-count">${session.nodes.length} nodes</span>
                <span class="connection-count">${session.connections.length} connections</span>
                <span class="export-date">Exported: ${new Date().toLocaleDateString()}</span>
            </div>
        </header>
        
        <main class="session-content">
            ${this.generateSessionHTML(session, config)}
        </main>
        
        <footer class="session-footer">
            <p>Generated by DevKit Flow - ${new Date().toISOString()}</p>
        </footer>
    </div>
</body>
</html>`
    
    return html
  }
  
  private exportSessionToJSON(
    session: DevFlowSession,
    config: ExportConfiguration
  ): string {
    const exportData = {
      session,
      exportConfiguration: config,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }
  
  private async exportSessionToZIP(
    session: DevFlowSession,
    config: ExportConfiguration
  ): Promise<Uint8Array> {
    // This would use JSZip to create a ZIP file
    const zipContent = {
      'session.json': this.exportSessionToJSON(session, config),
      'session.html': await this.exportSessionToHTML(session, config),
      'session.md': this.exportSessionToMarkdown(session, config),
      'README.md': `# ${session.name || 'DevFlow Session'}\n\nExported on ${new Date().toLocaleDateString()}`
    }
    
    return new TextEncoder().encode(JSON.stringify(zipContent, null, 2))
  }
  
  private exportSessionToMarkdown(
    session: DevFlowSession,
    config: ExportConfiguration
  ): string {
    let markdown = `# ${session.name || 'DevFlow Session'}\n\n`
    
    if (session.description) {
      markdown += `${session.description}\n\n`
    }
    
    markdown += `## Overview\n\n`
    markdown += `- **Nodes:** ${session.nodes.length}\n`
    markdown += `- **Connections:** ${session.connections.length}\n`
    markdown += `- **Exported:** ${new Date().toISOString()}\n\n`
    
    // Group nodes by type
    const nodesByType = session.nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = []
      acc[node.type].push(node)
      return acc
    }, {} as Record<string, typeof session.nodes>)
    
    for (const [type, nodes] of Object.entries(nodesByType)) {
      markdown += `## ${type.charAt(0).toUpperCase() + type.slice(1)} Nodes\n\n`
      
      for (const node of nodes) {
        markdown += `### ${node.title}\n\n`
        if (node.description) {
          markdown += `${node.description}\n\n`
        }
        
        // Add node content
        if (node.content.todos.length > 0) {
          markdown += `**Todos:**\n`
          for (const todo of node.content.todos) {
            const status = todo.completed ? '✅' : '⬜'
            markdown += `- ${status} ${todo.text}\n`
          }
          markdown += `\n`
        }
        
        if (node.content.codeSnippets.length > 0) {
          markdown += `**Code:**\n`
          for (const snippet of node.content.codeSnippets) {
            markdown += `\`\`\`${snippet.language || ''}\n${snippet.code}\n\`\`\`\n\n`
          }
        }
      }
    }
    
    markdown += `---\n\n`
    markdown += `*Generated by DevKit Flow on ${new Date().toLocaleDateString()}*\n`
    
    return markdown
  }
  
  private async exportPatternToPDF(
    pattern: RegexPattern,
    documentation: PatternDocumentation | undefined,
    config: ExportConfiguration
  ): Promise<Uint8Array> {
    // Would use jsPDF or similar
    const content = `PDF Export of Pattern: ${pattern.regex}`
    return new TextEncoder().encode(content)
  }
  
  private async exportPatternToHTML(
    pattern: RegexPattern,
    documentation: PatternDocumentation | undefined,
    config: ExportConfiguration
  ): Promise<string> {
    if (documentation) {
      // Use the documentation system's HTML export
      return await patternDocumentationSystem.exportDocumentation(
        documentation,
        'html',
        {
          includeExamples: true,
          includeTestCases: true,
          includePerformance: true,
          includeSecurity: true,
          includeAIContent: true,
          theme: config.theme || 'light',
          language: 'en'
        }
      ).then(result => result.content)
    }
    
    // Basic HTML export without documentation
    return `<!DOCTYPE html>
<html>
<head>
    <title>${pattern.name || 'Regex Pattern'}</title>
</head>
<body>
    <h1>${pattern.name || 'Regex Pattern'}</h1>
    <p><strong>Pattern:</strong> <code>${pattern.regex}</code></p>
    <p><strong>Description:</strong> ${pattern.description || 'No description'}</p>
</body>
</html>`
  }
  
  private exportPatternToJSON(
    pattern: RegexPattern,
    documentation: PatternDocumentation | undefined,
    config: ExportConfiguration
  ): string {
    const exportData = {
      pattern,
      documentation,
      exportConfiguration: config,
      exportedAt: new Date().toISOString()
    }
    
    return JSON.stringify(exportData, null, 2)
  }
  
  private exportPatternToMarkdown(
    pattern: RegexPattern,
    documentation: PatternDocumentation | undefined,
    config: ExportConfiguration
  ): string {
    if (documentation) {
      // Use the documentation system's Markdown export
      return patternDocumentationSystem.exportDocumentation(
        documentation,
        'markdown',
        {
          includeExamples: true,
          includeTestCases: true,
          includePerformance: true,
          includeSecurity: true,
          includeAIContent: true,
          theme: config.theme || 'light',
          language: 'en'
        }
      ).then(result => result.content).catch(() => this.generateBasicPatternMarkdown(pattern))
    }
    
    return this.generateBasicPatternMarkdown(pattern)
  }
  
  private generateBasicPatternMarkdown(pattern: RegexPattern): string {
    let markdown = `# ${pattern.name || 'Regex Pattern'}\n\n`
    
    if (pattern.description) {
      markdown += `${pattern.description}\n\n`
    }
    
    markdown += `## Pattern\n\n`
    markdown += `\`\`\`regex\n${pattern.regex}\n\`\`\`\n\n`
    
    if (pattern.flags && pattern.flags.length > 0) {
      markdown += `**Flags:** ${pattern.flags.join(', ')}\n\n`
    }
    
    if (pattern.testCases && pattern.testCases.length > 0) {
      markdown += `## Test Cases\n\n`
      for (const testCase of pattern.testCases) {
        const status = testCase.shouldMatch ? '✅ Should match' : '❌ Should not match'
        markdown += `- **Input:** \`${testCase.input}\` - ${status}\n`
      }
      markdown += `\n`
    }
    
    return markdown
  } 
 private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'html': 'text/html',
      'json': 'application/json',
      'zip': 'application/zip',
      'markdown': 'text/markdown'
    }
    
    return mimeTypes[format] || 'application/octet-stream'
  }
  
  private calculateChecksum(content: string | Uint8Array): string {
    // Simple checksum calculation
    let hash = 0
    const data = typeof content === 'string' ? content : Array.from(content).join('')
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return hash.toString(16)
  }
  
  private getDefaultStyling(): ExportStyling {
    return {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#28a745',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545'
      },
      fonts: {
        heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        code: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      }
    }
  }
  
  private generateHTMLStyles(styling: ExportStyling, theme: string): string {
    return `
      * { box-sizing: border-box; }
      body { 
        font-family: ${styling.fonts.body}; 
        line-height: 1.6; 
        margin: 0; 
        padding: 0;
        color: ${styling.colors.text};
        background: ${styling.colors.background};
      }
      .container { max-width: 1200px; margin: 0 auto; padding: ${styling.spacing.lg}; }
      .session-header { text-align: center; margin-bottom: ${styling.spacing.xl}; }
      .session-header h1 { 
        font-family: ${styling.fonts.heading}; 
        color: ${styling.colors.primary}; 
        margin-bottom: ${styling.spacing.md};
      }
      .description { color: ${styling.colors.textSecondary}; font-size: ${styling.fonts.sizes.lg}; }
      .metadata { 
        display: flex; 
        justify-content: center; 
        gap: ${styling.spacing.md}; 
        margin-top: ${styling.spacing.md};
        font-size: ${styling.fonts.sizes.sm};
        color: ${styling.colors.textSecondary};
      }
      .session-content { margin: ${styling.spacing.xl} 0; }
      .session-footer { 
        text-align: center; 
        margin-top: ${styling.spacing.xl}; 
        padding-top: ${styling.spacing.lg};
        border-top: 1px solid ${styling.colors.border};
        color: ${styling.colors.textSecondary};
        font-size: ${styling.fonts.sizes.sm};
      }
      code { 
        font-family: ${styling.fonts.code}; 
        background: ${styling.colors.surface}; 
        padding: 0.2em 0.4em; 
        border-radius: 3px; 
      }
    `
  }
  
  private generateSessionHTML(session: DevFlowSession, config: ExportConfiguration): string {
    let html = '<div class="session-overview">'
    
    // Add session statistics
    html += `<div class="stats-grid">
      <div class="stat-item">
        <h3>Nodes</h3>
        <span class="stat-value">${session.nodes.length}</span>
      </div>
      <div class="stat-item">
        <h3>Connections</h3>
        <span class="stat-value">${session.connections.length}</span>
      </div>
    </div>`
    
    // Add nodes by type
    const nodesByType = session.nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = []
      acc[node.type].push(node)
      return acc
    }, {} as Record<string, typeof session.nodes>)
    
    for (const [type, nodes] of Object.entries(nodesByType)) {
      html += `<section class="node-type-section">
        <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Nodes</h2>
        <div class="nodes-grid">`
      
      for (const node of nodes) {
        html += `<div class="node-card">
          <h3>${node.title}</h3>
          ${node.description ? `<p class="node-description">${node.description}</p>` : ''}
          
          ${node.content.todos.length > 0 ? `
            <div class="todos">
              <h4>Tasks</h4>
              <ul>
                ${node.content.todos.map(todo => 
                  `<li class="${todo.completed ? 'completed' : 'pending'}">
                    ${todo.completed ? '✅' : '⬜'} ${todo.text}
                  </li>`
                ).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${node.content.codeSnippets.length > 0 ? `
            <div class="code-snippets">
              <h4>Code</h4>
              ${node.content.codeSnippets.map(snippet => 
                `<pre><code class="language-${snippet.language || 'text'}">${snippet.code}</code></pre>`
              ).join('')}
            </div>
          ` : ''}
        </div>`
      }
      
      html += '</div></section>'
    }
    
    html += '</div>'
    return html
  }
  
  private getInteractiveHTMLStyles(options: InteractiveHTMLOptions): string {
    return `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .interactive-container { width: 100%; height: 100vh; }
      .navigation { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
      .content { margin-top: 60px; padding: 20px; }
      ${options.responsive ? '@media (max-width: 768px) { .content { padding: 10px; } }' : ''}
    `
  }
  
  private async generateInteractiveContent(session: DevFlowSession, options: InteractiveHTMLOptions): Promise<string> {
    let content = '<div class="interactive-container">'
    
    if (options.includeNavigation) {
      content += `<nav class="navigation">
        <div class="nav-content">
          <h1>${session.name || 'DevFlow Session'}</h1>
          <div class="nav-controls">
            ${options.includeSearch ? '<input type="search" placeholder="Search..." id="search-input">' : ''}
            ${options.enableZoom ? '<button id="zoom-in">+</button><button id="zoom-out">-</button>' : ''}
          </div>
        </div>
      </nav>`
    }
    
    content += '<main class="content">'
    content += this.generateSessionHTML(session, { format: 'html', quality: 'high', includeMetadata: true, includeTimeline: false, includeAnalytics: false, theme: 'light' })
    content += '</main>'
    
    content += '</div>'
    return content
  }
  
  private getInteractiveHTMLScript(session: DevFlowSession, options: InteractiveHTMLOptions): string {
    return `
      // Interactive functionality
      document.addEventListener('DOMContentLoaded', function() {
        ${options.includeSearch ? `
          const searchInput = document.getElementById('search-input');
          if (searchInput) {
            searchInput.addEventListener('input', function(e) {
              const query = e.target.value.toLowerCase();
              const nodes = document.querySelectorAll('.node-card');
              nodes.forEach(node => {
                const text = node.textContent.toLowerCase();
                node.style.display = text.includes(query) ? 'block' : 'none';
              });
            });
          }
        ` : ''}
        
        ${options.enableZoom ? `
          let zoomLevel = 1;
          const zoomIn = document.getElementById('zoom-in');
          const zoomOut = document.getElementById('zoom-out');
          const content = document.querySelector('.content');
          
          if (zoomIn && zoomOut && content) {
            zoomIn.addEventListener('click', () => {
              zoomLevel += 0.1;
              content.style.transform = 'scale(' + zoomLevel + ')';
            });
            
            zoomOut.addEventListener('click', () => {
              zoomLevel = Math.max(0.5, zoomLevel - 0.1);
              content.style.transform = 'scale(' + zoomLevel + ')';
            });
          }
        ` : ''}
      });
    `
  }
}

// Export singleton instance
export const professionalExportSystem = new ProfessionalExportSystem()