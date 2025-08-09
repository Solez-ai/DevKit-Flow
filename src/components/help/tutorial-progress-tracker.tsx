import React, { useState, useCallback, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Brain,
  CheckCircle,
  Circle,
  BarChart3,
  Calendar,
  User,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useIntelligentHelp } from './intelligent-help-provider';
import { useAIService } from '@/hooks/use-ai-service';

interface TutorialProgress {
  tutorialId: string;
  tutorialName: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  timeSpent: number; // in milliseconds
  strugglingSteps: string[];
  completionRate: number;
  skillPointsEarned: number;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  tutorials: string[];
  completedTutorials: string[];
  estimatedTime: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: 'completion' | 'speed' | 'consistency' | 'mastery';
}

interface TutorialProgressTrackerProps {
  userId?: string;
  onRecommendation?: (tutorialId: string) => void;
}

export const TutorialProgressTracker: React.FC<TutorialProgressTrackerProps> = ({
  userId = 'current-user',
  onRecommendation
}) => {
  const [tutorialProgress, setTutorialProgress] = useState<TutorialProgress[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalTimeSpent: 0,
    tutorialsCompleted: 0,
    currentStreak: 0,
    skillPoints: 0,
    currentLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  });
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const { trackUserAction } = useIntelligentHelp();
  const { generateResponse, isEnabled: aiEnabled } = useAIService();

  // Sample data
  const sampleProgress: TutorialProgress[] = [
    {
      tutorialId: 'devflow-basics',
      tutorialName: 'DevFlow Studio Basics',
      category: 'beginner',
      startedAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-15'),
      currentStep: 5,
      totalSteps: 5,
      timeSpent: 12 * 60 * 1000, // 12 minutes
      strugglingSteps: [],
      completionRate: 100,
      skillPointsEarned: 50
    },
    {
      tutorialId: 'node-connections',
      tutorialName: 'Advanced Node Connections',
      category: 'intermediate',
      startedAt: new Date('2024-01-16'),
      currentStep: 3,
      totalSteps: 7,
      timeSpent: 8 * 60 * 1000, // 8 minutes
      strugglingSteps: ['connection-types'],
      completionRate: 43,
      skillPointsEarned: 0
    }
  ];

  const sampleLearningPaths: LearningPath[] = [
    {
      id: 'devflow-mastery',
      name: 'DevFlow Studio Mastery',
      description: 'Complete guide to visual development planning',
      tutorials: ['devflow-basics', 'node-connections', 'advanced-workflows'],
      completedTutorials: ['devflow-basics'],
      estimatedTime: 45,
      skillLevel: 'intermediate',
      progress: 33
    },
    {
      id: 'regex-expert',
      name: 'Regex Expert Path',
      description: 'Master regular expressions with visual tools',
      tutorials: ['regex-basics', 'advanced-patterns', 'performance-optimization'],
      completedTutorials: [],
      estimatedTime: 60,
      skillLevel: 'advanced',
      progress: 0
    }
  ];

  const sampleAchievements: Achievement[] = [
    {
      id: 'first-tutorial',
      name: 'Getting Started',
      description: 'Complete your first tutorial',
      icon: <Target className="h-4 w-4" />,
      unlockedAt: new Date('2024-01-15'),
      progress: 1,
      maxProgress: 1,
      category: 'completion'
    },
    {
      id: 'speed-learner',
      name: 'Speed Learner',
      description: 'Complete a tutorial in under 10 minutes',
      icon: <Zap className="h-4 w-4" />,
      progress: 0,
      maxProgress: 1,
      category: 'speed'
    },
    {
      id: 'consistent-learner',
      name: 'Consistent Learner',
      description: 'Complete tutorials for 7 days in a row',
      icon: <Calendar className="h-4 w-4" />,
      progress: 2,
      maxProgress: 7,
      category: 'consistency'
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setTutorialProgress(sampleProgress);
    setLearningPaths(sampleLearningPaths);
    setAchievements(sampleAchievements);
    
    // Calculate user stats
    const totalTime = sampleProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const completed = sampleProgress.filter(p => p.completedAt).length;
    const skillPoints = sampleProgress.reduce((sum, p) => sum + p.skillPointsEarned, 0);
    
    setUserStats({
      totalTimeSpent: totalTime,
      tutorialsCompleted: completed,
      currentStreak: 2, // Sample streak
      skillPoints,
      currentLevel: skillPoints > 100 ? 'intermediate' : 'beginner'
    });
  }, []);

  // Generate AI recommendations
  const generateAIRecommendations = useCallback(async () => {
    if (!aiEnabled) return;

    setIsLoadingRecommendations(true);
    try {
      const prompt = `Based on this user's tutorial progress, recommend next tutorials:

User Stats:
- Skill Level: ${userStats.currentLevel}
- Completed Tutorials: ${userStats.tutorialsCompleted}
- Total Time Spent: ${Math.round(userStats.totalTimeSpent / 60000)} minutes
- Skill Points: ${userStats.skillPoints}

Recent Progress:
${tutorialProgress.map(p => 
  `- ${p.tutorialName} (${p.category}): ${p.completionRate}% complete, struggling with: ${p.strugglingSteps.join(', ')}`
).join('\n')}

Learning Paths:
${learningPaths.map(lp => 
  `- ${lp.name}: ${lp.progress}% complete`
).join('\n')}

Provide 3-5 tutorial recommendations as JSON array:
["tutorial-id-1", "tutorial-id-2", "tutorial-id-3"]

Consider:
- User's current skill level
- Areas where they're struggling
- Natural progression paths
- Skill gaps to fill`;

      const response = await generateResponse(prompt, 'tutorial-recommendations');
      
      try {
        const recommendations = JSON.parse(response);
        if (Array.isArray(recommendations)) {
          setAiRecommendations(recommendations);
        }
      } catch (parseError) {
        console.warn('Failed to parse AI recommendations:', parseError);
        setAiRecommendations(['devflow-advanced', 'regex-basics', 'workflow-optimization']);
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [aiEnabled, userStats, tutorialProgress, learningPaths, generateResponse]);

  // Load AI recommendations on mount
  useEffect(() => {
    if (aiEnabled && tutorialProgress.length > 0) {
      generateAIRecommendations();
    }
  }, [aiEnabled, tutorialProgress.length, generateAIRecommendations]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.round(milliseconds / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Learning Progress
          </CardTitle>
          <CardDescription>
            Track your tutorial progress and skill development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userStats.tutorialsCompleted}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatTime(userStats.totalTimeSpent)}
              </div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userStats.skillPoints}
              </div>
              <div className="text-sm text-muted-foreground">Skill Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 capitalize">
                {userStats.currentLevel}
              </div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
          </div>
        </CardContent>
      </Card>  
    {/* AI Recommendations */}
      {aiEnabled && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Recommendations
              {isLoadingRecommendations && (
                <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-500" />
              )}
            </CardTitle>
            <CardDescription>
              Personalized tutorial suggestions based on your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecommendations ? (
              <div className="text-center py-4 text-muted-foreground">
                Analyzing your progress...
              </div>
            ) : aiRecommendations.length > 0 ? (
              <div className="space-y-2">
                {aiRecommendations.map((tutorialId, index) => (
                  <div key={tutorialId} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium capitalize">
                        {tutorialId.replace('-', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Recommended based on your learning pattern
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        onRecommendation?.(tutorialId);
                        trackUserAction(`ai-recommendation-selected-${tutorialId}`, {
                          feature: 'tutorial-progress',
                          component: 'ai-recommendations',
                          userAction: 'recommendation-selected'
                        });
                      }}
                    >
                      Start
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Complete more tutorials to get personalized recommendations
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Current Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tutorialProgress.map((progress) => (
              <div key={progress.tutorialId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{progress.tutorialName}</div>
                    <div className="text-sm text-muted-foreground">
                      Step {progress.currentStep} of {progress.totalSteps} • 
                      {formatTime(progress.timeSpent)} spent
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {progress.category}
                    </Badge>
                    {progress.completedAt && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                <Progress value={progress.completionRate} className="h-2" />
                {progress.strugglingSteps.length > 0 && (
                  <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    Struggling with: {progress.strugglingSteps.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Learning Paths
          </CardTitle>
          <CardDescription>
            Structured learning journeys to master DevKit Flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <div key={path.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{path.name}</h3>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {path.skillLevel}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{path.progress}% complete</span>
                  </div>
                  <Progress value={path.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{path.completedTutorials.length}/{path.tutorials.length} tutorials</span>
                  <span>~{path.estimatedTime} minutes</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock badges as you progress through tutorials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 border rounded-lg ${
                  achievement.unlockedAt ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${
                    achievement.unlockedAt ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                
                {achievement.maxProgress > 1 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2" 
                    />
                  </div>
                )}
                
                {achievement.unlockedAt && (
                  <div className="text-xs text-yellow-700 mt-2">
                    Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const hasActivity = i >= 5; // Sample: activity on last 2 days
              
              return (
                <div key={i} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    {date.toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div 
                    className={`w-8 h-8 rounded mx-auto ${
                      hasActivity ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    title={hasActivity ? 'Tutorial completed' : 'No activity'}
                  />
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <div className="text-2xl font-bold text-green-600">{userStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day streak</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialProgressTracker;