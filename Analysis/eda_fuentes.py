"""EDA de las fuentes en Data/investigacion (economía del cuidado, CDMX).

Uso (desde la raíz del repo):
    python Analysis/eda_fuentes.py

Salidas en Analysis/resultados/: tablas CSV, figuras PNG y perfil_calidad.csv.
Todo número que se cite debe poder rastrearse a estos archivos.

Nota de estado de las afirmaciones (confirmada / probable / desconocida):
las unidades de varias columnas (p. ej. PORCENTAJE, valor) no están
documentadas en los CSV; aquí se reportan tal cual y se marcan como
"unidad por confirmar" hasta validar contra la fuente (ENASIC 2022, INEGI).
"""
import unicodedata
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "Data" / "investigacion"
SALIDA = Path(__file__).resolve().parent / "resultados"
SALIDA.mkdir(exist_ok=True)


# Variantes de nombre detectadas entre fuentes (p. ej. "Cuajimalpa" vs "Cuajimalpa de Morelos").
ALIAS = {"CUAJIMALPA": "CUAJIMALPA DE MORELOS"}


def leer(nombre: str) -> pd.DataFrame:
    df = pd.read_csv(DATOS / nombre, encoding="utf-8-sig")
    df.columns = df.columns.str.strip()
    return df


def normalizar(texto: str) -> str:
    """Mayúsculas sin acentos, para empatar nombres de alcaldía entre fuentes."""
    s = unicodedata.normalize("NFKD", str(texto)).encode("ascii", "ignore").decode()
    s = " ".join(s.upper().replace(".", "").split())
    return ALIAS.get(s, s)


def guardar(df: pd.DataFrame, nombre: str) -> None:
    df.to_csv(SALIDA / nombre, index=False, encoding="utf-8")
    print(f"\n--- {nombre} ---\n{df.to_string(index=False)}")


def figura(nombre: str) -> None:
    plt.tight_layout()
    plt.savefig(SALIDA / nombre, dpi=150)
    plt.close()


# ---------------------------------------------------------------- 1. calidad
def perfil_calidad() -> None:
    filas = []
    for ruta in sorted(DATOS.glob("*.csv")):
        df = leer(ruta.name)
        for col in df.columns:
            s = df[col]
            filas.append(
                {
                    "archivo": ruta.name,
                    "columna": col,
                    "filas": len(df),
                    "dtype": str(s.dtype),
                    "nulos": int(s.isna().sum()),
                    "unicos": int(s.nunique()),
                    "duplicados_fila": int(df.duplicated().sum()),
                    "min": s.min() if pd.api.types.is_numeric_dtype(s) else "",
                    "max": s.max() if pd.api.types.is_numeric_dtype(s) else "",
                }
            )
    perfil = pd.DataFrame(filas)
    perfil.to_csv(SALIDA / "perfil_calidad.csv", index=False, encoding="utf-8")
    print(f"perfil_calidad.csv: {perfil['archivo'].nunique()} archivos, {len(perfil)} columnas")
    con_problemas = perfil[(perfil["nulos"] > 0) | (perfil["duplicados_fila"] > 0)]
    print("Columnas con nulos o archivos con filas duplicadas:")
    print(con_problemas[["archivo", "columna", "nulos", "duplicados_fila"]].to_string(index=False)
          if len(con_problemas) else "  ninguno")


# ------------------------------------------------- 2. horas laborales vs cuidado
def horas_cuidado() -> None:
    df = leer("Horas laborales y de cuidado..csv")
    df["Horas"] = pd.to_numeric(df["Horas"], errors="coerce")
    ancha = df.pivot_table(index=["Sexo", "Edad"], columns="Tipo de trabajo", values="Horas").reset_index()
    ancha["Total"] = ancha[["Cuidado", "Laboral"]].sum(axis=1, min_count=2)
    guardar(ancha, "horas_cuidado_laboral.csv")

    # Brecha mujeres - hombres por grupo de edad (solo grupos presentes en ambos)
    h = df.pivot_table(index=["Edad", "Tipo de trabajo"], columns="Sexo", values="Horas").dropna().reset_index()
    h["brecha_M_menos_H"] = h["Mujeres"] - h["Hombres"]
    guardar(h.round(1), "brecha_horas_por_sexo.csv")

    fig, ejes = plt.subplots(1, 2, figsize=(11, 4), sharey=True)
    for eje, tipo in zip(ejes, ["Cuidado", "Laboral"]):
        p = df[df["Tipo de trabajo"] == tipo].pivot_table(index="Edad", columns="Sexo", values="Horas")
        p.plot(kind="bar", ax=eje, title=f"Horas de trabajo {tipo.lower()}")
        eje.set_xlabel("Grupo de edad")
    ejes[0].set_ylabel("Horas")
    figura("horas_cuidado_laboral.png")


# ------------------------------------------------------ 3. gasto en cuidados
def gasto_cuidados() -> None:
    df = leer("Promedio del gasto en cuidados privados.csv")
    df = df.sort_values("gasto_promedio", ascending=False)
    guardar(df.round(1), "gasto_cuidados_privados.csv")
    ax = df.plot(kind="barh", x="tipo_gasto", y="gasto_promedio", legend=False, figsize=(8, 3.5))
    ax.set_xlabel("Gasto promedio (unidad por confirmar)")
    ax.invert_yaxis()
    figura("gasto_cuidados_privados.png")


# ---------------------------------------------------------- 4. seguridad social
def seguridad_social() -> None:
    df = leer("Personas con Seguridad Social.csv")
    df["sexo"] = df["sexo"].str.strip().str.capitalize()  # "hombres" vs "Hombres"
    resumen = (
        df.groupby(["tipo de seguro", "sexo"])["valor"]
        .agg(media="mean", maximo="max", n="count")
        .round(2)
        .reset_index()
    )
    guardar(resumen, "seguridad_social_resumen.csv")
    p = df.pivot_table(index="Edad", columns="tipo de seguro", values="valor", aggfunc="mean")
    p = p.loc[sorted(p.index, key=lambda e: int(str(e).split("-")[0].split("+")[0].split()[0]))]
    p.plot(figsize=(9, 4), marker="o", title="Cobertura por grupo de edad (media de ambos sexos; unidad por confirmar)")
    figura("seguridad_social_por_edad.png")


# ------------------------------------------------------ 5. población 60+ y discapacidad
def adultos_mayores() -> None:
    pob = leer("Población de más de 60 años.csv")
    pob = pob[pob["NOM_MUN"] != "Ciudad de México"]  # fila agregada, no es una alcaldía
    por_mun = (
        pob.groupby("NOM_MUN")["PORCENTAJE"].agg(suma="sum", n_grupos="count").sort_values("suma", ascending=False)
        .round(3).reset_index()
    )
    guardar(por_mun, "poblacion_60mas_por_alcaldia.csv")

    disc = leer("Población de adultos y adultas mayores por tipo de discapacidad.csv")
    tipo = disc.groupby(["tipo_discapacidad", "sexo"])["total"].sum().unstack().fillna(0).astype(int)
    tipo["total"] = tipo.sum(axis=1)
    guardar(tipo.sort_values("total", ascending=False).reset_index(), "discapacidad_60mas_por_tipo.csv")

    ayuda = leer("Población con discapacidad que necesita ayuda para las actividades de la vida diaria.csv")
    cdmx = ayuda[ayuda["alcaldia"] == "CDMX"].sort_values("total", ascending=False)
    guardar(cdmx, "ayuda_avd_cdmx.csv")


# ------------------------------------------------------------- 6. oferta de servicios
def oferta_por_alcaldia() -> None:
    res = leer("Capacidad disponible en residencias permanentes de sector privado para adultos y adultas mayores.csv")
    res["alcaldia_norm"] = res["Alcaldia"].map(normalizar)
    dia = leer("Centros de día para adultos y adultas mayores del sector público.csv")
    dia["alcaldia_norm"] = dia["Municipio"].map(normalizar)

    centros = dia.groupby("alcaldia_norm")["Numero_instituciones"].sum().rename("centros_dia_publicos")
    camas = res.groupby("alcaldia_norm")["Capacidad_total"].sum().rename("capacidad_residencias_privadas")
    oferta = pd.concat([centros, camas], axis=1).fillna(0).astype(int).reset_index()
    oferta = oferta.sort_values("capacidad_residencias_privadas", ascending=False)
    guardar(oferta, "oferta_por_alcaldia.csv")

    sin_cobertura = oferta[(oferta["centros_dia_publicos"] == 0) | (oferta["capacidad_residencias_privadas"] == 0)]
    print(f"\nAlcaldías presentes en solo una de las dos fuentes: {len(sin_cobertura)} "
          "(revisar si es ausencia real o falta de cobertura de la fuente)")

    ax = oferta.set_index("alcaldia_norm")[["capacidad_residencias_privadas", "centros_dia_publicos"]].plot(
        kind="bar", subplots=True, figsize=(10, 6), legend=False)
    ax[1].set_xlabel("Alcaldía")
    figura("oferta_por_alcaldia.png")


# ------------------------------------------------------------ 7. guarderías
def razones_guarderias() -> None:
    df = leer("Razón por la que no se usan las guarderías.csv")
    p = df.pivot_table(index="por_que_no_usa_servicios", columns="sexo", values="porcentaje", aggfunc="mean").round(2)
    guardar(p.sort_values("Mujeres", ascending=False).reset_index(), "razones_no_guarderia.csv")

    ayudas = leer("Tiempo promedio en ayudas no pagadas a otros hogares.csv")
    a = ayudas.pivot_table(index="grupo_edad", columns="sexo", values="total_horas", aggfunc="sum")
    guardar(a.reset_index(), "ayudas_no_pagadas_por_edad.csv")


if __name__ == "__main__":
    perfil_calidad()
    horas_cuidado()
    gasto_cuidados()
    seguridad_social()
    adultos_mayores()
    oferta_por_alcaldia()
    razones_guarderias()
    print(f"\nListo. Resultados en {SALIDA}")
