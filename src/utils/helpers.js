import { CURRENCY, MEAL_STATUS_PORTIONS } from './constants';

export const formatCurrency = (amount) => {
  return `${CURRENCY}${Math.round(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

export const getToday = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const getCurrentMonth = () => {
  const now = new Date();
  return now.getMonth();
};

export const getCurrentYear = () => {
  const now = new Date();
  return now.getFullYear();
};

export const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getPortionValue = (status) => {
  return MEAL_STATUS_PORTIONS[status] || 0;
};

export const getAvatarColor = (name) => {
  const colors = [
    'bg-primary-500', 'bg-accent-500', 'bg-success-500',
    'bg-purple-500', 'bg-pink-500', 'bg-teal-500',
    'bg-indigo-500', 'bg-orange-500', 'bg-cyan-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getMonthDateRange = (month, year) => {
  const start = new Date(year, month, 1).toISOString().split('T')[0];
  const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { start, end };
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};
