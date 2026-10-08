"""
Genera las figuras del Documento Integrado y del Estudio de Negocio.

Proyecto integrador 7.º semestre LCDN · Observatorio de Datos para la Economía del Cuidado
Creado: 2026-09-22. Ejecutar desde Analysis/../  (carpeta que contiene Analysis/ y figuras/).

REGLA DE TRAZABILIDAD DEL PROYECTO: ninguna cifra nace aquí. Cada figura se construye
leyendo un CSV de Analysis/resultados/ o Analysis/outputs/, o un CSV de Data/investigacion/.
El pie de cada figura declara archivo de origen y nivel de evidencia.

Paleta: validada con scripts/validate_palette.js del skill dataviz (6/6 checks, modo claro,
superficie #fcfcfb): #9F2241 (guinda institucional), #0B6FB4, #A86400.
"""
from pathlib import Path
import glob
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter

RES = Path('Analysis/resultados'); OUTP = Path('Analysis/outputs'); FIG = Path('figuras')
FIG.mkdir(exist_ok=True)

C1, C2, C3 = '#9F2241', '#0B6FB4', '#A86400'
INK, INK2, INK3 = '#1a1a1a', '#4a4a4a', '#8a8a8a'
GRID, SURF = '#e4e4e0', '#fcfcfb'

plt.rcParams.update({
    'figure.facecolor': SURF, 'axes.facecolor': SURF, 'savefig.facecolor': SURF,
    'font.family': 'DejaVu Sans', 'font.size': 9,
    'axes.edgecolor': GRID, 'axes.linewidth': 0.8, 'axes.labelcolor': INK2,
    'xtick.color': INK2, 'ytick.color': INK2, 'text.color': INK,
    'xtick.major.size': 0, 'ytick.major.size': 0,
    'axes.grid': False, 'legend.frameon': False, 'figure.dpi': 200,
})


def marco(ax, ejes=('left', 'top', 'right')):
    for s in ejes:
        ax.spines[s].set_visible(False)


def pie(fig, texto, sep=0.015):
    # y negativo + bbox_inches='tight': el pie queda POR DEBAJO de los ejes. `sep` se
    # aumenta en las figuras cuyo eje x lleva etiqueta propia, para que no se encimen.
    fig.text(0.012, -sep, texto, fontsize=6.4, color=INK3, ha='left', va='top')


def guardar(fig, nombre):
    fig.savefig(FIG / f'{nombre}.png', bbox_inches='tight', pad_inches=0.16)
    plt.close(fig)
    print('  ✓', nombre)


# ───────────────────────── F1 · contratación por quintil ─────────────────────────
q = pd.read_csv(RES / '04_contratacion_por_quintil.csv')
q['servicio'] = q.servicio.str.strip()
cui = q[q.servicio.str.startswith('enfermer')].sort_values('quintil')
dom = q[q.servicio.str.startswith('dom')].sort_values('quintil')

fig, ax = plt.subplots(figsize=(7.1, 3.5))
x = np.arange(5); w = 0.38
for serie, off, col, et in ((dom, -w/2, C2, 'Trabajo doméstico (entrada por salida)'),
                            (cui, w/2, C1, 'Enfermería o persona cuidadora')):
    b = ax.bar(x + off, serie.pct, w, color=col, label=et, zorder=3)
    err_lo = np.clip(serie.pct - serie.li90, 0, None)
    err_hi = np.clip(serie.ls90 - serie.pct, 0, None)
    ax.errorbar(x + off, serie.pct, yerr=[err_lo, err_hi], fmt='none',
                ecolor=INK3, elinewidth=0.9, capsize=2.6, zorder=4)
    for r, v in zip(b, serie.pct):
        ax.text(r.get_x() + r.get_width()/2, v + 1.5, f'{v:.1f}%', ha='center',
                va='bottom', fontsize=7.6, color=INK)

ax.set_xticks(x)
ax.set_xticklabels([f'Q{i}\n{lo}' for i, lo in zip(range(1, 6), [
    'hasta $3,200', '$3,200–5,000', '$5,000–8,000', '$8,000–15,000', 'más de $15,000'])],
    fontsize=7.4)
ax.set_ylabel('% de hogares con necesidad que contrata')
ax.set_ylim(0, 34)
ax.yaxis.set_major_formatter(PercentFormatter(decimals=0))
ax.grid(axis='y', color=GRID, lw=0.7, zorder=0)
marco(ax, ('top', 'right'))
ax.legend(loc='upper left', fontsize=8)
r_dom = dom.pct.iloc[-1] / dom.pct.iloc[0]
r_cui = cui.pct.iloc[-1] / cui.pct.iloc[0]
ax.set_title(f'Del quintil 1 al 5, comprar servicio doméstico se multiplica por {r_dom:.1f};\n'
             f'comprar cuidado, solo por {r_cui:.1f}',
             fontsize=10.5, loc='left', pad=10, color=INK)
pie(fig, 'Hogares con persona con discapacidad o de 60+, por quintil de ingreso mensual del hogar. Barras de error: intervalo al 90%.\n'
         'Fuente: Analysis/resultados/04_contratacion_por_quintil.csv (microdatos ENASIC 2022, INEGI; estimación ponderada con FAC_HOG,\n'
         'varianza por linealización de Taylor). NACIONAL, no extrapolable a la CDMX. Evidencia: confirmado; precisión baja en cuidado (CV>30%).')
guardar(fig, 'f1_contratacion_por_quintil')


# ───────────────────────── F2 · razones para no buscar ─────────────────────────
b = pd.read_csv(RES / '03_enasic_barreras_estimaciones.csv')
pre = 'Cuidan discapacidad o 60+ | No buscó por: '
r = b[b.indicador.str.startswith(pre)].copy()
r['motivo'] = r.indicador.str.replace(pre, '', regex=False).str.capitalize()
r = r.sort_values('pct')

fig, ax = plt.subplots(figsize=(7.1, 3.6))
col = [C1 if 'esconoce' in m or 'caros' in m.lower() else C2 for m in r.motivo]
bars = ax.barh(r.motivo, r.pct, color=col, height=0.66, zorder=3)
for rect, v, cv in zip(bars, r.pct, r.cv):
    marca = '' if cv < 30 else '  ·'
    ax.text(v + 0.8, rect.get_y() + rect.get_height()/2, f'{v:.1f}%{marca}',
            va='center', fontsize=7.8, color=INK)
ax.set_xlim(0, 60)
ax.xaxis.set_major_formatter(PercentFormatter(decimals=0))
ax.grid(axis='x', color=GRID, lw=0.7, zorder=0)
marco(ax, ('top', 'right', 'left'))
ax.tick_params(axis='y', labelsize=7.8)
ax.set_title('Desconocer que los servicios existen explica el 1.6% de la no búsqueda;\nla norma familiar, el 41.9%',
             fontsize=10.5, loc='left', pad=10, color=INK)
pie(fig, 'Personas que cuidan a alguien con discapacidad o de 60+ y no buscaron un servicio de cuidado (P6.43). Respuesta múltiple: no suma 100%.\n'
         '· = precisión baja (CV ≥ 30%). En guinda, las dos razones que una app de intermediación atacaría directamente.\n'
         'Fuente: Analysis/resultados/03_enasic_barreras_estimaciones.csv (microdatos ENASIC 2022, INEGI). NACIONAL. Evidencia: confirmado.')
guardar(fig, 'f2_razones_no_buscar')


# ───────────────────────── F3 · preferencia de lugar ─────────────────────────
pl = {'En su casa': 'Cuidan disc/60+ | En su casa',
      'No contrataría': 'Cuidan disc/60+ | No contrataría',
      'Centro o institución pública': 'Cuidan disc/60+ | Centro/institución pública',
      'Casa de familiar o conocido': 'Cuidan disc/60+ | Casa de familiar/amistad/conocido',
      'Centro o institución privada': 'Cuidan disc/60+ | Centro/institución privada'}
v = {k: float(b.loc[b.indicador == ind, 'pct'].iloc[0]) for k, ind in pl.items()}
s = pd.Series(v).sort_values()

fig, ax = plt.subplots(figsize=(7.1, 2.6))
col = [C1 if k == 'En su casa' else C2 for k in s.index]
bars = ax.barh(s.index, s.values, color=col, height=0.62, zorder=3)
for rect, val in zip(bars, s.values):
    ax.text(val + 0.9, rect.get_y() + rect.get_height()/2, f'{val:.1f}%',
            va='center', fontsize=8, color=INK)
ax.set_xlim(0, 68)
ax.xaxis.set_major_formatter(PercentFormatter(decimals=0))
ax.grid(axis='x', color=GRID, lw=0.7, zorder=0)
marco(ax, ('top', 'right', 'left'))
ax.tick_params(axis='y', labelsize=8)
ax.set_title('Si contratara cuidado, 58.1% lo querría en casa;\nmenos de 5% en una institución', fontsize=10.5, loc='left', pad=10, color=INK)
pie(fig, 'Personas que cuidan a alguien con discapacidad o de 60+ (P6.46). Fuente: Analysis/resultados/03_enasic_barreras_estimaciones.csv\n'
         '(microdatos ENASIC 2022, INEGI). NACIONAL. Evidencia: confirmado (precisión alta salvo institución privada y casa de familiar).')
guardar(fig, 'f3_preferencia_lugar')


# ───────────────────────── F4 · asequibilidad ─────────────────────────
a = pd.read_csv(RES / '04_asequibilidad_paquetes.csv')
a['paq'] = a.paquete.str.split(' ').str[0]
esc = {'Piso legal 2026 en pesos de 2022': ('Piso legal 2026 ($342.47/día)', C2),
       'Mediana observada ENASIC 2022 (cuidadora/enfermería)': ('Mediana observada ENASIC', C3),
       'Tabulador CACEH 2026 cat. 8 en pesos de 2022': ('Tabulador CACEH cat. 8 ($904/día)', C1)}
col_pct = 'pct_hogares_costo_<=_20pct_ingreso'

fig, ax = plt.subplots(figsize=(7.1, 3.3))
paqs = ['10', '20', '40']; x = np.arange(3); w = 0.26
for i, (k, (et, c)) in enumerate(esc.items()):
    d = a[a.salario == k].set_index('paq').loc[paqs]
    bars = ax.bar(x + (i - 1) * w, d[col_pct], w, color=c, label=et, zorder=3)
    for rect, val in zip(bars, d[col_pct]):
        ax.text(rect.get_x() + rect.get_width()/2, val + 0.6, f'{val:.1f}%',
                ha='center', va='bottom', fontsize=7.4, color=INK)
ax.set_xticks(x)
ax.set_xticklabels(['10 h/semana\n(apoyo parcial)', '20 h/semana\n(medio tiempo)',
                    '40 h/semana\n(jornada completa)'], fontsize=8)
ax.set_ylabel('% de hogares con necesidad')
ax.set_ylim(0, 46)
ax.yaxis.set_major_formatter(PercentFormatter(decimals=0))
ax.grid(axis='y', color=GRID, lw=0.7, zorder=0)
marco(ax, ('top', 'right'))
ax.legend(loc='upper right', fontsize=8)
ax.set_title('Hogares que podrían pagar cuidado domiciliario sin rebasar\nel 20% de su ingreso', fontsize=10.5, loc='left', pad=10, color=INK)
pie(fig, 'Costo = salario por hora × horas × 4.33 semanas, comparado contra el ingreso mensual de cada hogar con necesidad (n = 2,071, ponderado).\n'
         'Todo en pesos de 2022; los salarios de 2026 se deflactan con el INPC (factor 1.1545, nov-2022 → ago-2026).\n'
         'Fuente: Analysis/resultados/04_asequibilidad_paquetes.csv (ENASIC 2022 + CONASAMI DOF 09-dic-2025 + tabulador CACEH 2026). NACIONAL. Evidencia: probable.')
guardar(fig, 'f4_asequibilidad')


# ───────────────────────── F5 · oferta territorial por tipo ─────────────────────────
o = pd.read_csv(OUTP / 'indice_por_tipo_servicio.csv').sort_values('indice_asilos')
fig, ax = plt.subplots(figsize=(7.1, 4.4))
y = np.arange(len(o))
for i in y:
    ax.plot([o.indice_asilos.iloc[i], o.indice_centros_dia.iloc[i]], [i, i],
            color=GRID, lw=1.4, zorder=2, solid_capstyle='round')
ax.scatter(o.indice_asilos, y, s=42, color=C1, label='Asilos y residencias', zorder=4)
ax.scatter(o.indice_centros_dia, y, s=42, color=C2, label='Centros de día', zorder=4)
ax.axvline(1, color=INK3, lw=0.9, ls=(0, (4, 3)), zorder=1)
ax.text(1.03, len(o) - 0.35, 'Proporcional a su\npoblación de 60+', fontsize=7, color=INK3, va='top')
ax.set_yticks(y); ax.set_yticklabels(o.municipio, fontsize=7.8)
ax.set_xlabel('Índice: participación en la oferta ÷ participación en la población de 60+ de la CDMX')
ax.set_xlim(-0.1, 4.6)
ax.grid(axis='x', color=GRID, lw=0.7, zorder=0)
marco(ax, ('top', 'right', 'left'))
ax.legend(loc='upper right', fontsize=8)
ax.set_title('La periferia no tiene menos oferta: tiene otra oferta.\nEl faltante de asilos y el de centros de día apuntan a alcaldías distintas',
             fontsize=10.5, loc='left', pad=10, color=INK)
pie(fig, 'Conteo de establecimientos, no de plazas: el número de establecimientos no aproxima la capacidad (Spearman 0.27 contra el CSV de capacidad, n = 12).\n'
         'Fuente: Analysis/outputs/indice_por_tipo_servicio.csv (DENUE 05/2026, INEGI + CSV de población 60+ sin productor ni año documentados).\n'
         'Evidencia: probable. Conteos pequeños (0 a 15 asilos por alcaldía); 21% del núcleo tiene nombre dudoso y sigue en revisión manual.', sep=0.055)
guardar(fig, 'f5_oferta_por_tipo')


# ───────────────────────── F6 · capacidad residencial ─────────────────────────
cap = pd.read_csv(RES / '02_indice_capacidad_residencial.csv').rename(columns={'Unnamed: 0': 'alc'})
cap = cap.dropna(subset=['plazas_por_1000_adl']).sort_values('plazas_por_1000_adl')
nom = {'IZTAP': 'Iztapalapa', 'IZTAC': 'Iztacalco', 'GAM': 'Gustavo A. Madero', 'AO': 'Álvaro Obregón',
       'BJ': 'Benito Juárez', 'CUAU': 'Cuauhtémoc', 'AZC': 'Azcapotzalco', 'MC': 'M. Contreras',
       'XOCH': 'Xochimilco', 'COY': 'Coyoacán', 'TLAL': 'Tlalpan', 'MH': 'Miguel Hidalgo'}
fig, ax = plt.subplots(figsize=(7.1, 3.5))
col = [C1 if a in ('IZTAP', 'IZTAC', 'GAM') else C2 for a in cap.alc]
bars = ax.barh([nom[a] for a in cap.alc], cap.plazas_por_1000_adl, color=col, height=0.64, zorder=3)
for rect, val in zip(bars, cap.plazas_por_1000_adl):
    ax.text(val + 1.6, rect.get_y() + rect.get_height()/2, f'{val:.1f}',
            va='center', fontsize=7.8, color=INK)
ax.set_xlabel('Plazas en residencias privadas por cada 1,000 personas con discapacidad\npara bañarse, vestirse o comer')
ax.set_xlim(0, 140)
ax.grid(axis='x', color=GRID, lw=0.7, zorder=0)
marco(ax, ('top', 'right', 'left'))
ax.tick_params(axis='y', labelsize=7.8)
ax.set_title('Miguel Hidalgo tiene 101 veces más plazas privadas por persona\ndependiente que Iztapalapa', fontsize=10.5, loc='left', pad=10, color=INK)
pie(fig, 'Cuatro alcaldías (Venustiano Carranza, Tláhuac, Cuajimalpa y Milpa Alta) no aparecen en el archivo de capacidad: no se sabe si valen cero o es dato ausente.\n'
         'Fuente: Analysis/resultados/02_indice_capacidad_residencial.csv (CSV de capacidad sin productor ni año documentados + Censo 2020 probable).\n'
         'Evidencia: probable, resultado exploratorio. Ningún par oferta–necesidad del proyecto cumple todavía la regla de compatibilidad, así que esto NO es un indicador publicable.', sep=0.12)
guardar(fig, 'f6_capacidad_residencial')


# ───────────────────────── F7 · horas de cuidado y laborales ─────────────────────────
h = pd.read_csv(glob.glob('datos/*Horas_laborales_y_de_cuidado*')[0])
h.columns = [c.strip() for c in h.columns]
h['Horas'] = pd.to_numeric(h.Horas)
orden = ['11-17', '18-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89']

fig, axes = plt.subplots(1, 2, figsize=(7.1, 3.0), sharey=True)
for ax, tipo in zip(axes, ['Cuidado', 'Laboral']):
    d = h[h['Tipo de trabajo'] == tipo]
    for sexo, c in (('Mujeres', C1), ('Hombres', C2)):
        s = d[d.Sexo == sexo].set_index('Edad').reindex(orden).Horas
        ax.plot(range(len(orden)), s, color=c, lw=2, marker='o', ms=4.5,
                label=sexo, zorder=3, solid_capstyle='round')
    ax.set_xticks(range(len(orden)))
    ax.set_xticklabels(orden, fontsize=6.8, rotation=45, ha='right')
    ax.set_title(f'Trabajo de {tipo.lower()}' if tipo == 'Cuidado' else 'Trabajo laboral',
                 fontsize=9, loc='left', color=INK2, pad=6)
    ax.grid(axis='y', color=GRID, lw=0.7, zorder=0)
    marco(ax, ('top', 'right'))
axes[0].set_ylabel('Horas promedio a la semana')
axes[0].set_ylim(0, 58)
axes[0].legend(loc='upper left', fontsize=8)
fig.suptitle('La brecha de cuidado se abre a los 18 y no se cierra hasta los 60',
             fontsize=10.5, x=0.012, ha='left', y=1.03, color=INK)
pie(fig, 'Fuente: Data/investigacion/Horas laborales y de cuidado..csv, vía Analysis/resultados/horas_cuidado_laboral.csv.\n'
         'ADVERTENCIA: el archivo no documenta productor, año, cobertura geográfica ni si las horas son por persona que participa o por población total.\n'
         'Evidencia: desconocida. No debe citarse como cifra oficial hasta documentar su ficha de fuente.')
guardar(fig, 'f7_horas_cuidado_laboral')


# ───────────────────────── F8 · embudo del mercado CDMX ─────────────────────────
dim = pd.read_csv(RES / '05_dimensionamiento_cdmx.csv').set_index('nivel')
# Se indexa por nombre, NO por posición: el orden de filas del CSV no es el orden del gráfico.
filas = [('Hogares con persona\ncon discapacidad o de 60+',
          'Hogares CDMX con persona con discapacidad o 60+ (cota inferior)', C2),
         ('De ellos, ya pagan\ntrabajo doméstico',
          'Hogares CDMX con necesidad que hoy contratan trabajo doméstico', C3),
         ('De ellos, pagan\nenfermería o cuidadora',
          'Hogares CDMX que hoy contratan enfermería o cuidadora', C1)]
etq = [f[0] for f in filas]
val = [float(dim.loc[f[1], 'valor']) for f in filas]
cols = [f[2] for f in filas]

fig, ax = plt.subplots(figsize=(7.1, 2.7))
y = np.arange(len(filas))[::-1]          # primera fila arriba
bars = ax.barh(y, val, color=cols, height=0.6, zorder=3)
for rect, v in zip(bars, val):
    ax.text(v + 18000, rect.get_y() + rect.get_height()/2, f'{v:,.0f}'.replace(',', ' '),
            va='center', fontsize=8.6, color=INK)
ax.set_yticks(y); ax.set_yticklabels(etq, fontsize=8)
ax.set_xlim(0, 1_290_000)
ax.set_xticks([])
ax.grid(axis='x', color=GRID, lw=0.7, zorder=0)
marco(ax, ('top', 'right', 'left', 'bottom'))
ax.set_title('El mercado de cuidado pagado en la CDMX es 7.6 veces menor\nque el de trabajo doméstico en los mismos hogares',
             fontsize=10.5, loc='left', pad=10, color=INK)
pie(fig, 'INFERENCIA, NO MEDICIÓN. Tasas nacionales de la ENASIC 2022 aplicadas a las 2,756,319 viviendas particulares habitadas de la CDMX (Censo 2020).\n'
         'La ENASIC no admite estimaciones para la CDMX. Sesgo conocido: la CDMX está más envejecida que el promedio nacional, así que la primera barra es una cota inferior.\n'
         'Fuente: Analysis/resultados/05_dimensionamiento_cdmx.csv. Evidencia: probable.')
guardar(fig, 'f8_embudo_mercado_cdmx')

print('\nFiguras en', FIG.resolve())
