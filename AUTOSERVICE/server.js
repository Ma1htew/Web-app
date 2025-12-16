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
    return checkAuth(req, res);
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

  // ---------- НОВЫЙ РОУТ: Получить пользователя по ID ----------
  if (req.url.startsWith("/api/user") && req.method === "GET") {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const userId = url.searchParams.get("id");

    if (!userId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "No user ID" }));
    }

    db.get("SELECT id, name, email FROM users WHERE id = ?", [userId], (err, user) => {
      if (err || !user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "User not found" }));
      }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(user));
    });
    return;
  }
  // === API: Получить авто пользователя ===
if (req.url.startsWith("/api/cars") && req.method === "GET") {
  const userId = new URL(req.url, `http://localhost:${PORT}`).searchParams.get("user_id");
  if (!userId) return res.end(JSON.stringify([]));
  db.all("SELECT id, brand, model, year FROM cars WHERE user_id = ?", [userId], (err, rows) => {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(rows || []));
  });
  return;
}

// ---------- API: Добавить/обновить отзыв ----------
if (req.url === "/api/review" && req.method === "POST") {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    const parsed = querystring.parse(body);
    const id = parsed.id;
    const text = (parsed.text || "").trim();
    const rating = parseInt(parsed.rating);

    const cookie = req.headers.cookie || "";
    const userIdMatch = cookie.match(/user=(\d+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    // Валидация
    if (!userId || !id || !text || isNaN(rating) || rating < 1 || rating > 5) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ error: "Некорректные данные" }));
    }

    // Проверяем владение заказом и статус
    db.get(
      "SELECT id FROM appointments WHERE id = ? AND user_id = ? AND status IN ('ready', 'completed')",
      [id, userId],
      (err, appt) => {
        if (err || !appt) {
          res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify({ error: "Доступ запрещён или заказ не завершён" }));
        }

        const reviewDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        db.run(
          "UPDATE appointments SET review_text = ?, rating = ?, review_date = ? WHERE id = ?",
          [text, rating, reviewDate, id],
          function (err) {
            if (err) {
              console.error("Ошибка сохранения отзыва:", err);
              res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
              return res.end(JSON.stringify({ error: "Ошибка сервера" }));
            }
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({ success: true }));
          }
        );
      }
    );
  });
  return;
}

// ---------- API: Получить последние отзывы (для главной страницы) ----------
if (req.url.startsWith("/api/reviews") && req.method === "GET") {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const limit = parseInt(url.searchParams.get("limit")) || 9; // По умолчанию 9

  db.all(
    `
    SELECT 
      a.review_text, 
      a.rating, 
      a.review_date, 
      u.name 
    FROM appointments a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.review_text IS NOT NULL 
      AND a.review_text != '' 
      AND a.rating IS NOT NULL
    ORDER BY a.review_date DESC 
    LIMIT ?
    `,
    [limit],
    (err, rows) => {
      if (err) {
        console.error("Ошибка загрузки отзывов:", err);
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ error: "Database error" }));
      }

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(rows || []));
    }
  );
  return;
}

// === API: Добавить авто ===
if (req.url === "/api/car" && req.method === "POST") {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    const cookie = req.headers.cookie || "";
    const userId = cookie.match(/user=(\d+)/)?.[1];
    if (!userId) return res.writeHead(401).end();

    const { brand, model, year } = querystring.parse(body);
    db.run("INSERT INTO cars (user_id, brand, model, year) VALUES (?, ?, ?, ?)", 
      [userId, brand, model, year], function() {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, id: this.lastID }));
    });
  });
  return;
}

// === API: Удалить авто ===
if (req.method === "DELETE" && req.url.match(/^\/api\/car\/\d+$/)) {
  const carId = req.url.split("/").pop();
  const userId = (req.headers.cookie || "").match(/user=(\d+)/)?.[1];
  if (!userId) return res.writeHead(401).end();

  db.run("DELETE FROM cars WHERE id = ? AND user_id = ?", [carId, userId], function() {
    res.writeHead(this.changes ? 200 : 403);
    res.end();
  });
  return;
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
    res.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` });
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

    // Простая валидация (можно расширить)
    if (!name || !email || !password) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(`<h2>Заполните все поля</h2><a href="/auth.html">Назад</a>`);
    }

    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, password], function (err) {
      if (err) {
        // Обычно это ошибка уникальности email
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(`<h2>Ошибка: email уже используется</h2><a href="/auth.html">Назад</a>`);
      }

      // Успешная регистрация
      const userId = this.lastID; // ID только что созданного пользователя

      // Устанавливаем cookie и сразу редиректим на главную страницу
      res.writeHead(302, {
        "Set-Cookie": `user=${this.lastID}; Path=/; Max-Age=86400; SameSite=Lax`,
        "Location": "/auto.html"   // ← сюда пользователь попадёт сразу после регистрации
      });
      res.end();
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
        return res.end(`<h2>Неверный email или пароль</h2><a href="/auth.html">Попробовать снова</a>`);
      }
      res.writeHead(302, {
        "Set-Cookie": [
          `user=${user.id}; Path=/; Max-Age=86400; SameSite=Lax`
        ],
        "Location": "/cabinet.html",
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

    // Теперь поле называется dateTime (из input datetime-local)
    let date = "";
    let time = "";

    if (data.dateTime && data.dateTime.includes("T")) {
      [date, time] = data.dateTime.split("T");
      time = time.slice(0, 5); // обрезаем секунды и таймзону
    } else if (data.date) {
      // старый вариант — если вдруг остался
      [date, time] = data.date.split("T");
    }

    // Получаем user_id из cookie
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/user=(\d+)/);
    const userId = match ? match[1] : null;

    let carString = data.car || "";

// Если пришёл объект из формы (авторизованный пользователь выбрал авто)
if (typeof carString === 'object' && carString !== null) {
  // Пример: {"brand":"Toyota","model":"Camry","year":"2023"}
  carString = `${data.car.brand} ${data.car.model} (${data.car.year})`.trim();
}
// Если просто строка — оставляем как есть
else if (typeof carString === 'string') {
  carString = carString.trim();
}

const sql = `
  INSERT INTO appointments (user_id, name, phone, car, service, date, time, comment, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
`;

    db.run(
      sql,
      [
        userId || null,
        data.name || "",
        data.phone || "",
        carString || "",
        data.service || "",
        date,
        time,
        data.comment || ""
      ],
      function (err) {
        if (err) {
          console.error("Ошибка записи в БД:", err);
          res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
          return res.end(`<h2>Ошибка записи</h2><a href="/auto.html">Назад</a>`);
        }

        // После успешной записи — сразу в кабинет!
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(`
          <h2 style="text-align:center; margin-top: 50px;">Вы успешно записаны!</h2>
          <p style="text-align:center;">
            <a href="/cabinet.html" style="color:#e11d48; font-weight:600;">Перейти в личный кабинет →</a>
          </p>
          <script>
            setTimeout(() => location.href = "/cabinet.html", 2000);
          </script>
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
    db.run(`UPDATE appointments SET status = ? WHERE id = ?`, [status, id], () => {
      res.writeHead(200);
      res.end("OK");
    });
  });
}

// ==============================
// Запуск сервера
// ==============================
server.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));