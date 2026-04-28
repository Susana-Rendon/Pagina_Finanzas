// =====================================================
// database.js - Cliente Supabase para MisFinanzas
// Reemplaza la configuración anterior de SQLite
// =====================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// FUNCIONES AUXILIARES DE CONSULTAS
// =====================================================

/**
 * Ejecutar una consulta SELECT que retorna múltiples filas
 */
async function query(sql, params = []) {
  try {
    const { data, error } = await supabase.rpc('execute_query', {
      p_sql: sql,
      p_params: params
    });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Query Error:', err.message);
    throw err;
  }
}

/**
 * Ejecutar una consulta SELECT que retorna una sola fila
 */
async function queryOne(tableName, filter = {}) {
  try {
    let query = supabase.from(tableName).select('*');
    
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.limit(1).single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  } catch (err) {
    console.error('Query One Error:', err.message);
    throw err;
  }
}

/**
 * Insertar registro
 */
async function insert(tableName, data) {
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([data])
      .select();
    
    if (error) throw error;
    return { id: result[0]?.id, changes: 1 };
  } catch (err) {
    console.error('Insert Error:', err.message);
    throw err;
  }
}

/**
 * Actualizar registro
 */
async function update(tableName, data, filter) {
  try {
    let updateQuery = supabase.from(tableName).update(data);
    
    Object.entries(filter).forEach(([key, value]) => {
      updateQuery = updateQuery.eq(key, value);
    });
    
    const { error } = await updateQuery;
    
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Update Error:', err.message);
    throw err;
  }
}

/**
 * Eliminar registro (soft delete con deleted_at)
 */
async function softDelete(tableName, filter) {
  try {
    let deleteQuery = supabase
      .from(tableName)
      .update({ deleted_at: new Date().toISOString() });
    
    Object.entries(filter).forEach(([key, value]) => {
      deleteQuery = deleteQuery.eq(key, value);
    });
    
    const { error } = await deleteQuery;
    
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Delete Error:', err.message);
    throw err;
  }
}

/**
 * Ejecutar función PostgreSQL
 */
async function callFunction(functionName, params = {}) {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Function Error:', err.message);
    throw err;
  }
}

// =====================================================
// UTILIDADES COMUNES
// =====================================================

/**
 * Obtener todas las transacciones de un usuario
 */
async function getUserTransactions(userId, filters = {}) {
  try {
    let query = supabase
      .from('transactions')
      .select('*, transaction_categories(name, icon, color)')
      .eq('user_id', userId)
      .is('deleted_at', null);
    
    // Aplicar filtros opcionales
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters.startDate) query = query.gte('transaction_date', filters.startDate);
    if (filters.endDate) query = query.lte('transaction_date', filters.endDate);
    
    const { data, error } = await query.order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Get User Transactions Error:', err.message);
    throw err;
  }
}

/**
 * Obtener resumen del dashboard
 */
async function getDashboardSummary(userId) {
  try {
    const summaryData = await callFunction('get_dashboard_summary', { 
      p_user_id: userId 
    });
    
    return summaryData?.[0] || null;
  } catch (err) {
    console.error('Dashboard Summary Error:', err.message);
    throw err;
  }
}

/**
 * Obtener próximas transacciones recurrentes
 */
async function getUpcomingPayments(userId, daysAhead = 30) {
  try {
    const upcomingData = await callFunction('get_upcoming_recurring_transactions', {
      p_user_id: userId,
      p_days_ahead: daysAhead
    });
    
    return upcomingData || [];
  } catch (err) {
    console.error('Upcoming Payments Error:', err.message);
    throw err;
  }
}

/**
 * Obtener gastos por categoría
 */
async function getExpensesByCategory(userId, month = null) {
  try {
    const month_date = month ? new Date(month) : new Date();
    
    const categoriesData = await callFunction('get_expenses_by_category', {
      p_user_id: userId,
      p_month: month_date
    });
    
    return categoriesData || [];
  } catch (err) {
    console.error('Expenses by Category Error:', err.message);
    throw err;
  }
}

/**
 * Obtener progreso de metas de ahorro
 */
async function getGoalsProgress(userId) {
  try {
    const goalsData = await callFunction('calculate_goals_progress', {
      p_user_id: userId
    });
    
    return goalsData || [];
  } catch (err) {
    console.error('Goals Progress Error:', err.message);
    throw err;
  }
}

/**
 * Obtener historial de transacciones con filtros
 */
async function getTransactionHistory(userId, filters = {}) {
  try {
    const historyData = await callFunction('get_transaction_history', {
      p_user_id: userId,
      p_start_date: filters.startDate || null,
      p_end_date: filters.endDate || null,
      p_type: filters.type || null,
      p_category_id: filters.categoryId || null
    });
    
    return historyData || [];
  } catch (err) {
    console.error('Transaction History Error:', err.message);
    throw err;
  }
}

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

module.exports = {
  supabase,
  query,
  queryOne,
  insert,
  update,
  softDelete,
  callFunction,
  
  // Utilidades comunes
  getUserTransactions,
  getDashboardSummary,
  getUpcomingPayments,
  getExpensesByCategory,
  getGoalsProgress,
  getTransactionHistory
};
