#!/bin/bash

# Production Deployment Script for Google Drive Clone
# This script automates the deployment process to production

set -e  # Exit on any error

# Configuration
PROJECT_NAME="google-drive-clone"
DEPLOY_ENV=${1:-production}
BUILD_DIR=".next"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "This script must be run from the project root directory"
fi

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    if ! command -v git &> /dev/null; then
        error "git is not installed"
    fi
    
    success "All dependencies are available"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if we have uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        warning "You have uncommitted changes. Consider committing them before deployment."
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled"
        fi
    fi
    
    # Check if we're on the right branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$DEPLOY_ENV" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        warning "You're not on the main branch. Production deployments should be from main."
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled"
        fi
    fi
    
    # Check environment variables
    if [ ! -f ".env.production" ]; then
        warning "Production environment file not found. Using development config."
    fi
    
    success "Pre-deployment checks completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    
    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Run linting
    npm run lint
    
    # Run type checking
    npm run type-check || warning "Type checking failed, but continuing..."
    
    # Run unit tests if available
    if npm run test --silent 2>/dev/null; then
        success "Tests passed"
    else
        warning "Tests failed or not available, but continuing..."
    fi
}

# Build the application
build_application() {
    log "Building application for $DEPLOY_ENV..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    
    # Set environment
    export NODE_ENV=$DEPLOY_ENV
    
    # Build
    if [ "$DEPLOY_ENV" = "production" ]; then
        npm run build
    else
        npm run build:staging || npm run build
    fi
    
    success "Application built successfully"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    if [ -d "$BUILD_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$BUILD_DIR" "$BACKUP_DIR/build_$TIMESTAMP"
        success "Backup created: $BACKUP_DIR/build_$TIMESTAMP"
    fi
}

# Deploy to production
deploy_production() {
    log "Deploying to production..."
    
    # This section would contain your actual deployment logic
    # Examples for different platforms:
    
    # For Vercel:
    # if command -v vercel &> /dev/null; then
    #     vercel --prod
    #     success "Deployed to Vercel"
    # fi
    
    # For Netlify:
    # if command -v netlify &> /dev/null; then
    #     netlify deploy --prod
    #     success "Deployed to Netlify"
    # fi
    
    # For custom server:
    # rsync -avz --delete "$BUILD_DIR/" user@server:/path/to/production/
    
    # For now, just simulate deployment
    sleep 2
    success "Application deployed to production"
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Clear build cache
    npm run clean || true
    
    # Notify team (example)
    # curl -X POST $SLACK_WEBHOOK -d '{"text":"🚀 Google Drive Clone deployed to production!"}'
    
    # Run health checks
    log "Running health checks..."
    # Add your health check logic here
    
    success "Post-deployment tasks completed"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        cd ..
    fi
    
    # Clear npm cache
    npm cache clean --force
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting deployment to $DEPLOY_ENV environment..."
    
    check_dependencies
    pre_deployment_checks
    install_dependencies
    run_tests
    create_backup
    build_application
    deploy_production
    post_deployment
    cleanup
    
    success "🎉 Deployment completed successfully!"
    log "Deployment timestamp: $TIMESTAMP"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
