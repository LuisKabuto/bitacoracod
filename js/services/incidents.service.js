/* Bitácora PRO v3 - servicio de incidencias */
window.Bitacora=window.Bitacora||{};
window.Bitacora.services=window.Bitacora.services||{};
(function(B){
  const demo=()=>typeof DEMO!=='undefined'&&DEMO;
  let seq=3;
  const demoRows=[
    {id:'i1',title:'Intermitencia de conexión',category:'Conectividad',priority:'high',status:'open',assignedTo:'u_osle',assignedName:'Osledy Avila',description:'Revisar estabilidad de la conexión durante la jornada.',createdBy:'u_admin',createdAt:new Date(),updatedAt:new Date()},
    {id:'i2',title:'Revisión de equipo',category:'Equipo',priority:'medium',status:'in_progress',assignedTo:'u_fer',assignedName:'Fernanda Montañez',description:'Verificar equipo reportado por supervisión.',createdBy:'u_admin',createdAt:new Date(),updatedAt:new Date()}
  ];
  const listeners=[];
  function emit(){listeners.slice().forEach(fn=>fn(demoRows.map(x=>({...x}))));}
  function demoService(){
    return {
      subscribe(cb){listeners.push(cb);cb(demoRows.map(x=>({...x})));return()=>{const i=listeners.indexOf(cb);if(i>=0)listeners.splice(i,1)}},
      create(data){const now=new Date();demoRows.unshift({...data,id:'i'+seq++,createdAt:now,updatedAt:now});emit();return Promise.resolve()},
      update(id,status){const item=demoRows.find(x=>x.id===id);if(!item)return Promise.resolve();item.status=status;item.updatedAt=new Date();emit();return Promise.resolve()}
    };
  }
  B.services.incidents={
    subscribe(callback){
      if(demo())return demoService().subscribe(callback);
      return firebase.firestore().collection('incidents').orderBy('createdAt','desc').onSnapshot(s=>callback(s.docs.map(d=>({id:d.id,...d.data()}))),e=>console.error('Incidencias:',e));
    },
    create(data){
      if(demo())return demoService().create(data);
      return firebase.firestore().collection('incidents').add({...data,createdAt:firebase.firestore.FieldValue.serverTimestamp(),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    },
    update(id,status){
      if(demo())return demoService().update(id,status);
      return firebase.firestore().collection('incidents').doc(id).update({status,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
    }
  };
})(window.Bitacora);
