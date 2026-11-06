/* Observatorio del Cuidado · js/vistas/focalizacion-prioridad.js
   Pestaña «¿A quién primero?», bloque «las tres decisiones» (2 nov 2026): ¿dónde hacer el piloto?, ¿a quién ofrecer primero el relevo?
   y ¿en qué orden atender las zonas?
   · Decisión 1 (piloto): k-means de 4 tipos de AGEB, Censo 2020 → D.tipologia (Analysis/resultados/18_tipologia_*.csv).
   · Decisión 2 (relevo): SOLO la regla «40 h o más», sin modelo de ML → D.horas_dist, D.modelo_v2 (27_v2_*.csv) y D.diagnostico_v2.
   · Decisión 3 (zonas): regla de dos medidas por alcaldía → D.tipologia.prioridad (24_prioridad_*.csv).
   Rediseño del 2 nov 2026 (noche): gráficas en HTML/CSS (salvo la dispersión), tooltips, filtro por tipo de zona, una línea de lectura por
   tarjeta y los textos largos en «Leer más». Copia previa: _respaldo_pre_rediseno_2026-11-02/.
   Ninguna cifra está escrita a mano. La ENASIC (quién) y el Censo/DENUE (dónde) no se cruzan: no comparten unidad territorial.
   Importa de OBS: $, FAINT, MONO, dl, ent, esc, fmt, seg, svg, tile, fz (de focalizacion-v2.js)
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,FAINT=OBS.FAINT,MONO=OBS.MONO,dl=OBS.dl,ent=OBS.ent,esc=OBS.esc,fmt=OBS.fmt,svg=OBS.svg,fz=OBS.fz;
  var TP=D.tipologia,V=D.modelo_v2,HD=D.horas_dist,DG=D.diagnostico_v2;
  if(!fz||!TP||!TP.prioridad||!V||!HD||!DG||!$('#prBloque')) return;
  var INK='#2b3045',HAIR='rgba(63,71,96,.12)',AZ='#77689d',NA='#a9711a',GR='#9a93ad',RO='#c0435a',TE='#23806f';
  var TC=fz.TC,ta=fz.ta,grid=fz.grid,ticks=fz.ticks,pos=fz.pos;
  function sg(v,d){return (v>0?'+':v<0?'−':'')+fmt(Math.abs(v),d==null?1:d)}
  function txt(x,y,t,o){o=o||{};return '<text x="'+x+'" y="'+y+'"'+(o.a?' text-anchor="'+o.a+'"':'')+(o.m?' '+MONO:'')+' font-size="'+(o.s||11)+'" fill="'+(o.c||INK)+'"'+(o.w?' font-weight="'+o.w+'"':'')+(o.m?' stroke="#fff" stroke-width="3" paint-order="stroke"':'')+'>'+t+'</text>'}
  function mn(a){return Math.min.apply(null,a)} function mx(a){return Math.max.apply(null,a)}
  function lista(n){return n.length>1?n.slice(0,-1).join(', ')+' y '+n[n.length-1]:(n[0]||'')}
  function lc(s){return s.charAt(0).toLowerCase()+s.slice(1)}

  /* ---------- Datos de cada decisión ---------- */
  var TIPOS=TP.tipos, TM={}, DEC={}; TIPOS.forEach(function(t){TM[t.tipo]=t}); TP.decision.forEach(function(d){DEC[d.tipo]=d});
  var top=TIPOS.slice().sort(function(a,b){return b.pct_de_las_60-a.pct_de_las_60})[0];
  var totBrecha=TP.brecha_total.n_60, totInt=TP.sin_internet_total.viviendas;
  var PRIM='PRIMARIO: DANO_SALUD3, predictores primarios';
  var R=V.global.filter(function(r){return r.configuracion===PRIM&&r.puntaje==='Regla >= 40 h'})[0];
  var CUPO=DG.muestra.filter(function(m){return m.indicador==='cupo_regla_40h'})[0].valor*100;
  var PA=TP.prioridad.alcaldias, PRC=TP.prioridad.combinaciones;
  var POR={}; TP.por_alcaldia.forEach(function(a){POR[a.alcaldia]=a});
  function nivel(a){var e=a.etiqueta_modal;return a.nivel_modal===1?'Doble':a.nivel_modal===2?(e.indexOf('volumen')>0?'Solo volumen':'Solo concentración'):a.nivel_modal===3?'Brecha menor':'Sin brecha'}
  var NC={1:RO,2:NA,3:GR,4:'#d9d5e3'};
  var n1=PA.filter(function(a){return a.nivel_modal===1}), n2v=PA.filter(function(a){return a.nivel_modal===2&&a.etiqueta_modal.indexOf('volumen')>0}), n2c=PA.filter(function(a){return a.nivel_modal===2&&a.etiqueta_modal.indexOf('concentración')>0});
  var n1est=n1.filter(function(a){return a.estable});
  var FZ_CHIPS=fz.chips(TIPOS);

  /* ---------- Respuesta: tres tarjetas ---------- */
  var tiles=[
    {k:'Piloto · tipo de zona con más personas de 60+',v:'Tipo '+top.tipo+' · '+esc(top.nombre),v2:'Propuesta del notebook, sin decidir',fs:18,
      det:'<div class="lbl">Vive aquí el '+fmt(top.pct_de_las_60)+' % de las personas de 60+ de la CDMX; el '+fmt(DEC[top.tipo].pct_viv_sin_int)+' % de sus viviendas no tiene internet. El equipo no ha decidido el piloto.</div>',fuente:'Censo 2020 por AGEB · CDMX · k-means, 4 tipos'},
    {k:'Relevo · a quién se ofrece primero',v:'40 h o más por semana',v2:'Solo la regla, sin modelo',fs:20,est:true,
      det:'<div class="lbl">La regla elige al '+fmt(CUPO)+' % de las cuidadoras y encuentra al '+fmt(R.cobertura)+' % de quienes declaran daño en salud física, cansancio o sueño (IC 90 %: '+fmt(R.cob_li90,0)+' a '+fmt(R.cob_ls90,0)+').</div>',fuente:'ENASIC 2022 · nacional'},
    {k:'Zonas · alcaldías con nivel doble',v:esc(lista(n1.map(function(a){return a.alcaldia}))),v2:'Brecha alta en volumen y en concentración',fs:17,
      det:'<div class="lbl">'+n1est.length+' de '+n1.length+' conservan el nivel en las '+PRC+' combinaciones de corte. El nivel no es una prioridad ordenada.</div>',fuente:'Censo 2020 + DENUE 05/2026 · por AGEB, agregado a alcaldía'}
  ];
  $('#prTiles').innerHTML=tiles.map(function(t){return OBS.tile(t)}).join('');
  $('#prFind').innerHTML=fz.pills([['Quién · ENASIC · nacional, personas'],['Dónde · Censo y DENUE · por AGEB'],['Las fuentes no se cruzan','amb'],['Ninguna decisión está tomada por el equipo']]);

  /* ================= DECISIÓN 1 · ¿Dónde hacer el piloto? ================= */
  /* 1a · Perfil de los 4 tipos en las 9 variables del k-means (mediana entre AGEB) frente a la mediana de la CDMX */
  (function(){
    var LAB={pct_60:'% de la población de 60+',pct_disc:'% con discapacidad',pct_0a14:'% de 0 a 14 años',prom_ocup:'Ocupantes por vivienda',part_fem:'Participación económica femenina (%)',pct_jef_f:'% de hogares con jefatura femenina',pct_sinder:'% sin derechohabiencia',graproes:'Escolaridad (grados promedio)',pct_sin_int:'% de viviendas sin internet'};
    var GRP=[['Edad y discapacidad',['pct_60','pct_disc','pct_0a14']],['Hogar y trabajo',['prom_ocup','part_fem','pct_jef_f']],['Acceso y escolaridad',['pct_sinder','graproes','pct_sin_int']]];
    var MC=TP.medianas_cdmx;
    function dig(k){return k==='prom_ocup'||k==='graproes'?2:1}
    function dev(t,k){return (t.medianas[k]-MC[k])/MC[k]*100}
    /* Mapa de calor (única vista de esta tarjeta desde el 3 nov 2026; se retiraron Barras y Tabla): tipos en filas, 9 variables en columnas.
       Color = diferencia relativa con la mediana de la CDMX (satura en ±SAT %); la distancia a la oferta no tiene referencia CDMX y va aparte. */
    var SH={pct_60:'60+',pct_disc:'Discapacidad',pct_0a14:'0 a 14 años',prom_ocup:'Ocupantes / vivienda',part_fem:'Particip. económica fem.',pct_jef_f:'Jefatura femenina',pct_sinder:'Sin derechoh.',graproes:'Escolaridad',pct_sin_int:'Sin internet'};
    var FL={pct_60:'Población de 60+',pct_disc:'Con discapacidad',pct_0a14:'Población de 0 a 14 años',prom_ocup:'Ocupantes por vivienda',part_fem:'Participación económica femenina',pct_jef_f:'Hogares con jefatura femenina',pct_sinder:'Sin derechohabiencia',graproes:'Escolaridad (grados)',pct_sin_int:'Viviendas sin internet'};
    var DM=[['Distancia mediana (km)','dist_mediana_km',2],['60+ a más de 1 km (%)','pct_60_a_mas_de_1km',1]];
    var SAT=50;
    function fichas(){
      return '<div class="pf-fch">'+TIPOS.map(function(x){
        var r=Object.keys(LAB).map(function(k){return {k:k,d:dev(x,k)}}).sort(function(a,b){return Math.abs(b.d)-Math.abs(a.d)}).slice(0,3);
        return '<div class="pf-f zd z'+x.tipo+'"><div class="pf-fh"><span class="zn" style="--c:'+TC[x.tipo]+'">'+x.tipo+'</span><b>'+esc(x.nombre)+'</b></div><ul>'
          +r.map(function(q){var d=dig(q.k);return '<li><span class="'+(q.d>0?'up':'dn')+'">'+(q.d>0?'▲ ':'▼ ')+fmt(Math.abs(q.d),0)+' %</span> '+FL[q.k]+'<small>'+fmt(x.medianas[q.k],d)+' frente a '+fmt(MC[q.k],d)+' en la CDMX</small></li>'}).join('')
          +'</ul></div>'}).join('')+'</div>'}
    function mapa(){
      var h='<div class="pf-tw"><table class="pf-tab pf-hm"><thead><tr><th rowspan="2"></th>';
      GRP.forEach(function(g){h+='<th colspan="3" class="hg">'+g[0]+'</th>'});
      h+='<th colspan="2" class="hg">Distancia a la oferta</th></tr><tr>';
      GRP.forEach(function(g){g[1].forEach(function(k){h+='<th title="'+LAB[k]+'">'+SH[k]+'<small>CDMX '+fmt(MC[k],dig(k))+'</small></th>'})});
      DM.forEach(function(m){h+='<th>'+m[0]+'<small>sin ref. CDMX</small></th>'});
      h+='</tr></thead><tbody>';
      TIPOS.forEach(function(x){
        h+='<tr><th scope="row" class="zd z'+x.tipo+'"><span class="zn" style="--c:'+TC[x.tipo]+'">'+x.tipo+'</span>'+esc(x.nombre)+'</th>';
        GRP.forEach(function(g){g[1].forEach(function(k){var d=dig(k),dv=dev(x,k),al=Math.min(Math.abs(dv)/SAT,1)*.6;
          h+='<td class="zd z'+x.tipo+' '+(dv>0?'up':'dn')+'" style="--a:'+al.toFixed(2)+'"'+ta('Tipo '+x.tipo+' · '+LAB[k]+': '+fmt(x.medianas[k],d)+' (CDMX '+fmt(MC[k],d)+', '+sg(dv,0)+' %)')+'><b>'+fmt(x.medianas[k],d)+'</b><small>'+(dv>=0?'▲ ':'▼ ')+fmt(Math.abs(dv),0)+' %</small></td>'})});
        DM.forEach(function(m){var vals=TIPOS.map(function(t){return DEC[t.tipo][m[1]]}),v=DEC[x.tipo][m[1]];
          h+='<td class="zd z'+x.tipo+' lin" style="--a:'+(v/mx(vals)*.26).toFixed(2)+'"'+ta('Tipo '+x.tipo+' · '+m[0]+': '+fmt(v,m[2]))+'><b>'+fmt(v,m[2])+'</b></td>'})
        h+='</tr>'});
      return h+'</tbody></table></div>'}
    var mp='<div id="pfM">'+fichas()+mapa()+'</div>';
    $('#ch-pr1').innerHTML=mp;
    $('#pr1Chips').innerHTML=FZ_CHIPS; fz.zsel($('#cPerfil'),$('#pr1Chips'));
    $('#pr1Leg').innerHTML='<span>▼ más bajo que la CDMX</span><span class="pf-sc"></span><span>más alto ▲</span><span class="muted">Número: mediana de las AGEB del tipo · color: diferencia con la CDMX, satura en ±'+SAT+' %</span>';
    var mad=function(t){return TIPOS.length?Object.keys(LAB).reduce(function(a,k){return a+Math.abs(dev(t,k))},0)/Object.keys(LAB).length:0};
    var cerca=TIPOS.slice().sort(function(a,b){return mad(a)-mad(b)})[0],m60=TIPOS.slice().sort(function(a,b){return b.medianas.pct_60-a.medianas.pct_60})[0],mint=TIPOS.slice().sort(function(a,b){return b.medianas.pct_sin_int-a.medianas.pct_sin_int})[0];
    $('#pr1Find').innerHTML='Tipo '+m60.tipo+': más 60+ (<b>'+fmt(m60.medianas.pct_60)+' %</b>). Tipo '+mint.tipo+': más viviendas sin internet (<b>'+fmt(mint.medianas.pct_sin_int)+' %</b>). Tipo '+cerca.tipo+': el más parecido a la CDMX.';
    $('#pr1Mas').innerHTML='<p><b>Mapa de calor.</b> Cada fila es un tipo de zona y cada celda su mediana en una variable; el color indica cuánto se aleja de la mediana de la CDMX en términos relativos (morado: más alto; verde: más bajo; sin color: parecido). Las fichas resumen las tres variables donde cada tipo más se aleja. Ojo: la diferencia es relativa, así que una variable con valores bajos (p. ej. discapacidad) se ve más contrastada que una con valores altos (p. ej. escolaridad) aunque el cambio en unidades sea parecido.</p><p>«Más alto» no es mejor ni peor: puede ser más necesidad (sin internet) o menos (escolaridad).</p><p>Las dos medidas de distancia a la oferta no tienen mediana de la CDMX: se comparan solo entre tipos.</p>';
    $('#src-pr1').innerHTML=dl({Universo:'AGEB urbanas de la CDMX ('+ent(TP.calidad.filter(function(c){return c.chequeo==='AGEB en el modelo'})[0].n_ageb)+' en el modelo)',Método:'k-means de 4 tipos sobre 9 indicadores del Censo 2020; mediana entre las AGEB de cada tipo',Archivo:'Analysis/resultados/18_tipologia_*.csv'});
  })();

  /* 1b · Volumen: qué parte del total de la CDMX tiene cada tipo */
  (function(){
    var M=[['Personas de 60+',function(t){return t.pct_de_las_60}],['60+ en AGEB con brecha de oferta',function(t){return 100*DEC[t.tipo].n_60_brecha/totBrecha}],['Viviendas sin internet',function(t){return 100*DEC[t.tipo].viviendas_sin_internet/totInt}]];
    var REF=['Para comparar: población total',function(t){return t.pct_pob_cdmx}];
    function fila(m,ref){var h='<div class="st-r'+(ref?' ref':'')+'"><div class="st-l">'+m[0]+'</div><div class="st-b">';
      TIPOS.forEach(function(t){var v=m[1](t);
        h+='<span class="zd z'+t.tipo+'" style="flex:'+v.toFixed(3)+'"'+ta('Tipo '+t.tipo+' · '+m[0]+': '+fmt(v)+' % del total de la CDMX')+'>'+(v>=6?'<b>'+fmt(v,0)+'%</b>':'')+'</span>'});
      return h+'</div></div>'}
    $('#ch-pr2').innerHTML='<div class="st">'+M.map(function(m){return fila(m,false)}).join('')+fila(REF,true)+'</div>';
    $('#pr2Chips').innerHTML=FZ_CHIPS; fz.zsel($('#cVolumen'),$('#pr2Chips'));
    var lb=TIPOS.slice().sort(function(a,b){return DEC[b.tipo].n_60_brecha-DEC[a.tipo].n_60_brecha})[0];
    $('#pr2Find').innerHTML='Tipo '+lb.tipo+' reúne el <b>'+fmt(100*DEC[lb.tipo].n_60_brecha/totBrecha,0)+' %</b> de los 60+ con brecha de oferta, con el '+fmt(lb.pct_pob_cdmx,0)+' % de la población.';
    var rate=function(k){return TIPOS.slice().sort(function(a,b){return b[k]-a[k]})[0]};
    var ti=rate('pct_viv_sin_int'),ts=rate('pct_sinder');
    var totViv=TP.decision.reduce(function(a,d){return a+d.viviendas},0),vivT=100*DEC[top.tipo].viviendas/totViv,brT=100*DEC[top.tipo].n_60_brecha/totBrecha,inT=100*DEC[top.tipo].viviendas_sin_internet/totInt;
    var k4=TP.seleccion_k.filter(function(k){return k.k===4})[0],ward=TP.robustez.filter(function(r){return r.variante.indexOf('Ward')===0})[0];
    $('#pr2Mas').innerHTML='<p>El tipo '+top.tipo+' es el más grande ('+ent(top.n_ageb)+' AGEB; '+fmt(top.pct_pob_cdmx)+' % de la población y '+fmt(vivT)+' % de las viviendas). Pesa '+fmt(inT)+' % en viviendas sin internet y '+fmt(brT)+' % en 60+ con brecha de oferta (frente a '+fmt(top.pct_de_las_60)+' % de los 60+).</p>'
      +'<p>Por <b>tasa</b>, la carencia más alta está en el tipo '+ti.tipo+' ('+esc(lc(ti.nombre))+'): '+fmt(ti.pct_viv_sin_int)+' % de viviendas sin internet'+(ts.tipo===ti.tipo?' y '+fmt(ts.pct_sinder)+' % sin derechohabiencia':'')+'. Elegir el tipo '+top.tipo+' es llegar a más personas; elegir el tipo '+ti.tipo+', ir donde hay más carencia. <b>Los datos no deciden entre los dos criterios.</b></p>'
      +'<p>Los tipos son una forma de agrupar la ciudad, no fronteras nítidas: la ciudad cambia de forma gradual y otro método de agrupación daría zonas distintas.</p>';
    $('#src-pr2').innerHTML=dl({Universo:'AGEB urbanas de la CDMX · Censo 2020 y DENUE 05/2026',Método:'Cada fila suma 100 % entre los 4 tipos. Brecha de oferta: AGEB en el cuartil alto de 60+ y de distancia a la oferta',Archivo:'Analysis/resultados/18_tipologia_*.csv'});
  })();

  /* ================= DECISIÓN 2 · ¿A quién ofrecer primero el relevo? (solo la regla) ================= */
  /* 2a · Distribución de las horas y el corte de 40 h */
  (function(){
    var rg=HD.rangos,hiY=Math.ceil(mx(rg.map(function(r){return r.ls90}))/5)*5;
    function col(r,sel){var low=r.precision==='baja',tip=esc(r.etiqueta)+' h: '+fmt(r.pct)+' % (IC 90 % '+fmt(r.li90)+' a '+fmt(r.ls90)+', precisión '+esc(r.precision)+')';
      return '<div class="hr-c"><div class="hr-pl"><span class="hr-bar'+(sel?' sel':'')+(low?' low':'')+'" style="height:'+pos(r.pct,0,hiY).toFixed(2)+'%"'+ta(tip)+'></span>'
        +'<i class="hr-ci" style="bottom:'+pos(r.li90,0,hiY).toFixed(2)+'%;height:'+(pos(r.ls90,0,hiY)-pos(r.li90,0,hiY)).toFixed(2)+'%"></i>'
        +'<em style="bottom:calc('+pos(r.ls90,0,hiY).toFixed(2)+'% + 5px)">'+fmt(r.pct,1)+'%</em></div><div class="hr-x">'+esc(r.etiqueta)+'</div></div>'}
    var lt=rg.filter(function(r){return r.desde<40}),ge=rg.filter(function(r){return r.desde>=40});
    var sel=ge.reduce(function(a,r){return a+r.pct},0);
    var gl='';for(var k=0;k<=hiY;k+=5)gl+='<i style="bottom:'+pos(k,0,hiY).toFixed(2)+'%"><span>'+k+'%</span></i>';
    $('#ch-pr3').innerHTML='<div class="hr"><div class="hr-grid">'+gl+'</div>'
      +'<div class="hr-g" style="flex:'+lt.length+'">'+lt.map(function(r){return col(r,false)}).join('')+'</div>'
      +'<div class="hr-g sel" style="flex:'+ge.length+'"><div class="hr-gl">La regla: 40 h o más · <b>'+fmt(sel,0)+' %</b></div>'+ge.map(function(r){return col(r,true)}).join('')+'</div></div><div class="ax-t">Horas de cuidado por semana · % de las personas cuidadoras</div>';
    $('#pr3Find').innerHTML='La regla elige a quien cuida <b>40 horas o más a la semana</b>: cerca del <b>'+fmt(sel,0)+' %</b> de las cuidadoras (mediana de todas: '+fmt(HD.mediana,0)+' h).';
    var baja=rg.filter(function(r){return r.precision==='baja'}).map(function(r){return r.etiqueta});
    $('#pr3Mas').innerHTML='<p>Es una sola variable, sin modelo.'+(baja.length?' Precisión baja en '+esc(lista(baja))+' h (rayado).':'')+'</p><p>Las horas vienen de dos preguntas con tope en 98 y se amontonan en múltiplos de 7: el corte descansa en horas redondeadas.</p>';
    $('#src-pr3').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional (ENASIC 2022)',Método:'Porcentaje ponderado con FAC_CUI; IC 90 % por linealización',Archivo:esc(V.fuente)});
  })();

  /* 2b · A quién encuentra y a quién deja fuera la regla, por grupo */
  (function(){
    var DIM=[['SEXO','Sexo'],['EDAD','Edad'],['ING','Ingreso'],['BLOQUE','A quién cuida']];
    var LBL={'Hombre':'Hombres','Mujer':'Mujeres','15-39':'15 a 39 años','40-59':'40 a 59 años','60+':'60 años y más','Q1-Q2':'Ingreso Q1–Q2','Q3':'Ingreso Q3','Q4-Q5':'Ingreso Q4–Q5','Sin dato':'Ingreso sin dato','Discapacidad':'Persona con discapacidad','Solo 60+':'Solo persona 60+ sin discap.'};
    var rows=V.equidad.filter(function(r){return r.configuracion===PRIM&&r.puntaje==='Regla >= 40 h'});
    var h='<div class="cv"><div class="cv-ref"><i style="left:'+pos(R.cobertura,0,100).toFixed(2)+'%"></i></div>';
    DIM.forEach(function(d){h+='<div class="grp">'+d[1]+'</div>';
      rows.filter(function(r){return r.dimension===d[0]}).forEach(function(r){var pocos=r.n_con_objetivo<100;
        h+='<div class="cv-r'+(pocos?' poco':'')+'"><div class="q-l">'+esc(LBL[r.grupo]||r.grupo)+'</div><div class="tr">'+grid(0,100,25)
          +'<i class="ln" style="width:'+pos(r.cobertura,0,100).toFixed(2)+'%"></i><b class="dt" style="left:'+pos(r.cobertura,0,100).toFixed(2)+'%;--c:'+NA+'"'+ta((LBL[r.grupo]||r.grupo)+': la regla encuentra al '+fmt(r.cobertura)+' % de quienes tienen el daño (n con el daño = '+r.n_con_objetivo+')')+'></b></div>'
          +'<div class="cv-v"><b>'+fmt(r.cobertura,0)+'%</b><small class="'+(pocos?'rojo':'')+'">n = '+r.n_con_objetivo+'</small></div></div>'})});
    h+='<div class="cv-r cv-ax"><span></span><div class="tx">'+ticks(0,100,25,function(k){return k+'%'})+'</div><span></span></div></div>';
    $('#ch-pr4').innerHTML=h;
    $('#pr4Ref').textContent=fmt(R.cobertura,0)+' %';
    var ok=rows.slice().sort(function(a,b){return a.cobertura-b.cobertura}),lo=ok[0],hi=ok[ok.length-1];
    function gn(r){return lc(LBL[r.grupo]||r.grupo)}
    var PB=V.por_bloque.filter(function(r){return r.configuracion===PRIM&&r.puntaje==='Regla >= 40 h'}),pd=PB.filter(function(r){return r.bloque==='Discapacidad'})[0],p6=PB.filter(function(r){return r.bloque==='Solo 60+'})[0];
    $('#pr4Find').innerHTML='La regla encuentra de <b>'+fmt(lo.cobertura,0)+' %</b> ('+esc(gn(lo))+') a <b>'+fmt(hi.cobertura,0)+' %</b> ('+esc(gn(hi))+') de quienes tienen el daño.';
    $('#pr4Mas').innerHTML='<p>Por tipo de cuidado, la regla elige al '+fmt(pd.tasa_seleccion_bloque,0)+' % de quienes cuidan a una persona con discapacidad y al '+fmt(p6.tasa_seleccion_bloque,0)+' % de quienes cuidan a alguien de 60+ sin discapacidad.</p><p>Son descripciones sin intervalo: <b>no prueban que un grupo quede peor cubierto</b>, pero señalan a quién revisar con datos del piloto.</p>';
    $('#src-pr4').innerHTML=dl({Universo:'Personas cuidadoras con el daño (salud física, cansancio o sueño), nacional (ENASIC 2022)',Método:'Cobertura ponderada con FAC_CUI; sin intervalos por grupo',Archivo:esc(V.fuente)});
  })();

  /* ================= DECISIÓN 3 · ¿En qué orden atender las zonas? ================= */
  var CORTO={'Cuajimalpa de Morelos':'Cuajimalpa','La Magdalena Contreras':'Magdalena C.','Gustavo A. Madero':'G. A. Madero','Venustiano Carranza':'V. Carranza','Benito Juárez':'Benito Juárez'};
  function cor(n){return CORTO[n]||n}
  /* 3a · Dispersión volumen vs. concentración */
  (function(){
    var W=860,H=460,l=54,r=24,tp=16,b=52,xmax=Math.ceil(mx(PA.map(function(a){return a.n_60_brecha}))/5000)*5000,ymax=Math.ceil(mx(PA.map(function(a){return a.pct_60_brecha}))/10)*10;
    function X(v){return l+16+(W-l-r-16)*v/xmax} function Y(v){return tp+(H-tp-b-16)*(1-v/ymax)}
    var s=svg(W,H,'Alcaldías según personas de 60+ en AGEB con brecha de oferta y porcentaje de sus 60+ que representan');
    for(var k=0;k<=xmax;k+=5000)s+='<line x1="'+X(k)+'" x2="'+X(k)+'" y1="'+tp+'" y2="'+(H-b)+'" stroke="'+HAIR+'" stroke-dasharray="2 4"/>'+txt(X(k),H-b+16,ent(k),{a:'middle',m:1,s:10,c:FAINT});
    for(k=0;k<=ymax;k+=10)s+='<line x1="'+l+'" x2="'+(W-r)+'" y1="'+Y(k)+'" y2="'+Y(k)+'" stroke="'+HAIR+'" stroke-dasharray="2 4"/>'+txt(l-8,Y(k)+4,k+'%',{a:'end',m:1,s:10,c:FAINT});
    s+=txt((l+W-r)/2,H-8,'Volumen: personas de 60+ en AGEB con brecha →',{a:'middle',s:11,w:650})+'<text transform="translate(12 '+((tp+H-b)/2)+') rotate(-90)" text-anchor="middle" font-size="11" font-weight="650" fill="'+INK+'">Concentración: % de sus 60+ en esas AGEB →</text>';
    var placed=[],cajas=PA.map(function(a){var x=X(a.n_60_brecha),y=Y(a.pct_60_brecha);return {n:a.alcaldia,x1:x-9,x2:x+9,y1:y-9,y2:y+9}});
    function libre(bx,own){var ob=placed.concat(cajas.filter(function(c){return c.n!==own}));return bx.x1>=0&&bx.x2<=W&&ob.every(function(p){return bx.x2<p.x1||bx.x1>p.x2||bx.y2<p.y1||bx.y1>p.y2})}
    PA.slice().sort(function(a,b){return b.n_60_brecha-a.n_60_brecha}).forEach(function(a){var x=X(a.n_60_brecha),y=Y(a.pct_60_brecha),w=cor(a.alcaldia).length*5.6;
      s+='<circle class="sc-p" cx="'+x+'" cy="'+y+'" r="8" fill="'+NC[a.nivel_modal]+'" fill-opacity="'+(a.estable?.95:.45)+'" stroke="'+(a.estable?'#fff':NC[a.nivel_modal])+'" stroke-width="1.5"'+ta(a.alcaldia+' · '+nivel(a)+'\n'+ent(a.n_60_brecha)+' personas de 60+ en brecha ('+fmt(a.pct_60_brecha)+' % de sus 60+)\nMismo nivel en '+a.combinaciones_en_modal+' de '+PRC+' combinaciones')+'/>';
      [[x+12,y+4,'start',x+12,x+12+w],[x-12,y+4,'end',x-12-w,x-12],[x,y-13,'middle',x-w/2,x+w/2],[x,y+21,'middle',x-w/2,x+w/2],[x+9,y-10,'start',x+9,x+9+w],[x+9,y+16,'start',x+9,x+9+w],[x-9,y-10,'end',x-9-w,x-9],[x-9,y+16,'end',x-9-w,x-9]].some(function(o){var bx={x1:o[3],x2:o[4],y1:o[1]-10,y2:o[1]+3};
        if(libre(bx,a.alcaldia)){placed.push(bx);s+=txt(o[0],o[1],esc(cor(a.alcaldia)),{a:o[2],s:10.5,c:INK,w:a.nivel_modal===1?700:0});return true}return false})});
    $('#ch-pr5').innerHTML=s+'</svg>';
    $('#pr5Find').innerHTML='Nivel doble (volumen y concentración altos): <b>'+esc(lista(n1.map(function(a){return a.alcaldia})))+'</b>.';
    $('#pr5Mas').innerHTML='<p>'+(n2v.length?'<b>Solo volumen:</b> '+esc(lista(n2v.map(function(a){return a.alcaldia+' ('+ent(a.n_60_brecha)+' personas, pero solo '+fmt(a.pct_60_brecha)+' % de sus 60+)'})))+'. ':'')
      +(n2c.length?'<b>Solo concentración:</b> '+esc(lista(n2c.map(function(a){return a.alcaldia+' ('+fmt(a.pct_60_brecha)+' % de sus 60+, pero '+ent(a.n_60_brecha)+' personas)'})))+'.':'')+'</p>'
      +'<p>Los puntos atenuados <b>cambian de nivel</b> según el corte de brecha (tercil, cuartil o quintil): solo '+PA.filter(function(a){return a.estable}).length+' de '+PA.length+' conservan el nivel en las '+PRC+' combinaciones.</p>';
    $('#src-pr5').innerHTML=dl({Universo:'AGEB urbanas de la CDMX, agregadas a alcaldía · Censo 2020 y DENUE 05/2026',Método:'Brecha de oferta: AGEB en el cuartil alto de 60+ y de distancia al establecimiento núcleo más cercano; nivel por '+PRC+' combinaciones de corte',Archivo:'Analysis/resultados/24_prioridad_*.csv'});
  })();

  /* 3b · Tabla de las 16 alcaldías: volumen, concentración, nivel, estabilidad y composición por tipo de zona */
  (function(){
    var vmax=mx(PA.map(function(a){return a.n_60_brecha})),pmax=mx(PA.map(function(a){return a.pct_60_brecha}));
    function tabla(modo){
      var rows=PA.slice().sort(function(a,b){return modo==='v'?b.n_60_brecha-a.n_60_brecha:modo==='c'?b.pct_60_brecha-a.pct_60_brecha:a.orden_presentacion-b.orden_presentacion});
      var h='<div class="al-w"><table class="al"><thead><tr><th>Alcaldía</th><th>60+ en brecha</th><th>% de sus 60+</th><th>Nivel</th><th>Estable</th><th>Población por tipo de zona</th></tr></thead><tbody>';
      rows.forEach(function(a,i){var pt=POR[a.alcaldia],sep=modo==='p'&&i>0&&rows[i-1].nivel_modal!==a.nivel_modal;
        h+='<tr'+(sep?' class="sep"':'')+'><th scope="row"'+(a.nivel_modal===1?' class="b"':'')+'>'+esc(a.alcaldia)+'</th>'
          +'<td><div class="db" style="--f:'+(a.n_60_brecha/vmax).toFixed(3)+'"><span style="background:'+AZ+'"></span><em>'+ent(a.n_60_brecha)+'</em></div></td>'
          +'<td><div class="db" style="--f:'+(a.pct_60_brecha/pmax).toFixed(3)+'"><span style="background:'+NA+'"></span><em>'+fmt(a.pct_60_brecha,1)+'%</em></div></td>'
          +'<td><span class="lvl" style="--c:'+NC[a.nivel_modal]+'">'+nivel(a)+'</span></td>'
          +'<td><span class="est'+(a.estable?' ok':'')+'"'+ta('Conserva su nivel en '+a.combinaciones_en_modal+' de '+PRC+' combinaciones de corte')+'>'+a.combinaciones_en_modal+'/'+PRC+'</span></td>'
          +'<td><div class="mini">'+pt.pct_tipo.map(function(p,j){return p>0?'<span class="zd z'+(j+1)+'" style="flex:'+p.toFixed(2)+'"'+ta(a.alcaldia+' · tipo '+(j+1)+': '+fmt(p)+' % de la población')+'></span>':''}).join('')+'</div></td></tr>'});
      $('#ch-pr6').innerHTML=h+'</tbody></table></div>';
    }
    tabla('p');
    OBS.seg('#pr6Orden','o',tabla);
    $('#pr6Chips').innerHTML=FZ_CHIPS; fz.zsel($('#cAlcaldias'),$('#pr6Chips'));
    $('#pr6Leg').innerHTML='<span>Estable: de las '+PRC+' combinaciones de corte, cuántas conservan el nivel (en verde, todas)</span><span class="muted">El orden dentro de un nivel es de presentación, no una prioridad</span>';
    var dob=n1.map(function(a){return a.alcaldia+' '+fmt(POR[a.alcaldia].pct_tipo[top.tipo-1],0)+' %'});
    $('#pr6Find').innerHTML='En las alcaldías de nivel doble, el tipo '+top.tipo+' reúne a '+esc(lista(dob))+' de su población.';
    $('#pr6Mas').innerHTML='<p>El tipo '+top.tipo+' reúne '+DEC[top.tipo].ageb_brecha+' de las '+TP.brecha_total.ageb+' AGEB con brecha. Las dos lecturas apuntan en la misma dirección, pero usan las mismas AGEB y el mismo Censo: <b>no son evidencia independiente</b>.</p>';
    $('#src-pr6').innerHTML=dl({Universo:'AGEB urbanas de la CDMX, agregadas a alcaldía · Censo 2020 y DENUE 05/2026',Método:'Nivel por regla de dos medidas (volumen y concentración) con '+PRC+' combinaciones de corte; composición: población total de la alcaldía por tipo de zona',Archivo:'Analysis/resultados/24_prioridad_*.csv'});
  })();

  OBS.seg('#segPr','d',function(d){[1,2,3].forEach(function(i){$('#prD'+i).hidden=String(i)!==d})});

  /* ---------- Límites y fuente ---------- */
  var k4s=TP.seleccion_k.filter(function(k){return k.k===4})[0];
  $('#prLim').innerHTML=[
    '<b>Piloto no decidido:</b> el tipo '+top.tipo+' es la propuesta del notebook, no una decisión del equipo. Elegir un tipo no elige la sede.',
    '<b>Quién y dónde no se cruzan:</b> la regla del relevo sale de la ENASIC 2022 (nacional, personas); los tipos de zona y el orden salen del Censo 2020 y el DENUE por AGEB. La ENASIC no permite concluir por alcaldía ni por AGEB, y nada aquí dice cuántas cuidadoras de 40 h o más hay en cada zona.',
    '<b>Brecha de oferta es distancia:</b> línea recta al establecimiento núcleo más cercano del DENUE, en el cuartil alto de 60+ y de distancia a la vez. No mide capacidad, precio, cupo ni transporte, y el corte es una convención.',
    '<b>Los tipos de zona son una forma de agrupar, no un ranking:</b> la ciudad cambia de forma gradual, así que las fronteras entre tipos no son nítidas. El nivel de una alcaldía tampoco es una prioridad ordenada.',
    '<b>Censo de marzo de 2020:</b> no refleja los cambios posteriores en población, vivienda ni conectividad.',
    '<b>La regla es una variable:</b> las demás (sexo, edad, ingreso, tipo de cuidado) solo describen a quién deja fuera. No hay evidencia aquí de que el relevo reduzca el daño.'
  ].map(function(t){return '<li>'+t+'</li>'}).join('');
  $('#src-pr').innerHTML=dl({Universo:'Decisión 1 y 3: AGEB urbanas de la CDMX ('+ent(TP.calidad.filter(function(c){return c.chequeo==='AGEB en el modelo'})[0].n_ageb)+' en el modelo). Decisión 2: personas cuidadoras de persona con discapacidad o 60+, nacional (ENASIC 2022)',
    Archivos:'Analysis/resultados/18_tipologia_*.csv, 24_prioridad_*.csv, 26_diag_muestra.csv, 27_v2_global.csv, 27_v2_equidad.csv, 27_v2_por_bloque.csv',
    Método:'Decisión 1: k-means de 4 tipos sobre 9 indicadores del Censo 2020. Decisión 2: regla «40 h o más», sin modelo; cobertura ponderada con FAC_CUI. Decisión 3: regla de dos medidas (volumen y concentración) con '+PRC+' combinaciones de corte',
    Estado:'Exploratorio. Sin doble revisión de otra persona'});
})();
