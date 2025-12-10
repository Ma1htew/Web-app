// ==============================
// Импорт модулей
// ==============================
const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const db = require("./database"); // SQLite

const PORT = 3000;
const publicDir = path.join(__dirname, "public");

// ==============================
// Создание сервера
// ==============================
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // ---------- Главная ----------
  if (req.url === "/" || req.url === "/auto.html" || req.url === "/index") {
    return serveFile("auto.html", "text/html", res);
  }

  // ---------- Auth ----------
  if (req.url === "/auth" || req.url === "/auth.html") {
    return serveFile("auth.html", "text/html", res);
  }

  // ---------- Личный кабинет ----------
  if (req.url === "/cabinet" || req.url === "/cabinet.html") {
    return serveFile("cabinet.html", "text/html", res);
  }

  // ---------- Worker ----------
  if (req.url === "/worker" || req.url === "/worker.html") {
    return serveFile("worker.html", "text/html", res);
  }

  // ---------- Статика ----------
  if (req.url.startsWith("/styles/")) {
    return serveFile(req.url, "text/css", res);
  }

  if (req.url.startsWith("/scripts/")) {
    return serveFile(req.url, "application/javascript", res);
  }

  // ---------- API: Проверка авторизации ----------
  if (req.url === "/api/check-auth" && req.method === "GET") {
    return checkAuth(req, res); // FIX: добавлено условие метода
  }

  // ---------- Регистрация ----------
  if (req.url === "/register" && req.method === "POST") {
    return handleRegister(req, res);
  }

  // ---------- Авторизация ----------
  if (req.url === "/login" && req.method === "POST") {
    return handleLogin(req, res);
  }

  // ---------- Запись клиента ----------
  if (req.url === "/booking" && req.method === "POST") {
    return handleBooking(req, res);
  }

  // ---------- API: Получить все записи ----------
  if (req.url === "/api/appointments" && req.method === "GET") {
    return loadAppointments(req, res);
  }

  // ---------- API: обновить статус ----------
  if (req.url === "/api/update-status" && req.method === "POST") {
    return updateStatus(req, res);
  }

  // ---------- 404 ----------
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Страница не найдена");
});

// ==============================
// Static Files
// ==============================
function serveFile(relPath, contentType, res) {
  const filePath = path.join(publicDir, relPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end("Файл не найден");
    }

    res.writeHead(200, {
      "Content-Type": `${contentType}; charset=utf-8`,
    });
    res.end(content);
  });
}

// ==============================
// Регистрация
// ==============================
function handleRegister(req, res) {
  let body = "";

  req.on("data", (chunk) => (body += chunk));

  req.on("end", () => {
    const { name, email, password } = querystring.parse(body);

    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

    db.run(sql, [name, email, password], function (err) {
      if (err) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(`
          <h2>Ошибка регистрации: email уже используется</h2>
          <a href="/auth">Назад</a>
        `);
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`
        <h2>Регистрация успешна!</h2>
        <a href="/auth">Перейти к входу</a>
      `);
    });
  });
}

// ==============================
// Авторизация
// ==============================
function handleLogin(req, res) {
  let body = "";

  req.on("data", (chunk) => (body += chunk));

  req.on("end", () => {
    const { email, password } = querystring.parse(body);

    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;

    db.get(sql, [email, password], (err, user) => {
      if (err || !user) {
        res.writeHead(401, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(`
          <h2>Неверный email или пароль</h2>
          <a href="/auth">Попробовать снова</a>
        `);
      }

      // Сохраняем данные пользователя в cookie
      res.writeHead(302, {
        "Set-Cookie": `user=${user.id}; HttpOnly; Path=/; Max-Age=86400`,
        Location: user.role === "worker" ? "/worker.html" : "/cabinet.html",
      });
      res.end();
    });
  });
}

// ==============================
// Проверка авторизации (cookie)
// ==============================
function checkAuth(req, res) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/user=(\d+)/);

  res.writeHead(200, { "Content-Type": "application/json" });

  if (!match) return res.end(JSON.stringify({ authorized: false }));

  const userId = match[1];

  db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
    if (err || !user) return res.end(JSON.stringify({ authorized: false }));

    res.end(JSON.stringify({ authorized: true }));
  });
}

// ==============================
// Запись клиента
// ==============================
function handleBooking(req, res) {
  let body = "";

  req.on("data", (chunk) => (body += chunk));

  req.on("end", () => {
    const data = querystring.parse(body);
    const [date, time] = data.date.split("T");

    const sql = `
      INSERT INTO appointments (name, phone, car, service, date, time, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [data.name, data.phone, data.car, data.service, date, time, data.comment],
      (err) => {
        if (err) {
          res.writeHead(500, {
            "Content-Type": "text/html; charset=utf-8",
          });
          return res.end(`
            <h2>Ошибка: запись не сохранена</h2>
            <a href="/">Назад</a>
          `);
        }

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
          <h2>Вы успешно записаны!</h2>
          <a href="/">Вернуться на главную</a>
        `);
      }
    );
  });
}

// ==============================
// API: получить все записи
// ==============================
function loadAppointments(req, res) {
  db.all(`SELECT * FROM appointments`, (err, rows) => {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(rows || []));
  });
}

// ==============================
// API: обновить статус
// ==============================
function updateStatus(req, res) {
  let body = "";

  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const { id, status } = querystring.parse(body);

    db.run(
      `UPDATE appointments SET status = ? WHERE id = ?`,
      [status, id],
      () => {
        res.writeHead(200);
        res.end("OK");
      }
    );
  });
}

// ==============================
// Запуск сервера
// ==============================
server.listen(PORT, () =>
  console.log(`Сервер запущен: http://localhost:${PORT}`)
);
