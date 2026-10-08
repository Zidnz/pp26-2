/* Observatorio del Cuidado · js/vistas/barreras.js
   Pestaña «¿Por qué no se contrata?»: semáforo de hipótesis, razones para no buscar, quintil, preferencia, oferta.
   Importa de OBS: $, $$, F, K, OD, Q, R, RAZK, SG, barrasGrupo, barrasH, columnas, car, des, dl, dona, esc, fmt, isWeak, lineas, lolli, seg, segName, tm, waffle
   Exporta a OBS:  renderPref, renderRaz */
(function(){
  var $=OBS.$,$$=OBS.$$,F=OBS.F,K=OBS.K,OD=OBS.OD,Q=OBS.Q,R=OBS.R,RAZK=OBS.RAZK
      ,SG=OBS.SG,anillos=OBS.anillos,car=OBS.car,des=OBS.des,dl=OBS.dl,dona=OBS.dona
      ,esc=OBS.esc,fmt=OBS.fmt,isWeak=OBS.isWeak,lineas=OBS.lineas,lolli=OBS.lolli
      ,seg=OBS.seg,segName=OBS.segName,tm=OBS.tm,waffle=OBS.waffle,barrasH=OBS.barrasH,barrasGrupo=OBS.barrasGrupo,columnasGrupo=OBS.columnasGrupo,figurasSexo=OBS.figurasSexo,columnas=OBS.columnas;
  var q5c=Q(5,'cuidadora'),q5d=Q(5,'doméstico'),q1c=Q(1,'cuidadora');
  var LT=[
    ['Precio','#a9711a','No es el cuello de botella',fmt(car.pct)+'%','no buscó porque "son caros"'],
    ['Desconfianza','#a9711a','Requisito de diseño',fmt(tm.pct)+'%','rechaza residencias porque "tratan mal"'],
    ['Norma familiar','#23806f','Respaldada',fmt(K.familia.pct)+'%','dice que la familia debe cuidar']];
  /* 7 oct 2026: la tarjeta «Falta de información» (hipótesis descartada, sigue en «¿Por qué no buscó?») se cambia por la oferta declarada (P6.47) */
  var difOf=OD.mujeres.pct-OD.hombres.pct,sigOf=OD.mujeres.li90>OD.hombres.ls90;
  var ofTile='<div class="card tile" title="Mujeres: IC 90% '+fmt(OD.mujeres.li90)+'–'+fmt(OD.mujeres.ls90)+' · Hombres: IC 90% '+fmt(OD.hombres.li90)+'–'+fmt(OD.hombres.ls90)+'"><div class="light"><i style="background:#5d4d8f"></i><b style="font:650 14px var(--sans)">¿Trabajaría como cuidador(a) si le pagaran?</b></div>'+
    '<div style="display:flex;align-items:baseline;gap:8px;margin-top:10px"><span class="big num" style="font-size:28px">'+fmt(OD.mujeres.pct)+'%</span><span class="lbl" style="font-weight:650;color:var(--ink)">de las mujeres</span></div>'+
    '<div style="display:flex;align-items:baseline;gap:8px;margin-top:2px"><span class="num" style="font:700 17px var(--mono);color:var(--ink-soft)">'+fmt(OD.hombres.pct)+'%</span><span class="lbl">de los hombres</span></div>'+
    '<div class="lbl" style="margin-top:6px">15 a 60 años · '+(sigOf?'+'+fmt(difOf)+' pp para ellas (significativa)':'diferencia no significativa')+'</div>'+
    '<div class="chips"><span class="chip" style="background:#5d4d8f1f;color:#5d4d8f">Intención, no oferta real</span></div></div>';
  $('#lights').innerHTML=ofTile+LT.map(function(l){return '<div class="card tile"><div class="light"><i style="background:'+l[1]+'"></i><b style="font:650 14px var(--sans)">'+l[0]+'</b></div><div class="big num" style="font-size:28px;margin-top:10px">'+l[3]+'</div><div class="lbl">'+l[4]+'</div><div class="chips"><span class="chip" style="background:'+l[1]+'1f;color:'+l[1]+'">'+l[2]+'</span></div></div>'}).join('');
  function renderRaz(u){
    if(u)razU=u;
    if(F.dim!=='Total'){var L=RAZK.map(function(k){var r=SG(k);return Object.assign({},r,{etiqueta:r.indicador})});
      $('#razFind').innerHTML='<b>'+esc(segName())+':</b> '+fmt(L[0].pct)+'% "no tuvo necesidad" y '+fmt(L[1].pct)+'% "el propio hogar cuida" (total: '+fmt(nn.pct)+'% y '+fmt(hc.pct)+'%).';
      $('#ch-raz').innerHTML=barrasH(L,{nota:'Respuesta múltiple: no suma 100%. Rayado = precisión baja, no cuenta como evidencia.'});
      $('#src-raz').innerHTML=dl({Pregunta:'P6.45, respuesta múltiple',Muestra:L[0].n_muestra_dominio.toLocaleString('es-MX')+' personas del segmento que no buscaron',Archivo:esc(D.seg_fuente)});
      $$('#segRaz button').forEach(function(b){b.disabled=true;b.style.opacity=.45});return}
    $$('#segRaz button').forEach(function(b){b.disabled=false;b.style.opacity=1});
    $('#razFind').innerHTML=razFind0;
    u=razU;
    $('#ch-raz').innerHTML=barrasH(R[u],{max:60,nota:'Respuesta múltiple: no suma 100%. Rayado = precisión baja, no cuenta como evidencia.'});
    $('#src-raz').innerHTML=dl({Pregunta:'P6.45, respuesta múltiple (no suma 100)',Muestra:R[u][0].n.toLocaleString('es-MX')+' personas que no buscaron',Archivo:esc(R.fuente)});
  }
  var nn=R.obj.filter(function(e){return e.etiqueta==='No tuvo necesidad'})[0],hc=R.obj.filter(function(e){return e.etiqueta==='El propio hogar cuida'})[0];
  $('#razFind').innerHTML='<b>'+fmt(nn.pct)+'%</b> "no tuvo necesidad" y <b>'+fmt(hc.pct)+'%</b> "el propio hogar cuida". Precio, información y desconfianza quedan por debajo de 5%.';
  var razU='obj',razFind0=$('#razFind').innerHTML; seg('#segRaz','u',renderRaz);
  $('#qFind').innerHTML='En el quintil más alto, <b>'+fmt(q5d.pct)+'%</b> paga trabajo doméstico pero solo <b>'+fmt(q5c.pct)+'%</b> paga cuidado: el ingreso no destraba la contratación de cuidado.';
  (function(){
    var mxq=Math.ceil(Math.max.apply(null,D.quintil.map(function(r){return r.pct}))/5)*5,tq=[];for(var q0=0;q0<=mxq;q0+=5)tq.push(q0);
    function sq(t,col,nombre){return {nombre:nombre,col:col,pts:[1,2,3,4,5].map(function(q){var r=Q(q,t);return {y:r.pct,weak:isWeak(r.precision),tip:'precisión '+r.precision+' · '+r.n_si+' casos'}})}}
    $('#ch-quintil').innerHTML=lineas({W:560,H:270,pr:150,pb:56,max:mxq,ticks:tq,unit:'%',aria:'Contratación por quintil',cats:['Q1','Q2','Q3','Q4','Q5'],
      series:[sq('cuidadora','#5d4d8f','Cuidadora o enfermería'),sq('doméstico','#a9711a','Trabajo doméstico')]});
  })();
  var pref=D.preferencia[0];
  $('#prefFind').innerHTML='<b>'+fmt(pref.pct)+'%</b> lo querría en su casa; '+fmt(D.preferencia[1].pct)+'% no contrataría a nadie.';
  var prefFind0=$('#prefFind').innerHTML;
  /* 7 oct 2026: dona → barras agrupadas. Sin filtro o con Sexo: mujeres frente a hombres; con otro filtro: segmento frente al total. Fuente: script 12. */
  var PK=['pref_casa','pref_no','pref_publica'],PL=['En su casa','No contrataría a nadie','Institución pública'];
  var notaP='Casa de un familiar ('+fmt(D.preferencia[3].pct)+'%) e institución privada ('+fmt(D.preferencia[4].pct)+'%) | no se desglosan: precisión baja.';
  function renderPref(){
    var series,lead;
    if(F.dim==='Total'||F.dim==='Sexo'){
      series=[{nombre:'Mujeres cuidadoras',col:'#c0435a',vals:PK.map(function(k){return SG(k,'Sexo','Mujer')})},{nombre:'Hombres cuidadores',col:'#3f4760',vals:PK.map(function(k){return SG(k,'Sexo','Hombre')})}];
      var m=SG('pref_casa','Sexo','Mujer'),h=SG('pref_casa','Sexo','Hombre');
      lead='<b>'+fmt(pref.pct)+'%</b> lo querría en su casa: '+fmt(m.pct)+'% de las mujeres y '+fmt(h.pct)+'% de los hombres que cuidan'+(m.dif_significativa===true||m.dif_significativa==='True'?'.':', una diferencia que no es significativa.');
    } else {
      series=[{nombre:segName(),col:'#5d4d8f',vals:PK.map(function(k){return SG(k)})},{nombre:'Total nacional',col:'#b8b3c9',vals:PK.map(function(k){return SG(k,'Total','Total')})}];
      lead='<b>'+esc(segName())+':</b> '+fmt(SG('pref_casa').pct)+'% lo querría en su casa; '+fmt(SG('pref_no').pct)+'% no contrataría a nadie.';
    }
    $('#prefFind').innerHTML=lead;
    $('#ch-pref').innerHTML=(F.dim==='Total'||F.dim==='Sexo')?figurasSexo(PL,series[0].vals,series[1].vals,{W:500,nota:notaP,aria:'Dónde contrataría cuidado, mujeres y hombres que cuidan'}):columnasGrupo(PL,series,{max:80,W:500,bw:52,nota:notaP,aria:'Dónde contrataría cuidado'});
  }
  $('#src-pref').innerHTML=dl({Pregunta:'P6.46',Universo:'Cuidan a persona con discapacidad o 60+, nacional (n = '+pref.n.toLocaleString('es-MX')+')',Archivo:esc(OD.fuente)});
  $('#p711Find').innerHTML='Pesa más la responsabilidad familiar (<b>'+fmt(D.p711[0].pct)+'%</b>) que el maltrato ('+fmt(tm.pct)+'%) o el precio.';
  (function(){var L=D.p711.map(function(e){return Object.assign({},e,{etiqueta:e.etiqueta.replace('La responsabilidad es de hijas, hijos o familia','Es responsabilidad de la familia').replace('Prefiere estar sola(o)/no le gustan','Prefiere estar sola(o)')})}),sm=L.reduce(function(a,e){return a+e.pct},0);
    $('#ch-p711').innerHTML=columnasGrupo(L.map(function(e){return e.etiqueta}),[{nombre:'Razón principal',col:'#5d4d8f',vals:L}],{max:60,W:500,corte:13,nota:'Razón principal. Otras razones o sin especificar: '+fmt(100-sm)+'%.',aria:'Razón principal para rechazar una residencia'})})();
  OBS.renderPref=renderPref;OBS.renderRaz=renderRaz;
})();
