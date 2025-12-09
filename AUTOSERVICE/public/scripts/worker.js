async function loadAppointments() {
    const response = await fetch("/api/appointments");
    const appointments = await response.json();

    renderCards(appointments);
}

function renderCards(list) {
    const container = document.getElementById("appointmentsList");
    container.innerHTML = "";

    list.forEach(item => {
        const card = document.createElement("div");
        card.className = "appointment-card";

        card.innerHTML = `
            <div class="card-header">
                <div class="card-name">${item.name}</div>
                <div class="status ${item.status}">
                    ${item.status === "pending" ? "В ожидании" :
                       item.status === "approved" ? "В работе" :
                       "Отказано"}
                </div>
            </div>

            <div class="card-row"><b>Телефон:</b> ${item.phone}</div>
            <div class="card-row"><b>Авто:</b> ${item.car}</div>
            <div class="card-row"><b>Услуга:</b> ${item.service}</div>
            <div class="card-row"><b>Дата:</b> ${item.date} ${item.time}</div>

            <div class="card-row"><b>Комментарий:</b> ${item.comment || "—"}</div>

            <div class="card-actions">
                <button class="btn btn--primary" onclick="setStatus(${item.id}, 'approved')">Взять в работу</button>
                <button class="btn btn--ghost" onclick="setStatus(${item.id}, 'rejected')">Отказать</button>
            </div>
        `;

        container.appendChild(card);
    });
}

async function setStatus(id, status) {
    await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
    });

    loadAppointments(); // автообновление
}

setInterval(loadAppointments, 3000); // автообновление каждые 3 сек
loadAppointments();
