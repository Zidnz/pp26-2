# Genera Documentos/_valores.json a partir de los resultados de los notebooks 02 y 03.
# Uso (desde Analysis/):  python ../Documentos/generar_valores.py
# Recuperado el 2026-09-21 de la sesion del 20 sept; requiere que el notebook 03 se haya ejecutado.
import pandas as pd, json
r3=pd.read_csv('resultados/03_enasic_barreras_estimaciones.csv')
r2=pd.read_csv('resultados/02_indice_capacidad_residencial.csv',index_col=0)
pr=pd.read_csv('resultados/03_precio_vs_ingreso_muestra.csv')
en=pd.read_csv('datos/enasic_2022_cifras_presentacion.csv')
V={}
def g3(k,ind):
    m=r3[r3.indicador==ind]; assert len(m)==1,ind; x=m.iloc[0]
    V[k]=dict(pct=f"{x.pct:.1f}",cv=f"{x.cv:.1f}",li=f"{x.li90:.1f}",ls=f"{x.ls90:.1f}",prec=x.precision,n=int(x.n_muestra_dominio),tot=int(x.total_expandido))
g3('val_cuida','Población 15+ que brinda cuidados (publicado: 32.0%, 31.7 M)')
g3('val_contrata','Hogares que contratan enfermería o cuidadoras (publicado: 0.8%)')
g3('busca_todas','Todas las cuidadoras | Buscó servicio (P6.42)')
g3('busca_obj','Cuidan discapacidad o 60+ | Buscó servicio (P6.42)')
for k,e in [('nonec','No ha tenido necesidad'),('hogar','El propio hogar cuida'),('apoyan','Apoyan otros hogares/familiares/conocidos'),('caros','Son caros'),('desc','DESCONOCE QUE EXISTEN'),('desconf','Incomodidad/desconfianza de que alguien ajeno cuide'),('lej','Lejanía'),('maltrato','Maltrato del personal')]:
    g3('obj_'+k,f'Cuidan discapacidad o 60+ | No buscó por: {e}')
    g3('todas_'+k,f'Todas las cuidadoras | No buscó por: {e}')
    g3('p1560_'+k,f'Población 15-60 | No buscó por: {e}')
g3('cumplio','Todas cuidadoras que buscaron | Cumplió lo que buscaba')
for k,e in [('casa','En su casa'),('pub','Centro/institución pública'),('priv','Centro/institución privada'),('fam','Casa de familiar/amistad/conocido'),('no','No contrataría')]:
    g3('prefobj_'+k,f'Cuidan disc/60+ | {e}'); g3('pref1560_'+k,f'Pob. 15-60 | {e}')
g3('oferta','Pob. 15-60 | Le gustaría ser cuidador(a) pagada(o)')
g3('capac','Pob. 15-60 | ...y se capacitaría (entre quienes sí)')
g3('oferta_m','Pob. 15-60 Mujeres | Le gustaría ser cuidador(a) pagada(o)')
g3('oferta_h','Pob. 15-60 Hombres | Le gustaría ser cuidador(a) pagada(o)')
g3('oferta_cui','Todas cuidadoras | Le gustaría ser cuidador(a) pagada(o)')
g3('contr_cual','Hogares con discapacidad o 60+ | Contrata enfermería o cuidadora')
g3('dom_cual','Hogares con discapacidad o 60+ | Contrata trabajo doméstico (entrada por salida)')
g3('contr_disc','Hogares con persona con discapacidad | Contrata enfermería o cuidadora')
for i,row in pr.iterrows(): V[f'precio{i}']=dict(v=row.valor, n=row.n if pd.notna(row.n) else None, ind=row.indicador)
for a in ['IZTAP','IZTAC','GAM','MH','TLAL','BJ']:
    V['ql_'+a]={c:(None if pd.isna(r2.loc[a,c]) else f"{r2.loc[a,c]:.2f}") for c in ['QL_p60_A','QL_p80_A','QL_adl_A','QL_p60_B']}
    V['ql_'+a]['plazas']=None if pd.isna(r2.loc[a,'plazas']) else int(r2.loc[a,'plazas'])
V['plazas_total_A']=int(r2.plazas.sum())
p60=pd.read_csv('datos/Población de más de 60 años.csv'); p60.columns=[c.strip() for c in p60.columns]
iz=p60[p60.NOM_MUN=='Iztapalapa'].PORCENTAJE.sum(); tot=p60[p60.NOM_MUN=='Ciudad de México'].PORCENTAJE.sum()
V['iztap_share60']=f"{iz/tot*100:.1f}"; V['iztap_share_plazas']=f"{20/V['plazas_total_A']*100:.1f}"
def ge(lam,cat,univ=None):
    m=en[(en.lamina_pdf.astype(str)==str(lam))&(en.categoria==cat)]
    if univ: m=m[m.universo.str.contains(univ,regex=False)]
    assert len(m)==1,(lam,cat,len(m)); return f"{m.valor.iloc[0]:.1f}"
V['e_disc_norecibe']=ge(16,'No','discapacidad'); V['e_60disc_norecibe']=ge(26,'No')
V['e_mas_tiempo']=ge(19,'Sí'); V['e_enf_disc']=ge(19,'Apoyo de enfermería o persona cuidadora'); V['e_resdia_disc']=ge(19,'Residencia de día')
V['e_enf_60']=ge(29,'Personal de enfermería / persona cuidadora o de compañía'); V['e_resperm_60']=ge(29,'Residencia permanente')
V['e_asiste_centro']=ge(17,'Sí'); V['e_no_trabaja']=ge(47,'No tiene quién cuide a hijos/adultos mayores/enfermos')
V['e_rechazo_res']=ge(52,'Sí'); V['e_fam']=ge(52,'Responsabilidad de hijos o familia'); V['e_maltrato']=ge(52,'Tratan mal a las personas'); V['e_caros']=ge(52,'Son muy caros')
V['e_capacitado']=ge(51,'Personal capacitado'); V['e_trato']=ge(51,'Buen trato'); V['e_precio']=ge(51,'Precio accesible')
V['e_contrata_enf']=ge('comunicado p.14','Enfermería o cuidados (niñas/os, adultos mayores, discapacidad o enfermedad)')
V['e_contrata_dom']=ge('comunicado p.14','Trabajo doméstico')
json.dump(V,open('../Documentos/_valores.json','w'),ensure_ascii=False,indent=1,default=str)
print(len(V)); print({k:V[k] for k in ['obj_desc','todas_desc','obj_caros','precio6','ql_IZTAP','iztap_share60','iztap_share_plazas']})
