import { useState, useCallback, useRef } from 'react'
import type { ComponentWireframe, ComponentHierarchy, ComponentValidationResult } from '../types'
import { ComponentWireframeManager } from '../lib/component-wireframe-manager'

export interface UseComponentWireframesReturn {
  components: ComponentWireframe[]
  hierarchy: ComponentHierarchy | null
  manager: ComponentWireframeManager | null
  addComponent: (component: ComponentWireframe) => void
  removeComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<ComponentWireframe>) => void
  setParentChild: (parentId: string, childId: string) => void
  removeParentChild: (parentId: string, childId: string) => void
  getChildren: (componentId: string) => ComponentWireframe[]
  getParent: (componentId: string) => ComponentWireframe | undefined
  getRootComponents: () => ComponentWireframe[]
  validateComponent: (component: ComponentWireframe) => ComponentValidationResult
  validateHierarchy: () => ComponentValidationResult
  exportHierarchy: () => ComponentHierarchy | null
  importHierarchy: (hierarchy: ComponentHierarchy) => void
  getHierarchyStats: () => any
  clearAll: () => void
}

export function useComponentWireframes(sessionId: string): UseComponentWireframesReturn {
  const managerRef = useRef<ComponentWireframeManager | null>(null)
  const [components, setComponents] = useState<ComponentWireframe[]>([])
  const [hierarchy, setHierarchy] = useState<ComponentHierarchy | null>(null)

  // Initialize manager
  if (!managerRef.current) {
    managerRef.current = new ComponentWireframeManager(sessionId)
    setHierarchy(managerRef.current.exportHierarchy())
  }

  const updateState = useCallback(() => {
    if (managerRef.current) {
      const newComponents = managerRef.current.getAllComponents()
      const newHierarchy = managerRef.current.exportHierarchy()
      setComponents(newComponents)
      setHierarchy(newHierarchy)
    }
  }, [])

  const addComponent = useCallback((component: ComponentWireframe) => {
    if (managerRef.current) {
      managerRef.current.addComponent(component)
      updateState()
    }
  }, [updateState])

  const removeComponent = useCallback((componentId: string) => {
    if (managerRef.current) {
      managerRef.current.removeComponent(componentId)
      updateState()
    }
  }, [updateState])

  const updateComponent = useCallback((componentId: string, updates: Partial<ComponentWireframe>) => {
    if (managerRef.current) {
      managerRef.current.updateComponent(componentId, updates)
      updateState()
    }
  }, [updateState])

  const setParentChild = useCallback((parentId: string, childId: string) => {
    if (managerRef.current) {
      managerRef.current.setParentChild(parentId, childId)
      updateState()
    }
  }, [updateState])

  const removeParentChild = useCallback((parentId: string, childId: string) => {
    if (managerRef.current) {
      managerRef.current.removeParentChild(parentId, childId)
      updateState()
    }
  }, [updateState])

  const getChildren = useCallback((componentId: string): ComponentWireframe[] => {
    return managerRef.current?.getChildren(componentId) || []
  }, [])

  const getParent = useCallback((componentId: string): ComponentWireframe | undefined => {
    return managerRef.current?.getParent(componentId)
  }, [])

  const getRootComponents = useCallback((): ComponentWireframe[] => {
    return managerRef.current?.getRootComponents() || []
  }, [])

  const validateComponent = useCallback((component: ComponentWireframe): ComponentValidationResult => {
    return managerRef.current?.validateComponent(component) || {
      isValid: false,
      errors: [],
      warnings: []
    }
  }, [])

  const validateHierarchy = useCallback((): ComponentValidationResult => {
    return managerRef.current?.validateHierarchy() || {
      isValid: false,
      errors: [],
      warnings: []
    }
  }, [])

  const exportHierarchy = useCallback((): ComponentHierarchy | null => {
    return managerRef.current?.exportHierarchy() || null
  }, [])

  const importHierarchy = useCallback((newHierarchy: ComponentHierarchy) => {
    if (managerRef.current) {
      managerRef.current.importHierarchy(newHierarchy)
      updateState()
    }
  }, [updateState])

  const getHierarchyStats = useCallback(() => {
    return managerRef.current?.getHierarchyStats() || {
      totalComponents: 0,
      rootComponents: 0,
      relationships: 0,
      componentsByType: {},
      maxDepth: 0
    }
  }, [])

  const clearAll = useCallback(() => {
    if (managerRef.current) {
      // Create a new manager to clear everything
      managerRef.current = new ComponentWireframeManager(sessionId)
      updateState()
    }
  }, [sessionId, updateState])

  return {
    components,
    hierarchy,
    manager: managerRef.current,
    addComponent,
    removeComponent,
    updateComponent,
    setParentChild,
    removeParentChild,
    getChildren,
    getParent,
    getRootComponents,
    validateComponent,
    validateHierarchy,
    exportHierarchy,
    importHierarchy,
    getHierarchyStats,
    clearAll
  }
}