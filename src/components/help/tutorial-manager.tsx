import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Play, 
  Brain,
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Target,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIService } from '@/hooks/use-ai-service';
import { useIntelligentHelp } from './intelligent-help-provider';

interface TutorialTemplate {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  steps: TutorialStepTemplate[];
  estimatedTime: number;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  usage: {
    timesUsed: number;
    averageRating: number;
    completionRate: number;
  };
}

interface TutorialStepTemplate {
  id: string;
  title: string;
  description: string;
  contentType: 'text' | 'interactive' | 'video' | 'code';
  content: string;
  targetElement?: string;
  duration?: number;
  interactionRequired?: boolean;
  validationScript?: string;
  hints: string[];
  aiEnhanced: boolean;
}

interface TutorialManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTutorialCreated?: (tutorial: TutorialTemplate) => void;
  onTutorialSelected?: (tutorialId: string) => void;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({
  isOpen,
  onClose,
  onTutorialCreated,
  onTutorialSelected
}) => {
  const [tutorials, setTutorials] = useState<TutorialTemplate[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const { trackUserAction } = useIntelligentHelp();

  // Sample tutorials for demo
  const sampleTutorials: TutorialTemplate[] = [
    {
      id: 'devflow-basics',
      name: 'DevFlow Studio Fundamentals',
      description: 'Learn the core concepts of visual development planning',
      category: 'beginner',
      estimatedTime: 15,
      learningObjectives: [
        'Create and manage development nodes',
        'Connect nodes with meaningful relationships',
        'Track project progress effectively'
      ],
      prerequisites: [],
      tags: ['basics', 'nodes', 'workflow'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      usage: {
        timesUsed: 245,
        averageRating: 4.7,
        completionRate: 89
      },
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to DevFlow Studio',
          description: 'Introduction to visual development planning',
          contentType: 'text',
          content: 'DevFlow Studio helps you visualize and organize your development workflow...',
          duration: 30,
          interactionRequired: false,
          hints: [],
          aiEnhanced: true
        }
      ]
    },
    {
      id: 'advanced-regex',
      name: 'Advanced Regex Patterns',
      description: 'Master complex regex patterns with AI assistance',
      category: 'advanced',
      estimatedTime: 25,
      learningObjectives: [
        'Build complex regex patterns visually',
        'Optimize patterns for performance',
        'Generate production-ready code'
      ],
      prerequisites: ['regex-basics'],
      tags: ['regex', 'patterns', 'advanced'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      usage: {
        timesUsed: 156,
        averageRating: 4.9,
        completionRate: 76
      },
      steps: []
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setTutorials(sampleTutorials);
  }, []);

  // Generate AI tutorial
  const generateAITutorial = useCallback(async (topic: string, skillLevel: string) => {
    if (!aiEnabled) return;

    setIsGeneratingAI(true);
    try {
      const prompt = `Create an interactive tutorial for DevKit Flow on the topic: "${topic}" for ${skillLevel} users.

Generate a comprehensive tutorial with:
- Clear learning objectives
- Step-by-step instructions
- Interactive elements where appropriate
- Estimated timing
- Prerequisites if needed

Return as JSON:
{
  "name": "Tutorial Title",
  "description": "Brief description",
  "category": "${skillLevel}",
  "estimatedTime": 20,
  "learningObjectives": ["objective1", "objective2"],
  "prerequisites": ["prereq1"],
  "steps": [
    {
      "title": "Step Title",
      "description": "Step description",
      "contentType": "text|interactive|code",
      "content": "Detailed step content",
      "duration": 60,
      "interactionRequired": false,
      "hints": ["hint1", "hint2"],
      "aiEnhanced": true
    }
  ]
}

Focus on practical, hands-on learning with clear progression.`;

      const response = await generateResponse(prompt, 'tutorial-generation');
      
      try {
        const tutorialData = JSON.parse(response);
        const newTutorial: TutorialTemplate = {
          id: `ai-generated-${Date.now()}`,
          ...tutorialData,
          tags: [topic.toLowerCase(), skillLevel, 'ai-generated'],
          createdAt: new Date(),
          updatedAt: new Date(),
          usage: {
            timesUsed: 0,
            averageRating: 0,
            completionRate: 0
          },
          steps: tutorialData.steps.map((step: any, index: number) => ({
            id: `step-${index}`,
            ...step
          }))
        };
        
        setTutorials(prev => [...prev, newTutorial]);
        setSelectedTutorial(newTutorial);
        onTutorialCreated?.(newTutorial);
        
        trackUserAction(`ai-tutorial-generated-${topic}`, {
          feature: 'tutorial-manager',
          component: 'ai-generator',
          userAction: 'tutorial-generated'
        });
      } catch (parseError) {
        console.error('Failed to parse AI tutorial:', parseError);
      }
    } catch (error) {
      console.error('Failed to generate AI tutorial:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [aiEnabled, generateResponse, onTutorialCreated, trackUserAction]); 
 // Filter tutorials
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || tutorial.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Delete tutorial
  const deleteTutorial = useCallback((tutorialId: string) => {
    setTutorials(prev => prev.filter(t => t.id !== tutorialId));
    if (selectedTutorial?.id === tutorialId) {
      setSelectedTutorial(null);
    }
    
    trackUserAction(`tutorial-deleted-${tutorialId}`, {
      feature: 'tutorial-manager',
      component: 'tutorial-list',
      userAction: 'tutorial-deleted'
    });
  }, [selectedTutorial, trackUserAction]);

  // Duplicate tutorial
  const duplicateTutorial = useCallback((tutorial: TutorialTemplate) => {
    const duplicated: TutorialTemplate = {
      ...tutorial,
      id: `${tutorial.id}-copy-${Date.now()}`,
      name: `${tutorial.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usage: {
        timesUsed: 0,
        averageRating: 0,
        completionRate: 0
      }
    };
    
    setTutorials(prev => [...prev, duplicated]);
    setSelectedTutorial(duplicated);
    
    trackUserAction(`tutorial-duplicated-${tutorial.id}`, {
      feature: 'tutorial-manager',
      component: 'tutorial-list',
      userAction: 'tutorial-duplicated'
    });
  }, [trackUserAction]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Tutorial Manager
            {aiEnabled && (
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="browse" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="browse">Browse Tutorials</TabsTrigger>
              <TabsTrigger value="create">Create Tutorial</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Browse Tutorials */}
            <TabsContent value="browse" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex">
                {/* Tutorial List */}
                <div className="w-1/2 border-r">
                  <div className="p-4 border-b">
                    <div className="space-y-3">
                      <Input
                        placeholder="Search tutorials..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 overflow-auto h-[calc(100%-120px)]">
                    {filteredTutorials.map((tutorial) => (
                      <Card
                        key={tutorial.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTutorial?.id === tutorial.id ? 'ring-2 ring-blue-500' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTutorial(tutorial)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{tutorial.name}</h3>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTutorialSelected?.(tutorial.id);
                                }}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateTutorial(tutorial);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTutorial(tutorial.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {tutorial.description}
                          </p>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="capitalize">
                              {tutorial.category}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {tutorial.estimatedTime}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {tutorial.usage.timesUsed}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {tutorial.usage.completionRate}%
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Tutorial Details */}
                <div className="w-1/2 p-6 overflow-auto">
                  {selectedTutorial ? (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{selectedTutorial.name}</h2>
                        <p className="text-muted-foreground">{selectedTutorial.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {selectedTutorial.estimatedTime}m
                              </div>
                              <div className="text-sm text-muted-foreground">Duration</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {selectedTutorial.steps.length}
                              </div>
                              <div className="text-sm text-muted-foreground">Steps</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Learning Objectives</h3>
                        <ul className="space-y-1">
                          {selectedTutorial.learningObjectives.map((objective, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Target className="h-3 w-3 mt-0.5 text-green-500 shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {selectedTutorial.prerequisites.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Prerequisites</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedTutorial.prerequisites.map((prereq, index) => (
                              <Badge key={index} variant="outline">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium mb-2">Usage Statistics</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium">{selectedTutorial.usage.timesUsed}</div>
                            <div className="text-muted-foreground">Times Used</div>
                          </div>
                          <div>
                            <div className="font-medium">{selectedTutorial.usage.averageRating}/5</div>
                            <div className="text-muted-foreground">Avg Rating</div>
                          </div>
                          <div>
                            <div className="font-medium">{selectedTutorial.usage.completionRate}%</div>
                            <div className="text-muted-foreground">Completion</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => onTutorialSelected?.(selectedTutorial.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Tutorial
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a tutorial to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>    
        {/* Create Tutorial */}
            <TabsContent value="create" className="flex-1 p-6 overflow-auto">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Create New Tutorial</h2>
                  <p className="text-muted-foreground">
                    Build interactive tutorials to help users learn DevKit Flow features
                  </p>
                </div>

                {/* AI Tutorial Generator */}
                {aiEnabled && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        AI Tutorial Generator
                      </CardTitle>
                      <CardDescription>
                        Let AI create a comprehensive tutorial based on your topic and skill level
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Topic</label>
                          <Input 
                            placeholder="e.g., Node connections, Regex patterns"
                            id="ai-topic"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Skill Level</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          const topicInput = document.getElementById('ai-topic') as HTMLInputElement;
                          const topic = topicInput?.value || 'DevKit Flow basics';
                          generateAITutorial(topic, 'beginner');
                        }}
                        disabled={isGeneratingAI}
                        className="w-full"
                      >
                        {isGeneratingAI ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2" />
                            Generating Tutorial...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Generate AI Tutorial
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Manual Tutorial Creation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Manual Creation</CardTitle>
                    <CardDescription>
                      Create a tutorial step by step with full control
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tutorial Name</label>
                      <Input placeholder="Enter tutorial name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea placeholder="Describe what users will learn" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Estimated Time (minutes)</label>
                        <Input type="number" placeholder="15" />
                      </div>
                    </div>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Tutorial
                    </Button>
                  </CardContent>
                </Card>

                {/* Import/Export */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import/Export</CardTitle>
                    <CardDescription>
                      Share tutorials with your team or community
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Tutorial
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Selected
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Tutorial Analytics</h2>
                  <p className="text-muted-foreground">
                    Track tutorial performance and user engagement
                  </p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {tutorials.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Tutorials</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {tutorials.reduce((sum, t) => sum + t.usage.timesUsed, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Usage</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(tutorials.reduce((sum, t) => sum + t.usage.averageRating, 0) / tutorials.length * 10) / 10}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(tutorials.reduce((sum, t) => sum + t.usage.completionRate, 0) / tutorials.length)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Completion Rate</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Popular Tutorials */}
                <Card>
                  <CardHeader>
                    <CardTitle>Most Popular Tutorials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tutorials
                        .sort((a, b) => b.usage.timesUsed - a.usage.timesUsed)
                        .slice(0, 5)
                        .map((tutorial, index) => (
                          <div key={tutorial.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{tutorial.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {tutorial.usage.timesUsed} uses • {tutorial.usage.completionRate}% completion
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {tutorial.category}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialManager;