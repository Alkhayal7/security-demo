'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SecurityDataManager } from '@/lib/security-data'
import { ReportUtils } from '@/lib/report-utils'
import { PDFExportUtils } from '@/lib/pdf-export'
import { TestReport } from './test-report'
import { Download, FileText, Printer, Share2, Filter, Calendar, MapPin, Building2, FileDown, FileSpreadsheet } from 'lucide-react'

interface ReportGeneratorProps {
  selectedSiteId?: string
}

export function ReportGenerator({ selectedSiteId }: ReportGeneratorProps) {
  const [selectedSites, setSelectedSites] = useState<string[]>(selectedSiteId ? [selectedSiteId] : [])
  const [reportType, setReportType] = useState<'individual' | 'summary' | 'comparison'>('individual')
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const allSites = SecurityDataManager.getAllSites()
  const availableSites = allSites.slice(0, 11) // Limit to sites with sample data

  const handleSiteToggle = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500))
    setShowPreview(true)
    setIsGenerating(false)
  }

  const handleExportPDF = async () => {
    try {
      setIsGenerating(true)
      const sitesData = getSelectedSitesData()
      const reportsData = sitesData.map(data => ({
        site: data.site,
        testSuite: data.testSuite,
        testResults: SecurityDataManager.getTestResults(data.site.id),
        generatedAt: new Date().toISOString()
      }))
      const summary = ReportUtils.generateReportSummary(reportsData)
      
      // Try HTML to PDF conversion first
      try {
        await PDFExportUtils.exportReportToPDF('report-content', 'mcx-security-report')
      } catch {
        // Fallback to programmatic PDF generation
        await PDFExportUtils.generatePDFFromData(reportsData, summary, 'mcx-security-report')
      }
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportCSV = () => {
    try {
      const sitesData = getSelectedSitesData()
      const reportsData = sitesData.map(data => ({
        site: data.site,
        testSuite: data.testSuite,
        testResults: SecurityDataManager.getTestResults(data.site.id),
        generatedAt: new Date().toISOString()
      }))
      PDFExportUtils.downloadCSVReport(reportsData, 'mcx-security-report')
    } catch (error) {
      console.error('CSV export failed:', error)
      alert('Failed to export CSV. Please try again.')
    }
  }

  const handleExportHTML = () => {
    try {
      const sitesData = getSelectedSitesData()
      const reportsData = sitesData.map(data => ({
        site: data.site,
        testSuite: data.testSuite,
        testResults: SecurityDataManager.getTestResults(data.site.id),
        generatedAt: new Date().toISOString()
      }))
      const summary = ReportUtils.generateReportSummary(reportsData)
      PDFExportUtils.downloadHTMLReport(reportsData, summary, 'mcx-security-report')
    } catch (error) {
      console.error('HTML export failed:', error)
      alert('Failed to export HTML. Please try again.')
    }
  }

  const handleExportJSON = () => {
    try {
      const sitesData = getSelectedSitesData()
      const reportsData = sitesData.map(data => ({
        site: data.site,
        testSuite: data.testSuite,
        testResults: SecurityDataManager.getTestResults(data.site.id),
        generatedAt: new Date().toISOString()
      }))
      const summary = ReportUtils.generateReportSummary(reportsData)
      PDFExportUtils.downloadJSONReport(reportsData, summary, 'mcx-security-report')
    } catch (error) {
      console.error('JSON export failed:', error)
      alert('Failed to export JSON. Please try again.')
    }
  }

  const handlePrint = () => {
    PDFExportUtils.printReport('report-content')
  }

  const handleShare = async () => {
    try {
      const sitesData = getSelectedSitesData()
      const reportsData = sitesData.map(data => ({
        site: data.site,
        testSuite: data.testSuite,
        testResults: SecurityDataManager.getTestResults(data.site.id),
        generatedAt: new Date().toISOString()
      }))
      const summary = ReportUtils.generateReportSummary(reportsData)
      await PDFExportUtils.shareReport(reportsData, summary, 'text')
    } catch (error) {
      console.error('Share failed:', error)
      alert('Failed to share report. Please try again.')
    }
  }

  const getSelectedSitesData = () => {
    return selectedSites.map(siteId => ({
      site: SecurityDataManager.getSiteById(siteId)!,
      testSuite: SecurityDataManager.generateTestSuite(siteId)
    }))
  }

  const getSummaryStats = () => {
    const sitesData = getSelectedSitesData()
    const totalSites = sitesData.length
    const avgScore = Math.round(sitesData.reduce((sum, data) => sum + data.testSuite.overallScore, 0) / totalSites)
    const criticalSites = sitesData.filter(data => data.testSuite.riskLevel === 'critical').length
    const highRiskSites = sitesData.filter(data => data.testSuite.riskLevel === 'high').length
    
    return { totalSites, avgScore, criticalSites, highRiskSites }
  }

  if (showPreview && selectedSites.length > 0) {
    const sitesData = getSelectedSitesData()
    
    return (
      <div className="space-y-6">
        {/* Report Header with Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Security Assessment Report
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedSites.length} Site{selectedSites.length > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    MCX Network Assessment
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Back to Generator
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <div className="flex gap-1">
                  <Button onClick={handleExportPDF} disabled={isGenerating}>
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'PDF'}
                  </Button>
                  <Button variant="outline" onClick={handleExportCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={handleExportHTML}>
                    <FileDown className="h-4 w-4 mr-2" />
                    HTML
                  </Button>
                  <Button variant="outline" onClick={handleExportJSON}>
                    <FileText className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Report */}
        {reportType === 'summary' && selectedSites.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {(() => {
                  const stats = getSummaryStats()
                  return (
                    <>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalSites}</div>
                        <div className="text-sm text-blue-700">Sites Assessed</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.avgScore}</div>
                        <div className="text-sm text-green-700">Average Score</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{stats.criticalSites}</div>
                        <div className="text-sm text-red-700">Critical Risk</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{stats.highRiskSites}</div>
                        <div className="text-sm text-orange-700">High Risk</div>
                      </div>
                    </>
                  )
                })()}
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Site Overview</h4>
                <div className="grid gap-2">
                  {sitesData.map(({ site, testSuite }) => (
                    <div key={site.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{site.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {site.infrastructure.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-bold">{testSuite.overallScore}/100</div>
                        </div>
                        <Badge className={
                          testSuite.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          testSuite.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          testSuite.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {testSuite.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual Site Reports */}
        <div id="report-content">
          {sitesData.map(({ site, testSuite }) => (
            <div key={site.id} className="print:break-before-page">
              <TestReport 
                siteId={site.id} 
                testSuite={testSuite} 
                site={site}
                showCharts={reportType !== 'comparison'}
                compact={reportType === 'comparison'}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Security Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <div className="flex gap-2">
                <Button
                  variant={reportType === 'individual' ? 'default' : 'outline'}
                  onClick={() => setReportType('individual')}
                  size="sm"
                >
                  Individual Sites
                </Button>
                <Button
                  variant={reportType === 'summary' ? 'default' : 'outline'}
                  onClick={() => setReportType('summary')}
                  size="sm"
                >
                  Summary Report
                </Button>
                <Button
                  variant={reportType === 'comparison' ? 'default' : 'outline'}
                  onClick={() => setReportType('comparison')}
                  size="sm"
                >
                  Site Comparison
                </Button>
              </div>
            </div>

            {/* Site Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Sites ({selectedSites.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                {availableSites.map(site => {
                  const testSuite = SecurityDataManager.generateTestSuite(site.id)
                  const isSelected = selectedSites.includes(site.id)
                  
                  return (
                    <div
                      key={site.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSiteToggle(site.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{site.name}</div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            testSuite.riskLevel === 'critical' ? 'border-red-500 text-red-700' :
                            testSuite.riskLevel === 'high' ? 'border-orange-500 text-orange-700' :
                            testSuite.riskLevel === 'medium' ? 'border-yellow-500 text-yellow-700' :
                            'border-green-500 text-green-700'
                          }`}
                        >
                          {testSuite.overallScore}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {site.infrastructure.type.replace('_', ' ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Report Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Include Charts</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Visual charts and graphs</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Include Recommendations</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Security recommendations</span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedSites.length === 0 ? 'Select at least one site to generate a report' : 
                 `Ready to generate ${reportType} report for ${selectedSites.length} site${selectedSites.length > 1 ? 's' : ''}`}
              </div>
              <Button 
                onClick={handleGenerateReport}
                disabled={selectedSites.length === 0 || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                setSelectedSites(availableSites.slice(0, 3).map(s => s.id))
                setReportType('summary')
              }}
            >
              <Filter className="h-5 w-5" />
              <span className="text-sm">Critical Sites Only</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                setSelectedSites(availableSites.map(s => s.id))
                setReportType('summary')
              }}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-sm">All Sites Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const hospitalSites = availableSites.filter(s => s.infrastructure.type === 'hospital')
                setSelectedSites(hospitalSites.map(s => s.id))
                setReportType('comparison')
              }}
            >
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Hospital Sites</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const criticalSites = availableSites.filter(s => {
                  const suite = SecurityDataManager.generateTestSuite(s.id)
                  return suite.riskLevel === 'critical' || suite.riskLevel === 'high'
                })
                setSelectedSites(criticalSites.map(s => s.id))
                setReportType('individual')
              }}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">Risk Assessment</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}