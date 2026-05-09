'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, removeToken, getToken } from '@/services/auth'
import Workspace from '@/components/Workspace'

export default function WorkspacePage() {
  const [isAuth, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    setIsAuth(true)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    removeToken()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuth) {
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header with logout */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">LogGPT Workspace</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Workspace content */}
      <div className="relative z-10">
        <Workspace />
      </div>
    </div>
  )
}
