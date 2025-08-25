"use client";

import { Suspense, lazy, ComponentType } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface LazyComponentProps {
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Higher-order component for lazy loading with performance optimizations
 */
export function createLazyComponent(
  importFn: () => Promise<{ default: ComponentType<unknown> }>
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: LazyComponentProps) {
    const { fallback: customFallback, className } = props;

    const defaultFallback = (
      <div
        className={`flex items-center justify-center p-4 ${className || ""}`}
      >
        <LoadingSpinner size="md" />
      </div>
    );

    return (
      <Suspense fallback={customFallback || defaultFallback}>
        <LazyComponent />
      </Suspense>
    );
  };
}

/**
 * Lazy loading wrapper for components with intersection observer
 */
export function LazyIntersectionComponent({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  className,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, hasLoaded]);

  const defaultFallback = (
    <div className={`flex items-center justify-center p-4 ${className || ""}`}>
      <LoadingSpinner size="sm" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : fallback || defaultFallback}
    </div>
  );
}

/**
 * Preload component resources
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<unknown> }>
) {
  // Preload the component
  importFn().catch((error) => {
    console.warn("Failed to preload component:", error);
  });
}

// React import for hooks
import React from "react";
