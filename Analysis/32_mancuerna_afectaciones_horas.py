"""32 — Mancuerna: afectaciones declaradas por personas cuidadoras, <20 h vs >=40 h a la semana (ENASIC 2022).

Para qué existe: responder «¿qué afectaciones suben con más horas de cuidado?» comparando solo los extremos.
Entrada : resultados/31_afectaciones_por_horas.csv (dimension == 'Total', universo B). Ninguna cifra se teclea aquí.
Salida  : figuras/f35_mancuerna_afectaciones_horas.png
Lectura : autorreporte, nacional, sin causalidad. Línea punteada = diferencia cuyo IC90 incluye 0.
"""
from pathlib import Path
import sys
import pandas as pd
import matplotlib.pyplot as plt
sys.path.insert(0, str(Path(__file__).parent))
from estilo_graficas import estilo, AZUL, NARANJA, GRIS, TINTA, TENUE

BASE = Path(__file__).parent
d = pd.read_csv(BASE / 'resultados' / '31_afectaciones_por_horas.csv', encoding='utf-8-sig')
d = d[(d.dimension == 'Total') & (d.clave != 'salud3')]      # salud3 es un compuesto del modelo, no una afectación declarada
bajo = d[d.horas == '<20 h'].set_index('clave')
alto = d[d.horas == '>=40 h'].set_index('clave')
NOMBRES = {'cansado': 'Se siente cansado/a', 'sueno': 'Duerme menos', 'salud': 'Salud física deteriorada',
           'deprimido': 'Se siente deprimido/a', 'irritado': 'Se siente irritado/a',
           'terapia': 'Ha recibido terapia', 'enfermedad': 'Enfermedad nueva o agravada'}
t = pd.DataFrame({'a': bajo.pct, 'b': alto.pct, 'dif': alto.dif_pp, 'li': alto.dif_li90, 'ls': alto.dif_ls90,
                  'sig': alto.dif_significativa.astype(bool)}).sort_values('dif', ascending=True)   # más larga arriba

estilo()
fig, ax = plt.subplots(figsize=(9.6, 5.6))
for i, (k, r) in enumerate(t.iterrows()):
    ax.plot([r.a, r.b], [i, i], color=GRIS if r.sig else '#c9c7c0', lw=4 if r.sig else 2.5,
            ls='-' if r.sig else (0, (2, 2)), solid_capstyle='butt', zorder=1)
    ax.scatter(r.a, i, s=120, color=AZUL, zorder=3); ax.scatter(r.b, i, s=120, color=NARANJA, zorder=3)
    ax.text(r.a - 1.4, i, f'{r.a:.1f}', ha='right', va='center', fontsize=9, color=TINTA)
    ax.text(r.b + 1.4, i, f'{r.b:.1f}', ha='left', va='center', fontsize=9, color=TINTA)
    ax.text(63.5, i, f'+{r.dif:.1f} pp' + ('' if r.sig else '  *'), ha='left', va='center', fontsize=9.5,
            fontweight='bold' if r.sig else 'normal', color=TINTA if r.sig else TENUE)
    ax.text(63.5, i - 0.30, f'IC90 [{r.li:.1f}; {r.ls:.1f}]', ha='left', va='center', fontsize=7.5, color=TENUE)
ax.set_yticks(range(len(t))); ax.set_yticklabels([NOMBRES[k] for k in t.index], fontsize=10)
ax.set_xlim(0, 63.5); ax.set_ylim(-0.7, len(t) - 0.3); ax.set_xticks(range(0, 61, 10)); ax.set_xticklabels([f'{v}%' for v in range(0, 61, 10)])
ax.grid(axis='y', visible=False); ax.tick_params(axis='y', length=0)
ax.text(63.5, len(t) - 0.35, 'Diferencia', fontsize=8.5, color=TENUE, fontweight='bold', va='bottom')
ax.scatter([], [], s=90, color=AZUL, label='Menos de 20 h/semana'); ax.scatter([], [], s=90, color=NARANJA, label='40 h/semana o más')
ax.legend(loc='lower right', bbox_to_anchor=(0.995, 0.0), fontsize=9, handletextpad=0.2)
fig.suptitle('¿Qué afectaciones suben con más horas de cuidado?', x=0.01, ha='left', fontsize=14, fontweight='bold')
top3 = t.sort_values('dif', ascending=False).head(3).dif
ns = ' y '.join(NOMBRES[k].lower().split(' (')[0] for k in t[~t.sig].index)
fig.text(0.01, 0.915, f'Las tres que más suben lo hacen entre {top3.min():.0f} y {top3.max():.0f} puntos; en {len(t[~t.sig])} la diferencia no se distingue de cero.',
         fontsize=9.5, color=TENUE, ha='left')
fig.tight_layout(rect=(0, 0.11, 1, 0.9))
fig.text(0.01, 0.01, f'Personas cuidadoras de alguien con discapacidad o de 60+ (universo B), % que declara la afectación por el cuidado que da. n = {int(bajo.n_muestra_dominio.iloc[0])} (<20 h) y {int(alto.n_muestra_dominio.iloc[0])} (40 h o más).\n'
         '* Diferencia con IC90 que incluye 0 (línea punteada). Autorreporte, no diagnóstico ni causalidad. Nacional: no aplica a CDMX ni a alcaldías.\n'
         'Fuente: INEGI, ENASIC 2022, TPOB_CUI (P6.11/P6.30, horas = P6.7 + P6.26); cálculo propio en resultados/31_afectaciones_por_horas.csv.',
         fontsize=7.5, color=TENUE, ha='left', va='bottom')
out = BASE / 'figuras' / 'f35_mancuerna_afectaciones_horas.png'
fig.savefig(out, dpi=200); print('ok', out)
print(t.round(1).to_string())
