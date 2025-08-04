import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  FolderTree, 
  Download, 
  FileText, 
  Code, 
  Settings,
  Lightbulb
} from 'lucide-react'
import { FileStructurePlanner } from './FileStructurePlanner'
import { useFileStructure } from '../../hooks/use-file-structure'
import { createFileStructureTree } from '../../lib/file-structure-utils'

export function FileStructureDemo() {
  // Create a sample project structure
  const sampleTree = createFileStructureTree(
    'React TypeScript Project',
    'A modern React application with TypeScript, Tailwind CSS, and testing setup'
  )

  // Add some sample files and folders
  sampleTree.rootNodes = [
    {
      id: '1',
      name: 'src',
      type: 'folder',
      path: 'src',
      icon: '📁',
      children: ['2', '3', '4', '5']
    },
    {
      id: '2',
      name: 'components',
      type: 'folder',
      path: 'src/components',
      parent: '1',
      icon: '📁',
      children: ['6', '7']
    },
    {
      id: '3',
      name: 'hooks',
      type: 'folder',
      path: 'src/hooks',
      parent: '1',
      icon: '📁',
      children: ['8']
    },
    {
      id: '4',
      name: 'App.tsx',
      type: 'file',
      path: 'src/App.tsx',
      parent: '1',
      fileType: 'tsx',
      icon: '⚛️'
    },
    {
      id: '5',
      name: 'main.tsx',
      type: 'file',
      path: 'src/main.tsx',
      parent: '1',
      fileType: 'tsx',
      icon: '⚛️'
    },
    {
      id: '6',
      name: 'Button.tsx',
      type: 'file',
      path: 'src/components/Button.tsx',
      parent: '2',
      fileType: 'tsx',
      icon: '⚛️'
    },
    {
      id: '7',
      name: 'Modal.tsx',
      type: 'file',
      path: 'src/components/Modal.tsx',
      parent: '2',
      fileType: 'tsx',
      icon: '⚛️'
    },
    {
      id: '8',
      name: 'useLocalStorage.ts',
      type: 'file',
      path: 'src/hooks/useLocalStorage.ts',
      parent: '3',
      fileType: 'ts',
      icon: '📘'
    },
    {
      id: '9',
      name: 'package.json',
      type: 'file',
      path: 'package.json',
      fileType: 'json',
      icon: '⚙️'
    },
    {
      id: '10',
      name: 'README.md',
      type: 'file',
      path: 'README.md',
      fileType: 'md',
      icon: '📝'
    },
    {
      id: '11',
      name: 'tailwind.config.js',
      type: 'file',
      path: 'tailwind.config.js',
      fileType: 'js',
      icon: '📄'
    }
  ]

  const fileStructure = useFileStructure({ 
    initialTree: sampleTree,
    onSave: (tree) => {
      console.log('Saving file structure:', tree)
      // Here you would typically save to your backend or local storage
    }
  })

  const features = [
    {
      icon: <FolderTree className="w-5 h-5" />,
      title: 'Visual File Tree Builder',
      description: 'Drag and drop interface for organizing project structure'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'File Type Recognition',
      description: 'Automatic icons and validation based on file extensions'
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: 'Path Validation',
      description: 'Real-time validation with suggestions and error detection'
    },
    {
      icon: <Download className="w-5 h-5" />,
      title: 'Multiple Export Formats',
      description: 'Export as JSON, Markdown, Bash scripts, or ZIP archives'
    }
  ]

  const stats = fileStructure.getStatistics()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FolderTree className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">File Structure Planning System</h1>
            <p className="text-muted-foreground">
              Visually design and organize your project's file and folder structure
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            {stats.totalNodes} total items
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {stats.fileCount} files
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {stats.folderCount} folders
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            {Object.keys(stats.fileTypes).length} file types
          </Badge>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-md text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-sm">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Demo */}
      <Card className="h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interactive Demo</CardTitle>
              <CardDescription>
                Try the file structure planner with a sample React project
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Lightbulb className="w-4 h-4 mr-2" />
                Tips
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-full p-0">
          <FileStructurePlanner
            initialTree={sampleTree}
            onSave={(tree) => {
              console.log('Demo: Saving tree', tree)
            }}
            className="h-full"
          />
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Usage Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Getting Started</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use the "File" and "Folder" buttons to add new items</li>
                <li>• Click on any item name to rename it</li>
                <li>• Drag items to reorder or reorganize</li>
                <li>• Use the search bar to quickly find items</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Advanced Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Export your structure as executable bash scripts</li>
                <li>• Generate markdown documentation automatically</li>
                <li>• Validate paths and get naming suggestions</li>
                <li>• Track file types and project statistics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}