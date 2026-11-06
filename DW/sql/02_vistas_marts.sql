-- =====================================================================
-- Data marts (vistas planas, listas para Power BI / el Observatorio) y
-- vistas de gobierno de los datos. Se recrean en cada corrida del ETL.
-- Mart = un proceso de decisión + sus dimensiones; no hay un "mart total".
-- =====================================================================

-- MART 1 · Necesidad no atendida y carga de las cuidadoras (ENASIC, nacional)
CREATE VIEW v_mart_necesidad_cuidado AS
SELECT f.estimacion_id,
       i.archivo_origen AS script_origen, i.tema, i.bloque, i.indicador, i.razon, i.dano, i.variable, i.categoria,
       i.unidad, i.tipo_estimacion,
       s.dimension AS dominio_dimension, s.segmento AS dominio_segmento,
       g.nombre AS geografia, g.nivel AS nivel_geografico,
       t.etiqueta AS periodo, fu.fuente_id, fu.nombre AS fuente,
       f.estimacion, f.se, f.cv, f.li90, f.ls90,
       p.clase AS precision, p.semaforo,
       f.n_muestra_dominio, f.n_muestra_si, f.total_expandido,
       f.dif_pp, f.dif_li90, f.dif_ls90, f.dif_significativa,
       f.fila_origen
FROM fact_estimacion_encuesta f
JOIN dim_indicador i ON i.indicador_sk = f.indicador_sk
JOIN dim_segmento  s ON s.segmento_sk  = f.segmento_sk
JOIN dim_geografia g ON g.geografia_sk = f.geografia_sk
JOIN dim_tiempo    t ON t.periodo_sk   = f.periodo_sk
JOIN dim_fuente   fu ON fu.fuente_sk   = f.fuente_sk
JOIN dim_precision p ON p.precision_sk = f.precision_sk;

-- MART 2 · Territorio y oferta (alcaldía y entidad) — formato largo.
-- 1.1.0: las medidas por AGEB (≈ 53 mil filas) NO entran aquí; tienen su propio mart ancho (v_mart_ageb).
CREATE VIEW v_mart_territorio AS
SELECT f.territorial_id,
       g.nivel AS nivel_geografico, g.cve_geo, g.nombre AS geografia, g.abreviatura,
       m.tema, m.codigo AS medida_codigo, m.nombre AS medida, m.unidad, m.aditiva,
       t.etiqueta AS periodo, fu.fuente_id, fu.nombre AS fuente,
       f.valor, f.valor_texto, f.cv, f.li90, f.ls90, f.n_muestra,
       p.clase AS precision, f.calidad_valor, f.nota, m.definicion_verificada,
       f.fila_origen
FROM fact_indicador_territorial f
JOIN dim_geografia g ON g.geografia_sk = f.geografia_sk
JOIN dim_medida    m ON m.medida_sk    = f.medida_sk
JOIN dim_tiempo    t ON t.periodo_sk   = f.periodo_sk
JOIN dim_fuente   fu ON fu.fuente_sk   = f.fuente_sk
JOIN dim_precision p ON p.precision_sk = f.precision_sk
WHERE g.nivel <> 'AGEB';

-- MART 3 · Asequibilidad del relevo por horas
CREATE VIEW v_mart_asequibilidad AS
SELECT a.asequibilidad_id,
       g.nombre AS geografia, g.nivel AS nivel_geografico,
       ir.nombre AS ingreso_referencia, sr.nombre AS salario_referencia, sr.tipo AS tipo_salario,
       pk.nombre AS paquete, pk.horas_semana, pk.es_control,
       c.costo_mensual_2026, c.costo_mensual_base_2022, c.costo_pct_ingreso_mediano,
       a.umbral_pct_ingreso, a.pct_hogares_asequible, a.cv, a.li90, a.ls90,
       a.n_muestra_dominio, a.n_muestra_si, a.total_expandido,
       p.clase AS precision, p.semaforo, a.tiene_varianza,
       t.etiqueta AS periodo_ingreso, fu.fuente_id, fu.nombre AS fuente, a.alcance,
       a.fila_origen
FROM fact_asequibilidad a
JOIN dim_geografia   g  ON g.geografia_sk  = a.geografia_sk
JOIN dim_ingreso_ref ir ON ir.ingreso_sk   = a.ingreso_sk
JOIN dim_salario_ref sr ON sr.salario_sk   = a.salario_sk
JOIN dim_paquete     pk ON pk.paquete_sk   = a.paquete_sk
JOIN dim_tiempo      t  ON t.periodo_sk    = a.periodo_sk
JOIN dim_fuente      fu ON fu.fuente_sk    = a.fuente_sk
JOIN dim_precision   p  ON p.precision_sk  = a.precision_sk
LEFT JOIN fact_costo_paquete c
       ON c.geografia_sk = a.geografia_sk AND c.ingreso_sk = a.ingreso_sk AND c.salario_sk = a.salario_sk
      AND c.paquete_sk   = a.paquete_sk   AND c.periodo_sk = a.periodo_sk AND c.fuente_sk  = a.fuente_sk;

-- MART 4 · Resultados de modelos (1.1.0) — formato largo, una métrica por fila.
-- objetivo_comun unifica dos vocabularios de los scripts (11: DANO_ALGUNO / DANO_SALUD_FISICA;
-- 21 y 22: ALGUN_DANO / SALUD_FISICA). El valor original se conserva en «objetivo».
CREATE VIEW v_mart_modelos AS
SELECT f.resultado_id,
       mo.codigo AS modelo, mo.nombre AS modelo_nombre, mo.tipo AS modelo_tipo, mo.decision,
       c.objetivo,
       CASE c.objetivo WHEN 'DANO_ALGUNO' THEN 'ALGUN_DANO' WHEN 'DANO_SALUD_FISICA' THEN 'SALUD_FISICA' ELSE c.objetivo END AS objetivo_comun,
       c.metodo, c.variante, c.parametros,
       me.codigo AS metrica, me.nombre AS metrica_nombre, me.unidad, me.tipo AS metrica_tipo,
       s.dimension AS dominio_dimension, s.segmento AS dominio_segmento,
       g.nivel AS nivel_geografico, g.cve_geo, g.nombre AS geografia,
       t.etiqueta AS periodo, fu.fuente_id, fu.nombre AS fuente,
       f.valor, f.valor_texto, f.li90, f.ls90, f.cv, p.clase AS precision,
       f.es_ilustrativo, f.nota, f.archivo_origen, f.fila_origen
FROM fact_resultado_modelo f
JOIN dim_modelo        mo ON mo.modelo_sk        = f.modelo_sk
JOIN dim_configuracion c  ON c.configuracion_sk  = f.configuracion_sk
JOIN dim_metrica       me ON me.metrica_sk       = f.metrica_sk
JOIN dim_segmento      s  ON s.segmento_sk       = f.segmento_sk
JOIN dim_geografia     g  ON g.geografia_sk      = f.geografia_sk
JOIN dim_tiempo        t  ON t.periodo_sk        = f.periodo_sk
JOIN dim_fuente        fu ON fu.fuente_sk        = f.fuente_sk
JOIN dim_precision     p  ON p.precision_sk      = f.precision_sk;

-- Catálogo: qué modelo existe, qué decisión informa, contra qué alternativa simple se compara y qué tan maduro está.
CREATE VIEW v_catalogo_modelos AS
SELECT mo.codigo AS modelo, mo.nombre, mo.tipo, mo.script, mo.decision, mo.alternativa_simple, mo.estado, mo.advertencia,
       COUNT(f.resultado_id) AS n_resultados,
       COUNT(DISTINCT f.archivo_origen) AS n_archivos,
       COUNT(DISTINCT f.configuracion_sk) AS n_configuraciones,
       SUM(f.es_ilustrativo) AS n_ilustrativos,
       GROUP_CONCAT(DISTINCT f.archivo_origen) AS archivos
FROM dim_modelo mo LEFT JOIN fact_resultado_modelo f ON f.modelo_sk = mo.modelo_sk
GROUP BY mo.modelo_sk;

-- ---------------------------------------------------------------------
-- Gobierno de los datos: las reglas del proyecto convertidas en consultas
-- ---------------------------------------------------------------------

-- Regla: "ninguna afirmación puede referirse a una tendencia cuyo periodo no
-- esté cubierto al menos dos veces". permite_tendencia = 0 → no dibujar líneas.
CREATE VIEW v_cobertura_temporal AS
SELECT fuente_id, fuente, tabla_hecho, COUNT(DISTINCT periodo) AS n_periodos_distintos,
       GROUP_CONCAT(DISTINCT periodo) AS periodos,
       CASE WHEN COUNT(DISTINCT periodo) >= 2 THEN 1 ELSE 0 END AS permite_tendencia
FROM (
  SELECT fu.fuente_id, fu.nombre AS fuente, 'fact_estimacion_encuesta' AS tabla_hecho, t.etiqueta AS periodo
    FROM fact_estimacion_encuesta f JOIN dim_fuente fu USING (fuente_sk) JOIN dim_tiempo t USING (periodo_sk)
  UNION ALL
  SELECT fu.fuente_id, fu.nombre, 'fact_indicador_territorial', t.etiqueta
    FROM fact_indicador_territorial f JOIN dim_fuente fu USING (fuente_sk) JOIN dim_tiempo t USING (periodo_sk)
  UNION ALL
  SELECT fu.fuente_id, fu.nombre, 'fact_asequibilidad', t.etiqueta
    FROM fact_asequibilidad f JOIN dim_fuente fu USING (fuente_sk) JOIN dim_tiempo t USING (periodo_sk)
  UNION ALL
  SELECT fu.fuente_id, fu.nombre, 'fact_resultado_modelo', t.etiqueta
    FROM fact_resultado_modelo f JOIN dim_fuente fu USING (fuente_sk) JOIN dim_tiempo t USING (periodo_sk)
)
GROUP BY fuente_id, fuente, tabla_hecho;

-- Regla: "desconocido" es una respuesta válida. Alcaldías SIN dato por medida
-- (no se rellenan con 0).
CREATE VIEW v_cobertura_geografica AS
SELECT m.codigo AS medida_codigo, m.nombre AS medida, g.nombre AS alcaldia_sin_dato
FROM dim_medida m
JOIN dim_geografia g ON g.nivel = 'Alcaldía'
WHERE m.nivel_geo = 'Alcaldía'
  AND NOT EXISTS (SELECT 1 FROM fact_indicador_territorial f
                  WHERE f.medida_sk = m.medida_sk AND f.geografia_sk = g.geografia_sk);

-- Regla: "los datos de una encuesta nacional no sustentan conclusiones por
-- alcaldía". Debe devolver CERO filas (el ETL falla si no).
CREATE VIEW v_violaciones_alcance AS
SELECT 'fact_estimacion_encuesta' AS hecho, f.estimacion_id AS id, fu.fuente_id, g.nivel AS nivel_hecho, fu.nivel_geo_max
FROM fact_estimacion_encuesta f JOIN dim_geografia g USING (geografia_sk) JOIN dim_fuente fu USING (fuente_sk)
WHERE g.nivel_orden > fu.nivel_geo_max_orden
UNION ALL
SELECT 'fact_indicador_territorial', f.territorial_id, fu.fuente_id, g.nivel, fu.nivel_geo_max
FROM fact_indicador_territorial f JOIN dim_geografia g USING (geografia_sk) JOIN dim_fuente fu USING (fuente_sk)
WHERE g.nivel_orden > fu.nivel_geo_max_orden
UNION ALL
SELECT 'fact_asequibilidad', f.asequibilidad_id, fu.fuente_id, g.nivel, fu.nivel_geo_max
FROM fact_asequibilidad f JOIN dim_geografia g USING (geografia_sk) JOIN dim_fuente fu USING (fuente_sk)
WHERE g.nivel_orden > fu.nivel_geo_max_orden
UNION ALL
SELECT 'fact_resultado_modelo', f.resultado_id, fu.fuente_id, g.nivel, fu.nivel_geo_max
FROM fact_resultado_modelo f JOIN dim_geografia g USING (geografia_sk) JOIN dim_fuente fu USING (fuente_sk)
WHERE g.nivel_orden > fu.nivel_geo_max_orden;

-- Calidad de las estimaciones por tipo de precisión (para el pie de cada gráfica)
CREATE VIEW v_calidad_precision AS
SELECT i.archivo_origen AS script_origen, p.clase AS precision, COUNT(*) AS n_estimaciones
FROM fact_estimacion_encuesta f
JOIN dim_indicador i USING (indicador_sk) JOIN dim_precision p USING (precision_sk)
GROUP BY i.archivo_origen, p.clase;

CREATE VIEW v_diccionario_medidas AS
SELECT m.codigo, m.nombre, m.tema, m.unidad, m.aditiva, m.nivel_geo, m.definicion, m.definicion_verificada,
       GROUP_CONCAT(DISTINCT fu.fuente_id) AS fuentes, GROUP_CONCAT(DISTINCT t.etiqueta) AS periodos,
       GROUP_CONCAT(DISTINCT f.calidad_valor) AS calidad_valor, COUNT(*) AS n_valores
FROM dim_medida m
LEFT JOIN fact_indicador_territorial f ON f.medida_sk = m.medida_sk
LEFT JOIN dim_fuente fu ON fu.fuente_sk = f.fuente_sk
LEFT JOIN dim_tiempo t ON t.periodo_sk = f.periodo_sk
GROUP BY m.medida_sk;
