/* Bitácora PRO v3 - interfaz de jornada */
window.Bitacora=window.Bitacora||{};(function(B){
  function el(id){return document.getElementById(id)}
  function n(m){if(B.notify)B.notify(m)}
  function bind(){
    const a=B.services&&B.services.attendance;if(!a)return;
    const i=el('inputActividad'), modal=el('lateModal'), reason=el('lateReason');
    let pendingActivity='';
    function closeLateModal(){if(modal){modal.hidden=true;reason.value='';pendingActivity=''}}
    function openLateModal(activity){pendingActivity=activity;reason.value='';modal.hidden=false;setTimeout(()=>reason.focus(),0)}
    if(el('btnLateCancel'))el('btnLateCancel').onclick=closeLateModal;
    if(el('btnLateConfirm'))el('btnLateConfirm').onclick=async()=>{
      const j=reason.value.trim();
      if(!j)return n('Indica el motivo del retardo');
      try{await a.checkIn(pendingActivity,j);closeLateModal();n('Entrada registrada')}catch(e){n('Error: '+(e.message||'No fue posible registrar la entrada'))}
    };
    el('btnCheckIn').onclick=async()=>{
      const activity=i.value.trim();
      if(!activity)return n('Escribe la actividad');
      try{
        let r=await a.checkIn(activity,null);
        if(r&&r.already)return n('Ya tienes jornada registrada hoy');
        if(r&&r.needsJustification)return openLateModal(activity);
        n('Entrada registrada');
      }catch(e){n('Error: '+(e.message||'No fue posible registrar la entrada'))}
    };
    el('btnRegistrarEntrada').onclick=async()=>{
      const v=i.value.trim();if(!v)return n('Escribe la actividad');
      try{const r=await a.switchActivity(v,null);if(r&&r.already)return n('La jornada ya está cerrada');n('Actividad actualizada: '+v)}
      catch(e){n('Error: '+(e.message||'No fue posible cambiar la actividad'))}
    };
    el('btnCheckOut').onclick=async()=>{
      try{const r=await a.checkOut();if(r&&r.none)return n('No hay jornada abierta');n('Salida registrada')}
      catch(e){n('Error: '+(e.message||'No fue posible registrar la salida'))}
    };
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true})
})(window.Bitacora);
