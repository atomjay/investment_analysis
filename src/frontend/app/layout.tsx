import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'iBank - 外商投資銀行分析工具',
  description: '專業級投資分析工具，提供四種估值方法：相對估值法(CCA)、現金流折現法(DCF)、交易比率法(PTA)、資產基礎法，智能生成買賣建議',
  keywords: '投資分析, 股票估值, DCF, CCA, 投資建議, 外商投資銀行',
  authors: [{ name: 'iBank Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'iBank - 外商投資銀行分析工具',
    description: '專業級投資分析工具，提供多重估值方法和智能投資建議',
    type: 'website',
    locale: 'zh_TW',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className="scroll-smooth">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Meta tags for better SEO */}
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          {/* Main content */}
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                maxWidth: '400px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}