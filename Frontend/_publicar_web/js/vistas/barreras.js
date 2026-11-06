/* Observatorio del Cuidado · js/vistas/barreras.js
   Pestaña «¿Por qué no se contrata?»: semáforo de hipótesis, razones para no buscar, quintil, preferencia, oferta.
   Importa de OBS: $, $$, F, K, OD, Q, R, RAZK, SG, barrasGrupo, barrasH, columnas, car, des, dl, dona, esc, fmt, isWeak, lineas, lolli, seg, segName, tm, waffle
   Exporta a OBS:  renderPref, renderRaz (y registra su redibujo en OBS.alSeg)
   14 oct 2026: el filtro de segmento aplica a toda la pestaña: semáforo, razones, preferencia y P7.11 se re-estiman por segmento
   (script 12 y sección 12b). Contratación por quintil y oferta declarada son de otros universos y no cambian. */
(function(){
  var $=OBS.$,$$=OBS.$$,F=OBS.F,K=OBS.K,OD=OBS.OD,Q=OBS.Q,R=OBS.R,RAZK=OBS.RAZK
      ,SG=OBS.SG,anillos=OBS.anillos,car=OBS.car,des=OBS.des,dl=OBS.dl,dona=OBS.dona
      ,esc=OBS.esc,fmt=OBS.fmt,isWeak=OBS.isWeak,lineas=OBS.lineas,lolli=OBS.lolli
      ,seg=OBS.seg,segName=OBS.segName,tm=OBS.tm,waffle=OBS.waffle,barrasH=OBS.barrasH,barrasGrupo=OBS.barrasGrupo,columnasGrupo=OBS.columnasGrupo,figurasSexo=OBS.figurasSexo,columnas=OBS.columnas;
  var q5c=Q(5,'cuidadora'),q5d=Q(5,'doméstico'),q1c=Q(1,'cuidadora');
  var S2=OBS.S2,S2L=OBS.S2L,prec=OBS.prec;
  /* semáforo: con filtro, cada cifra es la del segmento (P6.45 y P7.7 del script 12; P7.11 de la sección 12b).
     La lectura (color y veredicto) es la del total nacional: no se reclasifica una hipótesis con la muestra de un segmento. */
  function LTf(){var tot=F.dim==='Total',c=tot?car:SG('raz_caros'),t=tot?tm:S2('p711','Tratan mal a las personas'),f=tot?K.familia:SG('norma_familia');
    return [['Precio','#5d4d8f','Rara vez se da como razón',c,'de quienes no buscaron dice que «son caros» (P6.45)'],
      ['Desconfianza','#5d4d8f','Razón frecuente para rechazar residencias',t,'de quienes rechazan residencias dice que «tratan mal» (P7.11)'],
      ['Norma familiar','#5d4d8f','Acuerdo alto; no se probó que frene',f,'dice que la familia debe cuidar (P7.7)']]}
  /* 7 oct 2026: la tarjeta «Falta de información» (hipótesis descartada, sigue en «¿Por qué no buscó?») se cambia por la oferta declarada (P6.47) */
  var difOf=OD.mujeres.pct-OD.hombres.pct,sigOf=OD.mujeres.li90>OD.hombres.ls90;
  var ofTile=OBS.tile({luz:'#5d4d8f',est:true,k:'Mujeres de 15 a 60 años que trabajarían como cuidadoras si les pagaran',v:fmt(OD.mujeres.pct)+'%',v2:'hombres: '+fmt(OD.hombres.pct)+'%',
    det:'<div class="lbl">Población de 15 a 60 años, no solo cuidadoras · '+(sigOf?'+'+fmt(difOf)+' pp para ellas (significativa)':'diferencia no significativa')+'</div>'+
      '<div class="lbl">Mujeres: IC 90% '+fmt(OD.mujeres.li90)+'–'+fmt(OD.mujeres.ls90)+' · Hombres: IC 90% '+fmt(OD.hombres.li90)+'–'+fmt(OD.hombres.ls90)+'</div>'+
      '<div class="chips"><span class="chip" style="background:#5d4d8f1f;color:#5d4d8f">Intención, no oferta real</span></div>',fuente:'ENASIC 2022 · P6.47'});
  function lights(){var tot=F.dim==='Total';
    $('#lights').innerHTML=ofTile.replace('Intención, no oferta real</span>','Intención, no oferta real</span>'+(tot?'':'<span class="chip p-noest" title="Universo: población de 15 a 60 años (TPER_ELE), no personas cuidadoras">no cambia con el filtro</span>'))+LTf().map(function(l){var e=l[3],weak=!tot&&isWeak(e.precision);
      return OBS.tile({luz:l[1],est:e.li90!=null,weak:weak,k:l[0]+': % '+(l[4].indexOf('de quienes')===0?l[4]:'que '+l[4]),v:fmt(e.pct)+'%',
        det:(tot?'':'<div class="lbl">Segmento: <b>'+esc(segName())+'</b>. La lectura (color y veredicto) es la del total nacional.</div>')+
          '<div class="chips"><span class="chip" style="background:'+l[1]+'1f;color:'+l[1]+'">'+l[2]+'</span>'+(tot?'':prec(e.precision))+(e.li90!=null?'<span class="chip">IC 90% '+fmt(e.li90)+'–'+fmt(e.ls90)+'%</span>':'')+'</div>',fuente:'ENASIC 2022'+(tot?' · nacional':'')})}).join('');}
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
    function sq(t,col,nombre){return {nombre:nombre,col:col,vals:[1,2,3,4,5].map(function(q){var r=Q(q,t),se=r.pct*r.cv/100,li=Math.max(0,r.pct-1.645*se),ls=r.pct+1.645*se;return {pct:r.pct,li90:li,ls90:ls,precision:r.precision}})}}
    var ser=[sq('cuidadora','#5d4d8f','Cuidadora o enfermería'),sq('doméstico','#a9711a','Trabajo doméstico')];
    var mxq=Math.ceil(Math.max.apply(null,ser[0].vals.concat(ser[1].vals).map(function(e){return e.ls90}))/8)*8;
    $('#ch-quintil').innerHTML=OBS.columnasGrupo(['Q1','Q2','Q3','Q4','Q5'],ser,{W:560,H:300,max:mxq,bw:48,aria:'Porcentaje de hogares que contratan, por quintil de ingreso'});
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
  function corto(e){return Object.assign({},e,{etiqueta:(e.etiqueta||e.categoria).replace('La responsabilidad es de hijas, hijos o familia','Es responsabilidad de la familia').replace('Prefiere estar sola(o)/no le gustan','Prefiere estar sola(o)')})}
  var p711Find0=$('#p711Find').innerHTML;
  function p711(){var L=D.p711.map(corto),sm=L.reduce(function(a,e){return a+e.pct},0);
    if(F.dim==='Total'){$('#p711Find').innerHTML=p711Find0;
      $('#ch-p711').innerHTML=columnasGrupo(L.map(function(e){return e.etiqueta}),[{nombre:'Razón principal',col:'#5d4d8f',vals:L}],{max:60,W:500,corte:13,nota:'Razón principal. Otras razones o sin especificar: '+fmt(100-sm)+'%.',aria:'Razón principal para rechazar una residencia'});return}
    var Sg=S2L('p711').map(corto),f0=Sg[0];
    $('#p711Find').innerHTML='<b>'+esc(segName())+':</b> '+fmt(f0.pct)+'% dice que es responsabilidad de la familia (total: '+fmt(L[0].pct)+'%).';
    $('#ch-p711').innerHTML=columnasGrupo(L.map(function(e){return e.etiqueta}),[{nombre:segName(),col:'#5d4d8f',vals:Sg},{nombre:'Total nacional',col:'#b8b3c9',vals:L}],{max:70,W:500,corte:13,nota:'Razón principal, entre quienes no aceptarían ir a una residencia (n = '+f0.n_muestra_dominio+' en el segmento). Rayado = precisión baja.',aria:'Razón principal para rechazar una residencia, segmento contra total'})}
  OBS.renderPref=renderPref;OBS.renderRaz=renderRaz;
  OBS.alSeg.push(function(){lights();renderRaz();renderPref();p711()});
})();
