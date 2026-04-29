const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const XLSX = require('xlsx');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'MisFinanzasSecret2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(express.static(path.join(__dirname, 'public')));

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function runGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function runExec(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

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

function buildRecurringTransactions(fixedExpenses, subscriptions, monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const recurring = [];

  fixedExpenses.forEach((item) => {
    const totalDays = daysInMonth(year, month);
    const dueDay = Math.min(Math.max(1, item.due_day), totalDays);
    recurring.push({
      id: `fixed-${item.id}-${year}-${month}`,
      description: item.name,
      category: item.category,
      amount: -Math.abs(item.amount),
      type: 'expense',
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`,
      note: 'Gasto fijo'
    });
  });

  subscriptions.forEach((item) => {
    const totalDays = daysInMonth(year, month);
    const billingDay = Math.min(Math.max(1, item.billing_day), totalDays);
    recurring.push({
      id: `sub-${item.id}-${year}-${month}`,
      description: item.name,
      category: 'Suscripción',
      amount: -Math.abs(item.amount),
      type: 'expense',
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(billingDay).padStart(2, '0')}`,
      note: 'Suscripción mensual'
    });
  });

  return recurring;
}

function buildReminders(fixedExpenses, subscriptions) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reminders = [];

  fixedExpenses.forEach((item) => {
    const dueDate = getNextDueDate(item.due_day, today);
    const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 1 || diffDays === 2) {
      const label = diffDays === 1 ? 'mañana' : 'en 2 días';
      reminders.push({
        text: `Tu pago de ${item.name} vence ${label}`,
        date: dueDate.toISOString().slice(0, 10),
        type: 'fixed'
      });
    }
  });

  subscriptions.forEach((item) => {
    const dueDate = getNextDueDate(item.billing_day, today);
    const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 1 || diffDays === 2) {
      const label = diffDays === 1 ? 'mañana' : 'en 2 días';
      reminders.push({
        text: `Debes pagar ${item.name} ${label}`,
        date: dueDate.toISOString().slice(0, 10),
        type: 'subscription'
      });
    }
  });

  return reminders;
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    const existingUser = await runGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await runExec('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
      name.trim(),
      email.trim().toLowerCase(),
      hashedPassword
    ]);
    req.session.userId = result.id;
    req.session.userName = name.trim();
    req.session.userEmail = email.trim().toLowerCase();
    res.json({ user: { id: result.id, name: req.session.userName, email: req.session.userEmail } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    const user = await runGet('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo cerrar sesión.' });
    }
    res.json({ success: true });
  });
});

app.get('/api/session', (req, res) => {
  res.json({
    authenticated: !!req.session.userId,
    user: req.session.userId ? {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail
    } : null
  });
});

app.put('/api/profile', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido.' });
    }
    
    await runExec(
      'UPDATE users SET name = ? WHERE id = ?',
      [name.trim(), userId]
    );
    
    req.session.userName = name.trim();
    res.json({ success: true, message: 'Perfil actualizado.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/change-password', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas.' });
    }
    
    const user = await runGet('SELECT password FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    
    const passwordMatch = await bcrypt.compare(current_password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
    }
    
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await runExec(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    res.json({ success: true, message: 'Contraseña actualizada.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function requireAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'No autorizado.' });
}

app.use('/api', (req, res, next) => {
  const publicPaths = ['/login', '/register', '/session'];
  if (publicPaths.includes(req.path)) {
    return next();
  }
  return requireAuth(req, res, next);
});

app.get('/api/summary', async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await runQuery('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [userId]);
    const goals = await runQuery('SELECT id, name, target_amount AS target, current_amount AS saved, description, priority, color FROM savings_goals WHERE user_id = ? ORDER BY id ASC', [userId]);
    const fixedExpenses = await runQuery('SELECT * FROM fixed_expenses WHERE user_id = ? ORDER BY due_day ASC', [userId]);
    const subscriptions = await runQuery('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY billing_day ASC', [userId]);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const actualExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalSavings = transactions.filter(t => t.type === 'saving').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalFixed = fixedExpenses.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    const totalSubscriptions = subscriptions.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    const allRecurring = buildRecurringTransactions(fixedExpenses, subscriptions, new Date());
    const flow = totalIncome - actualExpenses - totalFixed - totalSubscriptions - totalSavings;
    const categories = {};
    [...transactions, ...allRecurring].forEach((t) => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
      }
    });
    const reminders = buildReminders(fixedExpenses, subscriptions);

    res.json({
      totals: {
        income: totalIncome,
        expenses: actualExpenses,
        fixedExpenses: totalFixed,
        subscriptions: totalSubscriptions,
        savings: totalSavings,
        netFlow: flow,
        available: flow
      },
      categories,
      goals,
      transactions: [...transactions, ...allRecurring],
      fixedExpenses,
      subscriptions,
      reminders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.post('/api/transactions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { description, category, amount, type, date, note, savings_goal_id } = req.body;
    if (!description || !category || !amount || !type || !date) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben llenarse.' });
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
    
    // Si es tipo saving, actualizar la meta de ahorro
    if (type === 'saving' && savings_goal_id) {
      const goalId = Number(savings_goal_id);
      const goal = await runGet('SELECT current_amount, target_amount FROM savings_goals WHERE id = ? AND user_id = ?', [goalId, userId]);
      
      if (goal) {
        const newAmount = Math.min(goal.current_amount + Math.abs(amount), goal.target_amount);
        await runExec('UPDATE savings_goals SET current_amount = ? WHERE id = ? AND user_id = ?', [newAmount, goalId, userId]);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { description, category, amount, type, date, note, savings_goal_id } = req.body;
    if (!description || !category || !amount || !type || !date) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben llenarse.' });
    }
    
    // Obtener la transacción anterior para calcular la diferencia
    const oldTransaction = await runGet('SELECT amount, type FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    
    const finalAmount = type === 'income' ? Math.abs(amount) : -Math.abs(amount);
    await runExec('UPDATE transactions SET description = ?, category = ?, amount = ?, type = ?, date = ?, note = ? WHERE id = ? AND user_id = ?', [
      description,
      category,
      finalAmount,
      type,
      date,
      note || '',
      id,
      userId
    ]);
    
    // Si la transacción anterior era de tipo saving, revertir la actualización de la meta
    if (oldTransaction && oldTransaction.type === 'saving') {
      const goals = await runQuery('SELECT id, current_amount FROM savings_goals WHERE user_id = ?', [userId]);
      if (goals.length > 0) {
        const goal = goals[0];
        const newAmount = Math.max(0, goal.current_amount + Math.abs(oldTransaction.amount));
        await runExec('UPDATE savings_goals SET current_amount = ? WHERE id = ?', [newAmount, goal.id]);
      }
    }
    
    // Si la nueva transacción es de tipo saving, actualizar la meta
    if (type === 'saving' && savings_goal_id) {
      const goalId = Number(savings_goal_id);
      const goal = await runGet('SELECT current_amount, target_amount FROM savings_goals WHERE id = ? AND user_id = ?', [goalId, userId]);
      
      if (goal) {
        const newAmount = Math.min(goal.current_amount + Math.abs(amount), goal.target_amount);
        await runExec('UPDATE savings_goals SET current_amount = ? WHERE id = ? AND user_id = ?', [newAmount, goalId, userId]);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactionId = req.params.id;
    
    // Obtener la transacción para verificar si es tipo saving
    const transaction = await runGet('SELECT amount, type FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId]);
    
    if (transaction && transaction.type === 'saving') {
      // Si es tipo saving, buscar la meta y restar el monto
      const goals = await runQuery('SELECT id, current_amount FROM savings_goals WHERE user_id = ?', [userId]);
      if (goals.length > 0) {
        const goal = goals[0];
        const newAmount = Math.max(0, goal.current_amount + Math.abs(transaction.amount));
        await runExec('UPDATE savings_goals SET current_amount = ? WHERE id = ?', [newAmount, goal.id]);
      }
    }
    
    await runExec('DELETE FROM transactions WHERE id = ? AND user_id = ?', [transactionId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fixed-expenses', async (req, res) => {
  try {
    const userId = req.session.userId;
    const rows = await runQuery('SELECT * FROM fixed_expenses WHERE user_id = ? ORDER BY due_day ASC', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fixed-expenses', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, amount, due_day, category } = req.body;
    if (!name || !amount || !due_day || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos para gasto fijo.' });
    }
    const result = await runExec('INSERT INTO fixed_expenses (user_id, name, amount, due_day, category) VALUES (?, ?, ?, ?, ?)', [
      userId,
      name.trim(),
      amount,
      Number(due_day),
      category.trim()
    ]);
    res.json({ id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/fixed-expenses/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, amount, due_day, category } = req.body;
    if (!name || !amount || !due_day || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos para gasto fijo.' });
    }
    await runExec('UPDATE fixed_expenses SET name = ?, amount = ?, due_day = ?, category = ? WHERE id = ? AND user_id = ?', [
      name.trim(),
      amount,
      Number(due_day),
      category.trim(),
      req.params.id,
      userId
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/fixed-expenses/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    await runExec('DELETE FROM fixed_expenses WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/subscriptions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const rows = await runQuery('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY billing_day ASC', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, amount, billing_day } = req.body;
    if (!name || !amount || !billing_day) {
      return res.status(400).json({ error: 'Faltan campos requeridos para suscripción.' });
    }
    const result = await runExec('INSERT INTO subscriptions (user_id, name, amount, billing_day) VALUES (?, ?, ?, ?)', [
      userId,
      name.trim(),
      amount,
      Number(billing_day)
    ]);
    res.json({ id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, amount, billing_day } = req.body;
    if (!name || !amount || !billing_day) {
      return res.status(400).json({ error: 'Faltan campos requeridos para suscripción.' });
    }
    await runExec('UPDATE subscriptions SET name = ?, amount = ?, billing_day = ? WHERE id = ? AND user_id = ?', [
      name.trim(),
      amount,
      Number(billing_day),
      req.params.id,
      userId
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    await runExec('DELETE FROM subscriptions WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/goals', async (req, res) => {
  try {
    const userId = req.session.userId;
    const rows = await runQuery('SELECT id, name, target_amount AS target, current_amount AS saved, description, priority, color FROM savings_goals WHERE user_id = ? ORDER BY id ASC', [userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, target, saved, description, priority, color } = req.body;
    if (!name || !target || typeof saved === 'undefined') {
      return res.status(400).json({ error: 'Faltan campos requeridos para la meta.' });
    }
    await runExec('INSERT INTO savings_goals (user_id, name, target_amount, current_amount, description, priority, color) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      userId,
      name,
      target,
      saved,
      description || '',
      priority || 'Medium',
      color || '#8b6ca6'
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { name, target, saved, description, priority, color } = req.body;
    if (!name || !target || typeof saved === 'undefined') {
      return res.status(400).json({ error: 'Faltan campos requeridos para la meta.' });
    }
    await runExec('UPDATE savings_goals SET name = ?, target_amount = ?, current_amount = ?, description = ?, priority = ?, color = ? WHERE id = ? AND user_id = ?', [
      name,
      target,
      saved,
      description || '',
      priority || 'Medium',
      color || '#8b6ca6',
      id,
      userId
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    await runExec('DELETE FROM savings_goals WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/calendar', async (req, res) => {
  try {
    const userId = req.session.userId;
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const rows = await runQuery("SELECT * FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ? ORDER BY date ASC", [userId, month]);
    const fixedExpenses = await runQuery('SELECT * FROM fixed_expenses WHERE user_id = ?', [userId]);
    const subscriptions = await runQuery('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
    const [year, monthNumber] = month.split('-').map(Number);
    const recurring = buildRecurringTransactions(fixedExpenses, subscriptions, new Date(year, monthNumber - 1, 1));
    const calendar = {};
    [...rows, ...recurring].forEach(row => {
      const day = row.date;
      if (!calendar[day]) calendar[day] = [];
      calendar[day].push(row);
    });
    res.json({ month, calendar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/export', async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await runQuery('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [userId]);
    const goals = await runQuery('SELECT id, name, target_amount AS target, current_amount AS saved, description, priority, color FROM savings_goals WHERE user_id = ? ORDER BY id ASC', [userId]);
    const fixedExpenses = await runQuery('SELECT * FROM fixed_expenses WHERE user_id = ? ORDER BY due_day ASC', [userId]);
    const subscriptions = await runQuery('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY billing_day ASC', [userId]);
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: 'Mis Finanzas Reporte',
      Author: 'Mis Finanzas',
      CreatedDate: new Date()
    };
    const txSheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Fecha: t.date,
      Descripción: t.description,
      Categoría: t.category,
      Tipo: t.type,
      Monto: t.amount,
      Nota: t.note
    })));
    XLSX.utils.book_append_sheet(workbook, txSheet, 'Transacciones');
    const goalsSheet = XLSX.utils.json_to_sheet(goals.map(g => ({
      Meta: g.name,
      Objetivo: g.target,
      Ahorrado: g.saved,
      Descripción: g.description,
      Prioridad: g.priority
    })));
    XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Metas');
    const fixedSheet = XLSX.utils.json_to_sheet(fixedExpenses.map(g => ({
      Nombre: g.name,
      Monto: g.amount,
      'Día de pago': g.due_day,
      Categoría: g.category
    })));
    XLSX.utils.book_append_sheet(workbook, fixedSheet, 'Gastos Fijos');
    const subsSheet = XLSX.utils.json_to_sheet(subscriptions.map(g => ({
      Nombre: g.name,
      Monto: g.amount,
      'Día de cobro': g.billing_day
    })));
    XLSX.utils.book_append_sheet(workbook, subsSheet, 'Suscripciones');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=mis-finanzas.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
