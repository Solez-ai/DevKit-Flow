import React from 'react';
import { Plus, Save, Settings, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IntelligentHelpProvider } from './intelligent-help-provider';
import { WithSmartTooltip } from './smart-tooltip-system';

/**
 * Example showing how to integrate the AI-powered help system into existing components
 * 
 * This demonstrates:
 * 1. Wrapping your app/component with IntelligentHelpProvider
 * 2. Adding smart tooltips to existing UI elements
 * 3. Providing contextual information for better AI assistance
 */

// Example toolbar component with integrated help
const ExampleToolbar: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      {/* Add Node Button with Smart Tooltip */}
      <WithSmartTooltip
        feature="devflow-studio"
        component="node-creation-toolbar"
        title="Add New Node"
        description="Create a new node in your development workflow. Choose from different node types to organize your project."
        quickTips={[
          "Use Ctrl+N for quick node creation",
          "Right-click canvas for context menu",
          "Drag from palette for specific types"
        ]}
        keyboardShortcut="Ctrl+N"
        contextualActions={[
          {
            label: "Create Task Node",
            action: () => console.log("Creating task node"),
            icon: <Plus className="h-3 w-3" />
          },
          {
            label: "Create Code Node",
            action: () => console.log("Creating code node"),
            icon: <Code className="h-3 w-3" />
          }
        ]}
      >
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Node
        </Button>
      </WithSmartTooltip>

      {/* Save Button with Smart Tooltip */}
      <WithSmartTooltip
        feature="session-management"
        component="save-session"
        title="Save Session"
        description="Save your current development session with all nodes, connections, and progress."
        quickTips={[
          "Auto-save is enabled by default",
          "Use Ctrl+S for manual save",
          "Sessions are stored locally"
        ]}
        keyboardShortcut="Ctrl+S"
      >
        <Button size="sm" variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </WithSmartTooltip>

      {/* Export Button with Smart Tooltip */}
      <WithSmartTooltip
        feature="export-system"
        component="export-toolbar"
        title="Export Session"
        description="Export your session in various formats including PDF, Markdown, and JSON."
        quickTips={[
          "PDF exports include visual diagrams",
          "Markdown is great for documentation",
          "JSON preserves all data for import"
        ]}
        contextualActions={[
          {
            label: "Quick PDF Export",
            action: () => console.log("Exporting PDF"),
            icon: <FileText className="h-3 w-3" />
          }
        ]}
      >
        <Button size="sm" variant="secondary">
          <FileText className="h-4 w-4 mr-2" />
          Export
        </Button>
      </WithSmartTooltip>

      {/* Settings Button with Smart Tooltip */}
      <WithSmartTooltip
        feature="application-settings"
        component="settings-access"
        title="Application Settings"
        description="Configure DevKit Flow preferences, themes, AI settings, and keyboard shortcuts."
        quickTips={[
          "Customize keyboard shortcuts",
          "Enable/disable AI features",
          "Choose your preferred theme"
        ]}
        keyboardShortcut="Ctrl+,"
      >
        <Button size="sm" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
      </WithSmartTooltip>
    </div>
  );
};

// Example main component showing integration
export const HelpIntegrationExample: React.FC = () => {
  return (
    <IntelligentHelpProvider
      defaultPreferences={{
        showOnHover: false,
        showOnFocus: true,
        autoHideDelay: 5000,
        preferredPosition: 'floating'
      }}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Help System Integration Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This example shows how to integrate the AI-powered help system into your existing components.
              The toolbar below demonstrates smart tooltips with contextual help.
            </p>
            
            {/* Example Toolbar */}
            <div className="border rounded-lg">
              <ExampleToolbar />
              <div className="p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  Hover over or focus on the toolbar buttons to see smart tooltips in action
                </p>
              </div>
            </div>

            {/* Integration Steps */}
            <div className="space-y-4 mt-6">
              <h3 className="font-medium">Integration Steps:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Wrap with IntelligentHelpProvider</h4>
                    <p className="text-xs text-muted-foreground">
                      Add the provider at the root of your component tree or around specific sections
                    </p>
                    <code className="text-xs bg-muted p-1 rounded mt-1 block">
                      {'<IntelligentHelpProvider>...</IntelligentHelpProvider>'}
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Add Smart Tooltips</h4>
                    <p className="text-xs text-muted-foreground">
                      Wrap existing elements with WithSmartTooltip component
                    </p>
                    <code className="text-xs bg-muted p-1 rounded mt-1 block">
                      {'<WithSmartTooltip feature="..." component="...">'}
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Configure Context</h4>
                    <p className="text-xs text-muted-foreground">
                      Provide feature, component, and contextual information for better AI assistance
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Customize Behavior</h4>
                    <p className="text-xs text-muted-foreground">
                      Set user preferences for tooltip behavior, positioning, and AI features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </IntelligentHelpProvider>
  );
};

export default HelpIntegrationExample;