/* Bitácora PRO v3 - configuración central */
window.Bitacora = window.Bitacora || {};
window.Bitacora.config = Object.freeze({
  timezone: 'America/Caracas',
  defaultSchedule: Object.freeze({ start: '08:00', end: '15:00' }),
  currentSchedule: Object.freeze({ start: '08:00', end: '12:30' }),
  lateToleranceMinutes: 10,
  telegramEndpoint: ''
});
