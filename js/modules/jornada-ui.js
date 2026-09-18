/* Bitácora PRO v3 - interfaz de jornada */
window.Bitacora=window.Bitacora||{};(function(B){
  function el(id){return document.getElementById(id)}
  function n(m){if(B.notify)B.notify(m)}
  function mins(hm){if(!hm||!/^\d{2}:\d{2}$/.test(hm))return 0;const [h,m]=hm.split(':').map(Number);return h*60+m}
  function fmtMinutes(v){v=Math.max(0,Number(v)||0);return (v/60).toFixed(2)+' h'}
  function renderMine(rows){
    const user=B.currentUser;
    if(!user)return;
    const mine=rows.find(r=>r.employeeUid===user.uid);
    const status=el('estadoOficina'), entry=el('horaEntrada'), total=el('horasHoy'), activity=el('actividadActual');
    const input=el('inputActividad'), inBtn=el('btnCheckIn'), changeBtn=el('btnRegistrarEntrada'), outBtn=el('btnCheckOut');
    const blocks=(mine&&mine.blocks)||[];
    const totalMinutes=blocks.reduce((sum,b)=>sum+(Number(b.minutes)||0),0);
    const open=blocks.find(b=>!b.localEnd);
    const closed=!!mine&&mine.status!=='open';
    const late=!!(mine&&mine.checkIn&&mine.checkIn.status==='late');
    if(!mine){
      status.textContent='Fuera de la oficina';status.className='status-badge neutral';
      entry.textContent='--:--';total.textContent='0.00 h';activity.textContent='Sin actividad registrada';
    }else if(mine.status==='open'){
      status.textContent=late?'En jornada · retardo':'En jornada';status.className='status-badge '+(late?'late':'ok');
      entry.textContent=(mine.checkIn&&mine.checkIn.local)||'--:--';total.textContent=fmtMinutes(totalMinutes);
      activity.textContent=open&&open.activity?open.activity:'Sin actividad registrada';
    }else{
      status.textContent=mine.status==='forced_close'?'Jornada cerrada · cierre administrativo':'Jornada cerrada';
      status.className='status-badge neutral';
      entry.textContent=(mine.checkIn&&mine.checkIn.local)||'--:--';total.textContent=fmtMinutes(mine.totalMinutes||totalMinutes);
      activity.textContent=blocks.length&&blocks[blocks.length-1].activity?blocks[blocks.length-1].activity:'Jornada finalizada';
    }
    if(input)input.disabled=!!mine;
    if(inBtn)inBtn.disabled=!!mine;
    if(changeBtn)changeBtn.disabled=!mine||closed;
    if(outBtn)outBtn.disabled=!mine||closed;
  }
  function renderHistory(blocks){
    const body=el('historialHoyBody');if(!body)return;
    body.innerHTML=blocks.map(b=>{
      const current=!b.localEnd;
      const cls=b.status==='late'?'history-late':b.status==='manual'?'history-manual':current?'history-current':'';
      const duration=Number(b.minutes)||0;
      return '<tr><td class="'+cls+'">'+B.utils.esc(b.activity||'Sin actividad')+'</td><td>'+B.utils.esc(b.localStart||'--:--')+'</td><td class="'+(current?'history-current':'')+'">'+B.utils.esc(b.localEnd||'En curso')+'</td><td>'+fmtMinutes(duration)+'</td></tr>';
    }).join('')||'<tr><td colspan="4">Sin registros hoy</td></tr>';
  }
  function bind(){
    const a=B.services&&B.services.attendance;if(!a)return;
    const i=el('inputActividad'),modal=el('lateModal'),reason=el('lateReason');
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
        const r=await a.checkIn(activity,null);
        if(r&&r.already)return n('Ya tienes jornada registrada hoy');
        if(r&&r.needsJustification)return openLateModal(activity);
        i.value='';n('Entrada registrada');
      }catch(e){n('Error: '+(e.message||'No fue posible registrar la entrada'))}
    };
    el('btnRegistrarEntrada').onclick=async()=>{
      const v=i.value.trim();if(!v)return n('Escribe la actividad');
      try{
        const r=await a.switchActivity(v,null);
        if(r&&r.already)return n('La jornada ya está cerrada');
        i.value='';n('Actividad actualizada: '+v);
      }catch(e){n('Error: '+(e.message||'No fue posible cambiar la actividad'))}
    };
    el('btnCheckOut').onclick=async()=>{
      try{const r=await a.checkOut();if(r&&r.none)return n('No hay jornada abierta');n('Salida registrada')}
      catch(e){n('Error: '+(e.message||'No fue posible registrar la salida'))}
    };
    let unsubToday=null,unsubBlocks=null;
    function stopSubscriptions(){if(unsubToday){unsubToday();unsubToday=null}if(unsubBlocks){unsubBlocks();unsubBlocks=null}}
    function startSubscriptions(){stopSubscriptions();if(!B.currentUser)return;unsubToday=a.subscribeToday(renderMine);unsubBlocks=a.subscribeMyBlocks(renderHistory)}
    window.addEventListener('bitacora:session-changed',e=>{if(e.detail)startSubscriptions();else stopSubscriptions()});
    startSubscriptions();
    B.jornadaUnsubscribe=stopSubscriptions;
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true})
})(window.Bitacora);
