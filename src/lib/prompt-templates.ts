import type { PromptTemplate } from '@/types'

/**
 * Built-in prompt templates for Claude MCP integration
 */
export const builtInPromptTemplates: PromptTemplate[] = [
  // Code Assistant Templates
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Generate code based on requirements and context',
    category: 'code-assistant',
    prompt: (input: {
      requirements: string
      language?: string
      framework?: string
      existingCode?: string
      style?: string
    }) => {
      let prompt = `Generate ${input.language || 'code'} code for the following requirements:\n\n${input.requirements}`
      
      if (input.framework) {
        prompt += `\n\nFramework: ${input.framework}`
      }
      
      if (input.style) {
        prompt += `\n\nCode style: ${input.style}`
      }
      
      if (input.existingCode) {
        prompt += `\n\nExisting code context:\n\`\`\`\n${input.existingCode}\n\`\`\``
      }
      
      prompt += '\n\nProvide clean, well-commented code with explanations.'
      
      return prompt
    },
    parameters: [
      { name: 'requirements', type: 'string', description: 'Code requirements', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'framework', type: 'string', description: 'Framework or library', required: false },
      { name: 'existingCode', type: 'string', description: 'Existing code context', required: false },
      { name: 'style', type: 'string', description: 'Code style preferences', required: false }
    ]
  },

  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code for improvements and best practices',
    category: 'code-assistant',
    prompt: (input: {
      code: string
      language?: string
      focus?: string
    }) => {
      let prompt = `Review the following ${input.language || ''} code and provide suggestions for improvement:\n\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.focus) {
        prompt += `\n\nFocus on: ${input.focus}`
      }
      
      prompt += '\n\nProvide specific suggestions for:\n- Code quality and readability\n- Performance optimizations\n- Best practices\n- Potential bugs or issues\n- Security considerations'
      
      return prompt
    },
    parameters: [
      { name: 'code', type: 'string', description: 'Code to review', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'focus', type: 'string', description: 'Specific areas to focus on', required: false }
    ]
  },

  {
    id: 'function-documentation',
    name: 'Function Documentation',
    description: 'Generate comprehensive documentation for functions',
    category: 'code-assistant',
    prompt: (input: {
      code: string
      language?: string
      style?: string
    }) => {
      let prompt = `Generate comprehensive documentation for the following ${input.language || ''} function:\n\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.style) {
        prompt += `\n\nDocumentation style: ${input.style}`
      }
      
      prompt += '\n\nInclude:\n- Clear description of what the function does\n- Parameter descriptions with types\n- Return value description\n- Usage examples\n- Any side effects or important notes'
      
      return prompt
    },
    parameters: [
      { name: 'code', type: 'string', description: 'Function code', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'style', type: 'string', description: 'Documentation style (JSDoc, Sphinx, etc.)', required: false }
    ]
  },

  // Regex Generator Templates
  {
    id: 'regex-from-description',
    name: 'Regex from Description',
    description: 'Generate regex pattern from natural language description',
    category: 'regex-generator',
    prompt: (input: {
      description: string
      examples?: string[]
      flags?: string[]
    }) => {
      let prompt = `Create a regular expression pattern for: ${input.description}`
      
      if (input.examples && input.examples.length > 0) {
        prompt += '\n\nExamples that should match:\n' + input.examples.map(ex => `- ${ex}`).join('\n')
      }
      
      if (input.flags && input.flags.length > 0) {
        prompt += `\n\nRequired flags: ${input.flags.join(', ')}`
      }
      
      prompt += '\n\nProvide:\n1. The regex pattern\n2. Explanation of each part\n3. Test cases\n4. Any performance considerations'
      
      return prompt
    },
    parameters: [
      { name: 'description', type: 'string', description: 'Natural language description', required: true },
      { name: 'examples', type: 'array', description: 'Example strings that should match', required: false },
      { name: 'flags', type: 'array', description: 'Required regex flags', required: false }
    ]
  },

  {
    id: 'regex-optimization',
    name: 'Regex Optimization',
    description: 'Optimize regex pattern for better performance',
    category: 'regex-generator',
    prompt: (input: {
      pattern: string
      issues?: string[]
      testCases?: string[]
    }) => {
      let prompt = `Optimize this regular expression pattern for better performance:\n\nPattern: ${input.pattern}`
      
      if (input.issues && input.issues.length > 0) {
        prompt += '\n\nKnown issues:\n' + input.issues.map(issue => `- ${issue}`).join('\n')
      }
      
      if (input.testCases && input.testCases.length > 0) {
        prompt += '\n\nTest cases:\n' + input.testCases.map(test => `- ${test}`).join('\n')
      }
      
      prompt += '\n\nProvide:\n1. Optimized pattern\n2. Explanation of changes\n3. Performance improvements\n4. Potential trade-offs'
      
      return prompt
    },
    parameters: [
      { name: 'pattern', type: 'string', description: 'Regex pattern to optimize', required: true },
      { name: 'issues', type: 'array', description: 'Known performance issues', required: false },
      { name: 'testCases', type: 'array', description: 'Test cases to validate against', required: false }
    ]
  },

  // Debug Helper Templates
  {
    id: 'debug-error',
    name: 'Debug Error',
    description: 'Help debug and fix code errors',
    category: 'debug-helper',
    prompt: (input: {
      error: string
      code: string
      language?: string
      context?: string
    }) => {
      let prompt = `Help debug this ${input.language || ''} error:\n\nError: ${input.error}\n\nCode:\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.context) {
        prompt += `\n\nContext: ${input.context}`
      }
      
      prompt += '\n\nProvide:\n1. Explanation of what caused the error\n2. Step-by-step fix\n3. Corrected code\n4. Prevention tips for similar errors'
      
      return prompt
    },
    parameters: [
      { name: 'error', type: 'string', description: 'Error message', required: true },
      { name: 'code', type: 'string', description: 'Code that caused the error', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'context', type: 'string', description: 'Additional context', required: false }
    ]
  },

  {
    id: 'performance-debug',
    name: 'Performance Debug',
    description: 'Identify and fix performance issues',
    category: 'debug-helper',
    prompt: (input: {
      code: string
      issue: string
      language?: string
      metrics?: string
    }) => {
      let prompt = `Help optimize this ${input.language || ''} code for better performance:\n\nPerformance issue: ${input.issue}\n\nCode:\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.metrics) {
        prompt += `\n\nPerformance metrics: ${input.metrics}`
      }
      
      prompt += '\n\nProvide:\n1. Performance bottleneck analysis\n2. Optimization strategies\n3. Improved code\n4. Expected performance gains'
      
      return prompt
    },
    parameters: [
      { name: 'code', type: 'string', description: 'Code with performance issues', required: true },
      { name: 'issue', type: 'string', description: 'Description of performance issue', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'metrics', type: 'string', description: 'Performance metrics or measurements', required: false }
    ]
  },

  // Architecture Planner Templates
  {
    id: 'system-architecture',
    name: 'System Architecture',
    description: 'Design system architecture and components',
    category: 'architecture-planner',
    prompt: (input: {
      requirements: string
      scale?: string
      constraints?: string[]
      technologies?: string[]
    }) => {
      let prompt = `Design a system architecture for:\n\n${input.requirements}`
      
      if (input.scale) {
        prompt += `\n\nScale: ${input.scale}`
      }
      
      if (input.constraints && input.constraints.length > 0) {
        prompt += '\n\nConstraints:\n' + input.constraints.map(c => `- ${c}`).join('\n')
      }
      
      if (input.technologies && input.technologies.length > 0) {
        prompt += '\n\nPreferred technologies:\n' + input.technologies.map(t => `- ${t}`).join('\n')
      }
      
      prompt += '\n\nProvide:\n1. High-level architecture diagram description\n2. Component breakdown\n3. Data flow\n4. Technology recommendations\n5. Scalability considerations'
      
      return prompt
    },
    parameters: [
      { name: 'requirements', type: 'string', description: 'System requirements', required: true },
      { name: 'scale', type: 'string', description: 'Expected scale (users, data, etc.)', required: false },
      { name: 'constraints', type: 'array', description: 'Technical or business constraints', required: false },
      { name: 'technologies', type: 'array', description: 'Preferred technologies', required: false }
    ]
  },

  {
    id: 'database-design',
    name: 'Database Design',
    description: 'Design database schema and relationships',
    category: 'architecture-planner',
    prompt: (input: {
      entities: string
      relationships?: string
      requirements?: string
      dbType?: string
    }) => {
      let prompt = `Design a database schema for:\n\nEntities: ${input.entities}`
      
      if (input.relationships) {
        prompt += `\n\nRelationships: ${input.relationships}`
      }
      
      if (input.requirements) {
        prompt += `\n\nRequirements: ${input.requirements}`
      }
      
      if (input.dbType) {
        prompt += `\n\nDatabase type: ${input.dbType}`
      }
      
      prompt += '\n\nProvide:\n1. Entity-relationship diagram description\n2. Table schemas with fields and types\n3. Indexes and constraints\n4. Normalization considerations\n5. Query optimization tips'
      
      return prompt
    },
    parameters: [
      { name: 'entities', type: 'string', description: 'Main entities/tables needed', required: true },
      { name: 'relationships', type: 'string', description: 'Relationships between entities', required: false },
      { name: 'requirements', type: 'string', description: 'Specific requirements', required: false },
      { name: 'dbType', type: 'string', description: 'Database type (SQL, NoSQL, etc.)', required: false }
    ]
  },

  // Refactoring Templates
  {
    id: 'modernize-code',
    name: 'Modernize Code',
    description: 'Update code to use modern syntax and patterns',
    category: 'refactorer',
    prompt: (input: {
      code: string
      language: string
      targetVersion?: string
      patterns?: string[]
    }) => {
      let prompt = `Modernize this ${input.language} code to use current best practices and syntax:\n\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.targetVersion) {
        prompt += `\n\nTarget version: ${input.targetVersion}`
      }
      
      if (input.patterns && input.patterns.length > 0) {
        prompt += '\n\nFocus on these patterns:\n' + input.patterns.map(p => `- ${p}`).join('\n')
      }
      
      prompt += '\n\nProvide:\n1. Modernized code\n2. Explanation of changes\n3. Benefits of the updates\n4. Migration considerations'
      
      return prompt
    },
    parameters: [
      { name: 'code', type: 'string', description: 'Code to modernize', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: true },
      { name: 'targetVersion', type: 'string', description: 'Target language/framework version', required: false },
      { name: 'patterns', type: 'array', description: 'Specific patterns to focus on', required: false }
    ]
  },

  {
    id: 'extract-functions',
    name: 'Extract Functions',
    description: 'Refactor code by extracting reusable functions',
    category: 'refactorer',
    prompt: (input: {
      code: string
      language?: string
      criteria?: string
    }) => {
      let prompt = `Refactor this ${input.language || ''} code by extracting reusable functions:\n\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.criteria) {
        prompt += `\n\nExtraction criteria: ${input.criteria}`
      }
      
      prompt += '\n\nProvide:\n1. Refactored code with extracted functions\n2. Explanation of extraction decisions\n3. Function naming rationale\n4. Benefits of the refactoring'
      
      return prompt
    },
    parameters: [
      { name: 'code', type: 'string', description: 'Code to refactor', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'criteria', type: 'string', description: 'Criteria for function extraction', required: false }
    ]
  },

  // Enhanced Architecture Templates
  {
    id: 'component-structure',
    name: 'Component Structure',
    description: 'Suggest component structure for a feature',
    category: 'architecture-planner',
    prompt: (input: {
      featureDescription: string
      framework?: string
      existingComponents?: string[]
      designPatterns?: string[]
    }) => {
      let prompt = `Design a component structure for this feature:\n\n${input.featureDescription}`
      
      if (input.framework) {
        prompt += `\n\nFramework: ${input.framework}`
      }
      
      if (input.existingComponents && input.existingComponents.length > 0) {
        prompt += '\n\nExisting components:\n' + input.existingComponents.map(c => `- ${c}`).join('\n')
      }
      
      if (input.designPatterns && input.designPatterns.length > 0) {
        prompt += '\n\nPreferred design patterns:\n' + input.designPatterns.map(p => `- ${p}`).join('\n')
      }
      
      prompt += '\n\nProvide:\n1. Component hierarchy and structure\n2. Props and state management\n3. Component responsibilities\n4. Reusability considerations\n5. Testing strategy'
      
      return prompt
    },
    parameters: [
      { name: 'featureDescription', type: 'string', description: 'Feature description', required: true },
      { name: 'framework', type: 'string', description: 'Frontend framework', required: false },
      { name: 'existingComponents', type: 'array', description: 'Existing components to consider', required: false },
      { name: 'designPatterns', type: 'array', description: 'Preferred design patterns', required: false }
    ]
  },

  {
    id: 'project-scaffolding',
    name: 'Project Scaffolding',
    description: 'Generate project scaffolding suggestions',
    category: 'architecture-planner',
    prompt: (input: {
      projectType: string
      requirements?: string[]
      technologies?: string[]
      scale?: string
    }) => {
      let prompt = `Generate project scaffolding for: ${input.projectType}`
      
      if (input.requirements && input.requirements.length > 0) {
        prompt += '\n\nRequirements:\n' + input.requirements.map(r => `- ${r}`).join('\n')
      }
      
      if (input.technologies && input.technologies.length > 0) {
        prompt += '\n\nTechnologies:\n' + input.technologies.map(t => `- ${t}`).join('\n')
      }
      
      if (input.scale) {
        prompt += `\n\nProject scale: ${input.scale}`
      }
      
      prompt += '\n\nProvide:\n1. Folder structure\n2. Configuration files\n3. Package dependencies\n4. Build scripts\n5. Development workflow setup'
      
      return prompt
    },
    parameters: [
      { name: 'projectType', type: 'string', description: 'Type of project', required: true },
      { name: 'requirements', type: 'array', description: 'Project requirements', required: false },
      { name: 'technologies', type: 'array', description: 'Technologies to use', required: false },
      { name: 'scale', type: 'string', description: 'Project scale', required: false }
    ]
  },

  // Code Analysis Templates
  {
    id: 'complexity-analysis',
    name: 'Complexity Analysis',
    description: 'Analyze code complexity and suggest improvements',
    category: 'code-assistant',
    prompt: (input: {
      code: string
      language?: string
      metrics?: string[]
    }) => {
      let prompt = `Analyze the complexity of this ${input.language || ''} code:\n\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.metrics && input.metrics.length > 0) {
        prompt += '\n\nFocus on these metrics:\n' + input.metrics.map(m => `- ${m}`).join('\n')
      }
      
      prompt += '\n\nProvide:\n1. Complexity analysis (cyclomatic, cognitive, etc.)\n2. Potential issues and code smells\n3. Refactoring suggestions\n4. Performance implications\n5. Maintainability recommendations'
      
      return prompt
    },
    parameters: [
      { name: 'code', type: 'string', description: 'Code to analyze', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'metrics', type: 'array', description: 'Specific metrics to analyze', required: false }
    ]
  },

  {
    id: 'unit-test-generation',
    name: 'Unit Test Generation',
    description: 'Generate comprehensive unit tests for code',
    category: 'code-assistant',
    prompt: (input: {
      code: string
      language?: string
      testFramework?: string
      coverage?: string
    }) => {
      let prompt = `Generate comprehensive unit tests for this ${input.language || ''} code:\n\n\`\`\`\n${input.code}\n\`\`\``
      
      if (input.testFramework) {
        prompt += `\n\nTest framework: ${input.testFramework}`
      }
      
      if (input.coverage) {
        prompt += `\n\nTarget coverage: ${input.coverage}`
      }
      
      prompt += '\n\nProvide:\n1. Complete test suite with multiple test cases\n2. Edge case testing\n3. Mock setup if needed\n4. Test descriptions and assertions\n5. Coverage analysis'
      
      return prompt
    },
    parameters: [
      { name: 'code', type: 'string', description: 'Code to test', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
      { name: 'testFramework', type: 'string', description: 'Testing framework', required: false },
      { name: 'coverage', type: 'string', description: 'Target test coverage', required: false }
    ]
  }
]

/**
 * Get prompt template by ID
 */
export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return builtInPromptTemplates.find(template => template.id === id)
}

/**
 * Get prompt templates by category
 */
export function getPromptTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return builtInPromptTemplates.filter(template => template.category === category)
}

/**
 * Get all available categories
 */
export function getPromptCategories(): PromptTemplate['category'][] {
  const categories = new Set(builtInPromptTemplates.map(t => t.category))
  return Array.from(categories)
}