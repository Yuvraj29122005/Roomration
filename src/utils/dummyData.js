import { generateId } from './helpers';

const memberId1 = 'admin001';
const memberId2 = 'user_rahul';
const memberId3 = 'user_jay';
const memberId4 = 'user_amit';
const memberId5 = 'user_ravi';

export const defaultMembers = [
  {
    id: memberId1,
    name: 'Admin',
    mobile: '9876543210',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    active: true,
    joinDate: '2025-01-01',
  },
  {
    id: memberId2,
    name: 'Rahul Sharma',
    mobile: '9876543211',
    username: 'rahul',
    password: 'user123',
    role: 'user',
    active: true,
    joinDate: '2025-01-15',
  },
  {
    id: memberId3,
    name: 'Jay Patel',
    mobile: '9876543212',
    username: 'jay',
    password: 'user123',
    role: 'user',
    active: true,
    joinDate: '2025-02-01',
  },
  {
    id: memberId4,
    name: 'Amit Kumar',
    mobile: '9876543213',
    username: 'amit',
    password: 'user123',
    role: 'user',
    active: true,
    joinDate: '2025-02-15',
  },
  {
    id: memberId5,
    name: 'Ravi Singh',
    mobile: '9876543214',
    username: 'ravi',
    password: 'user123',
    role: 'user',
    active: true,
    joinDate: '2025-03-01',
  },
];

export const defaultDishes = [
  { id: 'dish_rice', name: 'Rice', price: 50 },
  { id: 'dish_dal', name: 'Dal', price: 80 },
  { id: 'dish_sabzi', name: 'Mix Vegetable', price: 100 },
  { id: 'dish_chicken', name: 'Chicken Curry', price: 250 },
  { id: 'dish_paneer', name: 'Paneer Butter Masala', price: 220 },
  { id: 'dish_egg', name: 'Egg Curry', price: 120 },
  { id: 'dish_chapati', name: 'Chapati (10 pcs)', price: 60 },
  { id: 'dish_biryani', name: 'Biryani', price: 300 },
  { id: 'dish_dosa', name: 'Dosa', price: 90 },
  { id: 'dish_milk', name: 'Milk', price: 40 },
];


const generateMeals = () => {
  const meals = [];
  const year = 2026;
  const month = 6; // July (0-indexed = 6)
  
  const lunchDishes = ['dish_rice', 'dish_dal', 'dish_sabzi', 'dish_chapati', 'dish_dosa'];
  const dinnerDishes = ['dish_chicken', 'dish_paneer', 'dish_egg', 'dish_biryani', 'dish_dal'];

  for (let day = 1; day <= 30; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date();
    const mealDate = new Date(date);
    if (mealDate > today) continue;

    // Lunch
    const lunchDish = lunchDishes[day % lunchDishes.length];
    meals.push({
      id: `meal_lunch_${day}`,
      date,
      mealType: 'lunch',
      dishId: lunchDish,
      memberStatuses: [
        { memberId: memberId2, status: 'full' },
        { memberId: memberId3, status: day % 3 === 0 ? 'half' : 'full' },
        { memberId: memberId4, status: day % 5 === 0 ? 'none' : 'full' },
        { memberId: memberId5, status: day % 4 === 0 ? 'half' : 'full' },
      ],
    });

    // Dinner
    const dinnerDish = dinnerDishes[day % dinnerDishes.length];
    meals.push({
      id: `meal_dinner_${day}`,
      date,
      mealType: 'dinner',
      dishId: dinnerDish,
      memberStatuses: [
        { memberId: memberId2, status: 'full' },
        { memberId: memberId3, status: 'full' },
        { memberId: memberId4, status: day % 4 === 0 ? 'half' : 'full' },
        ...(day % 5 === 0 ? [{ memberId: memberId5, status: 'full' }] : []),
      ],
    });
  }

  return meals;
};

export const defaultMeals = generateMeals();

export const defaultExpenses = [
  {
    id: 'exp_1',
    name: 'Gas Cylinder',
    category: 'Gas',
    amount: 950,
    date: '2026-07-02',
    description: 'Monthly gas cylinder refill',
  },
  {
    id: 'exp_2',
    name: 'Electricity Bill',
    category: 'Electricity',
    amount: 2800,
    date: '2026-07-05',
    description: 'June electricity bill',
  },
  {
    id: 'exp_3',
    name: 'Internet Bill',
    category: 'Internet',
    amount: 799,
    date: '2026-07-01',
    description: 'Monthly broadband',
  },
  {
    id: 'exp_4',
    name: 'Cleaning Supplies',
    category: 'Cleaning',
    amount: 450,
    date: '2026-07-10',
    description: 'Floor cleaner, broom, etc.',
  },
  {
    id: 'exp_5',
    name: 'Water Bill',
    category: 'Water',
    amount: 300,
    date: '2026-07-08',
    description: 'Monthly water supply',
  },
  {
    id: 'exp_6',
    name: 'Vegetables',
    category: 'Vegetables',
    amount: 650,
    date: '2026-07-12',
    description: 'Weekly vegetable purchase',
  },
  {
    id: 'exp_7',
    name: 'Milk',
    category: 'Milk',
    amount: 1200,
    date: '2026-07-01',
    description: 'Monthly milk subscription',
  },
  {
    id: 'exp_8',
    name: 'Groceries',
    category: 'Groceries',
    amount: 1800,
    date: '2026-07-03',
    description: 'Monthly grocery shopping',
  },
];

export const initializeData = () => {
  return {
    members: defaultMembers,
    dishes: defaultDishes,
    meals: defaultMeals,
    expenses: defaultExpenses,
    settings: { monthStartDate: 1 },
  };
};
