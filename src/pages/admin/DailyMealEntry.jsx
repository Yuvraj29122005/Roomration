import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { getToday, formatCurrency, formatDate, getInitials, getAvatarColor } from '../../utils/helpers';
import { calculateMealCost } from '../../utils/calculationEngine';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { HiCalendar, HiSave, HiSun, HiMoon, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const STATUSES = ['full', 'none'];
const STATUS_LABELS = { full: 'Full', none: 'None' };
const STATUS_COLORS = {
  full: 'bg-success-500 text-white',
  none: 'bg-gray-200 dark:bg-dark-600 text-dark-500 dark:text-dark-400',
};

export default function DailyMealEntry() {
  const { dishes, members, meals, addMeal, updateMeal, getMealsByDate } = useData();
  const toast = useToast();
  const [date, setDate] = useState(getToday());

  const existingMeals = useMemo(() => getMealsByDate(date), [date, meals]);
  const existingLunch = existingMeals.find(m => m.mealType === 'lunch');
  const existingDinner = existingMeals.find(m => m.mealType === 'dinner');

  // Lunch state
  const [lunchDishId, setLunchDishId] = useState('');
  const [lunchQuantity, setLunchQuantity] = useState(1);
  const [lunchStatuses, setLunchStatuses] = useState([]);

  // Dinner state
  const [dinnerDishId, setDinnerDishId] = useState('');
  const [dinnerQuantity, setDinnerQuantity] = useState(1);
  const [dinnerStatuses, setDinnerStatuses] = useState([]);

  const loadDataForDate = (targetDate) => {
    const dayMeals = meals.filter(m => m.date === targetDate);
    let lunch = dayMeals.find(m => m.mealType === 'lunch');
    let dinner = dayMeals.find(m => m.mealType === 'dinner');

    if (!lunch) {
      const allLunches = meals.filter(m => m.mealType === 'lunch' && m.date < targetDate).sort((a, b) => b.date.localeCompare(a.date));
      if (allLunches.length > 0) lunch = { memberStatuses: allLunches[0].memberStatuses, quantity: 1, dishId: '' };
    }
    if (!dinner) {
      const allDinners = meals.filter(m => m.mealType === 'dinner' && m.date < targetDate).sort((a, b) => b.date.localeCompare(a.date));
      if (allDinners.length > 0) dinner = { memberStatuses: allDinners[0].memberStatuses, quantity: 1, dishId: '' };
    }

    setLunchDishId(lunch?.dishId || '');
    setLunchQuantity(lunch?.quantity || 1);
    setLunchStatuses(lunch?.memberStatuses || []);
    setDinnerDishId(dinner?.dishId || '');
    setDinnerQuantity(dinner?.quantity || 1);
    setDinnerStatuses(dinner?.memberStatuses || []);
  };

  useEffect(() => {
    loadDataForDate(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const navigateDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  // When member changes
  const handleUserToggle = (memberId, type) => {
    const isLunch = type === 'lunch';
    const currentStatuses = isLunch ? lunchStatuses : dinnerStatuses;
    const setStatuses = isLunch ? setLunchStatuses : setDinnerStatuses;

    const existing = currentStatuses.find(s => s.memberId === memberId);
    if (existing) {
      setStatuses(currentStatuses.filter(s => s.memberId !== memberId));
    } else {
      setStatuses([...currentStatuses, { memberId, status: 'full' }]);
    }
  };

  const toggleStatus = (type, memberId) => {
    const setter = type === 'lunch' ? setLunchStatuses : setDinnerStatuses;
    setter(prev => prev.map(ms => {
      if (ms.memberId !== memberId) return ms;
      const nextIdx = (STATUSES.indexOf(ms.status) + 1) % STATUSES.length;
      return { ...ms, status: STATUSES[nextIdx] };
    }));
  };

  const saveMeal = (type) => {
    const dishId = type === 'lunch' ? lunchDishId : dinnerDishId;
    const quantity = type === 'lunch' ? lunchQuantity : dinnerQuantity;
    const statuses = type === 'lunch' ? lunchStatuses : dinnerStatuses;
    const existing = type === 'lunch' ? existingLunch : existingDinner;

    if (!dishId) { toast.error('Please select a dish'); return; }
    if (statuses.length === 0) { toast.error('Please select at least one member'); return; }

    const mealData = { date, mealType: type, dishId, quantity, memberStatuses: statuses };

    if (existing) {
      updateMeal(existing.id, mealData);
      toast.success(`${type === 'lunch' ? 'Lunch' : 'Dinner'} updated!`);
    } else {
      addMeal(mealData);
      toast.success(`${type === 'lunch' ? 'Lunch' : 'Dinner'} saved!`);
    }
  };

  const getMemberName = (id) => members.find(m => m.id === id)?.name || 'Unknown';

  // Calculate preview
  const getLunchPreview = () => {
    if (!lunchDishId || lunchStatuses.length === 0) return null;
    const dish = dishes.find(d => d.id === lunchDishId);
    if (!dish) return null;
    return calculateMealCost(dish.price * lunchQuantity, lunchStatuses);
  };

  const getDinnerPreview = () => {
    if (!dinnerDishId || dinnerStatuses.length === 0) return null;
    const dish = dishes.find(d => d.id === dinnerDishId);
    if (!dish) return null;
    return calculateMealCost(dish.price * dinnerQuantity, dinnerStatuses);
  };

  const lunchPreview = getLunchPreview();
  const dinnerPreview = getDinnerPreview();

  const activeMembers = members.filter(m => m.active && m.role !== 'admin');

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Daily Meal Entry</h1>
        <p className="page-subtitle">Select date, dish & group — everything else is automatic</p>
      </div>

      {/* Date Picker */}
      <Card padding="p-4" className="mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl">
            <HiChevronLeft className="w-5 h-5 text-dark-500" />
          </button>
          <div className="flex items-center gap-3">
            <HiCalendar className="w-5 h-5 text-primary-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              onKeyDown={(e) => e.preventDefault()}
              className="bg-transparent font-semibold text-dark-900 dark:text-white text-center border-none outline-none"
            />
          </div>
          <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl">
            <HiChevronRight className="w-5 h-5 text-dark-500" />
          </button>
        </div>
        <p className="text-center text-sm text-dark-400 mt-1">{formatDate(date)}</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LUNCH SECTION */}
        <Card padding="p-0" className="overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-4">
            <div className="flex items-center gap-2">
              <HiSun className="w-6 h-6 text-white" />
              <h2 className="text-lg font-bold text-white">Lunch</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {/* Dish Select */}
            <div>
              <label className="label">Select Dish</label>
              <select className="input-field" value={lunchDishId} onChange={(e) => setLunchDishId(e.target.value)}>
                <option value="">Choose a dish...</option>
                {dishes.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {formatCurrency(d.price)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Quantity</label>
              <input type="number" min="0.5" step="0.5" className="input-field" value={lunchQuantity} onChange={e => setLunchQuantity(parseFloat(e.target.value) || 1)} placeholder="Multiplier (e.g. 1)" />
            </div>

            {/* Member Select */}
            <div>
              <label className="label">Select Members</label>
              <div className="flex flex-wrap gap-2">
                {activeMembers.map(m => {
                  const isSelected = lunchStatuses.some(s => s.memberId === m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleUserToggle(m.id, 'lunch')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isSelected ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500 text-primary-700 dark:text-primary-400' : 'bg-gray-50 dark:bg-dark-700/50 border-transparent text-dark-500 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
                    >
                      {m.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Member Statuses */}
            {lunchStatuses.length > 0 && (
              <div>
                <label className="label">Member Meal Status</label>
                <div className="space-y-2">
                  {lunchStatuses.map((ms) => (
                    <div key={ms.memberId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(getMemberName(ms.memberId))}`}>
                          {getInitials(getMemberName(ms.memberId))}
                        </div>
                        <span className="text-sm font-medium text-dark-700 dark:text-dark-200">
                          {getMemberName(ms.memberId).split(' ')[0]}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleStatus('lunch', ms.memberId)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${STATUS_COLORS[ms.status]}`}
                      >
                        {STATUS_LABELS[ms.status]}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lunch Preview */}
            {lunchPreview && (
              <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl p-4 border border-amber-200 dark:border-amber-500/20">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">Cost Preview</p>
                {lunchPreview.filter(c => c.portions > 0).map(c => (
                  <div key={c.memberId} className="flex justify-between text-sm py-1">
                    <span className="text-dark-600 dark:text-dark-300">{getMemberName(c.memberId).split(' ')[0]}</span>
                    <span className="font-semibold text-dark-900 dark:text-white">{formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            <Button icon={HiSave} onClick={() => saveMeal('lunch')} fullWidth size="lg">
              {existingLunch ? 'Update Lunch' : 'Save Lunch'}
            </Button>
          </div>
        </Card>

        {/* DINNER SECTION */}
        <Card padding="p-0" className="overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
            <div className="flex items-center gap-2">
              <HiMoon className="w-6 h-6 text-white" />
              <h2 className="text-lg font-bold text-white">Dinner</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="label">Select Dish</label>
              <select className="input-field" value={dinnerDishId} onChange={(e) => setDinnerDishId(e.target.value)}>
                <option value="">Choose a dish...</option>
                {dishes.map(d => (
                  <option key={d.id} value={d.id}>{d.name} — {formatCurrency(d.price)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Quantity</label>
              <input type="number" min="0.5" step="0.5" className="input-field" value={dinnerQuantity} onChange={e => setDinnerQuantity(parseFloat(e.target.value) || 1)} placeholder="Multiplier (e.g. 1)" />
            </div>

            <div>
              <label className="label">Select Members</label>
              <div className="flex flex-wrap gap-2">
                {activeMembers.map(m => {
                  const isSelected = dinnerStatuses.some(s => s.memberId === m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleUserToggle(m.id, 'dinner')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${isSelected ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500 text-primary-700 dark:text-primary-400' : 'bg-gray-50 dark:bg-dark-700/50 border-transparent text-dark-500 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
                    >
                      {m.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {dinnerStatuses.length > 0 && (
              <div>
                <label className="label">Member Meal Status</label>
                <div className="space-y-2">
                  {dinnerStatuses.map((ms) => (
                    <div key={ms.memberId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(getMemberName(ms.memberId))}`}>
                          {getInitials(getMemberName(ms.memberId))}
                        </div>
                        <span className="text-sm font-medium text-dark-700 dark:text-dark-200">
                          {getMemberName(ms.memberId).split(' ')[0]}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleStatus('dinner', ms.memberId)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${STATUS_COLORS[ms.status]}`}
                      >
                        {STATUS_LABELS[ms.status]}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dinnerPreview && (
              <div className="bg-indigo-50 dark:bg-indigo-500/5 rounded-xl p-4 border border-indigo-200 dark:border-indigo-500/20">
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">Cost Preview</p>
                {dinnerPreview.filter(c => c.portions > 0).map(c => (
                  <div key={c.memberId} className="flex justify-between text-sm py-1">
                    <span className="text-dark-600 dark:text-dark-300">{getMemberName(c.memberId).split(' ')[0]}</span>
                    <span className="font-semibold text-dark-900 dark:text-white">{formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            <Button icon={HiSave} onClick={() => saveMeal('dinner')} fullWidth size="lg" className="bg-purple-600 hover:bg-purple-700">
              {existingDinner ? 'Update Dinner' : 'Save Dinner'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
