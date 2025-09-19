import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BottomNavigation } from '@/components/bottom-navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '인플루언서 매칭 플랫폼',
  description: '브랜드와 인플루언서를 연결하는 스마트한 플랫폼',
  manifest: '/manifest.json',
  themeColor: '#51a66f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="pb-16"> {/* 하단 네비게이션 공간 확보 */}
          {children}
        </div>
        <BottomNavigation />
      </body>
    </html>
  )
}