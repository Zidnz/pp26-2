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
    var W=620,rowH=32,lab=190,x0=lab,x1=W-14,H=ORD.length*rowH+30;
    function X(v){return x0+(x1-x0)*v/100}
    var s=svg(W,H,'Cobertura por grupo');
    [0,25,50,75,100].forEach(function(t){s+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="0" y2="'+(H-24)+'" stroke="rgba(63,71,96,.1)"/><text x="'+X(t)+'" y="'+(H-8)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+t+'%</text>'});
    ORD.forEach(function(o,i){var a=gr(o[0],o[1],'Regla >= 40 h'),b=gr(o[0],o[1],mod),y=i*rowH+rowH/2;
      s+='<text x="0" y="'+(y+4)+'" font-size="12.5" fill="#2b3045">'+o[2]+'</text><text x="'+(lab-10)+'" y="'+(y+4)+'" text-anchor="end" '+MONO+' font-size="9.5" fill="'+(a.n_con_dano<200?'#c0435a':FAINT)+'">n='+a.n_con_dano+'</text>';
      s+='<line x1="'+X(a.cob_li90)+'" x2="'+X(a.cob_ls90)+'" y1="'+(y-5)+'" y2="'+(y-5)+'" stroke="#2a78d6" stroke-opacity=".4" stroke-width="2"/><line x1="'+X(b.cob_li90)+'" x2="'+X(b.cob_ls90)+'" y1="'+(y+5)+'" y2="'+(y+5)+'" stroke="#eb6834" stroke-opacity=".4" stroke-width="2"/>';
      s+='<line x1="'+X(a.cobertura)+'" x2="'+X(b.cobertura)+'" y1="'+y+'" y2="'+y+'" stroke="#c3c2b7" stroke-width="2"/>';
      s+='<circle cx="'+X(a.cobertura)+'" cy="'+y+'" r="6" fill="#2a78d6" stroke="#fff" stroke-width="1.5"><title>Regla: '+fmt(a.cobertura)+'%</title></circle>';
      s+='<rect x="'+(X(b.cobertura)-5)+'" y="'+(y-5)+'" width="10" height="10" transform="rotate(45 '+X(b.cobertura)+' '+y+')" fill="#eb6834" stroke="#fff" stroke-width="1.5"><title>'+mod+': '+fmt(b.cobertura)+'%</title></rect>'});
    $('#ch-grupos').innerHTML=s+'</svg>';
  }
  seg('#segMod','m',renderGrupos); renderGrupos('Regresión logística');
  $('#src-mod').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional',Objetivo:'Declara algún daño por cuidar',Método:'Validación cruzada agrupada por UPM (5 × 20), métricas ponderadas con FAC_CUI, misma tasa de selección',Archivo:esc(M.fuente)});
  var LBL={HORAS:'Horas de cuidado',CUIDA_MENORES:'Cuida además a menores',FALTA_FUERZA:'Le falta fuerza física',REQUIERE_APOYO:'Requiere apoyo de otra persona',N_CLINICAS:'Tareas clínicas',MUJER:'Mujer',QUINTIL:'Quintil de ingreso',N_ABVD:'Actividades básicas',CAPACITACION:'Recibió capacitación',EDAD_N:'Edad',ESCOLARIDAD:'Escolaridad',ANIOS_CUIDANDO:'Años cuidando',QUINTIL_NA:'Ingreso sin dato',CUIDA_DISC:'Cuida discapacidad',APOYO_FAMILIA:'Apoyo económico familiar'};
  (function(){
    var W=440,rowH=22,lab=180,mid=lab+(W-lab)/2,half=(W-lab)/2-58,H=M.coef.length*rowH+6,mx=Math.max.apply(null,M.coef.map(function(c){return Math.abs(c.coef)}));
    var s=svg(W,H,'Coeficientes')+'<line x1="'+mid+'" x2="'+mid+'" y1="0" y2="'+H+'" stroke="rgba(63,71,96,.3)"/>';
    M.coef.forEach(function(c,i){var y=i*rowH+4,w=half*Math.abs(c.coef)/mx,pos=c.coef>=0;
      s+='<text x="0" y="'+(y+13)+'" font-size="12" fill="#2b3045">'+(LBL[c.variable]||c.variable)+'</text><line x1="'+mid+'" x2="'+(pos?mid+w:mid-w)+'" y1="'+(y+9.5)+'" y2="'+(y+9.5)+'" stroke="#d6d0e6" stroke-width="2.5"/><circle cx="'+(pos?mid+w:mid-w)+'" cy="'+(y+9.5)+'" r="6" fill="'+(pos?'#c0435a':'#23806f')+'" stroke="#fff" stroke-width="1.5"/><text x="'+(pos?mid+w+12:mid-w-12)+'" y="'+(y+13)+'" text-anchor="'+(pos?'start':'end')+'" '+MONO+' font-size="10.5" fill="#2b3045">'+(pos?'+':'')+fmt(c.coef,2)+'</text>'});
    $('#ch-coef').innerHTML=s+'</svg>';
  })();
  $('#tglob tbody').innerHTML=M.global.map(function(r){var base=/Regla|Horas/.test(r.puntaje);return '<tr><td><b>'+esc(r.puntaje.replace('>=','≥'))+'</b></td><td class="n">'+fmt(r.auc_ponderado,2)+'</td><td class="n">'+fmt(r.tasa_seleccion)+'%</td><td class="n">'+fmt(r.precision)+'%</td><td class="n">'+fmt(r.cobertura)+'% ('+fmt(r.cobertura_li90)+'–'+fmt(r.cobertura_ls90)+')</td><td class="n">'+(base?'—':'+'+fmt(r.dif_cobertura_vs_regla)+' pp ('+fmt(r.dif_li90)+' a '+fmt(r.dif_ls90)+')')+'</td></tr>'}).join('');
  var hom=gr('SEXO','Hombre','Regla >= 40 h'),q3=gr('ING','Q3','Regla >= 40 h');
  $('#limMod').innerHTML=['<b>Bloque "60+ sin discapacidad":</b> la ENASIC no pregunta ahí por actividades básicas ni tareas clínicas, y el modelo subselecciona a ese grupo por un límite del cuestionario.','<b>Otra población:</b> se entrenó con datos nacionales; hay que recalibrarlo o compararlo contra la regla con datos del piloto.','<b>Daño autodeclarado:</b> predice la declaración, no el daño medido.','<b>Muestras chicas:</b> hombres con daño, '+hom.n_con_dano+' casos; ingreso Q3, '+q3.n_con_dano+'.','<b>No es causal:</b> no dice que el relevo reduzca el daño.','<b>Datos personales:</b> la regla de horas es la opción con menos tratamiento de datos.'].map(function(t){return '<li>'+t+'</li>'}).join('');
})();
