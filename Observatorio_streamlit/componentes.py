"""Componentes visuales compartidos: paleta, formato de cifras, fichas de fuente y gráficas con IC."""
from __future__ import annotations

import math

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

# Paleta del Observatorio (la misma de Frontend/observatorio/css/base.css)
TINTA = "#2b3045"
ACENTO = "#77689d"
LAVANDA = "#aa95d1"
LAV_CLARO = "#d9cfee"
ALERTA = "#c0435a"
AMBAR = "#a9711a"
GRIS = "#9aa0ad"
TIPOS = ["#77689d", "#aa95d1", "#2b3045", "#c0435a"]   # tipología de AGEB (4 tipos)

PREC_COLOR = {"alta": ACENTO, "moderada": LAVANDA, "baja": LAV_CLARO, "no estimable": GRIS, "no aplica": GRIS}
PREC_TEXTO = {
    "alta": "precisión alta (CV < 15 %)",
    "moderada": "precisión moderada (CV 15–30 %): usar con cautela",
    "baja": "precisión baja (CV ≥ 30 %): solo referencia, no se compara",
    "no estimable": "no estimable",
    "no aplica": "sin varianza de diseño",
}


# ------------------------------------------------------------------ formato
def num(x, dec: int = 0) -> str:
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "sin dato"
    return f"{x:,.{dec}f}"


def pct(x, dec: int = 1) -> str:
    return "sin dato" if x is None or (isinstance(x, float) and math.isnan(x)) else f"{x:,.{dec}f} %"


def millones(x, dec: int = 2) -> str:
    return "sin dato" if x is None or (isinstance(x, float) and math.isnan(x)) else f"{x / 1e6:,.{dec}f} M"


def pesos(x, dec: int = 0) -> str:
    return "sin dato" if x is None or (isinstance(x, float) and math.isnan(x)) else f"${x:,.{dec}f}"


def ic(li, ls, dec: int = 1) -> str:
    if li is None or ls is None or pd.isna(li) or pd.isna(ls):
        return "sin IC"
    return f"IC 90 % {li:,.{dec}f}–{ls:,.{dec}f}"


# ------------------------------------------------------------------ bloques de texto
def encabezado(titulo: str, pregunta: str, alcance: str):
    st.title(titulo)
    st.markdown(f"**{pregunta}**")
    st.caption(alcance)


def aviso_nacional():
    st.info("**Cifras nacionales (ENASIC 2022).** La ENASIC no permite estimaciones para la Ciudad de México ni por alcaldía, "
            "y es la primera edición: no hay tendencia. Lo que se ve aquí describe al país.", icon="🇲🇽")


def chip(precision: str) -> str:
    p = str(precision) if precision is not None and not pd.isna(precision) else "no aplica"
    return f":{'violet' if p == 'alta' else 'orange' if p == 'moderada' else 'red' if p == 'baja' else 'gray'}-badge[{p}]"


def ficha(fuente: str, archivo: str, nivel: str, precision: str | None = None, no_permite: str | None = None,
          lectura: str | None = None):
    """Ficha plegada de cada tarjeta: cómo leer, de dónde sale, qué tan firme es y qué NO permite afirmar."""
    with st.expander("ⓘ Lectura, fuente y precisión"):
        if lectura:
            st.markdown(f"**Cómo leerla.** {lectura}")
        st.markdown(f"**Fuente.** {fuente}  \n**Archivo.** `{archivo}`  \n**Nivel geográfico.** {nivel}")
        if precision:
            st.markdown(f"**Precisión.** {precision}")
        if no_permite:
            st.markdown(f"**No permite afirmar.** {no_permite}")


def tile(col, etiqueta: str, valor: str, nota: str, precision: str | None = None):
    with col:
        with st.container(border=True):
            st.caption(etiqueta)
            st.markdown(f"<div style='font-size:2rem;font-weight:700;color:{TINTA};line-height:1.1'>{valor}</div>",
                        unsafe_allow_html=True)
            st.caption(nota)
            if precision:
                st.markdown(chip(precision))


# ------------------------------------------------------------------ gráficas
def _layout(fig: go.Figure, alto: int, titulo_x: str = "", rango_x=None):
    fig.update_layout(height=alto, margin=dict(l=10, r=20, t=10, b=30), plot_bgcolor="rgba(0,0,0,0)",
                      paper_bgcolor="rgba(0,0,0,0)", font=dict(family="sans-serif", size=13, color=TINTA),
                      showlegend=False, xaxis_title=titulo_x)
    fig.update_xaxes(gridcolor="#e8e5f0", zeroline=True, zerolinecolor="#c9c3d9", range=rango_x)
    fig.update_yaxes(automargin=True)
    return fig


def barras_ic(df: pd.DataFrame, etiqueta: str, valor: str, li: str | None = "li90", ls: str | None = "ls90",
              precision: str | None = "precision", sufijo: str = " %", titulo_x: str = "%", orden: bool = True,
              resaltar: set | None = None, rango_x=None):
    """Barras horizontales con IC al 90 %. Las de precisión baja se dibujan claras y con trama, y se rotulan."""
    d = df.copy()
    if orden:
        d = d.sort_values(valor)
    prec = d[precision].fillna("no aplica") if precision and precision in d else pd.Series(["no aplica"] * len(d), index=d.index)
    tiene_prec = bool(precision and precision in d)
    colores = [ALERTA if resaltar and e in resaltar else (PREC_COLOR.get(p, GRIS) if tiene_prec and p != "no aplica" else ACENTO)
               for e, p in zip(d[etiqueta], prec)]
    patron = ["/" if p == "baja" else "" for p in prec]
    texto = [f"{v:,.1f}{sufijo}" + ("  · baja" if p == "baja" else "") for v, p in zip(d[valor], prec)]
    err = None
    if li and ls and li in d and ls in d and d[li].notna().any():
        err = dict(type="data", symmetric=False, array=(d[ls] - d[valor]).clip(lower=0),
                   arrayminus=(d[valor] - d[li]).clip(lower=0), color=TINTA, thickness=1.2, width=4)
    fig = go.Figure(go.Bar(x=d[valor], y=d[etiqueta], orientation="h", marker=dict(color=colores, pattern_shape=patron),
                           error_x=err, text=texto, textposition=["outside" if v < 0.12 * d[valor].max() else "inside" for v in d[valor]], insidetextanchor="start", cliponaxis=False,
                           insidetextfont=dict(color="white"), outsidetextfont=dict(color=TINTA),
                           hovertemplate="%{y}: %{x:,.1f}" + sufijo + "<extra></extra>"))
    fig = _layout(fig, max(160, 46 * len(d) + 40), titulo_x, rango_x)
    if not orden:
        fig.update_yaxes(autorange="reversed")
    return fig


def diferencias_ic(df: pd.DataFrame, etiqueta: str, dif: str = "dif_pp", li: str = "dif_li90", ls: str = "dif_ls90",
                   titulo_x: str = "diferencia en puntos porcentuales"):
    """Diferencias con IC: si el intervalo cruza el cero, la diferencia no se distingue de cero (gris)."""
    d = df.dropna(subset=[dif]).copy()
    sig = (d[li] > 0) | (d[ls] < 0)
    fig = go.Figure(go.Scatter(x=d[dif], y=d[etiqueta], mode="markers",
                               marker=dict(size=12, color=[ACENTO if s else GRIS for s in sig]),
                               error_x=dict(type="data", symmetric=False, array=d[ls] - d[dif], arrayminus=d[dif] - d[li],
                                            color=TINTA, thickness=1.4),
                               hovertemplate="%{y}: %{x:+.1f} pp<extra></extra>"))
    fig.add_vline(x=0, line_color=ALERTA, line_dash="dot")
    return _layout(fig, max(160, 50 * len(d) + 40), titulo_x)


def mostrar(fig, clave: str):
    st.plotly_chart(fig, width="stretch", config={"displayModeBar": False}, key=clave)
