/**
 * Smart Worker Pool Management System
 * Handles load balancing and task prioritization across web workers
 */

export interface WorkerTask {
  id: string;
  type: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout?: number;
  retries?: number;
  onProgress?: (progress: number) => void;
}

export interface WorkerPoolOptions {
  maxWorkers: number;
  workerScript: string;
  taskTimeout: number;
  maxRetries: number;
  loadBalancing: 'round-robin' | 'least-busy' | 'priority-based';
}

export interface WorkerInstance {
  id: string;
  worker: Worker;
  isIdle: boolean;
  currentTask?: WorkerTask;
  completedTasks: number;
  errorCount: number;
  lastUsed: number;
}

export class WorkerPool {
  private workers: Map<string, WorkerInstance> = new Map();
  private taskQueue: WorkerTask[] = [];
  private activeTasks: Map<string, WorkerTask> = new Map();
  private options: WorkerPoolOptions;
  private nextWorkerId = 0;
  private isShuttingDown = false;

  constructor(options: WorkerPoolOptions) {
    this.options = {
      taskTimeout: 30000,
      maxRetries: 3,
      loadBalancing: 'least-busy',
      ...options
    };

    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.options.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): WorkerInstance {
    const workerId = `worker-${this.nextWorkerId++}`;
    const worker = new Worker(this.options.workerScript);
    
    const workerInstance: WorkerInstance = {
      id: workerId,
      worker,
      isIdle: true,
      completedTasks: 0,
      errorCount: 0,
      lastUsed: Date.now()
    };

    worker.onmessage = (event) => this.handleWorkerMessage(workerId, event);
    worker.onerror = (error) => this.handleWorkerError(workerId, error);

    this.workers.set(workerId, workerInstance);
    return workerInstance;
  }

  private handleWorkerMessage(workerId: string, event: MessageEvent): void {
    const { id: taskId, type, result, error } = event.data;
    const workerInstance = this.workers.get(workerId);
    const task = this.activeTasks.get(taskId);

    if (!workerInstance || !task) return;

    if (type === 'progress') {
      task.onProgress?.(event.data.progress);
      return;
    }

    // Mark worker as idle
    workerInstance.isIdle = true;
    workerInstance.currentTask = undefined;
    workerInstance.lastUsed = Date.now();

    // Remove task from active tasks
    this.activeTasks.delete(taskId);

    if (type === 'success') {
      workerInstance.completedTasks++;
      this.resolveTask(taskId, result);
    } else if (type === 'error') {
      workerInstance.errorCount++;
      this.handleTaskError(task, error);
    }

    // Process next task in queue
    this.processNextTask();
  }

  private handleWorkerError(workerId: string, error: ErrorEvent): void {
    console.error(`Worker ${workerId} error:`, error);
    const workerInstance = this.workers.get(workerId);
    
    if (workerInstance) {
      workerInstance.errorCount++;
      
      // If worker has too many errors, replace it
      if (workerInstance.errorCount > 5) {
        this.replaceWorker(workerId);
      }
    }
  }

  private replaceWorker(workerId: string): void {
    const oldWorker = this.workers.get(workerId);
    if (oldWorker) {
      oldWorker.worker.terminate();
      this.workers.delete(workerId);
      
      // Create a new worker to replace it
      this.createWorker();
    }
  }

  private selectWorker(): WorkerInstance | null {
    const availableWorkers = Array.from(this.workers.values()).filter(w => w.isIdle);
    
    if (availableWorkers.length === 0) return null;

    switch (this.options.loadBalancing) {
      case 'round-robin':
        return availableWorkers[0]; // Simple round-robin
      
      case 'least-busy':
        return availableWorkers.reduce((least, current) => 
          current.completedTasks < least.completedTasks ? current : least
        );
      
      case 'priority-based':
        // Select worker with lowest error rate
        return availableWorkers.reduce((best, current) => {
          const currentErrorRate = current.errorCount / Math.max(1, current.completedTasks);
          const bestErrorRate = best.errorCount / Math.max(1, best.completedTasks);
          return currentErrorRate < bestErrorRate ? current : best;
        });
      
      default:
        return availableWorkers[0];
    }
  }

  private processNextTask(): void {
    if (this.taskQueue.length === 0 || this.isShuttingDown) return;

    const worker = this.selectWorker();
    if (!worker) return;

    // Sort queue by priority
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const task = this.taskQueue.shift();
    if (!task) return;

    this.executeTask(worker, task);
  }

  private executeTask(worker: WorkerInstance, task: WorkerTask): void {
    worker.isIdle = false;
    worker.currentTask = task;
    this.activeTasks.set(task.id, task);

    // Set up timeout
    const timeout = setTimeout(() => {
      this.handleTaskTimeout(task);
    }, task.timeout || this.options.taskTimeout);

    // Store timeout reference on task
    (task as any).timeoutId = timeout;

    // Send task to worker
    worker.worker.postMessage({
      id: task.id,
      type: task.type,
      data: task.data
    });
  }

  private handleTaskTimeout(task: WorkerTask): void {
    console.warn(`Task ${task.id} timed out`);
    
    // Find and free the worker
    for (const [workerId, worker] of this.workers.entries()) {
      if (worker.currentTask?.id === task.id) {
        worker.isIdle = true;
        worker.currentTask = undefined;
        worker.errorCount++;
        break;
      }
    }

    this.activeTasks.delete(task.id);
    this.handleTaskError(task, 'Task timeout');
  }

  private handleTaskError(task: WorkerTask, error: string): void {
    const retries = (task.retries || 0) + 1;
    
    if (retries <= this.options.maxRetries) {
      // Retry the task
      const retryTask = { ...task, retries };
      this.taskQueue.unshift(retryTask); // Add to front of queue
      this.processNextTask();
    } else {
      // Task failed permanently
      this.rejectTask(task.id, new Error(`Task failed after ${retries} attempts: ${error}`));
    }
  }

  private taskPromises = new Map<string, { resolve: Function; reject: Function }>();

  private resolveTask(taskId: string, result: any): void {
    const promise = this.taskPromises.get(taskId);
    if (promise) {
      promise.resolve(result);
      this.taskPromises.delete(taskId);
    }
  }

  private rejectTask(taskId: string, error: Error): void {
    const promise = this.taskPromises.get(taskId);
    if (promise) {
      promise.reject(error);
      this.taskPromises.delete(taskId);
    }
  }

  public async execute<T = any>(task: Omit<WorkerTask, 'id'>): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullTask: WorkerTask = { ...task, id: taskId };

    return new Promise<T>((resolve, reject) => {
      this.taskPromises.set(taskId, { resolve, reject });
      
      this.taskQueue.push(fullTask);
      this.processNextTask();
    });
  }

  public getStats() {
    const workers = Array.from(this.workers.values());
    const idleWorkers = workers.filter(w => w.isIdle).length;
    const busyWorkers = workers.length - idleWorkers;
    
    return {
      totalWorkers: workers.length,
      idleWorkers,
      busyWorkers,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      totalCompletedTasks: workers.reduce((sum, w) => sum + w.completedTasks, 0),
      totalErrors: workers.reduce((sum, w) => sum + w.errorCount, 0),
      averageTasksPerWorker: workers.length > 0 ? 
        workers.reduce((sum, w) => sum + w.completedTasks, 0) / workers.length : 0
    };
  }

  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    // Wait for active tasks to complete (with timeout)
    const shutdownTimeout = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (this.activeTasks.size > 0 && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Terminate all workers
    for (const worker of this.workers.values()) {
      worker.worker.terminate();
    }
    
    this.workers.clear();
    this.taskQueue.length = 0;
    this.activeTasks.clear();
    this.taskPromises.clear();
  }

  public adjustPoolSize(newSize: number): void {
    const currentSize = this.workers.size;
    
    if (newSize > currentSize) {
      // Add more workers
      for (let i = 0; i < newSize - currentSize; i++) {
        this.createWorker();
      }
    } else if (newSize < currentSize) {
      // Remove excess workers (only idle ones)
      const workersToRemove = currentSize - newSize;
      let removed = 0;
      
      for (const [workerId, worker] of this.workers.entries()) {
        if (removed >= workersToRemove) break;
        
        if (worker.isIdle) {
          worker.worker.terminate();
          this.workers.delete(workerId);
          removed++;
        }
      }
    }
  }

  public clearQueue(): void {
    // Reject all queued tasks
    this.taskQueue.forEach(task => {
      this.rejectTask(task.id, new Error('Task cancelled - queue cleared'));
    });
    
    this.taskQueue.length = 0;
  }

  public getQueuedTasks(): WorkerTask[] {
    return [...this.taskQueue];
  }

  public cancelTask(taskId: string): boolean {
    // Remove from queue if not yet started
    const queueIndex = this.taskQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      const task = this.taskQueue.splice(queueIndex, 1)[0];
      this.rejectTask(taskId, new Error('Task cancelled'));
      return true;
    }
    
    // If task is active, we can't easily cancel it without terminating the worker
    // This would require more sophisticated cancellation support in the workers
    return false;
  }
}