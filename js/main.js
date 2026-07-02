const header = document.getElementById('header');
const nav = document.getElementById('site-nav');
const navToggle = document.querySelector('.nav-toggle');
const leadForm = document.getElementById('leadForm');
const mailtoHint = document.getElementById('mailto-hint');

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

leadForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const consentPD = document.getElementById('consent-pd')?.checked;
  const consentNews = document.getElementById('consent-news')?.checked;

  if (!consentPD) {
    alert('Пожалуйста, подтвердите согласие на обработку персональных данных.');
    return;
  }

  const subject = encodeURIComponent('Заявка с сайта radarexec.ru');
  const body = encodeURIComponent(
    'Имя: ' + (name || '') + '\n' +
    'Телефон: ' + (phone || '') + '\n' +
    'Email: ' + (email || '') + '\n' +
    'Согласие на рассылку: ' + (consentNews ? 'да' : 'нет') + '\n' +
    'Дата: ' + new Date().toLocaleString('ru-RU')
  );

  window.location.href = 'mailto:prof@jgordeeva.ru?subject=' + subject + '&body=' + body;

  if (mailtoHint) mailtoHint.style.display = 'block';
});
