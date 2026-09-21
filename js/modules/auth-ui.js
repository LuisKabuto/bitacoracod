/* Bitácora PRO v3 - interfaz de autenticación */
window.Bitacora = window.Bitacora || {};
(function (B) {
  function el(id) { return document.getElementById(id); }
  function notify(message) { if (typeof B.notify === 'function') B.notify(message); else if (typeof toast === 'function') toast(message); }

  function setupDemoAdmin() {
    if (typeof DEMO !== 'undefined' && !DEMO) return;
    const hint = el('demoHint');
    if (!hint || !B.BitacoraRuntimeAdapter) return;

    hint.innerHTML = '<button type="button" class="linklike demo-login" id="btnDemoAdmin">Entrar como Administrador DEMO</button><small>Vista completa del sistema. No modifica Firebase.</small>';

    const btn = el('btnDemoAdmin');
    if (btn) {
      btn.onclick = async function () {
        const email = 'admin@demo.com';
        el('loginEmail').value = email;
        el('loginPassword').value = 'demo';
        try {
          await B.services.auth.login(email, 'demo');
        } catch (e) {
          notify('Error: ' + (e.message || 'No fue posible acceder al modo DEMO'));
        }
      };
    }
  }

  function bind() {
    const auth = B.services && B.services.auth;
    if (!auth) return;

    const login = el('btnLogin'), register = el('btnRegister'), logout = el('btnLogout');

    if (login) login.onclick = async function () {
      try {
        await auth.login(el('loginEmail').value.trim(), el('loginPassword').value);
      } catch (e) {
        notify('Error: ' + (e.message || 'No fue posible iniciar sesión'));
      }
    };

    if (register) register.onclick = async function () {
      try {
        const n = el('regName').value.trim();
        const e = el('regEmail').value.trim();
        const p = el('regPassword').value;
        if (!n || !e || !p) return notify('Completa todos los campos');
        await auth.register(n, e, p);
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

    setupDemoAdmin();
  }

  window.addEventListener('bitacora:modules-ready', bind, { once: true });
})(window.Bitacora);
