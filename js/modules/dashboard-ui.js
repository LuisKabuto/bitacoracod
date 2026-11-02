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
  let rosterUsers=[];
  function renderOperatorRoster(){
    const panel=el('operatorRoster');if(!panel)return;
    const byUid=new Map(rows.map(r=>[r.employeeUid,r]));
    const activeUsers=rosterUsers.filter(u=>u.isActive!==false);
    panel.innerHTML='<div class="card-head"><div><h2>Estado del personal</h2><p>Quién está en oficina y quién está fuera, según el registro de hoy.</p></div><span class="date-pill">'+esc(B.utils.todayStr())+'</span></div><div class="table-wrap"><table><thead><tr><th>Empleado</th><th>Estado</th></tr></thead><tbody>'+activeUsers.map(u=>{const r=byUid.get(u.uid);const present=!!r&&r.status==='open';const status=present?'<span class="badge b-green">En oficina</span>':r?'<span class="badge b-gray">Fuera de oficina</span>':'<span class="badge b-gray">Sin entrada registrada</span>';return '<tr><td>'+esc(u.name||'Sin nombre')+'</td><td>'+status+'</td></tr>'}).join('')+'</tbody></table></div>';
  }
  function configureOperatorDashboard(){
    const operator=B.currentUser&&B.currentUser.role==='operator';
    const box=el('view-dashboard');if(!box)return;
    configureOperatorDashboard();
    const stats=box.querySelector('.stats-grid'),grid=box.querySelector('.dashboard-grid'),alerts=el('dashboardAlerts');
    if(stats)stats.hidden=operator;
    if(grid)grid.hidden=operator;
    if(alerts)alerts.hidden=operator;
    let panel=el('operatorRoster');
    if(operator&&!panel){panel=document.createElement('div');panel.id='operatorRoster';panel.className='card';const head=box.querySelector('.page-head');if(head)head.insertAdjacentElement('afterend',panel)}
    if(panel)panel.hidden=!operator;
    if(operator){B.services.users.list().then(list=>{rosterUsers=list||[];renderOperatorRoster()}).catch(e=>console.error('No se pudo cargar el personal:',e));renderOperatorRoster()}
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
      unsubToday=a.subscribeToday(data=>{rows=data||[];refreshMyDay();refreshAlerts();renderOperatorRoster()});
      unsubBlocks=a.subscribeMyBlocks(data=>{blocks=data||[];refreshMyDay()});
    }
    box.querySelectorAll('[data-dashboard-view]').forEach(btn=>btn.onclick=()=>{const nav=document.querySelector('.nav-item[data-view="'+btn.dataset.dashboardView+'"]);if(nav)nav.click()});
    refreshAlerts();refreshMyDay();
    if(timer)clearInterval(timer);timer=setInterval(()=>{refreshAlerts();refreshMyDay()},60000);
    window.addEventListener('bitacora:session-changed',()=>{
      if(unsubToday)unsubToday();if(unsubBlocks)unsubBlocks();
      rows=[];blocks=[];refreshMyDay();configureOperatorDashboard();
      if(B.currentUser&&a){unsubToday=a.subscribeToday(data=>{rows=data||[];refreshMyDay();refreshAlerts();renderOperatorRoster()});unsubBlocks=a.subscribeMyBlocks(data=>{blocks=data||[];refreshMyDay()})}
    });
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true});
})(window.Bitacora);