import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HiUser, HiLockClosed, HiMoon, HiSun } from 'react-icons/hi';
import Button from '../../components/common/Button';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      error('Please enter username and password');
      return;
    }
    setLoading(true);
    
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      success(`Welcome back, ${result.user.name}!`);
      navigate(result.user.role === 'admin' ? '/admin' : '/user');
    } else {
      error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950 px-4 gradient-mesh relative">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 hover:bg-white/50 dark:hover:bg-dark-800/50 rounded-xl transition-colors"
      >
        {isDark ? <HiSun className="w-5 h-5 text-dark-400" /> : <HiMoon className="w-5 h-5 text-dark-400" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
          >
            <span className="text-white font-bold text-3xl">M</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">MealMate</h1>
          <p className="text-dark-400 mt-2">Smart Meal & Expense Manager</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-800 rounded-3xl shadow-elevated p-8 border border-gray-100 dark:border-dark-700"
        >
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-1">Welcome back</h2>
          <p className="text-dark-400 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="input-field pl-10"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-field pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
