// auth.js — логика вкладок Вход / Регистрация

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".auth-tab");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Снять выделение
      tabs.forEach(t => t.classList.remove("active"));

      // Назначить активный таб
      tab.classList.add("active");

      // Переключатель форм
      const target = tab.dataset.tab;

      if (target === "login") {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
      } else {
        registerForm.classList.add("active");
        loginForm.classList.remove("active");
      }
    });
  });
});
