// app.js — базовая валидация формы и уведомления
(function () {
  const form = document.querySelector('#booking form, form#booking-form') || document.querySelector('form');
  if (!form) return;

  // Найдём или создадим элемент статуса
  let status = form.querySelector('#form-status');
  if (!status) {
    status = document.createElement('small');
    status.id = 'form-status';
    status.setAttribute('aria-live', 'polite');
    status.style.marginLeft = '8px';
    const actions = form.querySelector('.form-actions') || form.querySelector('button')?.parentElement || form;
    actions.appendChild(status);
  }

  // Поля
  const fields = {
    service: form.querySelector('#service'),
    car: form.querySelector('#car'),
    date: form.querySelector('#date'),
    phone: form.querySelector('#phone'),
    comment: form.querySelector('#comment'),
  };

  // Проверка номера РБ: +375 XX XXX-XX-XX
const phoneIsValid = (val) => {
  if (!val) return false;
  const digits = val.replace(/\D/g, '');
  // должно быть 12 цифр: 375 + 9 цифр
  if (digits.length !== 12) return false;
  if (!digits.startsWith('375')) return false;

  // проверим код оператора
  const code = digits.slice(3, 5);
  const validCodes = ['25', '29', '33', '44'];
  return validCodes.includes(code);
};


  // Подсветка ошибки
  function setInvalid(el, msg) {
    if (!el) return;
    el.setAttribute('aria-invalid', 'true');
    el.classList.add('is-invalid');
    el.title = msg || 'Проверьте поле';
  }
  function setValid(el) {
    if (!el) return;
    el.removeAttribute('aria-invalid');
    el.classList.remove('is-invalid');
    el.removeAttribute('title');
  }

  // Лёгкая «маска» телефона: оставляем только цифры и форматируем частично
 fields.phone?.addEventListener('input', (e) => {
  const only = e.target.value.replace(/\D/g, '');

  let v = only;
  // автоматически добавляем +375
  if (!v.startsWith('375')) {
    v = '375' + v;
  }

  // форматируем
  let out = '+375';
  if (v.length > 3) out += ' ' + v.slice(3, 5);       // код оператора
  if (v.length > 5) out += ' ' + v.slice(5, 8);       // XXX
  if (v.length > 8) out += '-' + v.slice(8, 10);      // XX
  if (v.length > 10) out += '-' + v.slice(10, 12);    // XX

  e.target.value = out;
});


  // Очистка ошибок по вводу
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('input, select, textarea')) {
      setValid(el);
      status.textContent = '';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;

    // Проверяем обязательные
    if (!fields.service?.value) { setInvalid(fields.service, 'Выберите услугу'); ok = false; }
    if (!fields.car?.value?.trim()) { setInvalid(fields.car, 'Укажите автомобиль'); ok = false; }
    if (!fields.date?.value) { setInvalid(fields.date, 'Выберите дату и время'); ok = false; }
    if (!phoneIsValid(fields.phone?.value)) { setInvalid(fields.phone, 'Введите телефон в формате +7'); ok = false; }

    if (!ok) {
      status.textContent = 'Проверьте заполнение выделенных полей.';
      return;
    }

    // «Отправка»
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn?.setAttribute('disabled', 'true');
    status.textContent = 'Отправляем заявку...';

    // Имитация запроса
    setTimeout(() => {
      // Здесь можно заменить на fetch('/api/booking', {method:'POST', body:new FormData(form)}) ...
      status.textContent = 'Заявка принята! Мы свяжемся с вами для подтверждения.';
      form.reset();
      // Сброс ошибок и кнопки
      Object.values(fields).forEach(setValid);
      submitBtn?.removeAttribute('disabled');
      // Фокус на начало формы для доступности
      form.querySelector('h2, legend, [tabindex]')?.focus?.();
    }, 800);
  });

  // Поддержка skip-link: фокус на main
  document.querySelector('.skip')?.addEventListener('click', () => {
    document.getElementById('main')?.focus();
  });

// Кнопка наверх
const toTopBtn = document.getElementById('to-top');
if (toTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      toTopBtn.classList.add('visible');
    } else {
      toTopBtn.classList.remove('visible');
    }
  });
  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

})();