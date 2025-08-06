import React, { useState } from 'react'
import { PatternBuilderCanvas } from './pattern-builder-canvas'
import { RealTimeRegexGenerator } from './real-time-regex-generator'
import { AdvancedPatternExplainer } from './advanced-pattern-explainer'
import type { PlacedComponent } from '../../types'

export function TestEnhancedPatternBuilder() {
  const [components, setComponents] = useState<PlacedComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponent | null>(null)
  const [currentPattern, setCurrentPattern] = useState('')
  const [testString, setTestString] = useState('hello world 123')

  const handlePatternGenerated = (pattern: string) => {
    setCurrentPattern(pattern)
  }

  const handleMatchesChange = (matches: any[]) => {
    console.log('Matches:', matches)
  }

  const handlePerformanceUpdate = (metrics: any) => {
    console.log('Performance:', metrics)
  }

  const handleExplanationReceived = (explanation: any) => {
    console.log('Explanation:', explanation)
  }

  return (
    <div className="h-screen flex">
      {/* Pattern Builder */}
      <div className="w-1/2 border-r">
        <PatternBuilderCanvas
          components={components}
          onComponentsChange={setComponents}
          onComponentSelect={setSelectedComponent}
          selectedComponent={selectedComponent}
          testString={testString}
          onPatternGenerated={handlePatternGenerated}
          canUndo={false}
          canRedo={false}
        />
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Real-time Generator */}
        <div className="h-1/2 border-b">
          <RealTimeRegexGenerator
            components={components}
            testString={testString}
            onPatternChange={(pattern, isValid) => {
              setCurrentPattern(pattern)
              console.log('Pattern changed:', pattern, 'Valid:', isValid)
            }}
            onMatchesChange={handleMatchesChange}
            onPerformanceUpdate={handlePerformanceUpdate}
          />
        </div>

        {/* Advanced Explainer */}
        <div className="h-1/2">
          <AdvancedPatternExplainer
            pattern={currentPattern}
            components={components}
            testString={testString}
            onExplanationReceived={handleExplanationReceived}
          />
        </div>
      </div>
    </div>
  )
}