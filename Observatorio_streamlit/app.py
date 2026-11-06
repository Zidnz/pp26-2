"""Observatorio del Cuidado · «Los datos que cuidan» — versión Streamlit.

Uso (desde la raíz del repo):
    pip install -r Observatorio_streamlit/requirements.txt
    streamlit run Observatorio_streamlit/app.py
"""
import streamlit as st

from datos import DatoFaltante

st.set_page_config(page_title="Observatorio del Cuidado", page_icon="💜", layout="wide")

st.markdown("""
<style>
  [data-testid="stSidebar"] {background:#2b3045;}
  [data-testid="stSidebar"] * {color:#f1eefa !important;}
  [data-testid="stSidebar"] [data-baseweb="select"] * {color:#2b3045 !important;}
  h1 {color:#2b3045; letter-spacing:-0.5px;}
  .block-container {padding-top:2rem; max-width:1250px;}
</style>
""", unsafe_allow_html=True)

P = "paginas/"
paginas = [
    st.Page(P + "inicio.py", title="Inicio", icon="🏠", default=True),
    st.Page(P + "necesidad.py", title="¿Quién lo carga?", icon="🧍", url_path="necesidad"),
    st.Page(P + "barreras.py", title="¿Por qué no se contrata?", icon="🚧", url_path="barreras"),
    st.Page(P + "costo.py", title="¿Cuánto cuesta?", icon="💵", url_path="relevo"),
    st.Page(P + "focalizacion.py", title="¿A quién primero?", icon="🎯", url_path="focalizacion"),
    st.Page(P + "territorio.py", title="¿Dónde?", icon="🗺️", url_path="territorio"),
    st.Page(P + "indicadores.py", title="Indicadores", icon="📊", url_path="indicadores"),
    st.Page(P + "metodo.py", title="Método", icon="🔍", url_path="metodo"),
]
pg = st.navigation(paginas)

with st.sidebar:
    st.markdown("### Observatorio del Cuidado")
    st.caption("Los datos que cuidan")

try:
    pg.run()
except DatoFaltante as e:
    st.error(f"**No se publica esta página porque falta un dato.** {e}")
    st.stop()

with st.sidebar:
    st.divider()
    st.caption("Solo agregados de fuentes públicas. Sin datos personales ni simulados. "
               "**Prototipo pendiente de doble revisión.**")
