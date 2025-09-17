'use client'

import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Button } from './button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          titleColor: 'text-red-900'
        }
      default:
        return {
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-100',
          confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
          titleColor: 'text-amber-900'
        }
    }
  }

  const styles = getTypeStyles()
  const IconComponent = type === 'danger' ? Trash2 : AlertTriangle

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${styles.iconBg}`}>
                <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 ${styles.confirmButton} shadow-lg transition-all duration-200`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook pour utiliser le dialog
export function useConfirmDialog() {
  const [dialog, setDialog] = React.useState<{
    isOpen: boolean
    title: string
    message: string
    type?: 'warning' | 'danger'
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  const confirm = React.useCallback((options: {
    title: string
    message: string
    type?: 'warning' | 'danger'
    confirmText?: string
    cancelText?: string
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        onConfirm: () => resolve(true)
      })
    })
  }, [])

  const closeDialog = React.useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }))
  }, [])

  const ConfirmDialogComponent = React.useMemo(() => (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      onClose={closeDialog}
      onConfirm={dialog.onConfirm || (() => {})}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
    />
  ), [dialog, closeDialog])

  return { confirm, ConfirmDialogComponent }
}