const header = document.getElementById('header');
const nav = document.getElementById('site-nav');
const navToggle = document.querySelector('.nav-toggle');
const leadForm = document.getElementById('leadForm');
const formStatus = document.getElementById('form-status');
const LEAD_EMAIL = 'prof@jgordeeva.ru';

function closeNav() {
  nav?.classList.remove('is-open');
  header?.classList.remove('is-nav-open');
  navToggle?.setAttribute('aria-expanded', 'false');
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (id === '#' || !id) return;

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

// mailto — осознанный выбор заказчика (до Telegram-бота).
leadForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const consentPD = document.getElementById('consent-pd')?.checked;
  if (!consentPD) {
    setFormStatus('Пожалуйста, подтвердите согласие на обработку персональных данных.', 'error');
    return;
  }

  const name = (document.getElementById('name')?.value || '').trim();
  const phone = (document.getElementById('phone')?.value || '').trim();
  const email = (document.getElementById('email')?.value || '').trim();
  const news = !!document.getElementById('consent-news')?.checked;

  if (!name || !phone || !email) {
    setFormStatus('Заполните имя, телефон и email.', 'error');
    return;
  }

  const subject = encodeURIComponent('Заявка с сайта gordeeva.radarexec.ru');
  const body = encodeURIComponent(
    'Имя: ' + name + '\n' +
    'Телефон: ' + phone + '\n' +
    'Email: ' + email + '\n' +
    'Согласие на рассылку: ' + (news ? 'да' : 'нет') + '\n' +
    'Дата: ' + new Date().toLocaleString('ru-RU') + '\n\n' +
    'Запрос:\n'
  );

  window.location.href = 'mailto:' + LEAD_EMAIL + '?subject=' + subject + '&body=' + body;
  setFormStatus('Если почтовый клиент не открылся — напишите на prof@jgordeeva.ru или в Telegram.', 'success');
});
