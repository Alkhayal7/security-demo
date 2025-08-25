'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  X, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Cpu, 
  Lock,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { MCXSite } from '@/types/security-types'

interface SiteDetailsPanelProps {
  site: MCXSite | null
  isOpen: boolean
  onClose: () => void
  onRunTests: (siteId: string) => void
  className?: string
}

export function SiteDetailsPanel({ 
  site, 
  isOpen, 
  onClose, 
  onRunTests,
  className = ""
}: SiteDetailsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    security: true,
    technical: false,
    infrastructure: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (!isOpen || !site) {
    return null
  }

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

  const getCriticalityVariant = (criticality: string) => {
    switch (criticality) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-40 transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Site Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Site Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-2">{site.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{site.location.city}, {site.location.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {site.infrastructure.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge 
                        variant={getCriticalityVariant(site.infrastructure.criticality)}
                        className="text-xs"
                      >
                        {site.infrastructure.criticality.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                  </div>
                  {site.infrastructure.criticality === 'high' && (
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Security Status */}
            <Card>
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleSection('security')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSecurityIcon(site.security.resilienceScore)}
                    <CardTitle className="text-sm">Security Status</CardTitle>
                  </div>
                  {expandedSections.security ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.security && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Resilience Score:</span>
                      <span className={`text-lg font-bold ${getSecurityColor(site.security.resilienceScore)}`}>
                        {site.security.resilienceScore}/100
                      </span>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          site.security.resilienceScore >= 80 ? 'bg-green-600' :
                          site.security.resilienceScore >= 50 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${site.security.resilienceScore}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last Audit:</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(site.security.lastAuditDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {site.security.vulnerabilities.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Active Vulnerabilities</span>
                        </div>
                        <div className="space-y-1">
                          {site.security.vulnerabilities.slice(0, 3).map((vuln) => (
                            <div key={vuln.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{vuln.type}</span>
                              <Badge 
                                variant={vuln.severity === 'critical' ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {vuln.severity}
                              </Badge>
                            </div>
                          ))}
                          {site.security.vulnerabilities.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{site.security.vulnerabilities.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Technical Information */}
            <Card>
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleSection('technical')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <CardTitle className="text-sm">Technical Details</CardTitle>
                  </div>
                  {expandedSections.technical ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.technical && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Firmware Version:</span>
                      <span className="font-mono">{site.technical.firmwareVersion}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Encryption:</span>
                      <div className="flex items-center gap-1">
                        <Lock className={`h-3 w-3 ${site.technical.securitySettings.encryptionEnabled ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={site.technical.securitySettings.encryptionEnabled ? 'text-green-600' : 'text-red-600'}>
                          {site.technical.securitySettings.encryptionEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Authentication:</span>
                      <span className="font-mono text-xs">{site.technical.securitySettings.authenticationMethod}</span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Security Policies:</div>
                      <div className="space-y-1">
                        {site.technical.securitySettings.accessControlPolicies.slice(0, 2).map((policy, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                            {policy}
                          </Badge>
                        ))}
                        {site.technical.securitySettings.accessControlPolicies.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{site.technical.securitySettings.accessControlPolicies.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Infrastructure Information */}
            <Card>
              <CardHeader 
                className="pb-2 cursor-pointer"
                onClick={() => toggleSection('infrastructure')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <CardTitle className="text-sm">Infrastructure</CardTitle>
                  </div>
                  {expandedSections.infrastructure ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.infrastructure && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span className="font-mono text-xs">
                        {site.location.latitude.toFixed(4)}, {site.location.longitude.toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Infrastructure Type:</span>
                      <span className="capitalize">{site.infrastructure.type.replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Criticality Level:</span>
                      <Badge variant={getCriticalityVariant(site.infrastructure.criticality)}>
                        {site.infrastructure.criticality.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/30">
          <Button 
            className="w-full" 
            onClick={() => onRunTests(site.id)}
            size="lg"
          >
            <Shield className="h-4 w-4 mr-2" />
            Run Security Tests
          </Button>
        </div>
      </div>
    </div>
  )
}