/* Bitácora PRO v3 - servicio de usuarios */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
window.Bitacora.services.users = {
  list: () => window.BitacoraRuntimeAdapter.getUsers()
};
