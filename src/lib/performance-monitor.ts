export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface PerformanceStats {
  totalMetrics: number;
  averageLoadTime: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
  operationsByType: Record<string, number>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric(operationName, duration, 'ms');
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string, context?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      context
    };

    this.metrics.push(metric);
    
    // Notify observers
    this.observers.forEach(observer => observer(metric));

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value}${unit}`);
    }

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Measure API call performance
   */
  async measureApiCall<T>(
    operationName: string,
    apiCall: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const timer = this.startTimer(operationName);
    
    try {
      const result = await apiCall();
      timer();
      return result;
    } catch (error) {
      timer();
      this.recordMetric(`${operationName}_error`, 1, 'count', { error: String(error), ...context });
      throw error;
    }
  }

  /**
   * Measure file operation performance
   */
  async measureFileOperation<T>(
    operationName: string,
    fileOperation: () => Promise<T>,
    fileSize?: number,
    context?: Record<string, unknown>
  ): Promise<T> {
    const timer = this.startTimer(operationName);
    
    try {
      const result = await fileOperation();
      timer();
      
      // Record file size if available
      if (fileSize) {
        this.recordMetric(`${operationName}_file_size`, fileSize, 'bytes', context);
      }
      
      return result;
    } catch (error) {
      timer();
      this.recordMetric(`${operationName}_error`, 1, 'count', { error: String(error), ...context });
      throw error;
    }
  }

  /**
   * Measure component render time
   */
  measureComponentRender(componentName: string, renderTime: number): void {
    this.recordMetric(`${componentName}_render`, renderTime, 'ms');
  }

  /**
   * Measure page load time
   */
  measurePageLoad(pageName: string): void {
    if (typeof window !== 'undefined') {
      const loadTime = performance.now();
      this.recordMetric(`${pageName}_page_load`, loadTime, 'ms');
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageLoadTime: 0,
        slowestOperation: null,
        fastestOperation: null,
        operationsByType: {}
      };
    }

    const loadTimeMetrics = this.metrics.filter(m => m.unit === 'ms');
    const averageLoadTime = loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length;

    const slowestOperation = loadTimeMetrics.reduce((slowest, current) => 
      current.value > slowest.value ? current : slowest
    );

    const fastestOperation = loadTimeMetrics.reduce((fastest, current) => 
      current.value < fastest.value ? current : fastest
    );

    const operationsByType: Record<string, number> = {};
    this.metrics.forEach(metric => {
      const type = metric.name.split('_')[0];
      operationsByType[type] = (operationsByType[type] || 0) + 1;
    });

    return {
      totalMetrics: this.metrics.length,
      averageLoadTime,
      slowestOperation,
      fastestOperation,
      operationsByType
    };
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsForOperation(operationName: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name.startsWith(operationName));
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(limit: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Subscribe to performance metrics
   */
  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(observer);
    
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      stats: this.getStats(),
      metrics: this.metrics,
      exportTime: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Check if performance is degrading
   */
  checkPerformanceHealth(): { healthy: boolean; issues: string[] } {
    const stats = this.getStats();
    const issues: string[] = [];

    // Check if average load time is too high (> 1000ms)
    if (stats.averageLoadTime > 1000) {
      issues.push(`Average load time is high: ${stats.averageLoadTime.toFixed(2)}ms`);
    }

    // Check if there are many errors
    const errorMetrics = this.metrics.filter(m => m.name.includes('error'));
    if (errorMetrics.length > 10) {
      issues.push(`High error count: ${errorMetrics.length} errors`);
    }

    // Check for very slow operations (> 5000ms)
    const slowOperations = this.metrics.filter(m => m.unit === 'ms' && m.value > 5000);
    if (slowOperations.length > 0) {
      issues.push(`${slowOperations.length} very slow operations detected`);
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Export convenience functions
export const measureApiCall = <T>(
  operationName: string,
  apiCall: () => Promise<T>,
  context?: Record<string, unknown>
) => performanceMonitor.measureApiCall(operationName, apiCall, context);

export const measureFileOperation = <T>(
  operationName: string,
  fileOperation: () => Promise<T>,
  fileSize?: number,
  context?: Record<string, unknown>
) => performanceMonitor.measureFileOperation(operationName, fileOperation, fileSize, context);

export const measureComponentRender = (componentName: string, renderTime: number) =>
  performanceMonitor.measureComponentRender(componentName, renderTime);

export const measurePageLoad = (pageName: string) =>
  performanceMonitor.measurePageLoad(pageName);
