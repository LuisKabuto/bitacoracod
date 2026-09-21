/* Bitácora PRO v3 - servicio de usuarios */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};
(function(B){
  const codeMap={
    'luis puentes':'EMP-001',
    'osledy avila':'EMP-002',
    'fernanda montañez':'EMP-003',
    'asser de oliveira':'EMP-004',
    'lesamir colmenares':'EMP-005',
    'edwar vielma':'EMP-006',
    'maryori sanchez':'EMP-007',
    'carlos malpica':'EMP-008',
    'mileska ocando':'EMP-009',
    'jaime gaviria':'EMP-010'
  };
  B.services.users={
    list:()=>B.BitacoraRuntimeAdapter.getUsers(),
    assignSequentialCodes:async()=>{
      if(typeof DEMO!=='undefined'&&DEMO)return {updated:0,skipped:0};
      const db=firebase.firestore(),snap=await db.collection('users').get();
      let updated=0,skipped=0;
      const batch=db.batch();
      snap.docs.forEach(doc=>{
        const u=doc.data()||{},key=String(u.name||'').trim().toLowerCase(),code=codeMap[key];
        if(!code){skipped++;return}
        if(u.employeeCode===code)return;
        batch.update(doc.ref,{employeeCode:code});
        updated++;
      });
      if(updated)await batch.commit();
      return {updated,skipped};
    }
  };
})(window.Bitacora);