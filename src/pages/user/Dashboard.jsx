import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { getToday, formatCurrency, formatDate, getCurrentMonth, getCurrentYear } from '../../utils/helpers';
import { calculateMemberMonthly, getTodaysSummary } from '../../utils/calculationEngine';
import Card from '../../components/common/Card';
import { HiSun, HiMoon, HiCurrencyDollar, HiCalendar, HiTrendingUp, HiCheckCircle } from 'react-icons/hi';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function UserDashboard() {
  const { user } = useAuth();
  const { meals, expenses, members, dishes } = useData();
  const today = getToday();
  const month = getCurrentMonth();
  const year = getCurrentYear();

  const todaySummary = useMemo(() => getTodaysSummary(today, meals, dishes, members, expenses), [today, meals, dishes, members, expenses]);
  const memberReport = useMemo(() => calculateMemberMonthly(user.id, month, year, meals, dishes, expenses, members), [user.id, month, year, meals, dishes, expenses, members]);

  // Today's user meals
  const todayMeals = useMemo(() => {
    return meals.filter(m => m.date === today).map(meal => {
      const dish = dishes.find(d => d.id === meal.dishId);
      const ms = meal.memberStatuses.find(s => s.memberId === user.id);
      return { mealType: meal.mealType, dish, status: ms?.status || 'none' };
    }).filter(m => m.status !== 'none');
  }, [today, meals, dishes, user.id]);

  const todayExpense = memberReport?.meals?.filter(m => m.date === today).reduce((s, m) => s + m.amount, 0) || 0;

  const stats = [
    { label: "Today's Expense", value: formatCurrency(todayExpense), icon: HiCurrencyDollar, iconBg: 'bg-success-100 dark:bg-success-500/10', iconColor: 'text-success-600 dark:text-success-400' },
    { label: 'Monthly Expense', value: formatCurrency(memberReport?.totalExpense || 0), icon: HiTrendingUp, iconBg: 'bg-primary-100 dark:bg-primary-900/30', iconColor: 'text-primary-600 dark:text-primary-400' },
    { label: 'Lunch Count', value: memberReport?.lunchCount || 0, icon: HiSun, iconBg: 'bg-accent-100 dark:bg-accent-900/30', iconColor: 'text-accent-600 dark:text-accent-400' },
    { label: 'Dinner Count', value: memberReport?.dinnerCount || 0, icon: HiMoon, iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Full Meals', value: memberReport?.fullMeals || 0, icon: HiCalendar, iconBg: 'bg-success-100 dark:bg-success-900/30', iconColor: 'text-success-600 dark:text-success-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Hi, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">{formatDate(today)}</p>
      </div>

      {/* Today's Meals */}
      <Card padding="p-5" className="mb-6">
        <h3 className="text-base font-semibold text-dark-900 dark:text-white mb-4">Today's Meals</h3>
        {todayMeals.length === 0 ? (
          <p className="text-sm text-dark-400">No meals recorded for today yet.</p>
        ) : (
          <div className="space-y-3">
            {todayMeals.map((meal, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${meal.mealType === 'lunch' ? 'bg-amber-50 dark:bg-amber-500/5' : 'bg-indigo-50 dark:bg-indigo-500/5'}`}>
                <div className="flex items-center gap-3">
                  {meal.mealType === 'lunch' ? <HiSun className="w-5 h-5 text-amber-500" /> : <HiMoon className="w-5 h-5 text-indigo-500" />}
                  <div>
                    <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{meal.dish?.name || 'Unknown'}</p>
                    <p className="text-xs text-dark-400 capitalize">{meal.mealType} • {meal.status} meal</p>
                  </div>
                </div>
                <span className={`badge text-xs ${meal.status === 'full' ? 'badge-success' : 'badge-warning'}`}>
                  {meal.status === 'full' ? 'Full' : 'Half'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card padding="p-4">
              <div className={`p-2 rounded-xl w-fit mb-3 ${stat.iconBg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className="text-xs text-dark-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Meals */}
      <Card padding="p-5">
        <h3 className="text-base font-semibold text-dark-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {(memberReport?.meals || []).slice(-8).reverse().map((meal, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-dark-800 last:border-0">
              <div className="flex items-center gap-3">
                {meal.mealType === 'lunch' ? <HiSun className="w-4 h-4 text-amber-500" /> : <HiMoon className="w-4 h-4 text-indigo-500" />}
                <div>
                  <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{meal.dishName}</p>
                  <p className="text-xs text-dark-400">{formatDate(meal.date)} • {meal.status}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-dark-900 dark:text-white">{formatCurrency(meal.amount)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
