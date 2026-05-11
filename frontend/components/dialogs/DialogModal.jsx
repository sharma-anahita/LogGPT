'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const toneStyles = {
  info: {
    badge: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/20',
    glow: 'shadow-cyan-500/15',
  },
  success: {
    badge: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
    glow: 'shadow-emerald-500/15',
  },
  warning: {
    badge: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
    glow: 'shadow-amber-500/15',
  },
  danger: {
    badge: 'bg-red-400/15 text-red-300 border-red-400/20',
    glow: 'shadow-red-500/15',
  },
}

export function DialogModal({
  open,
  title,
  message,
  tone = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  input,
  inputValue,
  onInputChange,
  onConfirm,
  onCancel,
  onClose,
}) {
  const styles = toneStyles[tone] || toneStyles.info

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel?.()
      }
      if (event.key === 'Enter' && !event.shiftKey && !input) {
        onConfirm?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [input, onCancel, onConfirm, open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onCancel?.()
            }
          }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className={`relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#050505] text-white shadow-2xl ${styles.glow}`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${styles.badge}`}>
                  {tone}
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                  {title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose || onCancel}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-cyan-400/40 hover:bg-white/5 hover:text-white"
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              {message && (
                <p className="text-sm leading-6 text-white/70 whitespace-pre-line">
                  {message}
                </p>
              )}

              {input && (
                <div className="space-y-2">
                  {input.label && (
                    <label className="text-sm font-medium text-white/80">
                      {input.label}
                    </label>
                  )}
                  <input
                    type={input.type || 'text'}
                    value={inputValue}
                    onChange={(event) => onInputChange?.(event.target.value)}
                    placeholder={input.placeholder}
                    autoFocus={input.autoFocus !== false}
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/15"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">
              {showCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  {cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-blue-500 hover:to-cyan-400"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}