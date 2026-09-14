/* Bitácora PRO v3 - notificaciones */
window.Bitacora = window.Bitacora || {};
window.Bitacora.notify = function (message) {
  const box = document.getElementById('toastBox');
  if (!box) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  box.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
};
