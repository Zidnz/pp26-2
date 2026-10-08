"""
ETOE 2020 (INEGI) — Cuidados como barrera de entrada al mercado laboral
=======================================================================
Pregunta: entre la Poblacion No Economicamente Activa (PNEA) de 15 anios y mas,
que proporcion declara NO buscar trabajo porque "no tiene quien le cuide a sus
hijos pequenios, ancianos o enfermos" (COE1, P2G2 = 09)?

Fuente : ETOE 2020, microdatos reponderados con el marco muestral del CPV 2020
         (archivos *_cpv2020). Meses: abril, mayo y junio de 2020.
Diseno : estratificado bietapico. Estrato = EST_D, UPM = UPM (abril, mayo) /
         NUPM (junio), ponderador = FAC_NP (reponderado al CPV 2020).  Metodo de conglomerados ultimos
         (linealizacion de Taylor).

ADVERTENCIAS DE ALCANCE (no borrar al reutilizar este codigo)
-------------------------------------------------------------
1. La ETOE es una encuesta TELEFONICA levantada como sustituto de la ENOE,
   suspendida por la pandemia. Los hogares sin telefono quedan fuera del marco:
   hay sesgo de cobertura hacia hogares urbanos y de mayor ingreso.
2. INEGI declara que la ETOE NO es comparable con la serie ENOE.
3. Son tres meses de 2020, en pleno confinamiento. Los resultados describen un
   shock, no una linea base ni una tendencia. No se puede inferir
   estacionalidad ni evolucion con tres observaciones mensuales.
4. Cobertura nacional. NO admite desagregacion por entidad ni por alcaldia.
5. P2G2 solo se pregunta cuando P2G1 == 1 (existe una razon adicional a la
   declarada en P2E). Quienes no llegan a esa pregunta se cuentan como 0 en el
   numerador, nunca como faltantes: el estimador es "% de la PNEA que declara
   esta razon", no "% de quienes contestaron P2G2".

Salida: etoe_cuidados_resultados.csv
"""

import pandas as pd
from dbfread import DBF
import numpy as np

# --- 1. Rutas de los archivos cpv2020 -------------------------------------
MESES = {
    "2020-04": {
        "sdem": "abril/SDEMT0420.DBF",
        "coe1": "abril/COE1T0420.DBF",
        "upm": "UPM",          # abril: la UPM vive en el campo UPM
    },
    "2020-05": {
        "sdem": "mayo/etoe_2020_mayo_cpv2020_dbf/SDEMT0520.DBF",
        "coe1": "mayo/etoe_2020_mayo_cpv2020_dbf/COE1T0520.DBF",
        "upm": "UPM",
    },
    "2020-06": {
        "sdem": "junio/sdemn0620.dbf",
        "coe1": "junio/coe1n0620.dbf",
        "upm": "NUPM",         # junio: INEGI cambia la UPM al campo NUPM
    },
}

# Llave de persona: identifica de forma unica al integrante del hogar.
LLAVE = ["CD_A", "ENT", "CON", "D_SEM", "N_PRO_VIV", "V_SEL",
         "N_HOG", "H_MUD", "N_ENT", "PER", "N_REN"]


def leer(path, campos):
    """Lee un DBF y devuelve solo las columnas pedidas, como texto limpio."""
    df = pd.DataFrame(iter(DBF(path, encoding="latin-1")))
    df = df[campos].copy()
    for c in df.columns:
        if df[c].dtype == object:
            df[c] = df[c].astype(str).str.strip()
    return df


def proporcion_taylor(y, w, stratum, psu):
    """Proporcion ponderada y su error estandar bajo diseno complejo.

    Estimador de razon p = sum(w*y)/sum(w). La varianza se obtiene por
    linealizacion de Taylor con el metodo de conglomerados ultimos:

        u_i        = w_i (y_i - p) / sum(w)
        u_(h,k)    = suma de u_i dentro de la UPM k del estrato h
        Var(p)     = sum_h  n_h/(n_h-1) * sum_k (u_(h,k) - media_h)^2

    Es el mismo estimador que svydesign()/svymean() del paquete survey de R
    con id=~UPM, strata=~EST_D, weights=~FAC_NP, nest=TRUE.
    """
    d = pd.DataFrame({"y": np.asarray(y, dtype=float),
                      "w": np.asarray(w, dtype=float),
                      "h": np.asarray(stratum),
                      "k": np.asarray(psu)}).dropna()
    W = d.w.sum()
    p = (d.w * d.y).sum() / W
    d["u"] = d.w * (d.y - p) / W

    por_upm = d.groupby(["h", "k"], sort=False)["u"].sum().reset_index()
    var = 0.0
    for h, gh in por_upm.groupby("h", sort=False):
        n_h = len(gh)
        if n_h < 2:                      # no estimable: ya colapsado arriba
            continue
        var += n_h / (n_h - 1) * ((gh.u - gh.u.mean()) ** 2).sum()
    return p, float(np.sqrt(var))


def colapsa_singletons(g, upm_col):
    """Une en un unico estrato los estratos que quedan con una sola UPM.

    Al restringir la muestra a la PNEA de un solo sexo, algunos estratos de
    diseno se quedan con una UPM y la varianza no es estimable. La practica
    estandar es colapsarlos entre si (equivalente a lonely.psu = "adjust" /
    combinacion de estratos). Afecta a muy pocos casos y es conservador.
    """
    g = g.copy()
    n_upm = g.groupby("EST_D")[upm_col].nunique()
    solos = n_upm[n_upm < 2].index
    if len(solos):
        g.loc[g.EST_D.isin(solos), "EST_D"] = -1
    return g, list(solos)


filas = []

for periodo, cfg in MESES.items():
    upm_col = cfg["upm"]

    sdem = leer(cfg["sdem"],
                LLAVE + ["R_DEF", "C_RES", "SEX", "EDA", "CLASE1",
                         "EST_D", upm_col, "FAC_NP"])
    coe1 = leer(cfg["coe1"], LLAVE + ["P2E", "P2G1", "P2G2"])

    df = sdem.merge(coe1, on=LLAVE, how="left", validate="one_to_one")

    # EDA es CARACTER en el DBF: convertir antes de filtrar por edad.
    df["EDA"] = pd.to_numeric(df["EDA"], errors="coerce")
    df["FAC_NP"] = pd.to_numeric(df["FAC_NP"], errors="coerce")
    df["CLASE1"] = pd.to_numeric(df["CLASE1"], errors="coerce")

    # samplics exige tipos homogeneos: recodificar estrato y UPM a enteros.
    df["EST_D"] = pd.factorize(df["EST_D"].astype(str).str.strip())[0]
    df[upm_col] = pd.factorize(df[upm_col].astype(str).str.strip())[0]

    # Universo oficial de las variables precodificadas.
    u = df[(df.R_DEF == "00")
           & (df.C_RES.isin(["1", "3"]))
           & (df.EDA.between(15, 98))].copy()

    # PNEA = CLASE1 == 2
    pnea = u[u.CLASE1 == 2].copy()

    # Indicadores (0/1 sobre toda la PNEA, los blancos cuentan como 0)
    pnea["sin_cuidados"] = (pnea.P2G2 == "09").astype(int)
    pnea["no_lo_deja_familiar"] = (pnea.P2G2 == "10").astype(int)
    pnea["quehaceres_hogar"] = (pnea.P2E == "4").astype(int)

    for sexo, etiq in [("1", "Hombres"), ("2", "Mujeres")]:
        g, colapsados = colapsa_singletons(pnea[pnea.SEX == sexo], upm_col)
        for var in ["sin_cuidados", "no_lo_deja_familiar", "quehaceres_hogar"]:
            p_hat, se_hat = proporcion_taylor(
                g[var], g["FAC_NP"], g["EST_D"], g[upm_col])
            p, se = p_hat * 100, se_hat * 100
            filas.append({
                "periodo": periodo,
                "sexo": etiq,
                "indicador": var,
                "pct": round(p, 2),
                "ee_pp": round(se, 2),
                "cv_pct": round(100 * se / p, 1) if p else None,
                "ic95_inf": round(p - 1.96 * se, 2),
                "ic95_sup": round(p + 1.96 * se, 2),
                "n_muestra_pnea": len(g),
                "pnea_expandida": int(g["FAC_NP"].sum()),
                "estratos_colapsados": len(colapsados),
                # Convencion de INEGI para difusion: CV <= 15% precision
                # aceptable; 15-25% baja precision; > 25% no publicable.
                "precision": ("aceptable" if p and 100 * se / p <= 15
                              else "baja" if p and 100 * se / p <= 25
                              else "no publicable"),
            })

res = pd.DataFrame(filas)
res.to_csv("etoe_cuidados_resultados.csv", index=False)
print(res.to_string(index=False))
