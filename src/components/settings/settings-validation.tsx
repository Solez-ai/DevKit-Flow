import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import type { ValidationRule, SettingItem } from '@/types/settings'

interface ValidationResult {
  isValid: boolean
  message?: string
  severity: 'error' | 'warning' | 'info'
}

export const validateSetting = (value: any, validation?: ValidationRule): ValidationResult => {
  if (!validation) {
    return { isValid: true, severity: 'info' }
  }

  // Required validation
  if (validation.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      message: 'This field is required',
      severity: 'error'
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return {
        isValid: false,
        message: `Value must be at least ${validation.min}`,
        severity: 'error'
      }
    }
    
    if (validation.max !== undefined && value > validation.max) {
      return {
        isValid: false,
        message: `Value must be at most ${validation.max}`,
        severity: 'error'
      }
    }
  }

  // String pattern validation
  if (typeof value === 'string' && validation.pattern) {
    const regex = new RegExp(validation.pattern)
    if (!regex.test(value)) {
      return {
        isValid: false,
        message: 'Value does not match the required format',
        severity: 'error'
      }
    }
  }

  // Custom validation
  if (validation.custom) {
    const result = validation.custom(value)
    if (typeof result === 'string') {
      return {
        isValid: false,
        message: result,
        severity: 'error'
      }
    }
    if (!result) {
      return {
        isValid: false,
        message: 'Invalid value',
        severity: 'error'
      }
    }
  }

  return { isValid: true, severity: 'info' }
}

interface SettingValidationProps {
  setting: SettingItem
  value: any
}

export const SettingValidation: React.FC<SettingValidationProps> = ({ setting, value }) => {
  const validation = validateSetting(value, setting.validation)

  if (validation.isValid && !validation.message) {
    return null
  }

  const getIcon = () => {
    switch (validation.severity) {
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getVariant = () => {
    switch (validation.severity) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Alert variant={getVariant() as any} className="mt-2">
      {getIcon()}
      <AlertDescription>{validation.message}</AlertDescription>
    </Alert>
  )
}

interface SettingsValidationSummaryProps {
  settings: SettingItem[]
  values: Record<string, any>
}

export const SettingsValidationSummary: React.FC<SettingsValidationSummaryProps> = ({ 
  settings, 
  values 
}) => {
  const validationResults = settings.map(setting => ({
    setting,
    validation: validateSetting(values[setting.key], setting.validation)
  }))

  const errors = validationResults.filter(r => !r.validation.isValid)
  const warnings = validationResults.filter(r => 
    r.validation.isValid && r.validation.severity === 'warning'
  )

  if (errors.length === 0 && warnings.length === 0) {
    return (
      <Alert>
        <CheckCircle className="w-4 h-4" />
        <AlertDescription>All settings are valid</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">
              {errors.length} setting{errors.length > 1 ? 's' : ''} need{errors.length === 1 ? 's' : ''} attention:
            </div>
            <ul className="space-y-1">
              {errors.map(({ setting, validation }) => (
                <li key={setting.key} className="text-sm">
                  <strong>{setting.label}:</strong> {validation.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="font-medium mb-2">
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}:
            </div>
            <ul className="space-y-1">
              {warnings.map(({ setting, validation }) => (
                <li key={setting.key} className="text-sm">
                  <strong>{setting.label}:</strong> {validation.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Validation rules for common settings
export const commonValidationRules = {
  apiKey: {
    required: false,
    pattern: '^[a-zA-Z0-9_-]+$',
    custom: (value: string) => {
      if (value && value.length < 10) {
        return 'API key seems too short'
      }
      return true
    }
  },
  
  dataRetentionDays: {
    required: true,
    min: 1,
    max: 365,
    custom: (value: number) => {
      if (value > 90) {
        return 'Warning: Long retention periods may use more storage'
      }
      return true
    }
  },
  
  canvasZoomLevel: {
    required: true,
    min: 0.1,
    max: 5.0,
    custom: (value: number) => {
      if (value < 0.5 || value > 2.0) {
        return 'Extreme zoom levels may affect performance'
      }
      return true
    }
  },
  
  sidebarWidth: {
    required: true,
    min: 200,
    max: 600,
    custom: (value: number) => {
      if (value < 250) {
        return 'Very narrow sidebar may hide content'
      }
      if (value > 400) {
        return 'Wide sidebar may reduce workspace area'
      }
      return true
    }
  }
}