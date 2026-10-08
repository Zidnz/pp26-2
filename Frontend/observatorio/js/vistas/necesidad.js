/* Observatorio del Cuidado · js/vistas/necesidad.js
   Pestaña «¿Quién lo carga?»: necesidad contra daño, diferencias con IC, grupo del problema, perfil y horas.
   Importa de OBS: $, C, C_INK, FAINT, G, K, MONO, dl, esc, fmt, iconosDano, isWeak, lineas, mill, prec, svg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,C=OBS.C,FAINT=OBS.FAINT,G=OBS.G,K=OBS.K,MONO=OBS.MONO,dl=OBS.dl
      ,esc=OBS.esc,fmt=OBS.fmt,isWeak=OBS.isWeak,lineas=OBS.lineas,mill=OBS.mill
      ,pict=OBS.pict,prec=OBS.prec,svg=OBS.svg,iconosDano=OBS.iconosDano;
  $('#cargaFind').innerHTML='Con 40 h o más, <b>'+fmt(C.dano[2].pct)+'%</b> de quienes dicen "no tuve necesidad" declara daño; con menos de 20 h, '+fmt(C.dano[0].pct)+'%. Decir "no tuve necesidad" baja apenas de '+fmt(C.sin_necesidad[0].pct)+'% a '+fmt(C.sin_necesidad[2].pct)+'%.';
  (function(){
    var LB=['Menos de 20 h','20 a 39 h','40 h o más'];
    $('#ch-carga').innerHTML=iconosDano(C.segmentos.map(function(sg,i){return {lbl:LB[i],nec:C.sin_necesidad[i],dano:C.dano[i]}}));
    $('#src-carga').innerHTML=dl({Fuente:'INEGI, ENASIC 2022, microdatos (TPOB_CUI, FAC_CUI)',Cobertura:'Nacional',Preguntas:'P6.7, P6.26, P6.42, P6.45, P6.11–P6.12, P6.30–P6.31',Advertencia:'P6.45 pregunta por lugares. El INEGI rotula la opción "NO HA TENIDO NECESIDAD (NO HAY PERSONAS EN SU HOGAR QUE REQUIERAN CUIDADOS)": puede leerse como "no necesito un lugar" o como que la persona cuidada vive en otro hogar. Daños autodeclarados.',Archivo:esc(C.fuente)});
  })();
  (function(){
    var CI=OBS.C_INK,NOM=[['"No tuvo necesidad"','Dice «no tuve necesidad»'],['"El propio hogar cuida"','Dice «el propio hogar cuida»'],['Algún daño entre "sin necesidad"','Declara algún daño*'],['Salud física deteriorada entre "sin necesidad"','Salud física deteriorada*']];
    /* todas las diferencias se expresan como «más horas menos menos horas»: positivo = sube con la carga */
    function norm(d){var c=d.comparacion,inv=/<20 h menos >=40 h|Q1 menos Q4/.test(c),nm=c;
      NOM.forEach(function(p){if(c.indexOf(p[0])===0)nm=p[1]});
      return {nm:nm,q:/Q[14]/.test(c),dif:inv?-d.dif_pp:d.dif_pp,li:inv?-d.ls90:d.li90,ls:inv?-d.li90:d.ls90,ok:d.excluye_cero===true||d.excluye_cero==='True'}}
    var L=C.diferencias.map(norm);
    var W=470,lab=192,x0=lab+6,x1=W-48,mn=-30,mx=50,rowH=30,y=0,body='';
    function X(v){return x0+(x1-x0)*(v-mn)/(mx-mn)}
    function grupo(t,arr){body+='<text x="0" y="'+(y+14)+'" font-size="10" font-weight="700" fill="#77689d" letter-spacing=".06em">'+t+'</text>';y+=22;
      arr.forEach(function(d){var cy=y+rowH/2,col=d.ok?CI:'#b5afc6';
        body+='<g><title>'+esc(d.nm)+': '+(d.dif>0?'+':'')+fmt(d.dif)+' pp (IC 90%: '+fmt(d.li)+' a '+fmt(d.ls)+')'+(d.ok?'':' · el intervalo cruza el cero')+'</title>';
        body+='<text x="0" y="'+(cy+4)+'" font-size="12.5" fill="'+(d.ok?CI:FAINT)+'">'+esc(d.nm)+'</text>';
        body+='<line x1="'+X(d.li)+'" x2="'+X(d.ls)+'" y1="'+cy+'" y2="'+cy+'" stroke="'+col+'" stroke-width="5" stroke-linecap="round" opacity="'+(d.ok?.3:.55)+'"/>';
        body+='<circle cx="'+X(d.dif)+'" cy="'+cy+'" r="6" fill="'+(d.ok?CI:'#fff')+'" stroke="'+col+'" stroke-width="2"/>';
        body+='<text x="'+(X(d.ls)+8)+'" y="'+(cy+4)+'" '+MONO+' font-size="11.5" font-weight="700" fill="'+(d.ok?CI:FAINT)+'">'+(d.dif>0?'+':'')+fmt(d.dif)+'</text></g>';
        y+=rowH})}
    grupo('40 H O MÁS FRENTE A MENOS DE 20 H',L.filter(function(d){return !d.q}));y+=8;
    grupo('COMPROBACIÓN: CUARTIL DE HORAS MÁS ALTO FRENTE AL MÁS BAJO',L.filter(function(d){return d.q}));
    var H=y+40,s=svg(W,H,'Diferencias en puntos porcentuales con intervalo al 90%');
    for(var t=-30;t<=50;t+=10)s+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="18" y2="'+(y+4)+'" stroke="'+(t===0?'rgba(43,48,69,.6)':'rgba(63,71,96,.08)')+'"'+(t===0?' stroke-width="1.5"':'')+'/><text x="'+X(t)+'" y="'+(y+18)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+(t>0?'+':'')+t+'</text>';
    s+='<text x="'+(X(0)-6)+'" y="'+(y+34)+'" text-anchor="end" font-size="11" fill="'+FAINT+'">← baja con más horas</text><text x="'+(X(0)+6)+'" y="'+(y+34)+'" font-size="11" fill="'+FAINT+'">sube con más horas →</text>';
    $('#ch-dif').innerHTML=s+body+'</svg><div class="legend"><span><i style="background:#2b3045;border-radius:50%"></i>El intervalo no cruza el cero: hay diferencia</span><span><i style="background:#fff;border:2px solid #b5afc6;border-radius:50%"></i>Cruza el cero: no se distingue de 0</span><span>* entre quienes dicen «no tuve necesidad»</span></div>';
    $('#src-dif').innerHTML=dl({Método:'Diferencia entre proporciones con varianza de diseño, IC al 90%. Todas se expresan como «más horas menos menos horas» (el CSV guarda algunas con el signo contrario).',Advertencia:'Son seis comparaciones al 90% sin corrección por comparaciones múltiples; las de cuartiles repiten las primeras con otro corte.',Archivo:'Analysis/resultados/07_enasic_diferencias.csv'});
  })();
  /* 7 oct 2026 (noche): KPI del grupo del problema con jerarquía de portada: título y cifra grandes a la izquierda, 79.6% arriba a la derecha */
  $('#grupo').innerHTML='<div class="gp">'+
    '<h3 class="gp-tit">El grupo del problema</h3><div class="gp-big num">≈ '+mill(G.total_expandido)+'</div>'+
    '<div class="gp-side"><div class="gp-pct num">'+fmt(C.nucleo_dano.pct)+'%</div><div class="lbl">declara daño entre quienes además bañan, visten o dan de comer</div></div>'+
    '<p class="gp-desc">personas cuidadoras: cuidan 40 h o más, dicen "no tuve necesidad" y declaran daño. Son el <b>'+fmt(G.pct)+'%</b> de quienes cuidan a una persona con discapacidad o 60+.</p>'+
    '<div class="chips gp-chips">'+prec(G.precision)+'<span class="chip ev">probable</span><span class="chip geo">nacional</span></div></div>';
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
    $('#perfFind').innerHTML=sig.map(function(r){return '<b>'+fmt(r.pct)+'%</b> '+(r.segmento==='Mujer'?'son mujeres':r.segmento==='Cuida discapacidad'?'cuida a una persona con discapacidad':esc(LBLP[r.segmento]))+' (en el universo, '+fmt(pr(r.dimension,r.segmento,'Universo').pct)+'%)'}).join('; ')+'. '+(nosig.length?'Por '+nosig.map(function(d){return d.toLowerCase()}).join(' e ')+', el grupo no se distingue del resto.':'');
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
    var gN=PF[0].n_muestra_dominio;
    $('#src-perfil').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional',Grupo:'40 h o más, no buscó, "no tuve necesidad" y declara daño (n = '+gN+' en la muestra)',Lectura:'Barra roja: % dentro del grupo del problema. Barra gris: % entre todas las personas cuidadoras del universo. Los grupos de ingreso no tienen el mismo tamaño: Q3 es un solo quintil y por eso pesa menos. «Ingreso sin dato» (atenuado) es un faltante, no un grupo.',Método:'Composición con diseño muestral, IC al 90%. ★ = el grupo difiere del resto del universo (no del universo completo, porque lo contiene).',Advertencia:'Muestra chica: varias categorías tienen precisión moderada. Es composición, no riesgo; para riesgo por segmento usa el filtro de arriba.',Archivo:esc(D.horas_dist.fuente.split(' y ')[0])});
  })();
  /* ---- distribución de horas (script 16) ---- */
  (function(){
    var HD=D.horas_dist,RG=HD.rangos.filter(function(r){return r.desde>=1}).sort(function(a,b){return a.desde-b.desde});
    var p40=RG.filter(function(r){return r.desde>=40}).reduce(function(a,r){return a+r.pct},0);
    $('#horFind').innerHTML='La mitad cuida <b>'+fmt(HD.mediana,0)+' h</b> a la semana o menos; <b>'+fmt(p40)+'%</b> cuida 40 h o más, y '+fmt(HD.tope98.pct)+'% llega al tope del cuestionario (98 h en un bloque).';
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
    $('#src-horas').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional (n = '+RG[0].n_muestra_dominio+')',Preguntas:'P6.7 + P6.26, tope de 168',Advertencia:'Cada bloque del cuestionario topa en \"98 o más\": los rangos altos están censurados. Barras rayadas: precisión baja.',Archivo:esc(D.horas_dist.fuente.split(' y ')[1]?'Analysis/resultados/'+D.horas_dist.fuente.split(' y ')[1]:D.horas_dist.fuente)});
  })();
})();
