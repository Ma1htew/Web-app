document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");

  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      console.warn("Форма НЕ прошла валидацию");

      for (const field of form.elements) {
        if (!field.validity.valid) {
          console.warn("Неверное поле:", field.name, field.validationMessage);
        }
      }
      return;
    }

    // отправка идет
    console.log("Форма отправлена");
  });
});
