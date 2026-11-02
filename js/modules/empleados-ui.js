window.Bitacora=window.Bitacora||{};(function(B){
  function el(id){return document.getElementById(id)}
  function roleLabel(r){return({admin:'Administrador',supervisor:'Supervisor',operator:'Operador'})[r]||r||'Sin rol'}
  function initials(name){return String(name||'U').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
  let users=[];
  function render(){
    const box=el('employeesList');if(!box)return;
    const role=el('employeeRoleFilter')?.value||'',status=el('employeeStatusFilter')?.value||'',q=(el('employeeSearch')?.value||'').trim().toLowerCase();
    const total=users.length,active=users.filter(u=>u.isActive!==false).length,inactive=total-active;
    const a=el('employeeTotalCount');if(a)a.textContent=total+' total';
    const b=el('employeeActiveCount');if(b)b.textContent=active+' activos';
    const c=el('employeeInactiveCount');if(c)c.textContent=inactive+' inactivos';
    const list=users.filter(u=>(!role||u.role===role)&&(!status||(status==='active'?u.isActive!==false:u.isActive===false))&&(!q||String(u.name||'').toLowerCase().includes(q)||String(u.email||'').toLowerCase().includes(q)||String(u.employeeCode||'').toLowerCase().includes(q)));
    if(!list.length){box.innerHTML='<div class="empty-state">No hay personal que coincida con los filtros.</div>';return}
    box.innerHTML=list.map(u=>{
      const active=u.isActive!==false;
      const schedule=u.schedule?(typeof u.schedule==='string'?u.schedule:(u.schedule.start||'')+' - '+(u.schedule.end||'')):'';
      return '<article class="employee-card '+(active?'':'employee-inactive')+'"><div class="employee-avatar">'+B.utils.esc(initials(u.name))+'</div><div class="employee-main"><div class="employee-top"><strong>'+B.utils.esc(u.name||'Sin nombre')+'</strong><span class="badge '+(active?'b-green':'b-gray')+'">'+(active?'Activo':'Inactivo')+'</span></div><div class="employee-email">'+B.utils.esc(u.email||'Sin correo')+'</div><div class="employee-meta"><span class="badge b-cyan">'+B.utils.esc(roleLabel(u.role))+'</span>'+(u.employeeCode?'<span>Código: '+B.utils.esc(u.employeeCode)+'</span>':'')+(schedule?'<span>Horario: '+B.utils.esc(schedule)+'</span>':'')+'</div>'+(B.currentUser&&B.currentUser.role==='admin'&&u.uid!==B.currentUser.uid?'<div class="employee-actions"><button class="btn '+(active?'btn-danger':'btn-secondary')+'" data-employee-toggle="'+B.utils.esc(u.uid)+'" data-active="'+(active?'false':'true')+'">'+(active?'Deshabilitar cuenta':'Reactivar cuenta')+'</button></div>':'')+'</div></article>';
    }).join('');
  }
  async function load(){
    const box=el('employeesList');if(!box)return;
    try{users=await B.services.users.list();if(B.currentUser&&B.currentUser.role==='admin'&&B.services.users.assignSequentialCodes){const result=await B.services.users.assignSequentialCodes();if(result.updated&&B.notify)B.notify(result.updated+' códigos de empleado asignados');users=await B.services.users.list()}render()}
    catch(e){box.innerHTML='<div class="empty-state">No fue posible cargar el personal.</div>';if(B.notify)B.notify('Error: '+(e.message||'No fue posible cargar el personal'))}
  }
  async function createEmployee(){
    const name=el('newEmployeeName').value.trim(),email=el('newEmployeeEmail').value.trim().toLowerCase(),password=el('newEmployeePassword').value,role=el('newEmployeeRole').value;
    if(!name||!email||!password)return B.notify('Completa nombre, correo y contraseña inicial');
    if(password.length<6)return B.notify('La contraseña debe tener al menos 6 caracteres');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return B.notify('Introduce un correo válido');
    const max=users.reduce((n,u)=>{const m=String(u.employeeCode||'').match(/^EMP-(\d+)$/);return m?Math.max(n,Number(m[1])):n},0);
    const employeeCode='EMP-'+String(max+1).padStart(3,'0');
    const btn=el('btnCreateEmployee');if(btn)btn.disabled=true;
    try{await B.services.users.create({name,email,password,role,employeeCode});el('newEmployeeName').value='';el('newEmployeeEmail').value='';el('newEmployeePassword').value='';await load();B.notify('Empleado creado correctamente · '+employeeCode)}
    catch(e){B.notify('No se pudo crear el empleado: '+(e.message||'Error desconocido'))}
    finally{if(btn)btn.disabled=false}
  }
  async function toggleEmployee(uid,isActive){
    const user=users.find(x=>x.uid===uid);if(!user)return;
    const action=isActive?'reactivar':'deshabilitar';
    if(!confirm('¿Confirmas '+action+' la cuenta de '+user.name+'? Sus registros históricos se conservarán.'))return;
    try{await B.services.users.setActive(uid,isActive);await load();B.notify(isActive?'Cuenta reactivada':'Cuenta deshabilitada')}
    catch(e){B.notify('No se pudo actualizar la cuenta: '+(e.message||'Error desconocido'))}
  }
  function bind(){
    const nav=document.querySelector('.nav-item[data-view="empleados"]');
    if(nav)nav.onclick=()=>{document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));nav.classList.add('active');document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));el('view-empleados').classList.add('active');el('pageTitle').textContent='Personal';el('pageSubtitle').textContent='Equipo, roles y estado operativo';load()};
    const panel=el('employeeAdminPanel');if(panel)panel.hidden=!(B.currentUser&&B.currentUser.role==='admin');
    const createBtn=el('btnCreateEmployee');if(createBtn)createBtn.onclick=createEmployee;
    const list=el('employeesList');if(list)list.addEventListener('click',ev=>{const b=ev.target.closest('[data-employee-toggle]');if(!b)return;toggleEmployee(b.dataset.employeeToggle,b.dataset.active==='true')});
    ['employeeSearch','employeeRoleFilter','employeeStatusFilter'].forEach(id=>{const x=el(id);if(x)x.addEventListener(id==='employeeSearch'?'input':'change',render)});
    window.addEventListener('bitacora:session-changed',()=>{const panel=el('employeeAdminPanel');if(panel)panel.hidden=!(B.currentUser&&B.currentUser.role==='admin');if(B.permissions&&B.permissions.can('empleados'))load()});
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true})
})(window.Bitacora);