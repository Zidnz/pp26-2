"""Construye datos_observatorio.json, js/datos/datos.js, js/datos/geo.js y js/datos/geo-estados.js a partir de los archivos de resultados del repositorio.

Observatorio del Cuidado (actualizado el 6 oct 2026).
Ninguna cifra del Observatorio se escribe a mano: todas se leen aquí de Analysis/resultados, Analysis/outputs y
Analysis/matrices. Si un archivo cambia, se vuelve a correr este script y la página se regenera.

Uso (desde la raíz del repo):  python Frontend/observatorio/build_datos.py
Opcional: python Frontend/observatorio/build_datos.py <ruta_raiz_repo>

Archivos que lee (todos deben existir; si falta uno, el script se detiene en lugar de publicar un hueco):
  resultados/02_fichas_fuentes.csv, 02_indice_capacidad_residencial.csv
  resultados/03_enasic_barreras_estimaciones.csv
  resultados/04_contratacion_por_quintil.csv, 04_pago_observado_cuidado.csv, 04_resumen.csv
  resultados/05_dimensionamiento_cdmx.csv, 05_tasas_y_anclajes.csv
  resultados/06_subsidio_por_paquete.csv, 06_anclas_presupuestales.csv, 06_escala_nacional.csv
  resultados/07_enasic_necesidad_vs_norma_estimaciones.csv, 07_enasic_diferencias.csv
  resultados/08_dependencia_severa_alcaldia.csv, 08_brecha_cuidado_sexo.csv, 08_calidad_datos.csv
  resultados/09_pobreza_65mas_alcaldia_cdmx.csv
  resultados/10_asequibilidad_relevo.csv
  resultados/13_rezago_por_alcaldia.csv, 13_calidad_rezago.csv (rezago social por AGEB, CONEVAL 2020)
  resultados/16_perfil_grupo_problema.csv, 16_distribucion_horas.csv (perfil del grupo y horas, script 16)
  matrices/diccionario_observatorio.csv (diccionario de variables y de esta base; el script se detiene si falta un bloque)
  resultados/14_enigh_asequibilidad_cdmx.csv, 14_enigh_resumen.csv (asequibilidad con ingreso ENIGH 2022, nacional y CDMX)
  resultados/12_segmentacion_estimaciones.csv (filtros de segmentación)
  resultados/11_modelo_focalizacion_global.csv, _por_grupo.csv, _sensibilidad.csv, 11_modelo_coeficientes_logit.csv
  outputs/indice_por_tipo_servicio.csv, outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv
  matrices/inventario_fuentes_cuidado.csv, matrices/pares_oferta_necesidad.csv
  Frontend/js/cdmx-alcaldias.js (límites de alcaldías, INEGI Marco Geoestadístico 2020)
  resultados/17_enigh_60mas_por_entidad.csv, 17_marginacion_entidad_conapo_2020.csv, 17_validacion_enigh.csv (contexto estatal)
  resultados/13_rezago_ageb_cdmx.csv (zonas: una fila por AGEB urbana)
  Frontend/vendor/svg-maps-mexico/index.js (contornos esquemáticos de las 32 entidades, CC BY 4.0)
  resultados/18_tipologia_*.csv, 18_tipologia_contornos.geojson, 18_oferta_nucleo_puntos.csv (tipología de AGEB, notebook D, sección 18)
"""
import json, sys
from pathlib import Path
import pandas as pd

RAIZ = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2]
A = RAIZ / 'Analysis'
R = A / 'resultados'
AQUI = Path(__file__).resolve().parent


def leer(p):
    return pd.read_csv(p, encoding='utf-8-sig')


def nn(x):
    """Convierte NaN a None y numpy a tipos nativos para JSON."""
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return None
    if hasattr(x, 'item'):
        return x.item()
    return x


def fila(df, texto):
    m = df[df.indicador == texto]
    if len(m) != 1:
        raise SystemExit(f'No encontré exactamente una fila para: {texto!r} ({len(m)})')
    r = m.iloc[0]
    out = {k: (None if pd.isna(r[k]) else (float(r[k]) if k != 'precision' else r[k]))
           for k in ['pct', 'cv', 'li90', 'ls90', 'total_expandido', 'precision'] if k in r}
    out['n'] = int(r['n_muestra_dominio'])
    return out


def una(df, **cond):
    m = df
    for k, v in cond.items():
        m = m[m[k] == v]
    if len(m) != 1:
        raise SystemExit(f'No encontré exactamente una fila para {cond} ({len(m)})')
    return m.iloc[0]


e03 = leer(R / '03_enasic_barreras_estimaciones.csv')
e07 = leer(R / '07_enasic_necesidad_vs_norma_estimaciones.csv')
d07 = leer(R / '07_enasic_diferencias.csv')
F03, F07 = 'Analysis/resultados/03_enasic_barreras_estimaciones.csv', 'Analysis/resultados/07_enasic_necesidad_vs_norma_estimaciones.csv'

D = {'actualizado': '6 oct 2026', 'generado_desde': 'Analysis/resultados, Analysis/outputs y Analysis/matrices (ver build_datos.py)'}

# ---------------------------------------------------------------- Hallazgo principal (03, 07)
D['clave'] = {
    'busco_todas': fila(e03, 'Todas las cuidadoras | Buscó servicio (P6.42)') | {'fuente': F03},
    'busco_obj': fila(e03, 'Cuidan discapacidad o 60+ | Buscó servicio (P6.42)') | {'fuente': F03},
    'grupo_problema': fila(e07, 'Peso en el universo | >=40 h, "sin necesidad" y algún daño') | {'fuente': F07},
    'nucleo_duro': fila(e07, 'Peso en el universo | ABVD y >=40 h') | {'fuente': F07},
    'pesa_40': fila(e07, 'Peso en el universo | >=40 h') | {'fuente': F07},
    'unas_horas': fila(e07, 'P7_8 | De acuerdo: solo unas horas') | {'fuente': F07},
    'unas_horas_40': fila(e07, 'P7_8 | >=40 h | De acuerdo: solo unas horas') | {'fuente': F07},
    'familia': fila(e07, 'P7_7 | Familia') | {'fuente': F07},
    'no_residencia': fila(e07, 'P7_8 | No está de acuerdo') | {'fuente': F07},
    'iniciativa': fila(e07, 'P6_38 | Iniciativa propia') | {'fuente': F07},
    'cumplio': fila(e03, 'Todas cuidadoras que buscaron | Cumplió lo que buscaba') | {'fuente': F03},
}

seg = ['<20 h', '20-39 h', '>=40 h']
D['carga'] = {
    'segmentos': seg,
    'sin_necesidad': [fila(e07, f'Horas | {s} | No ha tenido necesidad') for s in seg],
    'dano': [fila(e07, f'"Sin necesidad" | {s} | Algún daño (salud o trabajo)') for s in seg],
    'salud_fisica': [fila(e07, f'"Sin necesidad" | {s} | Salud física deteriorada') for s in seg],
    'nucleo_sin_necesidad': fila(e07, 'ABVD y >=40 h | No ha tenido necesidad'),
    'nucleo_dano': fila(e07, '"Sin necesidad" | ABVD y >=40 h | Algún daño (salud o trabajo)'),
    'diferencias': d07.round(1).to_dict('records'),
    'fuente': F07 + ' · Analysis/resultados/07_enasic_diferencias.csv',
}

# Embudo del problema (03, 07): de todas las personas cuidadoras al grupo del problema
uni = sum(fila(e07, f'Peso en el universo | {s}')['total_expandido'] for s in seg)
D['embudo'] = [
    {'etapa': 'Personas de 15 años y más que cuidan', 'total': fila(e03, 'Población 15+ que brinda cuidados (publicado: 32.0%, 31.7 M)')['total_expandido'], 'fuente': F03},
    {'etapa': 'Cuidan a una persona con discapacidad o de 60+', 'total': uni, 'fuente': F07 + ' (suma de los tres grupos de horas)'},
    {'etapa': 'Cuidan 40 h o más a la semana', 'total': fila(e07, 'Peso en el universo | >=40 h')['total_expandido'], 'fuente': F07},
    {'etapa': 'No buscaron servicios y dicen "no tuve necesidad"', 'total': fila(e07, 'Horas | >=40 h | No ha tenido necesidad')['total_expandido'], 'fuente': F07},
    {'etapa': 'Y declaran daño a su salud o su trabajo', 'total': fila(e07, 'Peso en el universo | >=40 h, "sin necesidad" y algún daño')['total_expandido'], 'fuente': F07},
]

# Segmentación (script 12): una fila por segmento × indicador, con CV, IC y diferencia contra el resto
sg = leer(R / '12_segmentacion_estimaciones.csv')
D['seg'] = [{k: nn(v) for k, v in r.items()} for r in
            sg[['dimension', 'segmento', 'clave', 'indicador', 'grupo', 'pct', 'cv', 'li90', 'ls90', 'n_muestra_dominio',
                'precision', 'dif_pp', 'dif_li90', 'dif_ls90', 'dif_significativa']].to_dict('records')]
D['seg_fuente'] = 'Analysis/resultados/12_segmentacion_estimaciones.csv (script 12)'

# Perfil del grupo del problema y distribución de horas (script 16)
pf = leer(R / '16_perfil_grupo_problema.csv')
D['perfil'] = [{k: nn(v) for k, v in r.items()} for r in
               pf[['dimension', 'segmento', 'poblacion', 'pct', 'cv', 'li90', 'ls90', 'n_muestra_dominio', 'precision',
                   'dif_pp', 'dif_li90', 'dif_ls90', 'dif_significativa']].to_dict('records')]
hd = leer(R / '16_distribucion_horas.csv')
def _h(et):
    m = hd[hd.etiqueta == et]
    if len(m) != 1:
        raise SystemExit(f'16_distribucion_horas.csv: no encontré exactamente una fila "{et}"')
    return {k: nn(v) for k, v in m.iloc[0].items()}
D['horas_dist'] = {
    'rangos': [{k: nn(v) for k, v in r.items()} for r in
               hd[hd.desde.notna() & hd.hasta.notna()][['etiqueta', 'desde', 'hasta', 'pct', 'cv', 'li90', 'ls90', 'precision', 'n_muestra_dominio']].to_dict('records')],
    'mediana': _h('mediana ponderada (horas)')['pct'],
    'tope98': _h('declara el tope "98 o más" en un bloque'),
    'fuente': 'Analysis/resultados/16_perfil_grupo_problema.csv y 16_distribucion_horas.csv (script 16)',
}

# ---------------------------------------------------------------- Barreras (03, 04, 07)
RAZ = [('No ha tenido necesidad', 'No tuvo necesidad'), ('El propio hogar cuida', 'El propio hogar cuida'),
       ('Apoyan otros hogares/familiares/conocidos', 'Apoyan otros familiares'), ('Lejanía', 'Lejanía'),
       ('Son caros', 'Son caros'), ('DESCONOCE QUE EXISTEN', 'No saben que existen'),
       ('Incomodidad/desconfianza de que alguien ajeno cuide', 'Desconfianza de alguien ajeno'),
       ('Maltrato del personal', 'Maltrato del personal')]
D['razones'] = {
    'obj': [fila(e03, f'Cuidan discapacidad o 60+ | No buscó por: {k}') | {'etiqueta': et} for k, et in RAZ],
    'todas': [fila(e03, f'Todas las cuidadoras | No buscó por: {k}') | {'etiqueta': et} for k, et in RAZ],
    'fuente': F03,
}
D['p711'] = [fila(e07, f'P7.11 | {k}') | {'etiqueta': k} for k in
             ['La responsabilidad es de hijas, hijos o familia', 'Tratan mal a las personas', 'No tienen personal capacitado',
              'Prefiere estar sola(o)/no le gustan', 'Son muy caros']]
q = leer(R / '04_contratacion_por_quintil.csv')
D['quintil'] = [{'quintil': int(r.quintil), 'servicio': r.servicio, 'pct': float(r.pct), 'cv': float(r.cv),
                 'n_si': int(r.n_muestra_si), 'precision': r.precision} for r in q.itertuples()]
D['caros_ingreso'] = [{'grupo': g, **fila(e07, f'Ingreso | {g} | Son caros')} for g in ['Q1-Q2', 'Q3', 'Q4-Q5']]

# Preferencia de lugar y oferta declarada (03)
D['preferencia'] = [fila(e03, f'Cuidan disc/60+ | {k}') | {'etiqueta': et} for k, et in
                    [('En su casa', 'En su casa'), ('No contrataría', 'No contrataría a nadie'),
                     ('Centro/institución pública', 'Institución pública'), ('Casa de familiar/amistad/conocido', 'Casa de un familiar o conocido'),
                     ('Centro/institución privada', 'Institución privada')]]
D['oferta_declarada'] = {
    'pob': fila(e03, 'Pob. 15-60 | Le gustaría ser cuidador(a) pagada(o)'),
    'mujeres': fila(e03, 'Pob. 15-60 Mujeres | Le gustaría ser cuidador(a) pagada(o)'),
    'hombres': fila(e03, 'Pob. 15-60 Hombres | Le gustaría ser cuidador(a) pagada(o)'),
    'capacitaria': fila(e03, 'Pob. 15-60 | ...y se capacitaría (entre quienes sí)'),
    'fuente': F03,
}
D['contratacion'] = {
    'cuidado': fila(e03, 'Hogares con discapacidad o 60+ | Contrata enfermería o cuidadora'),
    'domestico': fila(e03, 'Hogares con discapacidad o 60+ | Contrata trabajo doméstico (entrada por salida)'),
    'fuente': F03,
}

# ---------------------------------------------------------------- Programa, opción C (04, 06, 10)
rel = leer(R / '10_asequibilidad_relevo.csv')
D['relevo'] = {
    'filas': [{'salario': r['salario'], 'salario_hora_2026': float(r['salario_hora_2026']), 'paquete': r['paquete'],
               'horas': int(r['horas_semana']), 'costo_mensual_2026': int(r['costo_mensual_2026']),
               'pct_ingreso_mediano': float(r['costo_pct_ingreso_mediano']),
               'u10': float(r['pct_hogares_costo_<=_10pct_ingreso']), 'u20': float(r['pct_hogares_costo_<=_20pct_ingreso']),
               'u30': float(r['pct_hogares_costo_<=_30pct_ingreso']), 'n': int(r['n_muestra_hogares'])} for _, r in rel.iterrows()],
    'alcance': rel['alcance'].iloc[0],
    'fuente': 'Analysis/resultados/10_asequibilidad_relevo.csv (script 10)',
}
# ENIGH 2022 (script 14): mismos paquetes con el ingreso monetario de la ENIGH, nacional y CDMX, con IC al 90 %
e14 = leer(R / '14_enigh_asequibilidad_cdmx.csv')
e14 = e14[e14.ingreso.str.startswith('Ingreso monetario')]
r14 = leer(R / '14_enigh_resumen.csv')
def ind14(texto, dom):
    m = r14[(r14.indicador == texto) & (r14.dominio == dom)]
    if len(m) != 1:
        raise SystemExit(f'No encontré exactamente una fila para {texto!r} / {dom} ({len(m)})')
    return float(m.valor.iloc[0])
def nec14(texto, dom):
    """Lee pct, IC90, CV y total de la nota del script 14; se detiene si el formato cambia."""
    m = r14[(r14.indicador == texto) & (r14.dominio == dom)]
    if len(m) != 1:
        raise SystemExit(f'No encontré exactamente una fila para {texto!r} / {dom} ({len(m)})')
    nota = str(m.nota.iloc[0])
    import re as _re
    ic = _re.search(r'IC90 ([\d.]+)-([\d.]+)', nota); tot = _re.search(r'total ([\d,]+)', nota); cv = _re.search(r'CV ([\d.]+)', nota)
    if not (ic and tot and cv):
        raise SystemExit(f'La nota de {texto!r} / {dom} no trae IC90, CV y total: {nota!r}')
    return {'pct': float(m.valor.iloc[0]), 'li90': float(ic.group(1)), 'ls90': float(ic.group(2)),
            'cv': float(cv.group(1)), 'total': int(tot.group(1).replace(',', ''))}
MED14 = 'Ingreso monetario mensual del hogar, mediana, hogares con necesidad'
MED14N = 'Ingreso monetario mensual mediano, hogares con necesidad, en pesos de nov-2022 (comparable con ENASIC)'
f14 = []
for (dom, sal, paq, hrs), g in e14.groupby(['dominio', 'salario', 'paquete', 'horas_semana'], sort=False):
    if len(g) != 3:
        raise SystemExit(f'Faltan umbrales en el script 14 para {dom} {sal} {paq}')
    u = g.set_index('umbral_pct_ingreso')
    f14.append({'dominio': dom, 'salario': sal, 'paquete': paq, 'horas': int(hrs),
                'salario_hora_2026': una(rel, salario=sal, horas_semana=hrs)['salario_hora_2026'],
                'costo_mensual_2026': int(u.costo_mensual_2026.iloc[0]),
                'pct_ingreso_mediano': round(100 * float(u.costo_mensual_ago2022.iloc[0]) / ind14(MED14, dom), 1),
                'n': int(u.n_muestra_dominio.iloc[0]),
                **{f'u{k}': float(u.loc[k, 'pct']) for k in (10, 20, 30)},
                **{f'u{k}_li': float(u.loc[k, 'li90']) for k in (10, 20, 30)},
                **{f'u{k}_ls': float(u.loc[k, 'ls90']) for k in (10, 20, 30)},
                **{f'u{k}_prec': u.loc[k, 'precision'] for k in (10, 20, 30)}})
D['relevo_enigh'] = {
    'filas': f14,
    'mediana_nov2022': {d: ind14(MED14N, d) for d in ('Nacional', 'CDMX')},
    'necesidad_cdmx': ind14('Hogares con alguien de 60+ o con discapacidad', 'CDMX'),
    'necesidad_cdmx_det': nec14('Hogares con alguien de 60+ o con discapacidad', 'CDMX'),
    'fuente': 'Analysis/resultados/14_enigh_asequibilidad_cdmx.csv y 14_enigh_resumen.csv (script 14, ENIGH 2022 / CONEVAL)',
}
res04 = leer(R / '04_resumen.csv').set_index('indicador').valor
D['ingreso'] = {'mediana_2022': float(res04['Ingreso mensual mediano ponderado (monto o rango), hogares con necesidad, $2022']),
                'hogares_nal': float(res04['Hogares con necesidad (disc. o 60+), total expandido']),
                'factor_inpc': float(res04['Factor INPC nov-2022 -> ago-2026']),
                'fuente': 'Analysis/resultados/04_resumen.csv'}
pago = leer(R / '04_pago_observado_cuidado.csv')
def pago_hora(servicio):
    r = una(pago, servicio=servicio, grupo='todos los hogares', variable='pago_hora')
    return {'servicio': servicio, 'n': int(r.n), 'p25': float(r.p25_pesos_2026), 'mediana': float(r.mediana_pesos_2026),
            'p75': float(r.p75_pesos_2026), 'mediana_ponderada': float(r.mediana_ponderada_pesos_2026),
            'horas_sem_mediana': float(una(pago, servicio=servicio, grupo='todos los hogares', variable='horas_sem').mediana)}
D['pago'] = {'cuidadora': pago_hora('Cuidadora'), 'enfermeria': pago_hora('Enfermería'),
             'domestica': pago_hora('Doméstica entrada por salida'),
             'fuente': 'Analysis/resultados/04_pago_observado_cuidado.csv (pesos de 2026, sin ponderar salvo la mediana ponderada)'}
sub = leer(R / '06_subsidio_por_paquete.csv')
sub = sub[sub.salario.str.startswith('Piso legal')]
D['subsidio'] = [{'paquete': r.paquete, 'base': r.base, 'costo': int(r.costo_mensual_2026), 'pct_sin': float(r.pct_hogares_sin_subsidio),
                  'sub25': int(r.subsidio_para_25pct), 'mdp25': int(r.costo_anual_cdmx_mdp_25pct)} for r in sub.itertuples()]
anc = leer(R / '06_anclas_presupuestales.csv')
D['anclas'] = [{'ancla': r.ancla, 'valor': float(r.valor), 'evidencia': r.evidencia} for r in anc.itertuples()]
D['subsidio_fuente'] = 'Analysis/resultados/06_subsidio_por_paquete.csv y 06_anclas_presupuestales.csv (script 06)'

# ---------------------------------------------------------------- Modelo de focalización (11)
g11 = leer(R / '11_modelo_focalizacion_global.csv')
D['modelo'] = {
    'global': [{k: nn(v) for k, v in r.items()} for r in g11.to_dict('records')],
    'grupos': [{k: nn(v) for k, v in r.items()} for r in leer(R / '11_modelo_focalizacion_por_grupo.csv').to_dict('records')],
    'sensibilidad': [{k: nn(v) for k, v in r.items()} for r in leer(R / '11_modelo_focalizacion_sensibilidad.csv').to_dict('records')],
    'coef': [{'variable': r.iloc[0], 'coef': float(r.iloc[1])} for _, r in leer(R / '11_modelo_coeficientes_logit.csv').iterrows()],
    'fuente': 'Analysis/resultados/11_modelo_focalizacion_*.csv y 11_modelo_coeficientes_logit.csv (notebook 11)',
}

# ---------------------------------------------------------------- Territorio CDMX (01, 02, 05, 08, 09)
of = leer(A / 'outputs' / 'indice_por_tipo_servicio.csv')
ofn = leer(A / 'outputs' / 'oferta_nucleo_vs_pob60_por_alcaldia.csv')
ql = pd.read_csv(R / '02_indice_capacidad_residencial.csv', index_col=0, encoding='utf-8-sig')
dep = leer(R / '08_dependencia_severa_alcaldia.csv').set_index('alcaldia')
pob = leer(R / '09_pobreza_65mas_alcaldia_cdmx.csv').set_index('municipio')
rez = leer(R / '13_rezago_por_alcaldia.csv').set_index('alcaldia')
cal13 = leer(R / '13_calidad_rezago.csv').set_index('chequeo')
ABR = {'Azcapotzalco': 'AZC', 'Coyoacán': 'COY', 'Cuajimalpa de Morelos': 'CUAJ', 'Gustavo A. Madero': 'GAM', 'Iztacalco': 'IZTAC',
       'Iztapalapa': 'IZTAP', 'La Magdalena Contreras': 'MC', 'Milpa Alta': 'MA', 'Álvaro Obregón': 'AO', 'Tláhuac': 'TLAH',
       'Tlalpan': 'TLAL', 'Xochimilco': 'XOCH', 'Benito Juárez': 'BJ', 'Cuauhtémoc': 'CUAU', 'Miguel Hidalgo': 'MH',
       'Venustiano Carranza': 'VC'}
terr = {}
for r in of.itertuples():
    a = ABR[r.municipio]
    ofn.loc[ofn.municipio == r.municipio].iloc[0]  # verifica que la alcaldía exista en ambos archivos
    qa = ql.loc[a, 'QL_p60_A'] if a in ql.index else float('nan')
    p = pob.loc[r.municipio]
    terr[r.municipio] = {'abr': a, 'asilos': int(r.asilos), 'centros_dia': int(r.centros_dia), 'pct_pob60': float(r.pct_pob60),
                         'idx_asilos': float(r.indice_asilos), 'idx_centros': float(r.indice_centros_dia),
                         'ql_plazas': None if pd.isna(qa) else float(qa),
                         'plazas': None if pd.isna(ql.loc[a, 'plazas']) else int(ql.loc[a, 'plazas']),
                         'dep_total': int(dep.loc[a, 'total']), 'dep_pct': float(dep.loc[a, 'pct_cdmx']),
                         'pob65_pct': float(p.pct_pobreza_2020), 'pob65_n': int(p.poblacion_65mas),
                         'pob65_prec': p.precision_pct_pobreza_2020,
                         'rez_pct': float(rez.loc[r.municipio, 'pct_pob_rezago_medio_o_mas']),
                         'rez_nageb': int(rez.loc[r.municipio, 'n_ageb_rezago_medio_o_mas']),
                         'sds_pct': float(rez.loc[r.municipio, 'pct_sin_derechohabiencia']),
                         'sds_p10': float(rez.loc[r.municipio, 'sdsalud_p10_ageb']),
                         'sds_p90': float(rez.loc[r.municipio, 'sdsalud_p90_ageb']),
                         'pob_ageb': int(rez.loc[r.municipio, 'poblacion_ageb_validas'])}
if len(terr) != 16:
    raise SystemExit(f'Se esperaban 16 alcaldías y hay {len(terr)}')
D['territorio'] = {'alcaldias': terr,
                   'totales': {'asilos': int(of.asilos.sum()), 'centros_dia': int(of.centros_dia.sum()), 'dep_total': int(dep.total.sum())},
                   'fuentes': {'idx': 'Analysis/outputs/indice_por_tipo_servicio.csv (notebook 01, DENUE 05/2026)',
                               'ql': 'Analysis/resultados/02_indice_capacidad_residencial.csv (notebook 02)',
                               'dep': 'Analysis/resultados/08_dependencia_severa_alcaldia.csv (script 08)',
                               'pob': 'Analysis/resultados/09_pobreza_65mas_alcaldia_cdmx.csv (notebook 09, CONEVAL)',
                               'rez': 'Analysis/resultados/13_rezago_por_alcaldia.csv (script 13, CONEVAL IRS 2020 por AGEB)'},
                   'rezago_calidad': {'ageb': int(cal13.loc['AGEB urbanas en la CDMX', 'valor']),
                                      'suprimidas': int(cal13.loc['AGEB con indicadores suprimidos (*)', 'valor']),
                                      'alto_suprimidas': int(cal13.loc['AGEB "Alto" o "Muy alto" con indicadores suprimidos', 'valor']),
                                      'pob_medio_mas': int(cal13.loc['Población en AGEB válidas con rezago Medio o más', 'valor']),
                                      'pct_medio_mas_nota': cal13.loc['Población en AGEB válidas con rezago Medio o más', 'nota']}}
dim = leer(R / '05_dimensionamiento_cdmx.csv')
D['dimension_cdmx'] = [{'nivel': r.nivel, 'valor': int(r.valor), 'metodo': r.metodo, 'evidencia': r.evidencia, 'sesgo': r.sesgo}
                       for r in dim.itertuples()]
D['dimension_fuente'] = 'Analysis/resultados/05_dimensionamiento_cdmx.csv (script 05)'
tas = leer(R / '05_tasas_y_anclajes.csv').set_index('concepto')
D['tasa_necesidad_nal'] = float(tas.loc['Tasa nacional de hogares con persona con discapacidad o 60+', 'valor'])
bs = leer(R / '08_brecha_cuidado_sexo.csv')
D['brecha_sexo'] = [{'edad': r.Edad, 'h': nn(r.Hombres), 'm': nn(r.Mujeres), 'razon': nn(r.razon_M_H)} for r in bs.itertuples()]
D['calidad_datos'] = leer(R / '08_calidad_datos.csv').to_dict('records')

# ---------------------------------------------------------------- Fuentes y matrices
fic = leer(R / '02_fichas_fuentes.csv')
D['fichas'] = fic.fillna('').to_dict('records')
inv = leer(A / 'matrices' / 'inventario_fuentes_cuidado.csv')
D['inventario'] = inv[['id', 'fuente', 'emisor', 'desagregacion_geografica_maxima', 'periodo_cubierto', 'estado_evidencia']].fillna('').to_dict('records')
D['pares'] = leer(A / 'matrices' / 'pares_oferta_necesidad.csv').fillna('').to_dict('records')

# ---------------------------------------------------------------- Contexto estatal (sección 17 del notebook A) y zonas (AGEB, sección 13)
e17 = leer(R / '17_enigh_60mas_por_entidad.csv')
m17 = leer(R / '17_marginacion_entidad_conapo_2020.csv').set_index('clave_entidad')
v17 = leer(R / '17_validacion_enigh.csv')
if not v17.coincide.all():
    raise SystemExit('17_validacion_enigh.csv: el cálculo no reproduce las cifras publicadas por CONEVAL')
EST_IND = {k: g.iloc[0].definicion for k, g in e17.groupby('indicador')}
estados = {}
for cve, g in e17[e17.clave_entidad > 0].groupby('clave_entidad'):
    r = {'nombre': g.iloc[0].entidad_federativa}
    for x in g.itertuples():
        r[x.indicador] = {'v': float(x.pct), 'li': float(x.li90), 'ls': float(x.ls90), 'cv': float(x.cv), 'n': int(x.n_muestra), 'prec': x.precision}
    mm = m17.loc[int(cve)]
    r['im'] = {'v': float(mm.IM_2020), 'grado': mm.GM_2020, 'lugar': int(mm.lugar_nacional)}
    estados[int(cve)] = r
nal = {x.indicador: {'v': float(x.pct), 'li': float(x.li90), 'ls': float(x.ls90)} for x in e17[e17.clave_entidad == 0].itertuples()}
D['estados'] = {'entidades': estados, 'nacional': nal, 'definiciones': EST_IND,
                'validacion': v17.to_dict('records'),
                'fuentes': {'enigh': 'Analysis/resultados/17_enigh_60mas_por_entidad.csv (notebook A, sección 17; ENIGH 2022, programa de cálculo CONEVAL)',
                            'im': 'Analysis/resultados/17_marginacion_entidad_conapo_2020.csv (notebook A, sección 17; CONAPO, Índice de marginación 2020)',
                            'geo': 'Frontend/vendor/svg-maps-mexico (@svg-maps/mexico 2.0.0, V. Cazanave, CC BY 4.0; dibujo esquemático, no cartografía oficial)'}}

ZONA_MIN_POB = 100   # AGEB con menos habitantes dan porcentajes extremos por denominador chico (p. ej. 100 % con 7 personas)
ag = leer(R / '13_rezago_ageb_cdmx.csv')
agv = ag[~ag.suprimida & ag.i_sdsalud.notna()]
agz = agv[agv.poblacion >= ZONA_MIN_POB]
D['zonas'] = {'ageb': [[r.alcaldia, round(float(r.i_sdsalud), 1), int(r.poblacion), r.grs] for r in agz.itertuples()],
              'n_total': int(len(ag)), 'n_suprimidas': int(ag.suprimida.sum()), 'n_chicas': int(len(agv) - len(agz)),
              'min_pob': ZONA_MIN_POB,
              'fuente': 'Analysis/resultados/13_rezago_ageb_cdmx.csv (notebook A, sección 13; CONEVAL, IRS 2020 por AGEB urbana, indicador i_sdsalud)'}

# ---------------------------------------------------------------- Tipología de AGEB (notebook D, sección 18): segundo modelo
t_ag = leer(R / '18_tipologia_ageb.csv')
t_pf = leer(R / '18_tipologia_perfiles.csv')
t_de = leer(R / '18_tipologia_decision.csv')
t_k = leer(R / '18_tipologia_seleccion_k.csv')
t_co = leer(R / '18_tipologia_comparacion.csv')
t_ro = leer(R / '18_tipologia_robustez.csv')
t_lo = leer(R / '18_tipologia_dejar_fuera_alcaldia.csv')
t_pa = leer(R / '18_tipologia_por_alcaldia.csv')
t_ca = leer(R / '18_tipologia_calidad.csv')
if sorted(t_ag.tipo.unique()) != list(range(1, len(t_pf) + 1)) or len(t_de) != len(t_pf):
    raise SystemExit('18_tipologia_*: los tipos de los archivos no coinciden; vuelve a correr el notebook D completo')
NV = ['pct_60', 'pct_disc', 'pct_0a14', 'prom_ocup', 'part_fem', 'pct_jef_f', 'pct_sinder', 'graproes', 'pct_sin_int']
D['tipologia'] = {
    'campos_ageb': ['cvegeo', 'alcaldia', 'tipo', 'poblacion', 'n_60', 'pct_60', 'pct_disc', 'pct_sinder', 'graproes', 'pct_sin_int',
                    'dist_oferta_km', 'brecha', 'frontera'],
    'ageb': [[r.CVEGEO, r.alcaldia, int(r.tipo), int(r.poblacion), int(r.n_60), round(r.pct_60, 1), round(r.pct_disc, 1), round(r.pct_sinder, 1),
              round(r.graproes, 1), round(r.pct_sin_int, 1), round(r.dist_oferta_km, 2), bool(r.brecha_q75), bool(r.frontera)]
             for r in t_ag.assign(CVEGEO=t_ag.CVEGEO.astype(str).str.zfill(13)).itertuples()],
    'tipos': [{'tipo': int(r.tipo), 'nombre': r.nombre, 'n_ageb': int(r.n_ageb), 'poblacion': int(r.poblacion), 'pct_pob_cdmx': float(r.pct_pob_cdmx),
               'n_60': int(r.n_60), 'pct_de_las_60': float(r.pct_de_las_60_cdmx), 'pct_60': float(r.pct_60_ponderado), 'n_disc': int(r.n_disc),
               'pct_sinder': float(r.pct_sinder_ponderado), 'pct_viv_sin_int': float(r.pct_viv_sin_int_ponderado),
               'medianas': {v: float(getattr(r, 'med_' + v)) for v in NV}} for r in t_pf.itertuples()],
    'decision': [{'tipo': int(r.tipo), 'viviendas': int(r.viviendas), 'viviendas_sin_internet': int(r.viviendas_sin_internet),
                  'pct_viv_sin_int': float(r.pct_viviendas_sin_internet), 'dist_mediana_km': float(r.dist_oferta_km_mediana),
                  'pct_60_a_mas_de_1km': float(r.pct_60_en_ageb_a_mas_de_1km), 'ageb_brecha': int(r.ageb_brecha_q75),
                  'ageb_brecha_terciles': int(r.ageb_brecha_q67), 'n_60_brecha': int(r.personas_60_en_brecha_q75)} for r in t_de.itertuples()],
    'medianas_cdmx': {v: float(t_ag[v].median()) for v in NV},
    'seleccion_k': [{k: nn(v) for k, v in r.items()} for r in t_k.to_dict('records')],
    'comparacion': [{k: nn(v) for k, v in r.items()} for r in t_co.to_dict('records')],
    'robustez': [{'variante': r.variante, 'ari': float(r.ari_vs_modelo)} for r in t_ro.itertuples()],
    'dejar_fuera': {'coincidencia_ponderada': float((t_lo.coincidencia_pct * t_lo.n_ageb).sum() / t_lo.n_ageb.sum()),
                    'minima': float(t_lo.coincidencia_pct.min()), 'alcaldia_minima': t_lo.loc[t_lo.coincidencia_pct.idxmin(), 'alcaldia']},
    'por_alcaldia': [{'alcaldia': r.alcaldia, 'ageb_brecha': int(r.ageb_brecha_q75), 'n_60_brecha': int(r.personas_60_en_brecha_q75),
                      'pct_tipo': [float(getattr(r, f'pct_pob_tipo_{t}')) for t in range(1, len(t_pf) + 1)]} for r in t_pa.itertuples()],
    'calidad': t_ca.to_dict('records'),
    'fuente': 'Analysis/resultados/18_tipologia_*.csv (notebook D, sección 18; Censo 2020 por AGEB urbana, DENUE 05_2026, Marco Geoestadístico 2025)',
}
_TA = pd.DataFrame(D['tipologia']['ageb'], columns=D['tipologia']['campos_ageb'])
D['tipologia']['frontera'] = {'n': int(_TA.frontera.sum()), 'pct': float(100 * _TA.frontera.mean()), 'poblacion': int(_TA.loc[_TA.frontera, 'poblacion'].sum())}
D['tipologia']['brecha_total'] = {'ageb': int(_TA.brecha.sum()), 'n_60': int(_TA.loc[_TA.brecha, 'n_60'].sum())}
_vs = sum(r['viviendas_sin_internet'] for r in D['tipologia']['decision']); _vv = sum(r['viviendas'] for r in D['tipologia']['decision'])
D['tipologia']['sin_internet_total'] = {'viviendas': _vs, 'pct': 100 * _vs / _vv}

# ---------------------------------------------------------------- Ficha de indicadores (KPI)
K, Cg = D['clave'], D['carga']
rel40 = una(rel, salario=rel.salario.iloc[0], horas_semana=40)
rel6 = una(rel, salario=rel.salario.iloc[0], horas_semana=6)
e6c = next(f for f in f14 if f['dominio'] == 'CDMX' and f['salario'] == rel.salario.iloc[0] and f['horas'] == 6)
glob = {r['puntaje']: r for r in D['modelo']['global']}
OD = D['oferta_declarada']
def kpi(dimension, nombre, definicion, valor, unidad, universo, precision, evidencia, fuente):
    return dict(dimension=dimension, nombre=nombre, definicion=definicion, valor=valor, unidad=unidad, universo=universo,
                precision=precision, evidencia=evidencia, fuente=fuente)
D['kpis'] = [
    kpi('Demanda', 'Hogares con necesidad de cuidado', 'Hogares con al menos una persona con discapacidad o de 60 años y más',
        D['tasa_necesidad_nal'], '% de los hogares', 'Hogares, nacional', 'alta', 'confirmado', 'Analysis/resultados/05_tasas_y_anclajes.csv'),
    kpi('Demanda', 'Grupo del problema', 'Personas cuidadoras que cuidan 40 h o más, dicen "no tuve necesidad" y declaran algún daño',
        K['grupo_problema']['pct'], '% del universo', 'Cuidadoras de persona con discapacidad o 60+, nacional',
        K['grupo_problema']['precision'], 'probable', F07),
    kpi('Demanda', 'Cuidado de alta intensidad', 'Personas cuidadoras que dedican 40 h o más a la semana',
        K['pesa_40']['pct'], '% del universo', 'Cuidadoras de persona con discapacidad o 60+, nacional', K['pesa_40']['precision'], 'confirmado', F07),
    kpi('Demanda', 'Preferencia por cuidado en casa', 'Si contratara cuidado, lo querría en su casa (P6.46)',
        D['preferencia'][0]['pct'], '%', 'Cuidadoras de persona con discapacidad o 60+, nacional', D['preferencia'][0]['precision'], 'confirmado', F03),
    kpi('Demanda', 'Búsqueda de servicios', 'Buscó guardería, casa de día, asilo u otro lugar de cuidado (P6.42)',
        K['busco_todas']['pct'], '%', 'Todas las personas cuidadoras, nacional', K['busco_todas']['precision'], 'confirmado', F03),
    kpi('Oferta', 'Oferta declarada de cuidadoras', 'Le gustaría trabajar como cuidador(a) si le pagaran (P6.47)',
        OD['pob']['pct'], '%', 'Población de 15 a 60 años, nacional', OD['pob']['precision'], 'confirmado (intención, no oferta real)', F03),
    kpi('Oferta', 'Oferta institucional registrada', 'Asilos y centros de día del núcleo SCIAN en el DENUE',
        D['territorio']['totales']['asilos'] + D['territorio']['totales']['centros_dia'], 'establecimientos', 'CDMX',
        'no aplica', 'probable (parte de los nombres no indica cuidado; revisión manual pendiente)', D['territorio']['fuentes']['idx']),
    kpi('Cobertura', 'Contratación de cuidado', 'Hogares con necesidad que contratan enfermería o cuidadora',
        D['contratacion']['cuidado']['pct'], '% de los hogares', 'Hogares con persona con discapacidad o 60+, nacional',
        D['contratacion']['cuidado']['precision'], 'confirmado', F03),
    kpi('Cobertura', 'Cobertura territorial oferta–necesidad', 'Indicador por alcaldía que compare oferta y necesidad compatibles',
        None, 'no medible', 'CDMX', 'no aplica', 'desconocido: ningún par oferta–necesidad cumple la regla de compatibilidad',
        'Analysis/matrices/pares_oferta_necesidad.csv'),
    kpi('Tiempos', 'Daño por intensidad de cuidado', 'Declara algún daño, entre quienes cuidan 40 h o más y dicen "no tuve necesidad"',
        Cg['dano'][2]['pct'], '%', 'Cuidadoras de persona con discapacidad o 60+, nacional', Cg['dano'][2]['precision'], 'probable', F07),
    kpi('Costos', 'Costo de la jornada completa', 'Costo mensual de 40 h/semana al salario mínimo profesional 2026, como % del ingreso mediano',
        float(rel40.costo_pct_ingreso_mediano), '% del ingreso mediano', 'Hogares con necesidad, nacional', 'sin varianza de diseño', 'probable',
        D['relevo']['fuente']),
    kpi('Costos', 'Asequibilidad del relevo (6 h/sem)', 'Hogares que podrían pagar 6 h/semana sin rebasar el 20% de su ingreso',
        float(rel6['pct_hogares_costo_<=_20pct_ingreso']), '% de los hogares', 'Hogares con necesidad, nacional', 'sin varianza de diseño',
        'probable', D['relevo']['fuente']),
    kpi('Costos', 'Asequibilidad del relevo (6 h/sem), CDMX', 'Hogares de la CDMX que podrían pagar 6 h/semana sin rebasar el 20% de su ingreso monetario (ENIGH 2022)',
        e6c['u20'], '% de los hogares', 'Hogares con persona con discapacidad o 60+, CDMX', e6c['u20_prec'] + ' (IC 90% en el archivo)',
        'probable (poder pagar no es querer contratar)', D['relevo_enigh']['fuente']),
    kpi('Contexto', 'Población en zonas de rezago social medio o mayor', 'Población en AGEB urbanas con grado de rezago social medio, alto o muy alto (excluye AGEB con datos suprimidos)',
        float(D['territorio']['rezago_calidad']['pct_medio_mas_nota'].split(' %')[0]), '% de la población', 'Población en AGEB urbanas, CDMX', 'no aplica (censo)',
        'confirmado (contexto de vulnerabilidad, no necesidad de cuidado)', D['territorio']['fuentes']['rez']),
    kpi('Contexto', 'Viviendas sin internet en las AGEB urbanas', 'Viviendas particulares habitadas sin internet ÷ viviendas con características (canal de la app)',
        D['tipologia']['sin_internet_total']['pct'], '% de las viviendas', 'Viviendas en AGEB urbanas de 100 hab. o más, CDMX', 'no aplica (censo)',
        'confirmado (Censo 2020; la conectividad pudo cambiar desde entonces)', D['tipologia']['fuente']),
    kpi('Contexto', 'Personas de 60+ en AGEB con brecha de oferta', 'Personas de 60+ en AGEB del cuartil alto de personas de 60+ y del cuartil alto de distancia en línea recta a una residencia o centro de día',
        D['tipologia']['brecha_total']['n_60'], 'personas', 'AGEB urbanas, CDMX', 'no aplica (censo)',
        'probable (umbral convencional; no mide capacidad, precio ni transporte)', D['tipologia']['fuente']),
    kpi('Costos', 'Pago observado a cuidadoras', 'Mediana del pago por hora a cuidadoras contratadas (pesos de 2026)',
        D['pago']['cuidadora']['mediana'], '$ por hora', 'Hogares que contratan cuidadora, nacional', 'baja (muestra de ' + str(D['pago']['cuidadora']['n']) + ', sin ponderar)',
        'probable', D['pago']['fuente']),
    kpi('Brechas', 'Brecha de horas de cuidado por sexo (18–29 años)', 'Horas de cuidado de las mujeres entre horas de los hombres',
        next(b['razon'] for b in D['brecha_sexo'] if b['edad'] == '18-29'), 'veces', 'Archivo del proyecto (productor y año sin documentar)',
        'no aplica', 'probable', 'Analysis/resultados/08_brecha_cuidado_sexo.csv'),
    kpi('Calidad', 'Satisfacción con el servicio buscado', 'De quienes buscaron un servicio, dice que cumplió lo que buscaba',
        K['cumplio']['pct'], '%', 'Personas cuidadoras que buscaron, nacional', K['cumplio']['precision'], 'confirmado', F03),
    kpi('Calidad', 'Calidad del cuidado domiciliario', 'Calidad del servicio de cuidado en casa (trato, capacitación, incidentes)',
        None, 'no medible', '—', 'no aplica', 'desconocido: ninguna fuente del proyecto lo mide; lo tendría que medir el piloto', '—'),
    kpi('Focalización', 'Cobertura de la regla "40 h o más"', 'Personas con daño que la regla selecciona (misma tasa de selección que el modelo)',
        glob['Regla >= 40 h']['cobertura'], '%', 'Cuidadoras de persona con discapacidad o 60+, nacional', 'IC 90% en el archivo', 'probable',
        D['modelo']['fuente']),
]

# ---------------------------------------------------------------- Diccionario: cada bloque de la base debe estar documentado
dic = leer(A / 'matrices' / 'diccionario_observatorio.csv')
D['diccionario'] = dic[dic.tipo.str.startswith('variable')][['nombre', 'definicion', 'origen']].fillna('').to_dict('records')
D['diccionario_fuente'] = 'Analysis/matrices/diccionario_observatorio.csv'
faltan = sorted(set(D) - set(dic[dic.tipo.str.startswith('bloque')].nombre))
if faltan:
    raise SystemExit(f'diccionario_observatorio.csv no documenta estos bloques: {faltan}')

out = AQUI / 'datos_observatorio.json'
out.write_text(json.dumps(D, ensure_ascii=False, indent=1), encoding='utf-8')
print('ok', out, len(json.dumps(D)))

# ---------------------------------------------------------------- Datos para la página
# index.html ya no se genera: es código fuente (HTML + css/ + js/) y se edita a mano.
# La página lee sus datos de dos scripts clásicos (no de fetch, para que abra con doble clic desde file://).
DATOS_JS = AQUI / 'js' / 'datos'
DATOS_JS.mkdir(parents=True, exist_ok=True)
AVISO = '/* Generado por Frontend/observatorio/build_datos.py. No editar a mano: se sobrescribe. */\n'

datos_txt = AVISO + 'var D = ' + json.dumps(D, ensure_ascii=False) + ';\n'
(DATOS_JS / 'datos.js').write_text(datos_txt, encoding='utf-8')
print('ok', DATOS_JS / 'datos.js', len(datos_txt))

geo_js = (RAIZ / 'Frontend' / 'js' / 'cdmx-alcaldias.js').read_text(encoding='utf-8')
geo = geo_js[geo_js.index('{'):geo_js.rindex('}') + 1]
geo_txt = AVISO + '/* Límites de alcaldías: Frontend/js/cdmx-alcaldias.js (INEGI, Marco Geoestadístico 2020). */\nvar GEO = ' + geo + ';\n'
(DATOS_JS / 'geo.js').write_text(geo_txt, encoding='utf-8')
print('ok', DATOS_JS / 'geo.js', len(geo_txt))

# Contornos esquemáticos de las 32 entidades. El paquete los nombra en inglés y con id propio: se enlazan por clave INEGI.
SVG_ID = ['agu', 'bcn', 'bcs', 'cam', 'coa', 'col', 'chp', 'chh', 'cmx', 'dur', 'gua', 'gro', 'hid', 'jal', 'mex', 'mic',
          'mor', 'nay', 'nle', 'oax', 'pue', 'que', 'roo', 'slp', 'sin', 'son', 'tab', 'tam', 'tla', 'ver', 'yuc', 'zac']
mx_js = (RAIZ / 'Frontend' / 'vendor' / 'svg-maps-mexico' / 'index.js').read_text(encoding='utf-8')
mx = json.loads(mx_js[mx_js.index('{'):mx_js.rindex('}') + 1])
por_id = {l['id']: l for l in mx['locations']}
assert sorted(por_id) == sorted(SVG_ID), 'El paquete de contornos no trae las 32 entidades esperadas'
GEO_EST = {'viewBox': mx['viewBox'], 'entidades': {str(i + 1): {'path': por_id[k]['path'], 'nombre_paquete': por_id[k]['name']} for i, k in enumerate(SVG_ID)}}
for cve, r in GEO_EST['entidades'].items():   # chequeo de enlace: el nombre del paquete debe parecerse al de CONEVAL
    a, b = r['nombre_paquete'].lower(), D['estados']['entidades'][int(cve)]['nombre'].lower()
    assert a[:4] == b[:4] or (cve == '9' and a == 'mexico city') or (cve == '15' and a == 'méxico'), (cve, a, b)
est_txt = AVISO + '/* Contornos: Frontend/vendor/svg-maps-mexico (@svg-maps/mexico 2.0.0, Victor Cazanave, CC BY 4.0). Esquemático, no cartografía oficial. */\nvar GEO_EST = ' + json.dumps(GEO_EST, ensure_ascii=False) + ';\n'
(DATOS_JS / 'geo-estados.js').write_text(est_txt, encoding='utf-8')
print('ok', DATOS_JS / 'geo-estados.js', len(est_txt))

# Contornos de AGEB urbanas y alcaldías del Marco Geoestadístico 2025 (simplificados en el notebook D) y oferta núcleo del DENUE,
# ya proyectados a coordenadas de SVG (equirrectangular con corrección por coseno de la latitud), para el mapa de la tipología.
fc = json.loads((R / '18_tipologia_contornos.geojson').read_text(encoding='utf-8'))
pts = leer(R / '18_oferta_nucleo_puntos.csv')
todas = [c for f in fc['features'] for poly in (f['geometry']['coordinates'] if f['geometry']['type'] == 'MultiPolygon' else [f['geometry']['coordinates']]) for ring in poly for c in ring]
lon0, lon1 = min(c[0] for c in todas), max(c[0] for c in todas); lat0, lat1 = min(c[1] for c in todas), max(c[1] for c in todas)
import math
kx = math.cos(math.radians((lat0 + lat1) / 2)); ANCHO = 1000; esc_ = ANCHO / ((lon1 - lon0) * kx); ALTO = round((lat1 - lat0) * esc_)
def _xy(c):
    return f"{(c[0] - lon0) * kx * esc_:.1f},{(lat1 - c[1]) * esc_:.1f}"
def _path(geom):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    return ''.join('M' + 'L'.join(_xy(c) for c in ring[:-1]) + 'Z' for poly in polys for ring in poly)
GA = {'viewBox': f'0 0 {ANCHO} {ALTO}', 'ageb': {}, 'alcaldias': {}}
for f in fc['features']:
    (GA['ageb'] if f['properties']['capa'] == 'ageb' else GA['alcaldias'])[f['properties']['id']] = _path(f['geometry'])
faltan_geo = set(r[0] for r in D['tipologia']['ageb']) - set(GA['ageb'])
if faltan_geo:
    raise SystemExit(f'18_tipologia_contornos.geojson no tiene polígono para {len(faltan_geo)} AGEB del modelo')
GA['oferta'] = [[float(_xy([r.lon, r.lat]).split(',')[0]), float(_xy([r.lon, r.lat]).split(',')[1])] for r in pts.itertuples()]
ga_txt = AVISO + '/* Contornos: INEGI, Marco Geoestadístico 2025 (simplificados a 15 m en el notebook D). Oferta: DENUE 05_2026, clases núcleo. */\nvar GEO_AGEB = ' + json.dumps(GA, ensure_ascii=False, separators=(',', ':')) + ';\n'
(DATOS_JS / 'geo-ageb.js').write_text(ga_txt, encoding='utf-8')
print('ok', DATOS_JS / 'geo-ageb.js', len(ga_txt))
