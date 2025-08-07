/**
 * AI Processing Web Worker
 * Handles AI API calls and processing in background thread
 */

class AIProcessor {
  constructor() {
    this.isProcessing = false;
    this.requestQueue = [];
    this.activeRequests = new Map();
    this.rateLimiter = {
      requests: [],
      maxRequestsPerMinute: 60,
      cooldownPeriod: 1000
    };
  }

  async processAIRequest(data) {
    const { prompt, model, apiKey, options = {} } = data;
    
    // Check rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://devkit-flow.app',
          'X-Title': 'DevKit Flow'
        },
        body: JSON.stringify({
          model: model || 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Record successful request for rate limiting
      this.recordRequest();
      
      return {
        content: result.choices[0]?.message?.content || '',
        usage: result.usage,
        model: result.model,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old requests
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      timestamp => timestamp > oneMinuteAgo
    );
    
    return this.rateLimiter.requests.length < this.rateLimiter.maxRequestsPerMinute;
  }

  recordRequest() {
    this.rateLimiter.requests.push(Date.now());
  }

  async generateCode(data) {
    const { language, framework, description, context } = data;
    
    const prompt = `Generate ${language}${framework ? ` (${framework})` : ''} code for: ${description}

Context: ${context || 'None provided'}

Requirements:
- Write clean, production-ready code
- Include proper error handling
- Add helpful comments
- Follow best practices for ${language}${framework ? ` and ${framework}` : ''}
- Make the code modular and reusable

Please provide only the code without additional explanation.`;

    return await this.processAIRequest({
      ...data,
      prompt
    });
  }

  async explainRegex(data) {
    const { regex, flags, context } = data;
    
    const prompt = `Explain this regular expression in plain English: /${regex}/${flags || ''}

Context: ${context || 'None provided'}

Please provide:
1. A clear, step-by-step explanation of what this regex does
2. Break down each part of the pattern
3. Explain any special characters or groups
4. Provide examples of what it would match
5. Mention any potential issues or edge cases

Keep the explanation beginner-friendly but thorough.`;

    return await this.processAIRequest({
      ...data,
      prompt
    });
  }

  async debugCode(data) {
    const { code, error, language, context } = data;
    
    const prompt = `Debug this ${language} code that's producing an error:

Code:
\`\`\`${language}
${code}
\`\`\`

Error: ${error}

Context: ${context || 'None provided'}

Please:
1. Identify the root cause of the error
2. Explain why it's happening
3. Provide a corrected version of the code
4. Suggest best practices to avoid similar issues
5. If applicable, provide alternative approaches

Format your response with clear sections for explanation and corrected code.`;

    return await this.processAIRequest({
      ...data,
      prompt
    });
  }

  async planArchitecture(data) {
    const { projectType, requirements, constraints, preferences } = data;
    
    const prompt = `Plan the architecture for a ${projectType} project:

Requirements:
${requirements}

Constraints:
${constraints || 'None specified'}

Preferences:
${preferences || 'None specified'}

Please provide:
1. High-level architecture overview
2. Recommended technology stack
3. Project structure and organization
4. Key components and their responsibilities
5. Data flow and integration points
6. Scalability and performance considerations
7. Security considerations
8. Development and deployment strategy

Structure your response with clear sections and be specific about implementation details.`;

    return await this.processAIRequest({
      ...data,
      prompt
    });
  }

  async refactorCode(data) {
    const { code, language, goals, constraints } = data;
    
    const prompt = `Refactor this ${language} code to improve it:

Current Code:
\`\`\`${language}
${code}
\`\`\`

Goals: ${goals || 'Improve readability, performance, and maintainability'}
Constraints: ${constraints || 'None specified'}

Please:
1. Identify areas for improvement
2. Provide refactored code with modern best practices
3. Explain the changes made and why
4. Highlight performance improvements
5. Ensure backward compatibility where possible
6. Add proper documentation/comments

Focus on clean code principles, SOLID principles, and modern ${language} features.`;

    return await this.processAIRequest({
      ...data,
      prompt
    });
  }

  setRateLimit(requestsPerMinute) {
    this.rateLimiter.maxRequestsPerMinute = Math.max(1, Math.min(100, requestsPerMinute));
  }

  getRateLimitStatus() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.rateLimiter.requests.filter(
      timestamp => timestamp > oneMinuteAgo
    ).length;
    
    return {
      requestsInLastMinute: recentRequests,
      maxRequestsPerMinute: this.rateLimiter.maxRequestsPerMinute,
      remainingRequests: Math.max(0, this.rateLimiter.maxRequestsPerMinute - recentRequests),
      resetTime: Math.max(...this.rateLimiter.requests.filter(t => t > oneMinuteAgo)) + 60000
    };
  }
}

const processor = new AIProcessor();

self.onmessage = async function(event) {
  const { id, type, data } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'generate-code':
        result = await processor.generateCode(data);
        break;
      case 'explain-regex':
        result = await processor.explainRegex(data);
        break;
      case 'debug-code':
        result = await processor.debugCode(data);
        break;
      case 'plan-architecture':
        result = await processor.planArchitecture(data);
        break;
      case 'refactor-code':
        result = await processor.refactorCode(data);
        break;
      case 'set-rate-limit':
        processor.setRateLimit(data.requestsPerMinute);
        result = { success: true };
        break;
      case 'get-rate-limit-status':
        result = processor.getRateLimitStatus();
        break;
      default:
        throw new Error(`Unknown AI operation type: ${type}`);
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