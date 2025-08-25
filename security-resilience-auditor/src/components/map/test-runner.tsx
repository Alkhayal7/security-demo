'use client'

import { useState, useEffect, useCallback } from 'react'
import { SecurityTest, TestResult } from '@/types/security-types'
import { SiteDetailsPanel } from './site-details-panel'
import { TestSelectionPanel } from './test-selection-panel'
import { TestExecutionPanel } from './test-execution-panel'
import { useSecurityContext } from '@/contexts/security-context'
import { SecurityDataManager } from '../../lib/security-data'

interface TestRunnerProps {
  onSiteDeselect?: () => void
  onTestComplete?: (result: TestResult) => void
}

type PanelState = 'details' | 'selection' | 'execution' | 'closed'

export function TestRunner({ 
  onSiteDeselect, 
  onTestComplete 
}: TestRunnerProps) {
  const { state, actions } = useSecurityContext()
  const [panelState, setPanelState] = useState<PanelState>('closed')
  const [selectedTest, setSelectedTest] = useState<SecurityTest | null>(null)
  
  const tests = SecurityDataManager.getAvailableTests()
  const selectedSite = state.selectedSiteId ? state.sites.find(s => s.id === state.selectedSiteId) || null : null

  // Update panel state when site selection changes
  useEffect(() => {
    if (selectedSite) {
      setPanelState('details')
    } else {
      setPanelState('closed')
      setSelectedTest(null)
    }
  }, [selectedSite])

  const handleClosePanels = () => {
    setPanelState('closed')
    setSelectedTest(null)
    actions.selectSite(null)
    onSiteDeselect?.()
  }

  const handleRunTests = () => {
    setPanelState('selection')
  }

  const handleRunTest = (testId: string) => {
    const test = tests.find(t => t.id === testId)
    if (test && selectedSite) {
      setSelectedTest(test)
      setPanelState('execution')
      // Run the test through the global context
      actions.runSecurityTest(selectedSite.id, testId)
    }
  }

  const handleTestComplete = (result: TestResult) => {
    onTestComplete?.(result)
    // Stay on execution panel to show results
  }

  const handleBackToSelection = () => {
    setPanelState('selection')
    setSelectedTest(null)
  }

  const handleBackToDetails = () => {
    setPanelState('details')
    setSelectedTest(null)
  }

  return (
    <>
      {/* Site Details Panel */}
      <SiteDetailsPanel
        site={selectedSite}
        isOpen={panelState === 'details'}
        onClose={handleClosePanels}
        onRunTests={handleRunTests}
      />

      {/* Test Selection Panel */}
      <TestSelectionPanel
        site={selectedSite}
        tests={tests}
        isOpen={panelState === 'selection'}
        onClose={handleBackToDetails}
        onRunTest={handleRunTest}
      />

      {/* Test Execution Panel */}
      <TestExecutionPanel
        site={selectedSite}
        test={selectedTest}
        isOpen={panelState === 'execution'}
        onClose={handleBackToSelection}
        onTestComplete={handleTestComplete}
      />
    </>
  )
}