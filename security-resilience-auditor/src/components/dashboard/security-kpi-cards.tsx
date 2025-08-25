'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, MapPin, CheckCircle } from 'lucide-react'
import { useSecurityContext } from '@/contexts/security-context'

export function SecurityKPICards() {
  const { state } = useSecurityContext()

  const getResilienceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getResilienceBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  const getResilienceStatus = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  if (state.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Overall Network Resilience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Resilience</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${getResilienceColor(state.kpiData.overallNetworkResilience)}`}>
              {state.kpiData.overallNetworkResilience}%
            </div>
            <Badge variant={getResilienceBadgeVariant(state.kpiData.overallNetworkResilience)}>
              {getResilienceStatus(state.kpiData.overallNetworkResilience)}
            </Badge>
          </div>
          <Progress 
            value={state.kpiData.overallNetworkResilience} 
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Average resilience across all sites
          </p>
        </CardContent>
      </Card>

      {/* Critical Vulnerabilities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Vulnerabilities</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${state.kpiData.criticalVulnerabilities > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {state.kpiData.criticalVulnerabilities}
            </div>
            {state.kpiData.criticalVulnerabilities > 0 ? (
              <Badge variant="destructive">High Risk</Badge>
            ) : (
              <Badge variant="default">Secure</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Sites with critical risk level
          </p>
        </CardContent>
      </Card>

      {/* Sites at Risk */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sites at Risk</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${state.kpiData.sitesAtRisk > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {state.kpiData.sitesAtRisk}
            </div>
            {state.kpiData.sitesAtRisk > 0 ? (
              <Badge variant="secondary">Attention</Badge>
            ) : (
              <Badge variant="default">Good</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Sites below 60% resilience score
          </p>
        </CardContent>
      </Card>

      {/* Last Audit Coverage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Audit Coverage</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`text-2xl font-bold ${state.kpiData.lastAuditCoverage >= 90 ? 'text-green-600' : state.kpiData.lastAuditCoverage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {state.kpiData.lastAuditCoverage}%
            </div>
            <Badge variant={state.kpiData.lastAuditCoverage >= 90 ? 'default' : state.kpiData.lastAuditCoverage >= 70 ? 'secondary' : 'destructive'}>
              {state.kpiData.lastAuditCoverage >= 90 ? 'Complete' : state.kpiData.lastAuditCoverage >= 70 ? 'Good' : 'Incomplete'}
            </Badge>
          </div>
          <Progress 
            value={state.kpiData.lastAuditCoverage} 
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Sites with recent security audits
          </p>
        </CardContent>
      </Card>
    </div>
  )
}