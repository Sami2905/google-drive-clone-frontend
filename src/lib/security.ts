/**
 * Security utilities for the Google Drive clone
 * Handles input validation, sanitization, and security checks
 */

export interface SecurityConfig {
  maxFileNameLength: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  blockedFileTypes: string[];
  maxPasswordLength: number;
  minPasswordLength: number;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      maxFileNameLength: 255,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedFileTypes: [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf', 'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Archives
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
        // Audio/Video
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm', 'video/ogg'
      ],
      blockedFileTypes: [
        'application/x-executable', 'application/x-msdownload', 'application/x-msi',
        'application/x-shockwave-flash', 'application/x-apple-diskimage'
      ],
      maxPasswordLength: 128,
      minPasswordLength: 8
    };
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Validate and sanitize file name
   */
  validateFileName(fileName: string): { valid: boolean; sanitized?: string; error?: string } {
    if (!fileName || fileName.trim().length === 0) {
      return { valid: false, error: 'File name cannot be empty' };
    }

    if (fileName.length > this.config.maxFileNameLength) {
      return { valid: false, error: `File name too long (max ${this.config.maxFileNameLength} characters)` };
    }

    // Check for dangerous characters
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(fileName)) {
      return { valid: false, error: 'File name contains invalid characters' };
    }

    // Check for reserved names
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    const upperFileName = fileName.toUpperCase();
    if (reservedNames.includes(upperFileName)) {
      return { valid: false, error: 'File name is reserved by the system' };
    }

    // Sanitize the name (remove leading/trailing spaces and dots)
    const sanitized = fileName.trim().replace(/^\.+|\.+$/g, '');
    
    if (sanitized.length === 0) {
      return { valid: false, error: 'File name cannot consist only of dots' };
    }

    return { valid: true, sanitized };
  }

  /**
   * Validate file type
   */
  validateFileType(mimeType: string): { valid: boolean; error?: string } {
    if (!mimeType) {
      return { valid: false, error: 'File type is required' };
    }

    // Check if file type is blocked
    if (this.config.blockedFileTypes.includes(mimeType)) {
      return { valid: false, error: 'This file type is not allowed for security reasons' };
    }

    // Check if file type is explicitly allowed
    if (this.config.allowedFileTypes.includes(mimeType)) {
      return { valid: true };
    }

    // For unknown types, check if they're generally safe
    const safePatterns = [
      /^text\//,
      /^image\//,
      /^audio\//,
      /^video\//,
      /^application\/(pdf|json|xml|zip|rar)/
    ];

    const isSafe = safePatterns.some(pattern => pattern.test(mimeType));
    
    if (isSafe) {
      return { valid: true };
    }

    return { valid: false, error: 'File type not supported' };
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number): { valid: boolean; error?: string } {
    if (size <= 0) {
      return { valid: false, error: 'File size must be greater than 0' };
    }

    if (size > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      return { valid: false, error: `File size exceeds maximum allowed size of ${maxSizeMB}MB` };
    }

    return { valid: true };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; strength: 'weak' | 'medium' | 'strong'; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.minPasswordLength) {
      errors.push(`Password must be at least ${this.config.minPasswordLength} characters long`);
    }

    if (password.length > this.config.maxPasswordLength) {
      errors.push(`Password must be no more than ${this.config.maxPasswordLength} characters long`);
    }

    // Check for common patterns
    if (password.toLowerCase() === password) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (password.toUpperCase() === password) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    // Calculate strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length === 0) {
      if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength = 'strong';
      } else if (password.length >= 10) {
        strength = 'medium';
      }
    }

    return {
      valid: errors.length === 0,
      strength,
      errors
    };
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  sanitizeHtml(html: string): string {
    if (!html) return '';

    // Remove script tags and event handlers
    const sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '');

    return sanitized;
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email) {
      return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.includes('--')) {
      return { valid: false, error: 'Email contains invalid patterns' };
    }

    if (email.length > 254) {
      return { valid: false, error: 'Email too long' };
    }

    return { valid: true };
  }

  /**
   * Check if URL is safe
   */
  validateUrl(url: string): { valid: boolean; error?: string } {
    if (!url) {
      return { valid: false, error: 'URL is required' };
    }

    try {
      const parsedUrl = new URL(url);
      
      // Check for dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
      if (dangerousProtocols.includes(parsedUrl.protocol.toLowerCase())) {
        return { valid: false, error: 'URL protocol not allowed' };
      }

      // Check for localhost or private IP ranges
      const hostname = parsedUrl.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return { valid: false, error: 'Local URLs not allowed' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Check if string contains potentially dangerous content
   */
  containsDangerousContent(content: string): { dangerous: boolean; threats: string[] } {
    const threats: string[] = [];
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(and|or)\s+\d+\s*=\s*\d+)/i
    ];
    
    sqlPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        threats.push('Potential SQL injection');
      }
    });

    // Check for XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i
    ];
    
    xssPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        threats.push('Potential XSS attack');
      }
    });

    // Check for command injection
    const commandPatterns = [
      /(\b(cmd|command|exec|system|eval|Function)\b)/i,
      /[;&|`$()]/
    ];
    
    commandPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        threats.push('Potential command injection');
      }
    });

    return {
      dangerous: threats.length > 0,
      threats
    };
  }

  /**
   * Get security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Update security configuration
   */
  updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Export convenience functions
export const validateFileName = (fileName: string) => securityManager.validateFileName(fileName);
export const validateFileType = (mimeType: string) => securityManager.validateFileType(mimeType);
export const validateFileSize = (size: number) => securityManager.validateFileSize(size);
export const validatePassword = (password: string) => securityManager.validatePassword(password);
export const validateEmail = (email: string) => securityManager.validateEmail(email);
export const validateUrl = (url: string) => securityManager.validateUrl(url);
export const sanitizeHtml = (html: string) => securityManager.sanitizeHtml(html);
export const generateSecureToken = (length?: number) => securityManager.generateSecureToken(length);
export const containsDangerousContent = (content: string) => securityManager.containsDangerousContent(content);
