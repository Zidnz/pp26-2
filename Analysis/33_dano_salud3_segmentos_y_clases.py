"""33 — Segmentos, pictograma y clases latentes con el daño principal DANO_SALUD3 (ENASIC 2022, nacional).

Motivo: la pestaña «¿Quién lo carga?» del Observatorio mezclaba el daño principal (DANO_SALUD3: salud física, cansancio o
sueño; DEC-OBJ-002) con la medida amplia «algún daño» en tres bloques: la tabla de segmentos (script 12), el pictograma por
horas (sección 12b) y la tarjeta de clases latentes (notebook 23). Este script recalcula esos tres bloques con DANO_SALUD3.
No cambia ningún archivo anterior: escribe archivos nuevos (33_*).

Método: el mismo de cada origen. Parte A copia las definiciones y el estimador del notebook B (secciones 12 y 12b: razón
ponderada con FAC_CUI, varianza por linealización de Taylor con EST_DIS y UPM_DIS, IC 90 %). Parte B ejecuta las celdas de
código del notebook 23 que definen datos, modelo y clases (misma semilla) y repite sus celdas de «daño por horas» con el
desenlace nuevo.

Controles: antes de escribir, cada parte reproduce con «algún daño» las filas ya publicadas (12, 12b y 23). Si alguna no
coincide, se detiene sin escribir.

Salidas (resultados/): 33_segmentacion_salud3.csv, 33_series_salud3.csv, 33_seg23_salud3_por_horas.csv,
33_seg23_salud3_por_bloque_horas.csv. Alcance: nacional; nada sobre la CDMX ni alcaldías. Solo agregados.
Ejecutar desde Analysis/. Autor: Claude a pedido de Omar, 11 nov 2026. Sin revisión de otra persona.
"""
import json, sys
from pathlib import Path
import numpy as np, pandas as pd

AQUI = Path(__file__).resolve().parent
BASE = AQUI / 'datos' / 'enasic'; OUT = AQUI / 'resultados'
Z90 = 1.6449
ETQ = 'Daño a la salud (salud física, cansancio o sueño)'

# =============================================================== PARTE A · segmentos (12) y pictograma por horas (12b)
def tabla(nombre, archivo=None):
    archivo = archivo or f'conjunto_de_datos_{nombre}_enasic_2022.csv'
    df = pd.read_csv(BASE / f'conjunto_de_datos_{nombre}_enasic_2022' / 'conjunto_de_datos' / archivo, dtype=str)
    df.columns = [c.upper() for c in df.columns]
    return df

def _var_lin(df, z):
    t = pd.DataFrame({'h': df.EST_DIS.values, 'u': df.UPM_DIS.values, 'z': z}).groupby(['h', 'u']).z.sum().reset_index()
    g = t.groupby('h').z
    n_h = g.transform('size'); zbar = g.transform('mean')
    return ((n_h / (n_h - 1)).where(n_h > 1, 0) * (t.z - zbar) ** 2).sum()

def estimar(df, y, x, peso='FAC_CUI'):
    w = pd.to_numeric(df[peso]).to_numpy(float); y = np.asarray(y, float); x = np.asarray(x, float)
    X = (w * x).sum(); Y = (w * y).sum(); R = Y / X if X > 0 else np.nan
    se = np.sqrt(_var_lin(df, w * (y - R * x) / X)) if X > 0 else np.nan
    cv = se / R * 100 if R > 0 else np.nan
    prec = 'no estimable' if not np.isfinite(cv) else ('alta' if cv < 15 else ('moderada' if cv < 30 else 'baja'))
    return dict(pct=R * 100, cv=cv, li90=(R - Z90 * se) * 100, ls90=(R + Z90 * se) * 100,
                n_muestra_dominio=int(x.sum()), n_muestra_si=int((y * x).sum()), total_expandido=Y, precision=prec)

def diferencia(df, y, x1, x2, peso='FAC_CUI'):
    w = pd.to_numeric(df[peso]).to_numpy(float); y = np.asarray(y, float)
    x1 = np.asarray(x1, float); x2 = np.asarray(x2, float)
    X1, X2 = (w * x1).sum(), (w * x2).sum()
    if X1 == 0 or X2 == 0:
        return dict(dif_pp=np.nan, dif_li90=np.nan, dif_ls90=np.nan, dif_significativa=False)
    R1, R2 = (w * y * x1).sum() / X1, (w * y * x2).sum() / X2
    z = w * (y * x1 - R1 * x1) / X1 - w * (y * x2 - R2 * x2) / X2
    se = np.sqrt(_var_lin(df, z)); d = R1 - R2
    return dict(dif_pp=d * 100, dif_li90=(d - Z90 * se) * 100, dif_ls90=(d + Z90 * se) * 100,
                dif_significativa=bool((d - Z90 * se) * (d + Z90 * se) > 0))

def es(df, col, val='1'):
    return (df[col] == val).astype(int).to_numpy()

cui = tabla('tpob_cui')
hog = tabla('thogar', 'conjunto_de_datos_thogar_ensasic_2022.csv')
def num(col): return pd.to_numeric(cui[col], errors='coerce')
cui['HORAS'] = (num('P6_7').fillna(0) + num('P6_26').fillna(0)).clip(upper=168)
cui.loc[num('P6_7').isna() & num('P6_26').isna(), 'HORAS'] = np.nan
cui['G_HORAS'] = pd.cut(cui.HORAS, [0, 19.999, 39.999, 1000], labels=['<20 h', '20-39 h', '>=40 h']).astype(str)
def cualquiera(pares):
    return np.column_stack([(cui[a] == '1') | (cui[b] == '1') for a, b in pares]).any(axis=1).astype(int)
cui['DANO_SALUD'] = cualquiera([('P6_11_1', 'P6_30_1'), ('P6_11_3', 'P6_30_3'), ('P6_11_6', 'P6_30_6')])
cui['DANO_TRABAJO'] = cualquiera([('P6_12_1', 'P6_31_1'), ('P6_12_2', 'P6_31_2'), ('P6_12_5', 'P6_31_5')])
cui['DANO_ALGUNO'] = ((cui.DANO_SALUD + cui.DANO_TRABAJO) > 0).astype(int)
MID = {'1': 1800, '2': 4850.5, '3': 7100.5, '4': 9000.5, '5': 11000.5, '6': 13300.5, '7': 16050.5,
       '8': 19750.5, '9': 25500.5, '10': 37100.5, '11': 55000}
hog['ING'] = pd.to_numeric(hog.P3A_4.where(hog.P3A_4 != '99999'), errors='coerce').fillna(hog.P3A_5.map(MID))
nec = ((hog.HN_CDISC == '1') | (hog.HN_C60MA == '1')) & hog.ING.notna()
W_h = pd.to_numeric(hog.FAC_HOG)
def wq(v, w, q):
    o = np.argsort(v.values); c = np.cumsum(w.values[o]) / w.sum(); return v.values[o][np.searchsorted(c, q)]
cortes = [wq(hog.ING[nec], W_h[nec], q) for q in (.2, .4, .6, .8)]
assert cortes == [3200, 5000, 8000, 15000], f'Los cortes de quintil no coinciden con el script 04: {cortes}'
hog['QUINTIL'] = np.where(hog.ING.isna(), np.nan, np.digitize(hog.ING, cortes, right=True) + 1)
cui = cui.merge(hog[['LLAVEHOG', 'QUINTIL']], on='LLAVEHOG', how='left', validate='many_to_one')
edad = num('EDAD')
cui['G_SEXO'] = cui.SEXO.map({'1': 'Hombre', '2': 'Mujer'})
cui['G_EDAD'] = pd.cut(edad, [0, 39, 59, 130], labels=['15-39', '40-59', '60+']).astype(str)
cui['G_ING'] = cui.QUINTIL.map({1: 'Q1-Q2', 2: 'Q1-Q2', 3: 'Q3', 4: 'Q4-Q5', 5: 'Q4-Q5'})
cui['G_TIPO'] = np.where(cui.FILTRO6_1 == '1', 'Cuida discapacidad', 'Solo 60+ sin discapacidad')
DOM = ((cui.FILTRO6_1 == '1') | (cui.FILTRO6_6 == '1')).astype(int).to_numpy()
NOBUSCO = DOM * es(cui, 'P6_42', '2'); SINNEC = NOBUSCO * es(cui, 'P6_45_09')

SEG = [('Total', 'Total', None)]
SEG += [('Sexo', g, 'G_SEXO') for g in ['Mujer', 'Hombre']]
SEG += [('Edad', g, 'G_EDAD') for g in ['15-39', '40-59', '60+']]
SEG += [('Ingreso', g, 'G_ING') for g in ['Q1-Q2', 'Q3', 'Q4-Q5']]
SEG += [('A quién cuida', g, 'G_TIPO') for g in ['Cuida discapacidad', 'Solo 60+ sin discapacidad']]
SEG += [('Intensidad', g, 'G_HORAS') for g in ['<20 h', '20-39 h', '>=40 h']]

IND = [('dano', 'Declara algún daño por cuidar', cui.DANO_ALGUNO.to_numpy(), DOM),
       ('dano_sinnec', 'Declara daño, entre quienes dicen "no tuve necesidad"', cui.DANO_ALGUNO.to_numpy(), SINNEC),
       ('dano_s3', 'Declara daño a su salud (salud física, cansancio o sueño)', cui.DANO_SALUD.to_numpy(), DOM),
       ('dano_s3_sinnec', 'Declara daño a su salud, entre quienes dicen "no tuve necesidad"', cui.DANO_SALUD.to_numpy(), SINNEC)]
filas = []
for dim, g, col in SEG:
    m = np.ones(len(cui), int) if col is None else (cui[col] == g).astype(int).to_numpy()
    for k, et, y, dom in IND:
        f = dict(dimension=dim, segmento=g, clave=k, indicador=et, grupo='carga') | estimar(cui, y * dom * m, dom * m)
        if col is not None:
            niveles = [s for d_, s, c_ in SEG if c_ == col]
            resto = (cui[col].isin(niveles) & (cui[col] != g)).astype(int).to_numpy()
            f |= diferencia(cui, y, dom * m, dom * resto)
        filas.append(f)
res = pd.DataFrame(filas)
cols = ['pct', 'cv', 'li90', 'ls90', 'dif_pp', 'dif_li90', 'dif_ls90']
res[cols] = res[cols].round(2); res['total_expandido'] = res.total_expandido.round(0)

def comparar(nuevo, viejo, llaves, campos, nombre):
    m = nuevo.merge(viejo, on=llaves, suffixes=('', '_ref'), how='left')
    if m[[c + '_ref' for c in campos]].isna().any().any() and nombre != 'x':
        faltan = m[m[campos[0] + '_ref'].isna()][llaves]
        if len(faltan):
            raise SystemExit(f'Control {nombre}: {len(faltan)} filas sin referencia publicada:\n{faltan}')
    for c in campos:
        d = (m[c].astype(float) - m[c + '_ref'].astype(float)).abs().max()
        if not d < 0.011:
            raise SystemExit(f'Control {nombre}: la columna {c} difiere hasta {d} de lo publicado. No se escribe nada.')
    print(f'control {nombre}: {len(m)} filas reproducen lo publicado')

p12 = pd.read_csv(OUT / '12_segmentacion_estimaciones.csv', encoding='utf-8-sig')
comparar(res[res.clave.isin(['dano', 'dano_sinnec'])], p12, ['dimension', 'segmento', 'clave'],
         ['pct', 'li90', 'ls90', 'n_muestra_dominio', 'dif_pp'][:4], '12 (segmentos, algún daño)')

# pictograma: daño entre «sin necesidad», por horas, dentro de cada segmento (formato de 12b)
HG = ['<20 h', '20-39 h', '>=40 h']; ser = []
for dim, g, col in SEG:
    if dim == 'Intensidad':
        continue
    m = np.ones(len(cui), int) if col is None else (cui[col] == g).astype(int).to_numpy()
    for h in HG:
        mh = (cui.G_HORAS == h).astype(int).to_numpy()
        for serie, y in [('carga_dano', cui.DANO_ALGUNO.to_numpy()), ('carga_dano_s3', cui.DANO_SALUD.to_numpy())]:
            ser.append(dict(dimension=dim, segmento=g, serie=serie, categoria=h) | estimar(cui, y * SINNEC * m * mh, SINNEC * m * mh)
                       | dict(etiqueta=np.nan, dif_significativa=np.nan))
ser = pd.DataFrame(ser)
ser[['pct', 'cv', 'li90', 'ls90']] = ser[['pct', 'cv', 'li90', 'ls90']].round(2); ser['total_expandido'] = ser.total_expandido.round(0)
p12b = pd.read_csv(OUT / '12b_segmentacion_series.csv', encoding='utf-8-sig')
ref = p12b[(p12b.serie == 'carga_dano') & (p12b.dimension != 'Intensidad')]
comparar(ser[ser.serie == 'carga_dano'], ref, ['dimension', 'segmento', 'serie', 'categoria'], ['pct', 'li90', 'ls90', 'n_muestra_dominio'], '12b (pictograma, algún daño)')
A_seg = res[res.clave.isin(['dano_s3', 'dano_s3_sinnec'])].copy()
A_ser = ser[ser.serie == 'carga_dano_s3'].copy()
PREV_A = float(A_seg[(A_seg.dimension == 'Total') & (A_seg.clave == 'dano_s3')].pct.iloc[0])

# =============================================================== PARTE B · clases latentes (notebook 23)
import matplotlib; matplotlib.use('Agg')
nb = json.load(open(AQUI / '23_segmentacion_cuidadoras.ipynb', encoding='utf-8'))
ns = {'display': lambda *a, **k: None, '__name__': 'nb23'}
import os; os.chdir(AQUI)
CELDAS = [1, 3, 5, 8, 10, 12, 14, 17, 21]      # datos, estimador, variables, modelo, selección de k, clases y desenlaces
for i in CELDAS:
    src = ''.join(nb['cells'][i]['source'])
    src = '\n'.join(l for l in src.split('\n') if '.to_csv(' not in l and 'savefig' not in l and not l.strip().startswith('%'))
    exec(compile(src, f'nb23_celda_{i}', 'exec'), ns)
fila, dif_resto, asignar = ns['fila'], ns['dif_resto'], ns['asignar']
K, HORAS, DISC, DES = ns['K'], ns['HORAS'], ns['DISC'], ns['DESENLACES']
S3 = np.asarray(ns['SALUD'] | ns['CANSANCIO'] | ns['SUENO'], float)
prevB = fila(S3)['pct']
if abs(prevB - PREV_A) > 0.01:
    raise SystemExit(f'DANO_SALUD3 no coincide entre las dos partes: {PREV_A} (A) y {prevB} (B)')
dif_c = asignar(K) == 0; ALTA = HORAS >= 40
YS = [('Algún daño por cuidar', DES['Algún daño por cuidar']), ('Salud física deteriorada', DES['Salud física deteriorada']), (ETQ, S3)]
eh = []
for nombre_h, dom_h in [('Menos de 40 h', ~ALTA), ('40 h o más', ALTA)]:
    for nombre_y, y in YS:
        f1 = fila(y, dif_c & dom_h); f0 = fila(y, (~dif_c) & dom_h)
        d, dli, dls = dif_resto(np.where(dom_h, y, np.nan), dif_c)
        eh.append(dict(horas=nombre_h, desenlace=nombre_y, con_dificultad=f1['pct'], n_con=f1['n_muestra'], prec_con=f1['precision'],
                       sin_dificultad=f0['pct'], n_sin=f0['n_muestra'], prec_sin=f0['precision'],
                       dif_pp=d, dif_li90=dli, dif_ls90=dls, significativa=(dli > 0) or (dls < 0)))
eh = pd.DataFrame(eh).round(3)
bh = []
for nombre_b, dom_b in [('Bloque discapacidad', DISC), ('Solo 60+ sin discapacidad', ~DISC)]:
    for nombre_h, dom_h in [('Menos de 40 h', ~ALTA), ('40 h o más', ALTA)]:
        for nombre_y, y in YS:
            yy = np.where(dom_b & dom_h, y, np.nan)
            f1 = fila(yy, dif_c); f0 = fila(yy, ~dif_c)
            d, dli, dls = dif_resto(yy, dif_c)
            bh.append(dict(bloque=nombre_b, horas=nombre_h, desenlace=nombre_y, con_dificultad=f1['pct'], n_con=f1['n_muestra'],
                           sin_dificultad=f0['pct'], n_sin=f0['n_muestra'], dif_pp=d, dif_li90=dli, dif_ls90=dls,
                           significativa=(dli > 0) or (dls < 0), interpretable=min(f1['n_muestra'], f0['n_muestra']) >= 30))
bh = pd.DataFrame(bh).round(3)
comparar(eh[eh.desenlace != ETQ], pd.read_csv(OUT / '23_seg_dano_por_horas.csv', encoding='utf-8-sig'), ['horas', 'desenlace'],
         ['con_dificultad', 'sin_dificultad', 'n_con', 'n_sin', 'dif_pp'], '23 (clases, por horas)')
comparar(bh[bh.desenlace != ETQ], pd.read_csv(OUT / '23_seg_dano_por_bloque_horas.csv', encoding='utf-8-sig'), ['bloque', 'horas', 'desenlace'],
         ['con_dificultad', 'sin_dificultad', 'n_con', 'n_sin', 'dif_pp'], '23 (clases, por bloque y horas)')

# =============================================================== escritura (solo si pasaron los cuatro controles)
A_seg.to_csv(OUT / '33_segmentacion_salud3.csv', index=False, encoding='utf-8-sig')
A_ser.to_csv(OUT / '33_series_salud3.csv', index=False, encoding='utf-8-sig')
eh[eh.desenlace == ETQ].to_csv(OUT / '33_seg23_salud3_por_horas.csv', index=False, encoding='utf-8-sig')
bh[bh.desenlace == ETQ].to_csv(OUT / '33_seg23_salud3_por_bloque_horas.csv', index=False, encoding='utf-8-sig')
print('ESCRITO. Prevalencia de DANO_SALUD3 en el universo:', round(PREV_A, 2), '%')
print(A_seg[A_seg.dimension != 'Intensidad'][['dimension', 'segmento', 'clave', 'pct', 'li90', 'ls90', 'precision', 'dif_pp', 'dif_significativa']].to_string())
print(eh[eh.desenlace == ETQ].to_string()); print(bh[bh.desenlace == ETQ].to_string())
