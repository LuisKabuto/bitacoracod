/* Bitácora PRO v3 - bootstrap */
(function () {
  const modules = [
    'js/core/config.js',
    'js/core/utils.js',
    'js/core/notifications.js',
    'js/core/app-core.js'
  ];
  let index = 0;
  function loadNext() {
    if (index >= modules.length) return;
    const script = document.createElement('script');
    script.src = modules[index++];
    script.async = false;
    script.onload = loadNext;
    script.onerror = function () {
      console.error('No se pudo cargar el módulo:', script.src);
    };
    document.body.appendChild(script);
  }
  loadNext();
})();
