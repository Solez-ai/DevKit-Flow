/**
 * Export methods for Pattern Documentation System
 * Handles multi-format export functionality
 */

import type { 
  PatternDocumentation,
  ExportOptions,
  CustomStyling
} from './pattern-documentation-system-simple'

export class PatternDocumentationExporter {
  
  /**
   * Export documentation to Markdown format
   */
  exportToMarkdown(documentation: PatternDocumentation, options: ExportOptions): string {
    let markdown = `# ${documentation.title}\n\n`
    
    // Overview section
    markdown += `## Overview\n\n`
    markdown += `${documentation.overview.summary}\n\n`
    markdown += `**Purpose:** ${documentation.overview.purpose}\n\n`
    markdown += `**Complexity:** ${documentation.overview.complexity}\n\n`
    markdown += `**Tags:** ${documentation.overview.tags.join(', ')}\n\n`
    
    if (documentation.overview.prerequisites.length > 0) {
      markdown += `**Prerequisites:** ${documentation.overview.prerequisites.join(', ')}\n\n`
    }
    
    // Pattern section
    markdown += `## Pattern\n\n`
    markdown += `\`\`\`regex\n${documentation.pattern}\n\`\`\`\n\n`
    
    // Syntax breakdown
    markdown += `## Syntax Breakdown\n\n`
    markdown += `${documentation.syntax.explanation}\n\n`
    
    if (documentation.syntax.breakdown.length > 0) {
      markdown += `| Part | Type | Explanation |\n`
      markdown += `|------|------|-------------|\n`
      for (const part of documentation.syntax.breakdown) {
        markdown += `| \`${part.part}\` | ${part.type} | ${part.explanation} |\n`
      }
      markdown += `\n`
    }
    
    // Examples section
    if (options.includeExamples && documentation.examples.length > 0) {
      markdown += `## Examples\n\n`
      for (const example of documentation.examples) {
        markdown += `### ${example.title}\n\n`
        markdown += `${example.description}\n\n`
        markdown += `**Pattern:** \`${example.pattern}\`\n\n`
        markdown += `**Test String:** \`${example.testString}\`\n\n`
        markdown += `**Explanation:** ${example.explanation}\n\n`
      }
    }
    
    // Use cases section
    if (documentation.useCases.length > 0) {
      markdown += `## Use Cases\n\n`
      for (const useCase of documentation.useCases) {
        markdown += `### ${useCase.title}\n\n`
        markdown += `${useCase.description}\n\n`
        markdown += `**Example:** \`${useCase.example}\`\n\n`
        markdown += `**Explanation:** ${useCase.explanation}\n\n`
        markdown += `**Difficulty:** ${useCase.difficulty}\n\n`
      }
    }
    
    // Test cases section
    if (options.includeTestCases && documentation.testCases.length > 0) {
      markdown += `## Test Cases\n\n`
      for (const testDoc of documentation.testCases) {
        markdown += `### ${testDoc.description || testDoc.name || 'Test Case'}\n\n`
        markdown += `**Input:** \`${testDoc.input}\`\n\n`
        markdown += `**Expected:** ${testDoc.shouldMatch ? 'Match' : 'No Match'}\n\n`
        
        if (testDoc.expectedMatches && testDoc.expectedMatches.length > 0) {
          markdown += `**Expected Matches:**\n`
          for (const match of testDoc.expectedMatches) {
            markdown += `- \`${match.text}\` at position ${match.startIndex}-${match.endIndex}\n`
          }
          markdown += `\n`
        }
      }
    }
    
    // Performance section
    if (options.includePerformance) {
      markdown += `## Performance\n\n`
      markdown += `**Complexity:** ${documentation.performance.complexity}\n\n`
      markdown += `**Time Complexity:** ${documentation.performance.timeComplexity}\n\n`
      markdown += `**Space Complexity:** ${documentation.performance.spaceComplexity}\n\n`
      markdown += `**Backtracking Risk:** ${documentation.performance.backtrackingRisk}\n\n`
      
      if (documentation.performance.optimizationTips.length > 0) {
        markdown += `### Optimization Tips\n\n`
        for (const tip of documentation.performance.optimizationTips) {
          markdown += `- ${tip}\n`
        }
        markdown += `\n`
      }
      
      if (documentation.performance.benchmarks.length > 0) {
        markdown += `### Performance Benchmarks\n\n`
        markdown += `| Input Size | Execution Time (ms) | Memory Usage (bytes) |\n`
        markdown += `|------------|--------------------|-----------------------|\n`
        for (const benchmark of documentation.performance.benchmarks) {
          markdown += `| ${benchmark.inputSize} | ${benchmark.executionTime} | ${benchmark.memoryUsage} |\n`
        }
        markdown += `\n`
      }
    }
    
    // Security section
    if (options.includeSecurity) {
      markdown += `## Security\n\n`
      markdown += `**Risk Level:** ${documentation.security.riskLevel}\n\n`
      
      if (documentation.security.vulnerabilities.length > 0) {
        markdown += `### Vulnerabilities\n\n`
        for (const vuln of documentation.security.vulnerabilities) {
          markdown += `#### ${vuln.type.toUpperCase()}\n\n`
          markdown += `**Description:** ${vuln.description}\n\n`
          markdown += `**Impact:** ${vuln.impact}\n\n`
          markdown += `**Likelihood:** ${vuln.likelihood}\n\n`
          markdown += `**Example:** \`${vuln.example}\`\n\n`
        }
      }
      
      if (documentation.security.mitigations.length > 0) {
        markdown += `### Mitigations\n\n`
        for (const mitigation of documentation.security.mitigations) {
          markdown += `- **${mitigation.vulnerability}:** ${mitigation.solution}\n`
          markdown += `  - Implementation: ${mitigation.implementation}\n`
          markdown += `  - Effectiveness: ${mitigation.effectiveness}\n`
        }
        markdown += `\n`
      }
      
      if (documentation.security.bestPractices.length > 0) {
        markdown += `### Best Practices\n\n`
        for (const practice of documentation.security.bestPractices) {
          markdown += `- ${practice}\n`
        }
        markdown += `\n`
      }
    }
    
    // Compatibility section
    markdown += `## Compatibility\n\n`
    
    if (documentation.compatibility.languages.length > 0) {
      markdown += `### Language Support\n\n`
      markdown += `| Language | Supported | Version | Notes |\n`
      markdown += `|----------|-----------|---------|-------|\n`
      for (const lang of documentation.compatibility.languages) {
        const supported = lang.supported ? '✅' : '❌'
        const version = lang.version || 'N/A'
        const notes = lang.notes || ''
        markdown += `| ${lang.language} | ${supported} | ${version} | ${notes} |\n`
      }
      markdown += `\n`
    }
    
    if (documentation.compatibility.browsers.length > 0) {
      markdown += `### Browser Support\n\n`
      markdown += `| Browser | Supported | Version | Notes |\n`
      markdown += `|---------|-----------|---------|-------|\n`
      for (const browser of documentation.compatibility.browsers) {
        const supported = browser.supported ? '✅' : '❌'
        const version = browser.version || 'N/A'
        const notes = browser.notes || ''
        markdown += `| ${browser.browser} | ${supported} | ${version} | ${notes} |\n`
      }
      markdown += `\n`
    }
    
    // AI Content section
    if (options.includeAIContent && documentation.aiExplanation) {
      markdown += `## AI-Enhanced Explanation\n\n`
      markdown += `${documentation.aiExplanation.plainEnglish}\n\n`
      
      if (documentation.aiExplanation.stepByStep.length > 0) {
        markdown += `### Step-by-Step Breakdown\n\n`
        for (let i = 0; i < documentation.aiExplanation.stepByStep.length; i++) {
          markdown += `${i + 1}. ${documentation.aiExplanation.stepByStep[i]}\n`
        }
        markdown += `\n`
      }
      
      if (documentation.aiExplanation.analogies.length > 0) {
        markdown += `### Analogies\n\n`
        for (const analogy of documentation.aiExplanation.analogies) {
          markdown += `- ${analogy}\n`
        }
        markdown += `\n`
      }
      
      if (documentation.aiOptimizations && documentation.aiOptimizations.length > 0) {
        markdown += `### AI Optimization Suggestions\n\n`
        for (const opt of documentation.aiOptimizations!) {
          markdown += `#### ${opt.type} Optimization\n\n`
          markdown += `**Suggestion:** ${opt.suggestion}\n\n`
          markdown += `**Original:** \`${opt.originalPattern}\`\n\n`
          markdown += `**Optimized:** \`${opt.optimizedPattern}\`\n\n`
          markdown += `**Explanation:** ${opt.explanation}\n\n`
          markdown += `**Impact:** ${opt.impact}\n\n`
        }
      }
    }
    
    // Troubleshooting section
    if (documentation.troubleshooting.commonIssues.length > 0) {
      markdown += `## Troubleshooting\n\n`
      
      for (const issue of documentation.troubleshooting.commonIssues) {
        markdown += `### ${issue.issue}\n\n`
        markdown += `**Symptoms:**\n`
        for (const symptom of issue.symptoms) {
          markdown += `- ${symptom}\n`
        }
        markdown += `\n`
        
        markdown += `**Causes:**\n`
        for (const cause of issue.causes) {
          markdown += `- ${cause}\n`
        }
        markdown += `\n`
        
        markdown += `**Solutions:**\n`
        for (const solution of issue.solutions) {
          if (typeof solution === 'string') {
            markdown += `- ${solution}\n`
          } else {
            const solutionObj = solution as any
            markdown += `- ${solutionObj.solution} (${solutionObj.effectiveness} effectiveness)\n`
            for (const step of solutionObj.steps) {
              markdown += `  - ${step}\n`
            }
          }
        }
        markdown += `\n`
        
        markdown += `**Prevention:** ${issue.prevention}\n\n`
      }
      
      if (documentation.troubleshooting.debuggingTips.length > 0) {
        markdown += `### Debugging Tips\n\n`
        for (const tip of documentation.troubleshooting.debuggingTips) {
          markdown += `- ${tip}\n`
        }
        markdown += `\n`
      }
      
      if (documentation.troubleshooting.faq.length > 0) {
        markdown += `### Frequently Asked Questions\n\n`
        for (const faq of documentation.troubleshooting.faq) {
          markdown += `**Q: ${faq.question}**\n\n`
          markdown += `A: ${faq.answer}\n\n`
        }
      }
    }
    
    // Footer
    markdown += `---\n\n`
    markdown += `*Documentation generated on ${documentation.metadata.createdAt.toISOString()}*\n\n`
    markdown += `*Pattern: \`${documentation.pattern}\`*\n\n`
    markdown += `*Accuracy: ${Math.round(documentation.metadata.accuracy * 100)}% | Completeness: ${Math.round(documentation.metadata.completeness * 100)}%*\n`
    
    return markdown
  }
  
  /**
   * Export documentation to HTML format
   */
  exportToHTML(documentation: PatternDocumentation, options: ExportOptions): string {
    const theme = options.theme || 'light'
    const styles = this.getHTMLStyles(theme, options.customStyling)
    
    let html = `<!DOCTYPE html>\n<html lang="${options.language || 'en'}">\n<head>\n`
    html += `<meta charset="UTF-8">\n`
    html += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`
    html += `<title>${documentation.title} - Pattern Documentation</title>\n`
    html += `<style>${styles}</style>\n`
    html += `</head>\n<body>\n`
    
    html += `<div class="container">\n`
    html += `<header class="doc-header">\n`
    html += `<h1>${documentation.title}</h1>\n`
    html += `<div class="pattern-display">\n`
    html += `<code class="regex-pattern">${documentation.pattern}</code>\n`
    html += `</div>\n`
    html += `</header>\n`
    
    // Navigation
    html += `<nav class="doc-nav">\n<ul>\n`
    html += `<li><a href="#overview">Overview</a></li>\n`
    html += `<li><a href="#syntax">Syntax</a></li>\n`
    if (options.includeExamples) html += `<li><a href="#examples">Examples</a></li>\n`
    if (options.includeTestCases) html += `<li><a href="#test-cases">Test Cases</a></li>\n`
    if (options.includePerformance) html += `<li><a href="#performance">Performance</a></li>\n`
    if (options.includeSecurity) html += `<li><a href="#security">Security</a></li>\n`
    html += `<li><a href="#compatibility">Compatibility</a></li>\n`
    if (options.includeAIContent) html += `<li><a href="#ai-explanation">AI Explanation</a></li>\n`
    html += `</ul>\n</nav>\n`
    
    // Overview section
    html += `<section id="overview" class="doc-section">\n`
    html += `<h2>Overview</h2>\n`
    html += `<p class="summary">${documentation.overview.summary}</p>\n`
    html += `<div class="metadata-grid">\n`
    html += `<div class="metadata-item">\n`
    html += `<strong>Purpose:</strong> ${documentation.overview.purpose}\n`
    html += `</div>\n`
    html += `<div class="metadata-item">\n`
    html += `<strong>Complexity:</strong> <span class="badge complexity-${documentation.overview.complexity}">${documentation.overview.complexity}</span>\n`
    html += `</div>\n`
    html += `<div class="metadata-item">\n`
    html += `<strong>Tags:</strong> ${documentation.overview.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}\n`
    html += `</div>\n`
    html += `</div>\n`
    html += `</section>\n`
    
    // Syntax section
    html += `<section id="syntax" class="doc-section">\n`
    html += `<h2>Syntax Breakdown</h2>\n`
    html += `<p>${documentation.syntax.explanation}</p>\n`
    
    if (documentation.syntax.breakdown.length > 0) {
      html += `<div class="syntax-table">\n`
      html += `<table>\n<thead>\n<tr><th>Part</th><th>Type</th><th>Explanation</th></tr>\n</thead>\n<tbody>\n`
      for (const part of documentation.syntax.breakdown) {
        html += `<tr>\n`
        html += `<td><code>${part.part}</code></td>\n`
        html += `<td><span class="syntax-type">${part.type}</span></td>\n`
        html += `<td>${part.explanation}</td>\n`
        html += `</tr>\n`
      }
      html += `</tbody>\n</table>\n</div>\n`
    }
    html += `</section>\n`
    
    // Examples section
    if (options.includeExamples && documentation.examples.length > 0) {
      html += `<section id="examples" class="doc-section">\n`
      html += `<h2>Examples</h2>\n`
      for (const example of documentation.examples) {
        html += `<div class="example-card">\n`
        html += `<h3>${example.title}</h3>\n`
        html += `<p>${example.description}</p>\n`
        html += `<div class="example-code">\n`
        html += `<div class="code-line"><strong>Pattern:</strong> <code>${example.pattern}</code></div>\n`
        html += `<div class="code-line"><strong>Test String:</strong> <code>${example.testString}</code></div>\n`
        html += `</div>\n`
        html += `<p class="explanation">${example.explanation}</p>\n`
        html += `</div>\n`
      }
      html += `</section>\n`
    }
    
    // Performance section
    if (options.includePerformance) {
      html += `<section id="performance" class="doc-section">\n`
      html += `<h2>Performance Analysis</h2>\n`
      html += `<div class="performance-grid">\n`
      html += `<div class="perf-item">\n`
      html += `<strong>Time Complexity:</strong> <code>${documentation.performance.timeComplexity}</code>\n`
      html += `</div>\n`
      html += `<div class="perf-item">\n`
      html += `<strong>Space Complexity:</strong> <code>${documentation.performance.spaceComplexity}</code>\n`
      html += `</div>\n`
      html += `<div class="perf-item">\n`
      html += `<strong>Backtracking Risk:</strong> <span class="risk-${documentation.performance.backtrackingRisk}">${documentation.performance.backtrackingRisk}</span>\n`
      html += `</div>\n`
      html += `</div>\n`
      
      if (documentation.performance.optimizationTips.length > 0) {
        html += `<h3>Optimization Tips</h3>\n<ul class="tips-list">\n`
        for (const tip of documentation.performance.optimizationTips) {
          html += `<li>${tip}</li>\n`
        }
        html += `</ul>\n`
      }
      html += `</section>\n`
    }
    
    // Security section
    if (options.includeSecurity && documentation.security.vulnerabilities.length > 0) {
      html += `<section id="security" class="doc-section">\n`
      html += `<h2>Security Analysis</h2>\n`
      html += `<div class="security-header">\n`
      html += `<span class="risk-level risk-${documentation.security.riskLevel}">Risk Level: ${documentation.security.riskLevel}</span>\n`
      html += `</div>\n`
      
      for (const vuln of documentation.security.vulnerabilities) {
        html += `<div class="vulnerability-card">\n`
        html += `<h3>${vuln.type.toUpperCase()}</h3>\n`
        html += `<p><strong>Description:</strong> ${vuln.description}</p>\n`
        html += `<p><strong>Impact:</strong> ${vuln.impact}</p>\n`
        html += `<p><strong>Likelihood:</strong> <span class="likelihood-${vuln.likelihood}">${vuln.likelihood}</span></p>\n`
        html += `<div class="code-example"><strong>Example:</strong> <code>${vuln.example}</code></div>\n`
        html += `</div>\n`
      }
      html += `</section>\n`
    }
    
    // Compatibility section
    html += `<section id="compatibility" class="doc-section">\n`
    html += `<h2>Compatibility</h2>\n`
    
    if (documentation.compatibility.languages.length > 0) {
      html += `<h3>Language Support</h3>\n`
      html += `<div class="compatibility-grid">\n`
      for (const lang of documentation.compatibility.languages) {
        const supportClass = lang.supported ? 'supported' : 'not-supported'
        html += `<div class="compat-item ${supportClass}">\n`
        html += `<div class="compat-name">${lang.language}</div>\n`
        html += `<div class="compat-status">${lang.supported ? '✅' : '❌'}</div>\n`
        if (lang.version) html += `<div class="compat-version">${lang.version}</div>\n`
        if (lang.notes) html += `<div class="compat-notes">${lang.notes}</div>\n`
        html += `</div>\n`
      }
      html += `</div>\n`
    }
    html += `</section>\n`
    
    // AI Content section
    if (options.includeAIContent && documentation.aiExplanation) {
      html += `<section id="ai-explanation" class="doc-section">\n`
      html += `<h2>AI-Enhanced Explanation</h2>\n`
      html += `<div class="ai-content">\n`
      html += `<p class="ai-explanation">${documentation.aiExplanation.plainEnglish}</p>\n`
      
      if (documentation.aiExplanation.stepByStep.length > 0) {
        html += `<h3>Step-by-Step Breakdown</h3>\n<ol class="step-list">\n`
        for (const step of documentation.aiExplanation.stepByStep) {
          html += `<li>${step}</li>\n`
        }
        html += `</ol>\n`
      }
      
      if (documentation.aiExplanation.analogies.length > 0) {
        html += `<h3>Analogies</h3>\n<ul class="analogy-list">\n`
        for (const analogy of documentation.aiExplanation.analogies) {
          html += `<li>${analogy}</li>\n`
        }
        html += `</ul>\n`
      }
      html += `</div>\n`
      html += `</section>\n`
    }
    
    // Footer
    html += `<footer class="doc-footer">\n`
    html += `<div class="footer-content">\n`
    html += `<p>Documentation generated on ${documentation.metadata.createdAt.toLocaleDateString()}</p>\n`
    html += `<p>Pattern: <code>${documentation.pattern}</code></p>\n`
    html += `<div class="quality-metrics">\n`
    html += `<span>Accuracy: ${Math.round(documentation.metadata.accuracy * 100)}%</span>\n`
    html += `<span>Completeness: ${Math.round(documentation.metadata.completeness * 100)}%</span>\n`
    html += `</div>\n`
    html += `</div>\n`
    html += `</footer>\n`
    
    html += `</div>\n`
    
    // Add interactive JavaScript
    html += `<script>\n`
    html += `// Smooth scrolling for navigation links\n`
    html += `document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {\n`
    html += `  anchor.addEventListener('click', function (e) {\n`
    html += `    e.preventDefault();\n`
    html += `    document.querySelector(this.getAttribute('href')).scrollIntoView({\n`
    html += `      behavior: 'smooth'\n`
    html += `    });\n`
    html += `  });\n`
    html += `});\n`
    html += `</script>\n`
    
    html += `</body>\n</html>`
    
    return html
  }
  
  /**
   * Export documentation to JSON format
   */
  exportToJSON(documentation: PatternDocumentation, options: ExportOptions): string {
    const exportData = {
      ...documentation,
      exportOptions: options,
      exportedAt: new Date().toISOString()
    }
    
    return JSON.stringify(exportData, null, 2)
  }
  
  /**
   * Export documentation to PDF format (placeholder)
   */
  async exportToPDF(documentation: PatternDocumentation, options: ExportOptions): Promise<string> {
    // This would use a library like jsPDF or Puppeteer to generate PDF
    // For now, return a placeholder that could be processed by a PDF generator
    const htmlContent = this.exportToHTML(documentation, { ...options, theme: 'print' })
    return `PDF_CONTENT:${htmlContent}`
  }
  
  /**
   * Export documentation to DOCX format (placeholder)
   */
  async exportToDocx(documentation: PatternDocumentation, options: ExportOptions): Promise<string> {
    // This would use a library like docx to generate Word documents
    // For now, return a placeholder
    return `DOCX export for ${documentation.title} - ${documentation.pattern}`
  }
  
  /**
   * Get HTML styles for different themes
   */
  private getHTMLStyles(theme: string, customStyling?: CustomStyling): string {
    const baseStyles = `
      * { box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
        line-height: 1.6; 
        margin: 0; 
        padding: 0;
        color: #333;
        background: #fff;
      }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .doc-header { text-align: center; margin-bottom: 2rem; padding: 2rem 0; border-bottom: 2px solid #eee; }
      .doc-header h1 { margin: 0 0 1rem 0; color: #2c3e50; font-size: 2.5rem; }
      .pattern-display { margin: 1rem 0; }
      .regex-pattern { 
        background: #f8f9fa; 
        padding: 1rem 1.5rem; 
        border-radius: 8px; 
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
        font-size: 1.2rem; 
        border: 2px solid #e9ecef;
        display: inline-block;
        max-width: 100%;
        word-break: break-all;
      }
      .doc-nav { margin: 2rem 0; }
      .doc-nav ul { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
      .doc-nav li { margin: 0; }
      .doc-nav a { 
        display: block; 
        padding: 0.5rem 1rem; 
        background: #007bff; 
        color: white; 
        text-decoration: none; 
        border-radius: 4px; 
        transition: background 0.2s;
      }
      .doc-nav a:hover { background: #0056b3; }
      .doc-section { margin: 3rem 0; padding: 2rem 0; border-bottom: 1px solid #eee; }
      .doc-section:last-child { border-bottom: none; }
      .doc-section h2 { color: #2c3e50; margin-bottom: 1.5rem; font-size: 2rem; }
      .doc-section h3 { color: #34495e; margin: 1.5rem 0 1rem 0; font-size: 1.5rem; }
      .summary { font-size: 1.1rem; color: #555; margin-bottom: 1.5rem; }
      .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
      .metadata-item { padding: 1rem; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #007bff; }
      .badge { 
        padding: 0.25rem 0.75rem; 
        border-radius: 12px; 
        font-size: 0.875rem; 
        font-weight: 600; 
        text-transform: uppercase;
      }
      .complexity-beginner { background: #d4edda; color: #155724; }
      .complexity-intermediate { background: #fff3cd; color: #856404; }
      .complexity-advanced { background: #f8d7da; color: #721c24; }
      .tag { 
        background: #e9ecef; 
        padding: 0.25rem 0.5rem; 
        border-radius: 4px; 
        font-size: 0.875rem; 
        margin-right: 0.5rem;
        display: inline-block;
      }
      .syntax-table { overflow-x: auto; margin: 1.5rem 0; }
      .syntax-table table { width: 100%; border-collapse: collapse; }
      .syntax-table th, .syntax-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #dee2e6; }
      .syntax-table th { background: #f8f9fa; font-weight: 600; }
      .syntax-type { 
        background: #6f42c1; 
        color: white; 
        padding: 0.25rem 0.5rem; 
        border-radius: 4px; 
        font-size: 0.875rem;
      }
      .example-card { 
        border: 1px solid #dee2e6; 
        border-radius: 8px; 
        padding: 1.5rem; 
        margin: 1rem 0; 
        background: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .example-card h3 { margin-top: 0; color: #495057; }
      .example-code { 
        background: #f8f9fa; 
        padding: 1rem; 
        border-radius: 6px; 
        margin: 1rem 0; 
        border-left: 4px solid #28a745;
      }
      .code-line { margin: 0.5rem 0; }
      .explanation { font-style: italic; color: #6c757d; margin-bottom: 0; }
      .performance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
      .perf-item { padding: 1rem; background: #f8f9fa; border-radius: 6px; text-align: center; }
      .risk-low { color: #28a745; font-weight: 600; }
      .risk-medium { color: #ffc107; font-weight: 600; }
      .risk-high { color: #dc3545; font-weight: 600; }
      .tips-list { padding-left: 1.5rem; }
      .tips-list li { margin: 0.5rem 0; }
      .security-header { margin-bottom: 1.5rem; }
      .risk-level { 
        padding: 0.5rem 1rem; 
        border-radius: 6px; 
        font-weight: 600; 
        text-transform: uppercase;
      }
      .risk-level.risk-low { background: #d4edda; color: #155724; }
      .risk-level.risk-medium { background: #fff3cd; color: #856404; }
      .risk-level.risk-high { background: #f8d7da; color: #721c24; }
      .risk-level.risk-critical { background: #721c24; color: white; }
      .vulnerability-card { 
        border: 1px solid #dc3545; 
        border-radius: 8px; 
        padding: 1.5rem; 
        margin: 1rem 0; 
        background: #fff5f5;
      }
      .vulnerability-card h3 { color: #dc3545; margin-top: 0; }
      .likelihood-low { color: #28a745; }
      .likelihood-medium { color: #ffc107; }
      .likelihood-high { color: #dc3545; }
      .compatibility-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
      .compat-item { 
        padding: 1rem; 
        border-radius: 8px; 
        text-align: center; 
        border: 2px solid #dee2e6;
      }
      .compat-item.supported { border-color: #28a745; background: #f8fff9; }
      .compat-item.not-supported { border-color: #dc3545; background: #fff5f5; }
      .compat-name { font-weight: 600; margin-bottom: 0.5rem; }
      .compat-status { font-size: 1.5rem; margin: 0.5rem 0; }
      .compat-version { font-size: 0.875rem; color: #6c757d; }
      .compat-notes { font-size: 0.875rem; color: #6c757d; margin-top: 0.5rem; }
      .ai-content { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 1.5rem 0; }
      .ai-explanation { font-size: 1.1rem; margin-bottom: 1.5rem; }
      .step-list, .analogy-list { padding-left: 1.5rem; }
      .step-list li, .analogy-list li { margin: 0.75rem 0; }
      .doc-footer { 
        margin-top: 4rem; 
        padding: 2rem 0; 
        border-top: 2px solid #eee; 
        text-align: center; 
        background: #f8f9fa;
      }
      .footer-content p { margin: 0.5rem 0; color: #6c757d; }
      .quality-metrics { margin-top: 1rem; }
      .quality-metrics span { 
        margin: 0 1rem; 
        padding: 0.25rem 0.75rem; 
        background: #007bff; 
        color: white; 
        border-radius: 4px; 
        font-size: 0.875rem;
      }
      code { 
        background: #f1f3f4; 
        padding: 0.2rem 0.4rem; 
        border-radius: 3px; 
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
      }
      @media (max-width: 768px) {
        .container { padding: 1rem; }
        .doc-header h1 { font-size: 2rem; }
        .regex-pattern { font-size: 1rem; padding: 0.75rem 1rem; }
        .doc-nav ul { flex-direction: column; align-items: center; }
        .metadata-grid, .performance-grid, .compatibility-grid { grid-template-columns: 1fr; }
      }
    `
    
    if (theme === 'dark') {
      return baseStyles + `
        body { background: #1a1a1a; color: #e0e0e0; }
        .doc-header { border-bottom-color: #333; }
        .doc-header h1 { color: #fff; }
        .regex-pattern { background: #2d2d2d; color: #fff; border-color: #444; }
        .doc-section { border-bottom-color: #333; }
        .doc-section h2, .doc-section h3 { color: #fff; }
        .metadata-item, .perf-item { background: #2d2d2d; }
        .example-card { background: #2d2d2d; border-color: #444; }
        .example-code { background: #1e1e1e; border-left-color: #28a745; }
        .syntax-table th { background: #2d2d2d; }
        .syntax-table th, .syntax-table td { border-bottom-color: #444; }
        .vulnerability-card { background: #2d1a1a; border-color: #dc3545; }
        .compat-item { background: #2d2d2d; border-color: #444; }
        .compat-item.supported { background: #1a2d1a; }
        .compat-item.not-supported { background: #2d1a1a; }
        .doc-footer { background: #2d2d2d; border-top-color: #333; }
        code { background: #2d2d2d; color: #e0e0e0; }
      `
    }
    
    if (theme === 'print') {
      return baseStyles + `
        body { font-size: 12pt; }
        .doc-nav { display: none; }
        .doc-section { page-break-inside: avoid; }
        .example-card, .vulnerability-card { page-break-inside: avoid; }
        .ai-content { background: #f8f9fa !important; color: #333 !important; border: 1px solid #dee2e6; }
        @media print {
          .doc-nav { display: none !important; }
          body { background: white !important; }
        }
      `
    }
    
    return baseStyles
  }
  
  /**
   * Calculate checksum for content
   */
  calculateChecksum(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }
}

export const patternDocumentationExporter = new PatternDocumentationExporter()