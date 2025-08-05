// Core application types
export type WorkspaceType = 'studio' | 'regexr' | 'settings'

export type ThemeType = 'light' | 'dark' | 'system'

export type NodeStatus = 'idle' | 'active' | 'completed' | 'blocked'

export type NodeType = 'task' | 'code' | 'reference' | 'comment' | 'template' | 'file' | 'folder' | 'component'

export type ConnectionType = 'dependency' | 'sequence' | 'reference' | 'blocks'

// Position and Size interfaces
export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

// User preferences
export interface UserPreferences {
  theme: ThemeType
  font: FontPreference
  behavior: BehaviorSettings
  keyboardShortcuts: KeyboardShortcuts
}

export interface FontPreference {
  family: string
  size: number
}

export interface BehaviorSettings {
  autoSave: boolean
  confirmDelete: boolean
  showTooltips: boolean
  gridVisible: boolean
  snapToGrid: boolean
}

export interface KeyboardShortcuts {
  [key: string]: string
}

// DevFlow Studio types
export interface DevFlowSession {
  id: string
  name: string
  description?: string
  nodes: DevFlowNode[]
  connections: NodeConnection[]
  settings: SessionSettings
  metadata: SessionMetadata
  timeline: TimelineEvent[]
}

export interface DevFlowNode {
  id: string
  type: NodeType
  title: string
  description?: string
  position: Position
  size: Size
  status: NodeStatus
  content: NodeContent
  metadata: NodeMetadata
  complexity?: ComplexityEstimate
  timeEstimate?: TimeEstimate
}

export interface NodeContent {
  todos: TodoItem[]
  codeSnippets: CodeSnippet[]
  references: Reference[]
  comments: Comment[]
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  completedAt?: Date
  estimatedMinutes?: number
  actualMinutes?: number
}

export interface CodeSnippet {
  id: string
  title: string
  language: string
  code: string
  description?: string
  isTemplate: boolean
  tags: string[]
}

export interface Reference {
  id: string
  title: string
  url?: string
  type: 'documentation' | 'article' | 'video' | 'internal'
  description?: string
  importance: 'low' | 'medium' | 'high'
}

export interface Comment {
  id: string
  text: string
  author?: string
  createdAt: Date
  updatedAt?: Date
}

export interface NodeConnection {
  id: string
  sourceNodeId: string
  targetNodeId: string
  type: ConnectionType
  label?: string
  style: ConnectionStyle
}

export interface ConnectionStyle {
  strokeColor: string
  strokeWidth: number
  strokeDasharray?: string
}

export interface SessionSettings {
  gridSize: number
  snapToGrid: boolean
  autoLayout: boolean
  theme: ThemeType
}

export interface SessionMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  author?: string
  tags: string[]
}

export interface NodeMetadata {
  createdAt: Date
  updatedAt: Date
  timeSpent?: number
  priority: 1 | 2 | 3 | 4 | 5
  tags: string[]
}

export type TimelineEventType = 
  | 'session_created'
  | 'session_updated'
  | 'node_created'
  | 'node_updated'
  | 'node_deleted'
  | 'node_completed'
  | 'node_status_changed'
  | 'todo_added'
  | 'todo_updated'
  | 'todo_completed'
  | 'todo_deleted'
  | 'code_snippet_added'
  | 'code_snippet_updated'
  | 'code_snippet_deleted'
  | 'reference_added'
  | 'reference_updated'
  | 'reference_deleted'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted'
  | 'connection_added'
  | 'connection_updated'
  | 'connection_deleted'
  | 'template_applied'
  | 'export_created'
  | 'import_completed'

export type TimelineEventCategory = 
  | 'session'
  | 'node'
  | 'content'
  | 'connection'
  | 'template'
  | 'data'

export interface TimelineEvent {
  id: string
  timestamp: Date
  type: TimelineEventType
  category: TimelineEventCategory
  sessionId: string
  nodeId?: string
  description: string
  details?: string
  metadata?: Record<string, any>
  duration?: number // in milliseconds
  userId?: string
}

// Regexr++ types
export interface RegexPattern {
  id: string
  name: string
  description: string
  regex: string
  flags: string[]
  components: PlacedComponent[]
  testCases: TestCase[]
  explanation: PatternExplanation
  metadata: PatternMetadata
}

export interface PlacedComponent {
  id: string
  componentId: string
  position: Position
  parameters: Record<string, any>
  isValid: boolean
  validationErrors: string[]
}

export interface RegexComponent {
  id: string
  name: string
  description: string
  category: ComponentCategory
  regexPattern: string
  visualRepresentation: ComponentVisual
  parameters?: ComponentParameter[]
  examples: string[]
  commonUses: string[]
}

export type ComponentCategory = 
  | 'character-classes'
  | 'anchors'
  | 'quantifiers'
  | 'groups'
  | 'lookarounds'
  | 'modifiers'
  | 'shortcuts'

export interface ComponentVisual {
  icon: string
  color: string
  label: string
  isContainer?: boolean
}

export interface ComponentParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'string[]' | 'components'
  description: string
  placeholder?: string | string[]
  min?: number
  max?: number
  default?: any
}

export interface TestCase {
  id: string
  name: string
  input: string
  shouldMatch: boolean
  expectedMatches?: ExpectedMatch[]
  description?: string
}

export interface ExpectedMatch {
  text: string
  startIndex: number
  endIndex: number
  groups?: string[]
}

export interface PatternExplanation {
  summary: string
  breakdown: ComponentExplanation[]
  complexity: 'simple' | 'moderate' | 'complex'
  performanceNotes: string[]
  commonUses: string[]
}

export interface ComponentExplanation {
  componentId: string
  componentName: string
  purpose: string
  regexPart: string
  examples: string[]
  relatedComponents: string[]
}

export interface PatternMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  author?: string
  tags: string[]
  category: string
  complexity: 'simple' | 'moderate' | 'complex'
  usageCount: number
}

// Template types
export interface SessionTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  nodes: Partial<DevFlowNode>[]
  connections: Partial<NodeConnection>[]
  defaultSettings: Partial<SessionSettings>
  author: string
  version: string
  usageCount: number
  rating: number
  createdAt: Date
  updatedAt: Date
}

// Progress and analytics types
export interface ProgressMetrics {
  totalNodes: number
  completedNodes: number
  completionPercentage: number
  totalTimeSpent: number
  averageTimePerNode: number
  estimatedTimeRemaining: number
  mostProductiveTimeOfDay: string
  averageSessionLength: number
  completionVelocity: number
  blockedNodes: DevFlowNode[]
  longestBlockedDuration: number
  commonBlockingReasons: string[]
}

// Export and import types
export interface ExportOptions {
  format: 'json' | 'markdown' | 'pdf'
  includeCompleted: boolean
  includeCodeSnippets: boolean
  includeTimestamps: boolean
  includeConnectionMetadata: boolean
}

export interface ImportResult {
  success: boolean
  data?: any
  errors?: string[]
  warnings?: string[]
}

// Git commit generation types
export interface CommitSuggestion {
  type: string
  scope: string
  description: string
  body?: string
  confidence: number
}

export interface CommitAnalysis {
  completedTodos: TodoItem[]
  modifiedNodes: DevFlowNode[]
  codeSnippets: CodeSnippet[]
  timeRange: { start: Date; end: Date }
}

// Claude MCP AI Integration types
export interface ClaudeMCPConfig {
  isEnabled: boolean
  apiKey?: string
  baseUrl: string
  model: string
  rateLimiting: RateLimitConfig
  promptTemplates: PromptTemplate[]
}

export interface RateLimitConfig {
  requestsPerMinute: number
  cooldownPeriod: number // in seconds
  maxConcurrentRequests: number
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: (input: any) => string
  category: 'code-assistant' | 'regex-generator' | 'debug-helper' | 'architecture-planner' | 'refactorer'
  parameters?: PromptParameter[]
}

export interface PromptParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array'
  description: string
  required: boolean
  default?: any
}

export interface AIRequest {
  id: string
  prompt: string
  context?: any
  timestamp: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retryCount: number
}

export interface AIResponse {
  id: string
  requestId: string
  content: string
  confidence?: number
  metadata?: Record<string, any>
  timestamp: Date
  processingTime: number
}

export interface AIError {
  code: 'RATE_LIMIT' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_REQUEST' | 'SERVICE_UNAVAILABLE'
  message: string
  details?: any
  retryAfter?: number
}

export interface AIServiceStatus {
  isAvailable: boolean
  isFallbackMode: boolean
  serviceStatus: 'unknown' | 'healthy' | 'degraded' | 'unavailable'
  consecutiveFailures: number
  lastHealthCheck: Date
  queueStatus: {
    pending: number
    processing: number
    completed: number
    failed: number
    activeRequests: number
  }
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

// Storage types
export interface StorageQuota {
  used: number
  quota: number
  percentage: number
}

// Canvas types
export interface CanvasState {
  zoom: number
  panOffset: Position
  selectedNodes: string[]
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number
}

// Search types
export interface SearchResult {
  type: 'session' | 'pattern' | 'node' | 'template'
  id: string
  title: string
  description?: string
  relevance: number
  metadata?: any
}

// Validation types
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
}

export interface SessionValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: ValidationWarning[]
  nodeErrors: Record<string, ValidationError[]>
  connectionErrors: Record<string, ValidationError[]>
}

// File Structure Planning types
export interface FileStructureNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  parent?: string
  children?: string[]
  fileType?: string
  icon?: string
  size?: number
  lastModified?: Date
  description?: string
  isTemplate?: boolean
}

export interface FileStructureTree {
  id: string
  name: string
  description?: string
  rootNodes: FileStructureNode[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    author?: string
    tags: string[]
  }
}

export interface FileTypeConfig {
  extension: string
  icon: string
  color: string
  category: 'source' | 'config' | 'documentation' | 'asset' | 'data' | 'other'
  description: string
  commonNames?: string[]
  templates?: FileTemplate[]
}

export interface FileTemplate {
  id: string
  name: string
  description: string
  content: string
  variables?: TemplateVariable[]
}

export interface TemplateVariable {
  name: string
  description: string
  type: 'string' | 'number' | 'boolean'
  default?: any
  required?: boolean
}

export interface PathValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface FileStructureExportOptions {
  format: 'zip' | 'bash' | 'json' | 'markdown'
  includeContent: boolean
  includeTemplates: boolean
  includeMetadata: boolean
  targetPlatform?: 'windows' | 'unix' | 'cross-platform'
}

// File Structure Planning types
export interface FileStructureNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  parent?: string
  children?: string[]
  fileType?: string
  icon?: string
  size?: number
  lastModified?: Date
  description?: string
  isTemplate?: boolean
}

export interface FileStructureTree {
  id: string
  name: string
  description?: string
  rootNodes: FileStructureNode[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    author?: string
    tags: string[]
  }
}

export interface FileTypeConfig {
  extension: string
  icon: string
  color: string
  category: 'source' | 'config' | 'documentation' | 'asset' | 'data' | 'other'
  description: string
  commonNames?: string[]
  templates?: FileTemplate[]
}

export interface FileTemplate {
  id: string
  name: string
  description: string
  content: string
  variables?: TemplateVariable[]
}

export interface TemplateVariable {
  name: string
  description: string
  type: 'string' | 'number' | 'boolean'
  default?: any
  required?: boolean
}

export interface PathValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface FileStructureExportOptions {
  format: 'zip' | 'bash' | 'json' | 'markdown'
  includeContent: boolean
  includeTemplates: boolean
  includeMetadata: boolean
  targetPlatform?: 'windows' | 'unix' | 'cross-platform'
}

// File Structure Planning types
export interface FileStructureNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  parent?: string
  children?: string[]
  fileType?: string
  icon?: string
  size?: number
  lastModified?: Date
  description?: string
  isTemplate?: boolean
}

export interface FileStructureTree {
  id: string
  name: string
  description?: string
  rootNodes: FileStructureNode[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
    author?: string
    tags: string[]
  }
}

export interface FileTypeConfig {
  extension: string
  icon: string
  color: string
  category: 'source' | 'config' | 'documentation' | 'asset' | 'data' | 'other'
  description: string
  commonNames?: string[]
  templates?: FileTemplate[]
}

export interface FileTemplate {
  id: string
  name: string
  description: string
  content: string
  variables?: TemplateVariable[]
}

export interface TemplateVariable {
  name: string
  description: string
  type: 'string' | 'number' | 'boolean'
  default?: any
  required?: boolean
}

export interface PathValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface FileStructureExportOptions {
  format: 'zip' | 'bash' | 'json' | 'markdown'
  includeContent: boolean
  includeTemplates: boolean
  includeMetadata: boolean
  targetPlatform?: 'windows' | 'unix' | 'cross-platform'
}

// Component Wireframe System types
export type ComponentType = 
  | 'Navbar' 
  | 'Button' 
  | 'Modal' 
  | 'Card' 
  | 'Form' 
  | 'Input' 
  | 'Select' 
  | 'Checkbox' 
  | 'Radio' 
  | 'Table' 
  | 'List' 
  | 'Grid' 
  | 'Sidebar' 
  | 'Header' 
  | 'Footer' 
  | 'Container' 
  | 'Custom'

export interface MethodParameter {
  name: string
  type: string
  required: boolean
  defaultValue?: any
  description?: string
}

export interface PropertyValidation {
  pattern?: string
  min?: number
  max?: number
  required?: boolean
  custom?: string
}

export interface ComponentProperty {
  id: string
  name: string
  type: string
  required: boolean
  defaultValue?: any
  description?: string
  validation?: PropertyValidation
}

export interface ComponentState {
  id: string
  name: string
  type: string
  initialValue: any
  description?: string
  isPrivate?: boolean
}

export interface ComponentMethod {
  id: string
  name: string
  parameters: MethodParameter[]
  returnType: string
  description?: string
  isAsync?: boolean
  visibility: 'public' | 'private' | 'protected'
}

export interface ComponentStyle {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  padding?: number
  margin?: number
  opacity?: number
  zIndex?: number
}

export interface ComponentMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  author?: string
  tags: string[]
  category: string
  complexity: 'simple' | 'moderate' | 'complex'
  framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'
}

export interface ComponentWireframe {
  id: string
  name: string
  type: 'component'
  componentType: ComponentType
  position: Position
  size: Size
  props: ComponentProperty[]
  state: ComponentState[]
  methods: ComponentMethod[]
  children?: string[]
  parent?: string
  style: ComponentStyle
  metadata: ComponentMetadata
}

export interface ComponentExample {
  id: string
  name: string
  description: string
  code: string
  preview?: string
  framework: string
}

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  componentType: ComponentType
  defaultProps: ComponentProperty[]
  defaultState: ComponentState[]
  defaultMethods: ComponentMethod[]
  defaultStyle: ComponentStyle
  icon: string
  category: string
  framework?: string
  examples: ComponentExample[]
}

// Re-export enhanced regex component types
export type {
  EnhancedRegexComponent,
  ComponentSearchOptions,
  AISuggestion,
  ValidationResult as EnhancedValidationResult
} from './enhanced-regex-components'

export interface ComponentRelationship {
  id: string
  parentId: string
  childId: string
  type: 'contains' | 'renders' | 'passes-props' | 'listens-to'
  description?: string
  metadata?: Record<string, any>
}

export interface ComponentHierarchy {
  id: string
  sessionId: string
  components: ComponentWireframe[]
  relationships: ComponentRelationship[]
  rootComponents: string[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
  }
}

export interface ComponentPaletteItem {
  id: string
  name: string
  componentType: ComponentType
  icon: string
  description: string
  category: string
  template: ComponentTemplate
  popularity: number
  isCustom: boolean
}

export interface ComponentValidationError {
  componentId: string
  field: string
  message: string
  code: string
  severity: 'error' | 'warning'
}

export interface ComponentValidationWarning {
  componentId: string
  field: string
  message: string
  code: string
  suggestion?: string
}

export interface ComponentValidationResult {
  isValid: boolean
  errors: ComponentValidationError[]
  warnings: ComponentValidationWarning[]
}

// Complexity Estimation types
export type ComplexityLevel = 1 | 2 | 3 | 4 | 5

export interface ComplexityEstimate {
  storyPoints: ComplexityLevel
  confidence: number // 0-1 scale
  factors: ComplexityFactor[]
  estimatedHours?: number
  actualHours?: number
  estimatedAt: Date
  estimatedBy?: 'user' | 'ai' | 'algorithm'
  notes?: string
}

export interface ComplexityFactor {
  id: string
  name: string
  description: string
  weight: number // 0-1 scale
  value: number // 0-1 scale
  category: ComplexityCategory
  reasoning?: string
}

export type ComplexityCategory = 
  | 'technical' 
  | 'scope' 
  | 'dependencies' 
  | 'uncertainty' 
  | 'integration' 
  | 'testing'

export interface ComplexityHeatmapData {
  nodeId: string
  complexity: ComplexityLevel
  position: Position
  size: Size
  color: string
  intensity: number // 0-1 scale
}

export interface ComplexityAnalysis {
  sessionId: string
  totalNodes: number
  averageComplexity: number
  complexityDistribution: Record<ComplexityLevel, number>
  highComplexityNodes: DevFlowNode[]
  complexityTrend: ComplexityTrendPoint[]
  estimationAccuracy: EstimationAccuracy
  recommendations: ComplexityRecommendation[]
}

export interface ComplexityTrendPoint {
  date: Date
  averageComplexity: number
  totalStoryPoints: number
  completedStoryPoints: number
  velocity: number
}

export interface EstimationAccuracy {
  totalEstimations: number
  accurateEstimations: number
  accuracyPercentage: number
  averageVariance: number
  overestimations: number
  underestimations: number
}

export interface ComplexityRecommendation {
  type: 'warning' | 'suggestion' | 'insight'
  title: string
  description: string
  nodeIds?: string[]
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface TimeEstimate {
  estimated: number // in hours
  actual?: number // in hours
  startTime?: Date
  endTime?: Date
  estimatedAt: Date
  estimatedBy?: 'user' | 'ai' | 'algorithm'
  confidence: number // 0-1 scale
  methodology: 'story-points' | 'historical' | 'expert' | 'ai-assisted'
  notes?: string
}

export interface ComplexitySettings {
  enableAutoEstimation: boolean
  defaultEstimationMethod: 'story-points' | 'time-based' | 'hybrid'
  storyPointToHoursRatio: number // hours per story point
  complexityFactors: ComplexityFactor[]
  showHeatmap: boolean
  heatmapOpacity: number
  enableAIAssistance: boolean
  trackEstimationAccuracy: boolean
}

// Timeline and Gantt View types
export interface TimelineView {
  id: string
  sessionId: string
  name: string
  description?: string
  tasks: TimelineTask[]
  milestones: Milestone[]
  dependencies: TaskDependency[]
  settings: TimelineSettings
  metadata: {
    createdAt: Date
    updatedAt: Date
    version: string
  }
}

export interface TimelineTask {
  id: string
  nodeId: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  duration: number // in hours
  progress: number // 0-100
  assignee?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled'
  color?: string
  tags: string[]
  estimatedHours: number
  actualHours?: number
  complexity?: ComplexityLevel
  parentTaskId?: string
  subtasks?: string[]
  position: {
    row: number
    level: number
  }
}

export interface Milestone {
  id: string
  name: string
  description?: string
  date: Date
  completed: boolean
  completedAt?: Date
  type: 'deadline' | 'checkpoint' | 'release' | 'review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  color?: string
  linkedTaskIds: string[]
  notifications: MilestoneNotification[]
}

export interface MilestoneNotification {
  id: string
  type: 'deadline-approaching' | 'deadline-passed' | 'milestone-completed'
  message: string
  daysBeforeDeadline?: number
  isActive: boolean
  sentAt?: Date
}

export interface TaskDependency {
  id: string
  predecessorId: string
  successorId: string
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
  lag?: number // in hours (can be negative for lead time)
  description?: string
  isActive: boolean
  createdAt: Date
}

export interface TimelineSettings {
  viewMode: 'days' | 'weeks' | 'months' | 'quarters'
  showWeekends: boolean
  showCriticalPath: boolean
  showDependencies: boolean
  showMilestones: boolean
  showProgress: boolean
  showAssignees: boolean
  autoSchedule: boolean
  workingHoursPerDay: number
  workingDaysPerWeek: number
  startDate?: Date
  endDate?: Date
  zoomLevel: number
  rowHeight: number
  columnWidth: number
  colors: TimelineColorScheme
}

export interface TimelineColorScheme {
  taskBar: string
  taskBarCompleted: string
  taskBarOverdue: string
  taskBarCritical: string
  milestone: string
  milestoneCompleted: string
  dependency: string
  criticalPath: string
  weekend: string
  today: string
  gridLines: string
  text: string
  background: string
}

export interface GanttChartData {
  tasks: TimelineTask[]
  milestones: Milestone[]
  dependencies: TaskDependency[]
  criticalPath: string[]
  timeScale: TimeScale
  viewport: GanttViewport
}

export interface TimeScale {
  unit: 'hour' | 'day' | 'week' | 'month' | 'quarter'
  startDate: Date
  endDate: Date
  intervals: TimeInterval[]
}

export interface TimeInterval {
  start: Date
  end: Date
  label: string
  isWeekend?: boolean
  isHoliday?: boolean
  isToday?: boolean
}

export interface GanttViewport {
  startDate: Date
  endDate: Date
  scrollLeft: number
  scrollTop: number
  zoomLevel: number
  visibleTasks: string[]
}

export interface TaskSchedulingResult {
  success: boolean
  scheduledTasks: TimelineTask[]
  conflicts: SchedulingConflict[]
  warnings: SchedulingWarning[]
  criticalPath: string[]
  projectEndDate: Date
  totalDuration: number
}

export interface SchedulingConflict {
  type: 'resource-conflict' | 'dependency-violation' | 'date-constraint-violation'
  taskIds: string[]
  description: string
  severity: 'low' | 'medium' | 'high'
  suggestions: string[]
}

export interface SchedulingWarning {
  type: 'tight-schedule' | 'long-dependency-chain' | 'resource-overallocation'
  taskIds: string[]
  description: string
  impact: string
  suggestions: string[]
}

export interface TaskDragData {
  taskId: string
  originalStartDate: Date
  originalEndDate: Date
  dragType: 'move' | 'resize-start' | 'resize-end'
  constraints: TaskConstraints
}

export interface TaskConstraints {
  minStartDate?: Date
  maxStartDate?: Date
  minEndDate?: Date
  maxEndDate?: Date
  minDuration?: number
  maxDuration?: number
  fixedDuration?: boolean
  respectDependencies: boolean
  respectWorkingHours: boolean
}

export interface TimelineExportOptions {
  format: 'pdf' | 'png' | 'svg' | 'excel' | 'csv' | 'json'
  includeTimeline: boolean
  includeMilestones: boolean
  includeDependencies: boolean
  includeProgress: boolean
  includeAssignees: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  customStyling?: TimelineColorScheme
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
}

export interface TimelineImportOptions {
  format: 'excel' | 'csv' | 'json' | 'mpp' | 'xml'
  mapping: FieldMapping
  options: {
    createMissingNodes: boolean
    updateExistingTasks: boolean
    preserveIds: boolean
    validateDependencies: boolean
  }
}

export interface FieldMapping {
  taskName: string
  startDate: string
  endDate: string
  duration: string
  progress: string
  assignee: string
  priority: string
  dependencies: string
  [key: string]: string
}

export interface CriticalPathAnalysis {
  path: string[]
  totalDuration: number
  slackTime: Record<string, number>
  bottlenecks: string[]
  recommendations: CriticalPathRecommendation[]
}

export interface CriticalPathRecommendation {
  type: 'reduce-duration' | 'parallelize-tasks' | 'remove-dependency' | 'add-resources'
  taskIds: string[]
  description: string
  potentialTimeSaving: number
  effort: 'low' | 'medium' | 'high'
  risk: 'low' | 'medium' | 'high'
}

export interface ResourceAllocation {
  assignee: string
  tasks: string[]
  totalHours: number
  utilizationPercentage: number
  conflicts: ResourceConflict[]
  availability: ResourceAvailability[]
}

export interface ResourceConflict {
  date: Date
  conflictingTasks: string[]
  totalHoursRequired: number
  availableHours: number
  severity: 'low' | 'medium' | 'high'
}

export interface ResourceAvailability {
  date: Date
  availableHours: number
  allocatedHours: number
  isWorkingDay: boolean
  notes?: string
}