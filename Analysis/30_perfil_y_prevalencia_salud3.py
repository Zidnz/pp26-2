"""30 — Perfil del grupo del problema y prevalencia de daño entre cuidadoras con DANO_SALUD3 (ENASIC 2022, nacional).

Motivo: DEC-OBJ-002 (1 nov 2026) fija DANO_SALUD3 como objetivo primario. Quedaban en «algún daño» (versión 1): (a) el perfil del
grupo del problema (16_perfil_grupo_problema.csv) y (b) la prevalencia de daño entre cuidadoras (lámina 5 del avance).
Mismo estimador y mismas definiciones del notebook B (celdas 74-76): razón ponderada, linealización de Taylor, IC 90 %.
Control: con «algún daño» reproduce 16_perfil_grupo_problema.csv y la prevalencia 62.2 % (IC 90 %; la lámina 5 del avance decía 95 % y 65.6). Si no coincide, no escribe.
Salidas (resultados/): 30_perfil_grupo_salud3.csv, 30_prevalencia_dano_cuidadoras.csv. Nacional; nada por alcaldía. Solo agregados.
Autor: Claude a pedido de Omar, 2 nov 2026. Sin revisión de otra persona.
"""
from pathlib import Path
import numpy as np, pandas as pd

AQUI = Path(__file__).resolve().parent
BASE = AQUI / 'datos' / 'enasic'; OUT = AQUI / 'resultados'
Z90 = 1.6449
TAB = BASE / 'conjunto_de_datos_tpob_cui_enasic_2022' / 'conjunto_de_datos' / 'conjunto_de_datos_tpob_cui_enasic_2022.csv'
cui = pd.read_csv(TAB, dtype=str); cui.columns = [c.upper() for c in cui.columns]
hog = pd.read_csv(BASE / 'conjunto_de_datos_thogar_enasic_2022' / 'conjunto_de_datos' / 'conjunto_de_datos_thogar_ensasic_2022.csv', dtype=str)
hog.columns = [c.upper() for c in hog.columns]
num = lambda c: pd.to_numeric(cui[c], errors='coerce')
es = lambda c, v='1': (cui[c] == v).astype(int).to_numpy()


def _var_lin(df, z):
    t = pd.DataFrame({'h': df.EST_DIS.values, 'u': df.UPM_DIS.values, 'z': z}).groupby(['h', 'u']).z.sum().reset_index()
    g = t.groupby('h').z; n_h = g.transform('size'); zbar = g.transform('mean')
    return ((n_h / (n_h - 1)).where(n_h > 1, 0) * (t.z - zbar) ** 2).sum()


def estimar(df, y, x, z=Z90):
    w = pd.to_numeric(df['FAC_CUI']).to_numpy(float); y = np.asarray(y, float); x = np.asarray(x, float)
    X = (w * x).sum(); Y = (w * y).sum(); R = Y / X if X > 0 else np.nan
    se = np.sqrt(_var_lin(df, w * (y - R * x) / X)) if X > 0 else np.nan
    cv = se / R * 100 if R > 0 else np.nan
    prec = 'no estimable' if not np.isfinite(cv) else ('alta' if cv < 15 else ('moderada' if cv < 30 else 'baja'))
    return dict(pct=R * 100, cv=cv, li90=(R - z * se) * 100, ls90=(R + z * se) * 100,
                n_muestra_dominio=int(x.sum()), n_muestra_si=int((y * x).sum()), total_expandido=Y, precision=prec)


def diferencia(df, y, x1, x2):
    w = pd.to_numeric(df['FAC_CUI']).to_numpy(float); y = np.asarray(y, float); x1 = np.asarray(x1, float); x2 = np.asarray(x2, float)
    X1, X2 = (w * x1).sum(), (w * x2).sum()
    if X1 == 0 or X2 == 0:
        return dict(dif_pp=np.nan, dif_li90=np.nan, dif_ls90=np.nan, dif_significativa=False)
    R1, R2 = (w * y * x1).sum() / X1, (w * y * x2).sum() / X2
    z = w * (y * x1 - R1 * x1) / X1 - w * (y * x2 - R2 * x2) / X2
    se = np.sqrt(_var_lin(cui, z)); d = R1 - R2
    return dict(dif_pp=d * 100, dif_li90=(d - Z90 * se) * 100, dif_ls90=(d + Z90 * se) * 100, dif_significativa=bool((d - Z90 * se) * (d + Z90 * se) > 0))


def cualquiera(pares):
    return np.column_stack([(cui[a] == '1') | (cui[b] == '1') for a, b in pares]).any(axis=1).astype(int)


cui['HORAS'] = (num('P6_7').fillna(0) + num('P6_26').fillna(0)).clip(upper=168)
cui.loc[num('P6_7').isna() & num('P6_26').isna(), 'HORAS'] = np.nan
H40 = (cui.HORAS >= 39.999).astype(int).to_numpy()
SAL = [('P6_11_1', 'P6_30_1'), ('P6_11_3', 'P6_30_3'), ('P6_11_6', 'P6_30_6')]
TRA = [('P6_12_1', 'P6_31_1'), ('P6_12_2', 'P6_31_2'), ('P6_12_5', 'P6_31_5')]
SALUD3 = cualquiera(SAL); ALGUNO = cualquiera(SAL + TRA)

MID = {'1': 1800, '2': 4850.5, '3': 7100.5, '4': 9000.5, '5': 11000.5, '6': 13300.5, '7': 16050.5, '8': 19750.5, '9': 25500.5, '10': 37100.5, '11': 55000}
hog['ING'] = pd.to_numeric(hog.P3A_4.where(hog.P3A_4 != '99999'), errors='coerce').fillna(hog.P3A_5.map(MID))
nec = ((hog.HN_CDISC == '1') | (hog.HN_C60MA == '1')) & hog.ING.notna()
W_h = pd.to_numeric(hog.FAC_HOG)
def wq(v, w, q):
    o = np.argsort(v.values); c = np.cumsum(w.values[o]) / w.sum(); return v.values[o][np.searchsorted(c, q)]
cortes = [wq(hog.ING[nec], W_h[nec], q) for q in (.2, .4, .6, .8)]
assert cortes == [3200, 5000, 8000, 15000], f'Cortes de quintil distintos al script 04: {cortes}'
hog['QUINTIL'] = np.where(hog.ING.isna(), np.nan, np.digitize(hog.ING, cortes, right=True) + 1)
cui = cui.merge(hog[['LLAVEHOG', 'QUINTIL']], on='LLAVEHOG', how='left', validate='many_to_one')
cui['G_SEXO'] = cui.SEXO.map({'1': 'Hombre', '2': 'Mujer'})
cui['G_EDAD'] = pd.cut(num('EDAD'), [0, 39, 59, 130], labels=['15-39', '40-59', '60+']).astype(str)
cui['G_ING'] = cui.QUINTIL.map({1: 'Q1-Q2', 2: 'Q1-Q2', 3: 'Q3', 4: 'Q4-Q5', 5: 'Q4-Q5'})
cui['G_TIPO'] = np.where(cui.FILTRO6_1 == '1', 'Cuida discapacidad', 'Solo 60+ sin discapacidad')
DOM = ((cui.FILTRO6_1 == '1') | (cui.FILTRO6_6 == '1')).astype(int).to_numpy()
SINNEC = DOM * es('P6_42', '2') * es('P6_45_09')
cui['G_ING2'] = cui.G_ING.fillna('Sin dato').replace('nan', 'Sin dato')
DIMS = [('Sexo', 'G_SEXO', ['Mujer', 'Hombre']), ('Edad', 'G_EDAD', ['15-39', '40-59', '60+']),
        ('Ingreso', 'G_ING2', ['Q1-Q2', 'Q3', 'Q4-Q5', 'Sin dato']), ('A quién cuida', 'G_TIPO', ['Cuida discapacidad', 'Solo 60+ sin discapacidad'])]


def perfil(GRUPO):
    filas = []
    for dim, col, niveles in DIMS:
        for nv in niveles:
            y = (cui[col] == nv).astype(int).to_numpy()
            for pob, x in [('Grupo del problema', GRUPO), ('Universo', DOM)]:
                f = dict(dimension=dim, segmento=nv, poblacion=pob) | estimar(cui, y * x, x)
                if pob == 'Grupo del problema':
                    f |= diferencia(cui, y, GRUPO, DOM * (1 - GRUPO))
                filas.append(f)
        for pob in ('Grupo del problema', 'Universo'):
            s = sum(f['pct'] for f in filas if f['dimension'] == dim and f['poblacion'] == pob)
            assert abs(s - 100) < 0.01, f'{dim}/{pob} suma {s:.2f}%'
    return pd.DataFrame(filas)


# ---------- controles con «algún daño» (versión 1)
ref = pd.read_csv(OUT / '16_perfil_grupo_problema.csv', encoding='utf-8-sig')
p1 = perfil(SINNEC * H40 * ALGUNO)
m = p1.merge(ref, on=['dimension', 'segmento', 'poblacion'], suffixes=('', '_ref'))
assert len(m) == len(ref) == len(p1), 'el perfil de control no cubre las mismas filas que 16'
assert (m.pct - m.pct_ref).abs().max() < 0.05 and (m.li90 - m.li90_ref).abs().max() < 0.05 and (m.total_expandido - m.total_expandido_ref).abs().max() < 1, \
    'El perfil con «algún daño» NO reproduce 16_perfil_grupo_problema.csv: no se escribe nada.'
print('control perfil v1: REPRODUCE 16_perfil_grupo_problema.csv (%d filas)' % len(ref))
pv1 = estimar(cui, ALGUNO * DOM, DOM)
assert abs(pv1['pct'] - 62.16) < 0.05 and abs(pv1['li90'] - 58.8) < 0.05 and abs(pv1['ls90'] - 65.52) < 0.05, f'prevalencia v1 no reproduce 12 (62.16 [58.80-65.52]): {pv1}'
print(f"control prevalencia v1: {pv1['pct']:.1f} [{pv1['li90']:.1f}-{pv1['ls90']:.1f}] REPRODUCE")

# ---------- resultados con DANO_SALUD3
p3 = perfil(SINNEC * H40 * SALUD3)
p3.round({'pct': 2, 'cv': 2, 'li90': 2, 'ls90': 2, 'total_expandido': 0, 'dif_pp': 2, 'dif_li90': 2, 'dif_ls90': 2}).to_csv(OUT / '30_perfil_grupo_salud3.csv', index=False, encoding='utf-8-sig')
pv = pd.DataFrame([
    {'indicador': 'Cuidadoras que declaran algún daño (v1; control)', 'objetivo': 'DANO_ALGUNO', 'nivel_confianza': 90} | pv1,
    {'indicador': 'Cuidadoras que declaran daño a la salud (física, cansancio o sueño)', 'objetivo': 'DANO_SALUD3', 'nivel_confianza': 90} | estimar(cui, SALUD3 * DOM, DOM)])
pv.round({'pct': 2, 'cv': 2, 'li90': 2, 'ls90': 2, 'total_expandido': 0}).to_csv(OUT / '30_prevalencia_dano_cuidadoras.csv', index=False, encoding='utf-8-sig')
g = p3[p3.poblacion == 'Grupo del problema']
print('\nGrupo con DANO_SALUD3 — n dominio/si:', int(g.n_muestra_dominio.iloc[0]), int(g.n_muestra_si.iloc[0]), 'total', f'{g.total_expandido.iloc[0]:,.0f}')
print(g[['dimension', 'segmento', 'pct', 'li90', 'ls90', 'precision', 'dif_significativa']].round(1).to_string(index=False))
r = pv.iloc[1]; print(f"\nPrevalencia DANO_SALUD3 entre cuidadoras: {r.pct:.1f} % (IC 90 % {r.li90:.1f}-{r.ls90:.1f}; n={int(r.n_muestra_si)}/{int(r.n_muestra_dominio)})")
