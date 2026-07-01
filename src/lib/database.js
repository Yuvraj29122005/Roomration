import { supabase } from './supabase';

// ============================================
// HELPER: snake_case ↔ camelCase conversion
// ============================================

const toCamel = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
};

const toSnake = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
};

// ============================================
// MEMBERS
// ============================================

export async function fetchMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  // Map password_hash → password for app compatibility
  return data.map((m) => {
    const camel = toCamel(m);
    camel.password = camel.passwordHash;
    return camel;
  });
}

export async function insertMember(member) {
  const dbMember = {
    name: member.name,
    mobile: member.mobile || null,
    username: member.username,
    password_hash: member.password || 'user123',
    role: member.role || 'user',
    active: member.active !== undefined ? member.active : true,
    join_date: member.joinDate || new Date().toISOString().split('T')[0],
  };
  const { data, error } = await supabase
    .from('members')
    .insert(dbMember)
    .select()
    .single();
  if (error) throw error;
  const camel = toCamel(data);
  camel.password = camel.passwordHash;
  return camel;
}

export async function updateMemberDb(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.mobile !== undefined) dbUpdates.mobile = updates.mobile;
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.password !== undefined) dbUpdates.password_hash = updates.password;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.active !== undefined) dbUpdates.active = updates.active;
  if (updates.joinDate !== undefined) dbUpdates.join_date = updates.joinDate;

  if (Object.keys(dbUpdates).length === 0) return null;

  const { data, error } = await supabase
    .from('members')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const camel = toCamel(data);
  camel.password = camel.passwordHash;
  return camel;
}

export async function deleteMemberDb(id) {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// DISHES
// ============================================

export async function fetchDishes() {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data.map(toCamel);
}

export async function insertDish(dish) {
  const dbDish = {
    name: dish.name,
    price: Number(dish.price),
    category: dish.category || null,
  };
  const { data, error } = await supabase
    .from('dishes')
    .insert(dbDish)
    .select()
    .single();
  if (error) throw error;
  return toCamel(data);
}

export async function updateDishDb(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.active !== undefined) dbUpdates.active = updates.active;

  const { data, error } = await supabase
    .from('dishes')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toCamel(data);
}

export async function deleteDishDb(id) {
  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// MEALS (with joined meal_member_status)
// ============================================

/**
 * Fetch all meals with their member statuses joined.
 * Returns data in the same shape the app expects:
 * { id, date, mealType, dishId, quantity, memberStatuses: [{ memberId, status }] }
 */
export async function fetchMeals() {
  const { data, error } = await supabase
    .from('meals')
    .select('*, meal_member_status(member_id, status)')
    .order('date', { ascending: true });
  if (error) throw error;

  return data.map((meal) => ({
    id: meal.id,
    date: meal.date,
    mealType: meal.meal_type,
    dishId: meal.dish_id,
    quantity: meal.quantity || 1,
    notes: meal.notes || '',
    memberStatuses: (meal.meal_member_status || []).map((ms) => ({
      memberId: ms.member_id,
      status: ms.status,
    })),
  }));
}

/**
 * Insert a meal + its member statuses.
 * Handles the two-table insert (meals + meal_member_status).
 */
export async function insertMealDb(mealData) {
  // 1. Insert meal record
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .insert({
      date: mealData.date,
      meal_type: mealData.mealType,
      dish_id: mealData.dishId,
      quantity: mealData.quantity || 1,
      notes: mealData.notes || null,
    })
    .select()
    .single();
  if (mealError) throw mealError;

  // 2. Insert member statuses
  if (mealData.memberStatuses && mealData.memberStatuses.length > 0) {
    const statuses = mealData.memberStatuses.map((ms) => ({
      meal_id: meal.id,
      member_id: ms.memberId,
      status: ms.status,
    }));
    const { error: statusError } = await supabase
      .from('meal_member_status')
      .insert(statuses);
    if (statusError) throw statusError;
  }

  // 3. Return in app format
  return {
    id: meal.id,
    date: meal.date,
    mealType: meal.meal_type,
    dishId: meal.dish_id,
    quantity: meal.quantity || 1,
    notes: meal.notes || '',
    memberStatuses: mealData.memberStatuses || [],
  };
}

/**
 * Update a meal + replace its member statuses.
 */
export async function updateMealDb(id, updates) {
  // 1. Update meal record
  const mealUpdate = {};
  if (updates.date !== undefined) mealUpdate.date = updates.date;
  if (updates.mealType !== undefined) mealUpdate.meal_type = updates.mealType;
  if (updates.dishId !== undefined) mealUpdate.dish_id = updates.dishId;
  if (updates.quantity !== undefined) mealUpdate.quantity = updates.quantity;
  if (updates.notes !== undefined) mealUpdate.notes = updates.notes;

  if (Object.keys(mealUpdate).length > 0) {
    const { error } = await supabase
      .from('meals')
      .update(mealUpdate)
      .eq('id', id);
    if (error) throw error;
  }

  // 2. Replace member statuses (delete old, insert new)
  if (updates.memberStatuses) {
    const { error: delError } = await supabase
      .from('meal_member_status')
      .delete()
      .eq('meal_id', id);
    if (delError) throw delError;

    if (updates.memberStatuses.length > 0) {
      const statuses = updates.memberStatuses.map((ms) => ({
        meal_id: id,
        member_id: ms.memberId,
        status: ms.status,
      }));
      const { error: insError } = await supabase
        .from('meal_member_status')
        .insert(statuses);
      if (insError) throw insError;
    }
  }
}

export async function deleteMealDb(id) {
  // meal_member_status has ON DELETE CASCADE, so just delete the meal
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// EXPENSES
// ============================================

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data.map(toCamel);
}

export async function insertExpense(expense) {
  const dbExpense = {
    name: expense.name,
    category: expense.category,
    amount: Number(expense.amount),
    date: expense.date,
    description: expense.description || null,
    created_by: expense.createdBy || null,
  };
  const { data, error } = await supabase
    .from('expenses')
    .insert(dbExpense)
    .select()
    .single();
  if (error) throw error;
  return toCamel(data);
}

export async function updateExpenseDb(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount);
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.description !== undefined) dbUpdates.description = updates.description;

  const { data, error } = await supabase
    .from('expenses')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toCamel(data);
}

export async function deleteExpenseDb(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// SETTINGS
// ============================================

export async function fetchSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  if (!data) return { monthStartDate: 1 };
  return toCamel(data);
}

export async function updateSettingsDb(updates) {
  const dbUpdates = {};
  if (updates.monthStartDate !== undefined) dbUpdates.month_start_date = updates.monthStartDate;
  if (updates.roomName !== undefined) dbUpdates.room_name = updates.roomName;

  // Get existing settings row
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('settings')
      .update(dbUpdates)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  } else {
    const { data, error } = await supabase
      .from('settings')
      .insert(dbUpdates)
      .select()
      .single();
    if (error) throw error;
    return toCamel(data);
  }
}

// ============================================
// AUTH (login via members table)
// ============================================

export async function loginWithCredentials(username, password) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('username', username)
    .eq('password_hash', password)
    .single();

  if (error || !data) {
    return { success: false, error: 'Invalid username or password' };
  }

  const camel = toCamel(data);
  return {
    success: true,
    user: {
      id: camel.id,
      name: camel.name,
      username: camel.username,
      role: camel.role,
      mobile: camel.mobile,
    },
  };
}
