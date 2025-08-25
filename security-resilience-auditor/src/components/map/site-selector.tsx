'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  MapPin, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  Calendar,
  Cpu,
  Network,
  Lock
} from 'lucide-react'
import { MCXSite } from '@/types/security-types'

interface SiteSelectorProps {
  site: MCXSite
  onClose: () => void
}

export function SiteSelector({ site, onClose }: SiteSelectorProps) {
  const getSecurityIcon = (score: number) => {
    if (score >= 80) return <ShieldCheck className="h-5 w-5 text-green-600" />
    if (score >= 50) return <Shield className="h-5 w-5 text-yellow-600" />
    return <ShieldAlert className="h-5 w-5 text-red-600" />
  }

  const getSecurityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSecurityStatus = (score: number) => {
    if (score >= 80) return 'Secure'
    if (score >= 50) return 'Moderate Risk'
    return 'High Risk'
  }

  const formatInfrastructureType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 pr-8">{site.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {formatInfrastructureType(site.infrastructure.type)}
              </Badge>
              <Badge 
                variant={site.infrastructure.criticality === 'high' ? 'destructive' : 
                       site.infrastructure.criticality === 'medium' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {site.infrastructure.criticality.toUpperCase()} PRIORITY
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Information */}
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <div className="font-medium">{site.location.city}, {site.location.region}</div>
            <div className="text-muted-foreground">
              {site.location.latitude.toFixed(4)}, {site.location.longitude.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Security Resilience Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSecurityIcon(site.security.resilienceScore)}
              <span className="font-medium">Security Resilience</span>
            </div>
            <span className={`font-bold ${getSecurityColor(site.security.resilienceScore)}`}>
              {site.security.resilienceScore}/100
            </span>
          </div>
          <Progress 
            value={site.security.resilienceScore} 
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs">
            <span className={getSecurityColor(site.security.resilienceScore)}>
              {getSecurityStatus(site.security.resilienceScore)}
            </span>
            {site.infrastructure.criticality === 'high' && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Critical Infrastructure</span>
              </div>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Last Security Audit</div>
              <div className="text-muted-foreground">
                {new Date(site.security.lastAuditDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Firmware Version</div>
              <div className="text-muted-foreground">{site.technical.firmwareVersion}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Security Configuration</div>
              <div className="text-muted-foreground">
                {site.technical.securitySettings.encryptionEnabled ? 'Encrypted' : 'Not Encrypted'} • 
                {' '}{site.technical.securitySettings.authenticationMethod}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Network className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">Access Control</div>
              <div className="text-muted-foreground">
                {site.technical.securitySettings.accessControlPolicies.length} policies active
              </div>
            </div>
          </div>
        </div>

        {/* Vulnerabilities Alert */}
        {site.security.resilienceScore < 60 && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-200">Security Alert</span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              This site has a low resilience score and may require immediate attention.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button className="w-full" size="sm">
            Run Security Tests
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            View Detailed Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}