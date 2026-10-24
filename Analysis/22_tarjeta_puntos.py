"""22 - Tarjeta de puntos para priorizar el relevo por horas (ENASIC 2022, NACIONAL).

Objetivo primario: ALGUN_DANO (DEC-OBJ-001, bitácora 20 oct 2026 11:05). Sin sensibilidad con salud física:
esa ya está en el script 21.
EXPLORATORIO: la forma de la tarjeta (10 variables binarias, L1 con C=0.15, escala a 5 puntos máx.) se fijó en el
script 21 después de ver resultados. Aquí no se cambia ningún hiperparámetro: solo se cambia el objetivo, se agrega
un umbral operativo y se mide la estabilidad de los puntos.

Qué agrega frente al script 21:
  1. Puntos de la tarjeta con ALGUN_DANO en tres variantes (completa / sin «le falta fuerza» / sin fuerza ni
     «requiere apoyo»). El 21_tarjeta_puntos.csv se ajustó con SALUD_FISICA y NO es la tarjeta vigente.
  2. Estabilidad: los puntos de cada variable en las 100 particiones de entrenamiento.
  3. Validación como se usaría: con un UMBRAL de puntos elegido en entrenamiento, no con un cupo exacto con desempate.
  4. Tabla de cortes (en muestra) para elegir el umbral, y cobertura por grupo.
Ejecutar desde Analysis/. Solo escribe agregados (resultados/22_*.csv, figuras/f26_*.png). Sin microdatos.
La preparación de variables (bloque PREPARACIÓN) es copia literal del script 21 para no tocarlo, salvo la semilla
de liblinear (ver historial).

LIMITACIÓN DE MEDICIÓN (verificada el 20 oct 2026 en el diccionario de datos): las actividades básicas y las tareas
clínicas (P6_2_*) solo se preguntan en el bloque de discapacidad. En el bloque de personas mayores el equivalente
(P6_22_*) solo se pregunta si P6_21 = 1 (cuidado por enfermedad, lesión o accidente): lo contestan 23 de las 407
cuidadoras de «solo 60+ sin discapacidad». Para las otras 384 abvd1, abvd3 y clin1 valen 0 porque NO SE PREGUNTÓ,
no porque no ayuden. Por eso ese grupo pierde cobertura por construcción. La sección 5 evalúa la tarjeta solo dentro
del bloque de discapacidad, donde las 10 variables se miden para todas.

Historial:
  20 oct 2026 17:16 - versión inicial (sin entrada en la bitácora en ese momento).
  20 oct 2026 21:45 - random_state=SEMILLA en liblinear: sin él, dos corridas diferían hasta 0.27 pp de cobertura.
                      Se agrega la sección 5 (bloque de discapacidad). Respaldo en
                      _to_delete/backup_pre_22_semilla_2026-10-20/.
"""
from pathlib import Path
import numpy as np, pandas as pd, warnings
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.metrics import roc_auc_score
warnings.filterwarnings('ignore')

BASE = Path('datos/enasic'); OUT = Path('resultados'); FIG = Path('figuras')
SEMILLA = 20261020; Z90 = 1.6449; REPS = 20; CUPOS = [0.10, 0.20, None]

# ---------------- PREPARACIÓN (copia del script 21) ----------------
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
cui['ALGUN_DANO'] = ((cualq([('P6_11_1','P6_30_1'),('P6_11_3','P6_30_3'),('P6_11_6','P6_30_6')])
                      + cualq([('P6_12_1','P6_31_1'),('P6_12_2','P6_31_2'),('P6_12_5','P6_31_5')])) > 0).astype(int)
ABVD = ['P6_2_01','P6_2_02','P6_2_03','P6_2_04','P6_2_08']; CLIN = ['P6_2_10','P6_2_11','P6_2_12','P6_2_13']
cui['N_ABVD'] = (cui[ABVD] == '1').sum(axis=1); cui['N_CLINICAS'] = (cui[CLIN] == '1').sum(axis=1)
cui['CUIDA_DISC'] = (cui.FILTRO6_1 == '1').astype(int)
cui['REQUIERE_APOYO'] = ((cui.P6_9_4 == '1') | (cui.P6_28_4 == '1')).astype(int)
cui['FALTA_FUERZA'] = ((cui.P6_9_1 == '1') | (cui.P6_28_1 == '1')).astype(int)
cui['MUJER'] = (cui.SEXO == '2').astype(int); cui['EDAD_N'] = num('EDAD')
MID = {'1':1800,'2':4850.5,'3':7100.5,'4':9000.5,'5':11000.5,'6':13300.5,'7':16050.5,'8':19750.5,'9':25500.5,'10':37100.5,'11':55000}
hog['ING'] = pd.to_numeric(hog.P3A_4.where(hog.P3A_4 != '99999'), errors='coerce').fillna(hog.P3A_5.map(MID))
nec = ((hog.HN_CDISC == '1') | (hog.HN_C60MA == '1')) & hog.ING.notna(); W_h = pd.to_numeric(hog.FAC_HOG)
def wq(v, w, q):
    o = np.argsort(v.values); c = np.cumsum(w.values[o]) / w.sum(); return v.values[o][np.searchsorted(c, q)]
cortes = [wq(hog.ING[nec], W_h[nec], q) for q in (.2,.4,.6,.8)]
hog['QUINTIL'] = np.where(hog.ING.isna(), np.nan, np.digitize(hog.ING, cortes, right=True) + 1)
cui = cui.merge(hog[['LLAVEHOG','QUINTIL']], on='LLAVEHOG', how='left', validate='many_to_one')
d = cui[DOM].reset_index(drop=True).copy()
w_raw = pd.to_numeric(d.FAC_CUI).to_numpy(float); w = w_raw / w_raw.mean()
grupos = d.UPM_DIS.to_numpy(); horas = d.HORAS.fillna(d.HORAS.median()).to_numpy()
tasa_regla = (w * (d.HORAS >= 40)).sum() / w.sum(); assert abs(tasa_regla * 100 - 40.7) < 0.1
def binarias(df):
    return pd.DataFrame({'h40': (df.HORAS >= 40).astype(float), 'h80': (df.HORAS >= 80).astype(float),
        'abvd1': (df.N_ABVD >= 1).astype(float), 'abvd3': (df.N_ABVD >= 3).astype(float),
        'clin1': (df.N_CLINICAS >= 1).astype(float), 'disc': df.CUIDA_DISC.astype(float),
        'req': df.REQUIERE_APOYO.astype(float), 'fuerza': df.FALTA_FUERZA.astype(float),
        'mujer': df.MUJER.astype(float), 'edad60': (df.EDAD_N >= 60).astype(float)}, index=df.index)
def pesos_puntos(Bn, y, ww, excl):
    cols = [c for c in Bn.columns if c not in excl]
    m = LogisticRegression(penalty='l1', solver='liblinear', C=0.15, max_iter=500, random_state=SEMILLA).fit(Bn[cols], y, sample_weight=ww)
    c = pd.Series(m.coef_[0], index=cols); esc = np.abs(c).max() / 5 if np.abs(c).max() > 0 else 1
    return (c / esc).round().astype(int)
desempate = np.random.default_rng(SEMILLA).random(len(d))
def seleccionar(s, tasa, ww=None):
    ww = w if ww is None else ww
    o = np.lexsort((desempate, -s)); ac = np.cumsum(ww[o]) / ww.sum()
    sel = np.zeros(len(s), int); sel[o[ac <= tasa + 1e-12]] = 1; return sel
# ---------------- FIN PREPARACIÓN ----------------

y = d.ALGUN_DANO.to_numpy(); Bn = binarias(d)
print(f'n={len(d)} | regla>=40h {100*tasa_regla:.1f}% | algún daño {100*(w*y).sum()/w.sum():.1f}% ({y.sum()} casos)')
ETIQ = {'h40': 'Cuida 40 h o más a la semana', 'h80': 'Cuida 80 h o más (se suma a la anterior)',
        'abvd1': 'Ayuda en 1 o más actividades básicas (comer, vestir, pañal, aseo, cama)',
        'abvd3': 'Ayuda en 3 o más actividades básicas (se suma a la anterior)',
        'clin1': 'Hace 1 o más tareas clínicas (medicinas, curaciones, terapia, tratamientos)',
        'disc': 'Cuida a una persona con discapacidad',
        'req': 'Necesita que otra persona le apoye para cuidar (P6.9.4 / P6.28.4)',
        'fuerza': 'Tiene dificultad para cuidar porque le falta fuerza física (P6.9.1 / P6.28.1)',
        'mujer': 'Es mujer', 'edad60': 'Tiene 60 años o más'}
VARIANTES = {'completa': (), 'sin_fuerza': ('fuerza',), 'sin_fuerza_ni_apoyo': ('fuerza', 'req')}
def umbral_para(s, ww, tasa):
    """Umbral entero cuya tasa de selección ponderada (s >= u) queda más cerca de la tasa objetivo."""
    us = np.unique(s); tasas = np.array([(ww * (s >= u)).sum() / ww.sum() for u in us])
    return us[np.argmin(np.abs(tasas - tasa))]

pts_rows, est_rows, val_rows, umb_rows, cor_rows, grp_rows, OOF = [], [], [], [], [], [], {}
for var, excl in VARIANTES.items():
    cols = [c for c in Bn.columns if c not in excl]
    # 1. tarjeta final (toda la muestra)
    pts = pesos_puntos(Bn, y, w, excl); s_full = (Bn[cols] * pts.values).sum(axis=1).to_numpy()
    # 2-3. validación cruzada por UPM: puntaje fuera de muestra y selección por umbral elegido en entrenamiento
    acum = np.zeros(len(d)); cnt = np.zeros(len(d)); sel_umb = np.zeros(len(d)); hist = []
    for r in range(REPS):
        cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEMILLA + r)
        for tr, te in cv.split(Bn, y, grupos):
            p = pesos_puntos(Bn.iloc[tr], y[tr], w[tr], excl); hist.append(p)
            s_tr = (Bn.iloc[tr][cols] * p.values).sum(axis=1).to_numpy(); s_te = (Bn.iloc[te][cols] * p.values).sum(axis=1).to_numpy()
            u = umbral_para(s_tr, w[tr], tasa_regla)
            acum[te] += s_te; cnt[te] += 1; sel_umb[te] += (s_te >= u)
    oof = acum / cnt; sel_umb = sel_umb / REPS; OOF[var] = oof
    H = pd.DataFrame(hist)
    for v in cols:
        pts_rows.append(dict(variante=var, variable=v, descripcion=ETIQ[v], puntos=int(pts[v])))
        moda = H[v].mode().iloc[0]
        est_rows.append(dict(variante=var, variable=v, puntos_final=int(pts[v]), moda_particiones=int(moda),
            pct_igual_final=100 * (H[v] == pts[v]).mean(), pct_distinto_de_cero=100 * (H[v] != 0).mean(),
            min_particiones=int(H[v].min()), max_particiones=int(H[v].max()), n_ajustes=len(H)))
    # validación a cupo fijo (comparable con 21_escalera_global)
    for k in CUPOS:
        tasa = tasa_regla if k is None else k
        f = seleccionar(oof, tasa); fr = seleccionar(horas, tasa)
        prec, _ = razon(d, y * f, f); cob, sc = razon(d, y * f, y); dif, sd = razon(d, y * (f - fr), y)
        val_rows.append(dict(variante=var, cupo=round(100 * tasa, 1), auc=roc_auc_score(y, oof, sample_weight=w),
            precision=100 * prec, cobertura=100 * cob, cob_li90=100 * (cob - Z90 * sc), cob_ls90=100 * (cob + Z90 * sc),
            dif_vs_regla=100 * dif, dif_li90=100 * (dif - Z90 * sd), dif_ls90=100 * (dif + Z90 * sd)))
    # validación por umbral (como se usaría en campo); la regla es la regla tal cual (>= 40 h)
    fr = (d.HORAS >= 40).astype(float).to_numpy()
    tasa_u = (w * sel_umb).sum() / w.sum(); prec, _ = razon(d, y * sel_umb, sel_umb)
    cob, sc = razon(d, y * sel_umb, y); dif, sd = razon(d, y * (sel_umb - fr), y); cobr, _ = razon(d, y * fr, y)
    precr, _ = razon(d, y * fr, fr)
    umb_rows.append(dict(variante=var, umbral_final=int(umbral_para(s_full, w, tasa_regla)), tasa_seleccion=100 * tasa_u,
        tasa_regla=100 * tasa_regla, precision=100 * prec, precision_regla=100 * precr, cobertura=100 * cob,
        cob_li90=100 * (cob - Z90 * sc), cob_ls90=100 * (cob + Z90 * sc), cobertura_regla=100 * cobr,
        dif_vs_regla=100 * dif, dif_li90=100 * (dif - Z90 * sd), dif_ls90=100 * (dif + Z90 * sd)))
    # 4a. tabla de cortes de la tarjeta final (EN MUESTRA: optimista)
    for u in np.unique(s_full)[::-1]:
        f = (s_full >= u).astype(float)
        prec, _ = razon(d, y * f, f); cob, sc = razon(d, y * f, y)
        cor_rows.append(dict(variante=var, puntos_minimos=int(u), tasa_seleccion=100 * (w * f).sum() / w.sum(),
            precision=100 * prec, cobertura=100 * cob, cob_li90=100 * (cob - Z90 * sc), cob_ls90=100 * (cob + Z90 * sc),
            n_seleccionados_muestra=int(f.sum())))
    # 4b. por grupo, cupo de la regla, puntaje fuera de muestra
    G = {'SEXO': np.where(d.MUJER == 1, 'Mujer', 'Hombre'),
         'EDAD': pd.cut(d.EDAD_N, [0, 39, 59, 120], labels=['15-39', '40-59', '60+']).astype(str).to_numpy(),
         'TIPO': np.where(d.CUIDA_DISC == 1, 'Cuida discapacidad', 'Solo 60+ sin discapacidad'),
         'ING': d.QUINTIL.map({1:'Q1-Q2',2:'Q1-Q2',3:'Q3',4:'Q4-Q5',5:'Q4-Q5'}).fillna('Sin dato').to_numpy()}
    f = seleccionar(oof, tasa_regla); fr = seleccionar(horas, tasa_regla)
    for dim, gv in G.items():
        for g in sorted(set(gv)):
            m = (gv == g).astype(int)
            cob, sc = razon(d, y * f * m, y * m); cobr, scr = razon(d, y * fr * m, y * m); dif, sd = razon(d, y * (f - fr) * m, y * m)
            grp_rows.append(dict(variante=var, dimension=dim, grupo=g, cobertura_tarjeta=100 * cob, cobertura_regla=100 * cobr,
                dif=100 * dif, dif_li90=100 * (dif - Z90 * sd), dif_ls90=100 * (dif + Z90 * sd),
                n_grupo=int(m.sum()), n_con_dano=int((y * m).sum())))

# 5. Evaluación dentro del bloque de discapacidad: ahí P6_2_* (actividades básicas y clínicas) se pregunta a todas.
#    Cupo = tasa de la regla >= 40 h DENTRO del bloque. Misma validación (UPM, 5 x 20). Fuera de muestra.
mD = (d.CUIDA_DISC == 1).to_numpy()
dD = d[mD].reset_index(drop=True); BnD = Bn[mD].reset_index(drop=True); yD = y[mD]; wD = w[mD]; gD = grupos[mD]
hD = horas[mD]; desD = desempate[mD]
def sel_sub(s, tasa, ww, des):
    o = np.lexsort((des, -s)); ac = np.cumsum(ww[o]) / ww.sum(); sel = np.zeros(len(s), int); sel[o[ac <= tasa + 1e-12]] = 1; return sel
tasaD = (wD * (dD.HORAS >= 40)).sum() / wD.sum(); blo_rows = []
for var, excl in VARIANTES.items():
    cols = [c for c in BnD.columns if c not in excl]; acum = np.zeros(len(dD)); cnt = np.zeros(len(dD))
    for r in range(REPS):
        cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEMILLA + r)
        for tr, te in cv.split(BnD, yD, gD):
            p = pesos_puntos(BnD.iloc[tr], yD[tr], wD[tr], excl)
            acum[te] += (BnD.iloc[te][cols] * p.values).sum(axis=1).to_numpy(); cnt[te] += 1
    sD = acum / cnt; f = sel_sub(sD, tasaD, wD, desD); fr = sel_sub(hD, tasaD, wD, desD)
    prec, _ = razon(dD, yD * f, f); precr, _ = razon(dD, yD * fr, fr)
    cob, sc = razon(dD, yD * f, yD); cobr, _ = razon(dD, yD * fr, yD); dif, sd = razon(dD, yD * (f - fr), yD)
    ptsD = pesos_puntos(BnD, yD, wD, excl)
    blo_rows.append(dict(variante=var, n=len(dD), n_con_dano=int(yD.sum()), prevalencia=100 * (wD * yD).sum() / wD.sum(),
        cupo=100 * tasaD, auc=roc_auc_score(yD, sD, sample_weight=wD), auc_regla=roc_auc_score(yD, hD, sample_weight=wD),
        precision=100 * prec, precision_regla=100 * precr, cobertura=100 * cob, cobertura_regla=100 * cobr,
        dif_vs_regla=100 * dif, dif_li90=100 * (dif - Z90 * sd), dif_ls90=100 * (dif + Z90 * sd),
        puntos_muestra_bloque='; '.join(f'{k}={v}' for k, v in ptsD.items())))
pd.DataFrame(blo_rows).to_csv(OUT / '22_tarjeta_bloque_discapacidad.csv', index=False, encoding='utf-8-sig')

pd.DataFrame(pts_rows).to_csv(OUT / '22_tarjeta_puntos.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(est_rows).to_csv(OUT / '22_tarjeta_estabilidad.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(val_rows).to_csv(OUT / '22_tarjeta_validacion_cupo.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(umb_rows).to_csv(OUT / '22_tarjeta_validacion_umbral.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(cor_rows).to_csv(OUT / '22_tarjeta_cortes.csv', index=False, encoding='utf-8-sig')
pd.DataFrame(grp_rows).to_csv(OUT / '22_tarjeta_por_grupo.csv', index=False, encoding='utf-8-sig')

# control: la variante completa a cupo 40.7 debe reproducir el R3 de ALGUN_DANO del script 21 (+2.39 pp)
v = pd.DataFrame(val_rows); ctrl = v[(v.variante == 'completa') & (v.cupo == 40.7)].dif_vs_regla.iloc[0]
print(f'control vs script 21 (R3 ALGUN_DANO, cupo 40.7): {ctrl:.2f} pp (script 21: 2.39; difiere por la semilla de liblinear, que el 21 no fija)')

# figura f26: puntos por variante + cobertura contra tasa de selección
import matplotlib.pyplot as plt, estilo_graficas as eg
eg.estilo(); P = pd.DataFrame(pts_rows).pivot(index='variable', columns='variante', values='puntos').reindex(list(ETIQ)).fillna(0)
fig, (a1, a2) = plt.subplots(1, 2, figsize=(12, 5.2), gridspec_kw={'width_ratios': [1.25, 1]})
yy = np.arange(len(P)); nombres = {'completa': 'Completa', 'sin_fuerza': 'Sin «falta fuerza»', 'sin_fuerza_ni_apoyo': 'Sin fuerza ni «requiere apoyo»'}
for i, (vn, c) in enumerate(zip(VARIANTES, eg.CAT)):
    b = a1.barh(yy + (i - 1) * 0.27, P[vn], height=0.26, color=c, label=nombres[vn]); eg.etiquetas(a1, b, P[vn], fmt='{:.0f}', horizontal=True, dx=0.08, size=8)
a1.set_yticks(yy); a1.set_yticklabels([ETIQ[k].split(' (')[0] for k in P.index], fontsize=8); a1.invert_yaxis()
a1.set_xlabel('Puntos'); a1.set_title('Puntos de la tarjeta (objetivo: algún daño)'); a1.legend(fontsize=8, loc='lower right')
C = pd.DataFrame(cor_rows)
for vn, c in zip(VARIANTES, eg.CAT):
    s = C[C.variante == vn]; a2.plot(s.tasa_seleccion, s.cobertura, marker='o', ms=3, color=c, label=nombres[vn])
rg = pd.DataFrame(umb_rows).iloc[0]
a2.scatter([rg.tasa_regla], [rg.cobertura_regla], color=eg.TINTA, zorder=5, label='Regla ≥ 40 h')
a2.plot([0, 100], [0, 100], color=eg.GRIS, lw=1, ls='--', label='Azar')
a2.set_xlabel('% de cuidadoras seleccionadas'); a2.set_ylabel('% de las que tienen algún daño que quedan seleccionadas')
a2.set_title('Cobertura según el corte de puntos'); a2.legend(fontsize=8)
eg.nota(fig, 'Fuente: INEGI, ENASIC 2022 (nacional, FAC_CUI). Exploratorio. Curvas en muestra (optimistas); la validación fuera de muestra está en '
             'resultados/22_tarjeta_validacion_*.csv. No permite afirmaciones para la CDMX. Sin doble revisión.')
fig.savefig(FIG / 'f26_tarjeta_puntos.png', dpi=150, bbox_inches='tight'); print('Listo: 7 CSV en resultados/22_* y figuras/f26_tarjeta_puntos.png')
