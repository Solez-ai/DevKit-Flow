
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react'
import type { PathValidationResult } from '../../types'

interface PathValidationDisplayProps {
  result: PathValidationResult
  className?: string
}

export function PathValidationDisplay({ result, className = '' }: PathValidationDisplayProps) {
  if (result.isValid && result.warnings.length === 0 && result.suggestions.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Path is valid and ready to use.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Errors */}
      {result.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Path validation errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="space-y-1">
              <div className="font-medium">Warnings:</div>
              <ul className="list-disc list-inside space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{warning}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <div className="font-medium">Suggestions:</div>
              <div className="flex flex-wrap gap-1">
                {result.suggestions.map((suggestion, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}