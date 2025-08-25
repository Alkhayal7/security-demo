'use client'

import { useState, useEffect } from 'react'
import { X, Info, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DemoStep, DemoState } from '@/lib/demo-manager'

interface DemoOverlayProps {
  isVisible: boolean
  currentStep: DemoStep | null
  demoState: DemoState
  progress: { current: number; total: number; percentage: number }
  onDismiss?: () => void
  className?: string
}

export function DemoOverlay({
  isVisible,
  currentStep,
  demoState,
  progress,
  onDismiss,
  className
}: DemoOverlayProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showStepComplete, setShowStepComplete] = useState(false)

  useEffect(() => {
    if (currentStep && isVisible) {
      setIsAnimating(true)
      setShowStepComplete(false)
      
      // Show step completion animation
      const timer = setTimeout(() => {
        setShowStepComplete(true)
        setTimeout(() => setShowStepComplete(false), 1000)
      }, currentStep.duration - 1000)

      return () => clearTimeout(timer)
    }
  }, [currentStep, isVisible])

  if (!isVisible || !currentStep) {
    return null
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'select_site':
        return '🎯'
      case 'run_test':
        return '🔍'
      case 'show_results':
        return '📊'
      case 'navigate':
        return '🧭'
      case 'highlight':
        return '✨'
      case 'pause':
        return '⏸️'
      default:
        return '▶️'
    }
  }

  const getActionDescription = (step: DemoStep): string => {
    switch (step.action) {
      case 'select_site':
        return `Selecting site: ${step.params?.siteId || 'Unknown'}`
      case 'run_test':
        return `Running test: ${step.params?.testId || 'Unknown'}`
      case 'show_results':
        return 'Displaying test results and recommendations'
      case 'navigate':
        return `Navigating to: ${step.params?.route || 'Unknown'}`
      case 'highlight':
        return step.params?.message || 'Highlighting interface element'
      case 'pause':
        return 'Pausing for review'
      default:
        return step.description
    }
  }

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none ${className}`}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Demo step indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Card className={`transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getActionIcon(currentStep.action)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{currentStep.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Step {progress.current + 1} of {progress.total}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getActionDescription(currentStep)}
                </p>
              </div>
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <Progress value={progress.percentage} className="h-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step completion animation */}
      {showStepComplete && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-bounce">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </div>
      )}

      {/* Action-specific overlays */}
      {currentStep.action === 'highlight' && currentStep.params?.element && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative h-full">
            {/* Highlight ring animation */}
            <div className="absolute inset-4 border-4 border-yellow-400 rounded-lg animate-pulse" />
          </div>
        </div>
      )}

      {/* Navigation indicator */}
      {currentStep.action === 'navigate' && (
        <div className="absolute bottom-4 right-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-4 w-4" />
                <span>Navigating to {currentStep.params?.route}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test execution indicator */}
      {currentStep.action === 'run_test' && (
        <div className="absolute bottom-4 left-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>Running security test...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Site selection indicator */}
      {currentStep.action === 'select_site' && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span>Site selected</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demo state indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Badge 
          variant={demoState === 'running' ? 'default' : 'secondary'}
          className="animate-pulse"
        >
          <Info className="h-3 w-3 mr-1" />
          Demo {demoState === 'running' ? 'Active' : 'Paused'}
        </Badge>
      </div>
    </div>
  )
}