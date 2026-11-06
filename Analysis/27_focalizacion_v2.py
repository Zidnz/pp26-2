"""27 — Modelo de focalización v2, ejecutado según el preregistro (ENASIC 2022, nacional).

Preregistro: ../Documentos/preregistro_focalizacion_2026-11-01.md (versión base + enmienda 1, 1 nov 2026, 10:45).
Este script NO elige nada: aplica los parámetros fijados y emite el veredicto con la regla de decisión escrita.

Fijado:  objetivo DANO_SALUD3 (salud física, cansancio o sueño); sensibilidad DANO_ALGUNO.
         cupo 40.7 % (tasa de la regla), con la cuota de la regla entre bloques; sensibilidad 10 % y 20 %.
         Δ = 5 pp, δ = 10 pp.  Candidatos: logística y tarjeta de puntos.  Comparador: regla >= 40 h.
         Veredicto primario: cobertura total con la cuota fija.

Salidas (resultados/):
  27_v2_global.csv     cobertura, precisión y diferencia contra la regla (IC 90), DMD y veredicto, por configuración
  27_v2_por_bloque.csv lo mismo dentro de cada bloque (secundario)
  27_v2_equidad.csv    cobertura por grupo y caída frente a la regla (criterio δ)
  27_v2_tarjeta.csv    puntos de la tarjeta ajustada con toda la muestra (para leerla, no para evaluarla)

Requiere solo numpy y pandas. Alcance: nacional; nada sobre la CDMX. Solo agregados.
Autor: Claude a pedido de Omar, 1 nov 2026. Sin revisión de otra persona.
"""
from pathlib import Path
import numpy as np, pandas as pd

AQUI = Path(__file__).resolve().parent
BASE = AQUI / 'datos' / 'enasic'; OUT = AQUI / 'resultados'
Z90, Z80 = 1.6449, 0.8416
DELTA, DELTA_EQ, SEMILLA, REPS, K = 5.0, 10.0, 20261101, 20, 5

def tabla(nombre, archivo=None):
    archivo = archivo or f'conjunto_de_datos_{nombre}_enasic_2022.csv'
    df = pd.read_csv(BASE / f'conjunto_de_datos_{nombre}_enasic_2022' / 'conjunto_de_datos' / archivo, dtype=str)
    df.columns = [c.upper() for c in df.columns]; return df
cui = tabla('tpob_cui'); hog = tabla('thogar', 'conjunto_de_datos_thogar_ensasic_2022.csv')
num = lambda c: pd.to_numeric(cui[c], errors='coerce')
def cualq(p): return np.column_stack([(cui[a] == '1') | (cui[b] == '1') for a, b in p]).any(axis=1).astype(int)

# ---------- objetivo, universo y predictores (preregistro)
DOM = (cui.FILTRO6_1 == '1') | (cui.FILTRO6_6 == '1')
cui['HORAS'] = num('P6_7').fillna(0) + num('P6_26').fillna(0)
SAL = [('P6_11_1', 'P6_30_1'), ('P6_11_3', 'P6_30_3'), ('P6_11_6', 'P6_30_6')]
TRA = [('P6_12_1', 'P6_31_1'), ('P6_12_2', 'P6_31_2'), ('P6_12_5', 'P6_31_5')]
cui['DANO_SALUD3'] = cualq(SAL); cui['DANO_ALGUNO'] = cualq(SAL + TRA)
cui['CUIDA_DISC'] = (cui.FILTRO6_1 == '1').astype(int)
cui['AMBOS_BLOQUES'] = (num('P6_7').notna() & num('P6_26').notna()).astype(int)
h = cui.HORAS
cui['H_20_39'] = h.between(20, 39.999).astype(int); cui['H_40_59'] = h.between(40, 59.999).astype(int); cui['H_60MAS'] = (h >= 60).astype(int)
cui['MUJER'] = (cui.SEXO == '2').astype(int)
e = num('EDAD'); cui['EDAD_15_39'] = (e < 40).astype(int); cui['EDAD_60MAS'] = (e >= 60).astype(int)
cui['CUIDA_MENORES'] = (cui[['FILTRO6_2', 'FILTRO6_3']] == '1').any(axis=1).astype(int)
cui['CAPACITACION'] = ((cui.P6_3 == '1') | (cui.P6_23 == '1')).astype(int)
# Autopercepción: código 8 («No aplica») como categoría propia (solo existe en P6_28_x)
for nom, a, b in [('FALTA_FUERZA', 'P6_9_1', 'P6_28_1'), ('REQ_APOYO', 'P6_9_4', 'P6_28_4')]:
    cui[nom] = ((cui[a] == '1') | (cui[b] == '1')).astype(int)
    cui[nom + '_NA'] = ((cui[b] == '8') & (cui[a] != '1')).astype(int)
cui['N_ABVD'] = (cui[['P6_2_01', 'P6_2_02', 'P6_2_03', 'P6_2_04', 'P6_2_08']] == '1').sum(axis=1)
cui['ABVD_3MAS'] = (cui.N_ABVD >= 3).astype(int)
cui['CLIN_1MAS'] = ((cui[['P6_2_10', 'P6_2_11', 'P6_2_12', 'P6_2_13']] == '1').sum(axis=1) >= 1).astype(int)
# Quintil: misma construcción que la sección 11
MID = {'1': 1800, '2': 4850.5, '3': 7100.5, '4': 9000.5, '5': 11000.5, '6': 13300.5, '7': 16050.5, '8': 19750.5, '9': 25500.5, '10': 37100.5, '11': 55000}
hog['ING'] = pd.to_numeric(hog.P3A_4.where(hog.P3A_4 != '99999'), errors='coerce').fillna(hog.P3A_5.map(MID))
nec = ((hog.HN_CDISC == '1') | (hog.HN_C60MA == '1')) & hog.ING.notna(); W_h = pd.to_numeric(hog.FAC_HOG)
def wq(v, w, q): o = np.argsort(v.values); c = np.cumsum(w.values[o]) / w.sum(); return v.values[o][np.searchsorted(c, q)]
cortes = [wq(hog.ING[nec], W_h[nec], q) for q in (.2, .4, .6, .8)]
hog['QUINTIL'] = np.where(hog.ING.isna(), np.nan, np.digitize(hog.ING, cortes, right=True) + 1)
cui = cui.merge(hog[['LLAVEHOG', 'QUINTIL']], on='LLAVEHOG', how='left', validate='many_to_one')
for q in (1, 2, 4, 5): cui[f'Q{q}'] = (cui.QUINTIL == q).astype(int)
cui['Q_NA'] = cui.QUINTIL.isna().astype(int)

PRIM = ['H_20_39', 'H_40_59', 'H_60MAS', 'MUJER', 'EDAD_15_39', 'EDAD_60MAS', 'CUIDA_MENORES', 'CAPACITACION', 'Q1', 'Q2', 'Q4', 'Q5', 'Q_NA']
SENS_A = PRIM + ['FALTA_FUERZA', 'FALTA_FUERZA_NA', 'REQ_APOYO', 'REQ_APOYO_NA']
SENS_B = PRIM + ['ABVD_3MAS', 'CLIN_1MAS']
DALL = cui[DOM].reset_index(drop=True).copy()
DALL['G_SEXO'] = np.where(DALL.MUJER == 1, 'Mujer', 'Hombre')
DALL['G_EDAD'] = np.select([DALL.EDAD_15_39 == 1, DALL.EDAD_60MAS == 1], ['15-39', '60+'], '40-59')
DALL['G_ING'] = DALL.QUINTIL.map({1: 'Q1-Q2', 2: 'Q1-Q2', 3: 'Q3', 4: 'Q4-Q5', 5: 'Q4-Q5'}).fillna('Sin dato')
DALL['G_BLOQUE'] = np.where(DALL.CUIDA_DISC == 1, 'Discapacidad', 'Solo 60+')

# ---------- utilidades de diseño
class Diseno:
    def __init__(self, d):
        self.d = d; self.w = pd.to_numeric(d.FAC_CUI).to_numpy(float)
    def _vl(self, z):
        t = pd.DataFrame({'h': self.d.EST_DIS.values, 'u': self.d.UPM_DIS.values, 'z': z}).groupby(['h', 'u']).z.sum().reset_index()
        g = t.groupby('h').z; n = g.transform('size'); zb = g.transform('mean')
        return ((n / (n - 1)).where(n > 1, 0) * (t.z - zb) ** 2).sum()
    def razon(self, y, x):
        w = self.w; y = np.asarray(y, float); x = np.asarray(x, float); X = (w * x).sum(); R = (w * y).sum() / X
        return R, np.sqrt(self._vl(w * (y - R * x) / X))

def ajustar(X, y, w, lam=1.0):
    X1 = np.column_stack([np.ones(len(X)), X]); b = np.zeros(X1.shape[1]); P = lam * np.diag(np.r_[0, np.ones(X.shape[1])])
    for _ in range(200):
        p = 1 / (1 + np.exp(-X1 @ b)); st = np.linalg.solve(X1.T @ (X1 * (w * p * (1 - p))[:, None]) + P, X1.T @ (w * (y - p)) - P @ b)
        b += st
        if np.abs(st).max() < 1e-9: break
    return b

def oof(d, cols, y, w):
    """Puntajes fuera de muestra (logística y tarjeta), 5 particiones x 20 repeticiones por UPM."""
    X = d[cols].to_numpy(float); ups = d.UPM_DIS.unique(); s_log = np.zeros(len(d)); s_tar = np.zeros(len(d))
    for r in range(REPS):
        rng = np.random.default_rng(SEMILLA + r); fold = d.UPM_DIS.map(dict(zip(ups, rng.integers(0, K, len(ups))))).to_numpy()
        for j in range(K):
            te = fold == j; tr = ~te
            b = ajustar(X[tr], y[tr], w[tr] / w[tr].mean())
            s_log[te] += 1 / (1 + np.exp(-(b[0] + X[te] @ b[1:])))
            pts = np.round(5 * b[1:] / np.abs(b[1:]).max()); s_tar[te] += X[te] @ pts
    return s_log / REPS, s_tar / REPS

def seleccionar(s, w, m, tasa, semilla):
    """Dentro de la máscara m, selecciona la proporción ponderada `tasa` con el puntaje más alto."""
    idx = np.where(m)[0]; rng = np.random.default_rng(semilla)
    o = idx[np.lexsort((rng.random(len(idx)), -s[idx]))]; acu = np.cumsum(w[o]) / w[idx].sum()
    sel = np.zeros(len(s), int); sel[o[acu <= tasa + 1e-12]] = 1; return sel

def veredicto(dif, li, ls, eq_ok):
    if li > 0 and dif >= DELTA and eq_ok: return 'adoptar'
    if li > 0 and dif >= DELTA: return 'superior pero falla equidad: se queda la regla'
    if li > 0: return 'superior pero no relevante (< Δ): se queda la regla'
    if ls < 0: return 'inferior a la regla'
    return 'no concluyente: se queda la regla'

# ---------- corridas
def correr(etiqueta, d, objetivo, cols, cupo_pct, bloques=('Discapacidad', 'Solo 60+'), extras=None):
    D = Diseno(d); w = D.w; y = d[objetivo].to_numpy(); hh = d.HORAS.to_numpy(float)
    blk = d.G_BLOQUE.to_numpy()
    # Cuota fija = la de la regla >= 40 h a 40.7 %; para otros cupos se escala manteniendo la proporción entre bloques
    tasa_regla = {b: (w * (hh >= 40) * (blk == b)).sum() / (w * (blk == b)).sum() for b in bloques}
    cupo_regla = sum((w * (hh >= 40) * (blk == b)).sum() for b in bloques) / w[np.isin(blk, bloques)].sum()
    f = cupo_pct / 100 / cupo_regla if cupo_pct is not None else 1.0
    tasas = {b: tasa_regla[b] * f for b in bloques}
    s_log, s_tar = oof(d, cols, y, w)
    punt = {'Logística': s_log, 'Tarjeta de puntos': s_tar}
    if extras: punt.update(extras)
    sel0 = np.zeros(len(d), int)
    for i, b in enumerate(bloques):
        m = blk == b
        sel0 += (m & (hh >= 40)).astype(int) if cupo_pct is None else seleccionar(hh, w, m, tasas[b], SEMILLA + 7 + i)
    sels = {}
    for k, s in punt.items():
        sel = np.zeros(len(d), int)
        for i, b in enumerate(bloques): sel += seleccionar(s, w, blk == b, tasas[b], SEMILLA + 11 + i)
        sels[k] = sel
    filas_g, filas_b, filas_e = [], [], []
    nom_cupo = '40.7 % (regla)' if cupo_pct is None else f'{cupo_pct:.0f} %'
    comp = 'Regla >= 40 h' if cupo_pct is None else 'Horas (continuo)'
    for k, sel in [(comp, sel0)] + list(sels.items()):
        eq_ok, peor = True, 0.0
        for gcol in ['G_SEXO', 'G_EDAD', 'G_ING', 'G_BLOQUE']:
            for g in sorted(d[gcol].unique()):
                m = (d[gcol] == g).to_numpy().astype(int)
                if (y * m).sum() == 0: continue
                c = D.razon(y * sel * m, y * m)[0]; c0 = D.razon(y * sel0 * m, y * m)[0]
                filas_e.append(dict(configuracion=etiqueta, cupo=nom_cupo, puntaje=k, dimension=gcol[2:], grupo=g, cobertura=100 * c,
                                    cobertura_comparador=100 * c0, cambio_pp=100 * (c - c0), n_grupo=int(m.sum()), n_con_objetivo=int((y * m).sum())))
                if k != comp and gcol != 'G_BLOQUE' or (k != comp and len(bloques) > 1):
                    peor = min(peor, 100 * (c - c0))
                    if 100 * (c - c0) < -DELTA_EQ: eq_ok = False
        cob, se_c = D.razon(y * sel, y); prec = D.razon(y * sel, sel)[0]; dif, se_d = D.razon(y * (sel - sel0), y)
        dif, li, ls = 100 * dif, 100 * (dif - Z90 * se_d), 100 * (dif + Z90 * se_d)
        filas_g.append(dict(configuracion=etiqueta, objetivo=objetivo, cupo=nom_cupo, puntaje=k, n_muestra=len(d), n_con_objetivo=int(y.sum()),
                            prevalencia=100 * D.razon(y, np.ones(len(d)))[0], cobertura=100 * cob, cob_li90=100 * (cob - Z90 * se_c), cob_ls90=100 * (cob + Z90 * se_c),
                            precision=100 * prec, dif_vs_comparador_pp=dif, dif_li90=li, dif_ls90=ls,
                            dif_minima_detectable_pp=np.nan if k == comp else 100 * (Z90 + Z80) * se_d,
                            peor_caida_grupo_pp=np.nan if k == comp else peor,
                            veredicto='comparador' if k == comp else veredicto(dif, li, ls, eq_ok)))
        for b in bloques:
            m = (blk == b).astype(int); yb = y * m
            cb, _ = D.razon(yb * sel, yb); db, sdb = D.razon(yb * (sel - sel0), yb)
            filas_b.append(dict(configuracion=etiqueta, objetivo=objetivo, cupo=nom_cupo, bloque=b, puntaje=k, tasa_seleccion_bloque=100 * tasas[b],
                                cobertura=100 * cb, dif_vs_comparador_pp=100 * db, dif_li90=100 * (db - Z90 * sdb), dif_ls90=100 * (db + Z90 * sdb),
                                dif_minima_detectable_pp=np.nan if k == comp else 100 * (Z90 + Z80) * sdb,
                                veredicto_secundario='comparador' if k == comp else veredicto(100 * db, 100 * (db - Z90 * sdb), 100 * (db + Z90 * sdb), True).replace('adoptar', 'supera Δ en el bloque (secundario: sin equidad evaluada, no permite adoptar)')))
    return filas_g, filas_b, filas_e

G, B, E = [], [], []
def acumula(r): G.extend(r[0]); B.extend(r[1]); E.extend(r[2])
dd = DALL
# 1) PRIMARIO
acumula(correr('PRIMARIO: DANO_SALUD3, predictores primarios', dd, 'DANO_SALUD3', PRIM, None))
# 2) sensibilidad de cupo
for c in (10, 20): acumula(correr('Sens. cupo', dd, 'DANO_SALUD3', PRIM, c))
# 3) sensibilidad A: + autopercepción
acumula(correr('Sens. A: + autopercepción', dd, 'DANO_SALUD3', SENS_A, None))
# 4) objetivo de la versión 1
acumula(correr('Sens. objetivo: DANO_ALGUNO', dd, 'DANO_ALGUNO', PRIM, None))
# 5) excluye a quienes cuidan en ambos bloques
acumula(correr('Sens. sin personas en ambos bloques', dd[dd.AMBOS_BLOQUES == 0].reset_index(drop=True), 'DANO_SALUD3', PRIM, None))
# 6) sensibilidad B: solo bloque de discapacidad, + ABVD y clínicas, + R2 a priori del script 21
db_ = dd[dd.CUIDA_DISC == 1].reset_index(drop=True)
r2 = ((db_.HORAS >= 40).astype(int) + (db_.N_ABVD >= 2).astype(int)).to_numpy(float)
acumula(correr('Sens. B: bloque discapacidad, + ABVD y clínicas', db_, 'DANO_SALUD3', SENS_B, None, bloques=('Discapacidad',),
               extras={'R2 a priori (>=40 h + >=2 ABVD)': r2}))

g = pd.DataFrame(G); b = pd.DataFrame(B); eq = pd.DataFrame(E)
# Tarjeta con toda la muestra (lectura)
D = Diseno(dd); w = D.w; bb = ajustar(dd[PRIM].to_numpy(float), dd.DANO_SALUD3.to_numpy(), w / w.mean())
tar = pd.DataFrame({'variable': PRIM, 'coeficiente': bb[1:], 'puntos': np.round(5 * bb[1:] / np.abs(bb[1:]).max()).astype(int)})
for nombre, df_ in [('27_v2_global', g), ('27_v2_por_bloque', b), ('27_v2_equidad', eq), ('27_v2_tarjeta', tar)]:
    df_.to_csv(OUT / f'{nombre}.csv', index=False, encoding='utf-8-sig')
pd.set_option('display.width', 260); pd.set_option('display.max_columns', 30); pd.set_option('display.max_colwidth', 50)
print(g.drop(columns=['objetivo']).round(1).to_string(), '\n')
print(b.drop(columns=['objetivo']).round(1).to_string(), '\n')
print(tar.round(3).to_string())
print('\nPeores caídas por grupo (primario):')
print(eq[(eq.configuracion.str.startswith('PRIMARIO')) & (eq.puntaje != 'Regla >= 40 h')].sort_values('cambio_pp').head(8).round(1).to_string())
