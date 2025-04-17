'use client'

import type React from 'react'
import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AnimatePresence, motion } from 'framer-motion'

interface ErrorSummaryProps {
  errors: string[]
  visible: boolean
  setVisible: (visible: boolean) => void
  timeout?: number
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  visible,
  setVisible,
  timeout = 5000 // Default 5 seconds display time
}) => {
  useEffect(() => {
    if (visible && errors.length > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [visible, errors, timeout, setVisible])

  if (!visible || errors.length === 0) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreurs</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
