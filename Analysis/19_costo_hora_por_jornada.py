"""Sección 19 · Costo de la hora de relevo según el tipo de jornada (13 oct 2026).

Para qué existe: el Observatorio («¿Cuánto cuesta?») y la app calculan el relevo como hora diurna.
Según la LFT, la jornada nocturna y la mixta duran menos horas con el mismo salario diario, así que
la hora ordinaria es más cara. Este script hace visible esa diferencia con la misma regla del script 15
(anuncios) y la misma conversión mensual del script 10 (4.33 semanas por mes).

Qué SÍ permite afirmar: cuánto cuesta, al piso legal y sin prestaciones, una hora ordinaria y un paquete
de relevo de 3 a 12 h/semana en cada tipo de jornada.
Qué NO permite afirmar: el costo real total (faltan aguinaldo, vacaciones, prima, séptimo día, IMSS e
Infonavit), ni cuántos hogares pueden pagarlo (eso lo rehace el script 10 cuando se tenga el factor de
prestaciones), ni nada sobre horas extra.

Supuestos y estado de evidencia:
- Salario mínimo profesional de personas trabajadoras del hogar 2026: $342.47 por día, zona general
  (CONASAMI, DOF 09-dic-2025; registrado en la bitácora del 22 sept 2026). Confirmado por el equipo.
- Jornada diurna (06:00-20:00) máx. 8 h; nocturna (20:00-06:00) máx. 7 h; mixta máx. 7.5 h
  (LFT, arts. 60 y 61). PENDIENTE de verificar texto y vigencia en el DOF y su aplicación al trabajo
  del hogar (art. 333) — revisión legal: Daniel. Hasta entonces, evidencia = probable.
- Hora ordinaria = salario diario / horas máximas de la jornada (mismo criterio que el script 15).

Salida: resultados/19_costo_hora_por_jornada.csv
Uso:    python Analysis/19_costo_hora_por_jornada.py   (desde la raíz del repo)
"""
from pathlib import Path
import pandas as pd

AQUI = Path(__file__).resolve().parent
SALIDA = AQUI / 'resultados' / '19_costo_hora_por_jornada.csv'

SALARIO_DIARIO = 342.47        # CONASAMI, DOF 09-dic-2025
SEMANAS_MES = 4.33             # igual que el script 10
PAQUETES = [3, 6, 9, 12]       # h/semana, igual que el script 10

JORNADAS = [
    # tipo, horario, horas máximas por jornada
    ('Diurna', '06:00 a 20:00', 8.0),
    ('Mixta', 'abarca ambos periodos, con menos de 3.5 h nocturnas', 7.5),
    ('Nocturna', '20:00 a 06:00', 7.0),
]

filas = []
hora_diurna = SALARIO_DIARIO / 8.0
for tipo, horario, hmax in JORNADAS:
    hora = SALARIO_DIARIO / hmax
    for h in PAQUETES:
        filas.append({
            'jornada': tipo,
            'horario_lft': horario,
            'horas_max_jornada': hmax,
            'salario_diario_2026': SALARIO_DIARIO,
            'hora_ordinaria_2026': round(hora, 2),
            'dif_vs_diurna_pct': round(100 * (hora / hora_diurna - 1), 1),
            'paquete_horas_semana': h,
            'costo_mensual_2026': round(hora * h * SEMANAS_MES),
            'incluye_prestaciones': 'no',
            'evidencia': 'probable: arts. 60 y 61 LFT pendientes de verificar en el DOF (Daniel)',
        })

df = pd.DataFrame(filas)
SALIDA.parent.mkdir(exist_ok=True)
df.to_csv(SALIDA, index=False, encoding='utf-8-sig')

# Control: la fila diurna de 6 h debe coincidir con el script 10 ($1,112)
r10 = pd.read_csv(AQUI / 'resultados' / '10_asequibilidad_relevo.csv', encoding='utf-8-sig')
c10 = int(r10[(r10.salario.str.startswith('Piso')) & (r10.horas_semana == 6)].costo_mensual_2026.iloc[0])
c19 = int(df[(df.jornada == 'Diurna') & (df.paquete_horas_semana == 6)].costo_mensual_2026.iloc[0])
assert abs(c10 - c19) <= 1, f'No cuadra con el script 10: {c10} vs {c19}'
print(df[['jornada', 'hora_ordinaria_2026', 'dif_vs_diurna_pct', 'paquete_horas_semana', 'costo_mensual_2026']].to_string(index=False))
print('control script 10 (diurna 6 h):', c10, '=', c19)
print('ok', SALIDA)
