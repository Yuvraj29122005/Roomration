import { motion } from 'framer-motion';

const cardVariants = {
  default: 'bg-white dark:bg-dark-800 rounded-2xl shadow-card border border-gray-100 dark:border-dark-700/50',
  glass: 'bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-dark-700/50 shadow-glass',
  stat: 'bg-white dark:bg-dark-800 rounded-2xl shadow-card border border-gray-100 dark:border-dark-700/50 relative overflow-hidden',
  flat: 'bg-gray-50 dark:bg-dark-800/50 rounded-2xl',
};

export default function Card({
  children,
  variant = 'default',
  className = '',
  hover = true,
  padding = 'p-5',
  onClick,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' } : {}}
      onClick={onClick}
      className={`${cardVariants[variant]} ${padding} transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
