/* Observatorio del Cuidado · js/vistas/relevo.js
   Pestaña «¿Cuánto cuesta?»: paquetes por horas, asequibilidad por fuente de ingreso, parte del ingreso del hogar mediano,
   pago por hora por tipo de servicio, subsidio. (7 oct 2026, noche: se agregaron «¿Qué parte del ingreso se lleva?» y las
   filas de trabajo doméstico y enfermería en el pago por hora.)
   Importa de OBS: $, CT, FAINT, MONO, P, REL, dl, ent, esc, fmt, lineas, mxn, r40, r6, seg, svg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,CT=OBS.CT,FAINT=OBS.FAINT,MONO=OBS.MONO,P=OBS.P,REL=OBS.REL,dl=OBS.dl
      ,ent=OBS.ent,esc=OBS.esc,fmt=OBS.fmt,lineas=OBS.lineas,mxn=OBS.mxn,r40=OBS.r40
      ,r6=OBS.r6,seg=OBS.seg,svg=OBS.svg;
  var piso=REL.filter(function(r){return r.salario.indexOf('Piso')===0})[0].salario_hora_2026, caceh=REL.filter(function(r){return r.salario.indexOf('Piso')!==0})[0].salario_hora_2026;
  var RT=[[mxn(r6.costo_mensual_2026),'al mes por 6 h/semana al piso legal'],[mxn(r40.costo_mensual_2026),'al mes por la jornada completa (40 h)'],[fmt(r6.u20)+'%','de los hogares podría pagar 6 h/sem'],['$'+fmt(piso,2),'por hora: salario mínimo profesional 2026']];
  function relTiles(){$('#relTiles').innerHTML=RT.map(function(t,i){return '<div class="card tile"><div class="big num" style="font-size:30px;'+(i===1?'color:var(--alert)':i===2?'color:var(--teal)':'')+'">'+t[0]+'</div><div class="lbl">'+t[1]+'</div></div>'}).join('');}
  var SALS=[];REL.forEach(function(r){if(SALS.indexOf(r.salario)<0)SALS.push(r.salario)});
  $('#segSal').innerHTML=SALS.map(function(sl,i){var h=REL.filter(function(r){return r.salario===sl})[0].salario_hora_2026;return '<button data-s="'+i+'" aria-pressed="'+(i===0)+'">'+(sl.indexOf('Piso')===0?'Piso legal':'Tabulador CACEH')+' $'+fmt(h,0)+'/h</button>'}).join('');
  var salSel=0,umb='u20',fte='enasic',RE=D.relevo_enigh;
  var FTE={enasic:'ENASIC 2022, nacional',Nacional:'ENIGH 2022, nacional',CDMX:'ENIGH 2022, CDMX'};
  function relRows(){return fte==='enasic'?REL:RE.filas.filter(function(r){return r.dominio===fte})}
  /* «¿Qué parte del ingreso se lleva?»: costo del paquete ÷ ingreso mediano del hogar con necesidad (pct_ingreso_mediano,
     script 10 para la ENASIC y build_datos.py con el script 14 para la ENIGH). Sigue los selectores de fuente, salario y tope. */
  function renderIng(rows,sl){
    var u=+umb.slice(1),W=420,rowH=34,lab=92,top=24,x1=W-62,cap=60,H=top+rows.length*rowH+22;
    function X(v){return lab+(x1-lab)*Math.min(v,cap)/cap}
    var s=svg(W,H,'Costo de cada paquete como porcentaje del ingreso del hogar mediano');
    [10,20,30].forEach(function(t){var on=t===u;s+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+(top-6)+'" y2="'+(top+rows.length*rowH)+'" stroke="'+(on?'#2b3045':'rgba(63,71,96,.18)')+'" stroke-width="'+(on?1.5:1)+'" stroke-dasharray="'+(on?'4 3':'2 3')+'"/><text x="'+X(t)+'" y="'+(top-10)+'" text-anchor="middle" '+MONO+' font-size="10" font-weight="'+(on?700:400)+'" fill="'+(on?'#2b3045':FAINT)+'">'+t+'%</text>'});
    s+='<line x1="'+X(0)+'" x2="'+X(0)+'" y1="'+(top-6)+'" y2="'+(top+rows.length*rowH)+'" stroke="rgba(63,71,96,.3)"/>';
    rows.forEach(function(r,i){var cy=top+i*rowH+rowH/2,v=r.pct_ingreso_mediano,ok=v<=u,c=ok?'#23806f':'#c0435a',xe=X(v);
      s+='<g><title>'+esc(r.horas===40?'Jornada 40 h':r.horas+' h/sem')+': '+fmt(v)+'% del ingreso mediano ('+mxn(r.costo_mensual_2026)+'/mes)</title>';
      s+='<text x="0" y="'+(cy+4)+'" font-size="12.5" font-weight="600" fill="#2b3045">'+(r.horas===40?'Jornada 40 h':r.horas+' h/sem')+'</text>';
      s+='<rect x="'+X(0)+'" y="'+(cy-8)+'" width="'+Math.max(1.5,xe-X(0)).toFixed(1)+'" height="16" rx="3" fill="'+c+'" opacity="'+(ok?1:.85)+'"/>';
      if(v>cap)s+='<path d="M'+(xe-1)+' '+(cy-8)+' l8 8 l-8 8 z" fill="'+c+'"/>';
      s+='<text x="'+(xe+(v>cap?12:7))+'" y="'+(cy+4)+'" '+MONO+' font-size="12" font-weight="700" fill="'+c+'" style="paint-order:stroke;stroke:#fff;stroke-width:4px">'+fmt(v)+'%</text></g>'});
    s+='<text x="0" y="'+(H-4)+'" font-size="11" fill="'+FAINT+'">Verde: cabe en el tope de '+u+'% · rojo: lo rebasa</text>';
    $('#ch-ing').innerHTML=s+'</svg>';
    var a=rows[1],z=rows[rows.length-1],med=fte==='enasic'?D.ingreso.mediana_2022:RE.mediana_nov2022[fte];
    $('#ingFind').innerHTML='Para el hogar con el ingreso mediano (<b>'+mxn(med)+'</b> al mes, pesos de nov-2022, '+FTE[fte]+'), 6 h/semana al '+(sl.indexOf('Piso')===0?'piso legal':'tabulador CACEH')+' cuestan <b>'+fmt(a.pct_ingreso_mediano)+'%</b> de su ingreso y la jornada completa <b>'+fmt(z.pct_ingreso_mediano)+'%</b>.';
    $('#src-ing').innerHTML=dl({Cálculo:'Costo mensual del paquete ÷ ingreso monetario mensual mediano de los hogares con persona con discapacidad o de 60 años y más.',
      Lectura:'Describe a un solo hogar, el mediano. Cuántos hogares quedan dentro del tope lo dice la gráfica «¿Cuántos hogares podrían pagarlo?». La escala se corta en 60%: una flecha marca el paquete que la rebasa (la cifra es el valor completo).',
      Precisión:fte==='enasic'?'ENASIC: mediana ponderada, sin varianza de diseño. La ENASIC capta cerca de la mitad del ingreso que mide la ENIGH: el porcentaje queda sobreestimado.':'ENIGH: mediana puntual, sin IC.',
      Supuesto:'Sin prestaciones ni hora nocturna (script 15): el costo real es mayor.',
      Archivo:fte==='enasic'?esc(D.relevo.fuente)+' (columna costo_pct_ingreso_mediano)':esc(RE.fuente)+'; el cociente lo calcula build_datos.py con el costo y la mediana de ago-2022'});
  }
  function renderRelevo(){
    var sl=SALS[salSel],rows=relRows().filter(function(r){return r.salario===sl}).sort(function(a,b){return a.horas-b.horas}),a=rows[1],z=rows[rows.length-1];
    $('#relFind').innerHTML='Con el '+(sl.indexOf('Piso')===0?'piso legal':'tabulador CACEH')+', un tope de '+umb.slice(1)+'% del ingreso y el ingreso de la <b>'+FTE[fte]+'</b>, <b>'+fmt(a[umb])+'%</b> podría pagar 6 h/semana; la jornada completa, <b>'+fmt(z[umb])+'%</b>.';
    var hasCI=rows.every(function(r){return r[umb+'_li']!=null});
    $('#ch-relevo').innerHTML=lineas({W:640,H:470,pr:34,pb:70,max:100,ticks:[0,25,50,75,100],unit:'%',aria:'Hogares que podrían pagar cada paquete',band:hasCI,
      cats:rows.map(function(r){return r.horas===40?'Jornada 40 h':r.horas+' h/sem'}),sub:rows.map(function(r){return mxn(r.costo_mensual_2026)+'/mes'}),
      series:[{nombre:'',col:'#23806f',pts:rows.map(function(r){var pq=r[umb+'_prec'];return {y:r[umb],li:r[umb+'_li'],ls:r[umb+'_ls'],col:r.horas===40?'#c0435a':'#23806f',weak:pq!=null&&pq!=='alta',tip:pq?'precisión '+pq:''}})}]});
    renderIng(rows,sl);
    var r6f=relRows().filter(function(r){return r.salario===SALS[0]&&r.horas===6})[0];RT[2]=[fmt(r6f.u20)+'%','de los hogares podría pagar 6 h/sem al piso legal con tope de 20% ('+FTE[fte]+')'];relTiles();
    var M=RE.mediana_nov2022;
    $('#relIng').innerHTML=fte==='enasic'?'Ingreso mediano de los hogares con necesidad: ENASIC <b>'+mxn(D.ingreso.mediana_2022)+'</b> al mes contra ENIGH <b>'+mxn(M.Nacional)+'</b> (nacional, pesos de nov-2022). La ENASIC capta cerca de la mitad del ingreso que mide la ENIGH, así que con la ENASIC la asequibilidad queda subestimada.':'Línea negra: intervalo de confianza al 90% (diseño muestral de la ENIGH). Ingreso monetario del hogar; el ingreso en especie no sirve para pagar el relevo.';
    $('#src-relevo').innerHTML=fte==='enasic'?dl({Universo:'Hogares con persona con discapacidad o 60+, nacional (n = '+REL[0].n.toLocaleString('es-MX')+')',Precisión:esc(D.relevo.alcance),Supuesto:'Ingreso 2022 llevado a 2026 con INPC. Sin cuotas patronales ni prestaciones (aguinaldo, vacaciones, séptimo día) y todo como hora diurna (÷ 8); la hora nocturna se divide entre 7 (script 15). El tabulador CACEH es referencia de sociedad civil, no piso legal.',Archivo:esc(D.relevo.fuente)})
      :dl({Universo:'Hogares con persona con discapacidad o 60+, '+(fte==='CDMX'?'CDMX':'nacional')+' (n = '+rows[0].n.toLocaleString('es-MX')+')',Precisión:'Linealización de Taylor con estratos y UPM de la ENIGH; IC al 90%. '+(fte==='CDMX'?'La ENIGH llega a entidad, no a alcaldía.':''),Supuesto:'Ingreso monetario mensual del hogar en pesos de ago-2022; costos del script 10 pasados de nov-2022 a ago-2022 con el deflactor del CONEVAL. Sin cuotas patronales. El tabulador CACEH es referencia de sociedad civil, no piso legal.',Pendiente:'Sin prestaciones y como hora diurna, igual que el script 10. Confirmar que la definición de discapacidad de la ENASIC y la del CONEVAL usan el mismo corte.',Archivo:esc(RE.fuente)});
  }
  seg('#segFte','f',function(v){fte=v;renderRelevo()}); seg('#segSal','s',function(v){salSel=+v;renderRelevo()}); seg('#segUmb','u',function(v){umb=v;renderRelevo()}); renderRelevo();
  var SERV=[['cuidadora','Cuidadora'],['domestica','Trabajo doméstico por horas'],['enfermeria','Enfermería']];
  $('#pagoFind').innerHTML='La mitad de los pagos observados a cuidadoras es de <b>$'+fmt(P.cuidadora.mediana,2)+'/h</b> o menos, casi el piso legal ($'+fmt(piso,2)+') y por debajo de la mediana del trabajo doméstico por horas (<b>$'+fmt(P.domestica.mediana,2)+'/h</b>). No es una comparación limpia: el trabajo doméstico se contrata por menos horas (mediana '+fmt(P.domestica.horas_sem_mediana,0)+' h/sem contra '+fmt(P.cuidadora.horas_sem_mediana,0)+' h/sem) y solo '+P.cuidadora.n+' hogares reportan pago a cuidadora.';
  (function(){
    var W=420,top=40,rowH=54,x0=6,x1=W-14,max=160,H=top+SERV.length*rowH+20;
    function X(v){return x0+(x1-x0)*Math.min(v,max)/max}
    var s=svg(W,H,'Pago por hora observado por tipo de servicio');
    for(var t=0;t<=max;t+=40)s+='<text x="'+X(t)+'" y="'+(H-4)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">$'+t+'</text>';
    function ref(v,l,c,anchor){s+='<line x1="'+X(v)+'" x2="'+X(v)+'" y1="'+(top-8)+'" y2="'+(top+SERV.length*rowH-6)+'" stroke="'+c+'" stroke-width="1.5" stroke-dasharray="4 3"/><text x="'+X(v)+'" y="'+(top-14)+'" text-anchor="'+anchor+'" font-size="11.5" font-weight="650" fill="'+c+'">'+l+' $'+fmt(v,2)+'</text>'}
    ref(piso,'Piso legal','#23806f','middle'); ref(caceh,'CACEH','#a9711a','middle');
    SERV.forEach(function(k,i){var e=P[k[0]],y=top+i*rowH,cy=y+32,weak=e.n<30,col=k[0]==='cuidadora'?'#77689d':'#9a93ad';
      s+='<g><title>'+k[1]+': p25 $'+fmt(e.p25,2)+' · mediana $'+fmt(e.mediana,2)+' · p75 $'+fmt(e.p75,2)+' (n = '+e.n+', sin ponderar)</title>';
      s+='<text x="'+x0+'" y="'+(y+14)+'" style="paint-order:stroke;stroke:#fff;stroke-width:4px" font-size="12.5" font-weight="'+(k[0]==='cuidadora'?700:600)+'" fill="#2b3045">'+k[1]+' <tspan '+MONO+' font-size="10" font-weight="400" fill="'+(weak?'#c0435a':FAINT)+'">n = '+e.n+(weak?' · precisión baja':'')+'</tspan></text>';
      s+='<line x1="'+X(0)+'" x2="'+x1+'" y1="'+cy+'" y2="'+cy+'" stroke="rgba(63,71,96,.12)"/>';
      s+='<rect x="'+X(e.p25)+'" y="'+(cy-9)+'" width="'+(X(e.p75)-X(e.p25))+'" height="18" rx="4" fill="'+col+'" opacity=".25"/>';
      if(e.p75>max)s+='<text x="'+(x1-2)+'" y="'+(cy+24)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">p75 $'+fmt(e.p75,0)+' →</text>';
      s+='<line x1="'+X(e.mediana)+'" x2="'+X(e.mediana)+'" y1="'+(cy-12)+'" y2="'+(cy+12)+'" stroke="'+col+'" stroke-width="3.5"/>';
      var lx=X(e.mediana)+7,anc='start';
      s+='<text x="'+lx+'" y="'+(cy+4)+'" text-anchor="'+anc+'" '+MONO+' font-size="11.5" font-weight="700" fill="#2b3045" style="paint-order:stroke;stroke:#fff;stroke-width:4px">$'+fmt(e.mediana,2)+'</text></g>'});
    $('#ch-pago').innerHTML=s+'</svg>';
  })();
  $('#src-pago').innerHTML=dl({Lectura:'Raya: mediana. Banda: percentiles 25 a 75. Pesos de 2026 (INPC).',Muestra:'Hogares que reportan el pago y las horas, sin ponderar: cuidadora '+P.cuidadora.n+', trabajo doméstico entrada por salida '+P.domestica.n+', enfermería '+P.enfermeria.n+'. Cuidadora y enfermería quedan marcadas con precisión baja (menos de 30 casos).',Advertencia:'No controla horas ni tareas: la tarifa por hora suele bajar cuando se contratan más horas a la semana, y la diferencia entre servicios puede deberse a eso.',Archivo:esc(P.fuente)});
  $('#relNo').innerHTML='<b>Poder pagar no es querer contratar.</b> Hoy contrata cuidado solo '+fmt(CT.cuidado.pct)+'% de los hogares con necesidad, y '+fmt(D.preferencia[1].pct)+'% no contrataría a nadie. Eso lo tiene que medir el piloto.';
  (function(){
    var sol=D.anclas.filter(function(a){return /Solicitud CDMX/.test(a.ancla)})[0];
    var rows=D.subsidio.filter(function(r){return r.mdp25>0}).map(function(r){return {l:r.paquete+(r.base.indexOf('con')===0?' + IMSS':''),v:r.mdp25,pct:r.pct_sin,s:r.sub25}});
    $('#subFind').innerHTML='Subsidiar medio tiempo (20 h) al piso legal para que el 25% de los hogares pueda pagar costaría <b>'+ent(rows[0].v)+' mdp</b> al año, '+fmt(100*rows[0].v/sol.valor,1)+'% de la solicitud del Sistema Público de Cuidados ('+ent(sol.valor)+' mdp). Los paquetes de relevo de 3 a 12 h todavía no tienen este cálculo.';
    var W=1100,rowH=36,lab=150,x1=W-90,H=rows.length*rowH+30,mx=Math.max(sol.valor,Math.max.apply(null,rows.map(function(r){return r.v})))*1.05;
    function X(v){return lab+(x1-lab)*v/mx}
    var s=svg(W,H,'Costo anual del subsidio contra presupuesto');
    rows.forEach(function(r,i){var y=i*rowH+4;
      s+='<text x="0" y="'+(y+17)+'" font-size="12.5" font-weight="600" fill="#2b3045">'+esc(r.l)+'</text>';
      s+='<g><title>Subsidio '+mxn(r.s)+'/mes por hogar</title><line x1="'+lab+'" x2="'+X(r.v)+'" y1="'+(y+14)+'" y2="'+(y+14)+'" stroke="#d6d0e6" stroke-width="3"/><circle cx="'+X(r.v)+'" cy="'+(y+14)+'" r="9" fill="'+(r.v>sol.valor?'#c0435a':'#77689d')+'" stroke="#fff" stroke-width="2"/></g>';
      s+='<text x="'+(X(r.v)+16)+'" y="'+(y+19)+'" '+MONO+' font-size="11.5" font-weight="700" fill="#2b3045" style="paint-order:stroke;stroke:#fff;stroke-width:4px">'+ent(r.v)+'</text>'});
    s+='<line x1="'+X(sol.valor)+'" x2="'+X(sol.valor)+'" y1="0" y2="'+(H-22)+'" stroke="#23806f" stroke-width="2" stroke-dasharray="5 3"/><text x="'+X(sol.valor)+'" y="'+(H-6)+'" text-anchor="middle" font-size="11.5" font-weight="650" fill="#23806f">Solicitud CDMX '+ent(sol.valor)+' mdp</text>';
    $('#ch-sub').innerHTML=s+'</svg>';
    $('#src-sub').innerHTML=dl({Hogares:'cota inferior de la CDMX inferida en el script 05 (no es medición local). La ENIGH 2022 mide '+ent(D.relevo_enigh.necesidad_cdmx_det.total)+' hogares; este cálculo todavía no se rehace con esa base.',Supuestos:'carga patronal ~22% por confirmar con el IMSS; solicitud CDMX tomada de prensa ('+esc(sol.evidencia)+')',Archivo:esc(D.subsidio_fuente)});
  })();
})();
