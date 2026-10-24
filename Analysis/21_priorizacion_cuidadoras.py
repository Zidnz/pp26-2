"""21 - Priorización de cuidadoras de alta intensidad: escalera de métodos con objetivo primario
'salud física deteriorada' (ENASIC 2022, NACIONAL).

DECLARACIÓN: la elección de salud física como objetivo primario se tomó el 20 oct 2026 DESPUÉS de ver los
resultados del notebook 11 (sección 14). Por eso este análisis es EXPLORATORIO, no confirmatorio.
Extiende el notebook 11 sin modificarlo: agrega regla compuesta (R2), tarjeta de puntos (R3), validación
StratifiedGroupKFold por UPM, pesos normalizados, bootstrap de UPM (Rao-Wu) sobre puntajes fuera de muestra,
calibración, resultados por grupo a cupo fijo y sensibilidades (sin FALTA_FUERZA / REQUIERE_APOYO; class_weight).
Ejecutar desde Analysis/. Solo escribe agregados en resultados/21_*.csv (sin microdatos).
"""
from pathlib import Path
import numpy as np, pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.metrics import average_precision_score, roc_auc_score
import warnings, pickle, time, sys, os; warnings.filterwarnings('ignore')
T0 = time.time(); CACHE = Path(os.environ.get('CACHE21', '/tmp/cache21')); CACHE.mkdir(exist_ok=True)   # caché FUERA del repo (puntajes por persona = nivel microdato)
LIMITE = float(os.environ.get('LIMITE_S', '1e9'))

BASE = Path('datos/enasic'); OUT = Path('resultados'); OUT.mkdir(exist_ok=True)
SEMILLA = 20261020; Z90 = 1.6449; REPS = 20; B = 500
CUPOS = [0.10, 0.20, None]   # None = cupo que selecciona la regla >=40 h

def tabla(nombre, archivo=None):
    archivo = archivo or f'conjunto_de_datos_{nombre}_enasic_2022.csv'
    df = pd.read_csv(BASE / f'conjunto_de_datos_{nombre}_enasic_2022' / 'conjunto_de_datos' / archivo, dtype=str)
    df.columns = [c.upper() for c in df.columns]; return df
cui = tabla('tpob_cui'); hog = tabla('thogar', 'conjunto_de_datos_thogar_ensasic_2022.csv')

def _var_lin(df, z):
    t = pd.DataFrame({'h': df.EST_DIS.values, 'u': df.UPM_DIS.values, 'z': z}).groupby(['h', 'u']).z.sum().reset_index()
    g = t.groupby('h').z; n_h = g.transform('size'); zbar = g.transform('mean')
    return ((n_h / (n_h - 1)).where(n_h > 1, 0) * (t.z - zbar) ** 2).sum()
def razon(df, y, x, peso='FAC_CUI'):
    w = pd.to_numeric(df[peso]).to_numpy(float); y = np.asarray(y, float); x = np.asarray(x, float)
    X = (w * x).sum(); R = (w * y).sum() / X
    return R, np.sqrt(_var_lin(df, w * (y - R * x) / X))

def num(c): return pd.to_numeric(cui[c], errors='coerce')
DOM = ((cui.FILTRO6_1 == '1') | (cui.FILTRO6_6 == '1')).to_numpy()
cui['HORAS'] = (num('P6_7').fillna(0) + num('P6_26').fillna(0)).clip(upper=168)
cui.loc[num('P6_7').isna() & num('P6_26').isna(), 'HORAS'] = np.nan
def cualq(pares): return np.column_stack([(cui[a] == '1') | (cui[b] == '1') for a, b in pares]).any(axis=1).astype(int)
cui['SALUD_FISICA'] = cualq([('P6_11_1', 'P6_30_1')])
cui['ALGUN_DANO'] = ((cualq([('P6_11_1','P6_30_1'),('P6_11_3','P6_30_3'),('P6_11_6','P6_30_6')])
                      + cualq([('P6_12_1','P6_31_1'),('P6_12_2','P6_31_2'),('P6_12_5','P6_31_5')])) > 0).astype(int)
ABVD = ['P6_2_01','P6_2_02','P6_2_03','P6_2_04','P6_2_08']; CLIN = ['P6_2_10','P6_2_11','P6_2_12','P6_2_13']
cui['N_ABVD'] = (cui[ABVD] == '1').sum(axis=1); cui['N_CLINICAS'] = (cui[CLIN] == '1').sum(axis=1)
cui['CUIDA_DISC'] = (cui.FILTRO6_1 == '1').astype(int)
cui['CUIDA_MENORES'] = (cui[['FILTRO6_2','FILTRO6_3']] == '1').any(axis=1).astype(int)
an = num('P6_6_1'); cui['ANIOS_CUIDANDO'] = an.where(an != 99); cui.loc[cui.FILTRO6_1 != '1', 'ANIOS_CUIDANDO'] = 0
cui['CAPACITACION'] = ((cui.P6_3 == '1') | (cui.P6_23 == '1')).astype(int)
cui['APOYO_FAMILIA'] = ((cui.P6_8 == '1') | (cui.P6_27 == '1')).astype(int)
cui['REQUIERE_APOYO'] = ((cui.P6_9_4 == '1') | (cui.P6_28_4 == '1')).astype(int)
cui['FALTA_FUERZA'] = ((cui.P6_9_1 == '1') | (cui.P6_28_1 == '1')).astype(int)
cui['MUJER'] = (cui.SEXO == '2').astype(int); cui['EDAD_N'] = num('EDAD')
niv = num('NIVEL'); cui['ESCOLARIDAD'] = niv.where(niv != 9)
MID = {'1':1800,'2':4850.5,'3':7100.5,'4':9000.5,'5':11000.5,'6':13300.5,'7':16050.5,'8':19750.5,'9':25500.5,'10':37100.5,'11':55000}
hog['ING'] = pd.to_numeric(hog.P3A_4.where(hog.P3A_4 != '99999'), errors='coerce').fillna(hog.P3A_5.map(MID))
nec = ((hog.HN_CDISC == '1') | (hog.HN_C60MA == '1')) & hog.ING.notna(); W_h = pd.to_numeric(hog.FAC_HOG)
def wq(v, w, q):
    o = np.argsort(v.values); c = np.cumsum(w.values[o]) / w.sum(); return v.values[o][np.searchsorted(c, q)]
cortes = [wq(hog.ING[nec], W_h[nec], q) for q in (.2,.4,.6,.8)]
hog['QUINTIL'] = np.where(hog.ING.isna(), np.nan, np.digitize(hog.ING, cortes, right=True) + 1)
cui = cui.merge(hog[['LLAVEHOG','QUINTIL']], on='LLAVEHOG', how='left', validate='many_to_one')

PRED = ['HORAS','N_ABVD','N_CLINICAS','CUIDA_DISC','CUIDA_MENORES','ANIOS_CUIDANDO','CAPACITACION','APOYO_FAMILIA',
        'REQUIERE_APOYO','FALTA_FUERZA','MUJER','EDAD_N','ESCOLARIDAD','QUINTIL']
d = cui[DOM].reset_index(drop=True).copy()
w_raw = pd.to_numeric(d.FAC_CUI).to_numpy(float); w = w_raw / w_raw.mean()     # pesos normalizados a media 1
grupos = d.UPM_DIS.to_numpy(); horas = d.HORAS.fillna(d.HORAS.median()).to_numpy()
tasa_regla = (w * (d.HORAS >= 40)).sum() / w.sum()
assert abs(tasa_regla * 100 - 40.7) < 0.1
print(f'n={len(d)} | tasa regla>=40h={100*tasa_regla:.1f}% | cortes quintil={cortes}')

def prep(Xtr, Xte, cols):
    med = Xtr.median(); a = Xtr.fillna(med); b = Xte.fillna(med)
    if 'QUINTIL' in cols: a['Q_NA'] = Xtr.QUINTIL.isna().astype(int); b['Q_NA'] = Xte.QUINTIL.isna().astype(int)
    return a, b

def oof(modelo, y, cols, cw=None):
    X = d[cols].astype(float); acum = np.zeros(len(d)); cnt = np.zeros(len(d))
    for r in range(REPS):
        cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEMILLA + r)
        for tr, te in cv.split(X, y, grupos):
            a, b = prep(X.iloc[tr], X.iloc[te], cols)
            if modelo == 'logit':
                m = make_pipeline(StandardScaler(), LogisticRegression(C=1.0, max_iter=2000, class_weight=cw))
                m.fit(a, y[tr], logisticregression__sample_weight=w[tr])
            elif modelo == 'hgb':
                m = HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05, max_iter=200, min_samples_leaf=30,
                                                   l2_regularization=1.0, random_state=SEMILLA + r, class_weight=cw)
                m.fit(X.iloc[tr], y[tr], sample_weight=w[tr]); b = X.iloc[te]
            acum[te] += m.predict_proba(b)[:, 1]; cnt[te] += 1
    return acum / cnt

# R3: tarjeta de puntos. Variables binarias de registro; L1 dentro de cada partición; puntos enteros.
def binarias(df):
    return pd.DataFrame({'h40': (df.HORAS >= 40).astype(float), 'h80': (df.HORAS >= 80).astype(float),
        'abvd1': (df.N_ABVD >= 1).astype(float), 'abvd3': (df.N_ABVD >= 3).astype(float),
        'clin1': (df.N_CLINICAS >= 1).astype(float), 'disc': df.CUIDA_DISC.astype(float),
        'req': df.REQUIERE_APOYO.astype(float), 'fuerza': df.FALTA_FUERZA.astype(float),
        'mujer': df.MUJER.astype(float), 'edad60': (df.EDAD_N >= 60).astype(float)}, index=df.index)
def pesos_puntos(Bn, y, ww, excl):
    cols = [c for c in Bn.columns if c not in excl]
    m = LogisticRegression(penalty='l1', solver='liblinear', C=0.15, max_iter=500).fit(Bn[cols], y, sample_weight=ww)
    c = pd.Series(m.coef_[0], index=cols); esc = np.abs(c).max() / 5 if np.abs(c).max() > 0 else 1
    return (c / esc).round().astype(int)
def oof_tarjeta(y, excl=()):
    Bn = binarias(d); acum = np.zeros(len(d)); cnt = np.zeros(len(d))
    for r in range(REPS):
        cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEMILLA + r)
        for tr, te in cv.split(Bn, y, grupos):
            pts = pesos_puntos(Bn.iloc[tr], y[tr], w[tr], excl)
            acum[te] += (Bn.iloc[te][pts.index] * pts.values).sum(axis=1).to_numpy(); cnt[te] += 1
    return acum / cnt
# R2: regla compuesta decidida a priori (no estimada): 1 punto si >=40 h, 1 si ayuda en >=2 actividades básicas
r2 = ((d.HORAS >= 40).astype(int) + (d.N_ABVD >= 2).astype(int)).to_numpy(float)

rng_emp = np.random.default_rng(SEMILLA)
desempate = rng_emp.random(len(d))
def seleccionar(s, tasa, ww=None):
    ww = w if ww is None else ww
    o = np.lexsort((desempate, -s)); ac = np.cumsum(ww[o]) / ww.sum()
    sel = np.zeros(len(s), int); sel[o[ac <= tasa + 1e-12]] = 1; return sel

def metricas(y, s, nombre, objetivo, variante):
    filas = []; prev = (w * y).sum() / w.sum()
    for k in CUPOS:
        tasa = tasa_regla if k is None else k
        f = seleccionar(s, tasa); fr = seleccionar(horas, tasa)
        prec, sp = razon(d, y * f, f); cob, sc = razon(d, y * f, y); dif, sd = razon(d, y * (f - fr), y)
        filas.append(dict(objetivo=objetivo, variante=variante, puntaje=nombre, cupo=round(100 * tasa, 1),
            precision=100 * prec, lift=prec / prev, cobertura=100 * cob, cob_li90=100 * (cob - Z90 * sc), cob_ls90=100 * (cob + Z90 * sc),
            dif_vs_horas=100 * dif, dif_li90=100 * (dif - Z90 * sd), dif_ls90=100 * (dif + Z90 * sd), n_sel_muestra=int(f.sum())))
    return filas

def bootstrap_dif(y, puntajes, cupo, referencia=None):
    """Rao-Wu sobre UPM dentro de estrato (n_h-1 con reposición); los puntajes ya son fuera de muestra, no se reentrena."""
    referencia = horas if referencia is None else referencia
    rng = np.random.default_rng(SEMILLA + 7)
    est = d.EST_DIS.to_numpy(); upm = d.UPM_DIS.to_numpy()
    claves = pd.DataFrame({'e': est, 'u': upm}); idx_upm = claves.groupby(['e', 'u']).indices
    estratos = {}
    for (e, u), ix in idx_upm.items(): estratos.setdefault(e, []).append(ix)
    sel_r = {}
    res = {n: [] for n in puntajes}
    for b in range(B):
        mult = np.zeros(len(d))
        for e, lst in estratos.items():
            n = len(lst)
            if n < 2:
                for ix in lst: mult[ix] += 1
                continue
            ch = rng.integers(0, n, n - 1)
            for j in ch: mult[lst[j]] += n / (n - 1)
        wb = w * mult
        if (wb * y).sum() == 0: continue
        fr = seleccionar(referencia, cupo, wb); cr = (wb * y * fr).sum() / (wb * y).sum()
        for n, s in puntajes.items():
            f = seleccionar(s, cupo, wb); res[n].append((wb * y * f).sum() / (wb * y).sum() - cr)
    return {n: (100 * np.percentile(v, 5), 100 * np.percentile(v, 95), 100 * np.std(v)) for n, v in res.items()}

resultados, boot, calib, grupo_rows, auc_rows = [], [], [], [], []
y = d.SALUD_FISICA.to_numpy(); y_alg = d.ALGUN_DANO.to_numpy()
print(f'Prevalencia ponderada salud física: {100*(w*y).sum()/w.sum():.1f}% (n casos {y.sum()}) | algún daño: {100*(w*y_alg).sum()/w.sum():.1f}%')

VARIANTES = {'completa': PRED,
             'sin_FALTA_FUERZA': [c for c in PRED if c != 'FALTA_FUERZA'],
             'sin_FALTA_FUERZA_ni_REQUIERE_APOYO': [c for c in PRED if c not in ('FALTA_FUERZA', 'REQUIERE_APOYO')]}
EXCL = {'completa': (), 'sin_FALTA_FUERZA': ('fuerza',), 'sin_FALTA_FUERZA_ni_REQUIERE_APOYO': ('fuerza', 'req')}
PUNT = {}
for obj, yy in [('SALUD_FISICA', y), ('ALGUN_DANO', y_alg)]:
    for var, cols in VARIANTES.items():
        if obj == 'ALGUN_DANO' and var != 'completa': continue
        arch = CACHE / f'{obj}_{var}.pkl'
        if arch.exists():
            P, bt = pickle.load(open(arch, 'rb'))
        else:
            if time.time() - T0 > LIMITE: print('PENDIENTE: volver a ejecutar'); sys.exit(3)
            print('...', obj, var, flush=True)
            P = {'R0 azar (cupo)': np.random.default_rng(1).random(len(d)), 'R1 horas (regla >=40 h al cupo de la regla)': horas.astype(float),
                 'R2 regla compuesta (>=40 h + >=2 ABVD)': r2, 'R3 tarjeta de puntos': oof_tarjeta(yy, EXCL[var]),
                 'R4 logística': oof('logit', yy, cols), 'R5 gradient boosting': oof('hgb', yy, cols)}
            if var == 'completa':
                P['R4b logística class_weight=balanced (sensibilidad)'] = oof('logit', yy, cols, cw='balanced')
            bt = []
            for k in CUPOS:
                tasa = tasa_regla if k is None else k
                bs = bootstrap_dif(yy, {n: s_ for n, s_ in P.items() if n.startswith(('R2', 'R3', 'R4 ', 'R5'))}, tasa)
                for n, (lo, hi, sd) in bs.items():
                    bt.append(dict(objetivo=obj, variante=var, puntaje=n, cupo=round(100 * tasa, 1), boot_li90=lo, boot_ls90=hi, boot_ee=sd))
            pickle.dump((P, bt), open(arch, 'wb'))
        PUNT[(obj, var)] = P; boot += bt
        for n, s_ in P.items():
            resultados += metricas(yy, s_, n, obj, var)
            auc_rows.append(dict(objetivo=obj, variante=var, puntaje=n, auc=roc_auc_score(yy, s_, sample_weight=w),
                                 pr_auc=average_precision_score(yy, s_, sample_weight=w), prevalencia=100 * (w * yy).sum() / w.sum()))

# calibración de la logística completa (salud física), deciles ponderados de probabilidad predicha
p = PUNT[('SALUD_FISICA', 'completa')]['R4 logística']
o = np.argsort(p); ac = np.cumsum(w[o]) / w.sum(); dec = np.minimum((ac * 10).astype(int), 9); dd = np.empty(len(p), int); dd[o] = dec
for q in range(10):
    m = dd == q
    calib.append(dict(decil=q + 1, n=int(m.sum()), pred_media=100 * np.average(p[m], weights=w[m]), obs=100 * np.average(y[m], weights=w[m])))

# resultados por grupo a cupo fijo = tasa de la regla (40.7%): cobertura y precisión por grupo, R1 vs R3/R4/R5
d['G_SEXO'] = np.where(d.MUJER == 1, 'Mujer', 'Hombre')
d['G_EDAD'] = pd.cut(d.EDAD_N, [0, 39, 59, 120], labels=['15-39', '40-59', '60+']).astype(str)
d['G_TIPO'] = np.where(d.CUIDA_DISC == 1, 'Cuida discapacidad', 'Solo 60+ sin discapacidad')
d['G_ING'] = d.QUINTIL.map({1:'Q1-Q2',2:'Q1-Q2',3:'Q3',4:'Q4-Q5',5:'Q4-Q5'}).fillna('Sin dato')
d['G_HORAS'] = pd.cut(d.HORAS.fillna(-1), [-2, -0.5, 19, 39, 79, 200], labels=['sin dato', '<20', '20-39', '40-79', '80+']).astype(str)
for var in ['completa', 'sin_FALTA_FUERZA']:
    P = PUNT[('SALUD_FISICA', var)]
    for gcol in ['G_SEXO', 'G_EDAD', 'G_TIPO', 'G_ING', 'G_HORAS']:
        for g in sorted(d[gcol].unique()):
            m = (d[gcol] == g).to_numpy().astype(int)
            for n in ['R1 horas (regla >=40 h al cupo de la regla)', 'R2 regla compuesta (>=40 h + >=2 ABVD)', 'R3 tarjeta de puntos', 'R4 logística', 'R5 gradient boosting']:
                f = seleccionar(P[n], tasa_regla)
                if (y * m).sum() == 0: continue
                cob, sc = razon(d, y * f * m, y * m)
                prec = razon(d, y * f * m, f * m)[0] if (f * m).sum() else np.nan
                grupo_rows.append(dict(variante=var, dimension=gcol[2:], grupo=g, puntaje=n, cobertura=100 * cob,
                    cob_li90=100 * (cob - Z90 * sc), cob_ls90=100 * (cob + Z90 * sc), precision=100 * prec if prec == prec else np.nan,
                    tasa_seleccion_grupo=100 * np.average(f[m == 1], weights=w[m == 1]), n_grupo=int(m.sum()), n_con_dano=int((y * m).sum())))

# puntos de la tarjeta ajustada con toda la muestra (para documentar; NO es un modelo validado por sí mismo)
Bn = binarias(d); pts_full = pesos_puntos(Bn, y, w, ())
pd.DataFrame({'variable': pts_full.index, 'puntos': pts_full.values}).to_csv(OUT / '21_tarjeta_puntos.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(resultados).to_csv(OUT / '21_escalera_global.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(boot).to_csv(OUT / '21_escalera_bootstrap_upm.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(auc_rows).to_csv(OUT / '21_escalera_auc.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(calib).to_csv(OUT / '21_calibracion_logit.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(grupo_rows).to_csv(OUT / '21_escalera_por_grupo.csv', index=False, encoding='utf-8-sig')
print('Listo: 6 archivos en resultados/21_*.csv')
