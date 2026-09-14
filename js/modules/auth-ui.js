/* Bitácora PRO v3 - interfaz de autenticación */
window.Bitacora = window.Bitacora || {};
(function (B) {
  function el(id) { return document.getElementById(id); }
  function notify(message) { if (typeof B.notify === 'function') B.notify(message); else if (typeof toast === 'function') toast(message); }
  function bind() {
    const auth = B.services && B.services.auth;
    if (!auth) return;
    const login = el('btnLogin'), register = el('btnRegister'), logout = el('btnLogout');
    if (login) login.onclick = async function () { try { await auth.login(el('loginEmail').value.trim(), el('loginPassword').value); } catch (e) { notify('Error: ' + (e.message || 'No fue posible iniciar sesión')); } };
    if (register) register.onclick = async function () { try { const n=el('regName').value.trim(), e=el('regEmail').value.trim(), p=el('regPassword').value; if(!n||!e||!p)return notify('Completa todos los campos'); await auth.register(n,e,p); notify('Cuenta creada correctamente'); } catch(e){ notify('Error: '+(e.message||'No fue posible crear la cuenta')); } };
    if (logout) logout.onclick = async function () { try { await auth.logout(); } catch(e){ notify('Error: '+(e.message||'No fue posible cerrar sesión')); } };
  }
  window.addEventListener('bitacora:modules-ready', bind, { once: true });
})(window.Bitacora);
