"use client"

import { useState, useEffect } from "react"
import { WifiOff } from "lucide-react"
import { isOnline } from "@/lib/network-utils"

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    // Initiële status
    setOnline(isOnline())

    // Event listeners voor online/offline status
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>Je bent offline</span>
    </div>
  )
}
