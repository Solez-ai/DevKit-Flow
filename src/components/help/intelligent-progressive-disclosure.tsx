import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Lightbulb, 
  Brain,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  Info,
  BookOpen,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { useIntelligentHelp } from './intelligent-help-provider';
import { useAIService } from '@/hooks/use-ai-service';
import { cn } from '@/lib/utils';

interface DisclosureLevel {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prerequisites?: string[];
  estimatedReadTime?: number;
  aiEnhanced?: boolean;
}

interface IntelligentProgressiveDisclosureProps {
  title: string;
  description?: string;
  levels: DisclosureLevel[];
  feature: string;
  component: string;
  className?: string;
  defaultOpenLevels?: string[];
  adaptToUserLevel?: boolean;
  showProgress?: boolean;
  maxInitialLevels?: number;
}

interface UserProgress {
  completedLevels: string[];
  currentLevel: string | null;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeSpent: Record<string, number>;
}

interface AIRecommendation {
  levelId: string;
  reason: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

export const IntelligentProgressiveDisclosure: React.FC<IntelligentProgressiveDisclosureProps> = ({
  title,
  description,
  levels,
  feature,
  component,
  className,
  defaultOpenLevels = [],
  adaptToUserLevel = true,
  showProgress = true,
  maxInitialLevels = 2
}) => {
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set(defaultOpenLevels));
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedLevels: [],
    currentLevel: null,
    skillLevel: 'beginner',
    timeSpent: {}
  });
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showAllLevels, setShowAllLevels] = useState(false);

  const { trackUserAction, suggestNextSteps } = useIntelligentHelp();
  const { generateResponse, isEnabled: aiEnabled } = useAIService();
  const startTimeRef = useRef<Record<string, number>>({});

  // Determine user skill level based on interactions
  const determineUserSkillLevel = useCallback(() => {
    const completedCount = userProgress.completedLevels.length;
    const totalTime = Object.values(userProgress.timeSpent).reduce((sum, time) => sum + time, 0);
    const avgTimePerLevel = completedCount > 0 ? totalTime / completedCount : 0;

    if (completedCount >= 5 && avgTimePerLevel < 30000) { // Less than 30 seconds per level
      return 'expert';
    } else if (completedCount >= 3 && avgTimePerLevel < 60000) { // Less than 1 minute per level
      return 'advanced';
    } else if (completedCount >= 1) {
      return 'intermediate';
    }
    return 'beginner';
  }, [userProgress]);

  // Generate AI recommendations for next levels to explore
  const generateAIRecommendations = useCallback(async () => {
    if (!aiEnabled || !adaptToUserLevel) return;

    setIsLoadingRecommendations(true);
    try {
      const prompt = `Analyze user progress and recommend next disclosure levels:

Feature: ${feature}
Component: ${component}
User Skill Level: ${userProgress.skillLevel}
Completed Levels: ${userProgress.completedLevels.join(', ')}
Available Levels: ${levels.map(l => `${l.id} (${l.complexity})`).join(', ')}

User Progress Context:
- Total completed: ${userProgress.completedLevels.length}/${levels.length}
- Average time per level: ${Object.values(userProgress.timeSpent).reduce((sum, time) => sum + time, 0) / Math.max(1, userProgress.completedLevels.length)}ms

Provide recommendations as JSON array:
[
  {
    "levelId": "level-id",
    "reason": "Why this level is recommended (max 50 words)",
    "confidence": 0.8,
    "priority": "high|medium|low"
  }
]

Consider:
- User's current skill level
- Natural learning progression
- Prerequisites completion
- Complexity appropriateness
- Knowledge gaps

Recommend 2-3 most relevant levels.`;

      const response = await generateResponse(prompt, 'progressive-disclosure');
      
      try {
        const recommendations = JSON.parse(response);
        if (Array.isArray(recommendations)) {
          setAiRecommendations(recommendations.slice(0, 3));
        }
      } catch (parseError) {
        console.warn('Failed to parse AI recommendations:', parseError);
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [aiEnabled, adaptToUserLevel, feature, component, userProgress, levels, generateResponse]);

  // Update user skill level when progress changes
  useEffect(() => {
    const newSkillLevel = determineUserSkillLevel();
    if (newSkillLevel !== userProgress.skillLevel) {
      setUserProgress(prev => ({ ...prev, skillLevel: newSkillLevel }));
    }
  }, [userProgress.completedLevels, userProgress.timeSpent, determineUserSkillLevel]);

  // Generate recommendations when user progress changes
  useEffect(() => {
    if (adaptToUserLevel && userProgress.completedLevels.length > 0) {
      generateAIRecommendations();
    }
  }, [userProgress.completedLevels, adaptToUserLevel, generateAIRecommendations]);

  // Handle level toggle
  const toggleLevel = useCallback((levelId: string) => {
    const isOpening = !openLevels.has(levelId);
    
    setOpenLevels(prev => {
      const newSet = new Set(prev);
      if (isOpening) {
        newSet.add(levelId);
        // Track start time
        startTimeRef.current[levelId] = Date.now();
      } else {
        newSet.delete(levelId);
        // Calculate time spent and mark as completed
        if (startTimeRef.current[levelId]) {
          const timeSpent = Date.now() - startTimeRef.current[levelId];
          setUserProgress(prevProgress => ({
            ...prevProgress,
            timeSpent: { ...prevProgress.timeSpent, [levelId]: timeSpent },
            completedLevels: prevProgress.completedLevels.includes(levelId) 
              ? prevProgress.completedLevels 
              : [...prevProgress.completedLevels, levelId],
            currentLevel: null
          }));
          delete startTimeRef.current[levelId];
        }
      }
      return newSet;
    });

    if (isOpening) {
      setUserProgress(prev => ({ ...prev, currentLevel: levelId }));
    }

    trackUserAction(`disclosure-level-${isOpening ? 'opened' : 'closed'}-${levelId}`, {
      feature,
      component,
      userAction: `level-${isOpening ? 'opened' : 'closed'}`
    });
  }, [openLevels, feature, component, trackUserAction]);

  // Get levels to display based on user skill and AI recommendations
  const getDisplayLevels = useCallback(() => {
    if (showAllLevels) return levels;

    let filteredLevels = levels;

    // Filter by skill level if adapting
    if (adaptToUserLevel) {
      const skillOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
      const userSkillIndex = skillOrder.indexOf(userProgress.skillLevel);
      
      filteredLevels = levels.filter(level => {
        const levelSkillIndex = skillOrder.indexOf(level.complexity);
        return levelSkillIndex <= userSkillIndex + 1; // Show current level + 1 above
      });
    }

    // Prioritize AI recommended levels
    if (aiRecommendations.length > 0) {
      const recommendedIds = new Set(aiRecommendations.map(r => r.levelId));
      filteredLevels.sort((a, b) => {
        const aRecommended = recommendedIds.has(a.id);
        const bRecommended = recommendedIds.has(b.id);
        if (aRecommended && !bRecommended) return -1;
        if (!aRecommended && bRecommended) return 1;
        return 0;
      });
    }

    return filteredLevels.slice(0, maxInitialLevels);
  }, [levels, showAllLevels, adaptToUserLevel, userProgress.skillLevel, aiRecommendations, maxInitialLevels]);

  const getComplexityIcon = (complexity: DisclosureLevel['complexity']) => {
    switch (complexity) {
      case 'beginner': return <Target className="h-3 w-3 text-green-500" />;
      case 'intermediate': return <TrendingUp className="h-3 w-3 text-blue-500" />;
      case 'advanced': return <Zap className="h-3 w-3 text-orange-500" />;
      case 'expert': return <Brain className="h-3 w-3 text-purple-500" />;
      default: return <Info className="h-3 w-3 text-gray-500" />;
    }
  };

  const getComplexityColor = (complexity: DisclosureLevel['complexity']) => {
    switch (complexity) {
      case 'beginner': return 'border-green-200 bg-green-50/30';
      case 'intermediate': return 'border-blue-200 bg-blue-50/30';
      case 'advanced': return 'border-orange-200 bg-orange-50/30';
      case 'expert': return 'border-purple-200 bg-purple-50/30';
      default: return 'border-gray-200 bg-gray-50/30';
    }
  };

  const displayLevels = getDisplayLevels();
  const completionPercentage = (userProgress.completedLevels.length / levels.length) * 100;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-500" />
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-2">{description}</CardDescription>
            )}
          </div>
          
          {adaptToUserLevel && (
            <Badge variant="outline" className="ml-2">
              {userProgress.skillLevel}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {userProgress.completedLevels.length}/{levels.length} completed
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">AI Recommendations</span>
              {isLoadingRecommendations && (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500" />
              )}
            </div>
            <div className="space-y-1">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  <span className="font-medium">
                    {levels.find(l => l.id === rec.levelId)?.title}:
                  </span>{' '}
                  {rec.reason}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Disclosure Levels */}
        {displayLevels.map((level) => {
          const isOpen = openLevels.has(level.id);
          const isCompleted = userProgress.completedLevels.includes(level.id);
          const isRecommended = aiRecommendations.some(r => r.levelId === level.id);
          const recommendation = aiRecommendations.find(r => r.levelId === level.id);

          return (
            <Card
              key={level.id}
              className={cn(
                "transition-all duration-200",
                getComplexityColor(level.complexity),
                isRecommended && "ring-2 ring-blue-200",
                isCompleted && "opacity-75"
              )}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleLevel(level.id)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getComplexityIcon(level.complexity)}
                        {isCompleted && <Eye className="h-3 w-3 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{level.title}</h4>
                          {isRecommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          {level.description}
                        </p>
                        {level.estimatedReadTime && (
                          <div className="flex items-center gap-1 mt-1">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              ~{level.estimatedReadTime} min read
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {level.complexity}
                      </Badge>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    {/* Prerequisites */}
                    {level.prerequisites && level.prerequisites.length > 0 && (
                      <div className="mb-3 p-2 bg-yellow-50/50 border border-yellow-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-800">Prerequisites</span>
                        </div>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          {level.prerequisites.map((prereq, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-yellow-600" />
                              {prereq}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Recommendation Reason */}
                    {recommendation && (
                      <div className="mb-3 p-2 bg-blue-50/50 border border-blue-200 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">Why this is recommended</span>
                        </div>
                        <p className="text-xs text-blue-700">{recommendation.reason}</p>
                      </div>
                    )}

                    {/* Level Content */}
                    <div className="prose prose-sm max-w-none">
                      {level.content}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}

        {/* Show More Button */}
        {!showAllLevels && displayLevels.length < levels.length && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAllLevels(true)}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Show {levels.length - displayLevels.length} More Levels
          </Button>
        )}

        {/* Show Less Button */}
        {showAllLevels && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAllLevels(false)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Show Recommended Only
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentProgressiveDisclosure;