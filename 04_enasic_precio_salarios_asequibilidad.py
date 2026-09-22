"""
04 · ENASIC 2022: contratación por quintil de ingreso, pago observado a cuidadoras y
asequibilidad del cuidado domiciliario.

Proyecto integrador 7.º semestre LCDN · Observatorio de Datos para la Economía del Cuidado
Creado: 2026-09-22. Ejecutar desde la carpeta Analysis/:   python 04_enasic_precio_salarios_asequibilidad.py

Qué responde
  A. ¿El precio es el cuello de botella? Tasa de contratación de enfermería/cuidadora por quintil de
     ingreso entre hogares con necesidad (discapacidad o 60+). Si en el quintil más alto sigue cerca de
     1-3 %, el precio no es la barrera principal (propuesto en la bitácora del 20-09).
  B. ¿Cuánto se paga hoy? Pago semanal, horas y pago por hora de cuidadoras, enfermería y trabajo
     doméstico de entrada por salida (muestra, sin ponderar y ponderado).
  C. ¿Quién puede pagar un salario digno? Proporción ponderada de hogares con necesidad cuyo ingreso
     permitiría pagar paquetes de 10, 20 y 40 h/semana a distintos salarios por hora.

Alcance: NACIONAL. La ENASIC no permite estimaciones para la CDMX ni por alcaldía. Nada de este script
se usa como dato territorial.

Datos: microdatos ENASIC 2022 en datos/enasic/ (no se suben al repositorio; ver .gitignore).
Salidas: resultados/04_*.csv
"""
from pathlib import Path
import numpy as np, pandas as pd

BASE = Path('datos/enasic'); OUT = Path('resultados'); OUT.mkdir(exist_ok=True)
hog = pd.read_csv(BASE / 'conjunto_de_datos_thogar_enasic_2022' / 'conjunto_de_datos' /
                  'conjunto_de_datos_thogar_ensasic_2022.csv', dtype=str)   # typo del INEGI en el nombre
hog.columns = [c.upper() for c in hog.columns]

# ---------- estimador (idéntico al notebook 03) ----------
Z90 = 1.6449
def estimar(df, y, x, peso, etiqueta=''):
    w = pd.to_numeric(df[peso]).to_numpy(float); y = np.asarray(y, float); x = np.asarray(x, float)
    X = (w * x).sum(); Y = (w * y).sum(); R = Y / X if X > 0 else np.nan
    z = w * (y - R * x) / X
    t = pd.DataFrame({'h': df.EST_DIS.values, 'u': df.UPM_DIS.values, 'z': z}).groupby(['h', 'u']).z.sum().reset_index()
    g = t.groupby('h').z; n_h = g.transform('size'); zbar = g.transform('mean')
    var = ((n_h / (n_h - 1)).where(n_h > 1, 0) * (t.z - zbar) ** 2).sum()
    se = np.sqrt(var); cv = se / R * 100 if R > 0 else np.nan
    prec = 'alta' if cv < 15 else ('moderada' if cv < 30 else 'baja')
    if not np.isfinite(cv): prec = 'no estimable (0 casos)'
    return dict(indicador=etiqueta, pct=R * 100, se=se * 100, cv=cv, li90=(R - Z90 * se) * 100,
                ls90=(R + Z90 * se) * 100, n_muestra_dominio=int(x.sum()), n_muestra_si=int((y * x).sum()),
                total_expandido=Y, precision=prec)
def es(col, val='1'): return (hog[col] == val).astype(int).to_numpy()
def num(s, invalidos): return pd.to_numeric(s.where(~s.isin(invalidos)), errors='coerce')
def wq(v, w, q):
    o = np.argsort(v); c = np.cumsum(w[o]) / w.sum(); return v[o][np.searchsorted(c, q)]

W = pd.to_numeric(hog.FAC_HOG).to_numpy(float)
necesidad = ((hog.HN_CDISC == '1') | (hog.HN_C60MA == '1')).astype(int).to_numpy()
contrata_cui = ((hog.P2_4_3 == '1') | (hog.P2_4_4 == '1')).astype(int).to_numpy()
contrata_dom = es('P2_4_1')

# ---------- ingreso: monto exacto (P3A.4) o punto medio del rango (P3A.5) ----------
MID = {'1': 1800, '2': 4850.5, '3': 7100.5, '4': 9000.5, '5': 11000.5, '6': 13300.5, '7': 16050.5,
       '8': 19750.5, '9': 25500.5, '10': 37100.5, '11': 55000}   # 11 = "más de $45,100": valor convencional
ing_exacto = num(hog.P3A_4, ('99999',))
ing_rango = hog.P3A_5.map(MID)
hog['ING'] = ing_exacto.fillna(ing_rango)
hog['ING_FUENTE'] = np.where(ing_exacto.notna(), 'monto', np.where(ing_rango.notna(), 'rango', 'sin dato'))

nec_ing = (necesidad == 1) & hog.ING.notna().to_numpy()
cortes = [wq(hog.ING.to_numpy()[nec_ing], W[nec_ing], q) for q in (.2, .4, .6, .8)]
hog['QUINTIL'] = np.where(hog.ING.isna(), np.nan, np.digitize(hog.ING, cortes, right=True) + 1)

# ---------- A. contratación por quintil ----------
filas = []
for q in range(1, 6):
    dq = (necesidad * (hog.QUINTIL == q).astype(int).to_numpy())
    filas.append(estimar(hog, contrata_cui * dq, dq, 'FAC_HOG', f'Q{q} | Contrata enfermería o cuidadora') | {'quintil': q, 'servicio': 'enfermería o cuidadora'})
    filas.append(estimar(hog, contrata_dom * dq, dq, 'FAC_HOG', f'Q{q} | Contrata trabajo doméstico entrada por salida') | {'quintil': q, 'servicio': 'doméstico entrada por salida'})
qa = pd.DataFrame(filas)
lim = [0] + cortes + [np.inf]
qa['ingreso_min'] = qa.quintil.map(lambda q: lim[q - 1]); qa['ingreso_max'] = qa.quintil.map(lambda q: lim[q])
cob = pd.Series(hog.ING_FUENTE[necesidad == 1]).value_counts().rename('hogares_con_necesidad_muestra')
qa.round(2).to_csv(OUT / '04_contratacion_por_quintil.csv', index=False, encoding='utf-8-sig')
cob.to_csv(OUT / '04_cobertura_ingreso.csv', encoding='utf-8-sig')

# ---------- B. pago observado ----------
SERV = {'3': 'Enfermería', '4': 'Cuidadora', '1': 'Doméstica entrada por salida'}
reg = []
for k, et in SERV.items():
    m = hog[f'P2_4_{k}'] == '1'
    pago = num(hog.loc[m, f'P2_8_{k}'], ('99999',))
    horas = num(hog.loc[m, f'P2_7_{k}'], ('98', '99')).replace(0, np.nan)
    d = pd.DataFrame({'servicio': et, 'pago_sem': pago, 'horas_sem': horas, 'w': W[m.to_numpy()],
                      'necesidad': necesidad[m.to_numpy()]})
    d['pago_hora'] = d.pago_sem / d.horas_sem
    reg.append(d)
reg = pd.concat(reg)
res = []
for (serv, grupo), d in [((s, 'todos los hogares'), g) for s, g in reg.groupby('servicio')] + \
                         [((s, 'hogares con necesidad'), g[g.necesidad == 1]) for s, g in reg.groupby('servicio')]:
    for var in ('pago_sem', 'horas_sem', 'pago_hora'):
        v = d[[var, 'w']].dropna()
        if len(v) == 0: continue
        res.append(dict(servicio=serv, grupo=grupo, variable=var, n=len(v),
                        p25=v[var].quantile(.25), mediana=v[var].median(), p75=v[var].quantile(.75),
                        mediana_ponderada=wq(v[var].to_numpy(), v.w.to_numpy(), .5)))
pb = pd.DataFrame(res)
# Actualización a pesos de 2026 con el INPC (base 2Q jul 2018 = 100).
# nov-2022 = 125.997 (mitad del levantamiento 24-oct a 16-dic-2022); ago-2026 = 145.462 (último publicado).
# Fuente: INEGI, INPC; valores consultados en elcontribuyente.mx/indicadores/inpc/ el 2026-09-22.
FACTOR_INPC = 145.462 / 125.997
pb['factor_inpc_2022_2026'] = round(FACTOR_INPC, 4)
for c in ('p25', 'mediana', 'p75', 'mediana_ponderada'):
    pb[c + '_pesos_2026'] = np.where(pb.variable == 'horas_sem', np.nan, pb[c] * FACTOR_INPC)
pb.round(2).to_csv(OUT / '04_pago_observado_cuidado.csv', index=False, encoding='utf-8-sig')

# ---------- C. asequibilidad ----------
# Salarios por hora (pesos de 2022, para comparar con ingresos de 2022):
#  - piso legal 2022: salario mínimo profesional de personas trabajadoras del hogar 187.22/día ÷ 8 h (CONASAMI 2022)
#  - mediana observada ENASIC de cuidadora o enfermería (este script)
#  - piso legal 2026 (342.47/día ÷ 8) deflactado a 2022 con el mismo factor INPC
#  - categoría 8 del tabulador CACEH 2026 (cuidado de personas mayores, 904/día ÷ 8) deflactada a 2022
med_obs = reg[reg.servicio.isin(['Enfermería', 'Cuidadora'])].pago_hora.median()
SAL = {'Piso legal 2022 (SM prof. trabajadoras del hogar)': 187.22 / 8,
       'Mediana observada ENASIC 2022 (cuidadora/enfermería)': med_obs,
       'Piso legal 2026 en pesos de 2022': 342.47 / 8 / FACTOR_INPC,
       'Tabulador CACEH 2026 cat. 8 en pesos de 2022': 904 / 8 / FACTOR_INPC}
PAQ = {10: '10 h/sem (apoyo parcial)', 20: '20 h/sem (medio tiempo)', 40: '40 h/sem (jornada completa)'}
UMBRAL = (0.10, 0.20, 0.30)
m = nec_ing
ingreso = hog.ING.to_numpy()[m]; w = W[m]
ase = []
for s_et, s in SAL.items():
    for h, h_et in PAQ.items():
        costo = s * h * 4.33
        fila = dict(salario=s_et, salario_hora_2022=round(s, 2), paquete=h_et, costo_mensual_2022=round(costo),
                    costo_mensual_2026=round(costo * FACTOR_INPC), costo_pct_ingreso_mediano=round(costo / wq(ingreso, w, .5) * 100, 1))
        for u in UMBRAL:
            fila[f'pct_hogares_costo_<=_{int(u*100)}pct_ingreso'] = round(w[costo <= u * ingreso].sum() / w.sum() * 100, 1)
        ase.append(fila)
ase = pd.DataFrame(ase)
ase['n_muestra_hogares'] = int(m.sum())
ase.to_csv(OUT / '04_asequibilidad_paquetes.csv', index=False, encoding='utf-8-sig')

resumen = pd.DataFrame([
    dict(indicador='Hogares con necesidad (disc. o 60+), total expandido', valor=round(W[necesidad == 1].sum())),
    dict(indicador='Hogares con necesidad, muestra', valor=int(necesidad.sum())),
    dict(indicador='Ingreso mensual mediano ponderado (monto o rango), hogares con necesidad, $2022', valor=round(wq(ingreso, w, .5))),
    dict(indicador='Ingreso mensual p25 ponderado, hogares con necesidad, $2022', valor=round(wq(ingreso, w, .25))),
    dict(indicador='Ingreso mensual p75 ponderado, hogares con necesidad, $2022', valor=round(wq(ingreso, w, .75))),
    dict(indicador='Factor INPC nov-2022 -> ago-2026', valor=round(FACTOR_INPC, 4)),
])
resumen.to_csv(OUT / '04_resumen.csv', index=False, encoding='utf-8-sig')

pd.set_option('display.width', 220); pd.set_option('display.max_columns', 30)
print(cob, '\n'); print(qa[['indicador', 'pct', 'cv', 'li90', 'ls90', 'n_muestra_dominio', 'n_muestra_si', 'precision', 'ingreso_min', 'ingreso_max']].round(1).to_string(), '\n')
print(pb.round(1).to_string(), '\n'); print(ase.to_string(), '\n'); print(resumen.to_string())
