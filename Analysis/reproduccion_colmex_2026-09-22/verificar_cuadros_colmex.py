import pandas as pd
# Cuadro 2.2 (DENUE 2025): total unid, total pers, inf u, inf p, am u, am p, disc u, disc p
c22 = {
'Azcapotzalco':(179,2757,146,2260,17,312,16,185),
'Coyoacán':(290,4857,210,3897,29,392,51,568),
'Cuajimalpa':(133,2022,95,1495,23,435,15,92),
'Gustavo A. Madero':(484,6549,348,5313,70,629,66,607),
'Iztacalco':(164,2388,122,1830,27,386,15,172),
'Iztapalapa':(708,7303,516,5946,108,484,84,873),
'Magdalena Contreras':(125,1860,87,1232,19,323,19,305),
'Milpa Alta':(94,826,49,652,34,102,11,72),
'Álvaro Obregón':(362,4379,244,3292,46,484,72,603),
'Tláhuac':(190,1997,121,1671,38,139,31,187),
'Tlalpan':(344,4335,243,3494,52,440,49,401),
'Xochimilco':(178,2093,105,1464,44,321,29,308),
'Benito Juárez':(218,3907,160,2928,21,438,37,541),
'Cuauhtémoc':(263,5414,207,4558,29,367,27,489),
'Miguel Hidalgo':(219,3908,162,3052,28,461,29,395),
'Venustiano Carranza':(194,2528,144,2138,22,157,28,233),
}
c22 = pd.DataFrame(c22, index=['tot_u','tot_p','inf_u','inf_p','am_u','am_p','dis_u','dis_p']).T
# Cuadro 2.3 (Censo 2020): viviendas, jef fem, inf, am, disc, 2+ grupos, pct
c23 = {
'Azcapotzalco':(132362,55300,18007,42416,16136,34939),
'Coyoacán':(184264,73665,23638,66503,19114,46527),
'Cuajimalpa':(66220,23827,11368,16698,6078,13554),
'Gustavo A. Madero':(332413,134495,51167,113702,50791,96452),
'Iztacalco':(116121,47153,18522,36618,15833,31709),
'Iztapalapa':(488986,186922,86440,135685,61811,121391),
'Magdalena Contreras':(69294,26959,11530,21140,8629,18313),
'Milpa Alta':(39534,13425,9222,7899,5936,9360),
'Álvaro Obregón':(215988,86862,33392,64356,24450,53231),
'Tláhuac':(104103,35553,19862,22935,13641,22109),
'Tlalpan':(195648,74724,32763,51991,23626,45806),
'Xochimilco':(113895,45238,20531,30938,16350,29757),
'Benito Juárez':(175375,76119,14114,46968,13966,35509),
'Cuauhtémoc':(201317,92488,22009,48064,19725,44997),
'Miguel Hidalgo':(149989,63191,17913,43281,12037,32788),
'Venustiano Carranza':(134950,61359,19804,40284,15308,36725),
}
c23 = pd.DataFrame(c23, index=['viv','jef','inf','am','dis','dos_mas']).T
pub24 = {'Azcapotzalco':(8.0,135.9,87.2),'Coyoacán':(6.1,169.7,33.7),'Cuajimalpa':(7.6,38.4,66.1),'Gustavo A. Madero':(9.6,180.8,83.7),
'Iztacalco':(10.1,94.9,92.1),'Iztapalapa':(14.5,280.3,70.8),'Magdalena Contreras':(9.4,65.4,28.3),'Milpa Alta':(14.1,77.4,82.4),
'Álvaro Obregón':(10.1,133.0,40.5),'Tláhuac':(11.9,165.0,72.9),'Tlalpan':(9.4,118.2,58.9),'Xochimilco':(14.0,96.4,53.1),
'Benito Juárez':(4.8,107.2,25.8),'Cuauhtémoc':(4.8,131.0,40.3),'Miguel Hidalgo':(5.9,93.9,30.5),'Venustiano Carranza':(9.3,256.6,65.7)}
pub24 = pd.DataFrame(pub24, index=['p_inf','p_am','p_dis']).T
d = c22.join(c23).join(pub24)
print('Sumas c22 vs total publicado (4145,57123,2959,45222,607,5870,579,6031):'); print(c22.sum().to_dict())
print('Consistencia interna c22 (tot = inf+am+dis):'); print(((d.inf_u+d.am_u+d.dis_u)-d.tot_u).to_dict()); print(((d.inf_p+d.am_p+d.dis_p)-d.tot_p).to_dict())
print('Sumas c23 vs (2720459,1097280,410282,789478,323431,673167):'); print(c23.sum().to_dict())
d['r_inf']=(d.inf/d.inf_p).round(1); d['r_am']=(d.am/d.am_p).round(1); d['r_dis']=(d.dis/d.dis_p).round(1)
d['pct_dos']=(100*d.dos_mas/d.viv).round(1)
d['dif']=(d[['r_inf','r_am','r_dis']].values-d[['p_inf','p_am','p_dis']].values).__abs__().max(axis=1)
print(d[['r_inf','p_inf','r_am','p_am','r_dis','p_dis','dif','pct_dos']].to_string())
print('CDMX ratios:', round(410282/45222,1), round(789478/5870,1), round(323431/6031,1))
print('Cuadro 2.6 suma viviendas:', 904370+1142922+549381+116357+7429)
for n,v in [('total',18284),('jef',15718),('inf',19657),('am',13628),('dis',14535),('1g',17664),('2g',13969),('3g',13617),('4g',13189)]:
    print(n, round(100*(22306-v)/22306,1))
print('pct 4.1 check VC:', [round(100*x/134950,1) for x in (19804,40284,15308,61359)], 'MH:', [round(100*x/149989,1) for x in (17913,43281,12037,63191)])

# --- Exportar tabla transcrita + recalculada ---
claves = {'Azcapotzalco':9002,'Coyoacán':9003,'Cuajimalpa':9004,'Gustavo A. Madero':9005,'Iztacalco':9006,'Iztapalapa':9007,
'Magdalena Contreras':9008,'Milpa Alta':9009,'Álvaro Obregón':9010,'Tláhuac':9011,'Tlalpan':9012,'Xochimilco':9013,
'Benito Juárez':9014,'Cuauhtémoc':9015,'Miguel Hidalgo':9016,'Venustiano Carranza':9017}
out = d.copy()
out.insert(0,'cve_alcaldia',[claves[i] for i in out.index])
out.index.name='alcaldia'
out = out.rename(columns={
 'tot_u':'denue25_unidades_total','tot_p':'denue25_personal_total','inf_u':'denue25_unidades_infantil','inf_p':'denue25_personal_infantil',
 'am_u':'denue25_unidades_adulta_mayor','am_p':'denue25_personal_adulta_mayor','dis_u':'denue25_unidades_discapacidad','dis_p':'denue25_personal_discapacidad',
 'viv':'censo20_viviendas_total','jef':'censo20_viv_jefatura_femenina','inf':'censo20_viv_con_0a4','am':'censo20_viv_con_65mas',
 'dis':'censo20_viv_con_discapacidad','dos_mas':'censo20_viv_dos_o_mas_grupos',
 'p_inf':'publicado_viv_por_ocupado_infantil','p_am':'publicado_viv_por_ocupado_adulta_mayor','p_dis':'publicado_viv_por_ocupado_discapacidad',
 'r_inf':'recalc_viv_por_ocupado_infantil','r_am':'recalc_viv_por_ocupado_adulta_mayor','r_dis':'recalc_viv_por_ocupado_discapacidad',
 'dif':'max_dif_publicado_vs_recalc','pct_dos':'recalc_pct_viv_dos_o_mas_grupos'})
out['fuente']='CESA-CDMX y CEDUA-Colmex (2026), Economía del cuidado. Resumen ejecutivo; cuadros 2.2, 2.3 y 2.4 (pp. 33-37)'
out['estatus']='Transcrito de la publicación y verificado aritméticamente; NO reproducido desde microdatos Censo 2020 ni DENUE 2025'
out['fecha_consulta']='2026-09-22'
out.to_csv('colmex_cuadros_2_2_a_2_4_por_alcaldia.csv', encoding='utf-8')
print('OK', out.shape)
