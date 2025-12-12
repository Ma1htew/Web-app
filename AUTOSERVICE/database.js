const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'db', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
    return;
  }
  console.log('Подключение к SQLite успешно');
});

// Все операции с таблицами выполняем последовательно
db.serialize(() => {
  // 1. Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'client'
    )
  `);

  // 2. Таблица записей (сразу создаём с полем user_id)
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      phone TEXT,
      car TEXT,
      service TEXT,
      date TEXT,
      time TEXT,
      comment TEXT,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 3. Если в старой базе уже была таблица appointments без user_id — добавляем его
  // (ошибка "duplicate column name" игнорируется)
  db.run(`
    ALTER TABLE appointments ADD COLUMN user_id INTEGER
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления столбца user_id:', err.message);
    } else {
      console.log('Столбец user_id проверен/добавлен');
    }
  });

  // 4. Таблица автомобилей
  db.run(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Все таблицы созданы/обновлены');
});

module.exports = db;