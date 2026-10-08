"""
Extrae de los CSV de resultados todas las cifras que citan los dos documentos de Word,
y las escribe en _valores.json.

Proyecto integrador 7.º semestre LCDN · Observatorio de Datos para la Economía del Cuidado
Creado: 2026-09-22.

POR QUÉ EXISTE ESTE ARCHIVO. La regla de trazabilidad del proyecto dice que ninguna cifra
nace en el documento de Word. Los scripts que construyen los .docx no llevan números
escritos a mano: leen este JSON, y este JSON se construye leyendo los CSV de análisis.
Si un CSV cambia, se vuelve a correr esto y los documentos se regeneran solos.

Las cifras que NO salen de un CSV del proyecto (salarios mínimos, INPC, presupuesto de la
CDMX, marco legal) viven en el bloque EXTERNO, cada una con su fuente y fecha de consulta.
"""
import json
from pathlib import Path
import pandas as pd

RES = Path('Analysis/resultados'); OUTP = Path('Analysis/outputs')
V = {}


def num(x):
    return round(float(x), 4)


# ───────── ENASIC · barreras (notebook 03) ─────────
b = pd.read_csv(RES / '03_enasic_barreras_estimaciones.csv').set_index('indicador')
def bi(k, campo='pct'): return num(b.loc[k, campo])

V['barreras'] = {
    'valida_32pct': bi('Población 15+ que brinda cuidados (publicado: 32.0%, 31.7 M)'),
    'valida_contrata': bi('Hogares que contratan enfermería o cuidadoras (publicado: 0.8%)'),
    'busco_servicio': bi('Cuidan discapacidad o 60+ | Buscó servicio (P6.42)'),
    'hogar_cuida': bi('Cuidan discapacidad o 60+ | No buscó por: El propio hogar cuida'),
    'no_necesidad': bi('Cuidan discapacidad o 60+ | No buscó por: No ha tenido necesidad'),
    'son_caros': bi('Cuidan discapacidad o 60+ | No buscó por: Son caros'),
    'desconoce': bi('Cuidan discapacidad o 60+ | No buscó por: DESCONOCE QUE EXISTEN'),
    'desconoce_cv': bi('Cuidan discapacidad o 60+ | No buscó por: DESCONOCE QUE EXISTEN', 'cv'),
    'desconfianza': bi('Cuidan discapacidad o 60+ | No buscó por: Incomodidad/desconfianza de que alguien ajeno cuide'),
    'lejania': bi('Cuidan discapacidad o 60+ | No buscó por: Lejanía'),
    'maltrato': bi('Cuidan discapacidad o 60+ | No buscó por: Maltrato del personal'),
    'en_su_casa': bi('Cuidan disc/60+ | En su casa'),
    'no_contrataria': bi('Cuidan disc/60+ | No contrataría'),
    'inst_publica': bi('Cuidan disc/60+ | Centro/institución pública'),
    'inst_privada': bi('Cuidan disc/60+ | Centro/institución privada'),
    'seria_cuidador': bi('Pob. 15-60 | Le gustaría ser cuidador(a) pagada(o)'),
    'seria_cuidador_mujeres': bi('Pob. 15-60 Mujeres | Le gustaría ser cuidador(a) pagada(o)'),
    'seria_cuidador_hombres': bi('Pob. 15-60 Hombres | Le gustaría ser cuidador(a) pagada(o)'),
    'se_capacitaria': bi('Pob. 15-60 | ...y se capacitaría (entre quienes sí)'),
    'contrata_cui_60': bi('Hogares con persona 60+ | Contrata enfermería o cuidadora'),
    'contrata_dom_60': bi('Hogares con persona 60+ | Contrata trabajo doméstico (entrada por salida)'),
    'contrata_cui_nec': bi('Hogares con discapacidad o 60+ | Contrata enfermería o cuidadora'),
    'contrata_dom_nec': bi('Hogares con discapacidad o 60+ | Contrata trabajo doméstico (entrada por salida)'),
    'cumplio_lo_buscado': bi('Todas cuidadoras que buscaron | Cumplió lo que buscaba'),
    'nc_costo': bi('No cumplió | Costo elevado'),
    'nc_no_capacitado': bi('No cumplió | Personal no capacitado'),
    'nc_lista_espera': bi('No cumplió | LISTA DE ESPERA (cupo insuficiente)'),
}

# Agregado el 2026-09-23 (v0.2 de los documentos): cifras de TODAS las personas cuidadoras.
# Las del universo discapacidad/60+ para "buscó" (CV 30.5) y "desconoce" (CV 38.0) tienen
# precisión baja y no deben citarse como hallazgo (bitácora, 23 sep 11:15).
V['barreras'].update({
    'busco_todas': bi('Todas las cuidadoras | Buscó servicio (P6.42)'),
    'busco_todas_cv': bi('Todas las cuidadoras | Buscó servicio (P6.42)', 'cv'),
    'busco_servicio_cv': bi('Cuidan discapacidad o 60+ | Buscó servicio (P6.42)', 'cv'),
    'desconoce_todas': bi('Todas las cuidadoras | No buscó por: DESCONOCE QUE EXISTEN'),
    'desconoce_todas_cv': bi('Todas las cuidadoras | No buscó por: DESCONOCE QUE EXISTEN', 'cv'),
})

# ───────── Contratación por quintil (script 04) ─────────
q = pd.read_csv(RES / '04_contratacion_por_quintil.csv')
q['servicio'] = q.servicio.str.strip()
cu = q[q.servicio.str.startswith('enfermer')].set_index('quintil')
do = q[q.servicio.str.startswith('dom')].set_index('quintil')
V['quintiles'] = {
    'cuidado': {f'q{i}': num(cu.loc[i, 'pct']) for i in range(1, 6)},
    'domestico': {f'q{i}': num(do.loc[i, 'pct']) for i in range(1, 6)},
    'corte_q5': int(cu.loc[5, 'ingreso_min']),
    'razon_q5': num(do.loc[5, 'pct'] / cu.loc[5, 'pct']),
    'razon_q1': num(do.loc[1, 'pct'] / cu.loc[1, 'pct']),
    'cui_q5_li': num(cu.loc[5, 'li90']), 'cui_q5_ls': num(cu.loc[5, 'ls90']),
    'cui_q1_li': num(cu.loc[1, 'li90']), 'cui_q1_ls': num(cu.loc[1, 'ls90']),
}

# ───────── Pago observado (script 04) ─────────
p = pd.read_csv(RES / '04_pago_observado_cuidado.csv')
def pg(serv, var, grupo='todos los hogares', campo='mediana'):
    f = p[(p.servicio == serv) & (p.variable == var) & (p.grupo == grupo)]
    return num(f[campo].iloc[0])
V['pago'] = {
    'cuidadora_sem_2022': pg('Cuidadora', 'pago_sem'),
    'cuidadora_sem_2026': pg('Cuidadora', 'pago_sem', campo='mediana_pesos_2026'),
    'cuidadora_horas_sem': pg('Cuidadora', 'horas_sem'),
    'cuidadora_hora_2026': pg('Cuidadora', 'pago_hora', campo='mediana_pesos_2026'),
    'cuidadora_hora_pond_2026': pg('Cuidadora', 'pago_hora', campo='mediana_ponderada_pesos_2026'),
    'cuidadora_hora_p25_2026': pg('Cuidadora', 'pago_hora', campo='p25_pesos_2026'),
    'cuidadora_hora_p75_2026': pg('Cuidadora', 'pago_hora', campo='p75_pesos_2026'),
    'cuidadora_n': int(p[(p.servicio == 'Cuidadora') & (p.variable == 'pago_hora') & (p.grupo == 'todos los hogares')].n.iloc[0]),
    'enfermeria_hora_2026': pg('Enfermería', 'pago_hora', campo='mediana_pesos_2026'),
    'enfermeria_n': int(p[(p.servicio == 'Enfermería') & (p.variable == 'pago_hora') & (p.grupo == 'todos los hogares')].n.iloc[0]),
    'domestica_hora_2026': pg('Doméstica entrada por salida', 'pago_hora', campo='mediana_pesos_2026'),
    'domestica_horas_sem': pg('Doméstica entrada por salida', 'horas_sem'),
    'domestica_n': int(p[(p.servicio == 'Doméstica entrada por salida') & (p.variable == 'pago_hora') & (p.grupo == 'todos los hogares')].n.iloc[0]),
}

# ───────── Ingreso y asequibilidad (scripts 03 y 04) ─────────
r4 = pd.read_csv(RES / '04_resumen.csv').set_index('indicador').valor
V['ingreso'] = {
    'mediana_2022': int(r4['Ingreso mensual mediano ponderado (monto o rango), hogares con necesidad, $2022']),
    'p25_2022': int(r4['Ingreso mensual p25 ponderado, hogares con necesidad, $2022']),
    'p75_2022': int(r4['Ingreso mensual p75 ponderado, hogares con necesidad, $2022']),
    'hogares_muestra': int(r4['Hogares con necesidad, muestra']),
    'hogares_expandido': int(r4['Hogares con necesidad (disc. o 60+), total expandido']),
    'factor_inpc': num(r4['Factor INPC nov-2022 -> ago-2026']),
}
a = pd.read_csv(RES / '04_asequibilidad_paquetes.csv')
def asq(sal, paq, campo):
    f = a[(a.salario == sal) & (a.paquete.str.startswith(paq))]
    return num(f[campo].iloc[0])
PL = 'Piso legal 2026 en pesos de 2022'; CA = 'Tabulador CACEH 2026 cat. 8 en pesos de 2022'
V['asequibilidad'] = {
    'legal_40_costo': int(asq(PL, '40', 'costo_mensual_2026')),
    'legal_40_pct20': asq(PL, '40', 'pct_hogares_costo_<=_20pct_ingreso'),
    'legal_20_costo': int(asq(PL, '20', 'costo_mensual_2026')),
    'legal_20_pct20': asq(PL, '20', 'pct_hogares_costo_<=_20pct_ingreso'),
    'legal_10_costo': int(asq(PL, '10', 'costo_mensual_2026')),
    'legal_10_pct20': asq(PL, '10', 'pct_hogares_costo_<=_20pct_ingreso'),
    'caceh_40_costo': int(asq(CA, '40', 'costo_mensual_2026')),
    'caceh_40_pct20': asq(CA, '40', 'pct_hogares_costo_<=_20pct_ingreso'),
    'caceh_20_costo': int(asq(CA, '20', 'costo_mensual_2026')),
    'caceh_20_pct20': asq(CA, '20', 'pct_hogares_costo_<=_20pct_ingreso'),
    'legal_40_pct_ingreso': asq(PL, '40', 'costo_pct_ingreso_mediano'),
}

# ───────── Subsidio (script 06) ─────────
s = pd.read_csv(RES / '06_subsidio_por_paquete.csv')
def sub(paq, base, campo):
    f = s[s.salario.str.startswith('Piso legal') & (s.paquete == paq) & (s.base == base)]
    return num(f[campo].iloc[0])
SC, CC = 'sin carga patronal', 'con IMSS e Infonavit (~22%)'
V['subsidio'] = {
    'l20_sin_costo': int(sub('20 h/sem', SC, 'costo_mensual_2026')),
    'l20_sin_25': int(sub('20 h/sem', SC, 'subsidio_para_25pct')),
    'l20_sin_25_pct': sub('20 h/sem', SC, 'pct_del_costo_25pct'),
    'l20_sin_25_mdp': int(sub('20 h/sem', SC, 'costo_anual_cdmx_mdp_25pct')),
    'l20_con_costo': int(sub('20 h/sem', CC, 'costo_mensual_2026')),
    'l20_con_25_mdp': int(sub('20 h/sem', CC, 'costo_anual_cdmx_mdp_25pct')),
    'l20_con_25': int(sub('20 h/sem', CC, 'subsidio_para_25pct')),
    'l10_sin_costo': int(sub('10 h/sem', SC, 'costo_mensual_2026')),
    'l10_sin_pct': sub('10 h/sem', SC, 'pct_hogares_sin_subsidio'),
    'l10_con_costo': int(sub('10 h/sem', CC, 'costo_mensual_2026')),
    'l10_con_pct': sub('10 h/sem', CC, 'pct_hogares_sin_subsidio'),
    'l20_con_pct': sub('20 h/sem', CC, 'pct_hogares_sin_subsidio'),
    'l40_con_pct': sub('40 h/sem', CC, 'pct_hogares_sin_subsidio'),
    'l40_con_costo': int(sub('40 h/sem', CC, 'costo_mensual_2026')),
    'l40_con_25_mdp': int(sub('40 h/sem', CC, 'costo_anual_cdmx_mdp_25pct')),
}

# ───────── Escala nacional y anclas presupuestales (script 06) ─────────
# Agregado el 2026-09-23, tras conocerse el Anexo Transversal 31 del PPEF 2026.
esc = pd.read_csv(RES / '06_escala_nacional.csv')
anc = pd.read_csv(RES / '06_anclas_presupuestales.csv').set_index('ancla').valor
def nal(paq, base, campo):
    f = esc[esc.salario.str.startswith('Piso legal') & (esc.paquete == paq) &
            (esc.base == base) & (esc.cobertura == '25%')]
    return num(f[campo].iloc[0])
V['federal'] = {
    'hogares_necesidad_nal': int(anc['Hogares con necesidad, nacional (ENASIC, expandido)']),
    'anexo31_mdp': int(anc['Anexo Transversal 31, PPEF 2026 (mdp)']),
    'semujeres_mdp': int(anc['Presupuesto 2026 Secretaria de las Mujeres (mdp)']),
    'n20_sin_mdp': int(nal('20 h/sem', SC, 'costo_anual_nacional_mdp')),
    'n20_sin_pct_anexo': nal('20 h/sem', SC, 'pct_anexo31'),
    'n20_sin_veces_sem': nal('20 h/sem', SC, 'veces_presupuesto_semujeres'),
    'n20_con_mdp': int(nal('20 h/sem', CC, 'costo_anual_nacional_mdp')),
    'n20_con_pct_anexo': nal('20 h/sem', CC, 'pct_anexo31'),
    'n20_con_veces_sem': nal('20 h/sem', CC, 'veces_presupuesto_semujeres'),
    'n40_con_mdp': int(nal('40 h/sem', CC, 'costo_anual_nacional_mdp')),
    'n40_con_pct_anexo': nal('40 h/sem', CC, 'pct_anexo31'),
}

# ───────── Dimensionamiento CDMX (script 05) ─────────
d5 = pd.read_csv(RES / '05_dimensionamiento_cdmx.csv').set_index('nivel').valor
t5 = pd.read_csv(RES / '05_tasas_y_anclajes.csv').set_index('concepto').valor
V['cdmx'] = {
    'hogares_necesidad': int(d5['Hogares CDMX con persona con discapacidad o 60+ (cota inferior)']),
    'hogares_contratan_cuidado': int(d5['Hogares CDMX que hoy contratan enfermería o cuidadora']),
    'hogares_contratan_domestico': int(d5['Hogares CDMX con necesidad que hoy contratan trabajo doméstico']),
    'razon_dom_cui': num(d5['Hogares CDMX con necesidad que hoy contratan trabajo doméstico'] /
                         d5['Hogares CDMX que hoy contratan enfermería o cuidadora']),
    'viviendas': int(t5['Viviendas particulares habitadas, CDMX']),
    'poblacion': int(t5['Población total, CDMX']),
    'pob60': int(t5['Población 60+, CDMX']),
    'tasa_necesidad_nal': num(t5['Tasa nacional de hogares con persona con discapacidad o 60+']),
}

# ───────── Territorio (notebooks 01 y 02) ─────────
o = pd.read_csv(OUTP / 'indice_por_tipo_servicio.csv').set_index('municipio')
c = pd.read_csv(RES / '02_indice_capacidad_residencial.csv').rename(columns={'Unnamed: 0': 'alc'}).set_index('alc')
V['territorio'] = {
    'asilos_total': int(o.asilos.sum()), 'centros_total': int(o.centros_dia.sum()),
    'nucleo': int(o.asilos.sum() + o.centros_dia.sum()),
    'iztapalapa_ind_asilos': num(o.loc['Iztapalapa', 'indice_asilos']),
    'iztapalapa_ind_centros': num(o.loc['Iztapalapa', 'indice_centros_dia']),
    'cuauhtemoc_ind_centros': num(o.loc['Cuauhtémoc', 'indice_centros_dia']),
    'milpa_alta_asilos': int(o.loc['Milpa Alta', 'asilos']),
    'iztapalapa_ql': num(c.loc['IZTAP', 'QL_p60_A']),
    'iztapalapa_plazas': int(c.loc['IZTAP', 'plazas']),
    'iztapalapa_por_mil': num(c.loc['IZTAP', 'plazas_por_1000_adl']),
    'mh_plazas': int(c.loc['MH', 'plazas']),
    'mh_por_mil': num(c.loc['MH', 'plazas_por_1000_adl']),
    'razon_mh_iztap': num(c.loc['MH', 'plazas_por_1000_adl'] / c.loc['IZTAP', 'plazas_por_1000_adl']),
    'alcaldias_sin_dato': int(c.plazas.isna().sum()),
}
sen = pd.read_csv(OUTP.parent / 'reproduccion_colmex_2026-09-22' / 'sensibilidad_indicador_adulta_mayor.csv')
V['territorio']['colmex_min'] = num(sen.viviendas_65mas_por_ocupado.min())
V['territorio']['colmex_max'] = num(sen.viviendas_65mas_por_ocupado.max())
V['territorio']['colmex_pub'] = num(sen[sen.variante.str.startswith('A.')].viviendas_65mas_por_ocupado.iloc[0])

# ───────── Referencias de mercado (matriz de 12 casos) ─────────
mr = pd.read_csv('Analysis/matrices/matriz_referencias_matching.csv')
V['referencias'] = {
    'n_casos': int(len(mr)),
    'n_cerradas': int(mr.caso.str.contains('cerrada').sum()),
    'n_matching': int(mr.es_matching.str.strip().str.lower().str.startswith('sí').sum()),
    'n_paga_familia': int(mr.quien_paga.str.contains('Familia', na=False).sum()),
}

# ───────── Necesidad, norma y daño declarado (notebook 07) ─────────
# Agregado el 2026-09-23 (v0.2).
e7 = pd.read_csv(RES / '07_enasic_necesidad_vs_norma_estimaciones.csv').set_index('indicador')
d7 = pd.read_csv(RES / '07_enasic_diferencias.csv').set_index('comparacion')
def e(k, campo='pct'): return num(e7.loc[k, campo])
DSN = '"Sin necesidad" | '
V['n07'] = {
    'sin_nec_menos20': e('Horas | <20 h | No ha tenido necesidad'),
    'sin_nec_40mas': e('Horas | >=40 h | No ha tenido necesidad'),
    'sin_nec_abvd40': e('ABVD y >=40 h | No ha tenido necesidad'),
    'dano_menos20': e(DSN + '<20 h | Algún daño (salud o trabajo)'),
    'dano_40mas': e(DSN + '>=40 h | Algún daño (salud o trabajo)'),
    'dano_abvd40': e(DSN + 'ABVD y >=40 h | Algún daño (salud o trabajo)'),
    'salud_menos20': e(DSN + '<20 h | Salud física deteriorada'),
    'salud_40mas': e(DSN + '>=40 h | Salud física deteriorada'),
    'peso_40_sn_dano': e('Peso en el universo | >=40 h, "sin necesidad" y algún daño'),
    'peso_40_sn_dano_li': e('Peso en el universo | >=40 h, "sin necesidad" y algún daño', 'li90'),
    'peso_40_sn_dano_ls': e('Peso en el universo | >=40 h, "sin necesidad" y algún daño', 'ls90'),
    'norma_familia': e('P7_7 | Familia'),
    'norma_gobierno': e('P7_7 | Instituciones de gobierno'),
    'acepta_unas_horas': e('P7_8 | De acuerdo: solo unas horas'),
    'rechaza_residencia': e('P7_8 | No está de acuerdo'),
    'iniciativa_propia': e('P6_38 | Iniciativa propia'),
    'no_res_familia': e('P7.11 | La responsabilidad es de hijas, hijos o familia'),
    'no_res_maltrato': e('P7.11 | Tratan mal a las personas'),
    'caros_q12': e('Ingreso | Q1-Q2 | Son caros'),
    'caros_q45': e('Ingreso | Q4-Q5 | Son caros'),
}
k_sn = '"No tuvo necesidad": <20 h menos >=40 h'
k_dn = 'Algún daño entre "sin necesidad": >=40 h menos <20 h'
V['n07'].update({
    'dif_sin_nec': num(d7.loc[k_sn, 'dif_pp']), 'dif_sin_nec_li': num(d7.loc[k_sn, 'li90']),
    'dif_sin_nec_ls': num(d7.loc[k_sn, 'ls90']),
    'dif_dano': num(d7.loc[k_dn, 'dif_pp']), 'dif_dano_li': num(d7.loc[k_dn, 'li90']),
    'dif_dano_ls': num(d7.loc[k_dn, 'ls90']),
})
# Personas del grupo prioritario, con el total expandido del propio notebook
V['n07']['peso_40_sn_dano_personas'] = int(e('Peso en el universo | >=40 h, "sin necesidad" y algún daño', 'total_expandido'))

# ───────── CSV de investigación (script 08) ─────────
# Agregado el 2026-09-23 (v0.2). Fuentes sin documentar: todo es PROBABLE.
t8 = pd.read_csv(RES / '08_dependencia_severa_alcaldia.csv').set_index('alcaldia')
b8 = pd.read_csv(RES / '08_brecha_cuidado_sexo.csv').set_index('Edad')
h8 = pd.read_csv(RES / '08_horas_cuidado_laboral.csv').set_index(['Edad', 'Sexo'])
q8 = pd.read_csv(RES / '08_calidad_datos.csv')
V['n08'] = {
    'dep_total': int(t8.total.sum()),
    'dep_iztap': int(t8.loc['IZTAP', 'total']), 'dep_iztap_pct': num(t8.loc['IZTAP', 'pct_cdmx']),
    'dep_gam': int(t8.loc['GAM', 'total']), 'dep_gam_pct': num(t8.loc['GAM', 'pct_cdmx']),
    'dep_dos_pct': num(100 * (t8.loc['IZTAP', 'total'] + t8.loc['GAM', 'total']) / t8.total.sum()),
    'h1829_m': num(b8.loc['18-29', 'Mujeres']), 'h1829_h': num(b8.loc['18-29', 'Hombres']),
    'h1829_razon': num(b8.loc['18-29', 'razon_M_H']),
    'tot3039_m': num(h8.loc[('30-39', 'Mujeres'), 'total']), 'tot3039_h': num(h8.loc[('30-39', 'Hombres'), 'total']),
    'h8089_h': num(b8.loc['80-89', 'Hombres']),
    'ayudas_max': int(q8.loc[q8.chequeo == 'max total_horas', 'valor'].iloc[0]),
}

# ───────── EXTERNO · cifras que no salen de un CSV del proyecto ─────────
V['externo'] = {
    'sm_general_2026_dia': 315.04,
    'sm_hogar_2026_dia': 342.47,
    'sm_hogar_2026_zlfn_dia': 440.87,
    'sm_hogar_2022_dia': 187.92,
    'caceh_cat8_dia': 904,
    'carga_patronal_pct': 22,
    'inpc_nov2022': 125.997,
    'inpc_ago2026': 145.462,
    'presupuesto_cuidados_2026_mdp': 6747.7,
    'anexo31_pct_pib': 1.2,
    'anexo31_pct_ppef': 3.97,
    'anexo31_programas': 47,
    'anexo31_instituciones': 27,
    'anexo31_pensiones_mdp': 166136,
    'anexo31_pensiones_pct': 36,
    'sidecu_centros': 118618,
    'sidecu_instituciones': 17,
    'presupuesto_cuidadoras_mdp': 7.3,
    'presupuesto_casas3r_mdp': 568,
    'fuentes': {
        'sm': 'CONASAMI, resolución publicada en el DOF el 9 de diciembre de 2025, vigente desde el 1 de enero de 2026. Consultado el 22 de septiembre de 2026.',
        'sm2022': 'CONASAMI, resolución publicada en el DOF el 8 de diciembre de 2021, vigente desde el 1 de enero de 2022. Consultado el 22 de septiembre de 2026.',
        'caceh': 'CACEH, Tabulador Salarial 2026 para las Personas Trabajadoras del Hogar (abril de 2026). Referencia de sociedad civil, NO es piso legal. Consultado el 22 de septiembre de 2026.',
        'inpc': 'INEGI, Índice Nacional de Precios al Consumidor, base segunda quincena de julio de 2018 = 100. Consultado el 22 de septiembre de 2026.',
        'imss': 'Obligación de inscribir al IMSS a personas trabajadoras del hogar desde enero de 2023. El 22% es una aproximación tomada de una calculadora de terceros; PENDIENTE de confirmar con la calculadora oficial del IMSS.',
        'presupuesto': 'Proyecto de Presupuesto de Egresos de la CDMX 2026, solicitud para el Sistema Público de Cuidados, reportada en prensa el 15 de octubre de 2025. Consultado el 22 de septiembre de 2026. PENDIENTE de contrastar con el decreto aprobado.',
        'ley': 'Ley del Sistema de Cuidados de la Ciudad de México: aprobada por el Congreso local el 26 de mayo de 2026 y promulgada el 2 de julio de 2026. Consultado el 22 de septiembre de 2026. PENDIENTE de leer el texto en la Gaceta Oficial.',
        'censo': 'INEGI, Censo de Población y Vivienda 2020, comunicado de resultados para la Ciudad de México.',
        'anexo31': 'Secretaría de las Mujeres, Anexo Transversal 31 del Proyecto de Presupuesto de Egresos de la Federación 2026, documento oficial en cuidados.mujeres.gob.mx. Consultado el 23 de septiembre de 2026. La composición por pensiones proviene del análisis de Fundar; el presupuesto de la Secretaría de las Mujeres está PENDIENTE de confirmar contra el PPEF.',
        'sidecu': 'Sistema de Información de Cuidados (SIDECU), Secretaría de las Mujeres y SNDIF, presentado el 5 de noviembre de 2025. Cifras de cobertura tomadas de prensa especializada; PENDIENTE de verificar en la plataforma y de determinar si los datos son descargables.',
    },
}

Path('_valores.json').write_text(json.dumps(V, ensure_ascii=False, indent=1), encoding='utf-8')
print('_valores.json escrito ·', sum(len(v) if isinstance(v, dict) else 1 for v in V.values()), 'valores')
for k in V:
    print(' ', k, len(V[k]) if isinstance(V[k], dict) else '')
