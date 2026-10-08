"""Estilo común de las gráficas de los notebooks de Analysis/ (Observatorio del Cuidado).

Paleta categórica en orden fijo (validada para daltonismo con el validador de paletas del equipo de diseño):
azul, naranja, aqua, amarillo. Gris para referencias (universo, totales). Las estimaciones con precisión
baja (CV >= 30%) se dibujan rayadas y sin relleno: se ven, pero no se leen como hallazgo.
"""
import matplotlib.pyplot as plt
import matplotlib as mpl

AZUL, NARANJA, AQUA, AMARILLO = '#2a78d6', '#eb6834', '#1baf7a', '#eda100'
GRIS, TINTA, TENUE, REJILLA = '#a8a69e', '#2b2b2b', '#6b6a65', '#e6e5e0'
CAT = [AZUL, NARANJA, AQUA, AMARILLO]


def estilo():
    mpl.rcParams.update({
        'figure.dpi': 110, 'figure.facecolor': 'white', 'axes.facecolor': 'white',
        'font.size': 10, 'axes.titlesize': 12, 'axes.titleweight': 'bold', 'axes.titlelocation': 'left',
        'axes.labelcolor': TENUE, 'axes.edgecolor': '#bdbbb4', 'xtick.color': TENUE, 'ytick.color': TENUE,
        'axes.spines.top': False, 'axes.spines.right': False,
        'axes.grid': True, 'grid.color': REJILLA, 'grid.linewidth': .8, 'axes.axisbelow': True,
        'legend.frameon': False, 'text.color': TINTA,
    })


def debil(precision):
    """True si la estimación no debe leerse como hallazgo (precisión baja o no estimable)."""
    return str(precision).startswith('baja') or str(precision).startswith('no estimable')


def marcar_debiles(barras, precisiones, color):
    """Rayado para las barras con precisión baja."""
    for b, p in zip(barras, precisiones):
        if debil(p):
            b.set_facecolor('white'); b.set_edgecolor(color); b.set_hatch('////'); b.set_linewidth(1)


def etiquetas(ax, barras, valores, fmt='{:.1f}', horizontal=False, dx=0.6, color=TINTA, size=9):
    """Etiqueta directa al final de cada barra (texto en tinta, no en el color de la serie)."""
    for b, v in zip(barras, valores):
        if v != v:   # NaN
            continue
        if horizontal:
            ax.text(b.get_width() + dx, b.get_y() + b.get_height() / 2, fmt.format(v), va='center', fontsize=size, color=color)
        else:
            ax.text(b.get_x() + b.get_width() / 2, b.get_height() + dx, fmt.format(v), ha='center', va='bottom', fontsize=size, color=color)


def nota(fig, texto):
    """Fuente y advertencia al pie de la figura."""
    fig.tight_layout()
    alto = fig.get_size_inches()[1]
    fig.subplots_adjust(bottom=fig.subplotpars.bottom + 0.32 / alto)
    fig.text(0.01, 0.01, texto, fontsize=8, color=TENUE, ha='left', va='bottom', wrap=True)
