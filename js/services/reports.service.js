/* Bitácora PRO v3 - servicio de reportes */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
(function(B){
  const isDemo=()=>typeof DEMO!=='undefined'&&DEMO;
  const pad=n=>String(n).padStart(2,'0');
  const today=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Caracas',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const o={};p.forEach(x=>o[x.type]=x.value);return o.year+'-'+o.month+'-'+o.day};
  const hmNow=()=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Caracas',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const o={};p.forEach(x=>o[x.type]=x.value);return o.hour+':'+o.minute};
  const hmMin=hm=>{const p=String(hm||'').split(':').map(Number);return (p[0]||0)*60+(p[1]||0)};
  const dateFromDoc=(id,r)=>{
    if(typeof r.date==='string'&&r.date)return r.date.slice(0,10);
    if(r.date&&typeof r.date.toDate==='function'){const d=r.date.toDate();return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Caracas',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
    const m=String(id||'').match(/^(\d{4}-\d{2}-\d{2})_/);return m?m[1]:'';
  };
  async function monthlyProduction(period){
    const [attendanceSnap,usersSnap]=await Promise.all([firebase.firestore().collection('attendance').get(),firebase.firestore().collection('users').get()]);
    const users={};usersSnap.docs.forEach(d=>users[d.id]={uid:d.id,...d.data()});
    const out={};
    for(const doc of attendanceSnap.docs){
      const r=doc.data()||{},date=dateFromDoc(doc.id,r);
      if(!date||date.slice(0,7)!==period)continue;
      const uid=r.employeeUid||r.uid||doc.id.replace(/^\d{4}-\d{2}-\d{2}_/,'');
      const u=users[uid]||{};
      const key=uid||doc.id;
      let minutes=Number(r.totalMinutes||0);
      let late=r.checkIn&&r.checkIn.status==='late'?1:0;
      let blocks=[];
      try{const bs=await doc.ref.collection('timeBlocks').get();blocks=bs.docs.map(x=>x.data()||{})}catch(e){}
      if(blocks.length){
        let calculated=0;
        blocks.forEach(b=>{
          if(Number(b.minutes||0)>0)calculated+=Number(b.minutes);
          else if(b.localStart&&b.localEnd)calculated+=Math.max(0,hmMin(b.localEnd)-hmMin(b.localStart));
          else if(b.localStart&&!b.localEnd&&date===today()&&r.status==='open')calculated+=Math.max(0,hmMin(hmNow())-hmMin(b.localStart));
        });
        if(calculated>0)minutes=Math.max(minutes,calculated);
      }
      out[key]=out[key]||{employeeCode:r.employeeCode||u.employeeCode||'SIN_CODIGO',userName:r.userName||u.name||'Sin nombre',workDays:0,totalHours:0,incompleteDays:0,lateCount:0};
      out[key].workDays++;
      out[key].totalHours=Math.round((out[key].totalHours+minutes/60)*100)/100;
      out[key].lateCount+=late;
      if(r.status==='incomplete_legacy')out[key].incompleteDays++;
    }
    return Object.values(out);
  }
  B.services.reports={
    monthly: period => isDemo()?B.BitacoraRuntimeAdapter.getMonthly(period):monthlyProduction(period),
    all: () => B.BitacoraRuntimeAdapter.getAll()
  };
})(window.Bitacora);