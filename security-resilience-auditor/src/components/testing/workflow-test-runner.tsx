'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WorkflowValidator, WorkflowScenario } from '@/lib/workflow-validator'
import { CheckCircle, XCircle, Clock, Play, RefreshCw, AlertTriangle } from 'lucide-react'

interface WorkflowTestResult {
  scenario: WorkflowScenario
  validation: Awaited<ReturnType<typeof WorkflowValidator.validateWorkflow>>
}

export function WorkflowTestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<WorkflowTestResult[]>([])
  const [currentScenario, setCurrentScenario] = useState<string | null>(null)
  const [overallSummary, setOverallSummary] = useState<{
    totalScenarios: number
    passedScenarios: number
    failedScenarios: number
    totalSteps: number
    totalPassedSteps: number
    totalFailedSteps: number
    totalDuration: number
  } | null>(null)

  const scenarios = WorkflowValidator.getAvailableScenarios()

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    setOverallSummary(null)

    try {
      const allResults = await WorkflowValidator.validateAllWorkflows()
      setResults(allResults.scenarios)
      setOverallSummary(allResults.overallSummary)
    } catch (error) {
      console.error('Failed to run workflow tests:', error)
    } finally {
      setIsRunning(false)
      setCurrentScenario(null)
    }
  }

  const runSingleTest = async (scenarioId: string) => {
    setIsRunning(true)
    setCurrentScenario(scenarioId)

    try {
      const scenario = scenarios.find(s => s.id === scenarioId)
      if (!scenario) return

      const validation = await WorkflowValidator.validateWorkflow(scenarioId)
      
      setResults(prev => {
        const filtered = prev.filter(r => r.scenario.id !== scenarioId)
        return [...filtered, { scenario, validation }]
      })
    } catch (error) {
      console.error(`Failed to run test for scenario ${scenarioId}:`, error)
    } finally {
      setIsRunning(false)
      setCurrentScenario(null)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? 'default' : 'destructive'}>
        {success ? 'PASSED' : 'FAILED'}
      </Badge>
    )
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Workflow Test Runner
            </div>
            <div className="flex gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run All Tests
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map(scenario => (
              <Card key={scenario.id} className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{scenario.name}</h4>
                  <p className="text-xs text-muted-foreground">{scenario.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {scenario.steps.length} steps
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runSingleTest(scenario.id)}
                      disabled={isRunning}
                    >
                      {currentScenario === scenario.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary */}
      {overallSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallSummary.failedScenarios === 0)}
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {overallSummary.passedScenarios}
                </div>
                <div className="text-sm text-muted-foreground">Passed Scenarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {overallSummary.failedScenarios}
                </div>
                <div className="text-sm text-muted-foreground">Failed Scenarios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {overallSummary.totalPassedSteps}
                </div>
                <div className="text-sm text-muted-foreground">Passed Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatDuration(overallSummary.totalDuration)}
                </div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {overallSummary.totalPassedSteps}/{overallSummary.totalSteps} steps
                </span>
              </div>
              <Progress 
                value={(overallSummary.totalPassedSteps / overallSummary.totalSteps) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map(result => (
            <Card key={result.scenario.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.validation.success)}
                    {result.scenario.name}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.validation.success)}
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(result.validation.summary.totalDuration)}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Scenario Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {result.validation.summary.passedSteps}
                      </div>
                      <div className="text-xs text-muted-foreground">Passed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">
                        {result.validation.summary.failedSteps}
                      </div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {result.validation.summary.totalSteps}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {/* Step Results */}
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {result.validation.results.map((stepResult, index) => (
                        <div
                          key={stepResult.step.id}
                          className={`p-3 rounded-lg border ${
                            stepResult.result.success
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                              : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon(stepResult.result.success)}
                                <h5 className="font-medium text-sm">
                                  {stepResult.step.name}
                                </h5>
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(stepResult.duration)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {stepResult.step.description}
                              </p>
                              <p className={`text-xs ${
                                stepResult.result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                              }`}>
                                {stepResult.result.message}
                              </p>
                              {stepResult.result.error && (
                                <details className="mt-2">
                                  <summary className="text-xs cursor-pointer text-red-600 hover:text-red-800">
                                    Error Details
                                  </summary>
                                  <pre className="text-xs mt-1 p-2 bg-red-100 dark:bg-red-900/20 rounded overflow-x-auto">
                                    {stepResult.result.error.message}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      {results.length === 0 && !isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Workflow Testing</h3>
            <p className="text-muted-foreground mb-4">
              Run comprehensive end-to-end tests to validate the complete user workflow
              from site selection to report generation.
            </p>
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Testing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}