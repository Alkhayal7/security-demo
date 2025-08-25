'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface EnhancedProgressProps {
  value: number
  max?: number
  variant?: 'default' | 'security' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  showIcon?: boolean
  animated?: boolean
  striped?: boolean
  className?: string
  label?: string
}

export function EnhancedProgress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showPercentage = false,
  showIcon = false,
  animated = true,
  striped = false,
  className,
  label
}: EnhancedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(percentage)
    }
  }, [percentage, animated])

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const variantClasses = {
    default: 'bg-primary',
    security: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  const getIcon = () => {
    if (!showIcon) return null
    
    if (percentage >= 100) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (percentage >= 70) {
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    } else if (percentage >= 40) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage || showIcon) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            {label && (
              <span className="text-sm font-medium">{label}</span>
            )}
          </div>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-secondary rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            variantClasses[variant],
            striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-pulse'
          )}
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  )
}

interface SecurityScoreProgressProps {
  score: number
  maxScore?: number
  label?: string
  showDetails?: boolean
  className?: string
}

export function SecurityScoreProgress({
  score,
  maxScore = 100,
  label = 'Security Score',
  showDetails = true,
  className
}: SecurityScoreProgressProps) {
  const percentage = (score / maxScore) * 100
  
  const getVariant = (): 'success' | 'warning' | 'error' => {
    if (percentage >= 70) return 'success'
    if (percentage >= 40) return 'warning'
    return 'error'
  }

  const getScoreText = (): string => {
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 70) return 'Good'
    if (percentage >= 50) return 'Fair'
    if (percentage >= 30) return 'Poor'
    return 'Critical'
  }

  const getScoreColor = (): string => {
    if (percentage >= 70) return 'text-green-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', getScoreColor())}>
            {getScoreText()}
          </span>
          <span className="text-sm text-muted-foreground">
            {score}/{maxScore}
          </span>
        </div>
      </div>
      
      <EnhancedProgress
        value={score}
        max={maxScore}
        variant={getVariant()}
        size="lg"
        animated={true}
        striped={percentage < 40}
      />
      
      {showDetails && (
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="text-center">
            <div className="h-1 bg-red-200 rounded mb-1" />
            <span>0-39 Critical</span>
          </div>
          <div className="text-center">
            <div className="h-1 bg-yellow-200 rounded mb-1" />
            <span>40-69 Warning</span>
          </div>
          <div className="text-center">
            <div className="h-1 bg-green-200 rounded mb-1" />
            <span>70+ Secure</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface MultiStepProgressProps {
  steps: Array<{
    id: string
    label: string
    status: 'pending' | 'active' | 'completed' | 'error'
  }>
  className?: string
}

export function MultiStepProgress({ steps, className }: MultiStepProgressProps) {
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'active':
        return (
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 bg-blue-500 animate-pulse" />
        )
      default:
        return (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-white" />
        )
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'active':
        return 'text-blue-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getStepIcon(step.status)}
          </div>
          <div className="flex-1">
            <p className={cn('text-sm font-medium', getStepColor(step.status))}>
              {step.label}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className="absolute left-2.5 mt-8 h-6 w-0.5 bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  )
}