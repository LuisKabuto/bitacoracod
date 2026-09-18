/* Bitácora PRO v3 - experiencia de tareas */
window.Bitacora=window.Bitacora||{};(function(B){
  function el(id){return document.getElementById(id)}
  function n(m){if(B.notify)B.notify(m)}
  function esc(v){return B.utils.esc(v)}
  function tagsOf(v){return String(v||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>'#'+s.replace(/^#/,'')).filter((v,i,a)=>a.indexOf(v)===i)}
  const labels={pending:'Pendiente',in_progress:'En curso',awaiting_validation:'Por validar',completed:'Completada',expired:'Vencida'};
  const priorityLabels={high:'Alta',normal:'Normal',low:'Baja'};
  function dateLabel(v){if(!v)return '';return String(v)}
  function actions(t){
    const u=B.currentUser;if(!u)return '';
    let html='';
    if(t.status==='pending'&&t.assignedTo===u.uid)html+='<button class="btn btn-primary" data-task-action="start" data-task-id="'+esc(t.id)+'">Iniciar</button>';
    if(t.status==='in_progress'&&t.assignedTo===u.uid)html+='<button class="btn btn-secondary" data-task-action="finish" data-task-id="'+esc(t.id)+'">Terminar</button>';
    if(t.status==='awaiting_validation'&&['admin','supervisor'].includes(u.role))html+='<button class="btn btn-secondary" data-task-action="validate" data-task-id="'+esc(t.id)+'">Validar</button>';
    return html;
  }
  function render(tasks){
    const board=el('taskBoard'), mando=el('teamTasksMando');if(!board)return;
    const sf=el('taskStatusFilter')?.value||'',pf=el('taskPriorityFilter')?.value||'';
    const visible=tasks.filter(t=>(!sf||t.status===sf)&&(!pf||t.priority===pf));
    const html=visible.length?visible.map(t=>{
      const tags=(t.tags||[]).map(x=>'<span class="chip">'+esc(x)+'</span>').join('');
      const due=t.dueDate?('Vence: '+dateLabel(t.dueDate)): 'Sin vencimiento';
      const oneDay=t.isEphemeral?'<span class="badge b-red">1 día</span>':'';
      return '<article class="task-card"><div class="task-card-top"><div><div class="task-card-title">'+esc(t.title)+'</div><div class="task-card-sub">'+esc(t.category||'General')+' · '+esc(t.assignedName||'Sin asignar')+'</div></div><span class="task-status '+esc(t.status)+'">'+esc(labels[t.status]||t.status)+'</span></div><div class="task-card-meta">'+tags+oneDay+'<span class="task-priority '+esc(t.priority||'normal')+'">Prioridad '+esc(priorityLabels[t.priority]||'Normal')+'</span></div><div class="task-card-foot"><div class="task-card-info">'+esc(due)+'</div><div class="task-card-actions">'+actions(t)+'</div></div></article>';
    }).join(''):'<div class="task-empty">No hay tareas que coincidan con los filtros.</div>';
    board.innerHTML=html;
    if(mando)mando.innerHTML=html;
  }
  async function runAction(id,action){
    try{await B.services.tasks.action(id,action);const labels2={start:'Tarea iniciada',finish:'Tarea enviada a validación',validate:'Tarea validada'};n(labels2[action]||'Tarea actualizada')}
    catch(e){n('Error: '+(e.message||'No fue posible actualizar la tarea'))}
  }
  function bind(){
    const t=B.services&&B.services.tasks;if(!t)return;
    const assign=el('btnAssign');
    if(assign)assign.onclick=async()=>{
      const title=el('taskTitle').value.trim(),uid=el('taskAssign').value;
      if(!title||!uid)return n('Completa título y operador');
      if(title.length<4)return n('El título debe ser más descriptivo');
      const eph=!!el('taskEphemeral').checked,user=B.currentUser;
      if(!user)return n('Sesión no disponible');
      try{
        await t.create({title,category:el('taskCategory').value,assignedTo:uid,assignedName:el('taskAssign').selectedOptions[0].text,createdBy:user.uid,status:'pending',isEphemeral:eph,tags:tagsOf(el('taskTags').value),priority:eph?'high':'normal',dueDate:eph?B.utils.todayStr():null});
        el('taskTitle').value='';el('taskTags').value='';el('taskEphemeral').checked=false;n('Tarea asignada'+(eph?' · vence hoy':''));
      }catch(e){n('Error: '+(e.message||'No fue posible crear la tarea'))}
    };
    ['taskStatusFilter','taskPriorityFilter'].forEach(id=>{const x=el(id);if(x)x.onchange=()=>{if(window.__bitacoraTasks)render(window.__bitacoraTasks)}});
    ['taskBoard','teamTasksMando'].forEach(id=>{const box=el(id);if(!box)return;box.addEventListener('click',ev=>{const b=ev.target.closest('[data-task-action]');if(!b)return;ev.preventDefault();runAction(b.dataset.taskId,b.dataset.taskAction)},true)});
    const unsub=t.subscribe(tasks=>{window.__bitacoraTasks=tasks||[];render(window.__bitacoraTasks)});
    B.tasksUnsubscribe=()=>{if(unsub)unsub();window.__bitacoraTasks=null};
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true})
})(window.Bitacora);
