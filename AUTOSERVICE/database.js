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

  // 2. Таблица записей
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
      review_text TEXT,
      rating INTEGER,
      review_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 3. Совместимость со старыми базами: добавляем user_id, если его нет
  db.run(`ALTER TABLE appointments ADD COLUMN user_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления столбца user_id:', err.message);
    } else if (!err || err.message.includes('duplicate column name')) {
      console.log('Столбец user_id проверен/добавлен');
    }
  });

  // 4. Добавляем поля для отзывов (безопасно)
  const addColumn = (columnSql, columnName) => {
    db.run(columnSql, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`Ошибка добавления столбца ${columnName}:`, err.message);
      } else if (!err || err.message.includes('duplicate column name')) {
        console.log(`Столбец ${columnName} проверен/добавлен`);
      }
    });
  };

  addColumn(`ALTER TABLE appointments ADD COLUMN review_text TEXT`, 'review_text');
  addColumn(`ALTER TABLE appointments ADD COLUMN rating INTEGER`, 'rating');
  addColumn(`ALTER TABLE appointments ADD COLUMN review_date TEXT`, 'review_date');

  // 5. Таблица автомобилей
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