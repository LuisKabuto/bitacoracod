/* Bitácora PRO v3 - utilidades compartidas */
window.Bitacora = window.Bitacora || {};
(function (B) {
  const c = B.config;
  const fmtD = new Intl.DateTimeFormat('en-CA', { timeZone: c.timezone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const fmtT = new Intl.DateTimeFormat('en-GB', { timeZone: c.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  B.utils = {
    todayStr: () => fmtD.format(new Date()),
    nowHM: () => fmtT.format(new Date()),
    hmMin: hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; },
    isLate: hm => B.utils.hmMin(hm) > B.utils.hmMin(c.defaultSchedule.start) + c.lateToleranceMinutes,
    dayBounds: d => ({ start: new Date(d + 'T00:00:00-04:00'), end: new Date(d + 'T23:59:59-04:00') }),
    el: id => document.getElementById(id),
    esc: s => String(s == null ? '' : s).replace(/[<>&\"]/g, x => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[x] || x))
  };
})(window.Bitacora);
