import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { HiMoon, HiSun, HiRefresh, HiInformationCircle, HiCalendar } from 'react-icons/hi';

export default function AdminSettings() {
  const { isDark, toggleTheme } = useTheme();
  const { resetData } = useData();
  const toast = useToast();

  const handleReset = () => {
    if (window.confirm('This will reset all data to demo defaults. Are you sure?')) {
      resetData();
      toast.success('Data reset to defaults');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">App preferences and configuration</p>
      </div>

      <div className="space-y-4 max-w-lg">
        {/* Theme */}
        <Card padding="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <HiMoon className="w-5 h-5 text-primary-500" /> : <HiSun className="w-5 h-5 text-accent-500" />}
              <div>
                <h3 className="font-semibold text-dark-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-dark-400">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Card>

        {/* Reset Data */}
        <Card padding="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiRefresh className="w-5 h-5 text-danger-500" />
              <div>
                <h3 className="font-semibold text-dark-900 dark:text-white">Reset Data</h3>
                <p className="text-sm text-dark-400">Reset all data to demo defaults</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={handleReset}>Reset</Button>
          </div>
        </Card>

        {/* App Info */}
        <Card padding="p-5">
          <div className="flex items-center gap-3 mb-4">
            <HiInformationCircle className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-dark-900 dark:text-white">About MealMate</h3>
          </div>
          <div className="space-y-2 text-sm text-dark-500 dark:text-dark-400">
            <p>Version 1.0.0</p>
            <p>Smart meal & expense management for shared living.</p>
            <p>Built with React, Vite & Tailwind CSS.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
