import toast from 'react-hot-toast';

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: Date;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: unknown, context?: string): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        code: 'API_ERROR',
        message: error.message,
        details: error,
        timestamp: new Date()
      };
    } else if (typeof error === 'object' && error !== null && 'response' in error) {
      const apiError = error as { response?: { data?: { error?: string }; status?: number } };
      const status = apiError.response?.status;
      const message = apiError.response?.data?.error || 'An unexpected error occurred';

      appError = {
        code: `HTTP_${status || 'UNKNOWN'}`,
        message: this.getUserFriendlyMessage(status, message),
        details: error,
        timestamp: new Date()
      };
    } else {
      appError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: error,
        timestamp: new Date()
      };
    }

    // Log error
    this.logError(appError, context);

    // Show user notification
    this.showUserNotification(appError);

    return appError;
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: unknown): AppError {
    const appError: AppError = {
      code: 'AUTH_ERROR',
      message: 'Authentication failed. Please log in again.',
      details: error,
      timestamp: new Date()
    };

    this.logError(appError, 'Authentication');
    this.showUserNotification(appError);

    // Redirect to login if needed
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    return appError;
  }

  /**
   * Handle file operation errors
   */
  handleFileError(error: unknown, operation: string): AppError {
    const appError: AppError = {
      code: 'FILE_OPERATION_ERROR',
      message: `Failed to ${operation}. Please try again.`,
      details: error,
      timestamp: new Date()
    };

    this.logError(appError, `File Operation: ${operation}`);
    this.showUserNotification(appError);

    return appError;
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: unknown): AppError {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      details: error,
      timestamp: new Date()
    };

    this.logError(appError, 'Network');
    this.showUserNotification(appError);

    return appError;
  }

  /**
   * Get user-friendly error messages
   */
  private getUserFriendlyMessage(status?: number, message?: string): string {
    if (!status) return message || 'An unexpected error occurred';

    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authorized to perform this action. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists. Please use a different name.';
      case 413:
        return 'File too large. Please choose a smaller file.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return message || 'An unexpected error occurred';
    }
  }

  /**
   * Show user notification
   */
  private showUserNotification(error: AppError): void {
    const isAuthError = error.code === 'AUTH_ERROR';
    const isNetworkError = error.code === 'NETWORK_ERROR';
    
    if (isAuthError) {
      toast.error(error.message, { duration: 5000 });
    } else if (isNetworkError) {
      toast.error(error.message, { duration: 8000 });
    } else {
      toast.error(error.message, { duration: 4000 });
    }
  }

  /**
   * Log error for debugging
   */
  private logError(error: AppError, context?: string): void {
    const logEntry = {
      ...error,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };

    this.errorLog.push(logEntry);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', logEntry);
    }

    // In production, you could send to a logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service (e.g., Sentry, LogRocket)
      console.error('Production error:', logEntry);
    }
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { total: number; byCode: Record<string, number> } {
    const byCode: Record<string, number> = {};
    
    this.errorLog.forEach(error => {
      byCode[error.code] = (byCode[error.code] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byCode
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Export convenience functions
export const handleApiError = (error: unknown, context?: string) => 
  errorHandler.handleApiError(error, context);

export const handleAuthError = (error: unknown) => 
  errorHandler.handleAuthError(error);

export const handleFileError = (error: unknown, operation: string) => 
  errorHandler.handleFileError(error, operation);

export const handleNetworkError = (error: unknown) => 
  errorHandler.handleNetworkError(error);
