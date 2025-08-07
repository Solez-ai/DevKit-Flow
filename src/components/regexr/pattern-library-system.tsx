import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { 
  Search, 
  Star, 
  StarOff, 
  Download, 
  Upload, 
  Copy, 
  Eye,
  Heart,
  TrendingUp,
  Filter,
  Plus,
  Tag,
  Users,
  Clock,
  BarChart3,
  Sparkles,
  BookOpen,
  Share2
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface PatternLibraryItem {
  id: string
  name: string
  pattern: string
  description: string
  category: 'email' | 'phone' | 'url' | 'date' | 'credit-card' | 'password' | 'ip-address' | 'custom'
  tags: string[]
  examples: string[]
  testCases: Array<{
    input: string
    shouldMatch: boolean
    description?: string
  }>
  author?: string
  rating: number
  downloads: number
  favorites: number
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  isFavorite: boolean
  usage: {
    totalUses: number
    lastUsed?: Date
    successRate: number
  }
}

interface PatternLibrarySystemProps {
  onPatternSelect?: (pattern: PatternLibraryItem) => void
  onPatternImport?: (pattern: string) => void
  className?: string
}

export function PatternLibrarySystem({
  onPatternSelect,
  onPatternImport,
  className
}: PatternLibrarySystemProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'downloads' | 'recent'>('rating')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<PatternLibraryItem | null>(null)

  // Built-in pattern library
  const [patterns, setPatterns] = useState<PatternLibraryItem[]>([
    {
      id: '1',
      name: 'Email Address',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      description: 'Validates standard email addresses',
      category: 'email',
      tags: ['validation', 'email', 'contact'],
      examples: ['user@example.com', 'test.email+tag@domain.co.uk'],
      testCases: [
        { input: 'user@example.com', shouldMatch: true, description: 'Standard email' },
        { input: 'invalid-email', shouldMatch: false, description: 'Missing @ symbol' },
        { input: 'test@', shouldMatch: false, description: 'Missing domain' }
      ],
      author: 'System',
      rating: 4.8,
      downloads: 15420,
      favorites: 892,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      isPublic: true,
      isFavorite: false,
      usage: {
        totalUses: 1250,
        lastUsed: new Date('2024-01-20'),
        successRate: 94.2
      }
    },
    {
      id: '2',
      name: 'Phone Number (US)',
      pattern: '^\\+?1?[-\\s]?\\(?([0-9]{3})\\)?[-\\s]?([0-9]{3})[-\\s]?([0-9]{4})$',
      description: 'Matches US phone numbers in various formats',
      category: 'phone',
      tags: ['validation', 'phone', 'us', 'contact'],
      examples: ['(555) 123-4567', '+1-555-123-4567', '555.123.4567'],
      testCases: [
        { input: '(555) 123-4567', shouldMatch: true, description: 'Standard format' },
        { input: '+1-555-123-4567', shouldMatch: true, description: 'International format' },
        { input: '123-456', shouldMatch: false, description: 'Too short' }
      ],
      author: 'System',
      rating: 4.6,
      downloads: 8930,
      favorites: 445,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-16'),
      isPublic: true,
      isFavorite: true,
      usage: {
        totalUses: 780,
        lastUsed: new Date('2024-01-19'),
        successRate: 91.5
      }
    },
    {
      id: '3',
      name: 'URL/Website',
      pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
      description: 'Validates HTTP and HTTPS URLs',
      category: 'url',
      tags: ['validation', 'url', 'web', 'link'],
      examples: ['https://www.example.com', 'http://subdomain.site.org/path?param=value'],
      testCases: [
        { input: 'https://www.example.com', shouldMatch: true, description: 'HTTPS URL' },
        { input: 'http://example.com/path', shouldMatch: true, description: 'HTTP with path' },
        { input: 'not-a-url', shouldMatch: false, description: 'Invalid URL' }
      ],
      author: 'System',
      rating: 4.7,
      downloads: 12340,
      favorites: 678,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-17'),
      isPublic: true,
      isFavorite: false,
      usage: {
        totalUses: 950,
        lastUsed: new Date('2024-01-21'),
        successRate: 96.8
      }
    },
    {
      id: '4',
      name: 'Date (YYYY-MM-DD)',
      pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
      description: 'Matches dates in ISO format (YYYY-MM-DD)',
      category: 'date',
      tags: ['validation', 'date', 'iso', 'format'],
      examples: ['2024-01-15', '2023-12-31', '2024-02-29'],
      testCases: [
        { input: '2024-01-15', shouldMatch: true, description: 'Valid date' },
        { input: '2024-13-01', shouldMatch: false, description: 'Invalid month' },
        { input: '24-01-15', shouldMatch: false, description: 'Wrong year format' }
      ],
      author: 'System',
      rating: 4.5,
      downloads: 6780,
      favorites: 234,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-18'),
      isPublic: true,
      isFavorite: false,
      usage: {
        totalUses: 420,
        lastUsed: new Date('2024-01-18'),
        successRate: 88.9
      }
    },
    {
      id: '5',
      name: 'Strong Password',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
      description: 'Validates strong passwords with mixed case, numbers, and special characters',
      category: 'password',
      tags: ['validation', 'password', 'security', 'strong'],
      examples: ['MyP@ssw0rd', 'Str0ng!Pass', 'Secure123$'],
      testCases: [
        { input: 'MyP@ssw0rd', shouldMatch: true, description: 'Strong password' },
        { input: 'password', shouldMatch: false, description: 'Too weak' },
        { input: 'Pass123', shouldMatch: false, description: 'Missing special character' }
      ],
      author: 'System',
      rating: 4.9,
      downloads: 18750,
      favorites: 1205,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-19'),
      isPublic: true,
      isFavorite: true,
      usage: {
        totalUses: 2100,
        lastUsed: new Date('2024-01-22'),
        successRate: 92.3
      }
    },
    {
      id: '6',
      name: 'IPv4 Address',
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      description: 'Validates IPv4 addresses',
      category: 'ip-address',
      tags: ['validation', 'ip', 'network', 'address'],
      examples: ['192.168.1.1', '10.0.0.1', '255.255.255.255'],
      testCases: [
        { input: '192.168.1.1', shouldMatch: true, description: 'Valid IP' },
        { input: '256.1.1.1', shouldMatch: false, description: 'Invalid octet' },
        { input: '192.168.1', shouldMatch: false, description: 'Incomplete IP' }
      ],
      author: 'System',
      rating: 4.4,
      downloads: 5420,
      favorites: 189,
      createdAt: new Date('2024-01-06'),
      updatedAt: new Date('2024-01-20'),
      isPublic: true,
      isFavorite: false,
      usage: {
        totalUses: 310,
        lastUsed: new Date('2024-01-17'),
        successRate: 95.1
      }
    }
  ])

  const [newPattern, setNewPattern] = useState<Partial<PatternLibraryItem>>({
    name: '',
    pattern: '',
    description: '',
    category: 'custom',
    tags: [],
    examples: [''],
    testCases: [{ input: '', shouldMatch: true, description: '' }],
    isPublic: false
  })

  // Get all available tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    patterns.forEach(pattern => {
      pattern.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [patterns])

  // Filter and sort patterns
  const filteredPatterns = useMemo(() => {
    let filtered = patterns.filter(pattern => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          pattern.name.toLowerCase().includes(query) ||
          pattern.description.toLowerCase().includes(query) ||
          pattern.tags.some(tag => tag.toLowerCase().includes(query)) ||
          pattern.pattern.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Category filter
      if (selectedCategory !== 'all' && pattern.category !== selectedCategory) {
        return false
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasSelectedTags = selectedTags.every(tag => 
          pattern.tags.includes(tag)
        )
        if (!hasSelectedTags) return false
      }

      // Favorites filter
      if (showFavoritesOnly && !pattern.isFavorite) {
        return false
      }

      return true
    })

    // Sort patterns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return b.rating - a.rating
        case 'downloads':
          return b.downloads - a.downloads
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [patterns, searchQuery, selectedCategory, selectedTags, showFavoritesOnly, sortBy])

  // Toggle favorite
  const toggleFavorite = useCallback((patternId: string) => {
    setPatterns(prev => prev.map(pattern => 
      pattern.id === patternId 
        ? { ...pattern, isFavorite: !pattern.isFavorite }
        : pattern
    ))
  }, [])

  // Add new pattern
  const addPattern = useCallback(() => {
    if (!newPattern.name || !newPattern.pattern) return

    const pattern: PatternLibraryItem = {
      id: Date.now().toString(),
      name: newPattern.name,
      pattern: newPattern.pattern,
      description: newPattern.description || '',
      category: newPattern.category as any || 'custom',
      tags: newPattern.tags || [],
      examples: newPattern.examples?.filter(ex => ex.trim()) || [],
      testCases: newPattern.testCases?.filter(tc => tc.input.trim()) || [],
      author: 'User',
      rating: 0,
      downloads: 0,
      favorites: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: newPattern.isPublic || false,
      isFavorite: false,
      usage: {
        totalUses: 0,
        successRate: 0
      }
    }

    setPatterns(prev => [...prev, pattern])
    setNewPattern({
      name: '',
      pattern: '',
      description: '',
      category: 'custom',
      tags: [],
      examples: [''],
      testCases: [{ input: '', shouldMatch: true, description: '' }],
      isPublic: false
    })
    setIsAddDialogOpen(false)
  }, [newPattern])

  // Copy pattern to clipboard
  const copyPattern = useCallback((pattern: string) => {
    navigator.clipboard.writeText(pattern)
  }, [])

  // Use pattern
  const usePattern = useCallback((pattern: PatternLibraryItem) => {
    // Update usage statistics
    setPatterns(prev => prev.map(p => 
      p.id === pattern.id 
        ? { 
            ...p, 
            usage: { 
              ...p.usage, 
              totalUses: p.usage.totalUses + 1,
              lastUsed: new Date()
            }
          }
        : p
    ))

    onPatternSelect?.(pattern)
    onPatternImport?.(pattern.pattern)
  }, [onPatternSelect, onPatternImport])

  const categories = [
    { value: 'all', label: 'All Categories', count: patterns.length },
    { value: 'email', label: 'Email', count: patterns.filter(p => p.category === 'email').length },
    { value: 'phone', label: 'Phone', count: patterns.filter(p => p.category === 'phone').length },
    { value: 'url', label: 'URL', count: patterns.filter(p => p.category === 'url').length },
    { value: 'date', label: 'Date', count: patterns.filter(p => p.category === 'date').length },
    { value: 'password', label: 'Password', count: patterns.filter(p => p.category === 'password').length },
    { value: 'ip-address', label: 'IP Address', count: patterns.filter(p => p.category === 'ip-address').length },
    { value: 'custom', label: 'Custom', count: patterns.filter(p => p.category === 'custom').length }
  ]

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Pattern Library
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pattern
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Pattern</DialogTitle>
                    <DialogDescription>
                      Create a new regex pattern to add to your library.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pattern-name">Pattern Name</Label>
                        <Input
                          id="pattern-name"
                          value={newPattern.name || ''}
                          onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter pattern name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pattern-category">Category</Label>
                        <select
                          id="pattern-category"
                          value={newPattern.category || 'custom'}
                          onChange={(e) => setNewPattern(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="url">URL</option>
                          <option value="date">Date</option>
                          <option value="password">Password</option>
                          <option value="ip-address">IP Address</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pattern-regex">Regular Expression</Label>
                      <Textarea
                        id="pattern-regex"
                        value={newPattern.pattern || ''}
                        onChange={(e) => setNewPattern(prev => ({ ...prev, pattern: e.target.value }))}
                        placeholder="Enter your regex pattern"
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pattern-description">Description</Label>
                      <Textarea
                        id="pattern-description"
                        value={newPattern.description || ''}
                        onChange={(e) => setNewPattern(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this pattern matches"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pattern-tags">Tags (comma-separated)</Label>
                      <Input
                        id="pattern-tags"
                        value={newPattern.tags?.join(', ') || ''}
                        onChange={(e) => setNewPattern(prev => ({ 
                          ...prev, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        }))}
                        placeholder="validation, email, contact"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pattern-public"
                        checked={newPattern.isPublic || false}
                        onCheckedChange={(checked) => setNewPattern(prev => ({ ...prev, isPublic: checked }))}
                      />
                      <Label htmlFor="pattern-public">Make this pattern public</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={addPattern}
                        disabled={!newPattern.name || !newPattern.pattern}
                      >
                        Add Pattern
                      </Button>
                      <Button
                        onClick={() => setIsAddDialogOpen(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patterns, tags, or descriptions..."
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={cn(showFavoritesOnly && "bg-primary text-primary-foreground")}
              >
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded px-2 py-1"
                >
                  <option value="rating">Rating</option>
                  <option value="downloads">Downloads</option>
                  <option value="name">Name</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              {categories.map(category => (
                <TabsTrigger key={category.value} value={category.value} className="text-xs">
                  {category.label}
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPatterns.map((pattern) => (
                    <Card key={pattern.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{pattern.name}</h4>
                                <Badge variant="outline">{pattern.category}</Badge>
                                {pattern.author !== 'System' && (
                                  <Badge variant="secondary">
                                    <Users className="w-3 h-3 mr-1" />
                                    Community
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {pattern.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(pattern.id)}
                              className={cn(
                                "p-1",
                                pattern.isFavorite && "text-red-500"
                              )}
                            >
                              {pattern.isFavorite ? (
                                <Heart className="w-4 h-4 fill-current" />
                              ) : (
                                <Heart className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          <div className="font-mono text-sm bg-muted p-2 rounded border">
                            {pattern.pattern}
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current text-yellow-500" />
                                {pattern.rating.toFixed(1)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {pattern.downloads.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {pattern.usage.successRate.toFixed(1)}%
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pattern.usage.lastUsed ? 
                                new Date(pattern.usage.lastUsed).toLocaleDateString() : 
                                'Never used'
                              }
                            </div>
                          </div>

                          {pattern.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {pattern.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => usePattern(pattern)}
                              size="sm"
                              className="flex-1"
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Use Pattern
                            </Button>
                            <Button
                              onClick={() => copyPattern(pattern.pattern)}
                              size="sm"
                              variant="outline"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{pattern.name}</DialogTitle>
                                  <DialogDescription>
                                    View pattern details and usage information.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Pattern</h4>
                                    <div className="font-mono text-sm bg-muted p-3 rounded border">
                                      {pattern.pattern}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {pattern.description}
                                    </p>
                                  </div>

                                  {pattern.examples.length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2">Examples</h4>
                                      <div className="space-y-1">
                                        {pattern.examples.map((example, index) => (
                                          <div key={index} className="font-mono text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                                            "{example}"
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {pattern.testCases.length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2">Test Cases</h4>
                                      <div className="space-y-2">
                                        {pattern.testCases.map((testCase, index) => (
                                          <div key={index} className="flex items-center gap-2 text-sm">
                                            <Badge variant={testCase.shouldMatch ? "default" : "secondary"}>
                                              {testCase.shouldMatch ? 'Match' : 'No Match'}
                                            </Badge>
                                            <span className="font-mono">"{testCase.input}"</span>
                                            {testCase.description && (
                                              <span className="text-muted-foreground">- {testCase.description}</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPatterns.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No patterns found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}