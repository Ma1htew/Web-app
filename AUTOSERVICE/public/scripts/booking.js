// public/scripts/booking.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Отправляем...";

    // Собираем данные в формате x-www-form-urlencoded
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      params.append(key, value);
    }

    try {
      const response = await fetch("/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params // ← вот здесь теперь правильный формат
      });

      if (response.ok) {
        alert("Вы успешно записаны! Мы свяжемся с вами скоро.");
        form.reset();
      } else {
        alert("Ошибка сервера. Попробуйте позже.");
      }
    } catch (err) {
      console.error(err);
      alert("Нет связи с сервером. Позвоните нам пожалуйста.");
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });
});