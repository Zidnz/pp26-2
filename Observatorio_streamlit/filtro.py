"""Filtro de segmento compartido por «¿Quién lo carga?» y «¿Por qué no se contrata?».

Una dimensión a la vez (script 12b): los cruces dejan muestras demasiado chicas.
"""
import streamlit as st

import datos


def filtro_segmento() -> tuple[str, str]:
    seg = datos.segmentos_disponibles()
    with st.sidebar:
        st.markdown("**Filtrar por segmento**")
        dim = st.selectbox("Dimensión", list(seg), key="seg_dim")
        opciones = seg[dim]
        s = st.selectbox("Segmento", opciones, key=f"seg_val_{dim}") if dim != "Total" else "Total"
        st.caption("Una dimensión a la vez: los cruces dejan muestras demasiado chicas. "
                   "Las estimaciones con precisión baja se muestran claras y no se comparan.")
    return dim, s


def etiqueta(dim: str, seg: str) -> str:
    return "Total nacional" if dim == "Total" else f"{dim}: {seg}"
