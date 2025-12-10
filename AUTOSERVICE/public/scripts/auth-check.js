// scripts/auth-check.js
document.addEventListener('DOMContentLoaded', () => {
  const cabinetLink = document.querySelector('a[aria-label="Личный кабинет"]');
  if (!cabinetLink) return;

  // КЛЮЧЕВОЙ МОМЕНТ: строгое сравнение с "true" как строкой
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  console.log('%c[Auth Check] Пользователь авторизован?', 'color: #4ade80; font-weight: bold;', isLoggedIn);
  // Открой консоль (F12) — увидишь, правда ли залогинен

  if (isLoggedIn) {
    // АВТОРИЗОВАН → ведём в кабинет
    cabinetLink.href = 'cabinet.html';
    cabinetLink.title = 'Личный кабинет';

    // Меняем иконку на "залогиненного" человечка с зелёной точкой
    cabinetLink.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        <circle cx="17" cy="9" r="3" fill="#4ade80"/>
      </svg>`;
  } else {
    // НЕ АВТОРИЗОВАН → ведём на вход
    cabinetLink.href = 'auth.html';
    cabinetLink.title = 'Войти или зарегистрироваться';

    // Возвращаем оригинальную иконку (твоя текущая)
    cabinetLink.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24">
        <path d="M6,5c0-2.206,1.794-4,4-4s4,1.794,4,4-1.794,4-4,4-4-1.794-4-4Zm1.398,6c-1.538,0-2.957,.898-3.615,2.288L.096,21.072l1.808,.855,3.096-6.536v8.608H14V11H7.398Zm16.602-2h-2c0,2.731-1.802,3.595-3,3.87V0h-2V1h-1V3h1v6h-1v8h1v7h4v-1.5l-1.277-5.5h4.277v-2h-5c2.1-.418,5-2.084,5-6Z"/>
      </svg>`;
  }
});