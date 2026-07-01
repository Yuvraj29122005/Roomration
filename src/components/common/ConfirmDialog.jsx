import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation } from 'react-icons/hi';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white dark:bg-dark-800 rounded-2xl shadow-elevated p-6 max-w-sm w-full z-10"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-danger-50 dark:bg-danger-500/10 rounded-full flex items-center justify-center mb-4">
                <HiExclamation className="w-6 h-6 text-danger-500" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">{title}</h3>
              <p className="text-dark-500 dark:text-dark-400 text-sm mb-6">{message}</p>
              <div className="flex gap-3 w-full">
                <Button variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
                <Button variant="danger" onClick={onConfirm} fullWidth>Delete</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
