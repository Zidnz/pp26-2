"""Exporta los datos del Observatorio del Cuidado a CSV ordenados para Power BI.

Fuente única: Frontend/observatorio/datos_observatorio.json (lo genera build_datos.py
a partir de Analysis/resultados, Analysis/outputs y Analysis/matrices). Este script no
calcula cifras nuevas: solo cambia la forma de las tablas (aplanar, despivotar, ordenar).
Cada CSV lleva una columna `fuente` con el archivo de resultados de origen cuando el JSON
la trae, para conservar la trazabilidad.

Uso (desde la raíz del repositorio):
    python PowerBI/exportar_datos_pbi.py
Salida: PowerBI/datos/*.csv (UTF-8 con BOM, separador coma).
"""
import csv
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = os.path.join(RAIZ, "Frontend", "observatorio", "datos_observatorio.json")
DESTINO = os.path.join(RAIZ, "PowerBI", "datos")

ORDEN_SEG = [
    ("Total", "Total", "Total"),
    ("Sexo", "Mujer", "Mujeres"),
    ("Sexo", "Hombre", "Hombres"),
    ("Edad", "15-39", "15 a 39 años"),
    ("Edad", "40-59", "40 a 59 años"),
    ("Edad", "60+", "60 años y más"),
    ("Ingreso", "Q1-Q2", "Ingreso Q1–Q2"),
    ("Ingreso", "Q3", "Ingreso Q3"),
    ("Ingreso", "Q4-Q5", "Ingreso Q4–Q5"),
    ("A quién cuida", "Cuida discapacidad", "Cuida discapacidad"),
    ("A quién cuida", "Solo 60+ sin discapacidad", "Solo 60+ sin discapacidad"),
    ("Intensidad", "<20 h", "Menos de 20 h"),
    ("Intensidad", "20-39 h", "20 a 39 h"),
    ("Intensidad", ">=40 h", "40 h o más"),
]
SEG_ID = {(d, s): f"{d}|{s}" for d, s, _ in ORDEN_SEG}

OBJETIVOS = {"DANO_ALGUNO": "Algún daño", "DANO_SALUD_FISICA": "Salud física deteriorada"}

VARIABLES = {
    "HORAS": "Horas de cuidado a la semana",
    "CUIDA_MENORES": "También cuida a menores",
    "FALTA_FUERZA": "Le falta fuerza física",
    "REQUIERE_APOYO": "La persona requiere apoyo",
    "N_CLINICAS": "Número de condiciones clínicas",
    "MUJER": "Es mujer",
    "QUINTIL": "Quintil de ingreso",
    "QUINTIL_NA": "Ingreso sin dato",
    "N_ABVD": "Actividades básicas con ayuda",
    "CAPACITACION": "Tiene capacitación",
    "EDAD_N": "Edad",
    "ESCOLARIDAD": "Escolaridad",
    "ANIOS_CUIDANDO": "Años cuidando",
    "CUIDA_DISC": "Cuida a persona con discapacidad",
    "APOYO_FAMILIA": "Recibe apoyo de la familia",
}

DIM_MODELO = {"SEXO": "Sexo", "EDAD": "Edad", "TIPO": "A quién cuida", "ING": "Ingreso"}
ORDEN_GRUPO_MODELO = ["Mujer", "Hombre", "15-39", "40-59", "60+", "Cuida discapacidad",
                      "Solo 60+ sin discapacidad", "Q1-Q2", "Q3", "Q4-Q5", "Sin dato"]
ETIQ_GRUPO_MODELO = {"Mujer": "Mujeres", "Hombre": "Hombres", "15-39": "15 a 39 años",
                     "40-59": "40 a 59 años", "60+": "60 y más",
                     "Cuida discapacidad": "Cuida discapacidad",
                     "Solo 60+ sin discapacidad": "Solo 60+ sin discap.",
                     "Q1-Q2": "Ingreso Q1–Q2", "Q3": "Ingreso Q3", "Q4-Q5": "Ingreso Q4–Q5",
                     "Sin dato": "Ingreso sin dato"}


def escribir(nombre, filas, columnas):
    ruta = os.path.join(DESTINO, nombre + ".csv")
    with open(ruta, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=columnas, extrasaction="ignore")
        w.writeheader()
        for r in filas:
            w.writerow({k: limpiar(r.get(k)) for k in columnas})
    print(f"  {nombre}.csv: {len(filas)} filas")
    return nombre


def limpiar(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "Sí" if v else "No"
    if isinstance(v, float):
        return repr(round(v, 6))
    return v


def precision_txt(p):
    return p if p else "sin dato"


def main():
    os.makedirs(DESTINO, exist_ok=True)
    with open(ORIGEN, encoding="utf-8") as f:
        D = json.load(f)
    print(f"Origen: {ORIGEN} (actualizado: {D.get('actualizado')})")
    tablas = []

    # ---------- Segmentos (dimensión compartida por las pestañas Necesidad y Barreras)
    seg = [{"seg_id": SEG_ID[(d, s)], "dimension": d, "segmento": s, "segmento_etiqueta": e,
            "orden": i + 1} for i, (d, s, e) in enumerate(ORDEN_SEG)]
    tablas.append(escribir("segmentos", seg, ["seg_id", "dimension", "segmento", "segmento_etiqueta", "orden"]))

    # ---------- Inicio: indicadores clave, embudo e inventario
    clave = []
    for k, r in D["clave"].items():
        clave.append(dict(r, clave=k))
    tablas.append(escribir("clave", clave, ["clave", "pct", "cv", "li90", "ls90", "total_expandido", "precision", "n", "fuente"]))

    emb = [dict(r, orden=i + 1) for i, r in enumerate(D["embudo"])]
    tablas.append(escribir("embudo", emb, ["orden", "etapa", "total", "fuente"]))

    estados_ev = ["Confirmado", "Probable", "Desconocido", "No aplica"]
    inv = []
    for r in D["inventario"]:
        s = str(r["estado_evidencia"])
        cat = next((e for e in estados_ev if s.startswith(e)), "Otro")
        inv.append(dict(r, estado_categoria=cat, estado_orden=estados_ev.index(cat) + 1 if cat in estados_ev else 9))
    tablas.append(escribir("inventario", inv, ["id", "fuente", "emisor", "desagregacion_geografica_maxima",
                                               "periodo_cubierto", "estado_evidencia", "estado_categoria", "estado_orden"]))

    kp = [dict(r, orden=i + 1) for i, r in enumerate(D["kpis"])]
    tablas.append(escribir("kpis_ficha", kp, ["orden", "dimension", "nombre", "definicion", "valor", "unidad",
                                              "universo", "precision", "evidencia", "fuente"]))

    # ---------- Necesidad: series por segmento (sección 12b)
    SERIE_TXT = {"carga_sinnec": "Dice «no tuve necesidad»",
                 "carga_dano": "Declara algún daño, entre quienes dicen «no tuve necesidad»",
                 "dano_horas": "Declara algún daño (todas)"}
    s2 = []
    orden_cat = {}
    for r in D["seg2"]:
        key = (r["serie"], r["categoria"])
        if key not in orden_cat:
            orden_cat[key] = len([k for k in orden_cat if k[0] == r["serie"]]) + 1
        s2.append(dict(r, seg_id=SEG_ID[(r["dimension"], r["segmento"])],
                       etiqueta=r["etiqueta"] or r["categoria"], cat_orden=orden_cat[key],
                       serie_txt=SERIE_TXT.get(r["serie"], r["serie"]),
                       precision=precision_txt(r["precision"]), n=r["n_muestra_dominio"]))
    tablas.append(escribir("seg_series", s2, ["seg_id", "dimension", "segmento", "serie", "serie_txt", "categoria", "etiqueta",
                                              "cat_orden", "pct", "cv", "li90", "ls90", "n", "total_expandido",
                                              "precision", "dif_significativa"]))

    CMPL = {"horas40": "Cuida 40 h o más", "dano": "Algún daño", "dano_sinnec": "Daño entre «sin necesidad»",
            "raz_necesidad": "«No tuve necesidad»", "raz_hogar": "«El hogar cuida»", "pref_casa": "Prefiere en casa",
            "pref_no": "No contrataría", "norma_familia": "La familia debe cuidar",
            "unas_horas": "Acepta «unas horas»", "no_residencia": "Rechaza residencia"}
    PEST = {"horas40": "necesidad", "dano": "necesidad", "dano_sinnec": "necesidad", "raz_necesidad": "necesidad",
            "raz_hogar": "barreras", "pref_casa": "barreras", "pref_no": "barreras", "norma_familia": "barreras",
            "unas_horas": "barreras", "no_residencia": "barreras"}
    s1 = []
    orden_ind = {}
    for r in D["seg"]:
        if r["clave"] not in orden_ind:
            orden_ind[r["clave"]] = len(orden_ind) + 1
        s1.append(dict(r, seg_id=SEG_ID[(r["dimension"], r["segmento"])], ind_orden=orden_ind[r["clave"]],
                       ind_corto=CMPL.get(r["clave"], r["indicador"]), comparar_en=PEST.get(r["clave"], ""),
                       precision=precision_txt(r["precision"]), n=r["n_muestra_dominio"]))
    tablas.append(escribir("seg_indicadores", s1, ["seg_id", "dimension", "segmento", "clave", "indicador", "ind_corto",
                                                   "comparar_en", "grupo", "ind_orden", "pct", "cv", "li90", "ls90", "n", "precision",
                                                   "dif_pp", "dif_li90", "dif_ls90", "dif_significativa"]))

    perf = []
    for i, r in enumerate(D["perfil"]):
        perf.append(dict(r, orden=i + 1, poblacion=("Grupo del problema" if r["poblacion"].startswith("Grupo")
                                                    else "Todas las cuidadoras"),
                         n=r["n_muestra_dominio"]))
    tablas.append(escribir("perfil_grupo", perf, ["dimension", "segmento", "poblacion", "orden", "pct", "cv", "li90",
                                                  "ls90", "n", "precision", "dif_pp", "dif_li90", "dif_ls90",
                                                  "dif_significativa"]))

    bs = []
    for i, r in enumerate(D["brecha_sexo"]):
        bs.append({"edad": r["edad"], "orden": i + 1, "sexo": "Hombres", "horas": r["h"], "razon_m_h": r["razon"]})
        bs.append({"edad": r["edad"], "orden": i + 1, "sexo": "Mujeres", "horas": r["m"], "razon_m_h": r["razon"]})
    tablas.append(escribir("brecha_sexo", bs, ["edad", "orden", "sexo", "horas", "razon_m_h"]))

    # ---------- Barreras
    raz = []
    for u, et in (("obj", "Cuidan discapacidad o 60+"), ("todas", "Todas las cuidadoras")):
        for i, r in enumerate(D["razones"][u]):
            raz.append(dict(r, universo=et, orden=i + 1, fuente=D["razones"]["fuente"]))
    tablas.append(escribir("razones", raz, ["universo", "etiqueta", "orden", "pct", "cv", "li90", "ls90",
                                            "total_expandido", "precision", "n", "fuente"]))

    qu = [dict(r, quintil_txt=f"Q{r['quintil']}") for r in D["quintil"]]
    tablas.append(escribir("contratacion_quintil", qu, ["quintil", "quintil_txt", "servicio", "pct", "cv", "n_si", "precision"]))

    od = []
    for k, et in (("mujeres", "Mujeres"), ("hombres", "Hombres"), ("pob", "Población 15 a 60 años"),
                  ("capacitaria", "Se capacitaría (entre quienes trabajarían)")):
        od.append(dict(D["oferta_declarada"][k], grupo=et, clave=k))
    tablas.append(escribir("oferta_declarada", od, ["clave", "grupo", "pct", "cv", "li90", "ls90", "total_expandido",
                                                    "precision", "n"]))

    # ---------- Costos (relevo)
    def corto(sal):
        return "Piso legal" if sal.startswith("Piso") else "Tabulador CACEH"

    ase = []
    for r in D["relevo"]["filas"]:
        for u in ("u10", "u20", "u30"):
            ase.append({"fuente_ingreso": "ENASIC · nacional", "fuente_orden": 1, "salario": r["salario"],
                        "salario_corto": corto(r["salario"]), "salario_hora_2026": r["salario_hora_2026"],
                        "paquete": r["paquete"], "horas": r["horas"], "costo_mensual_2026": r["costo_mensual_2026"],
                        "pct_ingreso_mediano": r["pct_ingreso_mediano"], "umbral": "≤ " + u[1:] + "% del ingreso",
                        "umbral_orden": int(u[1:]), "pct_hogares": r[u], "li90": None, "ls90": None,
                        "precision": "sin varianza", "n": r["n"], "fuente": D["relevo"]["fuente"]})
    for r in D["relevo_enigh"]["filas"]:
        for u in ("u10", "u20", "u30"):
            fu = "ENIGH · nacional" if r["dominio"] == "Nacional" else "ENIGH · CDMX"
            ase.append({"fuente_ingreso": fu, "fuente_orden": 2 if r["dominio"] == "Nacional" else 3,
                        "salario": r["salario"], "salario_corto": corto(r["salario"]),
                        "salario_hora_2026": r["salario_hora_2026"], "paquete": r["paquete"], "horas": r["horas"],
                        "costo_mensual_2026": r["costo_mensual_2026"], "pct_ingreso_mediano": r["pct_ingreso_mediano"],
                        "umbral": "≤ " + u[1:] + "% del ingreso", "umbral_orden": int(u[1:]), "pct_hogares": r[u],
                        "li90": r[u + "_li"], "ls90": r[u + "_ls"], "precision": r[u + "_prec"], "n": r["n"],
                        "fuente": D["relevo_enigh"]["fuente"]})
    for r in ase:
        r["paquete_corto"] = "Jornada 40 h" if r["horas"] == 40 else f"{r['horas']} h/sem"
    tablas.append(escribir("asequibilidad", ase, ["fuente_ingreso", "fuente_orden", "salario", "salario_corto",
                                                  "salario_hora_2026", "paquete", "paquete_corto", "horas",
                                                  "costo_mensual_2026", "pct_ingreso_mediano", "umbral",
                                                  "umbral_orden", "pct_hogares", "li90", "ls90", "precision", "n",
                                                  "fuente"]))

    pago = []
    for i, k in enumerate(("cuidadora", "enfermeria", "domestica")):
        pago.append(dict(D["pago"][k], orden=i + 1, fuente=D["pago"]["fuente"]))
    tablas.append(escribir("pago_hora", pago, ["orden", "servicio", "n", "p25", "mediana", "p75", "mediana_ponderada",
                                               "horas_sem_mediana", "fuente"]))

    CARGA = {1: "Sin carga", 2: "+ IMSS e Infonavit (22%)", 3: "+ aguinaldo y vacaciones"}
    cj = []
    for r in D["sostenibilidad"]["costo"]:
        cj.append(dict(r, carga_txt=CARGA.get(r["carga"], str(r["carga"])), horas_txt=f"{r['horas']} h/sem",
                       fuente=D["sostenibilidad"]["fuente"]))
    tablas.append(escribir("costo_jornada", cj, ["jornada", "horas", "horas_txt", "carga", "carga_txt", "carga_pct",
                                                 "costo_mensual", "fuente"]))

    fin = []
    orden_esc = {r["escenario"]: i + 1 for i, r in enumerate(D["sostenibilidad"]["escala"])}
    for r in D["sostenibilidad"]["financiamiento"]:
        fin.append(dict(r, escenario_orden=orden_esc.get(r["escenario"], 9),
                        opex_txt=("Operación $0" if r["opex"] == 0 else f"Operación ${int(r['opex']):,} por hogar-mes"),
                        solicitud_mdp=D["sostenibilidad"]["solicitud_mdp"], fuente=D["sostenibilidad"]["fuente"]))
    tablas.append(escribir("financiamiento", fin, ["escenario", "escenario_orden", "opex", "opex_txt", "mdp",
                                                   "pct_solicitud", "solicitud_mdp", "fuente"]))
    esc = [dict(r, escenario_orden=i + 1) for i, r in enumerate(D["sostenibilidad"]["escala"])]
    tablas.append(escribir("escala_subsidio", esc, ["escenario", "escenario_orden", "aceptacion", "hogares",
                                                    "costo_mdp", "sub_mdp", "pct_solicitud"]))

    # ---------- Focalización
    obj = [{"objetivo": k, "objetivo_txt": v, "orden": i + 1} for i, (k, v) in enumerate(OBJETIVOS.items())]
    tablas.append(escribir("objetivos", obj, ["objetivo", "objetivo_txt", "orden"]))

    glob = []
    for r in D["modelo"]["global"] + D["modelo"]["sensibilidad"]:
        glob.append(dict(r))
    tablas.append(escribir("modelo_global", glob, ["objetivo", "puntaje", "auc_ponderado", "tasa_seleccion",
                                                   "precision", "cobertura", "cobertura_li90", "cobertura_ls90",
                                                   "dif_cobertura_vs_regla", "dif_li90", "dif_ls90",
                                                   "n_seleccionados_muestra"]))

    gr = []
    for r in D["modelo"]["grupos"]:
        gr.append(dict(r, dimension_txt=DIM_MODELO.get(r["dimension"], r["dimension"]),
                       grupo_txt=ETIQ_GRUPO_MODELO.get(r["grupo"], r["grupo"]),
                       grupo_orden=ORDEN_GRUPO_MODELO.index(r["grupo"]) + 1 if r["grupo"] in ORDEN_GRUPO_MODELO else 99,
                       metodo=("Regla 40 h o más" if r["puntaje"].startswith("Regla") else "Modelo"),
                       pocos_casos=("Sí" if r["n_con_dano"] < 200 else "No")))
    # La gráfica compara regla contra un modelo a la vez: duplicamos la regla para cada modelo.
    gr2 = []
    for r in gr:
        if r["metodo"] == "Modelo":
            gr2.append(dict(r, modelo=r["puntaje"]))
        else:
            for m in ("Regresión logística", "Gradient boosting"):
                gr2.append(dict(r, modelo=m))
    tablas.append(escribir("modelo_grupos", gr2, ["objetivo", "modelo", "dimension", "dimension_txt", "grupo",
                                                  "grupo_txt", "grupo_orden", "puntaje", "metodo", "cobertura",
                                                  "cob_li90", "cob_ls90", "precision", "n_grupo", "n_con_dano",
                                                  "pocos_casos"]))

    coef = [dict(r, variable_txt=VARIABLES.get(r["variable"], r["variable"]),
                 sentido=("Más probabilidad de declarar daño" if r["coef"] > 0 else "Menos probabilidad"))
            for r in D["modelo"]["coef"]]
    tablas.append(escribir("modelo_coeficientes", coef, ["variable", "variable_txt", "coef", "sentido"]))

    M2 = D["modelo2"]
    elegidos = {"Regresión logística", "Gradient boosting"}
    alt = []
    for r in M2["alternativas"]:
        tipo = ("Elegido" if r["puntaje"] in elegidos else
                "Horas como puntaje" if r["puntaje"] in ("Regla >= 40 h", "Horas (continuo)") else "Alternativa")
        alt.append(dict(r, tipo=tipo))
    tablas.append(escribir("modelo_alternativas", alt, ["objetivo", "puntaje", "tipo", "auc_ponderado",
                                                        "brier_ponderado", "brier_referencia", "precision",
                                                        "cobertura", "cob_li90", "cob_ls90",
                                                        "dif_cobertura_vs_regla", "dif_li90", "dif_ls90",
                                                        "admite_pesos", "interpretable"]))
    ETQ_CURVA = {"Horas (continuo)": "Las horas más altas"}
    cur = [dict(r, serie=ETQ_CURVA.get(r["puntaje"], r["puntaje"])) for r in M2["curvas"]]
    # Referencia al azar: cobertura = % seleccionado.
    for o in OBJETIVOS:
        for p in range(0, 101, 5):
            cur.append({"objetivo": o, "puntaje": "Al azar", "serie": "Al azar", "pct_seleccion": float(p),
                        "cobertura": float(p)})
    tablas.append(escribir("modelo_curvas", cur, ["objetivo", "puntaje", "serie", "pct_seleccion", "cobertura"]))
    tablas.append(escribir("modelo_calibracion", M2["calibracion"], ["objetivo", "puntaje", "decil", "predicho",
                                                                     "observado", "obs_li90", "obs_ls90", "n"]))
    imp = [dict(r, variable_txt=VARIABLES.get(r["variable"], r["variable"]), caida_auc_cent=r["caida_auc"] * 100)
           for r in M2["importancia"]]
    tablas.append(escribir("modelo_importancia", imp, ["objetivo", "puntaje", "variable", "variable_txt",
                                                       "caida_auc", "caida_auc_cent", "de"]))
    tablas.append(escribir("modelo_cupo", M2["cupo"], ["objetivo", "cupo", "puntaje", "cobertura", "precision",
                                                       "dif_vs_horas", "dif_li90", "dif_ls90", "horas_corte"]))
    ph = [dict(r, orden=i % 4 + 1, objetivo_txt=OBJETIVOS.get(r["objetivo"], r["objetivo"])) for i, r in enumerate(M2["por_horas"])]
    tablas.append(escribir("modelo_por_horas", ph, ["objetivo", "objetivo_txt", "horas", "orden", "prevalencia", "li90", "ls90", "n",
                                                    "n_con_dano"]))
    pg = []
    base = {}
    for r in M2["por_grupo"]:
        if r["puntaje"].startswith("Regla"):
            base[(r["objetivo"], r["dimension"], r["grupo"])] = r["cobertura"]
    for r in M2["por_grupo"]:
        if not r["puntaje"].startswith("Regla"):
            b = base.get((r["objetivo"], r["dimension"], r["grupo"]))
            pg.append(dict(r, objetivo_txt=OBJETIVOS.get(r["objetivo"], r["objetivo"]), grupo_txt=ETIQ_GRUPO_MODELO.get(r["grupo"], r["grupo"]),
                           grupo_orden=ORDEN_GRUPO_MODELO.index(r["grupo"]) + 1 if r["grupo"] in ORDEN_GRUPO_MODELO else 99,
                           dif_vs_regla_pp=(r["cobertura"] - b) if b is not None else None,
                           pocos_casos=("Sí" if r["n_con_dano"] < 100 else "No")))
    tablas.append(escribir("modelo_obj_grupo", pg, ["objetivo", "objetivo_txt", "dimension", "grupo", "grupo_txt", "grupo_orden",
                                                    "puntaje", "cobertura", "dif_vs_regla_pp", "n_grupo",
                                                    "n_con_dano", "pocos_casos"]))
    dec = [dict(r, orden=i + 1) for i, r in enumerate(M2["decision"])]
    tablas.append(escribir("modelo_decision", dec, ["orden", "criterio", "tipo", "algun_dano", "salud_fisica", "favorece"]))
    tablas.append(escribir("modelo_resumen", M2["resumen"], ["objetivo", "prevalencia", "prev_li90", "prev_ls90",
                                                             "personas_estimadas", "n_muestra", "prev_40mas",
                                                             "prev_menos40", "razon_40", "peor_grupo", "peor_cambio",
                                                             "n_min_grupo", "cob_regla"]))

    # ---------- Territorio CDMX
    T = D["territorio"]
    alc = []
    for nombre, a in T["alcaldias"].items():
        alc.append(dict(a, alcaldia=nombre, pct_asilos=(100 * a["asilos"] / T["totales"]["asilos"]),
                        pct_centros=(100 * a["centros_dia"] / T["totales"]["centros_dia"])))
    cols_alc = ["alcaldia", "abr", "asilos", "centros_dia", "pct_pob60", "idx_asilos", "idx_centros", "ql_plazas",
                "plazas", "dep_total", "dep_pct", "pob65_pct", "pob65_n", "rez_pct", "rez_nageb", "sds_pct",
                "sds_p10", "sds_p90", "pob_ageb", "pct_asilos", "pct_centros"]
    tablas.append(escribir("alcaldias", alc, cols_alc))

    IND_ALC = [
        ("idx_asilos", "Asilos frente a población de 60+ (índice, 1 = proporcional)", "idx", "asilos"),
        ("idx_centros", "Centros de día frente a población de 60+ (índice)", "idx", "centros_dia"),
        ("ql_plazas", "Plazas en residencias privadas (cociente de localización)", "ql", "plazas"),
        ("dep_pct", "Personas con dependencia severa (% de la CDMX)", "dep", "dep_total"),
        ("pob65_pct", "Pobreza en población de 65 y más, 2020 (%)", "pob", "pob65_n"),
        ("rez_pct", "Población en AGEB con rezago social medio o mayor, 2020 (%)", "rez", "rez_nageb"),
        ("sds_pct", "Población sin derechohabiencia a servicios de salud, 2020 (%)", "rez", "pob_ageb"),
    ]
    larga = []
    for i, (k, t, f, c) in enumerate(IND_ALC):
        for a in alc:
            larga.append({"alcaldia": a["alcaldia"], "indicador_clave": k, "indicador": t, "indicador_orden": i + 1,
                          "valor": a.get(k), "conteo": a.get(c), "pct_pob60": a["pct_pob60"],
                          "fuente": T["fuentes"].get(f, "")})
    tablas.append(escribir("alcaldias_indicadores", larga, ["alcaldia", "indicador_clave", "indicador",
                                                            "indicador_orden", "valor", "conteo", "pct_pob60",
                                                            "fuente"]))

    dim = [dict(r, orden=i + 1, fuente=D["dimension_fuente"]) for i, r in enumerate(D["dimension_cdmx"])]
    tablas.append(escribir("dimension_cdmx", dim, ["orden", "nivel", "valor", "metodo", "evidencia", "sesgo", "fuente"]))

    nc = D["relevo_enigh"]["necesidad_cdmx_det"]
    tablas.append(escribir("necesidad_cdmx", [dict(nc, fuente=D["relevo_enigh"]["fuente"])],
                           ["pct", "li90", "ls90", "cv", "total", "fuente"]))

    E = D["estados"]
    est = []
    claves_e = ["pobreza60", "segsoc60", "salud60", "sola60", "hog60", "pct_pob60"]
    for cve, e in E["entidades"].items():
        for i, k in enumerate(claves_e):
            v = e.get(k) or {}
            est.append({"cve_ent": int(cve), "entidad": e["nombre"], "indicador_clave": k,
                        "indicador": E["definiciones"].get(k, k), "indicador_orden": i + 1, "valor": v.get("v"),
                        "li90": v.get("li"), "ls90": v.get("ls"), "cv": v.get("cv"), "n": v.get("n"),
                        "precision": v.get("prec"), "nacional": E["nacional"].get(k, {}).get("v"),
                        "es_cdmx": "Sí" if e["nombre"] == "Ciudad de México" else "No",
                        "marginacion_grado": (e.get("im") or {}).get("grado")})
    tablas.append(escribir("estados", est, ["cve_ent", "entidad", "indicador_clave", "indicador", "indicador_orden",
                                            "valor", "li90", "ls90", "cv", "n", "precision", "nacional", "es_cdmx",
                                            "marginacion_grado"]))

    TP = D["tipologia"]
    nombres_tipo = {t["tipo"]: t["nombre"] for t in TP["tipos"]}
    tipos = []
    dec_t = {r["tipo"]: r for r in TP["decision"]}
    for t in TP["tipos"]:
        r = dict(t)
        r.update({k: v for k, v in dec_t.get(t["tipo"], {}).items() if k != "tipo"})
        r["tipo_txt"] = f"{t['tipo']} · {t['nombre']}"
        tipos.append(r)
    tablas.append(escribir("tipologia_tipos", tipos, ["tipo", "nombre", "tipo_txt", "n_ageb", "poblacion",
                                                      "pct_pob_cdmx", "n_60", "pct_de_las_60", "pct_60", "n_disc",
                                                      "pct_sinder", "pct_viv_sin_int", "viviendas",
                                                      "viviendas_sin_internet", "dist_mediana_km",
                                                      "pct_60_a_mas_de_1km", "ageb_brecha", "n_60_brecha"]))
    cam = TP["campos_ageb"]
    ageb = []
    for fila in TP["ageb"]:
        r = dict(zip(cam, fila))
        r["tipo_txt"] = f"{r['tipo']} · {nombres_tipo.get(r['tipo'], '')}"
        ageb.append(r)
    tablas.append(escribir("ageb_tipologia", ageb, cam + ["tipo_txt"]))
    pa = []
    for r in TP["por_alcaldia"]:
        for i, p in enumerate(r["pct_tipo"]):
            pa.append({"alcaldia": r["alcaldia"], "tipo": i + 1, "tipo_txt": f"{i + 1} · {nombres_tipo.get(i + 1, '')}",
                       "pct_ageb": p, "ageb_brecha": r["ageb_brecha"], "n_60_brecha": r["n_60_brecha"]})
    tablas.append(escribir("tipologia_alcaldia", pa, ["alcaldia", "tipo", "tipo_txt", "pct_ageb", "ageb_brecha",
                                                      "n_60_brecha"]))
    br = [{"alcaldia": r["alcaldia"], "ageb_brecha": r["ageb_brecha"], "n_60_brecha": r["n_60_brecha"]}
          for r in TP["por_alcaldia"]]
    tablas.append(escribir("brecha_alcaldia", br, ["alcaldia", "ageb_brecha", "n_60_brecha"]))
    tablas.append(escribir("tipologia_k", TP["seleccion_k"], ["k", "inercia", "silueta", "silueta_nula_media",
                                                              "silueta_nula_p95", "calinski_harabasz",
                                                              "davies_bouldin", "ari_promedio", "ari_min",
                                                              "tamano_menor", "estable", "supera_nula"]))
    tablas.append(escribir("tipologia_robustez", [dict(r, orden=i + 1) for i, r in enumerate(TP["robustez"])],
                           ["orden", "variante", "ari"]))
    tablas.append(escribir("tipologia_comparacion", TP["comparacion"], ["particion", "grupos", "r2_9_variables",
                                                                         "ari_promedio", "ari_min",
                                                                         "cramer_v_rezago_coneval",
                                                                         "eta2_pct_limitacion",
                                                                         "eta2_log_distancia_oferta",
                                                                         "vecinos_mismo_grupo"]))

    with open(os.path.join(DESTINO, "_LEEME.txt"), "w", encoding="utf-8") as f:
        f.write("Generado por PowerBI/exportar_datos_pbi.py a partir de "
                "Frontend/observatorio/datos_observatorio.json (actualizado: %s).\n"
                "No editar a mano: volver a correr el script.\n" % D.get("actualizado"))
    print(f"{len(tablas)} tablas en {DESTINO}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
