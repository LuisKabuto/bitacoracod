/* Bitácora PRO v3 - servicio de tareas */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
window.Bitacora.services.tasks = {
  create: data => window.BitacoraRuntimeAdapter.createTask(data),
  action: (id, action) => window.BitacoraRuntimeAdapter.taskAction(id, action),
  subscribe: callback => window.BitacoraRuntimeAdapter.subscribeTasks(callback)
};
