import { useState } from 'react'
import { motion } from 'framer-motion'

export default function UploadForm({ onUpload }) {
  const [sessionName, setSessionName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = async (file) => {
    setIsUploading(true)
    try {
      // Mock: Just simulate upload
      console.log('File:', file)
      console.log('Session Name:', sessionName)
      // In Phase 3, we'll wire the actual API here
      setTimeout(() => {
        setIsUploading(false)
        setSessionName('')
        onUpload && onUpload()
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      setIsUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass p-6 rounded-xl mb-6"
    >
      <h2 className="text-lg font-semibold mb-4">📤 Upload Logs</h2>

      {/* Session Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Session Name
        </label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="e.g., Payment Service Incident"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-smooth"
        />
      </div>

      {/* Drag Drop Area */}
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-smooth ${
          dragActive
            ? 'border-cyan-500/50 bg-cyan-500/5'
            : 'border-white/20 hover:border-white/30'
        }`}
      >
        <p className="text-lg font-medium text-gray-300 mb-2">
          Drop logs file here or click to select
        </p>
        <p className="text-sm text-gray-500">
          Supports JSON, text, or CSV formats
        </p>
        <input
          type="file"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer" />
      </motion.div>

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isUploading || !sessionName}
        className={`w-full mt-4 py-3 rounded-lg font-semibold transition-smooth ${
          isUploading || !sessionName
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-600 to-violet-600 text-white hover:shadow-lg glow-cyan'
        }`}
      >
        {isUploading ? '📤 Uploading...' : '🚀 Upload & Analyze'}
      </motion.button>
    </motion.div>
  )
}
