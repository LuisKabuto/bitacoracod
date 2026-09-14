/* Bitácora PRO v3 - servicio de autenticación */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
window.Bitacora.services.auth = {
  get provider() {
    return window.Bitacora.firebase;
  },
  async login(email, password) {
    return window.BitacoraRuntimeAdapter.login(email, password);
  },
  async register(name, email, password) {
    return window.BitacoraRuntimeAdapter.register(name, email, password);
  },
  async logout() {
    return window.BitacoraRuntimeAdapter.logout();
  }
};
