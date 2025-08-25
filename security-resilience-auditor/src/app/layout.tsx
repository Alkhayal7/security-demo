import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SecurityProvider } from '@/contexts/security-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PerformanceProvider } from '@/components/performance-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Security Resilience Auditor',
  description: 'Proactive Security and Resilience Auditor for MCX Networks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" as="style" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://a.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://b.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://c.tile.openstreetmap.org" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ErrorBoundary>
            <PerformanceProvider>
              <SecurityProvider>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-auto p-6">
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                    </main>
                  </div>
                </div>
              </SecurityProvider>
            </PerformanceProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}