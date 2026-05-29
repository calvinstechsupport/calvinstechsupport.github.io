
const panel=document.querySelector('.mobile-panel');
document.querySelectorAll('[data-menu]').forEach(btn=>btn.addEventListener('click',()=>panel.classList.toggle('open')));
document.addEventListener('keydown',e=>{if(e.key==='Escape') panel.classList.remove('open')});
