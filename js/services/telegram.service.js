/* Bitácora PRO - notificaciones Telegram */
window.Bitacora = window.Bitacora || {};
window.Bitacora.services = window.Bitacora.services || {};

(function(B){
  function configured(){
    const c=B.config||{};
    return Boolean(c.telegramEndpoint && c.telegramSecret);
  }

  async function send(text){
    if(!configured()) return { skipped:true };
    try{
      const response=await fetch(B.config.telegramEndpoint,{
        method:'POST',
        headers:{
          'content-type':'application/json',
          'x-bitacora-secret':B.config.telegramSecret
        },
        body:JSON.stringify({text})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok || !data.ok) throw new Error(data.error||'No fue posible enviar Telegram');
      return data;
    }catch(error){
      console.error('Telegram:',error);
      return {error:error.message||'Error enviando Telegram'};
    }
  }

  function eventText(type,user,extra){
    const name=user?.name||'Usuario';
    const code=user?.employeeCode||'SIN_CODIGO';
    const date=B.utils.todayStr();
    const time=B.utils.nowHM();
    const title=type==='checkin'?'ENTRADA REGISTRADA':'SALIDA REGISTRADA';
    const lines=[
      'BITÁCORA PRO',
      '',
      type==='checkin'?'🟢 '+title:'🔴 '+title,
      'Empleado: '+name,
      'Código: '+code,
      'Fecha: '+date,
      'Hora: '+time
    ];
    if(extra?.activity) lines.push('Actividad: '+extra.activity);
    if(extra?.late){
      lines.push('⚠️ RETARDO');
      if(extra.justification) lines.push('Justificación: '+extra.justification);
    }
    if(extra?.hours!=null) lines.push('Horas acumuladas: '+Number(extra.hours).toFixed(2));
    return lines.join('\n');
  }

  B.services.telegram={
    send,
    checkIn:(user,extra)=>send(eventText('checkin',user,extra)),
    checkOut:(user,extra)=>send(eventText('checkout',user,extra))
  };
})(window.Bitacora);
