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
