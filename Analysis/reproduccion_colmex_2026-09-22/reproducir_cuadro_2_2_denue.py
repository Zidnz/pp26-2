"""
Reproduce el Cuadro 2.2 de CESA-CDMX / CEDUA-Colmex (2026), "Economía del cuidado":
unidades económicas y personal ocupado para servicios de cuidado por alcaldía (DENUE 05/2025).

Uso (desde Analysis/):
    python reproduccion_colmex_2026-09-22/reproducir_cuadro_2_2_denue.py ../denue_09_0525_csv.zip

Entrada: ZIP oficial de INEGI (DENUE CDMX, CSV). Solo se leen 5 columnas; no se
guardan datos de contacto ni nombres de establecimientos.

Prueba:
1. Si los 24 códigos SCIAN del Cuadro 2.1 de Colmex reproducen el conteo de unidades.
2. Qué regla convierte el estrato per_ocu en "personal estimado". El documento no la
   declara; se identificó por mínimos cuadrados (error 0 en las 48 celdas):
   0-5 -> 3, 6-10 -> 8, 11-30 -> 20, 31-50 -> 40, 51-100 -> 75, 101-250 -> 175.
   Se imprimen también límite inferior, punto medio y superior como referencia.
3. Sensibilidad: cómo cambia el indicador viviendas/ocupado de adultos mayores si se
   reclasifican los centros de día (624121/2) y se excluyen refugios y emergencias.
"""
import re, sys, zipfile
from pathlib import Path
import pandas as pd

AQUI = Path(__file__).resolve().parent
REF = AQUI / "colmex_cuadros_2_2_a_2_4_por_alcaldia.csv"
OUT = AQUI / "resultado_reproduccion_cuadro_2_2.csv"

GRUPOS = {
    "infantil": [611111, 611112, 623991, 623992, 624411, 624412],
    "adulta_mayor": [623111, 623112, 623311, 623312, 624211, 624212, 624221, 624222, 624231, 624232],
    "discapacidad": [611181, 611182, 623211, 623212, 623221, 623222, 624121, 624122],
}
COD2GRUPO = {c: g for g, cs in GRUPOS.items() for c in cs}
REGLA_COLMEX = {"0 a 5 personas": 3, "6 a 10 personas": 8, "11 a 30 personas": 20,
                "31 a 50 personas": 40, "51 a 100 personas": 75, "101 a 250 personas": 175}
COLS = ["id", "codigo_act", "per_ocu", "cve_ent", "cve_mun"]

def leer(zip_path):
    with zipfile.ZipFile(zip_path) as z:
        n = [x for x in z.namelist() if x.startswith("conjunto_de_datos/") and x.endswith(".csv")][0]
        meta = z.read("metadatos/metadatos_denue.txt").decode("latin-1", "replace")
        with z.open(n) as f:
            df = pd.read_csv(f, encoding="latin-1", usecols=COLS, dtype=str)
    titulo = next((l for l in meta.splitlines() if l.startswith("Title")), "?")
    modif = next((l for l in meta.splitlines() if l.startswith("Modified")), "?")
    return df, titulo, modif

def limites(e):
    nums = [int(x) for x in re.findall(r"\d+", str(e))]
    return (nums[0], nums[1]) if len(nums) >= 2 else ((nums[0], nums[0]) if nums else (None, None))

def main():
    zip_path = Path(sys.argv[1])
    df, titulo, modif = leer(zip_path)
    print(titulo, "|", modif, "| registros:", len(df))
    df = df[df.cve_ent == "09"].copy()
    df["codigo_act"] = pd.to_numeric(df.codigo_act, errors="coerce")
    df = df[df.codigo_act.isin(COD2GRUPO)].copy()
    df["grupo"] = df.codigo_act.map(COD2GRUPO)
    df["cve_alcaldia"] = 9000 + df.cve_mun.astype(int)
    lim = df.per_ocu.apply(limites)
    df["p_inf"] = [a for a, b in lim]; df["p_sup"] = [b for a, b in lim]
    df["p_med"] = (df.p_inf + df.p_sup) / 2
    df["p_colmex"] = df.per_ocu.map(REGLA_COLMEX)
    if df.p_colmex.isna().any():
        print("AVISO: estratos sin regla:", df.loc[df.p_colmex.isna(), "per_ocu"].unique())
    print("\nEstratos per_ocu en los 24 códigos:\n", df.per_ocu.value_counts().to_string())

    g = df.groupby(["cve_alcaldia", "grupo"]).agg(unidades=("id", "count"), p_inf=("p_inf", "sum"),
                                                 p_med=("p_med", "sum"), p_sup=("p_sup", "sum"),
                                                 p_colmex=("p_colmex", "sum")).unstack("grupo")
    g.columns = [f"{a}_{b}" for a, b in g.columns]
    ref = pd.read_csv(REF).set_index("cve_alcaldia")
    comp = g.join(ref[["alcaldia"] + [c for c in ref.columns if c.startswith("denue25_")]])
    print("\n== Totales CDMX: reproducido vs Colmex ==")
    for k in GRUPOS:
        print(f"{k:13s} unidades {int(comp[f'unidades_{k}'].sum()):>5} vs {ref[f'denue25_unidades_{k}'].sum():>5} | "
              f"personal inf {comp[f'p_inf_{k}'].sum():>7.0f} med {comp[f'p_med_{k}'].sum():>8.1f} "
              f"sup {comp[f'p_sup_{k}'].sum():>7.0f} vs Colmex {ref[f'denue25_personal_{k}'].sum():>6}")
    print("\n== Regla Colmex (3/8/20/40/75/175) por celda alcaldía x grupo ==")
    exactas = 0
    for k in GRUPOS:
        exactas += int((comp[f"p_colmex_{k}"] == comp[f"denue25_personal_{k}"]).sum())
    for k in GRUPOS:
        comp[f"dif_unidades_{k}"] = comp[f"unidades_{k}"] - comp[f"denue25_unidades_{k}"]
        comp[f"dif_personal_regla_colmex_{k}"] = comp[f"p_colmex_{k}"] - comp[f"denue25_personal_{k}"]
    print(f"Celdas de personal idénticas: {exactas}/48; celdas de unidades idénticas: "
          f"{int(sum((comp[f'dif_unidades_{k}'] == 0).sum() for k in GRUPOS))}/48")
    sensibilidad(df, ref)
    comp["edicion_denue"] = f"{titulo} ({modif})"
    comp.to_csv(OUT, encoding="utf-8")
    print("\nGuardado:", OUT.name)
    return df, comp, ref

def sensibilidad(df, ref):
    """Indicador CDMX viviendas con 65+ / personal ocupado, bajo clasificaciones alternativas."""
    viv65 = ref["censo20_viv_con_65mas"].sum()
    p = lambda codigos: df.loc[df.codigo_act.isin(codigos), "p_colmex"].sum()
    variantes = {
        "A. Colmex (10 clases, sin centros de dia)": GRUPOS["adulta_mayor"],
        "B. A + centros de dia 624121/2": GRUPOS["adulta_mayor"] + [624121, 624122],
        "C. Solo residencias y asilos (623111/2, 623311/2)": [623111, 623112, 623311, 623312],
        "D. C + centros de dia 624121/2": [623111, 623112, 623311, 623312, 624121, 624122],
    }
    filas = []
    for k, cods in variantes.items():
        pers = p(cods); filas.append((k, pers, round(viv65 / pers, 1)))
    out = pd.DataFrame(filas, columns=["variante", "personal_estimado", "viviendas_65mas_por_ocupado"])
    print("\n== Sensibilidad del indicador de adultos mayores (CDMX) ==")
    print(out.to_string(index=False))
    out.to_csv(AQUI / "sensibilidad_indicador_adulta_mayor.csv", index=False, encoding="utf-8")

if __name__ == "__main__":
    main()
