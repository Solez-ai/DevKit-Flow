import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  X, 
  Filter, 
  Settings, 
  Bot, 
  Palette, 
  Zap, 
  Database, 
  Cog 
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import type { SettingsCategory, SettingItem } from '@/types/settings'

interface SearchResult {
  category: SettingsCategory
  setting: SettingItem
  matchType: 'name' | 'description' | 'category'
  matchText: string
}

interface SettingsSearchProps {
  onResultSelect: (categoryId: string, settingKey: string) => void
}

export const SettingsSearch: React.FC<SettingsSearchProps> = ({ onResultSelect }) => {
  const { panel, setSearchQuery, setActiveCategory } = useSettingsStore()
  const [searchValue, setSearchValue] = useState(panel.searchQuery || '')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const availableFilters = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Cog }
  ]

  const searchResults = useMemo(() => {
    if (!searchValue.trim()) return []

    const query = searchValue.toLowerCase()
    const results: SearchResult[] = []

    panel.categories.forEach(category => {
      // Filter by category if filters are selected
      if (selectedFilters.length > 0 && !selectedFilters.includes(category.id)) {
        return
      }

      // Check category name match
      if (category.name.toLowerCase().includes(query)) {
        category.settings.forEach(setting => {
          results.push({
            category,
            setting,
            matchType: 'category',
            matchText: category.name
          })
        })
      }

      // Check category description match
      if (category.description?.toLowerCase().includes(query)) {
        category.settings.forEach(setting => {
          results.push({
            category,
            setting,
            matchType: 'category',
            matchText: category.description!
          })
        })
      }

      // Check individual settings
      category.settings.forEach(setting => {
        // Setting name match
        if (setting.label.toLowerCase().includes(query)) {
          results.push({
            category,
            setting,
            matchType: 'name',
            matchText: setting.label
          })
        }

        // Setting description match
        if (setting.description.toLowerCase().includes(query)) {
          results.push({
            category,
            setting,
            matchType: 'description',
            matchText: setting.description
          })
        }
      })
    })

    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => 
        r.category.id === result.category.id && r.setting.key === result.setting.key
      )
    )

    return uniqueResults.slice(0, 20) // Limit to 20 results
  }, [searchValue, selectedFilters, panel.categories])

  const handleSearch = (value: string) => {
    setSearchValue(value)
    setSearchQuery(value)
  }

  const handleClearSearch = () => {
    setSearchValue('')
    setSearchQuery('')
  }

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  const handleResultClick = (result: SearchResult) => {
    setActiveCategory(result.category.id as any)
    onResultSelect(result.category.id, result.setting.key)
    
    // Scroll to setting if possible
    setTimeout(() => {
      const element = document.getElementById(`setting-${result.setting.key}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
        }, 2000)
      }
    }, 100)
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const getCategoryIcon = (categoryId: string) => {
    const filter = availableFilters.find(f => f.id === categoryId)
    if (!filter) return <Settings className="w-4 h-4" />
    const Icon = filter.icon
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search settings..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-muted' : ''}
          >
            <Filter className="w-4 h-4" />
          </Button>
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filter by category:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFilters([])}
                  disabled={selectedFilters.length === 0}
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableFilters.map(filter => {
                  const Icon = filter.icon
                  const isSelected = selectedFilters.includes(filter.id)
                  
                  return (
                    <Button
                      key={filter.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterToggle(filter.id)}
                      className="h-8"
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {filter.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchValue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </span>
            {selectedFilters.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground">Filtered by:</span>
                {selectedFilters.map(filterId => {
                  const filter = availableFilters.find(f => f.id === filterId)
                  return filter ? (
                    <Badge key={filterId} variant="secondary" className="text-xs">
                      {filter.label}
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1">
            {searchResults.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No settings found matching your search.
                </CardContent>
              </Card>
            ) : (
              searchResults.map((result, index) => (
                <Card 
                  key={`${result.category.id}-${result.setting.key}-${index}`}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getCategoryIcon(result.category.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium truncate">
                            {highlightMatch(result.setting.label, searchValue)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result.category.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {highlightMatch(result.setting.description, searchValue)}
                        </p>
                        {result.matchType === 'category' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Found in category: {highlightMatch(result.matchText, searchValue)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!searchValue && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <span className="text-sm font-medium">Quick actions:</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch('theme')}
                  className="justify-start"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Change theme
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch('ai')}
                  className="justify-start"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  AI settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch('auto save')}
                  className="justify-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Auto save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch('data')}
                  className="justify-start"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Data management
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}