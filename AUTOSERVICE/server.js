// ==============================
// Импорт модулей
// ==============================
const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const db = require('./database'); // Подключение SQLite

const PORT = 3000;
const publicDir = path.join(__dirname, 'public');


// ==============================
// Создание сервера
// ==============================
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // ---------- Главная ----------
  if (req.url === '/' || req.url === '/index' || req.url === '/auto.html') {
    return serveFile('auto.html', 'text/html', res);
  }

  // ---------- Авторизация ----------
  if (req.url === '/auth' || req.url === '/auth.html') {
    return serveFile('auth.html', 'text/html', res);
  }

  // ---------- Страница работника ----------
  if (req.url === '/worker') {
    return serveFile('worker.html', 'text/html', res);
  }

  // ---------- Статика ----------
  if (req.url.startsWith('/styles/')) {
    return serveFile(req.url, 'text/css', res);
  }

  if (req.url.startsWith('/scripts/')) {
    return serveFile(req.url, 'application/javascript', res);
  }

  // ---------- Регистрация ----------
  if (req.url === '/register' && req.method === 'POST') {
    return handleRegister(req, res);
  }

  // ---------- Логин ----------
  if (req.url === '/login' && req.method === 'POST') {
    return handleLogin(req, res);
  }

  // ---------- Запись клиента ----------
  if (req.url === '/booking' && req.method === 'POST') {
    return handleBooking(req, res);
  }

  // ---------- 404 ----------
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Страница не найдена');
});


// ==============================
// Выдача статических файлов
// ==============================
function serveFile(relPath, contentType, res) {
  const filePath = path.join(publicDir, relPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Файл не найден');
    }

    res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
    res.end(content);
  });
}


// ==============================
// Регистрация пользователя
// ==============================
function handleRegister(req, res) {
  let body = '';

  req.on('data', chunk => body += chunk);

  req.on('end', () => {
    const { name, email, password } = querystring.parse(body);

    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

    db.run(sql, [name, email, password], function(err) {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
          <h2>Ошибка регистрации: email уже используется</h2>
          <a href="/auth">Назад</a>
        `);
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h2>Регистрация успешна!</h2>
        <p>Теперь вы можете войти</p>
        <a href="/auth">Перейти к входу</a>
      `);
    });
  });
}


// ==============================
// Авторизация пользователя
// ==============================
function handleLogin(req, res) {
  let body = '';

  req.on('data', chunk => body += chunk);

  req.on('end', () => {
    const { email, password } = querystring.parse(body);

    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;

    db.get(sql, [email, password], (err, user) => {
      if (err || !user) {
        res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
          <h2>Неверный email или пароль</h2>
          <a href="/auth">Попробовать снова</a>
        `);
      }

      // Если работник
      if (user.role === 'worker') {
        res.writeHead(302, { Location: '/worker' });
        return res.end();
      }

      // Клиент → главная
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  });
}


// ==============================
// Обработка записи клиента
// ==============================
function handleBooking(req, res) {
  let body = '';

  req.on('data', chunk => body += chunk);

  req.on('end', () => {

    console.log('RAW FORM DATA:', body); //afsgrdhgfndgs

    const data = querystring.parse(body);

    console.log('PARSED FORM DATA:', data); //dfghgdfsfghn

    // Разделяем datetime на дату и время
    const [date, time] = data.dateTime.split("T");

    const sql = `
      INSERT INTO appointments (name, phone, car, service, date, time, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      data.name,
      data.phone,
      data.car,
      data.service,
      date,
      time,
      data.comment
    ], (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
          <h2>Ошибка: запись не сохранена</h2>
          <a href="/">Назад</a>
        `);
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h2>Вы успешно записаны!</h2>
        <p>Наш специалист скоро свяжется с вами.</p>
        <a href="/">Вернуться на главную</a>
      `);
    });
  });
}


// ==============================
// Запуск сервера
// ==============================
server.listen(PORT, () =>
  console.log(`Сервер запущен: http://localhost:${PORT}`)
);
