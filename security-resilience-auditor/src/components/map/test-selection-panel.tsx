'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { 
  X, 
  Play,
  Clock,
  AlertTriangle,
  Shield,
  Zap,
  Radio,
  Wifi,
  Target,
  Bug,
  ChevronDown,
  ChevronRight,
  Settings,
  Info
} from 'lucide-react'
import { SecurityTest, TestParameter, MCXSite } from '@/types/security-types'

interface TestSelectionPanelProps {
  site: MCXSite | null
  tests: SecurityTest[]
  isOpen: boolean
  onClose: () => void
  onRunTest: (testId: string) => void
  className?: string
}

interface TestParameterValues {
  [testId: string]: Record<string, unknown>
}

export function TestSelectionPanel({ 
  site, 
  tests,
  isOpen, 
  onClose, 
  onRunTest,
  className = ""
}: TestSelectionPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [parameterValues, setParameterValues] = useState<TestParameterValues>({})
  const [expandedTests, setExpandedTests] = useState<Record<string, boolean>>({})

  // Initialize parameter values when tests change
  useEffect(() => {
    const initialValues: TestParameterValues = {}
    tests.forEach(test => {
      initialValues[test.id] = {}
      test.parameters.forEach(param => {
        initialValues[test.id][param.name] = param.defaultValue
      })
    })
    setParameterValues(initialValues)
  }, [tests])

  const toggleTestExpansion = (testId: string) => {
    setExpandedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }))
  }

  const updateParameterValue = (testId: string, paramName: string, value: unknown) => {
    setParameterValues(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [paramName]: value
      }
    }))
  }

  const handleRunTest = (test: SecurityTest) => {
    onRunTest(test.id)
  }

  if (!isOpen || !site) {
    return null
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'jamming': return <Radio className="h-4 w-4" />
      case 'flooding': return <Zap className="h-4 w-4" />
      case 'spoofing': return <Wifi className="h-4 w-4" />
      case 'injection': return <Target className="h-4 w-4" />
      case 'manipulation': return <Bug className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'jamming': return 'text-red-600'
      case 'flooding': return 'text-orange-600'
      case 'spoofing': return 'text-purple-600'
      case 'injection': return 'text-blue-600'
      case 'manipulation': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  const categories = Array.from(new Set(tests.map(test => test.category)))
  const filteredTests = selectedCategory 
    ? tests.filter(test => test.category === selectedCategory)
    : tests

  const renderParameterInput = (test: SecurityTest, param: TestParameter) => {
    const currentValue = parameterValues[test.id]?.[param.name] ?? param.defaultValue

    switch (param.type) {
      case 'select':
        return (
          <select
            value={String(currentValue)}
            onChange={(e) => updateParameterValue(test.id, param.name, e.target.value)}
            className="w-full px-3 py-1 text-sm border rounded-md bg-background"
          >
            {param.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      case 'number':
        return (
          <Input
            type="number"
            value={String(currentValue)}
            onChange={(e) => updateParameterValue(test.id, param.name, parseFloat(e.target.value) || 0)}
            className="text-sm"
          />
        )
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(e) => updateParameterValue(test.id, param.name, e.target.checked)}
            className="w-4 h-4"
          />
        )
      default:
        return (
          <Input
            type="text"
            value={String(currentValue)}
            onChange={(e) => updateParameterValue(test.id, param.name, e.target.value)}
            className="text-sm"
          />
        )
    }
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-40 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Security Tests</h2>
            <p className="text-sm text-muted-foreground">{site.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Tests ({tests.length})
            </Button>
            {categories.map(category => {
              const categoryTests = tests.filter(test => test.category === category)
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  <span className={getCategoryColor(category)}>
                    {getCategoryIcon(category)}
                  </span>
                  <span className="ml-1">{category} ({categoryTests.length})</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Test List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {filteredTests.map((test) => (
              <Card key={test.id} className="relative">
                <CardHeader 
                  className="pb-2 cursor-pointer"
                  onClick={() => toggleTestExpansion(test.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={getCategoryColor(test.category)}>
                          {getCategoryIcon(test.category)}
                        </span>
                        <CardTitle className="text-sm">{test.name}</CardTitle>
                        {expandedTests[test.id] ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityVariant(test.severity)} className="text-xs">
                          {test.severity.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(test.estimatedDuration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {expandedTests[test.id] && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Test Description */}
                      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>

                      {/* Test Parameters */}
                      {test.parameters.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Test Parameters</span>
                          </div>
                          <div className="space-y-3">
                            {test.parameters.map((param) => (
                              <div key={param.name} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium capitalize">
                                    {param.name.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                    {param.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                </div>
                                {renderParameterInput(test, param)}
                                {param.description && (
                                  <p className="text-xs text-muted-foreground">{param.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Run Test Button */}
                      <Button 
                        className="w-full" 
                        onClick={() => handleRunTest(test)}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run {test.name}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {filteredTests.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tests available for this category</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Info */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>Tests will simulate security scenarios without affecting live systems</span>
          </div>
        </div>
      </div>
    </div>
  )
}