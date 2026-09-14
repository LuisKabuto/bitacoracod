/* Bitácora PRO v3 - interfaz de autenticación */
window.Bitacora = window.Bitacora || {};
(function (B) {
  function el(id) { return document.getElementById(id); }
  function notify(message) {
    if (typeof B.notify === 'function') B.notify(message);
    else if (typeof toast === 'function') toast(message);
  }
  function bind() {
    const auth = B.services && B.services.auth;
    if (!auth) return;

    const login = el('btnLogin');
    const register = el('btnRegister');
    const logout = el('btnLogout');

    if (login) login.onclick = async function () {
      try {
        await auth.login(el('loginEmail').value.trim(), el('loginPassword').value);
      } catch (e) {
        notify('Error: ' + (e.message || 'No fue posible iniciar sesión'));
      }
    };

    if (register) register.onclick = async function () {
      try {
        const name = el('regName').value.trim();
        const email = el('regEmail').value.trim();
        const password = el('regPassword').value;
        if (!name || !email || !password) return notify('Completa todos los campos');
        await auth.register(name, email, password);
        notify('Cuenta creada correctamente');
      } catch (e) {
        notify('Error: ' + (e.message || 'No fue posible crear la cuenta'));
      }
    };

    if (logout) logout.onclick = async function () {
      try {
        await auth.logout();
      } catch (e) {
        notify('Error: ' + (e.message || 'No fue posible cerrar sesión'));
      }
    };
  }

  if (B.services) bind();
  else window.addEventListener('bitacora:modules-ready', bind, { once: true });
})(window.Bitacora);
