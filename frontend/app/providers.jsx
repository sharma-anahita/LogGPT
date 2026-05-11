'use client'

import { DialogProvider } from '@/components/dialogs/DialogProvider'

export function Providers({ children }) {
  return <DialogProvider>{children}</DialogProvider>
}