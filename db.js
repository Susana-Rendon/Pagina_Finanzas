const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  }
});

const initSql = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL,
  description TEXT,
  priority TEXT,
  color TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fixed_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  due_day INTEGER NOT NULL,
  category TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  billing_day INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`;

function ensureColumnExists(table, column, definition, callback) {
  db.all(`PRAGMA table_info(${table})`, (err, rows) => {
    if (err) {
      return callback(err);
    }
    const exists = rows.some((row) => row.name === column);
    if (exists) {
      return callback(null);
    }
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, callback);
  });
}

function runInit() {
  db.serialize(() => {
    db.exec(initSql, (err) => {
      if (err) {
        console.error('Error inicializando tablas:', err.message);
      }
    });

    const migrations = [
      { table: 'transactions', column: 'user_id', definition: 'INTEGER DEFAULT 0' },
      { table: 'savings_goals', column: 'user_id', definition: 'INTEGER DEFAULT 0' },
      { table: 'fixed_expenses', column: 'user_id', definition: 'INTEGER DEFAULT 0' },
      { table: 'subscriptions', column: 'user_id', definition: 'INTEGER DEFAULT 0' }
    ];

    migrations.forEach((migration) => {
      ensureColumnExists(migration.table, migration.column, migration.definition, (err) => {
        if (err) {
          console.error(`Error agregando columna ${migration.column} a la tabla ${migration.table}:`, err.message);
        }
      });
    });
  });
}

runInit();

module.exports = db;
