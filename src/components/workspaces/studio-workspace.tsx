import { useCallback, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSessions, useUIState, useNodes } from "@/hooks/use-app-store"
import { generateId } from "@/lib/utils"
import { FlowCanvas, NodePalette } from "@/components/canvas"
import { ReactFlowProvider } from 'reactflow'
import { CommitGenerator } from "@/components/commit"
import { ProgressDashboard } from "@/components/analytics"
import { TimelineManager } from "@/components/timeline"
import { AICodeAssistant, AIContextPanel, EnhancedCodeAssistant } from "@/components/ai"
import { ComponentWireframeWorkspace } from "@/components/wireframe/ComponentWireframeWorkspace"
import type { DevFlowSession } from "@/types"
import { 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Grid3X3,
  Play,
  Download,
  Upload,
  Settings,
  BarChart3,
  Clock,
  Bot,
  Component,
  Workflow
} from "lucide-react"

export function StudioWorkspace() {
  const { 
    sessions, 
    currentSessionId, 
    addSession
  } = useSessions()
  
  const {
    propertiesPanelOpen,
    togglePropertiesPanel
  } = useUIState()

  const {
    addCodeSnippetToNode
  } = useNodes()
  
  const [canvasState, setCanvasState] = useState({
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    gridVisible: true
  })
  
  const [showCommitGenerator, setShowCommitGenerator] = useState(false)
  const [selectedNodeId] = useState<string | null>(null)
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'flow' | 'wireframes'>('flow')
  const [componentWireframes, setComponentWireframes] = useState<any[]>([])

  const currentSession = sessions.find(s => s.id === currentSessionId)
  const selectedNode = currentSession?.nodes.find(n => n.id === selectedNodeId)

  const createNewSession = useCallback(() => {
    console.log('Creating new session...')
    const newSession: DevFlowSession = {
      id: generateId(),
      name: `New Session ${sessions.length + 1}`,
      description: 'A sample development session with example nodes',
      nodes: [
        {
          id: 'node-1',
          type: 'task',
          title: 'Setup Project Structure',
          description: 'Initialize the project with proper folder structure and configuration',
          position: { x: 100, y: 100 },
          size: { width: 256, height: 200 },
          status: 'completed',
          content: {
            todos: [
              { id: 'todo-1', text: 'Create src folder', completed: true },
              { id: 'todo-2', text: 'Setup package.json', completed: true },
              { id: 'todo-3', text: 'Configure TypeScript', completed: true }
            ],
            codeSnippets: [],
            references: [],
            comments: []
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 4,
            tags: ['setup', 'infrastructure']
          }
        },
        {
          id: 'node-2',
          type: 'code',
          title: 'API Client Implementation',
          description: 'Create reusable API client with error handling',
          position: { x: 400, y: 100 },
          size: { width: 256, height: 200 },
          status: 'active',
          content: {
            todos: [
              { id: 'todo-4', text: 'Create base API class', completed: true },
              { id: 'todo-5', text: 'Add error handling', completed: false },
              { id: 'todo-6', text: 'Write unit tests', completed: false }
            ],
            codeSnippets: [
              {
                id: 'code-1',
                title: 'API Client Base',
                language: 'typescript',
                code: 'class ApiClient {\n  constructor(private baseUrl: string) {}\n  \n  async get<T>(endpoint: string): Promise<T> {\n    // Implementation\n  }\n}',
                isTemplate: false,
                tags: ['api', 'client']
              }
            ],
            references: [],
            comments: []
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 3,
            tags: ['api', 'core']
          }
        },
        {
          id: 'node-3',
          type: 'reference',
          title: 'API Documentation',
          description: 'External API documentation and examples',
          position: { x: 700, y: 100 },
          size: { width: 256, height: 200 },
          status: 'idle',
          content: {
            todos: [],
            codeSnippets: [],
            references: [
              {
                id: 'ref-1',
                title: 'REST API Best Practices',
                url: 'https://restfulapi.net/',
                type: 'documentation',
                importance: 'high'
              }
            ],
            comments: []
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 2,
            tags: ['documentation', 'reference']
          }
        },
        {
          id: 'node-4',
          type: 'comment',
          title: 'Architecture Notes',
          description: 'Important decisions and considerations',
          position: { x: 250, y: 350 },
          size: { width: 256, height: 200 },
          status: 'idle',
          content: {
            todos: [],
            codeSnippets: [],
            references: [],
            comments: [
              {
                id: 'comment-1',
                text: 'Consider using React Query for caching and state management',
                createdAt: new Date()
              }
            ]
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            priority: 1,
            tags: ['architecture', 'notes']
          }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'node-1',
          targetNodeId: 'node-2',
          type: 'dependency',
          label: 'enables',
          style: {
            strokeColor: '#3b82f6',
            strokeWidth: 2
          }
        },
        {
          id: 'conn-2',
          sourceNodeId: 'node-3',
          targetNodeId: 'node-2',
          type: 'reference',
          label: 'informs',
          style: {
            strokeColor: '#8b5cf6',
            strokeWidth: 1.5,
            strokeDasharray: '2,2'
          }
        }
      ],
      settings: {
        gridSize: 20,
        snapToGrid: true,
        autoLayout: false,
        theme: 'system'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        tags: ['sample', 'demo']
      },
      timeline: []
    }
    
    console.log('New session created:', newSession)
    addSession(newSession)
  }, [sessions.length, addSession])

  const handleImportSession = useCallback(() => {
    console.log('Import session clicked')
    // TODO: Implement import functionality
  }, [])

  const handleZoomIn = () => {
    setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }))
  }

  const handleZoomOut = () => {
    setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.1) }))
  }

  const handleFitToScreen = () => {
    setCanvasState(prev => ({ ...prev, zoom: 1, panOffset: { x: 0, y: 0 } }))
  }

  const toggleGrid = () => {
    setCanvasState(prev => ({ ...prev, gridVisible: !prev.gridVisible }))
  }

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="welcome-title">Welcome to DevFlow Studio</CardTitle>
          </CardHeader>
          <CardContent className="welcome-actions">
            <p className="welcome-description">
              Create your first coding session to start planning your development workflow visually.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={createNewSession} 
                className="btn btn-primary w-full h-12 text-base"
                variant="default"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Session
              </Button>
              <Button 
                variant="outline" 
                className="btn btn-outline w-full h-12 text-base"
                onClick={handleImportSession}
              >
                <Upload className="h-5 w-5 mr-2" />
                Import Session
              </Button>
            </div>
            <div className="text-center">
              <p className="welcome-footer">
                Start building your development workflow with visual nodes and connections.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Workspace Tabs */}
      <div className="h-12 border-b bg-muted/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Tabs value={activeWorkspaceTab} onValueChange={(value: any) => setActiveWorkspaceTab(value)}>
            <TabsList className="h-8">
              <TabsTrigger value="flow" className="text-xs h-6">
                <Workflow className="h-3 w-3 mr-1" />
                Flow Canvas
              </TabsTrigger>
              <TabsTrigger value="wireframes" className="text-xs h-6">
                <Component className="h-3 w-3 mr-1" />
                Component Wireframes
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeWorkspaceTab === 'flow' && (
            <>
              <div className="h-4 w-px bg-border mx-2" />
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[60px] text-center">
                {Math.round(canvasState.zoom * 100)}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleFitToScreen}>
                <Maximize className="h-4 w-4" />
              </Button>
              <Button 
                variant={canvasState.gridVisible ? "default" : "outline"} 
                size="sm" 
                onClick={toggleGrid}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <EnhancedCodeAssistant 
            node={selectedNode}
            onCodeGenerated={(code, language, title) => {
              if (selectedNode && currentSession) {
                const newSnippet = {
                  id: generateId(),
                  title: title || 'AI Generated Code',
                  language,
                  code,
                  description: 'Generated by AI assistant',
                  isTemplate: false,
                  tags: ['ai-generated']
                }
                addCodeSnippetToNode(currentSession.id, selectedNode.id, newSnippet)
              }
            }}
            onSuggestionApplied={(suggestion) => {
              console.log('AI suggestion applied:', suggestion)
            }}
            className="h-8"
          />
          <AICodeAssistant 
            className="h-8"
          />
          <Dialog open={showCommitGenerator} onOpenChange={setShowCommitGenerator}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-1" />
                Generate Commit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Smart Git Commit Generator</DialogTitle>
                <DialogDescription>
                  Generate conventional commit messages based on your completed tasks and changes.
                </DialogDescription>
              </DialogHeader>
              <CommitGenerator />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button 
            variant={propertiesPanelOpen ? "default" : "outline"} 
            size="sm"
            onClick={togglePropertiesPanel}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex">
        {activeWorkspaceTab === 'flow' ? (
          <>
            {/* Node Palette */}
            <div className="w-80 border-r bg-muted/30 p-4">
              <NodePalette />
            </div>
            
            <ReactFlowProvider>
              <FlowCanvas sessionId={currentSession.id} />
            </ReactFlowProvider>
          </>
        ) : (
          <ComponentWireframeWorkspace
            sessionId={currentSession.id}
            components={componentWireframes}
            onComponentsChange={setComponentWireframes}
          />
        )}

        {/* Properties Panel */}
        {propertiesPanelOpen && (
          <div className="w-96 border-l bg-muted/50 overflow-y-auto">
            <div className="p-4">
              <Tabs defaultValue="properties" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="properties" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Properties
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    AI
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="properties" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Session Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs font-medium">Name</label>
                        <div className="text-sm">{currentSession.name}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Description</label>
                        <div className="text-sm text-muted-foreground">
                          {currentSession.description || 'No description'}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Progress</label>
                        <div className="text-sm">
                          {currentSession.nodes.filter(n => n.status === 'completed').length} / {currentSession.nodes.length} nodes completed
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Created</label>
                        <div className="text-sm text-muted-foreground">
                          {new Date(currentSession.metadata.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Last Modified</label>
                        <div className="text-sm text-muted-foreground">
                          {new Date(currentSession.metadata.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="ai" className="mt-4">
                  <AIContextPanel 
                    selectedNode={selectedNode}
                    onCodeGenerated={(code, language, title) => {
                      console.log('AI generated code:', { code, language, title })
                    }}
                    onSuggestionApplied={(suggestion) => {
                      console.log('AI suggestion applied:', suggestion)
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-4">
                  <ProgressDashboard 
                    sessionId={currentSession.id}
                    className="space-y-4"
                  />
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-4">
                  <TimelineManager 
                    sessionId={currentSession.id}
                    nodes={currentSession.nodes}
                    className="h-[500px]"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}