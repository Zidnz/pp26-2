import plotly.graph_objects as go
import streamlit as st

import componentes as c
import datos

c.encabezado("Los datos que cuidan",
             "¿Quién cuida, cuánto le cuesta y qué tan lejos queda la ayuda?",
             "Observatorio de Datos para la Economía del Cuidado · Equipo 3 · LCDN 7.º semestre, UNRC 2026-2")

st.markdown("""
Este Observatorio reúne **agregados de fuentes públicas** (ENASIC 2022, ENIGH 2022, Censo 2020, DENUE, CONEVAL, CONAPO)
para responder una pregunta de diseño: **a quién ofrecer primero un relevo de cuidado en casa y dónde empezar el piloto.**
Cada gráfica dice de dónde sale, qué tan firme es y qué no permite afirmar.
""")

# ------------------------------------------------------------------ embudo
st.subheader("¿Cuántas personas están en el problema?")
pasos = [
    ("Personas de 15 años y más que cuidan", datos.est("Población 15+ que brinda cuidados (publicado: 32.0%, 31.7 M)")),
    ("Cuidan a una persona con discapacidad o de 60+",
     sum(datos.est(f"Peso en el universo | {h}").total_expandido for h in ["<20 h", "20-39 h", ">=40 h"])),
    ("Cuidan 40 h o más a la semana", datos.est("Peso en el universo | >=40 h")),
    ("…no buscaron servicios y dicen «no tuve necesidad»", datos.est("Horas | >=40 h | No ha tenido necesidad")),
    ("…y declaran daño a su salud (física, cansancio o sueño)", datos.est('Peso en el universo | >=40 h, "sin necesidad" y daño a la salud (salud física, cansancio o sueño)')),
]
valores = [p[1] if isinstance(p[1], float) else float(p[1].total_expandido) for p in pasos]
fig = go.Figure(go.Funnel(y=[p[0] for p in pasos], x=valores, textinfo="text",
                          text=[c.millones(v) for v in valores],
                          marker=dict(color=[c.LAV_CLARO, c.LAVANDA, c.ACENTO, c.ACENTO, c.ALERTA])))
fig.update_layout(height=330, margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)",
                  plot_bgcolor="rgba(0,0,0,0)", font=dict(color=c.TINTA, size=13))
c.mostrar(fig, "embudo")
gp = pasos[4][1]
st.markdown(f"El **grupo del problema** son **{c.num(gp.total_expandido)} personas** "
            f"({c.pct(gp.estimacion)} del universo de quienes cuidan a alguien con discapacidad o de 60+, {c.ic(gp.li90, gp.ls90)}): "
            "cargan la jornada más larga, dicen que no han necesitado ayuda y aun así declaran daño.")
c.ficha("INEGI, ENASIC 2022 (tablas TCSDEMPO y TPOB_CUI, factores de expansión de cada tabla)",
        "DW/marts/mart_necesidad_cuidado.csv (scripts 03 y 07)", "Nacional",
        precision="Todas las etapas con precisión alta.",
        no_permite="Cifras para la CDMX o por alcaldía; tendencias (es la primera edición). "
                   "El segundo paso es la suma de tres grupos de horas del mismo universo, no una estimación publicada por INEGI.",
        lectura="Cada barra es un subconjunto de la anterior. Los pasos 1 y 2 usan universos distintos de la ENASIC "
                "(población de 15+ y población cuidadora de personas con discapacidad o 60+).")

# ------------------------------------------------------------------ lo que encontramos
st.subheader("Lo que encontramos")
busco = datos.est("Cuidan discapacidad o 60+ | Buscó servicio (P6.42)")
dano40 = datos.est('"Sin necesidad" | >=40 h | Algún daño a la salud (física, cansancio, sueño)')
casa = datos.est("Cuidan disc/60+ | En su casa")
a = datos.asequibilidad()
r6 = datos.una(a, "mart_asequibilidad.csv", geografia="Ciudad de México", ingreso_referencia="Ingreso monetario (principal)",
               salario_referencia="Piso legal 2026 (SM prof. personas trabajadoras del hogar)", paquete="Relevo 6 h/sem",
               umbral_pct_ingreso=20)
alt = datos.modelo("27_v2_global.csv")
lg = datos.una(alt[alt.configuracion.str.startswith("PRIMARIO")], "27_v2_global.csv", puntaje="Logística")

c1, c2, c3 = st.columns(3)
c.tile(c1, "Buscaron un servicio de cuidado", c.pct(busco.estimacion),
       f"de quienes cuidan a alguien con discapacidad o 60+ · {c.ic(busco.li90, busco.ls90)} · nacional", busco.precision)
c.tile(c2, "Declaran daño a su salud (40 h o más y «sin necesidad»)", c.pct(dano40.estimacion),
       f"{c.ic(dano40.li90, dano40.ls90)} · nacional · DANO_SALUD3, script 07", dano40.precision)
c.tile(c3, "Si contrataran, lo querrían en su casa", c.pct(casa.estimacion),
       f"{c.ic(casa.li90, casa.ls90)} · nacional", casa.precision)
c4, c5, c6 = st.columns(3)
c.tile(c4, "Hogares de la CDMX que podrían pagar 6 h/sem", c.pct(r6.pct_hogares_asequible),
       f"sin rebasar el 20 % del ingreso monetario · {c.ic(r6.li90, r6.ls90)} · ENIGH 2022. Poder pagar no es querer contratar.",
       r6.precision)
sig = (lg.dif_li90 > 0) or (lg.dif_ls90 < 0)
c.tile(c5, "Regresión logística frente a la regla «40 h o más»", f"{lg.dif_vs_comparador_pp:+.1f} pp",
       f"de cobertura de personas con el daño (salud física, cansancio o sueño) · IC 90 % {lg.dif_li90:+.1f} a {lg.dif_ls90:+.1f} · "
       + ("se distingue de cero" if sig else "**no se distingue de la regla**"))
t = datos.territorio()
h60 = datos.una(t, "mart_territorio.csv", medida_codigo="enigh22_hog60", cve_geo=9)
c.tile(c6, "Hogares de la CDMX con alguien de 60+", c.pct(h60.valor),
       f"{c.ic(h60.li90, h60.ls90)} · ENIGH 2022 (CONEVAL)", h60.precision)
st.caption("Cada tarjeta lleva a su pestaña en la barra lateral. Las cifras nacionales vienen de la ENASIC; "
           "las de la CDMX, de la ENIGH 2022 o del Censo 2020.")
