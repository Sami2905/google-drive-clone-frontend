'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  HardDrive, 
  Wifi, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { performanceMonitor } from '@/lib/performance-monitor';
import { errorHandler } from '@/lib/error-handler';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: string;
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  performance: {
    averageLoadTime: number;
    totalOperations: number;
    errorRate: number;
  };
  network: {
    online: boolean;
    latency: number;
  };
  storage: {
    available: number;
    used: number;
    percentage: number;
  };
}

export default function HealthCheck() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [overallHealth, setOverallHealth] = useState<HealthStatus>({
    status: 'healthy',
    message: 'System is healthy'
  });
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [issues, setIssues] = useState<string[]>([]);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      // Collect system metrics
      const systemMetrics = await collectSystemMetrics();
      setMetrics(systemMetrics);

      // Check performance health
      const perfHealth = performanceMonitor.checkPerformanceHealth();
      
      // Determine overall health
      const healthIssues: string[] = [];
      
      if (systemMetrics.memory.percentage > 90) {
        healthIssues.push('High memory usage');
      }
      
      if (systemMetrics.performance.averageLoadTime > 2000) {
        healthIssues.push('Slow performance detected');
      }
      
      if (systemMetrics.performance.errorRate > 0.1) {
        healthIssues.push('High error rate');
      }
      
      if (!systemMetrics.network.online) {
        healthIssues.push('Network connectivity issues');
      }
      
      if (perfHealth.issues.length > 0) {
        healthIssues.push(...perfHealth.issues);
      }

      setIssues(healthIssues);

      // Set overall health status
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      let message = 'System is healthy';

      if (healthIssues.length > 0) {
        if (healthIssues.length > 3) {
          status = 'error';
          message = 'Multiple critical issues detected';
        } else {
          status = 'warning';
          message = `${healthIssues.length} issue(s) detected`;
        }
      }

      setOverallHealth({ status, message });
      setLastCheck(new Date());

    } catch (error) {
      console.error('Health check failed:', error);
      setOverallHealth({
        status: 'error',
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const collectSystemMetrics = async (): Promise<SystemMetrics> => {
    // Memory usage (if available)
    let memoryInfo = { used: 0, total: 0, percentage: 0 };
    if ('memory' in performance) {
      const mem = (performance as Performance & { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      memoryInfo = {
        used: mem.usedJSHeapSize,
        total: mem.jsHeapSizeLimit,
        percentage: (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100
      };
    }

    // Performance metrics
    const perfStats = performanceMonitor.getStats();
    const errorMetrics = performanceMonitor.getMetricsForOperation('error');
    const errorRate = perfStats.totalMetrics > 0 ? errorMetrics.length / perfStats.totalMetrics : 0;

    // Network status
    const networkInfo = {
      online: navigator.onLine,
      latency: 0
    };

    // Storage info (if available)
    let storageInfo = { available: 0, used: 0, percentage: 0 };
    if ('storage' in navigator && 'estimate' in (navigator as Navigator & { storage: { estimate(): Promise<{ quota?: number; usage?: number }> } }).storage) {
      try {
        const estimate = await (navigator as Navigator & { storage: { estimate(): Promise<{ quota?: number; usage?: number }> } }).storage.estimate();
        storageInfo = {
          available: estimate.quota || 0,
          used: estimate.usage || 0,
          percentage: estimate.quota && estimate.usage ? (estimate.usage / estimate.quota) * 100 : 0
        };
      } catch {
        // Storage API not available
      }
    }

    return {
      memory: memoryInfo,
      performance: {
        averageLoadTime: perfStats.averageLoadTime,
        totalOperations: perfStats.totalMetrics,
        errorRate
      },
      network: networkInfo,
      storage: storageInfo
    };
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Activity className="h-4 w-4" />
        Health
      </Button>

      {isOpen && (
        <Card className="absolute bottom-12 right-0 w-96 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">System Health</CardTitle>
              <Button
                onClick={runHealthCheck}
                disabled={isLoading}
                size="sm"
                variant="ghost"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(overallHealth.status)}
              <Badge className={getStatusColor(overallHealth.status)}>
                {overallHealth.status.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {overallHealth.message}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Overall Status */}
            {issues.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {issues.slice(0, 3).join(', ')}
                  {issues.length > 3 && ` and ${issues.length - 3} more...`}
                </AlertDescription>
              </Alert>
            )}

            {/* Memory Usage */}
            {metrics && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
                  </span>
                </div>
                <Progress value={metrics.memory.percentage} className="h-2" />
              </div>
            )}

            {/* Performance Metrics */}
            {metrics && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg Load Time:</span>
                    <div className="font-medium">{formatTime(metrics.performance.averageLoadTime)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Error Rate:</span>
                    <div className="font-medium">{(metrics.performance.errorRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Network Status */}
            {metrics && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className={`h-4 w-4 ${metrics.network.online ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <Badge variant={metrics.network.online ? 'default' : 'destructive'}>
                  {metrics.network.online ? 'Online' : 'Offline'}
                </Badge>
              </div>
            )}

            {/* Last Check */}
            {lastCheck && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Last checked: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
