import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { HiMoon, HiSun, HiLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { getInitials, getAvatarColor } from '../../utils/helpers';

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-800">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="font-bold text-dark-900 dark:text-white">MealMate</span>
        </div>

        <div className="hidden lg:block">
          <h1 className="text-xl font-bold text-dark-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-dark-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
          >
            {isDark ? <HiSun className="w-5 h-5 text-dark-400" /> : <HiMoon className="w-5 h-5 text-dark-400" />}
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors lg:hidden"
          >
            <HiLogout className="w-5 h-5 text-dark-400" />
          </button>

          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(user?.name || 'U')}`}>
            {getInitials(user?.name || 'User')}
          </div>
        </div>
      </div>
    </header>
  );
}
