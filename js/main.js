const header = document.getElementById('header');
const nav = document.getElementById('site-nav');
const navToggle = document.querySelector('.nav-toggle');
const leadForm = document.getElementById('leadForm');
const formStatus = document.getElementById('form-status');

// TODO(lead-capture): временное решение до Telegram-бота.
// Вставьте ID формы Formspree (https://formspree.io) вместо REPLACE_WITH_FORM_ID.
// Пока endpoint не настроен, используется резервная отправка через почтовый клиент.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_FORM_ID';
const LEAD_EMAIL = 'prof@jgordeeva.ru';

function closeNav() {
  nav?.classList.remove('is-open');
  header?.classList.remove('is-nav-open');
  navToggle?.setAttribute('aria-expanded', 'false');
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    closeNav();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

navToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  header.classList.toggle('is-nav-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

function setFormStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.hidden = false;
  formStatus.className = 'form-status is-' + type;
}

function sendViaMailClient(payload) {
  const subject = encodeURIComponent('Заявка с сайта radarexec.ru');
  const body = encodeURIComponent(
    'Имя: ' + payload.name + '\n' +
    'Телефон: ' + payload.phone + '\n' +
    'Email: ' + payload.email + '\n' +
    'Согласие на рассылку: ' + (payload.news ? 'да' : 'нет') + '\n' +
    'Дата: ' + payload.date
  );
  window.location.href = 'mailto:' + LEAD_EMAIL + '?subject=' + subject + '&body=' + body;
  setFormStatus('Заявка подготовлена. Подтвердите отправку в открывшемся письме — или напишите напрямую в Telegram.', 'success');
}

leadForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const consentPD = document.getElementById('consent-pd')?.checked;
  if (!consentPD) {
    setFormStatus('Пожалуйста, подтвердите согласие на обработку персональных данных.', 'error');
    return;
  }

  const payload = {
    name: (document.getElementById('name')?.value || '').trim(),
    phone: (document.getElementById('phone')?.value || '').trim(),
    email: (document.getElementById('email')?.value || '').trim(),
    news: !!document.getElementById('consent-news')?.checked,
    date: new Date().toLocaleString('ru-RU'),
  };

  if (!payload.name || !payload.phone || !payload.email) {
    setFormStatus('Заполните имя, телефон и email.', 'error');
    return;
  }

  const submitBtn = leadForm.querySelector('button[type="submit"]');

  // Пока Formspree не настроен — резервная отправка через почтовый клиент, данные не теряются.
  if (FORMSPREE_ENDPOINT.includes('REPLACE_WITH_FORM_ID')) {
    sendViaMailClient(payload);
    return;
  }

  if (submitBtn) submitBtn.disabled = true;
  setFormStatus('Отправляем заявку…', 'success');

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Имя: payload.name,
        Телефон: payload.phone,
        Email: payload.email,
        'Согласие на рассылку': payload.news ? 'да' : 'нет',
        Дата: payload.date,
      }),
    });

    if (response.ok) {
      leadForm.reset();
      setFormStatus('Спасибо! Заявка отправлена — Юлия свяжется с вами в течение 1–2 рабочих дней.', 'success');
    } else {
      setFormStatus('Не удалось отправить заявку. Данные сохранены — попробуйте ещё раз или напишите в Telegram.', 'error');
    }
  } catch (error) {
    setFormStatus('Нет связи с сервером. Данные сохранены — попробуйте ещё раз или напишите в Telegram.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});
