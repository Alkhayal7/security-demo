'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SecurityMap } from '@/components/map/security-map'
import { TestRunner } from '@/components/map/test-runner'
import { DemoOverlay } from './demo-overlay'
import { DemoControlPanel } from './demo-control-panel'
import { SecurityDataManager } from '@/lib/security-data'
import { TestResult } from '@/types/security-types'
import { demoManager, DemoStep, DemoState } from '@/lib/demo-manager'
import { useSecurityContext } from '@/contexts/security-context'

interface DemoAwareMapProps {
  showDemoControls?: boolean
}

export function DemoAwareMap({ showDemoControls = false }: DemoAwareMapProps) {
  const router = useRouter()
  const { state, actions } = useSecurityContext()
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [currentStep, setCurrentStep] = useState<DemoStep | null>(null)
  const [showDemoOverlay, setShowDemoOverlay] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 })
  
  const tests = SecurityDataManager.getAvailableTests()


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
      case 'select_site':
        if (step.params?.siteId) {
          actions.selectSite(step.params.siteId)
        }
        break

      case 'run_test':
        if (step.params?.testId && state.selectedSiteId) {
          // Trigger test execution through the global context
          actions.runSecurityTest(state.selectedSiteId, step.params.testId)
        }
        break

      case 'navigate':
        if (step.params?.route) {
          router.push(step.params.route)
        }
        break

      case 'show_results':
        // Results are automatically shown by the test runner
        break

      case 'highlight':
        // Highlighting is handled by the overlay component
        break

      case 'pause':
        // Pause is handled by the demo manager
        break

      default:
        console.log(`Executing demo step: ${step.action}`)
    }
  }

  const handleSiteDeselect = () => {
    actions.selectSite(null)
  }

  const handleTestComplete = (result: TestResult) => {
    console.log('Test completed:', result)
    // Test results are automatically updated through the global context
  }

  const handleStepExecute = (step: DemoStep) => {
    executeStep(step)
  }

  const selectedSite = state.selectedSiteId ? state.sites.find(s => s.id === state.selectedSiteId) || null : null

  return (
    <div className="relative">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Security Map</h1>
          <div className="text-sm text-muted-foreground">
            {state.sites.length} MCX sites • Jeddah, Saudi Arabia
          </div>
        </div>
        
        {/* Demo Controls - Now available in dedicated Demo Center */}
        
        {/* Full-width map */}
        <div className="w-full">
          <SecurityMap
            className="w-full h-[700px]"
          />
        </div>


      </div>

      {/* Test Runner with demo awareness */}
      <TestRunner
        onSiteDeselect={handleSiteDeselect}
        onTestComplete={handleTestComplete}
      />

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