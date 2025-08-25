'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { SecurityDataManager } from '@/lib/security-data'
import { 
  MCXSite, 
  SecurityKPIData, 
  ThreatAlert, 
  TestResult, 
  SecurityTestSuite,
  MapViewState,
  TestExecutionState 
} from '@/types/security-types'

// State interface
interface SecurityState {
  sites: MCXSite[]
  selectedSiteId: string | null
  kpiData: SecurityKPIData
  threatAlerts: ThreatAlert[]
  testResults: Record<string, TestResult[]> // siteId -> TestResult[]
  testSuites: Record<string, SecurityTestSuite> // siteId -> SecurityTestSuite
  mapViewState: MapViewState
  testExecutionState: TestExecutionState
  loading: boolean
  error: string | null
  networkStatus: 'online' | 'offline' | 'slow'
  retryCount: number
}

// Action types
type SecurityAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SITES'; payload: MCXSite[] }
  | { type: 'SELECT_SITE'; payload: string | null }
  | { type: 'UPDATE_KPI_DATA'; payload: SecurityKPIData }
  | { type: 'UPDATE_THREAT_ALERTS'; payload: ThreatAlert[] }
  | { type: 'UPDATE_TEST_RESULTS'; payload: { siteId: string; results: TestResult[] } }
  | { type: 'UPDATE_TEST_SUITE'; payload: { siteId: string; testSuite: SecurityTestSuite } }
  | { type: 'UPDATE_MAP_VIEW'; payload: Partial<MapViewState> }
  | { type: 'UPDATE_TEST_EXECUTION'; payload: Partial<TestExecutionState> }
  | { type: 'SET_NETWORK_STATUS'; payload: 'online' | 'offline' | 'slow' }
  | { type: 'INCREMENT_RETRY_COUNT' }
  | { type: 'RESET_RETRY_COUNT' }
  | { type: 'REFRESH_ALL_DATA' }

// Initial state
const initialState: SecurityState = {
  sites: [],
  selectedSiteId: null,
  kpiData: {
    overallNetworkResilience: 0,
    criticalVulnerabilities: 0,
    sitesAtRisk: 0,
    lastAuditCoverage: 0
  },
  threatAlerts: [],
  testResults: {},
  testSuites: {},
  mapViewState: {
    center: [21.4858, 39.1925], // Jeddah coordinates
    zoom: 11,
    selectedSiteId: null,
    highlightedSites: [],
    showCoverageAreas: false
  },
  testExecutionState: {
    isRunning: false,
    currentTest: null,
    progress: 0,
    status: '',
    results: []
  },
  loading: true,
  error: null,
  networkStatus: 'online',
  retryCount: 0
}

// Reducer
function securityReducer(state: SecurityState, action: SecurityAction): SecurityState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_SITES':
      return { ...state, sites: action.payload }
    
    case 'SELECT_SITE':
      return { 
        ...state, 
        selectedSiteId: action.payload,
        mapViewState: {
          ...state.mapViewState,
          selectedSiteId: action.payload
        }
      }
    
    case 'UPDATE_KPI_DATA':
      return { ...state, kpiData: action.payload }
    
    case 'UPDATE_THREAT_ALERTS':
      return { ...state, threatAlerts: action.payload }
    
    case 'UPDATE_TEST_RESULTS':
      return {
        ...state,
        testResults: {
          ...state.testResults,
          [action.payload.siteId]: action.payload.results
        }
      }
    
    case 'UPDATE_TEST_SUITE':
      return {
        ...state,
        testSuites: {
          ...state.testSuites,
          [action.payload.siteId]: action.payload.testSuite
        }
      }
    
    case 'UPDATE_MAP_VIEW':
      return {
        ...state,
        mapViewState: { ...state.mapViewState, ...action.payload }
      }
    
    case 'UPDATE_TEST_EXECUTION':
      return {
        ...state,
        testExecutionState: { ...state.testExecutionState, ...action.payload }
      }
    
    case 'SET_NETWORK_STATUS':
      return { ...state, networkStatus: action.payload }
    
    case 'INCREMENT_RETRY_COUNT':
      return { ...state, retryCount: state.retryCount + 1 }
    
    case 'RESET_RETRY_COUNT':
      return { ...state, retryCount: 0 }
    
    case 'REFRESH_ALL_DATA':
      // This will trigger a full data refresh
      return { ...state, loading: true, error: null, retryCount: 0 }
    
    default:
      return state
  }
}

// Context
const SecurityContext = createContext<{
  state: SecurityState
  dispatch: React.Dispatch<SecurityAction>
  actions: {
    selectSite: (siteId: string | null) => void
    refreshKPIData: () => void
    refreshThreatAlerts: () => void
    updateTestResults: (siteId: string, results: TestResult[]) => void
    runSecurityTest: (siteId: string, testId: string) => Promise<void>
    refreshAllData: () => void
    handleError: (error: Error, context?: string) => void
    retryOperation: (operation: () => Promise<void>) => Promise<void>
  }
} | null>(null)

// Provider component
export function SecurityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(securityReducer, initialState)

  // Calculate KPI data from current sites and test suites
  const calculateKPIData = (): SecurityKPIData => {
    const sites = state.sites
    const testSuites = state.testSuites
    const totalSites = sites.length

    if (totalSites === 0) {
      return {
        overallNetworkResilience: 0,
        criticalVulnerabilities: 0,
        sitesAtRisk: 0,
        lastAuditCoverage: 0
      }
    }

    let totalResilienceScore = 0
    let criticalVulnCount = 0
    let sitesAtRiskCount = 0
    let auditedSitesCount = 0

    sites.forEach(site => {
      const testSuite = testSuites[site.id] || SecurityDataManager.generateTestSuite(site.id)
      totalResilienceScore += testSuite.overallScore

      // Count critical vulnerabilities
      if (testSuite.riskLevel === 'critical') {
        criticalVulnCount++
      }

      // Count sites at risk (below 60 resilience score)
      if (testSuite.overallScore < 60) {
        sitesAtRiskCount++
      }

      // Count audited sites
      auditedSitesCount++
    })

    const overallNetworkResilience = Math.round(totalResilienceScore / totalSites)
    const lastAuditCoverage = Math.round((auditedSitesCount / totalSites) * 100)

    return {
      overallNetworkResilience,
      criticalVulnerabilities: criticalVulnCount,
      sitesAtRisk: sitesAtRiskCount,
      lastAuditCoverage
    }
  }

  // Actions
  const actions = {
    selectSite: (siteId: string | null) => {
      dispatch({ type: 'SELECT_SITE', payload: siteId })
    },

    refreshKPIData: () => {
      const kpiData = calculateKPIData()
      dispatch({ type: 'UPDATE_KPI_DATA', payload: kpiData })
    },

    refreshThreatAlerts: () => {
      const alerts = SecurityDataManager.generateThreatAlerts()
      dispatch({ type: 'UPDATE_THREAT_ALERTS', payload: alerts })
    },

    updateTestResults: (siteId: string, results: TestResult[]) => {
      dispatch({ type: 'UPDATE_TEST_RESULTS', payload: { siteId, results } })
      
      // Update the test suite based on new results
      const testSuite = SecurityDataManager.generateTestSuite(siteId)
      dispatch({ type: 'UPDATE_TEST_SUITE', payload: { siteId, testSuite } })
      
      // Refresh KPI data and threat alerts after test results update
      setTimeout(() => {
        actions.refreshKPIData()
        actions.refreshThreatAlerts()
      }, 100)
    },

    runSecurityTest: async (siteId: string, testId: string) => {
      const test = SecurityDataManager.getAvailableTests().find(t => t.id === testId)
      if (!test) return

      // Start test execution
      dispatch({ 
        type: 'UPDATE_TEST_EXECUTION', 
        payload: { 
          isRunning: true, 
          currentTest: test, 
          progress: 0, 
          status: 'Initializing test...',
          results: []
        } 
      })

      // Simulate test execution with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, test.estimatedDuration * 10))
        
        const status = progress < 30 ? 'Preparing test environment...' :
                      progress < 60 ? 'Running security assessment...' :
                      progress < 90 ? 'Analyzing results...' :
                      'Finalizing report...'

        dispatch({ 
          type: 'UPDATE_TEST_EXECUTION', 
          payload: { progress, status } 
        })
      }

      // Complete test and update results
      const results = SecurityDataManager.getTestResults(siteId)
      const testResult = results.find(r => r.testId === testId)
      
      if (testResult) {
        dispatch({ 
          type: 'UPDATE_TEST_EXECUTION', 
          payload: { 
            isRunning: false,
            progress: 100,
            status: 'Test completed',
            results: [testResult]
          } 
        })

        // Update test results in state
        actions.updateTestResults(siteId, results)
      }
    },

    refreshAllData: () => {
      dispatch({ type: 'REFRESH_ALL_DATA' })
    },

    handleError: (error: Error, context?: string) => {
      console.error(`Security Context Error${context ? ` (${context})` : ''}:`, error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
      dispatch({ type: 'INCREMENT_RETRY_COUNT' })
    },

    retryOperation: async (operation: () => Promise<void>) => {
      const maxRetries = 3
      const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 10000) // Exponential backoff

      if (state.retryCount >= maxRetries) {
        dispatch({ type: 'SET_ERROR', payload: 'Maximum retry attempts exceeded. Please refresh the page.' })
        return
      }

      try {
        dispatch({ type: 'SET_ERROR', payload: null })
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        await operation()
        dispatch({ type: 'RESET_RETRY_COUNT' })
      } catch (error) {
        actions.handleError(error as Error, 'Retry Operation')
      }
    }
  }

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_NETWORK_STATUS', payload: 'online' })
    const handleOffline = () => dispatch({ type: 'SET_NETWORK_STATUS', payload: 'offline' })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial network status
    dispatch({ type: 'SET_NETWORK_STATUS', payload: navigator.onLine ? 'online' : 'offline' })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize data on mount with performance optimizations
  useEffect(() => {
    const initializeData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })
        
        // Load sites with error handling and performance optimization
        const sites = SecurityDataManager.getAllSites()
        if (!sites || sites.length === 0) {
          throw new Error('No MCX sites found. Please check your data configuration.')
        }
        dispatch({ type: 'SET_SITES', payload: sites })

        // Generate test suites in batches to avoid blocking the UI
        const testSuites: Record<string, SecurityTestSuite> = {}
        const batchSize = 5
        
        for (let i = 0; i < sites.length; i += batchSize) {
          const batch = sites.slice(i, i + batchSize)
          
          // Process batch
          batch.forEach(site => {
            try {
              testSuites[site.id] = SecurityDataManager.generateTestSuite(site.id)
            } catch (error) {
              console.warn(`Failed to generate test suite for site ${site.id}:`, error)
            }
          })
          
          // Update state with current batch
          Object.entries(testSuites).forEach(([siteId, testSuite]) => {
            dispatch({ type: 'UPDATE_TEST_SUITE', payload: { siteId, testSuite } })
          })
          
          // Allow UI to update between batches
          if (i + batchSize < sites.length) {
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }

        // Calculate initial KPI data with error handling
        try {
          const kpiData = calculateKPIData()
          dispatch({ type: 'UPDATE_KPI_DATA', payload: kpiData })
        } catch (error) {
          console.warn('Failed to calculate KPI data:', error)
        }

        // Generate threat alerts with error handling (defer to avoid blocking)
        setTimeout(() => {
          try {
            const alerts = SecurityDataManager.generateThreatAlerts()
            dispatch({ type: 'UPDATE_THREAT_ALERTS', payload: alerts })
          } catch (error) {
            console.warn('Failed to generate threat alerts:', error)
          }
        }, 100)

        dispatch({ type: 'SET_LOADING', payload: false })
        dispatch({ type: 'RESET_RETRY_COUNT' })
      } catch (error) {
        actions.handleError(error as Error, 'Data Initialization')
      }
    }

    initializeData()
  }, [])

  // Recalculate KPI data when test suites change
  useEffect(() => {
    if (!state.loading && state.sites.length > 0) {
      const kpiData = calculateKPIData()
      dispatch({ type: 'UPDATE_KPI_DATA', payload: kpiData })
    }
  }, [state.testSuites, state.sites.length, state.loading])

  return (
    <SecurityContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </SecurityContext.Provider>
  )
}

// Hook to use the security context
export function useSecurityContext() {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider')
  }
  return context
}