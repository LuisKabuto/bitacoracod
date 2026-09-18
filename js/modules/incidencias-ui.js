/* Bitácora PRO v3 - interfaz de incidencias */
window.Bitacora=window.Bitacora||{};
(function(B){
  const state={rows:[],stop:null,timer:null};
  const el=id=>document.getElementById(id);
  const esc=s=>B.utils.esc(s);
  const labels={open:'Abierta',in_progress:'En atención',resolved:'Resuelta'};
  const priority={high:'Alta',medium:'Media',low:'Baja'};
  function initials(name){return String(name||'I').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}
  function dateTime(v){
    if(!v)return '';
    const d=v instanceof Date?v:new Date(v);
    if(Number.isNaN(d.getTime()))return '';
    return new Intl.DateTimeFormat('es-VE',{timeZone:'America/Caracas',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d);
  }
  function age(v){
    if(!v)return '';
    const d=v instanceof Date?v:new Date(v),diff=Math.max(0,Date.now()-d.getTime());
    const mins=Math.floor(diff/60000);
    if(mins<60)return 'Hace '+mins+' min';
    const hours=Math.floor(mins/60);
    if(hours<24)return 'Hace '+hours+' h';
    return 'Hace '+Math.floor(hours/24)+' d';
  }
  function render(){
    const box=el('incidentsList'), filter=el('incidentStatusFilter'), pf=el('incidentPriorityFilter');
    if(!box)return;
    const rows=state.rows.filter(x=>(!filter.value||x.status===filter.value)&&(!pf||!pf.value||x.priority===pf.value));
    const open=state.rows.filter(x=>x.status==='open').length;
    const attention=state.rows.filter(x=>x.status==='in_progress').length;
    const resolved=state.rows.filter(x=>x.status==='resolved').length;
    const counter=el('incidentsCounter'); if(counter)counter.textContent=(open+attention)+' abiertas';
    const a=el('incidentOpenCount'); if(a)a.textContent=open+' abiertas';
    const b=el('incidentAttentionCount'); if(b)b.textContent=attention+' en atención';
    const c=el('incidentResolvedCount'); if(c)c.textContent=resolved+' resueltas';
    if(!rows.length){box.innerHTML='<div class="empty-state">No hay incidencias para los filtros seleccionados.</div>';return}
    box.innerHTML=rows.map(x=>{
      const next=x.status==='open'?'in_progress':x.status==='in_progress'?'resolved':null;
      const action=next?'<button class="btn btn-secondary incident-action" data-id="'+esc(x.id)+'" data-status="'+next+'">'+(next==='in_progress'?'Tomar en atención':'Marcar resuelta')+'</button>':'';
      const resolvedClass=x.status==='resolved'?' incident-resolved':'';
      const created=dateTime(x.createdAt);\n      const activity=age(x.updatedAt||x.createdAt);
      return '<article class="incident-card'+resolvedClass+'"><div class="incident-icon '+esc(x.priority||'medium')+'">'+initials(x.category)+'</div><div class="incident-main"><div class="incident-top"><strong>'+esc(x.title)+'</strong><span class="badge b-'+(x.priority==='high'?'red':x.priority==='medium'?'amber':'gray')+'">'+esc(priority[x.priority]||x.priority)+'</span></div><div class="incident-meta"><span>'+esc(x.category)+'</span><span>•</span><span>'+esc(labels[x.status]||x.status)+'</span><span>•</span><span>'+esc(x.assignedName||'Sin responsable')+'</span><span>•</span><span class="incident-activity">Actividad '+esc(activity||'recién registrada')+'</span></div><p class="incident-description">'+esc(x.description||'Sin descripción')+'</p><div class="incident-actions">'+(created?'<span class="incident-age">Registrada '+esc(created)+'</span>':'')+action+'</div></div></article>';
    }).join('');
  }
  async function loadUsers(){
    const users=await B.services.users.list();
    const sel=el('incidentAssignee');
    if(sel)sel.innerHTML=users.map(u=>'<option value="'+esc(u.uid)+'">'+esc(u.name)+'</option>').join('');
  }
  async function create(){
    const title=el('incidentTitle').value.trim(),assignee=el('incidentAssignee'),desc=el('incidentDescription').value.trim();
    if(!title||!assignee.value||!desc)return B.notify('Completa título, responsable y descripción');
    const user=B.currentUser||{uid:'u_admin',name:'Luis Puentes'};
    try{
      await B.services.incidents.create({title,category:el('incidentCategory').value,priority:el('incidentPriority').value,status:'open',assignedTo:assignee.value,assignedName:assignee.selectedOptions[0].text,description:desc,createdBy:user.uid});
      el('incidentTitle').value='';el('incidentDescription').value='';el('incidentPriority').value='medium';
      B.notify('Incidencia registrada');
    }catch(e){B.notify('Error: '+(e.message||'No fue posible registrar la incidencia'))}
  }
  async function bind(){
    const service=B.services&&B.services.incidents;if(!service)return;
    if(state.stop)state.stop();
    state.stop=service.subscribe(rows=>{state.rows=rows||[];render()});
    const btn=el('btnCreateIncident');if(btn)btn.onclick=create;
    const filter=el('incidentStatusFilter');if(filter)filter.onchange=render;
    const priorityFilter=el('incidentPriorityFilter');if(priorityFilter)priorityFilter.onchange=render;
    const list=el('incidentsList');
    if(list)list.addEventListener('click',async ev=>{
      const b=ev.target.closest('.incident-action');if(!b)return;
      try{await service.update(b.dataset.id,b.dataset.status);B.notify(b.dataset.status==='resolved'?'Incidencia resuelta':'Incidencia tomada en atención')}catch(e){B.notify('Error: '+(e.message||'No fue posible actualizar la incidencia'))}
    });
    await loadUsers();\n    if(state.timer)clearInterval(state.timer);\n    state.timer=setInterval(()=>{if(state.rows.length)render()},60000);
    const nav=document.querySelector('.nav-item[data-view="incidencias"]');
    if(nav)nav.onclick=()=>{document.querySelectorAll('#view-app section.view').forEach(s=>s.classList.toggle('active',s.id==='view-incidencias'));document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view==='incidencias'));el('pageTitle').textContent='Incidencias';el('pageSubtitle').textContent='Registro y seguimiento operativo';render()};
    window.addEventListener('bitacora:session-changed',loadUsers);
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true});
})(window.Bitacora);
