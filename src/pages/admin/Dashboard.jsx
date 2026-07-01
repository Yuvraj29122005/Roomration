import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { getToday, formatCurrency, formatDate, formatDateShort } from '../../utils/helpers';
import { getTodaysSummary, calculateMonthlyExpense } from '../../utils/calculationEngine';
import { getCurrentMonth, getCurrentYear } from '../../utils/helpers';
import Card from '../../components/common/Card';
import {
  HiUsers, HiSun, HiMoon as HiMoonIcon, HiCurrencyDollar,
  HiCalendar, HiCollection, HiTrendingUp
} from 'react-icons/hi';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const { meals, expenses, members, dishes } = useData();
  const today = getToday();
  const month = getCurrentMonth();
  const year = getCurrentYear();

  const todaySummary = useMemo(() => getTodaysSummary(today, meals, dishes), [today, meals, dishes]);
  const monthlyReport = useMemo(() => calculateMonthlyExpense(month, year, meals, dishes, expenses, members), [month, year, meals, dishes, expenses, members]);

  const activeMembers = members.filter(m => m.active && m.role !== 'admin');

  const stats = [
    { label: 'Total Members', value: activeMembers.length, icon: HiUsers, color: 'from-primary-500 to-primary-700', iconBg: 'bg-primary-100 dark:bg-primary-900/30', iconColor: 'text-primary-600 dark:text-primary-400' },
    { label: "Today's Expense", value: formatCurrency(todaySummary.todayExpense), icon: HiCurrencyDollar, color: 'from-success-400 to-success-600', iconBg: 'bg-success-100 dark:bg-success-500/10', iconColor: 'text-success-600 dark:text-success-400' },
    { label: 'Monthly Expense', value: formatCurrency(monthlyReport.grandTotal), icon: HiTrendingUp, color: 'from-pink-400 to-pink-600', iconBg: 'bg-pink-100 dark:bg-pink-900/30', iconColor: 'text-pink-600 dark:text-pink-400' },
    { label: 'Monthly Meals', value: monthlyReport.totalLunches + monthlyReport.totalDinners, icon: HiCalendar, color: 'from-teal-400 to-teal-600', iconBg: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400' },
    { label: 'Total Dishes', value: dishes.length, icon: HiCollection, color: 'from-indigo-400 to-indigo-600', iconBg: 'bg-indigo-100 dark:bg-indigo-900/30', iconColor: 'text-indigo-600 dark:text-indigo-400' },
  ];



  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{formatDate(today)} — Overview</p>
        </div>
        <Link to="/admin/reports" className="btn-primary flex items-center justify-center gap-2 px-4 py-2">
          View Monthly Report
        </Link>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
      >
        {stats.map((stat, i) => (
          <motion.div key={stat.label} variants={item}>
            <Card padding="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-dark-400 dark:text-dark-500 mb-1">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-dark-900 dark:text-white truncate">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity / Member Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding="p-5">
          <h3 className="text-base font-semibold text-dark-900 dark:text-white mb-4">Member Expenses (This Month)</h3>
          <div className="space-y-3">
            {monthlyReport.memberTotals.slice(0, 6).map((mt) => (
              <div key={mt.memberId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium ${['bg-primary-500','bg-accent-500','bg-success-500','bg-purple-500'][Math.abs(mt.name.charCodeAt(0)) % 4]}`}>
                    {mt.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{mt.name}</span>
                </div>
                <span className="text-sm font-semibold text-dark-900 dark:text-white">{formatCurrency(mt.totalExpense)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="p-5">
          <h3 className="text-base font-semibold text-dark-900 dark:text-white mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
              <span className="text-sm text-dark-500">Total Lunches</span>
              <span className="font-semibold text-dark-900 dark:text-white">{monthlyReport.totalLunches}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
              <span className="text-sm text-dark-500">Total Dinners</span>
              <span className="font-semibold text-dark-900 dark:text-white">{monthlyReport.totalDinners}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
              <span className="text-sm text-dark-500">Full Meals</span>
              <span className="font-semibold text-dark-900 dark:text-white">{monthlyReport.totalFullMeals}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
              <span className="text-sm text-dark-500">Half Meals</span>
              <span className="font-semibold text-dark-900 dark:text-white">{monthlyReport.totalHalfMeals}</span>
            </div>
            <div className="flex justify-between items-center p-3 gradient-primary rounded-xl">
              <span className="text-sm text-white/80">Grand Total</span>
              <span className="font-bold text-white text-lg">{formatCurrency(monthlyReport.grandTotal)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
