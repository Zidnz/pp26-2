import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

import componentes as c
import datos

c.encabezado("¿Dónde?",
             "¿Qué tan grande es la necesidad en la CDMX y en qué alcaldías y zonas conviene empezar?",
             "Fuentes territoriales distintas de la ENASIC: ENIGH 2022 (entidad), Censo 2020 (AGEB), DENUE 05/2026, CONEVAL y CONAPO 2020.")

t = datos.territorio()
med = datos.medidas().set_index("codigo")
T1, T2, T3, T4 = st.tabs(["CDMX y alcaldías", "32 entidades", "Tipología de AGEB (piloto)", "¿En qué orden atender las zonas?"])

# ------------------------------------------------------------------ escala CDMX
with T1:
    st.subheader("¿Cuántos hogares de la CDMX tienen necesidad de cuidado?")
    h60 = datos.una(t, "mart_territorio.csv", medida_codigo="enigh22_hog60", cve_geo=9)
    nal = datos.una(t, "mart_territorio.csv", medida_codigo="enigh22_hog60", cve_geo=0)
    dim = datos.res("05_dimensionamiento_cdmx.csv")
    a, b = st.columns(2)
    c.tile(a, "Hogares de la CDMX con al menos una persona de 60+ · medición directa", c.pct(h60.valor),
           f"{c.ic(h60.li90, h60.ls90)} · ENIGH 2022 · nacional {c.pct(nal.valor)}", h60.precision)
    cota = dim.iloc[0]
    c.tile(b, "Hogares con persona con discapacidad o 60+ · cota inferior inferida", c.num(cota.valor),
           f"{cota.metodo} · evidencia {cota.evidencia}")
    st.caption(f"La cota inferida {cota.sesgo.split(':')[0].lower()}: {cota.sesgo.split(':', 1)[-1].strip()}")
    c.ficha("ENIGH 2022 (programa de cálculo CONEVAL) y script 05 (tasa nacional ENASIC × viviendas del Censo 2020)",
            "DW/marts/mart_territorio.csv · Analysis/resultados/05_dimensionamiento_cdmx.csv", "Entidad (CDMX)",
            no_permite="Sumar las dos cifras ni tratarlas como la misma medida: una incluye discapacidad y la otra no.")

    # ------------------------------------------------------------------ mapa por alcaldía
    st.subheader("Mapa por alcaldía")
    al = t[t.nivel_geografico == "Alcaldía"].copy()
    codigos = [k for k in al.medida_codigo.unique() if med.loc[k, "unidad"] != "categoría"]
    TEMA = {"oferta": "Oferta", "demanda": "Demanda", "contexto": "Contexto", "brecha": "Brecha"}
    tema = st.radio("Tema", list(TEMA), format_func=TEMA.get, horizontal=True)
    opciones = [k for k in codigos if al[al.medida_codigo == k].tema.iloc[0] == tema]
    k = st.selectbox("Medida", opciones, format_func=lambda x: f"{med.loc[x, 'nombre']} ({med.loc[x, 'unidad']})")
    m = med.loc[k]
    d = al[al.medida_codigo == k][["geografia", "abreviatura", "valor", "precision", "nota"]]
    todas = pd.DataFrame({"geografia": [f["properties"]["nombre"] for f in datos.geo_alcaldias()["features"]]})
    d = todas.merge(d, on="geografia", how="left")
    faltan = d[d.valor.isna()].geografia.tolist()

    avisos = []
    if m.aditiva == 1:
        avisos.append("**Es un conteo, no una tasa:** las alcaldías más pobladas salen arriba por tamaño.")
    if "mezcla" in str(m.calidad_valor):
        avisos.append("**Mezcla fuentes de años distintos** (DENUE 2026 con población de otro año).")
    if str(m.periodos) == "desconocido":
        avisos.append("**El año y el productor de este archivo no están documentados** (archivo P01–P03 del proyecto).")
    if not m.definicion_verificada:
        avisos.append("La definición de esta medida **no se ha verificado** contra el notebook que la produce.")
    if faltan:
        avisos.append(f"**Sin dato** (no es cero): {', '.join(faltan)}.")
    for x in avisos:
        st.warning(x, icon="⚠️")

    izq, der = st.columns([3, 2])
    with izq:
        fig = px.choropleth(d, geojson=datos.geo_alcaldias(), locations="geografia", featureidkey="properties.nombre",
                            color="valor", color_continuous_scale=[c.LAV_CLARO, c.LAVANDA, c.ACENTO, c.TINTA],
                            hover_name="geografia", hover_data={"geografia": False, "valor": ":,.2f", "precision": True})
        fig.update_geos(fitbounds="locations", visible=False, projection_type="mercator")
        fig.update_traces(marker_line_color="white", marker_line_width=1)
        # alcaldías sin dato en gris, para que no parezcan valor bajo
        if faltan:
            fig.add_trace(go.Choropleth(geojson=datos.geo_alcaldias(), locations=faltan, z=[0] * len(faltan),
                                        featureidkey="properties.nombre", colorscale=[[0, "#d6d6d6"], [1, "#d6d6d6"]],
                                        showscale=False, hovertemplate="%{location}: sin dato<extra></extra>", marker_line_color="white"))
        fig.update_layout(height=470, margin=dict(l=0, r=0, t=0, b=0), coloraxis_colorbar=dict(title=m.unidad, len=0.6, thickness=12),
                          paper_bgcolor="rgba(0,0,0,0)", geo=dict(bgcolor="rgba(0,0,0,0)"))
        c.mostrar(fig, "mapa")
    with der:
        dd = d.dropna(subset=["valor"])
        c.mostrar(c.barras_ic(dd, "abreviatura", "valor", li=None, ls=None, precision=None,
                              sufijo=" %" if m.unidad == "%" else "", titulo_x=m.unidad), "rank")
    c.ficha(f"{m.fuentes} · periodo: {m.periodos}", "DW/marts/mart_territorio.csv", "Alcaldía",
            precision=f"Calidad del valor: {m.calidad_valor}.",
            no_permite="Comparar oferta con necesidad por alcaldía: **ningún par oferta–necesidad cumple la regla de compatibilidad** "
                       "(población, territorio, unidad y periodo). Ver la tabla de abajo.",
            lectura=m.definicion)
    with st.expander("¿Por qué no hay un indicador de cobertura oferta–necesidad por alcaldía?"):
        st.dataframe(datos.leer("Analysis/matrices/pares_oferta_necesidad.csv"), hide_index=True, width="stretch")

    # ------------------------------------------------------------------ 32 entidades
with T2:
    st.subheader("La CDMX frente al país (32 entidades)")
    en = t[t.nivel_geografico.isin(["Entidad", "Nacional"])]
    ke = st.selectbox("Indicador (personas u hogares con 60+, ENIGH 2022)", list(en.medida_codigo.unique()),
                      format_func=lambda x: med.loc[x, "nombre"])
    e = en[en.medida_codigo == ke].copy()
    e["geografia"] = e.geografia.replace({"México (nacional)": "Nacional"})
    c.mostrar(c.barras_ic(e, "geografia", "valor", resaltar={"Ciudad de México", "Nacional"}), "estados")
    c.ficha("INEGI, ENIGH 2022; programa de cálculo de CONEVAL (reproducido y validado contra lo publicado)",
            "DW/marts/mart_territorio.csv (notebook A, sección 17)", "Entidad federativa",
            no_permite="Diferencias entre entidades cuyos intervalos se traslapan.")

    # ------------------------------------------------------------------ tipología de AGEB
with T3:
    st.subheader("¿Dónde hacer el piloto? Tipología de AGEB urbanas (modelo 2)")
    dec = datos.modelo("18_tipologia_decision.csv")
    tabla = dec[["nombre", "n_ageb", "poblacion", "personas_60", "pct_viviendas_sin_internet", "dist_oferta_km_mediana",
                 "pct_60_en_ageb_a_mas_de_1km", "ageb_brecha_q75", "personas_60_en_brecha_q75"]]
    st.dataframe(tabla.rename(columns={
        "nombre": "Tipo de zona", "n_ageb": "AGEB", "poblacion": "Población", "personas_60": "Personas 60+",
        "pct_viviendas_sin_internet": "% viviendas sin internet", "dist_oferta_km_mediana": "Distancia mediana a oferta (km)",
        "pct_60_en_ageb_a_mas_de_1km": "% de 60+ a más de 1 km", "ageb_brecha_q75": "AGEB en brecha",
        "personas_60_en_brecha_q75": "60+ en AGEB en brecha"}), hide_index=True, width="stretch",
        column_config={"Población": st.column_config.NumberColumn(format="%d"), "Personas 60+": st.column_config.NumberColumn(format="%d"),
                       "% viviendas sin internet": st.column_config.NumberColumn(format="%.1f"),
                       "Distancia mediana a oferta (km)": st.column_config.NumberColumn(format="%.2f"),
                       "% de 60+ a más de 1 km": st.column_config.NumberColumn(format="%.1f"),
                       "60+ en AGEB en brecha": st.column_config.NumberColumn(format="%d")})
    fig = go.Figure()
    for col, nombre, color in [("personas_60", "Personas de 60+", c.ACENTO), ("personas_60_en_brecha_q75", "…en AGEB con brecha de oferta", c.ALERTA)]:
        fig.add_bar(name=nombre, x=dec.nombre, y=dec[col], marker_color=color)
    fig.update_layout(barmode="group", height=320, yaxis_title="personas", legend=dict(orientation="h", y=1.12),
                      margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    c.mostrar(fig, "tipos")

    co = datos.modelo("18_tipologia_comparacion.csv")
    st.markdown("**¿Qué tan confiable es la tipología? Comparación contra alternativas simples**")
    fig = go.Figure(go.Bar(x=co.r2_9_variables, y=co.particion, orientation="h",
                           marker_color=[c.ACENTO if "modelo" in p else c.GRIS for p in co.particion],
                           text=co.r2_9_variables.map(lambda v: f"R² {v:.2f}"), textposition="outside"))
    fig.update_layout(height=200, xaxis=dict(range=[0, 1], title="R² sobre las 9 variables (0–1, sin cortar el eje)"),
                      margin=dict(l=10, r=30, t=10, b=30), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    c.mostrar(fig, "tip_comp")
    mod = co[co.particion.str.contains("modelo")].iloc[0]
    regla = co[co.particion.str.contains("Regla")].iloc[0]
    txt = (f"El k-means explica **{mod.r2_9_variables:.2f}** de la variación de las 9 variables; la regla simple «60+ × internet» "
           f"explica **{regla.r2_9_variables:.2f}** (ARI mínimo entre corridas: {mod.ari_min:.2f} y {regla.ari_min:.2f}). ")
    if co.eta2_log_distancia_oferta.max() < 0.1:
        txt += (f"Ninguna partición separa la distancia a la oferta (η² ≤ {co.eta2_log_distancia_oferta.max():.2f}): "
                "**la brecha de oferta no es una propiedad del tipo de zona**, hay que verla AGEB por AGEB.")
    st.markdown(txt)
    c.ficha("INEGI Censo 2020 por AGEB urbana; DENUE 05/2026 (235 establecimientos núcleo); Marco Geoestadístico 2025",
            "DW/marts/mart_modelos.csv (M18), desde 18_tipologia_*.csv (notebook D, sección 18)", "AGEB urbana (se publica agregada por tipo)",
            precision="No aplica (censo). Brecha = cuartil alto de 60+ y cuartil alto de distancia en línea recta.",
            no_permite="Capacidad, precio o transporte (la distancia es en línea recta y la oferta son establecimientos, no plazas); "
                       "que una zona necesite cuidado: la tipología describe población, no demanda de cuidado.")

    # -------------------------------------------------------------- mapa por AGEB (notebook D, sección 18)
    st.markdown("#### Mapa de las AGEB urbanas")
    ag = datos.ageb().copy()
    geo_ag, geo_al = datos.geo_ageb()
    faltan_geo = set(ag.CVEGEO) - {f["properties"]["id"] for f in geo_ag["features"]}
    if faltan_geo:
        raise datos.DatoFaltante(f"18_tipologia_contornos.geojson no tiene polígono para {len(faltan_geo)} AGEB del modelo.")
    CAPAS = {"tipo": "Tipo de zona (modelo 2)", "brecha": "Brecha de oferta (cuartil alto de 60+ y de distancia)",
             "pct_sin_int": "% de viviendas sin internet", "pct_60": "% de población de 60+"}
    capa = st.radio("Capa", list(CAPAS), format_func=CAPAS.get, horizontal=True, key="capa_ageb")
    ver_oferta = st.toggle("Mostrar los establecimientos núcleo del DENUE (asilos y centros de día)", value=capa == "brecha")
    nombres = dict(zip(ag.tipo, ag.tipo_nombre))
    hover = ("<b>%{customdata[0]}</b><br>AGEB %{location}<br>Tipo: %{customdata[1]}<br>Población 60+: %{customdata[2]:,}"
             "<br>% 60+: %{customdata[3]:.1f} · sin internet: %{customdata[4]:.1f} %<br>Distancia a oferta: %{customdata[5]:.2f} km"
             "<br>%{customdata[6]}<extra></extra>")
    ag["nota"] = ag.frontera.map({True: "Frontera entre dos tipos: asignación menos firme", False: ""})
    cd = ag[["alcaldia", "tipo_nombre", "n_60", "pct_60", "pct_sin_int", "dist_oferta_km", "nota"]].values
    fig = go.Figure()
    if capa == "tipo":
        for t_, col in zip(sorted(nombres), c.TIPOS):
            x = ag[ag.tipo == t_]
            fig.add_trace(go.Choropleth(geojson=geo_ag, featureidkey="properties.id", locations=x.CVEGEO, z=[1] * len(x),
                                        colorscale=[[0, col], [1, col]], showscale=False, name=nombres[t_], showlegend=True,
                                        customdata=x[["alcaldia", "tipo_nombre", "n_60", "pct_60", "pct_sin_int", "dist_oferta_km", "nota"]].values,
                                        hovertemplate=hover, marker_line_width=0.2, marker_line_color="white"))
    elif capa == "brecha":
        b = ag.brecha_q75.astype(int)
        fig.add_trace(go.Choropleth(geojson=geo_ag, featureidkey="properties.id", locations=ag.CVEGEO, z=b,
                                    colorscale=[[0, "#e6e1ef"], [0.5, "#e6e1ef"], [0.5, c.ALERTA], [1, c.ALERTA]], zmin=0, zmax=1,
                                    showscale=False, customdata=cd, hovertemplate=hover, marker_line_width=0.2, marker_line_color="white"))
    else:
        fig.add_trace(go.Choropleth(geojson=geo_ag, featureidkey="properties.id", locations=ag.CVEGEO, z=ag[capa],
                                    colorscale=[c.LAV_CLARO, c.LAVANDA, c.ACENTO, c.TINTA], customdata=cd, hovertemplate=hover,
                                    colorbar=dict(title="%", len=0.6, thickness=12), marker_line_width=0.2, marker_line_color="white"))
    fig.add_trace(go.Choropleth(geojson=geo_al, featureidkey="properties.id", locations=[f["properties"]["id"] for f in geo_al["features"]],
                                z=[0] * len(geo_al["features"]), colorscale=[[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,0)"]], showscale=False,
                                marker_line_color=c.TINTA, marker_line_width=1.2, hoverinfo="skip"))
    if ver_oferta:
        of = datos.res("18_oferta_nucleo_puntos.csv")      # puntos: el DW no los carga (ver DW/docs/modelo_dimensional.md §7)
        fig.add_trace(go.Scattergeo(lon=of.lon, lat=of.lat, mode="markers", name=f"Oferta núcleo ({len(of)})",
                                    marker=dict(size=5, color="#1f8a70", line=dict(color="white", width=0.6)),
                                    text=of.nombre_act, hovertemplate="%{text}<extra></extra>"))
    fig.update_geos(fitbounds="locations", visible=False, projection_type="mercator")
    fig.update_layout(height=620, margin=dict(l=0, r=0, t=0, b=0), paper_bgcolor="rgba(0,0,0,0)", geo=dict(bgcolor="rgba(0,0,0,0)"),
                      legend=dict(orientation="h", y=1.02, x=0))
    c.mostrar(fig, "mapa_ageb")
    if capa == "brecha":
        st.markdown(f"**{int(ag.brecha_q75.sum())} AGEB** cumplen las dos condiciones a la vez: están en el cuartil alto de personas de 60+ "
                    f"y en el cuartil alto de distancia en línea recta a la oferta núcleo. Ahí viven **{c.num(ag.loc[ag.brecha_q75, 'n_60'].sum())}** "
                    "personas de 60+.")
    st.caption(f"{len(ag):,} AGEB urbanas con 100 habitantes o más. {int(ag.frontera.sum())} AGEB están en la frontera entre dos tipos "
               "(se indica al pasar el cursor). Pasa el cursor sobre una AGEB para ver sus datos.")
    c.ficha("INEGI Censo 2020 por AGEB urbana; DENUE 05/2026 (clases núcleo); INEGI Marco Geoestadístico 2025 (simplificado a 15 m)",
            "DW/marts/mart_ageb.csv (desde 18_tipologia_ageb.csv y 24_brecha_ageb.csv); contornos y puntos: "
            "Analysis/resultados/18_tipologia_contornos.geojson y 18_oferta_nucleo_puntos.csv (notebook D)",
            "AGEB urbana", precision="No aplica (censo, sin muestreo).",
            no_permite="Necesidad de cuidado por AGEB (el Censo no la mide); capacidad, precio o transporte de la oferta. "
                       "Los datos son de 2020: la población y la conectividad pudieron cambiar.",
            lectura="El tipo resume nueve variables del Censo; no es un índice de prioridad. La brecha es una bandera, no un puntaje.")

# ------------------------------------------------------------------ orden de atención (scripts 24 y 25)
with T4:
    st.markdown("**¿En qué orden atender las alcaldías?** Una regla **sin pesos**, no un modelo: no existe una variable de resultado "
                "observada contra la cual validar un orden.")
    pr = datos.prioridad()
    if len(pr) != 16 or pr.nivel_modal.isna().any():
        raise datos.DatoFaltante("mart_perfil_alcaldia.csv no trae el nivel de la regla del script 24 para las 16 alcaldías.")
    pr["nivel_modal"] = pr.nivel_modal.astype(int)
    st.markdown("""
Para cada alcaldía se miden dos cosas distintas sobre las AGEB con brecha de oferta:
- **Volumen (N):** cuántas personas de 60+ viven en esas AGEB.
- **Concentración (P):** qué porcentaje de las personas de 60+ de la alcaldía son.

Una alcaldía queda en **nivel 1** si está entre las K primeras por las dos medidas; en **nivel 2** si solo por una; en **nivel 3** si
tiene brecha pero no entra en ninguna cabeza; en **nivel 4** si no tiene AGEB con brecha. Se repite con 3 cortes de brecha
(tercil, cuartil, quintil) × 3 tamaños de cabeza (K = 4, 5, 6) = **9 combinaciones**.
""")
    corte = st.radio("Corte de brecha para la gráfica", ["tercil", "cuartil", "quintil"], index=1, horizontal=True)
    NIV = {1: c.ALERTA, 2: c.ACENTO, 3: c.LAVANDA, 4: c.GRIS}
    NIV_T = {1: "1 · Doble (volumen y concentración)", 2: "2 · Una sola medida", 3: "3 · Brecha menor", 4: "4 · Sin brecha"}
    fig = go.Figure()
    for n_, g_ in pr.groupby("nivel_modal"):
        fig.add_scatter(x=g_[f"N_{corte}"], y=g_[f"P_{corte}"], mode="markers+text", name=NIV_T[n_], text=g_.alcaldia,
                        textposition="top center", textfont=dict(size=11),
                        marker=dict(size=14, color=NIV[n_], symbol=["circle" if e else "circle-open" for e in g_.estable],
                                    line=dict(width=2, color=NIV[n_])),
                        hovertemplate="%{text}<br>N = %{x:,} personas de 60+<br>P = %{y:.1f} %<extra></extra>")
    fig.update_layout(height=520, xaxis_title=f"Volumen N: personas de 60+ en AGEB con brecha ({corte})",
                      yaxis_title="Concentración P: % de las 60+ de la alcaldía", legend=dict(orientation="h", y=1.08),
                      margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    fig.update_xaxes(gridcolor="#e8e5f0"); fig.update_yaxes(gridcolor="#e8e5f0")
    c.mostrar(fig, "orden_np")
    st.caption("El color es el nivel más frecuente en las 9 combinaciones (nivel modal). Círculo lleno: la alcaldía cae en el mismo "
               "nivel en las 9 (estable). Círculo vacío: cambia de nivel según el corte o K.")

    # Dentro de un nivel el orden es alfabético a propósito: la regla no ordena alcaldías del mismo nivel.
    tab = pr.sort_values(["nivel_modal", "alcaldia"])[["alcaldia", "etiqueta_modal", "combinaciones_en_modal", "estable", "nivel_min",
                                                      "nivel_max", "N_cuartil", "P_cuartil", "pct_brecha_en_5_ageb_mayores"]].copy()
    tab["combinaciones_en_modal"] = tab.combinaciones_en_modal.astype(int).astype(str) + " de 9"
    tab["rango de niveles"] = tab.nivel_min.astype(int).astype(str) + "–" + tab.nivel_max.astype(int).astype(str)
    st.dataframe(tab.drop(columns=["nivel_min", "nivel_max"]).rename(columns={
        "alcaldia": "Alcaldía", "etiqueta_modal": "Nivel modal", "combinaciones_en_modal": "Veces en ese nivel",
        "estable": "Estable", "N_cuartil": "N (cuartil)", "P_cuartil": "P % (cuartil)",
        "pct_brecha_en_5_ageb_mayores": "% de N en sus 5 AGEB mayores"}), hide_index=True, width="stretch",
        column_config={"N (cuartil)": st.column_config.NumberColumn(format="%d"), "P % (cuartil)": st.column_config.NumberColumn(format="%.1f"),
                       "% de N en sus 5 AGEB mayores": st.column_config.NumberColumn(format="%.1f")})
    est = pr[pr.estable]
    st.markdown(f"**Solo {len(est)} de 16** alcaldías caen en el mismo nivel en las 9 combinaciones "
                f"({', '.join(est.alcaldia)}). Dentro de cada nivel la tabla va en orden alfabético: la regla **no ordena** alcaldías "
                "del mismo nivel.")
    conc = pr[pr.pct_brecha_en_5_ageb_mayores >= 60].alcaldia.tolist()
    if conc:
        st.info(f"En {len(conc)} alcaldías, 60 % o más de su volumen en brecha está en sus 5 AGEB más grandes: ahí la decisión real es "
                "**en qué AGEB**, no en qué alcaldía.", icon="📍")
    c.ficha("INEGI Censo 2020 por AGEB (n_60) y DENUE 05/2026 (distancia en línea recta a la oferta núcleo), vía notebook D",
            "DW/marts/mart_perfil_alcaldia.csv (columnas prioridad_*) y mart_modelos.csv (M24), desde el script 24_prioridad_zonas.py",
            "Alcaldía (desde AGEB)",
            precision="No aplica (censo).",
            no_permite="Que una alcaldía necesite más cuidado que otra (no hay medida de necesidad por alcaldía); capacidad, precio o "
                       "transporte; un orden fino dentro de cada nivel.",
            lectura="Volumen y concentración responden preguntas distintas: dónde hay más personas afectadas y dónde la brecha pesa más "
                    "sobre la población local. La regla no decide cuál importa más.")

    st.markdown("#### ¿Y si se usara un índice con pesos? (prueba del script 25)")
    rg = datos.modelo("25_indice_con_pesos_rangos.csv").sort_values("rango_mediana")
    cab = datos.modelo("25_indice_con_pesos_cabezas.csv")
    fig = go.Figure(go.Scatter(x=rg.rango_mediana, y=rg.alcaldia, mode="markers", marker=dict(size=11, color=c.ACENTO),
                               error_x=dict(type="data", symmetric=False, array=rg.rango_max - rg.rango_mediana,
                                            arrayminus=rg.rango_mediana - rg.rango_min, color=c.TINTA),
                               hovertemplate="%{y}: mediana %{x}<extra></extra>"))
    fig.update_layout(height=480, xaxis=dict(title="Lugar en el índice (1 = primero): mediana y rango", dtick=1, range=[0.5, 16.5]),
                      margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    fig.update_yaxes(autorange="reversed")
    c.mostrar(fig, "indice25")
    k5 = cab[cab.K == 5].iloc[0]
    st.markdown(f"Moviendo el peso del volumen (0.3 a 0.7), la forma de normalizar y el corte ({int(rg.configuraciones.iloc[0])} configuraciones), "
                f"el lugar de varias alcaldías cambia mucho. Con K = 5 aparecen **{int(k5.conjuntos_distintos)} grupos de cabeza distintos** en "
                f"{int(k5.configuraciones)} configuraciones, y el más frecuente solo sale {int(k5.mas_frecuente_veces)} veces. "
                "El peso es una decisión normativa que los datos no resuelven: por eso el Observatorio publica la regla sin pesos con su "
                "sensibilidad, no un índice.")
    c.ficha("Derivado de 24_prioridad_alcaldia.csv", "DW/marts/mart_modelos.csv (M25), desde 25_indice_con_pesos_*.csv (script 25_prueba_indice_con_pesos.py)",
            "Alcaldía", no_permite="Escoger un peso «correcto»: no hay variable de resultado contra la cual validarlo.")
