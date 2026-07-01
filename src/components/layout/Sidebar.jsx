import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HiHome, HiUsers, HiCollection, HiCalendar,
  HiCurrencyDollar, HiDocumentReport, HiChartBar, HiCog,
  HiLogout, HiMoon, HiSun, HiMenuAlt2, HiX, HiUser
} from 'react-icons/hi';
import { useState } from 'react';

const adminNav = [
  { to: '/admin', icon: HiHome, label: 'Dashboard', end: true },
  { to: '/admin/members', icon: HiUsers, label: 'Members' },
  { to: '/admin/dishes', icon: HiCollection, label: 'Dishes' },

  { to: '/admin/daily-meals', icon: HiCalendar, label: 'Daily Meals' },
  { to: '/admin/settings', icon: HiCog, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? 'w-20' : 'w-64'} h-screen bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-dark-800 transition-all duration-300 fixed left-0 top-0 z-40`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 dark:border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-dark-900 dark:text-white text-lg">MealMate</h1>
                <p className="text-xs text-dark-400">Meal Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-dark-800 space-y-2">
          <button onClick={toggleTheme} className="sidebar-item w-full">
            {isDark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button onClick={handleLogout} className="sidebar-item w-full text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10">
            <HiLogout className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
