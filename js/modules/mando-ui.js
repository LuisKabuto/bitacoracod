/* Bitácora PRO v3 - interfaz centro de mando */
window.Bitacora=window.Bitacora||{};(function(B){
  function el(id){return document.getElementById(id)}
  function n(m){if(B.notify)B.notify(m)}
  let unsubToday=null,rows=[];
  function renderSummary(){
    const active=rows.filter(r=>r.status==='open').length;
    const late=rows.filter(r=>r.status==='open'&&r.checkIn&&r.checkIn.status==='late').length;
    const closed=rows.filter(r=>r.status!=='open').length;
    const a=el('mandoActiveCount');if(a)a.textContent=active;
    const b=el('mandoLateCount');if(b)b.textContent=late;
    const c=el('mandoClosedCount');if(c)c.textContent=closed;
  }
  function bind(){
    const a=B.services&&B.services.attendance;if(!a)return;
    const save=el('btnManualSave');
    if(save)save.onclick=async()=>{
      const operator=el('manualOperator').value,date=el('manualDate').value,timeIn=el('manualIn').value,timeOut=el('manualOut').value,activity=el('manualActivity').value.trim();
      if(!operator||!date||!timeIn||!timeOut||!activity)return n('Completa todos los datos del registro');
      if(timeOut<=timeIn)return n('La salida debe ser posterior a la entrada');
      try{await a.manualHistory({uid:operator,date,hi:timeIn,ho:timeOut,activity});el('manualActivity').value='';n('Registro histórico guardado')}catch(e){n('Error: '+(e.message||'No fue posible guardar el registro'))}
    };
    ['mandoSearch','mandoStatusFilter'].forEach(id=>{const x=el(id);if(x)x.addEventListener(id==='mandoSearch'?'input':'change',renderTable)});
    const nav=document.querySelector('.nav-item[data-view="mando"]');
    if(nav)nav.addEventListener('click',()=>setTimeout(renderTable,0));
    if(unsubToday)unsubToday();
    unsubToday=a.subscribeToday(data=>{rows=data||[];renderSummary();renderTable()});
    window.addEventListener('bitacora:session-changed',()=>{
      if(typeof fillOperators==='function')fillOperators();
      if(unsubToday)unsubToday();
      unsubToday=B.services.attendance.subscribeToday(data=>{rows=data||[];renderSummary();renderTable()});
    });
  }
  function renderTable(){
    const box=el('jornadaBody');if(!box)return;
    const q=(el('mandoSearch')?.value||'').trim().toLowerCase(),filter=el('mandoStatusFilter')?.value||'';
    const filtered=rows.filter(r=>{
      const name=String(r.userName||'').toLowerCase();
      const late=r.status==='open'&&r.checkIn&&r.checkIn.status==='late';
      const state=late?'late':r.status==='open'?'open':'closed';
      return (!q||name.includes(q))&&(!filter||state===filter);
    });
    if(!filtered.length){box.innerHTML='<tr><td colspan="4">No hay personal que coincida con el filtro.</td></tr>';return}
    const supervisor=B.currentUser&&['admin','supervisor'].includes(B.currentUser.role);
    box.innerHTML=filtered.map(r=>{
      const late=r.status==='open'&&r.checkIn&&r.checkIn.status==='late';
      const status=r.status==='open'?(late?'<span class="badge b-amber">En oficina · retardo</span>':'<span class="badge b-green">En oficina</span>'):r.status==='forced_close'?'<span class="badge b-red">Cierre forzado</span>':'<span class="badge b-gray">Retirado</span>';
      const action=supervisor&&r.status==='open'?'<button class="btn btn-danger mando-force" data-uid="'+B.utils.esc(r.employeeUid)+'">Forzar cierre</button>':'—';
      return '<tr><td><strong>'+B.utils.esc(r.userName||'Sin nombre')+'</strong></td><td>'+status+'</td><td>'+B.utils.esc(r.checkIn&&r.checkIn.local||'--:--')+'</td><td>'+action+'</td></tr>';
    }).join('');
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true});
  document.addEventListener('click',async ev=>{
    const b=ev.target.closest('.mando-force');if(!b)return;
    try{await B.services.attendance.forceClose(b.dataset.uid);n('Jornada cerrada administrativamente')}catch(e){n('Error: '+(e.message||'No fue posible cerrar la jornada'))}
  });
})(window.Bitacora);