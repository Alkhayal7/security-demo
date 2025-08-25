'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SecurityDataManager } from '../../lib/security-data'
import { ThreatAlert } from '@/types/security-types'
import { AlertTriangle, Shield, Clock, CheckCircle } from 'lucide-react'
import { useSecurityContext } from '@/contexts/security-context'

export function ThreatAlerts() {
  const { state, actions } = useSecurityContext()

  const getSeverityIcon = (severity: ThreatAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'high':
        return <Shield className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityBadgeVariant = (severity: ThreatAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStatusBadgeVariant = (status: ThreatAlert['status']) => {
    switch (status) {
      case 'active':
        return 'destructive'
      case 'acknowledged':
        return 'secondary'
      case 'resolved':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    // Update threat alerts in global state
    const updatedAlerts = state.threatAlerts.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    )
    actions.refreshThreatAlerts()
  }

  const handleResolveAlert = (alertId: string) => {
    // Update threat alerts in global state
    const updatedAlerts = state.threatAlerts.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'resolved' as const }
        : alert
    )
    actions.refreshThreatAlerts()
  }

  if (state.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Threat Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeAlerts = state.threatAlerts.filter(alert => alert.status === 'active')
  const acknowledgedAlerts = state.threatAlerts.filter(alert => alert.status === 'acknowledged')
  const resolvedAlerts = state.threatAlerts.filter(alert => alert.status === 'resolved')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Threat Alerts</span>
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeAlerts.length} Active
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {state.threatAlerts.length} Total
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.threatAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-600 mb-2">All Clear</h3>
            <p className="text-muted-foreground">No active security threats detected</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {/* Active Alerts */}
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.description}
                  </p>
                  
                  <div className="mb-3">
                    <h5 className="text-xs font-medium mb-1">Affected Sites:</h5>
                    <div className="flex flex-wrap gap-1">
                      {alert.affectedSites.map((siteId) => {
                        const site = SecurityDataManager.getSiteById(siteId)
                        return (
                          <Badge key={siteId} variant="outline" className="text-xs">
                            {site?.name || siteId}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="text-xs font-medium mb-1">Recommendations:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {alert.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                      {alert.recommendations.length > 2 && (
                        <li className="text-blue-600 cursor-pointer hover:underline">
                          +{alert.recommendations.length - 2} more recommendations
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Acknowledged Alerts */}
              {acknowledgedAlerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}

              {/* Resolved Alerts (collapsed view) */}
              {resolvedAlerts.length > 0 && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {resolvedAlerts.length} Resolved Alert{resolvedAlerts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Badge variant="default">RESOLVED</Badge>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}