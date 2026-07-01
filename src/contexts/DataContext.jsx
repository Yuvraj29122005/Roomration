import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { initializeData } from '../utils/dummyData';
import { generateId } from '../utils/helpers';

const DataContext = createContext(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export const DataProvider = ({ children }) => {
  const defaults = initializeData();
  
  const [members, setMembers] = useState(() => loadFromStorage(STORAGE_KEYS.MEMBERS, defaults.members));
  const [dishes, setDishes] = useState(() => loadFromStorage(STORAGE_KEYS.DISHES, defaults.dishes));
  const [meals, setMeals] = useState(() => loadFromStorage(STORAGE_KEYS.MEALS, defaults.meals));
  const [expenses, setExpenses] = useState(() => loadFromStorage(STORAGE_KEYS.EXPENSES, defaults.expenses));
  const [settings, setSettings] = useState(() => loadFromStorage(STORAGE_KEYS.SETTINGS, defaults.settings));

  // Persist on change
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishes)); }, [dishes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals)); }, [meals]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);

  // Settings
  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Members CRUD
  const addMember = (member) => {
    const newMember = { ...member, id: generateId(), active: true, role: 'user' };
    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };
  const updateMember = (id, updates) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };
  const deleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };
  const toggleMemberActive = (id) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));
  };

  // Dishes CRUD
  const addDish = (dish) => {
    const newDish = { ...dish, id: generateId() };
    setDishes((prev) => [...prev, newDish]);
    return newDish;
  };
  const updateDish = (id, updates) => {
    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };
  const deleteDish = (id) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };


  // Meals CRUD
  const addMeal = (meal) => {
    const newMeal = { ...meal, id: generateId() };
    setMeals((prev) => [...prev, newMeal]);
    return newMeal;
  };
  const updateMeal = (id, updates) => {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };
  const deleteMeal = (id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };
  const getMealsByDate = (date) => {
    return meals.filter((m) => m.date === date);
  };

  // Expenses CRUD
  const addExpense = (expense) => {
    const newExpense = { ...expense, id: generateId() };
    setExpenses((prev) => [...prev, newExpense]);
    return newExpense;
  };
  const updateExpense = (id, updates) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Reset data
  const resetData = () => {
    const fresh = initializeData();
    setMembers(fresh.members);
    setDishes(fresh.dishes);
    setMeals(fresh.meals);
    setExpenses(fresh.expenses);
    setSettings(fresh.settings);
  };

  return (
    <DataContext.Provider
      value={{
        members, dishes, meals, expenses, settings,
        addMember, updateMember, deleteMember, toggleMemberActive,
        addDish, updateDish, deleteDish,
        addMeal, updateMeal, deleteMeal, getMealsByDate,
        addExpense, updateExpense, deleteExpense,
        updateSettings,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
