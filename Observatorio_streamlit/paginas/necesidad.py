import plotly.graph_objects as go
import pandas as pd
import streamlit as st

import componentes as c
import datos
from filtro import etiqueta, filtro_segmento

c.encabezado("¿Quién lo carga?",
             "¿Cuánto cuidado recae en quienes cuidan a una persona con discapacidad o de 60+, y qué les cuesta en salud y trabajo?",
             "Universo: personas que cuidan a alguien con discapacidad o de 60 años y más (ENASIC 2022, tabla TPOB_CUI).")
c.aviso_nacional()
dim, seg = filtro_segmento()
nombre = etiqueta(dim, seg)
S = lambda b: datos.serie_segmento(b, dim, seg)
F12 = "DW/marts/mart_necesidad_cuidado.csv (script 12b, `12b_segmentacion_series.csv`)"
ENASIC = "INEGI, ENASIC 2022, tabla TPOB_CUI (población cuidadora), factor de expansión de esa tabla"

# ------------------------------------------------------------------ KPI del segmento
k = S("kpi").set_index("categoria")
st.subheader(f"Segmento: {nombre}")
a, b, d = st.columns(3)
if dim != "Total":
    c.tile(a, "Peso del segmento en el universo", c.pct(k.loc["personas", "estimacion"]),
           c.ic(k.loc["personas", "li90"], k.loc["personas", "ls90"]), k.loc["personas", "precision"])
else:
    c.tile(a, "Personas en el universo", "100 %", "todas las personas cuidadoras de discapacidad o 60+")
c.tile(b, "Pertenece al grupo del problema", c.pct(k.loc["grupo", "estimacion"]),
       f"40 h o más, «sin necesidad» y algún daño (versión 1, no DANO_SALUD3) · {c.ic(k.loc['grupo', 'li90'], k.loc['grupo', 'ls90'])}",
       k.loc["grupo", "precision"])
c.tile(d, "Horas de cuidado a la semana (promedio)", c.num(k.loc["horas_media", "estimacion"], 1),
       c.ic(k.loc["horas_media", "li90"], k.loc["horas_media", "ls90"]), k.loc["horas_media", "precision"])

# ------------------------------------------------------------------ necesidad contra daño por horas
st.subheader("¿Cuánto cambia con más horas de cuidado?")
izq, der = st.columns(2)
orden = ["<20 h", "20-39 h", ">=40 h"]
with izq:
    st.markdown("**Dice «no tuve necesidad» de buscar un servicio**")
    sn = S("carga_sinnec").set_index("categoria").loc[orden].reset_index()
    c.mostrar(c.barras_ic(sn, "categoria", "estimacion", orden=False, rango_x=[0, 100]), "sinnec")
with der:
    st.markdown("**…y, entre ellas, declara algún daño a su salud o su trabajo** (versión 1; no es DANO_SALUD3)")
    dn = S("carga_dano").set_index("categoria").loc[orden].reset_index()
    c.mostrar(c.barras_ic(dn, "categoria", "estimacion", orden=False, rango_x=[0, 100], resaltar={">=40 h"}), "dano")
st.markdown("A más horas, **menos personas dicen necesitar ayuda, pero más declaran daño**: la falta de búsqueda no equivale a falta de necesidad.")
c.ficha(ENASIC, F12, "Nacional", precision="Ver la etiqueta de cada barra; las claras con trama tienen precisión baja.",
        no_permite="Causalidad (que las horas causen el daño); cifras de la CDMX. «Daño» es autodeclarado.",
        lectura="La barra es el porcentaje; la línea es el intervalo de confianza al 90 %.")

# ------------------------------------------------------------------ diferencias
st.markdown("**Diferencia entre quienes cuidan 40 h o más y quienes cuidan menos de 20 h**")
dif = S("dif")
if dif.dif_pp.notna().any():
    c.mostrar(c.diferencias_ic(dif, "indicador", titulo_x="puntos porcentuales (40 h o más menos <20 h)"), "dif")
    st.caption("Morado: el intervalo no cruza el cero. Gris: la diferencia no se distingue de cero. "
               "\\* Entre quienes dicen «no tuve necesidad».")
else:
    st.caption("Sin diferencias estimables para este segmento.")

# ------------------------------------------------------------------ clases latentes (notebook 23)
st.subheader("A las mismas horas, ¿quién declara más daño?")
st.caption(":orange-badge[exploratorio] :red-badge[sin doble revisión] · Esta tarjeta **no cambia con el filtro de segmento**: "
           "las clases se estimaron con todo el universo.")
p23 = datos.modelo("23_seg_perfiles.csv")
sel = datos.modelo("23_seg_seleccion_k.csv")
p2 = p23[p23.k == 2]
if sorted(p2.nombre.unique()) != ["Dificultad en la tarea", "Sin dificultad declarada"]:
    raise datos.DatoFaltante("23_seg_perfiles.csv: los nombres de las clases de k = 2 cambiaron; revisar el notebook 23.")
k_estable = int(sel.loc[sel.ARI_mediana.idxmax(), "k"])
if k_estable != 2:
    raise datos.DatoFaltante(f"23_seg_seleccion_k.csv: la solución más estable ahora es k = {k_estable}, no 2; revisar la tarjeta.")
tam = p2[p2.variable == "tamano"].set_index("nombre")
fr = datos.modelo("23_seg_dificultad_fuera_regla.csv").iloc[0]
x1, x2 = st.columns(2)
cl = tam.loc["Dificultad en la tarea"]
c.tile(x1, "Clase «Dificultad en la tarea»", c.pct(cl.pct), f"de las cuidadoras · {c.ic(cl.li90, cl.ls90)} · ≈ {c.millones(cl.total_expandido)}",
       cl.precision)
c.tile(x2, "Con dificultad y menos de 40 h", c.pct(fr.pct),
       f"del universo · {c.ic(fr.li90, fr.ls90)} · la regla de 40 h no las ve", fr.precision)
st.markdown("Un modelo de **clases latentes** separa a las cuidadoras por cómo viven la tarea, no por cuántas horas le dedican. "
            "Con dos clases (la solución más estable), una concentra a quienes declaran que les falta fuerza, que requieren apoyo, "
            "que la persona no coopera o que necesitan capacitación (ver el perfil abajo).")

dh = datos.modelo("23_seg_dano_por_horas.csv")
desen = st.selectbox("Desenlace", list(dh.desenlace.unique()), key="des23")
d = dh[dh.desenlace == desen]
fig = go.Figure()
for col_, nom_, color in [("con_dificultad", "Dificultad en la tarea", c.ALERTA), ("sin_dificultad", "Sin dificultad declarada", c.LAVANDA)]:
    fig.add_bar(name=nom_, x=d.horas, y=d[col_], marker_color=color, text=d[col_].map(lambda v: f"{v:.1f} %"), textposition="outside")
fig.update_layout(barmode="group", height=330, yaxis=dict(title="%", range=[0, 105]), legend=dict(orientation="h", y=1.12),
                  margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
c.mostrar(fig, "seg23")
txt = "; ".join(f"{r.horas.lower()}: {r.dif_pp:+.1f} pp (IC 90 % {r.dif_li90:+.1f} a {r.dif_ls90:+.1f})" for r in d.itertuples())
st.markdown(f"Diferencia entre clases — {txt}. "
            + ("En los dos grupos de horas la diferencia no cruza el cero: **a igual carga horaria, la dificultad en la tarea separa a "
               "quienes declaran más daño.**" if d.significativa.all() else "No en todos los grupos de horas la diferencia se distingue de cero."))

with st.expander("Perfil que define a cada clase y prueba contra una regla simple"):
    perf = p2[p2.variable.isin(["fuerza", "reqapoyo", "nocoopera", "capacitacion", "insatisfecha"])
              | ((p2.variable == "horas") & (p2.categoria == "80 h o más"))
              | ((p2.variable == "motivo") & (p2.categoria == "Obligación o «la única que podía»"))].copy()
    ETQ = {"fuerza": "Le falta fuerza física", "reqapoyo": "Requiere apoyo para cuidar", "nocoopera": "La persona no coopera",
           "capacitacion": "Necesita capacitación", "insatisfecha": "Insatisfecha con su tiempo libre", "horas": "Cuida 80 h o más",
           "motivo": "Cuida por obligación o porque «era la única»"}
    perf["rasgo"] = perf.variable.map(ETQ)
    piv = perf.pivot_table(index="rasgo", columns="nombre", values="pct").join(perf.groupby("rasgo").pct_total.first())
    st.dataframe(piv.rename(columns={"pct_total": "Todas"}).round(1), width="stretch")
    pa = datos.modelo("23_seg_comparacion_pareada.csv")
    pa2 = pa[pa.comparacion.str.startswith("k=2")]
    mx = pa2.dif_media.abs().max()
    sig = pa2[(pa2.p05 > 0) | (pa2.p95 < 0)]
    st.markdown(f"**Alternativa simple:** una regla de dificultad con dos grupos se comparó con las clases latentes en "
                f"{len(pa2)} desenlaces (validación cruzada). La diferencia máxima es de {mx:.2f} puntos y solo en "
                f"{len(sig)} desenlace(s) el intervalo 5–95 % no cruza el cero"
                + (f" ({', '.join(sig.desenlace)})" if len(sig) else "") + ". "
                "Es decir, el modelo casi no agrega precisión sobre la regla; su aporte es mostrar que la dificultad, "
                "y no solo las horas, organiza el daño.")
    bh = datos.modelo("23_seg_dano_por_bloque_horas.csv")
    no_int = bh[~bh.interpretable]
    if len(no_int):
        st.caption(f"Por bloque del cuestionario hay {len(no_int)} celdas no interpretables por muestra chica "
                   f"(n con dificultad = {', '.join(map(str, sorted(no_int.n_con.unique())))}).")
c.ficha(ENASIC + "; modelo de clases latentes sobre 7 indicadores de dificultad", "DW/marts/mart_modelos.csv (M23), desde 23_seg_*.csv (notebook 23)",
        "Nacional", precision="Las dos clases con precisión alta; algunas celdas por bloque de cuestionario, baja.",
        no_permite="Asignar una clase a una persona (son probabilidades) ni usarla como criterio de elegibilidad sin validar en el piloto; "
                   "causalidad; cifras de la CDMX.",
        lectura="Barras: % que declara el desenlace dentro de cada clase, separado por horas de cuidado.")

# ------------------------------------------------------------------ horas
st.subheader("¿Cuántas horas a la semana?")
h = S("horas")
med = h[h.categoria == "mediana"]
hh = h[h.categoria != "mediana"].copy()
c.mostrar(c.barras_ic(hh, "categoria", "estimacion", orden=False), "horas")
if not med.empty:
    st.markdown(f"Mediana: **{c.num(med.estimacion.iloc[0])} horas a la semana**.")
c.ficha(ENASIC, F12, "Nacional", no_permite="Comparar con la ENUT sin homologar definiciones; la ENASIC suma horas por bloques y "
        "trunca en «98 o más» por bloque.")

# ------------------------------------------------------------------ perfil del grupo
if dim == "Total":
    st.subheader("¿Quiénes forman el grupo del problema?")
    n = datos.necesidad()
    p = n[n.bloque == "perfil"].copy()
    p["serie"] = p.dominio_segmento
    p["fila"] = p.variable + ": " + p.categoria
    g = p[p.serie == "Grupo del problema"][["fila", "estimacion", "li90", "ls90", "precision", "dif_pp", "dif_significativa"]]
    u = p[p.serie == "Universo"][["fila", "estimacion"]].rename(columns={"estimacion": "universo"})
    t = g.merge(u, on="fila")
    t["diferencia"] = t.apply(lambda r: f"{r.dif_pp:+.1f} pp" + (" ✱" if r.dif_significativa == 1 else ""), axis=1)
    st.dataframe(t[["fila", "estimacion", "universo", "diferencia", "precision"]].rename(columns={
        "fila": "Característica", "estimacion": "Grupo del problema (%)", "universo": "Universo (%)",
        "diferencia": "Diferencia", "precision": "Precisión"}), hide_index=True, width="stretch",
        column_config={"Grupo del problema (%)": st.column_config.NumberColumn(format="%.1f"),
                       "Universo (%)": st.column_config.NumberColumn(format="%.1f")})
    st.caption("✱ La diferencia contra el universo se distingue de cero (IC 90 %).")
    c.ficha(ENASIC, "DW/marts/mart_necesidad_cuidado.csv (script 30, `30_perfil_grupo_salud3.csv`; versión 1 en `16_perfil_grupo_problema.csv`)", "Nacional",
            no_permite="Un perfil individual: son proporciones del grupo, no la descripción de una persona.")
