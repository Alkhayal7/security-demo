'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Square, SkipForward, SkipBack, Clock, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  demoManager, 
  DemoScenario, 
  DemoStep, 
  DemoState 
} from '@/lib/demo-manager'

interface DemoControlPanelProps {
  className?: string
  onStepExecute?: (step: DemoStep) => void
}

export function DemoControlPanel({ className, onStepExecute }: DemoControlPanelProps) {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([])
  const [currentScenario, setCurrentScenario] = useState<DemoScenario | null>(null)
  const [currentStep, setCurrentStep] = useState<DemoStep | null>(null)
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 })
  const [elapsedTime, setElapsedTime] = useState(0)
  const [remainingTime, setRemainingTime] = useState(0)

  useEffect(() => {
    // Initialize scenarios
    setScenarios(demoManager.getAvailableScenarios())

    // Set up demo manager callbacks
    demoManager.setCallbacks({
      onStepStart: (step, index) => {
        setCurrentStep(step)
        onStepExecute?.(step)
      },
      onStepComplete: (step, index) => {
        // Step completed, update progress
      },
      onScenarioComplete: () => {
        // Scenario completed
      },
      onStateChange: (state) => {
        setDemoState(state)
      }
    })

    // Update progress and timing every second
    const interval = setInterval(() => {
      setCurrentScenario(demoManager.getCurrentScenario())
      setCurrentStep(demoManager.getCurrentStep())
      setProgress(demoManager.getProgress())
      setElapsedTime(demoManager.getElapsedTime())
      setRemainingTime(demoManager.getRemainingTime())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [onStepExecute])

  const handleStartScenario = (scenarioId: string) => {
    demoManager.startScenario(scenarioId)
  }

  const handlePauseDemo = () => {
    demoManager.pauseDemo()
  }

  const handleResumeDemo = () => {
    demoManager.resumeDemo()
  }

  const handleStopDemo = () => {
    demoManager.stopDemo()
  }

  const handleNextStep = () => {
    demoManager.nextStep()
  }

  const handlePreviousStep = () => {
    demoManager.previousStep()
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStateColor = (state: DemoState): string => {
    switch (state) {
      case 'running': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStateText = (state: DemoState): string => {
    switch (state) {
      case 'running': return 'Running'
      case 'paused': return 'Paused'
      case 'completed': return 'Completed'
      default: return 'Ready'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Demo Control Panel
            </CardTitle>
            <CardDescription>
              Automated demo scenarios for presentations
            </CardDescription>
          </div>
          <Badge className={getStateColor(demoState)}>
            {getStateText(demoState)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Scenario Selection */}
        {demoState === 'idle' && (
          <div className="space-y-3">
            <h4 className="font-semibold">Select Demo Scenario</h4>
            <div className="grid gap-2">
              {scenarios.map((scenario) => (
                <Button
                  key={scenario.id}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => handleStartScenario(scenario.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {scenario.description} • {formatTime(scenario.totalDuration)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Demo Controls */}
        {demoState !== 'idle' && currentScenario && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{currentScenario.name}</h4>
              <p className="text-sm text-muted-foreground">
                {currentScenario.description}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.current} / {progress.total} steps</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>

            {/* Timing */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Elapsed: {formatTime(elapsedTime)}</span>
              </div>
              <span>Remaining: {formatTime(remainingTime)}</span>
            </div>

            {/* Current Step */}
            {currentStep && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="font-medium text-sm">{currentStep.name}</div>
                <div className="text-xs text-muted-foreground">
                  {currentStep.description}
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-2">
              {demoState === 'running' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePauseDemo}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              
              {demoState === 'paused' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResumeDemo}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={progress.current === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleNextStep}
                disabled={progress.current >= progress.total}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={handleStopDemo}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}