"""Verificación de trazabilidad del Observatorio (2 nov 2026).

Recorre datos_observatorio.json y comprueba que cada cifra existe en algún archivo de Analysis/resultados, Analysis/outputs,
Analysis/matrices o DW/marts (con el mismo redondeo que muestra el JSON). Las cifras que NO aparecen en ningún archivo se listan
por bloque: son valores calculados dentro de build_datos.py (sumas, cocientes) o escritos a mano, y cada una necesita su archivo o
su fórmula documentada. Esto no demuestra que la cifra sea correcta: solo que se puede rastrear a un archivo.
Límite: un entero o un valor con un decimal coincide por azar con alguna columna de los CSV; por eso esas coincidencias se
cuentan aparte como DÉBILES y no cuentan como rastro. Solo las de 2 decimales o más se consideran rastro FUERTE. Sin doble revisión.

Uso (desde la raíz del repo):  python Frontend/observatorio/verificar_trazabilidad.py
Escribe Frontend/observatorio/trazabilidad_reporte.csv y termina con código 1 si hay bloques con cifras sin rastro y no
declarados en DERIVADOS (cifras calculadas a propósito en build_datos.py, con su justificación).
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

RAIZ = Path(__file__).resolve().parents[2]
JSON = RAIZ / 'Frontend/observatorio/datos_observatorio.json'
CARPETAS = ['Analysis/resultados', 'Analysis/outputs', 'Analysis/matrices', 'DW/marts']
EXCLUIR = {'diccionario', 'diccionario_fuente'}          # texto y metadatos, no cifras
# Bloques cuyas cifras se calculan a propósito en build_datos.py (cociente, suma, redondeo). Cada uno exige su justificación.
DERIVADOS = {}


def valores_csv():
    vs = []
    for c in CARPETAS:
        for f in (RAIZ / c).rglob('*.csv'):
            try:
                d = pd.read_csv(f, encoding='utf-8-sig', low_memory=False)
            except Exception:
                continue
            for col in d.columns:
                x = pd.to_numeric(d[col], errors='coerce').dropna().to_numpy(dtype=float)
                if x.size:
                    vs.append(x)
    return np.unique(np.concatenate(vs))


def decimales(v):
    s = repr(float(v))
    return len(s.split('.')[1].rstrip('0')) if '.' in s and 'e' not in s else 0


def hoja(o, ruta=''):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from hoja(v, f'{ruta}.{k}' if ruta else str(k))
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from hoja(v, f'{ruta}[{i}]')
    elif isinstance(o, (int, float)) and not isinstance(o, bool):
        yield ruta, float(o)


def main():
    D = json.loads(JSON.read_text(encoding='utf-8'))
    V = valores_csv()
    filas, fuerte, debil = [], 0, 0
    for ruta, v in hoja({k: x for k, x in D.items() if k not in EXCLUIR}):
        d = decimales(v)
        tol = 0.5 * 10 ** (-d) + 1e-9
        i = np.searchsorted(V, v - tol)
        ok = i < V.size and V[i] <= v + tol
        if ok and d >= 2:
            fuerte += 1
        elif ok:
            debil += 1
        else:
            filas.append({'bloque': ruta.split('.')[0].split('[')[0], 'ruta': ruta, 'valor': v})
    rep = pd.DataFrame(filas, columns=['bloque', 'ruta', 'valor'])
    rep.to_csv(RAIZ / 'Frontend/observatorio/trazabilidad_reporte.csv', index=False, encoding='utf-8-sig')
    print(f'cifras revisadas: {fuerte + debil + len(rep)} · rastro FUERTE (≥ 2 decimales): {fuerte} · '
          f'coincidencia DÉBIL (enteros o 1 decimal, no cuenta como rastro): {debil} · SIN rastro: {len(rep)}')
    if len(rep):
        r = rep.groupby('bloque').size().sort_values(ascending=False)
        print(r.to_string())
    pend = [b for b in rep.bloque.unique() if b not in DERIVADOS]
    if pend:
        print('\nBloques con cifras sin rastro y sin justificación en DERIVADOS:', ', '.join(sorted(pend)))
        sys.exit(1)


if __name__ == '__main__':
    main()
