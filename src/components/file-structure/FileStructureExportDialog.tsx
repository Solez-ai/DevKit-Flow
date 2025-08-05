import { useState } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Download, FileText, Terminal, Package, Code } from 'lucide-react'
import type { FileStructureExportOptions } from '../../types'

interface FileStructureExportDialogProps {
  onExport: (options: FileStructureExportOptions) => void
  onClose: () => void
}

export function FileStructureExportDialog({ onExport, onClose }: FileStructureExportDialogProps) {
  const [options, setOptions] = useState<FileStructureExportOptions>({
    format: 'json',
    includeContent: false,
    includeTemplates: false,
    includeMetadata: true,
    targetPlatform: 'unix'
  })

  const formatOptions = [
    {
      value: 'json',
      label: 'JSON',
      description: 'Structured data format for importing into other tools',
      icon: <Code className="w-4 h-4" />
    },
    {
      value: 'markdown',
      label: 'Markdown',
      description: 'Human-readable documentation format',
      icon: <FileText className="w-4 h-4" />
    },
    {
      value: 'bash',
      label: 'Bash Script',
      description: 'Executable script to create the file structure',
      icon: <Terminal className="w-4 h-4" />
    }
  ]

  const handleExport = () => {
    onExport(options)
  }

  const updateOptions = (updates: Partial<FileStructureExportOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export File Structure</DialogTitle>
          <DialogDescription>
            Choose how you want to export your file structure planning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid grid-cols-1 gap-3">
              {formatOptions.map((format) => (
                <Card 
                  key={format.value}
                  className={`cursor-pointer transition-colors ${
                    options.format === format.value 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => updateOptions({ format: format.value as any })}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={options.format === format.value}
                          onChange={() => updateOptions({ format: format.value as any })}
                          className="w-4 h-4"
                        />
                        {format.icon}
                        <CardTitle className="text-sm">{format.label}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {format.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Selection (for bash scripts) */}
          {options.format === 'bash' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Target Platform</Label>
              <Select 
                value={options.targetPlatform} 
                onValueChange={(value) => updateOptions({ targetPlatform: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unix">Unix/Linux/macOS</SelectItem>
                  <SelectItem value="windows">Windows</SelectItem>
                  <SelectItem value="cross-platform">Cross-platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) => 
                    updateOptions({ includeMetadata: checked as boolean })
                  }
                />
                <Label htmlFor="includeMetadata" className="text-sm">
                  Include metadata (creation dates, version info)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeContent"
                  checked={options.includeContent}
                  onCheckedChange={(checked) => 
                    updateOptions({ includeContent: checked as boolean })
                  }
                />
                <Label htmlFor="includeContent" className="text-sm">
                  Include file content templates
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTemplates"
                  checked={options.includeTemplates}
                  onCheckedChange={(checked) => 
                    updateOptions({ includeTemplates: checked as boolean })
                  }
                />
                <Label htmlFor="includeTemplates" className="text-sm">
                  Include file templates and boilerplate code
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}