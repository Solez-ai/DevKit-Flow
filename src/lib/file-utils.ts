/**
 * File utilities for download and upload operations
 */

/**
 * Download data as a file
 */
export function downloadFile(
  data: string,
  filename: string,
  mimeType: string = 'application/json'
): void {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Download JSON data
 */
export function downloadJSON(data: any, filename: string): void {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  downloadFile(jsonString, filename, 'application/json')
}

/**
 * Download markdown data
 */
export function downloadMarkdown(data: string, filename: string): void {
  downloadFile(data, filename, 'text/markdown')
}

/**
 * Create a file input element for importing files
 */
export function createFileInput(
  accept: string = '.json',
  multiple: boolean = false
): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    input.style.display = 'none'
    
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement
      resolve(target.files)
      document.body.removeChild(input)
    }
    
    input.oncancel = () => {
      resolve(null)
      document.body.removeChild(input)
    }
    
    document.body.appendChild(input)
    input.click()
  })
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      resolve(event.target?.result as string)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    }
    return file.type === type
  })
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Generate filename with timestamp
 */
export function generateTimestampedFilename(
  baseName: string,
  extension: string,
  includeTime: boolean = false
): string {
  const now = new Date()
  const date = now.toISOString().split('T')[0] // YYYY-MM-DD
  
  if (includeTime) {
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    return `${baseName}_${date}_${time}.${extension}`
  }
  
  return `${baseName}_${date}.${extension}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Create and trigger download of multiple files as ZIP
 * Note: This requires a ZIP library like JSZip to be installed
 */
export async function downloadAsZip(
  files: Array<{ name: string; content: string; type?: string }>,
  // zipFilename?: string
): Promise<void> {
  try {
    // This would require JSZip library
    // For now, we'll download files individually
    console.warn('ZIP download not implemented. Downloading files individually.')
    
    for (const file of files) {
      const mimeType = file.type || 'text/plain'
      downloadFile(file.content, file.name, mimeType)
      
      // Add small delay between downloads to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.error('Failed to create ZIP download:', error)
    throw error
  }
}

/**
 * Drag and drop file handler
 */
export function setupDragAndDrop(
  element: HTMLElement,
  onFilesDropped: (files: FileList) => void,
  allowedTypes?: string[]
): () => void {
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    element.classList.add('drag-over')
  }
  
  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    element.classList.remove('drag-over')
  }
  
  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    element.classList.remove('drag-over')
    
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      // Filter files by allowed types if specified
      if (allowedTypes) {
        const validFiles = Array.from(files).filter(file => 
          validateFileType(file, allowedTypes)
        )
        
        if (validFiles.length > 0) {
          const fileList = new DataTransfer()
          validFiles.forEach(file => fileList.items.add(file))
          onFilesDropped(fileList.files)
        }
      } else {
        onFilesDropped(files)
      }
    }
  }
  
  element.addEventListener('dragover', handleDragOver)
  element.addEventListener('dragleave', handleDragLeave)
  element.addEventListener('drop', handleDrop)
  
  // Return cleanup function
  return () => {
    element.removeEventListener('dragover', handleDragOver)
    element.removeEventListener('dragleave', handleDragLeave)
    element.removeEventListener('drop', handleDrop)
    element.classList.remove('drag-over')
  }
}