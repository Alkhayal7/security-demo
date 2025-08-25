'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, XCircle, Info, Shield, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'security'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationItemProps {
  notification: Notification
  onDismiss: (id: string) => void
}

function NotificationItem({ notification, onDismiss }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'security':
        return <Shield className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'security':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    }
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-out',
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        'max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 border',
        getColorClasses()
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {notification.message}
              </p>
            )}
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleDismiss}
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function NotificationContainer({ 
  notifications, 
  onDismiss,
  position = 'top-right'
}: NotificationContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div className={cn(
      'fixed z-50 pointer-events-none',
      getPositionClasses()
    )}>
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-in slide-in-from-right duration-300"
          >
            <NotificationItem
              notification={notification}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }
    
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Convenience methods
  const success = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration })
  }

  const error = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration })
  }

  const security = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'security', title, message, duration })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    security
  }
}

// Security-specific notification components
interface SecurityAlertProps {
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  onDismiss?: () => void
  onAction?: () => void
  actionLabel?: string
}

export function SecurityAlert({
  severity,
  title,
  message,
  onDismiss,
  onAction,
  actionLabel = 'View Details'
}: SecurityAlertProps) {
  const getSeverityIcon = () => {
    switch (severity) {
      case 'critical':
        return <Zap className="h-5 w-5 text-red-600 animate-pulse" />
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityClasses = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700 animate-pulse'
      case 'high':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    }
  }

  return (
    <div className={cn(
      'rounded-lg border p-4 shadow-sm animate-in slide-in-from-top duration-500',
      getSeverityClasses()
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getSeverityIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
          {onAction && (
            <div className="mt-3">
              <button
                onClick={onAction}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}