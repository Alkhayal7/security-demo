import { SecurityKPICards } from '@/components/dashboard/security-kpi-cards'
import { ThreatAlerts } from '@/components/dashboard/threat-alerts'

export default function Home() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Proactive Security and Resilience Auditor for MCX Networks
          </p>
        </div>
      </div>
      
      {/* Security KPI Cards */}
      <SecurityKPICards />
      
      {/* Threat Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatAlerts />
        </div>
        <div className="space-y-6">
          {/* Additional dashboard widgets can be added here */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• View security map</p>
              <p>• Generate reports</p>
              <p>• Run security tests</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}