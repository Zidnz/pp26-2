"""Genera el modelo semántico (TMDL) y las páginas (PBIR) del Observatorio del Cuidado en Power BI.

Entrada:
  - PowerBI/datos/*.csv          (los produce exportar_datos_pbi.py)
  - Frontend/observatorio/datos_observatorio.json (solo para los textos con cifras de cada página)
  - PowerBI/recursos/            (logo y tema)
Salida (se sobrescribe):
  - PowerBI/Observatorio_Cuidado.SemanticModel/definition/{expressions,relationships,model}.tmdl y tables/*.tmdl
  - PowerBI/Observatorio_Cuidado.Report/definition/pages/** y report.json
  - PowerBI/Observatorio_Cuidado.Report/StaticResources/RegisteredResources/*

Uso (con Power BI Desktop cerrado):
    python PowerBI/generar_pbip.py [ruta_windows_de_PowerBI\\datos\\]
Después: abrir Observatorio_Cuidado.pbip en Power BI Desktop y pulsar «Actualizar».

Todas las cifras de los textos salen de datos_observatorio.json; ninguna se escribe a mano.
"""
import csv
import json
import os
import shutil
import sys
import uuid

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PBI = os.path.join(RAIZ, "PowerBI")
DATOS = os.path.join(PBI, "datos")
SM = os.path.join(PBI, "Observatorio_Cuidado.SemanticModel", "definition")
REP = os.path.join(PBI, "Observatorio_Cuidado.Report")
RUTA_WIN = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Jsull\Downloads\pp26-2\PowerBI\datos" + "\\"

NS = uuid.UUID("6f0c2b5e-1d3a-4c55-9a51-0b5d2c7e9f10")


def gid(*partes):
    return str(uuid.uuid5(NS, "|".join(partes)))


def hexid(*partes):
    return uuid.uuid5(NS, "|".join(partes)).hex[:20]


# =====================================================================================
# 1. MODELO SEMÁNTICO
# =====================================================================================
def leer_csv(nombre):
    with open(os.path.join(DATOS, nombre + ".csv"), encoding="utf-8-sig") as f:
        r = list(csv.reader(f))
    return r[0], r[1:]


def tipo_columna(valores):
    vals = [v for v in valores if v != ""]
    if not vals:
        return "string"
    try:
        if all(float(v) == int(float(v)) and "." not in v and "e" not in v.lower() for v in vals):
            return "int64"
    except ValueError:
        return "string"
    try:
        [float(v) for v in vals]
        return "double"
    except ValueError:
        return "string"


M_TIPO = {"int64": "Int64.Type", "double": "type number", "string": "type text"}

# Medidas por tabla: (nombre, expresión DAX, formato)
PCT = r"0.0\%"
PP = r"+0.0;-0.0;0.0"
ENT = "#,0"
MXN = r"\$#,0"


def color_prec(t):
    return (f'SWITCH(MAX({t}[precision]), "baja", "#D9D4E6", "moderada", "#A99FC9", '
            f'"sin varianza", "#9A93AD", "#77689D")')


MEDIDAS = {
    "clave": [],
    "embudo": [("Personas", "SUM(embudo[total])", ENT)],
    "inventario": [("Fuentes", "COUNTROWS(inventario)", ENT)],
    "kpis_ficha": [("Indicadores con ficha", "COUNTROWS(kpis_ficha)", ENT)],
    "seg_series": [
        ("Porcentaje", "AVERAGE(seg_series[pct])", PCT),
        ("Diferencia pp", "AVERAGE(seg_series[pct])", PP),
        ("IC90 inferior", "AVERAGE(seg_series[li90])", "0.0"),
        ("IC90 superior", "AVERAGE(seg_series[ls90])", "0.0"),
        ("n muestra", "MAX(seg_series[n])", ENT),
        ("Precisión", "MAX(seg_series[precision])", None),
        ("Orden categoría", "MIN(seg_series[cat_orden])", "0"),
        ("Color precisión", color_prec("seg_series"), None),
        ("Color diferencia", 'IF(MAX(seg_series[dif_significativa]) = "Sí", "#C0435A", "#B8B3C9")', None),
        ("KPI personas", 'CALCULATE(AVERAGE(seg_series[total_expandido]), seg_series[serie] = "kpi", seg_series[categoria] = "personas")', ENT),
        ("KPI grupo del problema", 'CALCULATE(AVERAGE(seg_series[pct]), seg_series[serie] = "kpi", seg_series[categoria] = "grupo")', PCT),
        ("KPI grupo personas", 'CALCULATE(AVERAGE(seg_series[total_expandido]), seg_series[serie] = "kpi", seg_series[categoria] = "grupo")', ENT),
        ("KPI horas a la semana", 'CALCULATE(AVERAGE(seg_series[pct]), seg_series[serie] = "kpi", seg_series[categoria] = "horas_total")', ENT),
        ("KPI horas promedio", 'CALCULATE(AVERAGE(seg_series[pct]), seg_series[serie] = "kpi", seg_series[categoria] = "horas_media")', "0.0"),
        ("Mediana de horas", 'CALCULATE(AVERAGE(seg_series[pct]), seg_series[serie] = "horas", seg_series[categoria] = "mediana")', "0"),
        ("Tratan mal (P7.11)", 'CALCULATE(AVERAGE(seg_series[pct]), seg_series[serie] = "p711", seg_series[categoria] = "Tratan mal a las personas")', PCT),
    ],
    "seg_indicadores": [
        ("Porcentaje seg", "AVERAGE(seg_indicadores[pct])", PCT),
        ("Dif vs resto pp", "AVERAGE(seg_indicadores[dif_pp])", PP),
        ("IC90 inf seg", "AVERAGE(seg_indicadores[li90])", "0.0"),
        ("IC90 sup seg", "AVERAGE(seg_indicadores[ls90])", "0.0"),
        ("n seg", "MAX(seg_indicadores[n])", ENT),
        ("Precisión seg", "MAX(seg_indicadores[precision])", None),
        ("Orden indicador", "MIN(seg_indicadores[ind_orden])", "0"),
        ("Color celda",
         'VAR p = AVERAGE(seg_indicadores[pct]) VAR pr = MAX(seg_indicadores[precision]) RETURN '
         'IF(pr = "baja", "#ECEAF1", IF(p >= 70, "#8A76B8", IF(p >= 50, "#B09FD3", IF(p >= 30, "#D3C8E8", "#EFEAF7"))))',
         None),
        ("Precio (son caros)", 'CALCULATE(AVERAGE(seg_indicadores[pct]), seg_indicadores[clave] = "raz_caros")', PCT),
        ("Norma familiar", 'CALCULATE(AVERAGE(seg_indicadores[pct]), seg_indicadores[clave] = "norma_familia")', PCT),
    ],
    "perfil_grupo": [
        ("Porcentaje perfil", "AVERAGE(perfil_grupo[pct])", PCT),
        ("Dif perfil pp", "AVERAGE(perfil_grupo[dif_pp])", PP),
        ("n perfil", "MAX(perfil_grupo[n])", ENT),
        ("Precisión perfil", "MAX(perfil_grupo[precision])", None),
        ("¿Difiere del resto?", "MAX(perfil_grupo[dif_significativa])", None),
        ("Orden perfil", "MIN(perfil_grupo[orden])", "0"),
    ],
    "brecha_sexo": [("Horas semanales", "AVERAGE(brecha_sexo[horas])", "0.0"),
                    ("Orden edad", "MIN(brecha_sexo[orden])", "0")],
    "razones": [("Porcentaje razón", "AVERAGE(razones[pct])", PCT),
                ("IC90 inf razón", "AVERAGE(razones[li90])", "0.0"),
                ("IC90 sup razón", "AVERAGE(razones[ls90])", "0.0"),
                ("n razón", "MAX(razones[n])", ENT),
                ("Precisión razón", "MAX(razones[precision])", None),
                ("Color razón", color_prec("razones"), None)],
    "contratacion_quintil": [("Contrata (%)", "AVERAGE(contratacion_quintil[pct])", r"0.00\%"),
                             ("Precisión quintil", "MAX(contratacion_quintil[precision])", None),
                             ("Casos en muestra", "SUM(contratacion_quintil[n_si])", ENT)],
    "oferta_declarada": [
        ("Trabajaría: mujeres", 'CALCULATE(AVERAGE(oferta_declarada[pct]), oferta_declarada[clave] = "mujeres")', PCT),
        ("Trabajaría: hombres", 'CALCULATE(AVERAGE(oferta_declarada[pct]), oferta_declarada[clave] = "hombres")', PCT)],
    "asequibilidad": [
        ("Hogares que podrían pagar", "AVERAGE(asequibilidad[pct_hogares])", PCT),
        ("IC90 inf hogares", "AVERAGE(asequibilidad[li90])", "0.0"),
        ("IC90 sup hogares", "AVERAGE(asequibilidad[ls90])", "0.0"),
        ("Parte del ingreso mediano", "AVERAGE(asequibilidad[pct_ingreso_mediano])", PCT),
        ("Costo mensual", "AVERAGE(asequibilidad[costo_mensual_2026])", MXN),
        ("Horas paquete", "MIN(asequibilidad[horas])", "0"),
        ("Precisión hogares", "MAX(asequibilidad[precision])", None),
        ("Color tope",
         'VAR u = MIN(asequibilidad[umbral_orden]) RETURN IF(AVERAGE(asequibilidad[pct_ingreso_mediano]) <= u, "#77689D", "#C0435A")',
         None),
        ("Costo 6 h piso legal",
         'CALCULATE(AVERAGE(asequibilidad[costo_mensual_2026]), REMOVEFILTERS(asequibilidad), asequibilidad[fuente_ingreso] = "ENASIC · nacional", asequibilidad[salario_corto] = "Piso legal", asequibilidad[horas] = 6)', MXN),
        ("Costo jornada 40 h",
         'CALCULATE(AVERAGE(asequibilidad[costo_mensual_2026]), REMOVEFILTERS(asequibilidad), asequibilidad[fuente_ingreso] = "ENASIC · nacional", asequibilidad[salario_corto] = "Piso legal", asequibilidad[horas] = 40)', MXN),
        ("Pagarían 6 h (≤20%)",
         'CALCULATE(AVERAGE(asequibilidad[pct_hogares]), REMOVEFILTERS(asequibilidad), asequibilidad[fuente_ingreso] = "ENASIC · nacional", asequibilidad[salario_corto] = "Piso legal", asequibilidad[horas] = 6, asequibilidad[umbral_orden] = 20)', PCT),
        ("Piso legal por hora",
         'CALCULATE(AVERAGE(asequibilidad[salario_hora_2026]), REMOVEFILTERS(asequibilidad), asequibilidad[salario_corto] = "Piso legal")', r"\$#,0.00"),
    ],
    "pago_hora": [("Percentil 25", "AVERAGE(pago_hora[p25])", r"\$#,0"),
                  ("Mediana pagada", "AVERAGE(pago_hora[mediana])", r"\$#,0"),
                  ("Percentil 75", "AVERAGE(pago_hora[p75])", r"\$#,0"),
                  ("Hogares en muestra", "MAX(pago_hora[n])", ENT),
                  ("Orden servicio", "MIN(pago_hora[orden])", "0")],
    "costo_jornada": [("Costo mensual jornada", "AVERAGE(costo_jornada[costo_mensual])", MXN),
                      ("Carga patronal %", "AVERAGE(costo_jornada[carga_pct])", PCT)],
    "financiamiento": [("Financiamiento anual (mdp)", "AVERAGE(financiamiento[mdp])", "#,0.0"),
                       ("% de la solicitud CDMX", "AVERAGE(financiamiento[pct_solicitud])", r"0.00\%"),
                       ("Solicitud CDMX 2026 (mdp)", "MAX(financiamiento[solicitud_mdp])", "#,0.0"),
                       ("Orden escenario", "MIN(financiamiento[escenario_orden])", "0")],
    "escala_subsidio": [("Hogares atendidos", "SUM(escala_subsidio[hogares])", ENT)],
    "objetivos": [],
    "modelo_global": [
        ("Cobertura regla", 'CALCULATE(AVERAGE(modelo_global[cobertura]), modelo_global[objetivo] = "DANO_ALGUNO", modelo_global[puntaje] = "Regla >= 40 h")', PCT),
        ("Cobertura logística", 'CALCULATE(AVERAGE(modelo_global[cobertura]), modelo_global[objetivo] = "DANO_ALGUNO", modelo_global[puntaje] = "Regresión logística")', PCT),
        ("Diferencia logística pp", 'CALCULATE(AVERAGE(modelo_global[dif_cobertura_vs_regla]), modelo_global[objetivo] = "DANO_ALGUNO", modelo_global[puntaje] = "Regresión logística")', PP),
        ("Diferencia salud física pp", 'CALCULATE(AVERAGE(modelo_global[dif_cobertura_vs_regla]), modelo_global[objetivo] = "DANO_SALUD_FISICA", modelo_global[puntaje] = "Regresión logística")', PP),
        ("AUC", "AVERAGE(modelo_global[auc_ponderado])", "0.000"),
        ("Cobertura (%)", "AVERAGE(modelo_global[cobertura])", PCT),
        ("Precisión (%)", "AVERAGE(modelo_global[precision])", PCT),
        ("Dif vs regla (pp)", "AVERAGE(modelo_global[dif_cobertura_vs_regla])", PP),
        ("IC90 inf dif", "AVERAGE(modelo_global[dif_li90])", "0.0"),
        ("IC90 sup dif", "AVERAGE(modelo_global[dif_ls90])", "0.0"),
    ],
    "modelo_grupos": [("Cobertura grupo", "AVERAGE(modelo_grupos[cobertura])", PCT),
                      ("Casos con daño", "MAX(modelo_grupos[n_con_dano])", ENT),
                      ("Orden grupo", "MIN(modelo_grupos[grupo_orden])", "0")],
    "modelo_coeficientes": [("Coeficiente", "SUM(modelo_coeficientes[coef])", "+0.00;-0.00;0.00"),
                            ("Color coeficiente", 'IF(SUM(modelo_coeficientes[coef]) > 0, "#C0435A", "#23806F")', None)],
    "modelo_alternativas": [
        ("Dif cobertura vs regla", "AVERAGE(modelo_alternativas[dif_cobertura_vs_regla])", PP),
        ("IC90 inf alt", "AVERAGE(modelo_alternativas[dif_li90])", "0.0"),
        ("IC90 sup alt", "AVERAGE(modelo_alternativas[dif_ls90])", "0.0"),
        ("AUC alt", "AVERAGE(modelo_alternativas[auc_ponderado])", "0.000"),
        ("Brier alt", "AVERAGE(modelo_alternativas[brier_ponderado])", "0.000"),
        ("Cobertura alt", "AVERAGE(modelo_alternativas[cobertura])", PCT),
        ("Color alternativa",
         'SWITCH(MAX(modelo_alternativas[tipo]), "Elegido", "#A9711A", "Horas como puntaje", "#77689D", "#9A93AD")', None)],
    "modelo_curvas": [("Cobertura curva", "AVERAGE(modelo_curvas[cobertura])", PCT)],
    "modelo_calibracion": [("Observado (%)", "AVERAGE(modelo_calibracion[observado])", PCT),
                           ("Predicho (%)", "AVERAGE(modelo_calibracion[predicho])", PCT)],
    "modelo_importancia": [("Caída del AUC (centésimas)", "AVERAGE(modelo_importancia[caida_auc_cent])", "0.00")],
    "modelo_cupo": [],
    "modelo_por_horas": [("Prevalencia (%)", "AVERAGE(modelo_por_horas[prevalencia])", PCT),
                         ("Orden horas", "MIN(modelo_por_horas[orden])", "0")],
    "modelo_obj_grupo": [("Gana o pierde (pp)", "AVERAGE(modelo_obj_grupo[dif_vs_regla_pp])", PP),
                         ("Orden grupo obj", "MIN(modelo_obj_grupo[grupo_orden])", "0")],
    "modelo_decision": [],
    "modelo_resumen": [],
    "alcaldias": [("Alcaldías", "COUNTROWS(alcaldias)", ENT)],
    "alcaldias_indicadores": [("Valor alcaldía", "AVERAGE(alcaldias_indicadores[valor])", "#,0.00"),
                              ("Conteo alcaldía", "SUM(alcaldias_indicadores[conteo])", ENT),
                              ("% de la población 60+", "AVERAGE(alcaldias_indicadores[pct_pob60])", r"0.0\%")],
    "dimension_cdmx": [
        ("Hogares CDMX con necesidad (cota inferior)", "CALCULATE(SUM(dimension_cdmx[valor]), dimension_cdmx[orden] = 1)", ENT),
        ("Hogares CDMX que contratan cuidadora", "CALCULATE(SUM(dimension_cdmx[valor]), dimension_cdmx[orden] = 2)", ENT),
        ("Hogares CDMX que contratan trabajo doméstico", "CALCULATE(SUM(dimension_cdmx[valor]), dimension_cdmx[orden] = 3)", ENT)],
    "necesidad_cdmx": [("Hogares CDMX con 60+ o discapacidad (ENIGH)", "SUM(necesidad_cdmx[total])", ENT)],
    "estados": [("Valor entidad", "AVERAGE(estados[valor])", r"0.0\%"),
                ("Valor nacional", "AVERAGE(estados[nacional])", r"0.0\%"),
                ("IC90 inf ent", "AVERAGE(estados[li90])", "0.0"),
                ("IC90 sup ent", "AVERAGE(estados[ls90])", "0.0"),
                ("Color entidad", 'IF(MAX(estados[es_cdmx]) = "Sí", "#C0435A", "#B09FD3")', None)],
    "tipologia_tipos": [("De las personas 60+ (%)", "AVERAGE(tipologia_tipos[pct_de_las_60])", PCT),
                        ("Viviendas sin internet (%)", "AVERAGE(tipologia_tipos[pct_viv_sin_int])", PCT),
                        ("60+ a más de 1 km de la oferta (%)", "AVERAGE(tipologia_tipos[pct_60_a_mas_de_1km])", PCT)],
    "ageb_tipologia": [("AGEB", "COUNTROWS(ageb_tipologia)", ENT),
                       ("% 60+", "AVERAGE(ageb_tipologia[pct_60])", "0.0"),
                       ("% viviendas sin internet", "AVERAGE(ageb_tipologia[pct_sin_int])", "0.0")],
    "tipologia_alcaldia": [("% de AGEB", "AVERAGE(tipologia_alcaldia[pct_ageb])", PCT)],
    "brecha_alcaldia": [("Personas 60+ en AGEB con brecha", "SUM(brecha_alcaldia[n_60_brecha])", ENT)],
    "tipologia_k": [("Silueta del modelo", "AVERAGE(tipologia_k[silueta])", "0.000"),
                    ("Silueta al azar (p95)", "AVERAGE(tipologia_k[silueta_nula_p95])", "0.000"),
                    ("Estabilidad (ARI mínimo)", "AVERAGE(tipologia_k[ari_min])", "0.000")],
    "tipologia_robustez": [("Coincidencia ARI", "AVERAGE(tipologia_robustez[ari])", "0.000")],
    "tipologia_comparacion": [],
}

SORT_BY = {("segmentos", "segmento_etiqueta"): "orden", ("objetivos", "objetivo_txt"): "orden",
           ("embudo", "etapa"): "orden", ("pago_hora", "servicio"): "orden",
           ("tipologia_tipos", "tipo_txt"): "tipo", ("modelo_por_horas", "horas"): None}

OCULTAS = {"seg_id"}

RELACIONES = [
    ("seg_series", "seg_id", "segmentos", "seg_id"),
    ("seg_indicadores", "seg_id", "segmentos", "seg_id"),
    ("modelo_alternativas", "objetivo", "objetivos", "objetivo"),
    ("modelo_curvas", "objetivo", "objetivos", "objetivo"),
    ("modelo_calibracion", "objetivo", "objetivos", "objetivo"),
    ("modelo_importancia", "objetivo", "objetivos", "objetivo"),
    ("modelo_cupo", "objetivo", "objetivos", "objetivo"),
]


def q(nombre):
    return nombre if nombre.replace("_", "").isalnum() and nombre.isascii() else "'" + nombre.replace("'", "''") + "'"


def tmdl_tabla(nombre, cab, filas):
    tipos = {c: tipo_columna([f[i] for f in filas]) for i, c in enumerate(cab)}
    L = [f"table {nombre}", f"\tlineageTag: {gid('t', nombre)}", ""]
    for m, expr, fmt in MEDIDAS.get(nombre, []):
        L.append(f"\tmeasure {q(m)} = {expr}")
        if fmt:
            L.append(f"\t\tformatString: {fmt}")
        L.append(f"\t\tlineageTag: {gid('m', nombre, m)}")
        L.append("")
    for c in cab:
        t = tipos[c]
        L.append(f"\tcolumn {q(c)}")
        L.append(f"\t\tdataType: {t}")
        if t == "double":
            L.append("\t\tformatString: 0.00")
        elif t == "int64":
            L.append("\t\tformatString: 0")
        L.append(f"\t\tlineageTag: {gid('c', nombre, c)}")
        L.append("\t\tsummarizeBy: none")
        L.append(f"\t\tsourceColumn: {c}")
        if c in OCULTAS:
            L.append("\t\tisHidden")
        sb = SORT_BY.get((nombre, c))
        if sb:
            L.append(f"\t\tsortByColumn: {sb}")
        L.append("")
        L.append("\t\tannotation SummarizationSetBy = User")
        L.append("")
    tipos_m = ", ".join('{"%s", %s}' % (c, M_TIPO[tipos[c]]) for c in cab)
    L += [f"\tpartition {nombre} = m",
          "\t\tmode: import",
          "\t\tsource =",
          "\t\t\t\tlet",
          f'\t\t\t\t    Origen = Csv.Document(File.Contents(RutaDatos & "{nombre}.csv"), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),',
          "\t\t\t\t    Encabezados = Table.PromoteHeaders(Origen, [PromoteAllScalars = true]),",
          '\t\t\t\t    Vacios = Table.TransformColumns(Encabezados, {}, each if _ = "" then null else _),',
          f'\t\t\t\t    Tipos = Table.TransformColumnTypes(Vacios, {{{tipos_m}}}, "en-US")',
          "\t\t\t\tin",
          "\t\t\t\t    Tipos",
          "",
          "\tannotation PBI_ResultType = Table",
          ""]
    return "\n".join(L), tipos


def generar_modelo():
    tablas = sorted(f[:-4] for f in os.listdir(DATOS) if f.endswith(".csv"))
    tdir = os.path.join(SM, "tables")
    if os.path.isdir(tdir):
        shutil.rmtree(tdir)
    os.makedirs(tdir)
    tipos_tabla = {}
    for t in tablas:
        cab, filas = leer_csv(t)
        txt, tipos = tmdl_tabla(t, cab, filas)
        tipos_tabla[t] = tipos
        with open(os.path.join(tdir, t + ".tmdl"), "w", encoding="utf-8") as f:
            f.write(txt)
    with open(os.path.join(SM, "expressions.tmdl"), "w", encoding="utf-8") as f:
        f.write(f'expression RutaDatos = "{RUTA_WIN}" meta [IsParameterQuery = true, Type = "Text", IsParameterQueryRequired = true]\n'
                f"\tlineageTag: {gid('e', 'RutaDatos')}\n\n\tannotation PBI_ResultType = Text\n\n")
    with open(os.path.join(SM, "relationships.tmdl"), "w", encoding="utf-8") as f:
        for a, ca, b, cb in RELACIONES:
            f.write(f"relationship {gid('r', a, ca, b)}\n\tfromColumn: {a}.{ca}\n\ttoColumn: {b}.{cb}\n\n")
    orden = json.dumps(["RutaDatos"] + tablas, ensure_ascii=False)
    with open(os.path.join(SM, "model.tmdl"), "w", encoding="utf-8") as f:
        f.write("model Model\n\tculture: en-US\n\tdefaultPowerBIDataSourceVersion: powerBI_V3\n"
                "\tsourceQueryCulture: en-US\n\tvalueFilterBehavior: independent\n\tdataAccessOptions\n"
                "\t\tlegacyRedirects\n\t\treturnErrorValuesAsNull\n\n"
                f"annotation PBI_QueryOrder = {orden}\n\n"
                "annotation __PBI_TimeIntelligenceEnabled = 0\n\n"
                'annotation PBI_ProTooling = ["DevMode"]\n\n')
        for t in tablas:
            f.write(f"ref table {t}\n")
        f.write("\nref cultureInfo en-US\n")
    return tablas, tipos_tabla


# =====================================================================================
# 2. REPORTE (PBIR)
# =====================================================================================
TINTA = "#2B3045"
SHELL = "#3F4760"
PAPEL = "#F4F2F9"
ACENTO = "#77689D"
LAV = "#AA95D1"
MENTA = "#7DD1C1"
TEAL = "#23806F"
ALERTA = "#C0435A"
AMBAR = "#A9711A"
SUAVE = "#5E6274"

SCHEMA_VIS = "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.14.0/schema.json"
SCHEMA_PAGE = "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json"


def lit(v):
    if isinstance(v, bool):
        return {"expr": {"Literal": {"Value": "true" if v else "false"}}}
    if isinstance(v, (int, float)):
        return {"expr": {"Literal": {"Value": f"{v}D"}}}
    return {"expr": {"Literal": {"Value": "'" + str(v).replace("'", "''") + "'"}}}


def color(c):
    return {"solid": {"color": lit(c)}}


def col(t, c):
    return {"Column": {"Expression": {"SourceRef": {"Entity": t}}, "Property": c}}


def mea(t, m):
    return {"Measure": {"Expression": {"SourceRef": {"Entity": t}}, "Property": m}}


# Nombres que ve el lector en encabezados, ejes y leyendas (no cambian datos)
NOMBRES = {"tipo_txt": "Tipo de zona", "n_ageb": "AGEB", "poblacion": "Población", "n_60": "Personas 60+",
           "pct_60": "% 60+", "pct_sinder": "% sin derechohabiencia", "pct_viv_sin_int": "% viviendas sin internet",
           "criterio": "Criterio", "tipo": "Tipo", "algun_dano": "Algún daño", "salud_fisica": "Salud física deteriorada",
           "favorece": "Favorece", "pct_seleccion": "% de personas seleccionadas", "objetivo_txt": "Objetivo",
           "Cobertura curva": "% de personas con daño alcanzadas", "alcaldia": "Alcaldía", "horas": "Horas a la semana",
           "grupo_txt": "Grupo", "puntaje": "Método", "serie": "Método", "decil": "Decil", "variable_txt": "Variable",
           "ind_corto": "Indicador", "cvegeo": "AGEB"}


def proj(campo, nombre=None):
    k = "Column" if "Column" in campo else "Measure"
    t = campo[k]["Expression"]["SourceRef"]["Entity"]
    p = campo[k]["Property"]
    d = {"field": campo, "queryRef": f"{t}.{p}", "nativeQueryRef": p}
    nombre = nombre or NOMBRES.get(p)
    if nombre:
        d["displayName"] = nombre
    return d


def filtro_in(t, c, valores, nombre):
    return {"name": nombre, "field": col(t, c), "type": "Categorical",
            "filter": {"Version": 2, "From": [{"Name": "x", "Entity": t, "Type": 0}],
                       "Where": [{"Condition": {"In": {
                           "Expressions": [{"Column": {"Expression": {"SourceRef": {"Source": "x"}}, "Property": c}}],
                           "Values": [[{"Literal": {"Value": "'" + str(v).replace("'", "''") + "'"
                                                    if isinstance(v, str) else f"{v}L"}}] for v in valores]}}}]},
            "howCreated": "User"}


class Pagina:
    def __init__(self, clave, nombre, alto):
        self.clave = clave
        self.id = hexid("p", clave)
        self.nombre = nombre
        self.alto = alto
        self.visuales = []
        self.interacciones = []
        self.z = 0

    def agregar(self, nombre, visual, x, y, w, h, filtros=None, contenedor=None):
        vid = hexid("v", self.clave, nombre)
        self.z += 1
        v = {"$schema": SCHEMA_VIS, "name": vid,
             "position": {"x": x, "y": y, "z": self.z * 1000, "height": h, "width": w, "tabOrder": self.z * 1000},
             "visual": visual}
        if contenedor is not None:
            visual.setdefault("visualContainerObjects", {}).update(contenedor)
        if filtros:
            v["filterConfig"] = {"filters": filtros}
        self.visuales.append(v)
        return vid

    def sin_filtro(self, origen, destino):
        self.interacciones.append({"source": origen, "target": destino, "type": "NoFilter"})


def marco(titulo=None, subtitulo=None, fondo="#FFFFFF", borde=True, oscuro=False):
    o = {"background": [{"properties": {"show": lit(True), "color": color(fondo), "transparency": lit(0)}}],
         "border": [{"properties": {"show": lit(borde), "color": color("#E2DEEC"), "radius": lit(12)}}],
         "dropShadow": [{"properties": {"show": lit(False)}}],
         "padding": [{"properties": {"top": lit(10), "bottom": lit(10), "left": lit(14), "right": lit(14)}}]}
    if titulo:
        o["title"] = [{"properties": {"show": lit(True), "text": lit(titulo), "fontColor": color("#F4F2F9" if oscuro else TINTA),
                                      "fontSize": lit(13), "bold": lit(True), "fontFamily": lit("Segoe UI Semibold")}}]
    else:
        o["title"] = [{"properties": {"show": lit(False)}}]
    if subtitulo:
        o["subTitle"] = [{"properties": {"show": lit(True), "text": lit(subtitulo),
                                         "fontColor": color("#D8D4E6" if oscuro else SUAVE), "fontSize": lit(10)}}]
    else:
        # Sin esto Power BI pinta un subtítulo automático en inglés («Medida by columna»)
        o["subTitle"] = [{"properties": {"show": lit(False)}}]
    return o


def texto(parrafos):
    """parrafos: lista de listas de (texto, estilo dict) o de cadenas."""
    ps = []
    for p in parrafos:
        alin = None
        if isinstance(p, dict):
            alin = p.get("align")
            p = p["runs"]
        runs = []
        for r in p:
            if isinstance(r, str):
                runs.append({"value": r})
            else:
                t, st = r
                runs.append({"value": t, "textStyle": st})
        d = {"textRuns": runs}
        if alin:
            d["horizontalTextAlignment"] = alin
        ps.append(d)
    return {"visualType": "textbox", "objects": {"general": [{"properties": {"paragraphs": ps}}]},
            "drillFilterOtherVisuals": True}


def est(size=11, color_=TINTA, bold=False, font=None):
    s = {"fontSize": f"{size}pt", "color": color_}
    if bold:
        s["fontWeight"] = "bold"
    if font:
        s["fontFamily"] = font
    return s


def grafica(tipo, roles, objetos=None, orden=None):
    qs = {}
    for rol, campos in roles.items():
        qs[rol] = {"projections": [proj(*c) if isinstance(c, tuple) else proj(c) for c in campos]}
    v = {"visualType": tipo, "query": {"queryState": qs}, "drillFilterOtherVisuals": True}
    if orden:
        campo, direccion = orden
        v["query"]["sortDefinition"] = {"sort": [{"field": campo, "direction": direccion}], "isDefaultSort": False}
    if objetos:
        v["objects"] = objetos
    return v


def relleno_medida(t, m):
    return [{"properties": {"fill": {"solid": {"color": {"expr": mea(t, m)}}}},
             "selector": {"data": [{"dataViewWildcard": {"matchingOption": 1}}]}}]


def obj_barras(t=None, m_color=None, etiquetas=True, fmt_eje=True, color_fijo=None, leyenda=False):
    o = {"labels": [{"properties": {"show": lit(etiquetas), "fontSize": lit(9), "color": color(TINTA)}}],
         "valueAxis": [{"properties": {"show": lit(False), "gridlineShow": lit(False)}}],
         "categoryAxis": [{"properties": {"fontSize": lit(9), "titleSwitch" if False else "showAxisTitle": lit(False)}}],
         "legend": [{"properties": {"show": lit(leyenda), "position": lit("Top"), "fontSize": lit(9)}}]}
    if m_color:
        o["dataPoint"] = relleno_medida(t, m_color)
    elif color_fijo:
        o["dataPoint"] = [{"properties": {"fill": color(color_fijo)}}]
    return o


def tarjeta(t, m, titulo, color_valor=TINTA, sub=None, tam=26, oscuro=False):
    v = grafica("card", {"Values": [mea(t, m)]},
                {"labels": [{"properties": {"fontSize": lit(tam), "color": color(color_valor),
                                            "fontFamily": lit("Segoe UI Semibold")}}],
                 "categoryLabels": [{"properties": {"show": lit(False)}}]})
    return v, marco(titulo, sub, fondo=SHELL if oscuro else "#FFFFFF", oscuro=oscuro)


def segmentador(t, c, titulo, desplegable=True, seleccion_unica=True, defecto=None):
    o = {"data": [{"properties": {"mode": lit("Dropdown" if desplegable else "Basic")}}],
         "selection": [{"properties": {"singleSelect": lit(seleccion_unica)}}],
         "header": [{"properties": {"show": lit(True), "text": lit(titulo), "fontColor": color(TINTA),
                                    "fontSize": lit(10), "bold": lit(True)}}],
         "items": [{"properties": {"fontSize": lit(10)}}]}
    if defecto is not None:
        o["general"] = [{"properties": {"filter": {"filter": {
            "Version": 2, "From": [{"Name": "s", "Entity": t, "Type": 0}],
            "Where": [{"Condition": {"In": {"Expressions": [{"Column": {"Expression": {"SourceRef": {"Source": "s"}},
                                                                        "Property": c}}],
                                            "Values": [[{"Literal": {"Value": "'" + defecto.replace("'", "''") + "'"}}]]}}}]}}}}]
    v = grafica("slicer", {"Values": [col(t, c)]}, o)
    return v, marco(None, None, borde=True)


def fmt1(x, d=1):
    s = f"{x:,.{d}f}"
    return s.replace(",", "§").replace(".", ".").replace("§", ",")


def mill(x):
    return fmt1(x / 1e6, 1) + " millones"


def encabezado(p, kicker, titulo, nota):
    p.agregar("encabezado", texto([
        [(kicker.upper(), est(9, ACENTO, True))],
        [(titulo, est(20, TINTA, True, "Segoe UI Semibold"))],
        [(nota, est(10.5, SUAVE))]]), 24, 76, 1232, 104, contenedor=marco(borde=False, fondo=PAPEL))


def barra_superior(p, paginas):
    p.agregar("barra", texto([
        [("Observatorio del Cuidado", est(14, "#F4F2F9", True, "Segoe UI Semibold"))],
        [("Los datos que cuidan · Equipo 3 · LCDN UNRC 2026-2", est(9, "#C9C3DB"))]]),
        0, 0, 1280, 60, contenedor=marco(fondo=SHELL, borde=False))
    nav = {"visualType": "pageNavigator", "drillFilterOtherVisuals": True,
           "objects": {"text": [{"properties": {"fontSize": lit(10), "fontColor": color("#E8E4F3")},
                                 "selector": {"id": "default"}},
                                {"properties": {"fontColor": color("#FFFFFF"), "bold": lit(True)},
                                 "selector": {"id": "selected"}}],
                       "fill": [{"properties": {"show": lit(True), "fillColor": color(SHELL)},
                                 "selector": {"id": "default"}},
                                {"properties": {"show": lit(True), "fillColor": color(ACENTO)},
                                 "selector": {"id": "selected"}}],
                       "outline": [{"properties": {"show": lit(False)}, "selector": {"id": "default"}}]}}
    p.agregar("navegador", nav, 330, 10, 940, 40, contenedor={"background": [{"properties": {"show": lit(False)}}],
                                                              "title": [{"properties": {"show": lit(False)}}]})


def nota_precision(p, x, y, w):
    p.agregar("nota_prec", texto([[("Color claro = precisión baja (CV > 30 %): se muestra, pero no cuenta como evidencia. "
                                    "Pase el cursor sobre cada barra para ver el intervalo de confianza al 90 % y el tamaño de muestra.",
                                    est(9, SUAVE))]]), x, y, w, 40, contenedor=marco(borde=False, fondo=PAPEL))


def construir_paginas(D):
    paginas = []
    K = D["clave"]
    E = D["embudo"]
    GL = {r["puntaje"]: r for r in D["modelo"]["global"]}
    SN = {r["puntaje"]: r for r in D["modelo"]["sensibilidad"]}

    # ------------------------------------------------------------------ INICIO
    p = Pagina("inicio", "Inicio", 1320)
    paginas.append(p)
    p.agregar("hero", texto([
        [("PERSONAS CUIDADORAS DE PERSONAS CON DISCAPACIDAD O DE 60 AÑOS Y MÁS", est(9, LAV, True))],
        [("Los datos que cuidan", est(34, "#F4F2F9", True, "Segoe UI Semibold"))],
        [("Nuestro enfoque: quien cuida en casa sin pago y quien recibe ese cuidado.", est(13, "#E2DEEE"))],
        [(" ", est(8))],
        [("Necesito cuidado", est(11, MENTA, True)), (" · la cuidadora familiar pide relevo", est(11, "#D8D4E6"))],
        [("Puedo cuidar", est(11, MENTA, True)), (" · cuidadoras verificadas con pago justo", est(11, "#D8D4E6"))],
    ]), 24, 76, 820, 300, contenedor=marco(fondo=SHELL, borde=False))
    p.agregar("logo", {"visualType": "image", "drillFilterOtherVisuals": True,
                       "objects": {"general": [{"properties": {"imageUrl": {"expr": {"ResourcePackageItem": {
                           "PackageName": "RegisteredResources", "PackageType": 1, "ItemName": "logo_personajes.png"}}}}}],
                           "imageScaling": [{"properties": {"imageScalingType": lit("Fit")}}]}},
              860, 76, 396, 300, contenedor=marco(fondo=SHELL, borde=False))

    INV = {r["id"]: r for r in D["inventario"]}

    def geo(i):
        r = INV.get(i)
        return str(r["desagregacion_geografica_maxima"]).split(" (")[0] if r else ""

    tarjetas = [
        ("01 · Qué es", "#2E8A66", [
            "Un observatorio de datos agregados sobre quien cuida en casa sin pago a personas con discapacidad o de 60 años y más, "
            "y sobre la oferta y el territorio en que ese cuidado ocurre.", "Sin datos simulados ni personales."],
         "Cada gráfica trae su fuente y su precisión"),
        ("02 · Qué mide y qué no", "#8B58C9", [
            "Sí: horas, daño y barreras de las personas cuidadoras. ENASIC 2022 (INEGI), nacional.",
            "No: cifras por alcaldía ni para la CDMX con la ENASIC; tampoco tendencias, porque es su primera edición.",
            "El territorio sale de otras fuentes: Censo 2020, DENUE y CONEVAL."],
         "Cada fuente declara qué permite y qué prohíbe afirmar"),
        ("03 · De dónde sale cada dato", "#E0455F", [
            f"Personas cuidadoras: ENASIC 2022 · {geo('F04')}",
            f"Oferta de servicios: DENUE · {geo('F09')}",
            f"Rezago social: CONEVAL 2020 · {geo('F20')}"],
         "Una fila = una unidad distinta en cada fuente"),
    ]
    x = 24
    for i, (tit, c, cuerpo, pie) in enumerate(tarjetas):
        p.agregar(f"rz{i}", texto([[(tit, est(13, c, True, "Segoe UI Semibold"))]] +
                                  [[(t, est(10.5, TINTA))] for t in cuerpo] +
                                  [[(pie, est(9, SUAVE))]]), x, 392, 296, 250, contenedor=marco())
        x += 312
    n_inv = len(D["inventario"])
    p.agregar("rz3", texto([[("04 · Qué tan firme es", est(13, "#1E5A47", True, "Segoe UI Semibold"))],
                            [(f"De las {n_inv} fuentes inventariadas, según su estado de evidencia:", est(10.5, TINTA))]]),
              x, 392, 296, 90, contenedor=marco())
    p.agregar("rz3g", grafica("clusteredBarChart", {"Category": [col("inventario", "estado_categoria")],
                                                    "Y": [mea("inventario", "Fuentes")],
                                                    "Tooltips": [col("inventario", "estado_orden")]},
                              obj_barras(color_fijo="#1E5A47"),
                              orden=(col("inventario", "estado_orden"), "Ascending")),
              x, 482, 296, 160, contenedor=marco())

    cont = [("kpis_ficha", "Indicadores con ficha", "indicadores con ficha"),
            ("inventario", "Fuentes", "fuentes inventariadas"),
            ("alcaldias", "Alcaldías", "alcaldías en la capa territorial"),
            ("ageb_tipologia", "AGEB", "AGEB urbanas en la tipología")]
    x = 24
    for i, (t, m, lab) in enumerate(cont):
        v, mc = tarjeta(t, m, lab, color_valor="#F4F2F9", tam=28, oscuro=True)
        p.agregar(f"cont{i}", v, x, 658, 296, 110, contenedor=mc)
        x += 312

    p.agregar("emb_t", texto([
        [("¿Cuántas personas están en el problema?", est(20, TINTA, True, "Segoe UI Semibold"))],
        [(f"De {mill(E[0]['total'])} de personas que cuidan, ≈ {mill(E[-1]['total'])} cuidan 40 h o más, "
          "dicen «no tuve necesidad» y declaran daño a su salud o su trabajo.", est(11, SUAVE))]]),
        24, 790, 1232, 80, contenedor=marco(borde=False, fondo=PAPEL))
    p.agregar("embudo", grafica("funnel", {"Category": [col("embudo", "etapa")], "Y": [mea("embudo", "Personas")]},
                                {"dataPoint": [{"properties": {"fill": color(ACENTO)}}],
                                 "labels": [{"properties": {"show": lit(True), "fontSize": lit(10)}}],
                                 "categoryAxis": [{"properties": {"fontSize": lit(10)}}]},
                                orden=(col("embudo", "orden"), "Ascending")),
              24, 876, 800, 420, contenedor=marco("Personas cuidadoras, nacional (ENASIC 2022, expandido)",
                                                  "Cada barra es un subconjunto de la anterior"))
    LG = GL["Regresión logística"]
    regla = GL["Regla >= 40 h"]
    p.agregar("emb_mod", texto([
        [("LO QUE ENCONTRAMOS", est(9, ACENTO, True))],
        [("Una regla simple encuentra casi a las mismas personas que el modelo.", est(14, TINTA, True, "Segoe UI Semibold"))],
        [(f"La regla «40 h o más» encuentra al {fmt1(regla['cobertura'])} % de las personas con daño; la regresión logística, "
          f"al {fmt1(LG['cobertura'])} % con el mismo número de seleccionados. La diferencia (+{fmt1(LG['dif_cobertura_vs_regla'])} pp, "
          f"IC 90 % de {fmt1(LG['dif_li90'])} a {fmt1(LG['dif_ls90'])}) no es demostrable.", est(10.5, TINTA))],
        [("Ver «¿A quién primero?» para el detalle por grupo.", est(9, SUAVE))]]),
        840, 876, 416, 230, contenedor=marco())
    v, mc = tarjeta("modelo_global", "Cobertura regla", "Cobertura de la regla 40 h", color_valor=ACENTO)
    p.agregar("emb_c1", v, 840, 1120, 200, 110, contenedor=mc)
    v, mc = tarjeta("modelo_global", "Cobertura logística", "Cobertura del modelo", color_valor=AMBAR)
    p.agregar("emb_c2", v, 1056, 1120, 200, 110, contenedor=mc)
    p.agregar("pie", texto([[(f"Datos: datos_observatorio.json (actualizado {D['actualizado']}), generado desde "
                              "Analysis/resultados. Ningún dato simulado ni personal.", est(8.5, SUAVE))]]),
              24, 1250, 1232, 40, contenedor=marco(borde=False, fondo=PAPEL))

    # ------------------------------------------------------------------ NECESIDAD
    p = Pagina("necesidad", "¿Quién lo carga?", 1720)
    paginas.append(p)
    encabezado(p, "Necesidad · nacional", "La carga crece con las horas; la necesidad declarada, no.",
               "«No tuve necesidad» casi no cambia con la intensidad del cuidado. El daño declarado sí. "
               "El segmentador filtra toda la página (sección 12b).")
    v, mc = segmentador("segmentos", "segmento_etiqueta", "Segmentar por", defecto="Total")
    s_nec = p.agregar("seg", v, 24, 186, 320, 70, contenedor=mc)
    nota_precision(p, 360, 192, 896)
    kp = [("KPI personas", "Personas cuidadoras (expandido)", TINTA),
          ("KPI grupo del problema", "Grupo del problema: 40 h+, «sin necesidad» y con daño", ALERTA),
          ("KPI horas a la semana", "Horas de cuidado a la semana (total)", TINTA),
          ("KPI horas promedio", "Horas promedio por persona cuidadora", ACENTO)]
    x = 24
    for i, (m, lab, c) in enumerate(kp):
        v, mc = tarjeta("seg_series", m, lab, color_valor=c)
        p.agregar(f"kpi{i}", v, x, 268, 296, 110, contenedor=mc)
        x += 312

    cmp_v = grafica("pivotTable", {"Rows": [col("seg_indicadores", "ind_corto")],
                                   "Columns": [col("segmentos", "segmento_etiqueta")],
                                   "Values": [mea("seg_indicadores", "Porcentaje seg")]},
                    {"values": [{"properties": {"backColor": {"solid": {"color": {"expr": mea("seg_indicadores", "Color celda")}}},
                                                "fontSize": lit(10)},
                                 "selector": {"data": [{"dataViewWildcard": {"matchingOption": 1}}],
                                              "metadata": "seg_indicadores.Porcentaje seg"}}],
                     "subTotals": [{"properties": {"rowSubtotals": lit(False), "columnSubtotals": lit(False)}}],
                     "columnHeaders": [{"properties": {"fontSize": lit(9), "wordWrap": lit(True)}}],
                     "rowHeaders": [{"properties": {"fontSize": lit(10)}}]})
    cmp_id = p.agregar("cmp", cmp_v, 24, 394, 1232, 230,
                       filtros=[filtro_in("seg_indicadores", "comparar_en", ["necesidad"], "fcmp")],
                       contenedor=marco("Comparar segmentos",
                                        "% de cada segmento. Más oscuro = más alto; gris = precisión baja (no se compara). "
                                        "No responde al segmentador: muestra todos."))
    p.sin_filtro(s_nec, cmp_id)

    p.agregar("carga", grafica("clusteredColumnChart",
                               {"Category": [col("seg_series", "categoria")],
                                "Series": [col("seg_series", "serie_txt")],
                                "Y": [mea("seg_series", "Porcentaje")],
                                "Tooltips": [mea("seg_series", "IC90 inferior"), mea("seg_series", "IC90 superior"),
                                             mea("seg_series", "n muestra"), mea("seg_series", "Precisión")]},
                               obj_barras(leyenda=True)),
              24, 640, 760, 340,
              filtros=[filtro_in("seg_series", "serie", ["carga_sinnec", "carga_dano"], "fcarga")],
              contenedor=marco("Quienes dicen «no tuve necesidad», ¿declaran daño?",
                               "Por horas semanales de cuidado. Decir «no tuve necesidad» casi no cambia; el daño sí."))
    p.agregar("dif", grafica("clusteredBarChart",
                             {"Category": [col("seg_series", "etiqueta")],
                              "Y": [mea("seg_series", "Diferencia pp")],
                              "Tooltips": [mea("seg_series", "IC90 inferior"), mea("seg_series", "IC90 superior"),
                                           mea("seg_series", "n muestra"), mea("seg_series", "Orden categoría")]},
                             obj_barras("seg_series", "Color diferencia"),
                             orden=(mea("seg_series", "Orden categoría"), "Ascending")),
              800, 640, 456, 340,
              filtros=[filtro_in("seg_series", "serie", ["dif"], "fdif")],
              contenedor=marco("¿Cuánto cambia con más horas de cuidado?",
                               "40 h o más frente a menos de 20 h, en pp. Rojo: el IC 90 % no cruza el cero."))

    G = K["grupo_problema"]
    p.agregar("grupo_t", texto([
        [("EL GRUPO DEL PROBLEMA", est(9, MENTA, True))],
        [("Cuidan 40 h o más, dicen «no tuve necesidad» y declaran daño.", est(14, "#F4F2F9", True, "Segoe UI Semibold"))],
        [(f"Total nacional: {fmt1(G['pct'])} % de las personas cuidadoras de discapacidad o 60+ "
          f"(IC 90 % {fmt1(G['li90'])}–{fmt1(G['ls90'])}; n = {G['n']:,}). No buscan ayuda: hay que encontrarlas.",
          est(10.5, "#E2DEEE"))]]),
        24, 996, 456, 170, contenedor=marco(fondo=SHELL, borde=False))
    v, mc = tarjeta("seg_series", "KPI grupo del problema", "% en el segmento elegido", color_valor="#F4F2F9", oscuro=True)
    p.agregar("grupo_c1", v, 24, 1176, 220, 110, contenedor=mc)
    v, mc = tarjeta("seg_series", "KPI grupo personas", "Personas (expandido)", color_valor="#F4F2F9", oscuro=True)
    p.agregar("grupo_c2", v, 260, 1176, 220, 110, contenedor=mc)

    p.agregar("horas", grafica("clusteredColumnChart",
                               {"Category": [col("seg_series", "categoria")],
                                "Y": [mea("seg_series", "Porcentaje")],
                                "Tooltips": [mea("seg_series", "Orden categoría"), mea("seg_series", "IC90 inferior"),
                                             mea("seg_series", "IC90 superior"), mea("seg_series", "Precisión")]},
                               obj_barras("seg_series", "Color precisión"),
                               orden=(mea("seg_series", "Orden categoría"), "Ascending")),
              496, 996, 560, 290,
              filtros=[filtro_in("seg_series", "serie", ["horas"], "fh"),
                       {"name": "fh2", "field": col("seg_series", "categoria"), "type": "Categorical",
                        "filter": {"Version": 2, "From": [{"Name": "x", "Entity": "seg_series", "Type": 0}],
                                   "Where": [{"Condition": {"Not": {"Expression": {"In": {
                                       "Expressions": [{"Column": {"Expression": {"SourceRef": {"Source": "x"}},
                                                                   "Property": "categoria"}}],
                                       "Values": [[{"Literal": {"Value": "'mediana'"}}]]}}}}}]},
                        "howCreated": "User"}],
              contenedor=marco("¿Cuántas horas a la semana cuidan?", "% de personas cuidadoras por rango de horas semanales"))
    v, mc = tarjeta("seg_series", "Mediana de horas", "Mediana (h/sem)", color_valor=ACENTO)
    p.agregar("mediana", v, 1072, 996, 184, 110, contenedor=mc)

    v, mc = segmentador("perfil_grupo", "dimension", "Perfil por", defecto="Sexo")
    p.agregar("seg_perf", v, 24, 1302, 240, 70, contenedor=mc)
    p.agregar("perfil", grafica("clusteredBarChart",
                                {"Category": [col("perfil_grupo", "segmento")],
                                 "Series": [col("perfil_grupo", "poblacion")],
                                 "Y": [mea("perfil_grupo", "Porcentaje perfil")],
                                 "Tooltips": [mea("perfil_grupo", "Dif perfil pp"), mea("perfil_grupo", "¿Difiere del resto?"),
                                              mea("perfil_grupo", "n perfil"), mea("perfil_grupo", "Precisión perfil"),
                                              mea("perfil_grupo", "Orden perfil")]},
                                dict(obj_barras(leyenda=True)),
                                orden=(mea("perfil_grupo", "Orden perfil"), "Ascending")),
              24, 1382, 600, 310,
              contenedor=marco("¿Quiénes forman el grupo del problema?",
                               "Grupo del problema frente a todas las cuidadoras. «¿Difiere del resto?» en la descripción emergente."))
    p.agregar("sexo", grafica("clusteredColumnChart",
                              {"Category": [col("brecha_sexo", "edad")], "Series": [col("brecha_sexo", "sexo")],
                               "Y": [mea("brecha_sexo", "Horas semanales")],
                               "Tooltips": [mea("brecha_sexo", "Orden edad")]},
                              obj_barras(leyenda=True),
                              orden=(mea("brecha_sexo", "Orden edad"), "Ascending")),
              640, 1302, 616, 390,
              contenedor=marco("Horas semanales de cuidado por sexo y edad",
                               "Origen sin documentar (08_brecha_cuidado_sexo.csv): sirve para ver la forma de la brecha, no para citar niveles."))

    # ------------------------------------------------------------------ BARRERAS
    p = Pagina("barreras", "¿Por qué no se contrata?", 1500)
    paginas.append(p)
    encabezado(p, "Barreras · nacional", "La barrera principal no es información ni precio: es la norma familiar.",
               "Las estimaciones con precisión baja aparecen en color claro y no cuentan como evidencia.")
    v, mc = segmentador("segmentos", "segmento_etiqueta", "Segmentar por", defecto="Total")
    s_bar = p.agregar("seg", v, 24, 186, 320, 70, contenedor=mc)
    nota_precision(p, 360, 192, 896)
    cmp_id = p.agregar("cmp", json.loads(json.dumps(cmp_v)), 24, 268, 1232, 260,
                       filtros=[filtro_in("seg_indicadores", "comparar_en", ["barreras"], "fcmp")],
                       contenedor=marco("Comparar segmentos",
                                        "% de cada segmento. Más oscuro = más alto; gris = precisión baja. No responde al segmentador."))
    p.sin_filtro(s_bar, cmp_id)
    luces = [("seg_indicadores", "Precio (son caros)", "Precio · no es el cuello de botella", AMBAR,
              "no buscó porque «son caros»"),
             ("seg_series", "Tratan mal (P7.11)", "Desconfianza · requisito de diseño", AMBAR,
              "rechaza residencias porque «tratan mal»"),
             ("seg_indicadores", "Norma familiar", "Norma familiar · respaldada", TEAL,
              "dice que la familia debe cuidar")]
    x = 24
    for i, (t, m, tit, c, sub) in enumerate(luces):
        v, mc = tarjeta(t, m, tit, color_valor=c, sub=sub)
        p.agregar(f"luz{i}", v, x, 544, 296, 130, contenedor=mc)
        x += 312
    v, mc = tarjeta("oferta_declarada", "Trabajaría: mujeres", "¿Trabajaría como cuidador(a) si le pagaran?",
                    color_valor="#5D4D8F", sub="mujeres de 15 a 60 años · intención, no oferta real")
    p.agregar("luz3", v, x, 544, 296, 130, contenedor=mc)
    od = D["oferta_declarada"]
    p.agregar("luz_nota", texto([[(f"Hombres: {fmt1(od['hombres']['pct'])} %. "
                                   f"Mujeres IC 90 % {fmt1(od['mujeres']['li90'])}–{fmt1(od['mujeres']['ls90'])}; "
                                   f"hombres {fmt1(od['hombres']['li90'])}–{fmt1(od['hombres']['ls90'])}. "
                                   "Las tres primeras tarjetas cambian con el segmento; la lectura (color y veredicto) es la del total nacional.",
                                   est(9, SUAVE))]]), 24, 680, 1232, 36, contenedor=marco(borde=False, fondo=PAPEL))

    v, mc = segmentador("razones", "universo", "Universo", defecto="Cuidan discapacidad o 60+")
    p.agregar("seg_raz", v, 24, 726, 300, 70, contenedor=mc)
    p.agregar("raz", grafica("clusteredBarChart",
                             {"Category": [col("razones", "etiqueta")], "Y": [mea("razones", "Porcentaje razón")],
                              "Tooltips": [mea("razones", "IC90 inf razón"), mea("razones", "IC90 sup razón"),
                                           mea("razones", "n razón"), mea("razones", "Precisión razón")]},
                             obj_barras("razones", "Color razón"),
                             orden=(mea("razones", "Porcentaje razón"), "Descending")),
              24, 806, 600, 330,
              contenedor=marco("¿Por qué no buscó servicios?", "Razón principal (P6.45), % de quienes no buscaron"))
    p.agregar("quintil", grafica("lineChart",
                                 {"Category": [col("contratacion_quintil", "quintil_txt")],
                                  "Series": [col("contratacion_quintil", "servicio")],
                                  "Y": [mea("contratacion_quintil", "Contrata (%)")],
                                  "Tooltips": [mea("contratacion_quintil", "Precisión quintil"),
                                               mea("contratacion_quintil", "Casos en muestra")]},
                                 {"legend": [{"properties": {"show": lit(True), "position": lit("Top")}}],
                                  "labels": [{"properties": {"show": lit(True), "fontSize": lit(9)}}],
                                  "lineStyles": [{"properties": {"showMarker": lit(True), "markerSize": lit(6)}}]},
                                 orden=(col("contratacion_quintil", "quintil_txt"), "Ascending")),
              640, 726, 616, 410,
              contenedor=marco("¿Contratan más los hogares con más ingreso?",
                               "% de hogares con persona con discapacidad o 60+ que contrata, por quintil. Casi todos los puntos tienen precisión baja."))
    p.agregar("pref", grafica("clusteredBarChart",
                              {"Category": [col("seg_series", "categoria")], "Y": [mea("seg_series", "Porcentaje")],
                               "Tooltips": [mea("seg_series", "IC90 inferior"), mea("seg_series", "IC90 superior"),
                                            mea("seg_series", "n muestra"), mea("seg_series", "Precisión")]},
                              obj_barras("seg_series", "Color precisión"),
                              orden=(mea("seg_series", "Porcentaje"), "Descending")),
              24, 1152, 600, 320, filtros=[filtro_in("seg_series", "serie", ["pref"], "fpref")],
              contenedor=marco("Si contratara cuidado, ¿dónde?", "P6.46, % de personas cuidadoras del segmento"))
    p.agregar("p711", grafica("clusteredBarChart",
                              {"Category": [col("seg_series", "categoria")], "Y": [mea("seg_series", "Porcentaje")],
                               "Tooltips": [mea("seg_series", "IC90 inferior"), mea("seg_series", "IC90 superior"),
                                            mea("seg_series", "n muestra"), mea("seg_series", "Precisión")]},
                              obj_barras("seg_series", "Color precisión"),
                              orden=(mea("seg_series", "Porcentaje"), "Descending")),
              640, 1152, 616, 320, filtros=[filtro_in("seg_series", "serie", ["p711"], "fp711")],
              contenedor=marco("¿Por qué rechazaría una residencia?", "P7.11, razón principal"))

    # ------------------------------------------------------------------ COSTOS
    p = Pagina("relevo", "¿Cuánto cuesta?", 1340)
    paginas.append(p)
    encabezado(p, "Costos · nacional y CDMX", "Unas horas de cuidado pagado cuestan una fracción de la jornada completa.",
               "Sin prestaciones · jornada diurna: las gráficas de asequibilidad (script 10) no incluyen IMSS, aguinaldo, vacaciones "
               "ni hora nocturna, así que están sobreestimadas. La tarjeta de jornada ya muestra la carga laboral (script 20, por confirmar).")
    tiles = [("Costo 6 h piso legal", "al mes por 6 h/semana al piso legal", TINTA),
             ("Costo jornada 40 h", "al mes por la jornada completa (40 h)", ALERTA),
             ("Pagarían 6 h (≤20%)", "de los hogares podría pagar 6 h/sem (≤ 20 % del ingreso)", ACENTO),
             ("Piso legal por hora", "por hora: salario mínimo profesional 2026", TINTA)]
    x = 24
    for i, (m, lab, c) in enumerate(tiles):
        v, mc = tarjeta("asequibilidad", m, lab, color_valor=c)
        p.agregar(f"tile{i}", v, x, 186, 296, 110, contenedor=mc)
        x += 312
    v, mc = segmentador("asequibilidad", "fuente_ingreso", "Fuente de ingreso", defecto="ENASIC · nacional")
    p.agregar("s_fte", v, 24, 312, 260, 70, contenedor=mc)
    v, mc = segmentador("asequibilidad", "salario_corto", "Salario por hora", defecto="Piso legal")
    p.agregar("s_sal", v, 296, 312, 240, 70, contenedor=mc)
    v, mc = segmentador("asequibilidad", "umbral", "Tope de gasto", defecto="≤ 20% del ingreso")
    p.agregar("s_umb", v, 548, 312, 240, 70, contenedor=mc)
    p.agregar("relevo", grafica("clusteredColumnChart",
                                {"Category": [col("asequibilidad", "paquete_corto")],
                                 "Y": [mea("asequibilidad", "Hogares que podrían pagar")],
                                 "Tooltips": [mea("asequibilidad", "Horas paquete"), mea("asequibilidad", "Costo mensual"),
                                              mea("asequibilidad", "IC90 inf hogares"), mea("asequibilidad", "IC90 sup hogares"),
                                              mea("asequibilidad", "Precisión hogares")]},
                                obj_barras(color_fijo=ACENTO),
                                orden=(mea("asequibilidad", "Horas paquete"), "Ascending")),
              24, 392, 764, 380,
              contenedor=marco("¿Cuántos hogares podrían pagarlo?",
                               "% de hogares con persona con discapacidad o 60+ cuyo costo queda bajo el tope elegido"))
    p.agregar("ing", grafica("clusteredBarChart",
                             {"Category": [col("asequibilidad", "paquete_corto")],
                              "Y": [mea("asequibilidad", "Parte del ingreso mediano")],
                              "Tooltips": [mea("asequibilidad", "Horas paquete"), mea("asequibilidad", "Costo mensual")]},
                             obj_barras("asequibilidad", "Color tope"),
                             orden=(mea("asequibilidad", "Horas paquete"), "Ascending")),
              804, 312, 452, 300,
              contenedor=marco("¿Qué parte del ingreso se lleva?",
                               "Costo del paquete ÷ ingreso mediano del hogar. Rojo: rebasa el tope elegido."))
    p.agregar("pago", grafica("clusteredBarChart",
                              {"Category": [col("pago_hora", "servicio")],
                               "Y": [mea("pago_hora", "Percentil 25"), mea("pago_hora", "Mediana pagada"), mea("pago_hora", "Percentil 75")],
                               "Tooltips": [mea("pago_hora", "Hogares en muestra"), mea("pago_hora", "Orden servicio")]},
                              obj_barras(leyenda=True),
                              orden=(mea("pago_hora", "Orden servicio"), "Ascending")),
              804, 628, 452, 300,
              contenedor=marco("¿Cuánto se paga hoy por hora?",
                               "Pago observado en la ENASIC, pesos de 2026, sin ponderar: muestras chicas"))
    mi = D["relevo_enigh"]["mediana_nov2022"]
    p.agregar("rel_nota", texto([[(f"Ingreso mediano mensual del hogar (ENIGH, nov. 2022): nacional ${mi['Nacional']:,.0f}; "
                                   f"CDMX ${mi['CDMX']:,.0f}. ENASIC: proporción ponderada sin varianza de diseño; "
                                   "ENIGH: con intervalo al 90 % en la descripción emergente.", est(9, SUAVE))]]),
              24, 780, 764, 50, contenedor=marco(borde=False, fondo=PAPEL))
    v, mc = segmentador("costo_jornada", "horas_txt", "Horas de relevo", defecto="6 h/sem")
    p.agregar("s_jh", v, 24, 944, 240, 70, contenedor=mc)
    v, mc = segmentador("costo_jornada", "carga_txt", "Carga laboral", defecto="Sin carga")
    p.agregar("s_jc", v, 276, 944, 300, 70, contenedor=mc)
    p.agregar("jor", grafica("clusteredColumnChart",
                             {"Category": [col("costo_jornada", "jornada")],
                              "Y": [mea("costo_jornada", "Costo mensual jornada")],
                              "Tooltips": [mea("costo_jornada", "Carga patronal %")]},
                             obj_barras(color_fijo=AMBAR)),
              24, 1024, 600, 290,
              contenedor=marco("¿Cambia el costo si el relevo es de noche o con carga laboral?",
                               "Costo mensual por tipo de jornada (script 19 y 20). Pendiente de doble revisión; arts. 60 y 61 LFT por verificar."))
    v, mc = segmentador("financiamiento", "opex_txt", "Costo de operación", defecto="Operación $0")
    p.agregar("s_opex", v, 640, 944, 340, 70, contenedor=mc)
    v, mc = tarjeta("financiamiento", "Solicitud CDMX 2026 (mdp)", "Solicitud 2026 (mdp, probable)",
                    color_valor=SUAVE, tam=16)
    # Tarjeta baja: título chico y poco margen para que se vea la cifra
    mc["title"][0]["properties"]["fontSize"] = lit(10)
    mc["padding"] = [{"properties": {"top": lit(4), "bottom": lit(2), "left": lit(12), "right": lit(12)}}]
    p.agregar("sol", v, 992, 944, 264, 70, contenedor=mc)
    p.agregar("sub", grafica("clusteredBarChart",
                             {"Category": [col("financiamiento", "escenario")],
                              "Y": [mea("financiamiento", "Financiamiento anual (mdp)")],
                              "Tooltips": [mea("financiamiento", "% de la solicitud CDMX"),
                                           mea("financiamiento", "Orden escenario")]},
                             obj_barras(color_fijo=TEAL),
                             orden=(mea("financiamiento", "Orden escenario"), "Ascending")),
              640, 1024, 616, 290,
              contenedor=marco("Si se subsidia el relevo: financiamiento anual en la CDMX",
                               "Millones de pesos al año por escenario de aceptación (ilustrativos). Script 20, pendiente de doble revisión."))

    # ------------------------------------------------------------------ FOCALIZACIÓN
    p = Pagina("focalizacion", "¿A quién primero?", 2040)
    paginas.append(p)
    encabezado(p, "Modelo de focalización · nacional", "Una regla simple encuentra casi a las mismas personas que el modelo.",
               "¿A quién ofrecer primero el relevo? Los métodos seleccionan la misma proporción de personas (≈ 41 %).")
    mt = [("Cobertura regla", "de las personas con daño las encuentra la regla «40 h o más»", TINTA),
          ("Cobertura logística", "las encuentra la regresión logística, con el mismo número de seleccionados", TINTA),
          ("Diferencia logística pp", f"pp de diferencia; IC 90 % de {fmt1(LG['dif_li90'])} a {fmt1(LG['dif_ls90'])}: no demostrable", AMBAR),
          ("Diferencia salud física pp", "pp: sí gana el modelo si el objetivo es salud física deteriorada", TEAL)]
    x = 24
    for i, (m, lab, c) in enumerate(mt):
        v, mc = tarjeta("modelo_global", m, lab, color_valor=c, tam=22)
        p.agregar(f"mt{i}", v, x, 186, 296, 132, contenedor=mc)
        x += 312
    v, mc = segmentador("modelo_grupos", "modelo", "Modelo", defecto="Regresión logística")
    p.agregar("s_mod", v, 24, 322, 300, 70, contenedor=mc)
    p.agregar("grupos", grafica("clusteredBarChart",
                                {"Category": [col("modelo_grupos", "grupo_txt")],
                                 "Series": [col("modelo_grupos", "metodo")],
                                 "Y": [mea("modelo_grupos", "Cobertura grupo")],
                                 "Tooltips": [mea("modelo_grupos", "Casos con daño"), mea("modelo_grupos", "Orden grupo")]},
                                obj_barras(leyenda=True),
                                orden=(mea("modelo_grupos", "Orden grupo"), "Ascending")),
              24, 402, 760, 470,
              contenedor=marco("El modelo cambia a quién se selecciona",
                               "Cobertura: % de las personas con daño de cada grupo que quedan seleccionadas. Casos con daño en la descripción emergente (< 200: poco confiable)."))
    p.agregar("coef", grafica("clusteredBarChart",
                              {"Category": [col("modelo_coeficientes", "variable_txt")],
                               "Y": [mea("modelo_coeficientes", "Coeficiente")]},
                              obj_barras("modelo_coeficientes", "Color coeficiente"),
                              orden=(mea("modelo_coeficientes", "Coeficiente"), "Descending")),
              800, 322, 456, 550,
              contenedor=marco("Qué asocia el modelo con el daño",
                               "Coeficientes estandarizados de la regresión logística. Son asociaciones, no causas. Rojo: más probabilidad; verde: menos."))

    p.agregar("m2_t", texto([
        [("AMPLIACIÓN · 13 OCT 2026 · PENDIENTE DE DOBLE REVISIÓN", est(9, ACENTO, True))],
        [("¿Por qué estos dos modelos y qué tan bien funcionan?", est(15, TINTA, True, "Segoe UI Semibold"))],
        [("Se probaron otras familias de modelos con el mismo protocolo (pesos de la encuesta, misma tasa de selección). "
          "Las cuatro gráficas de abajo cambian según el objetivo.", est(10.5, SUAVE))]]),
        24, 888, 900, 96, contenedor=marco(borde=False, fondo=PAPEL))
    v, mc = segmentador("objetivos", "objetivo_txt", "Objetivo", defecto="Algún daño")
    s_obj = p.agregar("s_obj", v, 940, 900, 316, 70, contenedor=mc)
    p.agregar("alt", grafica("clusteredBarChart",
                             {"Category": [col("modelo_alternativas", "puntaje")],
                              "Y": [mea("modelo_alternativas", "Dif cobertura vs regla")],
                              "Tooltips": [mea("modelo_alternativas", "IC90 inf alt"), mea("modelo_alternativas", "IC90 sup alt"),
                                           mea("modelo_alternativas", "AUC alt"), mea("modelo_alternativas", "Brier alt"),
                                           mea("modelo_alternativas", "Cobertura alt")]},
                             obj_barras("modelo_alternativas", "Color alternativa"),
                             orden=(mea("modelo_alternativas", "Dif cobertura vs regla"), "Descending")),
              24, 994, 616, 380,
              contenedor=marco("Ocho formas de elegir, la misma cantidad de personas",
                               "pp de cobertura contra la regla 40 h. Ámbar: elegidos; lila: horas como puntaje; gris: alternativas."))
    p.agregar("cur", grafica("lineChart",
                             {"Category": [col("modelo_curvas", "pct_seleccion")],
                              "Series": [col("modelo_curvas", "serie")],
                              "Y": [mea("modelo_curvas", "Cobertura curva")]},
                             {"legend": [{"properties": {"show": lit(True), "position": lit("Top")}}],
                              "categoryAxis": [{"properties": {"axisType": lit("Scalar"), "showAxisTitle": lit(True)}}],
                              "valueAxis": [{"properties": {"showAxisTitle": lit(True)}}]}),
              656, 994, 600, 380,
              contenedor=marco("¿A cuántas personas con daño llega, según el cupo?",
                               "Eje X: % seleccionado; eje Y: % de las personas con daño alcanzadas. «Al azar» es la diagonal."))
    p.agregar("imp", grafica("clusteredBarChart",
                             {"Category": [col("modelo_importancia", "variable_txt")],
                              "Series": [col("modelo_importancia", "puntaje")],
                              "Y": [mea("modelo_importancia", "Caída del AUC (centésimas)")]},
                             obj_barras(leyenda=True, etiquetas=False),
                             orden=(mea("modelo_importancia", "Caída del AUC (centésimas)"), "Descending")),
              24, 1390, 616, 420,
              contenedor=marco("¿Qué variables usa cada modelo?",
                               "Importancia por permutación: caída del AUC, en centésimas, al desordenar la variable"))
    p.agregar("cal", grafica("scatterChart",
                             {"Category": [col("modelo_calibracion", "decil")],
                              "Series": [col("modelo_calibracion", "puntaje")],
                              "X": [mea("modelo_calibracion", "Predicho (%)")],
                              "Y": [mea("modelo_calibracion", "Observado (%)")]},
                             {"legend": [{"properties": {"show": lit(True), "position": lit("Top")}}],
                              "categoryAxis": [{"properties": {"showAxisTitle": lit(True), "start": lit(0), "end": lit(100)}}],
                              "valueAxis": [{"properties": {"showAxisTitle": lit(True), "start": lit(0), "end": lit(100)}}],
                              "y1AxisReferenceLine": [{"properties": {"show": lit(False)}}]}),
              656, 1390, 600, 420,
              contenedor=marco("¿Las probabilidades se pueden leer como porcentajes?",
                               "Calibración por deciles: si los puntos siguen la diagonal (predicho = observado), sí."))
    obj_t = p.agregar("obj_t", texto([
        [("DECISIÓN DEL EQUIPO · LOS DATOS INFORMAN, NO DECIDEN", est(9, ACENTO, True))],
        [("¿Qué objetivo conviene: algún daño o salud física deteriorada?", est(15, TINTA, True, "Segoe UI Semibold"))]]),
        24, 1826, 1232, 60, contenedor=marco(borde=False, fondo=PAPEL))
    oh = p.agregar("objh", grafica("clusteredColumnChart",
                                   {"Category": [col("modelo_por_horas", "horas")],
                                    "Series": [col("modelo_por_horas", "objetivo_txt")],
                                    "Y": [mea("modelo_por_horas", "Prevalencia (%)")],
                                    "Tooltips": [mea("modelo_por_horas", "Orden horas")]},
                                   obj_barras(leyenda=True),
                                   orden=(mea("modelo_por_horas", "Orden horas"), "Ascending")),
                   24, 1890, 600, 140,
                   contenedor=marco("Cuánto sube cada daño con las horas", None))
    og = p.agregar("objg", grafica("clusteredBarChart",
                                   {"Category": [col("modelo_obj_grupo", "grupo_txt")],
                                    "Series": [col("modelo_obj_grupo", "objetivo_txt")],
                                    "Y": [mea("modelo_obj_grupo", "Gana o pierde (pp)")],
                                    "Tooltips": [mea("modelo_obj_grupo", "Orden grupo obj")]},
                                   obj_barras(leyenda=True, etiquetas=False),
                                   orden=(mea("modelo_obj_grupo", "Orden grupo obj"), "Ascending")),
                   640, 1890, 616, 140,
                   contenedor=marco("A quién gana o pierde el modelo frente a la regla (pp)", None))
    p.sin_filtro(s_obj, oh)
    p.sin_filtro(s_obj, og)
    p.alto = 2440
    # Más alto para que quepan bien las dos gráficas de decisión y la tabla de criterios
    for v in p.visuales:
        if v["name"] in (oh, og):
            v["position"]["height"] = 300
    p.agregar("dec", grafica("tableEx", {"Values": [col("modelo_decision", "criterio"), col("modelo_decision", "tipo"),
                                                    col("modelo_decision", "algun_dano"), col("modelo_decision", "salud_fisica"),
                                                    col("modelo_decision", "favorece")]},
                             {"columnHeaders": [{"properties": {"fontSize": lit(10), "bold": lit(True)}}],
                              "values": [{"properties": {"fontSize": lit(9.5), "wordWrap": lit(True)}}]},
                             orden=(col("modelo_decision", "criterio"), "Ascending")),
              24, 2206, 1232, 210, contenedor=marco("Tabla de criterios", None))

    # ------------------------------------------------------------------ TERRITORIO
    p = Pagina("territorio", "¿Dónde?", 2480)
    paginas.append(p)
    encabezado(p, "Territorio · CDMX · exploratorio", "Oferta, dependencia y vulnerabilidad por alcaldía",
               "Fuentes distintas a la ENASIC. Ninguna capa mide cobertura; rezago y derechohabiencia son contexto, no necesidad.")
    dims = [("necesidad_cdmx", "Hogares CDMX con 60+ o discapacidad (ENIGH)", "≈ hogares CDMX con persona de 60+ o con discapacidad (ENIGH 2022)", TEAL),
            ("dimension_cdmx", "Hogares CDMX con necesidad (cota inferior)", "≥ hogares CDMX con necesidad: tasa nacional ENASIC × viviendas Censo (subestima)", TINTA),
            ("dimension_cdmx", "Hogares CDMX que contratan cuidadora", "≈ hogares CDMX que hoy contratan enfermería o cuidadora (doble inferencia)", TINTA),
            ("dimension_cdmx", "Hogares CDMX que contratan trabajo doméstico", "≈ hogares CDMX con necesidad que contratan trabajo doméstico", TINTA)]
    x = 24
    for i, (t, m, lab, c) in enumerate(dims):
        v, mc = tarjeta(t, m, lab, color_valor=c)
        p.agregar(f"dim{i}", v, x, 186, 296, 120, contenedor=mc)
        x += 312
    v, mc = segmentador("alcaldias_indicadores", "indicador", "Capa", defecto=
                        "Asilos frente a población de 60+ (índice, 1 = proporcional)")
    p.agregar("s_capa", v, 24, 322, 560, 70, contenedor=mc)
    p.agregar("capa", grafica("clusteredBarChart",
                              {"Category": [col("alcaldias_indicadores", "alcaldia")],
                               "Y": [mea("alcaldias_indicadores", "Valor alcaldía")],
                               "Tooltips": [mea("alcaldias_indicadores", "Conteo alcaldía"),
                                            mea("alcaldias_indicadores", "% de la población 60+")]},
                              obj_barras(color_fijo=ACENTO),
                              orden=(mea("alcaldias_indicadores", "Valor alcaldía"), "Descending")),
              24, 402, 700, 520,
              contenedor=marco("Capa elegida por alcaldía", "Valor de la capa; conteo y % de la población 60+ en la descripción emergente"))
    p.agregar("tabla_capa", grafica("tableEx", {"Values": [col("alcaldias_indicadores", "alcaldia"),
                                                           mea("alcaldias_indicadores", "Valor alcaldía"),
                                                           mea("alcaldias_indicadores", "Conteo alcaldía"),
                                                           mea("alcaldias_indicadores", "% de la población 60+")]},
                                    {"values": [{"properties": {"fontSize": lit(10)}}]},
                                    orden=(mea("alcaldias_indicadores", "Valor alcaldía"), "Descending")),
              740, 322, 516, 600, contenedor=marco("Tabla por alcaldía",
                                                   "Ningún par oferta–necesidad cumple la regla de compatibilidad: no es indicador de cobertura."))

    v, mc = segmentador("estados", "indicador", "Indicador por entidad", defecto="Personas de 60+ en situación de pobreza (CONEVAL)")
    p.agregar("s_est", v, 24, 940, 560, 70, contenedor=mc)
    p.agregar("est", grafica("clusteredBarChart",
                             {"Category": [col("estados", "entidad")], "Y": [mea("estados", "Valor entidad")],
                              "Tooltips": [mea("estados", "IC90 inf ent"), mea("estados", "IC90 sup ent"),
                                           mea("estados", "Valor nacional")]},
                             obj_barras("estados", "Color entidad", etiquetas=True),
                             orden=(mea("estados", "Valor entidad"), "Descending")),
              24, 1020, 1232, 560,
              contenedor=marco("México · 32 entidades · ENIGH 2022 y CONAPO 2020",
                               "Rojo: Ciudad de México. Valor nacional e IC 90 % en la descripción emergente."))

    tp = D["tipologia"]
    p.agregar("tipo_t", texto([
        [("CDMX · AGEB URBANAS · CENSO 2020 · MODELO DE TIPOLOGÍA (NOTEBOOK D)", est(9, ACENTO, True))],
        [("Cuatro tipos de zona para decidir dónde probar el relevo", est(15, TINTA, True, "Segoe UI Semibold"))],
        [(f"k-means sobre {len(tp['ageb']):,} AGEB urbanas con 9 variables del Censo 2020. Describe zonas, no personas.",
          est(10.5, SUAVE))]]),
        24, 1596, 1232, 90, contenedor=marco(borde=False, fondo=PAPEL))
    p.agregar("tipos", grafica("tableEx", {"Values": [col("tipologia_tipos", "tipo_txt"), col("tipologia_tipos", "n_ageb"),
                                                      col("tipologia_tipos", "poblacion"), col("tipologia_tipos", "n_60"),
                                                      col("tipologia_tipos", "pct_60"), col("tipologia_tipos", "pct_sinder"),
                                                      col("tipologia_tipos", "pct_viv_sin_int")]},
                               {"values": [{"properties": {"fontSize": lit(9)}}],
                                "columnHeaders": [{"properties": {"fontSize": lit(9)}}]},
                               orden=(col("tipologia_tipos", "tipo_txt"), "Ascending")),
              24, 1690, 616, 200, contenedor=marco("Los cuatro tipos", "Conteos y porcentajes por tipo de zona (Censo 2020)"))
    p.agregar("tipo_alc", grafica("hundredPercentStackedBarChart",
                                  {"Category": [col("tipologia_alcaldia", "alcaldia")],
                                   "Series": [col("tipologia_alcaldia", "tipo_txt")],
                                   "Y": [mea("tipologia_alcaldia", "% de AGEB")]},
                                  {"legend": [{"properties": {"show": lit(True), "position": lit("Top"), "fontSize": lit(8)}}],
                                   "labels": [{"properties": {"show": lit(False)}}]}),
              656, 1690, 600, 420, contenedor=marco("Tipos de zona dentro de cada alcaldía", "% de las AGEB de la alcaldía"))
    p.agregar("ageb_sc", grafica("scatterChart",
                                 {"Category": [col("ageb_tipologia", "cvegeo")],
                                  "Series": [col("ageb_tipologia", "tipo_txt")],
                                  "X": [mea("ageb_tipologia", "% 60+")],
                                  "Y": [mea("ageb_tipologia", "% viviendas sin internet")]},
                                 {"legend": [{"properties": {"show": lit(True), "position": lit("Top"), "fontSize": lit(8)}}],
                                  "categoryAxis": [{"properties": {"showAxisTitle": lit(True)}}],
                                  "valueAxis": [{"properties": {"showAxisTitle": lit(True)}}],
                                  "bubbles": [{"properties": {"bubbleSize": lit(-12)}}]}),
              24, 1906, 616, 400, contenedor=marco("Cada punto es una AGEB", "% de 60+ contra % de viviendas sin internet, por tipo"))
    peq = [("tipologia_tipos", "De las personas 60+ (%)", "¿Dónde viven las personas de 60+?"),
           ("tipologia_tipos", "Viviendas sin internet (%)", "¿La app llega a todas las viviendas?"),
           ("tipologia_tipos", "60+ a más de 1 km de la oferta (%)", "¿Qué tan lejos queda la oferta formal?")]
    x = 24
    for i, (t, m, tit) in enumerate(peq):
        p.agregar(f"q{i}", grafica("clusteredBarChart", {"Category": [col(t, "tipo_txt")], "Y": [mea(t, m)]},
                                   obj_barras(color_fijo=[ACENTO, ALERTA, AMBAR][i]),
                                   orden=(col(t, "tipo_txt"), "Ascending")),
                  x, 2322, 400, 220, contenedor=marco(tit, None))
        x += 416
    p.agregar("brecha", grafica("clusteredBarChart",
                                {"Category": [col("brecha_alcaldia", "alcaldia")],
                                 "Y": [mea("brecha_alcaldia", "Personas 60+ en AGEB con brecha")]},
                                obj_barras(color_fijo=ALERTA),
                                orden=(mea("brecha_alcaldia", "Personas 60+ en AGEB con brecha"), "Descending")),
              656, 2126, 600, 180,
              contenedor=marco("Brechas de oferta: personas de 60+ en AGEB con brecha", None))
    p.agregar("sil", grafica("lineChart",
                             {"Category": [col("tipologia_k", "k")],
                              "Y": [mea("tipologia_k", "Silueta del modelo"), mea("tipologia_k", "Silueta al azar (p95)"),
                                    mea("tipologia_k", "Estabilidad (ARI mínimo)")]},
                             {"legend": [{"properties": {"show": lit(True), "position": lit("Top")}}],
                              "categoryAxis": [{"properties": {"axisType": lit("Categorical")}}],
                              "lineStyles": [{"properties": {"showMarker": lit(True)}}]}),
              24, 2558, 616, 300,
              contenedor=marco("¿Qué tan confiable es la tipología?",
                               "Silueta por número de grupos contra la de datos al azar (p95) y estabilidad ARI"))
    p.agregar("rob", grafica("clusteredBarChart",
                             {"Category": [col("tipologia_robustez", "variante")], "Y": [mea("tipologia_robustez", "Coincidencia ARI")]},
                             obj_barras(color_fijo=TEAL),
                             orden=(mea("tipologia_robustez", "Coincidencia ARI"), "Descending")),
              656, 2558, 600, 300,
              contenedor=marco("Robustez: coincidencia con el modelo (ARI) al cambiar una decisión", "1 = misma partición"))
    p.alto = 2880
    return paginas


def escribir_reporte(paginas):
    defn = os.path.join(REP, "definition")
    pdir = os.path.join(defn, "pages")
    if os.path.isdir(pdir):
        shutil.rmtree(pdir)
    os.makedirs(pdir)
    for p in paginas:
        d = os.path.join(pdir, p.id)
        os.makedirs(os.path.join(d, "visuals"))
        pj = {"$schema": SCHEMA_PAGE, "name": p.id, "displayName": p.nombre, "displayOption": "FitToWidth",
              "height": p.alto, "width": 1280,
              "objects": {"background": [{"properties": {"color": color(PAPEL), "transparency": lit(0)}}],
                          "outspace": [{"properties": {"color": color(PAPEL), "transparency": lit(0)}}]}}
        if p.interacciones:
            pj["visualInteractions"] = p.interacciones
        barra_superior(p, paginas)
        for v in p.visuales:
            vd = os.path.join(d, "visuals", v["name"])
            os.makedirs(vd, exist_ok=True)
            with open(os.path.join(vd, "visual.json"), "w", encoding="utf-8") as f:
                json.dump(v, f, ensure_ascii=False, indent=2)
        with open(os.path.join(d, "page.json"), "w", encoding="utf-8") as f:
            json.dump(pj, f, ensure_ascii=False, indent=2)
    with open(os.path.join(pdir, "pages.json"), "w", encoding="utf-8") as f:
        json.dump({"$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.1.0/schema.json",
                   "pageOrder": [p.id for p in paginas], "activePageName": paginas[0].id}, f, ensure_ascii=False, indent=2)

    # Recursos: tema y logo
    rr = os.path.join(REP, "StaticResources", "RegisteredResources")
    os.makedirs(rr, exist_ok=True)
    rec = os.path.join(PBI, "recursos")
    for n in os.listdir(rec):
        shutil.copy(os.path.join(rec, n), os.path.join(rr, n))
    rj = os.path.join(defn, "report.json")
    with open(rj, encoding="utf-8") as f:
        R = json.load(f)
    base = R["themeCollection"]["baseTheme"]
    R["themeCollection"]["customTheme"] = {"name": "ObservatorioCuidado.json",
                                           "reportVersionAtImport": base["reportVersionAtImport"],
                                           "type": "RegisteredResources"}
    R["resourcePackages"] = [rp for rp in R["resourcePackages"] if rp["type"] != "RegisteredResources"]
    R["resourcePackages"].append({"name": "RegisteredResources", "type": "RegisteredResources", "items": [
        {"name": "ObservatorioCuidado.json", "path": "ObservatorioCuidado.json", "type": "CustomTheme"},
        {"name": "logo_personajes.png", "path": "logo_personajes.png", "type": "Image"}]})
    with open(rj, "w", encoding="utf-8") as f:
        json.dump(R, f, ensure_ascii=False, indent=2)


def main():
    with open(os.path.join(RAIZ, "Frontend", "observatorio", "datos_observatorio.json"), encoding="utf-8") as f:
        D = json.load(f)
    tablas, _ = generar_modelo()
    print(f"Modelo: {len(tablas)} tablas, {sum(len(MEDIDAS.get(t, [])) for t in tablas)} medidas, {len(RELACIONES)} relaciones")
    paginas = construir_paginas(D)
    escribir_reporte(paginas)
    print(f"Reporte: {len(paginas)} páginas, {sum(len(p.visuales) for p in paginas)} visuales")
    print(f"Ruta de datos en el parámetro RutaDatos: {RUTA_WIN}")


if __name__ == "__main__":
    main()
