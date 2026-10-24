"""24 - Regla de decisión para ordenar alcaldías por brecha de oferta de cuidado (CDMX, Censo 2020 + DENUE 05_2026).

Decisión que informa: «¿En qué orden atender las zonas?» (Observatorio, Método). Antes de este script la respuesta era
un solo conteo (personas de 60+ en AGEB con brecha, cuartil superior). Ese conteo mezcla dos cosas distintas: el
volumen (cuántas personas) y la concentración (qué fracción de la población 60+ de la alcaldía está en brecha).

NO es un modelo: no hay variable de resultado observada (nadie sabe qué pasó al atender una zona antes que otra),
así que no habría contra qué validarlo. Es una REGLA SIN PESOS, con sensibilidad explícita:

  Para cada alcaldía y cada combinación (corte de brecha c, tamaño del grupo de cabeza K):
    N = personas de 60+ en AGEB con brecha         (volumen)
    P = N / personas de 60+ de la alcaldía          (concentración)
    Nivel 1 «Doble»          : entre las K primeras por N Y entre las K primeras por P
    Nivel 2 «Una medida»     : entre las K primeras por N O por P, pero no por ambas (se indica cuál)
    Nivel 3 «Brecha menor»   : N > 0 y fuera de las K primeras en ambas
    Nivel 4 «Sin brecha»     : N = 0
  Cortes c = tercil (0.667), cuartil (0.75), quintil (0.80), con el MISMO criterio del notebook D (sección 9):
  AGEB con personas de 60+ y distancia a la oferta núcleo en o por encima del cuantil c, ambos a la vez.
  K = 4, 5, 6 de 16 alcaldías (≈ el cuarto, el tercio y 3/8). Son 9 combinaciones.
  Una alcaldía se llama «estable» solo si cae en el mismo nivel (y, en nivel 2, con la misma razón) en las 9.

Qué NO hace: no pondera dimensiones (discapacidad, sin derechohabiencia, rezago) porque eso es una decisión normativa
que los datos no resuelven; no mide capacidad, precio ni transporte; la distancia es en línea recta. El orden DENTRO de un
nivel no es prioridad: es un desempate de presentación (cuántas combinaciones en ese nivel y luego N del cuartil).

Datos: resultados/18_tipologia_ageb.csv (una fila = una AGEB urbana, Censo 2020, sin factor de expansión; es conteo
censal). Solo agregados; sin datos personales. Ejecutar desde Analysis/.

Escribe: resultados/24_prioridad_alcaldia.csv, 24_prioridad_combinaciones.csv, 24_brecha_ageb.csv
Historial: 24 oct 2026 - versión inicial. Sin doble revisión.
"""
import sys
from itertools import product
from pathlib import Path

import numpy as np
import pandas as pd

RES = Path('resultados')
CORTES = {'tercil': 2 / 3, 'cuartil': 0.75, 'quintil': 0.80}
KS = (4, 5, 6)
NIVEL_NOMBRE = {1: 'Doble (volumen y concentración)', 2: 'Una sola medida', 3: 'Brecha menor', 4: 'Sin brecha'}

g = pd.read_csv(RES / '18_tipologia_ageb.csv', encoding='utf-8-sig', dtype={'CVEGEO': str})
g['CVEGEO'] = g.CVEGEO.str.zfill(13)
assert len(g) == 2371 and g.n_60.notna().all() and g.dist_oferta_km.notna().all(), 'universo distinto al del notebook D'

# --- 1. Reproducir la bandera del notebook D y extender al quintil ---------------------------------------------------
def brecha(q):
    return (g.n_60 >= g.n_60.quantile(q)) & (g.dist_oferta_km >= g.dist_oferta_km.quantile(q))

for nombre, q in CORTES.items():
    g['b_' + nombre] = brecha(q)
assert (g.b_cuartil == g.brecha_q75).all(), 'el cuartil no reproduce brecha_q75 del notebook D'
assert (g.b_tercil == g.brecha_q67).all(), 'el tercil no reproduce brecha_q67 del notebook D'
assert (g.b_quintil <= g.b_cuartil).all() and (g.b_cuartil <= g.b_tercil).all(), 'los cortes deben estar anidados'

alc = g.groupby('alcaldia').agg(ageb=('CVEGEO', 'size'), pob_60=('n_60', 'sum'))
assert len(alc) == 16
for nombre in CORTES:
    alc['N_' + nombre] = g[g['b_' + nombre]].groupby('alcaldia').n_60.sum().reindex(alc.index, fill_value=0)
    alc['ageb_' + nombre] = g.groupby('alcaldia')['b_' + nombre].sum()
    alc['P_' + nombre] = 100 * alc['N_' + nombre] / alc.pob_60

# --- 2. Niveles en las 9 combinaciones --------------------------------------------------------------------------------
def top_k(serie, k):
    """Entre las k primeras (con empates en la frontera: se incluyen, rank 'min'); un valor 0 nunca entra."""
    return (serie.rank(ascending=False, method='min') <= k) & (serie > 0)

filas = []
for (nombre, k) in product(CORTES, KS):
    por_n, por_p = top_k(alc['N_' + nombre], k), top_k(alc['P_' + nombre], k)
    for a in alc.index:
        n = alc.loc[a, 'N_' + nombre]
        if n == 0:
            nivel, razon = 4, ''
        elif por_n[a] and por_p[a]:
            nivel, razon = 1, ''
        elif por_n[a] or por_p[a]:
            nivel, razon = 2, 'volumen' if por_n[a] else 'concentración'
        else:
            nivel, razon = 3, ''
        filas.append({'alcaldia': a, 'corte': nombre, 'K': k, 'N': int(n), 'P_pct': round(alc.loc[a, 'P_' + nombre], 1),
                      'nivel': nivel, 'razon': razon, 'etiqueta': f'{nivel}' + (f' ({razon})' if razon else '')})
comb = pd.DataFrame(filas)

# --- 3. Resumen por alcaldía -----------------------------------------------------------------------------------------
n_comb = len(CORTES) * len(KS)
res = []
for a, x in comb.groupby('alcaldia'):
    modal = x.etiqueta.value_counts()
    et_modal, n_modal = modal.index[0], int(modal.iloc[0])
    ref = x[(x.corte == 'cuartil') & (x.K == 5)].iloc[0]          # combinación de referencia: la de la tarjeta anterior (cuartil)
    niveles = sorted(x.nivel.unique())
    res.append({'alcaldia': a, 'nivel_referencia': int(ref.nivel), 'razon_referencia': ref.razon, 'etiqueta_referencia': ref.etiqueta,
                'nivel_modal': int(et_modal[0]), 'etiqueta_modal': et_modal, 'combinaciones_en_modal': n_modal, 'combinaciones_total': n_comb,
                'estable': n_modal == n_comb, 'nivel_min': niveles[0], 'nivel_max': niveles[-1],
                'combinaciones_nivel_1': int((x.nivel == 1).sum())})
res = pd.DataFrame(res).set_index('alcaldia')
out = alc.join(res)
out['pct_brecha_en_5_ageb_mayores'] = (g[g.b_cuartil].sort_values('n_60', ascending=False).groupby('alcaldia').head(5)
                                       .groupby('alcaldia').n_60.sum().reindex(out.index, fill_value=0) / out.N_cuartil.replace(0, np.nan) * 100).round(1)
# Contexto (NO entra a la regla): oferta núcleo frente a la población 60+, si el archivo existe y empata los 16 nombres.
ctx = Path('outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv')
if ctx.exists():
    c = pd.read_csv(ctx, encoding='utf-8-sig').set_index('municipio')
    if set(out.index) == set(c.index):
        out['contexto_indice_oferta_vs_60'] = c.indice_oferta_vs_60.round(2)
        out['contexto_establecimientos_nucleo'] = c.establecimientos
    else:
        print('AVISO: los nombres de alcaldía no empatan con outputs/oferta_nucleo_vs_pob60_por_alcaldia.csv; contexto omitido', file=sys.stderr)
out['orden_presentacion'] = (out.sort_values(['nivel_modal', 'combinaciones_nivel_1', 'N_cuartil'], ascending=[True, False, False])
                             .reset_index().reset_index().set_index('alcaldia')['index'] + 1)
out = out.sort_values('orden_presentacion')

# --- 4. AGEB: zona = punto donde se instala, no la alcaldía -----------------------------------------------------------
thr = {n: (g.n_60.quantile(q), g.dist_oferta_km.quantile(q)) for n, q in CORTES.items()}
a = g[g.b_tercil].copy()                                            # el tercil contiene a los otros dos (anidados)
a['robusta'] = np.where(a.b_quintil, 'en los 3 cortes', np.where(a.b_cuartil, 'tercil y cuartil', 'solo tercil'))
a['n60_sobre_umbral_cuartil'] = (a.n_60 / thr['cuartil'][0]).round(2)      # < 1.10 = pasa por poco
a['dist_sobre_umbral_cuartil_km'] = (a.dist_oferta_km - thr['cuartil'][1]).round(2)
a['pasa_por_poco_cuartil'] = a.b_cuartil & ((a.n60_sobre_umbral_cuartil < 1.10) | (a.dist_oferta_km < thr['cuartil'][1] * 1.10))
a['rango_en_alcaldia'] = a.groupby('alcaldia').n_60.rank(ascending=False, method='first').astype(int)
cols = ['CVEGEO', 'alcaldia', 'tipo', 'tipo_nombre', 'n_60', 'n_disc', 'pct_sinder', 'dist_oferta_km', 'n_oferta_2km', 'robusta',
        'n60_sobre_umbral_cuartil', 'dist_sobre_umbral_cuartil_km', 'pasa_por_poco_cuartil', 'rango_en_alcaldia']
a = a.sort_values(['robusta', 'n_60'], ascending=[False, False])[cols]
a['robusta'] = pd.Categorical(a.robusta, ['en los 3 cortes', 'tercil y cuartil', 'solo tercil'], ordered=True)
a = a.sort_values(['robusta', 'n_60'], ascending=[True, False])

# --- 5. Escribir y reportar --------------------------------------------------------------------------------------------
out.round(2).to_csv(RES / '24_prioridad_alcaldia.csv', encoding='utf-8-sig')
comb.to_csv(RES / '24_prioridad_combinaciones.csv', index=False, encoding='utf-8-sig')
a.to_csv(RES / '24_brecha_ageb.csv', index=False, encoding='utf-8-sig')

pd.set_option('display.width', 250, 'display.max_columns', 30)
print('Umbrales (n_60, km):', {k: (round(v[0], 1), round(v[1], 3)) for k, v in thr.items()})
print('AGEB con brecha por corte:', {n: int(g['b_' + n].sum()) for n in CORTES})
print(out[['N_cuartil', 'P_cuartil', 'etiqueta_referencia', 'etiqueta_modal', 'combinaciones_en_modal', 'estable', 'nivel_min', 'nivel_max',
           'orden_presentacion']].round(1).to_string())
print('\nAGEB (tercil):', len(a), '| robustas en los 3 cortes:', int((a.robusta == 'en los 3 cortes').sum()),
      '| cuartil que pasan por poco:', int(a.pasa_por_poco_cuartil.sum()), 'de', int(g.b_cuartil.sum()))
