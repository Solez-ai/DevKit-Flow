import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle,
  Lightbulb,
  Target,
  BookOpen,
  Sparkles,
  User,
  Code,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAIService } from '@/hooks/use-ai-service';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  targetElement?: string; // CSS selector for highlighting
  action?: 'click' | 'type' | 'drag' | 'observe';
  expectedResult?: string;
  tips?: string[];
  aiEnhanced?: boolean;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  prerequisites?: string[];
  steps: TutorialStep[];
  aiPersonalized?: boolean;
}

interface InteractiveTutorialsProps {
  isOpen: boolean;
  onClose: () => void;
  initialTutorial?: string;
}

interface UserProgress {
  completedTutorials: string[];
  currentTutorial?: string;
  currentStep: number;
  preferences: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
    learningStyle: 'visual' | 'hands-on' | 'reading';
  };
}

const baseTutorials: Tutorial[] = [
  {
    id: 'devflow-basics',
    title: 'DevFlow Studio Fundamentals',
    description: 'Learn the basics of visual project planning with nodes and connections',
    category: 'beginner',
    estimatedTime: 10,
    aiPersonalized: true,
    steps: [
      {
        id: 'create-first-node',
        title: 'Create Your First Node',
        description: 'Learn how to add nodes to your canvas',
        content: (
          <div className="space-y-4">
            <p>Nodes are the building blocks of your development workflow. Let's create your first task node.</p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click the "Add Node" button in the toolbar</li>
                <li>Select "Task Node" from the dropdown</li>
                <li>Enter "Setup Project Structure" as the title</li>
                <li>Click "Create" to add it to the canvas</li>
              </ol>
            </div>
          </div>
        ),
        targetElement: '[data-testid="add-node-button"]',
        action: 'click',
        expectedResult: 'A new task node appears on the canvas',
        tips: ['You can also use Ctrl+N to quickly add a node', 'Double-click on empty canvas space to create a node'],
        aiEnhanced: true
      },
      {
        id: 'add-node-content',
        title: 'Add Content to Your Node',
        description: 'Learn how to add todos and descriptions to nodes',
        content: (
          <div className="space-y-4">
            <p>Now let's add some content to make your node useful for tracking work.</p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Try this:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Double-click on your node to open the editor</li>
                <li>Add a description: "Initialize the project with proper folder structure"</li>
                <li>Add a todo: "Create src, components, and utils folders"</li>
                <li>Add another todo: "Set up package.json with dependencies"</li>
              </ul>
            </div>
          </div>
        ),
        action: 'type',
        expectedResult: 'Node shows content and todo items',
        aiEnhanced: true
      }
    ]
  },
  {
    id: 'regex-builder-intro',
    title: 'Regexr++ Visual Builder',
    description: 'Build your first regex pattern using drag-and-drop components',
    category: 'beginner',
    estimatedTime: 15,
    aiPersonalized: true,
    steps: [
      {
        id: 'drag-character-class',
        title: 'Add a Character Class',
        description: 'Learn how to use character class components',
        content: (
          <div className="space-y-4">
            <p>Let's build a simple email validation pattern. We'll start with character classes for the username part.</p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your task:</h4>
              <p className="text-sm">Drag the "Word Characters" component from the palette to the pattern builder.</p>
            </div>
          </div>
        ),
        targetElement: '[data-component="word-characters"]',
        action: 'drag',
        expectedResult: 'Word character component appears in the pattern builder',
        aiEnhanced: true
      }
    ]
  },
  {
    id: 'ai-assistance-tutorial',
    title: 'Using AI Features Effectively',
    description: 'Learn how to leverage AI assistance for better productivity',
    category: 'intermediate',
    estimatedTime: 12,
    prerequisites: ['devflow-basics'],
    aiPersonalized: true,
    steps: [
      {
        id: 'ai-code-generation',
        title: 'AI Code Generation',
        description: 'Use AI to generate code snippets for your nodes',
        content: (
          <div className="space-y-4">
            <p>AI can help you generate code based on your node descriptions and requirements.</p>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">AI Tip</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                The more specific your node description, the better the AI-generated code will be.
              </p>
            </div>
          </div>
        ),
        aiEnhanced: true
      }
    ]
  }
];

export const InteractiveTutorials: React.FC<InteractiveTutorialsProps> = ({
  isOpen,
  onClose,
  initialTutorial
}) => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedTutorials: [],
    currentStep: 0,
    preferences: {
      difficulty: 'beginner',
      interests: ['devflow-studio', 'regex-builder'],
      learningStyle: 'hands-on'
    }
  });
  const [aiPersonalizedTutorials, setAiPersonalizedTutorials] = useState<Tutorial[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');

  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate AI-personalized tutorials based on user preferences and progress
  const generatePersonalizedTutorials = useCallback(async () => {
    if (!aiEnabled) return;

    setIsLoadingAI(true);
    try {
      const prompt = `Create personalized tutorial recommendations for a DevKit Flow user with these characteristics:

      User Progress:
      - Completed tutorials: ${userProgress.completedTutorials.join(', ') || 'none'}
      - Preferred difficulty: ${userProgress.preferences.difficulty}
      - Interests: ${userProgress.preferences.interests.join(', ')}
      - Learning style: ${userProgress.preferences.learningStyle}

      Available tutorial categories:
      - DevFlow Studio (visual project planning, nodes, connections, file structures)
      - Regexr++ (regex building, pattern testing, code generation)
      - AI Features (code assistance, debugging, architecture planning)
      - Advanced Workflows (cross-workspace integration, export systems)

      Please suggest 3-5 personalized tutorial topics with:
      1. Title and brief description
      2. Estimated difficulty level
      3. Why it's relevant to this user
      4. Key learning outcomes

      Format as JSON array with this structure:
      [
        {
          "title": "Tutorial Title",
          "description": "Brief description",
          "difficulty": "beginner|intermediate|advanced",
          "relevance": "Why this is good for the user",
          "outcomes": ["outcome1", "outcome2"]
        }
      ]`;

      const response = await generateResponse(prompt, 'tutorial-personalization');
      
      try {
        const suggestions = JSON.parse(response);
        if (Array.isArray(suggestions)) {
          // Convert suggestions to tutorial format (simplified for demo)
          const personalizedTutorials = suggestions.map((suggestion: any, index: number) => ({
            id: `ai-generated-${index}`,
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.difficulty,
            estimatedTime: 10 + (index * 5),
            aiPersonalized: true,
            steps: [
              {
                id: 'ai-step-1',
                title: 'AI-Generated Step',
                description: suggestion.relevance,
                content: (
                  <div className="space-y-4">
                    <p>{suggestion.description}</p>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Learning Outcomes:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {suggestion.outcomes?.map((outcome: string, i: number) => (
                          <li key={i}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ),
                aiEnhanced: true
              }
            ]
          }));
          
          setAiPersonalizedTutorials(personalizedTutorials);
        }
      } catch (parseError) {
        console.warn('Failed to parse AI tutorial suggestions:', parseError);
      }
    } catch (error) {
      console.error('Failed to generate personalized tutorials:', error);
    } finally {
      setIsLoadingAI(false);
    }
  }, [aiEnabled, userProgress, generateResponse]);

  // Generate AI insights for current tutorial step
  const generateStepInsights = useCallback(async (step: TutorialStep) => {
    if (!aiEnabled || !step.aiEnhanced) return;

    try {
      const prompt = `Provide helpful insights for this tutorial step in DevKit Flow:

      Step: ${step.title}
      Description: ${step.description}
      User's learning style: ${userProgress.preferences.learningStyle}
      User's experience level: ${userProgress.preferences.difficulty}

      Please provide:
      1. A personalized tip based on their learning style
      2. Common mistakes to avoid
      3. How this connects to real-world development
      4. Next steps after mastering this concept

      Keep it concise and encouraging.`;

      const response = await generateResponse(prompt, 'tutorial-insights');
      setAiInsights(response);
    } catch (error) {
      console.error('Failed to generate step insights:', error);
      setAiInsights('');
    }
  }, [aiEnabled, userProgress, generateResponse]);

  // Highlight target element
  const highlightElement = useCallback((selector?: string) => {
    if (!selector) return;

    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tutorial-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      highlightTimeoutRef.current = setTimeout(() => {
        element.classList.remove('tutorial-highlight');
      }, 5000);
    }
  }, []);

  // Handle tutorial selection
  const selectTutorial = useCallback((tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setAiInsights('');
    
    // Update user progress
    setUserProgress(prev => ({
      ...prev,
      currentTutorial: tutorial.id,
      currentStep: 0
    }));

    // Generate insights for first step
    if (tutorial.steps[0]) {
      generateStepInsights(tutorial.steps[0]);
    }
  }, [generateStepInsights]);

  // Navigate tutorial steps
  const goToStep = useCallback((stepIndex: number) => {
    if (!selectedTutorial || stepIndex < 0 || stepIndex >= selectedTutorial.steps.length) return;

    setCurrentStepIndex(stepIndex);
    setUserProgress(prev => ({ ...prev, currentStep: stepIndex }));

    const step = selectedTutorial.steps[stepIndex];
    
    // Highlight target element
    if (step.targetElement) {
      highlightElement(step.targetElement);
    }

    // Generate AI insights
    generateStepInsights(step);
  }, [selectedTutorial, highlightElement, generateStepInsights]);

  const nextStep = useCallback(() => {
    goToStep(currentStepIndex + 1);
  }, [currentStepIndex, goToStep]);

  const previousStep = useCallback(() => {
    goToStep(currentStepIndex - 1);
  }, [currentStepIndex, goToStep]);

  // Complete tutorial
  const completeTutorial = useCallback(() => {
    if (!selectedTutorial) return;

    setUserProgress(prev => ({
      ...prev,
      completedTutorials: [...prev.completedTutorials, selectedTutorial.id]
    }));

    // Generate new personalized tutorials based on completion
    generatePersonalizedTutorials();
  }, [selectedTutorial, generatePersonalizedTutorials]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && selectedTutorial) {
      const timer = setTimeout(() => {
        if (currentStepIndex < selectedTutorial.steps.length - 1) {
          nextStep();
        } else {
          setIsPlaying(false);
          completeTutorial();
        }
      }, 5000); // 5 seconds per step

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStepIndex, selectedTutorial, nextStep, completeTutorial]);

  // Load personalized tutorials on mount
  useEffect(() => {
    if (isOpen && aiEnabled) {
      generatePersonalizedTutorials();
    }
  }, [isOpen, aiEnabled, generatePersonalizedTutorials]);

  // Initialize with specific tutorial if provided
  useEffect(() => {
    if (initialTutorial && isOpen) {
      const tutorial = [...baseTutorials, ...aiPersonalizedTutorials]
        .find(t => t.id === initialTutorial);
      if (tutorial) {
        selectTutorial(tutorial);
      }
    }
  }, [initialTutorial, isOpen, aiPersonalizedTutorials, selectTutorial]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const allTutorials = [...baseTutorials, ...aiPersonalizedTutorials];
  const currentStep = selectedTutorial?.steps[currentStepIndex];
  const progress = selectedTutorial ? ((currentStepIndex + 1) / selectedTutorial.steps.length) * 100 : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner': return <User className="h-4 w-4" />;
      case 'intermediate': return <Code className="h-4 w-4" />;
      case 'advanced': return <Settings className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Interactive Tutorials
                {aiEnabled && (
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTutorial 
                  ? `${selectedTutorial.title} - Step ${currentStepIndex + 1} of ${selectedTutorial.steps.length}`
                  : 'Choose a tutorial to get started with guided learning'
                }
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedTutorial && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress: {Math.round(progress)}%</span>
                <span>~{selectedTutorial.estimatedTime} min total</span>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Tutorial List */}
          {!selectedTutorial && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Personalized Recommendations */}
                {aiEnabled && aiPersonalizedTutorials.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold">Recommended for You</h3>
                      {isLoadingAI && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                      )}
                    </div>
                    <div className="grid gap-4">
                      {aiPersonalizedTutorials.map((tutorial) => (
                        <Card
                          key={tutorial.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors border-blue-200"
                          onClick={() => selectTutorial(tutorial)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                  {tutorial.title}
                                  <Badge variant="secondary" className="text-xs">
                                    <Sparkles className="h-2 w-2 mr-1" />
                                    AI
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {tutorial.description}
                                </CardDescription>
                              </div>
                              <Badge className={cn("text-xs", getCategoryColor(tutorial.category))}>
                                {getCategoryIcon(tutorial.category)}
                                <span className="ml-1">{tutorial.category}</span>
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{tutorial.steps.length} steps</span>
                              <span>~{tutorial.estimatedTime} min</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <Separator className="my-6" />
                  </div>
                )}

                {/* All Tutorials */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Tutorials</h3>
                  <div className="grid gap-4">
                    {baseTutorials.map((tutorial) => (
                      <Card
                        key={tutorial.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          userProgress.completedTutorials.includes(tutorial.id) && "bg-green-50 dark:bg-green-950 border-green-200"
                        )}
                        onClick={() => selectTutorial(tutorial)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {userProgress.completedTutorials.includes(tutorial.id) ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground" />
                                )}
                                {tutorial.title}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {tutorial.description}
                              </CardDescription>
                            </div>
                            <Badge className={cn("text-xs", getCategoryColor(tutorial.category))}>
                              {getCategoryIcon(tutorial.category)}
                              <span className="ml-1">{tutorial.category}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{tutorial.steps.length} steps</span>
                              <span>~{tutorial.estimatedTime} min</span>
                            </div>
                            {tutorial.prerequisites && (
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Prerequisites required
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tutorial Content */}
          {selectedTutorial && currentStep && (
            <div className="flex-1 flex gap-4 overflow-hidden">
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                        <CardDescription>{currentStep.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToStep(0)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step Content */}
                    <div>{currentStep.content}</div>

                    {/* Expected Result */}
                    {currentStep.expectedResult && (
                      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900 dark:text-green-100">Expected Result</span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {currentStep.expectedResult}
                        </p>
                      </div>
                    )}

                    {/* Tips */}
                    {currentStep.tips && currentStep.tips.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-900 dark:text-blue-100">Tips</span>
                        </div>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          {currentStep.tips.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Insights */}
                    {currentStep.aiEnhanced && aiEnabled && aiInsights && (
                      <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-900 dark:text-purple-100">AI Insights</span>
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300 whitespace-pre-wrap">
                          {aiInsights}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Step Navigation */}
              <div className="w-80 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tutorial Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedTutorial.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-colors",
                          index === currentStepIndex 
                            ? "bg-primary text-primary-foreground" 
                            : index < currentStepIndex
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-muted hover:bg-muted/80"
                        )}
                        onClick={() => goToStep(index)}
                      >
                        <div className="flex items-center gap-2">
                          {index < currentStepIndex ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : index === currentStepIndex ? (
                            <Circle className="h-4 w-4 fill-current" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{step.title}</h4>
                            <p className="text-xs opacity-80 mt-1">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {selectedTutorial && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSelectedTutorial(null)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Tutorials
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={currentStepIndex === selectedTutorial.steps.length - 1 ? completeTutorial : nextStep}
              >
                {currentStepIndex === selectedTutorial.steps.length - 1 ? (
                  <>
                    Complete Tutorial
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InteractiveTutorials;