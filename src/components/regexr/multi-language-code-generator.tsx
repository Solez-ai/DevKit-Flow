import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { 
  Code, 
  Copy, 
  Download, 
  FileText, 
  Sparkles,
  BookOpen
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface GeneratedCode {
  language: string
  framework?: string
  code: string
  explanation: string
  examples: Array<{
    title: string
    code: string
    description: string
  }>
  imports: string[]
}

interface MultiLanguageCodeGeneratorProps {
  pattern: string
  flags: string[]
  patternName?: string
  description?: string
  className?: string
}

export function MultiLanguageCodeGenerator({
  pattern,
  flags = ['g'],
  patternName = 'Custom Pattern',
  description = '',
  className
}: MultiLanguageCodeGeneratorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedFramework, setSelectedFramework] = useState<string>('')
  const [includeTests, setIncludeTests] = useState(true)
  const [includeComments, setIncludeComments] = useState(true)

  // Language configurations
  const languageConfigs = useMemo(() => ({
    javascript: {
      name: 'JavaScript',
      icon: '🟨',
      frameworks: [
        { value: '', label: 'Vanilla JavaScript' },
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'node', label: 'Node.js' }
      ]
    },
    typescript: {
      name: 'TypeScript',
      icon: '🔷',
      frameworks: [
        { value: '', label: 'Vanilla TypeScript' },
        { value: 'react', label: 'React + TypeScript' },
        { value: 'node', label: 'Node.js + TypeScript' }
      ]
    },
    python: {
      name: 'Python',
      icon: '🐍',
      frameworks: [
        { value: '', label: 'Standard Library' },
        { value: 'django', label: 'Django' },
        { value: 'flask', label: 'Flask' }
      ]
    },
    java: {
      name: 'Java',
      icon: '☕',
      frameworks: [
        { value: '', label: 'Standard Library' },
        { value: 'spring', label: 'Spring Boot' }
      ]
    }
  }), [])

  // Generate code based on language and framework
  const generateCode = useCallback((
    lang: string, 
    framework: string, 
    regex: string, 
    regexFlags: string[]
  ): GeneratedCode => {
    const flagsStr = regexFlags.join('')
    const escapedPattern = regex.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

    switch (lang) {
      case 'javascript':
        return generateJavaScriptCode(framework, regex, flagsStr, escapedPattern)
      case 'typescript':
        return generateTypeScriptCode(framework, regex, flagsStr, escapedPattern)
      case 'python':
        return generatePythonCode(framework, regex, flagsStr)
      case 'java':
        return generateJavaCode(framework, regex, flagsStr)
      default:
        return generateJavaScriptCode('', regex, flagsStr, escapedPattern)
    }
  }, [])

  // JavaScript code generation
  const generateJavaScriptCode = (framework: string, regex: string, flags: string, escaped: string): GeneratedCode => {
    let code = ''
    let imports: string[] = []

    if (framework === 'react') {
      imports = ['import React, { useState, useCallback } from \'react\'']
      code = `
// ${patternName} Validation Hook
export const use${patternName.replace(/\s+/g, '')}Validator = () => {
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')

  const validate = useCallback((input) => {
    const pattern = /${escaped}/${flags}
    const isMatch = pattern.test(input)
    
    setIsValid(isMatch)
    setError(isMatch ? '' : 'Invalid format')
    
    return isMatch
  }, [])

  return { validate, isValid, error }
}`
    } else {
      code = `
// ${patternName} Validator
class ${patternName.replace(/\s+/g, '')}Validator {
  constructor() {
    this.pattern = /${escaped}/${flags}
  }
  
  validate(input) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string')
    }
    return this.pattern.test(input)
  }
  
  findMatches(input) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string')
    }
    return Array.from(input.matchAll(this.pattern))
  }
}

// Usage
const validator = new ${patternName.replace(/\s+/g, '')}Validator()
const isValid = validator.validate('test input')`
    }

    return {
      language: 'JavaScript',
      framework: framework || undefined,
      code: code.trim(),
      explanation: `This ${framework || 'JavaScript'} implementation provides a robust ${patternName.toLowerCase()} validator with proper error handling.`,
      examples: [
        {
          title: 'Basic Usage',
          code: `const validator = new ${patternName.replace(/\s+/g, '')}Validator()
const result = validator.validate('test input')`,
          description: 'Simple validation example'
        }
      ],
      imports
    }
  }

  // TypeScript code generation
  const generateTypeScriptCode = (framework: string, regex: string, flags: string, escaped: string): GeneratedCode => {
    let code = `
interface ValidationResult {
  isValid: boolean
  error: string
  matches?: RegExpMatchArray[]
}

class ${patternName.replace(/\s+/g, '')}Validator {
  private readonly pattern: RegExp

  constructor() {
    this.pattern = /${escaped}/${flags}
  }

  validate(input: string): boolean {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string')
    }
    return this.pattern.test(input)
  }

  validateWithDetails(input: string): ValidationResult {
    const matches = Array.from(input.matchAll(this.pattern))
    const isValid = matches.length > 0

    return {
      isValid,
      error: isValid ? '' : 'Invalid format',
      matches
    }
  }
}`

    return {
      language: 'TypeScript',
      framework: framework || undefined,
      code: code.trim(),
      explanation: `This TypeScript implementation provides type-safe ${patternName.toLowerCase()} validation.`,
      examples: [
        {
          title: 'Type-Safe Validation',
          code: `const validator = new ${patternName.replace(/\s+/g, '')}Validator()
const result: ValidationResult = validator.validateWithDetails(input)`,
          description: 'Validation with full type safety'
        }
      ],
      imports: []
    }
  }

  // Python code generation
  const generatePythonCode = (framework: string, regex: string, flags: string): GeneratedCode => {
    let code = `
import re
from typing import List, Optional

class ${patternName.replace(/\s+/g, '')}Validator:
    """Validator for ${patternName.toLowerCase()} patterns"""
    
    def __init__(self):
        self.pattern = re.compile(r'${regex}')
    
    def validate(self, input_str: str) -> bool:
        """Validate if input matches the pattern"""
        if not isinstance(input_str, str):
            raise TypeError("Input must be a string")
        return bool(self.pattern.match(input_str))
    
    def find_matches(self, input_str: str) -> List[re.Match]:
        """Find all matches in the input string"""
        if not isinstance(input_str, str):
            raise TypeError("Input must be a string")
        return list(self.pattern.finditer(input_str))

# Usage
validator = ${patternName.replace(/\s+/g, '')}Validator()
is_valid = validator.validate('test input')`

    return {
      language: 'Python',
      framework: framework || undefined,
      code: code.trim(),
      explanation: `This Python implementation provides a comprehensive ${patternName.toLowerCase()} validator with type hints.`,
      examples: [
        {
          title: 'Basic Validation',
          code: `validator = ${patternName.replace(/\s+/g, '')}Validator()
result = validator.validate('test input')`,
          description: 'Simple validation example'
        }
      ],
      imports: ['import re', 'from typing import List, Optional']
    }
  }

  // Java code generation
  const generateJavaCode = (framework: string, regex: string, flags: string): GeneratedCode => {
    let code = `
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.List;
import java.util.ArrayList;

public class ${patternName.replace(/\s+/g, '')}Validator {
    
    private static final Pattern PATTERN = Pattern.compile("${regex}");
    
    public boolean validate(String input) {
        if (input == null) {
            throw new IllegalArgumentException("Input cannot be null");
        }
        return PATTERN.matcher(input).matches();
    }
    
    public List<String> findMatches(String input) {
        if (input == null) {
            throw new IllegalArgumentException("Input cannot be null");
        }
        
        List<String> matches = new ArrayList<>();
        Matcher matcher = PATTERN.matcher(input);
        
        while (matcher.find()) {
            matches.add(matcher.group());
        }
        
        return matches;
    }
}

// Usage
${patternName.replace(/\s+/g, '')}Validator validator = new ${patternName.replace(/\s+/g, '')}Validator();
boolean isValid = validator.validate("test input");`

    return {
      language: 'Java',
      framework: framework || undefined,
      code: code.trim(),
      explanation: `This Java implementation provides a robust ${patternName.toLowerCase()} validator with proper exception handling.`,
      examples: [
        {
          title: 'Basic Usage',
          code: `${patternName.replace(/\s+/g, '')}Validator validator = new ${patternName.replace(/\s+/g, '')}Validator();
boolean result = validator.validate("test input");`,
          description: 'Simple validation example'
        }
      ],
      imports: ['import java.util.regex.Pattern', 'import java.util.regex.Matcher']
    }
  }

  // Generate the current code
  const generatedCode = useMemo(() => {
    if (!pattern) return null
    return generateCode(selectedLanguage, selectedFramework, pattern, flags)
  }, [selectedLanguage, selectedFramework, pattern, flags, generateCode])

  // Copy code to clipboard
  const copyCode = useCallback(() => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code)
    }
  }, [generatedCode])

  // Download code as file
  const downloadCode = useCallback(() => {
    if (!generatedCode) return

    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java'
    }

    const extension = extensions[selectedLanguage] || 'txt'
    const filename = `${patternName.replace(/\s+/g, '').toLowerCase()}-validator.${extension}`
    
    const content = generatedCode.imports.length > 0 
      ? `${generatedCode.imports.join('\n')}\n\n${generatedCode.code}`
      : generatedCode.code

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generatedCode, selectedLanguage, patternName])

  const currentLanguageConfig = languageConfigs[selectedLanguage as keyof typeof languageConfigs]

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Multi-Language Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language and Framework Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language-select">Programming Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageConfigs).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="framework-select">Framework (Optional)</Label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {currentLanguageConfig?.frameworks.map((framework) => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generation Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-tests"
                checked={includeTests}
                onCheckedChange={setIncludeTests}
              />
              <Label htmlFor="include-tests" className="text-sm">Include Tests</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-comments"
                checked={includeComments}
                onCheckedChange={setIncludeComments}
              />
              <Label htmlFor="include-comments" className="text-sm">Include Comments</Label>
            </div>
          </div>

          {/* Generated Code Display */}
          {generatedCode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {generatedCode.language}
                    {generatedCode.framework && ` + ${generatedCode.framework}`}
                  </Badge>
                  <Badge variant="secondary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generated
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={copyCode} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadCode} size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="code" className="w-full">
                <TabsList>
                  <TabsTrigger value="code">Generated Code</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="explanation">Explanation</TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="space-y-4">
                  {generatedCode.imports.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Imports</Label>
                      <div className="font-mono text-sm bg-muted p-3 rounded border">
                        {generatedCode.imports.join('\n')}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Implementation</Label>
                    <ScrollArea className="h-[500px]">
                      <pre className="font-mono text-sm bg-muted p-4 rounded border whitespace-pre-wrap">
                        {generatedCode.code}
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="examples" className="space-y-4">
                  {generatedCode.examples.map((example, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{example.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{example.description}</p>
                      </CardHeader>
                      <CardContent>
                        <pre className="font-mono text-sm bg-muted p-3 rounded border whitespace-pre-wrap">
                          {example.code}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="explanation" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Implementation Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {generatedCode.explanation}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!pattern && (
            <div className="text-center text-muted-foreground py-12">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No pattern to generate code for</p>
              <p className="text-sm">Create a regex pattern first to generate code</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}