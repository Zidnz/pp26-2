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
  function relTiles(){$('#relTiles').innerHTML=RT.map(function(t,i){return '<div class="card tile"><div class="big num" style="font-size:30px;'+(i===1?'color:var(--alert)':i===2?'color:var(--accent)':'')+'">'+t[0]+'</div><div class="lbl">'+t[1]+'</div></div>'}).join('');}
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
    rows.forEach(function(r,i){var cy=top+i*rowH+rowH/2,v=r.pct_ingreso_mediano,ok=v<=u,c=ok?'#77689d':'#c0435a',xe=X(v);
      s+='<g><title>'+esc(r.horas===40?'Jornada 40 h':r.horas+' h/sem')+': '+fmt(v)+'% del ingreso mediano ('+mxn(r.costo_mensual_2026)+'/mes)</title>';
      s+='<text x="0" y="'+(cy+4)+'" font-size="12.5" font-weight="600" fill="#2b3045">'+(r.horas===40?'Jornada 40 h':r.horas+' h/sem')+'</text>';
      s+='<rect x="'+X(0)+'" y="'+(cy-8)+'" width="'+Math.max(1.5,xe-X(0)).toFixed(1)+'" height="16" rx="3" fill="'+c+'" opacity="'+(ok?1:.85)+'"/>';
      if(v>cap)s+='<path d="M'+(xe-1)+' '+(cy-8)+' l8 8 l-8 8 z" fill="'+c+'"/>';
      s+='<text x="'+(xe+(v>cap?12:7))+'" y="'+(cy+4)+'" '+MONO+' font-size="12" font-weight="700" fill="'+c+'" style="paint-order:stroke;stroke:#fff;stroke-width:4px">'+fmt(v)+'%</text></g>'});
    s+='<text x="0" y="'+(H-4)+'" font-size="11" fill="'+FAINT+'">Morado: cabe en el tope de '+u+'% · rojo: lo rebasa</text>';
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
      series:[{nombre:'',col:'#77689d',pts:rows.map(function(r){var pq=r[umb+'_prec'];return {y:r[umb],li:r[umb+'_li'],ls:r[umb+'_ls'],col:r.horas===40?'#c0435a':'#77689d',weak:pq!=null&&pq!=='alta',tip:pq?'precisión '+pq:''}})}]});
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
    ref(piso,'Piso legal','#77689d','middle'); ref(caceh,'CACEH','#2b3045','middle');
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
  /* Financiamiento del relevo por horas en la CDMX (script 20, 15 oct 2026). Sustituye al cálculo de 20 h/40 h del script 06, que era de
     otro producto (media jornada) y usaba 1,099,461 hogares (cota inferior del script 05) en lugar de los 1,407,522 de la ENIGH 2022. */
  (function(){
    var S=D.sostenibilidad,sol=S.solicitud_mdp,oSel=0,ESC=S.escala.map(function(e){return e.escenario});
    var NOM=['Bajo · 5%','Medio · 25%','Máximo · 64%'];
    function cop(f){return S.copago.filter(function(c){return c.fuente===f&&c.hogar==='ponderado'})[0].subsidio}
    function render(){
      var rows=ESC.map(function(e,i){var f=S.financiamiento.filter(function(r){return r.escenario===e&&r.opex===oSel})[0],h=S.escala[i];return {l:NOM[i],h:h.hogares,v:f.mdp,pct:f.pct_solicitud}});
      var m=rows[1];
      $('#subFind').innerHTML='Con 6 h/semana de relevo diurno, carga laboral del 22% y un tope de 20% del ingreso, el hogar promedio del grupo necesitaría <b>'+mxn(cop('ENASIC nacional'))+'</b> al mes de subsidio laboral con el ingreso de la ENASIC y <b>'+mxn(cop('ENIGH CDMX'))+'</b> con el de la ENIGH CDMX: la fuente del ingreso es una decisión pendiente del equipo. Si aceptara el 25% de los ≈'+ent(S.elegibles_cdmx)+' hogares elegibles de la CDMX (aceptación ilustrativa), el financiamiento sería de <b>'+fmt(m.v,1)+' mdp</b> al año con operación de '+mxn(oSel)+' por hogar-mes, <b>'+fmt(m.pct,1)+'%</b> de la solicitud del Sistema Público de Cuidados ('+ent(sol)+' mdp).';
      var h='<div class="scroll-x"><table><thead><tr><th>Aceptación</th><th class="n">Hogares</th><th class="n">Financiamiento anual</th><th class="n">% de la solicitud</th></tr></thead><tbody>';
      rows.forEach(function(r){h+='<tr><td><b>'+esc(r.l)+'</b></td><td class="n">'+ent(r.h)+'</td><td class="n">'+fmt(r.v,1)+' mdp</td><td class="n"'+(r.pct>100?' style="color:#c0435a;font-weight:700"':'')+'>'+fmt(r.pct,2)+'%</td></tr>'});
      h+='<tr><td colspan="2"><b>Solicitud CDMX</b> (Sistema Público de Cuidados)</td><td class="n"><b>'+ent(sol)+' mdp</b></td><td class="n">100%</td></tr></tbody></table></div>';
      $('#ch-sub').innerHTML=h;
    }
    seg('#segOpex','o',function(v){oSel=+v;render()}); render();
    $('#src-sub').innerHTML=dl({Cálculo:'Hogares elegibles × (subsidio laboral promedio + costo de operación) × 12. Subsidio = costo laboral − copago, con copago máximo de 20% del ingreso (convención del equipo, no estándar oficial) y hogares tipo p25, mediana y p75 ponderados con el perfil de ingreso del grupo del problema.',
      Hogares:'≈'+ent(S.elegibles_cdmx)+' hogares elegibles: es la razón nacional «grupo del problema ÷ hogares con necesidad» aplicada a los '+ent(D.relevo_enigh.necesidad_cdmx_det.total)+' hogares con persona con discapacidad o 60+ de la ENIGH 2022 en la CDMX. Es una inferencia con tasas nacionales, no una medición local.',
      Ilustrativo:'Aceptación (5% y 25%) y costo de operación ($0 a $1,000 por hogar-mes) no tienen fuente: los mide el piloto. El máximo (64.1%) es una cota, 1 − «no contrataría»; declarar que se contrataría no demuestra que se contrate.',
      'No permite afirmar':'Punto de equilibrio, disposición a pagar ni que el relevo reduzca el daño al trabajo. La carga del 22% (IMSS e Infonavit) y los artículos de la LFT siguen por confirmar.',
      Solicitud:'$'+ent(sol)+' mdp tomados de prensa, por contrastar con el decreto aprobado.',
      Archivo:esc(S.fuente)});
  })();
  /* «¿Cambia el costo si el relevo es de noche?» (13 oct 2026): hora ordinaria y paquete mensual por tipo de jornada.
     Datos: D.jornada (script 19) y D.sostenibilidad (script 20, carga laboral). Piso legal, sin prestaciones; arts. 60-61 LFT pendientes de verificar (Daniel). */
  (function(){
    if(!D.jornada){$('#jorBloque').style.display='none';return}
    var J=D.jornada,SO=D.sostenibilidad,TIPOS=['Diurna','Mixta','Nocturna'],COL={Diurna:'#aa95d1',Mixta:'#77689d',Nocturna:'#2b3045'},hSel=6,cSel=1,CNOM={1:'sin carga laboral',2:'con IMSS e Infonavit (22%, por confirmar)',3:'con IMSS, aguinaldo y vacaciones (30.2%, por confirmar)'};
    function render(){
      var rows=TIPOS.map(function(t){var b=J.filas.filter(function(r){return r.jornada===t&&r.horas===hSel})[0],c=SO.costo.filter(function(r){return r.jornada===t&&r.horas===hSel&&r.carga===cSel})[0],d=SO.costo.filter(function(r){return r.jornada==='Diurna'&&r.horas===hSel&&r.carga===cSel})[0];
        return {jornada:t,horario:b.horario,horas_max:b.horas_max,costo_mensual_2026:c.costo_mensual,hora:c.costo_mensual/(hSel*4.33),dif_pct:100*(c.costo_mensual/d.costo_mensual-1)}});
      var W=460,rowH=46,lab=108,top=12,x1=W-132,mx=Math.max.apply(null,rows.map(function(r){return r.costo_mensual_2026}))*1.08,H=top+rows.length*rowH+24;
      function X(v){return lab+(x1-lab)*v/mx}
      var s=svg(W,H,'Costo mensual de '+hSel+' h/semana de relevo por tipo de jornada');
      rows.forEach(function(r,i){var cy=top+i*rowH+rowH/2,c=COL[r.jornada];
        s+='<g><title>'+esc(r.jornada)+' ('+esc(r.horario)+', máx. '+fmt(r.horas_max,1)+' h): $'+fmt(r.hora,2)+'/h · '+mxn(r.costo_mensual_2026)+' al mes por '+hSel+' h/sem</title>';
        s+='<text x="0" y="'+(cy-2)+'" font-size="12.5" font-weight="650" fill="#2b3045">'+esc(r.jornada)+'</text>';
        s+='<text x="0" y="'+(cy+13)+'" '+MONO+' font-size="10.5" fill="'+FAINT+'">$'+fmt(r.hora,2)+'/h · máx. '+fmt(r.horas_max,1)+' h</text>';
        s+='<rect x="'+X(0)+'" y="'+(cy-10)+'" width="'+(X(r.costo_mensual_2026)-X(0)).toFixed(1)+'" height="20" rx="3" fill="'+c+'"/>';
        s+='<text x="'+(X(r.costo_mensual_2026)+8)+'" y="'+(cy+5)+'" '+MONO+' font-size="12.5" font-weight="700" fill="#2b3045" style="paint-order:stroke;stroke:#fff;stroke-width:4px">'+mxn(r.costo_mensual_2026)+'/mes'+(r.dif_pct>0?' <tspan font-weight="400" fill="#c0435a">+'+fmt(r.dif_pct,1)+'%</tspan>':'')+'</text></g>'});
      s+='<text x="0" y="'+(H-4)+'" font-size="11" fill="'+FAINT+'">Piso legal, '+({1:'sin carga',2:'carga 22%',3:'carga 30.2%'})[cSel]+'. Porcentaje: diferencia contra la jornada diurna.</text>';
      $('#ch-jor').innerHTML=s+'</svg>';
      var d=rows[0],n=rows[2];
      var d0=SO.costo.filter(function(r){return r.jornada==='Diurna'&&r.horas===hSel&&r.carga===1})[0].costo_mensual;
      $('#jorFind').innerHTML='Con el mismo salario diario ($'+fmt(J.salario_diario,2)+'), la jornada nocturna dura '+fmt(n.horas_max,0)+' h y la diurna '+fmt(d.horas_max,0)+' h, así que la hora de noche cuesta <b>$'+fmt(n.hora,2)+'</b> contra <b>$'+fmt(d.hora,2)+'</b> de día (<b>+'+fmt(n.dif_pct,1)+'%</b>), '+CNOM[cSel]+'. '+hSel+' h/semana de noche: <b>'+mxn(n.costo_mensual_2026)+'</b> al mes contra '+mxn(d.costo_mensual_2026)+'.'+(cSel>1?' La carga laboral sube el relevo diurno de '+mxn(d0)+' a <b>'+mxn(d.costo_mensual_2026)+'</b> (+'+fmt(100*(d.costo_mensual_2026/d0-1),1)+'%).':' Las demás gráficas de esta sección calculan todo como hora diurna y sin carga laboral.')+' Una sola persona cubre como máximo '+fmt(n.horas_max,0)+' h de noche: una noche completa de 12 h requiere dos personas u horas extra.';
    }
    seg('#segJor','h',function(v){hSel=+v;render()}); seg('#segCarga','c',function(v){cSel=+v;render()}); render();
    $('#src-jor').innerHTML=dl({Cálculo:'Hora ordinaria = salario diario ÷ horas máximas de la jornada (diurna 8, mixta 7.5, nocturna 7). Paquete mensual = hora × horas por semana × 4.33, igual que el script 10. La fila diurna coincide con el script 10 (control en el script 19).',
      Evidencia:esc(J.evidencia)+'. Falta confirmar también cómo aplica al trabajo del hogar (art. 333 LFT).',
      'No incluye':'Sin carga: aguinaldo, vacaciones, prima vacacional, séptimo día, cuotas del IMSS e Infonavit ni horas extra. Con carga (script 20): IMSS e Infonavit al 22% del salario (por confirmar con la calculadora del IMSS) y, en la tercera opción, aguinaldo de 15 días y vacaciones de 12 días con prima del 25% (arts. 76, 80 y 87 LFT, por verificar). Ninguna opción incluye séptimo día, descansos de jornadas por horas ni horas extra: el costo real es mayor.',
      'No permite afirmar':'Cuántos hogares pueden pagar el relevo nocturno: eso se rehace en el script 10 cuando exista el factor de prestaciones.',
      Archivo:esc(J.fuente)+'; '+esc(SO.fuente)});
  })();
})();
