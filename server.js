const express = require('express');
const path = require('path');
const cors = require('cors');
const XLSX = require('xlsx');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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

app.get('/api/summary', async (req, res) => {
  try {
    const transactions = await runQuery('SELECT * FROM transactions');
    const goals = await runQuery('SELECT * FROM goals');
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalSavings = transactions.filter(t => t.type === 'saving').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const flow = totalIncome - totalExpenses - totalSavings;
    const categories = {};
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
      }
    });

    res.json({
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
        netFlow: flow
      },
      categories,
      goals,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const { type, month } = req.query;
    let sql = 'SELECT * FROM transactions ORDER BY date DESC';
    const params = [];
    if (type && type !== 'all') {
      sql = 'SELECT * FROM transactions WHERE type = ? ORDER BY date DESC';
      params.push(type);
    }
    if (month) {
      const [, year, mon] = month.match(/(\d{4})-(\d{2})/) || [];
      if (year && mon) {
        sql = 'SELECT * FROM transactions WHERE strftime(\'%Y-%m\', date) = ? ORDER BY date DESC';
        params.length = 0;
        params.push(`${year}-${mon}`);
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
    const { description, category, amount, type, date, note } = req.body;
    if (!description || !category || !amount || !type || !date) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben llenarse.' });
    }
    const finalAmount = type === 'income' ? Math.abs(amount) : -Math.abs(amount);
    await runExec('INSERT INTO transactions (description, category, amount, type, date, note) VALUES (?, ?, ?, ?, ?, ?)', [
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

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, category, amount, type, date, note } = req.body;
    if (!description || !category || !amount || !type || !date) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben llenarse.' });
    }
    const finalAmount = type === 'income' ? Math.abs(amount) : -Math.abs(amount);
    await runExec('UPDATE transactions SET description = ?, category = ?, amount = ?, type = ?, date = ?, note = ? WHERE id = ?', [
      description,
      category,
      finalAmount,
      type,
      date,
      note || '',
      id
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await runExec('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/goals', async (req, res) => {
  try {
    const rows = await runQuery('SELECT * FROM goals ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { name, target, saved, description, priority, color } = req.body;
    if (!name || !target || typeof saved === 'undefined') {
      return res.status(400).json({ error: 'Faltan campos requeridos para la meta.' });
    }
    await runExec('INSERT INTO goals (name, target, saved, description, priority, color) VALUES (?, ?, ?, ?, ?, ?)', [
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
    const { id } = req.params;
    const { name, target, saved, description, priority, color } = req.body;
    if (!name || !target || typeof saved === 'undefined') {
      return res.status(400).json({ error: 'Faltan campos requeridos para la meta.' });
    }
    await runExec('UPDATE goals SET name = ?, target = ?, saved = ?, description = ?, priority = ?, color = ? WHERE id = ?', [
      name,
      target,
      saved,
      description || '',
      priority || 'Medium',
      color || '#8b6ca6',
      id
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    await runExec('DELETE FROM goals WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/calendar', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const rows = await runQuery("SELECT * FROM transactions WHERE strftime('%Y-%m', date) = ? ORDER BY date ASC", [month]);
    const calendar = {};
    rows.forEach(row => {
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
    const transactions = await runQuery('SELECT * FROM transactions ORDER BY date DESC');
    const goals = await runQuery('SELECT * FROM goals ORDER BY id ASC');
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
