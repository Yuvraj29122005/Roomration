import { MEAL_STATUS_PORTIONS } from './constants';

/**
 * Calculate cost per member for a single dish served to a group
 * @param {number} dishPrice - Price of the dish
 * @param {Array} memberStatuses - Array of { memberId, status: 'full'|'half'|'none' }
 * @returns {Array} - Array of { memberId, amount, portions }
 */
export const calculateMealCost = (dishPrice, memberStatuses) => {
  const totalPortions = memberStatuses.reduce((sum, ms) => {
    return sum + (MEAL_STATUS_PORTIONS[ms.status] || 0);
  }, 0);

  if (totalPortions === 0) return memberStatuses.map(ms => ({ memberId: ms.memberId, amount: 0, portions: 0 }));

  const pricePerPortion = dishPrice / totalPortions;

  return memberStatuses.map(ms => {
    const portions = MEAL_STATUS_PORTIONS[ms.status] || 0;
    return {
      memberId: ms.memberId,
      amount: pricePerPortion * portions,
      portions,
    };
  });
};

/**
 * Calculate total expense for a single day
 */
export const calculateDailyExpense = (date, meals, dishes) => {
  const dayMeals = meals.filter(m => m.date === date);
  let total = 0;
  const memberExpenses = {};

  dayMeals.forEach(meal => {
    const dish = dishes.find(d => d.id === meal.dishId);
    if (!dish) return;

    const quantity = meal.quantity || 1;
    const costs = calculateMealCost(dish.price * quantity, meal.memberStatuses);
    costs.forEach(c => {
      total += c.amount;
      if (!memberExpenses[c.memberId]) memberExpenses[c.memberId] = 0;
      memberExpenses[c.memberId] += c.amount;
    });
  });

  return { total, memberExpenses, dayMeals };
};

/**
 * Calculate monthly expenses for all members
 */
export const calculateMonthlyExpense = (month, year, meals, dishes, otherExpenses, members) => {
  const mealsInThisMonth = meals.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const monthStartDate = mealsInThisMonth.length > 0 ? new Date(mealsInThisMonth[0].date).getDate() : 1;

  const startDate = new Date(year, month, monthStartDate);
  const endDate = monthStartDate > 1 ? new Date(year, month + 1, monthStartDate - 1) : new Date(year, month + 1, 0);

  const monthMeals = meals.filter(m => {
    const d = new Date(m.date);
    return d >= startDate && d <= endDate;
  });

  const monthExpenses = otherExpenses.filter(e => {
    const d = new Date(e.date);
    return d >= startDate && d <= endDate;
  });

  let totalDishExpense = 0;
  let totalOtherExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const memberTotals = {};
  const dailyTotals = {};
  let totalLunches = 0;
  let totalDinners = 0;
  let totalFullMeals = 0;
  let totalHalfMeals = 0;

  const activeMembers = members.filter(m => m.active);
  activeMembers.forEach(m => {
    memberTotals[m.id] = {
      memberId: m.id,
      name: m.name,
      dishExpense: 0,
      otherExpense: 0,
      totalExpense: 0,
      lunchCount: 0,
      dinnerCount: 0,
      fullMeals: 0,
      halfMeals: 0,
    };
  });

  monthMeals.forEach(meal => {
    const dish = dishes.find(d => d.id === meal.dishId);
    if (!dish) return;

    const quantity = meal.quantity || 1;
    const costs = calculateMealCost(dish.price * quantity, meal.memberStatuses);
    const dateKey = meal.date;

    if (!dailyTotals[dateKey]) {
      dailyTotals[dateKey] = { date: dateKey, lunch: 0, dinner: 0, total: 0 };
    }

    costs.forEach(c => {
      totalDishExpense += c.amount;
      dailyTotals[dateKey].total += c.amount;

      if (meal.mealType === 'lunch') {
        dailyTotals[dateKey].lunch += c.amount;
      } else {
        dailyTotals[dateKey].dinner += c.amount;
      }

      if (memberTotals[c.memberId]) {
        memberTotals[c.memberId].dishExpense += c.amount;
        if (meal.mealType === 'lunch' && c.portions > 0) {
          memberTotals[c.memberId].lunchCount++;
        }
        if (meal.mealType === 'dinner' && c.portions > 0) {
          memberTotals[c.memberId].dinnerCount++;
        }
        if (c.portions === 1) {
          memberTotals[c.memberId].fullMeals++;
          totalFullMeals++;
        }
        if (c.portions === 0.5) {
          memberTotals[c.memberId].halfMeals++;
          totalHalfMeals++;
        }
      }
    });

    if (meal.mealType === 'lunch') totalLunches++;
    else totalDinners++;
  });

  // Split other expenses equally among active members
  const otherPerMember = activeMembers.length > 0 ? totalOtherExpense / activeMembers.length : 0;
  Object.values(memberTotals).forEach(mt => {
    mt.otherExpense = otherPerMember;
    mt.totalExpense = mt.dishExpense + mt.otherExpense;
  });

  return {
    totalDishExpense,
    totalOtherExpense,
    grandTotal: totalDishExpense + totalOtherExpense,
    totalLunches,
    totalDinners,
    totalFullMeals,
    totalHalfMeals,
    memberTotals: Object.values(memberTotals),
    dailyTotals: Object.values(dailyTotals).sort((a, b) => a.date.localeCompare(b.date)),
    monthExpenses,
  };
};

/**
 * Calculate single member's monthly data
 */
export const calculateMemberMonthly = (memberId, month, year, meals, dishes, otherExpenses, members) => {
  const report = calculateMonthlyExpense(month, year, meals, dishes, otherExpenses, members);
  const memberData = report.memberTotals.find(mt => mt.memberId === memberId);

  const mealsInThisMonth = meals.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === month && d.getFullYear() === year;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const monthStartDate = mealsInThisMonth.length > 0 ? new Date(mealsInThisMonth[0].date).getDate() : 1;

  const startDate = new Date(year, month, monthStartDate);
  const endDate = monthStartDate > 1 ? new Date(year, month + 1, monthStartDate - 1) : new Date(year, month + 1, 0);

  const memberMeals = meals.filter(m => {
    const d = new Date(m.date);
    if (d < startDate || d > endDate) return false;
    return m.memberStatuses.some(ms => ms.memberId === memberId && ms.status !== 'none');
  }).map(meal => {
    const dish = dishes.find(d => d.id === meal.dishId);
    const ms = meal.memberStatuses.find(s => s.memberId === memberId);
    const quantity = meal.quantity || 1;
    const costs = calculateMealCost((dish?.price || 0) * quantity, meal.memberStatuses);
    const myCost = costs.find(c => c.memberId === memberId);

    return {
      date: meal.date,
      mealType: meal.mealType,
      dishName: dish?.name || 'Unknown',
      status: ms?.status || 'none',
      amount: myCost?.amount || 0,
    };
  });

  return {
    ...memberData,
    meals: memberMeals,
    otherExpenses: report.monthExpenses,
  };
};

/**
 * Get today's meal summary
 */
export const getTodaysSummary = (today, meals, dishes, members = [], otherExpenses = []) => {
  const todayMeals = meals.filter(m => m.date === today);
  const lunch = todayMeals.find(m => m.mealType === 'lunch');
  const dinner = todayMeals.find(m => m.mealType === 'dinner');

  const lunchDish = lunch ? dishes.find(d => d.id === lunch.dishId) : null;
  const dinnerDish = dinner ? dishes.find(d => d.id === dinner.dishId) : null;

  let todayExpense = 0;
  todayMeals.forEach(meal => {
    const dish = dishes.find(d => d.id === meal.dishId);
    if (dish) {
      const quantity = meal.quantity || 1;
      const costs = calculateMealCost(dish.price * quantity, meal.memberStatuses);
      costs.forEach(c => {
        // Only include cost if the member exists and is active (or if we don't have members array to check against)
        const member = members.length > 0 ? members.find(m => m.id === c.memberId) : { active: true };
        if (member && member.active) {
          todayExpense += c.amount;
        }
      });
    }
  });

  // Include today's other expenses in the total
  const todaysOtherExpenses = otherExpenses.filter(e => e.date === today);
  todaysOtherExpenses.forEach(e => {
    todayExpense += e.amount;
  });

  return {
    lunch: lunchDish ? { dish: lunchDish, meal: lunch } : null,
    dinner: dinnerDish ? { dish: dinnerDish, meal: dinner } : null,
    todayExpense,
  };
};
