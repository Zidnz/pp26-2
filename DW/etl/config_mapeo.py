# -*- coding: utf-8 -*-
"""Mapeo declarativo fuente -> destino del ETL del Observatorio.

Todo lo que el ETL "sabe" a mano está aquí y en ningún otro lado: qué archivos lee,
qué fuente documental respalda a cada uno, qué medida territorial es cada columna.
Regla del proyecto: nada inventado. Donde la definición NO está verificada se declara
(definicion_verificada = 0) en vez de redactar una definición que suene bien.
"""

# nombre de staging -> ruta relativa a la raíz del repositorio
ARCHIVOS = {
    # --- estimaciones de encuesta (ENASIC 2022) ---
    "enasic_03":  "Analysis/resultados/03_enasic_barreras_estimaciones.csv",
    "enasic_04":  "Analysis/resultados/04_contratacion_por_quintil.csv",
    "enasic_07":  "Analysis/resultados/07_enasic_necesidad_vs_norma_estimaciones.csv",
    "enasic_12":  "Analysis/resultados/12_segmentacion_estimaciones.csv",
    "enasic_12b": "Analysis/resultados/12b_segmentacion_series.csv",
    "enasic_16":  "Analysis/resultados/16_perfil_grupo_problema.csv",
    # --- asequibilidad ---
    "aseq_10":    "Analysis/resultados/10_asequibilidad_relevo.csv",
    "aseq_14":    "Analysis/resultados/14_enigh_asequibilidad_cdmx.csv",
    # --- territorio y oferta ---
    "terr_oferta_nucleo": "Analysis/outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv",
    "terr_indice_tipo":   "Analysis/outputs/indice_por_tipo_servicio.csv",
    "terr_capacidad":     "Analysis/resultados/02_indice_capacidad_residencial.csv",
    "terr_oferta_alc":    "Analysis/resultados/oferta_por_alcaldia.csv",        # SOLO verificación, no se carga (ver DQ10)
    "terr_dependencia":   "Analysis/resultados/08_dependencia_severa_alcaldia.csv",
    "terr_pobreza65":     "Analysis/resultados/09_pobreza_65mas_alcaldia_cdmx.csv",
    "terr_rezago":        "Analysis/resultados/13_rezago_por_alcaldia.csv",
    "terr_tipologia":     "Analysis/resultados/18_tipologia_por_alcaldia.csv",
    "terr_enigh_ent":     "Analysis/resultados/17_enigh_60mas_por_entidad.csv",
    # --- referencia documental (metadatos de las fuentes) ---
    "ref_inventario":     "Analysis/matrices/inventario_fuentes_cuidado.csv",
}
CENSO_ZIP = "Analysis/datos/censo2020_ageb/ageb_mza_urbana_09_cpv2020_csv.zip"
CENSO_CSV = "ageb_mza_urbana_09_cpv2020/conjunto_de_datos/conjunto_de_datos_ageb_urbana_09_cpv2020.csv"
MARCO_GEO_DBF = "Analysis/datos/marco_geo_2025/09mun.dbf"          # INEGI, Marco Geoestadístico 2025
JSON_OBSERVATORIO = "Frontend/observatorio/datos_observatorio.json"  # solo para reconciliar (DQ18)

# ---------------------------------------------------------------------------------
# Fuentes. Las F## salen de inventario_fuentes_cuidado.csv (el ETL las lee de ahí).
# Aquí solo se añade lo que el inventario no dice: el nivel geográfico máximo como
# número (para la prueba de alcance) y las fuentes que el inventario no cubre (P##, I##).
# nivel: 1 Nacional, 2 Entidad, 3 Alcaldía o más fino.
# ---------------------------------------------------------------------------------
FUENTES_INVENTARIO = {          # fuente_id -> (nivel_geo_max_orden, origen_tipo)
    "F02": (3, "externa oficial"),   # Censo 2020 por AGEB/manzana
    "F04": (1, "externa oficial"),   # ENASIC 2022: solo nacional
    "F09": (3, "externa oficial"),   # DENUE
    "F20": (3, "externa oficial"),   # CONEVAL rezago social por AGEB
    "F22": (3, "externa oficial"),   # CONAPO marginación por municipio
    "F23": (2, "externa oficial"),   # ENIGH 2022 (CONEVAL): hasta entidad
    "F24": (3, "externa oficial"),   # CONEVAL pobreza municipal 2020
}
FUENTES_PROYECTO = {            # archivos del proyecto cuyo productor y año están marcados "desconocido" en 02_fichas_fuentes.csv
    "P01": dict(nombre="Población de más de 60 años.csv (archivo del proyecto)",
                nivel_txt="Alcaldía", periodo="desconocido (ficha 02_fichas_fuentes)"),
    "P02": dict(nombre="Capacidad disponible en residencias permanentes de sector privado para adultos y adultas mayores.csv (archivo del proyecto)",
                nivel_txt="Alcaldía (12 de 16; faltan VC, TLAH, CUAJ, MA)", periodo="desconocido (ficha 02_fichas_fuentes)"),
    "P03": dict(nombre="Población con discapacidad que necesita ayuda para las actividades de la vida diaria.csv (archivo del proyecto)",
                nivel_txt="Alcaldía", periodo="desconocido (ficha 02_fichas_fuentes)"),
}
FUENTES_EXTRA = {                # fuentes externas oficiales que usan los notebooks y que el inventario no lista
    "X01": dict(nombre="Pobreza por grupos poblacionales a escala municipal 2010, 2015 y 2020 (hoja adultmay)", emisor="CONEVAL",
                nivel_txt="Municipio (alcaldía)", periodo="2010, 2015 y 2020", orden=3, origen="externa oficial"),
}
FUENTE_INTERNA = dict(fuente_id="I01", nombre="Supuestos declarados del equipo (salario de referencia, jornada, umbrales)",
                      emisor="Equipo del proyecto", nivel_txt="No aplica")

# ---------------------------------------------------------------------------------
# Abreviaturas de alcaldía usadas en 02 y 08 -> clave municipal INEGI.
# Se validan contra evidencia independiente en la prueba DQ09 (plazas por abreviatura
# == capacidad por nombre en oferta_por_alcaldia.csv).
# ---------------------------------------------------------------------------------
ABREV_ALCALDIA = {
    "AZC": "002", "COY": "003", "CUAJ": "004", "GAM": "005", "IZTAC": "006", "IZTAP": "007",
    "MC": "008", "MA": "009", "AO": "010", "TLAH": "011", "TLAL": "012", "XOCH": "013",
    "BJ": "014", "CUAU": "015", "MH": "016", "VC": "017",
}

# ---------------------------------------------------------------------------------
# Medidas territoriales. Una tupla por columna que se carga:
#   (archivo_stg, columna, codigo, nombre, unidad, aditiva, fuente_id, periodo, calidad_valor,
#    tema, definicion, definicion_verificada)
# periodo: etiqueta de dim_tiempo ('2020', '2022', 'mayo 2026' o 'desconocido').
# ---------------------------------------------------------------------------------
_N1 = "Conteo por alcaldía del núcleo de oferta (asilos + centros de día) que el notebook 01 selecciona del DENUE 05/2026"
MEDIDAS = [
 # --- oferta (DENUE, notebook 01) ---
 ("terr_oferta_nucleo","establecimientos","oferta_nucleo_estab","Establecimientos del núcleo de oferta","establecimientos",1,"F09","mayo 2026","derivado","oferta",
  _N1+"; la suma de las 16 alcaldías (235) coincide con la bitácora del 20 sept.",1),
 ("terr_oferta_nucleo","asilos","oferta_nucleo_asilos","Asilos y residencias del núcleo","establecimientos",1,"F09","mayo 2026","derivado","oferta",
  "Del núcleo de oferta, los clasificados como asilos y residencias (notebook 01).",0),
 ("terr_oferta_nucleo","centros_dia","oferta_nucleo_centros_dia","Centros de día del núcleo","establecimientos",1,"F09","mayo 2026","derivado","oferta",
  "Del núcleo de oferta, los clasificados como centros de día (notebook 01).",0),
 ("terr_oferta_nucleo","publicos","oferta_nucleo_publicos","Establecimientos del núcleo clasificados como públicos","establecimientos",1,"F09","mayo 2026","derivado","oferta",
  "Del núcleo de oferta, los clasificados como públicos (notebook 01). Criterio de clasificación no verificado en este ETL.",0),
 ("terr_oferta_nucleo","pct_establecimientos","oferta_nucleo_pct_cdmx","Participación en el núcleo de oferta de la CDMX","%",0,"F09","mayo 2026","derivado","oferta",
  "Establecimientos de la alcaldía / total de la CDMX x 100. Suma 100 entre alcaldías.",1),
 ("terr_oferta_nucleo","pct_pob60","poblacion_60mas_participacion_p01","Participación en la población de 60+ de la CDMX (archivo P01, año desconocido)","%",0,"P01","desconocido","derivado","demanda",
  "Porcentaje que suma 100 entre las 16 alcaldías, calculado en el notebook 01 a partir de «Población de más de 60 años.csv». El año del archivo es desconocido (ficha 02). Se contrasta con el Censo 2020 en DQ11.",0),
 ("terr_oferta_nucleo","indice_oferta_vs_60","oferta_nucleo_indice_vs_60","Índice oferta/población 60+ (participación en oferta ÷ participación en 60+)","razón",0,"F09","mayo 2026","derivado (mezcla de fuentes)","brecha",
  "pct_establecimientos / pct_pob60. 1 = la alcaldía tiene la misma participación en oferta que en población 60+. Mezcla DENUE 05/2026 con un archivo de año desconocido.",1),
 ("terr_indice_tipo","indice_asilos","indice_asilos_vs_60","Índice de asilos vs población 60+","razón",0,"F09","mayo 2026","derivado (mezcla de fuentes)","brecha",
  "(asilos de la alcaldía / asilos de la CDMX) / participación en población 60+. Verificado aritméticamente en DQ14.",1),
 ("terr_indice_tipo","indice_centros_dia","indice_centros_dia_vs_60","Índice de centros de día vs población 60+","razón",0,"F09","mayo 2026","derivado (mezcla de fuentes)","brecha",
  "(centros de día de la alcaldía / centros de día de la CDMX) / participación en población 60+. Verificado aritméticamente en DQ14.",1),
 # --- capacidad residencial (archivo P02) ---
 ("terr_capacidad","plazas","plazas_residencias_privadas","Plazas en residencias permanentes privadas","plazas",1,"P02","desconocido","observado","oferta",
  "Plazas en residencias permanentes del sector privado para personas mayores. Solo 12 de 16 alcaldías (faltan VC, TLAH, CUAJ, MA): ahí el dato es DESCONOCIDO, no cero.",1),
 ("terr_capacidad","plazas_por_1000_adl","plazas_por_1000_personas_adl","Plazas por 1,000 personas con dificultad para actividades de la vida diaria","plazas/1000 personas",0,"P02","desconocido","derivado (mezcla de fuentes)","brecha",
  "plazas / personas con ayuda en actividades de la vida diaria (archivo P03) x 1,000 (notebook 02). Mezcla dos archivos de año desconocido.",1),
 # --- dependencia (archivo P03) ---
 ("terr_dependencia","total","dependencia_severa_personas","Personas con dependencia severa (archivo P03)","personas",1,"P03","desconocido","derivado","demanda",
  "Total por alcaldía del notebook 08. El criterio exacto de «severa» no se verificó en este ETL.",0),
 ("terr_dependencia","pct_cdmx","dependencia_severa_pct_cdmx","Participación en las personas con dependencia severa de la CDMX","%",0,"P03","desconocido","derivado","demanda",
  "total / total CDMX x 100. Suma 100 entre alcaldías.",0),
 # --- pobreza 65+ (CONEVAL municipal 2020) ---
 ("terr_pobreza65","poblacion_65mas","poblacion_65mas_coneval_2020","Población de 65+ (CONEVAL, pobreza por grupos poblacionales)","personas",1,"X01","2020","observado","demanda",
  "Población de 65 años y más, hoja adultmay del archivo «Pobreza por grupos poblacionales a escala municipal 2010, 2015 y 2020» (CONEVAL); notebook 09.",1),
 ("terr_pobreza65","pct_pobreza_2020","pobreza_65mas_pct_2020","Población de 65+ en pobreza","%",0,"X01","2020","observado","contexto",
  "Porcentaje de personas de 65+ en pobreza multidimensional, municipal 2020 (CONEVAL). La marca de precisión del archivo se guarda en «nota».",1),
 # --- rezago y marginación (AGEB agregado a alcaldía; scripts 13) ---
 ("terr_rezago","n_ageb","rezago_n_ageb","AGEB urbanas","AGEB",1,"F20","2020","derivado","contexto","AGEB urbanas de la alcaldía en la base de rezago social 2020.",1),
 ("terr_rezago","n_ageb_suprimidas","rezago_n_ageb_suprimidas","AGEB con dato suprimido","AGEB",1,"F20","2020","derivado","contexto","AGEB marcadas como suprimidas en la base de rezago social (columna suprimida de 13_rezago_ageb_cdmx). Su población no entra en los porcentajes (script 13).",0),
 ("terr_rezago","poblacion_ageb_validas","rezago_poblacion_validas","Población en AGEB con dato válido","personas",1,"F20","2020","derivado","contexto","Población de las AGEB no suprimidas (denominador de los porcentajes del script 13).",0),
 ("terr_rezago","pct_pob_rezago_medio_o_mas","rezago_pct_pob_medio_o_mas","Población en AGEB con rezago social medio o mayor","%",0,"F20","2020","derivado","contexto","Porcentaje de la población (AGEB válidas) en AGEB con grado de rezago medio, alto o muy alto (script 13).",1),
 ("terr_rezago","pct_ageb_rezago_medio_o_mas","rezago_pct_ageb_medio_o_mas","AGEB con rezago social medio o mayor","%",0,"F20","2020","derivado","contexto","Porcentaje de AGEB con grado de rezago medio, alto o muy alto (script 13).",1),
 ("terr_rezago","n_ageb_rezago_medio_o_mas","rezago_n_ageb_medio_o_mas","Número de AGEB con rezago medio o mayor","AGEB",1,"F20","2020","derivado","contexto","Conteo de AGEB con grado medio, alto o muy alto (script 13).",1),
 ("terr_rezago","pct_sin_derechohabiencia","rezago_pct_sin_derechohabiencia","Población sin derechohabiencia a servicios de salud","%",0,"F20","2020","derivado","contexto","Porcentaje sin derechohabiencia (script 13); probablemente agregado de i_sdsalud de la base de rezago social. No verificado en este ETL.",0),
 ("terr_rezago","sdsalud_p10_ageb","rezago_sdsalud_p10","Sin derechohabiencia: percentil 10 entre AGEB","%",0,"F20","2020","derivado","contexto","Percentil 10 de i_sdsalud entre las AGEB de la alcaldía (script 13). Dispersión interna.",0),
 ("terr_rezago","sdsalud_p90_ageb","rezago_sdsalud_p90","Sin derechohabiencia: percentil 90 entre AGEB","%",0,"F20","2020","derivado","contexto","Percentil 90 de i_sdsalud entre las AGEB de la alcaldía (script 13). Dispersión interna.",0),
 ("terr_rezago","pct_edbasinc_aprox","rezago_pct_edu_basica_incompleta","Educación básica incompleta (aproximado)","%",0,"F20","2020","derivado","contexto","Educación básica incompleta, aproximada según el nombre de la columna (script 13). Método no verificado en este ETL.",0),
 ("terr_rezago","pct_viv_hacinamiento","rezago_pct_viv_hacinamiento","Viviendas con hacinamiento","%",0,"F20","2020","derivado","contexto","Porcentaje de viviendas con hacinamiento (script 13); probablemente agregado de i_hacinamiento. No verificado en este ETL.",0),
 ("terr_rezago","n_ageb_muy_bajo","rezago_n_ageb_muy_bajo","AGEB con rezago muy bajo","AGEB",1,"F20","2020","derivado","contexto","Conteo de AGEB por grado de rezago (script 13).",1),
 ("terr_rezago","n_ageb_bajo","rezago_n_ageb_bajo","AGEB con rezago bajo","AGEB",1,"F20","2020","derivado","contexto","Conteo de AGEB por grado de rezago (script 13).",1),
 ("terr_rezago","n_ageb_medio","rezago_n_ageb_medio","AGEB con rezago medio","AGEB",1,"F20","2020","derivado","contexto","Conteo de AGEB por grado de rezago (script 13).",1),
 ("terr_rezago","n_ageb_alto","rezago_n_ageb_alto","AGEB con rezago alto","AGEB",1,"F20","2020","derivado","contexto","Conteo de AGEB por grado de rezago (script 13).",1),
 ("terr_rezago","n_ageb_muy_alto","rezago_n_ageb_muy_alto","AGEB con rezago muy alto","AGEB",1,"F20","2020","derivado","contexto","Conteo de AGEB por grado de rezago (script 13).",1),
 ("terr_rezago","conapo_im_2020","conapo_indice_marginacion_2020","Índice de marginación (CONAPO)","índice",0,"F22","2020","observado","contexto","Índice de marginación 2020 por municipio (CONAPO).",1),
 ("terr_rezago","conapo_imn_2020","conapo_indice_marginacion_normalizado_2020","Índice de marginación normalizado (CONAPO)","índice 0-1",0,"F22","2020","observado","contexto","Índice de marginación normalizado 2020 por municipio (CONAPO).",0),
 ("terr_rezago","conapo_gm_2020","conapo_grado_marginacion_2020","Grado de marginación (CONAPO)","categoría",0,"F22","2020","observado","contexto","Grado de marginación 2020 por municipio (CONAPO). Valor de texto.",1),
 # --- tipología de AGEB (notebook D, modelo 2) ---
 ("terr_tipologia","pct_pob_tipo_1","tipologia_pct_pob_tipo1","Población en AGEB de tipo 1","%",0,"F20","2020","derivado (modelo)","brecha","Porcentaje de población de la alcaldía en AGEB del tipo 1 de la tipología del notebook D (agrupamiento no supervisado). La numeración de tipos es del modelo.",0),
 ("terr_tipologia","pct_pob_tipo_2","tipologia_pct_pob_tipo2","Población en AGEB de tipo 2","%",0,"F20","2020","derivado (modelo)","brecha","Ídem, tipo 2.",0),
 ("terr_tipologia","pct_pob_tipo_3","tipologia_pct_pob_tipo3","Población en AGEB de tipo 3","%",0,"F20","2020","derivado (modelo)","brecha","Ídem, tipo 3.",0),
 ("terr_tipologia","pct_pob_tipo_4","tipologia_pct_pob_tipo4","Población en AGEB de tipo 4","%",0,"F20","2020","derivado (modelo)","brecha","Ídem, tipo 4.",0),
 ("terr_tipologia","ageb_brecha_q75","tipologia_n_ageb_brecha_q75","AGEB en brecha (cuartil superior)","AGEB",1,"F20","2020","derivado (modelo)","brecha","AGEB en brecha según el umbral q75 del notebook D. Criterio no verificado en este ETL.",0),
 ("terr_tipologia","personas_60_en_brecha_q75","tipologia_personas_60_brecha_q75","Personas de 60+ en AGEB en brecha (q75)","personas",1,"F20","2020","derivado (modelo)","brecha","Personas de 60+ que viven en AGEB en brecha (notebook D). Criterio no verificado en este ETL.",0),
]
# Medidas calculadas por el propio ETL a partir del Censo 2020 (fuente F02)
MEDIDAS_CENSO = [
 ("pob_total_censo2020","Población total (Censo 2020)","personas",1,"observado","demanda",
  "POBTOT de la fila «total del municipio» (LOC=0000, AGEB=0000, MZA=000) del archivo AGEB y manzana urbana de la CDMX.",1),
 ("pob_60mas_censo2020","Población de 60+ (Censo 2020)","personas",1,"observado","demanda",
  "P_60YMAS de la fila «total del municipio» del archivo AGEB y manzana urbana de la CDMX.",1),
 ("participacion_60mas_censo2020","Participación en la población de 60+ de la CDMX (Censo 2020)","%",0,"derivado (ETL)","demanda",
  "P_60YMAS de la alcaldía / suma de las 16 alcaldías x 100. Calculada por el ETL; comparable con poblacion_60mas_participacion_p01 (DQ11).",1),
]
# ENIGH 2022 por entidad (17): una medida por cada indicador del archivo
ENIGH_PREFIJO = "enigh22_"
