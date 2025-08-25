'use client'

import { DemoControlPanel } from '@/components/demo/demo-control-panel'
import { DemoOverlay } from '@/components/demo/demo-overlay'
import { useState, useEffect } from 'react'
import { demoManager, DemoStep, DemoState } from '@/lib/demo-manager'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Settings, Zap, Clock, Target } from 'lucide-react'

export default function DemoPage() {
  const router = useRouter()
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [currentStep, setCurrentStep] = useState<DemoStep | null>(null)
  const [showDemoOverlay, setShowDemoOverlay] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 })

  useEffect(() => {
    // Set up demo manager callbacks
    demoManager.setCallbacks({
      onStepStart: (step, index) => {
        setCurrentStep(step)
        setShowDemoOverlay(true)
        executeStep(step)
      },
      onStepComplete: (step, index) => {
        // Step completed
      },
      onScenarioComplete: () => {
        setShowDemoOverlay(false)
      },
      onStateChange: (state) => {
        setDemoState(state)
        setShowDemoOverlay(state === 'running')
      }
    })

    // Update progress regularly
    const interval = setInterval(() => {
      setProgress(demoManager.getProgress())
      setCurrentStep(demoManager.getCurrentStep())
      setDemoState(demoManager.getState())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const executeStep = async (step: DemoStep) => {
    switch (step.action) {
      case 'navigate':
        if (step.params?.route) {
          router.push(step.params.route)
        }
        break
      case 'select_site':
      case 'run_test':
      case 'show_results':
      case 'highlight':
      case 'pause':
        // These actions will be handled by the specific page components
        break
      default:
        console.log(`Executing demo step: ${step.action}`)
    }
  }

  const handleStepExecute = (step: DemoStep) => {
    executeStep(step)
  }

  const scenarios = demoManager.getAvailableScenarios()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demo Center</h1>
          <p className="text-muted-foreground">
            Automated presentation scenarios for the Security Resilience Auditor
          </p>
        </div>
        <Badge variant={demoState === 'running' ? 'default' : 'secondary'}>
          {demoState === 'running' ? 'Demo Active' : 'Ready'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Demo Control Panel */}
        <div className="space-y-6">
          <DemoControlPanel 
            onStepExecute={handleStepExecute}
            className="w-full"
          />
        </div>

        {/* Demo Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Demo Features
              </CardTitle>
              <CardDescription>
                Automated presentation capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Play className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Automated Navigation</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically navigates between pages and features
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">Site Selection & Testing</div>
                    <div className="text-sm text-muted-foreground">
                      Demonstrates security testing on different MCX sites
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <div className="font-medium">Real-time Feedback</div>
                    <div className="text-sm text-muted-foreground">
                      Visual overlays and progress indicators
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Timing Controls</div>
                    <div className="text-sm text-muted-foreground">
                      Pause, resume, and skip through demo steps
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Available Scenarios</CardTitle>
              <CardDescription>
                Choose the right demo length for your presentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {scenario.steps.length} steps
                      </div>
                    </div>
                    <Badge variant="outline">
                      {Math.floor(scenario.totalDuration / 60000)}:{String(Math.floor((scenario.totalDuration % 60000) / 1000)).padStart(2, '0')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>
            Step-by-step guide to running demos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-medium">
                  1
                </div>
                <span className="font-medium">Select Scenario</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Choose from 1-minute, 2-minute, or 3-minute demo scenarios based on your presentation needs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white text-sm flex items-center justify-center font-medium">
                  2
                </div>
                <span className="font-medium">Start Demo</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Click the scenario button to begin. The demo will automatically navigate and execute steps.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center font-medium">
                  3
                </div>
                <span className="font-medium">Control Flow</span>
              </div>
              <p className="text-sm text-muted-foreground ml-8">
                Use pause/resume, skip forward/back, or stop controls to manage the demo flow as needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Overlay */}
      <DemoOverlay
        isVisible={showDemoOverlay}
        currentStep={currentStep}
        demoState={demoState}
        progress={progress}
        onDismiss={() => setShowDemoOverlay(false)}
      />
    </div>
  )
}