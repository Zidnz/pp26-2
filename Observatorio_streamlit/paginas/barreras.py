import pandas as pd
import plotly.graph_objects as go
import streamlit as st

import componentes as c
import datos
from filtro import etiqueta, filtro_segmento

c.encabezado("¿Por qué no se contrata?",
             "Si el cuidado pesa tanto, ¿por qué casi nadie busca o contrata un servicio?",
             "ENASIC 2022. Universos distintos por gráfica: se indica en cada una.")
c.aviso_nacional()
dim, seg = filtro_segmento()
n = datos.necesidad()
F03 = "DW/marts/mart_necesidad_cuidado.csv (script 03, `03_enasic_barreras_estimaciones.csv`)"
F12 = "DW/marts/mart_necesidad_cuidado.csv (script 12b)"

# ------------------------------------------------------------------ razones para no buscar
st.subheader("¿Por qué no buscaron un servicio?")
grupo = st.radio("Universo", ["Cuidan discapacidad o 60+", "Todas las cuidadoras"], horizontal=True)
r = n[n.indicador.str.startswith(f"{grupo} | No buscó por: ")].copy()
r["razon_txt"] = r.indicador.str.split("No buscó por: ").str[1].str.capitalize()
buscó = datos.est(f"{grupo} | Buscó servicio (P6.42)")
st.markdown(f"Solo **{c.pct(buscó.estimacion)}** buscó un servicio ({c.ic(buscó.li90, buscó.ls90)}, {buscó.precision}). "
            "Entre quienes no buscaron:")
c.mostrar(c.barras_ic(r, "razon_txt", "estimacion"), "razones")
st.warning("**«No tuve necesidad» es la razón dominante, pero no es un dato de necesidad.** En «¿Quién lo carga?» se ve que "
           "la mayoría de quienes cuidan 40 h o más y la dan como razón declara daño.", icon="⚠️")
c.ficha("INEGI, ENASIC 2022, P6.42 y razones de no búsqueda (TPOB_CUI)", F03, "Nacional",
        no_permite="Que el costo no importe: «son caros» es bajo porque casi nadie llegó a cotizar. "
                   "El filtro de segmento no aplica a esta gráfica (el script 03 no está segmentado).")

# ------------------------------------------------------------------ segmentables: preferencia y P7.11
st.subheader(f"Si contratara, ¿dónde? · {etiqueta(dim, seg)}")
izq, der = st.columns(2)
with izq:
    st.markdown("**Lugar preferido del cuidado (P6.46)**")
    c.mostrar(c.barras_ic(datos.serie_segmento("pref", dim, seg), "categoria", "estimacion"), "pref")
with der:
    st.markdown("**Por qué no estaría de acuerdo con una residencia (P7.11)**")
    c.mostrar(c.barras_ic(datos.serie_segmento("p711", dim, seg), "categoria", "estimacion"), "p711")
c.ficha("INEGI, ENASIC 2022 (TPOB_CUI)", F12, "Nacional",
        no_permite="Disposición a pagar: preferir el cuidado en casa no dice cuánto se pagaría por él.")

# ------------------------------------------------------------------ contratación por quintil
st.subheader("¿Quién contrata hoy?")
q = n[n.bloque == "contratacion_por_quintil"].copy()
fig = go.Figure()
for ind, col in [("Contrata doméstico entrada por salida", c.LAVANDA), ("Contrata enfermería o cuidadora", c.ACENTO)]:
    d = q[q.indicador == ind]
    fig.add_bar(name=ind, x=d.dominio_segmento, y=d.estimacion, marker_color=col,
                marker_pattern_shape=["/" if p == "baja" else "" for p in d.precision],
                error_y=dict(type="data", symmetric=False, array=d.ls90 - d.estimacion, arrayminus=d.estimacion - d.li90.clip(lower=0)))
fig.update_layout(barmode="group", height=330, margin=dict(l=10, r=10, t=10, b=10), yaxis_title="% de hogares",
                  legend=dict(orientation="h", y=1.1), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
c.mostrar(fig, "quintil")
cu = datos.est("Hogares con discapacidad o 60+ | Contrata enfermería o cuidadora")
st.markdown(f"Contratar cuidado es raro en todos los quintiles: **{c.pct(cu.estimacion)}** de los hogares con necesidad "
            f"({c.ic(cu.li90, cu.ls90)}, {cu.precision}). Lo que sí crece con el ingreso es el trabajo doméstico.")
c.ficha("INEGI, ENASIC 2022 (tabla de hogares, FAC_HOG)", "DW/marts/mart_necesidad_cuidado.csv (script 04)", "Nacional",
        precision="La contratación de cuidado tiene precisión baja en todos los quintiles (barras con trama): solo referencia.",
        no_permite="Ordenar los quintiles entre sí en contratación de cuidado: los intervalos se traslapan.")

# ------------------------------------------------------------------ oferta declarada
st.subheader("¿Hay quién quiera cuidar por un pago?")
od = n[n.bloque == "5_oferta_declarada"].copy()
od = od[od.indicador.str.contains("Le gustaría")]
od["universo"] = od.indicador.str.split(" \\| ").str[0]
c.mostrar(c.barras_ic(od, "universo", "estimacion"), "oferta")
c.ficha("INEGI, ENASIC 2022, P6.47", F03, "Nacional",
        no_permite="Oferta real de trabajo: es una intención declarada, sin salario ni condiciones.")

# ------------------------------------------------------------------ quienes buscaron
with st.expander("Quienes sí buscaron: ¿se cumplió lo que buscaban? (muestra chica)"):
    qb = n[n.bloque == "3_quienes_buscaron"]
    cumplio = qb[qb.indicador.str.contains("Cumplió")].iloc[0]
    st.markdown(f"Cumplió lo que buscaba: **{c.pct(cumplio.estimacion)}** ({c.ic(cumplio.li90, cumplio.ls90)}; "
                f"n = {int(cumplio.n_muestra_dominio)}).")
    nc = qb[qb.indicador.str.startswith("No cumplió")].copy()
    nc["motivo"] = nc.indicador.str.replace("No cumplió | ", "", regex=False)
    st.dataframe(nc[["motivo", "estimacion", "cv", "precision", "n_muestra_dominio"]].rename(columns={
        "motivo": "Motivo (entre quienes no lo obtuvieron)", "estimacion": "%", "cv": "CV", "precision": "Precisión",
        "n_muestra_dominio": "n"}), hide_index=True, width="stretch")
    st.caption("Todas con precisión baja (n = 46): no se ordenan ni se comparan. Algunos intervalos publicados por el script 03 "
               "son de Wald y salen por debajo de 0 (el DQ05b del ETL lo advierte).")
