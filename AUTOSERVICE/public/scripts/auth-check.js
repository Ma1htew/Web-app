// auth-check.js — РАБОТАЕТ ТОЛЬКО С COOKIE
(() => {
  const link = document.getElementById('cabinet-link');
  if (!link) return;

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const userId = getCookie('user');

  if (userId) {
    // Залогинен — показываем иконку профиля
    link.href = 'cabinet.html';
    link.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>`;
    
    // Если мы уже на cabinet.html — меняем на кнопку "Выход"
    if (window.location.pathname.includes('cabinet.html')) {
      link.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 3h4v2h-4V6zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z"/>
        </svg>`;
      link.title = "Выйти";
      link.setAttribute('aria-label', 'Выйти');
    }
  } else {
    // Не залогинен — иконка входа
    link.href = 'auth.html';
    link.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>`;
  }
})();