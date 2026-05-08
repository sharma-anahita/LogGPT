'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function UploadForm() {
  const [isDragging, setIsDragging] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop
  }

  const handleUpload = async () => {
    if (!sessionName) return
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsLoading(false)
    setSessionName('')
  }

  return (
    <motion.div
      className="glass p-8 rounded-xl border border-white/10"
    >
      <h3 className="text-lg font-semibold mb-6">📤 Upload Logs</h3>

      <div className="space-y-4">
        {/* Session name input */}
        <div>
          <label className="text-sm text-white/70 block mb-2">Session Name</label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="e.g., Payment Service Incident"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
        </div>

        {/* Drag and drop area */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            borderColor: isDragging ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)',
            backgroundColor: isDragging ? 'rgba(0, 240, 255, 0.05)' : 'rgba(0, 0, 0, 0)',
          }}
          className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors"
        >
          <p className="text-white/70">Drop logs file here or click to select</p>
          <p className="text-sm text-white/50">Supports JSON, text, or CSV formats</p>

          <input type="file" className="hidden" />
        </motion.div>

        {/* Upload button */}
        <motion.button
          whileHover={{ scale: sessionName ? 1.02 : 1, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpload}
          disabled={!sessionName || isLoading}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
            sessionName
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/50'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {isLoading ? '🚀 Uploading...' : '🚀 Upload & Analyze'}
        </motion.button>
      </div>
    </motion.div>
  )
}
