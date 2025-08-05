import React, { useState, useMemo, useCallback } from 'react'
import { 
  Search, 
  Star, 
  Clock, 
  Info, 
  TrendingUp, 
  Filter,
  Grid,
  List,
  Sparkles,
  BookOpen,
  Zap,

  ChevronDown,
  ChevronRight,
  Tag,
  Users,
  Award,
  Lightbulb
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '../ui/dropdown-menu'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '../ui/collapsible'
import { 
  allRegexComponents, 
  componentCategories, 
  getComponentsByCategory, 
  searchComponents 
} from '../../lib/regex-components'
import { 
  getAllEnhancedCategories,
  searchPatternLibrary
} from '../../lib/enhanced-regex-categories'
import { useEnhancedComponentUsage } from '../../hooks/use-enhanced-component-usage'
import { useAIService } from '../../hooks/use-ai-service'
import type { 
  RegexComponent, 
  ComponentCategory,
  EnhancedRegexComponent,
  ComponentTemplate
} from '../../types'

interface ComponentPaletteProps {
  onComponentSelect: (component: RegexComponent | EnhancedRegexComponent) => void
  onTemplateSelect?: (template: ComponentTemplate) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortOption = 'name' | 'popularity' | 'rating' | 'recent' | 'alphabetical'
type FilterCategory = ComponentCategory | 'all' | 'favorites' | 'recent' | 'popular' | 'templates' | 'ai-suggested' | 'community'

export function ComponentPalette({
  onComponentSelect,
  onTemplateSelect,
  className = ''
}: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all')
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('popularity')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))
  
  const { 
    favorites, 
    toggleFavorite, 
    recordUsage
  } = useEnhancedComponentUsage()

  const { isAvailable: isAIEnabled } = useAIService()

  // Enhanced search and filtering
  const { filteredComponents, templates, aiSuggestions } = useMemo(() => {
    let components: (RegexComponent | EnhancedRegexComponent)[] = allRegexComponents
    let templates: ComponentTemplate[] = []
    let aiSuggestions: EnhancedRegexComponent[] = []

    // Apply search filter
    if (searchQuery.trim()) {
      components = searchComponents(searchQuery.trim())
      
      // Pattern library search disabled for now
    }

    // Apply category filter
    if (selectedCategory === 'favorites') {
      components = components.filter(c => favorites.includes(c.id))
    } else if (selectedCategory === 'recent') {
      // Show first 10 components as "recent" (simplified)
      components = components.slice(0, 10)
    } else if (selectedCategory === 'popular') {
      // Sort alphabetically as fallback for "popular"
      components = components.sort((a, b) => a.name.localeCompare(b.name))
    } else if (selectedCategory === 'templates') {
      // Templates disabled for now
      components = []
      templates = []
    } else if (selectedCategory === 'ai-suggested') {
      // AI suggestions disabled for now
      aiSuggestions = []
      components = []
    } else if (selectedCategory === 'community') {
      // Community components disabled for now
      components = []
    } else if (selectedCategory !== 'all') {
      components = getComponentsByCategory(selectedCategory as ComponentCategory)
    }

    // Apply difficulty filter
    if (selectedDifficulties.length > 0) {
      components = components.filter(c => 
        'metadata' in c && selectedDifficulties.includes((c as EnhancedRegexComponent).metadata.difficulty)
      )
    }

    // Apply rating filter
    if (minRating > 0) {
      components = components.filter(c => 
        'metadata' in c && (c as EnhancedRegexComponent).metadata.averageRating >= minRating
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      components = components.filter(c => 
        'metadata' in c && selectedTags.some(tag => 
          (c as EnhancedRegexComponent).metadata.tags.includes(tag)
        )
      )
    }

    // Apply sorting
    components.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popularity':
          const aPopularity = 'metadata' in a ? (a as EnhancedRegexComponent).metadata.popularity : 0
          const bPopularity = 'metadata' in b ? (b as EnhancedRegexComponent).metadata.popularity : 0
          return bPopularity - aPopularity
        case 'rating':
          const aRating = 'metadata' in a ? (a as EnhancedRegexComponent).metadata.averageRating : 0
          const bRating = 'metadata' in b ? (b as EnhancedRegexComponent).metadata.averageRating : 0
          return bRating - aRating
        case 'recent':
          const aRecent = 'metadata' in a ? (a as EnhancedRegexComponent).metadata.updatedAt.getTime() : 0
          const bRecent = 'metadata' in b ? (b as EnhancedRegexComponent).metadata.updatedAt.getTime() : 0
          return bRecent - aRecent
        case 'alphabetical':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return { filteredComponents: components, templates, aiSuggestions }
  }, [
    searchQuery, 
    selectedCategory, 
    favorites, 
    selectedDifficulties,
    selectedTags,
    minRating,
    sortBy
  ])

  const handleComponentClick = useCallback((component: RegexComponent | EnhancedRegexComponent) => {
    recordUsage(component.id)
    onComponentSelect(component)
  }, [recordUsage, onComponentSelect])

  const handleTemplateClick = useCallback((template: ComponentTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template)
    }
  }, [onTemplateSelect])

  const handleToggleFavorite = useCallback((e: React.MouseEvent, componentId: string) => {
    e.stopPropagation()
    toggleFavorite(componentId)
  }, [toggleFavorite])

  const handleShowDetails = useCallback((e: React.MouseEvent, componentId: string) => {
    e.stopPropagation()
    setShowDetails(showDetails === componentId ? null : componentId)
  }, [showDetails])

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }, [])

  const handleAIGenerate = useCallback(async (description: string) => {
    if (!isAIEnabled) return
    
    try {
      // AI pattern generation disabled for now
      console.log('AI pattern generation requested for:', description)
    } catch (error) {
      console.error('Failed to generate pattern:', error)
    }
  }, [isAIEnabled])

  // Get available tags for filtering
  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    filteredComponents.forEach(component => {
      if ('metadata' in component) {
        (component as EnhancedRegexComponent).metadata.tags.forEach(tag => tags.add(tag))
      }
    })
    return Array.from(tags).sort()
  }, [filteredComponents])

  // Get enhanced categories
  const enhancedCategories = useMemo(() => getAllEnhancedCategories(), [])

  return (
    <TooltipProvider>
      <div className={`w-80 border-r bg-muted/50 flex flex-col ${className}`}>
        {/* Enhanced Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Component Palette</h2>
            <div className="flex items-center space-x-1">
              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 w-7 p-0"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-7 w-7 p-0"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Filters Toggle */}
              <Button
                variant={showFilters ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-7 w-7 p-0"
              >
                <Filter className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search components, templates, or patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {isAIEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => handleAIGenerate(searchQuery)}
                  >
                    <Sparkles className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate with AI</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Enhanced Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as FilterCategory)}>
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-3 w-3 mr-1" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="h-3 w-3 mr-1" />
                Recent
              </TabsTrigger>
            </TabsList>
            
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="popular">
                <TrendingUp className="h-3 w-3 mr-1" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="templates">
                <BookOpen className="h-3 w-3 mr-1" />
                Templates
              </TabsTrigger>
              {isAIEnabled && (
                <TabsTrigger value="ai-suggested">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="community">
                <Users className="h-3 w-3 mr-1" />
                Community
              </TabsTrigger>
              <TabsTrigger value="templates" disabled={true}>
                <Zap className="h-3 w-3 mr-1" />
                Quick
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 border-b bg-background/50">
            <div className="space-y-3">
              {/* Sort Options */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sort by:</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {sortBy} <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                      <DropdownMenuRadioItem value="popularity">Popularity</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="recent">Recent</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="alphabetical">Alphabetical</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty:</label>
                <div className="flex flex-wrap gap-1">
                  {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                    <Badge
                      key={difficulty}
                      variant={selectedDifficulties.includes(difficulty) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        setSelectedDifficulties(prev => 
                          prev.includes(difficulty) 
                            ? prev.filter(d => d !== difficulty)
                            : [...prev, difficulty]
                        )
                      }}
                    >
                      {difficulty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags:</label>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {availableTags.slice(0, 10).map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          )
                        }}
                      >
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Min Rating:</label>
                <div className="flex space-x-1">
                  {[0, 1, 2, 3, 4, 5].map(rating => (
                    <Button
                      key={rating}
                      variant={minRating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMinRating(rating)}
                      className="h-6 w-6 p-0 text-xs"
                    >
                      {rating === 0 ? 'All' : rating}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Category Browser */}
        {selectedCategory === 'all' && !searchQuery && (
          <div className="border-b">
            <ScrollArea className="h-48">
              <div className="p-2">
                {enhancedCategories.map((category) => (
                  <Collapsible
                    key={category.id}
                    open={expandedCategories.has(category.id)}
                    onOpenChange={() => handleCategoryToggle(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto"
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-3 w-3 mr-2" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-2" />
                        )}
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.description}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.difficulty}
                        </Badge>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6">
                      <div className="space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <Button
                            key={subcategory.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            {subcategory.name}
                            <Badge variant="outline" className="ml-auto text-xs">
                              {subcategory.components.length}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Loading State */}
        {/* Loading and error states disabled for now */}

        {/* Enhanced Components List */}
        <ScrollArea className="flex-1">
          <div className={`p-4 ${viewMode === 'grid' ? 'space-y-2' : 'space-y-1'}`}>
            {filteredComponents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No components found</p>
                {searchQuery && (
                  <p className="text-sm">Try a different search term</p>
                )}
                {isAIEnabled && searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleAIGenerate(searchQuery)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate with AI
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Templates Section */}
                {selectedCategory === 'templates' && templates.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Templates
                    </h3>
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onClick={() => handleTemplateClick(template)}
                        />
                      ))}
                    </div>
                    <Separator className="my-4" />
                  </div>
                )}

                {/* AI Suggestions Section */}
                {selectedCategory === 'ai-suggested' && aiSuggestions.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      AI Recommendations
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Based on your usage patterns
                    </p>
                  </div>
                )}

                {/* Components */}
                {filteredComponents.map((component) => (
                  <EnhancedComponentCard
                    key={component.id}
                    component={component}
                    isFavorite={favorites.includes(component.id)}
                    isRecent={false}
                    showDetails={showDetails === component.id}
                    viewMode={viewMode}
                    onClick={() => handleComponentClick(component)}
                    onToggleFavorite={(e) => handleToggleFavorite(e, component.id)}
                    onShowDetails={(e) => handleShowDetails(e, component.id)}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Enhanced Footer */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''}
              {templates.length > 0 && ` • ${templates.length} template${templates.length !== 1 ? 's' : ''}`}
            </span>
            {selectedCategory === 'ai-suggested' && isAIEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Sparkles className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI-powered recommendations</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface EnhancedComponentCardProps {
  component: RegexComponent | EnhancedRegexComponent
  isFavorite: boolean
  isRecent: boolean
  showDetails: boolean
  viewMode: ViewMode
  onClick: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onShowDetails: (e: React.MouseEvent) => void
}

function EnhancedComponentCard({
  component,
  isFavorite,
  isRecent,
  showDetails,
  viewMode,
  onClick,
  onToggleFavorite,
  onShowDetails
}: EnhancedComponentCardProps) {
  const categoryInfo = componentCategories[component.category]
  const isEnhanced = 'metadata' in component
  const enhancedComponent = component as EnhancedRegexComponent

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center p-2 hover:bg-muted/50 rounded cursor-pointer border-l-2"
        style={{ borderLeftColor: component.visualRepresentation.color }}
        onClick={onClick}
      >
        <div 
          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-mono mr-3"
          style={{ backgroundColor: component.visualRepresentation.color }}
        >
          {component.visualRepresentation.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium truncate">{component.name}</span>
            {isEnhanced && enhancedComponent.templates.length > 0 && (
              <BookOpen className="h-3 w-3 text-muted-foreground" />
            )}
            {isEnhanced && enhancedComponent.metadata.isCustom && (
              <Badge variant="outline" className="text-xs">Custom</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {component.description}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {isEnhanced && enhancedComponent.metadata.averageRating > 0 && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Award className="h-3 w-3 mr-1" />
              {enhancedComponent.metadata.averageRating.toFixed(1)}
            </div>
          )}
          {isRecent && <Clock className="h-3 w-3 text-muted-foreground" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className="h-6 w-6 p-0"
          >
            <Star 
              className={`h-3 w-3 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: component.visualRepresentation.color }}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-mono"
              style={{ backgroundColor: component.visualRepresentation.color }}
            >
              {component.visualRepresentation.icon}
            </div>
            <div>
              <CardTitle className="text-sm">{component.name}</CardTitle>
              <div className="flex items-center space-x-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {categoryInfo.name}
                </Badge>
                {isEnhanced && (
                  <Badge variant="outline" className="text-xs">
                    {enhancedComponent.metadata.difficulty}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {isEnhanced && enhancedComponent.templates.length > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <BookOpen className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{enhancedComponent.templates.length} template{enhancedComponent.templates.length !== 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isEnhanced && enhancedComponent.aiAssistance.enabled && (
              <Tooltip>
                <TooltipTrigger>
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI assistance available</p>
                </TooltipContent>
              </Tooltip>
            )}
            {isRecent && (
              <Tooltip>
                <TooltipTrigger>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recently used</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="h-6 w-6 p-0"
            >
              <Star 
                className={`h-3 w-3 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowDetails}
              className="h-6 w-6 p-0"
            >
              <Info className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-xs mb-2">
          {component.description}
        </CardDescription>
        
        <div className="flex items-center justify-between mb-2">
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono flex-1 mr-2 truncate">
            {component.regexPattern}
          </code>
          <div className="flex space-x-1">
            {component.parameters && (
              <Badge variant="outline" className="text-xs">
                Configurable
              </Badge>
            )}
            {isEnhanced && enhancedComponent.metadata.isCustom && (
              <Badge variant="outline" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced metadata */}
        {isEnhanced && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center space-x-2">
              {enhancedComponent.metadata.averageRating > 0 && (
                <div className="flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  {enhancedComponent.metadata.averageRating.toFixed(1)}
                </div>
              )}
              {enhancedComponent.metadata.usageCount > 0 && (
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {enhancedComponent.metadata.usageCount}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {enhancedComponent.metadata.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showDetails && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <div>
              <h4 className="text-xs font-semibold mb-1">Examples:</h4>
              <div className="space-y-1">
                {component.examples.slice(0, 2).map((example, index) => (
                  <code key={index} className="text-xs bg-muted/50 px-2 py-1 rounded block">
                    {example}
                  </code>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold mb-1">Common Uses:</h4>
              <div className="flex flex-wrap gap-1">
                {component.commonUses.slice(0, 2).map((use, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {use}
                  </Badge>
                ))}
              </div>
            </div>

            {component.parameters && (
              <div>
                <h4 className="text-xs font-semibold mb-1">Parameters:</h4>
                <div className="space-y-1">
                  {component.parameters.map((param, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      <span className="font-mono">{param.name}</span>: {param.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced details */}
            {isEnhanced && (
              <>
                {enhancedComponent.templates.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1">Templates:</h4>
                    <div className="space-y-1">
                      {enhancedComponent.templates.slice(0, 2).map((template, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          <span className="font-medium">{template.name}</span>: {template.description}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {enhancedComponent.statistics.performanceMetrics.backtrackingRisk !== 'low' && (
                  <div className="text-xs text-orange-600">
                    ⚠️ {enhancedComponent.statistics.performanceMetrics.backtrackingRisk} backtracking risk
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TemplateCardProps {
  template: ComponentTemplate
  onClick: () => void
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white text-sm">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm">{template.name}</CardTitle>
              <div className="flex items-center space-x-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {'beginner'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="text-xs text-muted-foreground">
              {'50'}% popular
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-xs mb-2">
          {template.description}
        </CardDescription>
        
        <div className="text-xs text-muted-foreground mb-2">
          {template.description}
        </div>

        <div className="flex flex-wrap gap-1">
          {['template'].slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}