/* Bitácora PRO v3 - servicio de jornada */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
window.Bitacora.services.attendance = {
  checkIn: (activity, justification) => window.BitacoraRuntimeAdapter.checkIn(activity, justification),
  switchActivity: (activity, justification) => window.BitacoraRuntimeAdapter.switchActivity(activity, justification),
  checkOut: () => window.BitacoraRuntimeAdapter.checkOut(),
  subscribeToday: callback => window.BitacoraRuntimeAdapter.subscribeToday(callback),
  subscribeMyBlocks: callback => window.BitacoraRuntimeAdapter.subscribeMyBlocks(callback),
  manualHistory: data => window.BitacoraRuntimeAdapter.manualHistory(data),
  forceClose: uid => window.BitacoraRuntimeAdapter.forceClose(uid)
};
