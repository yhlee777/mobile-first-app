'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Download } from 'lucide-react'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInStandalone, setIsInStandalone] = useState(false)

  useEffect(() => {
    // 이미 PWA로 실행 중인지 확인
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true
    setIsInStandalone(isStandalone)

    // iOS 체크
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // 설치 이벤트 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // 설치 유도를 본 적이 없으면 표시
      const hasSeenPrompt = localStorage.getItem('pwa-prompt-seen')
      if (!hasSeenPrompt) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA 설치됨')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-seen', 'true')
  }

  const handleClose = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-seen', 'true')
  }

  // PWA로 이미 실행 중이면 표시 안함
  if (isInStandalone) return null

  // iOS 설치 안내
  if (isIOS && showPrompt) {
    return (
      <Card className="fixed bottom-20 left-4 right-4 p-4 z-50 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            앱으로 설치하기
          </h3>
          <p className="text-sm text-gray-600">
            하단 공유 버튼 → "홈 화면에 추가"를 눌러주세요
          </p>
        </div>
      </Card>
    )
  }

  // 안드로이드/데스크톱 설치 버튼
  if (deferredPrompt && showPrompt) {
    return (
      <Card className="fixed bottom-20 left-4 right-4 p-4 z-50 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="h-5 w-5 text-green-600" />
            앱으로 설치하기
          </h3>
          <p className="text-sm text-gray-600">
            홈 화면에 추가하고 앱처럼 사용하세요!
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              설치하기
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
            >
              나중에
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return null
}