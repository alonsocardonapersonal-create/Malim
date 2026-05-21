# Nuevas Implementaciones
### *Mejoras y funcionalidades agregadas tras la presentacion inicial*
**Sistema de Gestion de Espacios Publicos · Malim v2.0 · Mayo 2026**

---

## Resumen

Despues de la entrega inicial documentada en la presentacion, el sistema recibio un segundo bloque de mejoras significativas: administracion completa del PMD, exportacion de datos a Excel y PDF, busqueda en tiempo real, un modulo completo de avisos internos, y mejoras visuales en la interfaz de login y el dashboard.

---

## 1. Administracion Completa del PMD

Antes, las lineas del Plan Municipal de Desarrollo solo podian editarse. Ahora el administrador puede:

- **Crear** nuevas lineas de accion desde un modal con todos los campos del PMD
- **Eliminar** lineas existentes (con validacion: no se puede eliminar si tiene registros POA asociados)

El sistema detecta errores como lineas duplicadas y los comunica con mensajes claros, sin crashear.

---

## 2. Exportar a Excel y PDF

Cada seccion principal del sistema ahora tiene botones de exportacion:

| Seccion | Excel | PDF |
|---------|-------|-----|
| Dashboard de Indicadores PMD | Si | Si |
| Consulta de Actividades | Si | Si |
| Plan Municipal de Desarrollo | Si | Si |
| Programa Operativo Anual | Si | Si |

### El PDF es un documento institucional profesional que incluye:

- **Logo** del sistema (Malim) en la esquina superior derecha
- **Encabezado**: Ayuntamiento de Matamoros, Tamaulipas / Departamento de Espacios Publicos
- **Linea divisoria** en verde institucional
- **Titulo** del reporte especifico
- **Fecha** de generacion y **nombre del usuario** que lo genero
- **Tabla** con cabecera verde, filas alternadas y fuente compacta
- **Pie de pagina** con numero de pagina y nombre del sistema en cada hoja

### Tecnologias usadas para exportacion:

| Libreria | Uso |
|----------|-----|
| **SheetJS (xlsx)** | Exportacion a `.xlsx` directo desde la tabla HTML |
| **jsPDF** | Generacion del PDF con estructura personalizada |
| **jsPDF-AutoTable** | Conversion de tablas HTML a tablas PDF formateadas |

---

## 3. Busqueda y Filtrado en Tiempo Real

Cada seccion tiene una barra de busqueda ubicada en el extremo derecho de la pantalla. Al escribir, filtra las filas de la tabla instantaneamente, sin recargar ni hacer peticiones al servidor.

Disponible en: Dashboard, Consultas, PMD y POA.

---

## 4. Mejoras en el Login

### Mostrar / Ocultar contrasena
El campo de contrasena ahora tiene un boton con icono de ojo que permite ver o esconder lo que se escribe. Util para evitar errores al ingresar.

### Animacion de ingreso exitoso
Al ingresar correctamente, la tarjeta de login realiza una animacion suave antes de abrir el sistema. Retroalimentacion visual clara de que el acceso fue correcto.

---

## 5. Modulo de Avisos Internos

Nuevo modulo de comunicacion interna entre los usuarios del sistema.

### Crear un aviso
- El remitente escribe un mensaje
- Selecciona uno o varios destinatarios (lista de todos los usuarios del sistema)
- Asigna un nivel de importancia:

| Nivel | Color | Uso recomendado |
|-------|-------|-----------------|
| Verde | Verde | Informativo / sin urgencia |
| Amarillo | Amarillo | Requiere atencion proxima |
| Rojo | Rojo | Urgente / accion inmediata |

### Ver avisos recibidos
- Tabla con todos los avisos del usuario (como remitente o destinatario)
- Ver el detalle completo: mensaje, destinatarios, fecha, estado
- Marcar como completado
- Responder directamente desde el modal

### Notificacion flotante
Al iniciar sesion, si el usuario tiene avisos pendientes sin revisar, aparece una notificacion flotante en la esquina inferior derecha de la pantalla. Usa los colores institucionales del sistema (verde), es discreta pero imposible de ignorar. Tiene boton para ir directo a la seccion de Avisos o cerrarla.

### Base de datos
Dos nuevas tablas en PostgreSQL:

- **`Avisos`** — almacena remitente, destinatarios (JSON), mensaje, importancia, estado completado y fecha
- **`Respuestas_Avisos`** — almacena las respuestas asociadas a cada aviso con autor, mensaje y fecha

---

## 6. Dashboard: Filas al 100% en Verde

Cuando una linea de accion del PMD ha alcanzado el 100% o mas de su meta anual, la fila completa en el dashboard cambia a fondo verde. Identificacion visual rapida de los logros alcanzados.

---

## 7. Nuevo Usuario

Se agrego un tercer usuario al sistema:

| Campo | Valor |
|-------|-------|
| Usuario | `patolucas` |
| Nombre | Pato lucas |
| Contrasena | `444` |

La contrasena se almacena cifrada con SHA-256. Nunca se guarda en texto plano.

---

## Detalle tecnico de los cambios

| Archivo | Cambios realizados |
|---------|--------------------|
| `server_espacios_publicos.js` | Endpoints POST/DELETE para PMD; 6 endpoints nuevos para Avisos (GET, POST, PUT, GET pendientes, lista usuarios, POST respuesta) |
| `index_espacios_publicos.html` | Botones exportar, barra busqueda, toggle password, tab Avisos, tabla avisos, 2 modales avisos, notificacion flotante, imagen preload para PDF |
| `script_espacios_publicos.js` | Funciones exportarExcel/exportarPDF, filtrarTabla, cargarAvisos, verificarAvisosPendientes, abrirVerAviso, cargarUsuariosDestinatarios, todos los listeners de Avisos, animacion login, color fila 100% |
| `estilo_espacios_publicos.css` | Estilos para exportar/busqueda, toggle password, aviso flotante, badges de importancia, filas completadas, layout search-derecha |
| `database_setup_pg.sql` | Tablas Avisos y Respuestas_Avisos; tercer usuario patolucas |

---

*Sistema de Gestion de Actividades de Espacios Publicos · v2.0 · Matamoros, Tamaulipas · 2026*
