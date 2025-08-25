'use client'

import { ReportGenerator } from '@/components/reports/report-generator'

export default function ReportsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Security Reports</h1>
        <p className="text-muted-foreground">
          Generate comprehensive security assessment reports for MCX sites with detailed analysis and recommendations.
        </p>
      </div>
      
      <ReportGenerator />
    </div>
  )
}