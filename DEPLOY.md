# Guia de Despliegue — Sistema de Gestion de Espacios Publicos

Este documento explica paso a paso como publicar el sistema en internet de forma gratuita usando:

- **Neon** — Base de datos PostgreSQL en la nube (gratuito, permanente)
- **Render** — Hosting del servidor Node.js (gratuito)
- **GitHub** — Repositorio de codigo fuente

---

## Requisitos previos

- Tener instalado [Git](https://git-scm.com/download/win)
- Tener instalado [Node.js](https://nodejs.org) (version 18 o superior)
- Tener una cuenta en [GitHub](https://github.com)

---

## Paso 1 — Crear la base de datos en Neon

1. Ir a [https://neon.tech](https://neon.tech) y crear una cuenta gratuita
2. Crear un nuevo proyecto (nombre libre, region recomendada: **US East**)
3. Una vez creado el proyecto, ir al menu izquierdo → **SQL Editor**
4. Abrir el archivo `database_setup_pg.sql` del proyecto
5. Copiar todo el contenido (`Ctrl+A`, `Ctrl+C`) y pegarlo en el SQL Editor de Neon
6. Hacer clic en **Run** — se crean todas las tablas, vistas y datos iniciales
7. Ir a **Connection Details** (menu izquierdo) y copiar la cadena de conexion, que tiene el formato:

```
postgresql://usuario:contrasena@host.neon.tech/neondb?sslmode=require
```

> Esta cadena se usara en los pasos siguientes como `DATABASE_URL`.

---

## Paso 2 — Configurar el archivo `.env` (solo para desarrollo local)

En la raiz del proyecto, crear un archivo llamado `.env` con el siguiente contenido:

```env
DATABASE_URL=postgresql://usuario:contrasena@host.neon.tech/neondb?sslmode=require
PORT=3000
DB_SSL=true
```

Reemplazar la linea `DATABASE_URL` con la cadena de conexion copiada en el Paso 1.

> El archivo `.env` esta incluido en `.gitignore` y **nunca se sube a GitHub** para proteger las credenciales.

Para probar localmente:

```bash
node server_espacios_publicos.js
```

Abrir el navegador en `http://localhost:3000`

---

## Paso 3 — Subir el codigo a GitHub

### 3.1 Inicializar el repositorio

```bash
git init
git add .
git commit -m "Sistema espacios publicos - PostgreSQL Neon"
```

### 3.2 Conectar con GitHub y subir

```bash
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

Reemplazar la URL con la direccion de tu repositorio en GitHub.

> Si es la primera vez que usas git, puede pedir configurar nombre y correo:
> ```bash
> git config --global user.email "tu@correo.com"
> git config --global user.name "Tu Nombre"
> ```

---

## Paso 4 — Desplegar en Render

### 4.1 Crear cuenta y conectar repositorio

1. Ir a [https://render.com](https://render.com) y crear una cuenta (puede usarse la cuenta de GitHub)
2. Hacer clic en **New +** → **Web Service**
3. Seleccionar **"Build and deploy from a Git repository"**
4. Conectar la cuenta de GitHub y seleccionar el repositorio del proyecto

### 4.2 Configurar el servicio

| Campo | Valor |
|---|---|
| **Name** | `sistema-espacios-publicos` (o el nombre deseado) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server_espacios_publicos.js` |
| **Instance Type** | `Free` |

### 4.3 Agregar variable de entorno

En la seccion **Environment Variables** del formulario de Render, agregar:

| Key | Value |
|---|---|
| `DATABASE_URL` | La cadena de conexion de Neon copiada en el Paso 1 |

### 4.4 Desplegar

Hacer clic en **"Deploy Web Service"**.

Render tardara aproximadamente 2 minutos en construir y desplegar el servidor. Al terminar, se mostrara una URL publica con el formato:

```
https://sistema-espacios-publicos.onrender.com
```

Esa URL es la direccion publica del sistema, accesible desde cualquier dispositivo con internet.

---

## Paso 5 — Actualizar el sistema (cambios futuros)

Cada vez que se realicen cambios al codigo, ejecutar:

```bash
git add .
git commit -m "Descripcion del cambio"
git push
```

Render detecta automaticamente el nuevo codigo en GitHub y redesplega el servidor sin intervencion manual.

---

## Credenciales de acceso al sistema

| Usuario | Contrasena | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `celedonio` | `123` | Jefe de Departamento |

> Se recomienda cambiar estas contrasenas despues del primer acceso en produccion.

---

## Estructura de archivos relevantes

```
├── server_espacios_publicos.js   # Servidor Node.js + Express (backend)
├── index_espacios_publicos.html  # Interfaz de usuario (frontend)
├── script_espacios_publicos.js   # Logica del cliente (JavaScript)
├── estilo_espacios_publicos.css  # Estilos visuales
├── database_setup_pg.sql         # Schema de base de datos PostgreSQL
├── package.json                  # Dependencias del proyecto
├── .env                          # Variables de entorno (NO subir a GitHub)
├── .env.example                  # Plantilla del archivo .env
└── .gitignore                    # Archivos excluidos de Git
```

---

## Servicios utilizados (plan gratuito)

| Servicio | Limite gratuito |
|---|---|
| **Neon** | 0.5 GB almacenamiento, escala a cero cuando inactivo |
| **Render** | 750 horas/mes, se duerme tras 15 min sin uso |

> En el plan gratuito de Render, la primera solicitud despues de inactividad puede tardar ~30 segundos en responder mientras el servidor se reactiva. Esto es normal.
