import { useState, useEffect, useCallback } from 'react';
import { RegexComponent } from '@/types';
import { allRegexComponents } from '@/lib/regex-components';

interface ComponentUsageStats {
  usageCount: number;
  lastUsed: Date | null;
  averageRating: number;
  totalRatings: number;
}

interface CommunityPattern {
  id: string;
  name: string;
  pattern: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  tags: string[];
  createdAt: Date;
}

export const useEnhancedComponentUsage = () => {
  const [components] = useState<RegexComponent[]>(allRegexComponents);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [usageStats, setUsageStats] = useState<Record<string, ComponentUsageStats>>({});
  const [communityPatterns, setCommunityPatterns] = useState<CommunityPattern[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('df_regex_favorites');
    const savedRecentlyUsed = localStorage.getItem('df_regex_recently_used');
    const savedUsageStats = localStorage.getItem('df_regex_usage_stats');

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }

    if (savedRecentlyUsed) {
      try {
        setRecentlyUsed(JSON.parse(savedRecentlyUsed));
      } catch (error) {
        console.error('Failed to parse recently used:', error);
      }
    }

    if (savedUsageStats) {
      try {
        const parsed = JSON.parse(savedUsageStats);
        // Convert date strings back to Date objects
        const converted = Object.entries(parsed).reduce((acc, [key, value]: [string, any]) => {
          acc[key] = {
            ...value,
            lastUsed: value.lastUsed ? new Date(value.lastUsed) : null
          };
          return acc;
        }, {} as Record<string, ComponentUsageStats>);
        setUsageStats(converted);
      } catch (error) {
        console.error('Failed to parse usage stats:', error);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('df_regex_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save recently used to localStorage
  useEffect(() => {
    localStorage.setItem('df_regex_recently_used', JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  // Save usage stats to localStorage
  useEffect(() => {
    localStorage.setItem('df_regex_usage_stats', JSON.stringify(usageStats));
  }, [usageStats]);

  const toggleFavorite = useCallback((componentId: string) => {
    setFavorites(prev => {
      if (prev.includes(componentId)) {
        return prev.filter(id => id !== componentId);
      } else {
        return [...prev, componentId];
      }
    });
  }, []);

  const recordUsage = useCallback((componentId: string) => {
    // Update recently used (move to front, limit to 20)
    setRecentlyUsed(prev => {
      const filtered = prev.filter(id => id !== componentId);
      return [componentId, ...filtered].slice(0, 20);
    });

    // Update usage stats
    setUsageStats(prev => {
      const current = prev[componentId] || {
        usageCount: 0,
        lastUsed: null,
        averageRating: 0,
        totalRatings: 0
      };

      return {
        ...prev,
        [componentId]: {
          ...current,
          usageCount: current.usageCount + 1,
          lastUsed: new Date()
        }
      };
    });
  }, []);

  const rateComponent = useCallback((componentId: string, rating: number) => {
    setUsageStats(prev => {
      const current = prev[componentId] || {
        usageCount: 0,
        lastUsed: null,
        averageRating: 0,
        totalRatings: 0
      };

      const newTotalRatings = current.totalRatings + 1;
      const newAverageRating = (current.averageRating * current.totalRatings + rating) / newTotalRatings;

      return {
        ...prev,
        [componentId]: {
          ...current,
          averageRating: newAverageRating,
          totalRatings: newTotalRatings
        }
      };
    });
  }, []);

  const getComponentUsageStats = useCallback((componentId: string): ComponentUsageStats => {
    return usageStats[componentId] || {
      usageCount: 0,
      lastUsed: null,
      averageRating: 0,
      totalRatings: 0
    };
  }, [usageStats]);

  const getCommunityPatterns = useCallback(async (): Promise<CommunityPattern[]> => {
    // In a real implementation, this would fetch from an API
    // For now, return mock data
    return [
      {
        id: 'community-1',
        name: 'Email Validation (RFC 5322)',
        pattern: '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',
        description: 'RFC 5322 compliant email validation pattern',
        author: 'regex_master',
        rating: 4.8,
        downloads: 1250,
        tags: ['email', 'validation', 'rfc5322'],
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'community-2',
        name: 'Credit Card Numbers',
        pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$',
        description: 'Validates major credit card number formats',
        author: 'payment_dev',
        rating: 4.6,
        downloads: 890,
        tags: ['credit-card', 'payment', 'validation'],
        createdAt: new Date('2024-01-20')
      }
    ];
  }, []);

  const searchComponents = useCallback((query: string): RegexComponent[] => {
    if (!query.trim()) return components;

    const lowerQuery = query.toLowerCase();
    return components.filter(component =>
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.examples.some((example: string) => example.toLowerCase().includes(lowerQuery)) ||
      component.commonUses.some((use: string) => use.toLowerCase().includes(lowerQuery))
    );
  }, [components]);

  const getComponentsByCategory = useCallback((categoryId: string): RegexComponent[] => {
    return components.filter(component => component.category === categoryId);
  }, [components]);

  const getMostPopularComponents = useCallback((limit: number = 10): RegexComponent[] => {
    return [...components]
      .sort((a, b) => {
        const aStats = getComponentUsageStats(a.id);
        const bStats = getComponentUsageStats(b.id);
        return bStats.usageCount - aStats.usageCount;
      })
      .slice(0, limit);
  }, [components, getComponentUsageStats]);

  const getRecentlyUsedComponents = useCallback((limit: number = 10): RegexComponent[] => {
    return recentlyUsed
      .slice(0, limit)
      .map(id => components.find(c => c.id === id))
      .filter(Boolean) as RegexComponent[];
  }, [recentlyUsed, components]);

  return {
    components,
    favorites,
    recentlyUsed,
    usageStats,
    communityPatterns,
    toggleFavorite,
    recordUsage,
    rateComponent,
    getComponentUsageStats,
    getCommunityPatterns,
    searchComponents,
    getComponentsByCategory,
    getMostPopularComponents,
    getRecentlyUsedComponents
  };
};