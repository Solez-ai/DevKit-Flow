/**
 * Data compression utilities for storage optimization
 */

/**
 * Simple LZ-string style compression for JSON data
 */
export class DataCompressor {
  private static readonly DICTIONARY_SIZE = 256
  private static readonly MAX_DICT_SIZE = 4096

  /**
   * Compress a string using a simple dictionary-based algorithm
   */
  static compress(data: string): string {
    if (!data || data.length === 0) return data

    const dictionary: Record<string, number> = {}
    const result: (string | number)[] = []
    let dictSize = this.DICTIONARY_SIZE
    let phrase = data[0]

    // Initialize dictionary with single characters
    for (let i = 0; i < this.DICTIONARY_SIZE; i++) {
      dictionary[String.fromCharCode(i)] = i
    }

    for (let i = 1; i < data.length; i++) {
      const char = data[i]
      const phraseChar = phrase + char

      if (dictionary[phraseChar] !== undefined) {
        phrase = phraseChar
      } else {
        result.push(dictionary[phrase])
        
        if (dictSize < this.MAX_DICT_SIZE) {
          dictionary[phraseChar] = dictSize++
        }
        
        phrase = char
      }
    }

    result.push(dictionary[phrase])
    
    // Convert to base64 for storage
    return btoa(JSON.stringify(result))
  }

  /**
   * Decompress a string
   */
  static decompress(compressed: string): string {
    if (!compressed || compressed.length === 0) return compressed

    try {
      const data = JSON.parse(atob(compressed)) as (string | number)[]
      
      if (!Array.isArray(data) || data.length === 0) return ''

      const dictionary: Record<number, string> = {}
      let dictSize = this.DICTIONARY_SIZE
      let result = ''
      let phrase: string

      // Initialize dictionary
      for (let i = 0; i < this.DICTIONARY_SIZE; i++) {
        dictionary[i] = String.fromCharCode(i)
      }

      phrase = dictionary[data[0] as number]
      result = phrase

      for (let i = 1; i < data.length; i++) {
        const code = data[i]
        let entry: string

        if (typeof code === 'number' && dictionary[code] !== undefined) {
          entry = dictionary[code]
        } else if (typeof code === 'number' && code === dictSize) {
          entry = phrase + phrase[0]
        } else {
          throw new Error('Invalid compressed data')
        }

        result += entry

        if (dictSize < this.MAX_DICT_SIZE) {
          dictionary[dictSize++] = phrase + entry[0]
        }

        phrase = entry
      }

      return result
    } catch (error) {
      console.error('Decompression failed:', error)
      return compressed // Return original if decompression fails
    }
  }

  /**
   * Compress JSON data
   */
  static compressJSON(obj: any): string {
    try {
      const jsonString = JSON.stringify(obj)
      return this.compress(jsonString)
    } catch (error) {
      console.error('JSON compression failed:', error)
      return JSON.stringify(obj)
    }
  }

  /**
   * Decompress JSON data
   */
  static decompressJSON<T>(compressed: string): T | null {
    try {
      const decompressed = this.decompress(compressed)
      return JSON.parse(decompressed)
    } catch (error) {
      console.error('JSON decompression failed:', error)
      return null
    }
  }

  /**
   * Get compression ratio
   */
  static getCompressionRatio(original: string, compressed: string): number {
    if (original.length === 0) return 0
    return compressed.length / original.length
  }

  /**
   * Check if compression is beneficial
   */
  static shouldCompress(data: string, threshold = 0.8): boolean {
    if (data.length < 100) return false // Don't compress small data
    
    const compressed = this.compress(data)
    const ratio = this.getCompressionRatio(data, compressed)
    
    return ratio < threshold
  }
}

/**
 * Advanced compression using browser's built-in compression
 */
export class AdvancedCompressor {
  /**
   * Compress using CompressionStream (if available)
   */
  static async compressStream(data: string): Promise<string> {
    if (!('CompressionStream' in window)) {
      return DataCompressor.compress(data)
    }

    try {
      const stream = new CompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()

      // Write data
      await writer.write(new TextEncoder().encode(data))
      await writer.close()

      // Read compressed data
      const chunks: Uint8Array[] = []
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          chunks.push(value)
        }
      }

      // Combine chunks and convert to base64
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Stream compression failed:', error)
      return DataCompressor.compress(data)
    }
  }

  /**
   * Decompress using DecompressionStream (if available)
   */
  static async decompressStream(compressed: string): Promise<string> {
    if (!('DecompressionStream' in window)) {
      return DataCompressor.decompress(compressed)
    }

    try {
      // Convert from base64
      const binaryString = atob(compressed)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const stream = new DecompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()

      // Write compressed data
      await writer.write(bytes)
      await writer.close()

      // Read decompressed data
      const chunks: Uint8Array[] = []
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          chunks.push(value)
        }
      }

      // Combine chunks and decode
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const combined = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      return new TextDecoder().decode(combined)
    } catch (error) {
      console.error('Stream decompression failed:', error)
      return DataCompressor.decompress(compressed)
    }
  }
}

/**
 * Utility functions for compression
 */
export const compressionUtils = {
  /**
   * Auto-select best compression method
   */
  async compress(data: string): Promise<string> {
    if (data.length < 1000) {
      return data // Don't compress small data
    }

    // Try advanced compression first
    if ('CompressionStream' in window) {
      try {
        const compressed = await AdvancedCompressor.compressStream(data)
        const ratio = DataCompressor.getCompressionRatio(data, compressed)
        
        if (ratio < 0.8) {
          return compressed
        }
      } catch (error) {
        console.warn('Advanced compression failed, falling back:', error)
      }
    }

    // Fallback to simple compression
    const compressed = DataCompressor.compress(data)
    const ratio = DataCompressor.getCompressionRatio(data, compressed)
    
    return ratio < 0.8 ? compressed : data
  },

  /**
   * Auto-detect and decompress
   */
  async decompress(data: string): Promise<string> {
    // Try to detect if data is compressed
    if (data.length < 100 || !this.isCompressed(data)) {
      return data
    }

    // Try advanced decompression first
    if ('DecompressionStream' in window) {
      try {
        return await AdvancedCompressor.decompressStream(data)
      } catch (error) {
        console.warn('Advanced decompression failed, falling back:', error)
      }
    }

    // Fallback to simple decompression
    return DataCompressor.decompress(data)
  },

  /**
   * Check if data appears to be compressed
   */
  isCompressed(data: string): boolean {
    try {
      // Check if it's base64 encoded
      const decoded = atob(data)
      return decoded.length !== data.length
    } catch {
      return false
    }
  },

  /**
   * Get compression statistics
   */
  getStats(original: string, compressed: string) {
    const originalSize = new Blob([original]).size
    const compressedSize = new Blob([compressed]).size
    const ratio = compressedSize / originalSize
    const savings = originalSize - compressedSize
    const savingsPercent = (savings / originalSize) * 100

    return {
      originalSize,
      compressedSize,
      ratio,
      savings,
      savingsPercent: Math.round(savingsPercent * 100) / 100
    }
  }
}