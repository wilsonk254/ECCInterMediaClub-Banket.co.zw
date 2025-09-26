"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
        setIsInstalled(true)
      }
    }

    checkIfInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show install prompt after a delay if not installed
      if (!isInstalled) {
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 3000)
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem("installPromptDismissed", "true")
  }

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showInstallPrompt || !deferredPrompt || sessionStorage.getItem("installPromptDismissed")) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <Card className="border-2 border-[#002147] shadow-lg animate-in slide-in-from-bottom-5 duration-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-[#002147]" />
              <h3 className="font-semibold text-[#002147]">Install ECC InterMedia Club</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Install our app for quick access to school updates, even when offline!
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-[#002147] hover:bg-[#00112b] text-white"
              size="sm"
            >
              Install App
            </Button>
            <Button onClick={handleDismiss} variant="outline" size="sm" className="flex-1 bg-transparent">
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
