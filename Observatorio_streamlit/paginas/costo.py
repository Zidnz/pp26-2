import plotly.graph_objects as go
import streamlit as st

import componentes as c
import datos

c.encabezado("¿Cuánto cuesta?",
             "¿Cuánto costaría un relevo de cuidado en casa por horas y qué parte de los hogares podría pagarlo?",
             "Costos en pesos de 2026, sin prestaciones salvo donde se indica. Asequibilidad con ingreso ENASIC 2022 (nacional) "
             "o ENIGH 2022 (nacional y CDMX).")
st.warning("**Poder pagar no es querer contratar.** Estas cifras dicen si el costo cabe en el ingreso, no si el hogar lo compraría: "
           "ninguna fuente del proyecto mide disposición a pagar.", icon="⚠️")

a = datos.asequibilidad()
FA = "DW/marts/mart_asequibilidad.csv (scripts 10 y 14)"

# ------------------------------------------------------------------ asequibilidad
st.subheader("¿Qué parte de los hogares con necesidad podría pagarlo?")
s1, s2, s3, s4 = st.columns(4)
geo = s1.selectbox("Territorio", ["Ciudad de México", "México (nacional)"])
ing = s2.selectbox("Ingreso", sorted(a[a.geografia == geo].ingreso_referencia.unique(), key=lambda x: "principal" not in x))
sal = s3.selectbox("Salario de referencia", sorted(a.salario_referencia.unique()))
umb = s4.select_slider("Tope del ingreso", options=[10, 20, 30], value=20, format_func=lambda x: f"{x} %")
d = a[(a.geografia == geo) & (a.ingreso_referencia == ing) & (a.salario_referencia == sal) & (a.umbral_pct_ingreso == umb)].copy()
if d.empty:
    raise datos.DatoFaltante(f"mart_asequibilidad.csv no trae la combinación {geo} / {ing} / {sal} / {umb} %.")
d = d.sort_values("horas_semana")
d["etq"] = d.paquete.str.replace(" (control: script 04)", " · control", regex=False) + " · " + d.costo_mensual_2026.map(lambda x: c.pesos(x)) + "/mes"
c.mostrar(c.barras_ic(d, "etq", "pct_hogares_asequible", orden=False, rango_x=[0, 105]), "aseq")
sin_var = d.tiene_varianza.eq(0).all()
st.caption(("Sin intervalo: la ENASIC se usa aquí como proporción ponderada sin varianza de diseño. " if sin_var else "") +
           f"Alcance: {d.alcance.iloc[0]}.")
c.ficha("ENASIC 2022 (ingreso del hogar, FAC_HOG) o ENIGH 2022 (programa de cálculo CONEVAL); salario mínimo profesional 2026 "
        "de personas trabajadoras del hogar o tabulador CACEH 2026", FA, "Nacional o entidad (CDMX)",
        precision="ENIGH: CV e IC al 90 % de diseño. ENASIC: sin varianza de diseño.",
        no_permite="Asequibilidad por alcaldía; disposición a pagar. El costo no incluye prestaciones ni recargos por jornada "
                   "(ver abajo), así que la asequibilidad está sobreestimada. La ENASIC capta cerca de la mitad del ingreso "
                   "que mide la ENIGH: en el nacional subestima la capacidad de pago.",
        lectura="Porcentaje de hogares con alguien con discapacidad o de 60+ cuyo costo mensual del paquete no rebasa el tope "
                "elegido de su ingreso. La jornada completa de 40 h es un control.")

# ------------------------------------------------------------------ costo por jornada (script 19)
st.subheader("¿Cuánto cuesta la hora según la jornada?")
j19 = datos.modelo("19_costo_hora_por_jornada.csv")
jh = j19.drop_duplicates("jornada")
a1, a2, a3 = st.columns(3)
for col_, r in zip([a1, a2, a3], jh.itertuples()):
    c.tile(col_, f"Jornada {r.jornada.lower()} · {r.horario_lft}", c.pesos(r.hora_ordinaria_2026, 2) + " /h",
           f"jornada máxima {r.horas_max_jornada:g} h · " + ("referencia" if r.dif_vs_diurna_pct == 0 else f"+{r.dif_vs_diurna_pct:.1f} % sobre la diurna"))
st.markdown(f"Con el mismo salario diario (**{c.pesos(jh.salario_diario_2026.iloc[0], 2)}**, piso legal 2026), la hora cuesta más de noche "
            "porque la ley fija una jornada máxima más corta: el mismo salario se reparte entre menos horas. "
            "Para un relevo que cubra la noche, el costo sube aunque el salario no cambie.")
st.warning(f"**Evidencia: {jh.evidencia.iloc[0]}.** Las cifras no incluyen prestaciones (abajo se pueden agregar).", icon="⚖️")
c.ficha("Ley Federal del Trabajo (arts. 60 y 61, por verificar en el DOF) y salario mínimo profesional 2026 de personas trabajadoras del hogar",
        "DW/marts/mart_modelos.csv (M19), desde 19_costo_hora_por_jornada.csv (script 19)", "No aplica (costo unitario nacional)",
        no_permite="Un precio de mercado: es el piso legal. No incluye horas extra, días de descanso ni prestaciones.")

# ------------------------------------------------------------------ costo con carga laboral
st.subheader("¿Cambia el costo si el relevo es de noche o con prestaciones?")
s20 = datos.modelo("20_sostenibilidad_escenarios.csv")
cu = s20[s20.bloque == "costo_unitario"]
nom = {1.0: "Sin carga laboral", 2.0: "+ IMSS e Infonavit", 3.0: "+ IMSS, Infonavit, aguinaldo y vacaciones"}
carga = st.radio("Carga laboral", list(cu.carga.unique()), format_func=lambda k: f"{nom.get(k, k)} ({cu[cu.carga == k].carga_pct.iloc[0]:.1f} %)",
                 horizontal=True)
fig = go.Figure()
for j, col in zip(["Diurna", "Mixta", "Nocturna"], [c.LAVANDA, c.ACENTO, c.TINTA]):
    x = cu[(cu.jornada == j) & (cu.carga == carga)]
    fig.add_bar(name=j, x=x.horas_semana.astype(int).astype(str) + " h/sem", y=x.costo_mensual, marker_color=col,
                text=x.costo_mensual.map(lambda v: c.pesos(v)), textposition="outside")
fig.update_layout(barmode="group", height=340, yaxis_title="$ al mes (2026)", margin=dict(l=10, r=10, t=10, b=10),
                  legend=dict(orientation="h", y=1.12), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
c.mostrar(fig, "costo_carga")
c.ficha("Piso legal 2026 y LFT (jornadas, arts. 60-61 por verificar); porcentajes de carga del script 20",
        "DW/marts/mart_modelos.csv (M20), desde 20_sostenibilidad_escenarios.csv (script 20)", "No aplica (costo unitario)",
        no_permite="Las gráficas de asequibilidad de arriba siguen calculadas **sin** carga laboral.")

# ------------------------------------------------------------------ financiamiento CDMX
st.subheader("¿Cuánto costaría financiar el relevo de 6 h/sem en la CDMX?")
st.warning("**Escenarios ilustrativos.** La tasa de aceptación y el costo de operación son supuestos sin fuente; "
         "los hogares elegibles de la CDMX se infieren con tasas nacionales. No es una proyección.", icon="🧪")
es = s20[s20.bloque == "escala_cdmx"]
ft = s20[s20.bloque == "financiamiento_total_cdmx"]
fig = go.Figure()
for (esc, g), col in zip(ft.groupby("escenario", sort=False), [c.LAV_CLARO, c.LAVANDA, c.ACENTO]):
    fig.add_scatter(x=g.opex_hogar_mes, y=g.mdp, mode="lines+markers", name=esc, line=dict(color=col, width=3),
                    hovertemplate="operación $%{x}/hogar-mes: %{y:,.1f} mdp<extra></extra>")
fig.update_layout(height=320, xaxis_title="Costo de operación ($ por hogar al mes, supuesto)", yaxis_title="Millones de pesos al año",
                  legend=dict(orientation="h", y=1.15), margin=dict(l=10, r=10, t=10, b=10),
                  paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
c.mostrar(fig, "financ")
st.dataframe(es[["escenario", "aceptacion", "hogares", "costo_laboral_anual_mdp", "subsidio_laboral_anual_mdp", "pct_solicitud"]]
             .rename(columns={"escenario": "Escenario", "aceptacion": "Aceptación", "hogares": "Hogares", "costo_laboral_anual_mdp": "Costo laboral (mdp/año)",
                              "subsidio_laboral_anual_mdp": "Subsidio (mdp/año)", "pct_solicitud": "% de la solicitud CDMX"}),
             hide_index=True, width="stretch",
             column_config={"Aceptación": st.column_config.NumberColumn(format="%.3f"), "Hogares": st.column_config.NumberColumn(format="%d")})
c.ficha("Script 20 (supuestos en `20_modelo_sostenibilidad.xlsx`); hogares elegibles: inferencia con tasas nacionales",
        "DW/marts/mart_modelos.csv (M20, es_ilustrativo = 1), desde 20_sostenibilidad_escenarios.csv", "Entidad (CDMX), inferido",
        no_permite="Que el programa costaría esto; que la aceptación será de 5, 25 o 64 %. El escenario máximo es una cota "
                   "(1 − «no contrataría»), no una predicción.")

# ------------------------------------------------------------------ pago observado
st.subheader("¿Cuánto se paga hoy por hora?")
p = datos.res("04_pago_observado_cuidado.csv")
ph = p[(p.variable == "pago_hora") & (p.grupo == "todos los hogares")]
st.dataframe(ph[["servicio", "n", "p25_pesos_2026", "mediana_pesos_2026", "p75_pesos_2026"]].rename(columns={
    "servicio": "Servicio", "n": "n (muestra)", "p25_pesos_2026": "p25 ($/h)", "mediana_pesos_2026": "Mediana ($/h)",
    "p75_pesos_2026": "p75 ($/h)"}), hide_index=True, width="stretch",
    column_config={k: st.column_config.NumberColumn(format="$%.0f") for k in ["p25 ($/h)", "Mediana ($/h)", "p75 ($/h)"]})
c.ficha("ENASIC 2022, pago declarado por hogares que contratan; INPC nov-2022 → ago-2026", "Analysis/resultados/04_pago_observado_cuidado.csv (script 04)",
        "Nacional", precision="Baja: cuidadora n = 26 y enfermería n = 14, sin ponderar (salvo la mediana ponderada del archivo).",
        no_permite="Un precio de mercado de la CDMX; un tabulador para el programa.")
