/* Bitácora PRO v3 - bootstrap */
/* La lógica existente vive temporalmente en core/app-core.js para permitir una migración segura por módulos. */
(function(){
  var script=document.createElement('script');
  script.src='js/core/app-core.js';
  script.async=false;
  document.body.appendChild(script);
})();
