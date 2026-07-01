import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchMembers, insertMember, updateMemberDb, deleteMemberDb,
  fetchDishes, insertDish, updateDishDb, deleteDishDb,
  fetchMeals, insertMealDb, updateMealDb, deleteMealDb,
  fetchExpenses, insertExpense, updateExpenseDb, deleteExpenseDb,
  fetchSettings, updateSettingsDb,
} from '../lib/database';

const DataContext = createContext(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [meals, setMeals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({ monthStartDate: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Load all data from Supabase on mount ───
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersData, dishesData, mealsData, expensesData, settingsData] =
        await Promise.all([
          fetchMembers(),
          fetchDishes(),
          fetchMeals(),
          fetchExpenses(),
          fetchSettings(),
        ]);
      setMembers(membersData);
      setDishes(dishesData);
      setMeals(mealsData);
      setExpenses(expensesData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load data from Supabase:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  const backgroundRefresh = useCallback(async () => {
    try {
      const [membersData, dishesData, mealsData, expensesData, settingsData] =
        await Promise.all([
          fetchMembers(),
          fetchDishes(),
          fetchMeals(),
          fetchExpenses(),
          fetchSettings(),
        ]);
      setMembers(membersData);
      setDishes(dishesData);
      setMeals(mealsData);
      setExpenses(expensesData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Background refresh failed:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh when window regains focus
    const onFocus = () => backgroundRefresh();
    window.addEventListener('focus', onFocus);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(backgroundRefresh, 30000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [loadAllData, backgroundRefresh]);

  // ─── Settings ───
  const updateSettings = async (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    try {
      await updateSettingsDb(updates);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  // ─── Members CRUD ───
  const addMember = async (member) => {
    try {
      const newMember = await insertMember(member);
      setMembers((prev) => [...prev, newMember]);
      return newMember;
    } catch (err) {
      console.error('Failed to add member:', err);
      throw err;
    }
  };

  const updateMember = async (id, updates) => {
    // Optimistic update
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    try {
      await updateMemberDb(id, updates);
    } catch (err) {
      console.error('Failed to update member:', err);
      // Reload to revert
      const fresh = await fetchMembers();
      setMembers(fresh);
    }
  };

  const deleteMember = async (id) => {
    // Optimistically cascade delete locally
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setExpenses((prev) => prev.filter((e) => e.memberId !== id));
    setMeals((prev) => prev.map((meal) => ({
      ...meal,
      memberStatuses: meal.memberStatuses.filter((ms) => ms.memberId !== id)
    })));
    try {
      await deleteMemberDb(id);
    } catch (err) {
      console.error('Failed to delete member:', err);
      // Fallback reload all data to sync state with database
      loadAllData();
    }
  };

  const toggleMemberActive = async (id) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const newActive = !member.active;
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: newActive } : m))
    );
    try {
      await updateMemberDb(id, { active: newActive });
    } catch (err) {
      console.error('Failed to toggle member active:', err);
      const fresh = await fetchMembers();
      setMembers(fresh);
    }
  };

  // ─── Dishes CRUD ───
  const addDish = async (dish) => {
    try {
      const newDish = await insertDish(dish);
      setDishes((prev) => [...prev, newDish]);
      return newDish;
    } catch (err) {
      console.error('Failed to add dish:', err);
      throw err;
    }
  };

  const updateDish = async (id, updates) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    try {
      await updateDishDb(id, updates);
    } catch (err) {
      console.error('Failed to update dish:', err);
      const fresh = await fetchDishes();
      setDishes(fresh);
    }
  };

  const deleteDish = async (id) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDishDb(id);
    } catch (err) {
      console.error('Failed to delete dish:', err);
      const fresh = await fetchDishes();
      setDishes(fresh);
    }
  };

  // ─── Meals CRUD ───
  const addMeal = async (meal) => {
    try {
      const newMeal = await insertMealDb(meal);
      setMeals((prev) => [...prev, newMeal]);
      return newMeal;
    } catch (err) {
      console.error('Failed to add meal:', err);
      throw err;
    }
  };

  const updateMeal = async (id, updates) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    try {
      await updateMealDb(id, updates);
    } catch (err) {
      console.error('Failed to update meal:', err);
      const fresh = await fetchMeals();
      setMeals(fresh);
    }
  };

  const deleteMeal = async (id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMealDb(id);
    } catch (err) {
      console.error('Failed to delete meal:', err);
      const fresh = await fetchMeals();
      setMeals(fresh);
    }
  };

  const getMealsByDate = (date) => {
    return meals.filter((m) => m.date === date);
  };

  // ─── Expenses CRUD ───
  const addExpense = async (expense) => {
    try {
      const newExpense = await insertExpense(expense);
      setExpenses((prev) => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      console.error('Failed to add expense:', err);
      throw err;
    }
  };

  const updateExpense = async (id, updates) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    try {
      await updateExpenseDb(id, updates);
    } catch (err) {
      console.error('Failed to update expense:', err);
      const fresh = await fetchExpenses();
      setExpenses(fresh);
    }
  };

  const deleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteExpenseDb(id);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      const fresh = await fetchExpenses();
      setExpenses(fresh);
    }
  };

  // ─── Reset data (reload from Supabase) ───
  const resetData = () => {
    loadAllData();
  };

  // ─── Loading Screen ───
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #dbeafe',
            borderTop: '4px solid #4f6ef7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280', fontWeight: 500, fontSize: 14 }}>Loading data...</p>
        </div>
      </div>
    );
  }

  // ─── Error Screen ───
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto', padding: '0 16px' }}>
          <div style={{
            width: 64,
            height: 64,
            background: '#fef2f2',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Connection Error</h2>
          <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>{error}</p>
          <button
            onClick={loadAllData}
            style={{
              background: '#4f6ef7',
              color: '#fff',
              fontWeight: 500,
              borderRadius: 12,
              padding: '12px 24px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.target.style.background = '#4361d9'}
            onMouseOut={(e) => e.target.style.background = '#4f6ef7'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        members,
        dishes,
        meals,
        expenses,
        settings,
        loading,
        addMember,
        updateMember,
        deleteMember,
        toggleMemberActive,
        addDish,
        updateDish,
        deleteDish,
        addMeal,
        updateMeal,
        deleteMeal,
        getMealsByDate,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
