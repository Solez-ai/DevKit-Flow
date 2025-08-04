import type { 
  ComponentWireframe, 
  ComponentType, 
  ComponentTemplate,
  Position,
  Size
} from '../types'

// Default component templates
export const componentTemplates: Record<ComponentType, ComponentTemplate> = {
  Navbar: {
    id: 'navbar-template',
    name: 'Navigation Bar',
    description: 'A horizontal navigation bar component',
    componentType: 'Navbar',
    defaultProps: [
      {
        id: 'nav-brand',
        name: 'brand',
        type: 'string',
        required: false,
        defaultValue: 'Brand',
        description: 'Brand name or logo text'
      },
      {
        id: 'nav-links',
        name: 'links',
        type: 'Array<{label: string, href: string}>',
        required: true,
        defaultValue: [],
        description: 'Navigation links array'
      },
      {
        id: 'nav-fixed',
        name: 'fixed',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Whether the navbar is fixed to top'
      }
    ],
    defaultState: [
      {
        id: 'nav-mobile-open',
        name: 'isMobileMenuOpen',
        type: 'boolean',
        initialValue: false,
        description: 'Controls mobile menu visibility'
      }
    ],
    defaultMethods: [
      {
        id: 'nav-toggle-mobile',
        name: 'toggleMobileMenu',
        parameters: [],
        returnType: 'void',
        description: 'Toggles mobile menu open/closed',
        visibility: 'public'
      }
    ],
    defaultStyle: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 16,
      zIndex: 50
    },
    icon: 'Menu',
    category: 'Navigation',
    framework: 'react',
    examples: []
  },
  Button: {
    id: 'button-template',
    name: 'Button',
    description: 'A clickable button component',
    componentType: 'Button',
    defaultProps: [
      {
        id: 'btn-text',
        name: 'children',
        type: 'React.ReactNode',
        required: true,
        defaultValue: 'Button',
        description: 'Button content'
      },
      {
        id: 'btn-variant',
        name: 'variant',
        type: '"primary" | "secondary" | "outline" | "ghost"',
        required: false,
        defaultValue: 'primary',
        description: 'Button visual variant'
      },
      {
        id: 'btn-size',
        name: 'size',
        type: '"sm" | "md" | "lg"',
        required: false,
        defaultValue: 'md',
        description: 'Button size'
      },
      {
        id: 'btn-disabled',
        name: 'disabled',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Whether button is disabled'
      },
      {
        id: 'btn-onclick',
        name: 'onClick',
        type: '() => void',
        required: false,
        description: 'Click handler function'
      }
    ],
    defaultState: [
      {
        id: 'btn-loading',
        name: 'isLoading',
        type: 'boolean',
        initialValue: false,
        description: 'Loading state for async operations'
      }
    ],
    defaultMethods: [
      {
        id: 'btn-handle-click',
        name: 'handleClick',
        parameters: [
          {
            name: 'event',
            type: 'React.MouseEvent',
            required: true,
            description: 'Click event object'
          }
        ],
        returnType: 'void',
        description: 'Handles button click events',
        visibility: 'private'
      }
    ],
    defaultStyle: {
      backgroundColor: '#3b82f6',
      borderRadius: 6,
      padding: 12
    },
    icon: 'Square',
    category: 'Form',
    framework: 'react',
    examples: []
  },
  Modal: {
    id: 'modal-template',
    name: 'Modal',
    description: 'A modal dialog component',
    componentType: 'Modal',
    defaultProps: [
      {
        id: 'modal-open',
        name: 'isOpen',
        type: 'boolean',
        required: true,
        defaultValue: false,
        description: 'Controls modal visibility'
      },
      {
        id: 'modal-title',
        name: 'title',
        type: 'string',
        required: false,
        defaultValue: 'Modal Title',
        description: 'Modal title text'
      },
      {
        id: 'modal-onclose',
        name: 'onClose',
        type: '() => void',
        required: true,
        description: 'Function called when modal should close'
      },
      {
        id: 'modal-children',
        name: 'children',
        type: 'React.ReactNode',
        required: false,
        description: 'Modal content'
      }
    ],
    defaultState: [
      {
        id: 'modal-animation',
        name: 'isAnimating',
        type: 'boolean',
        initialValue: false,
        description: 'Controls modal animation state'
      }
    ],
    defaultMethods: [
      {
        id: 'modal-handle-escape',
        name: 'handleEscapeKey',
        parameters: [
          {
            name: 'event',
            type: 'KeyboardEvent',
            required: true,
            description: 'Keyboard event'
          }
        ],
        returnType: 'void',
        description: 'Handles escape key press to close modal',
        visibility: 'private'
      },
      {
        id: 'modal-handle-backdrop',
        name: 'handleBackdropClick',
        parameters: [
          {
            name: 'event',
            type: 'React.MouseEvent',
            required: true,
            description: 'Click event'
          }
        ],
        returnType: 'void',
        description: 'Handles backdrop click to close modal',
        visibility: 'private'
      }
    ],
    defaultStyle: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 24,
      zIndex: 100
    },
    icon: 'Square',
    category: 'Overlay',
    framework: 'react',
    examples: []
  },
  Card: {
    id: 'card-template',
    name: 'Card',
    description: 'A card container component',
    componentType: 'Card',
    defaultProps: [
      {
        id: 'card-title',
        name: 'title',
        type: 'string',
        required: false,
        description: 'Card title'
      },
      {
        id: 'card-children',
        name: 'children',
        type: 'React.ReactNode',
        required: false,
        description: 'Card content'
      },
      {
        id: 'card-variant',
        name: 'variant',
        type: '"default" | "outlined" | "elevated"',
        required: false,
        defaultValue: 'default',
        description: 'Card visual variant'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 8,
      padding: 16
    },
    icon: 'Square',
    category: 'Layout',
    framework: 'react',
    examples: []
  },
  Form: {
    id: 'form-template',
    name: 'Form',
    description: 'A form container component',
    componentType: 'Form',
    defaultProps: [
      {
        id: 'form-onsubmit',
        name: 'onSubmit',
        type: '(data: any) => void',
        required: true,
        description: 'Form submission handler'
      },
      {
        id: 'form-children',
        name: 'children',
        type: 'React.ReactNode',
        required: false,
        description: 'Form fields and content'
      }
    ],
    defaultState: [
      {
        id: 'form-data',
        name: 'formData',
        type: 'Record<string, any>',
        initialValue: {},
        description: 'Form field values'
      },
      {
        id: 'form-errors',
        name: 'errors',
        type: 'Record<string, string>',
        initialValue: {},
        description: 'Form validation errors'
      },
      {
        id: 'form-submitting',
        name: 'isSubmitting',
        type: 'boolean',
        initialValue: false,
        description: 'Form submission state'
      }
    ],
    defaultMethods: [
      {
        id: 'form-handle-submit',
        name: 'handleSubmit',
        parameters: [
          {
            name: 'event',
            type: 'React.FormEvent',
            required: true,
            description: 'Form submit event'
          }
        ],
        returnType: 'void',
        description: 'Handles form submission',
        visibility: 'private'
      },
      {
        id: 'form-validate',
        name: 'validateForm',
        parameters: [],
        returnType: 'boolean',
        description: 'Validates all form fields',
        visibility: 'private'
      }
    ],
    defaultStyle: {
      padding: 16
    },
    icon: 'FileText',
    category: 'Form',
    framework: 'react',
    examples: []
  },
  Input: {
    id: 'input-template',
    name: 'Input',
    description: 'A text input component',
    componentType: 'Input',
    defaultProps: [
      {
        id: 'input-type',
        name: 'type',
        type: '"text" | "email" | "password" | "number"',
        required: false,
        defaultValue: 'text',
        description: 'Input type'
      },
      {
        id: 'input-placeholder',
        name: 'placeholder',
        type: 'string',
        required: false,
        description: 'Placeholder text'
      },
      {
        id: 'input-value',
        name: 'value',
        type: 'string',
        required: false,
        description: 'Input value'
      },
      {
        id: 'input-onchange',
        name: 'onChange',
        type: '(value: string) => void',
        required: false,
        description: 'Value change handler'
      },
      {
        id: 'input-required',
        name: 'required',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Whether input is required'
      }
    ],
    defaultState: [
      {
        id: 'input-focused',
        name: 'isFocused',
        type: 'boolean',
        initialValue: false,
        description: 'Input focus state'
      }
    ],
    defaultMethods: [
      {
        id: 'input-handle-focus',
        name: 'handleFocus',
        parameters: [],
        returnType: 'void',
        description: 'Handles input focus',
        visibility: 'private'
      },
      {
        id: 'input-handle-blur',
        name: 'handleBlur',
        parameters: [],
        returnType: 'void',
        description: 'Handles input blur',
        visibility: 'private'
      }
    ],
    defaultStyle: {
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 4,
      padding: 8
    },
    icon: 'Type',
    category: 'Form',
    framework: 'react',
    examples: []
  },
  Select: {
    id: 'select-template',
    name: 'Select',
    description: 'A dropdown select component',
    componentType: 'Select',
    defaultProps: [
      {
        id: 'select-options',
        name: 'options',
        type: 'Array<{value: string, label: string}>',
        required: true,
        defaultValue: [],
        description: 'Select options'
      },
      {
        id: 'select-value',
        name: 'value',
        type: 'string',
        required: false,
        description: 'Selected value'
      },
      {
        id: 'select-onchange',
        name: 'onChange',
        type: '(value: string) => void',
        required: false,
        description: 'Selection change handler'
      },
      {
        id: 'select-placeholder',
        name: 'placeholder',
        type: 'string',
        required: false,
        defaultValue: 'Select an option',
        description: 'Placeholder text'
      }
    ],
    defaultState: [
      {
        id: 'select-open',
        name: 'isOpen',
        type: 'boolean',
        initialValue: false,
        description: 'Dropdown open state'
      }
    ],
    defaultMethods: [
      {
        id: 'select-toggle',
        name: 'toggleDropdown',
        parameters: [],
        returnType: 'void',
        description: 'Toggles dropdown open/closed',
        visibility: 'private'
      }
    ],
    defaultStyle: {
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 4,
      padding: 8
    },
    icon: 'ChevronDown',
    category: 'Form',
    framework: 'react',
    examples: []
  },
  Checkbox: {
    id: 'checkbox-template',
    name: 'Checkbox',
    description: 'A checkbox input component',
    componentType: 'Checkbox',
    defaultProps: [
      {
        id: 'checkbox-checked',
        name: 'checked',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Checkbox checked state'
      },
      {
        id: 'checkbox-onchange',
        name: 'onChange',
        type: '(checked: boolean) => void',
        required: false,
        description: 'Check state change handler'
      },
      {
        id: 'checkbox-label',
        name: 'label',
        type: 'string',
        required: false,
        description: 'Checkbox label text'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 2
    },
    icon: 'Square',
    category: 'Form',
    framework: 'react',
    examples: []
  },
  Radio: {
    id: 'radio-template',
    name: 'Radio',
    description: 'A radio button component',
    componentType: 'Radio',
    defaultProps: [
      {
        id: 'radio-name',
        name: 'name',
        type: 'string',
        required: true,
        description: 'Radio group name'
      },
      {
        id: 'radio-value',
        name: 'value',
        type: 'string',
        required: true,
        description: 'Radio button value'
      },
      {
        id: 'radio-checked',
        name: 'checked',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Radio checked state'
      },
      {
        id: 'radio-onchange',
        name: 'onChange',
        type: '(value: string) => void',
        required: false,
        description: 'Selection change handler'
      },
      {
        id: 'radio-label',
        name: 'label',
        type: 'string',
        required: false,
        description: 'Radio button label'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 50
    },
    icon: 'Circle',
    category: 'Form',
    framework: 'react',
    examples: []
  },
  Table: {
    id: 'table-template',
    name: 'Table',
    description: 'A data table component',
    componentType: 'Table',
    defaultProps: [
      {
        id: 'table-columns',
        name: 'columns',
        type: 'Array<{key: string, label: string, sortable?: boolean}>',
        required: true,
        defaultValue: [],
        description: 'Table column definitions'
      },
      {
        id: 'table-data',
        name: 'data',
        type: 'Array<Record<string, any>>',
        required: true,
        defaultValue: [],
        description: 'Table row data'
      },
      {
        id: 'table-sortable',
        name: 'sortable',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Enable column sorting'
      }
    ],
    defaultState: [
      {
        id: 'table-sort',
        name: 'sortConfig',
        type: '{key: string, direction: "asc" | "desc"} | null',
        initialValue: null,
        description: 'Current sort configuration'
      }
    ],
    defaultMethods: [
      {
        id: 'table-handle-sort',
        name: 'handleSort',
        parameters: [
          {
            name: 'columnKey',
            type: 'string',
            required: true,
            description: 'Column key to sort by'
          }
        ],
        returnType: 'void',
        description: 'Handles column sorting',
        visibility: 'private'
      }
    ],
    defaultStyle: {
      borderColor: '#e5e7eb',
      borderWidth: 1
    },
    icon: 'Table',
    category: 'Data',
    framework: 'react',
    examples: []
  },
  List: {
    id: 'list-template',
    name: 'List',
    description: 'A list component',
    componentType: 'List',
    defaultProps: [
      {
        id: 'list-items',
        name: 'items',
        type: 'Array<any>',
        required: true,
        defaultValue: [],
        description: 'List items'
      },
      {
        id: 'list-render-item',
        name: 'renderItem',
        type: '(item: any, index: number) => React.ReactNode',
        required: true,
        description: 'Function to render each item'
      },
      {
        id: 'list-ordered',
        name: 'ordered',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Whether list is ordered (numbered)'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      padding: 8
    },
    icon: 'List',
    category: 'Data',
    framework: 'react',
    examples: []
  },
  Grid: {
    id: 'grid-template',
    name: 'Grid',
    description: 'A grid layout component',
    componentType: 'Grid',
    defaultProps: [
      {
        id: 'grid-columns',
        name: 'columns',
        type: 'number',
        required: false,
        defaultValue: 12,
        description: 'Number of grid columns'
      },
      {
        id: 'grid-gap',
        name: 'gap',
        type: 'number',
        required: false,
        defaultValue: 16,
        description: 'Grid gap in pixels'
      },
      {
        id: 'grid-children',
        name: 'children',
        type: 'React.ReactNode',
        required: false,
        description: 'Grid items'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      padding: 16
    },
    icon: 'Grid3X3',
    category: 'Layout',
    framework: 'react',
    examples: []
  },
  Sidebar: {
    id: 'sidebar-template',
    name: 'Sidebar',
    description: 'A sidebar navigation component',
    componentType: 'Sidebar',
    defaultProps: [
      {
        id: 'sidebar-items',
        name: 'items',
        type: 'Array<{label: string, href: string, icon?: string}>',
        required: true,
        defaultValue: [],
        description: 'Sidebar navigation items'
      },
      {
        id: 'sidebar-collapsed',
        name: 'collapsed',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Whether sidebar is collapsed'
      }
    ],
    defaultState: [
      {
        id: 'sidebar-active',
        name: 'activeItem',
        type: 'string | null',
        initialValue: null,
        description: 'Currently active sidebar item'
      }
    ],
    defaultMethods: [
      {
        id: 'sidebar-toggle',
        name: 'toggleCollapsed',
        parameters: [],
        returnType: 'void',
        description: 'Toggles sidebar collapsed state',
        visibility: 'public'
      }
    ],
    defaultStyle: {
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 16
    },
    icon: 'PanelLeft',
    category: 'Navigation',
    framework: 'react',
    examples: []
  },
  Header: {
    id: 'header-template',
    name: 'Header',
    description: 'A page header component',
    componentType: 'Header',
    defaultProps: [
      {
        id: 'header-title',
        name: 'title',
        type: 'string',
        required: false,
        description: 'Header title text'
      },
      {
        id: 'header-subtitle',
        name: 'subtitle',
        type: 'string',
        required: false,
        description: 'Header subtitle text'
      },
      {
        id: 'header-actions',
        name: 'actions',
        type: 'React.ReactNode',
        required: false,
        description: 'Header action buttons'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 24
    },
    icon: 'Layout',
    category: 'Layout',
    framework: 'react',
    examples: []
  },
  Footer: {
    id: 'footer-template',
    name: 'Footer',
    description: 'A page footer component',
    componentType: 'Footer',
    defaultProps: [
      {
        id: 'footer-links',
        name: 'links',
        type: 'Array<{label: string, href: string}>',
        required: false,
        defaultValue: [],
        description: 'Footer links'
      },
      {
        id: 'footer-copyright',
        name: 'copyright',
        type: 'string',
        required: false,
        description: 'Copyright text'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 24
    },
    icon: 'Layout',
    category: 'Layout',
    framework: 'react',
    examples: []
  },
  Container: {
    id: 'container-template',
    name: 'Container',
    description: 'A container layout component',
    componentType: 'Container',
    defaultProps: [
      {
        id: 'container-maxwidth',
        name: 'maxWidth',
        type: '"sm" | "md" | "lg" | "xl" | "full"',
        required: false,
        defaultValue: 'lg',
        description: 'Maximum container width'
      },
      {
        id: 'container-centered',
        name: 'centered',
        type: 'boolean',
        required: false,
        defaultValue: true,
        description: 'Whether container is centered'
      },
      {
        id: 'container-children',
        name: 'children',
        type: 'React.ReactNode',
        required: false,
        description: 'Container content'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      padding: 16
    },
    icon: 'Square',
    category: 'Layout',
    framework: 'react',
    examples: []
  },
  Custom: {
    id: 'custom-template',
    name: 'Custom Component',
    description: 'A custom component',
    componentType: 'Custom',
    defaultProps: [
      {
        id: 'custom-children',
        name: 'children',
        type: 'React.ReactNode',
        required: false,
        description: 'Component content'
      }
    ],
    defaultState: [],
    defaultMethods: [],
    defaultStyle: {
      padding: 16,
      borderColor: '#d1d5db',
      borderWidth: 1,
      borderRadius: 4
    },
    icon: 'Component',
    category: 'Custom',
    framework: 'react',
    examples: []
  }
}

export function createComponentWireframe(
  componentType: ComponentType,
  position: Position = { x: 0, y: 0 },
  size: Size = { width: 200, height: 100 },
  customName?: string
): ComponentWireframe {
  const template = componentTemplates[componentType]
  const id = `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id,
    name: customName || template.name,
    type: 'component',
    componentType,
    position,
    size,
    props: template.defaultProps.map(prop => ({
      ...prop,
      id: `${id}-${prop.id}`
    })),
    state: template.defaultState.map(state => ({
      ...state,
      id: `${id}-${state.id}`
    })),
    methods: template.defaultMethods.map(method => ({
      ...method,
      id: `${id}-${method.id}`
    })),
    style: { ...template.defaultStyle },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      tags: [],
      category: template.category,
      complexity: 'simple',
      framework: 'react'
    }
  }
}

export function getComponentTemplate(componentType: ComponentType): ComponentTemplate {
  return componentTemplates[componentType]
}

export function getAllComponentTemplates(): ComponentTemplate[] {
  return Object.values(componentTemplates)
}

export function getComponentsByCategory(): Record<string, ComponentTemplate[]> {
  const categories: Record<string, ComponentTemplate[]> = {}
  
  Object.values(componentTemplates).forEach(template => {
    if (!categories[template.category]) {
      categories[template.category] = []
    }
    categories[template.category].push(template)
  })
  
  return categories
}