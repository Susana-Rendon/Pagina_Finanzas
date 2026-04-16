const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  }
});

const initSql = `
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target REAL NOT NULL,
  saved REAL NOT NULL,
  description TEXT,
  priority TEXT,
  color TEXT
);
`;

function runInit() {
  db.exec(initSql, (err) => {
    if (err) {
      console.error('Error inicializando tablas:', err.message);
      return;
    }

    db.get('SELECT COUNT(*) AS count FROM transactions', (err, row) => {
      if (!err && row.count === 0) {
        const insertTx = db.prepare('INSERT INTO transactions (description, category, amount, type, date, note) VALUES (?, ?, ?, ?, ?, ?)');
        const seedTx = [
          ['Artisan Bakery & Cafe', 'Habits', -12.5, 'expense', '2024-11-04', 'Desayuno'],
          ['Monthly Retainer - Design', 'Income', 2450, 'income', '2024-11-03', 'Cliente recurrente'],
          ['City Penthouse Rent', 'Fixed Expenses', -1800, 'expense', '2024-11-01', 'Alquiler mensual'],
          ['Emergency Fund Deposit', 'Savings', -500, 'saving', '2024-11-05', 'Ahorro mensual']
        ];
        seedTx.forEach((item) => insertTx.run(item));
        insertTx.finalize();
      }
    });

    db.get('SELECT COUNT(*) AS count FROM goals', (err, row) => {
      if (!err && row.count === 0) {
        const insertGoal = db.prepare('INSERT INTO goals (name, target, saved, description, priority, color) VALUES (?, ?, ?, ?, ?, ?)');
        const seedGoals = [
          ['New Car', 35000, 22750, 'The Obsidian Sport Sedan', 'High', '#8c5a6e'],
          ['Vacation', 5000, 1600, 'Amalfi Coast Retreat', 'Medium', '#7f6db8'],
          ['Emergency Fund', 20000, 17600, '6 Months Stability', 'Priority', '#9b7d5c'],
          ['Modern Sanctuary', 100000, 12000, 'Future Home Deposit', 'Low', '#7a6877']
        ];
        seedGoals.forEach((item) => insertGoal.run(item));
        insertGoal.finalize();
      }
    });
  });
}

runInit();

module.exports = db;
