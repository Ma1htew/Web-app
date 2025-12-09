let appointments = [];

// Загружаем данные с сервера
async function loadData() {
  const res = await fetch("/api/appointments");
  appointments = await res.json();
  applyFilters();
}

// Фильтрация + сортировка + поиск
function applyFilters() {
  let filtered = [...appointments];

  // Поиск по имени
  const search = document.getElementById("search").value.toLowerCase();
  filtered = filtered.filter(a => a.name.toLowerCase().includes(search));

  // Фильтр по статусу
  const status = document.getElementById("statusFilter").value;
  if (status !== "all") {
    filtered = filtered.filter(a => a.status === status);
  }

  // Сортировка по дате
  const sort = document.getElementById("sortDate").value;
  
  filtered.sort((a, b) => {
    const da = new Date(a.date + " " + a.time);
    const db = new Date(b.date + " " + b.time);
    return sort === "newest" ? db - da : da - db;
  });

  renderTable(filtered);
}

// Вывод таблицы
function renderTable(rows) {
  const table = document.getElementById("appointmentsTable");
  table.innerHTML = "";

  rows.forEach(r => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.name}</td>
      <td>${r.phone}</td>
      <td>${r.car}</td>
      <td>${r.service}</td>
      <td>${r.date} ${r.time}</td>
      <td><span class="status ${r.status}">${r.status}</span></td>
      <td>
        <button class="btn btn-take"   onclick="updateStatus(${r.id}, 'taken')">Взять</button>
        <button class="btn btn-deny"   onclick="updateStatus(${r.id}, 'denied')">Отказать</button>
        <button class="btn btn-done"   onclick="updateStatus(${r.id}, 'done')">Готово</button>
      </td>
    `;

    table.appendChild(tr);
  });
}

// Обновление статуса на сервере
async function updateStatus(id, status) {
  await fetch("/api/update-status", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}&status=${status}`
  });

  loadData();
}

// Обработчики UI
document.getElementById("search").oninput = applyFilters;
document.getElementById("statusFilter").onchange = applyFilters;
document.getElementById("sortDate").onchange = applyFilters;

// Автообновление каждые 3 секунды
setInterval(loadData, 3000);

// Первый запуск
loadData();
