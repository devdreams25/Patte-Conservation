/* For header when the user scrolls down, the background-color appear */
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) { // when user scrolls more than 50px
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* For sidebar header */
document.addEventListener("DOMContentLoaded", function() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('closeBtn');

  hamburger.addEventListener('click', () => {
    sidebar.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });

  window.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });
});
