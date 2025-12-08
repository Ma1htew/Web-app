document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("booking-form");

  form.addEventListener("submit", () => {
    alert("Заявка отправлена! Мы свяжемся с вами.");
  });
});
