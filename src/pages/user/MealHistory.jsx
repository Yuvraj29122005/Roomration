import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate, getCurrentMonth, getCurrentYear } from '../../utils/helpers';
import { calculateMemberMonthly } from '../../utils/calculationEngine';
import { MONTHS } from '../../utils/constants';
import Card from '../../components/common/Card';
import { HiSun, HiMoon, HiCalendar } from 'react-icons/hi';

export default function MealHistory() {
  const { user } = useAuth();
  const { meals, expenses, members, dishes } = useData();
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [filter, setFilter] = useState('all');

  const report = useMemo(() =>
    calculateMemberMonthly(user.id, month, year, meals, dishes, expenses, members),
    [user.id, month, year, meals, dishes, expenses, members]
  );

  const filteredMeals = (report?.meals || [])
    .filter(m => filter === 'all' || m.mealType === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Meal History</h1>
        <p className="page-subtitle">{MONTHS[month]} {year}</p>
      </div>

      {/* Filters */}
      <Card padding="p-4" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="input-field flex-1" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="input-field sm:w-32" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-dark-600">
            {['all', 'lunch', 'dinner'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-700 text-dark-500'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Meal Calendar Grid */}
      <div className="space-y-3">
        {filteredMeals.length === 0 ? (
          <Card padding="p-8">
            <div className="text-center text-dark-400">
              <HiCalendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No meals found for this period.</p>
            </div>
          </Card>
        ) : (
          filteredMeals.map((meal, idx) => (
            <Card key={idx} padding="p-4" hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meal.mealType === 'lunch' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
                    {meal.mealType === 'lunch' ? <HiSun className="w-5 h-5 text-amber-500" /> : <HiMoon className="w-5 h-5 text-indigo-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">{meal.dishName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-dark-400">{formatDate(meal.date)}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${meal.status === 'full' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400' : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500'}`}>
                        {meal.status === 'full' ? 'Full' : 'Half'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold text-dark-900 dark:text-white">{formatCurrency(meal.amount)}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
