import plotly.graph_objects as go
import streamlit as st

import componentes as c
import datos

c.encabezado("¿A quién primero?",
             "Con el objetivo preregistrado, ¿un modelo encuentra a más cuidadoras con daño que la regla simple «40 h o más»? "
             "No hay evidencia de que lo haga, y tampoco está probado que la regla baste.",
             "Versión 2, preregistrada (1 nov 2026): objetivo DANO_SALUD3 (salud física, cansancio o sueño), ENASIC 2022 nacional. "
             "Comparación a igual tasa de selección que la regla. Sin doble revisión.")
c.aviso_nacional()

# ------------------------------------------------------------------ versión 2 (resultado primario)
F27 = "DW/marts/mart_modelos.csv (M27), desde 27_v2_*.csv (script 27_focalizacion_v2.py)"
PRIM = "PRIMARIO: DANO_SALUD3, predictores primarios"
g27 = datos.modelo("27_v2_global.csv")
prim27 = g27[g27.configuracion == PRIM]
r27 = datos.una(prim27, "27_v2_global.csv", puntaje="Regla >= 40 h")
l27 = datos.una(prim27, "27_v2_global.csv", puntaje="Logística")
t27 = datos.una(prim27, "27_v2_global.csv", puntaje="Tarjeta de puntos")
st.caption("Objetivo fijado el 1 nov 2026, después de un diagnóstico descriptivo (script 26) y antes de correr los modelos. "
           "Los dos objetivos anteriores se eligieron viendo resultados.")
a2, b2, c2, d2 = st.columns(4)
c.tile(a2, "Cobertura de la regla «40 h o más»", c.pct(r27.cobertura), f"{c.ic(r27.cob_li90, r27.cob_ls90)} · precisión {c.pct(r27.precision)}")
c.tile(b2, "Regresión logística frente a la regla", f"{l27.dif_vs_comparador_pp:+.1f} pp", f"IC 90 % {l27.dif_li90:+.1f} a {l27.dif_ls90:+.1f}: incluye el cero")
c.tile(c2, "Tarjeta de puntos (retirada del prototipo)", f"{t27.dif_vs_comparador_pp:+.1f} pp", f"IC 90 % {t27.dif_li90:+.1f} a {t27.dif_ls90:+.1f}")
c.tile(d2, "Diferencia mínima detectable", f"≈ {l27.dif_minima_detectable_pp:.1f} pp",
       f"{int(r27.n_muestra)} personas, {int(r27.n_con_objetivo)} con el daño")
st.markdown("**Veredicto: no concluyente, se queda la regla.** Eso **no prueba** que la regla sea mejor ni que baste: con esta muestra solo se "
            f"detectarían diferencias de unos {l27.dif_minima_detectable_pp:.0f} pp o más. La regla se elige por sencilla y transparente. "
            f"En el peor grupo, la regresión logística pierde {abs(l27.peor_caida_grupo_pp):.0f} pp de cobertura frente a la regla.")
with st.expander("Todas las configuraciones (primaria y sensibilidades)"):
    st.dataframe(g27[["configuracion", "cupo", "puntaje", "cobertura", "dif_vs_comparador_pp", "dif_li90", "dif_ls90",
                      "dif_minima_detectable_pp", "veredicto"]], hide_index=True, width="stretch")
with st.expander("Por bloque de cuidado (discapacidad / solo 60+)"):
    b27 = datos.modelo("27_v2_por_bloque.csv")
    st.dataframe(b27[b27.configuracion == PRIM][["bloque", "puntaje", "tasa_seleccion_bloque", "cobertura", "dif_vs_comparador_pp",
                                                   "dif_li90", "dif_ls90", "veredicto_secundario"]], hide_index=True, width="stretch")
with st.expander("Por grupo: cobertura de la regla y de la regresión logística"):
    e27 = datos.modelo("27_v2_equidad.csv")
    st.dataframe(e27[(e27.configuracion == PRIM) & (e27.puntaje == "Logística")][["dimension", "grupo", "n_con_objetivo", "cobertura_comparador",
                                                                                 "cobertura", "cambio_pp"]], hide_index=True, width="stretch")
c.ficha("INEGI, ENASIC 2022 (TPOB_CUI); validación por UPM con pesos de la encuesta; IC 90 % por bootstrap por UPM", F27, "Nacional",
        precision="Poca potencia: diferencias menores que la mínima detectable no se distinguen de cero.",
        no_permite="Concluir que la regla es mejor que un modelo, ni por alcaldía: la ENASIC solo es nacional.")

st.divider()
st.subheader("Versión 1 · exploratoria · objetivo «algún daño»")
st.warning("Lo que sigue se calculó con los objetivos «algún daño» y «salud física deteriorada» (DEC-OBJ-001, 20 oct 2026), antes de que se "
           "preregistrara el objetivo actual. Se conserva como historia y no es el resultado primario. No hay una versión de estas gráficas "
           "con el objetivo actual.", icon="🗂️")

OBJ = {"DANO_ALGUNO": "Algún daño (salud o trabajo)", "DANO_SALUD_FISICA": "Salud física deteriorada"}
obj = st.radio("Objetivo a encontrar", list(OBJ), format_func=OBJ.get, horizontal=True)
F11 = "DW/marts/mart_modelos.csv (M11), desde 11_modelo_*.csv y 11_objetivo_*.csv (notebook B, sección 11)"

rs = datos.una(datos.modelo("11_objetivo_resumen.csv"), "11_objetivo_resumen.csv", objetivo=obj)
a, b, d = st.columns(3)
c.tile(a, "Prevalencia del objetivo", c.pct(rs.prevalencia), f"{c.ic(rs.prev_li90, rs.prev_ls90)} · ≈ {c.millones(rs.personas_estimadas)} personas")
c.tile(b, "Cobertura de la regla «40 h o más»", c.pct(rs.cob_regla), f"{c.ic(rs.cob_li_regla, rs.cob_ls_regla)} · precisión {c.pct(rs.prec_regla)}")
sig = rs.dif_li > 0 or rs.dif_ls < 0
c.tile(d, "Ventaja del modelo elegido", f"{rs.dif_modelo:+.1f} pp",
       f"IC 90 % {rs.dif_li:+.1f} a {rs.dif_ls:+.1f} · " + ("se distingue de la regla" if sig else "no se distingue de la regla"))

# ------------------------------------------------------------------ alternativas
al = datos.modelo("11_modelo_alternativas.csv")
al = al[(al.objetivo == obj) & (al.puntaje != "Regla >= 40 h")].copy()
st.subheader(f"{len(al)} formas de elegir contra la regla")
al["etq"] = al.puntaje + " · interpretabilidad " + al.interpretable.str.split(":").str[0].str.lower()
c.mostrar(c.diferencias_ic(al.sort_values("dif_cobertura_vs_regla"), "etq", "dif_cobertura_vs_regla", "dif_li90", "dif_ls90",
                           titulo_x="puntos de cobertura sobre la regla (misma tasa de selección)"), "alt")
st.caption("Morado: el modelo encuentra más personas con el daño que la regla, con un IC que no cruza el cero. Gris: no se distingue.")
n_sig = int(((al.dif_li90 > 0) | (al.dif_ls90 < 0)).sum())
st.markdown(f"**{n_sig} de {len(al)}** alternativas se distinguen de la regla para «{OBJ[obj].lower()}». "
            "Que el método simple iguale al modelo es un resultado válido: la regla se explica con una sola pregunta.")
sf = rs.dif_sin_fuerza_li > 0 or rs.dif_sin_fuerza_ls < 0
st.caption(f"Sin la variable «le falta fuerza física», la ventaja de la logística es {rs.dif_sin_fuerza:+.1f} pp "
           f"(IC 90 % {rs.dif_sin_fuerza_li:+.1f} a {rs.dif_sin_fuerza_ls:+.1f}): " + ("se sostiene." if sf else "deja de distinguirse de la regla."))
with st.expander("Tabla de alternativas"):
    st.dataframe(al[["puntaje", "familia", "auc_ponderado", "brier_ponderado", "cobertura", "precision", "dif_cobertura_vs_regla",
                     "dif_li90", "dif_ls90", "interpretable", "faltantes"]], hide_index=True, width="stretch")
c.ficha("INEGI, ENASIC 2022 (TPOB_CUI); validación cruzada con pesos de la encuesta", F11, "Nacional",
        no_permite="Que el modelo funcione con la población de una institución concreta (no está validado fuera de la ENASIC); "
                   "causalidad de las variables.")

# ------------------------------------------------------------------ por cupo
st.subheader("Si el cupo cambia")
cp = datos.modelo("11_modelo_por_cupo.csv")
cp = cp[cp.objetivo == obj]
fig = go.Figure()
for pnt, col in zip(cp.puntaje.unique(), [c.GRIS, c.ACENTO, c.LAVANDA]):
    g = cp[cp.puntaje == pnt]
    fig.add_scatter(x=g.cupo, y=g.cobertura, name=pnt, mode="lines+markers", line=dict(color=col, width=3))
fig.update_layout(height=320, xaxis_title="Cupo (% de cuidadoras que se pueden atender)", yaxis_title="Cobertura (% de personas con el daño)",
                  legend=dict(orientation="h", y=1.15), margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)",
                  plot_bgcolor="rgba(0,0,0,0)")
c.mostrar(fig, "cupo")
st.caption("«Horas (continuo)» ordena por horas de cuidado; el corte equivalente en horas está en el archivo. 40.7 % es la tasa de selección de la regla.")

# ------------------------------------------------------------------ por grupo
st.subheader("¿A quién deja fuera cada forma de elegir?")
pg = datos.modelo("11_objetivo_por_grupo.csv")
pg = pg[pg.objetivo == obj].copy()
DIM = {"SEXO": "Sexo", "EDAD": "Edad", "TIPO": "A quién cuida", "ING": "Ingreso"}
pg["grupo_txt"] = pg.dimension.map(DIM) + ": " + pg.grupo
fig = go.Figure()
for pnt, col in [("Regla >= 40 h", c.GRIS), ("Regresión logística", c.ACENTO)]:
    g = pg[pg.puntaje == pnt]
    fig.add_bar(name=pnt, y=g.grupo_txt, x=g.cobertura, orientation="h", marker_color=col,
                error_x=dict(type="data", symmetric=False, array=g.cob_ls90 - g.cobertura, arrayminus=g.cobertura - g.cob_li90))
fig.update_layout(barmode="group", height=560, xaxis_title="Cobertura dentro del grupo (%)", legend=dict(orientation="h", y=1.05),
                  margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
fig.update_yaxes(autorange="reversed")
c.mostrar(fig, "grupos")
st.warning(f"**Condición en la que el modelo deja de funcionar bien:** en «{rs.peor_grupo}» la cobertura cambia "
         f"{rs.peor_cambio:+.1f} pp frente a la regla (n con el daño = {int(rs.n_min_grupo)}). Un modelo con mejor métrica global "
         "puede dejar fuera a un grupo entero.", icon="⚖️")
c.ficha("ENASIC 2022", "DW/marts/mart_modelos.csv (M11), desde 11_objetivo_por_grupo.csv", "Nacional",
        precision="Grupos con menos de 100 casos con el daño tienen intervalos amplios.",
        no_permite="Comparar territorios: el modelo no tiene variable geográfica utilizable.")
