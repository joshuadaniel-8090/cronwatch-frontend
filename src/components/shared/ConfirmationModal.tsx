'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            id="confirmation-modal"
          >
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  type === 'danger' ? 'bg-red-100 text-red-600' : 
                  type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  id="modal-close-btn"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white" id="modal-title">
                  {title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400" id="modal-message">
                  {message}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  id="modal-cancel-btn"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    type === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                    type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' :
                    'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  }`}
                  id="modal-confirm-btn"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
