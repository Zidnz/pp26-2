"""20 · Modelo de sostenibilidad de la opción C (relevo por horas) — UCA Analítica para los Negocios.

Para qué decisión existe: el equipo eligió (5 oct 2026) la opción C: relevo acotado por horas para la persona
cuidadora familiar de alta intensidad. El estudio de negocio v0.2 calculó el subsidio para 20 h y 40 h/semana
(otro producto). Este modelo rehace la economía unitaria para el relevo de 3 a 12 h/semana y responde:
(1) cuánto cuesta una hora de relevo con carga laboral, (2) cuánto de ese costo cubre el hogar bajo la
convención del 20% del ingreso, (3) cuánto financiamiento externo requiere según la aceptación y el costo de
operación, y (4) qué efecto tendría que lograr el relevo para que un pagador por costo evitado (escenario C)
lo financie.

Qué SÍ permite afirmar: costos laborales directos al piso legal, copago y subsidio laboral por hogar bajo un
umbral declarado, y umbrales de equilibrio expresados como función de parámetros.
Qué NO permite afirmar: punto de equilibrio único (el costo de operación y la aceptación son POR DETERMINAR);
disposición a pagar; cifras de la CDMX medidas (el dimensionamiento CDMX es una inferencia con tasas
nacionales); que el relevo reduzca el daño o la salida del empleo (eso lo mide el piloto).

Entradas: lee los CSV de Analysis/resultados (03, 04, 06, 07, 14, 16, 19, 05). Lo único que se escribe aquí son
supuestos declarados (carga laboral, convención del 20%, rejillas ilustrativas), marcados como tales.
Salidas: resultados/20_modelo_sostenibilidad.xlsx (fórmulas vivas) y resultados/20_sostenibilidad_escenarios.csv
(los mismos cálculos hechos en Python: control independiente de las fórmulas del xlsx).
Uso: python Analysis/20_modelo_sostenibilidad.py  (desde la raíz del repo)
"""
from pathlib import Path
import re
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

AQUI = Path(__file__).resolve().parent
RES = AQUI / 'resultados'
def rd(n): return pd.read_csv(RES / n, encoding='utf-8-sig')

# ───────────────────────── entradas desde los CSV ─────────────────────────
r19 = rd('19_costo_hora_por_jornada.csv')
SAL = float(r19.salario_diario_2026.iloc[0])
DIV = {j: float(r19[r19.jornada == j].horas_max_jornada.iloc[0]) for j in ['Diurna', 'Mixta', 'Nocturna']}

r04 = rd('04_resumen.csv')
def v04(prefijo): return float(r04[r04.indicador.str.startswith(prefijo)].valor.iloc[0])
INPC = v04('Factor INPC')
EN_P25 = v04('Ingreso mensual p25 ponderado')
EN_P75 = v04('Ingreso mensual p75 ponderado')
EN_MED = v04('Ingreso mensual mediano ponderado')

r14 = rd('14_enigh_resumen.csv')
def v14(ind_prefijo, dominio):
    f = r14[(r14.indicador.str.startswith(ind_prefijo)) & (r14.dominio == dominio)]
    assert len(f) == 1, (ind_prefijo, dominio, len(f))
    return f.iloc[0]
DEFL = float(r14[r14.indicador.str.startswith('Deflactor')].valor.iloc[0])
IG_P25 = float(v14('Ingreso monetario mensual del hogar, p25', 'CDMX').valor)
IG_P75 = float(v14('Ingreso monetario mensual del hogar, p75', 'CDMX').valor)
IG_MED = float(v14('Ingreso monetario mensual mediano, hogares con necesidad, en pesos de nov-2022', 'CDMX').valor)
fila = v14('Hogares con alguien de 60+ o con discapacidad', 'CDMX')
HOG_CDMX = float(re.search(r'total ([\d,]+)', fila.nota).group(1).replace(',', ''))

r06 = rd('06_anclas_presupuestales.csv')
HOG_NAL = float(r06[r06.ancla.str.startswith('Hogares con necesidad, nacional')].valor.iloc[0])
SOLIC = float(r06[r06.ancla.str.startswith('Solicitud CDMX')].valor.iloc[0])

r16 = rd('16_perfil_grupo_problema.csv')
def peso(seg): return float(r16[(r16.dimension == 'Ingreso') & (r16.segmento == seg) & (r16.poblacion == 'Grupo del problema')].pct.iloc[0]) / 100
PQ12, PQ3, PQ45, PSD = peso('Q1-Q2'), peso('Q3'), peso('Q4-Q5'), peso('Sin dato')

r03 = rd('03_enasic_barreras_estimaciones.csv')
c0 = r03.columns[0]
NOCONT = float(r03[r03[c0].str.contains('Cuidan disc/60\\+ \\| No contrataría', regex=True)].pct.iloc[0]) / 100

r07 = rd('07_enasic_necesidad_vs_norma_estimaciones.csv')
c0 = r07.columns[0]
g = r07[r07[c0].str.contains('Sin necesidad', regex=False) & r07[c0].str.contains('>=40 h', regex=False) & ~r07[c0].str.contains('ABVD', regex=False)]
GRUPO_NAL = float(g[g[c0].str.contains('Algún daño (salud o trabajo)', regex=False)].total_expandido.iloc[0])
P0 = float(g[g[c0].str.contains('Algún daño al trabajo', regex=False)].pct.iloc[0]) / 100
P0_LI = float(g[g[c0].str.contains('Algún daño al trabajo', regex=False)].li90.iloc[0]) / 100
P0_LS = float(g[g[c0].str.contains('Algún daño al trabajo', regex=False)].ls90.iloc[0]) / 100

r05 = rd('05_tasas_y_anclajes.csv')
CONTRATA_HOY = float(r05[r05.concepto.str.startswith('Contratan enfermería o cuidadora')].valor.iloc[0]) / 100

# ───────────────────────── supuestos declarados (no vienen de datos) ─────────────────────────
SEM_MES = 4.33            # igual que scripts 10 y 19
CARGA_2 = 0.22            # IMSS + Infonavit, script 06: POR CONFIRMAR con la calculadora del IMSS
AGUINALDO_D, VAC_D, PRIMA = 15, 12, 0.25   # LFT arts. 87, 76 y 80: POR VERIFICAR en el DOF (Daniel)
UMBRAL = 0.20             # convención del equipo, no estándar oficial
TAKEUP_BAJO, TAKEUP_MEDIO = 0.05, 0.25      # ILUSTRATIVOS, sin fuente
OPEX_G = [0, 250, 500, 1000]               # $ por hogar-mes, ILUSTRATIVOS: el costo real es POR DETERMINAR
PILOTO_N = [30, 60, 120]                   # ILUSTRATIVOS: la sede del piloto no está definida
VALOR_G = [20000, 50000, 100000, 200000]   # $ por salida/reducción de jornada evitada al año, ILUSTRATIVOS
SEL = dict(horas=6, jornada=1, carga=2, ingreso=1)

CARGA = {1: 0.0, 2: CARGA_2, 3: CARGA_2 + AGUINALDO_D / 365 + VAC_D / 365 * (1 + PRIMA)}
JORN = {1: 'Diurna', 2: 'Mixta', 3: 'Nocturna'}

# ───────────────────────── cálculo en Python (control independiente) ─────────────────────────
def costo(h, j, c): return SAL / DIV[JORN[j]] * h * SEM_MES * (1 + CARGA[c])
ING = {
    1: {'p25': EN_P25 * INPC, 'med': EN_MED * INPC, 'p75': EN_P75 * INPC},
    2: {'p25': IG_P25 * DEFL * INPC, 'med': IG_MED * INPC, 'p75': IG_P75 * DEFL * INPC},
}
W = {'p25': PQ12 / (1 - PSD), 'med': PQ3 / (1 - PSD), 'p75': PQ45 / (1 - PSD)}
def copago_subsidio(cst, fuente):
    cop = {k: min(cst, UMBRAL * v) for k, v in ING[fuente].items()}
    sub = {k: cst - cop[k] for k in cop}
    return cop, sub, sum(W[k] * cop[k] for k in W), sum(W[k] * sub[k] for k in W)
RAZON = GRUPO_NAL / HOG_NAL
ELEG = HOG_CDMX * RAZON
TAKEUP = {'bajo (ilustrativo)': TAKEUP_BAJO, 'medio (ilustrativo)': TAKEUP_MEDIO, 'máximo (cota: 1 − "no contrataría")': 1 - NOCONT}

C_SEL = costo(SEL['horas'], SEL['jornada'], SEL['carga'])
COP, SUB, COP_P, SUB_P = copago_subsidio(C_SEL, SEL['ingreso'])

filas = []
for j in (1, 2, 3):
    for h in (3, 6, 9, 12):
        for c in (1, 2, 3):
            filas.append(dict(bloque='costo_unitario', jornada=JORN[j], horas_semana=h, carga=c, carga_pct=round(CARGA[c] * 100, 1), costo_mensual=round(costo(h, j, c), 2)))
for f, nom in ((1, 'ENASIC nacional'), (2, 'ENIGH CDMX')):
    cop, sub, cp, sp = copago_subsidio(C_SEL, f)
    for k in cop:
        filas.append(dict(bloque='copago', fuente_ingreso=nom, hogar=k, ingreso_2026=round(ING[f][k], 2), copago=round(cop[k], 2), subsidio_laboral=round(sub[k], 2)))
    filas.append(dict(bloque='copago', fuente_ingreso=nom, hogar='ponderado', copago=round(cp, 2), subsidio_laboral=round(sp, 2)))
for nom, t in TAKEUP.items():
    n = ELEG * t
    filas.append(dict(bloque='escala_cdmx', escenario=nom, aceptacion=round(t, 4), hogares=round(n), costo_laboral_anual_mdp=round(n * C_SEL * 12 / 1e6, 2),
                      subsidio_laboral_anual_mdp=round(n * SUB_P * 12 / 1e6, 2), pct_solicitud=round(100 * n * SUB_P * 12 / 1e6 / SOLIC, 2)))
for nom, t in TAKEUP.items():
    for o in OPEX_G:
        n = ELEG * t
        tot = n * (SUB_P + o) * 12 / 1e6
        filas.append(dict(bloque='financiamiento_total_cdmx', escenario=nom, opex_hogar_mes=o, mdp=round(tot, 2), pct_solicitud=round(100 * tot / SOLIC, 2)))
for v in VALOR_G:
    for o in OPEX_G:
        filas.append(dict(bloque='costo_evitado', valor_evento_anual=v, opex_hogar_mes=o, efecto_minimo_pp=round(100 * (C_SEL + o) * 12 / v, 2)))
pd.DataFrame(filas).to_csv(RES / '20_sostenibilidad_escenarios.csv', index=False, encoding='utf-8-sig')

# ───────────────────────── libro de Excel con fórmulas ─────────────────────────
wb = Workbook()
ws_res = wb.active; ws_res.title = 'Resumen'
ws_sup = wb.create_sheet('Supuestos'); ws_uni = wb.create_sheet('Unitario'); ws_esc = wb.create_sheet('Escalas')
ws_ev = wb.create_sheet('Costo evitado'); ws_lim = wb.create_sheet('Límites')

AZUL = Font(color='1F4E9E'); NEG = Font(bold=True); TIT = Font(bold=True, size=14); GRIS = PatternFill('solid', fgColor='E9ECF2')
AMAR = PatternFill('solid', fgColor='FFF4C2'); VERDE = PatternFill('solid', fgColor='E3F1EC')
fin = Side(style='thin', color='C8CCD6'); BORDE = Border(left=fin, right=fin, top=fin, bottom=fin)
PES, PCT, MDP = '#,##0', '0.0%', '#,##0.0'

def nombre(n, hoja, ref):
    wb.defined_names[n] = DefinedName(n, attr_text=f"'{hoja}'!{ref}")

# --- Supuestos ---
S = [
 ('#', 'Selectores (cambian todo el modelo)'),
 ('sel_horas', 'Horas de relevo por semana', SEL['horas'], 'h/semana', 'Paquetes del script 10: 3, 6, 9 o 12', 'decisión de diseño', 'sel'),
 ('sel_jornada', 'Tipo de jornada (1 diurna · 2 mixta · 3 nocturna)', SEL['jornada'], 'índice', 'Script 19', 'decisión de diseño', 'sel'),
 ('sel_carga', 'Carga laboral (1 sin carga · 2 IMSS+Infonavit · 3 ampliada)', SEL['carga'], 'índice', 'Base: 2. La opción 1 reproduce el script 10', 'decisión de diseño', 'sel'),
 ('sel_ingreso', 'Fuente del ingreso del hogar (1 ENASIC nacional · 2 ENIGH CDMX)', SEL['ingreso'], 'índice', 'Decisión pendiente del equipo (README del Observatorio)', 'decisión pendiente', 'sel'),
 ('#', 'Costo laboral de la hora de relevo'),
 ('sal_diario', 'Salario mínimo profesional, trabajo del hogar 2026', SAL, '$ por día', 'CONASAMI, DOF 09-dic-2025 · resultados/19_costo_hora_por_jornada.csv', 'confirmado (vigencia por verificar)', 'in'),
 ('div_1', 'Horas máximas, jornada diurna', DIV['Diurna'], 'horas', 'LFT arts. 60 y 61 · script 19', 'probable (verificar en el DOF: Daniel)', 'in'),
 ('div_2', 'Horas máximas, jornada mixta', DIV['Mixta'], 'horas', 'LFT arts. 60 y 61 · script 19', 'probable (verificar en el DOF: Daniel)', 'in'),
 ('div_3', 'Horas máximas, jornada nocturna', DIV['Nocturna'], 'horas', 'LFT arts. 60 y 61 · script 19', 'probable (verificar en el DOF: Daniel)', 'in'),
 ('sem_mes', 'Semanas por mes', SEM_MES, 'semanas', 'Scripts 10 y 19', 'convención del equipo', 'in'),
 ('carga_1', 'Carga 1: sin carga (control script 10)', 0.0, '% del salario', 'Script 10', 'confirmado', 'in'),
 ('carga_2', 'Carga 2: IMSS e Infonavit', CARGA_2, '% del salario', 'Script 06, "Carga patronal"', 'probable (POR CONFIRMAR con la calculadora del IMSS)', 'in'),
 ('aguinaldo_dias', 'Aguinaldo mínimo', AGUINALDO_D, 'días', 'LFT art. 87', 'probable (verificar en el DOF)', 'in'),
 ('vac_dias', 'Vacaciones, primer año', VAC_D, 'días', 'LFT art. 76', 'probable (verificar en el DOF)', 'in'),
 ('prima_vac', 'Prima vacacional', PRIMA, '% de las vacaciones', 'LFT art. 80', 'probable (verificar en el DOF)', 'in'),
 ('carga_3', 'Carga 3: ampliada = carga 2 + aguinaldo + vacaciones + prima', '=carga_2+aguinaldo_dias/365+vac_dias/365*(1+prima_vac)', '% del salario', 'Suma simple; NO incluye séptimo día ni descansos de jornadas por horas', 'supuesto (subestima el costo real)', 'calc'),
 ('#', 'Ingreso mensual de los hogares con necesidad (disc. o 60+)'),
 ('inpc', 'Factor INPC nov-2022 → ago-2026', INPC, 'razón', 'resultados/04_resumen.csv', 'supuesto (el ingreso creció como el INPC)', 'in'),
 ('defl_ago_nov', 'Deflactor nov-2022 / ago-2022', DEFL, 'razón', 'resultados/14_enigh_resumen.csv', 'confirmado', 'in'),
 ('enasic_p25', 'ENASIC nacional, p25 (pesos 2022)', EN_P25, '$/mes', 'resultados/04_resumen.csv', 'confirmado; la ENASIC capta ~la mitad del ingreso que mide la ENIGH', 'in'),
 ('enasic_med', 'ENASIC nacional, mediana (pesos 2022)', EN_MED, '$/mes', 'resultados/04_resumen.csv', 'confirmado; ídem', 'in'),
 ('enasic_p75', 'ENASIC nacional, p75 (pesos 2022)', EN_P75, '$/mes', 'resultados/04_resumen.csv', 'confirmado; ídem', 'in'),
 ('enigh_p25_ago', 'ENIGH 2022 CDMX, p25 ingreso monetario (pesos ago-2022)', IG_P25, '$/mes', 'resultados/14_enigh_resumen.csv', 'confirmado (estimación puntual sin IC)', 'in'),
 ('enigh_med_nov', 'ENIGH 2022 CDMX, mediana ingreso monetario (pesos nov-2022)', IG_MED, '$/mes', 'resultados/14_enigh_resumen.csv', 'confirmado (estimación puntual sin IC)', 'in'),
 ('enigh_p75_ago', 'ENIGH 2022 CDMX, p75 ingreso monetario (pesos ago-2022)', IG_P75, '$/mes', 'resultados/14_enigh_resumen.csv', 'confirmado (estimación puntual sin IC)', 'in'),
 ('ing_enasic_p25', 'Ingreso 2026, ENASIC p25', '=enasic_p25*inpc', '$/mes', 'Cálculo', 'derivado', 'calc'),
 ('ing_enasic_med', 'Ingreso 2026, ENASIC mediana', '=enasic_med*inpc', '$/mes', 'Cálculo', 'derivado', 'calc'),
 ('ing_enasic_p75', 'Ingreso 2026, ENASIC p75', '=enasic_p75*inpc', '$/mes', 'Cálculo', 'derivado', 'calc'),
 ('ing_enigh_p25', 'Ingreso 2026, ENIGH CDMX p25', '=enigh_p25_ago*defl_ago_nov*inpc', '$/mes', 'Cálculo', 'derivado', 'calc'),
 ('ing_enigh_med', 'Ingreso 2026, ENIGH CDMX mediana', '=enigh_med_nov*inpc', '$/mes', 'Cálculo', 'derivado', 'calc'),
 ('ing_enigh_p75', 'Ingreso 2026, ENIGH CDMX p75', '=enigh_p75_ago*defl_ago_nov*inpc', '$/mes', 'Cálculo', 'derivado', 'calc'),
 ('umbral', 'Umbral de asequibilidad (copago máximo)', UMBRAL, '% del ingreso', 'Convención del equipo (script 04/06)', 'supuesto: no es estándar oficial', 'in'),
 ('peso_q12', 'Grupo del problema: % en Q1-Q2', PQ12, '%', 'resultados/16_perfil_grupo_problema.csv', 'confirmado (precisión moderada)', 'in'),
 ('peso_q3', 'Grupo del problema: % en Q3', PQ3, '%', 'ídem', 'confirmado (precisión moderada)', 'in'),
 ('peso_q45', 'Grupo del problema: % en Q4-Q5', PQ45, '%', 'ídem', 'confirmado (precisión moderada)', 'in'),
 ('peso_sd', 'Grupo del problema: % sin dato de ingreso', PSD, '%', 'ídem', 'confirmado', 'in'),
 ('w_p25', 'Peso del hogar tipo p25 (Q1-Q2, sin los "sin dato")', '=peso_q12/(1-peso_sd)', '%', 'Supuesto: Q1-Q2 se representa con el p25, Q3 con la mediana, Q4-Q5 con el p75', 'supuesto (aproximación gruesa)', 'calc'),
 ('w_med', 'Peso del hogar tipo mediana', '=peso_q3/(1-peso_sd)', '%', 'ídem', 'supuesto (aproximación gruesa)', 'calc'),
 ('w_p75', 'Peso del hogar tipo p75', '=peso_q45/(1-peso_sd)', '%', 'ídem', 'supuesto (aproximación gruesa)', 'calc'),
 ('#', 'Demanda: asequible no es lo mismo que aceptado'),
 ('contrata_hoy', 'Hogares con necesidad que hoy contratan enfermería o cuidadora', CONTRATA_HOY, '%', 'resultados/05_tasas_y_anclajes.csv', 'confirmado (CV moderado)', 'in'),
 ('no_contrataria', 'Cuidadoras de disc./60+ que no contratarían a nadie', NOCONT, '%', 'resultados/03_enasic_barreras_estimaciones.csv, bloque 4', 'confirmado', 'in'),
 ('takeup_max', 'Aceptación máxima (cota superior) = 1 − no contrataría', '=1-no_contrataria', '%', 'Cota: declarar que se contrataría no demuestra que se contrate', 'cota superior', 'calc'),
 ('takeup_bajo', 'Aceptación, escenario bajo', TAKEUP_BAJO, '%', 'Sin fuente', 'ILUSTRATIVO: lo mide el piloto', 'in'),
 ('takeup_medio', 'Aceptación, escenario medio', TAKEUP_MEDIO, '%', 'Sin fuente', 'ILUSTRATIVO: lo mide el piloto', 'in'),
 ('#', 'Escala (CDMX es una inferencia, no una medición)'),
 ('hog_cdmx_need', 'Hogares de la CDMX con alguien de 60+ o con discapacidad', HOG_CDMX, 'hogares', 'ENIGH 2022 · resultados/14_enigh_resumen.csv (IC90 45.0–49.1% de los hogares)', 'confirmado', 'in'),
 ('hog_nal_need', 'Hogares con necesidad, nacional', HOG_NAL, 'hogares', 'resultados/06_anclas_presupuestales.csv', 'confirmado', 'in'),
 ('grupo_nal', 'Grupo del problema, nacional (personas)', GRUPO_NAL, 'personas', 'resultados/07: no buscó por "no tuve necesidad" + 40 h o más + algún daño', 'confirmado (precisión alta)', 'in'),
 ('razon_grupo', 'Razón grupo del problema / hogares con necesidad', '=grupo_nal/hog_nal_need', 'razón', 'Mezcla personas con hogares; supone una persona del grupo por hogar', 'supuesto', 'calc'),
 ('eleg_cdmx', 'Elegibles inferidos en la CDMX', '=hog_cdmx_need*razon_grupo', 'hogares', 'Aplica la razón nacional a la CDMX', 'probable débil: orden de magnitud', 'calc'),
 ('solicitud_mdp', 'Solicitud 2026 del Sistema Público de Cuidados de la CDMX', SOLIC, 'mdp', 'resultados/06_anclas_presupuestales.csv', 'probable (prensa; contrastar con el decreto)', 'in'),
 ('#', 'Operación y piloto (POR DETERMINAR)'),
 ('opex_real', 'Costo de operación real por hogar-mes (coordinación, verificación, formación, plataforma)', None, '$/hogar-mes', 'Llenar cuando existan la sede, la nómina anclada y el costo de verificación', 'POR DETERMINAR', 'sel'),
 ('opex_g1', 'Rejilla de operación 1', OPEX_G[0], '$/hogar-mes', 'Sin fuente', 'ILUSTRATIVO', 'in'),
 ('opex_g2', 'Rejilla de operación 2', OPEX_G[1], '$/hogar-mes', 'Sin fuente', 'ILUSTRATIVO', 'in'),
 ('opex_g3', 'Rejilla de operación 3', OPEX_G[2], '$/hogar-mes', 'Sin fuente', 'ILUSTRATIVO', 'in'),
 ('opex_g4', 'Rejilla de operación 4', OPEX_G[3], '$/hogar-mes', 'Sin fuente', 'ILUSTRATIVO', 'in'),
 ('pil_n1', 'Piloto, escenario 1', PILOTO_N[0], 'hogares', 'La sede no está definida', 'ILUSTRATIVO', 'in'),
 ('pil_n2', 'Piloto, escenario 2', PILOTO_N[1], 'hogares', 'ídem', 'ILUSTRATIVO', 'in'),
 ('pil_n3', 'Piloto, escenario 3', PILOTO_N[2], 'hogares', 'ídem', 'ILUSTRATIVO', 'in'),
 ('#', 'Escenario C: pagador por costo evitado'),
 ('p0_trabajo', 'Cuidadoras de 40 h o más que no buscaron servicios y declaran daño al trabajo', P0, '%', f'resultados/07 (IC90 {P0_LI:.1%}–{P0_LS:.1%}). Incluye "no puede trabajar fuera": cota superior de la salida del empleo', 'confirmado como declaración', 'in'),
 ('val_g1', 'Rejilla del valor anual de una salida o reducción de jornada evitada 1', VALOR_G[0], '$/año', 'Sin fuente', 'ILUSTRATIVO', 'in'),
 ('val_g2', 'Rejilla 2', VALOR_G[1], '$/año', 'Sin fuente', 'ILUSTRATIVO', 'in'),
 ('val_g3', 'Rejilla 3', VALOR_G[2], '$/año', 'Sin fuente', 'ILUSTRATIVO', 'in'),
 ('val_g4', 'Rejilla 4', VALOR_G[3], '$/año', 'Sin fuente', 'ILUSTRATIVO', 'in'),
]
ws = ws_sup
ws['A1'] = 'Supuestos y fuentes del modelo'; ws['A1'].font = TIT
ws['A2'] = 'Azul = dato o supuesto que se puede cambiar · amarillo = selector · negro = cálculo. Los valores con fuente vienen de los CSV de Analysis/resultados.'
for i, t in enumerate(['Parámetro', 'Valor', 'Unidad', 'Fuente', 'Evidencia', 'Nombre en las fórmulas'], 1):
    c = ws.cell(row=3, column=i, value=t); c.font = NEG; c.fill = GRIS; c.border = BORDE
fmt_por_unidad = {'% del salario': PCT, '%': PCT, '% de las vacaciones': PCT, '$/mes': PES, '$/hogar-mes': PES, '$ por día': '#,##0.00', '$/año': PES, 'hogares': PES, 'personas': PES, 'mdp': MDP, 'razón': '0.0000'}
r = 4
for it in S:
    if it[0] == '#':
        c = ws.cell(row=r, column=1, value=it[1]); c.font = NEG
        for k in range(1, 7): ws.cell(row=r, column=k).fill = GRIS
        r += 1; continue
    n, lab, val, uni, fte, evi, kind = it
    ws.cell(row=r, column=1, value=lab)
    c = ws.cell(row=r, column=2, value=val)
    ws.cell(row=r, column=3, value=uni); ws.cell(row=r, column=4, value=fte); ws.cell(row=r, column=5, value=evi); ws.cell(row=r, column=6, value=n)
    c.number_format = fmt_por_unidad.get(uni, 'General')
    if n.startswith('razon') or n in ('inpc', 'defl_ago_nov'): c.number_format = '0.0000'
    if kind == 'sel': c.fill = AMAR; c.font = AZUL
    elif kind == 'in': c.font = AZUL
    for k in range(1, 7): ws.cell(row=r, column=k).border = BORDE; ws.cell(row=r, column=k).alignment = Alignment(wrap_text=True, vertical='top')
    nombre(n, 'Supuestos', f'$B${r}')
    r += 1
for col, w in zip('ABCDEF', (58, 14, 18, 62, 46, 20)): ws.column_dimensions[col].width = w
ws.freeze_panes = 'A4'
for n, lista in (('sel_horas', '"3,6,9,12"'), ('sel_jornada', '"1,2,3"'), ('sel_carga', '"1,2,3"'), ('sel_ingreso', '"1,2"')):
    dv = DataValidation(type='list', formula1=lista, allow_blank=False); ws.add_data_validation(dv)
    dv.add(wb.defined_names[n].attr_text.split('!')[1].replace('$', ''))

# --- Unitario ---
ws = ws_uni
ws['A1'] = 'Economía unitaria del relevo (por hogar y por mes)'; ws['A1'].font = TIT
ws['A2'] = 'Costo laboral directo al piso legal. No incluye operación, verificación ni plataforma (POR DETERMINAR). Pesos de 2026.'
ws['A4'] = 'A · Costo laboral mensual por jornada, horas y carga'; ws['A4'].font = NEG
for i, t in enumerate(['Jornada', 'Horas/semana', 'Hora ordinaria', 'Sin carga', 'Con IMSS+Infonavit', 'Carga ampliada'], 1):
    c = ws.cell(row=5, column=i, value=t); c.font = NEG; c.fill = GRIS; c.border = BORDE
r = 6
for j in (1, 2, 3):
    for h in (3, 6, 9, 12):
        ws.cell(row=r, column=1, value=JORN[j]); ws.cell(row=r, column=2, value=h)
        ws.cell(row=r, column=3, value=f'=sal_diario/div_{j}').number_format = '#,##0.00'
        for k in (1, 2, 3):
            ws.cell(row=r, column=3 + k, value=f'=$C{r}*$B{r}*sem_mes*(1+carga_{k})').number_format = PES
        for k in range(1, 7): ws.cell(row=r, column=k).border = BORDE
        r += 1
ws['A19'] = 'B · Paquete seleccionado (cambia en Supuestos)'; ws['A19'].font = NEG
ws['A20'] = 'Hora ordinaria'; ws['B20'] = '=sal_diario/CHOOSE(sel_jornada,div_1,div_2,div_3)'; ws['B20'].number_format = '#,##0.00'
ws['A21'] = 'Costo laboral mensual por hogar'; ws['B21'] = '=B20*sel_horas*sem_mes*(1+CHOOSE(sel_carga,carga_1,carga_2,carga_3))'; ws['B21'].number_format = PES
ws['A22'] = 'Ingreso mensual mínimo para pagarlo íntegro (umbral)'; ws['B22'] = '=B21/umbral'; ws['B22'].number_format = PES
nombre('costo_sel', 'Unitario', '$B$21'); nombre('ingreso_min', 'Unitario', '$B$22')
ws['A25'] = 'C · Copago y subsidio laboral por tipo de hogar'; ws['A25'].font = NEG
enc = ['Hogar de referencia', 'Ingreso 2026 ENASIC', 'Copago máx.', 'Copago', 'Subsidio laboral', '¿Paga íntegro?', 'Ingreso 2026 ENIGH CDMX', 'Copago máx.', 'Copago', 'Subsidio laboral', '¿Paga íntegro?']
for i, t in enumerate(enc, 1):
    c = ws.cell(row=26, column=i, value=t); c.font = NEG; c.fill = GRIS; c.border = BORDE; c.alignment = Alignment(wrap_text=True)
for k, (lab, a, b) in enumerate([('Hogar p25', 'ing_enasic_p25', 'ing_enigh_p25'), ('Hogar mediano', 'ing_enasic_med', 'ing_enigh_med'), ('Hogar p75', 'ing_enasic_p75', 'ing_enigh_p75')]):
    rr = 27 + k
    ws.cell(row=rr, column=1, value=lab)
    for base, ing in ((2, a), (7, b)):
        L = lambda d: ws.cell(row=rr, column=base + d).coordinate
        ws.cell(row=rr, column=base, value=f'={ing}').number_format = PES
        ws.cell(row=rr, column=base + 1, value=f'=umbral*{L(0)}').number_format = PES
        ws.cell(row=rr, column=base + 2, value=f'=MIN(costo_sel,{L(1)})').number_format = PES
        ws.cell(row=rr, column=base + 3, value=f'=costo_sel-{L(2)}').number_format = PES
        ws.cell(row=rr, column=base + 4, value=f'=IF({L(3)}<=0.5,"sí","no")')
    for q in range(1, 12): ws.cell(row=rr, column=q).border = BORDE
ws['A30'] = 'Ponderado por el perfil del grupo del problema'; ws['A30'].font = NEG
ws['D30'] = '=w_p25*D27+w_med*D28+w_p75*D29'; ws['E30'] = '=w_p25*E27+w_med*E28+w_p75*E29'
ws['I30'] = '=w_p25*I27+w_med*I28+w_p75*I29'; ws['J30'] = '=w_p25*J27+w_med*J28+w_p75*J29'
for c in ('D30', 'E30', 'I30', 'J30'): ws[c].number_format = PES; ws[c].font = NEG
ws['A32'] = 'Con la fuente de ingreso seleccionada:'; ws['A32'].font = NEG
ws['A33'] = 'Copago promedio por hogar-mes'; ws['B33'] = '=CHOOSE(sel_ingreso,D30,I30)'
ws['A34'] = 'Subsidio laboral promedio por hogar-mes'; ws['B34'] = '=CHOOSE(sel_ingreso,E30,J30)'
ws['A35'] = 'Parte del costo laboral que cubre el hogar (promedio)'; ws['B35'] = '=B33/costo_sel'; ws['B35'].number_format = PCT
ws['B33'].number_format = PES; ws['B34'].number_format = PES
nombre('copago_prom', 'Unitario', '$B$33'); nombre('subs_prom', 'Unitario', '$B$34')
ws['A37'] = ('Lectura: el copago usa la convención del 20% del ingreso (no es disposición a pagar). Los tres hogares de referencia son una '
             'aproximación gruesa del perfil de ingreso del grupo del problema (Q1-Q2 → p25, Q3 → mediana, Q4-Q5 → p75); el p25 y el p75 son de los hogares '
             'con necesidad, no del grupo del problema. La ENASIC capta cerca de la mitad del ingreso que mide la ENIGH, así que con la ENASIC el subsidio sale sobreestimado.')
ws['A37'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('A37:K39')
for col, w in zip('ABCDEFGHIJK', (46, 16, 14, 14, 16, 14, 18, 14, 14, 16, 14)): ws.column_dimensions[col].width = w

# --- Escalas ---
ws = ws_esc
ws['A1'] = 'Escalas: CDMX (inferida) y piloto (ilustrativo)'; ws['A1'].font = TIT
ws['A2'] = 'El número de hogares elegibles en la CDMX es una inferencia con tasas nacionales; la aceptación y la operación son POR DETERMINAR. Estas tablas muestran sensibilidad, no pronóstico.'
ws['A4'] = 'A · Costo laboral y subsidio laboral anual en la CDMX, según aceptación'; ws['A4'].font = NEG
for i, t in enumerate(['Escenario de aceptación', 'Aceptación', 'Hogares atendidos', 'Costo laboral anual (mdp)', 'Copago anual (mdp)', 'Subsidio laboral anual (mdp)', 'Subsidio laboral / solicitud CDMX'], 1):
    c = ws.cell(row=5, column=i, value=t); c.font = NEG; c.fill = GRIS; c.border = BORDE; c.alignment = Alignment(wrap_text=True)
esc = [('Bajo (ilustrativo)', 'takeup_bajo'), ('Medio (ilustrativo)', 'takeup_medio'), ('Máximo (cota: 1 − no contrataría)', 'takeup_max')]
for k, (lab, nm) in enumerate(esc):
    rr = 6 + k
    ws.cell(row=rr, column=1, value=lab); ws.cell(row=rr, column=2, value=f'={nm}').number_format = PCT
    ws.cell(row=rr, column=3, value=f'=eleg_cdmx*B{rr}').number_format = PES
    ws.cell(row=rr, column=4, value=f'=C{rr}*costo_sel*12/1000000').number_format = MDP
    ws.cell(row=rr, column=5, value=f'=C{rr}*copago_prom*12/1000000').number_format = MDP
    ws.cell(row=rr, column=6, value=f'=C{rr}*subs_prom*12/1000000').number_format = MDP
    ws.cell(row=rr, column=7, value=f'=F{rr}/solicitud_mdp').number_format = PCT
    for q in range(1, 8): ws.cell(row=rr, column=q).border = BORDE
ws['A10'] = 'B · Financiamiento externo total anual = subsidio laboral + operación (mdp), según operación por hogar-mes'; ws['A10'].font = NEG
cab = ['Escenario de aceptación', '=opex_g1', '=opex_g2', '=opex_g3', '=opex_g4', '=opex_real']
for i, t in enumerate(cab, 1):
    c = ws.cell(row=11, column=i, value=t); c.font = NEG; c.fill = GRIS; c.border = BORDE
    if i > 1: c.number_format = '"$"#,##0" /hogar-mes"'
ws['F11'] = '=IF(ISNUMBER(opex_real),opex_real,"POR DETERMINAR")'; ws['F11'].font = NEG; ws['F11'].fill = GRIS
for k, (lab, nm) in enumerate(esc):
    rr = 12 + k
    ws.cell(row=rr, column=1, value=lab)
    for q, o in enumerate(['opex_g1', 'opex_g2', 'opex_g3', 'opex_g4']):
        ws.cell(row=rr, column=2 + q, value=f'=eleg_cdmx*{nm}*(subs_prom+{o})*12/1000000').number_format = MDP
    ws.cell(row=rr, column=6, value=f'=IF(ISNUMBER(opex_real),eleg_cdmx*{nm}*(subs_prom+opex_real)*12/1000000,"—")').number_format = MDP
    for q in range(1, 7): ws.cell(row=rr, column=q).border = BORDE
ws['A16'] = 'C · Lo mismo como % de la solicitud 2026 del Sistema Público de Cuidados de la CDMX'; ws['A16'].font = NEG
for i in range(1, 7):
    c = ws.cell(row=17, column=i, value=f'={ws.cell(row=11, column=i).coordinate}'); c.font = NEG; c.fill = GRIS; c.border = BORDE
    if 1 < i < 6: c.number_format = '"$"#,##0" /hogar-mes"'
for k in range(3):
    rr = 18 + k
    ws.cell(row=rr, column=1, value=f'=A{12 + k}')
    for q in range(2, 7):
        ws.cell(row=rr, column=q, value=f'=IF(ISNUMBER({ws.cell(row=12 + k, column=q).coordinate}),{ws.cell(row=12 + k, column=q).coordinate}/solicitud_mdp,"—")').number_format = PCT
    for q in range(1, 7): ws.cell(row=rr, column=q).border = BORDE
ws['A23'] = 'D · Piloto (tamaños ilustrativos: la sede no está definida)'; ws['A23'].font = NEG
cab = ['Hogares en el piloto', 'Costo laboral/mes ($)', 'Copago/mes ($)', 'Subsidio laboral/mes ($)', '=opex_g1', '=opex_g2', '=opex_g3', '=opex_g4']
for i, t in enumerate(cab, 1):
    c = ws.cell(row=24, column=i, value=t); c.font = NEG; c.fill = GRIS; c.border = BORDE; c.alignment = Alignment(wrap_text=True)
    if i > 4: c.number_format = '"Financ. ext. anual (miles $) con op. $"#,##0'
for k, n in enumerate(['pil_n1', 'pil_n2', 'pil_n3']):
    rr = 25 + k
    ws.cell(row=rr, column=1, value=f'={n}').number_format = PES
    ws.cell(row=rr, column=2, value=f'=A{rr}*costo_sel').number_format = PES
    ws.cell(row=rr, column=3, value=f'=A{rr}*copago_prom').number_format = PES
    ws.cell(row=rr, column=4, value=f'=A{rr}*subs_prom').number_format = PES
    for q, o in enumerate(['opex_g1', 'opex_g2', 'opex_g3', 'opex_g4']):
        ws.cell(row=rr, column=5 + q, value=f'=A{rr}*(subs_prom+{o})*12/1000').number_format = PES
    for q in range(1, 9): ws.cell(row=rr, column=q).border = BORDE
ws['A30'] = ('Lectura: ningún renglón de operación tiene fuente; la rejilla solo muestra cuánto pesa. El financiamiento externo no es ingreso del programa: '
             'alguien tiene que ponerlo (gobierno, aliado o pagador por costo evitado). Con una contratación de hoy de 1.0% no hay volumen para financiar la operación con una comisión.')
ws['A30'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('A30:H32')
for col, w in zip('ABCDEFGH', (40, 16, 18, 18, 18, 20, 20, 20)): ws.column_dimensions[col].width = w

# --- Costo evitado ---
ws = ws_ev
ws['A1'] = 'Escenario C: ¿qué efecto tendría que lograr el relevo para que un pagador por costo evitado lo financie?'; ws['A1'].font = TIT
ws['A2'] = ('Efecto mínimo = (costo laboral + operación) × 12 ÷ valor anual de una salida o reducción de jornada evitada. Se lee como puntos porcentuales de reducción en la probabilidad '
            'de salida. En rojo: el efecto exigido supera la prevalencia de daño al trabajo declarada (cota superior), o sea, no puede cumplirse.')
ws['A2'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('A2:F3')
ws['A5'] = 'Prevalencia declarada de daño al trabajo (cota superior de la salida del empleo)'; ws['E5'] = '=p0_trabajo'; ws['E5'].number_format = PCT; ws['E5'].font = NEG
ws['A6'] = 'Costo laboral anual por hogar, paquete seleccionado ($)'; ws['E6'] = '=costo_sel*12'; ws['E6'].number_format = PES; ws['E6'].font = NEG
cab = ['Valor anual evitado por salida ($) ↓ · Operación →', '=opex_g1', '=opex_g2', '=opex_g3', '=opex_g4']
for i, t in enumerate(cab, 1):
    c = ws.cell(row=8, column=i, value=t); c.font = NEG; c.fill = GRIS; c.border = BORDE
    if i > 1: c.number_format = '"$"#,##0" /hogar-mes"'
for k, v in enumerate(['val_g1', 'val_g2', 'val_g3', 'val_g4']):
    rr = 9 + k
    ws.cell(row=rr, column=1, value=f'={v}').number_format = PES
    for q, o in enumerate(['opex_g1', 'opex_g2', 'opex_g3', 'opex_g4']):
        ws.cell(row=rr, column=2 + q, value=f'=(costo_sel+{o})*12/$A{rr}').number_format = PCT
    for q in range(1, 6): ws.cell(row=rr, column=q).border = BORDE
ws.conditional_formatting.add('B9:E12', FormulaRule(formula=['B9>p0_trabajo'], fill=PatternFill('solid', bgColor='F6C9C9', fgColor='F6C9C9'), font=Font(color='9C1C1C')))
ws['A14'] = ('Qué dice y qué no: no hay evidencia propia de que 6 h/semana de relevo reduzcan la salida del empleo, y el valor anual evitado es una rejilla ilustrativa. '
             'Lo que sí permite el cuadro es saber de antemano qué tendría que medir el piloto: el efecto mínimo con el que un pagador institucional cerraría las cuentas.')
ws['A14'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('A14:F16')
for col, w in zip('ABCDEF', (52, 18, 18, 18, 18, 18)): ws.column_dimensions[col].width = w

# --- Límites ---
ws = ws_lim
ws['A1'] = 'Límites, pendientes y reglas de uso'; ws['A1'].font = TIT
lim = [
 ('Qué el modelo NO es', 'No calcula un punto de equilibrio: el costo de operación (coordinación, verificación y formación, plataforma, nómina) y la aceptación son POR DETERMINAR. Da umbrales y sensibilidades.'),
 ('Costo laboral', 'Piso legal sin séptimo día ni descansos de jornadas por horas; carga del 22% POR CONFIRMAR con el IMSS; arts. 60, 61, 76, 80 y 87 de la LFT por verificar en el DOF (Daniel). Subestima el costo real.'),
 ('Asequibilidad', 'El 20% del ingreso es una convención del equipo. Poder pagar no es querer contratar: hoy contrata 1.0% y el 35.9% de las cuidadoras de disc./60+ no contrataría a nadie.'),
 ('Ingreso', 'ENASIC capta cerca de la mitad del ingreso que mide la ENIGH. Cambiar la fuente en Supuestos (selector 4) cambia el subsidio de forma importante. La decisión sigue pendiente del equipo.'),
 ('CDMX', 'Los elegibles de la CDMX salen de aplicar la razón nacional (grupo del problema / hogares con necesidad) a los hogares de la CDMX medidos por la ENIGH: orden de magnitud, no medición. La solicitud 2026 viene de prensa.'),
 ('Grupo vs. beneficiaria', 'El grupo del problema es la cuidadora familiar de alta intensidad; la beneficiaria final es la persona que recibe el cuidado. El modelo cuenta hogares, no personas.'),
 ('Escenario C', 'Sin evidencia propia. Lo mide el piloto. No promete reducción de hospitalizaciones ni de salidas del empleo.'),
 ('Revisión', 'Pendiente de doble revisión por alguien distinto a quien lo produjo (regla del proyecto).'),
 ('Datos', 'Agregados nacionales y de la CDMX; ningún dato personal. Sin datos simulados: las rejillas ilustrativas están marcadas como tales.'),
]
for k, (a, b) in enumerate(lim):
    ws.cell(row=3 + k, column=1, value=a).font = NEG
    c = ws.cell(row=3 + k, column=2, value=b); c.alignment = Alignment(wrap_text=True, vertical='top')
    ws.row_dimensions[3 + k].height = 48
ws.column_dimensions['A'].width = 24; ws.column_dimensions['B'].width = 120

# --- Resumen ---
ws = ws_res
ws['A1'] = 'Modelo de sostenibilidad · Opción C (relevo por horas)'; ws['A1'].font = TIT
ws['A2'] = 'Observatorio del Cuidado · UCA Analítica para los Negocios · 15 oct 2026 · pendiente de doble revisión · los resultados cambian con los selectores de la hoja Supuestos'
ws['A4'] = 'Paquete seleccionado'; ws['A4'].font = NEG
ws['B4'] = '=sel_horas&" h/semana · "&CHOOSE(sel_jornada,"diurna","mixta","nocturna")&" · carga "&TEXT(CHOOSE(sel_carga,carga_1,carga_2,carga_3),"0.0%")&" · ingreso "&CHOOSE(sel_ingreso,"ENASIC nacional","ENIGH CDMX")'
filas_res = [
 ('Costo laboral mensual por hogar', '=costo_sel', PES, 'confirmado el piso; carga por confirmar'),
 ('Ingreso mensual mínimo del hogar para pagarlo íntegro', '=ingreso_min', PES, 'convención del 20%'),
 ('Copago promedio por hogar-mes (perfil del grupo del problema)', '=copago_prom', PES, 'supuesto (aproximación gruesa)'),
 ('Subsidio laboral promedio por hogar-mes', '=subs_prom', PES, 'supuesto (aproximación gruesa)'),
 ('Parte del costo laboral que cubre el hogar', '=copago_prom/costo_sel', PCT, 'supuesto'),
 ('Elegibles inferidos en la CDMX (hogares)', '=eleg_cdmx', PES, 'probable débil: orden de magnitud'),
 ('Subsidio laboral anual CDMX con aceptación media (mdp)', "='Escalas'!F7", MDP, 'ilustrativo'),
 ('   como % de la solicitud 2026 del Sistema Público de Cuidados', "='Escalas'!G7", PCT, 'ilustrativo'),
 ('Subsidio laboral anual CDMX con aceptación máxima (mdp)', "='Escalas'!F8", MDP, 'cota superior'),
 ('   como % de la solicitud', "='Escalas'!G8", PCT, 'cota superior'),
 ('Efecto mínimo exigido en escenario C (valor evitado $100,000, sin operación)', "='Costo evitado'!B11", PCT, 'ilustrativo'),
 ('Costo de operación real por hogar-mes', '=IF(ISNUMBER(opex_real),opex_real,"POR DETERMINAR")', PES, 'POR DETERMINAR'),
]
ws['A6'] = 'Resultado'; ws['B6'] = 'Valor'; ws['C6'] = 'Evidencia'
for c in ('A6', 'B6', 'C6'): ws[c].font = NEG; ws[c].fill = GRIS
for k, (a, f, fm, ev) in enumerate(filas_res):
    rr = 7 + k
    ws.cell(row=rr, column=1, value=a); c = ws.cell(row=rr, column=2, value=f); c.number_format = fm; c.font = NEG
    ws.cell(row=rr, column=3, value=ev)
    for q in range(1, 4): ws.cell(row=rr, column=q).border = BORDE
rr0 = 7 + len(filas_res) + 1
ws.cell(row=rr0, column=1, value='Lectura con los parámetros base (texto generado por el script, no por las fórmulas)').font = NEG
sub_p25 = COP and SUB['p25']
lect = [
 f"1. Con relevo de 6 h/semana, diurno y carga del 22%, el costo laboral es ${C_SEL:,.0f} al mes. Bajo el umbral del 20%, lo paga íntegro un hogar con ingreso de ${C_SEL / UMBRAL:,.0f} o más; el hogar mediano de la ENASIC (${ING[1]['med']:,.0f}) sí, el del p25 (${ING[1]['p25']:,.0f}) cubre ${COP['p25']:,.0f}.",
 f"2. Esto corrige la lectura del estudio de negocio v0.2: el subsidio 'inviable' era el de 20 y 40 h. En relevo de 6 h el subsidio laboral promedio es de ${SUB_P:,.0f} por hogar-mes con ingreso ENASIC. Bajo la convención del 20%, el precio del relevo deja de ser la barrera principal de financiamiento; eso no implica que los hogares lo contraten.",
 f"3. Lo que decide si el programa se sostiene es la operación (POR DETERMINAR) y la aceptación. Hoy contrata {CONTRATA_HOY:.1%} de los hogares con necesidad y {NOCONT:.1%} de las cuidadoras no contrataría a nadie: asequible no es aceptado, y esto es lo que debe medir el piloto (H1 contra H2).",
 f"4. Escala (inferida): ≈{ELEG:,.0f} hogares elegibles en la CDMX. Con aceptación media ({TAKEUP_MEDIO:.0%}, ilustrativa) el subsidio laboral sería de {ELEG * TAKEUP_MEDIO * SUB_P * 12 / 1e6:,.1f} mdp al año ({100 * ELEG * TAKEUP_MEDIO * SUB_P * 12 / 1e6 / SOLIC:.1f}% de la solicitud de la CDMX); con la cota máxima, {ELEG * (1 - NOCONT) * SUB_P * 12 / 1e6:,.1f} mdp ({100 * ELEG * (1 - NOCONT) * SUB_P * 12 / 1e6 / SOLIC:.1f}%).",
 f"5. Con ingreso ENIGH CDMX el subsidio laboral promedio baja a ${copago_subsidio(C_SEL, 2)[3]:,.0f} por hogar-mes: la fuente del ingreso es una de las decisiones que más lo mueven, junto con las horas de relevo y el umbral de asequibilidad (ver el notebook 20, sección 7). La ENASIC capta cerca de la mitad del ingreso de la ENIGH.",
 f"6. Escenario C: con un valor evitado de $100,000 al año por salida, el relevo tendría que reducir la probabilidad de salida en {100 * C_SEL * 12 / 100000:.1f} pp solo por su costo laboral (la prevalencia declarada de daño al trabajo es {P0:.1%}). Con $20,000 el efecto exigido ({100 * C_SEL * 12 / 20000:.0f} pp) es imposible.",
]
for k, t in enumerate(lect):
    c = ws.cell(row=rr0 + 1 + k, column=1, value=t); c.alignment = Alignment(wrap_text=True, vertical='top')
    ws.merge_cells(start_row=rr0 + 1 + k, start_column=1, end_row=rr0 + 1 + k, end_column=3); ws.row_dimensions[rr0 + 1 + k].height = 50
ws.column_dimensions['A'].width = 78; ws.column_dimensions['B'].width = 26; ws.column_dimensions['C'].width = 40

SAL_XLSX = RES / '20_modelo_sostenibilidad.xlsx'
wb.save(SAL_XLSX)
# Si LibreOffice está instalado, recalcula el libro para guardar los valores junto a las fórmulas
# (así se ve también en visores que no calculan). Si no está, Excel recalcula al abrir.
import shutil, subprocess, tempfile
if shutil.which('soffice'):
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(['soffice', '--headless', '--calc', '--convert-to', 'xlsx:Calc MS Excel 2007 XML', '--outdir', td, str(SAL_XLSX)], capture_output=True, timeout=150)
        out = Path(td) / SAL_XLSX.name
        if out.exists(): shutil.copyfile(out, SAL_XLSX)
print('costo laboral sel:', round(C_SEL, 2), '| copago pond:', round(COP_P, 2), '| subsidio pond:', round(SUB_P, 2))
print('elegibles CDMX:', round(ELEG), '| razón:', round(RAZON, 5))
for l in lect: print(l)
print('ok', SAL_XLSX)
