/* Observatorio del Cuidado · js/vistas/necesidad.js
   Pestaña «¿Quién lo carga?»: necesidad contra daño, diferencias con IC, grupo del problema, perfil y horas.
   Importa de OBS: $, C, C_INK, F, FAINT, G, K, MONO, S2, S2L, SG, alSeg, dl, esc, filtroAplica, fmt, iconosDano, isWeak, lineas, mill, prec, segName, svg
   Exporta a OBS:  — (registra su redibujo en OBS.alSeg)
   14 oct 2026: el filtro de segmento aplica a toda la pestaña. Fila de KPI arriba; carga, diferencias, grupo y horas se
   re-estiman por segmento (D.seg2, sección 12b). Perfil y «horas por sexo y edad» no se recortan y lo dicen en pantalla.
   Respaldo de la versión anterior: _to_delete/backup_pre_filtro_pestana_2026-10-14/
   21 oct 2026: tarjeta de segmentación por clases latentes (D.seg23, notebook 23). Respaldo: _to_delete/backup_pre_seg23_observatorio_2026-10-21/ */
(function(){
  var $=OBS.$,C=OBS.C,FAINT=OBS.FAINT,G=OBS.G,K=OBS.K,MONO=OBS.MONO,dl=OBS.dl
      ,esc=OBS.esc,fmt=OBS.fmt,isWeak=OBS.isWeak,lineas=OBS.lineas,mill=OBS.mill
      ,pict=OBS.pict,prec=OBS.prec,svg=OBS.svg,iconosDano=OBS.iconosDano
      ,F=OBS.F,S2=OBS.S2,S2L=OBS.S2L,SG=OBS.SG,segName=OBS.segName,aplica=OBS.filtroAplica;
  function nS(r){return r?Object.assign({},r,{n:r.n_muestra_dominio}):r}
  function pre(){return '<b>'+esc(segName())+':</b> '}
  function sigOk(v){return v===true||v==='True'}

  /* ---- KPI de la pestaña (14 oct 2026): reaccionan al filtro. Fuente: sección 12b y script 12 ---- */
  function kpis(){
    var P=S2('kpi','personas'),Ht=S2('kpi','horas_total'),Hm=S2('kpi','horas_media'),tot=F.dim==='Total',
        h40=F.dim==='Intensidad'?null:SG('horas40');
    function ic(a,b,u){return '<span class="chip">IC 90% '+a+'–'+b+(u||'')+'</span>'}
    var T=[
      {k:'Personas que cuidan a alguien con discapacidad o 60+',v:mill(P.total_expandido),l:tot?'cuidan a una persona con discapacidad o de 60 años y más':fmt(P.pct)+'% de quienes cuidan a una persona con discapacidad o de 60+',p:P.precision,c:tot?'':ic(fmt(P.li90),fmt(P.ls90),'%')},
      {k:'Horas semanales de cuidado no pagado',v:fmt(Ht.pct/1e6,0)+' M h',l:'a la semana: equivalen a <b>'+mill(Ht.pct/40)+'</b> jornadas de 40 h. Promedio: '+fmt(Hm.pct,0)+' h por persona.',p:Ht.precision,c:ic(fmt(Ht.li90/1e6,0),fmt(Ht.ls90/1e6,0),' M h')},
      h40?{k:'% de quienes cuidan que dedica 40 h o más a la semana',v:fmt(h40.pct)+'%',l:'una jornada de tiempo completo, sin pago',p:h40.precision,c:ic(fmt(h40.li90),fmt(h40.ls90),'%')}
         :{k:'% de quienes cuidan que dedica 40 h o más a la semana',v:'—',l:'No aplica: el filtro ya es por horas de cuidado.',na:true}];
    $('#kpi-nec').innerHTML=T.map(function(t){
      return OBS.tile({k:t.k,v:t.v,fs:30,est:!t.na&&!!t.c,na:t.na,weak:t.p&&isWeak(t.p),color:t.alerta?'var(--alert)':'',
        det:'<div class="lbl">'+t.l+'</div>'+(t.na?'':'<div class="chips">'+(t.p?prec(t.p):'')+(t.c||'')+'</div>'),
        fuente:t.na?'':'ENASIC 2022 · nacional'+(tot?'':' · segmento: '+esc(segName()))})}).join('');
    $('#src-kpi-nec').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional (ENASIC 2022, TPOB_CUI, FAC_CUI)',Segmento:esc(segName())+' · n = '+P.n_muestra_dominio+' en la muestra',
      Horas:'Σ FAC_CUI × (P6.7 + P6.26), tope de 168. Aproximado: cada bloque topa en "98 o más" y P6.26 puede incluir cuidado a menores. Jornadas = horas ÷ 40.',
      Archivos:esc(D.seg2_fuente)+' · '+esc(D.seg_fuente)});
  }

  function carga(){
    var on=aplica('horas'),LB=['Menos de 20 h','20 a 39 h','40 h o más'],nec,dan;
    if(on){nec=S2L('carga_sinnec').map(nS);dan=S2L('carga_dano').map(nS)}else{nec=C.sin_necesidad;dan=C.dano}
    $('#cargaFind').innerHTML=(on?pre():'')+'Con 40 h o más, <b>'+fmt(dan[2].pct)+'%</b> de quienes dicen "no tuve necesidad" declara daño; con menos de 20 h, '+fmt(dan[0].pct)+'%. Decir "no tuve necesidad" '+(nec[2].pct<nec[0].pct?'baja de ':'pasa de ')+fmt(nec[0].pct)+'% a '+fmt(nec[2].pct)+'%.';
    var cw0=document.getElementById('ch-carga').clientWidth;
    $('#ch-carga').innerHTML=iconosDano(LB.map(function(l,i){return {lbl:l,nec:nec[i],dano:dan[i]}}),cw0>0?Math.max(660,Math.min(980,cw0)):980);
    /* 3 nov 2026: la prueba 40 h vs. menos de 20 h vivía en su propia tarjeta («¿Cuánto cambia…?»), que repetía estas cifras. Queda aquí, para el equipo. */
    function pr(nm,d,li,ls,ok){return nm+': '+(d>0?'+':'')+fmt(d)+' puntos (IC 90 % '+fmt(li)+' a '+fmt(ls)+')'+(ok?'':', no se distingue de 0')}
    var cmpTxt;
    if(on){cmpTxt=['sinnec','hogar','dano'].map(function(k){var r=S2('dif',k);return r?pr(esc(r.etiqueta),r.pct,r.li90,r.ls90,sigOk(r.dif_significativa)):''}).filter(Boolean).join(' · ')}
    else{cmpTxt=C.diferencias.map(function(d){var inv=/<20 h menos >=40 h|Q1 menos Q4/.test(d.comparacion);
      return pr(esc(d.comparacion.split(':')[0])+(/Q[14]/.test(d.comparacion)?' (cuartil de horas más alto frente al más bajo)':''),inv?-d.dif_pp:d.dif_pp,inv?-d.ls90:d.li90,inv?-d.li90:d.ls90,d.excluye_cero===true||d.excluye_cero==='True')}).join(' · ')}
    $('#src-carga').innerHTML=dl({Fuente:'INEGI, ENASIC 2022, microdatos (TPOB_CUI, FAC_CUI)',Cobertura:'Nacional',Preguntas:'P6.7, P6.26, P6.42, P6.45, P6.11–P6.12, P6.30–P6.31',Advertencia:'P6.45 pregunta por lugares. El INEGI rotula la opción "NO HA TENIDO NECESIDAD (NO HAY PERSONAS EN SU HOGAR QUE REQUIERAN CUIDADOS)": puede leerse como "no necesito un lugar" o como que la persona cuidada vive en otro hogar. Daños autodeclarados.',Comparación:'40 h o más frente a menos de 20 h, en puntos porcentuales: '+cmpTxt+'. Varias comparaciones al 90 % sin corrección por comparaciones múltiples.',Archivo:esc(on?D.seg2_fuente:C.fuente)+(on?'':' · Analysis/resultados/07_enasic_diferencias.csv')});
  }
  /* ---- 3 nov 2026: afectaciones por horas de cuidado (notebook 31, D.afect_horas). Reemplaza «¿Cuánto cambia con más horas?».
     Responde al filtro de segmento; con Intensidad muestra el total (la gráfica ya está cortada por horas). Nada escrito a mano. ---- */
  var AF_ORD=['salud3','cansado','sueno','salud','deprimido','irritado','terapia','enfermedad'];
  var AF_NOM={salud3:'Al menos una: salud física, cansancio o sueño',cansado:'Se siente cansado/a',sueno:'Duerme menos',salud:'Su salud física se deterioró',deprimido:'Se siente deprimido/a',irritado:'Se siente irritado/a',terapia:'Recibió terapia por ansiedad o depresión',enfermedad:'Desarrolló una enfermedad o se le agravó'};
  var AF_CORTO={cansado:'cansancio',sueno:'dormir menos',salud:'salud física',deprimido:'depresión',irritado:'irritabilidad',terapia:'terapia',enfermedad:'enfermedad'};
  var AF_H=[['<20 h','Menos de 20 h','#d9d3e8'],['20-39 h','20 a 39 h','#a99bcb'],['>=40 h','40 h o más','#5d4d8f']];
  function afh(){
    var A=D.afect_horas,on=aplica('horas'),dim=on?F.dim:'Total',sg=on?F.seg:'Total';
    function r(k,h){return A.filas.filter(function(x){return x.dimension===dim&&x.segmento===sg&&x.clave===k&&x.horas===h})[0]}
    function lista(a){return a.length>1?a.slice(0,-1).join(', ')+' y '+a[a.length-1]:a.join('')}
    var s40=r('salud3','>=40 h'),s20=r('salud3','<20 h'),
        poco=function(k){return isWeak(r(k,'>=40 h').precision)||isWeak(r(k,'<20 h').precision)},
        sube=AF_ORD.filter(function(k){return k!=='salud3'&&!poco(k)&&sigOk(r(k,'>=40 h').dif_significativa)}),
        igual=AF_ORD.filter(function(k){return k!=='salud3'&&!poco(k)&&!sigOk(r(k,'>=40 h').dif_significativa)}),
        pocos=AF_ORD.filter(function(k){return k!=='salud3'&&poco(k)});
    $('#afhFind').innerHTML=(on?pre():F.dim==='Intensidad'?'<b>Total nacional</b> (esta gráfica ya está cortada por horas): ':'')+
      'Con 40 h o más a la semana, <b>'+fmt(s40.pct,0)+' de cada 100</b> declaran al menos una afectación de salud por cuidar (salud física, cansancio o sueño); con menos de 20 h, '+fmt(s20.pct,0)+' de cada 100. '+
      (sube.length?'Suben claramente con las horas: '+lista(sube.map(function(k){return AF_CORTO[k]}))+'. ':'')+
      (igual.length?'En '+lista(igual.map(function(k){return AF_CORTO[k]}))+' no se ve un cambio claro'+(on?' en este segmento':'')+'. ':'')+
      (pocos.length?'En '+lista(pocos.map(function(k){return AF_CORTO[k]}))+' hay muy pocos casos para saberlo.':'');
    var vals=[];A.filas.forEach(function(x){if(x.dimension===dim&&x.segmento===sg&&!isWeak(x.precision))vals.push(x.ls90)});
    var mx=Math.min(100,Math.ceil(Math.max.apply(null,vals)/20)*20),W=480;
    /* 5 nov 2026 (diseño): mancuerna en lugar de barras agrupadas. Una fila por afectación con los extremos (menos de 20 h y 40 h o más), punto intermedio (20 a 39 h) y la diferencia al lado; se ordena por diferencia y se separa en «suben con claridad / sin cambio claro / muy pocos casos». Mismas cifras de D.afect_horas.
       Antes: barras agrupadas en dos columnas con OBS.barrasGrupo (3 nov 2026). */
    function fila(k){var lo=r(k,'<20 h'),mi=r(k,'20-39 h'),hi=r(k,'>=40 h'),w=poco(k);
      return {nombre:AF_NOM[k],resumen:k==='salud3',lo:lo,mid:mi,hi:hi,dif:hi.dif_pp,difLi:hi.dif_li90,difLs:hi.dif_ls90,poco:w,clara:!w&&sigOk(hi.dif_significativa)}}
    function porDif(a,b){return b.dif-a.dif}
    var FS=AF_ORD.filter(function(k){return k!=='salud3'}).map(fila),
        okc=FS.filter(function(f){return f.clara}).sort(porDif).map(function(f){f.grupo='Suben con claridad';return f}),
        nsc=FS.filter(function(f){return !f.clara&&!f.poco}).sort(porDif).map(function(f){f.grupo='Sin cambio claro';return f}),
        pcs=FS.filter(function(f){return f.poco}).sort(porDif).map(function(f){f.grupo='Muy pocos casos';return f}),
        res=fila('salud3');res.grupo='En resumen';
    $('#ch-afh').innerHTML='<div class="legend mc-leg"><span><i class="mc-ld lo"></i>Menos de 20 h</span><span><i class="mc-ld mid"></i>20 a 39 h</span><span><i class="mc-ld hi"></i>40 h o más</span><span>Línea tenue: intervalo de confianza al 90 % de 40 h o más</span></div>'+
      OBS.mancuerna([res].concat(okc,nsc,pcs),{max:mx,nombres:['menos de 20 h','20 a 39 h','40 h o más'],aria:'Afectaciones declaradas por cuidar: de menos de 20 horas a 40 horas o más'});
    var EQ=AF_ORD.map(function(k){var x=r(k,'>=40 h');return esc(AF_CORTO[k]||'al menos una de salud')+' '+(x.dif_pp>0?'+':'')+fmt(x.dif_pp)+' ('+fmt(x.dif_li90)+' a '+fmt(x.dif_ls90)+')'}).join(' · ');
    var AT=D.afectaciones.filas,ua=function(sx){return AT.filter(function(x){return x.universo.charAt(0)==='A'&&x.sexo===sx&&x.clave==='salud3'})[0]};
    $('#src-afh').innerHTML=dl({Universo:(on?esc(segName())+' · ':'')+'Personas cuidadoras de persona con discapacidad o 60+, nacional (ENASIC 2022, TPOB_CUI, FAC_CUI; n = '+AF_H.reduce(function(a,h){return a+r('salud3',h[0]).n_muestra_dominio},0)+')',
      Preguntas:'«Por el cuidado que usted otorga, ¿…?»: P6.11.1 a P6.11.7 y P6.30.1 a P6.30.7; cuenta «sí» en cualquiera de los dos bloques. Horas: P6.7 + P6.26, tope de 168.',
      Comparación:'Diferencia entre 40 h o más y menos de 20 h, en puntos porcentuales e IC 90 %: '+EQ+'.',
      INEGI:'La presentación de resultados de INEGI usa a todas las personas cuidadoras y no corta por horas: ahí, al menos una afectación de salud la declaran '+fmt(ua('Mujeres').pct)+'% de las mujeres y '+fmt(ua('Hombres').pct)+'% de los hombres (se reproducen sus 14 cifras al decimal; notebook 31).',
      Advertencia:'<b>Sin doble revisión.</b> Lo que las personas declaran, no un diagnóstico. Horas y afectaciones se miden en la misma entrevista: no prueba que más horas causen más afectación. Cada bloque de horas topa en «98 o más».',
      Archivo:esc(A.fuente)});
  }
  /* 7 oct 2026 (noche): KPI del grupo del problema con jerarquía de portada: título y cifra grandes a la izquierda, 79.6% arriba a la derecha */
  function grupo(){
    var tot=F.dim==='Total',g=tot?(K.grupo_problema_salud3||G):S2('kpi','grupo'),na=F.dim==='Intensidad'&&F.seg!=='>=40 h',s3=tot&&!!K.grupo_problema_salud3;
    if(na){$('#grupo').innerHTML='<div class="gp"><h3 class="gp-tit">El grupo del problema</h3><div class="gp-big num">—</div>'+
      '<p class="gp-desc">No aplica a '+esc(segName())+': el grupo exige cuidar 40 h o más. En el total nacional son ≈ '+mill((K.grupo_problema_salud3||G).total_expandido)+' personas.</p></div>';return}
    $('#grupo').innerHTML='<div class="gp">'+
      '<h3 class="gp-tit">El grupo del problema</h3><div class="gp-big num">≈ '+mill(g.total_expandido)+'</div>'+
      (s3?'<div class="gp-side"><div class="gp-pct num">'+fmt(g.li90)+'–'+fmt(g.ls90)+'%</div><div class="lbl">rango probable de ese porcentaje</div></div>':tot?'<div class="gp-side"><div class="gp-pct num">'+fmt(C.nucleo_dano.pct)+'%</div><div class="lbl">declara algún daño (a su salud o a su trabajo) entre quienes además bañan, visten o dan de comer</div></div>'
          :'<div class="gp-side"><div class="gp-pct num">'+mill(G.total_expandido)+'</div><div class="lbl">en el total nacional, como referencia</div></div>')+
      '<p class="gp-desc">personas cuidadoras: cuidan 40 h o más, dicen "no tuve necesidad" y declaran '+(s3?'daño a su salud (salud física, cansancio o sueño)':'algún daño (a su salud o a su trabajo)')+'. Son el <b>'+fmt(g.pct)+'%</b> de quienes cuidan a una persona con discapacidad o 60+'+(tot?'':' en este segmento (IC 90% '+fmt(g.li90)+'–'+fmt(g.ls90)+'%)')+'.</p>'+
      '<div class="chips gp-chips">'+prec(g.precision)+'<span class="chip ev">probable</span><span class="chip geo">nacional</span></div></div>';
  }
  (function(){
    var rows=D.brecha_sexo.filter(function(r){return r.h!=null&&r.m!=null}),r1829=D.brecha_sexo.filter(function(r){return r.edad==='18-29'})[0];
    $('#sexoFind').innerHTML='Entre los 18 y 29 años, las mujeres cuidan <b>'+fmt(r1829.razon,2)+' veces</b> las horas de los hombres. La brecha se cierra con la edad.';
    var mxs=Math.ceil(Math.max.apply(null,rows.map(function(r){return Math.max(r.h,r.m)}))/10)*10,tk=[];for(var q=0;q<=mxs;q+=10)tk.push(q);
    $('#ch-sexo').innerHTML=lineas({W:560,H:260,pr:90,pb:56,max:mxs,ticks:tk,aria:'Horas de cuidado por sexo y edad',cats:rows.map(function(r){return r.edad}),
      series:[{nombre:'Mujeres',col:'#c0435a',pts:rows.map(function(r){return {y:r.m}})},{nombre:'Hombres',col:'#3f4760',pts:rows.map(function(r){return {y:r.h}})}]});
  })();

  /* ---- perfil del grupo del problema (script 16) ---- */
  (function(){
    var PF=D.perfil,DIMP=[];PF.forEach(function(r){if(DIMP.indexOf(r.dimension)<0)DIMP.push(r.dimension)});
    function pr(d,sg,pob){return PF.filter(function(r){return r.dimension===d&&r.segmento===sg&&r.poblacion===pob})[0]}
    var LBLP={'Mujer':'Mujeres','Hombre':'Hombres','15-39':'15 a 39 años','40-59':'40 a 59 años','60+':'60 años y más','Q1-Q2':'Ingreso Q1–Q2','Q3':'Ingreso Q3','Q4-Q5':'Ingreso Q4–Q5','Sin dato':'Ingreso sin dato','Cuida discapacidad':'Cuida discapacidad','Solo 60+ sin discapacidad':'Solo a 60+ sin discapacidad'};
    var sig=PF.filter(function(r){return r.poblacion==='Grupo del problema'&&r.dif_significativa===true&&r.dif_pp>0});
    var nosig=DIMP.filter(function(d){return !PF.some(function(r){return r.dimension===d&&r.dif_significativa===true})});
    $('#perfFind').innerHTML=sig.map(function(r){return '<b>'+fmt(r.pct)+'%</b> '+(r.segmento==='Mujer'?'son mujeres':r.segmento==='Cuida discapacidad'?'cuida a una persona con discapacidad':esc(LBLP[r.segmento]))+' (en el universo, '+fmt(pr(r.dimension,r.segmento,'Universo').pct)+'%)'}).join('; ')+'. '+(nosig.length?'Por '+nosig.map(function(d){return d.toLowerCase()}).join(' e ')+', el grupo no se distingue del resto.':'')+' <i>Perfil con el objetivo preregistrado DANO_SALUD3 (script 30).'+(function(){var a=(D.perfil_v1||[]).filter(function(r){return r.dimension==='Sexo'&&r.segmento==='Mujer'}),g=a.filter(function(r){return r.poblacion==='Grupo del problema'})[0],u=a.filter(function(r){return r.poblacion==='Universo'})[0];return g&&u&&g.dif_significativa?' Con «algún daño» (versión 1) las mujeres sí salían sobrerrepresentadas ('+fmt(g.pct)+'% contra '+fmt(u.pct)+'%).':''})()+'</i>';
var NQ={'Q1-Q2':'2 quintiles','Q3':'1 quintil','Q4-Q5':'2 quintiles'},CI=OBS.C_INK;
    var LBLC={'Mujer':'Mujeres','Hombre':'Hombres','15-39':'15 a 39','40-59':'40 a 59','60+':'60 y más','Q1-Q2':'Q1–Q2','Q3':'Q3','Q4-Q5':'Q4–Q5','Sin dato':'Sin dato','Cuida discapacidad':'Con discapacidad','Solo 60+ sin discapacidad':'Solo 60+'};
    var SUBC={'15-39':'años','40-59':'años','60+':'años','Solo 60+ sin discapacidad':'sin discapacidad'};
    function drawPerf(d){
      var L=PF.filter(function(r){return r.dimension===d&&r.poblacion==='Grupo del problema'});
      var W=440,H=330,pl=34,pr=6,pt=30,pb=62,mx=100,n=L.length,gw=(W-pl-pr)/n,bw=Math.min(40,gw*.3);
      function Y(v){return pt+(H-pt-pb)*(1-Math.max(0,Math.min(v,mx))/mx)}
      var s=svg(W,H,'Composición del grupo del problema por '+d.toLowerCase());
      [0,25,50,75,100].forEach(function(t){s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="rgba(63,71,96,'+(t?'.08':'.3')+')"/><text x="'+(pl-6)+'" y="'+(Y(t)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+t+'%</text>'});
      L.forEach(function(g,i){var u=pr_(d,g.segmento,'Universo'),cx=pl+gw*(i+.5),xg=cx-bw-2,xu=cx+2,weak=isWeak(g.precision),sd=g.segmento==='Sin dato',op=sd?' opacity=".45"':'',col=sd||weak?FAINT:CI;
        s+='<g><title>Grupo del problema: '+fmt(g.pct)+'% (IC '+fmt(g.li90)+'–'+fmt(g.ls90)+') · Todas las cuidadoras: '+fmt(u.pct)+'% · precisión '+g.precision+'</title>';
        s+='<rect x="'+xg+'" y="'+Y(g.pct)+'" width="'+bw+'" height="'+(Y(0)-Y(g.pct)).toFixed(1)+'" rx="3" fill="'+(weak?'#fff':'#c0435a')+'"'+(weak?' stroke="#c0435a"':'')+op+'/>';
        s+='<rect x="'+xu+'" y="'+Y(u.pct)+'" width="'+bw+'" height="'+(Y(0)-Y(u.pct)).toFixed(1)+'" rx="3" fill="#b8b3c9"'+op+'/>';
        var gx=xg+bw/2;s+='<g stroke="'+CI+'" stroke-width="1.2" opacity=".6"><line x1="'+gx+'" x2="'+gx+'" y1="'+Y(g.ls90)+'" y2="'+Y(g.li90)+'"/><line x1="'+(gx-4)+'" x2="'+(gx+4)+'" y1="'+Y(g.ls90)+'" y2="'+Y(g.ls90)+'"/><line x1="'+(gx-4)+'" x2="'+(gx+4)+'" y1="'+Y(g.li90)+'" y2="'+Y(g.li90)+'"/></g>';
        s+='<text x="'+gx+'" y="'+(Y(g.ls90)-7)+'" text-anchor="middle" '+MONO+' font-size="12" font-weight="700" fill="'+col+'">'+fmt(g.pct)+'</text>';
        s+='<text x="'+(xu+bw/2)+'" y="'+(Y(u.pct)-6)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+fmt(u.pct)+'</text>';
        s+='<text x="'+cx+'" y="'+(H-pb+20)+'" text-anchor="middle" font-size="12.5" font-weight="650" fill="'+col+'">'+esc(LBLC[g.segmento]||g.segmento)+(g.dif_significativa===true?' ★':'')+'</text>';
        var sub=NQ[g.segmento]||SUBC[g.segmento];if(sub)s+='<text x="'+cx+'" y="'+(H-pb+36)+'" text-anchor="middle" font-size="10.5" fill="'+FAINT+'">'+esc(sub)+'</text>';
        s+='</g>'});
      $('#ch-perfil').innerHTML=s+'</svg>';
    }
    var pr_=pr,dimP=DIMP[0];
    $('#segPerf').innerHTML=DIMP.map(function(d,i){return '<button data-p="'+esc(d)+'" aria-pressed="'+(i===0)+'">'+esc(d)+'</button>'}).join('');
    OBS.seg('#segPerf','p',function(d){dimP=d;drawPerf(d)});
    drawPerf(dimP);
    // 14 oct 2026: el perfil no se recorta por segmento (es la composición del grupo nacional), pero si el filtro está en una
    // dimensión que la gráfica tiene, se muestra esa dimensión para que se lea la barra del segmento elegido.
    OBS.perfSeg=function(){if(DIMP.indexOf(F.dim)<0||F.dim===dimP)return;dimP=F.dim;
      Array.prototype.forEach.call(document.querySelectorAll('#segPerf button'),function(b){b.setAttribute('aria-pressed',b.dataset.p===dimP)});drawPerf(dimP)};
    var gN=PF[0].n_muestra_dominio;
    $('#src-perfil').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional',Grupo:'40 h o más, no buscó, "no tuve necesidad" y declara daño (n = '+gN+' en la muestra)',Lectura:'Barra roja: % dentro del grupo del problema. Barra gris: % entre todas las personas cuidadoras del universo. Los grupos de ingreso no tienen el mismo tamaño: Q3 es un solo quintil y por eso pesa menos. «Ingreso sin dato» (atenuado) es un faltante, no un grupo.',Método:'Composición con diseño muestral, IC al 90%. ★ = el grupo difiere del resto del universo (no del universo completo, porque lo contiene).',Advertencia:'Muestra chica: varias categorías tienen precisión moderada. Es composición, no riesgo; para riesgo por segmento usa el filtro de arriba.',Archivo:esc(D.horas_dist.fuente.split(' y ')[0])});
  })();
  /* ---- distribución de horas (script 16; por segmento, sección 12b) ---- */
  function horas(){
    var on=aplica('horas'),HD=D.horas_dist,RG,med;
    if(on){RG=S2L('horas').filter(function(r){return r.categoria!=='mediana'}).map(function(r){return Object.assign({},r,{etiqueta:r.categoria,desde:parseInt(r.categoria,10)})});med=S2('horas','mediana').pct}
    else{RG=HD.rangos.filter(function(r){return r.desde>=1}).sort(function(a,b){return a.desde-b.desde});med=HD.mediana}
    var p40=RG.filter(function(r){return r.desde>=40}).reduce(function(a,r){return a+r.pct},0);
    $('#horFind').innerHTML=(on?pre():'')+'La mitad cuida <b>'+fmt(med,0)+' h</b> a la semana o menos'+(on?'.':'; '+fmt(HD.tope98.pct)+'% llega al tope del cuestionario (98 h en un bloque).');
    var W=560,H=230,pl=34,pb=34,pt=14,gw=(W-pl)/RG.length,bw=gw-10,mx=Math.ceil(Math.max.apply(null,RG.map(function(r){return r.ls90}))/5)*5+5;
    function Y(v){return pt+(H-pt-pb)*(1-v/mx)}
    var s=svg(W,H,'Distribución de horas de cuidado')+'<defs><pattern id="hh" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#e59aa8"/><line x1="0" y1="0" x2="0" y2="5" stroke="#fff" stroke-width="2"/></pattern></defs>';
    for(var t=0;t<=mx;t+=5)s+='<line x1="'+pl+'" x2="'+W+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="rgba(63,71,96,.1)"/><text x="'+(pl-6)+'" y="'+(Y(t)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+t+'%</text>';
    RG.forEach(function(r,i){var x=pl+gw*i+5,hi=r.desde>=40,weak=isWeak(r.precision);
      s+='<rect x="'+x+'" y="'+Y(r.pct)+'" width="'+bw+'" height="'+(Y(0)-Y(r.pct))+'" rx="3" fill="'+(weak?'url(#hh)':hi?'#c0435a':'#b09fd3')+'"><title>'+r.etiqueta+' h: '+fmt(r.pct)+'% (IC '+fmt(r.li90)+'–'+fmt(r.ls90)+') · precisión '+r.precision+'</title></rect>';
      s+='<line x1="'+(x+bw/2)+'" x2="'+(x+bw/2)+'" y1="'+Y(r.ls90)+'" y2="'+Y(Math.max(0,r.li90))+'" stroke="#2b3045" stroke-width="1.2" opacity=".55"/>';
      s+='<text x="'+(x+bw/2)+'" y="'+(Y(r.ls90)-5)+'" text-anchor="middle" '+MONO+' font-size="10.5" font-weight="700" fill="#2b3045">'+fmt(r.pct)+'</text>';
      s+='<text x="'+(x+bw/2)+'" y="'+(H-pb+15)+'" text-anchor="middle" '+MONO+' font-size="10" fill="rgba(43,48,69,.75)">'+r.etiqueta.replace('-','–')+'</text>'});
    var xi=pl+gw*RG.filter(function(r){return r.desde<40}).length;
    s+='<line x1="'+xi+'" x2="'+xi+'" y1="'+pt+'" y2="'+(H-pb)+'" stroke="#c0435a" stroke-dasharray="4 3"/><text x="'+(xi+4)+'" y="'+(pt+8)+'" font-size="11" font-weight="650" fill="#c0435a">40 h o más →</text>';
    s+='<text x="'+(W)+'" y="'+(H-3)+'" text-anchor="end" font-size="11" fill="'+FAINT+'">horas a la semana</text>';
    $('#ch-horas').innerHTML=s+'</svg>';
    $('#src-horas').innerHTML=dl({Universo:(on?esc(segName())+' · ':'')+'Personas cuidadoras de persona con discapacidad o 60+, nacional (n = '+RG[0].n_muestra_dominio+')',Preguntas:'P6.7 + P6.26, tope de 168',Advertencia:'Cada bloque del cuestionario topa en \"98 o más\": los rangos altos están censurados. Barras rayadas: precisión baja.',Archivo:on?esc(D.seg2_fuente):esc(D.horas_dist.fuente.split(' y ')[1]?'Analysis/resultados/'+D.horas_dist.fuente.split(' y ')[1]:D.horas_dist.fuente)});
  }
  /* ---- 21 oct 2026: segmentación por clases latentes (notebook 23, D.seg23). Estática: no la recorta el filtro de la pestaña.
     Exploratoria y sin doble revisión; la tarjeta lo dice. Ninguna cifra escrita a mano. ---- */
  (function(){
    var S=D.seg23;if(!S||!document.getElementById('ch-s23'))return;
    var ROSA='#c0435a',GRISL='#b8b3c9',CI=OBS.C_INK,yS='Algún daño por cuidar',bS='Todas';
    var YS=[['Algún daño por cuidar','Algún daño'],['Salud física deteriorada','Salud física'],['Daño laboral (no puede, dejó o redujo trabajo)','Daño laboral']];
    var BS=[['Todas','Todas'],['Bloque discapacidad','Cuida discapacidad'],['Solo 60+ sin discapacidad','Solo 60+']];
    var dif=S.clases.filter(function(c){return c.nombre==='Dificultad en la tarea'})[0];
    function dh(h,y){return S.dano_horas.filter(function(r){return r.horas===h&&r.desenlace===y})[0]}
    function db(b,h,y){return S.dano_bloque.filter(function(r){return r.bloque===b&&r.horas===h&&r.desenlace===y})[0]}
    function sig(v){return v===true||v==='True'}
    function filas(){return ['Menos de 40 h','40 h o más'].map(function(h){
      var r=bS==='Todas'?dh(h,yS):db(bS,h,yS);if(!r)return {h:h,na:true};
      return {h:h,c:r.con_dificultad,s:r.sin_dificultad,nc:r.n_con,ns:r.n_sin,d:r.dif_pp,li:r.dif_li90,ls:r.dif_ls90,ok:sig(r.significativa),
              int:r.interpretable===undefined?true:sig(r.interpretable)}})}
    var r0=dh('Menos de 40 h','Algún daño por cuidar'),r0s=dh('Menos de 40 h','Salud física deteriorada');
    $('#s23Find').innerHTML='Hay un perfil que no se define por las horas sino por la <b>dificultad con la tarea</b>: '+fmt(dif.pct)+'% de quienes cuidan (≈ '+mill(dif.total_expandido)+'). '+
      'Con menos de 40 h a la semana, <b>'+fmt(r0.con_dificultad,0)+'%</b> de ese perfil declara algún daño (versión 1), contra '+fmt(r0.sin_dificultad,0)+'% del resto; en salud física, '+fmt(r0s.con_dificultad,0)+'% contra '+fmt(r0s.sin_dificultad,0)+'%.';
    function draw(){
      var cw=document.getElementById('ch-s23').clientWidth||520,W=Math.max(320,Math.min(560,cw)),L=filas(),H=290,pl=34,pr=8,pt=40,pb=40,gw=(W-pl-pr)/2,bw=Math.min(58,gw*.32);
      if(L.every(function(r){return r.na})){$('#ch-s23').innerHTML='<p class="find">El daño laboral no se calculó por bloque del cuestionario. Elige «Todas».</p>';return}
      function Y(v){return pt+(H-pt-pb)*(1-v/100)}
      var s=svg(W,H,'Daño declarado por clase y horas de cuidado')+'<defs><pattern id="s23h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#eee9f5"/><line x1="0" y1="0" x2="0" y2="5" stroke="#b8b3c9" stroke-width="2"/></pattern></defs>';
      [0,25,50,75,100].forEach(function(t){s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="rgba(63,71,96,'+(t?'.08':'.3')+')"/><text x="'+(pl-6)+'" y="'+(Y(t)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+t+'%</text>'});
      L.forEach(function(r,i){var cx=pl+gw*(i+.5);
        s+='<text x="'+cx+'" y="'+(H-pb+20)+'" text-anchor="middle" font-size="12.5" font-weight="650" fill="'+CI+'">'+r.h+'</text>';
        if(r.na)return;
        [[r.c,r.nc,ROSA,cx-bw-3,'Dificultad en la tarea'],[r.s,r.ns,GRISL,cx+3,'Sin dificultad declarada']].forEach(function(b){
          var weak=!r.int&&b[1]<30;
          s+='<rect x="'+b[3]+'" y="'+Y(b[0])+'" width="'+bw+'" height="'+(Y(0)-Y(b[0])).toFixed(1)+'" rx="3" fill="'+(weak?'url(#s23h)':b[2])+'"><title>'+b[4]+', '+r.h+': '+fmt(b[0])+'% (n = '+b[1]+' en la muestra)</title></rect>';
          s+='<text x="'+(b[3]+bw/2)+'" y="'+(Y(b[0])-6)+'" text-anchor="middle" '+MONO+' font-size="12" font-weight="700" fill="'+(weak?FAINT:CI)+'">'+fmt(b[0],0)+'</text>'});
        var top=Y(Math.max(r.c,r.s))-26,txt;
        if(!r.int)txt='n = '+Math.min(r.nc,r.ns)+': no se compara';
        else txt=r.ok?(r.d>0?'más alto':'más bajo')+' con dificultad':'sin diferencia clara';
        s+='<text x="'+cx+'" y="'+Math.max(14,top)+'" text-anchor="middle" '+MONO+' font-size="11" font-weight="700" fill="'+(r.int&&r.ok?ROSA:FAINT)+'">'+txt+'</text>'});
      $('#ch-s23').innerHTML=s+'</svg>';
    }
    $('#s23Y').innerHTML=YS.map(function(y,i){return '<button data-y="'+esc(y[0])+'" aria-pressed="'+(i===0)+'">'+y[1]+'</button>'}).join('');
    $('#s23B').innerHTML=BS.map(function(b,i){return '<button data-b="'+esc(b[0])+'" aria-pressed="'+(i===0)+'">'+b[1]+'</button>'}).join('');
    OBS.seg('#s23Y','y',function(v){yS=v;draw()});OBS.seg('#s23B','b',function(v){bS=v;draw()});
    draw();
    /* la pestaña está oculta al cargar (ancho 0): se redibuja cuando el contenedor cambia de ancho, para que el texto no se encoja en teléfono */
    if(window.ResizeObserver){var w0=0;new ResizeObserver(function(e){var w=Math.round(e[0].contentRect.width);if(w&&Math.abs(w-w0)>8){w0=w;draw()}}).observe(document.getElementById('ch-s23'))}
    var fu=S.fuera_regla;
    $('#s23Tiles').innerHTML='<div class="s23-tiles">'+
      OBS.tile({plano:true,est:true,k:'% de quienes cuidan que declara dificultad en la tarea',v:fmt(dif.pct)+'%',color:ROSA,
        det:'<div class="lbl">≈ '+mill(dif.total_expandido)+' personas cuidadoras</div><div class="chips">'+prec(dif.precision)+'<span class="chip">IC 90% '+fmt(dif.li90)+'–'+fmt(dif.ls90)+'%</span></div>',fuente:'ENASIC 2022 · nacional'})+
      OBS.tile({plano:true,est:true,k:'% de quienes cuidan que declara dificultad y cuida menos de 40 h',v:fmt(fu.pct)+'%',
        det:'<div class="lbl">≈ '+mill(fu.total_expandido)+' personas: la regla de 40 h no las ve</div><div class="chips">'+prec(fu.precision)+'<span class="chip">IC 90% '+fmt(fu.li90)+'–'+fmt(fu.ls90)+'%</span></div>',fuente:'ENASIC 2022 · nacional'})+'</div>';
    var LBL={reqapoyo:'Requiere que otra persona le apoye',fuerza:'Le falta fuerza física',capacitacion:'Necesitaría capacitación',nocoopera:'La persona no coopera',insatisfecha:'Insatisfecha con la ayuda que recibe',horas:'Cuida 80 h o más',motivo:'Cuida por obligación o «la única que podía»'};
    var ORD=['reqapoyo','fuerza','capacitacion','nocoopera','insatisfecha','motivo','horas'];
    var pv=function(nom){return ORD.map(function(v){var r=S.perfil.filter(function(r){return r.variable===v&&r.nombre===nom})[0];return r?{pct:r.pct,li90:r.li90,ls90:r.ls90,precision:r.precision}:null})};
    $('#ch-s23p').innerHTML=OBS.barrasGrupo(ORD.map(function(v){return LBL[v]}),[{nombre:'Dificultad en la tarea',col:ROSA,vals:pv('Dificultad en la tarea')},{nombre:'Sin dificultad declarada',col:GRISL,vals:pv('Sin dificultad declarada')}],{W:360,max:100,aria:'Perfil de las dos clases'});
    var k2=S.estabilidad.filter(function(e){return e.k===2})[0],k3=S.estabilidad.filter(function(e){return e.k===3})[0];
    $('#s23Note').innerHTML='<span><b>Describe quién declara dificultad; no está probado que sirva para decidir a quién atender primero.</b> '+
      'Contar «2 o más de 4 dificultades» separa casi igual que el modelo (diferencia máxima '+fmt(S.modelo_vs_regla_max_pp,1)+' puntos), así que no hace falta un modelo. '+
      'Qué ayuda necesita este perfil no se puede deducir de aquí: dos de las variables que definen la clase son «necesitaría capacitación» y «requiere apoyo». Eso solo lo puede probar el piloto.</span>';
    $('#src-s23').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional (ENASIC 2022, TPOB_CUI, FAC_CUI, n = 1,043)',
      Método:'Modelo de clases latentes ponderado. Entran horas, cuida menores, cuatro dificultades (P6.9 / P6.28), insatisfacción con la ayuda (P6.39.3) y motivo (P6.38). El daño no entra al modelo: solo se usa para describir las clases. Clase asignada por probabilidad máxima; daño con IC al 90% por diseño.',
      Estabilidad:'Dos clases: índice de Rand ajustado mediano de '+fmt(k2.ari,2)+' en 100 réplicas bootstrap de UPM. Con tres clases cae a '+fmt(k3.ari,2)+': no hay más «tipos» estables.',
      Advertencia:'Exploratorio y <b>sin doble revisión</b>. Encuesta transversal: no demuestra que la dificultad cause el daño, y ambas se reportan en la misma entrevista. «Le falta fuerza» se parece a «salud física deteriorada». La clase de una persona es incierta (entropía '+fmt(k2.entropia,2)+'): no sirve para negar o asignar apoyos individuales. Nada de esto es de la CDMX.',
      Archivo:esc(S.fuente)});
  })();
  OBS.alSeg.push(function(){kpis();carga();afh();grupo();horas();if(OBS.perfSeg)OBS.perfSeg()});
})();
