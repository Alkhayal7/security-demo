'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { performanceMonitor } from '../lib/performance-monitor'

interface PerformanceProviderProps {
  children: ReactNode
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // Start performance monitoring
    performanceMonitor.recordMetric('app_start', Date.now(), 'timing')

    // Cleanup on unmount
    return () => {
      performanceMonitor.cleanup()
    }
  }, [])

  // Monitor component mount performance
  useEffect(() => {
    performanceMonitor.recordMetric('performance_provider_mounted', Date.now(), 'timing')
  }, [])

  return <>{children}</>
}