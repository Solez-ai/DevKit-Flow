/**
 * Helper methods for Pattern Documentation System
 * Supporting functions for analysis, generation, and export
 */

import type { 
  RegexPattern, 
  TestCase,
  PerformanceBenchmark,
  PerformanceAlternative,
  SecurityVulnerability,
  SecurityMitigation,
  LanguageCompatibility,
  BrowserCompatibility,
  EngineCompatibility,
  TroubleshootingIssue,
  FAQItem,
  AIPatternExplanation,
  AIOptimizationSuggestion,
  AIAlternativePattern,
  DocumentationMetadata,
  DocumentationGenerationOptions,
  PatternDocumentation,
  ExportOptions
} from './pattern-documentation-system'

export class PatternDocumentationHelpers {
  
  analyzeTimeComplexity(pattern: string): { description: string; timeComplexity: string; spaceComplexity: string } {
    // Analyze time complexity of the pattern
    if (pattern.includes('.*.*') || pattern.includes('.+.+')) {
      return {
        description: 'Exponential time complexity due to nested quantifiers',
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(n)'
      }
    }
    
    if (pattern.includes('*') || pattern.includes('+')) {
      return {
        description: 'Quadratic time complexity due to backtracking',
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(n)'
      }
    }
    
    return {
      description: 'Linear time complexity',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)'
    }
  }
  
  analyzeBacktrackingRisk(pattern: string): 'low' | 'medium' | 'high' {
    // Analyze backtracking risk
    if (pattern.includes('.*.*') || pattern.includes('.+.+') || pattern.includes('(.*)*')) {
      return 'high'
    }
    if (pattern.includes('*') || pattern.includes('+') || pattern.includes('?')) {
      return 'medium'
    }
    return 'low'
  }
  
  generateOptimizationTips(pattern: string): string[] {
    const tips: string[] = []
    
    if (pattern.includes('.*')) {
      tips.push('Consider using more specific character classes instead of .*')
    }
    if (pattern.includes('.+')) {
      tips.push('Consider using more specific character classes instead of .+')
    }
    if (pattern.includes('(.*)*')) {
      tips.push('Avoid nested quantifiers - use atomic groups or possessive quantifiers')
    }
    if (pattern.includes('|')) {
      tips.push('Order alternations from most specific to least specific')
    }
    if (pattern.length > 50) {
      tips.push('Consider breaking complex patterns into smaller, composable parts')
    }
    
    return tips
  }
  
  async generateBenchmarks(pattern: string): Promise<PerformanceBenchmark[]> {
    // Generate performance benchmarks for different input sizes
    const benchmarks: PerformanceBenchmark[] = []
    
    const inputSizes = [10, 100, 1000, 10000]
    
    for (const size of inputSizes) {
      // Simulate benchmark data - in real implementation, would run actual tests
      const executionTime = this.estimateExecutionTime(pattern, size)
      const memoryUsage = this.estimateMemoryUsage(pattern, size)
      
      benchmarks.push({
        inputSize: size,
        executionTime,
        memoryUsage,
        testDescription: `Performance test with ${size} character input`
      })
    }
    
    return benchmarks
  }
  
  async findPerformanceAlternatives(pattern: string): Promise<PerformanceAlternative[]> {
    const alternatives: PerformanceAlternative[] = []
    
    // Suggest alternatives based on pattern analysis
    if (pattern.includes('.*')) {
      alternatives.push({
        pattern: pattern.replace(/\.\*/g, '[^\\n]*'),
        description: 'Use negated character class instead of dot-star',
        performanceGain: '20-30% faster',
        tradeoffs: ['More explicit', 'Doesn\'t match newlines']
      })
    }
    
    if (pattern.includes('\\d+')) {
      alternatives.push({
        pattern: pattern.replace(/\\d\+/g, '[0-9]+'),
        description: 'Use explicit digit range',
        performanceGain: '10-15% faster in some engines',
        tradeoffs: ['More verbose', 'ASCII-only digits']
      })
    }
    
    return alternatives
  }
  
  analyzeSecurityVulnerabilities(pattern: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = []
    
    // Check for ReDoS vulnerabilities
    if (pattern.includes('(.*)*') || pattern.includes('(.+)+') || pattern.includes('(.*)+')) {
      vulnerabilities.push({
        type: 'redos',
        description: 'Potential Regular Expression Denial of Service (ReDoS) vulnerability due to catastrophic backtracking',
        example: 'Input like "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!" could cause exponential backtracking',
        impact: 'Application could become unresponsive, leading to denial of service',
        likelihood: 'high'
      })
    }
    
    // Check for overly permissive patterns
    if (pattern === '.*' || pattern === '.+') {
      vulnerabilities.push({
        type: 'bypass',
        description: 'Overly permissive pattern that may allow unintended input',
        example: 'Pattern matches any input, potentially bypassing validation',
        impact: 'Security controls may be bypassed',
        likelihood: 'medium'
      })
    }
    
    // Check for information disclosure
    if (pattern.includes('(?=') && pattern.includes('.*')) {
      vulnerabilities.push({
        type: 'information-disclosure',
        description: 'Lookahead with greedy quantifiers may reveal information about input structure',
        example: 'Pattern behavior may leak information about input format',
        impact: 'Potential information disclosure through timing attacks',
        likelihood: 'low'
      })
    }
    
    return vulnerabilities
  }
  
  generateSecurityMitigations(vulnerabilities: SecurityVulnerability[]): SecurityMitigation[] {
    return vulnerabilities.map(vuln => {
      switch (vuln.type) {
        case 'redos':
          return {
            vulnerability: vuln.type,
            solution: 'Use atomic groups, possessive quantifiers, or implement timeout limits',
            implementation: 'Replace (.*) with (?>.*) or set regex timeout to 1000ms',
            effectiveness: 'complete'
          }
        case 'bypass':
          return {
            vulnerability: vuln.type,
            solution: 'Make pattern more specific and restrictive',
            implementation: 'Replace .* with specific character classes like [a-zA-Z0-9]+',
            effectiveness: 'complete'
          }
        case 'information-disclosure':
          return {
            vulnerability: vuln.type,
            solution: 'Avoid complex lookaheads or implement constant-time validation',
            implementation: 'Simplify pattern or use multiple validation steps',
            effectiveness: 'partial'
          }
        default:
          return {
            vulnerability: vuln.type,
            solution: 'Review pattern for security implications',
            implementation: 'Conduct security review and testing',
            effectiveness: 'partial'
          }
      }
    })
  }
  
  calculateSecurityRiskLevel(vulnerabilities: SecurityVulnerability[]): 'low' | 'medium' | 'high' | 'critical' {
    if (vulnerabilities.length === 0) return 'low'
    
    const hasHighLikelihood = vulnerabilities.some(v => v.likelihood === 'high')
    const hasReDoS = vulnerabilities.some(v => v.type === 'redos')
    
    if (hasReDoS && hasHighLikelihood) return 'critical'
    if (hasReDoS || hasHighLikelihood) return 'high'
    if (vulnerabilities.length > 2) return 'medium'
    return 'low'
  }
  
  getSecurityBestPractices(): string[] {
    return [
      'Always validate input length before applying regex',
      'Use timeout limits for regex execution (recommended: 1000ms)',
      'Avoid nested quantifiers that can cause exponential backtracking',
      'Test patterns with malicious input designed to trigger ReDoS',
      'Consider using atomic groups (?>...) for performance-critical patterns',
      'Use specific character classes instead of dot (.) when possible',
      'Implement input sanitization before regex processing',
      'Monitor regex execution time in production',
      'Use static analysis tools to detect ReDoS vulnerabilities',
      'Consider alternative parsing methods for complex input validation'
    ]
  }
  
  analyzeLanguageCompatibility(pattern: string): LanguageCompatibility[] {
    const compatibility: LanguageCompatibility[] = [
      { language: 'JavaScript', supported: true, version: 'ES2015+' },
      { language: 'Python', supported: true, version: '3.0+' },
      { language: 'Java', supported: true, version: '8+' },
      { language: 'C#', supported: true, version: '.NET 4.0+' },
      { language: 'PHP', supported: true, version: '7.0+' },
      { language: 'Ruby', supported: true, version: '2.0+' },
      { language: 'Go', supported: true, version: '1.0+' }
    ]
    
    // Check for features that may not be supported everywhere
    if (pattern.includes('(?<=') || pattern.includes('(?<!')) {
      compatibility.forEach(lang => {
        if (lang.language === 'JavaScript') {
          lang.notes = 'Lookbehind requires ES2018+ (Chrome 62+, Firefox 78+)'
        }
      })
    }
    
    if (pattern.includes('\\p{')) {
      compatibility.forEach(lang => {
        if (lang.language === 'JavaScript') {
          lang.notes = 'Unicode property escapes require ES2018+'
        }
      })
    }
    
    return compatibility
  }
  
  analyzeBrowserCompatibility(pattern: string): BrowserCompatibility[] {
    const compatibility: BrowserCompatibility[] = [
      { browser: 'Chrome', supported: true, version: '50+' },
      { browser: 'Firefox', supported: true, version: '40+' },
      { browser: 'Safari', supported: true, version: '10+' },
      { browser: 'Edge', supported: true, version: '12+' }
    ]
    
    // Adjust for specific features
    if (pattern.includes('(?<=') || pattern.includes('(?<!')) {
      compatibility.forEach(browser => {
        switch (browser.browser) {
          case 'Chrome':
            browser.version = '62+'
            break
          case 'Firefox':
            browser.version = '78+'
            break
          case 'Safari':
            browser.version = '16.4+'
            break
          case 'Edge':
            browser.version = '79+'
            break
        }
      })
    }
    
    return compatibility
  }
  
  analyzeEngineCompatibility(pattern: string): EngineCompatibility[] {
    return [
      {
        engine: 'V8 (Chrome/Node.js)',
        supported: true,
        version: '5.0+',
        features: ['Lookbehind', 'Unicode Properties', 'Named Groups'],
        limitations: []
      },
      {
        engine: 'SpiderMonkey (Firefox)',
        supported: true,
        version: '45+',
        features: ['Lookbehind', 'Unicode Properties', 'Named Groups'],
        limitations: []
      },
      {
        engine: 'JavaScriptCore (Safari)',
        supported: true,
        version: '10+',
        features: ['Unicode Properties', 'Named Groups'],
        limitations: ['Lookbehind support added in Safari 16.4']
      },
      {
        engine: 'Chakra (Legacy Edge)',
        supported: true,
        version: '12+',
        features: ['Basic regex features'],
        limitations: ['Limited lookbehind support', 'No Unicode property escapes']
      }
    ]
  }
  
  generateCompatibilityNotes(pattern: string): string[] {
    const notes: string[] = []
    
    if (pattern.includes('(?<=') || pattern.includes('(?<!')) {
      notes.push('Lookbehind assertions require modern JavaScript engines (ES2018+)')
      notes.push('Consider using alternative approaches for older browser support')
    }
    
    if (pattern.includes('\\p{')) {
      notes.push('Unicode property escapes require ES2018+ support')
      notes.push('Use explicit character ranges for broader compatibility')
    }
    
    if (pattern.includes('(?<')) {
      notes.push('Named capture groups require ES2018+ support')
    }
    
    if (pattern.includes('\\k<')) {
      notes.push('Named backreferences require ES2018+ support')
    }
    
    return notes
  }
  
  private estimateExecutionTime(pattern: string, inputSize: number): number {
    // Simple estimation based on pattern complexity
    let baseTime = inputSize * 0.001 // 1ms per 1000 characters
    
    if (pattern.includes('.*') || pattern.includes('.+')) {
      baseTime *= 2 // Greedy quantifiers are slower
    }
    
    if (pattern.includes('(?=') || pattern.includes('(?<=')) {
      baseTime *= 1.5 // Lookarounds add overhead
    }
    
    if (pattern.includes('(.*)*')) {
      baseTime *= Math.pow(inputSize, 0.5) // Exponential backtracking
    }
    
    return Math.round(baseTime * 100) / 100
  }
  
  private estimateMemoryUsage(pattern: string, inputSize: number): number {
    // Simple estimation of memory usage in bytes
    let baseMemory = inputSize * 2 // Base memory for input
    
    const groupCount = (pattern.match(/\(/g) || []).length
    baseMemory += groupCount * 100 // Memory for capture groups
    
    if (pattern.includes('(?=') || pattern.includes('(?<=')) {
      baseMemory += inputSize * 0.5 // Additional memory for lookarounds
    }
    
    return Math.round(baseMemory)
  }
}

export const patternDocumentationHelpers = new PatternDocumentationHelpers()