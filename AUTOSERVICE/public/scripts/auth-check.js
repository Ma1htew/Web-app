// scripts/auth-check.js — АСИНХРОННАЯ ПРОВЕРКА ЧЕРЕЗ СЕРВЕР
(async () => {
  const link = document.getElementById('cabinet-link');
  if (!link) return;

  try {
    const response = await fetch('/api/check-auth', { credentials: 'include' });
    const data = await response.json();

    if (data.authorized) {
      link.href = 'cabinet.html';
      link.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
      link.setAttribute('aria-label', 'Личный кабинет');

      // На странице cabinet.html — иконка "Выход"
      if (window.location.pathname.includes('cabinet.html')) {
        link.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 3h4v2h-4V6zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z"/>
          </svg>`;
        link.title = 'Выйти';
        link.setAttribute('aria-label', 'Выйти');
      }
    } else {
      link.href = 'auth.html';
      link.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>`;
      link.setAttribute('aria-label', 'Вход');
    }
  } catch (err) {
    console.error('Ошибка проверки авторизации:', err);
    // Фоллбэк — не авторизован
    link.href = 'auth.html';
    link.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
        <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
      </svg>`;
  }
})();