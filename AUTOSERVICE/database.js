// database.js — подключение к базе и создание таблиц
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к файлу БД
const dbPath = path.join(__dirname, 'db', 'database.db');

// Подключаемся к БД
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных', err);
  } else {
    console.log('Подключение к SQLite успешно');
  }
});

// Создаем таблицу пользователей, если её нет
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'client'
  )
`);

module.exports = db;

// Таблица записей клиентов
db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    car TEXT,
    service TEXT,
    date TEXT,
    time TEXT,
    comment TEXT,
    status TEXT DEFAULT 'pending'
  )
`);
// Добавляем поле user_id в таблицу appointments (если его ещё нет)
db.run(`
  ALTER TABLE appointments ADD COLUMN user_id INTEGER
`, (err) => {
  if (err && !err.message.includes("duplicate column name")) {
    console.error("Ошибка добавления user_id:", err);
  } else {
    console.log("Поле user_id добавлено (или уже существует)");
  }
});

// Таблица автомобилей пользователя
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


