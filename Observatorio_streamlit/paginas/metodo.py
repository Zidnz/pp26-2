import plotly.graph_objects as go
import streamlit as st

import componentes as c
import datos

c.encabezado("Método", "¿De dónde sale cada dato, qué tan firme es y qué no se puede afirmar?",
             "Todo lo de esta página se lee del data warehouse (DW/marts y DW/logs) y de las matrices del proyecto.")

# ------------------------------------------------------------------ lo que no se puede afirmar
st.subheader("Lo que este Observatorio no permite afirmar")
st.markdown("""
- **Nada de la ENASIC describe a la CDMX ni a una alcaldía.** Es nacional y es la primera edición: no hay tendencia.
- **No hay tendencias de ningún tipo:** ninguna combinación fuente × tabla tiene dos periodos (ver abajo).
- **Oferta y necesidad no se comparan por alcaldía:** ningún par cumple la regla de compatibilidad.
- **Asequibilidad no es disposición a pagar**, y el costo usado no incluye prestaciones.
- **Los modelos no están validados** para la población de una institución; se entrenaron con datos nacionales.
- **Los escenarios de financiamiento son ilustrativos** (aceptación y costo de operación sin fuente).
""")

# ------------------------------------------------------------------ cobertura temporal
st.subheader("¿Se puede hablar de tendencia?")
ct = datos.leer("DW/marts/cobertura_temporal.csv")
n_t = int(ct.permite_tendencia.sum())
st.markdown(f"**{n_t} de {len(ct)}** combinaciones fuente × tabla de hechos tienen al menos dos periodos.")
st.dataframe(ct, hide_index=True, width="stretch")

# ------------------------------------------------------------------ precisión
st.subheader("¿Qué tan precisas son las estimaciones de encuesta?")
cp = datos.leer("DW/marts/calidad_precision.csv")
piv = cp.pivot_table(index="script_origen", columns="precision", values="n_estimaciones", aggfunc="sum", fill_value=0)
fig = go.Figure()
for p in [x for x in ["alta", "moderada", "baja", "no estimable", "no aplica"] if x in piv.columns]:
    fig.add_bar(name=p, y=piv.index, x=piv[p], orientation="h", marker_color=c.PREC_COLOR.get(p, c.GRIS),
                marker_pattern_shape="/" if p == "baja" else "")
fig.update_layout(barmode="stack", height=60 + 34 * len(piv), xaxis_title="número de estimaciones",
                  legend=dict(orientation="h", y=1.1), margin=dict(l=10, r=10, t=10, b=10),
                  paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
c.mostrar(fig, "precision")
st.caption("Regla del proyecto: CV < 15 % alta; 15–30 % moderada; ≥ 30 % baja (solo referencia, no se compara).")

# ------------------------------------------------------------------ fuentes
st.subheader("Fuentes")
inv = datos.inventario()
cols = ["id", "fuente", "emisor", "desagregacion_geografica_maxima", "periodo_cubierto", "estado_evidencia", "permite_afirmar", "prohibe_afirmar"]
st.dataframe(inv[[x for x in cols if x in inv.columns]], hide_index=True, width="stretch")

# ------------------------------------------------------------------ medidas territoriales
st.subheader("Diccionario de medidas del DW")
med = datos.medidas()
nv = int((med.definicion_verificada == 0).sum())
st.markdown(f"**{nv} de {len(med)}** definiciones de medidas todavía no se verifican contra el notebook que las produce.")
st.dataframe(med, hide_index=True, width="stretch")
cg = datos.leer("DW/marts/cobertura_geografica.csv")
with st.expander("Medidas por alcaldía con alcaldías sin dato"):
    st.dataframe(cg, hide_index=True, width="stretch")

# ------------------------------------------------------------------ calidad del ETL
st.subheader("Último reporte de calidad del ETL")
dq = datos.dq()
fallan = dq[(dq.paso == 0)]
x1, x2, x3 = st.columns(3)
c.tile(x1, "Chequeos", str(len(dq)), f"corrida {int(dq.run_id.iloc[0])}")
c.tile(x2, "Errores que fallan", str(int(((dq.paso == 0) & (dq.severidad == "error")).sum())), "detienen la carga")
c.tile(x3, "Advertencias que fallan", str(int(((dq.paso == 0) & (dq.severidad == "advertencia")).sum())), "se publican con nota")
st.dataframe(dq[["codigo", "severidad", "paso", "descripcion", "detalle"]], hide_index=True, width="stretch",
             column_config={"paso": st.column_config.CheckboxColumn("pasó")})

st.caption("Archivos leídos: " + " · ".join(f"`{r}` ({datos.fecha_archivo(r)})" for r in [
    "DW/marts/mart_necesidad_cuidado.csv", "DW/marts/mart_asequibilidad.csv", "DW/marts/mart_territorio.csv", "DW/logs/ultimo_dq.csv"])
    + ". La fecha es la del archivo en disco, no la de los datos.")
