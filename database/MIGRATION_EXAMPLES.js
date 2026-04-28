// =====================================================
// EJEMPLOS DE MIGRACIÓN: SQLite → Supabase
// Comparación de endpoints antes y después
// =====================================================

// =====================================================
// EJEMPLO 1: OBTENER RESUMEN DEL DASHBOARD
// =====================================================

// ANTES (SQLite)
/*
app.get('/api/summary', async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await runQuery('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [userId]);
    const goals = await runQuery('SELECT id, name, target_amount AS target, current_amount AS saved FROM savings_goals WHERE user_id = ?', [userId]);
    const fixedExpenses = await runQuery('SELECT * FROM fixed_expenses WHERE user_id = ?', [userId]);
    const subscriptions = await runQuery('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    
    // Cálculos manuales complicados...
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const actualExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    // ... más lógica...
    
    res.json({ totals: { income: totalIncome, expenses: actualExpenses, ... } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase)
const { supabase, getDashboardSummary } = require('../database/supabase-client');

app.get('/api/summary', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Una sola llamada - los cálculos están en la base de datos
    const summary = await getDashboardSummary(userId);
    
    if (!summary) {
      return res.status(404).json({ error: 'Resumen no encontrado' });
    }
    
    res.json({
      totals: {
        income: summary.monthly_income,
        expenses: summary.monthly_expenses,
        savings: summary.monthly_savings,
        fixedExpenses: summary.fixed_expenses_monthly,
        subscriptions: summary.subscriptions_monthly,
        netFlow: summary.net_flow,
        available: summary.available_amount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 2: CREAR TRANSACCIÓN
// =====================================================

// ANTES (SQLite)
/*
app.post('/api/transactions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { description, category, amount, type, date, note } = req.body;
    
    if (!description || !category || !amount || !type || !date) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const finalAmount = type === 'income' ? Math.abs(amount) : -Math.abs(amount);
    
    await runExec('INSERT INTO transactions (user_id, description, category, amount, type, date, note) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      userId,
      description,
      category,
      finalAmount,
      type,
      date,
      note || ''
    ]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase)
app.post('/api/transactions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { description, categoryId, amount, type, transactionDate, note } = req.body;
    
    // Validación
    if (!description || !categoryId || !amount || !type || !transactionDate) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }
    
    if (!['income', 'expense', 'saving'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de transacción inválido' });
    }
    
    // Crear transacción
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        category_id: categoryId,
        description: description.trim(),
        amount: Math.abs(amount),
        type: type,
        transaction_date: transactionDate,
        note: note || ''
      })
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, transaction: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 3: OBTENER TRANSACCIONES FILTRADAS
// =====================================================

// ANTES (SQLite)
/*
app.get('/api/transactions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { type, month } = req.query;
    
    let sql = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC';
    let params = [userId];
    
    if (type && type !== 'all') {
      sql = 'SELECT * FROM transactions WHERE user_id = ? AND type = ? ORDER BY date DESC';
      params = [userId, type];
    }
    
    if (month) {
      const [, year, mon] = month.match(/(\d{4})-(\d{2})/) || [];
      if (year && mon) {
        sql = 'SELECT * FROM transactions WHERE user_id = ? AND strftime(\'%Y-%m\', date) = ? ORDER BY date DESC';
        params = [userId, `${year}-${mon}`];
      }
    }
    
    const rows = await runQuery(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase)
app.get('/api/transactions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { type, month, page = 1 } = req.query;
    const limit = 20;
    const offset = (parseInt(page) - 1) * limit;
    
    let query = supabase
      .from('transactions')
      .select('*, transaction_categories(name, icon, color)', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null);
    
    // Filtrar por tipo
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    // Filtrar por mes
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0];
      
      query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
    }
    
    // Paginación
    const { data, error, count } = await query
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    res.json({
      transactions: data,
      pagination: {
        page: parseInt(page),
        limit: limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 4: OBTENER PRÓXIMOS PAGOS (RECURRENTES)
// =====================================================

// ANTES (SQLite - lógica compleja en JavaScript)
/*
function getNextDueDate(day, reference = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const lastDay = daysInMonth(year, month);
  let dueDay = Math.min(Math.max(1, day), lastDay);
  let dueDate = new Date(year, month, dueDay);
  if (dueDate < reference.setHours(0, 0, 0, 0)) {
    const nextMonth = new Date(year, month + 1, 1);
    const nextLastDay = daysInMonth(nextMonth.getFullYear(), nextMonth.getMonth());
    dueDay = Math.min(Math.max(1, day), nextLastDay);
    dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), dueDay);
  }
  return dueDate;
}

app.get('/api/upcoming-payments', async (req, res) => {
  try {
    const userId = req.session.userId;
    const fixedExpenses = await runQuery('SELECT * FROM fixed_expenses WHERE user_id = ?', [userId]);
    const subscriptions = await runQuery('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    
    // Calcular manualmente...
    const reminders = [];
    fixedExpenses.forEach((item) => {
      const dueDate = getNextDueDate(item.due_day);
      // ...
    });
    
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase - la BD maneja los cálculos)
const { getUpcomingPayments } = require('../database/supabase-client');

app.get('/api/upcoming-payments', async (req, res) => {
  try {
    const userId = req.session.userId;
    const daysAhead = parseInt(req.query.daysAhead) || 30;
    
    // Obtener pagos calculados por la BD
    const payments = await getUpcomingPayments(userId, daysAhead);
    
    res.json({
      upcomingPayments: payments,
      daysChecked: daysAhead,
      totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 5: OBTENER GASTOS POR CATEGORÍA
// =====================================================

// ANTES (SQLite)
/*
app.get('/api/expenses-by-category', async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await runQuery('SELECT DISTINCT category FROM transactions WHERE user_id = ? AND type = \'expense\'', [userId]);
    
    const result = {};
    for (const cat of categories) {
      const expenses = await runQuery('SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = \'expense\' AND category = ?', [userId, cat.category]);
      result[cat.category] = expenses[0]?.total || 0;
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase)
const { getExpensesByCategory } = require('../database/supabase-client');

app.get('/api/expenses-by-category', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { month } = req.query;
    
    const expensesByCategory = await getExpensesByCategory(userId, month);
    
    res.json({
      month: month || new Date().toISOString().split('T')[0],
      categories: expensesByCategory,
      totalExpenses: expensesByCategory.reduce((sum, c) => sum + parseFloat(c.total_amount), 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 6: OBTENER METAS DE AHORRO CON PROGRESO
// =====================================================

// ANTES (SQLite - cálculos manuales)
/*
app.get('/api/savings-goals', async (req, res) => {
  try {
    const userId = req.session.userId;
    const goals = await runQuery('SELECT * FROM savings_goals WHERE user_id = ?', [userId]);
    
    const result = goals.map(g => ({
      ...g,
      progressPercentage: (g.current_amount / g.target_amount) * 100,
      remaining: g.target_amount - g.current_amount
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase)
const { getGoalsProgress } = require('../database/supabase-client');

app.get('/api/savings-goals', async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const goals = await getGoalsProgress(userId);
    
    const formattedGoals = goals.map(g => ({
      id: g.goal_id,
      name: g.goal_name,
      targetAmount: g.target_amount,
      currentAmount: g.current_amount,
      progressPercentage: g.progress_percentage,
      remainingAmount: g.remaining_amount,
      daysRemaining: g.days_remaining,
      status: g.status
    }));
    
    res.json(formattedGoals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 7: ACTUALIZAR TRANSACCIÓN
// =====================================================

// ANTES (SQLite)
/*
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { description, category, amount, type, date, note } = req.body;
    
    const finalAmount = type === 'income' ? Math.abs(amount) : -Math.abs(amount);
    
    await runExec(
      'UPDATE transactions SET description = ?, category = ?, amount = ?, type = ?, date = ?, note = ? WHERE id = ? AND user_id = ?',
      [description, category, finalAmount, type, date, note || '', id, userId]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase)
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { description, categoryId, amount, type, transactionDate, note } = req.body;
    
    // Validación
    if (!description || !amount || !type || !transactionDate) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .update({
        description: description.trim(),
        category_id: categoryId,
        amount: Math.abs(amount),
        type: type,
        transaction_date: transactionDate,
        note: note || ''
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    res.json({ success: true, transaction: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 8: ELIMINAR TRANSACCIÓN (SOFT DELETE)
// =====================================================

// ANTES (SQLite - eliminación física)
/*
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    await runExec('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
*/

// DESPUÉS (Supabase - soft delete preserva datos)
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    
    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Transacción eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 9: CREAR GASTO FIJO
// =====================================================

app.post('/api/fixed-expenses', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, amount, dueDayOfMonth, categoryId } = req.body;
    
    if (!name || !amount || !dueDayOfMonth || !categoryId) {
      return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }
    
    if (dueDayOfMonth < 1 || dueDayOfMonth > 31) {
      return res.status(400).json({ error: 'Día debe estar entre 1 y 31' });
    }
    
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: userId,
        name: name.trim(),
        amount: Math.abs(amount),
        type: 'fixed_expense',
        frequency: 'monthly',
        due_day_of_month: dueDayOfMonth,
        category_id: categoryId,
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
        notification_days_before: 7,
        next_payment_date: new Date().toISOString().split('T')[0]
      })
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, fixedExpense: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EJEMPLO 10: CREAR META DE AHORRO
// =====================================================

app.post('/api/savings-goals', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, targetAmount, description, priority, targetDate, color } = req.body;
    
    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Nombre y monto objetivo son requeridos' });
    }
    
    if (targetAmount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }
    
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        name: name.trim(),
        description: description || '',
        target_amount: parseFloat(targetAmount),
        current_amount: 0,
        priority: priority || 'medium',
        target_date: targetDate || null,
        color: color || '3b82f6',
        status: 'active'
      })
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, goal: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// EXPORTAR ROUTER
// =====================================================

module.exports = router;
