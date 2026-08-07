# Roadmap de desarrollo

## Objetivo

Evolucionar la aplicación actual de forma incremental, preservando sus flujos existentes y la compatibilidad con los datos almacenados localmente.

## Sprint 0 — Línea base y regresión

**Objetivo:** establecer una referencia verificable del comportamiento actual.

- Documentar los flujos de inicio de sesión, registro de entrada/salida, tareas, asistencia, filtros, exportación y sincronización.
- Preparar datos de prueba anonimizados para validar importación y exportación.
- Definir una lista de comprobaciones manuales de regresión.
- Identificar el formato actual de `appData` y de la persistencia local.

**Criterio de salida:** se puede comprobar que una versión posterior conserva todos los flujos actuales.

## Sprint 1 — Estabilidad de datos

**Objetivo:** reducir errores sin modificar la experiencia visible.

- Centralizar el filtrado de historial para que la vista y la exportación CSV usen la misma lógica.
- Normalizar los datos cargados desde almacenamiento local, Firebase e importación JSON.
- Incorporar valores por defecto para colecciones y propiedades necesarias.
- Evitar múltiples temporizadores de revisión de tareas vencidas al reinicializar la aplicación.
- Validar referencias antes de eliminar personas o actividades.

**Criterio de salida:** los datos incompletos o importados no interrumpen las vistas principales, y los flujos existentes siguen funcionando.

## Sprint 2 — Persistencia y sincronización segura

**Objetivo:** aislar y corregir la persistencia sin cambiar las pantallas.

- Separar conceptualmente la persistencia local de la sincronización Firebase.
- Definir una única representación segura de los datos que se sincronizan.
- Evitar incluir credenciales locales o configuración de Firebase en cargas remotas.
- Manejar errores de sincronización y estados de conexión de forma consistente.
- Definir una estrategia para detectar o mitigar sobrescrituras entre dispositivos.

**Criterio de salida:** la sincronización no mezcla datos locales sensibles con el contenido operativo y presenta fallos de forma controlada.

## Sprint 3 — Seguridad y validación de entrada

**Objetivo:** reducir riesgos de ejecución de contenido y acceso no autorizado.

- Reemplazar generación insegura de contenido por renderizado seguro o escape de texto.
- Validar los datos importados antes de sustituir el estado de la aplicación.
- Revisar la autenticación local y definir una alternativa adecuada para un uso compartido.
- Documentar y aplicar reglas restrictivas de Firebase si la sincronización se utiliza en producción.
- Revisar la gestión de sesiones y contraseñas locales.

**Criterio de salida:** los datos introducidos por usuarios no se interpretan como HTML ejecutable y los datos externos se validan antes de usarse.

## Sprint 4 — Modularización interna

**Objetivo:** separar responsabilidades manteniendo el comportamiento.

- Extraer utilidades de fecha, formato, filtrado y búsqueda de entidades.
- Separar lógica de jornadas, tareas, asistencia y métricas de la manipulación del DOM.
- Crear servicios para almacenamiento, sincronización, exportación y notificaciones.
- Separar los estilos embebidos en archivos por responsabilidad: tokens, base, layout y componentes.
- Mantener los contratos de datos y la interfaz actual durante la extracción.

**Criterio de salida:** cada área funcional tiene responsabilidades delimitadas y no se introducen cambios funcionales intencionales.

## Sprint 5 — Eventos, interfaz y accesibilidad

**Objetivo:** desacoplar la interfaz del código global.

- Sustituir gradualmente atributos inline por `addEventListener` y delegación de eventos.
- Extraer renderizadores de tablas, tarjetas, badges, estados vacíos y modal.
- Reemplazar estilos inline repetidos por clases CSS reutilizables.
- Mejorar etiquetas, foco del modal, navegación por teclado y atributos ARIA.
- Verificar la experiencia móvil tras cada cambio.

**Criterio de salida:** la interfaz mantiene la misma funcionalidad, con eventos centralizados y mejoras de accesibilidad.

## Sprint 6 — Herramientas y pruebas automatizadas

**Objetivo:** habilitar mantenimiento seguro a largo plazo.

- Incorporar una herramienta de build ligera para módulos y dependencias.
- Declarar y fijar dependencias en un manifiesto de proyecto.
- Configurar formato y análisis estático.
- Añadir pruebas unitarias para reglas de negocio y normalización de datos.
- Añadir pruebas de extremo a extremo para los flujos críticos definidos en el Sprint 0.

**Criterio de salida:** cada cambio puede validarse automáticamente y las dependencias están reproduciblemente declaradas.

## Principio de entrega

Cada sprint debe finalizar con una comprobación de regresión de los flujos existentes. No se debe combinar una migración de estructura, cambios visuales y cambios de reglas de negocio en una misma entrega si no existe cobertura de pruebas suficiente.
