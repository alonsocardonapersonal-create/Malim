-- ============================================================
-- SCRIPT DE BASE DE DATOS - PostgreSQL (Neon / Render)
-- Sistema de Gestion de Actividades de Espacios Publicos
-- Ayuntamiento de Matamoros, Tamaulipas
-- ============================================================

-- Limpiar tablas existentes (orden por FK)
DROP TABLE IF EXISTS "Detalle_Actividades_POA" CASCADE;
DROP TABLE IF EXISTS "POA"                     CASCADE;
DROP TABLE IF EXISTS "PMD"                     CASCADE;
DROP TABLE IF EXISTS "Actividades_Diarias"     CASCADE;
DROP TABLE IF EXISTS "Usuarios"                CASCADE;
DROP TABLE IF EXISTS "Catalogo_Areas"          CASCADE;
DROP TABLE IF EXISTS "Indicadores"             CASCADE;
DROP TABLE IF EXISTS "Lineas_Accion_ODS"       CASCADE;
DROP TABLE IF EXISTS "Lineas_Accion"           CASCADE;
DROP TABLE IF EXISTS "ODS"                     CASCADE;
DROP TABLE IF EXISTS "Estrategias"             CASCADE;
DROP TABLE IF EXISTS "Programas"               CASCADE;
DROP VIEW  IF EXISTS "Vista_Dashboard"         CASCADE;

-- ============================================================
CREATE TABLE "Programas" (
    "ID_Programa"     SERIAL PRIMARY KEY,
    "Clave_Programa"  VARCHAR(20)  NOT NULL UNIQUE,
    "Nombre_Programa" VARCHAR(500) NOT NULL
);

CREATE TABLE "Estrategias" (
    "ID_Estrategia"     SERIAL PRIMARY KEY,
    "Clave_Estrategia"  VARCHAR(20)  NOT NULL UNIQUE,
    "ID_Programa"       INT NOT NULL REFERENCES "Programas"("ID_Programa"),
    "Nombre_Estrategia" VARCHAR(500) NOT NULL
);

CREATE TABLE "ODS" (
    "ID_ODS"     SERIAL PRIMARY KEY,
    "Numero_ODS" INT NOT NULL,
    "Nombre_ODS" VARCHAR(200) NOT NULL
);

CREATE TABLE "Lineas_Accion" (
    "ID_Linea_Accion"   SERIAL PRIMARY KEY,
    "Clave_Linea"       VARCHAR(20)   NOT NULL UNIQUE,
    "ID_Estrategia"     INT NOT NULL REFERENCES "Estrategias"("ID_Estrategia"),
    "Descripcion_Linea" VARCHAR(1000) NOT NULL,
    "Meta_Anual"        DECIMAL(12,2) NULL,
    "Unidad_Medida"     VARCHAR(50)   NULL,
    "Institucion_Resp"  VARCHAR(300)  NULL
);

CREATE TABLE "Lineas_Accion_ODS" (
    "ID_Linea_Accion" INT NOT NULL REFERENCES "Lineas_Accion"("ID_Linea_Accion"),
    "ID_ODS"          INT NOT NULL REFERENCES "ODS"("ID_ODS"),
    PRIMARY KEY ("ID_Linea_Accion", "ID_ODS")
);

CREATE TABLE "Indicadores" (
    "ID_Indicador"     SERIAL PRIMARY KEY,
    "Codigo_Indicador" VARCHAR(50)   NOT NULL UNIQUE,
    "ID_Linea_Accion"  INT NOT NULL REFERENCES "Lineas_Accion"("ID_Linea_Accion"),
    "Descripcion"      VARCHAR(500)  NOT NULL,
    "Unidad_Medida"    VARCHAR(50)   NULL,
    "Meta_Indicador"   DECIMAL(12,2) NULL
);

CREATE TABLE "Catalogo_Areas" (
    "ID_Area"         SERIAL PRIMARY KEY,
    "Numero_Area"     INT          NOT NULL UNIQUE,
    "Ubicacion"       VARCHAR(300) NOT NULL,
    "Tipo_Area"       VARCHAR(100) NULL,
    "Entre_Calle_1"   VARCHAR(200) NULL,
    "Entre_Calle_2"   VARCHAR(200) NULL,
    "Es_Prioritaria"  BOOLEAN      NOT NULL DEFAULT FALSE,
    "ID_Linea_Accion" INT NULL REFERENCES "Lineas_Accion"("ID_Linea_Accion"),
    "ID_Indicador"    INT NULL REFERENCES "Indicadores"("ID_Indicador"),
    "ID_ODS"          INT NULL REFERENCES "ODS"("ID_ODS")
);

CREATE TABLE "Actividades_Diarias" (
    "ID_Actividad"    SERIAL PRIMARY KEY,
    "ID_Estrategia"   INT NOT NULL REFERENCES "Estrategias"("ID_Estrategia"),
    "Orden_Trabajo"   VARCHAR(50)  NULL,
    "Fecha"           DATE NOT NULL,
    "ID_Linea_Accion" INT NOT NULL REFERENCES "Lineas_Accion"("ID_Linea_Accion"),
    "Numero_Area"     INT  NULL,
    "ID_Indicador"    INT  NULL REFERENCES "Indicadores"("ID_Indicador"),
    "Colonia"         VARCHAR(255) NULL,
    "Calle"           VARCHAR(255) NULL,
    "Acciones"        VARCHAR(500) NULL,
    "ID_ODS"          INT  NULL REFERENCES "ODS"("ID_ODS"),
    "Cantidad"             DECIMAL(12,2) NULL,
    "Superficie"           VARCHAR(100)  NULL,
    "Barrida"              BOOLEAN NOT NULL DEFAULT FALSE,
    "Metaliqueo"           BOOLEAN NOT NULL DEFAULT FALSE,
    "Wireado"              BOOLEAN NOT NULL DEFAULT FALSE,
    "Raspado"              BOOLEAN NOT NULL DEFAULT FALSE,
    "Cantidad_Barrida"     DECIMAL(12,2) NULL,
    "Superficie_Barrida"   VARCHAR(100)  NULL,
    "Cantidad_Metaliqueo"  DECIMAL(12,2) NULL,
    "Superficie_Metaliqueo" VARCHAR(100) NULL,
    "Cantidad_Wireado"     DECIMAL(12,2) NULL,
    "Superficie_Wireado"   VARCHAR(100)  NULL,
    "Cantidad_Raspado"     DECIMAL(12,2) NULL,
    "Superficie_Raspado"   VARCHAR(100)  NULL,
    "Jefe"            VARCHAR(150) NULL,
    "Supervisor"      VARCHAR(150) NULL,
    "Comentarios"     TEXT NULL,
    "Origen_Peticion" VARCHAR(100) NULL,
    "Fecha_Registro"  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Usuarios" (
    "ID_Usuario"  SERIAL PRIMARY KEY,
    "Usuario"     VARCHAR(100) NOT NULL UNIQUE,
    "Contrasena"  VARCHAR(255) NOT NULL,
    "Nombre"      VARCHAR(200) NOT NULL,
    "Activo"      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "PMD" (
    "Linea_Accion"              VARCHAR(20)   NOT NULL PRIMARY KEY,
    "Pilar"                     VARCHAR(200)  NULL,
    "Programa"                  VARCHAR(50)   NOT NULL,
    "Estrategia"                VARCHAR(50)   NOT NULL,
    "Descripcion_Linea_Accion"  VARCHAR(1000) NOT NULL,
    "Meta_Trianual"             DECIMAL(12,2) NULL,
    "Meta_Anual"                DECIMAL(12,2) NULL,
    "Unidad_Medida"             VARCHAR(50)   NULL,
    "Indicador"                 VARCHAR(100)  NULL,
    "Descripcion_Indicador"     VARCHAR(500)  NULL,
    "Alineacion_Plan_Nacional"  VARCHAR(50)   NULL,
    "Alineacion_Plan_Estatal"   VARCHAR(50)   NULL,
    "Institucion_Responsable"   VARCHAR(300)  NULL,
    "Meta_Oct" DECIMAL(12,2) NULL, "Meta_Nov" DECIMAL(12,2) NULL,
    "Meta_Dic" DECIMAL(12,2) NULL, "Meta_Ene" DECIMAL(12,2) NULL,
    "Meta_Feb" DECIMAL(12,2) NULL, "Meta_Mar" DECIMAL(12,2) NULL,
    "Meta_Abr" DECIMAL(12,2) NULL, "Meta_May" DECIMAL(12,2) NULL,
    "Meta_Jun" DECIMAL(12,2) NULL, "Meta_Jul" DECIMAL(12,2) NULL,
    "Meta_Ago" DECIMAL(12,2) NULL, "Meta_Sep" DECIMAL(12,2) NULL
);

CREATE TABLE "POA" (
    "ID_POA"                   SERIAL PRIMARY KEY,
    "Linea_Accion"             VARCHAR(20)   NOT NULL REFERENCES "PMD"("Linea_Accion"),
    "Ejercicio"                INT           NOT NULL,
    "Programa"                 VARCHAR(50)   NULL,
    "Fecha_Aprobacion"         DATE          NULL,
    "Nombre_Programa"          VARCHAR(500)  NULL,
    "Estrategia"               VARCHAR(50)   NULL,
    "Alineacion_Plan_Nacional" VARCHAR(50)   NULL,
    "Alineacion_Plan_Estatal"  VARCHAR(50)   NULL,
    "Presupuesto_Municipal"    DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Presupuesto_Estatal"      DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Presupuesto_Federal"      DECIMAL(15,2) NOT NULL DEFAULT 0,
    "Rubro_Cuenta"             VARCHAR(100)  NULL,
    "Descripcion_Compras"      TEXT          NULL
);

CREATE TABLE "Detalle_Actividades_POA" (
    "ID_Detalle_POA"       SERIAL PRIMARY KEY,
    "ID_POA"               INT  NOT NULL REFERENCES "POA"("ID_POA") ON DELETE CASCADE,
    "Actividad_Especifica" TEXT NOT NULL,
    "Mes_Programado"       INT  NOT NULL,
    "Gasto_Programado"     DECIMAL(15,2) NOT NULL DEFAULT 0
);

CREATE TABLE "Avisos" (
    "ID_Aviso"        SERIAL PRIMARY KEY,
    "Remitente"       VARCHAR(100) NOT NULL,
    "Destinatarios"   TEXT         NOT NULL,  -- JSON array de usuarios
    "Mensaje"         TEXT         NOT NULL,
    "Importancia"     VARCHAR(10)  NOT NULL DEFAULT 'amarillo' CHECK ("Importancia" IN ('verde','amarillo','rojo')),
    "Completado"      BOOLEAN      NOT NULL DEFAULT FALSE,
    "Fecha_Creacion"  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE "Respuestas_Avisos" (
    "ID_Respuesta"   SERIAL PRIMARY KEY,
    "ID_Aviso"       INT          NOT NULL REFERENCES "Avisos"("ID_Aviso") ON DELETE CASCADE,
    "Autor"          VARCHAR(100) NOT NULL,
    "Mensaje"        TEXT         NOT NULL,
    "Fecha"          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VISTA Dashboard
-- ============================================================
CREATE VIEW "Vista_Dashboard" AS
SELECT
    p."Clave_Programa",
    p."Nombre_Programa",
    e."Clave_Estrategia",
    la."Clave_Linea",
    la."Descripcion_Linea",
    la."Meta_Anual",
    la."Unidad_Medida",
    la."Institucion_Resp",
    COALESCE(SUM(ad."Cantidad"), 0)         AS "Total_Realizado",
    COUNT(DISTINCT ad."ID_Actividad")        AS "Total_Actividades",
    CASE
        WHEN la."Meta_Anual" > 0
        THEN ROUND(COALESCE(SUM(ad."Cantidad"), 0) / la."Meta_Anual" * 100, 2)
        ELSE 0
    END AS "Porcentaje_Avance",
    CASE
        WHEN la."Meta_Anual" > 0 AND (COALESCE(SUM(ad."Cantidad"), 0) / la."Meta_Anual" * 100) >= 80 THEN 'VERDE'
        WHEN la."Meta_Anual" > 0 AND (COALESCE(SUM(ad."Cantidad"), 0) / la."Meta_Anual" * 100) >= 50 THEN 'AMARILLO'
        ELSE 'ROJO'
    END AS "Semaforo"
FROM "Programas" p
JOIN "Estrategias" e        ON e."ID_Programa"     = p."ID_Programa"
JOIN "Lineas_Accion" la     ON la."ID_Estrategia"  = e."ID_Estrategia"
LEFT JOIN "Actividades_Diarias" ad ON ad."ID_Linea_Accion" = la."ID_Linea_Accion"
GROUP BY
    p."Clave_Programa", p."Nombre_Programa",
    e."Clave_Estrategia",
    la."Clave_Linea", la."Descripcion_Linea",
    la."Meta_Anual", la."Unidad_Medida", la."Institucion_Resp";

-- ============================================================
-- DATOS: ODS
-- ============================================================
INSERT INTO "ODS" ("Numero_ODS", "Nombre_ODS") VALUES
(3,  'Salud y Bienestar'),
(4,  'Educacion de Calidad'),
(11, 'Ciudades y Comunidades Sostenibles'),
(13, 'Accion por el Clima'),
(15, 'Vida de Ecosistemas Terrestres'),
(17, 'Alianzas para Lograr los Objetivos');

-- ============================================================
-- DATOS: Programas
-- ============================================================
INSERT INTO "Programas" ("Clave_Programa", "Nombre_Programa") VALUES
('3.8',  'Renacimiento verde'),
('3.19', 'Recuperacion de espacios para entornos primarios');

-- ============================================================
-- DATOS: Estrategias
-- ============================================================
INSERT INTO "Estrategias" ("Clave_Estrategia", "ID_Programa", "Nombre_Estrategia") VALUES
('3.8.1',  1, 'Mantener y mejorar las areas verdes urbanas mediante programas de reforestacion y mantenimiento continuo'),
('3.8.2',  1, 'Fomentar la cultura ambiental y la participacion ciudadana en el cuidado de espacios verdes'),
('3.19.1', 2, 'Rehabilitar y recuperar espacios publicos deteriorados para uso comunitario'),
('3.19.2', 2, 'Implementar programas de mantenimiento preventivo y correctivo en espacios publicos primarios');

-- ============================================================
-- DATOS: Lineas de Accion
-- ============================================================
INSERT INTO "Lineas_Accion" ("Clave_Linea", "ID_Estrategia", "Descripcion_Linea", "Meta_Anual", "Unidad_Medida", "Institucion_Resp") VALUES
('3.8.1.1', 1, 'Reforestacion de areas verdes en parques y jardines municipales',              5000.00, 'Arboles plantados',       'Departamento de Espacios Publicos'),
('3.8.1.2', 1, 'Mantenimiento de areas verdes: poda, riego y limpieza de parques',            120.00,  'Areas mantenidas/mes',    'Departamento de Espacios Publicos'),
('3.8.1.3', 1, 'Instalacion y rehabilitacion de sistemas de riego en areas verdes',           30.00,   'Sistemas instalados',     'Departamento de Espacios Publicos'),
('3.8.2.1', 2, 'Campanas de sensibilizacion ambiental en escuelas y colonias',                24.00,   'Campanas realizadas',     'Departamento de Espacios Publicos'),
('3.8.2.2', 2, 'Jornadas de limpieza comunitaria con participacion ciudadana',                48.00,   'Jornadas realizadas',     'Departamento de Espacios Publicos'),
('3.19.1.1',3, 'Rehabilitacion integral de plazas y espacios publicos deteriorados',          15.00,   'Espacios rehabilitados',  'Departamento de Espacios Publicos'),
('3.19.1.2',3, 'Recuperacion de espacios en entornos primarios con infraestructura danada',   10.00,   'Espacios recuperados',    'Departamento de Espacios Publicos'),
('3.19.2.1',4, 'Programa de mantenimiento preventivo mensual de espacios publicos',          180.00,   'Intervenciones/mes',      'Departamento de Espacios Publicos'),
('3.19.2.2',4, 'Atencion correctiva a reportes ciudadanos de danos en espacios publicos',    300.00,   'Reportes atendidos',      'Departamento de Espacios Publicos');

-- ============================================================
-- DATOS: Relacion Lineas-ODS
-- ============================================================
INSERT INTO "Lineas_Accion_ODS" VALUES (1,3),(1,4),(1,5);
INSERT INTO "Lineas_Accion_ODS" VALUES (2,3),(2,4),(2,5);
INSERT INTO "Lineas_Accion_ODS" VALUES (3,3),(3,4);
INSERT INTO "Lineas_Accion_ODS" VALUES (4,1),(4,2),(4,3);
INSERT INTO "Lineas_Accion_ODS" VALUES (5,1),(5,3);
INSERT INTO "Lineas_Accion_ODS" VALUES (6,3),(6,5);
INSERT INTO "Lineas_Accion_ODS" VALUES (7,3),(7,5);
INSERT INTO "Lineas_Accion_ODS" VALUES (8,3),(8,4);
INSERT INTO "Lineas_Accion_ODS" VALUES (9,1),(9,3);

-- ============================================================
-- DATOS: Indicadores
-- ============================================================
INSERT INTO "Indicadores" ("Codigo_Indicador", "ID_Linea_Accion", "Descripcion", "Unidad_Medida", "Meta_Indicador") VALUES
('IND-3.8.1.1-A', 1, 'Numero de arboles plantados en parques municipales',       'Arboles',        5000.00),
('IND-3.8.1.2-A', 2, 'Numero de areas verdes con mantenimiento mensual',          'Areas',          120.00),
('IND-3.8.1.2-B', 2, 'Metros lineales de poda ejecutados',                        'ML',             8000.00),
('IND-3.8.1.3-A', 3, 'Sistemas de riego instalados o rehabilitados',              'Sistemas',        30.00),
('IND-3.8.2.1-A', 4, 'Campanas ambientales realizadas',                           'Campanas',        24.00),
('IND-3.8.2.2-A', 5, 'Jornadas de limpieza comunitaria ejecutadas',               'Jornadas',        48.00),
('IND-3.19.1.1-A',6, 'Espacios publicos rehabilitados integralmente',             'Espacios',        15.00),
('IND-3.19.1.2-A',7, 'Espacios en entornos primarios recuperados',                'Espacios',        10.00),
('IND-3.19.2.1-A',8, 'Intervenciones de mantenimiento preventivo realizadas',     'Intervenciones', 180.00),
('IND-3.19.2.2-A',9, 'Reportes ciudadanos atendidos correctivamente',             'Reportes',       300.00);

-- ============================================================
-- DATOS: Catalogo de Areas
-- ============================================================
INSERT INTO "Catalogo_Areas" ("Numero_Area","Ubicacion","Tipo_Area","Entre_Calle_1","Entre_Calle_2","Es_Prioritaria","ID_Linea_Accion","ID_Indicador","ID_ODS") VALUES
(1,  'Parque Hidalgo - Centro',                     'Parque Urbano',    'Calle Morelos',      'Calle Juarez',      TRUE,  2,2,3),
(2,  'Jardin de la Republica - Centro',             'Jardin',           'Calle Constitucion', 'Calle Guerrero',    TRUE,  2,2,3),
(3,  'Plaza Las Americas - Col. Las Americas',      'Plaza Civica',     'Blvd. Lauro Villar', 'Calle Puebla',      TRUE,  2,2,3),
(4,  'Parque Infantil Solidaridad - Col. INFONAVIT','Parque Infantil',  'Calle Revolucion',   'Calle Libertad',    TRUE,  2,2,3),
(5,  'Andador Peatonal Rio Bravo - Centro',         'Andador',          'Av. Alvaro Obregon', 'Calle Allende',     TRUE,  2,2,3),
(6,  'Parque El Chorrito - Col. El Chorrito',       'Parque Urbano',    'Calle Tamaulipas',   'Calle Veracruz',    TRUE,  2,2,3),
(7,  'Jardin Juarez - Col. Centro',                 'Jardin',           'Calle 1ro de Mayo',  'Calle Hidalgo',     TRUE,  2,2,3),
(8,  'Parque Industrial Norte - Zona Industrial',   'Area Verde',       'Blvd. Industrial',   'Calle Norte',       TRUE,  2,2,3),
(9,  'Plaza Civica - Col. Valle Hermoso',           'Plaza Civica',     'Calle Palmas',       'Calle Fresnos',     TRUE,  2,2,3),
(10, 'Jardin Col. Burokratas - Col. Burokratas',    'Jardin',           'Calle Burocratas',   'Calle Servicios',   TRUE,  2,2,3),
(11, 'Parque Col. PEMEX - Col. PEMEX',              'Parque Urbano',    'Av. PEMEX',          'Calle Refineria',   FALSE, 2,2,3),
(12, 'Area verde Blvd. Lauro Villar tramo 1',       'Camellones',       'Blvd. Lauro Villar', 'Calle Aztecas',     FALSE, 2,2,3),
(13, 'Area verde Blvd. Lauro Villar tramo 2',       'Camellones',       'Calle Aztecas',      'Calle Insurgentes', FALSE, 2,2,3),
(14, 'Parque Col. Las Fuentes - Col. Las Fuentes',  'Parque Urbano',    'Calle Las Fuentes',  'Calle Manantial',   FALSE, 2,2,3),
(15, 'Unidad Deportiva Municipal',                  'Unidad Deportiva', 'Av. Deportiva',      'Calle Estadio',     FALSE, 8,9,3);

-- ============================================================
-- DATOS: Usuarios (admin/admin123, celedonio/123)
-- ============================================================
INSERT INTO "Usuarios" ("Usuario", "Contrasena", "Nombre") VALUES
('admin',     '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador del Sistema'),
('celedonio', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Celedonio - Jefe de Departamento');

-- ============================================================
-- DATOS: PMD
-- ============================================================
INSERT INTO "PMD" ("Linea_Accion","Pilar","Programa","Estrategia","Descripcion_Linea_Accion","Meta_Trianual","Meta_Anual","Unidad_Medida","Indicador","Descripcion_Indicador","Alineacion_Plan_Nacional","Alineacion_Plan_Estatal","Institucion_Responsable") VALUES
('3.8.1.1','Pilar 3 - Desarrollo Urbano Sustentable','3.8','3.8.1','Reforestacion de areas verdes en parques y jardines municipales',15000.00,5000.00,'Arboles plantados','IND-3.8.1.1-A','Numero de arboles plantados en parques municipales','4.3','E1.2','Departamento de Espacios Publicos'),
('3.8.1.2','Pilar 3 - Desarrollo Urbano Sustentable','3.8','3.8.1','Mantenimiento de areas verdes: poda, riego y limpieza de parques',360.00,120.00,'Areas mantenidas/mes','IND-3.8.1.2-A','Numero de areas verdes con mantenimiento mensual','4.3','E1.2','Departamento de Espacios Publicos'),
('3.8.1.3','Pilar 3 - Desarrollo Urbano Sustentable','3.8','3.8.1','Instalacion y rehabilitacion de sistemas de riego en areas verdes',90.00,30.00,'Sistemas instalados','IND-3.8.1.3-A','Sistemas de riego instalados o rehabilitados','4.3','E1.2','Departamento de Espacios Publicos'),
('3.8.2.1','Pilar 3 - Desarrollo Urbano Sustentable','3.8','3.8.2','Campanas de sensibilizacion ambiental en escuelas y colonias',72.00,24.00,'Campanas realizadas','IND-3.8.2.1-A','Campanas ambientales realizadas','4.3','E1.2','Departamento de Espacios Publicos'),
('3.8.2.2','Pilar 3 - Desarrollo Urbano Sustentable','3.8','3.8.2','Jornadas de limpieza comunitaria con participacion ciudadana',144.00,48.00,'Jornadas realizadas','IND-3.8.2.2-A','Jornadas de limpieza comunitaria ejecutadas','4.3','E1.2','Departamento de Espacios Publicos'),
('3.19.1.1','Pilar 3 - Desarrollo Urbano Sustentable','3.19','3.19.1','Rehabilitacion integral de plazas y espacios publicos deteriorados',45.00,15.00,'Espacios rehabilitados','IND-3.19.1.1-A','Espacios publicos rehabilitados integralmente','4.3','E1.3','Departamento de Espacios Publicos'),
('3.19.1.2','Pilar 3 - Desarrollo Urbano Sustentable','3.19','3.19.1','Recuperacion de espacios en entornos primarios con infraestructura danada',30.00,10.00,'Espacios recuperados','IND-3.19.1.2-A','Espacios en entornos primarios recuperados','4.3','E1.3','Departamento de Espacios Publicos'),
('3.19.2.1','Pilar 3 - Desarrollo Urbano Sustentable','3.19','3.19.2','Programa de mantenimiento preventivo mensual de espacios publicos',540.00,180.00,'Intervenciones/mes','IND-3.19.2.1-A','Intervenciones de mantenimiento preventivo realizadas','4.3','E1.3','Departamento de Espacios Publicos'),
('3.19.2.2','Pilar 3 - Desarrollo Urbano Sustentable','3.19','3.19.2','Atencion correctiva a reportes ciudadanos de danos en espacios publicos',900.00,300.00,'Reportes atendidos','IND-3.19.2.2-A','Reportes ciudadanos atendidos correctivamente','4.3','E1.3','Departamento de Espacios Publicos');

-- ============================================================
-- DATOS: POA 2026
-- ============================================================
INSERT INTO "POA" ("Linea_Accion","Ejercicio","Programa","Nombre_Programa","Estrategia","Alineacion_Plan_Nacional","Alineacion_Plan_Estatal","Presupuesto_Municipal","Presupuesto_Estatal","Presupuesto_Federal","Rubro_Cuenta","Descripcion_Compras") VALUES
('3.8.1.1',2026,'3.8','Renacimiento verde','3.8.1','4.3','E1.2',150000.00,50000.00,0.00,'3.3.1','Adquisicion de arbolado: arboles, tierra fina, fertilizante, herramienta de siembra'),
('3.8.1.2',2026,'3.8','Renacimiento verde','3.8.1','4.3','E1.2',200000.00,0.00,0.00,'3.3.2','Combustible, wiras, hilo, bolsas, herramienta de poda y mantenimiento'),
('3.8.1.3',2026,'3.8','Renacimiento verde','3.8.1','4.3','E1.2',80000.00,20000.00,0.00,'3.3.3','Tuberia de riego, aspersores, bombas de agua, materiales de instalacion'),
('3.8.2.1',2026,'3.8','Renacimiento verde','3.8.2','4.3','E1.2',30000.00,0.00,0.00,'3.6.1','Material de difusion: folletos, lonas, papeleria para campanas ambientales'),
('3.8.2.2',2026,'3.8','Renacimiento verde','3.8.2','4.3','E1.2',40000.00,0.00,0.00,'3.6.2','Bolsas de basura, guantes, uniformes para jornadas de limpieza'),
('3.19.1.1',2026,'3.19','Recuperacion de espacios para entornos primarios','3.19.1','4.3','E1.3',300000.00,100000.00,50000.00,'3.5.1','Materiales de construccion: concreto, pintura, luminarias, bancas, juegos infantiles'),
('3.19.1.2',2026,'3.19','Recuperacion de espacios para entornos primarios','3.19.1','4.3','E1.3',250000.00,80000.00,0.00,'3.5.2','Materiales para reparacion de infraestructura danada: varilla, cemento, pintura'),
('3.19.2.1',2026,'3.19','Recuperacion de espacios para entornos primarios','3.19.2','4.3','E1.3',180000.00,0.00,0.00,'3.3.4','Combustible, herramienta, materiales de limpieza y mantenimiento preventivo'),
('3.19.2.2',2026,'3.19','Recuperacion de espacios para entornos primarios','3.19.2','4.3','E1.3',120000.00,0.00,0.00,'3.3.5','Herramienta correctiva, pintura, materiales de reparacion urgente');

-- ============================================================
-- DATOS: Detalle POA
-- ============================================================
INSERT INTO "Detalle_Actividades_POA" ("ID_POA","Actividad_Especifica","Mes_Programado","Gasto_Programado") VALUES
(1,'Adquisicion de 500 arboles para siembra primer trimestre',10,50000.00),
(1,'Siembra en parques del centro historico y colonias norte',11,50000.00),
(1,'Siembra en colonias INFONAVIT y zona periferica',12,50000.00),
(2,'Mantenimiento preventivo areas zona centro y jardin principal',10,20000.00),
(2,'Poda masiva temporada de secas - todas las areas',11,30000.00),
(2,'Limpieza general post-vientos nortes y reposicion de plantas',1,20000.00),
(6,'Levantamiento de diagnostico y proyecto de rehabilitacion',10,30000.00),
(6,'Inicio de obras - Plaza Las Americas y Parque El Chorrito',11,120000.00),
(6,'Terminacion de obras y arranque Parque Hidalgo',12,150000.00);
