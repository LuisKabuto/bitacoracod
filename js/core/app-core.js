/* Bitácora PRO v3 - core bridge */
/* Carga el núcleo legado y expone su adaptador para los servicios nuevos. */
(function(){
  var script=document.createElement('script');
  script.src='js/core/legacy/app-legacy.js';
  script.async=false;
  script.onload=function(){
    if(typeof DS !== 'undefined') window.BitacoraRuntimeAdapter=DS;
    else console.error('Bitácora: no se encontró el runtime legado DS.');
    window.dispatchEvent(new CustomEvent('bitacora:runtime-ready'));
  };
  script.onerror=function(){ console.error('Bitácora: no se pudo cargar el núcleo legado.'); };
  document.body.appendChild(script);
})();
