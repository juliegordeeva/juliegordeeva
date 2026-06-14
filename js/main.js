const header = document.getElementById('header');
const nav = document.getElementById('site-nav');
const navToggle = document.querySelector('.nav-toggle');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

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

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const data = new FormData(contactForm);
  const name = data.get('name');
  const role = data.get('role');
  const company = data.get('company');
  const contact = data.get('contact');
  const request = data.get('request');
  const format = data.get('format');
  const consent = data.get('consent');

  if (!consent) {
    showFormStatus('Необходимо согласие на обработку персональных данных.', 'error');
    return;
  }

  const subject = encodeURIComponent('Заявка на личную консультацию');
  const body = encodeURIComponent(
    `Имя: ${name}\n` +
    `Должность: ${role}\n` +
    `Компания: ${company || '—'}\n` +
    `Контакт: ${contact}\n` +
    `Формат: ${format}\n\n` +
    `Запрос:\n${request}`
  );

  showFormStatus('Открываю почтовый клиент для отправки заявки…', 'success');
  window.location.href = `mailto:prof@jgordeeva.ru?subject=${subject}&body=${body}`;
});

function showFormStatus(message, type) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.hidden = false;
  formStatus.className = `form-status is-${type}`;
}
