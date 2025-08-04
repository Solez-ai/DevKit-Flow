/**
 * Command pattern implementation for undo/redo functionality
 */

export interface Command {
  id: string
  type: string
  timestamp: Date
  description: string
  execute(): void | Promise<void>
  undo(): void | Promise<void>
  canUndo(): boolean
  canRedo(): boolean
  merge?(other: Command): Command | null
}

export abstract class BaseCommand implements Command {
  public readonly id: string
  public readonly timestamp: Date

  constructor(
    public readonly type: string,
    public readonly description: string
  ) {
    this.id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.timestamp = new Date()
  }

  abstract execute(): void | Promise<void>
  abstract undo(): void | Promise<void>

  canUndo(): boolean {
    return true
  }

  canRedo(): boolean {
    return true
  }

  merge(_other: Command): Command | null {
    return null // Default: no merging
  }
}

/**
 * Session-related commands
 */
export class CreateSessionCommand extends BaseCommand {
  constructor(
    private sessionData: any,
    private addSessionFn: (session: any) => void,
    private removeSessionFn: (sessionId: string) => void
  ) {
    super('create-session', `Create session "${sessionData.name}"`)
  }

  execute(): void {
    this.addSessionFn(this.sessionData)
  }

  undo(): void {
    this.removeSessionFn(this.sessionData.id)
  }
}

export class DeleteSessionCommand extends BaseCommand {
  constructor(
    private sessionData: any,
    private removeSessionFn: (sessionId: string) => void,
    private addSessionFn: (session: any) => void
  ) {
    super('delete-session', `Delete session "${sessionData.name}"`)
  }

  execute(): void {
    this.removeSessionFn(this.sessionData.id)
  }

  undo(): void {
    this.addSessionFn(this.sessionData)
  }
}

export class UpdateSessionCommand extends BaseCommand {
  constructor(
    private sessionId: string,
    private oldData: Partial<any>,
    private newData: Partial<any>,
    private updateSessionFn: (sessionId: string, updates: Partial<any>) => void
  ) {
    super('update-session', `Update session`)
  }

  execute(): void {
    this.updateSessionFn(this.sessionId, this.newData)
  }

  undo(): void {
    this.updateSessionFn(this.sessionId, this.oldData)
  }

  merge(other: Command): Command | null {
    if (other instanceof UpdateSessionCommand && 
        other.sessionId === this.sessionId &&
        other.timestamp.getTime() - this.timestamp.getTime() < 1000) {
      // Merge updates within 1 second
      return new UpdateSessionCommand(
        this.sessionId,
        this.oldData,
        other.newData,
        this.updateSessionFn
      )
    }
    return null
  }
}

/**
 * Node-related commands
 */
export class CreateNodeCommand extends BaseCommand {
  constructor(
    private sessionId: string,
    private nodeData: any,
    private addNodeFn: (sessionId: string, node: any) => void,
    private removeNodeFn: (sessionId: string, nodeId: string) => void
  ) {
    super('create-node', `Create node "${nodeData.title}"`)
  }

  execute(): void {
    this.addNodeFn(this.sessionId, this.nodeData)
  }

  undo(): void {
    this.removeNodeFn(this.sessionId, this.nodeData.id)
  }
}

export class DeleteNodeCommand extends BaseCommand {
  constructor(
    private sessionId: string,
    private nodeData: any,
    private removeNodeFn: (sessionId: string, nodeId: string) => void,
    private addNodeFn: (sessionId: string, node: any) => void
  ) {
    super('delete-node', `Delete node "${nodeData.title}"`)
  }

  execute(): void {
    this.removeNodeFn(this.sessionId, this.nodeData.id)
  }

  undo(): void {
    this.addNodeFn(this.sessionId, this.nodeData)
  }
}

export class UpdateNodeCommand extends BaseCommand {
  constructor(
    private sessionId: string,
    private nodeId: string,
    private oldData: Partial<any>,
    private newData: Partial<any>,
    private updateNodeFn: (sessionId: string, nodeId: string, updates: Partial<any>) => void
  ) {
    super('update-node', `Update node`)
  }

  execute(): void {
    this.updateNodeFn(this.sessionId, this.nodeId, this.newData)
  }

  undo(): void {
    this.updateNodeFn(this.sessionId, this.nodeId, this.oldData)
  }

  merge(other: Command): Command | null {
    if (other instanceof UpdateNodeCommand && 
        other.sessionId === this.sessionId &&
        other.nodeId === this.nodeId &&
        other.timestamp.getTime() - this.timestamp.getTime() < 1000) {
      return new UpdateNodeCommand(
        this.sessionId,
        this.nodeId,
        this.oldData,
        other.newData,
        this.updateNodeFn
      )
    }
    return null
  }
}

export class MoveNodeCommand extends BaseCommand {
  constructor(
    private sessionId: string,
    private nodeId: string,
    private oldPosition: { x: number; y: number },
    private newPosition: { x: number; y: number },
    private updateNodeFn: (sessionId: string, nodeId: string, updates: Partial<any>) => void
  ) {
    super('move-node', `Move node`)
  }

  execute(): void {
    this.updateNodeFn(this.sessionId, this.nodeId, { position: this.newPosition })
  }

  undo(): void {
    this.updateNodeFn(this.sessionId, this.nodeId, { position: this.oldPosition })
  }

  merge(other: Command): Command | null {
    if (other instanceof MoveNodeCommand && 
        other.sessionId === this.sessionId &&
        other.nodeId === this.nodeId &&
        other.timestamp.getTime() - this.timestamp.getTime() < 500) {
      // Merge moves within 500ms
      return new MoveNodeCommand(
        this.sessionId,
        this.nodeId,
        this.oldPosition,
        other.newPosition,
        this.updateNodeFn
      )
    }
    return null
  }
}

/**
 * Connection-related commands
 */
export class CreateConnectionCommand extends BaseCommand {
  constructor(
    private sessionId: string,
    private connectionData: any,
    private addConnectionFn: (sessionId: string, connection: any) => void,
    private removeConnectionFn: (sessionId: string, connectionId: string) => void
  ) {
    super('create-connection', `Create connection`)
  }

  execute(): void {
    this.addConnectionFn(this.sessionId, this.connectionData)
  }

  undo(): void {
    this.removeConnectionFn(this.sessionId, this.connectionData.id)
  }
}

export class DeleteConnectionCommand extends BaseCommand {
  constructor(
    private sessionId: string,
    private connectionData: any,
    private removeConnectionFn: (sessionId: string, connectionId: string) => void,
    private addConnectionFn: (sessionId: string, connection: any) => void
  ) {
    super('delete-connection', `Delete connection`)
  }

  execute(): void {
    this.removeConnectionFn(this.sessionId, this.connectionData.id)
  }

  undo(): void {
    this.addConnectionFn(this.sessionId, this.connectionData)
  }
}

/**
 * Pattern-related commands
 */
export class CreatePatternCommand extends BaseCommand {
  constructor(
    private patternData: any,
    private addPatternFn: (pattern: any) => void,
    private removePatternFn: (patternId: string) => void
  ) {
    super('create-pattern', `Create pattern "${patternData.name}"`)
  }

  execute(): void {
    this.addPatternFn(this.patternData)
  }

  undo(): void {
    this.removePatternFn(this.patternData.id)
  }
}

export class DeletePatternCommand extends BaseCommand {
  constructor(
    private patternData: any,
    private removePatternFn: (patternId: string) => void,
    private addPatternFn: (pattern: any) => void
  ) {
    super('delete-pattern', `Delete pattern "${patternData.name}"`)
  }

  execute(): void {
    this.removePatternFn(this.patternData.id)
  }

  undo(): void {
    this.addPatternFn(this.patternData)
  }
}

export class UpdatePatternCommand extends BaseCommand {
  constructor(
    private patternId: string,
    private oldData: Partial<any>,
    private newData: Partial<any>,
    private updatePatternFn: (patternId: string, updates: Partial<any>) => void
  ) {
    super('update-pattern', `Update pattern`)
  }

  execute(): void {
    this.updatePatternFn(this.patternId, this.newData)
  }

  undo(): void {
    this.updatePatternFn(this.patternId, this.oldData)
  }

  merge(other: Command): Command | null {
    if (other instanceof UpdatePatternCommand && 
        other.patternId === this.patternId &&
        other.timestamp.getTime() - this.timestamp.getTime() < 1000) {
      return new UpdatePatternCommand(
        this.patternId,
        this.oldData,
        other.newData,
        this.updatePatternFn
      )
    }
    return null
  }
}

/**
 * Batch command for grouping multiple commands
 */
export class BatchCommand extends BaseCommand {
  constructor(
    private commands: Command[],
    description?: string
  ) {
    super('batch', description || `Batch operation (${commands.length} commands)`)
  }

  async execute(): Promise<void> {
    for (const command of this.commands) {
      await command.execute()
    }
  }

  async undo(): Promise<void> {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      await this.commands[i].undo()
    }
  }

  canUndo(): boolean {
    return this.commands.every(cmd => cmd.canUndo())
  }

  canRedo(): boolean {
    return this.commands.every(cmd => cmd.canRedo())
  }
}