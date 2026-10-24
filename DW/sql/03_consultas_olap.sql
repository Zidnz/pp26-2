-- =====================================================================
-- Consultas OLAP de demostración sobre los data marts (SQLite).
-- Cada una responde una pregunta de decisión del Observatorio y respeta
-- los límites de la fuente (nivel geográfico, precisión, periodo).
-- Ejecutar:  python -B DW/sql/ejecutar_consultas.py
-- =====================================================================

-- Q1 · ROLL-UP geográfico: de alcaldía a CDMX. ¿Dónde está la oferta del núcleo?
SELECT alcaldia, oferta_nucleo_estab AS establecimientos,
       ROUND(100.0 * oferta_nucleo_estab / SUM(oferta_nucleo_estab) OVER (), 1) AS pct_cdmx,
       SUM(oferta_nucleo_estab) OVER () AS total_cdmx
FROM v_mart_perfil_alcaldia
ORDER BY establecimientos DESC;

-- Q2 · DRILL-DOWN por segmento: ¿quién carga 40 horas o más? (ENASIC, nacional; con IC y precisión)
SELECT dominio_dimension AS dimension, dominio_segmento AS segmento,
       estimacion AS pct_40h_o_mas, li90, ls90, precision, n_muestra_dominio
FROM v_mart_necesidad_cuidado
WHERE script_origen = '12_segmentacion_estimaciones.csv' AND tema = 'carga' AND indicador LIKE 'Cuida 40 h%'
ORDER BY dominio_dimension, estimacion DESC;

-- Q3 · SLICE de asequibilidad: relevo de 6 h/sem, piso legal, umbral 20 % del ingreso.
--      El ingreso (ENASIC vs ENIGH) y el nivel (nacional vs CDMX) cambian la respuesta: se muestran juntos.
SELECT geografia, ingreso_referencia, costo_mensual_2026 AS costo_mes, pct_hogares_asequible AS pct_hogares_que_pueden,
       li90, ls90, precision, tiene_varianza
FROM v_mart_asequibilidad
WHERE paquete = 'Relevo 6 h/sem' AND tipo_salario = 'piso legal' AND umbral_pct_ingreso = 20
ORDER BY geografia, ingreso_referencia;

-- Q4 · BRECHA territorial: oferta frente a población 60+, junto con rezago (alcaldía). Índice < 1 = menos oferta que población.
SELECT alcaldia, oferta_nucleo_indice_vs_60 AS indice_oferta_vs_60,
       plazas_por_1000_personas_adl AS plazas_x_1000_adl,   -- NULL = desconocido, no cero
       rezago_pct_pob_medio_o_mas AS pct_pob_rezago_medio_o_mas,
       pob_60mas_censo2020 AS pob_60mas
FROM v_mart_perfil_alcaldia
ORDER BY indice_oferta_vs_60;

-- Q5 · COBERTURA: qué alcaldías quedan sin dato por medida (desconocido ≠ 0)
SELECT medida_codigo, GROUP_CONCAT(alcaldia_sin_dato, ', ') AS alcaldias_sin_dato
FROM v_cobertura_geografica GROUP BY medida_codigo;

-- Q6 · TENDENCIAS: ¿alguna fuente admite series de tiempo? (regla de ≥ 2 periodos)
SELECT fuente_id, tabla_hecho, periodos, permite_tendencia FROM v_cobertura_temporal ORDER BY fuente_id;

-- Q7 · CALIDAD: cuántas estimaciones son confiables, por script de origen
SELECT script_origen, precision, n_estimaciones FROM v_calidad_precision ORDER BY script_origen, precision;

-- Q8 · LINAJE: de una cifra del tablero a su fila de origen
SELECT indicador, dominio_segmento, estimacion, total_expandido, script_origen, fila_origen
FROM v_mart_necesidad_cuidado
WHERE indicador LIKE '%grupo%' OR indicador LIKE 'Declara algún daño%'
LIMIT 10;
