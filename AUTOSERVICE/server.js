const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const db = require('./database'); // подключаем SQLite

const PORT = 3000;
const publicDir = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // ========== Главная страница ==========
  if (req.url === '/' || req.url === '/index' || req.url === '/auto.html') {
    return serveFile('auto.html', 'text/html', res);
  }

  // ========== Страница авторизации ==========
  if (req.url === '/auth' || req.url === '/auth.html') {
    return serveFile('auth.html', 'text/html', res);
  }

  // ========== Страница работника ==========
  if (req.url === '/worker') {
    return serveFile('worker.html', 'text/html', res);
  }

  // ========== Статические файлы ==========
  if (req.url.startsWith('/styles/')) {
    return serveFile(req.url, 'text/css', res);
  }
  if (req.url.startsWith('/scripts/')) {
    return serveFile(req.url, 'application/javascript', res);
  }

  // ========== РЕГИСТРАЦИЯ ==========
  if (req.url === '/register' && req.method === 'POST') {
    return handleRegister(req, res);
  }

  // ========== АВТОРИЗАЦИЯ ==========
  if (req.url === '/login' && req.method === 'POST') {
    return handleLogin(req, res);
  }

  // ========== 404 ==========
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Страница не найдена');
});

// ----------------------------------------------------------------------
// СТАТИКА
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// РЕГИСТРАЦИЯ
// ----------------------------------------------------------------------
function handleRegister(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const { name, email, password } = querystring.parse(body);

    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, password], function (err) {
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

// ----------------------------------------------------------------------
// АВТОРИЗАЦИЯ
// ----------------------------------------------------------------------
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

      // Если это работник
      if (user.role === 'worker') {
        res.writeHead(302, { Location: '/worker' });
        return res.end();
      }

      // Если обычный клиент
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  });
}

server.listen(PORT, () =>
  console.log(`Сервер запущен: http://localhost:${PORT}`)
);
