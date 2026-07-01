import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative ${maxWidth} w-full bg-white dark:bg-dark-800 rounded-t-3xl sm:rounded-2xl shadow-elevated max-h-[90vh] overflow-y-auto z-10`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-dark-800 px-6 py-4 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-dark-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
              >
                <HiX className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
