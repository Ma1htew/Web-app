// public/scripts/worker.js — РАБОЧАЯ ВЕРСИЯ
let allAppointments = [];

async function loadAppointments() {
  try {
    const response = await fetch("/api/appointments");
    allAppointments = await response.json();
    renderCards(allAppointments);
  } catch (err) {
    console.error("Ошибка загрузки записей:", err);
  }
}

function renderCards(list) {
  const container = document.getElementById("appointmentsList");
  container.innerHTML = list.length === 0 
    ? '<p style="text-align:center; color:#888; padding:40px;">Нет записей</p>'
    : "";

  list.forEach(item => {
    const statusInfo = {
      pending: { text: "В ожидании", class: "status--waiting" },
      "in-progress": { text: "В работе", class: "status--in-progress" },
      ready: { text: "Готово к выдаче", class: "status--ready" },
      completed: { text: "Выполнено", class: "status--completed" }
    }[item.status] || { text: "В ожидании", class: "status--waiting" };

    const card = document.createElement("div");
    card.className = "appointment-card";
    card.innerHTML = `
      <div class="card-header">
        <div class="card-name">${item.name || "Без имени"}</div>
        <div class="status ${statusInfo.class}">${statusInfo.text}</div>
      </div>
      <div class="card-row"><b>Телефон:</b> ${item.phone || "—"}</div>
      <div class="card-row"><b>Авто:</b> ${item.car || "—"}</div>
      <div class="card-row"><b>Услуга:</b> ${item.service || "—"}</div>
      <div class="card-row"><b>Дата и время:</b> ${item.date || ""} ${item.time || ""}</div>
      ${item.comment ? `<div class="card-row"><b>Комментарий:</b> ${item.comment}</div>` : ""}

      <div class="card-actions" style="margin-top:15px; gap:10px; display:flex; flex-wrap:wrap;">
        ${item.status === "pending" ? `
          <button class="btn btn--primary" onclick="setStatus(${item.id}, 'in-progress')">
            Взять в работу
          </button>
          <button class="btn btn--ghost" onclick="setStatus(${item.id}, 'rejected')">
            Отказать
          </button>
        ` : item.status === "in-progress" ? `
          <button class="btn btn--primary" onclick="setStatus(${item.id}, 'ready')">
            Готово к выдаче
          </button>
        ` : item.status === "ready" ? `
          <button class="btn btn--success" onclick="setStatus(${item.id}, 'completed')">
            Выдано
          </button>
        ` : `<span style="color:#888; font-style:italic;">Действие завершено</span>`}
      </div>
    `;
    container.appendChild(card);
  });
}

// Правильная отправка данных (как ожидает твой сервер!)
async function setStatus(id, status) {
  const formData = new URLSearchParams();
  formData.append("id", id);
  formData.append("status", status);

  try {
    await fetch("/api/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });
    loadAppointments(); // обновляем список
  } catch (err) {
    alert("Ошибка обновления статуса");
  }
}

// Фильтры и поиск
document.getElementById("searchName")?.addEventListener("input", filterAppointments);
document.getElementById("filterStatus")?.addEventListener("change", filterAppointments);
document.getElementById("sortDate")?.addEventListener("change", filterAppointments);

function filterAppointments() {
  let filtered = [...allAppointments];

  // Поиск по имени
  const search = document.getElementById("searchName").value.toLowerCase();
  if (search) {
    filtered = filtered.filter(a => 
      (a.name && a.name.toLowerCase().includes(search)) ||
      (a.phone && a.phone.includes(search))
    );
  }

  // Фильтр по статусу
  const statusFilter = document.getElementById("filterStatus").value;
  if (statusFilter !== "all") {
    filtered = filtered.filter(a => a.status === statusFilter);
  }

  // Сортировка
  const sort = document.getElementById("sortDate").value;
  filtered.sort((a, b) => {
    const dateA = new Date(a.date + " " + a.time);
    const dateB = new Date(b.date + " " + b.time);
    return sort === "new" ? dateB - dateA : dateA - dateB;
  });

  renderCards(filtered);
}

// Автообновление каждые 5 сек + начальная загрузка
loadAppointments();
setInterval(loadAppointments, 5000);