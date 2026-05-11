'use client'

import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { DialogModal } from './DialogModal'

const DialogContext = createContext(null)

const defaultDialogState = {
  open: false,
  title: '',
  message: '',
  tone: 'info',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  input: null,
  inputValue: '',
}

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(defaultDialogState)
  const resolverRef = useRef(null)

  const closeDialog = (result) => {
    setDialog((current) => ({ ...current, open: false }))
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }

  const openDialog = (options = {}) => {
    if (resolverRef.current) {
      resolverRef.current({ confirmed: false, value: null, dismissed: true })
      resolverRef.current = null
    }

    return new Promise((resolve) => {
      resolverRef.current = resolve
      setDialog({
        ...defaultDialogState,
        ...options,
        open: true,
        inputValue: options.initialValue ?? '',
        input: options.input ?? null,
      })
    })
  }

  const confirm = (options = {}) =>
    openDialog({
      ...options,
      showCancel: options.showCancel ?? true,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      tone: options.tone ?? 'warning',
    })

  const alert = (options = {}) =>
    openDialog({
      ...options,
      showCancel: false,
      confirmText: options.confirmText ?? 'OK',
      tone: options.tone ?? 'info',
    })

  const prompt = (options = {}) =>
    openDialog({
      ...options,
      showCancel: true,
      confirmText: options.confirmText ?? 'Continue',
      cancelText: options.cancelText ?? 'Cancel',
      tone: options.tone ?? 'info',
      input: options.input ?? { label: options.inputLabel ?? 'Value' },
      initialValue: options.initialValue ?? '',
    })

  const value = { confirm, alert, prompt }

  return (
    <DialogContext.Provider value={value}>
      {children}
      <DialogModal
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        tone={dialog.tone}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
        input={dialog.input}
        inputValue={dialog.inputValue}
        onInputChange={(nextValue) => setDialog((current) => ({ ...current, inputValue: nextValue }))}
        onConfirm={() => {
          closeDialog({ confirmed: true, value: dialog.input ? dialog.inputValue : true })
        }}
        onCancel={() => {
          closeDialog({ confirmed: false, value: dialog.input ? dialog.inputValue : null })
        }}
        onClose={() => {
          closeDialog({ confirmed: false, value: dialog.input ? dialog.inputValue : null })
        }}
      />
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider')
  }
  return context
}