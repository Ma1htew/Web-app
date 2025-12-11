document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) return form.reportValidity();

    const button = form.querySelector('button[type="submit"]');
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Отправляем...";

    const formData = new FormData(form);
    
    // Важно: car всегда строка!
    let carValue = formData.get("car");
    if (carValue && carValue.includes("{") && carValue.includes("}")) {
      // Это был JSON-объект — превращаем в строку
      try {
        const obj = JSON.parse(carValue);
        carValue = `${obj.brand} ${obj.model} (${obj.year})`;
      } catch(e) {}
    }
    formData.set("car", carValue.trim() || "Не указано");

    const params = new URLSearchParams(formData);

    try {
      const res = await fetch("/booking", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });

      if (res.ok) {
        alert("Вы успешно записаны!");
        form.reset();
        // Можно обновить список авто в кабинете, если открыт
      } else {
        alert("Ошибка записи");
      }
    } catch (err) {
      alert("Нет связи с сервером");
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });
});