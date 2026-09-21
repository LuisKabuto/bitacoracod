/* Bitácora PRO v3 - servicio de reportes */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
(function(B){
  const isDemo=()=>typeof DEMO!=='undefined'&&DEMO;
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Caracas',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const hmMin=hm=>{const p=String(hm||'').split(':').map(Number);return (p[0]||0)*60+(p[1]||0)};
  const hoursBetween=(a,b)=>{
    if(!a||!b)return 0;
    const d1=new Date(a),d2=new Date(b);
    if(!isNaN(d1)&&!isNaN(d2))return Math.max(0,(d2-d1)/3600000);
    return Math.max(0,(hmMin(b)-hmMin(a))/60);
  };
  const aggregateEntries=async period=>{
    const nextPeriod=(()=>{const [y,m]=period.split('-').map(Number);const d=new Date(y,m,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')})()
    let snap=await firebase.firestore().collection('entries').where('date','>=',period+'-01').where('date','<',nextPeriod+'-01').get();
    if(snap.empty)snap=await firebase.firestore().collection('entries').get();
    const usersSnap=await firebase.firestore().collection('users').get();
    const usersById={},usersByName={};
    usersSnap.docs.forEach(d=>{const u=d.data()||{};usersById[d.id]=u;if(u.name)usersByName[String(u.name).trim().toLowerCase()]=u});
    const rows={};
    const employeeCodeOf=(r,u)=>r.employeeCode||r.code||r.codigo||r.employee_code||u.employeeCode||u.code||u.codigo||u.employee_code||u.employeeId||u.employeeID||'SIN_CODIGO';
    snap.docs.forEach(doc=>{
      const r=doc.data()||{};
      const rawDate=String(r.date||'').trim();
      if(rawDate.slice(0,7)!==period)return;
      const key=r.userId||r.userName||doc.id;
      const u=usersById[r.userId]||usersByName[String(r.userName||'').trim().toLowerCase()]||{};
      rows[key]=rows[key]||{employeeCode:employeeCodeOf(r,u),userName:r.userName||u.name||'Sin nombre',workDays:0,totalHours:0,incompleteDays:0,lateCount:0};
      rows[key].workDays++;
      let h=Number(r.hours||0);
      if(!h)h=hoursBetween(r.checkIn,r.checkOut);
      rows[key].totalHours=Math.round((rows[key].totalHours+h)*100)/100;
      if(r.status==='late'||(r.checkIn&&String(r.checkIn).toLowerCase().includes('late')))rows[key].lateCount++;
      if(!r.checkOut)rows[key].incompleteDays++;
    });
    return Object.values(rows);
  };
  async function monthlyProduction(period){
    const historical=await aggregateEntries(period);
    if(historical.length)return historical;
    const cacheSnap=await firebase.firestore().collection('rrhhMonthlyCache').where('period','==',period).get();
    const cached=cacheSnap.docs.map(d=>d.data()||{}).filter(x=>Number(x.workDays||0)>0||Number(x.totalHours||0)>0||Number(x.lateCount||0));
    if(cached.length)return cached;
    const [attendanceSnap,usersSnap]=await Promise.all([firebase.firestore().collection('attendance').get(),firebase.firestore().collection('users').get()]);
    const users={};usersSnap.docs.forEach(d=>users[d.id]={uid:d.id,...d.data()});
    const out={};
    for(const doc of attendanceSnap.docs){
      const r=doc.data()||{},date=typeof r.date==='string'?r.date.slice(0,10):'';
      if(!date||date.slice(0,7)!==period)continue;
      const uid=r.employeeUid||r.uid||doc.id.replace(/^\d{4}-\d{2}-\d{2}_/,'');
      const u=users[uid]||{},key=uid||doc.id;
      let minutes=Number(r.totalMinutes||0);
      const bs=await doc.ref.collection('timeBlocks').get();
      let calculated=0;
      bs.docs.forEach(x=>{const b=x.data()||{};if(Number(b.minutes||0)>0)calculated+=Number(b.minutes);else if(b.localStart&&b.localEnd)calculated+=Math.max(0,hmMin(b.localEnd)-hmMin(b.localStart))});
      if(calculated>0)minutes=Math.max(minutes,calculated);
      out[key]=out[key]||{employeeCode:r.employeeCode||u.employeeCode||'SIN_CODIGO',userName:r.userName||u.name||'Sin nombre',workDays:0,totalHours:0,incompleteDays:0,lateCount:0};
      out[key].workDays++;
      out[key].totalHours=Math.round((out[key].totalHours+minutes/60)*100)/100;
      if(r.checkIn&&r.checkIn.status==='late')out[key].lateCount++;
      if(r.status==='incomplete_legacy')out[key].incompleteDays++;
    }
    return Object.values(out);
  }
  B.services.reports={
    monthly:period=>isDemo()?B.BitacoraRuntimeAdapter.getMonthly(period):monthlyProduction(period),
    all:()=>B.BitacoraRuntimeAdapter.getAll()
  };
})(window.Bitacora);