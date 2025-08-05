#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define all the fixes we need to make
const fixes = [
  // Remove unused React imports
  {
    file: 'src/components/analytics/blocked-nodes-panel.tsx',
    find: "import React from 'react'",
    replace: ""
  },
  {
    file: 'src/components/analytics/productivity-insights.tsx',
    find: "import React from 'react'",
    replace: ""
  },
  {
    file: 'src/components/analytics/progress-chart.tsx',
    find: "import React from 'react'",
    replace: ""
  },
  {
    file: 'src/components/analytics/progress-dashboard.tsx',
    find: "import React from 'react'",
    replace: ""
  },
  {
    file: 'src/components/analytics/progress-visualization-demo.tsx',
    find: "import React from 'react'",
    replace: ""
  },
  {
    file: 'src/components/canvas/complexity-heatmap.tsx',
    find: "import React from 'react'",
    replace: ""
  },
  {
    file: 'src/components/file-structure/FileStructureDemo.tsx',
    find: "import React from 'react'",
    replace: ""
  },
  {
    file: 'src/components/ui/collapsible.tsx',
    find: "import * as React from \"react\"",
    replace: ""
  },
  
  // Remove unused variables and imports
  {
    file: 'src/App.tsx',
    find: "const { theme } = useTheme()",
    replace: "useTheme() // theme not used"
  },
  {
    file: 'src/components/analytics/exportable-progress-reports.tsx',
    find: "import React, { useState } from 'react'",
    replace: "import { useState } from 'react'"
  },
  {
    file: 'src/components/file-structure/FileStructureExportDialog.tsx',
    find: "import React, { useState } from 'react'",
    replace: "import { useState } from 'react'"
  },
  {
    file: 'src/components/file-structure/FileStructurePlanner.tsx',
    find: "import React, { useState, useCallback } from 'react'",
    replace: "import { useState, useCallback } from 'react'"
  },
  
  // Remove unused imports from AI components
  {
    file: 'src/components/ai/enhanced-ai-fallback-manager.tsx',
    find: "import React, { useState, useEffect, useCallback } from 'react'",
    replace: "import { useState, useEffect, useCallback } from 'react'"
  },
  
  // Fix unused variables by removing them
  {
    file: 'src/components/analytics/complexity-estimation.tsx',
    find: "import { useState } from 'react'",
    replace: "// useState not used in this component"
  },
  {
    file: 'src/components/regexr/component-parameter-panel.tsx',
    find: "const [showPreview, setShowPreview] = useState(true)",
    replace: "// showPreview state removed - not used"
  },
  {
    file: 'src/components/regexr/component-palette.tsx',
    find: "searchPatternLibrary",
    replace: "// searchPatternLibrary removed - not used"
  },
  
  // Remove unused imports from various files
  {
    file: 'src/components/analytics/comprehensive-progress-visualization.tsx',
    find: "  Eye,\n  EyeOff",
    replace: "  // Eye, EyeOff removed - not used"
  },
  {
    file: 'src/components/analytics/comprehensive-progress-visualization.tsx',
    find: "import { Separator } from '@/components/ui/separator'",
    replace: ""
  },
  {
    file: 'src/components/analytics/exportable-progress-reports.tsx',
    find: "  Image,",
    replace: ""
  },
  {
    file: 'src/components/analytics/exportable-progress-reports.tsx',
    find: "  Calendar,",
    replace: ""
  },
  {
    file: 'src/components/analytics/progress-visualization-demo.tsx',
    find: "import { Button } from '@/components/ui/button'",
    replace: ""
  },
  {
    file: 'src/components/analytics/progress-visualization-demo.tsx',
    find: "  Zap,\n  AlertTriangle,",
    replace: ""
  },
  {
    file: 'src/components/analytics/progress-visualization-demo.tsx',
    find: "import { ComprehensiveProgressVisualization } from './comprehensive-progress-visualization'",
    replace: ""
  }
];

// Apply all fixes
fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(fix.find)) {
      content = content.replace(fix.find, fix.replace);
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${fix.file}`);
    }
  }
});

console.log('TypeScript error fixes applied!');