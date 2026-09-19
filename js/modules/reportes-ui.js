/* Bitácora PRO v3 - interfaz de reportes */
window.Bitacora=window.Bitacora||{};(function(B){
  function el(id){return document.getElementById(id)}
  function n(m){if(B.notify)B.notify(m)}
  function csvCell(v){const s=String(v==null?'':v);return '"'+s.replace(/"/g,'""')+'"'}
  function download(text,name,type){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type:type||'text/csv;charset=utf-8'}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),500)}
  function esc(s){return B.utils.esc(s)}
  function render(rows){
    const body=el('reportMonthlyBody');if(!body)return;
    const people=rows.length,days=rows.reduce((a,x)=>a+(Number(x.workDays)||0),0),hours=rows.reduce((a,x)=>a+(Number(x.totalHours)||0),0),late=rows.reduce((a,x)=>a+(Number(x.lateCount)||0),0);
    const a=el('reportPeopleCount');if(a)a.textContent=people;
    const b=el('reportDaysCount');if(b)b.textContent=days;
    const c=el('reportHoursCount');if(c)c.textContent=hours.toFixed(2);
    const d=el('reportLateCount');if(d)d.textContent=late;
    if(!rows.length){body.innerHTML='<tr><td colspan="5">No hay registros para este período.</td></tr>';return}
    body.innerHTML=rows.map(x=>'<tr><td><strong>'+esc(x.userName||'Sin nombre')+'</strong><br><span class="report-muted">'+esc(x.employeeCode||'SIN_CODIGO')+'</span></td><td>'+Number(x.workDays||0)+'</td><td>'+Number(x.totalHours||0).toFixed(2)+' h</td><td>'+Number(x.incompleteDays||0)+'</td><td><span class="report-late-pill">'+Number(x.lateCount||0)+'</span></td></tr>').join('');
  }
  async function load(){
    const p=el('periodSelect')?.value;if(!p)return;
    try{const rows=await B.services.reports.monthly(p);render(rows);return rows}catch(e){n('Error: '+(e.message||'No fue posible cargar el reporte'));return[]}
  }
  function bind(){
    const r=B.services&&B.services.reports;if(!r)return;
    const monthly=el('btnExportMonthly'),all=el('btnExportCSV'),pdf=el('btnExportPDF'),period=el('periodSelect');
    if(period)period.onchange=load;
    if(monthly)monthly.onclick=async()=>{const p=period.value;if(!p)return n('Selecciona un período');try{const rows=await r.monthly(p),out=[['Código','Empleado','Días laborados','Horas totales','Días incompletos','Retardos'].map(csvCell).join(',')];rows.forEach(x=>out.push([x.employeeCode,x.userName,x.workDays,x.totalHours,x.incompleteDays,x.lateCount].map(csvCell).join(',')));download('\ufeff'+out.join('\n'),'asistencia_'+p+'.csv');n('Reporte mensual generado')}catch(e){n('Error: '+(e.message||'No fue posible generar el reporte'))}};
    if(all)all.onclick=async()=>{try{const rows=await r.all(),out=[['Fecha','Empleado','Entrada','Salida','Horas','Estado'].map(csvCell).join(',')];rows.forEach(x=>out.push([x.date,x.userName,x.checkIn&&x.checkIn.local||'',x.checkOut&&x.checkOut.local||'',((x.totalMinutes||0)/60).toFixed(2),x.status].map(csvCell).join(',')));download('\ufeff'+out.join('\n'),'bitacora_completa.csv');n('Exportación completa generada')}catch(e){n('Error: '+(e.message||'No fue posible exportar'))}};
    if(pdf)pdf.onclick=async()=>{try{const p=period.value||B.utils.todayStr().slice(0,7),rows=await r.monthly(p),w=window.open('','_blank');if(!w)return n('Habilita ventanas emergentes para exportar');const totalDays=rows.reduce((a,x)=>a+(x.workDays||0),0),totalHours=rows.reduce((a,x)=>a+(x.totalHours||0),0),totalLate=rows.reduce((a,x)=>a+(x.lateCount||0),0);w.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reporte Bitácora PRO</title><style>body{font-family:Arial,sans-serif;color:#172033;margin:40px}h1{margin:0 0 6px}.muted{color:#667085}.summary{display:flex;gap:12px;margin:24px 0}.box{border:1px solid #d9dee8;border-radius:10px;padding:14px;flex:1}.box b{display:block;font-size:24px;margin-top:5px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;padding:10px;border-bottom:1px solid #e5e7eb}th{font-size:12px;text-transform:uppercase;color:#667085}@media print{body{margin:18px}}</style></head><body><h1>Bitácora PRO</h1><div class="muted">Reporte mensual · '+p+'</div><div class="summary"><div class="box">Personal<b>'+rows.length+'</b></div><div class="box">Días registrados<b>'+totalDays+'</b></div><div class="box">Horas<b>'+totalHours.toFixed(2)+'</b></div><div class="box">Retardos<b>'+totalLate+'</b></div></div><table><thead><tr><th>Empleado</th><th>Días</th><th>Horas</th><th>Incompletos</th><th>Retardos</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+String(x.userName||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</td><td>'+x.workDays+'</td><td>'+Number(x.totalHours||0).toFixed(2)+'</td><td>'+x.incompleteDays+'</td><td>'+x.lateCount+'</td></tr>').join('')+'</tbody></table><p class="muted">Generado por Bitácora PRO · '+new Date().toLocaleString('es-VE')+'</p></body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),300)}catch(e){n('Error: '+(e.message||'No fue posible generar el PDF'))}};
    window.addEventListener('bitacora:session-changed',()=>{if(B.currentUser)load()});
    load();
  }
  window.addEventListener('bitacora:modules-ready',bind,{once:true})
})(window.Bitacora);