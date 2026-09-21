/* Bitácora PRO v3 - dashboard */
window.Bitacora=window.Bitacora||{};(function(B){
  const el=id=>document.getElementById(id);
  const esc=s=>B.utils.esc(s);
  let unsubToday=null,unsubBlocks=null,timer=null,rows=[],blocks=[];
  function rowMinutes(r){
    if(r&&r.blocks&&r.blocks.length)return r.blocks.reduce((a,b)=>a+(b.minutes||0),0);
    if(r&&r.status==='open'&&r.checkIn&&r.checkIn.local)return Math.max(0,B.utils.hmMin(B.utils.nowHM())-B.utils.hmMin(r.checkIn.local));
    return r&&r.totalMinutes||0;
  }
  function refreshAlerts(){
    const date=el('dashboardDate');if(date)date.textContent=B.utils.todayStr();
    const list=el('dashboardAlertList');if(!list)return;
    const active=Number(el('statActive')?.textContent||0),pending=Number(el('statPending')?.textContent||0),done=Number(el('statDone')?.textContent||0),items=[];
    if(active===0)items.push(['neutral','No hay personal marcado en jornada actualmente.']);
    if(pending>0)items.push(['warning',pending+' tarea'+(pending===1?' pendiente':'s pendientes')+' por gestionar.']);
    if(done>0)items.push(['ok',done+' tarea'+(done===1?' completada':'s completadas')+' hoy.']);
    if(!items.length)items.push(['ok','Operación sin alertas visibles.']);
    list.innerHTML=items.map(x=>'<div class="alert-item '+x[0]+'"><span class="alert-dot"></span><span>'+esc(x[1])+'</span></div>').join('');
  }
  function refreshMyDay(){
    const mine=B.currentUser?rows.find(r=>r.employeeUid===B.currentUser.uid):null;
    const status=el('dashboardMyStatus'),entry=el('dashboardMyEntry'),hours=el('dashboardMyHours'),activity=el('dashboardMyActivity');
    if(!status)return;
    if(!mine){status.textContent='Sin jornada';status.className='status-badge neutral';entry.textContent='--:--';hours.textContent='0.00 h';activity.textContent='Sin actividad registrada';return}
    const late=mine.checkIn&&mine.checkIn.status==='late',open=mine.status==='open';
    status.textContent=open?(late?'En jornada · retardo':'En jornada'):(mine.status==='forced_close'?'Cierre administrativo':'Jornada cerrada');
    status.className='status-badge '+(open?(late?'late':'ok'):'neutral');
    entry.textContent=mine.checkIn&&mine.checkIn.local||'--:--';
    hours.textContent=(rowMinutes(mine)/60).toFixed(2)+' h';
    const current=(mine.blocks||[]).slice().reverse().find(b=>!b.localEnd);
    activity.textContent=current&&current.activity?current.activity:'Sin actividad activa';
  }
  function bind(){
    const box=el('view-dashboard');if(!box)return;
    let panel=el('dashboardAlerts');
    if(!panel){
      panel=document.createElement('div');panel.id='dashboardAlerts';panel.className='card dashboard-alerts';
      panel.innerHTML='<div class="card-head"><div><h2>Alertas operativas</h2><p>Situaciones que requieren atención.</p></div></div><div id="dashboardAlertList" class="alert-list"></div>';
      const grid=box.querySelector('.dashboard-grid');if(grid)grid.insertAdjacentElement('afterend',panel);
    }
    const obs=new MutationObserver(refreshAlerts);
    ['statActive','statPending','statDone'].forEach(id=>{const x=el(id);if(x)obs.observe(x,{childList:true,characterData:true,subtree:true})});
    if(unsubToday)unsubToday();if(unsubBlocks)unsubBlocks();
    const a=B.services&&B.services.attendance;
    if(a){
      unsubToday=a.subscribeToday(data=>{rows=data||[];refreshMyDay();refreshAlerts()});
      unsubBlocks=a.subscribeMyBlocks(data=>{blocks=data||[];refreshMyDay()});
    }
    box.querySelectorAll('[data-dashboard-view]').forEach(btn=>btn.onclick=()=>{const nav=document.querySelector('.nav-item[data-view="'+btn.dataset.dashboardView+'"]);if(nav)nav.click()});
    refreshAlerts();refreshMyDay();
    if(timer)clearInterval(timer);timer=setInterval(()=>{refreshAlerts();refreshMyDay()},60000);
    window.addEventListener('bitacora:session-changed',()=>{
      if(unsubToday)unsubToday();if(unsubBlocks)unsubBlocks();
      rows=[];blocks=[];refreshMyDay();
      if(B.currentUser&&a){unsubToday=a.subscribeToday(data=>{rows=data||[];refreshMyDay();refreshAlerts()});unsubBlocks=a.subscribeMyBlocks(data=>{blocks=data||[];refreshMyDay()})}
    });
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true});
})(window.Bitacora);