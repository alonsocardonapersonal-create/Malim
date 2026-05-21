# 🌿 Sistema de Gestión de Espacios Públicos
### *Transformando la operación municipal con tecnología real*
**Ayuntamiento de Matamoros, Tamaulipas · 2026**

---

## ¿De qué trata esto?

El departamento de Espacios Públicos trabaja todos los días en los parques, plazas y áreas verdes de Matamoros. Poda, riego, limpieza, reforestación — cientos de intervenciones al mes.

Antes: papel, hojas de cálculo sueltas, sin seguimiento claro.

**Ahora: una plataforma web en tiempo real, accesible desde cualquier dispositivo, con trazabilidad completa desde la actividad de campo hasta el Plan Municipal de Desarrollo.**

---

## ¿Qué puede hacer el sistema?

### 📋 Registro de Actividades Diarias
Cada intervención en campo queda capturada al instante — fecha, lugar, tipo de trabajo, superficie atendida y quién lo realizó. Nada se pierde.

### 🗺️ Catálogo de Áreas Públicas
15 espacios registrados: parques, jardines, plazas cívicas, camellones y unidades deportivas. El personal solo selecciona el área, sin escribir direcciones a mano.

### 📊 Dashboard con Semáforo de Avance
Una sola pantalla que muestra en tiempo real cómo va cada línea de acción del PMD:

| Color | Significado |
|-------|-------------|
| 🟢 Verde | Avance del 80% o más — ¡vamos bien! |
| 🟡 Amarillo | Entre 50% y 79% — en progreso |
| 🔴 Rojo | Menos del 50% — requiere atención |

### 📁 PMD Digital (Plan Municipal de Desarrollo)
Todas las líneas de acción del trienio digitalizadas, con metas anuales, mensuales, indicadores y alineación con planes nacional y estatal.

### 💰 POA (Programa Operativo Anual)
Planeación presupuestal ligada al PMD: desglose por fuente de financiamiento (municipal, estatal, federal) y actividades programadas mes a mes.

### 🔍 Consultas y Reportes
Búsqueda de actividades por fecha, área, colonia o línea de acción. Listo para auditorías y reportes a autoridades.

---

## 👥 Dos tipos de usuarios

- **Personal operativo** — registra las actividades del día a día en campo
- **Administrador** — gestiona catálogos, revisa el dashboard completo y genera reportes

Acceso seguro con usuario y contraseña desde cualquier navegador. Sin instalación, sin licencias.

---

## 🛠️ ¿Con qué se construyó?

El sistema fue desarrollado completamente con tecnología moderna, robusta y de código abierto:

### Frontend (lo que ves en pantalla)
| Tecnología | Para qué se usó |
|------------|-----------------|
| **HTML5** | Estructura de todas las pantallas de la aplicación |
| **CSS3** | Diseño visual, colores, semáforos y diseño responsivo |
| **JavaScript** | Toda la lógica interactiva del lado del usuario |

### Backend (el motor del sistema)
| Tecnología | Para qué se usó |
|------------|-----------------|
| **Node.js** | Servidor de la aplicación — recibe y procesa todas las peticiones |
| **Express.js** | Framework que organiza las rutas y la API del sistema |
| **PostgreSQL** | Base de datos relacional donde vive toda la información |
| **pg (node-postgres)** | Conector entre Node.js y la base de datos |
| **dotenv** | Manejo seguro de variables de entorno y credenciales |
| **CORS** | Permite la comunicación segura entre frontend y backend |
| **Crypto (SHA-256)** | Cifrado de contraseñas — ninguna contraseña se guarda en texto plano |

### Infraestructura y despliegue
| Servicio | Para qué se usó |
|----------|-----------------|
| **Neon** | Base de datos PostgreSQL en la nube (alojamiento gratuito y permanente) |
| **Render** | Servidor Node.js publicado en internet (hosting gratuito) |
| **GitHub** | Control de versiones y repositorio del código fuente |

### Herramientas de desarrollo
| Herramienta | Para qué se usó |
|-------------|-----------------|
| **nodemon** | Reinicio automático del servidor durante el desarrollo |
| **VS Code** | Editor de código principal |

---

## 🌐 100% en la nube, sin costo de infraestructura

El sistema corre completamente en internet usando servicios gratuitos de nivel profesional. No requiere servidores propios, no requiere mantenimiento de hardware. Solo un navegador y conexión a internet.

---

## 📐 Arquitectura en una línea

```
Navegador (HTML + CSS + JS)  →  API REST (Node.js + Express)  →  PostgreSQL (Neon)
          ↑                              ↑
     Render (hosting)              GitHub (código)
```

---

## ¿Por qué importa?

> *"Antes no sabíamos cuánto se había avanzado hasta que terminaba el año. Ahora lo vemos el mismo día."*

Este sistema convierte el trabajo diario del departamento en datos accionables. Cada registro de campo suma al indicador del PMD. Cada meta mensual es visible. Cada peso del presupuesto tiene una actividad asociada.

**Del trabajo en campo al informe de gobierno — todo conectado, todo en tiempo real.**

---

*Sistema de Gestión de Actividades de Espacios Públicos · v2.0 · Matamoros, Tamaulipas · 2026*
