-- ============================================================
-- SCRIPT DE BASE DE DATOS
-- Sistema de Gestion de Actividades de Espacios Publicos
-- Ayuntamiento de Matamoros, Tamaulipas
-- Plan Municipal de Desarrollo (PMD)
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'EspaciosPublicos')
BEGIN
    ALTER DATABASE EspaciosPublicos SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE EspaciosPublicos;
END
GO

CREATE DATABASE EspaciosPublicos
    COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

USE EspaciosPublicos;
GO

-- ============================================================
-- TABLA: Programas
-- Contiene los programas del PMD
-- ============================================================
CREATE TABLE Programas (
    ID_Programa     INT IDENTITY(1,1) PRIMARY KEY,
    Clave_Programa  NVARCHAR(20)  NOT NULL UNIQUE,
    Nombre_Programa NVARCHAR(500) NOT NULL
);
GO

-- ============================================================
-- TABLA: Estrategias
-- Contiene las estrategias por programa
-- ============================================================
CREATE TABLE Estrategias (
    ID_Estrategia     INT IDENTITY(1,1) PRIMARY KEY,
    Clave_Estrategia  NVARCHAR(20)  NOT NULL UNIQUE,
    ID_Programa       INT NOT NULL,
    Nombre_Estrategia NVARCHAR(500) NOT NULL,
    CONSTRAINT FK_Estrategias_Programas FOREIGN KEY (ID_Programa)
        REFERENCES Programas(ID_Programa)
);
GO

-- ============================================================
-- TABLA: ODS (Objetivos de Desarrollo Sostenible)
-- ============================================================
CREATE TABLE ODS (
    ID_ODS     INT IDENTITY(1,1) PRIMARY KEY,
    Numero_ODS INT NOT NULL,
    Nombre_ODS NVARCHAR(200) NOT NULL
);
GO

-- ============================================================
-- TABLA: Lineas_Accion
-- Lineas de accion por estrategia
-- ============================================================
CREATE TABLE Lineas_Accion (
    ID_Linea_Accion      INT IDENTITY(1,1) PRIMARY KEY,
    Clave_Linea          NVARCHAR(20)  NOT NULL UNIQUE,
    ID_Estrategia        INT NOT NULL,
    Descripcion_Linea    NVARCHAR(1000) NOT NULL,
    Meta_Anual           DECIMAL(12,2)  NULL,
    Unidad_Medida        NVARCHAR(50)   NULL,
    Institucion_Resp     NVARCHAR(300)  NULL,
    CONSTRAINT FK_LineasAccion_Estrategias FOREIGN KEY (ID_Estrategia)
        REFERENCES Estrategias(ID_Estrategia)
);
GO

-- ============================================================
-- TABLA: Lineas_Accion_ODS (relacion muchos a muchos)
-- ============================================================
CREATE TABLE Lineas_Accion_ODS (
    ID_Linea_Accion INT NOT NULL,
    ID_ODS          INT NOT NULL,
    CONSTRAINT PK_LineasODS PRIMARY KEY (ID_Linea_Accion, ID_ODS),
    CONSTRAINT FK_LinODS_Linea FOREIGN KEY (ID_Linea_Accion) REFERENCES Lineas_Accion(ID_Linea_Accion),
    CONSTRAINT FK_LinODS_ODS  FOREIGN KEY (ID_ODS)           REFERENCES ODS(ID_ODS)
);
GO

-- ============================================================
-- TABLA: Indicadores
-- Indicadores del PMD por linea de accion
-- ============================================================
CREATE TABLE Indicadores (
    ID_Indicador      INT IDENTITY(1,1) PRIMARY KEY,
    Codigo_Indicador  NVARCHAR(50)  NOT NULL UNIQUE,
    ID_Linea_Accion   INT NOT NULL,
    Descripcion       NVARCHAR(500) NOT NULL,
    Unidad_Medida     NVARCHAR(50)  NULL,
    Meta_Indicador    DECIMAL(12,2) NULL,
    CONSTRAINT FK_Indicadores_Lineas FOREIGN KEY (ID_Linea_Accion)
        REFERENCES Lineas_Accion(ID_Linea_Accion)
);
GO

-- ============================================================
-- TABLA: Catalogo_Areas
-- Catalogo de areas fisicas gestionadas
-- ============================================================
CREATE TABLE Catalogo_Areas (
    ID_Area           INT IDENTITY(1,1) PRIMARY KEY,
    Numero_Area       INT           NOT NULL UNIQUE,
    Ubicacion         NVARCHAR(300) NOT NULL,
    Tipo_Area         NVARCHAR(100) NULL,
    Entre_Calle_1     NVARCHAR(200) NULL,
    Entre_Calle_2     NVARCHAR(200) NULL,
    Es_Prioritaria    BIT           NOT NULL DEFAULT 0,
    ID_Linea_Accion   INT           NULL,
    ID_Indicador      INT           NULL,
    ID_ODS            INT           NULL,
    CONSTRAINT FK_Areas_Linea     FOREIGN KEY (ID_Linea_Accion) REFERENCES Lineas_Accion(ID_Linea_Accion),
    CONSTRAINT FK_Areas_Indicador FOREIGN KEY (ID_Indicador)    REFERENCES Indicadores(ID_Indicador),
    CONSTRAINT FK_Areas_ODS       FOREIGN KEY (ID_ODS)          REFERENCES ODS(ID_ODS)
);
GO

-- ============================================================
-- TABLA: Actividades_Diarias
-- Registro principal de actividades capturadas
-- ============================================================
CREATE TABLE Actividades_Diarias (
    ID_Actividad      INT IDENTITY(1,1) PRIMARY KEY,
    ID_Estrategia     INT NOT NULL,
    Orden_Trabajo     NVARCHAR(50)  NULL,
    Fecha             DATE NOT NULL,
    ID_Linea_Accion   INT NOT NULL,
    Numero_Area       INT  NULL,
    ID_Indicador      INT  NULL,
    Colonia           NVARCHAR(255) NULL,
    Calle             NVARCHAR(255) NULL,
    -- Actividades
    Acciones          NVARCHAR(500) NULL,
    ID_ODS            INT  NULL,
    Cantidad          DECIMAL(12,2) NULL,
    Superficie        NVARCHAR(100) NULL,
    -- Checkboxes trabajo
    Barrida           BIT NOT NULL DEFAULT 0,
    Metaliqueo        BIT NOT NULL DEFAULT 0,
    Wireado           BIT NOT NULL DEFAULT 0,
    Raspado           BIT NOT NULL DEFAULT 0,
    -- Equipo
    Jefe              NVARCHAR(150) NULL,
    Supervisor        NVARCHAR(150) NULL,
    Comentarios       NVARCHAR(MAX) NULL,
    Origen_Peticion   NVARCHAR(100) NULL,
    -- Auditoria
    Fecha_Registro    DATETIME NOT NULL DEFAULT GETDATE(),
    Mes               AS MONTH(Fecha),
    CONSTRAINT FK_Act_Estrategia   FOREIGN KEY (ID_Estrategia)   REFERENCES Estrategias(ID_Estrategia),
    CONSTRAINT FK_Act_Linea        FOREIGN KEY (ID_Linea_Accion)  REFERENCES Lineas_Accion(ID_Linea_Accion),
    CONSTRAINT FK_Act_Indicador    FOREIGN KEY (ID_Indicador)     REFERENCES Indicadores(ID_Indicador),
    CONSTRAINT FK_Act_ODS          FOREIGN KEY (ID_ODS)           REFERENCES ODS(ID_ODS)
);
GO

-- ============================================================
-- TABLA: Usuarios
-- Control de acceso al sistema
-- ============================================================
CREATE TABLE Usuarios (
    ID_Usuario   INT IDENTITY(1,1) PRIMARY KEY,
    Usuario      NVARCHAR(100) NOT NULL UNIQUE,
    Contrasena   NVARCHAR(255) NOT NULL,   -- Hash SHA-256
    Nombre       NVARCHAR(200) NOT NULL,
    Activo       BIT NOT NULL DEFAULT 1
);
GO

-- ============================================================
-- DATOS: ODS
-- ============================================================
INSERT INTO ODS (Numero_ODS, Nombre_ODS) VALUES
(3,  'Salud y Bienestar'),
(4,  'Educacion de Calidad'),
(11, 'Ciudades y Comunidades Sostenibles'),
(13, 'Accion por el Clima'),
(15, 'Vida de Ecosistemas Terrestres'),
(17, 'Alianzas para Lograr los Objetivos');
GO

-- ============================================================
-- DATOS: Programas PMD
-- ============================================================
INSERT INTO Programas (Clave_Programa, Nombre_Programa) VALUES
('3.8',  'Renacimiento verde'),
('3.19', 'Recuperacion de espacios para entornos primarios');
GO

-- ============================================================
-- DATOS: Estrategias
-- ============================================================
INSERT INTO Estrategias (Clave_Estrategia, ID_Programa, Nombre_Estrategia) VALUES
('3.8.1',  1, 'Mantener y mejorar las areas verdes urbanas mediante programas de reforestacion y mantenimiento continuo'),
('3.8.2',  1, 'Fomentar la cultura ambiental y la participacion ciudadana en el cuidado de espacios verdes'),
('3.19.1', 2, 'Rehabilitar y recuperar espacios publicos deteriorados para uso comunitario'),
('3.19.2', 2, 'Implementar programas de mantenimiento preventivo y correctivo en espacios publicos primarios');
GO

-- ============================================================
-- DATOS: Lineas de Accion
-- ============================================================
INSERT INTO Lineas_Accion (Clave_Linea, ID_Estrategia, Descripcion_Linea, Meta_Anual, Unidad_Medida, Institucion_Resp) VALUES
('3.8.1.1', 1, 'Reforestacion de areas verdes en parques y jardines municipales', 5000.00, 'Arboles plantados',       'Departamento de Espacios Publicos'),
('3.8.1.2', 1, 'Mantenimiento de areas verdes: poda, riego y limpieza de parques', 120.00,  'Areas mantenidas/mes',    'Departamento de Espacios Publicos'),
('3.8.1.3', 1, 'Instalacion y rehabilitacion de sistemas de riego en areas verdes', 30.00,   'Sistemas instalados',     'Departamento de Espacios Publicos'),
('3.8.2.1', 2, 'Campanas de sensibilizacion ambiental en escuelas y colonias', 24.00,    'Campanas realizadas',     'Departamento de Espacios Publicos'),
('3.8.2.2', 2, 'Jornadas de limpieza comunitaria con participacion ciudadana', 48.00,    'Jornadas realizadas',     'Departamento de Espacios Publicos'),
('3.19.1.1',3, 'Rehabilitacion integral de plazas y espacios publicos deteriorados', 15.00,  'Espacios rehabilitados',  'Departamento de Espacios Publicos'),
('3.19.1.2',3, 'Recuperacion de espacios en entornos primarios con infraestructura danada', 10.00,  'Espacios recuperados',   'Departamento de Espacios Publicos'),
('3.19.2.1',4, 'Programa de mantenimiento preventivo mensual de espacios publicos', 180.00,  'Intervenciones/mes',      'Departamento de Espacios Publicos'),
('3.19.2.2',4, 'Atencion correctiva a reportes ciudadanos de danos en espacios publicos', 300.00,  'Reportes atendidos',      'Departamento de Espacios Publicos');
GO

-- ============================================================
-- DATOS: Relacion Lineas-ODS
-- ============================================================
-- 3.8.1.x -> ODS 11, 15, 13
INSERT INTO Lineas_Accion_ODS VALUES (1,3),(1,4),(1,5);
INSERT INTO Lineas_Accion_ODS VALUES (2,3),(2,4),(2,5);
INSERT INTO Lineas_Accion_ODS VALUES (3,3),(3,4);
-- 3.8.2.x -> ODS 4, 11
INSERT INTO Lineas_Accion_ODS VALUES (4,1),(4,2),(4,3);
INSERT INTO Lineas_Accion_ODS VALUES (5,1),(5,3);
-- 3.19.x -> ODS 11
INSERT INTO Lineas_Accion_ODS VALUES (6,3),(6,5);
INSERT INTO Lineas_Accion_ODS VALUES (7,3),(7,5);
INSERT INTO Lineas_Accion_ODS VALUES (8,3),(8,4);
INSERT INTO Lineas_Accion_ODS VALUES (9,1),(9,3);
GO

-- ============================================================
-- DATOS: Indicadores
-- ============================================================
INSERT INTO Indicadores (Codigo_Indicador, ID_Linea_Accion, Descripcion, Unidad_Medida, Meta_Indicador) VALUES
('IND-3.8.1.1-A', 1, 'Numero de arboles plantados en parques municipales',      'Arboles',        5000.00),
('IND-3.8.1.2-A', 2, 'Numero de areas verdes con mantenimiento mensual',         'Areas',          120.00),
('IND-3.8.1.2-B', 2, 'Metros lineales de poda ejecutados',                       'ML',             8000.00),
('IND-3.8.1.3-A', 3, 'Sistemas de riego instalados o rehabilitados',             'Sistemas',        30.00),
('IND-3.8.2.1-A', 4, 'Campanas ambientales realizadas',                          'Campanas',        24.00),
('IND-3.8.2.2-A', 5, 'Jornadas de limpieza comunitaria ejecutadas',              'Jornadas',        48.00),
('IND-3.19.1.1-A',6, 'Espacios publicos rehabilitados integralmente',            'Espacios',        15.00),
('IND-3.19.1.2-A',7, 'Espacios en entornos primarios recuperados',               'Espacios',        10.00),
('IND-3.19.2.1-A',8, 'Intervenciones de mantenimiento preventivo realizadas',    'Intervenciones', 180.00),
('IND-3.19.2.2-A',9, 'Reportes ciudadanos atendidos correctivamente',            'Reportes',       300.00);
GO

-- ============================================================
-- DATOS: Catalogo de Areas
-- ============================================================
-- Catalogo_Areas: Es_Prioritaria=1 marca las 500 areas comprometidas
-- ID_Linea_Accion=2 -> 3.8.1.2 (Mantenimiento areas verdes)
-- ID_Linea_Accion=8 -> 3.19.2.1 (Mantenimiento preventivo espacios publicos)
-- ID_Indicador=2 -> IND-3.8.1.2-A  | ID_Indicador=9 -> IND-3.19.2.1-A
-- ID_ODS=3 -> ODS 11 (Ciudades y Comunidades Sostenibles)
INSERT INTO Catalogo_Areas (Numero_Area, Ubicacion, Tipo_Area, Entre_Calle_1, Entre_Calle_2, Es_Prioritaria, ID_Linea_Accion, ID_Indicador, ID_ODS) VALUES
(1,  'Parque Hidalgo - Centro',                    'Parque Urbano',    'Calle Morelos',      'Calle Juarez',      1, 2, 2, 3),
(2,  'Jardin de la Republica - Centro',            'Jardin',           'Calle Constitucion', 'Calle Guerrero',    1, 2, 2, 3),
(3,  'Plaza Las Americas - Col. Las Americas',     'Plaza Civica',     'Blvd. Lauro Villar', 'Calle Puebla',      1, 2, 2, 3),
(4,  'Parque Infantil Solidaridad - Col. INFONAVIT','Parque Infantil', 'Calle Revolucion',   'Calle Libertad',    1, 2, 2, 3),
(5,  'Andador Peatonal Rio Bravo - Centro',        'Andador',          'Av. Alvaro Obregon', 'Calle Allende',     1, 2, 2, 3),
(6,  'Parque El Chorrito - Col. El Chorrito',      'Parque Urbano',    'Calle Tamaulipas',   'Calle Veracruz',    1, 2, 2, 3),
(7,  'Jardin Juarez - Col. Centro',                'Jardin',           'Calle 1ro de Mayo',  'Calle Hidalgo',     1, 2, 2, 3),
(8,  'Parque Industrial Norte - Zona Industrial',  'Area Verde',       'Blvd. Industrial',   'Calle Norte',       1, 2, 2, 3),
(9,  'Plaza Civica - Col. Valle Hermoso',          'Plaza Civica',     'Calle Palmas',       'Calle Fresnos',     1, 2, 2, 3),
(10, 'Jardin Col. Burokratas - Col. Burokratas',   'Jardin',           'Calle Burocratas',   'Calle Servicios',   1, 2, 2, 3),
(11, 'Parque Col. PEMEX - Col. PEMEX',             'Parque Urbano',    'Av. PEMEX',          'Calle Refineria',   0, 2, 2, 3),
(12, 'Area verde Blvd. Lauro Villar tramo 1',      'Camellones',       'Blvd. Lauro Villar', 'Calle Aztecas',     0, 2, 2, 3),
(13, 'Area verde Blvd. Lauro Villar tramo 2',      'Camellones',       'Calle Aztecas',      'Calle Insurgentes', 0, 2, 2, 3),
(14, 'Parque Col. Las Fuentes - Col. Las Fuentes', 'Parque Urbano',    'Calle Las Fuentes',  'Calle Manantial',   0, 2, 2, 3),
(15, 'Unidad Deportiva Municipal',                 'Unidad Deportiva', 'Av. Deportiva',      'Calle Estadio',     0, 8, 9, 3);
GO

-- ============================================================
-- DATOS: Usuario administrador por defecto
-- Contrasena: admin123 (SHA-256)
-- ============================================================
INSERT INTO Usuarios (Usuario, Contrasena, Nombre) VALUES
('admin',     '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrador del Sistema'),
('celedonio', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 'Celedonio - Jefe de Departamento');
GO

-- ============================================================
-- TABLA: PMD (Plan Municipal de Desarrollo)
-- Fuente oficial de metas del gobierno municipal
-- ============================================================
CREATE TABLE PMD (
    Linea_Accion              NVARCHAR(20)   NOT NULL PRIMARY KEY,
    Pilar                     NVARCHAR(200)  NULL,
    Programa                  NVARCHAR(50)   NOT NULL,
    Estrategia                NVARCHAR(50)   NOT NULL,
    Descripcion_Linea_Accion  NVARCHAR(1000) NOT NULL,
    Meta_Trianual             DECIMAL(12,2)  NULL,
    Meta_Anual                DECIMAL(12,2)  NULL,
    Unidad_Medida             NVARCHAR(50)   NULL,
    Indicador                 NVARCHAR(100)  NULL,
    Descripcion_Indicador     NVARCHAR(500)  NULL,
    Alineacion_Plan_Nacional  NVARCHAR(50)   NULL,
    Alineacion_Plan_Estatal   NVARCHAR(50)   NULL,
    Institucion_Responsable   NVARCHAR(300)  NULL,
    Meta_Oct DECIMAL(12,2) NULL,
    Meta_Nov DECIMAL(12,2) NULL,
    Meta_Dic DECIMAL(12,2) NULL,
    Meta_Ene DECIMAL(12,2) NULL,
    Meta_Feb DECIMAL(12,2) NULL,
    Meta_Mar DECIMAL(12,2) NULL,
    Meta_Abr DECIMAL(12,2) NULL,
    Meta_May DECIMAL(12,2) NULL,
    Meta_Jun DECIMAL(12,2) NULL,
    Meta_Jul DECIMAL(12,2) NULL,
    Meta_Ago DECIMAL(12,2) NULL,
    Meta_Sep DECIMAL(12,2) NULL
);
GO

-- ============================================================
-- TABLA: POA (Programa Operativo Anual)
-- Presupuesto y programacion anual de actividades
-- ============================================================
CREATE TABLE POA (
    ID_POA                   INT IDENTITY(1,1) PRIMARY KEY,
    Linea_Accion             NVARCHAR(20)   NOT NULL,
    Ejercicio                INT            NOT NULL,
    Programa                 NVARCHAR(50)   NULL,
    Fecha_Aprobacion         DATE           NULL,
    Nombre_Programa          NVARCHAR(500)  NULL,
    Estrategia               NVARCHAR(50)   NULL,
    Alineacion_Plan_Nacional NVARCHAR(50)   NULL,
    Alineacion_Plan_Estatal  NVARCHAR(50)   NULL,
    Presupuesto_Municipal    DECIMAL(15,2)  NOT NULL DEFAULT 0,
    Presupuesto_Estatal      DECIMAL(15,2)  NOT NULL DEFAULT 0,
    Presupuesto_Federal      DECIMAL(15,2)  NOT NULL DEFAULT 0,
    Rubro_Cuenta             NVARCHAR(100)  NULL,
    Descripcion_Compras      NVARCHAR(MAX)  NULL,
    CONSTRAINT FK_POA_PMD FOREIGN KEY (Linea_Accion) REFERENCES PMD(Linea_Accion)
);
GO

-- ============================================================
-- TABLA: Detalle_Actividades_POA
-- Desglose mensual de actividades del POA
-- ============================================================
CREATE TABLE Detalle_Actividades_POA (
    ID_Detalle_POA       INT IDENTITY(1,1) PRIMARY KEY,
    ID_POA               INT            NOT NULL,
    Actividad_Especifica NVARCHAR(MAX)  NOT NULL,
    Mes_Programado       INT            NOT NULL,
    Gasto_Programado     DECIMAL(15,2)  NOT NULL DEFAULT 0,
    CONSTRAINT FK_Detalle_POA FOREIGN KEY (ID_POA) REFERENCES POA(ID_POA)
);
GO

-- ============================================================
-- DATOS: PMD - Plan Municipal de Desarrollo
-- Programas 3.8 y 3.19 con todas las lineas de accion
-- ============================================================
INSERT INTO PMD (Linea_Accion, Pilar, Programa, Estrategia, Descripcion_Linea_Accion,
    Meta_Trianual, Meta_Anual, Unidad_Medida, Indicador, Descripcion_Indicador,
    Alineacion_Plan_Nacional, Alineacion_Plan_Estatal, Institucion_Responsable) VALUES
('3.8.1.1', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.8', '3.8.1',
    'Reforestacion de areas verdes en parques y jardines municipales',
    15000.00, 5000.00, 'Arboles plantados', 'IND-3.8.1.1-A',
    'Numero de arboles plantados en parques municipales', '4.3', 'E1.2',
    'Departamento de Espacios Publicos'),
('3.8.1.2', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.8', '3.8.1',
    'Mantenimiento de areas verdes: poda, riego y limpieza de parques',
    360.00, 120.00, 'Areas mantenidas/mes', 'IND-3.8.1.2-A',
    'Numero de areas verdes con mantenimiento mensual', '4.3', 'E1.2',
    'Departamento de Espacios Publicos'),
('3.8.1.3', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.8', '3.8.1',
    'Instalacion y rehabilitacion de sistemas de riego en areas verdes',
    90.00, 30.00, 'Sistemas instalados', 'IND-3.8.1.3-A',
    'Sistemas de riego instalados o rehabilitados', '4.3', 'E1.2',
    'Departamento de Espacios Publicos'),
('3.8.2.1', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.8', '3.8.2',
    'Campanas de sensibilizacion ambiental en escuelas y colonias',
    72.00, 24.00, 'Campanas realizadas', 'IND-3.8.2.1-A',
    'Campanas ambientales realizadas', '4.3', 'E1.2',
    'Departamento de Espacios Publicos'),
('3.8.2.2', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.8', '3.8.2',
    'Jornadas de limpieza comunitaria con participacion ciudadana',
    144.00, 48.00, 'Jornadas realizadas', 'IND-3.8.2.2-A',
    'Jornadas de limpieza comunitaria ejecutadas', '4.3', 'E1.2',
    'Departamento de Espacios Publicos'),
('3.19.1.1', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.19', '3.19.1',
    'Rehabilitacion integral de plazas y espacios publicos deteriorados',
    45.00, 15.00, 'Espacios rehabilitados', 'IND-3.19.1.1-A',
    'Espacios publicos rehabilitados integralmente', '4.3', 'E1.3',
    'Departamento de Espacios Publicos'),
('3.19.1.2', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.19', '3.19.1',
    'Recuperacion de espacios en entornos primarios con infraestructura danada',
    30.00, 10.00, 'Espacios recuperados', 'IND-3.19.1.2-A',
    'Espacios en entornos primarios recuperados', '4.3', 'E1.3',
    'Departamento de Espacios Publicos'),
('3.19.2.1', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.19', '3.19.2',
    'Programa de mantenimiento preventivo mensual de espacios publicos',
    540.00, 180.00, 'Intervenciones/mes', 'IND-3.19.2.1-A',
    'Intervenciones de mantenimiento preventivo realizadas', '4.3', 'E1.3',
    'Departamento de Espacios Publicos'),
('3.19.2.2', 'Pilar 3 - Desarrollo Urbano Sustentable', '3.19', '3.19.2',
    'Atencion correctiva a reportes ciudadanos de danos en espacios publicos',
    900.00, 300.00, 'Reportes atendidos', 'IND-3.19.2.2-A',
    'Reportes ciudadanos atendidos correctivamente', '4.3', 'E1.3',
    'Departamento de Espacios Publicos');
GO

-- ============================================================
-- DATOS: POA 2026
-- Programa Operativo Anual con presupuesto estimado
-- ============================================================
INSERT INTO POA (Linea_Accion, Ejercicio, Programa, Nombre_Programa, Estrategia,
    Alineacion_Plan_Nacional, Alineacion_Plan_Estatal,
    Presupuesto_Municipal, Presupuesto_Estatal, Presupuesto_Federal,
    Rubro_Cuenta, Descripcion_Compras) VALUES
('3.8.1.1', 2026, '3.8', 'Renacimiento verde', '3.8.1', '4.3', 'E1.2',
    150000.00, 50000.00, 0.00, '3.3.1',
    'Adquisicion de arbolado: arboles, tierra fina, fertilizante, herramienta de siembra'),
('3.8.1.2', 2026, '3.8', 'Renacimiento verde', '3.8.1', '4.3', 'E1.2',
    200000.00, 0.00, 0.00, '3.3.2',
    'Combustible, wiras, hilo, bolsas, herramienta de poda y mantenimiento'),
('3.8.1.3', 2026, '3.8', 'Renacimiento verde', '3.8.1', '4.3', 'E1.2',
    80000.00, 20000.00, 0.00, '3.3.3',
    'Tuberia de riego, aspersores, bombas de agua, materiales de instalacion'),
('3.8.2.1', 2026, '3.8', 'Renacimiento verde', '3.8.2', '4.3', 'E1.2',
    30000.00, 0.00, 0.00, '3.6.1',
    'Material de difusion: folletos, lonas, papeleria para campanas ambientales'),
('3.8.2.2', 2026, '3.8', 'Renacimiento verde', '3.8.2', '4.3', 'E1.2',
    40000.00, 0.00, 0.00, '3.6.2',
    'Bolsas de basura, guantes, uniformes para jornadas de limpieza'),
('3.19.1.1', 2026, '3.19', 'Recuperacion de espacios para entornos primarios', '3.19.1', '4.3', 'E1.3',
    300000.00, 100000.00, 50000.00, '3.5.1',
    'Materiales de construccion: concreto, pintura, luminarias, bancas, juegos infantiles'),
('3.19.1.2', 2026, '3.19', 'Recuperacion de espacios para entornos primarios', '3.19.1', '4.3', 'E1.3',
    250000.00, 80000.00, 0.00, '3.5.2',
    'Materiales para reparacion de infraestructura danada: varilla, cemento, pintura'),
('3.19.2.1', 2026, '3.19', 'Recuperacion de espacios para entornos primarios', '3.19.2', '4.3', 'E1.3',
    180000.00, 0.00, 0.00, '3.3.4',
    'Combustible, herramienta, materiales de limpieza y mantenimiento preventivo'),
('3.19.2.2', 2026, '3.19', 'Recuperacion de espacios para entornos primarios', '3.19.2', '4.3', 'E1.3',
    120000.00, 0.00, 0.00, '3.3.5',
    'Herramienta correctiva, pintura, materiales de reparacion urgente');
GO

-- ============================================================
-- DATOS: Detalle Actividades POA (muestra por actividad clave)
-- ============================================================
INSERT INTO Detalle_Actividades_POA (ID_POA, Actividad_Especifica, Mes_Programado, Gasto_Programado) VALUES
(1, 'Adquisicion de 500 arboles para siembra primer trimestre', 10, 50000.00),
(1, 'Siembra en parques del centro historico y colonias norte', 11, 50000.00),
(1, 'Siembra en colonias INFONAVIT y zona periferica', 12, 50000.00),
(2, 'Mantenimiento preventivo areas zona centro y jardin principal', 10, 20000.00),
(2, 'Poda masiva temporada de secas - todas las areas', 11, 30000.00),
(2, 'Limpieza general post-vientos nortes y reposicion de plantas', 1, 20000.00),
(6, 'Levantamiento de diagnostico y proyecto de rehabilitacion', 10, 30000.00),
(6, 'Inicio de obras - Plaza Las Americas y Parque El Chorrito', 11, 120000.00),
(6, 'Terminacion de obras y arranque Parque Hidalgo', 12, 150000.00);
GO

-- ============================================================
-- VISTA: Vista_Dashboard
-- Para el panel de control con semaforo
-- ============================================================
CREATE VIEW Vista_Dashboard AS
SELECT
    p.Clave_Programa,
    p.Nombre_Programa,
    e.Clave_Estrategia,
    la.Clave_Linea,
    la.Descripcion_Linea,
    la.Meta_Anual,
    la.Unidad_Medida,
    la.Institucion_Resp,
    ISNULL(SUM(ad.Cantidad), 0)          AS Total_Realizado,
    COUNT(DISTINCT ad.ID_Actividad)       AS Total_Actividades,
    CASE
        WHEN la.Meta_Anual > 0
        THEN ROUND(ISNULL(SUM(ad.Cantidad), 0) / la.Meta_Anual * 100, 2)
        ELSE 0
    END AS Porcentaje_Avance,
    CASE
        WHEN la.Meta_Anual > 0 AND (ISNULL(SUM(ad.Cantidad), 0) / la.Meta_Anual * 100) >= 80 THEN 'VERDE'
        WHEN la.Meta_Anual > 0 AND (ISNULL(SUM(ad.Cantidad), 0) / la.Meta_Anual * 100) >= 50 THEN 'AMARILLO'
        ELSE 'ROJO'
    END AS Semaforo
FROM Programas p
JOIN Estrategias e       ON e.ID_Programa     = p.ID_Programa
JOIN Lineas_Accion la    ON la.ID_Estrategia  = e.ID_Estrategia
LEFT JOIN Actividades_Diarias ad ON ad.ID_Linea_Accion = la.ID_Linea_Accion
GROUP BY
    p.Clave_Programa, p.Nombre_Programa,
    e.Clave_Estrategia,
    la.Clave_Linea, la.Descripcion_Linea,
    la.Meta_Anual, la.Unidad_Medida, la.Institucion_Resp;
GO

-- ============================================================
-- PERMISOS DE USUARIO DE APLICACION
-- ============================================================
-- Crear usuario de base de datos (ejecutar si el login ya existe)
-- CREATE LOGIN espacios_user WITH PASSWORD = 'Espacios2024!';
-- CREATE USER espacios_user FOR LOGIN espacios_user;
-- GRANT SELECT, INSERT, UPDATE ON SCHEMA::dbo TO espacios_user;
-- GO

PRINT 'Base de datos EspaciosPublicos creada y poblada exitosamente.';
GO
