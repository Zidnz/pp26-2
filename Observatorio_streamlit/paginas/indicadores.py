"""Ficha de indicadores. Los valores se leen de los marts y resultados; las clases de evidencia
(confirmado, probable, desconocido) son la clasificación del equipo en Frontend/observatorio/build_datos.py."""
import pandas as pd
import streamlit as st

import componentes as c
import datos

c.encabezado("Indicadores", "¿Qué se puede medir hoy, con qué firmeza y qué no se puede medir?",
             "Cada indicador dice su universo y su nivel geográfico. «Desconocido» es una respuesta válida.")

E = datos.est
F07 = "mart_necesidad_cuidado (script 07)"
F03 = "mart_necesidad_cuidado (script 03)"
a = datos.asequibilidad()
t = datos.territorio()
P = "Piso legal 2026 (SM prof. personas trabajadoras del hogar)"


def aseq(geo, ing):
    return datos.una(a, "mart_asequibilidad.csv", geografia=geo, ingreso_referencia=ing, salario_referencia=P,
                     paquete="Relevo 6 h/sem", umbral_pct_ingreso=20)


def fila(dimension, nombre, definicion, valor, unidad, universo, precision, evidencia, fuente, li=None, ls=None):
    return dict(Dimensión=dimension, Indicador=nombre, Definición=definicion, Valor=valor, Unidad=unidad, li=li, ls=ls,
                Universo=universo, Precisión=precision, Evidencia=evidencia, Fuente=fuente)


def de(s, dimension, nombre, definicion, universo, evidencia, fuente, unidad="%"):
    return fila(dimension, nombre, definicion, float(s.estimacion), unidad, universo, s.precision, evidencia, fuente, s.li90, s.ls90)


gp = E('Peso en el universo | >=40 h, "sin necesidad" y daño a la salud (salud física, cansancio o sueño)')
d40 = E('"Sin necesidad" | >=40 h | Algún daño a la salud (física, cansancio, sueño)')
gp_v1 = E('Peso en el universo | >=40 h, "sin necesidad" y algún daño')
d40_v1 = E('"Sin necesidad" | >=40 h | Algún daño (salud o trabajo)')
h60 = datos.una(t, "mart_territorio.csv", medida_codigo="enigh22_hog60", cve_geo=9)
a6c, a6n = aseq("Ciudad de México", "Ingreso monetario (principal)"), aseq("México (nacional)", "Ingreso del hogar (ENASIC 2022)")
pago = datos.una(datos.res("04_pago_observado_cuidado.csv"), "04_pago", servicio="Cuidadora", grupo="todos los hogares", variable="pago_hora")
g27 = datos.modelo("27_v2_global.csv")
rs = datos.una(g27[g27.configuracion.str.startswith("PRIMARIO")], "27_v2_global.csv", puntaje="Regla >= 40 h")
dec = datos.modelo("18_tipologia_decision.csv")
oferta = t[t.medida_codigo == "oferta_nucleo_estab"].valor.sum()
U = "Cuidadoras de persona con discapacidad o 60+, nacional"

K = pd.DataFrame([
    fila("Demanda", "Hogares de la CDMX con alguien de 60+", "Hogares con al menos una persona de 60 años y más", h60.valor, "%",
         "Hogares, CDMX", h60.precision, "confirmado", "mart_territorio (ENIGH 2022)", h60.li90, h60.ls90),
    de(gp, "Demanda", "Grupo del problema", f"Cuidan 40 h o más, dicen «no tuve necesidad» y declaran daño a su salud (física, cansancio o sueño; DANO_SALUD3). Con «algún daño» (versión 1): {gp_v1.estimacion:.1f} %", U, "probable", "resultados/29_grupo_problema_salud3.csv"),
    de(E("Peso en el universo | >=40 h"), "Demanda", "Cuidado de alta intensidad", "Dedican 40 h o más a la semana", U, "confirmado", F07),
    de(E("Cuidan disc/60+ | En su casa"), "Demanda", "Preferencia por cuidado en casa", "Si contratara, lo querría en su casa (P6.46)", U, "confirmado", F03),
    de(E("Todas las cuidadoras | Buscó servicio (P6.42)"), "Demanda", "Búsqueda de servicios", "Buscó un lugar o servicio de cuidado (P6.42)",
       "Todas las personas cuidadoras, nacional", "confirmado", F03),
    de(E("Pob. 15-60 | Le gustaría ser cuidador(a) pagada(o)"), "Oferta", "Oferta declarada de cuidadoras",
       "Le gustaría trabajar como cuidador(a) si le pagaran (P6.47)", "Población de 15 a 60 años, nacional", "confirmado (intención, no oferta real)", F03),
    fila("Oferta", "Oferta institucional registrada", "Asilos y centros de día del núcleo SCIAN en el DENUE", oferta, "establecimientos", "CDMX",
         "no aplica", "probable (parte de los nombres no indica cuidado; revisión manual pendiente)", "mart_territorio (DENUE 05/2026)"),
    de(E("Hogares con discapacidad o 60+ | Contrata enfermería o cuidadora"), "Cobertura", "Contratación de cuidado",
       "Hogares con necesidad que contratan enfermería o cuidadora", "Hogares con persona con discapacidad o 60+, nacional", "confirmado", F03),
    fila("Cobertura", "Cobertura territorial oferta–necesidad", "Indicador por alcaldía que compare oferta y necesidad compatibles", None,
         "no medible", "CDMX", "no aplica", "desconocido: ningún par oferta–necesidad cumple la regla de compatibilidad", "matrices/pares_oferta_necesidad.csv"),
    fila("Tiempos", "Daño por intensidad de cuidado", f"Declara daño a su salud (física, cansancio o sueño; DANO_SALUD3), entre quienes cuidan 40 h o más y dicen «no tuve necesidad». Con «algún daño» (versión 1): {d40_v1.estimacion:.1f} %",
         d40.estimacion, "%", U, d40.precision, "probable", "resultados/07_enasic_necesidad_vs_norma_estimaciones.csv", d40.li90, d40.ls90),
    fila("Costos", "Asequibilidad del relevo 6 h/sem, CDMX", "Hogares que podrían pagar 6 h/sem sin rebasar el 20 % del ingreso monetario",
         a6c.pct_hogares_asequible, "%", "Hogares con persona con discapacidad o 60+, CDMX", a6c.precision,
         "probable (poder pagar no es querer contratar)", "mart_asequibilidad (ENIGH 2022)", a6c.li90, a6c.ls90),
    fila("Costos", "Asequibilidad del relevo 6 h/sem, nacional", "Ídem, con el ingreso del hogar de la ENASIC",
         a6n.pct_hogares_asequible, "%", "Hogares con necesidad, nacional", "sin varianza de diseño", "probable", "mart_asequibilidad (ENASIC 2022)"),
    fila("Costos", "Pago observado a cuidadoras", "Mediana del pago por hora a cuidadoras contratadas (pesos de 2026)",
         pago.mediana_pesos_2026, "$ por hora", "Hogares que contratan cuidadora, nacional", f"baja (n = {int(pago.n)}, sin ponderar)",
         "probable", "resultados/04_pago_observado_cuidado.csv"),
    fila("Contexto", "Viviendas sin internet en AGEB urbanas", "Viviendas sin internet ÷ viviendas (canal de la app)",
         100 * dec.viviendas_sin_internet.sum() / dec.viviendas.sum(), "%", "Viviendas en AGEB urbanas de 100 hab. o más, CDMX", "no aplica (censo)",
         "confirmado (Censo 2020; la conectividad pudo cambiar)", "resultados/18_tipologia_decision.csv"),
    fila("Contexto", "Personas de 60+ en AGEB con brecha de oferta", "Cuartil alto de 60+ y cuartil alto de distancia a una residencia o centro de día",
         dec.personas_60_en_brecha_q75.sum(), "personas", "AGEB urbanas, CDMX", "no aplica (censo)",
         "probable (umbral convencional; no mide capacidad, precio ni transporte)", "resultados/18_tipologia_decision.csv"),
    de(E("Todas cuidadoras que buscaron | Cumplió lo que buscaba"), "Calidad", "Satisfacción con el servicio buscado",
       "De quienes buscaron, dice que cumplió lo que buscaba", "Personas cuidadoras que buscaron, nacional", "confirmado", F03),
    fila("Calidad", "Calidad del cuidado domiciliario", "Trato, capacitación e incidentes del cuidado en casa", None, "no medible", "—", "no aplica",
         "desconocido: ninguna fuente del proyecto lo mide; lo tendría que medir el piloto", "—"),
    fila("Focalización", "Cobertura de la regla «40 h o más»", "Personas con el daño (salud física, cansancio o sueño; DANO_SALUD3, preregistrado) que la regla selecciona. Veredicto: no concluyente, se queda la regla; no prueba que sea mejor", rs.cobertura, "%", U,
         "IC 90 % del archivo", "probable", "resultados/27_v2_global.csv", rs.cob_li90, rs.cob_ls90),
])
K["Clase"] = K.Evidencia.str.split(r"[ :(]").str[0]

# ------------------------------------------------------------------ resumen y filtros
cnt = K.Clase.value_counts()
x1, x2, x3, x4 = st.columns(4)
c.tile(x1, "Indicadores", str(len(K)), "en esta ficha")
c.tile(x2, "Confirmados", str(cnt.get("confirmado", 0)), "fuente citable y medición directa")
c.tile(x3, "Probables", str(cnt.get("probable", 0)), "con la base de la inferencia explícita")
c.tile(x4, "Desconocidos", str(cnt.get("desconocido", 0)), "no medibles con las fuentes actuales")
f1, f2 = st.columns(2)
dims = f1.multiselect("Dimensión", list(K.Dimensión.unique()), default=list(K.Dimensión.unique()))
clases = f2.multiselect("Evidencia", list(K.Clase.unique()), default=list(K.Clase.unique()))
V = K[K.Dimensión.isin(dims) & K.Clase.isin(clases)]


def valor_txt(r):
    if r.Valor is None or pd.isna(r.Valor):
        return "no medible"
    if r.Unidad == "%":
        return c.pct(r.Valor)
    if r.Unidad.startswith("$"):
        return c.pesos(r.Valor)
    return c.num(r.Valor)


cols = st.columns(3)
for i, r in enumerate(V.itertuples()):
    with cols[i % 3]:
        with st.container(border=True):
            st.caption(f"{r.Dimensión} · {r.Clase}")
            st.markdown(f"**{r.Indicador}**")
            st.markdown(f"<div style='font-size:1.8rem;font-weight:700;color:{c.ALERTA if r.Clase == 'desconocido' else c.TINTA}'>"
                        f"{valor_txt(r)}</div>", unsafe_allow_html=True)
            st.caption(f"{r.Unidad} · {r.Universo}" + (f" · {c.ic(r.li, r.ls)}" if r.li is not None and not pd.isna(r.li) else ""))
            with st.popover("Ficha"):
                st.markdown(f"**Definición.** {r.Definición}  \n**Universo.** {r.Universo}  \n**Precisión.** {r.Precisión}  \n"
                            f"**Evidencia.** {r.Evidencia}  \n**Fuente.** `{r.Fuente}`")

with st.expander("Tabla completa (descargable)"):
    st.dataframe(V.drop(columns=["Clase"]), hide_index=True, width="stretch")
