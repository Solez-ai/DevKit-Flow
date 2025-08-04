# Smart Git Commit Generator

## Overview

The Smart Git Commit Generator is a comprehensive system that analyzes your DevFlow Studio sessions and automatically generates meaningful commit messages following conventional commit format. It analyzes completed todos, modified nodes, and code snippets to create contextually relevant commit suggestions.

## Features

### 🔍 Commit Analysis Engine (`src/lib/commit-analysis.ts`)

- **Session Analysis**: Analyzes DevFlow sessions to extract commit-relevant information
- **Todo Analysis**: Identifies completed todos and extracts commit types from their content
- **Node Analysis**: Examines modified nodes for additional context and scope information
- **Code Analysis**: Reviews code snippets for technical details and language context
- **Keyword Detection**: Automatically detects commit types (feat, fix, docs, etc.) from text content
- **Scope Extraction**: Intelligently extracts scopes from node titles, tags, and content
- **Confidence Scoring**: Provides confidence scores for generated suggestions

### 📝 Commit Message Generator (`src/lib/commit-generator.ts`)

- **Conventional Commits**: Generates messages following conventional commit format
- **Customizable Templates**: User-defined templates for different commit types
- **Custom Patterns**: Regex-based patterns for automatic text transformation
- **Message Validation**: Validates generated messages against format rules
- **Multiple Variations**: Generates alternative message variations
- **Rule Management**: Import/export functionality for generation rules

### 🎨 User Interface Components

#### Commit Preview (`src/components/commit/commit-preview.tsx`)
- Interactive preview of generated commit messages
- Real-time editing capabilities
- Copy-to-clipboard functionality
- Commit history tracking
- Validation status display
- Multiple suggestion tabs

#### Commit Settings (`src/components/commit/commit-settings.tsx`)
- Comprehensive settings interface
- Format configuration (length limits, case enforcement)
- Template customization for each commit type
- Custom pattern management with regex support
- Import/export settings functionality
- Advanced options (auto-generation, metadata inclusion)

#### Main Generator (`src/components/commit/commit-generator.tsx`)
- Orchestrates the entire commit generation process
- Session analysis summary
- Error handling and user feedback
- Integration with app state management

## Usage

### Basic Usage

1. **Open DevFlow Studio** and work on your coding session
2. **Complete todos** and modify nodes as you work
3. **Click "Generate Commit"** in the toolbar
4. **Review suggestions** and select the best one
5. **Copy to clipboard** and use in your git workflow

### Advanced Configuration

Access the settings panel to customize:

- **Message Format**: Subject/body length limits, case enforcement
- **Templates**: Customize message templates for each commit type
- **Custom Patterns**: Create regex patterns for automatic text transformation
- **Behavior**: Auto-generation, metadata inclusion, validation rules

## Technical Implementation

### Architecture

```
CommitGenerator (UI Component)
    ↓
CommitAnalysisEngine (Analysis)
    ↓
CommitMessageGenerator (Formatting)
    ↓
Generated Commit Messages
```

### Key Algorithms

1. **Type Detection**: Uses keyword matching against predefined patterns
2. **Scope Extraction**: Regex-based extraction from titles and tags
3. **Confidence Calculation**: Multi-factor scoring based on available data
4. **Message Generation**: Template-based formatting with customizable rules

### Data Flow

1. **Session Analysis**: Extract completed todos, modified nodes, code snippets
2. **Content Analysis**: Analyze text for commit types, scopes, and descriptions
3. **Suggestion Generation**: Create multiple commit suggestions with confidence scores
4. **Message Formatting**: Apply templates and rules to generate final messages
5. **User Interaction**: Present options, allow editing, provide validation

## Integration

The commit generator is integrated into the DevFlow Studio workspace:

- **Toolbar Button**: "Generate Commit" button in the canvas toolbar
- **Modal Interface**: Opens in a dialog for focused interaction
- **State Management**: Uses Zustand store for session data
- **Real-time Updates**: Automatically regenerates when session changes

## Customization

### Templates

Default templates follow conventional commit format:
```
feat(scope): description

body with detailed changes
```

### Custom Patterns

Create regex patterns to transform descriptions:
```javascript
{
  pattern: /fix.*bug/i,
  replacement: "resolve issue",
  type: "fix",
  scope: "bugfix"
}
```

### Generation Rules

Configure behavior:
- Auto-generation on session changes
- Include timestamps and author info
- Validation strictness
- Message length limits

## Demo

Run the demo function to see the generator in action:

```javascript
import { demonstrateCommitGeneration } from '@/lib/commit-demo'
demonstrateCommitGeneration()
```

This will show:
- Session analysis results
- Generated suggestions with confidence scores
- Formatted commit messages
- Detailed breakdown of analysis

## Future Enhancements

- **Machine Learning**: Train models on commit history for better suggestions
- **Git Integration**: Direct integration with git commands
- **Team Patterns**: Share custom patterns across team members
- **Analytics**: Track commit message quality and patterns over time
- **Multi-language**: Support for commit messages in different languages

## Files Structure

```
src/
├── lib/
│   ├── commit-analysis.ts      # Core analysis engine
│   ├── commit-generator.ts     # Message generation and formatting
│   └── commit-demo.ts          # Demo and testing utilities
├── components/
│   └── commit/
│       ├── commit-generator.tsx    # Main UI component
│       ├── commit-preview.tsx      # Message preview interface
│       ├── commit-settings.tsx     # Settings configuration
│       └── index.ts               # Exports
└── types/
    └── index.ts               # TypeScript interfaces
```

The Smart Git Commit Generator transforms the way developers create commit messages by leveraging the rich context available in DevFlow Studio sessions, making version control more meaningful and consistent.