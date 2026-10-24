/* Observatorio del Cuidado · js/vistas/focalizacion.js
   Pestaña «¿A quién primero?»: regla contra modelos, cobertura por grupo y coeficientes.
   Importa de OBS: $, FAINT, GL, M, MONO, SN, dl, esc, fmt, gr, seg, svg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,FAINT=OBS.FAINT,GL=OBS.GL,M=OBS.M,MONO=OBS.MONO,SN=OBS.SN,dl=OBS.dl
      ,esc=OBS.esc,fmt=OBS.fmt,gr=OBS.gr,seg=OBS.seg,svg=OBS.svg;
  var regla=GL['Regla >= 40 h'],LG=GL['Regresión logística'];
  var MT=[[fmt(regla.cobertura)+'%','de las personas con daño las encuentra la regla "40 h o más"',''],[fmt(LG.cobertura)+'%','las encuentra la regresión logística, con el mismo número de seleccionados',''],['+'+fmt(LG.dif_cobertura_vs_regla)+' pp','diferencia; IC 90% de '+fmt(LG.dif_li90)+' a '+fmt(LG.dif_ls90)+': no demostrable','var(--amber)'],['+'+fmt(SN['Regresión logística'].dif_cobertura_vs_regla)+' pp','sí gana el modelo si el objetivo es salud física deteriorada','var(--teal)']];
  $('#modTiles').innerHTML=MT.map(function(t){return '<div class="card tile"><div class="big num" style="font-size:30px;'+(t[2]?'color:'+t[2]:'')+'">'+t[0]+'</div><div class="lbl">'+t[1]+'</div></div>'}).join('');
  var ORD=[['SEXO','Mujer','Mujeres'],['SEXO','Hombre','Hombres'],['EDAD','15-39','15 a 39 años'],['EDAD','40-59','40 a 59 años'],['EDAD','60+','60 y más'],['TIPO','Cuida discapacidad','Cuida discapacidad'],['TIPO','Solo 60+ sin discapacidad','Solo 60+ sin discap.'],['ING','Q1-Q2','Ingreso Q1–Q2'],['ING','Q3','Ingreso Q3'],['ING','Q4-Q5','Ingreso Q4–Q5'],['ING','Sin dato','Ingreso sin dato']];
  var g60r=gr('TIPO','Solo 60+ sin discapacidad','Regla >= 40 h'),g60m=gr('TIPO','Solo 60+ sin discapacidad','Regresión logística');
  $('#grpFind').innerHTML='Con quien cuida solo a una persona mayor sin discapacidad, la cobertura cae de <b>'+fmt(g60r.cobertura)+'%</b> con la regla a <b>'+fmt(g60m.cobertura)+'%</b> con el modelo. Elegir es una decisión de política.';
  function renderGrupos(mod){
    var h='<div class="scroll-x"><table><thead><tr><th>Grupo</th><th class="n">Casos con daño</th><th class="n">Regla 40 h</th><th class="n">'+esc(mod)+'</th><th class="n">Diferencia</th></tr></thead><tbody>';
    ORD.forEach(function(o){var a=gr(o[0],o[1],'Regla >= 40 h'),b=gr(o[0],o[1],mod),d=b.cobertura-a.cobertura,big=Math.abs(d)>=10;
      h+='<tr><td><b>'+o[2]+'</b></td><td class="n"'+(a.n_con_dano<200?' style="color:#c0435a"':'')+'>'+a.n_con_dano+'</td><td class="n">'+fmt(a.cobertura)+'% <span class="muted">('+fmt(a.cob_li90,0)+'–'+fmt(a.cob_ls90,0)+')</span></td><td class="n">'+fmt(b.cobertura)+'% <span class="muted">('+fmt(b.cob_li90,0)+'–'+fmt(b.cob_ls90,0)+')</span></td><td class="n"'+(big?' style="font-weight:700;color:'+(d<0?'#c0435a':'#23806f')+'"':'')+'>'+(d>0?'+':'')+fmt(d)+' pp</td></tr>'});
    $('#ch-grupos').innerHTML=h+'</tbody></table></div>';
  }
  seg('#segMod','m',renderGrupos); renderGrupos('Regresión logística');
  $('#src-mod').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional',Objetivo:'Declara algún daño por cuidar',Método:'Validación cruzada agrupada por UPM (5 × 20), métricas ponderadas con FAC_CUI, misma tasa de selección',Archivo:esc(M.fuente)});
  var LBL={HORAS:'Horas de cuidado',CUIDA_MENORES:'Cuida además a menores',FALTA_FUERZA:'Le falta fuerza física',REQUIERE_APOYO:'Requiere apoyo de otra persona',N_CLINICAS:'Tareas clínicas',MUJER:'Mujer',QUINTIL:'Quintil de ingreso',N_ABVD:'Actividades básicas',CAPACITACION:'Recibió capacitación',EDAD_N:'Edad',ESCOLARIDAD:'Escolaridad',ANIOS_CUIDANDO:'Años cuidando',QUINTIL_NA:'Ingreso sin dato',CUIDA_DISC:'Cuida discapacidad',APOYO_FAMILIA:'Apoyo económico familiar'};
  (function(){
    var cs=M.coef.slice().sort(function(a,b){return b.coef-a.coef}),W=440,rowH=26,lab=190,x1=W-46,top=2,H=top+cs.length*rowH+22;
    var lo=Math.min(0,Math.min.apply(null,cs.map(function(c){return c.coef}))),hi=Math.max.apply(null,cs.map(function(c){return c.coef}));
    lo=Math.floor(lo*5)/5;hi=Math.ceil(hi*5)/5;
    function X(v){return lab+(x1-lab)*(v-lo)/(hi-lo)}
    var s=svg(W,H,'Coeficientes estandarizados de la regresión logística');
    for(var t=lo;t<=hi+1e-9;t+=.2){s+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+top+'" y2="'+(top+cs.length*rowH)+'" stroke="rgba(63,71,96,'+(Math.abs(t)<1e-9?'.35':'.08')+')"/><text x="'+X(t)+'" y="'+(H-6)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+fmt(t,1)+'</text>'}
    cs.forEach(function(c,i){var cy=top+i*rowH+rowH/2,pos=c.coef>=0,xa=Math.min(X(0),X(c.coef)),w=Math.abs(X(c.coef)-X(0));
      s+='<g><title>'+(LBL[c.variable]||c.variable)+': '+fmt(c.coef,2)+'</title><text x="0" y="'+(cy+4)+'" font-size="12" fill="#2b3045">'+(LBL[c.variable]||c.variable)+'</text><rect x="'+xa+'" y="'+(cy-7)+'" width="'+Math.max(w,1)+'" height="14" rx="2" fill="'+(pos?'#c0435a':'#23806f')+'"/>';
      s+='<text x="'+(pos?X(c.coef)+6:X(c.coef)-6)+'" y="'+(cy+4)+'" text-anchor="'+(pos?'start':'end')+'" '+MONO+' font-size="11" font-weight="700" fill="#2b3045">'+(pos?'+':'')+fmt(c.coef,2)+'</text></g>'});
    $('#ch-coef').innerHTML=s+'</svg>';
  })();
  $('#tglob tbody').innerHTML=M.global.map(function(r){var base=/Regla|Horas/.test(r.puntaje);return '<tr><td><b>'+esc(r.puntaje.replace('>=','≥'))+'</b></td><td class="n">'+fmt(r.auc_ponderado,2)+'</td><td class="n">'+fmt(r.tasa_seleccion)+'%</td><td class="n">'+fmt(r.precision)+'%</td><td class="n">'+fmt(r.cobertura)+'% ('+fmt(r.cobertura_li90)+'–'+fmt(r.cobertura_ls90)+')</td><td class="n">'+(base?'—':'+'+fmt(r.dif_cobertura_vs_regla)+' pp ('+fmt(r.dif_li90)+' a '+fmt(r.dif_ls90)+')')+'</td></tr>'}).join('');
  var hom=gr('SEXO','Hombre','Regla >= 40 h'),q3=gr('ING','Q3','Regla >= 40 h');
  $('#limMod').innerHTML=['<b>Bloque "60+ sin discapacidad":</b> la ENASIC no pregunta ahí por actividades básicas ni tareas clínicas, y el modelo subselecciona a ese grupo por un límite del cuestionario.','<b>Otra población:</b> se entrenó con datos nacionales; hay que recalibrarlo o compararlo contra la regla con datos del piloto.','<b>Daño autodeclarado:</b> predice la declaración, no el daño medido.','<b>Muestras chicas:</b> hombres con daño, '+hom.n_con_dano+' casos; ingreso Q3, '+q3.n_con_dano+'.','<b>No es causal:</b> no dice que el relevo reduzca el daño.','<b>Datos personales:</b> la regla de horas es la opción con menos tratamiento de datos.'].map(function(t){return '<li>'+t+'</li>'}).join('');
})();
