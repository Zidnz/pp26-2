-- =====================================================================
-- Observatorio del Cuidado · Data Warehouse (esquema dimensional)
-- Motor: SQLite 3.37+  ·  Versión del esquema: 1.1.0 (29 oct 2026; 1.0.0 del 20 oct 2026)
-- 1.1.0: nivel AGEB en dim_geografia; resultados de modelos (scripts 11 y 18 a 25) en
--        fact_resultado_modelo con dim_modelo, dim_metrica y dim_configuracion.
-- Estado de revisión: SIN revisión de otra persona.
--
-- Qué es: un almacén de INDICADORES PUBLICADOS (estimaciones con intervalo,
-- conteos por alcaldía, costos). No es un almacén transaccional: no hay
-- microdatos ni datos personales. Cada hecho es una cifra agregada y lleva
-- su fuente, su periodo, su nivel geográfico y la fila del archivo de origen.
--
-- Convenciones: *_sk = clave sustituta; sk = 0 es el miembro "desconocido /
-- no aplica" (desconocido NO se convierte en 0 ni se omite en silencio).
-- =====================================================================
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- 1. Metadatos del ETL (auditoría y calidad)
-- ---------------------------------------------------------------------
CREATE TABLE etl_run (
  run_id       INTEGER PRIMARY KEY,
  inicio       TEXT NOT NULL,
  fin          TEXT,
  estado       TEXT CHECK (estado IN ('en curso','ok','ok con advertencias','fallido')),
  version_etl  TEXT NOT NULL,
  raiz_repo    TEXT
);
CREATE TABLE etl_archivo (            -- linaje: qué se leyó, cuándo y con qué huella
  run_id     INTEGER NOT NULL REFERENCES etl_run(run_id),
  nombre_stg TEXT NOT NULL,
  ruta       TEXT NOT NULL,
  sha256     TEXT NOT NULL,
  n_filas    INTEGER NOT NULL,
  nota       TEXT,
  PRIMARY KEY (run_id, nombre_stg)
);
CREATE TABLE etl_rechazo (            -- filas que NO entraron a un hecho, con motivo
  run_id    INTEGER NOT NULL,
  archivo   TEXT NOT NULL,
  fila      INTEGER,
  destino   TEXT NOT NULL,
  motivo    TEXT NOT NULL,
  valor     TEXT
);
CREATE TABLE etl_dq (                 -- resultado de cada prueba de calidad
  run_id      INTEGER NOT NULL,
  codigo      TEXT NOT NULL,
  severidad   TEXT NOT NULL CHECK (severidad IN ('error','advertencia','info')),
  descripcion TEXT NOT NULL,
  paso        INTEGER NOT NULL CHECK (paso IN (0,1)),   -- 1 = la prueba se cumplió
  detalle     TEXT
);

-- ---------------------------------------------------------------------
-- 2. Dimensiones (conformadas: las comparten dos o más hechos)
-- ---------------------------------------------------------------------
CREATE TABLE dim_tiempo (
  periodo_sk     INTEGER PRIMARY KEY,
  etiqueta       TEXT NOT NULL UNIQUE,
  anio           INTEGER,
  mes            INTEGER,
  es_desconocido INTEGER NOT NULL DEFAULT 0 CHECK (es_desconocido IN (0,1))
);
INSERT INTO dim_tiempo VALUES (0,'desconocido',NULL,NULL,1);

CREATE TABLE dim_fuente (
  fuente_sk              INTEGER PRIMARY KEY,
  fuente_id              TEXT NOT NULL UNIQUE,   -- F04, F02... (inventario_fuentes_cuidado.csv) o P0x / I0x
  nombre                 TEXT NOT NULL,
  emisor                 TEXT,
  origen_tipo            TEXT NOT NULL CHECK (origen_tipo IN
                           ('externa oficial','externa no oficial','archivo del proyecto (productor desconocido)','interna (supuesto del equipo)')),
  nivel_geo_max          TEXT NOT NULL,          -- texto del inventario
  nivel_geo_max_orden    INTEGER NOT NULL CHECK (nivel_geo_max_orden BETWEEN 1 AND 4), -- 1 Nacional, 2 Entidad, 3 Alcaldía, 4 AGEB o más fino
  periodo_cubierto       TEXT,
  estado_evidencia       TEXT,
  permite_afirmar        TEXT,
  prohibe_afirmar        TEXT
);

CREATE TABLE dim_geografia (
  geografia_sk INTEGER PRIMARY KEY,
  nivel        TEXT NOT NULL CHECK (nivel IN ('No aplica','Nacional','Entidad','Alcaldía','AGEB')),
  nivel_orden  INTEGER NOT NULL CHECK (nivel_orden BETWEEN 0 AND 4),   -- 0 no aplica, 1 Nacional, 2 Entidad, 3 Alcaldía, 4 AGEB urbana
  cve_geo      TEXT NOT NULL UNIQUE,             -- 00 nacional · 09 entidad · 09002 alcaldía · 0900200010010 AGEB (INEGI)
  nombre       TEXT NOT NULL,
  abreviatura  TEXT,
  padre_sk     INTEGER REFERENCES dim_geografia(geografia_sk)
);
INSERT INTO dim_geografia VALUES (0,'No aplica',0,'NA','No aplica',NULL,NULL);

CREATE TABLE dim_precision (
  precision_sk INTEGER PRIMARY KEY,
  clase        TEXT NOT NULL UNIQUE,
  orden        INTEGER NOT NULL,
  semaforo     TEXT NOT NULL,
  regla        TEXT NOT NULL
);
INSERT INTO dim_precision VALUES
 (0,'no aplica',0,'gris','la cifra no es una estimación con CV (conteo, razón, derivada)'),
 (1,'alta',1,'verde','CV < 15 (criterio INEGI)'),
 (2,'moderada',2,'ámbar','15 <= CV < 30 (criterio INEGI)'),
 (3,'baja',3,'rojo','CV >= 30 (criterio INEGI)'),
 (4,'no estimable',4,'rojo','CV no calculable');

CREATE TABLE dim_segmento (            -- dominio de estimación: a quién se refiere la cifra
  segmento_sk INTEGER PRIMARY KEY,
  dimension   TEXT NOT NULL,
  segmento    TEXT NOT NULL,
  es_total    INTEGER NOT NULL CHECK (es_total IN (0,1)),
  UNIQUE (dimension, segmento)
);

CREATE TABLE dim_indicador (           -- qué evento se estima (numerador) y en qué unidad
  indicador_sk    INTEGER PRIMARY KEY,
  archivo_origen  TEXT NOT NULL,
  bloque          TEXT NOT NULL DEFAULT '',
  indicador       TEXT NOT NULL,
  razon           TEXT NOT NULL DEFAULT '',
  dano            TEXT NOT NULL DEFAULT '',
  variable        TEXT NOT NULL DEFAULT '',
  categoria       TEXT NOT NULL DEFAULT '',
  clave_corta     TEXT NOT NULL DEFAULT '',
  tema            TEXT NOT NULL DEFAULT '',
  unidad          TEXT NOT NULL,                      -- '%', 'pp', 'horas/semana'
  tipo_estimacion TEXT NOT NULL CHECK (tipo_estimacion IN ('proporcion','diferencia','total','promedio')),
  UNIQUE (archivo_origen, bloque, indicador, razon, dano, variable, categoria)
);

CREATE TABLE dim_medida (              -- catálogo de medidas territoriales (alcaldía / entidad)
  medida_sk             INTEGER PRIMARY KEY,
  codigo                TEXT NOT NULL UNIQUE,
  nombre                TEXT NOT NULL,
  tema                  TEXT NOT NULL,
  unidad                TEXT NOT NULL,
  aditiva               INTEGER NOT NULL CHECK (aditiva IN (0,1)),   -- 1: se puede sumar entre alcaldías
  nivel_geo             TEXT NOT NULL CHECK (nivel_geo IN ('Alcaldía','Entidad','AGEB')),
  definicion            TEXT NOT NULL,
  definicion_verificada INTEGER NOT NULL CHECK (definicion_verificada IN (0,1))
);

CREATE TABLE dim_paquete (
  paquete_sk    INTEGER PRIMARY KEY,
  nombre        TEXT NOT NULL UNIQUE,
  horas_semana  INTEGER NOT NULL,
  es_control    INTEGER NOT NULL CHECK (es_control IN (0,1))   -- 1: jornada completa usada solo como contraste
);
CREATE TABLE dim_salario_ref (
  salario_sk        INTEGER PRIMARY KEY,
  nombre            TEXT NOT NULL UNIQUE,
  tipo              TEXT NOT NULL CHECK (tipo IN ('piso legal','referencia (no piso legal)')),
  salario_hora_2026 REAL
);
CREATE TABLE dim_ingreso_ref (
  ingreso_sk INTEGER PRIMARY KEY,
  nombre     TEXT NOT NULL UNIQUE,
  fuente_id  TEXT NOT NULL
);

-- ---------------------------------------------------------------------
-- 3. Tablas de hechos (cada una con su GRANO; no se mezclan)
-- ---------------------------------------------------------------------

-- Grano: una estimación (indicador × dominio × geografía × periodo × fuente).
-- Las columnas son no aditivas salvo total_expandido dentro del MISMO dominio.
CREATE TABLE fact_estimacion_encuesta (
  estimacion_id     INTEGER PRIMARY KEY,
  indicador_sk      INTEGER NOT NULL REFERENCES dim_indicador(indicador_sk),
  segmento_sk       INTEGER NOT NULL REFERENCES dim_segmento(segmento_sk),
  geografia_sk      INTEGER NOT NULL REFERENCES dim_geografia(geografia_sk),
  periodo_sk        INTEGER NOT NULL REFERENCES dim_tiempo(periodo_sk),
  fuente_sk         INTEGER NOT NULL REFERENCES dim_fuente(fuente_sk),
  precision_sk      INTEGER NOT NULL REFERENCES dim_precision(precision_sk),
  estimacion        REAL,        -- unidad en dim_indicador.unidad
  se                REAL,
  cv                REAL,
  li90              REAL,
  ls90              REAL,
  n_muestra_dominio INTEGER,
  n_muestra_si      INTEGER,
  total_expandido   REAL,
  dif_pp            REAL,        -- diferencia contra el resto o contra otro grupo (pp)
  dif_li90          REAL,
  dif_ls90          REAL,
  dif_significativa INTEGER CHECK (dif_significativa IN (0,1)),
  archivo_origen    TEXT NOT NULL,
  fila_origen       INTEGER NOT NULL,
  run_id            INTEGER NOT NULL REFERENCES etl_run(run_id),
  UNIQUE (indicador_sk, segmento_sk, geografia_sk, periodo_sk, fuente_sk)
);

-- Grano: una medida por alcaldía o entidad, periodo y fuente.
CREATE TABLE fact_indicador_territorial (
  territorial_id INTEGER PRIMARY KEY,
  geografia_sk   INTEGER NOT NULL REFERENCES dim_geografia(geografia_sk),
  medida_sk      INTEGER NOT NULL REFERENCES dim_medida(medida_sk),
  periodo_sk     INTEGER NOT NULL REFERENCES dim_tiempo(periodo_sk),
  fuente_sk      INTEGER NOT NULL REFERENCES dim_fuente(fuente_sk),
  precision_sk   INTEGER NOT NULL REFERENCES dim_precision(precision_sk),
  valor          REAL,
  valor_texto    TEXT,
  cv             REAL,
  li90           REAL,
  ls90           REAL,
  n_muestra      INTEGER,
  calidad_valor  TEXT NOT NULL CHECK (calidad_valor IN
                  ('observado','derivado','derivado (mezcla de fuentes)','derivado (modelo)','derivado (regla)','derivado (ETL)')),
  nota           TEXT,
  archivo_origen TEXT NOT NULL,
  fila_origen    INTEGER NOT NULL,
  run_id         INTEGER NOT NULL REFERENCES etl_run(run_id),
  CHECK (valor IS NOT NULL OR valor_texto IS NOT NULL),
  UNIQUE (geografia_sk, medida_sk, periodo_sk, fuente_sk)
);

-- Grano: costo mensual de un paquete de relevo bajo un salario de referencia.
CREATE TABLE fact_costo_paquete (
  costo_id                  INTEGER PRIMARY KEY,
  geografia_sk              INTEGER NOT NULL REFERENCES dim_geografia(geografia_sk),
  ingreso_sk                INTEGER NOT NULL REFERENCES dim_ingreso_ref(ingreso_sk),
  salario_sk                INTEGER NOT NULL REFERENCES dim_salario_ref(salario_sk),
  paquete_sk                INTEGER NOT NULL REFERENCES dim_paquete(paquete_sk),
  periodo_sk                INTEGER NOT NULL REFERENCES dim_tiempo(periodo_sk),
  fuente_sk                 INTEGER NOT NULL REFERENCES dim_fuente(fuente_sk),
  costo_mensual_2026        REAL NOT NULL,            -- pesos 2026, sin prestaciones
  costo_mensual_base_2022   REAL,                     -- mismo costo deflactado a la base del ingreso (2022)
  costo_pct_ingreso_mediano REAL,                     -- solo en el script 10 (ingreso ENASIC)
  archivo_origen            TEXT NOT NULL,
  fila_origen               INTEGER NOT NULL,
  run_id                    INTEGER NOT NULL REFERENCES etl_run(run_id),
  UNIQUE (geografia_sk, ingreso_sk, salario_sk, paquete_sk, periodo_sk, fuente_sk)
);

-- Grano: % de hogares que podrían pagar el paquete sin pasar el umbral de su ingreso.
CREATE TABLE fact_asequibilidad (
  asequibilidad_id       INTEGER PRIMARY KEY,
  geografia_sk           INTEGER NOT NULL REFERENCES dim_geografia(geografia_sk),
  ingreso_sk             INTEGER NOT NULL REFERENCES dim_ingreso_ref(ingreso_sk),
  salario_sk             INTEGER NOT NULL REFERENCES dim_salario_ref(salario_sk),
  paquete_sk             INTEGER NOT NULL REFERENCES dim_paquete(paquete_sk),
  periodo_sk             INTEGER NOT NULL REFERENCES dim_tiempo(periodo_sk),
  fuente_sk              INTEGER NOT NULL REFERENCES dim_fuente(fuente_sk),
  precision_sk           INTEGER NOT NULL REFERENCES dim_precision(precision_sk),
  umbral_pct_ingreso     INTEGER NOT NULL CHECK (umbral_pct_ingreso IN (10,20,30)),
  pct_hogares_asequible  REAL NOT NULL,
  cv                     REAL,
  li90                   REAL,
  ls90                   REAL,
  n_muestra_dominio      INTEGER,
  n_muestra_si           INTEGER,
  total_expandido        REAL,                        -- hogares
  tiene_varianza         INTEGER NOT NULL CHECK (tiene_varianza IN (0,1)),
  alcance                TEXT,
  archivo_origen         TEXT NOT NULL,
  fila_origen            INTEGER NOT NULL,
  run_id                 INTEGER NOT NULL REFERENCES etl_run(run_id),
  UNIQUE (geografia_sk, ingreso_sk, salario_sk, paquete_sk, umbral_pct_ingreso, periodo_sk, fuente_sk)
);

-- ---------------------------------------------------------------------
-- 4. Resultados de modelos (1.1.0, 29 oct 2026)
-- Un modelo no es una observación: sus cifras dependen de un método, de
-- parámetros y de supuestos. Por eso van en un hecho aparte y nunca se
-- mezclan con las estimaciones de encuesta ni con las medidas territoriales.
-- ---------------------------------------------------------------------
CREATE TABLE dim_modelo (
  modelo_sk          INTEGER PRIMARY KEY,
  codigo             TEXT NOT NULL UNIQUE,      -- M11, M18 ... M25 (número del script o sección)
  nombre             TEXT NOT NULL,
  tipo               TEXT NOT NULL CHECK (tipo IN ('modelo supervisado','agrupamiento','clases latentes','regla de decisión',
                                                   'tarjeta de puntos','escenario','cálculo de costo','prueba de sensibilidad','diagnóstico descriptivo')),
  script             TEXT NOT NULL,             -- dónde vive el código que produce los archivos
  decision           TEXT NOT NULL,             -- qué decisión del Observatorio informa
  alternativa_simple TEXT NOT NULL,             -- regla del proyecto: todo modelo se compara contra una alternativa simple
  estado             TEXT NOT NULL,             -- exploratorio / sin doble revisión / vigente...
  advertencia        TEXT
);
CREATE TABLE dim_metrica (
  metrica_sk  INTEGER PRIMARY KEY,
  codigo      TEXT NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  unidad      TEXT NOT NULL,                    -- '%', 'pp', '0-1', 'personas', '$ 2026/mes', 'indicador 0/1', 'texto'...
  tipo        TEXT NOT NULL CHECK (tipo IN ('proporcion','diferencia','ajuste','conteo','monto','indice','rango','parametro','texto'))
);
CREATE TABLE dim_configuracion (       -- con qué se corrió: objetivo, método, variante y parámetros (texto canónico «a=1; b=2»)
  configuracion_sk INTEGER PRIMARY KEY,
  modelo_sk        INTEGER NOT NULL REFERENCES dim_modelo(modelo_sk),
  objetivo         TEXT NOT NULL DEFAULT '',
  metodo           TEXT NOT NULL DEFAULT '',
  variante         TEXT NOT NULL DEFAULT '',
  parametros       TEXT NOT NULL DEFAULT '',
  UNIQUE (modelo_sk, objetivo, metodo, variante, parametros)
);
-- Grano: una métrica de un modelo, en una configuración, para un dominio y una geografía.
-- No aditivo. es_ilustrativo = 1 cuando la cifra descansa en supuestos sin fuente (escenarios).
CREATE TABLE fact_resultado_modelo (
  resultado_id      INTEGER PRIMARY KEY,
  modelo_sk         INTEGER NOT NULL REFERENCES dim_modelo(modelo_sk),
  configuracion_sk  INTEGER NOT NULL REFERENCES dim_configuracion(configuracion_sk),
  metrica_sk        INTEGER NOT NULL REFERENCES dim_metrica(metrica_sk),
  segmento_sk       INTEGER NOT NULL REFERENCES dim_segmento(segmento_sk),
  geografia_sk      INTEGER NOT NULL REFERENCES dim_geografia(geografia_sk),
  periodo_sk        INTEGER NOT NULL REFERENCES dim_tiempo(periodo_sk),
  fuente_sk         INTEGER NOT NULL REFERENCES dim_fuente(fuente_sk),
  precision_sk      INTEGER NOT NULL REFERENCES dim_precision(precision_sk),
  valor             REAL,
  valor_texto       TEXT,
  li90              REAL,                      -- intervalo al 90 % (o percentiles 5-95 de validación cruzada; ver nota)
  ls90              REAL,
  cv                REAL,
  es_ilustrativo    INTEGER NOT NULL DEFAULT 0 CHECK (es_ilustrativo IN (0,1)),
  nota              TEXT,
  archivo_origen    TEXT NOT NULL,
  fila_origen       INTEGER NOT NULL,
  run_id            INTEGER NOT NULL REFERENCES etl_run(run_id),
  CHECK (valor IS NOT NULL OR valor_texto IS NOT NULL),
  UNIQUE (modelo_sk, configuracion_sk, metrica_sk, segmento_sk, geografia_sk, periodo_sk, fuente_sk)
);
CREATE INDEX ix_frm_mod ON fact_resultado_modelo(modelo_sk);
CREATE INDEX ix_frm_met ON fact_resultado_modelo(metrica_sk);
CREATE INDEX ix_dgeo_padre ON dim_geografia(padre_sk);

CREATE INDEX ix_fee_ind  ON fact_estimacion_encuesta(indicador_sk);
CREATE INDEX ix_fee_seg  ON fact_estimacion_encuesta(segmento_sk);
CREATE INDEX ix_fit_geo  ON fact_indicador_territorial(geografia_sk);
CREATE INDEX ix_fit_med  ON fact_indicador_territorial(medida_sk);
