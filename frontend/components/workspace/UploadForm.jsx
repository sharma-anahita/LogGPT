'use client'

import { useState, useRef } from 'react'
import { uploadLogs } from '@/services/api'
import { motion } from 'framer-motion'


export function UploadForm({ session, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const fileInputRef = useRef(null)

  const selectedSessionId = session?.id || null
  const uploadSessionName = selectedSessionId ? session?.name || sessionName : sessionName

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setFeedback(null)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setFeedback(null)
    }
  }

  const handleAreaClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async () => {
    if ((!selectedSessionId && !sessionName) || (!file && !text)) return
    setIsLoading(true)
    setProgress(0)
    setFeedback(null)
    try {
      const res = await uploadLogs({
        sessionId: selectedSessionId,
        sessionName: selectedSessionId ? null : sessionName,
        file,
        text,
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      setFeedback({ type: 'success', message: 'Upload successful!' })
      if (!selectedSessionId) setSessionName('')
      setFile(null)
      setText('')
      setProgress(0)
      if (onUploadSuccess && res?.sessionId) {
        onUploadSuccess(res.sessionId)
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Upload failed. Please try again.',
      })
    }
    setIsLoading(false)
  }

  return (
    <motion.div className="glass p-8 rounded-2xl border border-white/10 shadow-lg">
      <h3 className="text-xl font-bold tracking-tight text-white mb-7">📤 Upload Logs</h3>
      <div className="space-y-6">
        {/* Session name input */}
        <div>
          <label className="text-sm text-white/70 block mb-2 font-semibold tracking-wide">
            {selectedSessionId ? 'Session' : 'Session Name'}
          </label>
          <motion.input
            whileFocus={{ scale: 1.03, boxShadow: '0 0 0 2px rgba(0,240,255,0.15)' }}
            type="text"
            placeholder={selectedSessionId ? 'Uploads will attach to the selected session' : 'e.g., Payment Service Incident'}
            value={uploadSessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono text-base"
            disabled={isLoading || !!selectedSessionId}
          />
          {selectedSessionId && (
            <p className="mt-2 text-xs text-cyan-300/80">
              Uploading into selected session: {session?.name}
            </p>
          )}
        </div>

        {/* Drag and drop/file input area */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
          animate={{
            borderColor: isDragging ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)',
            backgroundColor: isDragging ? 'rgba(0, 240, 255, 0.07)' : 'rgba(0, 0, 0, 0)',
          }}
          className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragging ? 'glow-cyan-lg' : ''}`}
        >
          <p className="text-white/70 text-base font-medium">Drop logs file here or <span className="underline text-cyan-400">click to select</span></p>
          <p className="text-xs text-white/50 mt-1">Supports JSON, text, or CSV formats</p>
          {file && <div className="mt-2 text-cyan-300 text-xs font-mono">Selected: {file.name}</div>}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </motion.div>

        {/* Or paste logs textarea */}
        <div>
          <label className="text-sm text-white/70 block mb-2 font-semibold tracking-wide">Or Paste Logs</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            placeholder="Paste logs here..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none font-mono text-base"
            disabled={isLoading}
          />
        </div>

        {/* Progress bar */}
        {isLoading && (
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden animate-pulse">
            <div
              className="h-2 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all animate-shimmer"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`text-sm mt-2 font-semibold ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message}</div>
        )}

        {/* Upload button */}
        <motion.button
          whileHover={{ scale: (selectedSessionId || sessionName) && (file || text) && !isLoading ? 1.04 : 1, y: -2, boxShadow: (selectedSessionId || sessionName) && (file || text) && !isLoading ? '0 0 24px 4px rgba(0,240,255,0.18)' : undefined }}
          whileTap={{ scale: 0.97 }}
          onClick={handleUpload}
          disabled={(!selectedSessionId && !sessionName) || (!file && !text) || isLoading}
          className={`w-full px-7 py-3 rounded-xl font-bold text-base transition-smooth tracking-wide select-none ${
            (selectedSessionId || sessionName) && (file || text) && !isLoading
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/50 glow-cyan'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {isLoading ? '🚀 Uploading...' : '🚀 Upload & Analyze'}
        </motion.button>
      </div>
    </motion.div>
  )
}
