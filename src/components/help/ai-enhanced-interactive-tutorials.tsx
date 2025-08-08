import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Square,
  Brain,
  Target,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  User,
  Settings,
  BookOpen,
  Zap,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAIService } from '@/hooks/use-ai-service';
import { useIntelligentHelp } from './intelligent-help-provider';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetElement?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  duration?: number; // Estimated time in seconds
  prerequisites?: string[];
  aiEnhanced?: boolean;
  interactionRequired?: boolean;
  validationFn?: () => boolean;
  hints?: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
  prerequisites?: string[];
  learningObjectives: string[];
  aiPersonalized?: boolean;
}interfac
e UserProgress {
  completedTutorials: string[];
  currentTutorial?: string;
  currentStep: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learningPreferences: {
    pace: 'slow' | 'normal' | 'fast';
    style: 'visual' | 'hands-on' | 'reading';
    interactionLevel: 'minimal' | 'moderate' | 'high';
  };
  timeSpent: Record<string, number>;
  strugglingAreas: string[];
}

interface AIPersonalization {
  adaptedSteps: TutorialStep[];
  personalizedHints: Record<string, string[]>;
  difficultyAdjustments: Record<string, 'easier' | 'harder'>;
  recommendedNext: string[];
  skipSuggestions: string[];
}

interface AIEnhancedInteractiveTutorialsProps {
  isOpen: boolean;
  onClose: () => void;
  initialTutorial?: string;
  userSkillLevel?: UserProgress['skillLevel'];
  onTutorialComplete?: (tutorialId: string, timeSpent: number) => void;
}

export const AIEnhancedInteractiveTutorials: React.FC<AIEnhancedInteractiveTutorialsProps> = ({
  isOpen,
  onClose,
  initialTutorial,
  userSkillLevel = 'beginner',
  onTutorialComplete
}) => {
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedTutorials: [],
    currentStep: 0,
    skillLevel: userSkillLevel,
    learningPreferences: {
      pace: 'normal',
      style: 'hands-on',
      interactionLevel: 'moderate'
    },
    timeSpent: {},
    strugglingAreas: []
  });
  const [aiPersonalization, setAiPersonalization] = useState<AIPersonalization | null>(null);
  const [isLoadingPersonalization, setIsLoadingPersonalization] = useState(false);
  const [tutorialStartTime, setTutorialStartTime] = useState<number | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number | null>(null);

  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const { trackUserAction } = useIntelligentHelp();
  const highlightRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);  
// Sample tutorials data
  const sampleTutorials: Tutorial[] = [
    {
      id: 'devflow-basics',
      title: 'DevFlow Studio Basics',
      description: 'Learn the fundamentals of visual development planning',
      category: 'beginner',
      estimatedTime: 10,
      learningObjectives: [
        'Create and manage nodes',
        'Connect nodes with relationships',
        'Organize your development workflow'
      ],
      aiPersonalized: true,
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to DevFlow Studio',
          description: 'Your visual development planning workspace',
          content: (
            <div className="space-y-3">
              <p>DevFlow Studio helps you plan and organize your development projects visually.</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Create nodes for tasks, code, and documentation</li>
                <li>Connect nodes to show relationships</li>
                <li>Track progress and manage complexity</li>
              </ul>
            </div>
          ),
          duration: 30,
          aiEnhanced: true
        },
        {
          id: 'create-node',
          title: 'Creating Your First Node',
          description: 'Learn how to add nodes to your workspace',
          content: (
            <div className="space-y-3">
              <p>Nodes are the building blocks of your development workflow.</p>
              <div className="bg-blue-50 p-3 rounded border">
                <p className="text-sm font-medium">Try it:</p>
                <p className="text-sm">Click the "Add Node" button or press Ctrl+N</p>
              </div>
            </div>
          ),
          targetElement: '[data-tutorial="add-node-button"]',
          duration: 45,
          interactionRequired: true,
          validationFn: () => document.querySelectorAll('[data-node]').length > 0,
          hints: ['Look for the plus icon in the toolbar', 'You can also right-click on the canvas']
        },
        {
          id: 'node-types',
          title: 'Understanding Node Types',
          description: 'Different types of nodes for different purposes',
          content: (
            <div className="space-y-3">
              <p>DevFlow Studio supports several node types:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-green-50 rounded">
                  <strong>Task:</strong> Action items
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <strong>Code:</strong> Code snippets
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <strong>Reference:</strong> Links & docs
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <strong>Comment:</strong> Notes & ideas
                </div>
              </div>
            </div>
          ),
          duration: 60,
          aiEnhanced: true
        }
      ]
    },
    {
      id: 'regexr-intro',
      title: 'Regexr++ Introduction',
      description: 'Master visual regex building with AI assistance',
      category: 'intermediate',
      estimatedTime: 15,
      learningObjectives: [
        'Build regex patterns visually',
        'Test patterns in real-time',
        'Generate code for multiple languages'
      ],
      aiPersonalized: true,
      steps: [
        {
          id: 'regex-welcome',
          title: 'Welcome to Regexr++',
          description: 'Visual regex building made simple',
          content: (
            <div className="space-y-3">
              <p>Regexr++ transforms complex regex creation into a visual, intuitive process.</p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded">
                <p className="text-sm font-medium">Key Features:</p>
                <ul className="text-sm list-disc list-inside mt-1">
                  <li>Drag-and-drop pattern building</li>
                  <li>Real-time testing and validation</li>
                  <li>AI-powered explanations</li>
                  <li>Multi-language code generation</li>
                </ul>
              </div>
            </div>
          ),
          duration: 45,
          aiEnhanced: true
        }
      ]
    }
  ];  // Gener
ate AI personalization for tutorial
  const generateAIPersonalization = useCallback(async (tutorial: Tutorial) => {
    if (!aiEnabled || !tutorial.aiPersonalized) return;

    setIsLoadingPersonalization(true);
    try {
      const prompt = `Personalize this tutorial for a ${userProgress.skillLevel} user:

Tutorial: ${tutorial.title}
Description: ${tutorial.description}
User Skill Level: ${userProgress.skillLevel}
Learning Preferences: ${JSON.stringify(userProgress.learningPreferences)}
Completed Tutorials: ${userProgress.completedTutorials.join(', ')}
Struggling Areas: ${userProgress.strugglingAreas.join(', ')}

Steps to personalize:
${tutorial.steps.map(step => `- ${step.id}: ${step.title}`).join('\n')}

Provide personalization as JSON:
{
  "difficultyAdjustments": {
    "step-id": "easier|harder"
  },
  "personalizedHints": {
    "step-id": ["hint1", "hint2"]
  },
  "recommendedNext": ["tutorial-id1", "tutorial-id2"],
  "skipSuggestions": ["step-id-if-too-basic"]
}

Consider:
- User's skill level and experience
- Learning style preferences
- Areas where they've struggled before
- Optimal pacing for their preference
- Relevant examples for their context`;

      const response = await generateResponse(prompt, 'tutorial-personalization');
      
      try {
        const personalization = JSON.parse(response);
        setAiPersonalization({
          adaptedSteps: tutorial.steps, // We'll modify these based on adjustments
          personalizedHints: personalization.personalizedHints || {},
          difficultyAdjustments: personalization.difficultyAdjustments || {},
          recommendedNext: personalization.recommendedNext || [],
          skipSuggestions: personalization.skipSuggestions || []
        });
      } catch (parseError) {
        console.warn('Failed to parse AI personalization:', parseError);
      }
    } catch (error) {
      console.error('Failed to generate AI personalization:', error);
    } finally {
      setIsLoadingPersonalization(false);
    }
  }, [aiEnabled, userProgress, generateResponse]);

  // Start tutorial
  const startTutorial = useCallback((tutorial: Tutorial) => {
    setCurrentTutorial(tutorial);
    setCurrentStepIndex(0);
    setTutorialStartTime(Date.now());
    setStepStartTime(Date.now());
    
    if (tutorial.aiPersonalized) {
      generateAIPersonalization(tutorial);
    }
    
    trackUserAction(`tutorial-started-${tutorial.id}`, {
      feature: 'interactive-tutorials',
      component: 'tutorial-player',
      userAction: 'tutorial-started'
    });
  }, [generateAIPersonalization, trackUserAction]);

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (!currentTutorial || currentStepIndex >= currentTutorial.steps.length - 1) return;
    
    // Track time spent on current step
    if (stepStartTime) {
      const timeSpent = Date.now() - stepStartTime;
      setUserProgress(prev => ({
        ...prev,
        timeSpent: {
          ...prev.timeSpent,
          [`${currentTutorial.id}-${currentStepIndex}`]: timeSpent
        }
      }));
    }
    
    setCurrentStepIndex(prev => prev + 1);
    setStepStartTime(Date.now());
    
    trackUserAction(`tutorial-step-${currentStepIndex + 1}`, {
      feature: 'interactive-tutorials',
      component: 'tutorial-player',
      userAction: 'step-advanced'
    });
  }, [currentTutorial, currentStepIndex, stepStartTime, trackUserAction]);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    if (currentStepIndex <= 0) return;
    
    setCurrentStepIndex(prev => prev - 1);
    setStepStartTime(Date.now());
    
    trackUserAction(`tutorial-step-back-${currentStepIndex - 1}`, {
      feature: 'interactive-tutorials',
      component: 'tutorial-player',
      userAction: 'step-back'
    });
  }, [currentStepIndex, trackUserAction]);  // Comp
lete tutorial
  const completeTutorial = useCallback(() => {
    if (!currentTutorial || !tutorialStartTime) return;
    
    const totalTime = Date.now() - tutorialStartTime;
    
    setUserProgress(prev => ({
      ...prev,
      completedTutorials: [...prev.completedTutorials, currentTutorial.id],
      timeSpent: {
        ...prev.timeSpent,
        [currentTutorial.id]: totalTime
      }
    }));
    
    onTutorialComplete?.(currentTutorial.id, totalTime);
    
    trackUserAction(`tutorial-completed-${currentTutorial.id}`, {
      feature: 'interactive-tutorials',
      component: 'tutorial-player',
      userAction: 'tutorial-completed'
    });
    
    // Reset state
    setCurrentTutorial(null);
    setCurrentStepIndex(0);
    setTutorialStartTime(null);
    setStepStartTime(null);
    setAiPersonalization(null);
  }, [currentTutorial, tutorialStartTime, onTutorialComplete, trackUserAction]);

  // Auto-advance for non-interactive steps
  useEffect(() => {
    if (!isPlaying || !currentTutorial) return;
    
    const currentStep = currentTutorial.steps[currentStepIndex];
    if (currentStep?.interactionRequired) return;
    
    const duration = currentStep?.duration || 30;
    const paceMultiplier = userProgress.learningPreferences.pace === 'fast' ? 0.7 : 
                          userProgress.learningPreferences.pace === 'slow' ? 1.5 : 1;
    
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      if (currentStepIndex >= currentTutorial.steps.length - 1) {
        completeTutorial();
      } else {
        nextStep();
      }
    }, duration * 1000 * paceMultiplier);
    
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, [isPlaying, currentTutorial, currentStepIndex, userProgress.learningPreferences.pace, nextStep, completeTutorial]);

  // Highlight target element
  useEffect(() => {
    if (!currentTutorial) return;
    
    const currentStep = currentTutorial.steps[currentStepIndex];
    if (!currentStep?.targetElement) return;
    
    const targetElement = document.querySelector(currentStep.targetElement);
    if (!targetElement) return;
    
    // Add highlight class
    targetElement.classList.add('tutorial-highlight');
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      pointer-events: none;
    `;
    
    document.body.appendChild(overlay);
    
    return () => {
      targetElement.classList.remove('tutorial-highlight');
      overlay.remove();
    };
  }, [currentTutorial, currentStepIndex]);

  // Initialize with initial tutorial
  useEffect(() => {
    if (initialTutorial && isOpen) {
      const tutorial = sampleTutorials.find(t => t.id === initialTutorial);
      if (tutorial) {
        startTutorial(tutorial);
      }
    }
  }, [initialTutorial, isOpen, startTutorial]);

  const currentStep = currentTutorial?.steps[currentStepIndex];
  const progress = currentTutorial ? ((currentStepIndex + 1) / currentTutorial.steps.length) * 100 : 0;
  const isLastStep = currentTutorial ? currentStepIndex >= currentTutorial.steps.length - 1 : false;  if (!
isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Interactive Tutorials
            {aiEnabled && (
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI-Enhanced
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Tutorial Selection */}
          {!currentTutorial && (
            <div className="flex-1 p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Choose Your Learning Path</h2>
                  <p className="text-muted-foreground">
                    AI-powered tutorials that adapt to your skill level and learning style
                  </p>
                </div>

                {/* User Progress Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {userProgress.completedTutorials.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 capitalize">
                          {userProgress.skillLevel}
                        </div>
                        <div className="text-sm text-muted-foreground">Skill Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(Object.values(userProgress.timeSpent).reduce((a, b) => a + b, 0) / 60000)}m
                        </div>
                        <div className="text-sm text-muted-foreground">Time Spent</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Tutorials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Available Tutorials</h3>
                  <div className="grid gap-4">
                    {sampleTutorials.map((tutorial) => {
                      const isCompleted = userProgress.completedTutorials.includes(tutorial.id);
                      const isRecommended = aiPersonalization?.recommendedNext.includes(tutorial.id);
                      
                      return (
                        <Card 
                          key={tutorial.id} 
                          className={cn(
                            "cursor-pointer hover:shadow-md transition-shadow",
                            isCompleted && "opacity-75",
                            isRecommended && "ring-2 ring-blue-200"
                          )}
                          onClick={() => startTutorial(tutorial)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{tutorial.title}</h4>
                                  {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                                  {isRecommended && (
                                    <Badge variant="secondary">
                                      <Brain className="h-3 w-3 mr-1" />
                                      Recommended
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {tutorial.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {tutorial.estimatedTime} min
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {tutorial.steps.length} steps
                                  </div>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {tutorial.category}
                                  </Badge>
                                </div>
                              </div>
                              <Button size="sm">
                                {isCompleted ? 'Replay' : 'Start'}
                                <Play className="h-3 w-3 ml-2" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}         
 {/* Tutorial Player */}
          {currentTutorial && (
            <div className="flex-1 flex flex-col">
              {/* Tutorial Header */}
              <div className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-semibold">{currentTutorial.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Step {currentStepIndex + 1} of {currentTutorial.steps.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoadingPersonalization && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500" />
                        Personalizing...
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setCurrentTutorial(null)}>
                      Exit Tutorial
                    </Button>
                  </div>
                </div>
                
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Content */}
              <div className="flex-1 p-6 overflow-auto">
                {currentStep && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    {/* Step Header */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">{currentStep.title}</h3>
                      <p className="text-muted-foreground">{currentStep.description}</p>
                      {currentStep.duration && (
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          ~{currentStep.duration} seconds
                        </div>
                      )}
                    </div>

                    {/* Step Content */}
                    <Card>
                      <CardContent className="p-6">
                        {currentStep.content}
                      </CardContent>
                    </Card>

                    {/* AI Personalized Hints */}
                    {aiPersonalization?.personalizedHints[currentStep.id] && (
                      <Card className="border-blue-200 bg-blue-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Personalized Tips
                            </span>
                          </div>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {aiPersonalization.personalizedHints[currentStep.id].map((hint, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                                {hint}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Default Hints */}
                    {currentStep.hints && currentStep.hints.length > 0 && (
                      <Card className="border-yellow-200 bg-yellow-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Hints</span>
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {currentStep.hints.map((hint, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-yellow-600 mt-2 shrink-0" />
                                {hint}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Interaction Required */}
                    {currentStep.interactionRequired && (
                      <Card className="border-green-200 bg-green-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Action Required
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            Complete the action described above to continue to the next step.
                          </p>
                          {currentStep.validationFn && (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                if (currentStep.validationFn?.()) {
                                  nextStep();
                                }
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-2" />
                              Validate & Continue
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              {/* Tutorial Controls */}
              <div className="px-6 py-4 border-t bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousStep}
                      disabled={currentStepIndex === 0}
                    >
                      <ArrowLeft className="h-3 w-3 mr-2" />
                      Previous
                    </Button>
                    
                    {!currentStep?.interactionRequired && (
                      <Button
                        variant={isPlaying ? "secondary" : "default"}
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-3 w-3 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isLastStep ? (
                      <Button onClick={completeTutorial}>
                        <Award className="h-3 w-3 mr-2" />
                        Complete Tutorial
                      </Button>
                    ) : (
                      <Button onClick={nextStep}>
                        Next
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIEnhancedInteractiveTutorials;