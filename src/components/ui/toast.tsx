'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Check, X, AlertTriangle, Info, Trash2, Trophy } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  icon?: React.ReactNode
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast } = context

  const toast = {
    success: (title: string, message?: string, duration?: number, customIcon?: React.ReactNode) =>
      addToast({ type: 'success', title, message, duration, icon: customIcon }),
    error: (title: string, message?: string, duration?: number, customIcon?: React.ReactNode) =>
      addToast({ type: 'error', title, message, duration, icon: customIcon }),
    warning: (title: string, message?: string, duration?: number, customIcon?: React.ReactNode) =>
      addToast({ type: 'warning', title, message, duration, icon: customIcon }),
    info: (title: string, message?: string, duration?: number, customIcon?: React.ReactNode) =>
      addToast({ type: 'info', title, message, duration, icon: customIcon }),
  }

  return toast
}

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)!

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 200)
  }

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          messageColor: 'text-green-700'
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700'
        }
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-900',
          messageColor: 'text-amber-700'
        }
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700'
        }
    }
  }

  const getDefaultIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check className="w-5 h-5" />
      case 'error':
        return <X className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
    }
  }

  const styles = getToastStyles()

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out rounded-lg border-2 shadow-lg backdrop-blur-sm
        ${styles.bg}
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 p-1.5 rounded-full ${styles.iconBg}`}>
            <div className={styles.iconColor}>
              {toast.icon || getDefaultIcon()}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
              {toast.title}
            </h4>
            {toast.message && (
              <p className={`mt-1 text-xs ${styles.messageColor}`}>
                {toast.message}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions for common notifications
export const toastHelpers = {
  bracketCreated: (toast: ReturnType<typeof useToast>) =>
    toast.success('Bracket généré !', 'Le bracket du tournoi a été créé avec succès', 4000, <Trophy className="w-5 h-5" />),
    
  eventDeleted: (toast: ReturnType<typeof useToast>, eventName?: string) =>
    toast.success('Événement supprimé', eventName ? `${eventName} a été supprimé avec succès` : 'L\'événement a été supprimé avec succès', 4000, <Trash2 className="w-5 h-5" />),
    
  tournamentDeleted: (toast: ReturnType<typeof useToast>) =>
    toast.success('Tournoi supprimé', 'Le tournoi a été supprimé définitivement', 4000, <Trash2 className="w-5 h-5" />),
    
  scoreSubmitted: (toast: ReturnType<typeof useToast>) =>
    toast.success('Score validé !', 'Les scores ont été enregistrés avec succès', 3000, <Trophy className="w-5 h-5" />),
    
  disputeResolved: (toast: ReturnType<typeof useToast>) =>
    toast.success('Litige résolu !', 'Le litige a été résolu avec succès', 4000),
    
  registrationClosed: (toast: ReturnType<typeof useToast>) =>
    toast.info('Inscriptions fermées', 'Les inscriptions au tournoi sont maintenant fermées', 3000),
    
  networkError: (toast: ReturnType<typeof useToast>) =>
    toast.error('Erreur réseau', 'Impossible de se connecter au serveur. Veuillez réessayer.', 6000),
    
  deleteError: (toast: ReturnType<typeof useToast>, details?: string) =>
    toast.error('Erreur de suppression', details || 'Impossible de supprimer l\'élément', 6000),
    
  bracketError: (toast: ReturnType<typeof useToast>, details?: string) =>
    toast.error('Erreur bracket', details || 'Erreur lors de la génération du bracket', 6000),
    
  scoreError: (toast: ReturnType<typeof useToast>, details?: string) =>
    toast.error('Erreur de score', details || 'Erreur lors de la soumission du score', 6000),
}