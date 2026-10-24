"""Construye datos_observatorio.json, js/datos/datos.js, js/datos/geo.js y js/datos/geo-estados.js a partir de los archivos de resultados del repositorio.

Observatorio del Cuidado (actualizado el 6 oct 2026).
Ninguna cifra del Observatorio se escribe a mano: todas se leen aquí de Analysis/resultados, Analysis/outputs y
Analysis/matrices. Si un archivo cambia, se vuelve a correr este script y la página se regenera.
Desde el 21 oct 2026, territorio (alcaldías y totales) y relevo.filas se leen del almacén DW/observatorio_dw.sqlite:
el orden es Analysis/ → python -B DW/etl/run_etl.py → este script. Si el almacén falta o está desfasado, se detiene.

Uso (desde la raíz del repo):  python -B DW/etl/run_etl.py  y después  python Frontend/observatorio/build_datos.py
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
  resultados/19_costo_hora_por_jornada.csv (costo de la hora por tipo de jornada, sección 19, 13 oct 2026)
  resultados/20_sostenibilidad_escenarios.csv (costo con carga laboral, copago, escala CDMX y financiamiento del relevo, script 20, 15 oct 2026)
  resultados/13_rezago_por_alcaldia.csv, 13_calidad_rezago.csv (rezago social por AGEB, CONEVAL 2020)
  resultados/16_perfil_grupo_problema.csv, 16_distribucion_horas.csv (perfil del grupo y horas, script 16)
  resultados/23_seg_{perfiles,seleccion_k,dano_por_horas,dano_por_bloque_horas,dificultad_fuera_regla,comparacion_pareada}.csv (segmentación por clases latentes, notebook 23, 21 oct 2026)
  matrices/diccionario_observatorio.csv (diccionario de variables y de esta base; el script se detiene si falta un bloque)
  resultados/14_enigh_asequibilidad_cdmx.csv, 14_enigh_resumen.csv (asequibilidad con ingreso ENIGH 2022, nacional y CDMX)
  resultados/12_segmentacion_estimaciones.csv (filtros de segmentación)
  resultados/12b_segmentacion_series.csv (series completas por segmento: filtro de toda la pestaña, 14 oct 2026)
  resultados/11_modelo_focalizacion_global.csv, _por_grupo.csv, _sensibilidad.csv, 11_modelo_coeficientes_logit.csv
  resultados/11_modelo_alternativas.csv, _curvas_cobertura.csv, _calibracion.csv, _importancia.csv, _por_cupo.csv y 11_objetivo_*.csv (13 oct 2026)
  outputs/indice_por_tipo_servicio.csv, outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv
  matrices/inventario_fuentes_cuidado.csv, matrices/pares_oferta_necesidad.csv
  Frontend/js/cdmx-alcaldias.js (límites de alcaldías, INEGI Marco Geoestadístico 2020)
  resultados/17_enigh_60mas_por_entidad.csv, 17_marginacion_entidad_conapo_2020.csv, 17_validacion_enigh.csv (contexto estatal)
  resultados/13_rezago_ageb_cdmx.csv (zonas: una fila por AGEB urbana)
  Frontend/vendor/svg-maps-mexico/index.js (contornos esquemáticos de las 32 entidades, CC BY 4.0)
  resultados/18_tipologia_*.csv, 18_tipologia_contornos.geojson, 18_oferta_nucleo_puntos.csv (tipología de AGEB, notebook D, sección 18)
  resultados/24_prioridad_alcaldia.csv, 24_brecha_ageb.csv (regla de decisión para ordenar alcaldías por brecha, script 24, 24 oct 2026)
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


def registros(nombre):
    return [{k: nn(v) for k, v in r.items()} for r in leer(R / nombre).to_dict('records')]


def una(df, **cond):
    m = df
    for k, v in cond.items():
        m = m[m[k] == v]
    if len(m) != 1:
        raise SystemExit(f'No encontré exactamente una fila para {cond} ({len(m)})')
    return m.iloc[0]


# ---------------------------------------------------------------- Almacén (DW) — 21 oct 2026
# Ruta única para los bloques que ya pasan por el almacén: Analysis/ → DW/etl/run_etl.py → DW/observatorio_dw.sqlite → aquí.
# Hoy: territorio.alcaldias, territorio.totales y relevo.filas (los demás bloques siguen leyendo Analysis/ directamente).
# El script se DETIENE si: no existe el almacén; su última corrida falló; viola la regla de alcance (v_violaciones_alcance);
# o algún archivo de Analysis/ que alimenta esos bloques cambió desde la corrida (SHA-256 distinto al de etl_archivo).
# En ese último caso hay que correr primero: python -B DW/etl/run_etl.py
import hashlib, sqlite3
DW_SQLITE = RAIZ / 'DW' / 'observatorio_dw.sqlite'
ARCHIVOS_VIA_DW = {  # nombre_stg del ETL → archivo de Analysis/ que lee
    'aseq_10': 'Analysis/resultados/10_asequibilidad_relevo.csv',
    'terr_indice_tipo': 'Analysis/outputs/indice_por_tipo_servicio.csv',
    'terr_oferta_nucleo': 'Analysis/outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv',
    'terr_capacidad': 'Analysis/resultados/02_indice_capacidad_residencial.csv',
    'terr_dependencia': 'Analysis/resultados/08_dependencia_severa_alcaldia.csv',
    'terr_pobreza65': 'Analysis/resultados/09_pobreza_65mas_alcaldia_cdmx.csv',
    'terr_rezago': 'Analysis/resultados/13_rezago_por_alcaldia.csv',
}


def abrir_dw():
    if not DW_SQLITE.exists():
        raise SystemExit(f'No existe {DW_SQLITE}. Corre primero: python -B DW/etl/run_etl.py')
    cx = sqlite3.connect(DW_SQLITE.resolve().as_uri() + '?mode=ro', uri=True)
    cx.row_factory = sqlite3.Row
    run = cx.execute('SELECT run_id, fin, estado, version_etl FROM etl_run ORDER BY run_id DESC LIMIT 1').fetchone()
    if run is None or run['estado'] not in ('ok', 'ok con advertencias'):
        raise SystemExit(f'La última corrida del ETL no terminó bien ({dict(run) if run else "sin corridas"}). Corre: python -B DW/etl/run_etl.py')
    n = cx.execute('SELECT COUNT(*) FROM v_violaciones_alcance').fetchone()[0]
    if n:
        raise SystemExit(f'El almacén tiene {n} cifra(s) fuera de su alcance geográfico (v_violaciones_alcance). No se publica.')
    huellas = {r['nombre_stg']: (r['ruta'], r['sha256']) for r in
               cx.execute('SELECT nombre_stg, ruta, sha256 FROM etl_archivo WHERE run_id = ?', [run['run_id']])}
    desfasados = []
    for stg, ruta in ARCHIVOS_VIA_DW.items():
        if stg not in huellas or huellas[stg][0] != ruta:
            raise SystemExit(f'La corrida {run["run_id"]} del ETL no registra {ruta} como {stg}. ¿Cambió config_mapeo.py?')
        if hashlib.sha256((RAIZ / ruta).read_bytes()).hexdigest() != huellas[stg][1]:
            desfasados.append(ruta)
    if desfasados:
        raise SystemExit('Estos archivos cambiaron después de la última corrida del ETL; el almacén está desfasado:\n  '
                         + '\n  '.join(desfasados) + '\nCorre primero: python -B DW/etl/run_etl.py')
    dq = cx.execute('SELECT codigo FROM etl_dq WHERE run_id = ? AND paso = 0', [run['run_id']]).fetchall()
    return cx, dict(run), [r['codigo'] for r in dq]


DW, DW_RUN, DW_DQ_ABIERTAS = abrir_dw()
DW_TXT = f'DW/observatorio_dw.sqlite, corrida {DW_RUN["run_id"]} del ETL ({DW_RUN["fin"]})'
print('ok almacén:', DW_TXT, '· pruebas abiertas:', DW_DQ_ABIERTAS or 'ninguna')


def dw_filas(sql, params=()):
    return [dict(r) for r in DW.execute(sql, params).fetchall()]


def entero(v):
    """El DW guarda REAL; los conteos se publican como entero. None se queda None (desconocido, no cero)."""
    if v is None:
        return None
    if float(v).is_integer():
        return int(v)
    raise SystemExit(f'Se esperaba un conteo entero y el almacén tiene {v}')


e03 = leer(R / '03_enasic_barreras_estimaciones.csv')
e07 = leer(R / '07_enasic_necesidad_vs_norma_estimaciones.csv')
d07 = leer(R / '07_enasic_diferencias.csv')
F03, F07 = 'Analysis/resultados/03_enasic_barreras_estimaciones.csv', 'Analysis/resultados/07_enasic_necesidad_vs_norma_estimaciones.csv'

D = {'actualizado': '6 oct 2026',
     'generado_desde': f'Analysis/resultados, Analysis/outputs y Analysis/matrices; territorio y asequibilidad del relevo vía {DW_TXT} (ver build_datos.py)'}

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

# Series completas por segmento (notebook B, sección 12b, 14 oct 2026): cada gráfica de Necesidad y Barreras que sale de
# TPOB_CUI, re-estimada dentro de cada segmento. Alimenta el filtro de toda la pestaña y las filas de KPI.
s2 = leer(R / '12b_segmentacion_series.csv')
for col in ['dimension', 'segmento', 'serie', 'categoria', 'pct', 'precision']:
    if col not in s2:
        raise SystemExit(f'12b_segmentacion_series.csv: falta la columna {col}')
if not ((s2.dimension == 'Total') & (s2.serie == 'kpi') & (s2.categoria == 'horas_total')).any():
    raise SystemExit('12b_segmentacion_series.csv: falta el KPI de horas del total nacional')
D['seg2'] = [{k: nn(v) for k, v in r.items()} for r in
             s2[['dimension', 'segmento', 'serie', 'categoria', 'etiqueta', 'pct', 'cv', 'li90', 'ls90', 'n_muestra_dominio',
                 'total_expandido', 'precision', 'dif_significativa']].to_dict('records')]
D['seg2_fuente'] = 'Analysis/resultados/12b_segmentacion_series.csv (notebook B, sección 12b)'

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

# Segmentación por clases latentes (notebook 23, 21 oct 2026): dos perfiles de cuidadoras definidos por la dificultad en la tarea,
# no por las horas. Exploratorio y sin doble revisión: la tarjeta lo dice. Solo agregados; ninguna clase por persona.
S23 = lambda n: leer(R / f'23_seg_{n}.csv')
p23, sel23, dh23 = S23('perfiles'), S23('seleccion_k'), S23('dano_por_horas')
bh23, fu23, pa23 = S23('dano_por_bloque_horas'), S23('dificultad_fuera_regla'), S23('comparacion_pareada')
p2 = p23[p23.k == 2]
if sorted(p2.nombre.unique()) != ['Dificultad en la tarea', 'Sin dificultad declarada']:
    raise SystemExit('23_seg_perfiles.csv: los nombres de las clases de k = 2 cambiaron; revisar el notebook 23 antes de publicar')
if int(sel23.loc[sel23.ARI_mediana.idxmax(), 'k']) != 2:
    raise SystemExit('23_seg_seleccion_k.csv: k = 2 ya no es la solución más estable; revisar la tarjeta antes de publicar')
if len(dh23) != 6 or len(bh23) != 8:
    raise SystemExit(f'23_seg_dano_por_horas / _por_bloque_horas: {len(dh23)} y {len(bh23)} filas, se esperaban 6 y 8')
COLS23 = ['nombre', 'variable', 'categoria', 'pct', 'li90', 'ls90', 'precision', 'n_muestra', 'n_si', 'total_expandido', 'pct_total']
D['seg23'] = {
    'clases': [{k: nn(v) for k, v in r.items()} for r in p2[p2.variable == 'tamano'][COLS23].to_dict('records')],
    'perfil': [{k: nn(v) for k, v in r.items()} for r in
               p2[p2.variable.isin(['fuerza', 'nocoopera', 'capacitacion', 'reqapoyo', 'insatisfecha']) |
                  ((p2.variable == 'horas') & (p2.categoria == '80 h o más')) |
                  ((p2.variable == 'motivo') & (p2.categoria == 'Obligación o «la única que podía»'))][COLS23].to_dict('records')],
    'dano_horas': registros('23_seg_dano_por_horas.csv'),
    'dano_bloque': registros('23_seg_dano_por_bloque_horas.csv'),
    'fuera_regla': {k: nn(v) for k, v in fu23.iloc[0].items()},
    'estabilidad': [{'k': int(r.k), 'ari': nn(r.ARI_mediana), 'bic': nn(r.BIC), 'entropia': nn(r.entropia)} for r in sel23[sel23.k.between(2, 4)].itertuples()],
    'modelo_vs_regla_max_pp': float(pa23[pa23.comparacion == 'k=2 contra regla de dificultad (2)'].dif_media.abs().max()),
    'fuente': 'Analysis/resultados/23_seg_*.csv (notebook 23, Analysis/23_segmentacion_cuidadoras.ipynb)',
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
# 21 oct 2026: relevo.filas se lee del almacén (mart 3, v_mart_asequibilidad), no del CSV del script 10.
# Una fila por (salario, paquete) con los tres umbrales; mismo orden que el archivo de origen (fila_origen).
SAL_HORA = {r['nombre']: r['salario_hora_2026'] for r in dw_filas('SELECT nombre, salario_hora_2026 FROM dim_salario_ref')}
aseq = dw_filas("""SELECT salario_referencia, paquete, horas_semana, costo_mensual_2026, costo_pct_ingreso_mediano,
                          umbral_pct_ingreso, pct_hogares_asequible, n_muestra_dominio, alcance, fila_origen
                   FROM v_mart_asequibilidad
                   WHERE ingreso_referencia = 'Ingreso del hogar (ENASIC 2022)' AND nivel_geografico = 'Nacional'
                   ORDER BY fila_origen, umbral_pct_ingreso""")
rel_filas = {}
for r in aseq:
    k = (r['salario_referencia'], r['paquete'])
    f = rel_filas.setdefault(k, {'salario': k[0], 'salario_hora_2026': float(SAL_HORA[k[0]]), 'paquete': k[1],
                                 'horas': int(r['horas_semana']), 'costo_mensual_2026': entero(r['costo_mensual_2026']),
                                 'pct_ingreso_mediano': float(r['costo_pct_ingreso_mediano']),
                                 'n': entero(r['n_muestra_dominio'])})
    f[f"u{r['umbral_pct_ingreso']}"] = float(r['pct_hogares_asequible'])
if len(rel_filas) != 10 or any(set(f) != {'salario', 'salario_hora_2026', 'paquete', 'horas', 'costo_mensual_2026',
                                         'pct_ingreso_mediano', 'n', 'u10', 'u20', 'u30'} for f in rel_filas.values()):
    raise SystemExit(f'v_mart_asequibilidad: se esperaban 10 combinaciones salario × paquete con 3 umbrales; hay {len(rel_filas)}')
alcances = {r['alcance'] for r in aseq}
if len(alcances) != 1:
    raise SystemExit(f'v_mart_asequibilidad: se esperaba un solo texto de alcance y hay {len(alcances)}')
D['relevo'] = {
    'filas': [{k: f[k] for k in ('salario', 'salario_hora_2026', 'paquete', 'horas', 'costo_mensual_2026',
                                 'pct_ingreso_mediano', 'u10', 'u20', 'u30', 'n')} for f in rel_filas.values()],
    'alcance': alcances.pop(),
    'fuente': f'{DW_TXT} · v_mart_asequibilidad (origen: Analysis/resultados/10_asequibilidad_relevo.csv, script 10)',
}
# `rel` con los nombres de columna del CSV del script 10, para el script 14 y la ficha de KPI de más abajo. Sale del almacén.
rel = pd.DataFrame([{'salario': f['salario'], 'horas_semana': f['horas'], 'salario_hora_2026': f['salario_hora_2026'],
                     'costo_pct_ingreso_mediano': f['pct_ingreso_mediano'],
                     **{f'pct_hogares_costo_<=_{u}pct_ingreso': f[f'u{u}'] for u in (10, 20, 30)}} for f in D['relevo']['filas']])
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
# Costo de la hora por tipo de jornada (sección 19, 13 oct 2026): piso legal, sin prestaciones; arts. 60-61 LFT por verificar
j19 = leer(R / '19_costo_hora_por_jornada.csv')
D['jornada'] = {
    'filas': [{'jornada': r.jornada, 'horario': r.horario_lft, 'horas_max': float(r.horas_max_jornada),
               'hora': float(r.hora_ordinaria_2026), 'dif_pct': float(r.dif_vs_diurna_pct),
               'horas': int(r.paquete_horas_semana), 'costo_mensual_2026': int(r.costo_mensual_2026)} for r in j19.itertuples()],
    'salario_diario': float(j19.salario_diario_2026.iloc[0]),
    'evidencia': j19.evidencia.iloc[0],
    'fuente': 'Analysis/resultados/19_costo_hora_por_jornada.csv (script 19)',
}

# Sostenibilidad del relevo por horas (script 20, 15 oct 2026): costo con carga laboral, copago, escala CDMX y financiamiento.
# Aceptación y costo de operación son ILUSTRATIVOS (sin fuente): se marcan así en la tarjeta. Los hogares elegibles de la CDMX son una inferencia.
s20 = leer(R / '20_sostenibilidad_escenarios.csv')
def b20(nombre):
    g = s20[s20.bloque == nombre]
    if g.empty:
        raise SystemExit(f'20_sostenibilidad_escenarios.csv no trae el bloque {nombre!r}')
    return g
cu20 = b20('costo_unitario')
cp20 = b20('copago')
es20 = b20('escala_cdmx')
ft20 = b20('financiamiento_total_cdmx')
sol20 = float(anc[anc.ancla.str.startswith('Solicitud CDMX')].valor.iloc[0])
D['sostenibilidad'] = {
    'costo': [{'jornada': r.jornada, 'horas': int(r.horas_semana), 'carga': int(r.carga), 'carga_pct': float(r.carga_pct),
               'costo_mensual': float(r.costo_mensual)} for r in cu20.itertuples()],
    'copago': [{'fuente': r.fuente_ingreso, 'hogar': r.hogar, 'ingreso': nn(r.ingreso_2026), 'copago': float(r.copago),
                'subsidio': float(r.subsidio_laboral)} for r in cp20.itertuples()],
    'escala': [{'escenario': r.escenario, 'aceptacion': float(r.aceptacion), 'hogares': int(r.hogares),
                'costo_mdp': float(r.costo_laboral_anual_mdp), 'sub_mdp': float(r.subsidio_laboral_anual_mdp),
                'pct_solicitud': float(r.pct_solicitud)} for r in es20.itertuples()],
    'financiamiento': [{'escenario': r.escenario, 'opex': float(r.opex_hogar_mes), 'mdp': float(r.mdp),
                        'pct_solicitud': float(r.pct_solicitud)} for r in ft20.itertuples()],
    'elegibles_cdmx': round(float(es20.hogares.iloc[-1]) / float(es20.aceptacion.iloc[-1])),
    'base': {'horas': 6, 'jornada': 'Diurna', 'carga': 2, 'umbral_pct': 20},
    'solicitud_mdp': sol20,
    'fuente': 'Analysis/resultados/20_sostenibilidad_escenarios.csv (script 20; supuestos en 20_modelo_sostenibilidad.xlsx)',
}

# ---------------------------------------------------------------- Modelo de focalización (11)
g11 = leer(R / '11_modelo_focalizacion_global.csv')
D['modelo'] = {
    'global': [{k: nn(v) for k, v in r.items()} for r in g11.to_dict('records')],
    'grupos': [{k: nn(v) for k, v in r.items()} for r in leer(R / '11_modelo_focalizacion_por_grupo.csv').to_dict('records')],
    'sensibilidad': [{k: nn(v) for k, v in r.items()} for r in leer(R / '11_modelo_focalizacion_sensibilidad.csv').to_dict('records')],
    'coef': [{'variable': r.iloc[0], 'coef': float(r.iloc[1])} for _, r in leer(R / '11_modelo_coeficientes_logit.csv').iterrows()],
    'fuente': 'Analysis/resultados/11_modelo_focalizacion_*.csv y 11_modelo_coeficientes_logit.csv (notebook 11)',
}

# ---------------------------------------------------------------- Modelo de focalización, ampliación del 13 oct 2026 (11, subsecciones 11 a 16)
D['modelo2'] = {
    'alternativas': registros('11_modelo_alternativas.csv'),
    'curvas': registros('11_modelo_curvas_cobertura.csv'),
    'calibracion': registros('11_modelo_calibracion.csv'),
    'importancia': registros('11_modelo_importancia.csv'),
    'cupo': registros('11_modelo_por_cupo.csv'),
    'por_horas': registros('11_objetivo_por_horas.csv'),
    'por_grupo': registros('11_objetivo_por_grupo.csv'),
    'resumen': registros('11_objetivo_resumen.csv'),
    'decision': registros('11_objetivo_decision.csv'),
    'sin_fuerza': registros('11_objetivo_sin_fuerza.csv'),
    'fuente': 'Analysis/resultados/11_modelo_{alternativas,curvas_cobertura,calibracion,importancia,por_cupo}.csv y 11_objetivo_*.csv (notebook B, sección 11)',
}
for clave, n_esperado in [('alternativas', 18), ('cupo', 24), ('decision', 11), ('sin_fuerza', 6)]:
    if len(D['modelo2'][clave]) != n_esperado:
        raise SystemExit(f'modelo2.{clave}: {len(D["modelo2"][clave])} filas, se esperaban {n_esperado}')

# ---------------------------------------------------------------- Territorio CDMX (01, 02, 05, 08, 09)
# indice_por_tipo_servicio, oferta_nucleo_vs_pob60, 08_dependencia y 13_rezago ya no se leen aquí: llegan por el almacén.
ql = pd.read_csv(R / '02_indice_capacidad_residencial.csv', index_col=0, encoding='utf-8-sig')  # solo ql_plazas
pob = leer(R / '09_pobreza_65mas_alcaldia_cdmx.csv').set_index('municipio')                  # solo pob65_prec
cal13 = leer(R / '13_calidad_rezago.csv').set_index('chequeo')
ABR = {'Azcapotzalco': 'AZC', 'Coyoacán': 'COY', 'Cuajimalpa de Morelos': 'CUAJ', 'Gustavo A. Madero': 'GAM', 'Iztacalco': 'IZTAC',
       'Iztapalapa': 'IZTAP', 'La Magdalena Contreras': 'MC', 'Milpa Alta': 'MA', 'Álvaro Obregón': 'AO', 'Tláhuac': 'TLAH',
       'Tlalpan': 'TLAL', 'Xochimilco': 'XOCH', 'Benito Juárez': 'BJ', 'Cuauhtémoc': 'CUAU', 'Miguel Hidalgo': 'MH',
       'Venustiano Carranza': 'VC'}
# 21 oct 2026: las cifras por alcaldía se leen del almacén (v_mart_perfil_alcaldia). Del CSV solo quedan los dos campos
# que el DW no tiene: ql_plazas (QL_p60_A del notebook 02) y pob65_prec (precisión de la pobreza 65+, notebook 09).
# Sus archivos también los carga el ETL, y la huella SHA-256 de arriba garantiza que son los de la misma corrida.
# campo publicado → (columna del mart, conversión). pct_pob60 se publica a 3 decimales, como en indice_por_tipo_servicio.csv;
# el DW lo guarda completo (medida poblacion_60mas_participacion_p01).
CAMPOS_DW = {
    'asilos': ('oferta_nucleo_asilos', entero), 'centros_dia': ('oferta_nucleo_centros_dia', entero),
    'pct_pob60': ('poblacion_60mas_participacion_p01', lambda v: round(v, 3)),
    'idx_asilos': ('indice_asilos_vs_60', float), 'idx_centros': ('indice_centros_dia_vs_60', float),
    'ql_plazas': None,
    'plazas': ('plazas_residencias_privadas', entero),
    'dep_total': ('dependencia_severa_personas', entero), 'dep_pct': ('dependencia_severa_pct_cdmx', float),
    'pob65_pct': ('pobreza_65mas_pct_2020', float), 'pob65_n': ('poblacion_65mas_coneval_2020', entero),
    'pob65_prec': None,
    'rez_pct': ('rezago_pct_pob_medio_o_mas', float), 'rez_nageb': ('rezago_n_ageb_medio_o_mas', entero),
    'sds_pct': ('rezago_pct_sin_derechohabiencia', float), 'sds_p10': ('rezago_sdsalud_p10', float),
    'sds_p90': ('rezago_sdsalud_p90', float), 'pob_ageb': ('rezago_poblacion_validas', entero),
}
OBLIGATORIOS = {'asilos', 'centros_dia', 'pct_pob60', 'idx_asilos', 'idx_centros', 'dep_total', 'dep_pct',
                'pob65_pct', 'pob65_n', 'rez_pct', 'rez_nageb', 'sds_pct', 'sds_p10', 'sds_p90', 'pob_ageb'}  # plazas puede faltar (P02: 12 de 16)
perfil = {r['alcaldia']: r for r in dw_filas('SELECT * FROM v_mart_perfil_alcaldia')}
# Orden de publicación: el del archivo de origen del índice por tipo de servicio (fila_origen en el DW).
orden = [r['geografia'] for r in dw_filas("""SELECT geografia FROM v_mart_territorio
                                           WHERE medida_codigo = 'indice_asilos_vs_60' AND nivel_geografico = 'Alcaldía'
                                           ORDER BY fila_origen""")]
if sorted(orden) != sorted(perfil) or len(perfil) != 16 or set(perfil) != set(ABR):
    raise SystemExit(f'El almacén no trae las 16 alcaldías esperadas: {sorted(set(ABR) ^ set(perfil))}')
terr = {}
for municipio in orden:
    a, fila_dw = ABR[municipio], perfil[municipio]
    qa = ql.loc[a, 'QL_p60_A'] if a in ql.index else float('nan')
    t = {'abr': a}
    for campo, regla in CAMPOS_DW.items():
        if campo == 'ql_plazas':
            t[campo] = None if pd.isna(qa) else float(qa)
        elif campo == 'pob65_prec':
            t[campo] = pob.loc[municipio].precision_pct_pobreza_2020
        else:
            col, conv = regla
            v = fila_dw[col]
            if v is None and campo in OBLIGATORIOS:
                raise SystemExit(f'El almacén no tiene {col} para {municipio} (desconocido). No se publica un hueco.')
            t[campo] = None if v is None else conv(v)
    terr[municipio] = t


def suma(campo):
    vals = [t[campo] for t in terr.values()]
    if any(v is None for v in vals):
        raise SystemExit(f'No se puede sumar {campo}: hay alcaldías sin dato')
    return sum(vals)


D['territorio'] = {'alcaldias': terr,
                   'totales': {'asilos': suma('asilos'), 'centros_dia': suma('centros_dia'), 'dep_total': suma('dep_total')},
                   'almacen': {'origen': DW_TXT, 'vista': 'v_mart_perfil_alcaldia',
                               'campos_fuera_del_dw': ['ql_plazas', 'pob65_prec'], 'pruebas_abiertas': DW_DQ_ABIERTAS},
                   'fuentes': {'idx': 'Analysis/outputs/indice_por_tipo_servicio.csv (notebook 01, DENUE 05/2026)' + ' · vía ' + DW_TXT,
                               'ql': 'Analysis/resultados/02_indice_capacidad_residencial.csv (notebook 02)' + ' · plazas vía ' + DW_TXT + '; QL directo del archivo',
                               'dep': 'Analysis/resultados/08_dependencia_severa_alcaldia.csv (script 08)' + ' · vía ' + DW_TXT,
                               'pob': 'Analysis/resultados/09_pobreza_65mas_alcaldia_cdmx.csv (notebook 09, CONEVAL)' + ' · vía ' + DW_TXT + '; precisión directo del archivo',
                               'rez': 'Analysis/resultados/13_rezago_por_alcaldia.csv (script 13, CONEVAL IRS 2020 por AGEB)' + ' · vía ' + DW_TXT},
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

# Regla de decisión para ordenar alcaldías por brecha (script 24, 24 oct 2026). Sin modelo: niveles por volumen y concentración,
# con sensibilidad a tres cortes y tres tamaños de grupo de cabeza. Vive dentro del bloque «tipologia» (ya documentado en el diccionario).
p24 = leer(R / '24_prioridad_alcaldia.csv')
a24 = leer(R / '24_brecha_ageb.csv')
if set(p24.alcaldia) != {r['alcaldia'] for r in D['tipologia']['por_alcaldia']}:
    raise SystemExit('24_prioridad_alcaldia.csv: las alcaldías no coinciden con 18_tipologia_por_alcaldia.csv; vuelve a correr Analysis/24_prioridad_zonas.py')
if int(p24.ageb_cuartil.sum()) != D['tipologia']['brecha_total']['ageb'] or int(p24.N_cuartil.sum()) != D['tipologia']['brecha_total']['n_60']:
    raise SystemExit('24_prioridad_alcaldia.csv no suma lo mismo que la brecha del notebook D (18_tipologia_*); vuelve a correr los dos')
D['tipologia']['prioridad'] = {
    'combinaciones': int(p24.combinaciones_total.iloc[0]), 'cortes': ['tercil', 'cuartil', 'quintil'], 'tamanos_cabeza': [4, 5, 6],
    'alcaldias': [{'alcaldia': r.alcaldia, 'pob_60': int(r.pob_60), 'n_60_brecha': int(r.N_cuartil), 'pct_60_brecha': float(r.P_cuartil),
                   'n_60_brecha_tercil': int(r.N_tercil), 'n_60_brecha_quintil': int(r.N_quintil),
                   'nivel_referencia': int(r.nivel_referencia), 'nivel_modal': int(r.nivel_modal), 'etiqueta_modal': r.etiqueta_modal,
                   'combinaciones_en_modal': int(r.combinaciones_en_modal), 'estable': bool(r.estable),
                   'nivel_min': int(r.nivel_min), 'nivel_max': int(r.nivel_max), 'pct_brecha_en_5_ageb': nn(r.pct_brecha_en_5_ageb_mayores),
                   'orden_presentacion': int(r.orden_presentacion)} for r in p24.sort_values('orden_presentacion').itertuples()],
    'ageb': {'n_tercil': int(len(a24)), 'n_cuartil': int(p24.ageb_cuartil.sum()), 'n_quintil': int(p24.ageb_quintil.sum()),
             'n_3_cortes': int((a24.robusta == 'en los 3 cortes').sum()), 'cuartil_por_poco': int(a24.pasa_por_poco_cuartil.sum())},
    'fuente': 'Analysis/resultados/24_prioridad_*.csv y 24_brecha_ageb.csv (script 24, 24 oct 2026; sobre 18_tipologia_ageb.csv)',
}

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
# 21 oct 2026: grupo, depende_de y advertencia alimentan el linaje y la tabla expandible de la pestaña Método.
CAMPOS_DIC = ['nombre', 'definicion', 'origen', 'grupo', 'depende_de', 'advertencia', 'unidad_o_grano', 'factor_de_expansion', 'archivo']
D['diccionario'] = dic[dic.tipo.str.startswith('variable')][CAMPOS_DIC].fillna('').to_dict('records')
for v in D['diccionario']:
    v['depende_de'] = [x.strip() for x in v['depende_de'].split(';') if x.strip()]
nombres = {v['nombre'] for v in D['diccionario']}
huerfanas = sorted({(v['nombre'], d) for v in D['diccionario'] for d in v['depende_de'] if d not in nombres})
if huerfanas:
    raise SystemExit(f'diccionario_observatorio.csv: depende_de apunta a variables que no existen: {huerfanas}')
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
