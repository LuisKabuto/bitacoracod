# Arquitectura

## Estado actual

El proyecto es una aplicación web de página única (SPA) para el control de actividades de oficina. Toda la aplicación está contenida en `index.html`; no existe un sistema de build, archivos JavaScript o CSS separados, gestor de dependencias ni backend propio.

La aplicación funciona directamente en el navegador y mantiene su estado en memoria mediante el objeto global `appData`.

## Estructura del proyecto

```text
.
└── index.html
    ├── HTML: pantallas, formularios, tablas, modal y navegación
    ├── CSS embebido: diseño, componentes y adaptación móvil
    └── JavaScript embebido: estado, lógica de negocio, renderizado y persistencia
```

## Capas actuales

Aunque el código no está separado físicamente en módulos, su comportamiento se organiza de la siguiente manera:

| Área | Responsabilidad actual |
|---|---|
| Interfaz | Muestra dashboard, registro diario, tareas, historial, asistencia, reportes y configuración. |
| Estado | `appData` almacena actividades, personas, jornadas, tareas, asistencia, meta diaria y credenciales locales. |
| Persistencia local | Los datos se guardan en `localStorage` bajo la clave `bitacora_data`. |
| Sesión | La sesión se marca en `sessionStorage` con la clave `bitacora_session`. |
| Sincronización opcional | Firebase Realtime Database permite sincronizar datos cuando se proporciona una configuración desde la interfaz. |
| Analítica | Chart.js genera gráficos de dashboard y reportes. |
| Exportación | Se genera CSV para historial y PDF mediante html2canvas y jsPDF. |

## Organización funcional

### Navegación y vistas

Las vistas son secciones HTML identificadas por `id`. La función `showSection()` activa una sección y actualiza su contenido cuando corresponde. La navegación no utiliza rutas ni cambia la URL.

### Registro diario

Gestiona entradas, salidas y el cálculo de horas de jornada. Las entradas abiertas se almacenan en `activeEntries`; al registrar una salida se crea un registro definitivo en `entries`.

### Tareas

Permite asignar tareas a personas, cambiar su estado entre pendiente, en progreso y completada, registrar comentarios y mostrar vencimientos.

### Historial y asistencia

El historial permite filtrar registros por mes, actividad, persona y texto de notas. La asistencia se guarda por persona y fecha en el objeto `attendance`.

### Dashboard y reportes

El dashboard resume horas, personas, actividades y tareas. Los reportes mensuales muestran métricas, gráficos y tablas, y se pueden exportar como PDF.

## Dependencias externas

- Google Fonts: fuente Poppins.
- Chart.js: gráficos.
- html2canvas: captura visual para exportación.
- jsPDF: creación de PDF.
- Firebase App Compat y Firebase Realtime Database Compat: sincronización opcional.

Las dependencias se cargan desde CDN directamente en el documento HTML.

## Reglas de desarrollo

Estas reglas preservan el funcionamiento actual mientras el proyecto evoluciona:

1. Mantener compatibilidad con los datos existentes de `localStorage`, especialmente con la clave `bitacora_data`.
2. No cambiar la forma de los datos persistidos sin incluir una migración o normalización al cargarlos.
3. Centralizar las operaciones de lectura y escritura del estado; evitar mutaciones dispersas de `appData` cuando se incorporen módulos.
4. Mantener separados los datos locales de las credenciales y de la configuración de sincronización remota.
5. No insertar texto introducido por usuarios mediante HTML sin escape o creación segura de nodos DOM.
6. Antes de eliminar personas o actividades, comprobar registros, tareas y asistencia que las referencien.
7. Usar fechas locales de forma consistente para evitar cambios de día por conversiones UTC.
8. Mantener la destrucción de instancias anteriores de Chart.js antes de crear gráficos nuevos.
9. Agregar pruebas de regresión antes de modificar flujos críticos: inicio de sesión, jornadas, tareas, asistencia, importación/exportación y sincronización.
10. Sustituir progresivamente los eventos inline por listeners JavaScript, conservando el comportamiento de la interfaz en cada cambio.

## Límites actuales

- El inicio de sesión es local y no equivale a un sistema de autenticación de servidor.
- La sincronización depende de la configuración y reglas del proyecto Firebase proporcionado por quien use la aplicación.
- La aplicación se distribuye como un único documento y no cuenta con una capa de API propia.
