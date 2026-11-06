"""25 - Prueba: ¿un índice con pesos cambia lo que dice la regla sin pesos del script 24?

Decisión que informa: «¿En qué orden atender las zonas?» (Observatorio, Método). Pregunta de Omar (26 oct 2026):
¿conviene sustituir la regla sin pesos por un índice ponderado de volumen (N) y concentración (P)?

Se construyó el índice  w·N' + (1−w)·P'  y se movieron las decisiones que los datos no resuelven:
  - peso del volumen w = 0.3, 0.4, 0.5, 0.6, 0.7
  - forma de normalizar N y P: mín-máx, puntaje z, percentil (rango) y logaritmo + mín-máx
  - corte de brecha: tercil, cuartil, quintil
  = 60 configuraciones para los rangos; 84 (w de 0.2 a 0.8) para los conjuntos de cabeza con K = 4, 5, 6.
No hay variable de resultado observada, así que no hay forma de escoger el peso «correcto» contra los datos.

Lee:     resultados/24_prioridad_alcaldia.csv
Escribe: resultados/25_indice_con_pesos_rangos.csv, resultados/25_indice_con_pesos_cabezas.csv
Ejecutar desde Analysis/. Historial: 26 oct 2026 - versión inicial. Sin doble revisión.
"""
from itertools import product
from pathlib import Path

import numpy as np
import pandas as pd

RES = Path('resultados')
CORTES = ('tercil', 'cuartil', 'quintil')
NORMAS = ('minmax', 'z', 'rank', 'log')
W_RANGO = (0.3, 0.4, 0.5, 0.6, 0.7)
W_CABEZA = tuple(np.round(np.arange(0.2, 0.81, 0.1), 1))
KS = (4, 5, 6)

a = pd.read_csv(RES / '24_prioridad_alcaldia.csv', encoding='utf-8-sig').set_index('alcaldia')
assert len(a) == 16


def norm(x, how):
    x = x.astype(float)
    if how == 'minmax':
        return (x - x.min()) / (x.max() - x.min())
    if how == 'z':
        return (x - x.mean()) / x.std()
    if how == 'rank':
        return x.rank(pct=True)
    l = np.log1p(x)
    return (l - l.min()) / (l.max() - l.min())


def indice(c, how, w):
    return w * norm(a['N_' + c], how) + (1 - w) * norm(a['P_' + c], how)


# 1. Rango de cada alcaldía
rangos = {al: [] for al in a.index}
for c, how, w in product(CORTES, NORMAS, W_RANGO):
    r = indice(c, how, w).rank(ascending=False, method='min')
    for al in a.index:
        rangos[al].append(r[al])
out = pd.DataFrame({
    'configuraciones': len(next(iter(rangos.values()))),
    'rango_min': {al: min(v) for al, v in rangos.items()},
    'rango_mediana': {al: float(np.median(v)) for al, v in rangos.items()},
    'rango_max': {al: max(v) for al, v in rangos.items()},
    'veces_primera': {al: int(sum(x == 1 for x in v)) for al, v in rangos.items()},
    'veces_en_5_primeras': {al: int(sum(x <= 5 for x in v)) for al, v in rangos.items()},
}).sort_values('rango_mediana')
out.index.name = 'alcaldia'
out.to_csv(RES / '25_indice_con_pesos_rangos.csv', encoding='utf-8-sig')

# 2. Conjuntos de cabeza y relación con la regla (N o P entre las K primeras)
filas, fuera_de_la_regla = [], 0
for K in KS:
    conjuntos = {}
    for c, how, w in product(CORTES, NORMAS, W_CABEZA):
        top = frozenset(indice(c, how, w).sort_values(ascending=False).index[:K])
        conjuntos[top] = conjuntos.get(top, 0) + 1
        N, P = a['N_' + c], a['P_' + c]
        union = set(N[N.rank(ascending=False, method='min') <= K].index) | set(P[P.rank(ascending=False, method='min') <= K].index)
        fuera_de_la_regla += len(top - union)
    filas.append({'K': K, 'configuraciones': sum(conjuntos.values()), 'conjuntos_distintos': len(conjuntos),
                  'mas_frecuente_veces': max(conjuntos.values())})
pd.DataFrame(filas).assign(alcaldias_fuera_de_N_o_P_total=fuera_de_la_regla).to_csv(
    RES / '25_indice_con_pesos_cabezas.csv', index=False, encoding='utf-8-sig')

print(out.to_string())
print(pd.DataFrame(filas).to_string(index=False))
print('Alcaldías que el índice mete en la cabeza y que la regla no marca (N o P):', fuera_de_la_regla)
