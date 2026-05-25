const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');
const openBtn = document.querySelector('.menu-btn');
const closeBtn = document.querySelector('.side-close');
function openMenu(){ sidebar.classList.add('open'); overlay.classList.add('show'); }
function closeMenu(){ sidebar.classList.remove('open'); overlay.classList.remove('show'); }
if(openBtn) openBtn.addEventListener('click', openMenu);
if(closeBtn) closeBtn.addEventListener('click', closeMenu);
if(overlay) overlay.addEventListener('click', closeMenu);
document.querySelectorAll('.side-links a').forEach(a => a.addEventListener('click', closeMenu));
