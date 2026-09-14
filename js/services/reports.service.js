/* Bitácora PRO v3 - servicio de reportes */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
window.Bitacora.services.reports = {
  monthly: period => window.BitacoraRuntimeAdapter.getMonthly(period),
  all: () => window.BitacoraRuntimeAdapter.getAll()
};
