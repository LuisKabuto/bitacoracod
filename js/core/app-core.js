/* Bitácora PRO v3 - core bootstrap */
/* Carga el núcleo legado mientras se migran sus módulos de forma segura. */
(function(){
  var script=document.createElement('script');
  script.src='js/core/legacy/app-legacy.js';
  script.async=false;
  document.body.appendChild(script);
})();
