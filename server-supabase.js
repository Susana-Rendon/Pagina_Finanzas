const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config();

const {
  supabase,
  getUserByEmail,
  getUserById,
  registerUser,
  updateUserProfile,
  getUserTransactions,
  createTransaction,
  getDashboardSummary,
  getUserCategories,
  createCategory,
  getUserSavingsGoals,
  createSavingsGoal,
  getRecurringTransactions,
  createRecurringTransaction
} = require('./database/supabase-client');

const app = express();
const port = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'MisFinanzasSecret2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true }
}));
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================
// AUTENTICACIÓN
// =====================================================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await getUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Registrar usuario
    const result = await registerUser(name.trim(), email.trim().toLowerCase(), hashedPassword);

    if (result.success) {
      req.session.userId = result.user.id;
      req.session.userName = result.user.name;
      req.session.userEmail = result.user.email;

      return res.json({
        success: true,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email
        }
      });
    }
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const user = await getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
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
    if (!userId) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido.' });
    }

    const result = await updateUserProfile(userId, { name: name.trim() });
    req.session.userName = name.trim();

    res.json({
      success: true,
      message: 'Perfil actualizado.',
      user: result.user
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================================

function requireAuth(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'No autorizado.' });
}

// =====================================================
// RUTAS PROTEGIDAS - DASHBOARD
// =====================================================

app.get('/api/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const [summary, transactions, goals, recurring] = await Promise.all([
      getDashboardSummary(userId),
      getUserTransactions(userId),
      getUserSavingsGoals(userId),
      getRecurringTransactions(userId)
    ]);

    res.json({
      success: true,
      data: {
        summary: summary || {},
        transactions: transactions || [],
        goals: goals || [],
        recurring: recurring || []
      }
    });
  } catch (err) {
    console.error('Summary Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// RUTAS - TRANSACCIONES
// =====================================================

app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await getUserTransactions(userId);

    res.json({
      success: true,
      transactions: transactions || []
    });
  } catch (err) {
    console.error('Get Transactions Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { description, category_id, amount, type, transaction_date, note } = req.body;

    if (!description || !amount || !type || !transaction_date) {
      return res.status(400).json({ error: 'Campos requeridos faltando.' });
    }

    const result = await createTransaction(userId, {
      description,
      category_id,
      amount: parseFloat(amount),
      type,
      transaction_date,
      note
    });

    res.json({
      success: true,
      transaction: result.transaction
    });
  } catch (err) {
    console.error('Create Transaction Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// RUTAS - CATEGORÍAS
// =====================================================

app.get('/api/categories', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await getUserCategories(userId);

    res.json({
      success: true,
      categories: categories || []
    });
  } catch (err) {
    console.error('Get Categories Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Nombre y tipo son requeridos.' });
    }

    const result = await createCategory(userId, {
      name,
      type,
      icon,
      color,
      is_active: true
    });

    res.json({
      success: true,
      category: result.category
    });
  } catch (err) {
    console.error('Create Category Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// RUTAS - METAS DE AHORRO
// =====================================================

app.get('/api/goals', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const goals = await getUserSavingsGoals(userId);

    res.json({
      success: true,
      goals: goals || []
    });
  } catch (err) {
    console.error('Get Goals Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, description, target_amount, target_date, priority, color } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({ error: 'Nombre y monto objetivo son requeridos.' });
    }

    const result = await createSavingsGoal(userId, {
      name,
      description,
      target_amount: parseFloat(target_amount),
      current_amount: 0,
      target_date,
      priority: priority || 'medium',
      color,
      status: 'active'
    });

    res.json({
      success: true,
      goal: result.goal
    });
  } catch (err) {
    console.error('Create Goal Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// RUTAS - GASTOS RECURRENTES
// =====================================================

app.get('/api/recurring', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const recurring = await getRecurringTransactions(userId);

    res.json({
      success: true,
      recurring: recurring || []
    });
  } catch (err) {
    console.error('Get Recurring Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recurring', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const {
      name,
      category_id,
      amount,
      type,
      frequency,
      due_day_of_month,
      start_date,
      end_date,
      payment_method,
      notes
    } = req.body;

    if (!name || !amount || !type || !frequency || !start_date) {
      return res.status(400).json({ error: 'Campos requeridos faltando.' });
    }

    const result = await createRecurringTransaction(userId, {
      name,
      category_id,
      amount: parseFloat(amount),
      type,
      frequency,
      due_day_of_month,
      start_date,
      end_date,
      is_active: true,
      payment_method,
      next_payment_date: start_date,
      notes
    });

    res.json({
      success: true,
      recurring: result.recurring
    });
  } catch (err) {
    console.error('Create Recurring Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(port, () => {
  console.log(`🚀 Servidor MisFinanzas ejecutándose en puerto ${port}`);
  console.log(`📊 Base de datos: Supabase PostgreSQL`);
  console.log(`🔐 Autenticación: bcrypt + Session`);
});
