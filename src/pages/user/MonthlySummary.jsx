import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '../../utils/helpers';
import { calculateMemberMonthly } from '../../utils/calculationEngine';
import { MONTHS } from '../../utils/constants';
import { generateUserPDF } from '../../utils/pdfGenerator';
import Card from '../../components/common/Card';
import { motion } from 'framer-motion';
import { HiSun, HiMoon, HiCheckCircle, HiCash, HiCurrencyDollar, HiTrendingUp, HiDownload } from 'react-icons/hi';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function MonthlySummary() {
  const { user } = useAuth();
  const { meals, expenses, members, dishes } = useData();
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());

  const report = useMemo(() =>
    calculateMemberMonthly(user.id, month, year, meals, dishes, expenses, members),
    [user.id, month, year, meals, dishes, expenses, members]
  );

  const cards = [
    { label: 'Total Lunches', value: report?.lunchCount || 0, icon: HiSun, bg: 'bg-amber-50 dark:bg-amber-500/10', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Total Dinners', value: report?.dinnerCount || 0, icon: HiMoon, bg: 'bg-indigo-50 dark:bg-indigo-500/10', color: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Full Meals', value: report?.fullMeals || 0, icon: HiCheckCircle, bg: 'bg-success-50 dark:bg-success-500/10', color: 'text-success-600 dark:text-success-500' },
    { label: 'Dish Expense', value: formatCurrency(report?.dishExpense || 0), icon: HiCurrencyDollar, bg: 'bg-primary-50 dark:bg-primary-500/10', color: 'text-primary-600 dark:text-primary-400' },
  ];

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Monthly Summary</h1>
            <p className="page-subtitle">{MONTHS[month]} {year}</p>
          </div>
          <button onClick={() => generateUserPDF(report, MONTHS[month], year, user)} className="btn-primary flex items-center gap-2 px-4 py-2">
            <HiDownload className="w-5 h-5" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      <Card padding="p-4" className="mb-6">
        <div className="flex gap-3">
          <select className="input-field flex-1" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="input-field w-28" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Card>

      {/* Grand Total */}
      <Card padding="p-6" className="mb-6 gradient-primary text-center">
        <HiTrendingUp className="w-10 h-10 text-white/50 mx-auto mb-2" />
        <p className="text-sm text-white/70 mb-1">Grand Total</p>
        <p className="text-4xl font-bold text-white">{formatCurrency(report?.totalExpense || 0)}</p>
      </Card>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <motion.div key={card.label} variants={item}>
            <Card padding="p-4">
              <div className={`p-2 rounded-xl w-fit mb-3 ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-xs text-dark-400 mb-1">{card.label}</p>
              <p className="text-xl font-bold text-dark-900 dark:text-white">{card.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
