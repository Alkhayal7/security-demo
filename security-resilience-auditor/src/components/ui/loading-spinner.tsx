'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'security' | 'success' | 'warning' | 'error'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const variantClasses = {
    default: 'border-primary',
    security: 'border-blue-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500'
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-t-transparent',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

interface SecurityTestSpinnerProps {
  testName?: string
  progress?: number
  className?: string
}

export function SecurityTestSpinner({ 
  testName = 'Running security test',
  progress,
  className 
}: SecurityTestSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4 p-6', className)}>
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-blue-200 animate-spin">
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 animate-ping opacity-75" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="font-medium text-blue-600">{testName}</p>
        {progress !== undefined && (
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground animate-pulse">
          Analyzing security vulnerabilities...
        </p>
      </div>
    </div>
  )
}

interface PulsingDotProps {
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PulsingDot({ 
  variant = 'default', 
  size = 'md',
  className 
}: PulsingDotProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'rounded-full animate-ping absolute',
        sizeClasses[size],
        variantClasses[variant],
        'opacity-75'
      )} />
      <div className={cn(
        'rounded-full',
        sizeClasses[size],
        variantClasses[variant]
      )} />
    </div>
  )
}