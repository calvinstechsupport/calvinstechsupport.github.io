
const toggles = document.querySelectorAll('[data-menu]');
const panel = document.querySelector('.mobile-panel');
toggles.forEach(btn => btn.addEventListener('click', () => panel.classList.toggle('open')));

const form = document.getElementById('requestForm');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reqName')?.value.trim() || 'Not provided';
    const device = document.getElementById('reqDevice')?.value.trim() || 'Not provided';
    const problem = document.getElementById('reqProblem')?.value.trim() || 'Not provided';
    const area = document.getElementById('reqArea')?.value || 'Not provided';
    const msg = `Hi Calvin, I need tech support.%0A%0AName: ${encodeURIComponent(name)}%0ADevice: ${encodeURIComponent(device)}%0AProblem: ${encodeURIComponent(problem)}%0AArea: ${encodeURIComponent(area)}%0A%0AI can send pictures/video next.`;
    window.open(`https://wa.me/27683947321?text=${msg}`, '_blank');
  });
}
