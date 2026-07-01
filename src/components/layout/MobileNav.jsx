import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HiHome, HiCalendar, HiCurrencyDollar, HiDocumentReport, HiCog,
  HiUsers, HiCollection, HiUserGroup, HiChartBar, HiUser
} from 'react-icons/hi';

const adminTabs = [
  { to: '/admin', icon: HiHome, label: 'Home', end: true },
  { to: '/admin/daily-meals', icon: HiCalendar, label: 'Meals' },
  { to: '/admin/dishes', icon: HiCollection, label: 'Dishes' },
  { to: '/admin/members', icon: HiUsers, label: 'Members' },
  { to: '/admin/settings', icon: HiCog, label: 'More' },
];

const userTabs = [
  { to: '/user', icon: HiHome, label: 'Home', end: true },
  { to: '/user/meals', icon: HiCalendar, label: 'Meals' },
  { to: '/user/summary', icon: HiDocumentReport, label: 'Summary' },
  { to: '/user/profile', icon: HiUser, label: 'Profile' },
];

export default function MobileNav() {
  const { isAdmin } = useAuth();
  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-dark-800 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `mobile-nav-item flex-1 ${isActive ? 'active' : ''}`
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
