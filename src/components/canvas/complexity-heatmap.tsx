import React from 'react'
import { motion } from 'framer-motion'
import type { ComplexityHeatmapData, ComplexityLevel } from '@/types'
import { useComplexityHeatmap } from '@/hooks/use-complexity-estimation'
import type { DevFlowSession } from '@/types'

interface ComplexityHeatmapProps {
  session: DevFlowSession | null
  className?: string
}

export function ComplexityHeatmap({ session, className }: ComplexityHeatmapProps) {
  const { heatmapData, isVisible, opacity } = useComplexityHeatmap(session)

  if (!isVisible || !session || heatmapData.length === 0) {
    return null
  }

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {heatmapData.map((data) => (
        <ComplexityHeatmapNode key={data.nodeId} data={data} />
      ))}
    </div>
  )
}

interface ComplexityHeatmapNodeProps {
  data: ComplexityHeatmapData
}

function ComplexityHeatmapNode({ data }: ComplexityHeatmapNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: data.intensity, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute rounded-lg border-2"
      style={{
        left: data.position.x,
        top: data.position.y,
        width: data.size.width,
        height: data.size.height,
        backgroundColor: `${data.color}20`, // 20% opacity
        borderColor: data.color,
        boxShadow: `0 0 ${data.intensity * 20}px ${data.color}40`
      }}
    >
      {/* Complexity indicator */}
      <div 
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
        style={{ backgroundColor: data.color }}
      >
        {data.complexity}
      </div>
      
      {/* Pulse animation for high complexity */}
      {data.complexity >= 4 && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{ backgroundColor: data.color }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}

interface ComplexityLegendProps {
  className?: string
}

export function ComplexityLegend({ className }: ComplexityLegendProps) {
  const complexityLevels: Array<{ level: ComplexityLevel; label: string; color: string }> = [
    { level: 1, label: 'Simple', color: '#22c55e' },
    { level: 2, label: 'Easy', color: '#84cc16' },
    { level: 3, label: 'Moderate', color: '#eab308' },
    { level: 4, label: 'Complex', color: '#f97316' },
    { level: 5, label: 'Very Complex', color: '#ef4444' }
  ]

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg ${className}`}>
      <h4 className="text-sm font-medium mb-2">Complexity</h4>
      <div className="space-y-1">
        {complexityLevels.map((level) => (
          <div key={level.level} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: level.color }}
            />
            <span className="font-medium">{level.level}</span>
            <span className="text-muted-foreground">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComplexityHeatmap