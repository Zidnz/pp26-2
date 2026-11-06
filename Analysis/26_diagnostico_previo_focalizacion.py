"""26 — Diagnóstico previo al modelado de focalización (ENASIC 2022, nacional).

Para qué existe: reconstruir el análisis exploratorio que debió hacerse ANTES de la sección 11
(notebook B) y de los scripts 21 y 22. No entrena un modelo para elegirlo: mide qué puede y qué no
puede responder la ENASIC sobre «a quién ofrecer primero el relevo».

Siete diagnósticos, cada uno con su archivo en resultados/:
  D1 26_diag_muestra.csv              tamaño efectivo, efecto de diseño, techo y diferencia mínima detectable
  D2 26_diag_objetivo.csv             composición de DANO_ALGUNO (qué componente lo sostiene)
  D3 26_diag_horas_forma.csv          forma de la relación horas -> daño (¿gradiente o escalón?)
  D4 26_diag_info_condicional.csv     ¿hay información además de las horas? (diferencias dentro de <40 h y >=40 h)
  D5 26_diag_medicion.csv             saltos de cuestionario, código 8, tope de 98 h, personas en dos bloques
  D6 26_diag_candidatos_objetivo.csv  definiciones alternativas del objetivo (descriptivo, NO para elegir por rendimiento)
  D7 26_diag_escalera_informacion.csv cuánto aporta cada bloque de información (AUC y cobertura al cupo, validación por UPM)

Universo y variables: idénticos a la sección 11 (FILTRO6_1 o FILTRO6_6; FAC_CUI; P6_7 + P6_26).
Errores estándar: linealización de Taylor por estrato y UPM (misma función que la sección 11).
D7 usa una regresión logística propia (numpy, IRLS con L2 = 1) porque el entorno de ejecución no tenía
scikit-learn; sirve para medir información incremental, no es un candidato a modelo final.

Alcance: nacional. Nada aquí habla de la CDMX. Solo se escriben agregados.
Autor: Claude a pedido de Omar, 1 nov 2026. Sin revisión de otra persona.
"""
from pathlib import Path
import numpy as np, pandas as pd

AQUI = Path(__file__).resolve().parent
BASE = AQUI / 'datos' / 'enasic'; OUT = AQUI / 'resultados'
Z90, Z80 = 1.6449, 0.8416

cui = pd.read_csv(BASE / 'conjunto_de_datos_tpob_cui_enasic_2022' / 'conjunto_de_datos' /
                  'conjunto_de_datos_tpob_cui_enasic_2022.csv', dtype=str)
cui.columns = [c.upper() for c in cui.columns]
num = lambda c: pd.to_numeric(cui[c], errors='coerce')
def cualq(pares): return np.column_stack([(cui[a] == '1') | (cui[b] == '1') for a, b in pares]).any(axis=1).astype(int)

DOM = (cui.FILTRO6_1 == '1') | (cui.FILTRO6_6 == '1')
cui['HORAS'] = num('P6_7').fillna(0) + num('P6_26').fillna(0)
COMP = {'salud_fisica': ('P6_11_1', 'P6_30_1'), 'cansancio': ('P6_11_3', 'P6_30_3'), 'sueno': ('P6_11_6', 'P6_30_6'),
        'no_trabaja_fuera': ('P6_12_1', 'P6_31_1'), 'dejo_trabajo': ('P6_12_2', 'P6_31_2'), 'redujo_jornada': ('P6_12_5', 'P6_31_5')}
for k, v in COMP.items(): cui['C_' + k] = cualq([v])
CC = ['C_' + k for k in COMP]
cui['DANO_ALGUNO'] = cui[CC].max(axis=1)
cui['N_ABVD'] = (cui[['P6_2_01', 'P6_2_02', 'P6_2_03', 'P6_2_04', 'P6_2_08']] == '1').sum(axis=1)
cui['N_CLIN'] = (cui[['P6_2_10', 'P6_2_11', 'P6_2_12', 'P6_2_13']] == '1').sum(axis=1)
cui['CUIDA_DISC'] = (cui.FILTRO6_1 == '1').astype(int)
cui['CUIDA_MENORES'] = (cui[['FILTRO6_2', 'FILTRO6_3']] == '1').any(axis=1).astype(int)
cui['FALTA_FUERZA'] = ((cui.P6_9_1 == '1') | (cui.P6_28_1 == '1')).astype(int)
cui['REQ_APOYO'] = ((cui.P6_9_4 == '1') | (cui.P6_28_4 == '1')).astype(int)
cui['NO_COOPERA'] = ((cui.P6_9_2 == '1') | (cui.P6_28_2 == '1')).astype(int)
cui['NEC_CAPACITACION'] = ((cui.P6_9_3 == '1') | (cui.P6_28_3 == '1')).astype(int)
cui['CAPACITACION'] = ((cui.P6_3 == '1') | (cui.P6_23 == '1')).astype(int)
cui['APOYO_FAMILIA'] = ((cui.P6_8 == '1') | (cui.P6_27 == '1')).astype(int)
cui['MUJER'] = (cui.SEXO == '2').astype(int)
cui['EDAD60'] = (num('EDAD') >= 60).astype(int)
cui['ABVD_3MAS'] = (cui.N_ABVD >= 3).astype(int); cui['CLIN_1MAS'] = (cui.N_CLIN >= 1).astype(int)

d = cui[DOM].reset_index(drop=True).copy()
w = pd.to_numeric(d.FAC_CUI).to_numpy(float)
y = d.DANO_ALGUNO.to_numpy(); h = d.HORAS.to_numpy(); S40 = h >= 40

def wm(x, m=None):
    x = np.asarray(x, float); m = np.ones(len(x), bool) if m is None else np.asarray(m, bool)
    return (w[m] * x[m]).sum() / w[m].sum()
def _var_lin(z):
    t = pd.DataFrame({'h': d.EST_DIS.values, 'u': d.UPM_DIS.values, 'z': z}).groupby(['h', 'u']).z.sum().reset_index()
    g = t.groupby('h').z; n = g.transform('size'); zb = g.transform('mean')
    return ((n / (n - 1)).where(n > 1, 0) * (t.z - zb) ** 2).sum()
def razon(yy, xx):
    yy = np.asarray(yy, float); xx = np.asarray(xx, float); X = (w * xx).sum(); R = (w * yy).sum() / X
    return R, np.sqrt(_var_lin(w * (yy - R * xx) / X))
def dif_prop(yy, a, b):
    """p(y|a) - p(y|b) con error de diseño."""
    p1 = razon(yy * a, a)[0]; p0 = razon(yy * b, b)[0]
    z = w * (a * (yy - p1) / (w * a).sum() - b * (yy - p0) / (w * b).sum())
    return p1 - p0, np.sqrt(_var_lin(z))
def wauc(yy, s):
    df = pd.DataFrame({'s': np.asarray(s, float), 'p': w * (yy == 1), 'n': w * (yy == 0)}).groupby('s')[['p', 'n']].sum().sort_index()
    cn = df.n.cumsum() - df.n
    return float((df.p * (cn + 0.5 * df.n)).sum() / (df.p.sum() * df.n.sum()))

# ---------------- D1 muestra, techo y potencia
prev, se_prev = razon(y, np.ones(len(d)))
cupo = wm(S40); cob_regla, se_cob = razon(y * S40, y)
techo = min(1.0, cupo / prev)
# Error estándar de la diferencia de cobertura publicado en 11_modelo_alternativas.csv (logística vs regla)
alt = pd.read_csv(OUT / '11_modelo_alternativas.csv', encoding='utf-8-sig')
fila = alt[(alt.objetivo == 'DANO_ALGUNO') & (alt.puntaje == 'Regresión logística')].iloc[0]
se_dif = (fila.dif_ls90 - fila.dif_li90) / (2 * Z90) / 100
d1 = pd.DataFrame([
    ('n_muestra_universo', len(d), 'personas cuidadoras en la muestra'),
    ('n_upm', d.UPM_DIS.nunique(), 'unidades primarias de muestreo'),
    ('n_estratos', d.EST_DIS.nunique(), ''),
    ('prevalencia_dano_alguno', prev, 'ponderada'),
    ('efecto_diseno_prevalencia', se_prev ** 2 / (prev * (1 - prev) / len(d)), 'deff'),
    ('n_efectivo', prev * (1 - prev) / se_prev ** 2, 'n / deff'),
    ('cupo_regla_40h', cupo, 'proporción ponderada seleccionada por la regla'),
    ('cobertura_regla_40h', cob_regla, ''),
    ('techo_cobertura_al_cupo', techo, 'cupo / prevalencia: lo máximo que cualquier puntaje puede cubrir'),
    ('margen_max_sobre_regla_pp', 100 * (techo - cob_regla), 'ganancia máxima posible sobre la regla'),
    ('se_diferencia_cobertura_pp', 100 * se_dif, 'de 11_modelo_alternativas.csv (logística vs regla)'),
    ('dif_minima_detectable_pp', 100 * (Z90 + Z80) * se_dif, 'potencia 80 %, alfa 0.10 bilateral'),
], columns=['indicador', 'valor', 'nota'])

# ---------------- D2 composición del objetivo
f = []
for k in COMP:
    c = d['C_' + k].to_numpy(); otros = d[[x for x in CC if x != 'C_' + k]].max(axis=1).to_numpy()
    f.append(dict(componente=k, prevalencia=wm(c), unico_componente=wm((c == 1) & (otros == 0)),
                  prev_menos40=wm(c, ~S40), prev_40mas=wm(c, S40), n_muestra_si=int(c.sum())))
f.append(dict(componente='DANO_ALGUNO', prevalencia=prev, unico_componente=np.nan, prev_menos40=wm(y, ~S40),
              prev_40mas=wm(y, S40), n_muestra_si=int(y.sum())))
d2 = pd.DataFrame(f)

# ---------------- D3 forma horas -> daño
cortes = [0, 7, 14, 21, 30, 40, 60, 98, 10_000]; et = pd.cut(h, cortes, right=False)
f = []
for c in et.categories:
    m = (et == c).astype(int)
    if m.sum() == 0: continue
    R, se = razon(y * m, m)
    f.append(dict(horas=str(c).replace('10000', 'más'), n_muestra=int(m.sum()), pct_poblacion=wm(m), prev_dano=R,
                  li90=R - Z90 * se, ls90=R + Z90 * se))
d3 = pd.DataFrame(f)
d3_auc = pd.DataFrame([dict(horas='AUC horas continuas', prev_dano=wauc(y, h)), dict(horas='AUC regla >=40 h', prev_dano=wauc(y, S40.astype(int)))])
d3 = pd.concat([d3, d3_auc], ignore_index=True)

# ---------------- D4 información condicional a las horas
VARS = ['FALTA_FUERZA', 'REQ_APOYO', 'NO_COOPERA', 'NEC_CAPACITACION', 'ABVD_3MAS', 'CLIN_1MAS', 'CUIDA_DISC',
        'CUIDA_MENORES', 'CAPACITACION', 'APOYO_FAMILIA', 'MUJER', 'EDAD60']
TIPO = {'FALTA_FUERZA': 'autopercepción (misma batería que el daño)', 'REQ_APOYO': 'autopercepción (misma batería que el daño)',
        'NO_COOPERA': 'autopercepción', 'NEC_CAPACITACION': 'autopercepción', 'ABVD_3MAS': 'carga (solo bloque discapacidad)',
        'CLIN_1MAS': 'carga (solo bloque discapacidad)', 'CUIDA_DISC': 'tipo de cuidado', 'CUIDA_MENORES': 'carga',
        'CAPACITACION': 'registro', 'APOYO_FAMILIA': 'registro', 'MUJER': 'sociodemográfica', 'EDAD60': 'sociodemográfica'}
f = []
for v in VARS:
    x = d[v].to_numpy()
    for nombre, m in [('total', np.ones(len(d), bool)), ('menos_40h', ~S40), ('40h_o_mas', S40)]:
        a = (m & (x == 1)).astype(int); b = (m & (x == 0)).astype(int)
        if a.sum() < 20 or b.sum() < 20:
            f.append(dict(variable=v, tipo=TIPO[v], estrato=nombre, n_si=int(a.sum()), n_no=int(b.sum()))); continue
        df_, se = dif_prop(y, a, b)
        f.append(dict(variable=v, tipo=TIPO[v], estrato=nombre, prev_variable=wm(x, m), dif_pp=100 * df_,
                      li90=100 * (df_ - Z90 * se), ls90=100 * (df_ + Z90 * se), n_si=int(a.sum()), n_no=int(b.sum())))
# misma pregunta dentro de bloque: ¿el efecto del bloque explica a ABVD y CLIN?
for blk, mb in [('bloque_discapacidad', d.CUIDA_DISC == 1), ('bloque_solo_60', d.CUIDA_DISC == 0)]:
    mb = mb.to_numpy()
    for nombre, m in [('menos_40h', ~S40 & mb), ('40h_o_mas', S40 & mb)]:
        a = m.astype(int)
        f.append(dict(variable='DANO_ALGUNO_por_bloque', tipo='tipo de cuidado', estrato=f'{blk}|{nombre}',
                      prev_variable=razon(y * a, a)[0], n_si=int(a.sum())))
d4 = pd.DataFrame(f)

# ---------------- D5 medición
a7, a26 = num('P6_7')[DOM].to_numpy(), num('P6_26')[DOM].to_numpy()
f = [dict(chequeo='horas: P6_7 y P6_26 tienen rango 01-98 (tope)', valor=int(((a7 == 98) | (a26 == 98)).sum()), nota='personas con 98 en algún bloque'),
     dict(chequeo='horas: suma de dos bloques supera 98', valor=int((h > 98).sum()), nota='posible traslape de horas «exclusivas»'),
     dict(chequeo='personas que cuidan en ambos bloques', valor=int((~np.isnan(a7) & ~np.isnan(a26)).sum()),
          nota='sus predictores de dificultad se combinan con O: dos oportunidades de decir sí'),
     dict(chequeo='horas: amontonamiento en múltiplos de 7', valor=float(wm(np.isin(h, np.arange(7, 99, 7)))), nota='proporción ponderada'),
     dict(chequeo='ABVD/tareas clínicas preguntadas en bloque solo 60+', valor=int(d.loc[d.CUIDA_DISC == 0, 'P6_22_01'].notna().sum()),
          nota=f'de {(d.CUIDA_DISC == 0).sum()}: el resto vale 0 porque no se preguntó (P6_22 depende de P6_21)')]
for c in ['P6_28_1', 'P6_28_2', 'P6_28_3', 'P6_28_4']:
    f.append(dict(chequeo=f'{c}: código 8 («No aplica») recodificado como «no»', valor=int((d[c] == '8').sum()), nota="código 8 = «No aplica» (catálogo); no existe en P6_9_x"))
d5 = pd.DataFrame(f)

# ---------------- D6 definiciones alternativas del objetivo (descriptivo)
C = d[CC]
cand = {'DANO_ALGUNO (vigente)': C.max(axis=1), 'dos o más componentes': (C.sum(axis=1) >= 2).astype(int),
        'tres o más componentes': (C.sum(axis=1) >= 3).astype(int), 'salud física': d.C_salud_fisica,
        'salud (física, cansancio o sueño)': d[['C_salud_fisica', 'C_cansancio', 'C_sueno']].max(axis=1),
        'trabajo (tres reactivos)': d[['C_no_trabaja_fuera', 'C_dejo_trabajo', 'C_redujo_jornada']].max(axis=1)}
d6 = pd.DataFrame([dict(objetivo=k, prevalencia=wm(v), n_muestra_si=int(v.sum()), prev_menos7h=wm(v, h < 7),
                        prev_menos40=wm(v, ~S40), prev_40mas=wm(v, S40), prev_bloque_disc=wm(v, d.CUIDA_DISC == 1),
                        prev_bloque_solo60=wm(v, d.CUIDA_DISC == 0)) for k, v in ((k, v.to_numpy()) for k, v in cand.items())])

# ---------------- D7 escalera de información
d['H60'] = (h >= 60).astype(int); d['HLOG'] = np.log1p(np.minimum(h, 98)); d['H40'] = S40.astype(int)
def _fit(X, yy, ww, lam=1.0):
    X = np.column_stack([np.ones(len(X)), X]); b = np.zeros(X.shape[1]); P = lam * np.diag(np.r_[0, np.ones(X.shape[1] - 1)])
    for _ in range(100):
        p = 1 / (1 + np.exp(-X @ b)); g = X.T @ (ww * (yy - p)) - P @ b
        st = np.linalg.solve(X.T @ (X * (ww * p * (1 - p))[:, None]) + P, g); b += st
        if np.abs(st).max() < 1e-9: break
    return b
UPS = d.UPM_DIS.unique()
def oof(cols, reps=20, k=5):
    X = d[cols].to_numpy(float); X = (X - X.mean(0)) / np.where(X.std(0) == 0, 1, X.std(0)); acc = np.zeros(len(d))
    for r in range(reps):
        rng = np.random.default_rng(20261101 + r); fold = d.UPM_DIS.map(dict(zip(UPS, rng.integers(0, k, len(UPS))))).to_numpy()
        for j in range(k):
            te = fold == j; b = _fit(X[~te], y[~te], w[~te] / w[~te].mean())
            acc[te] += 1 / (1 + np.exp(-(np.column_stack([np.ones(te.sum()), X[te]]) @ b)))
    return acc / reps
def seleccion(s):
    rng = np.random.default_rng(1); o = np.lexsort((rng.random(len(s)), -s)); acu = np.cumsum(w[o]) / w.sum()
    sel = np.zeros(len(s), int); sel[o[acu <= cupo + 1e-12]] = 1; return sel
H = ['H40', 'H60', 'HLOG']
ESC = [('E0 regla >=40 h', None),
       ('E1 forma de las horas (40, 60, log)', H),
       ('E2 + tipo de cuidado (discapacidad vs solo 60+)', H + ['CUIDA_DISC']),
       ('E3 + carga observable (ABVD 3+, clínicas, menores)', H + ['CUIDA_DISC', 'ABVD_3MAS', 'CLIN_1MAS', 'CUIDA_MENORES']),
       ('E4 + sociodemográficas (mujer, 60+)', H + ['CUIDA_DISC', 'ABVD_3MAS', 'CLIN_1MAS', 'CUIDA_MENORES', 'MUJER', 'EDAD60']),
       ('E5 + autopercepción (falta fuerza, requiere apoyo)', H + ['CUIDA_DISC', 'ABVD_3MAS', 'CLIN_1MAS', 'CUIDA_MENORES', 'MUJER', 'EDAD60', 'FALTA_FUERZA', 'REQ_APOYO'])]
f = []; sel0 = S40.astype(int); disc = d.CUIDA_DISC.to_numpy()
for nombre, cols in ESC:
    s = sel0.astype(float) if cols is None else oof(cols)
    sel = sel0 if cols is None else seleccion(s)
    cob, _ = razon(y * sel, y); dif, se = razon(y * (sel - sel0), y)
    f.append(dict(escalon=nombre, auc_ponderado=wauc(y, s), cobertura=cob, dif_vs_regla_pp=100 * dif,
                  li90=100 * (dif - Z90 * se), ls90=100 * (dif + Z90 * se),
                  pct_seleccionado_bloque_solo60=wm(sel, disc == 0), pct_seleccionado_bloque_disc=wm(sel, disc == 1),
                  cobertura_bloque_solo60=razon(y * sel * (disc == 0), y * (disc == 0))[0],
                  cobertura_bloque_disc=razon(y * sel * (disc == 1), y * (disc == 1))[0]))
d7 = pd.DataFrame(f)

for nombre, df_ in [('26_diag_muestra', d1), ('26_diag_objetivo', d2), ('26_diag_horas_forma', d3), ('26_diag_info_condicional', d4),
                    ('26_diag_medicion', d5), ('26_diag_candidatos_objetivo', d6), ('26_diag_escalera_informacion', d7)]:
    df_.to_csv(OUT / f'{nombre}.csv', index=False, encoding='utf-8-sig')
pd.set_option('display.width', 250); pd.set_option('display.max_columns', 20)
for df_ in (d1, d2, d3, d5, d6, d7): print(df_.round(3).to_string(), '\n')
print(d4[d4.estrato != 'total'].round(1).to_string())
