import React, { useState } from 'react';
import { 
  Play, 
  Settings, 
  BarChart3, 
  Brain,
  BookOpen,
  Target,
  Award,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIEnhancedInteractiveTutorials } from './ai-enhanced-interactive-tutorials';
import { TutorialManager } from './tutorial-manager';
import { TutorialProgressTracker } from './tutorial-progress-tracker';
import { IntelligentHelpProvider } from './intelligent-help-provider';

export const InteractiveTutorialsDemo: React.FC = () => {
  const [showTutorials, setShowTutorials] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<string | undefined>();

  const handleTutorialComplete = (tutorialId: string, timeSpent: number) => {
    console.log(`Tutorial ${tutorialId} completed in ${Math.round(timeSpent / 60000)} minutes`);
    setShowTutorials(false);
  };

  const handleTutorialRecommendation = (tutorialId: string) => {
    setSelectedTutorial(tutorialId);
    setShowTutorials(true);
  };

  return (
    <IntelligentHelpProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              AI-Enhanced Interactive Tutorials Demo
            </CardTitle>
            <CardDescription>
              Experience adaptive learning with AI-powered tutorials that adjust to your skill level and learning style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="outline">Adaptive Learning</Badge>
              <Badge variant="outline">Progress Tracking</Badge>
              <Badge variant="outline">Interactive</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This demo showcases the complete interactive tutorial system with AI personalization, 
              progress tracking, and intelligent recommendations.
            </p>
          </CardContent>
        </Card>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">AI Personalization</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tutorials adapt to your skill level, learning style, and progress patterns
              </p>
              <ul className="text-xs text-left space-y-1">
                <li>• Personalized hints and tips</li>
                <li>• Difficulty adjustments</li>
                <li>• Smart recommendations</li>
                <li>• Learning path optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold mb-2">Interactive Learning</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hands-on tutorials with real-time validation and guided practice
              </p>
              <ul className="text-xs text-left space-y-1">
                <li>• Step-by-step guidance</li>
                <li>• Interactive elements</li>
                <li>• Real-time validation</li>
                <li>• Visual highlighting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive analytics and achievement system to track your growth
              </p>
              <ul className="text-xs text-left space-y-1">
                <li>• Skill point system</li>
                <li>• Achievement badges</li>
                <li>• Learning streaks</li>
                <li>• Performance analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="tutorials" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tutorials">Tutorial Player</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="management">Tutorial Management</TabsTrigger>
          </TabsList>

          {/* Tutorial Player Demo */}
          <TabsContent value="tutorials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interactive Tutorial Player</CardTitle>
                <CardDescription>
                  Experience AI-powered tutorials that adapt to your learning style
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                      <h3 className="font-medium mb-2">DevFlow Studio Basics</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Learn the fundamentals of visual development planning
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
                        <span>• 5 steps</span>
                        <span>• 10 min</span>
                        <span>• Beginner</span>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedTutorial('devflow-basics');
                          setShowTutorials(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Tutorial
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                      <h3 className="font-medium mb-2">Regexr++ Introduction</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Master visual regex building with AI assistance
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
                        <span>• 7 steps</span>
                        <span>• 15 min</span>
                        <span>• Intermediate</span>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSelectedTutorial('regexr-intro');
                          setShowTutorials(true);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Tutorial
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">AI Features</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Tutorials adapt to your skill level and learning pace</li>
                    <li>• Personalized hints appear when you need help</li>
                    <li>• AI recommends next steps based on your progress</li>
                    <li>• Smart difficulty adjustments keep you in the optimal learning zone</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tracking Demo */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Progress & Analytics</CardTitle>
                <CardDescription>
                  Track your learning journey with detailed analytics and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TutorialProgressTracker onRecommendation={handleTutorialRecommendation} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorial Management Demo */}
          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tutorial Management System</CardTitle>
                <CardDescription>
                  Create, manage, and analyze tutorials with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Settings className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <h3 className="font-medium mb-2">Tutorial Manager</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Create and manage interactive tutorials
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => setShowManager(true)}
                      >
                        Open Manager
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-medium mb-2">AI Generation</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Generate tutorials automatically with AI
                      </p>
                      <Button size="sm" variant="outline">
                        Try AI Generator
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-medium mb-2">Analytics</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Track tutorial performance and engagement
                      </p>
                      <Button size="sm" variant="outline">
                        View Analytics
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Management Features</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• AI-powered tutorial generation from topics</li>
                    <li>• Visual tutorial editor with step-by-step builder</li>
                    <li>• Performance analytics and user engagement metrics</li>
                    <li>• Template library and community sharing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Implementation Status</CardTitle>
            <CardDescription>
              Current status of AI-enhanced interactive tutorial components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI-Enhanced Tutorial Player</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Adaptive Learning System</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress Tracking</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Achievement System</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tutorial Manager</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Tutorial Generation</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Learning Path System</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analytics Dashboard</span>
                  <Badge variant="default">✅ Complete</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Player Modal */}
      <AIEnhancedInteractiveTutorials
        isOpen={showTutorials}
        onClose={() => setShowTutorials(false)}
        initialTutorial={selectedTutorial}
        onTutorialComplete={handleTutorialComplete}
      />

      {/* Tutorial Manager Modal */}
      <TutorialManager
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        onTutorialSelected={(tutorialId) => {
          setSelectedTutorial(tutorialId);
          setShowManager(false);
          setShowTutorials(true);
        }}
      />
    </IntelligentHelpProvider>
  );
};

export default InteractiveTutorialsDemo;