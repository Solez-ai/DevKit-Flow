import type { 
  ComponentWireframe, 
  ComponentHierarchy,
  ComponentValidationResult,
  ComponentValidationError,
  ComponentValidationWarning,
  Position,
  Size
} from '../types'
// import { createComponentWireframe } from './component-wireframe-factory'

export class ComponentWireframeManager {
  private hierarchy: ComponentHierarchy

  constructor(sessionId: string) {
    this.hierarchy = {
      id: `hierarchy-${sessionId}`,
      sessionId,
      components: [],
      relationships: [],
      rootComponents: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  // Component CRUD operations
  addComponent(component: ComponentWireframe): void {
    this.hierarchy.components.push(component)
    
    // If no parent, add to root components
    if (!component.parent) {
      this.hierarchy.rootComponents.push(component.id)
    }
    
    this.updateMetadata()
  }

  removeComponent(componentId: string): void {
    // Remove component
    this.hierarchy.components = this.hierarchy.components.filter(c => c.id !== componentId)
    
    // Remove from root components
    this.hierarchy.rootComponents = this.hierarchy.rootComponents.filter(id => id !== componentId)
    
    // Remove all relationships involving this component
    this.hierarchy.relationships = this.hierarchy.relationships.filter(
      r => r.parentId !== componentId && r.childId !== componentId
    )
    
    // Update children of this component to remove parent reference
    this.hierarchy.components.forEach(component => {
      if (component.parent === componentId) {
        component.parent = undefined
        // Add to root if it has no other parent
        if (!this.hierarchy.rootComponents.includes(component.id)) {
          this.hierarchy.rootComponents.push(component.id)
        }
      }
      
      // Remove from children arrays
      if (component.children) {
        component.children = component.children.filter(id => id !== componentId)
      }
    })
    
    this.updateMetadata()
  }

  updateComponent(componentId: string, updates: Partial<ComponentWireframe>): void {
    const componentIndex = this.hierarchy.components.findIndex(c => c.id === componentId)
    if (componentIndex === -1) return

    const component = this.hierarchy.components[componentIndex]
    this.hierarchy.components[componentIndex] = {
      ...component,
      ...updates,
      metadata: {
        ...component.metadata,
        updatedAt: new Date()
      }
    }
    
    this.updateMetadata()
  }

  getComponent(componentId: string): ComponentWireframe | undefined {
    return this.hierarchy.components.find(c => c.id === componentId)
  }

  getAllComponents(): ComponentWireframe[] {
    return [...this.hierarchy.components]
  }

  // Hierarchy management
  setParentChild(parentId: string, childId: string): void {
    const parent = this.getComponent(parentId)
    const child = this.getComponent(childId)
    
    if (!parent || !child) return

    // Remove child from current parent if it has one
    if (child.parent) {
      this.removeParentChild(child.parent, childId)
    }

    // Remove from root components if it was there
    this.hierarchy.rootComponents = this.hierarchy.rootComponents.filter(id => id !== childId)

    // Set new parent-child relationship
    child.parent = parentId
    if (!parent.children) {
      parent.children = []
    }
    if (!parent.children.includes(childId)) {
      parent.children.push(childId)
    }

    // Add relationship
    const relationshipId = `rel-${parentId}-${childId}`
    const existingRelationship = this.hierarchy.relationships.find(r => r.id === relationshipId)
    
    if (!existingRelationship) {
      this.hierarchy.relationships.push({
        id: relationshipId,
        parentId,
        childId,
        type: 'contains',
        description: `${parent.name} contains ${child.name}`
      })
    }

    this.updateMetadata()
  }

  removeParentChild(parentId: string, childId: string): void {
    const parent = this.getComponent(parentId)
    const child = this.getComponent(childId)
    
    if (!parent || !child) return

    // Remove parent reference from child
    child.parent = undefined

    // Remove child from parent's children array
    if (parent.children) {
      parent.children = parent.children.filter(id => id !== childId)
    }

    // Add to root components if it has no parent
    if (!this.hierarchy.rootComponents.includes(childId)) {
      this.hierarchy.rootComponents.push(childId)
    }

    // Remove relationship
    this.hierarchy.relationships = this.hierarchy.relationships.filter(
      r => !(r.parentId === parentId && r.childId === childId)
    )

    this.updateMetadata()
  }

  getChildren(componentId: string): ComponentWireframe[] {
    const component = this.getComponent(componentId)
    if (!component || !component.children) return []

    return component.children
      .map(childId => this.getComponent(childId))
      .filter(Boolean) as ComponentWireframe[]
  }

  getParent(componentId: string): ComponentWireframe | undefined {
    const component = this.getComponent(componentId)
    if (!component || !component.parent) return undefined

    return this.getComponent(component.parent)
  }

  getRootComponents(): ComponentWireframe[] {
    return this.hierarchy.rootComponents
      .map(id => this.getComponent(id))
      .filter(Boolean) as ComponentWireframe[]
  }

  // Position and size management
  updatePosition(componentId: string, position: Position): void {
    this.updateComponent(componentId, { position })
  }

  updateSize(componentId: string, size: Size): void {
    this.updateComponent(componentId, { size })
  }

  // Validation
  validateComponent(component: ComponentWireframe): ComponentValidationResult {
    const errors: ComponentValidationError[] = []
    const warnings: ComponentValidationWarning[] = []

    // Validate name
    if (!component.name || component.name.trim().length === 0) {
      errors.push({
        componentId: component.id,
        field: 'name',
        message: 'Component name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }

    // Validate props
    component.props.forEach(prop => {
      if (!prop.name || prop.name.trim().length === 0) {
        errors.push({
          componentId: component.id,
          field: `props.${prop.id}.name`,
          message: 'Property name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      if (!prop.type || prop.type.trim().length === 0) {
        errors.push({
          componentId: component.id,
          field: `props.${prop.id}.type`,
          message: 'Property type is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      // Check for duplicate prop names
      const duplicates = component.props.filter(p => p.name === prop.name && p.id !== prop.id)
      if (duplicates.length > 0) {
        errors.push({
          componentId: component.id,
          field: `props.${prop.id}.name`,
          message: `Duplicate property name: ${prop.name}`,
          code: 'DUPLICATE_NAME',
          severity: 'error'
        })
      }
    })

    // Validate state
    component.state.forEach(state => {
      if (!state.name || state.name.trim().length === 0) {
        errors.push({
          componentId: component.id,
          field: `state.${state.id}.name`,
          message: 'State name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      if (!state.type || state.type.trim().length === 0) {
        errors.push({
          componentId: component.id,
          field: `state.${state.id}.type`,
          message: 'State type is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      // Check for duplicate state names
      const duplicates = component.state.filter(s => s.name === state.name && s.id !== state.id)
      if (duplicates.length > 0) {
        errors.push({
          componentId: component.id,
          field: `state.${state.id}.name`,
          message: `Duplicate state name: ${state.name}`,
          code: 'DUPLICATE_NAME',
          severity: 'error'
        })
      }
    })

    // Validate methods
    component.methods.forEach(method => {
      if (!method.name || method.name.trim().length === 0) {
        errors.push({
          componentId: component.id,
          field: `methods.${method.id}.name`,
          message: 'Method name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      if (!method.returnType || method.returnType.trim().length === 0) {
        errors.push({
          componentId: component.id,
          field: `methods.${method.id}.returnType`,
          message: 'Method return type is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        })
      }

      // Check for duplicate method names
      const duplicates = component.methods.filter(m => m.name === method.name && m.id !== method.id)
      if (duplicates.length > 0) {
        errors.push({
          componentId: component.id,
          field: `methods.${method.id}.name`,
          message: `Duplicate method name: ${method.name}`,
          code: 'DUPLICATE_NAME',
          severity: 'error'
        })
      }

      // Validate method parameters
      method.parameters.forEach((param, index) => {
        if (!param.name || param.name.trim().length === 0) {
          errors.push({
            componentId: component.id,
            field: `methods.${method.id}.parameters.${index}.name`,
            message: 'Parameter name is required',
            code: 'REQUIRED_FIELD',
            severity: 'error'
          })
        }

        if (!param.type || param.type.trim().length === 0) {
          errors.push({
            componentId: component.id,
            field: `methods.${method.id}.parameters.${index}.type`,
            message: 'Parameter type is required',
            code: 'REQUIRED_FIELD',
            severity: 'error'
          })
        }
      })
    })

    // Warnings
    if (component.props.length === 0 && component.componentType !== 'Container') {
      warnings.push({
        componentId: component.id,
        field: 'props',
        message: 'Component has no props defined',
        code: 'NO_PROPS',
        suggestion: 'Consider adding props to make the component more flexible'
      })
    }

    if (component.methods.length === 0 && ['Form', 'Modal', 'Button'].includes(component.componentType)) {
      warnings.push({
        componentId: component.id,
        field: 'methods',
        message: 'Interactive component has no methods defined',
        code: 'NO_METHODS',
        suggestion: 'Consider adding event handlers or utility methods'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateHierarchy(): ComponentValidationResult {
    const errors: ComponentValidationError[] = []
    const warnings: ComponentValidationWarning[] = []

    // Check for circular dependencies
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (componentId: string): boolean => {
      if (recursionStack.has(componentId)) return true
      if (visited.has(componentId)) return false

      visited.add(componentId)
      recursionStack.add(componentId)

      const component = this.getComponent(componentId)
      if (component && component.children) {
        for (const childId of component.children) {
          if (hasCycle(childId)) return true
        }
      }

      recursionStack.delete(componentId)
      return false
    }

    for (const component of this.hierarchy.components) {
      if (hasCycle(component.id)) {
        errors.push({
          componentId: component.id,
          field: 'hierarchy',
          message: 'Circular dependency detected in component hierarchy',
          code: 'CIRCULAR_DEPENDENCY',
          severity: 'error'
        })
      }
    }

    // Check for orphaned components
    const allReferencedIds = new Set<string>()
    this.hierarchy.rootComponents.forEach(id => allReferencedIds.add(id))
    this.hierarchy.components.forEach(component => {
      if (component.children) {
        component.children.forEach(childId => allReferencedIds.add(childId))
      }
    })

    this.hierarchy.components.forEach(component => {
      if (!allReferencedIds.has(component.id)) {
        warnings.push({
          componentId: component.id,
          field: 'hierarchy',
          message: 'Component is not referenced in hierarchy',
          code: 'ORPHANED_COMPONENT',
          suggestion: 'Add component to hierarchy or remove it'
        })
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Export/Import
  exportHierarchy(): ComponentHierarchy {
    return { ...this.hierarchy }
  }

  importHierarchy(hierarchy: ComponentHierarchy): void {
    this.hierarchy = { ...hierarchy }
  }

  // Utility methods
  private updateMetadata(): void {
    this.hierarchy.metadata.updatedAt = new Date()
  }

  getHierarchyStats() {
    return {
      totalComponents: this.hierarchy.components.length,
      rootComponents: this.hierarchy.rootComponents.length,
      relationships: this.hierarchy.relationships.length,
      componentsByType: this.getComponentsByType(),
      maxDepth: this.getMaxDepth()
    }
  }

  private getComponentsByType(): Record<string, number> {
    const counts: Record<string, number> = {}
    this.hierarchy.components.forEach(component => {
      counts[component.componentType] = (counts[component.componentType] || 0) + 1
    })
    return counts
  }

  private getMaxDepth(): number {
    const getDepth = (componentId: string, currentDepth = 0): number => {
      const component = this.getComponent(componentId)
      if (!component || !component.children || component.children.length === 0) {
        return currentDepth
      }

      let maxChildDepth = currentDepth
      for (const childId of component.children) {
        const childDepth = getDepth(childId, currentDepth + 1)
        maxChildDepth = Math.max(maxChildDepth, childDepth)
      }

      return maxChildDepth
    }

    let maxDepth = 0
    for (const rootId of this.hierarchy.rootComponents) {
      const depth = getDepth(rootId)
      maxDepth = Math.max(maxDepth, depth)
    }

    return maxDepth
  }
}