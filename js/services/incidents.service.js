/* Bitácora PRO v3 - servicio de incidencias
   DEMO: persistencia en memoria. Firebase: preparado para futura colección sin escribir datos. */
window.Bitacora=window.Bitacora||{};
window.Bitacora.services=window.Bitacora.services||{};
(function(B){
  let seq=3;
  const incidents=[
    {id:'i1',title:'Intermitencia de conexión',category:'Conectividad',priority:'high',status:'open',assignedTo:'u_osle',assignedName:'Osledy Avila',description:'Revisar estabilidad de la conexión durante la jornada.',createdBy:'u_admin',createdAt:new Date(),updatedAt:new Date()},
    {id:'i2',title:'Revisión de equipo',category:'Equipo',priority:'medium',status:'in_progress',assignedTo:'u_fer',assignedName:'Fernanda Montañez',description:'Verificar equipo reportado por supervisión.',createdBy:'u_admin',createdAt:new Date()}
  ];
  const listeners=[];
  function emit(){listeners.slice().forEach(fn=>fn(incidents.map(x=>({...x}))));}
  B.services.incidents={
    subscribe(callback){listeners.push(callback);callback(incidents.map(x=>({...x})));return()=>{const i=listeners.indexOf(callback);if(i>=0)listeners.splice(i,1)}},
    create(data){const now=new Date();incidents.unshift({...data,id:'i'+seq++,createdAt:now,updatedAt:now});emit();return Promise.resolve()},
    update(id,status){const item=incidents.find(x=>x.id===id);if(!item)return Promise.resolve();item.status=status;item.updatedAt=new Date();emit();return Promise.resolve()}
  };
})(window.Bitacora);
