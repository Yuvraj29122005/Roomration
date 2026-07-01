import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency, formatDate, getCurrentMonth, getCurrentYear } from '../../utils/helpers';
import { calculateMonthlyExpense, calculateMemberMonthly } from '../../utils/calculationEngine';
import { MONTHS } from '../../utils/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { HiDocumentDownload, HiCalendar, HiDownload } from 'react-icons/hi';
import { generatePDF, generateUserPDF } from '../../utils/pdfGenerator';

export default function MonthlyReport() {
  const { members, dishes, groups, meals, expenses } = useData();
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());

  const report = useMemo(() =>
    calculateMonthlyExpense(month, year, meals, dishes, expenses, members),
    [month, year, meals, dishes, expenses, members]
  );

  const handleExportPDF = () => {
    generatePDF(report, MONTHS[month], year, members);
  };

  const handleDownloadMemberPDF = (memberId) => {
    const memberReport = calculateMemberMonthly(memberId, month, year, meals, dishes, expenses, members);
    const user = members.find(m => m.id === memberId);
    if (user) {
      generateUserPDF(memberReport, MONTHS[month], year, user);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Monthly Report</h1>
          <p className="page-subtitle">{MONTHS[month]} {year}</p>
        </div>
        <Button icon={HiDocumentDownload} onClick={handleExportPDF} size="lg" variant="success">Export PDF</Button>
      </div>

      {/* Month Selector */}
      <Card padding="p-4" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="input-field flex-1" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="input-field sm:w-32" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card padding="p-4">
          <p className="text-xs text-dark-400 mb-1">Total Lunches</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{report.totalLunches}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-dark-400 mb-1">Total Dinners</p>
          <p className="text-2xl font-bold text-dark-900 dark:text-white">{report.totalDinners}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-dark-400 mb-1">Full Meals</p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">{report.totalFullMeals}</p>
        </Card>
      </div>

      {/* Expense Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Card padding="p-5" className="text-center">
          <p className="text-sm text-dark-400 mb-2">Dish Expenses</p>
          <p className="text-3xl font-bold text-dark-900 dark:text-white">{formatCurrency(report.totalDishExpense)}</p>
        </Card>
        <Card padding="p-5" className="text-center gradient-primary">
          <p className="text-sm text-white/80 mb-2">Grand Total</p>
          <p className="text-3xl font-bold text-white">{formatCurrency(report.grandTotal)}</p>
        </Card>
      </div>

      {/* Member-wise Table */}
      <Card padding="p-0" className="mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-700">
          <h3 className="font-semibold text-dark-900 dark:text-white">Member-wise Expenses</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-700">
                <th className="table-header text-left px-5 py-3">Member</th>
                <th className="table-header text-right px-3 py-3">Lunches</th>
                <th className="table-header text-right px-3 py-3">Dinners</th>
                <th className="table-header text-right px-3 py-3">Full</th>
                <th className="table-header text-right px-3 py-3">Dish Exp.</th>
                <th className="table-header text-right px-5 py-3">Total</th>
                <th className="table-header text-center px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {report.memberTotals.map((mt) => (
                <tr key={mt.memberId} className="border-b border-gray-50 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/50">
                  <td className="px-5 py-3 font-medium text-sm text-dark-800 dark:text-dark-200">{mt.name}</td>
                  <td className="px-3 py-3 text-sm text-right text-dark-600 dark:text-dark-300">{mt.lunchCount}</td>
                  <td className="px-3 py-3 text-sm text-right text-dark-600 dark:text-dark-300">{mt.dinnerCount}</td>
                  <td className="px-3 py-3 text-sm text-right text-success-600 dark:text-success-400">{mt.fullMeals}</td>
                  <td className="px-3 py-3 text-sm text-right text-dark-600 dark:text-dark-300">{formatCurrency(mt.dishExpense)}</td>
                  <td className="px-5 py-3 text-sm text-right font-bold text-dark-900 dark:text-white">{formatCurrency(mt.totalExpense)}</td>
                  <td className="px-3 py-3 text-sm text-center">
                    <button onClick={() => handleDownloadMemberPDF(mt.memberId)} className="text-primary-500 hover:text-primary-600 p-1 bg-primary-50 hover:bg-primary-100 rounded-lg" title="Download Report">
                      <HiDownload className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-primary-50 dark:bg-primary-900/10">
                <td className="px-5 py-3 font-bold text-sm text-primary-700 dark:text-primary-400">Total</td>
                <td className="px-3 py-3 text-sm text-right font-bold text-primary-700 dark:text-primary-400">{report.totalLunches}</td>
                <td className="px-3 py-3 text-sm text-right font-bold text-primary-700 dark:text-primary-400">{report.totalDinners}</td>
                <td className="px-3 py-3 text-sm text-right font-bold text-primary-700 dark:text-primary-400">{report.totalFullMeals}</td>
                <td className="px-3 py-3 text-sm text-right font-bold text-primary-700 dark:text-primary-400">{formatCurrency(report.totalDishExpense)}</td>
                <td className="px-5 py-3 text-sm text-right font-bold text-primary-700 dark:text-primary-400">{formatCurrency(report.grandTotal)}</td>
                <td className="px-3 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Mobile View */}
        <div className="block md:hidden p-4 space-y-4 bg-gray-50/50 dark:bg-dark-900/50">
          {report.memberTotals.map(mt => (
            <div key={mt.memberId} className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-dark-900 dark:text-white text-base">{mt.name}</span>
                <button onClick={() => handleDownloadMemberPDF(mt.memberId)} className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400 px-3 py-1.5 rounded-lg">
                  <HiDownload className="w-4 h-4" /> PDF
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-dark-500">Lunches: <span className="font-semibold text-dark-900 dark:text-white float-right">{mt.lunchCount}</span></div>
                <div className="text-dark-500">Dinners: <span className="font-semibold text-dark-900 dark:text-white float-right">{mt.dinnerCount}</span></div>
                <div className="text-dark-500">Full: <span className="font-semibold text-success-600 dark:text-success-400 float-right">{mt.fullMeals}</span></div>
                <div className="text-dark-500 col-span-2">Dish Exp: <span className="font-semibold text-dark-900 dark:text-white float-right">{formatCurrency(mt.dishExpense)}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-700 flex justify-between items-center">
                <span className="text-dark-600 dark:text-dark-300 font-medium text-sm">Total Expense</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">{formatCurrency(mt.totalExpense)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Breakdown */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-700">
          <h3 className="font-semibold text-dark-900 dark:text-white">Daily Breakdown</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-700">
                <th className="table-header text-left px-5 py-3">Date</th>
                <th className="table-header text-right px-3 py-3">Lunch</th>
                <th className="table-header text-right px-3 py-3">Dinner</th>
                <th className="table-header text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.dailyTotals.map((dt) => (
                <tr key={dt.date} className="border-b border-gray-50 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/50">
                  <td className="px-5 py-3 text-sm font-medium text-dark-800 dark:text-dark-200">{formatDate(dt.date)}</td>
                  <td className="px-3 py-3 text-sm text-right text-dark-600 dark:text-dark-300">{formatCurrency(dt.lunch)}</td>
                  <td className="px-3 py-3 text-sm text-right text-dark-600 dark:text-dark-300">{formatCurrency(dt.dinner)}</td>
                  <td className="px-5 py-3 text-sm text-right font-bold text-dark-900 dark:text-white">{formatCurrency(dt.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile View */}
        <div className="block md:hidden p-3 space-y-2 bg-gray-50/50 dark:bg-dark-900/50">
          {report.dailyTotals.map(dt => (
             <div key={dt.date} className="flex flex-col gap-2 p-4 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
               <div className="flex justify-between items-center border-b border-gray-50 dark:border-dark-700 pb-2">
                 <span className="text-sm font-bold text-dark-900 dark:text-white">{formatDate(dt.date)}</span>
                 <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(dt.total)}</span>
               </div>
               <div className="flex justify-between items-center text-xs text-dark-500 pt-1">
                 <div>Lunch: <span className="font-semibold text-dark-800 dark:text-dark-200">{formatCurrency(dt.lunch)}</span></div>
                 <div>Dinner: <span className="font-semibold text-dark-800 dark:text-dark-200">{formatCurrency(dt.dinner)}</span></div>
               </div>
             </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
