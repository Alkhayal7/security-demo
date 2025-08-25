'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EnhancedProgress, SecurityScoreProgress } from '@/components/ui/enhanced-progress'

import { 
  X, 
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCcw,
  Zap
} from 'lucide-react'
import { SecurityTest, TestResult, MCXSite } from '@/types/security-types'

interface TestExecutionPanelProps {
  site: MCXSite | null
  test: SecurityTest | null
  isOpen: boolean
  onClose: () => void
  onTestComplete: (result: TestResult) => void
  className?: string
}

interface ExecutionStep {
  id: string
  name: string
  description: string
  duration: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  score?: number
  details?: string
}

export function TestExecutionPanel({ 
  site, 
  test,
  isOpen, 
  onClose, 
  onTestComplete,
  className = ""
}: TestExecutionPanelProps) {
  const [steps, setSteps] = useState<ExecutionStep[]>([])
  const [finalResult, setFinalResult] = useState<TestResult | null>(null)
  
  // Local test execution state
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Generate test steps based on the test type
  const generateTestSteps = useCallback((test: SecurityTest): ExecutionStep[] => {
    // Use the actual test duration from the JSON file
    const totalDuration = test.estimatedDuration || 30 // fallback to 30 seconds
    
    const baseSteps = [
      {
        id: 'init',
        name: 'Deploying Digital Twin',
        description: 'Creating secure digital twin simulation environment based on target site configuration',
        duration: Math.max(2, Math.floor(totalDuration * 0.15)), // At least 2 seconds
        status: 'pending' as const
      },
      {
        id: 'baseline',
        name: 'Establishing Baseline',
        description: 'Measuring normal system performance and security metrics in simulation',
        duration: Math.max(3, Math.floor(totalDuration * 0.2)), // At least 3 seconds
        status: 'pending' as const
      }
    ]

    // Add test-specific steps based on category
    const testSpecificSteps: ExecutionStep[] = []
    
    switch (test.category) {
      case 'jamming':
        testSpecificSteps.push(
          {
            id: 'signal_analysis',
            name: 'Signal Analysis',
            description: 'Analyzing simulated signal characteristics and vulnerability patterns in digital twin',
            duration: Math.max(4, Math.floor(totalDuration * 0.25)), // At least 4 seconds
            status: 'pending' as const
          },
          {
            id: 'jamming_execution',
            name: 'Jamming Attack Simulation',
            description: 'Executing controlled jamming attack simulation in isolated digital twin environment',
            duration: Math.max(5, Math.floor(totalDuration * 0.3)), // At least 5 seconds
            status: 'pending' as const
          }
        )
        break
      case 'flooding':
        testSpecificSteps.push(
          {
            id: 'capacity_analysis',
            name: 'Capacity Analysis',
            description: 'Analyzing simulated system capacity limits and performance thresholds',
            duration: Math.max(3, Math.floor(totalDuration * 0.2)), // At least 3 seconds
            status: 'pending' as const
          },
          {
            id: 'flood_simulation',
            name: 'Flooding Attack Simulation',
            description: 'Simulating high-volume request flooding in controlled digital twin environment',
            duration: Math.max(6, Math.floor(totalDuration * 0.35)), // At least 6 seconds
            status: 'pending' as const
          }
        )
        break
      case 'spoofing':
        testSpecificSteps.push(
          {
            id: 'identity_analysis',
            name: 'Identity Analysis',
            description: 'Analyzing simulated authentication and identity verification systems',
            duration: Math.max(4, Math.floor(totalDuration * 0.25)), // At least 4 seconds
            status: 'pending' as const
          },
          {
            id: 'spoofing_attempt',
            name: 'Spoofing Attack Simulation',
            description: 'Testing spoofing attack vectors against digital twin identity systems',
            duration: Math.max(5, Math.floor(totalDuration * 0.3)), // At least 5 seconds
            status: 'pending' as const
          }
        )
        break
      case 'injection':
        testSpecificSteps.push(
          {
            id: 'payload_preparation',
            name: 'Payload Preparation',
            description: 'Preparing test payloads and injection vectors for digital twin testing',
            duration: Math.max(4, Math.floor(totalDuration * 0.25)), // At least 4 seconds
            status: 'pending' as const
          },
          {
            id: 'injection_test',
            name: 'Injection Attack Simulation',
            description: 'Executing controlled injection attack simulation in isolated environment',
            duration: Math.max(5, Math.floor(totalDuration * 0.3)), // At least 5 seconds
            status: 'pending' as const
          }
        )
        break
      case 'manipulation':
        testSpecificSteps.push(
          {
            id: 'traffic_analysis',
            name: 'Traffic Analysis',
            description: 'Analyzing simulated network traffic patterns and protocol vulnerabilities',
            duration: Math.max(4, Math.floor(totalDuration * 0.25)), // At least 4 seconds
            status: 'pending' as const
          },
          {
            id: 'manipulation_test',
            name: 'Data Manipulation Simulation',
            description: 'Testing data integrity and manipulation detection in digital twin environment',
            duration: Math.max(5, Math.floor(totalDuration * 0.3)), // At least 5 seconds
            status: 'pending' as const
          }
        )
        break
    }

    const finalSteps = [
      {
        id: 'analysis',
        name: 'Results Analysis',
        description: 'Analyzing simulation results and calculating security resilience scores',
        duration: Math.max(2, Math.floor(totalDuration * 0.1)), // At least 2 seconds
        status: 'pending' as const
      }
    ]

    return [...baseSteps, ...testSpecificSteps, ...finalSteps]
  }, [])

  // Initialize steps when test changes
  useEffect(() => {
    if (test) {
      const newSteps = generateTestSteps(test)
      console.log('Initializing steps for test:', test.name, 'Steps:', newSteps.length, newSteps)
      setSteps(newSteps)
      setCurrentStep(0)
      setProgress(0)
      setElapsedTime(0)
      setFinalResult(null)
      setIsRunning(false)
      setIsPaused(false)
    }
  }, [test, generateTestSteps])



  // Simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused && steps.length > 0 && currentStep < steps.length) {
      interval = setInterval(() => {
        setElapsedTime(prevElapsed => {
          const newElapsed = prevElapsed + 1
          
          const currentStepData = steps[currentStep]
          if (currentStepData) {
            const stepProgress = Math.min(newElapsed / currentStepData.duration, 1)
            const totalProgress = ((currentStep + stepProgress) / steps.length) * 100
            setProgress(totalProgress)
            
            console.log(`Step ${currentStep + 1}/${steps.length} (${currentStepData.name}): ${newElapsed}/${currentStepData.duration}s (${Math.round(stepProgress * 100)}%) - Total: ${Math.round(totalProgress)}%`)

            // Move to next step when current step is complete
            if (stepProgress >= 1) {
              const nextStepIndex = currentStep + 1
              console.log(`Completing step ${currentStep + 1} (${currentStepData.name}), moving to step ${nextStepIndex + 1}`)
              
              setSteps((prev: ExecutionStep[]) => prev.map((step, index) => {
                if (index === currentStep) {
                  // Generate realistic score for completed step
                  const score = Math.floor(Math.random() * 40) + 60 // 60-100 range
                  return {
                    ...step,
                    status: 'completed' as const,
                    score,
                    details: `Step completed with score: ${score}/100`
                  }
                } else if (index === nextStepIndex && nextStepIndex < steps.length) {
                  // Mark next step as running immediately
                  return { ...step, status: 'running' as const }
                }
                return step
              }))

              if (nextStepIndex < steps.length) {
                setCurrentStep(nextStepIndex)
                return 0 // Reset elapsed time for next step
              } else {
                // Test completed
                setTimeout(() => {
                  setIsRunning(false)
                  setProgress(100)
                  
                  if (test && site) {
                    // Calculate overall score based on step scores
                    setSteps(currentSteps => {
                      const completedSteps = currentSteps.filter(step => step.score !== undefined)
                      const averageScore = completedSteps.length > 0 
                        ? Math.floor(completedSteps.reduce((sum, step) => sum + (step.score || 0), 0) / completedSteps.length)
                        : 75

                      const result: TestResult = {
                        testId: test!.id,
                        siteId: site!.id,
                        score: averageScore,
                        status: averageScore >= 80 ? 'passed' : averageScore >= 60 ? 'warning' : 'failed',
                        timestamp: new Date().toISOString(),
                        details: `Test completed with overall score: ${averageScore}/100`,
                        recommendations: generateRecommendations(test!, averageScore)
                      }

                      setFinalResult(result)
                      onTestComplete(result)
                      
                      return currentSteps
                    })
                  }
                }, 100)
              }
            }
          }
          
          return newElapsed
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, currentStep, steps])

  const generateRecommendations = (test: SecurityTest, score: number): string[] => {
    const recommendations: string[] = []
    
    if (score < 60) {
      recommendations.push('Critical vulnerabilities detected in simulation - immediate action required')
      recommendations.push('Deploy security patches to production environment')
    }
    
    if (score < 80) {
      recommendations.push('Simulation reveals potential security gaps - enhance defenses')
      recommendations.push('Schedule regular digital twin security assessments')
    }

    switch (test.category) {
      case 'jamming':
        if (score < 70) {
          recommendations.push('Deploy anti-jamming countermeasures based on simulation results')
          recommendations.push('Implement frequency hopping and signal diversity')
        }
        break
      case 'flooding':
        if (score < 70) {
          recommendations.push('Strengthen rate limiting based on capacity analysis')
          recommendations.push('Deploy adaptive DDoS protection mechanisms')
        }
        break
      case 'spoofing':
        if (score < 70) {
          recommendations.push('Enhance authentication protocols per simulation findings')
          recommendations.push('Implement multi-factor authentication and certificate validation')
        }
        break
      case 'injection':
        if (score < 70) {
          recommendations.push('Strengthen input validation and sanitization')
          recommendations.push('Deploy advanced intrusion detection systems')
        }
        break
      case 'manipulation':
        if (score < 70) {
          recommendations.push('Implement data integrity monitoring')
          recommendations.push('Deploy cryptographic data protection mechanisms')
        }
        break
    }

    return recommendations
  }

  const startTest = () => {
    console.log('Starting test with steps:', steps.length, steps)
    
    // Reset all state first
    setCurrentStep(0)
    setProgress(0)
    setElapsedTime(0)
    setFinalResult(null)
    
    // Ensure we have steps
    if (steps.length === 0 && test) {
      const newSteps = generateTestSteps(test)
      setSteps(newSteps)
      console.log('Generated new steps:', newSteps.length, newSteps)
    }
    
    setIsRunning(true)
    setIsPaused(false)
    
    // Mark first step as running
    setSteps((prev: ExecutionStep[]) => prev.map((step, index) => {
      if (index === 0) {
        return { ...step, status: 'running' as const }
      }
      return { ...step, status: 'pending' as const }
    }))
  }

  const pauseTest = () => {
    setIsPaused(!isPaused)
  }

  const stopTest = () => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentStep(0)
    setProgress(0)
    setElapsedTime(0)
    setFinalResult(null)
    setSteps((prev: ExecutionStep[]) => prev.map(step => ({ ...step, status: 'pending' as const, score: undefined, details: undefined })))
  }

  const resetTest = () => {
    stopTest()
  }

  if (!isOpen || !site || !test) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getScoreIcon = (score?: number) => {
    if (score === undefined) return <Minus className="h-4 w-4 text-muted-foreground" />
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 60) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const totalDuration = test?.estimatedDuration || steps.reduce((sum, step) => sum + step.duration, 0)
  const estimatedTimeRemaining = Math.max(0, totalDuration - (currentStep * (totalDuration / steps.length)) - elapsedTime)

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-40 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Test Execution</h2>
            <p className="text-sm text-muted-foreground">{test.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Test Info */}
        <div className="p-4 border-b">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Digital Twin of:</span>
              <span className="font-medium">{site.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Test Category:</span>
              <Badge variant="outline" className="text-xs capitalize">
                {test.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Simulation Duration:</span>
              <span className="font-mono">{Math.floor(totalDuration / 60)}m {totalDuration % 60}s</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Environment:</span>
              <Badge variant="secondary" className="text-xs">
                🔒 Isolated Digital Twin
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-4 border-b">
          <div className="space-y-3">
            <EnhancedProgress
              value={progress}
              max={100}
              variant="security"
              size="lg"
              showPercentage={true}
              showIcon={true}
              animated={true}
              striped={isRunning}
              label="Overall Progress"
            />
            
            {isRunning && (
              <div className="flex items-center justify-between text-xs text-muted-foreground animate-pulse">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>~{Math.floor(estimatedTimeRemaining / 60)}m {estimatedTimeRemaining % 60}s remaining</span>
                </div>
                <span>Step {currentStep + 1} of {steps.length}</span>
              </div>
            )}

            {/* Current step indicator */}
            {isRunning && steps[currentStep] && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {steps[currentStep].name}
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {steps[currentStep].description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            {!isRunning && !finalResult ? (
              <Button onClick={startTest} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </Button>
            ) : isRunning ? (
              <>
                <Button onClick={pauseTest} variant="outline" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button onClick={stopTest} variant="destructive" className="flex-1">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            ) : (
              <Button onClick={resetTest} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Test Steps */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium mb-3">Test Steps</h3>
            {steps.map((step, index) => (
              <Card 
                key={step.id} 
                className={`transition-all duration-300 ${
                  index === currentStep && isRunning 
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105 security-test-running' 
                    : step.status === 'completed'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : step.status === 'failed'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : ''
                } ${index <= currentStep ? 'animate-in slide-in-from-left duration-500' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(step.status)}
                      <span className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-green-700 dark:text-green-300' :
                        step.status === 'failed' ? 'text-red-700 dark:text-red-300' :
                        index === currentStep && isRunning ? 'text-blue-700 dark:text-blue-300' :
                        ''
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(step.score)}
                      {step.score !== undefined && (
                        <Badge 
                          variant={step.score >= 80 ? 'default' : step.score >= 60 ? 'secondary' : 'destructive'}
                          className="text-xs font-mono animate-in scale-in duration-300"
                        >
                          {step.score}/100
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                  {step.details && (
                    <p className="text-xs text-blue-600 animate-in fade-in duration-300">{step.details}</p>
                  )}
                  {index === currentStep && isRunning && (
                    <div className="mt-2 animate-in slide-in-from-bottom duration-300">
                      <EnhancedProgress
                        value={(elapsedTime / step.duration) * 100}
                        max={100}
                        variant="security"
                        size="sm"
                        animated={true}
                        striped={true}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Final Results */}
        {finalResult && (
          <div className="p-4 border-t bg-muted/30 animate-in slide-in-from-bottom duration-500">
            <div className="space-y-4">
              <SecurityScoreProgress
                score={finalResult.score}
                maxScore={100}
                label="Final Security Score"
                showDetails={false}
              />
              
              <div className="flex items-center justify-center">
                <Badge 
                  variant={finalResult.status === 'passed' ? 'default' : 
                          finalResult.status === 'warning' ? 'secondary' : 'destructive'}
                  className={`text-sm px-4 py-2 animate-in bounce-in duration-800 ${
                    finalResult.status === 'failed' ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {finalResult.status === 'passed' && <CheckCircle className="h-4 w-4" />}
                    {finalResult.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
                    {finalResult.status === 'failed' && <XCircle className="h-4 w-4" />}
                    {finalResult.status.toUpperCase()}
                  </div>
                </Badge>
              </div>

              {finalResult.recommendations.length > 0 && (
                <div className="pt-2 border-t animate-in fade-in duration-700 delay-300">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Key Recommendations</span>
                  </div>
                  <div className="space-y-2">
                    {finalResult.recommendations.slice(0, 2).map((rec, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-2 text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800 animate-in slide-in-from-left duration-300"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <Zap className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}