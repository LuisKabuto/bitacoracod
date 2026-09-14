/* Bitácora PRO v3 - interfaz de jornada */
window.Bitacora=window.Bitacora||{};
(function(B){
 function el(id){return document.getElementById(id)}
 function notify(m){if(typeof B.notify==='function')B.notify(m)}
 function bind(){const a=B.services&&B.services.attendance;if(!a)return;const input=el('inputActividad');
  el('btnCheckIn').onclick=async()=>{try{let r=await a.checkIn(input.value.trim(),null);if(r&&r.already)return notify('Ya tienes jornada registrada hoy');if(r&&r.needsJustification){const reasons=['Tráfico','Cita médica','Incidencia técnica','Motivo personal'];const choice=prompt('Retardo detectado. Selecciona motivo: '+reasons.join(', '));if(!choice)return notify('Entrada cancelada');r=await a.checkIn(input.value.trim(),choice)}notify('Entrada registrada')}catch(e){notify('Error: '+(e.message||'No fue posible registrar la entrada'))}};
  el('btnRegistrarEntrada').onclick=async()=>{const v=input.value.trim();if(!v)return notify('Escribe la actividad');try{const r=await a.switchActivity(v,null);if(r&&r.already)return notify('La jornada ya está cerrada');notify('Actividad actualizada: '+v)}catch(e){notify('Error: '+(e.message||'No fue posible cambiar la actividad'))}};
  el('btnCheckOut').onclick=async()=>{try{const r=await a.checkOut();if(r&&r.none)return notify('No hay jornada abierta');notify('Salida registrada')}catch(e){notify('Error: '+(e.message||'No fue posible registrar la salida'))}};
 }
 window.addEventListener('bitacora:modules-ready',bind,{once:true});
})(window.Bitacora);
