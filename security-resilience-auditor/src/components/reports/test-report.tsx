'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SecurityTestSuite, MCXSite } from '@/types/security-types'
import { SecurityDataManager } from '../../lib/security-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts'
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock, MapPin, Building } from 'lucide-react'

interface TestReportProps {
  siteId: string
  testSuite?: SecurityTestSuite
  site?: MCXSite
  showCharts?: boolean
  compact?: boolean
}

export function TestReport({ siteId, testSuite, site, showCharts = true, compact = false }: TestReportProps) {
  // Get data if not provided
  const reportTestSuite = testSuite || SecurityDataManager.generateTestSuite(siteId)
  const reportSite = site || SecurityDataManager.getSiteById(siteId)
  const testResults = SecurityDataManager.getTestResults(siteId)
  
  if (!reportSite) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Site not found: {siteId}</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const testScoreData = [
    { name: 'Jamming SSB/PBCH/PRACH', score: reportTestSuite.tests.jammingSSBPBCHPRACH, category: 'Jamming' },
    { name: 'PRACH Flooding', score: reportTestSuite.tests.prachFlooding, category: 'Flooding' },
    { name: 'GNSS Jamming', score: reportTestSuite.tests.gnssJamming, category: 'Jamming' },
    { name: 'GNSS Spoofing', score: reportTestSuite.tests.gnssSpoofing, category: 'Spoofing' },
    { name: 'Beamforming Exploits', score: reportTestSuite.tests.beamformingExploits, category: 'Exploitation' },
    { name: 'Replay/Injection', score: reportTestSuite.tests.replayInjection, category: 'Injection' },
    { name: 'Rogue gNB', score: reportTestSuite.tests.rogueGNB, category: 'Spoofing' },
    { name: 'Forged NAS/RRC', score: reportTestSuite.tests.forgedNASRRC, category: 'Injection' },
    { name: 'Packet Manipulation', score: reportTestSuite.tests.packetManipulation, category: 'Manipulation' },
    { name: 'Tunneling Misuse', score: reportTestSuite.tests.tunnelingMisuse, category: 'Exploitation' },
    { name: 'Flooding UPF', score: reportTestSuite.tests.floodingUPF, category: 'Flooding' }
  ]

  const radarData = testScoreData.map(item => ({
    test: item.name.split(' ')[0], // Shortened names for radar
    score: item.score
  }))

  const categoryData = [
    { name: 'Jamming', value: Math.round((reportTestSuite.tests.jammingSSBPBCHPRACH + reportTestSuite.tests.gnssJamming) / 2) },
    { name: 'Flooding', value: Math.round((reportTestSuite.tests.prachFlooding + reportTestSuite.tests.floodingUPF) / 2) },
    { name: 'Spoofing', value: Math.round((reportTestSuite.tests.gnssSpoofing + reportTestSuite.tests.rogueGNB) / 2) },
    { name: 'Injection', value: Math.round((reportTestSuite.tests.replayInjection + reportTestSuite.tests.forgedNASRRC) / 2) },
    { name: 'Exploitation', value: Math.round((reportTestSuite.tests.beamformingExploits + reportTestSuite.tests.tunnelingMisuse) / 2) },
    { name: 'Manipulation', value: reportTestSuite.tests.packetManipulation }
  ]

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const criticalTests = testResults.filter(result => result.status === 'failed')
  const warningTests = testResults.filter(result => result.status === 'warning')
  const passedTests = testResults.filter(result => result.status === 'passed')

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Security Test Report</CardTitle>
            <Badge className={getRiskColor(reportTestSuite.riskLevel)}>
              {reportTestSuite.riskLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {reportSite.name} • Overall Score: {reportTestSuite.overallScore}/100
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests.length}</div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningTests.length}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalTests.length}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
          <Progress value={reportTestSuite.overallScore} className="h-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Security Test Report
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {reportSite.name}
                </div>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {reportSite.infrastructure.type.replace('_', ' ')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${getRiskColor(reportTestSuite.riskLevel)} text-lg px-3 py-1`}>
                {reportTestSuite.riskLevel.toUpperCase()} RISK
              </Badge>
              <div className="mt-2">
                <div className="text-3xl font-bold">
                  <span className={getScoreColor(reportTestSuite.overallScore)}>
                    {reportTestSuite.overallScore}
                  </span>
                  <span className="text-muted-foreground text-lg">/100</span>
                </div>
                <div className="text-sm text-muted-foreground">Overall Resilience Score</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passedTests.length}</div>
              <div className="text-sm text-green-700">Tests Passed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{warningTests.length}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{criticalTests.length}</div>
              <div className="text-sm text-red-700">Critical Issues</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{testResults.length}</div>
              <div className="text-sm text-blue-700">Total Tests</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Test Scores by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={testScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={10}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar 
                    dataKey="score" 
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Security Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="test" fontSize={10} />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Security Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Security by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testScoreData.map((test, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{test.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {test.category}
                        </Badge>
                      </div>
                      <Progress value={test.score} className="h-2" />
                    </div>
                    <div className="ml-4 text-right">
                      <div className={`font-bold ${getScoreColor(test.score)}`}>
                        {test.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.testId.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/100
                    </span>
                    <Badge variant={result.status === 'passed' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {result.details}
                </div>
                {result.recommendations.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium mb-1">Recommendations:</div>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {result.recommendations.map((rec, recIndex) => (
                        <li key={recIndex}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Location</div>
              <div>{reportSite.location.city}, {reportSite.location.region}</div>
              <div className="text-sm text-muted-foreground">
                {reportSite.location.latitude.toFixed(4)}, {reportSite.location.longitude.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Infrastructure</div>
              <div className="capitalize">{reportSite.infrastructure.type.replace('_', ' ')}</div>
              <Badge variant="outline" className="mt-1">
                {reportSite.infrastructure.criticality.toUpperCase()} Priority
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Technical Details</div>
              <div>Firmware: {reportSite.technical.firmwareVersion}</div>
              <div className="text-sm text-muted-foreground">
                Network Nodes: {reportSite.technical.networkTopology.length}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Audit</div>
              <div>{new Date(reportSite.security.lastAuditDate).toLocaleDateString()}</div>
              <div className="text-sm text-muted-foreground">
                Vulnerabilities: {reportSite.security.vulnerabilities.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}