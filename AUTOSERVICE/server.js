// server.js — Node.js сервер с маршрутизацией и обработкой форм

const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const PORT = 3000;
const publicDir = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Главная страница
  if (req.url === '/' || req.url === '/index' || req.url === '/auto.html') {
    return serveFile(path.join(publicDir, 'auto.html'), 'text/html', res);
  }

  // Страница авторизации
  if (req.url === '/auth' || req.url === '/auth.html') {
    return serveFile(path.join(publicDir, 'auth.html'), 'text/html', res);
  }

  // Статические файлы
  if (req.url.startsWith('/styles/')) {
    return serveFile(path.join(publicDir, req.url), 'text/css', res);
  }
  if (req.url.startsWith('/scripts/')) {
    return serveFile(path.join(publicDir, req.url), 'application/javascript', res);
  }

  // Обработка форм
  if (req.url === '/register' && req.method === 'POST') {
    return handleForm(req, res, 'Регистрация успешно получена');
  }
  if (req.url === '/login' && req.method === 'POST') {
    return handleForm(req, res, 'Авторизация успешна');
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Страница не найдена');
});

function serveFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Ошибка сервера');
    } else {
      res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
      res.end(content);
    }
  });
}

function handleForm(req, res, message) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    const data = querystring.parse(body);
    console.log('Полученные данные:', data);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html lang="ru">
        <head><meta charset="UTF-8"><title>${message}</title></head>
        <body style="font-family:Arial; padding:40px;">
          <h2>${message}</h2>
          <pre>${JSON.stringify(data, null, 2)}</pre>
          <a href="/">На главную</a>
        </body>
      </html>
    `);
  });
}

server.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
