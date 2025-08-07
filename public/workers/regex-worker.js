/**
 * Regex Testing Web Worker
 * Handles heavy regex operations in background thread
 */

class RegexProcessor {
  constructor() {
    this.isProcessing = false;
  }

  async testPattern(data) {
    const { regex, flags, testCases, options = {} } = data;
    const results = [];
    
    try {
      const pattern = new RegExp(regex, flags);
      const startTime = performance.now();
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const testStartTime = performance.now();
        
        // Reset regex lastIndex for global patterns
        pattern.lastIndex = 0;
        
        const matches = [];
        let match;
        let matchCount = 0;
        const maxMatches = options.maxMatches || 1000;
        
        if (pattern.global) {
          while ((match = pattern.exec(testCase.input)) !== null && matchCount < maxMatches) {
            matches.push({
              text: match[0],
              index: match.index,
              groups: match.slice(1),
              namedGroups: match.groups || {}
            });
            matchCount++;
            
            // Prevent infinite loops
            if (match.index === pattern.lastIndex) {
              pattern.lastIndex++;
            }
          }
        } else {
          match = pattern.exec(testCase.input);
          if (match) {
            matches.push({
              text: match[0],
              index: match.index,
              groups: match.slice(1),
              namedGroups: match.groups || {}
            });
          }
        }
        
        const testEndTime = performance.now();
        
        results.push({
          testCaseId: testCase.id,
          input: testCase.input,
          matches,
          passed: testCase.expectedMatch ? matches.length > 0 : matches.length === 0,
          executionTime: testEndTime - testStartTime,
          matchCount: matches.length
        });
        
        // Report progress for long operations
        if (testCases.length > 10 && i % Math.ceil(testCases.length / 10) === 0) {
          self.postMessage({
            type: 'progress',
            progress: (i + 1) / testCases.length,
            completed: i + 1,
            total: testCases.length
          });
        }
      }
      
      const totalTime = performance.now() - startTime;
      
      return {
        results,
        summary: {
          totalTests: testCases.length,
          passed: results.filter(r => r.passed).length,
          failed: results.filter(r => !r.passed).length,
          totalMatches: results.reduce((sum, r) => sum + r.matchCount, 0),
          totalExecutionTime: totalTime,
          averageExecutionTime: totalTime / testCases.length
        }
      };
    } catch (error) {
      throw new Error(`Regex processing failed: ${error.message}`);
    }
  }

  analyzePerformance(data) {
    const { regex, flags, testInput } = data;
    
    try {
      const pattern = new RegExp(regex, flags);
      const iterations = 1000;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        pattern.test(testInput);
        times.push(performance.now() - start);
        pattern.lastIndex = 0; // Reset for global patterns
      }
      
      times.sort((a, b) => a - b);
      
      return {
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        medianTime: times[Math.floor(times.length / 2)],
        minTime: times[0],
        maxTime: times[times.length - 1],
        p95Time: times[Math.floor(times.length * 0.95)],
        iterations,
        potentialReDoS: times[times.length - 1] > times[0] * 100 // Simple ReDoS detection
      };
    } catch (error) {
      throw new Error(`Performance analysis failed: ${error.message}`);
    }
  }

  validateRegex(data) {
    const { regex, flags } = data;
    const issues = [];
    
    try {
      new RegExp(regex, flags);
      
      // Check for common ReDoS patterns
      const redosPatterns = [
        /\([^)]*\+[^)]*\+[^)]*\)/g, // Nested quantifiers
        /\([^)]*\*[^)]*\*[^)]*\)/g,
        /\([^)]*\+[^)]*\*[^)]*\)/g,
        /\([^)]*\{[^}]+\}[^)]*\{[^}]+\}[^)]*\)/g // Nested repetitions
      ];
      
      redosPatterns.forEach((pattern, index) => {
        if (pattern.test(regex)) {
          issues.push({
            type: 'redos-risk',
            severity: 'high',
            message: 'Pattern may cause exponential backtracking (ReDoS)',
            position: regex.search(pattern)
          });
        }
      });
      
      // Check for other common issues
      if (regex.includes('.*.*')) {
        issues.push({
          type: 'performance',
          severity: 'medium',
          message: 'Multiple .* patterns may cause performance issues',
          position: regex.indexOf('.*.*')
        });
      }
      
      return { valid: true, issues };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        issues: [{
          type: 'syntax-error',
          severity: 'high',
          message: error.message,
          position: 0
        }]
      };
    }
  }
}

const processor = new RegexProcessor();

self.onmessage = async function(event) {
  const { id, type, data } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'test':
        result = await processor.testPattern(data);
        break;
      case 'analyze':
        result = processor.analyzePerformance(data);
        break;
      case 'validate':
        result = processor.validateRegex(data);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
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