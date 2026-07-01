import { motion, AnimatePresence } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle, HiX } from 'react-icons/hi';
import { useToast } from '../../contexts/ToastContext';

const icons = {
  success: HiCheckCircle,
  error: HiXCircle,
  warning: HiExclamationCircle,
  info: HiInformationCircle,
};

const styles = {
  success: 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/20 text-success-600 dark:text-success-400',
  error: 'bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/20 text-danger-600 dark:text-danger-400',
  warning: 'bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/20 text-warning-600 dark:text-warning-500',
  info: 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${styles[toast.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 hover:opacity-70">
                <HiX className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
