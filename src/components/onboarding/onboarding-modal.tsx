import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Bot, 
  Zap, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check,
  Wifi,
  WifiOff,
  Settings,
  Palette,
  Code,
  FileText
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  canSkip: boolean
  isOptional: boolean
}

export const OnboardingModal: React.FC = () => {
  const { 
    onboarding, 
    updateOnboarding, 
    completeOnboarding,
    settings,
    updateSetting
  } = useSettingsStore()
  
  const [currentStepIndex, setCurrentStepIndex] = useState(onboarding.currentStep)
  const [aiChoice, setAiChoice] = useState<'enabled' | 'disabled' | 'undecided'>(
    onboarding.aiFeatureChoice || 'undecided'
  )

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DevKit Flow',
      description: 'Your comprehensive developer productivity workspace',
      canSkip: false,
      isOptional: false,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Code className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">DevKit Flow</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              A powerful, offline-first workspace that combines visual planning tools with practical development utilities. 
              Let's get you set up in just a few steps.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">DevFlow Studio</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Visual project planning</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Regexr++</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Visual regex builder</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'ai-features',
      title: 'AI-Powered Assistance',
      description: 'Choose whether to enable optional AI features',
      canSkip: true,
      isOptional: true,
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">AI Assistant (Optional)</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              DevKit Flow can work with AI to provide intelligent code suggestions, regex generation, 
              and debugging assistance. All core features work perfectly without AI.
            </p>
          </div>

          <div className="grid gap-4">
            <Card 
              className={cn(
                "cursor-pointer transition-all border-2",
                aiChoice === 'enabled' ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-border"
              )}
              onClick={() => setAiChoice('enabled')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Enable AI Features</CardTitle>
                      <CardDescription>Get intelligent assistance</CardDescription>
                    </div>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2",
                    aiChoice === 'enabled' ? "bg-green-500 border-green-500" : "border-gray-300"
                  )} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Code generation and refactoring suggestions</li>
                  <li>• Intelligent regex pattern creation</li>
                  <li>• Architecture planning assistance</li>
                  <li>• Debugging help and error analysis</li>
                </ul>
                <Badge variant="secondary" className="mt-2">Requires API key</Badge>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all border-2",
                aiChoice === 'disabled' ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-border"
              )}
              onClick={() => setAiChoice('disabled')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Offline-Only Mode</CardTitle>
                      <CardDescription>Full functionality without AI</CardDescription>
                    </div>
                  </div>
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2",
                    aiChoice === 'disabled' ? "bg-blue-500 border-blue-500" : "border-gray-300"
                  )} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete offline functionality</li>
                  <li>• No external API calls</li>
                  <li>• Maximum privacy and security</li>
                  <li>• All core features available</li>
                </ul>
                <Badge variant="secondary" className="mt-2">Recommended for privacy</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Privacy First</p>
                <p className="text-muted-foreground">
                  You can change this setting anytime. All your data stays local regardless of your choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'workspace-tour',
      title: 'Workspace Overview',
      description: 'Learn about the main features',
      canSkip: true,
      isOptional: false,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Two Powerful Workspaces</h3>
            <p className="text-muted-foreground">
              DevKit Flow provides specialized tools for different aspects of development
            </p>
          </div>

          <div className="grid gap-4">
            <Card className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">DevFlow Studio</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Visual project planning and session management with enhanced features:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Interactive node-based project planning</li>
                    <li>• File structure and component wireframing</li>
                    <li>• Timeline and Gantt chart views</li>
                    <li>• Smart git commit generation</li>
                    <li>• Progress analytics and complexity estimation</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Regexr++</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Advanced visual regex builder with comprehensive testing:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Drag-and-drop pattern construction</li>
                    <li>• Real-time testing and validation</li>
                    <li>• Multi-language code generation</li>
                    <li>• Pattern library and documentation</li>
                    <li>• Performance analysis and optimization</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Quick Setup',
      description: 'Configure your basic preferences',
      canSkip: true,
      isOptional: true,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Preferences</h3>
            <p className="text-muted-foreground">
              Set up your basic preferences. You can change these anytime in settings.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Default Workspace</Label>
                <p className="text-sm text-muted-foreground">Which workspace to open by default</p>
              </div>
              <select 
                className="px-3 py-2 border rounded-md bg-background"
                value={settings.defaultWorkspace}
                onChange={(e) => updateSetting('defaultWorkspace', e.target.value)}
              >
                <option value="studio">DevFlow Studio</option>
                <option value="regexr">Regexr++</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
              </div>
              <select 
                className="px-3 py-2 border rounded-md bg-background"
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Auto Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save your work</p>
              </div>
              <Switch 
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Grid Snapping</Label>
                <p className="text-sm text-muted-foreground">Snap nodes to grid in canvas</p>
              </div>
              <Switch 
                checked={settings.gridSnapping}
                onCheckedChange={(checked) => updateSetting('gridSnapping', checked)}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Ready to Go!',
      description: 'You\'re all set up and ready to start',
      canSkip: false,
      isOptional: false,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">You're All Set!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              DevKit Flow is ready to boost your productivity. You can access help and tutorials anytime from the help menu.
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Quick Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
              <li>• Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl+?</kbd> for keyboard shortcuts</li>
              <li>• Use templates to get started quickly</li>
              <li>• All your data is stored locally and private</li>
              <li>• Check the help section for detailed guides</li>
            </ul>
          </div>

          {aiChoice === 'enabled' && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">AI Features Enabled</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Don't forget to configure your API key in Settings → AI Assistant to start using AI features.
              </p>
            </div>
          )}
        </div>
      )
    }
  ]

  const currentStep = steps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      updateOnboarding({ 
        currentStep: nextIndex,
        completedSteps: [...onboarding.completedSteps, currentStep.id]
      })
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      updateOnboarding({ currentStep: currentStepIndex - 1 })
    }
  }

  const handleSkip = () => {
    if (currentStep.canSkip) {
      updateOnboarding({ 
        skippedSteps: [...onboarding.skippedSteps, currentStep.id]
      })
      handleNext()
    }
  }

  const handleComplete = () => {
    // Apply AI choice
    if (aiChoice !== 'undecided') {
      updateSetting('aiEnabled', aiChoice === 'enabled')
      updateOnboarding({ aiFeatureChoice: aiChoice })
    }
    
    completeOnboarding()
  }

  // Update AI choice when it changes
  useEffect(() => {
    updateOnboarding({ aiFeatureChoice: aiChoice })
  }, [aiChoice, updateOnboarding])

  if (!onboarding.isFirstLaunch) {
    return null
  }

  return (
    <Dialog open={onboarding.isFirstLaunch} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{currentStep.title}</DialogTitle>
              <DialogDescription>
                {currentStep.description}
              </DialogDescription>
            </div>
            <Badge variant="secondary">
              {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        <div className="py-6">
          {currentStep.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep.canSkip && currentStepIndex < steps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            
            <Button onClick={handleNext}>
              {currentStepIndex === steps.length - 1 ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}