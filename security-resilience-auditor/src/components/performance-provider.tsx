'use client'

import React, { useEffect, ReactNode } from 'react'
import { performanceMonitor } from '@/lib/performance-monitor'
import { assetPreloader } from '@/lib/asset-preloader'

interface PerformanceProviderProps {
  children: ReactNode
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // Start performance monitoring
    performanceMonitor.recordMetric('app_start', Date.now(), 'timing')

    // Preload demo-critical assets
    const preloadAssets = async () => {
      try {
        const endTiming = performanceMonitor.startTiming('asset_preload')
        await assetPreloader.preloadDemoCriticalAssets()
        endTiming()
        
        performanceMonitor.recordMetric('assets_preloaded', 1, 'counter')
      } catch (error) {
        console.warn('Failed to preload demo assets:', error)
        performanceMonitor.recordMetric('asset_preload_failed', 1, 'counter')
      }
    }

    // Defer asset preloading to avoid blocking initial render
    setTimeout(preloadAssets, 100)

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