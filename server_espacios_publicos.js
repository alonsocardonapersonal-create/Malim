// =====================================================
// Servidor Backend - Sistema de Gestion de Actividades
// de Espacios Publicos
// Node.js + Express + PostgreSQL (pg)
// Ayuntamiento de Matamoros, Tamaulipas
// =====================================================

require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors    = require('cors');
const path    = require('path');
const crypto  = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// =====================================================
// Conexion PostgreSQL (Neon / local)
// =====================================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false'
        ? false
        : { rejectUnauthorized: false }
});

// Verifica conexion al iniciar
pool.query('SELECT 1').then(() => {
    console.log('Conexion exitosa a PostgreSQL');
}).catch(err => {
    console.error('Error al conectar PostgreSQL:', err.message);
});

// =====================================================
// AUTENTICACION
// =====================================================

app.post('/api/login', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;
        if (!usuario || !contrasena) {
            return res.status(400).json({ error: 'Usuario y contrasena son requeridos' });
        }
        const hash = crypto.createHash('sha256').update(contrasena).digest('hex');
        const result = await pool.query(
            `SELECT "ID_Usuario", "Usuario", "Nombre"
             FROM "Usuarios"
             WHERE "Usuario" = $1 AND "Contrasena" = $2 AND "Activo" = TRUE`,
            [usuario, hash]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario o contrasena incorrectos' });
        }
        res.json({ success: true, usuario: result.rows[0] });
    } catch (err) {
        console.error('Error en POST /api/login:', err);
        res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
});

// =====================================================
// CATALOGOS
// =====================================================

app.get('/api/programas', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT "ID_Programa", "Clave_Programa", "Nombre_Programa" FROM "Programas" ORDER BY "Clave_Programa"'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener programas', details: err.message });
    }
});

app.get('/api/estrategias', async (req, res) => {
    try {
        const { id_programa } = req.query;
        let query = 'SELECT "ID_Estrategia", "Clave_Estrategia", "Nombre_Estrategia", "ID_Programa" FROM "Estrategias"';
        const params = [];
        if (id_programa) {
            params.push(parseInt(id_programa));
            query += ' WHERE "ID_Programa" = $1';
        }
        query += ' ORDER BY "Clave_Estrategia"';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estrategias', details: err.message });
    }
});

app.get('/api/lineas-accion', async (req, res) => {
    try {
        const { id_estrategia } = req.query;
        let query = `SELECT "ID_Linea_Accion", "Clave_Linea", "Descripcion_Linea",
                            "Meta_Anual", "Unidad_Medida", "ID_Estrategia"
                     FROM "Lineas_Accion"`;
        const params = [];
        if (id_estrategia) {
            params.push(parseInt(id_estrategia));
            query += ' WHERE "ID_Estrategia" = $1';
        }
        query += ' ORDER BY "Clave_Linea"';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener lineas de accion', details: err.message });
    }
});

app.get('/api/indicadores', async (req, res) => {
    try {
        const { id_linea } = req.query;
        let query = `SELECT "ID_Indicador", "Codigo_Indicador", "Descripcion",
                            "Unidad_Medida", "Meta_Indicador", "ID_Linea_Accion"
                     FROM "Indicadores"`;
        const params = [];
        if (id_linea) {
            params.push(parseInt(id_linea));
            query += ' WHERE "ID_Linea_Accion" = $1';
        }
        query += ' ORDER BY "Codigo_Indicador"';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener indicadores', details: err.message });
    }
});

app.get('/api/ods', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT "ID_ODS", "Numero_ODS", "Nombre_ODS" FROM "ODS" ORDER BY "Numero_ODS"'
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener ODS', details: err.message });
    }
});

app.get('/api/areas', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ca."Numero_Area", ca."Ubicacion", ca."Tipo_Area", ca."Entre_Calle_1", ca."Entre_Calle_2",
                    ca."Es_Prioritaria", la."Clave_Linea"
             FROM "Catalogo_Areas" ca
             LEFT JOIN "Lineas_Accion" la ON la."ID_Linea_Accion" = ca."ID_Linea_Accion"
             ORDER BY ca."Numero_Area"`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener areas', details: err.message });
    }
});

app.get('/api/areas/:numero', async (req, res) => {
    try {
        const numero = parseInt(req.params.numero);
        if (isNaN(numero)) return res.status(400).json({ error: 'Numero de area invalido' });
        const result = await pool.query(
            `SELECT ca.*, la."ID_Estrategia"
             FROM "Catalogo_Areas" ca
             LEFT JOIN "Lineas_Accion" la ON la."ID_Linea_Accion" = ca."ID_Linea_Accion"
             WHERE ca."Numero_Area" = $1`,
            [numero]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Area no encontrada' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar area', details: err.message });
    }
});

// =====================================================
// ACTIVIDADES
// =====================================================

app.post('/api/actividades', async (req, res) => {
    try {
        const {
            id_estrategia, orden_trabajo, fecha, id_linea_accion,
            numero_area, id_indicador, colonia, calle,
            acciones, id_ods, superficie,
            barrida, metaliqueo, wireado, raspado,
            cantidad_barrida, superficie_barrida,
            cantidad_metaliqueo, superficie_metaliqueo,
            cantidad_wireado, superficie_wireado,
            cantidad_raspado, superficie_raspado,
            jefe, supervisor, comentarios, origen_peticion
        } = req.body;

        if (!id_estrategia || !fecha || !id_linea_accion) {
            return res.status(400).json({ error: 'Campos obligatorios: estrategia, fecha, linea de accion' });
        }

        const totalCantidad =
            (cantidad_barrida    ? parseFloat(cantidad_barrida)    : 0) +
            (cantidad_metaliqueo ? parseFloat(cantidad_metaliqueo) : 0) +
            (cantidad_wireado    ? parseFloat(cantidad_wireado)    : 0) +
            (cantidad_raspado    ? parseFloat(cantidad_raspado)    : 0) || null;

        const result = await pool.query(
            `INSERT INTO "Actividades_Diarias" (
                "ID_Estrategia", "Orden_Trabajo", "Fecha", "ID_Linea_Accion",
                "Numero_Area", "ID_Indicador", "Colonia", "Calle",
                "Acciones", "ID_ODS", "Cantidad", "Superficie",
                "Barrida", "Metaliqueo", "Wireado", "Raspado",
                "Cantidad_Barrida", "Superficie_Barrida",
                "Cantidad_Metaliqueo", "Superficie_Metaliqueo",
                "Cantidad_Wireado", "Superficie_Wireado",
                "Cantidad_Raspado", "Superficie_Raspado",
                "Jefe", "Supervisor", "Comentarios", "Origen_Peticion"
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
            RETURNING "ID_Actividad"`,
            [
                parseInt(id_estrategia),
                orden_trabajo || null,
                fecha,
                parseInt(id_linea_accion),
                numero_area   ? parseInt(numero_area)   : null,
                id_indicador  ? parseInt(id_indicador)  : null,
                colonia       || null,
                calle         || null,
                acciones      || null,
                id_ods        ? parseInt(id_ods)        : null,
                totalCantidad,
                superficie    || null,
                barrida    ? true : false,
                metaliqueo ? true : false,
                wireado    ? true : false,
                raspado    ? true : false,
                cantidad_barrida    != null && cantidad_barrida    !== '' ? parseFloat(cantidad_barrida)    : null,
                superficie_barrida    || null,
                cantidad_metaliqueo != null && cantidad_metaliqueo !== '' ? parseFloat(cantidad_metaliqueo) : null,
                superficie_metaliqueo || null,
                cantidad_wireado    != null && cantidad_wireado    !== '' ? parseFloat(cantidad_wireado)    : null,
                superficie_wireado    || null,
                cantidad_raspado    != null && cantidad_raspado    !== '' ? parseFloat(cantidad_raspado)    : null,
                superficie_raspado    || null,
                jefe        || null,
                supervisor  || null,
                comentarios || null,
                origen_peticion || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Actividad registrada exitosamente',
            id_actividad: result.rows[0].ID_Actividad
        });
    } catch (err) {
        console.error('Error en POST /api/actividades:', err);
        res.status(500).json({ error: 'Error al registrar actividad', details: err.message });
    }
});

app.get('/api/actividades', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                ad."ID_Actividad", ad."Orden_Trabajo",
                TO_CHAR(ad."Fecha", 'YYYY-MM-DD') AS "Fecha",
                e."Clave_Estrategia", e."Nombre_Estrategia",
                la."Clave_Linea", la."Descripcion_Linea",
                ad."Numero_Area", ca."Ubicacion",
                ad."Colonia", ad."Calle",
                ad."Acciones", o."Nombre_ODS",
                ad."Cantidad", ad."Superficie",
                ad."Barrida", ad."Metaliqueo", ad."Wireado", ad."Raspado",
                ad."Cantidad_Barrida", ad."Superficie_Barrida",
                ad."Cantidad_Metaliqueo", ad."Superficie_Metaliqueo",
                ad."Cantidad_Wireado", ad."Superficie_Wireado",
                ad."Cantidad_Raspado", ad."Superficie_Raspado",
                ad."Jefe", ad."Supervisor", ad."Comentarios", ad."Origen_Peticion",
                ad."Fecha_Registro"
            FROM "Actividades_Diarias" ad
            JOIN "Estrategias" e           ON e."ID_Estrategia"    = ad."ID_Estrategia"
            JOIN "Lineas_Accion" la        ON la."ID_Linea_Accion" = ad."ID_Linea_Accion"
            LEFT JOIN "Catalogo_Areas" ca  ON ca."Numero_Area"     = ad."Numero_Area"
            LEFT JOIN "ODS" o              ON o."ID_ODS"           = ad."ID_ODS"
            ORDER BY ad."Fecha" DESC, ad."ID_Actividad" DESC
        `);
        res.json({ success: true, data: result.rows, total: result.rows.length });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener actividades', details: err.message });
    }
});

app.get('/api/actividades/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });
        const result = await pool.query(
            `SELECT
                "ID_Actividad", "ID_Estrategia", "Orden_Trabajo",
                TO_CHAR("Fecha", 'YYYY-MM-DD') AS "Fecha",
                "ID_Linea_Accion", "Numero_Area", "ID_Indicador",
                "Colonia", "Calle", "Acciones", "ID_ODS",
                "Cantidad", "Superficie",
                "Barrida", "Metaliqueo", "Wireado", "Raspado",
                "Cantidad_Barrida", "Superficie_Barrida",
                "Cantidad_Metaliqueo", "Superficie_Metaliqueo",
                "Cantidad_Wireado", "Superficie_Wireado",
                "Cantidad_Raspado", "Superficie_Raspado",
                "Jefe", "Supervisor", "Comentarios", "Origen_Peticion"
             FROM "Actividades_Diarias"
             WHERE "ID_Actividad" = $1`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener actividad', details: err.message });
    }
});

app.put('/api/actividades/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });
        const {
            id_estrategia, orden_trabajo, fecha, id_linea_accion,
            numero_area, id_indicador, colonia, calle,
            acciones, id_ods, superficie,
            barrida, metaliqueo, wireado, raspado,
            cantidad_barrida, superficie_barrida,
            cantidad_metaliqueo, superficie_metaliqueo,
            cantidad_wireado, superficie_wireado,
            cantidad_raspado, superficie_raspado,
            jefe, supervisor, comentarios, origen_peticion
        } = req.body;
        if (!id_estrategia || !fecha || !id_linea_accion) {
            return res.status(400).json({ error: 'Campos obligatorios: estrategia, fecha, linea de accion' });
        }
        const totalCantidad =
            (cantidad_barrida    ? parseFloat(cantidad_barrida)    : 0) +
            (cantidad_metaliqueo ? parseFloat(cantidad_metaliqueo) : 0) +
            (cantidad_wireado    ? parseFloat(cantidad_wireado)    : 0) +
            (cantidad_raspado    ? parseFloat(cantidad_raspado)    : 0) || null;

        await pool.query(
            `UPDATE "Actividades_Diarias" SET
                "ID_Estrategia"      = $1,  "Orden_Trabajo"       = $2,  "Fecha"              = $3,
                "ID_Linea_Accion"    = $4,  "Numero_Area"         = $5,  "ID_Indicador"       = $6,
                "Colonia"            = $7,  "Calle"               = $8,  "Acciones"           = $9,
                "ID_ODS"             = $10, "Cantidad"            = $11, "Superficie"         = $12,
                "Barrida"            = $13, "Metaliqueo"          = $14, "Wireado"            = $15,
                "Raspado"            = $16,
                "Cantidad_Barrida"   = $17, "Superficie_Barrida"  = $18,
                "Cantidad_Metaliqueo"= $19, "Superficie_Metaliqueo"=$20,
                "Cantidad_Wireado"   = $21, "Superficie_Wireado"  = $22,
                "Cantidad_Raspado"   = $23, "Superficie_Raspado"  = $24,
                "Jefe"               = $25, "Supervisor"          = $26,
                "Comentarios"        = $27, "Origen_Peticion"     = $28
             WHERE "ID_Actividad" = $29`,
            [
                parseInt(id_estrategia),
                orden_trabajo || null,
                fecha,
                parseInt(id_linea_accion),
                numero_area  ? parseInt(numero_area)  : null,
                id_indicador ? parseInt(id_indicador) : null,
                colonia      || null,
                calle        || null,
                acciones     || null,
                id_ods       ? parseInt(id_ods)       : null,
                totalCantidad,
                superficie   || null,
                barrida    ? true : false,
                metaliqueo ? true : false,
                wireado    ? true : false,
                raspado    ? true : false,
                cantidad_barrida    != null && cantidad_barrida    !== '' ? parseFloat(cantidad_barrida)    : null,
                superficie_barrida    || null,
                cantidad_metaliqueo != null && cantidad_metaliqueo !== '' ? parseFloat(cantidad_metaliqueo) : null,
                superficie_metaliqueo || null,
                cantidad_wireado    != null && cantidad_wireado    !== '' ? parseFloat(cantidad_wireado)    : null,
                superficie_wireado    || null,
                cantidad_raspado    != null && cantidad_raspado    !== '' ? parseFloat(cantidad_raspado)    : null,
                superficie_raspado    || null,
                jefe        || null,
                supervisor  || null,
                comentarios || null,
                origen_peticion || null,
                id
            ]
        );
        res.json({ success: true, message: 'Actividad actualizada exitosamente' });
    } catch (err) {
        console.error('Error en PUT /api/actividades/:id:', err);
        res.status(500).json({ error: 'Error al actualizar actividad', details: err.message });
    }
});

app.delete('/api/actividades/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });
        await pool.query('DELETE FROM "Actividades_Diarias" WHERE "ID_Actividad" = $1', [id]);
        res.json({ success: true, message: 'Actividad eliminada exitosamente' });
    } catch (err) {
        console.error('Error en DELETE /api/actividades/:id:', err);
        res.status(500).json({ error: 'Error al eliminar actividad', details: err.message });
    }
});

// =====================================================
// DASHBOARD
// =====================================================

app.get('/api/dashboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                "Clave_Programa", "Nombre_Programa",
                "Clave_Estrategia", "Clave_Linea",
                "Descripcion_Linea", "Unidad_Medida", "Institucion_Resp",
                "Meta_Anual", "Total_Realizado", "Total_Actividades",
                "Porcentaje_Avance", "Semaforo"
            FROM "Vista_Dashboard"
            ORDER BY "Clave_Programa", "Clave_Linea"
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener dashboard', details: err.message });
    }
});

// =====================================================
// PMD
// =====================================================

app.post('/api/pmd', async (req, res) => {
    try {
        const b = req.body;
        if (!b.linea_accion || !b.programa || !b.estrategia || !b.descripcion_linea_accion) {
            return res.status(400).json({ error: 'Campos obligatorios: Linea de Accion, Programa, Estrategia, Descripcion' });
        }
        const n = (v) => (v != null && v !== '' ? parseFloat(v) : null);
        await pool.query(
            `INSERT INTO "PMD" (
                "Linea_Accion","Pilar","Programa","Estrategia","Descripcion_Linea_Accion",
                "Meta_Trianual","Meta_Anual","Unidad_Medida","Indicador","Descripcion_Indicador",
                "Alineacion_Plan_Nacional","Alineacion_Plan_Estatal","Institucion_Responsable",
                "Meta_Oct","Meta_Nov","Meta_Dic","Meta_Ene","Meta_Feb","Meta_Mar",
                "Meta_Abr","Meta_May","Meta_Jun","Meta_Jul","Meta_Ago","Meta_Sep"
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
            [
                b.linea_accion.trim(), b.pilar || null, b.programa || null, b.estrategia || null,
                b.descripcion_linea_accion || null,
                n(b.meta_trianual), n(b.meta_anual),
                b.unidad_medida || null, b.indicador || null, b.descripcion_indicador || null,
                b.alineacion_plan_nacional || null, b.alineacion_plan_estatal || null,
                b.institucion_responsable  || null,
                n(b.meta_oct), n(b.meta_nov), n(b.meta_dic), n(b.meta_ene),
                n(b.meta_feb), n(b.meta_mar), n(b.meta_abr), n(b.meta_may),
                n(b.meta_jun), n(b.meta_jul), n(b.meta_ago), n(b.meta_sep)
            ]
        );
        res.status(201).json({ success: true, message: 'Linea PMD creada exitosamente' });
    } catch (err) {
        console.error('Error en POST /api/pmd:', err);
        const msg = err.code === '23505' ? 'La Linea de Accion ya existe' : err.message;
        res.status(500).json({ error: 'Error al crear PMD', details: msg });
    }
});

app.get('/api/pmd', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT "Linea_Accion","Pilar","Programa","Estrategia","Descripcion_Linea_Accion",
                    "Meta_Trianual","Meta_Anual","Unidad_Medida","Indicador","Descripcion_Indicador",
                    "Alineacion_Plan_Nacional","Alineacion_Plan_Estatal","Institucion_Responsable",
                    "Meta_Oct","Meta_Nov","Meta_Dic","Meta_Ene","Meta_Feb","Meta_Mar",
                    "Meta_Abr","Meta_May","Meta_Jun","Meta_Jul","Meta_Ago","Meta_Sep"
             FROM "PMD" ORDER BY "Linea_Accion"`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener PMD', details: err.message });
    }
});

app.get('/api/pmd/:linea', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "PMD" WHERE "Linea_Accion" = $1', [req.params.linea]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Linea de accion no encontrada' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener PMD', details: err.message });
    }
});

app.put('/api/pmd/:linea', async (req, res) => {
    try {
        const linea = req.params.linea;
        const b     = req.body;
        const n     = (v) => (v != null && v !== '' ? parseFloat(v) : null);
        await pool.query(
            `UPDATE "PMD" SET
                "Descripcion_Linea_Accion" = $1,  "Meta_Trianual"          = $2,
                "Meta_Anual"               = $3,  "Unidad_Medida"          = $4,
                "Indicador"                = $5,  "Descripcion_Indicador"  = $6,
                "Alineacion_Plan_Nacional" = $7,  "Alineacion_Plan_Estatal"= $8,
                "Institucion_Responsable"  = $9,
                "Meta_Oct"=$10,"Meta_Nov"=$11,"Meta_Dic"=$12,"Meta_Ene"=$13,
                "Meta_Feb"=$14,"Meta_Mar"=$15,"Meta_Abr"=$16,"Meta_May"=$17,
                "Meta_Jun"=$18,"Meta_Jul"=$19,"Meta_Ago"=$20,"Meta_Sep"=$21
             WHERE "Linea_Accion" = $22`,
            [
                b.descripcion_linea_accion || null,
                n(b.meta_trianual), n(b.meta_anual),
                b.unidad_medida || null, b.indicador || null,
                b.descripcion_indicador    || null,
                b.alineacion_plan_nacional || null,
                b.alineacion_plan_estatal  || null,
                b.institucion_responsable  || null,
                n(b.meta_oct), n(b.meta_nov), n(b.meta_dic), n(b.meta_ene),
                n(b.meta_feb), n(b.meta_mar), n(b.meta_abr), n(b.meta_may),
                n(b.meta_jun), n(b.meta_jul), n(b.meta_ago), n(b.meta_sep),
                linea
            ]
        );
        res.json({ success: true, message: 'PMD actualizado exitosamente' });
    } catch (err) {
        console.error('Error en PUT /api/pmd:', err);
        res.status(500).json({ error: 'Error al actualizar PMD', details: err.message });
    }
});

app.delete('/api/pmd/:linea', async (req, res) => {
    try {
        const linea  = req.params.linea;
        const result = await pool.query('DELETE FROM "PMD" WHERE "Linea_Accion" = $1', [linea]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Linea de accion no encontrada' });
        res.json({ success: true, message: 'Linea PMD eliminada exitosamente' });
    } catch (err) {
        console.error('Error en DELETE /api/pmd:', err);
        const msg = err.code === '23503' ? 'No se puede eliminar: tiene registros POA asociados' : err.message;
        res.status(500).json({ error: 'Error al eliminar PMD', details: msg });
    }
});

// =====================================================
// POA
// =====================================================

app.get('/api/poa', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT "ID_POA","Linea_Accion","Ejercicio","Programa","Nombre_Programa",
                   "Estrategia","Fecha_Aprobacion","Alineacion_Plan_Nacional",
                   "Alineacion_Plan_Estatal","Presupuesto_Municipal","Presupuesto_Estatal",
                   "Presupuesto_Federal","Rubro_Cuenta","Descripcion_Compras",
                   ("Presupuesto_Municipal" + "Presupuesto_Estatal" + "Presupuesto_Federal") AS "Presupuesto_Total"
            FROM "POA" ORDER BY "Ejercicio" DESC, "Linea_Accion"
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener POA', details: err.message });
    }
});

app.get('/api/poa/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });
        const result = await pool.query('SELECT * FROM "POA" WHERE "ID_POA" = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'POA no encontrado' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener POA', details: err.message });
    }
});

app.post('/api/poa', async (req, res) => {
    try {
        const b = req.body;
        if (!b.linea_accion || !b.ejercicio) {
            return res.status(400).json({ error: 'Campos obligatorios: Linea de Accion y Ejercicio' });
        }
        const n = (v) => (v != null && v !== '' ? parseFloat(v) : 0);
        const result = await pool.query(
            `INSERT INTO "POA" ("Linea_Accion","Ejercicio","Programa","Nombre_Programa",
                "Estrategia","Fecha_Aprobacion","Alineacion_Plan_Nacional","Alineacion_Plan_Estatal",
                "Presupuesto_Municipal","Presupuesto_Estatal","Presupuesto_Federal",
                "Rubro_Cuenta","Descripcion_Compras")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
             RETURNING "ID_POA"`,
            [
                b.linea_accion,
                parseInt(b.ejercicio),
                b.programa        || null,
                b.nombre_programa || null,
                b.estrategia      || null,
                b.fecha_aprobacion || null,
                b.alineacion_plan_nacional || null,
                b.alineacion_plan_estatal  || null,
                n(b.presupuesto_municipal),
                n(b.presupuesto_estatal),
                n(b.presupuesto_federal),
                b.rubro_cuenta       || null,
                b.descripcion_compras || null
            ]
        );
        res.status(201).json({ success: true, message: 'POA creado exitosamente', id_poa: result.rows[0].ID_POA });
    } catch (err) {
        console.error('Error en POST /api/poa:', err);
        res.status(500).json({ error: 'Error al crear POA', details: err.message });
    }
});

app.put('/api/poa/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });
        const b = req.body;
        const n = (v) => (v != null && v !== '' ? parseFloat(v) : 0);
        await pool.query(
            `UPDATE "POA" SET
                "Linea_Accion"=$1,"Ejercicio"=$2,"Programa"=$3,"Nombre_Programa"=$4,
                "Estrategia"=$5,"Fecha_Aprobacion"=$6,"Alineacion_Plan_Nacional"=$7,
                "Alineacion_Plan_Estatal"=$8,"Presupuesto_Municipal"=$9,
                "Presupuesto_Estatal"=$10,"Presupuesto_Federal"=$11,
                "Rubro_Cuenta"=$12,"Descripcion_Compras"=$13
             WHERE "ID_POA"=$14`,
            [
                b.linea_accion  || null,
                b.ejercicio ? parseInt(b.ejercicio) : null,
                b.programa        || null,
                b.nombre_programa || null,
                b.estrategia      || null,
                b.fecha_aprobacion || null,
                b.alineacion_plan_nacional || null,
                b.alineacion_plan_estatal  || null,
                n(b.presupuesto_municipal),
                n(b.presupuesto_estatal),
                n(b.presupuesto_federal),
                b.rubro_cuenta        || null,
                b.descripcion_compras || null,
                id
            ]
        );
        res.json({ success: true, message: 'POA actualizado exitosamente' });
    } catch (err) {
        console.error('Error en PUT /api/poa/:id:', err);
        res.status(500).json({ error: 'Error al actualizar POA', details: err.message });
    }
});

app.delete('/api/poa/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID invalido' });
        // Detalle_Actividades_POA tiene ON DELETE CASCADE, basta borrar el padre
        await pool.query('DELETE FROM "POA" WHERE "ID_POA" = $1', [id]);
        res.json({ success: true, message: 'POA eliminado exitosamente' });
    } catch (err) {
        console.error('Error en DELETE /api/poa/:id:', err);
        res.status(500).json({ error: 'Error al eliminar POA', details: err.message });
    }
});

// =====================================================
// Ruta principal
// =====================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index_espacios_publicos.html'));
});

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('  Sistema de Gestion - Espacios Publicos');
    console.log('  Ayuntamiento de Matamoros, Tamaulipas');
    console.log('='.repeat(60));
    console.log('Servidor en: http://localhost:' + PORT);
});

process.on('SIGINT', async () => {
    await pool.end();
    process.exit(0);
});
