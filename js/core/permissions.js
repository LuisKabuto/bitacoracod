/* Bitácora PRO v3 - permisos de interfaz */
window.Bitacora=window.Bitacora||{};(function(B){
  const rules={admin:['dashboard','registro','tareas','mando','empleados','incidencias','reportes'],supervisor:['dashboard','registro','tareas','mando','empleados','incidencias','reportes'],operator:['dashboard','registro','tareas']};
  B.permissions={
    can:view=>{const u=B.currentUser;return!!u&&(rules[u.role]||rules.operator).includes(view)},
    apply:()=>{
      document.querySelectorAll('.nav-item[data-view]').forEach(b=>{const ok=B.permissions.can(b.dataset.view);b.hidden=!ok;b.style.display=ok?'':'none'});
      document.querySelectorAll('#view-app section.view[id^="view-"]').forEach(s=>{const v=s.id.replace('view-',''),ok=B.permissions.can(v);s.hidden=!ok;s.style.display=ok?'':'none'});
    }
  };
  window.addEventListener('bitacora:session-changed',()=>B.permissions.apply());
  window.addEventListener('bitacora:modules-ready',()=>B.permissions.apply(),{once:true});
})(window.Bitacora);
