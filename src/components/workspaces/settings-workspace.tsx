import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AISettingsPanel } from "@/components/ai"
import { Settings, Palette, Keyboard, Database, Info, Bot } from "lucide-react"

export function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState("ai")

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your DevKit Flow experience
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Behavior
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-6">
            <AISettingsPanel />
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Appearance settings panel is under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Behavior Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Behavior settings panel is under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keyboard shortcuts panel is under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Data management panel is under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About DevKit Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Version</h3>
                    <p className="text-sm text-muted-foreground">1.0.0-beta</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      A comprehensive developer productivity workspace with visual planning tools and AI assistance.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Features</h3>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>DevFlow Studio - Visual session planning</li>
                      <li>Regexr++ - Visual regex builder</li>
                      <li>Claude MCP AI Integration</li>
                      <li>Offline-first architecture</li>
                      <li>Export and sharing capabilities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}