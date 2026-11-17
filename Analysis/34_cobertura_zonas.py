"""34 - Optimización de cobertura para elegir zonas de arranque del relevo (CDMX, Censo 2020 + DENUE 05_2026).

Decisión que informa: «¿En qué orden las zonas?» (Observatorio, pestaña «¿A quién primero?», decisión 3).
El script 24 ordena ALCALDÍAS con una regla sin pesos. Este script responde otra cosa: si solo se pueden abrir k zonas de
arranque, ¿cuáles k cubren a más personas de 60+ que hoy no tienen oferta formal cerca? Es un problema de cobertura máxima
(maximal covering location problem): no necesita variable de resultado, porque la función objetivo se declara y la
cobertura de cualquier selección se puede contar.

Registro previo: Documentos/bitacora-decisiones.md, entrada del 11 nov 2026 (10:48). Problema, parámetros, alternativas
simples y regla de decisión se fijaron ANTES de calcular ninguna cobertura. No es un preregistro limpio: ya se conocían
los resultados de los scripts 18, 24 y 25.

  Zona        : círculo de radio R con centro en el centroide de una AGEB urbana (2,371 candidatas).
  Demanda     : personas de 60+ de las AGEB cuyo centroide está a más de R km del establecimiento núcleo más cercano.
  Cobertura   : una AGEB con demanda queda cubierta si su centroide cae dentro de alguna zona elegida.
  Primario    : R = 1 km, k = 5.   Sensibilidad: R en {0.75, 1, 1.5} x k en {3, 5, 10}; demanda alternativa n_disc.
  A0 azar     : k centros al azar entre las AGEB con demanda (media de 500 sorteos, semilla fija).
  A1 simple   : las k AGEB con demanda que tienen más personas.
  A2 tabla 24 : en cada una de las primeras k alcaldías del orden de presentación del script 24, la AGEB con demanda
                que tiene más personas (si una alcaldía no tiene AGEB con demanda, se pasa a la siguiente).
  M1 voraz    : en cada paso, la zona que más personas nuevas cubre.
  M2 exacto   : programación entera (HiGHS, scipy.optimize.milp).

Regla de decisión: la optimización «aporta» si M2 cubre >= 10 % más personas que la mejor de A1 y A2 en el primario Y en
al menos 7 de las 9 combinaciones. Si M1 queda a menos de 1 % de M2 en las 9, se recomienda M1.

Qué NO hace: no mide acceso real (línea recta desde el centroide; sin transporte, precio ni cupo); el radio es un supuesto;
estar lejos de un asilo o centro de día no equivale a necesitar relevo en casa; no dice nada de personas cuidadoras.

Datos: resultados/18_tipologia_ageb.csv, 18_oferta_nucleo_puntos.csv, 18_tipologia_contornos.geojson, 24_prioridad_alcaldia.csv.
Solo agregados por AGEB; sin datos personales. Requiere numpy, pandas y scipy >= 1.9. Ejecutar desde Analysis/.
Escribe: resultados/34_cobertura_{control,metodos,zonas,veredicto,estabilidad,ageb_primario}.csv
Historial: 11 nov 2026 - versión inicial. Sin doble revisión.
"""
import json
from pathlib import Path
import numpy as np
import pandas as pd
from scipy.optimize import milp, LinearConstraint, Bounds
from scipy.sparse import csr_matrix, hstack, eye

RES = Path('resultados')
SEMILLA, SORTEOS = 20261111, 500
RADIOS, KS, R0, K0 = [0.75, 1.0, 1.5], [3, 5, 10], 1.0, 5
UMBRAL_APORTA, MIN_COMB, UMBRAL_VORAZ = 10.0, 7, 1.0

g = pd.read_csv(RES / '18_tipologia_ageb.csv', encoding='utf-8-sig', dtype={'CVEGEO': str})
pts = pd.read_csv(RES / '18_oferta_nucleo_puntos.csv', encoding='utf-8-sig')
p24 = pd.read_csv(RES / '24_prioridad_alcaldia.csv', encoding='utf-8-sig').sort_values('orden_presentacion')
assert len(g) == 2371 and g.CVEGEO.is_unique and len(pts) == 235, 'universo distinto al del notebook D'

# ---------------------------------------------------------------- Centroides (plano local en km)
fc = json.loads((RES / '18_tipologia_contornos.geojson').read_text(encoding='utf-8'))
PHI = np.radians(19.33)   # latitud media de la CDMX
KM_LAT = (111132.92 - 559.82 * np.cos(2 * PHI) + 1.175 * np.cos(4 * PHI)) / 1000
KM_LON = (111412.84 * np.cos(PHI) - 93.5 * np.cos(3 * PHI)) / 1000
def plano(lon, lat):
    return np.asarray(lon) * KM_LON, np.asarray(lat) * KM_LAT
def anillo(c):
    x, y = plano([p[0] for p in c], [p[1] for p in c]); x0, y0 = x[0], y[0]; x, y = x - x0, y - y0
    cr = x[:-1] * y[1:] - x[1:] * y[:-1]; a = cr.sum() / 2
    if abs(a) < 1e-12:
        return 0.0, x0 + x.mean(), y0 + y.mean()
    return abs(a), x0 + ((x[:-1] + x[1:]) * cr).sum() / (6 * a), y0 + ((y[:-1] + y[1:]) * cr).sum() / (6 * a)
def centroide(geom):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    A = X = Y = 0.0
    for poly in polys:
        for i, ring in enumerate(poly):
            a, cx, cy = anillo(ring); s = 1 if i == 0 else -1   # los huecos restan
            A += s * a; X += s * a * cx; Y += s * a * cy
    return X / A, Y / A
cen = {f['properties']['id']: centroide(f['geometry']) for f in fc['features'] if f['properties']['capa'] == 'ageb'}
assert set(g.CVEGEO) <= set(cen), 'faltan polígonos de AGEB'
XY = np.array([cen[c] for c in g.CVEGEO])
OX, OY = plano(pts.lon, pts.lat)
d_of = np.sqrt((XY[:, [0]] - OX[None, :]) ** 2 + (XY[:, [1]] - OY[None, :]) ** 2).min(axis=1)

# Control: reproducir dist_oferta_km del notebook D antes de escribir nada
dif_m = (d_of - g.dist_oferta_km.values) * 1000
control = pd.DataFrame([{'chequeo': 'distancia al establecimiento núcleo más cercano: este script contra notebook D', 'n_ageb': len(g),
                         'dif_mediana_abs_m': float(np.median(np.abs(dif_m))), 'dif_p99_abs_m': float(np.quantile(np.abs(dif_m), .99)),
                         'dif_max_abs_m': float(np.abs(dif_m).max()), 'tolerancia_mediana_m': 20, 'tolerancia_max_m': 100,
                         'ageb_que_cambian_de_lado_a_1km': int(((d_of > 1) != (g.dist_oferta_km.values > 1)).sum())}])
control['pasa'] = (control.dif_mediana_abs_m <= 20) & (control.dif_max_abs_m <= 100)
print(control.T.to_string())
if not bool(control.pasa.iloc[0]):
    raise SystemExit('CONTROL NO PASA: los centroides no reproducen dist_oferta_km. No se escriben resultados.')

DAA = np.sqrt(((XY[:, None, :] - XY[None, :, :]) ** 2).sum(axis=2))   # AGEB a AGEB, km
ALC = g.alcaldia.values

# ---------------------------------------------------------------- Métodos
def preparar(R, col):
    """Demanda y matriz de cobertura para un radio y una columna de demanda. Usa la distancia publicada del notebook D."""
    w = np.where(g.dist_oferta_km.values > R, g[col].values, 0.0)
    return w, DAA <= R                       # C[j, i]: la zona centrada en j cubre la AGEB i
def cubre(sel, w, C):
    return float(w[C[list(sel)].any(axis=0)].sum()) if len(sel) else 0.0
def a1(k, w, C):
    return list(np.argsort(-w, kind='stable')[:k])
def a2(k, w, C):
    sel = []
    for alc in p24.alcaldia:
        m = np.where((ALC == alc) & (w > 0))[0]
        if len(m):
            sel.append(int(m[np.argmax(w[m])]))
        if len(sel) == k:
            break
    return sel
def voraz(k, w, C):
    sel, libre = [], w.copy()
    for _ in range(k):
        gan = C @ libre; j = int(np.argmax(gan))
        if gan[j] <= 0:
            break
        sel.append(j); libre[C[j]] = 0
    return sel
def exacto(k, w, C):
    dem = np.where(w > 0)[0]; cand = np.where(C[:, dem].any(axis=1))[0]
    A = csr_matrix(C[np.ix_(cand, dem)].T.astype(float))            # filas: AGEB con demanda; columnas: candidatas
    nd, nc = len(dem), len(cand)
    cons = [LinearConstraint(hstack([-A, eye(nd)]).tocsr(), -np.inf, 0),                       # y_i <= suma de x_j que la cubren
            LinearConstraint(csr_matrix(np.r_[np.ones(nc), np.zeros(nd)][None, :]), k, k)]     # exactamente k zonas
    r = milp(c=-np.r_[np.zeros(nc), w[dem]], constraints=cons, integrality=np.r_[np.ones(nc), np.zeros(nd)],
             bounds=Bounds(0, 1), options={'mip_rel_gap': 0, 'time_limit': 600})
    assert r.status == 0, r.message
    sel = [int(cand[j]) for j in np.where(r.x[:nc] > .5)[0]]
    assert abs(cubre(sel, w, C) + r.fun) < 1e-6, 'la solución no reproduce el valor objetivo'
    return sel
rng = np.random.default_rng(SEMILLA)
def azar(k, w, C):
    dem = np.where(w > 0)[0]
    return float(np.mean([cubre(rng.choice(dem, size=min(k, len(dem)), replace=False), w, C) for _ in range(SORTEOS)]))

METODOS = [('A1 regla simple: las k AGEB con más personas', a1), ('A2 seguir la tabla del script 24', a2),
           ('M1 voraz', voraz), ('M2 óptimo exacto', exacto)]
filas, zonas, soluciones = [], [], {}
def correr(R, k, col, rol):
    w, C = preparar(R, col); tot = float(w.sum()); base = dict(rol=rol, demanda=col, R_km=R, k=k, demanda_total=tot, ageb_con_demanda=int((w > 0).sum()))
    v0 = azar(k, w, C)
    filas.append(dict(base, metodo='A0 azar (media de %d sorteos)' % SORTEOS, personas_cubiertas=v0, pct_demanda_cubierta=100 * v0 / tot, ageb_cubiertas=np.nan, zonas_usadas=k))
    for nombre, f in METODOS:
        sel = f(k, w, C); v = cubre(sel, w, C); cub = C[sel].any(axis=0) & (w > 0)
        filas.append(dict(base, metodo=nombre, personas_cubiertas=v, pct_demanda_cubierta=100 * v / tot, ageb_cubiertas=int(cub.sum()), zonas_usadas=len(sel)))
        soluciones[(rol, col, R, k, nombre)] = (sel, w, C)
        libre = w.copy()
        for o, j in enumerate(sorted(sel, key=lambda j: -w[C[j]].sum()), 1):   # orden de presentación: de la zona con más personas a la que menos
            nuevas = float(libre[C[j]].sum()); libre[C[j]] = 0
            zonas.append(dict(base, metodo=nombre, orden=o, CVEGEO_centro=g.CVEGEO[j], alcaldia=ALC[j], tipo=int(g.tipo[j]), tipo_nombre=g.tipo_nombre[j],
                              personas_en_la_zona=float(w[C[j]].sum()), personas_que_agrega=nuevas, ageb_con_demanda_en_la_zona=int((C[j] & (w > 0)).sum()),
                              dist_oferta_km_del_centro=float(g.dist_oferta_km[j])))
for R in RADIOS:
    for k in KS:
        correr(R, k, 'n_60', 'primario' if (R, k) == (R0, K0) else 'sensibilidad')
for k in range(1, 11):
    if k not in KS:
        correr(R0, k, 'n_60', 'curva (descriptiva)')
for R in RADIOS:
    for k in KS:
        correr(R, k, 'n_disc', 'demanda alternativa')

M = pd.DataFrame(filas)
clave = ['demanda', 'R_km', 'k']
piv = M.pivot_table(index=clave, columns='metodo', values='personas_cubiertas')
mejor_simple = piv[[METODOS[0][0], METODOS[1][0]]].max(axis=1)
gan = (100 * (piv[METODOS[3][0]] / mejor_simple - 1)).rename('ganancia_exacto_vs_mejor_simple_pct')
vor = (100 * (1 - piv[METODOS[2][0]] / piv[METODOS[3][0]])).rename('distancia_voraz_al_exacto_pct')
M = M.merge(gan.reset_index(), on=clave).merge(vor.reset_index(), on=clave).merge(mejor_simple.rename('personas_mejor_simple').reset_index(), on=clave)

# ---------------------------------------------------------------- Veredicto (regla fijada el 11 nov 2026, 10:48)
s = M[(M.demanda == 'n_60') & M.rol.isin(['primario', 'sensibilidad'])].drop_duplicates(clave).set_index(['R_km', 'k'])
g_prim = float(s.loc[(R0, K0), 'ganancia_exacto_vs_mejor_simple_pct']); n_ok = int((s.ganancia_exacto_vs_mejor_simple_pct >= UMBRAL_APORTA).sum())
aporta = g_prim >= UMBRAL_APORTA and n_ok >= MIN_COMB
voraz_ok = bool((s.distancia_voraz_al_exacto_pct < UMBRAL_VORAZ).all())
# Arrepentimiento: cuántas personas de 60+ cubre la solución óptima para discapacidad, frente al óptimo para 60+ (primario)
sel60, w60, C60 = soluciones[('primario', 'n_60', R0, K0, METODOS[3][0])]
seld, _, _ = soluciones[('demanda alternativa', 'n_disc', R0, K0, METODOS[3][0])]
comunes = len(set(sel60) & set(seld)); cruz = 100 * cubre(seld, w60, C60) / cubre(sel60, w60, C60)
ver = pd.DataFrame([
    dict(criterio='Primario (R = 1 km, k = 5): ganancia del óptimo exacto sobre la mejor regla simple, %', valor=g_prim, umbral='>= 10', cumple=g_prim >= UMBRAL_APORTA),
    dict(criterio='Combinaciones de sensibilidad (de 9) con ganancia >= 10 %', valor=n_ok, umbral='>= 7', cumple=n_ok >= MIN_COMB),
    dict(criterio='Ganancia mínima en las 9 combinaciones, %', valor=float(s.ganancia_exacto_vs_mejor_simple_pct.min()), umbral='descriptivo', cumple=np.nan),
    dict(criterio='Ganancia máxima en las 9 combinaciones, %', valor=float(s.ganancia_exacto_vs_mejor_simple_pct.max()), umbral='descriptivo', cumple=np.nan),
    dict(criterio='Distancia máxima del voraz al exacto en las 9 combinaciones, %', valor=float(s.distancia_voraz_al_exacto_pct.max()), umbral='< 1', cumple=voraz_ok),
    dict(criterio='Zonas en común entre el óptimo para 60+ y el óptimo para discapacidad (primario, de 5)', valor=comunes, umbral='descriptivo', cumple=np.nan),
    dict(criterio='Personas de 60+ que cubre el óptimo para discapacidad, como % del óptimo para 60+ (primario)', valor=cruz, umbral='descriptivo', cumple=np.nan),
    dict(criterio='VEREDICTO', valor=np.nan, umbral='regla del 11 nov 2026', cumple=aporta),
])
ver['lectura'] = ''
ver.loc[ver.criterio == 'VEREDICTO', 'lectura'] = ('la optimización aporta frente a la regla simple' if aporta else 'la regla simple basta para elegir zonas') + \
    ('; se recomienda el método voraz (queda a menos de 1 % del exacto en las 9)' if voraz_ok else '; el voraz no alcanza al exacto en todas: se usa el exacto')

# AGEB con demanda en el primario: quién la cubre (para mapa o tabla)
w, C = w60, C60
ag = g.loc[w > 0, ['CVEGEO', 'alcaldia', 'tipo', 'n_60', 'n_disc', 'dist_oferta_km']].copy()
for nombre, etiqueta in [(METODOS[0][0], 'cubre_A1'), (METODOS[1][0], 'cubre_A2'), (METODOS[2][0], 'cubre_M1'), (METODOS[3][0], 'cubre_M2')]:
    ag[etiqueta] = C[soluciones[('primario', 'n_60', R0, K0, nombre)][0]].any(axis=0)[w > 0]

# Estabilidad de las zonas del óptimo exacto en las 9 combinaciones (descriptivo; se agregó después de ver el resultado primario)
Z = pd.DataFrame(zonas)
z9 = Z[(Z.demanda == 'n_60') & (Z.metodo == METODOS[3][0]) & Z.rol.isin(['primario', 'sensibilidad'])]
est = z9.groupby('alcaldia').agg(combinaciones_con_zona=('k', lambda s: len(z9.loc[s.index, ['R_km', 'k']].drop_duplicates())), zonas_en_total=('k', 'size')).reset_index()
est['combinaciones_total'] = 9
est['con_zona_en_el_primario'] = est.alcaldia.isin(z9[z9.rol == 'primario'].alcaldia)
est = est.merge(p24[['alcaldia', 'nivel_modal', 'orden_presentacion']], on='alcaldia', how='right').fillna({'combinaciones_con_zona': 0, 'zonas_en_total': 0, 'combinaciones_total': 9, 'con_zona_en_el_primario': False})
est = est.astype({'combinaciones_con_zona': int, 'zonas_en_total': int, 'combinaciones_total': int, 'con_zona_en_el_primario': bool}).sort_values(['combinaciones_con_zona', 'zonas_en_total'], ascending=False)
est.to_csv(RES / '34_cobertura_estabilidad.csv', index=False, encoding='utf-8-sig')
print(est.to_string(index=False))

control.to_csv(RES / '34_cobertura_control.csv', index=False, encoding='utf-8-sig')
M.to_csv(RES / '34_cobertura_metodos.csv', index=False, encoding='utf-8-sig')
Z.to_csv(RES / '34_cobertura_zonas.csv', index=False, encoding='utf-8-sig')
ver.to_csv(RES / '34_cobertura_veredicto.csv', index=False, encoding='utf-8-sig')
ag.to_csv(RES / '34_cobertura_ageb_primario.csv', index=False, encoding='utf-8-sig')
pd.set_option('display.width', 250); pd.set_option('display.max_columns', 30); pd.set_option('display.max_colwidth', 95)
print(M[(M.demanda == 'n_60') & (M.rol != 'curva (descriptiva)')][['R_km', 'k', 'metodo', 'personas_cubiertas', 'pct_demanda_cubierta', 'ganancia_exacto_vs_mejor_simple_pct', 'distancia_voraz_al_exacto_pct']].round(1).to_string(index=False))
print(ver.round(2).to_string(index=False))
