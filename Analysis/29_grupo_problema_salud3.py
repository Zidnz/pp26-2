"""29 — Grupo del problema y daño por intensidad con DANO_SALUD3 (ENASIC 2022, nacional).

Motivo: DEC-OBJ-002 (1 nov 2026) fija DANO_SALUD3 (salud física, cansancio o sueño) como objetivo primario, pero el grupo del
problema del Observatorio (script/notebook 07) se calculó con «algún daño» (salud o trabajo). Este script lo recalcula con el
mismo estimador y los mismos dominios del notebook B (sección 07: razón ponderada, varianza por linealización de Taylor con
EST_DIS y UPM_DIS, IC 90 %). DANO_SALUD3 es exactamente DANO_SALUD del notebook B (mismos reactivos P6_11_1/3/6 y P6_30_1/3/6).

Control: antes de reportar lo nuevo reproduce dos filas ya publicadas en 07_enasic_necesidad_vs_norma_estimaciones.csv (grupo del
problema con «algún daño», 12.5 %, y daño a la salud con >= 40 h y «sin necesidad», 58.2 %). Si no coinciden, se detiene.

Salida (resultados/): 29_grupo_problema_salud3.csv. Alcance: nacional; nada sobre la CDMX ni sobre alcaldías. Solo agregados.
Autor: Claude a pedido de Omar, 2 nov 2026. Sin revisión de otra persona.
"""
from pathlib import Path
import numpy as np, pandas as pd

AQUI = Path(__file__).resolve().parent
BASE = AQUI / 'datos' / 'enasic'; OUT = AQUI / 'resultados'
Z90 = 1.6449

cui = pd.read_csv(BASE / 'conjunto_de_datos_tpob_cui_enasic_2022' / 'conjunto_de_datos' / 'conjunto_de_datos_tpob_cui_enasic_2022.csv', dtype=str)
cui.columns = [c.upper() for c in cui.columns]
num = lambda c: pd.to_numeric(cui[c], errors='coerce')
es = lambda c, v='1': (cui[c] == v).astype(int).to_numpy()


def _var_lin(df, z):
    t = pd.DataFrame({'h': df.EST_DIS.values, 'u': df.UPM_DIS.values, 'z': z}).groupby(['h', 'u']).z.sum().reset_index()
    g = t.groupby('h').z; n_h = g.transform('size'); zbar = g.transform('mean')
    return ((n_h / (n_h - 1)).where(n_h > 1, 0) * (t.z - zbar) ** 2).sum()


def estimar(df, y, x, etiqueta):
    w = pd.to_numeric(df['FAC_CUI']).to_numpy(float); y = np.asarray(y, float); x = np.asarray(x, float)
    X = (w * x).sum(); Y = (w * y).sum(); R = Y / X
    se = np.sqrt(_var_lin(df, w * (y - R * x) / X)); cv = se / R * 100
    prec = 'alta' if cv < 15 else ('moderada' if cv < 30 else 'baja')
    return dict(indicador=etiqueta, pct=R * 100, se=se * 100, cv=cv, li90=(R - Z90 * se) * 100, ls90=(R + Z90 * se) * 100,
                n_muestra_dominio=int(x.sum()), n_muestra_si=int((y * x).sum()), total_expandido=Y, precision=prec)


def cualquiera(pares):
    return np.column_stack([(cui[a] == '1') | (cui[b] == '1') for a, b in pares]).any(axis=1).astype(int)


DOM = ((cui.FILTRO6_1 == '1') | (cui.FILTRO6_6 == '1')).astype(int).to_numpy()
cui['HORAS'] = (num('P6_7').fillna(0) + num('P6_26').fillna(0)).clip(upper=168)
cui.loc[num('P6_7').isna() & num('P6_26').isna(), 'HORAS'] = np.nan
H40 = (cui.HORAS >= 39.999).astype(int).to_numpy()          # pd.cut(..., [0, 19.999, 39.999, 1000]): '>=40 h' = (39.999, 1000]
SAL = [('P6_11_1', 'P6_30_1'), ('P6_11_3', 'P6_30_3'), ('P6_11_6', 'P6_30_6')]
TRA = [('P6_12_1', 'P6_31_1'), ('P6_12_2', 'P6_31_2'), ('P6_12_5', 'P6_31_5')]
SALUD3 = cualquiera(SAL); ALGUNO = cualquiera(SAL + TRA)
NOBUSCO = DOM * es('P6_42', '2'); SINNEC = NOBUSCO * es('P6_45_09')

filas = [
    estimar(cui, SINNEC * H40 * ALGUNO, DOM, 'Peso en el universo | >=40 h, "sin necesidad" y algún daño (control: reproduce 07)') | {'objetivo': 'DANO_ALGUNO', 'tipo': 'control'},
    estimar(cui, SALUD3 * SINNEC * H40, SINNEC * H40, 'Daño a la salud entre >=40 h y "sin necesidad" (control: reproduce 07)') | {'objetivo': 'DANO_SALUD3', 'tipo': 'control'},
    estimar(cui, SINNEC * H40 * SALUD3, DOM, 'Peso en el universo | >=40 h, "sin necesidad" y daño a la salud (salud física, cansancio o sueño)') | {'objetivo': 'DANO_SALUD3', 'tipo': 'resultado'},
]
res = pd.DataFrame(filas)
res = res[['indicador', 'objetivo', 'tipo', 'pct', 'se', 'cv', 'li90', 'ls90', 'n_muestra_dominio', 'n_muestra_si', 'total_expandido', 'precision']]

# ---------- control contra el archivo ya publicado (07)
p07 = pd.read_csv(OUT / '07_enasic_necesidad_vs_norma_estimaciones.csv', encoding='utf-8-sig')
a = p07[p07.indicador == 'Peso en el universo | >=40 h, "sin necesidad" y algún daño'].iloc[0]
b = p07[p07.indicador == '"Sin necesidad" | >=40 h | Algún daño a la salud (física, cansancio, sueño)'].iloc[0]
for fila, ref, nom in [(res.iloc[0], a, 'grupo del problema (algún daño)'), (res.iloc[1], b, 'daño a la salud con >= 40 h')]:
    ok = (abs(fila.pct - ref.pct) < 0.05 and abs(fila.li90 - ref.li90) < 0.05 and abs(fila.ls90 - ref.ls90) < 0.05
          and int(fila.n_muestra_dominio) == int(ref.n_muestra_dominio) and int(fila.n_muestra_si) == int(ref.n_muestra_si)
          and abs(fila.total_expandido - ref.total_expandido) < 1)
    print(f'control {nom}: nuevo {fila.pct:.1f} [{fila.li90:.1f}, {fila.ls90:.1f}] n={int(fila.n_muestra_dominio)}/{int(fila.n_muestra_si)} · '
          f'07 {ref.pct} [{ref.li90}, {ref.ls90}] n={int(ref.n_muestra_dominio)}/{int(ref.n_muestra_si)} · {"REPRODUCE" if ok else "NO REPRODUCE"}')
    if not ok:
        raise SystemExit(f'El control "{nom}" no reproduce el archivo 07: no se escribe nada.')
res.round({'pct': 2, 'se': 3, 'cv': 2, 'li90': 2, 'ls90': 2, 'total_expandido': 0}).to_csv(OUT / '29_grupo_problema_salud3.csv', index=False, encoding='utf-8-sig')
r = res.iloc[2]
print(f'\nRESULTADO: >=40 h, "sin necesidad" y daño a la salud = {r.pct:.1f} % del universo (IC 90 % {r.li90:.1f} a {r.ls90:.1f}; '
      f'n={int(r.n_muestra_si)} de {int(r.n_muestra_dominio)}; ≈ {r.total_expandido:,.0f} personas; precisión {r.precision})')
