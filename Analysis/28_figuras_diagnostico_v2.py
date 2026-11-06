"""28 — Figuras del diagnóstico (script 26) y de la focalización v2 (script 27) para la presentación.

Lee solo resultados/26_diag_*.csv y resultados/27_v2_*.csv; no recalcula nada.
Escribe figuras/f32_horas_escalon.png, f33_escalera_reasignacion.png, f34_v2_regla_vs_modelos.png.
Nacional (ENASIC 2022). Sin revisión de otra persona.
"""
from pathlib import Path
import numpy as np, pandas as pd, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from estilo_graficas import estilo, AZUL, NARANJA, AQUA, AMARILLO, GRIS, TINTA, TENUE
AQUI = Path(__file__).resolve().parent; R = AQUI / 'resultados'; F = AQUI / 'figuras'
estilo(); plt.rcParams.update({'font.size': 12, 'axes.titlesize': 14})
lee = lambda n: pd.read_csv(R / n, encoding='utf-8-sig')

# f32: forma horas -> daño
h = lee('26_diag_horas_forma.csv'); h = h[h.n_muestra.notna()].copy()
et = ['0–6', '7–13', '14–20', '21–29', '30–39', '40–59', '60–97', '98+']
fig, ax = plt.subplots(figsize=(7.6, 5.0))
x = np.arange(len(h)); col = [AZUL if i < 5 else NARANJA for i in range(len(h))]
ax.bar(x, 100 * h.prev_dano, color=col, width=.68)
ax.errorbar(x, 100 * h.prev_dano, yerr=[100 * (h.prev_dano - h.li90), 100 * (h.ls90 - h.prev_dano)], fmt='none', ecolor=TINTA, capsize=3, lw=1)
for i, v in enumerate(100 * h.prev_dano): ax.text(i, 3, f'{v:.0f}', ha='center', color='white', fontsize=11, fontweight='bold')
ax.axvline(4.5, color=TENUE, ls='--', lw=1); ax.text(4.55, 96, 'corte de 40 h', color=TENUE, fontsize=10)
ax.set_xticks(x, et); ax.set_xlabel('Horas de cuidado a la semana'); ax.set_ylabel('% que declara algún daño (IC 90 %)'); ax.set_ylim(0, 100)
ax.set_title('Debajo de 40 h el daño es plano; arriba salta')
fig.text(.01, .01, 'ENASIC 2022, nacional, n = 1,043. Fuente: resultados/26_diag_horas_forma.csv. Sin doble revisión.', fontsize=8.5, color=TENUE)
fig.tight_layout(rect=(0, .04, 1, 1)); fig.savefig(F / 'f32_horas_escalon.png', dpi=200); plt.close(fig)

# f33: escalera de información: AUC sube, pero el cupo se mueve del bloque 60+
e = lee('26_diag_escalera_informacion.csv')
lab = ['Regla ≥ 40 h', '+ forma horas', '+ tipo de cuidado', '+ carga observable', '+ sexo y edad', '+ autopercepción']
fig, (a1, a2) = plt.subplots(1, 2, figsize=(7.6, 5.0), sharey=True)
y = np.arange(len(e))[::-1]
a1.barh(y, e.auc_ponderado, color=AZUL, height=.6); a1.set_xlim(.5, .8); a1.set_title('AUC (sube)', fontsize=12)
for yy, v in zip(y, e.auc_ponderado): a1.text(v + .005, yy, f'{v:.2f}', va='center', fontsize=10)
a2.barh(y, 100 * e.pct_seleccionado_bloque_solo60, color=NARANJA, height=.6); a2.set_xlim(0, 45)
a2.set_title('% del bloque «solo 60+»\nque entra al cupo (baja)', fontsize=12)
for yy, v in zip(y, 100 * e.pct_seleccionado_bloque_solo60): a2.text(v + .8, yy, f'{v:.0f} %', va='center', fontsize=10)
a1.set_yticks(y, lab)
fig.suptitle('El modelo mejora el AUC quitándole cupo a quien cuida a 60+', x=.01, ha='left', fontweight='bold', fontsize=14)
fig.text(.01, .01, f'Cobertura total al mismo cupo: {100*e.cobertura.iloc[0]:.1f} % (regla) → {100*e.cobertura.iloc[-1]:.1f} % (completo). '
         'Fuente: resultados/26_diag_escalera_informacion.csv.', fontsize=8.5, color=TENUE)
fig.tight_layout(rect=(0, .04, 1, .95)); fig.savefig(F / 'f33_escalera_reasignacion.png', dpi=200); plt.close(fig)

# f34: v2, diferencia de cobertura contra la regla con IC 90 y Δ
g = lee('27_v2_global.csv')
filas = [('PRIMARIO', 'Logística', 'Logística (primario)'), ('PRIMARIO', 'Tarjeta de puntos', 'Tarjeta de puntos (primario)'),
         ('Sens. A', 'Logística', '+ autopercepción'), ('Sens. B', 'Logística', 'Solo discapacidad + ABVD/clínicas'),
         ('Sens. B', 'R2 a priori (>=40 h + >=2 ABVD)', 'R2 a priori (solo discapacidad)'), ('Sens. objetivo', 'Logística', 'Objetivo v1: algún daño')]
fig, ax = plt.subplots(figsize=(10, 4.1))
for i, (cfg, p, nombre) in enumerate(filas):
    r = g[g.configuracion.str.startswith(cfg) & (g.puntaje == p)].iloc[0]; yy = len(filas) - 1 - i
    c = AZUL if cfg == 'PRIMARIO' else GRIS
    ax.plot([r.dif_li90, r.dif_ls90], [yy, yy], color=c, lw=3, solid_capstyle='round'); ax.plot(r.dif_vs_comparador_pp, yy, 'o', color=c, ms=9)
    ax.text(15.3, yy, f'{r.dif_vs_comparador_pp:+.1f} pp ({r.dif_li90:+.1f} a {r.dif_ls90:+.1f})', va='center', fontsize=10.5, color=TINTA)
    ax.text(-8.8, yy, nombre, va='center', ha='right', fontsize=11, color=TINTA)
ax.axvline(0, color=TINTA, lw=1); ax.axvline(5, color=AMARILLO, lw=2, ls='--'); ax.text(5.2, len(filas) - .45, 'Δ = 5 pp', color='#a87200', fontsize=10.5)
ax.set_xlim(-8.5, 15); ax.set_yticks([]); ax.set_ylim(-.6, len(filas) - .2)
ax.set_xlabel('Diferencia de cobertura contra la regla ≥ 40 h (pp, IC 90 %), con la cuota fija entre bloques')
ax.set_title('Ninguna versión supera a la regla de forma concluyente', x=-.33)
fig.text(.01, .01, 'Preregistro del 1 nov 2026; objetivo: salud física, cansancio o sueño; cupo 40.7 %. Fuente: resultados/27_v2_global.csv. Sin doble revisión.', fontsize=8.5, color=TENUE)
fig.tight_layout(rect=(0, .05, .9, 1)); fig.subplots_adjust(left=.3); fig.savefig(F / 'f34_v2_regla_vs_modelos.png', dpi=200); plt.close(fig)
print('ok')
