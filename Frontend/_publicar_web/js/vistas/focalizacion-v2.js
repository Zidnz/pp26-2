/* Observatorio del Cuidado · js/vistas/focalizacion-v2.js
   Pestaña «¿A quién primero?». Dos cosas en este archivo:
   (1) OBS.fz: piezas compartidas con focalizacion-prioridad.js (tooltip, filtro por tipo de zona, cuadrícula y ejes en HTML/CSS).
   (2) La evidencia de la decisión 2: por qué la regla de 40 h y no un modelo. Todas las gráficas usan el objetivo preregistrado
       DANO_SALUD3 (DEC-OBJ-002, 1 nov 2026) y salen de D.modelo_v2 (Analysis/resultados/27_v2_*.csv) y de D.diagnostico_v2
       (26_diag_objetivo.csv, 26_diag_candidatos_objetivo.csv). Sin doble revisión.
   Rediseño del 2 nov 2026 (noche): gráficas en HTML/CSS, una línea de lectura por tarjeta y los textos largos en «Leer más».
   Ninguna cifra está escrita a mano: todo sale de D. Copia previa: _respaldo_pre_rediseno_2026-11-02/.
   3 nov 2026: principio «el Observatorio es para quien lo usa» (bitácora). Textos en lenguaje llano y bloque de evidencia plegado
   («Para revisar el método»). Copia previa: _respaldo_pre_lector_2026-11-03/.
   Importa de OBS: $, dl, esc, fmt, seg, tile
   Exporta a OBS:  fz */
(function(){
  var $=OBS.$,dl=OBS.dl,esc=OBS.esc,fmt=OBS.fmt,seg=OBS.seg;

  /* ================= Piezas compartidas ================= */
  if(!OBS.fz){
    var TCZ={1:'#c0435a',2:'#5d4d8f',3:'#7dd1c1',4:'#a9711a'};   /* mismos colores que el mapa de «¿Dónde?» */
    var tip=document.createElement('div');tip.id='fzTip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
    var raiz=document.getElementById('v-focalizacion');
    var mover=function(e){var w=tip.offsetWidth,h=tip.offsetHeight,x=Math.min(e.clientX+14,window.innerWidth-w-8),y=e.clientY+18+h>window.innerHeight?e.clientY-h-12:e.clientY+18;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px'};
    if(raiz){
      raiz.addEventListener('mouseover',function(e){var el=e.target.closest&&e.target.closest('[data-tip]');if(!el){tip.classList.remove('on');return}tip.textContent=el.getAttribute('data-tip');tip.classList.add('on');mover(e)});
      raiz.addEventListener('mousemove',function(e){if(tip.classList.contains('on'))mover(e)});
      raiz.addEventListener('mouseleave',function(){tip.classList.remove('on')});
      raiz.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('[data-tip]');if(!el){tip.classList.remove('on');return}tip.textContent=el.getAttribute('data-tip');tip.classList.add('on');mover(e)});
    }
    /* Posición (%) de un valor dentro de [lo, hi] */
    var pos=function(v,lo,hi){return 100*(v-lo)/(hi-lo)};
    OBS.fz={
      TC:TCZ,
      ta:function(t){return ' data-tip="'+esc(t)+'"'},
      pos:pos,
      /* Líneas verticales de cuadrícula (dentro de un .tr) y etiquetas de eje (dentro de un .tx) */
      grid:function(lo,hi,step){var h='';for(var k=Math.ceil(lo/step-1e-9)*step;k<=hi+1e-9;k+=step)h+='<i class="gl'+(Math.abs(k)<1e-9?' zero':'')+'" style="left:'+pos(k,lo,hi).toFixed(2)+'%"></i>';return h},
      ticks:function(lo,hi,step,f){var h='';for(var k=Math.ceil(lo/step-1e-9)*step;k<=hi+1e-9;k+=step)h+='<span style="left:'+pos(k,lo,hi).toFixed(2)+'%">'+f(k)+'</span>';return h},
      pills:function(a){return a.map(function(p){return '<span class="fz-pill'+(p[1]?' '+p[1]:'')+'">'+p[0]+'</span>'}).join('')},
      /* Botones de tipo de zona: <b>número</b> + nombre */
      chips:function(tipos){return tipos.map(function(t){return '<button type="button" class="fz-chip" data-z="'+t.tipo+'" aria-pressed="false" aria-label="Tipo '+t.tipo+': '+esc(t.nombre)+'" style="--c:'+TCZ[t.tipo]+'"><b>'+t.tipo+'</b>'+esc(t.nombre)+'</button>'}).join('')},
      /* Pasar el cursor sobre un botón resalta ese tipo en toda la tarjeta; el clic lo deja fijo (otro clic lo suelta). */
      zsel:function(box,chips){
        var fijo='0';function poner(v){box.setAttribute('data-sel',v)}
        chips.addEventListener('click',function(e){var b=e.target.closest('button[data-z]');if(!b)return;fijo=fijo===b.dataset.z?'0':b.dataset.z;
          [].forEach.call(chips.querySelectorAll('button'),function(x){x.setAttribute('aria-pressed',String(x.dataset.z===fijo))});poner(fijo)});
        chips.addEventListener('mouseover',function(e){var b=e.target.closest('button[data-z]');if(b)poner(b.dataset.z)});
        chips.addEventListener('mouseleave',function(){poner(fijo)});
        chips.addEventListener('focusin',function(e){var b=e.target.closest('button[data-z]');if(b)poner(b.dataset.z)});
        chips.addEventListener('focusout',function(){poner(fijo)});
        box.classList.add('fz-sel');poner('0');
      }
    };
  }
  var fz=OBS.fz,ta=fz.ta,grid=fz.grid,ticks=fz.ticks,pos=fz.pos;

  var V=D.modelo_v2,DG=D.diagnostico_v2; if(!V||!DG||!$('#v2Bloque')) return;
  var INK='#2b3045',AZ='#77689d',NA='#a9711a',GR='#9a93ad',RO='#c0435a',TE='#23806f';
  var PRIM='PRIMARIO: DANO_SALUD3, predictores primarios';
  var COL={'Regla >= 40 h':INK,'Logística':NA,'Tarjeta de puntos':AZ,'R2 a priori (>=40 h + >=2 ABVD)':GR,'Horas (continuo)':INK};
  function sg(v,d){return (v>0?'+':v<0?'−':'')+fmt(Math.abs(v),d==null?1:d)}
  function nom(p){return esc(p.replace('>=','≥').replace('Logística','Regresión logística'))}
  function mn(a){return Math.min.apply(null,a)} function mx(a){return Math.max.apply(null,a)}
  function lc(s){return s.charAt(0).toLowerCase()+s.slice(1)}
  var g=V.global.filter(function(r){return r.configuracion===PRIM});
  function pick(p){return g.filter(function(r){return r.puntaje===p})[0]}
  var R=pick('Regla >= 40 h'),L=pick('Logística'),T=pick('Tarjeta de puntos'),DMD=L.dif_minima_detectable_pp;
  var FU='ENASIC 2022 · nacional · objetivo: salud física, cansancio o sueño';
  var AZAR=parseFloat(R.cupo),hayAz=isFinite(AZAR);   /* elegir al azar a la misma fracción de personas encuentra esa fracción de quienes tienen el daño */

  /* ---------- Respuesta ---------- */
  var tiles=[
    ['Cobertura de la regla «40 h o más»',fmt(R.cobertura,1)+'%','de quienes tienen el daño',
      'La regla «40 h o más» encuentra al '+fmt(R.cobertura,1)+' % de las personas con el daño (IC 90 %: '+fmt(R.cob_li90,0)+' a '+fmt(R.cob_ls90,0)+').'+(hayAz?' Elegir al azar encontraría al '+fmt(AZAR,1)+' %.':''),true],
    ['Modelo estadístico (regresión logística) contra la regla',sg(L.dif_vs_comparador_pp)+' pp','más o menos que la regla',
      'Rango probable: de '+sg(L.dif_li90)+' a '+sg(L.dif_ls90)+' pp. '+(L.dif_li90<=0&&L.dif_ls90>=0?'Incluye el cero: no se nota diferencia.':'No incluye el cero: sí se nota diferencia.'),true],
    ['Tarjeta de puntos contra la regla',sg(T.dif_vs_comparador_pp)+' pp','más o menos que la regla',
      'Rango probable: de '+sg(T.dif_li90)+' a '+sg(T.dif_ls90)+' pp. La tarjeta se retiró del prototipo.',true],
    ['La diferencia más pequeña que se nota','≈ '+fmt(DMD,1)+' pp','con esta muestra',
      'Una diferencia menor que esa no se distingue de cero con esta muestra.',false]
  ];
  $('#v2Tiles').innerHTML=tiles.map(function(t){return OBS.tile({k:t[0],v:t[1],v2:t[2],fs:28,est:t[4],det:'<div class="lbl">'+t[3]+'</div>',fuente:FU})}).join('');
  var ninguno=[L,T].every(function(r){return r.dif_li90<=0&&r.dif_ls90>=0});
  $('#v2Find').innerHTML=ninguno
    ?'<b>Probamos dos formas más complejas de ordenar a las cuidadoras y ninguna encontró a más personas con daño que la regla de 40 horas.</b> Que no se note diferencia no prueba que sean iguales: con esta muestra solo se notan diferencias de unos '+fmt(DMD,0)+' puntos o más.'
    :'<b>Al menos un modelo se distingue de la regla de 40 horas.</b> Ver la comparación abajo.';
  var lead=$('#fzLead');
  if(lead) lead.innerHTML='Tres decisiones: dónde hacer el piloto, a quién ofrecer el relevo y en qué orden van las zonas. Hoy, el relevo se ofrecería primero a quien cuida <b>40 horas o más</b> a la semana: esa regla encuentra a <b>'+fmt(R.cobertura,0)+' de cada 100</b> personas que ya tienen daño a su salud y deja fuera a las otras <b>'+fmt(100-R.cobertura,0)+'</b>.';
  $('#v2Pills').innerHTML=fz.pills([
    ['Sin ventaja demostrable para los modelos','amb'],
    ['Tampoco está probado que la regla baste','rojo'],
    [g[0].n_muestra+' personas · '+g[0].n_con_objetivo+' con el daño'],
    ['Solo se notan diferencias de '+fmt(DMD,0)+' puntos o más'],
    ['Solo con datos nacionales, no por alcaldía']
  ]);

  /* ---------- 1. ¿Qué método elige mejor a quien sí tiene el daño? ---------- */
  (function(){
    var rows=['Regla >= 40 h','Logística','Tarjeta de puntos'].map(pick);
    var cl=Math.floor(mn(rows.map(function(r){return r.cob_li90}))/10)*10-10,ch=Math.ceil(mx(rows.map(function(r){return r.cob_ls90}))/10)*10+10;
    var lo=Math.floor(mn([-10,-DMD].concat(rows.map(function(r){return r.dif_li90})))/5)*5,hi=Math.ceil(mx([10,DMD].concat(rows.map(function(r){return r.dif_ls90})))/5)*5;
    var h='<div class="q1"><div class="q-r q-h"><span></span><span>Cobertura <small>%</small></span><span>Diferencia contra la regla <small>pp</small></span></div>';
    rows.forEach(function(r,i){var c=COL[r.puntaje],cmp=r.veredicto==='comparador',x=pos(r.cobertura,cl,ch);
      h+='<div class="q-r"><div class="q-l'+(cmp?' on':'')+'"><i style="background:'+c+'"></i>'+nom(r.puntaje)+'</div>'
        +'<div class="tr" data-c="Cobertura">'+grid(cl,ch,10)+(hayAz?'<i class="gl" style="left:'+pos(AZAR,cl,ch).toFixed(2)+'%;border-left:1.5px dashed '+RO+'"></i>':'')
        +'<i class="ci" style="left:'+pos(r.cob_li90,cl,ch).toFixed(2)+'%;width:'+(pos(r.cob_ls90,cl,ch)-pos(r.cob_li90,cl,ch)).toFixed(2)+'%;--c:'+c+'"></i>'
        +'<b class="dt" style="left:'+x.toFixed(2)+'%;--c:'+c+'"'+ta(nom(r.puntaje)+': cobertura '+fmt(r.cobertura)+' % (IC 90 % '+fmt(r.cob_li90)+' a '+fmt(r.cob_ls90)+')')+'></b>'
        +'<em class="vl" style="left:'+x.toFixed(2)+'%">'+fmt(r.cobertura,1)+'%</em></div>'
        +'<div class="tr" data-c="Diferencia contra la regla"><i class="band" style="left:'+pos(-DMD,lo,hi).toFixed(2)+'%;width:'+(pos(DMD,lo,hi)-pos(-DMD,lo,hi)).toFixed(2)+'%"'+ta('±'+fmt(DMD,1)+' pp: diferencia mínima detectable con esta muestra')+'></i>'+grid(lo,hi,5);
      if(cmp)h+='<span class="cmp">comparador</span>';
      else{var xd=pos(r.dif_vs_comparador_pp,lo,hi);
        h+='<i class="ci" style="left:'+pos(r.dif_li90,lo,hi).toFixed(2)+'%;width:'+(pos(r.dif_ls90,lo,hi)-pos(r.dif_li90,lo,hi)).toFixed(2)+'%;--c:'+c+'"></i>'
          +'<b class="dt" style="left:'+xd.toFixed(2)+'%;--c:'+c+'"'+ta(nom(r.puntaje)+': '+sg(r.dif_vs_comparador_pp)+' pp (IC 90 % '+sg(r.dif_li90)+' a '+sg(r.dif_ls90)+')')+'></b><em class="vl" style="left:'+xd.toFixed(2)+'%">'+sg(r.dif_vs_comparador_pp)+'</em>'}
      h+='</div></div>'});
    h+='<div class="q-r q-ax"><span></span><div class="tx">'+ticks(cl,ch,10,function(k){return k+'%'})+'</div><div class="tx">'+ticks(lo,hi,5,function(k){return (k>0?'+':'')+k})+'</div></div></div>';
    $('#ch-q1').innerHTML=h;
    var sep=[L,T].filter(function(r){return r.dif_li90>0||r.dif_ls90<0});
    $('#q1Find').innerHTML=sep.length===0
      ?'La regla encuentra a <b>'+fmt(R.cobertura,0)+' de cada 100</b> personas con el daño'+(hayAz?'; elegir al azar, a '+fmt(AZAR,0):'')+'. <b>Ningún modelo encuentra a más</b>: la diferencia con la regla es demasiado pequeña para notarse.'
      :'La regla encuentra a <b>'+fmt(R.cobertura,0)+' %</b>. Se separa de ella: <b>'+sep.map(function(r){return nom(r.puntaje)}).join(', ')+'</b>.';
  })();

  /* ---------- 2. ¿Cambia la respuesta si cambian el cupo o los supuestos? ---------- */
  (function(){
    var CFG=[['PRIMARIO','Primaria (cupo de la regla)'],['Sens. cupo|10 %','Cupo 10 %'],['Sens. cupo|20 %','Cupo 20 %'],['Sens. A','Añade autopercepción'],['Sens. objetivo','Objetivo «algún daño»'],['Sens. sin personas','Sin quienes cuidan en ambos bloques'],['Sens. B','Solo discapacidad, + ABVD y clínicas']];
    function key(r){return r.configuracion.indexOf('PRIM')===0?'PRIMARIO':r.configuracion==='Sens. cupo'?'Sens. cupo|'+r.cupo:CFG.map(function(c){return c[0]}).filter(function(k){return r.configuracion.indexOf(k)===0})[0]}
    var data=V.global.filter(function(r){return r.veredicto!=='comparador'});
    var lo=Math.floor(mn([-10].concat(data.map(function(r){return r.dif_li90})))/5)*5,hi=Math.ceil(mx([10].concat(data.map(function(r){return r.dif_ls90})))/5)*5;
    var tot=0,fuera=0,h='<div class="q2">';
    CFG.forEach(function(c,i){var rs=data.filter(function(r){return key(r)===c[0]});
      h+='<div class="q-r q2r"><div class="q-l'+(i===0?' on':'')+'">'+esc(c[1])+'</div><div class="tr" style="height:'+(14+rs.length*11)+'px">'+grid(lo,hi,5);
      rs.forEach(function(r,j){var yy=50+(j-(rs.length-1)/2)*(100/(rs.length+1)),cc=COL[r.puntaje];tot++;if(r.dif_li90>0||r.dif_ls90<0)fuera++;
        h+='<i class="ci" style="left:'+pos(r.dif_li90,lo,hi).toFixed(2)+'%;width:'+(pos(r.dif_ls90,lo,hi)-pos(r.dif_li90,lo,hi)).toFixed(2)+'%;top:'+yy+'%;--c:'+cc+'"></i>'
          +'<b class="dt sm" style="left:'+pos(r.dif_vs_comparador_pp,lo,hi).toFixed(2)+'%;top:'+yy+'%;--c:'+cc+'"'+ta(c[1]+' · '+nom(r.puntaje)+': '+sg(r.dif_vs_comparador_pp)+' pp (IC 90 % '+sg(r.dif_li90)+' a '+sg(r.dif_ls90)+')')+'></b>'});
      h+='</div></div>'});
    h+='<div class="q-r q-ax q2r"><span></span><div class="tx">'+ticks(lo,hi,5,function(k){return (k>0?'+':'')+k})+'</div></div><div class="ax-t">Diferencia de cobertura contra el comparador (pp)</div></div>';
    $('#ch-q2').innerHTML=h;
    $('#q2Find').innerHTML=fuera===0
      ?'En las <b>'+tot+' comparaciones</b> (menos cupo, otro objetivo, más información, otros universos) <b>ningún modelo se distingue de la regla</b>.'
      :'De '+tot+' comparaciones, <b>'+fuera+'</b> muestran diferencia con la regla. Ver cuáles en la tabla de configuraciones.';
  })();

  /* ---------- 3. ¿A quién deja fuera cada método? ---------- */
  var EQ_DIM=[['SEXO','Sexo'],['EDAD','Edad'],['ING','Ingreso'],['BLOQUE','A quién cuida']];
  var EQ_LBL={'Hombre':'Hombres','Mujer':'Mujeres','15-39':'15 a 39 años','40-59':'40 a 59 años','60+':'60 años y más','Q1-Q2':'Ingreso Q1–Q2','Q3':'Ingreso Q3','Q4-Q5':'Ingreso Q4–Q5','Sin dato':'Ingreso sin dato','Discapacidad':'Persona con discapacidad','Solo 60+':'Solo persona 60+ sin discap.'};
  function renderEq(m){
    var rows=V.equidad.filter(function(r){return r.configuracion===PRIM&&r.puntaje===m});
    $('#q3Dot').style.background=COL[m];
    var h='<div class="q3"><div class="q-r q3r q-h"><span></span><span>Cobertura por grupo <small>%</small></span><span class="r">Cambio</span></div>';
    EQ_DIM.forEach(function(d){
      h+='<div class="grp">'+d[1]+'</div>';
      rows.filter(function(r){return r.dimension===d[0]}).forEach(function(r){var pocos=r.n_con_objetivo<100,dd=r.cambio_pp,big=Math.abs(dd)>=10,a=pos(Math.min(r.cobertura,r.cobertura_comparador),0,100),b=pos(Math.max(r.cobertura,r.cobertura_comparador),0,100);
        h+='<div class="q-r q3r'+(pocos?' poco':'')+'"><div class="q-l">'+esc(EQ_LBL[r.grupo]||r.grupo)+'<small class="'+(pocos?'rojo':'')+'">n = '+r.n_con_objetivo+'</small></div>'
          +'<div class="tr">'+grid(0,100,25)+'<i class="seg2" style="left:'+a.toFixed(2)+'%;width:'+(b-a).toFixed(2)+'%"></i>'
          +'<b class="dt" style="left:'+pos(r.cobertura_comparador,0,100).toFixed(2)+'%;--c:'+INK+'"'+ta('Regla: '+fmt(r.cobertura_comparador)+' %')+'></b>'
          +'<b class="dt" style="left:'+pos(r.cobertura,0,100).toFixed(2)+'%;--c:'+COL[m]+'"'+ta(nom(m)+': '+fmt(r.cobertura)+' %')+'></b></div>'
          +'<div class="chg'+(big?' big':'')+'">'+sg(dd,0)+' pp</div></div>'})});
    h+='<div class="q-r q3r q-ax"><span></span><div class="tx">'+ticks(0,100,25,function(k){return k+'%'})+'</div><span></span></div></div>';
    $('#ch-q3').innerHTML=h;
    var rl=rows.slice().sort(function(a,b){return a.cobertura_comparador-b.cobertura_comparador}),ch=rows.slice().sort(function(a,b){return a.cambio_pp-b.cambio_pp}),
        lo=rl[0],hi=rl[rl.length-1],pe=ch[0],ga=ch[ch.length-1];
    function gn(r){return lc(EQ_LBL[r.grupo]||r.grupo)}
    $('#q3Find').innerHTML='La regla cubre de <b>'+fmt(lo.cobertura_comparador,0)+' %</b> ('+esc(gn(lo))+') a <b>'+fmt(hi.cobertura_comparador,0)+' %</b> ('+esc(gn(hi))+'). '
      +'Con '+esc(m==='Logística'?'la regresión logística':'la tarjeta')+', cada grupo cambia entre <b>'+sg(pe.cambio_pp,0)+'</b> y <b>'+sg(ga.cambio_pp,0)+' pp</b>.';
  }
  seg('#segEq','m',renderEq); renderEq('Logística');

  /* ---------- 4. ¿Por qué se usa 40 horas? ---------- */
  (function(){
    var C={};DG.objetivo_componentes.forEach(function(r){C[r.componente]=r});
    var TOT=DG.candidatos_objetivo.filter(function(r){return r.objetivo.indexOf('salud (')===0})[0];
    var cats=[['Salud física',C.salud_fisica.prev_menos40,C.salud_fisica.prev_40mas],['Cansancio',C.cansancio.prev_menos40,C.cansancio.prev_40mas],['Sueño',C.sueno.prev_menos40,C.sueno.prev_40mas],['Cualquiera de los tres (el objetivo)',TOT.prev_menos40,TOT.prev_40mas]];
    var h='<div class="q4">';
    cats.forEach(function(c,i){
      h+='<div class="q4r'+(i===3?' tot':'')+'"><div class="q4l">'+esc(c[0])+'</div>';
      [[c[1]*100,AZ,'Menos de 40 h'],[c[2]*100,NA,'40 h o más']].forEach(function(p){
        h+='<div class="q4b"><span class="bar" style="width:'+p[0].toFixed(1)+'%;background:'+p[1]+'"'+ta(esc(c[0])+', '+p[2]+': '+fmt(p[0])+' %')+'></span><em>'+fmt(p[0],0)+'%</em></div>'});
      h+='</div>'});
    $('#ch-q4').innerHTML=h+'</div>';
    var todos=cats.every(function(c){return c[2]>c[1]});
    $('#q4Find').innerHTML=(todos?'Con 40 h o más el daño es más frecuente en los tres componentes: <b>'+fmt(TOT.prev_40mas*100,0)+' %</b> frente a <b>'+fmt(TOT.prev_menos40*100,0)+' %</b> con menos de 40 h.':'No en todos los componentes el daño es más frecuente con 40 h o más.');
  })();

  /* ---------- 5. ¿Qué sube o baja el lugar en la fila? ---------- */
  (function(){
    var LB={H_20_39:'Cuida de 20 a 39 h',H_40_59:'Cuida de 40 a 59 h',H_60MAS:'Cuida 60 h o más',MUJER:'Mujer',EDAD_15_39:'Tiene 15 a 39 años',EDAD_60MAS:'Tiene 60 años o más',CUIDA_MENORES:'Cuida además a menores',CAPACITACION:'Recibió capacitación',Q1:'Ingreso Q1',Q2:'Ingreso Q2',Q4:'Ingreso Q4',Q5:'Ingreso Q5',Q_NA:'Ingreso sin dato'};
    var t=V.tarjeta.filter(function(r){return LB[r.variable]}).sort(function(a,b){return b.puntos-a.puntos});
    var lo=Math.min(-5,mn(t.map(function(r){return r.puntos}))-1),hi=Math.max(6,mx(t.map(function(r){return r.puntos}))+1);
    var h='<div class="q5">';
    t.forEach(function(r){var p=r.puntos>=0,a=p?pos(0,lo,hi):pos(r.puntos,lo,hi),w=Math.abs(pos(r.puntos,lo,hi)-pos(0,lo,hi));
      h+='<div class="q-r q5r"><div class="q-l">'+esc(LB[r.variable])+'</div><div class="tr">'+grid(lo,hi,1)
        +'<i class="bar" style="left:'+a.toFixed(2)+'%;width:'+Math.max(w,.6).toFixed(2)+'%;background:'+(p?RO:TE)+';--o:'+(p?'left':'right')+'"'+ta(esc(LB[r.variable])+': '+sg(r.puntos,0)+' puntos (coeficiente '+fmt(r.coeficiente,2)+')')+'></i>'
        +'<em class="vl2" style="left:'+(p?a+w+1:a-1).toFixed(2)+'%;transform:translate('+(p?'0':'-100%')+',-50%)">'+sg(r.puntos,0)+'</em></div></div>'});
    h+='<div class="q-r q5r q-ax"><span></span><div class="tx">'+ticks(lo,hi,1,function(k){return (k>0?'+':'')+k})+'</div></div></div>';
    $('#ch-q5').innerHTML=h;
    $('#q5Find').innerHTML='Sube más: <b>'+esc(lc(LB[t[0].variable]))+'</b> ('+sg(t[0].puntos,0)+'). Baja más: <b>'+esc(lc(LB[t[t.length-1].variable]))+'</b> ('+sg(t[t.length-1].puntos,0)+').';
  })();

  /* ---------- Tablas ---------- */
  var h='<table><thead><tr><th>Configuración</th><th>Método</th><th class="n">Cobertura</th><th class="n">Diferencia vs. comparador (IC 90 %)</th><th class="n">Dif. mínima detectable</th><th>Veredicto</th></tr></thead><tbody>';
  V.global.forEach(function(r){
    var cmp=r.veredicto==='comparador';
    h+='<tr><td>'+esc(r.configuracion.replace('PRIMARIO: ','Primario: '))+(r.cupo&&r.cupo!=='40.7 % (regla)'?' <span class="muted">(cupo '+esc(r.cupo)+')</span>':'')+'</td><td><b>'+nom(r.puntaje)+'</b></td><td class="n">'+fmt(r.cobertura,1)+'%</td>'
      +'<td class="n">'+(cmp?'—':sg(r.dif_vs_comparador_pp)+' <span class="muted">('+sg(r.dif_li90)+' a '+sg(r.dif_ls90)+')</span>')+'</td><td class="n">'+(cmp?'—':fmt(r.dif_minima_detectable_pp,1)+' pp')+'</td><td>'+(cmp?'<span class="muted">comparador</span>':esc(r.veredicto))+'</td></tr>';
  });
  $('#v2Tabla').innerHTML=h+'</tbody></table>';
  var b='<table><thead><tr><th>Bloque</th><th>Método</th><th class="n">Selecciona</th><th class="n">Cobertura</th><th class="n">Diferencia vs. regla (IC 90 %)</th><th>Veredicto</th></tr></thead><tbody>';
  V.por_bloque.filter(function(r){return r.configuracion===PRIM}).forEach(function(r){var cmp=r.veredicto_secundario==='comparador';
    b+='<tr><td>'+esc(r.bloque)+'</td><td><b>'+nom(r.puntaje)+'</b></td><td class="n">'+fmt(r.tasa_seleccion_bloque,1)+'%</td><td class="n">'+fmt(r.cobertura,1)+'%</td><td class="n">'+(cmp?'—':sg(r.dif_vs_comparador_pp)+' <span class="muted">('+sg(r.dif_li90)+' a '+sg(r.dif_ls90)+')</span>')+'</td><td>'+(cmp?'<span class="muted">comparador</span>':esc(r.veredicto_secundario))+'</td></tr>'});
  $('#v2Bloques').innerHTML=b+'</tbody></table>';
  var MED={};(DG.medicion||[]).forEach(function(r){MED[r.chequeo.indexOf('amontonamiento')>=0?'mult7':r.chequeo.indexOf('tienen rango')>=0?'tope':r.chequeo.indexOf('supera 98')>=0?'suma':r.chequeo.indexOf('ambos bloques')>=0?'ambos':r.chequeo]=r.valor});
  var limHoras=(MED.mult7!=null&&MED.tope!=null&&MED.suma!=null&&MED.ambos!=null)
    ?'<b>La medida de las horas es frágil:</b> la regla suma dos preguntas (una por tipo de persona cuidada) con tope de 98 h cada una. '+fmt(MED.ambos,0)+' personas cuidan en ambos bloques, en '+fmt(MED.suma,0)+' la suma supera 98 h y '+fmt(MED.tope,0)+' marcan 98 en alguno. El '+fmt(100*MED.mult7,0)+' % (ponderado) de las respuestas se amontona en múltiplos de 7: el corte de 40 h se apoya en horas redondeadas.'
    :'<b>La medida de las horas es frágil:</b> la regla suma dos preguntas con tope de 98 h; el diagnóstico de medición no está disponible en los datos.';
  $('#limMod').innerHTML=[
    '<b>No sabemos si un modelo lo haría mejor ni si la regla basta:</b> con '+g[0].n_muestra+' personas ('+g[0].n_con_objetivo+' con el daño) solo se notan diferencias de unos '+fmt(DMD,0)+' puntos o más.',
    limHoras,
    '<b>Solo nacional:</b> la ENASIC 2022 no permite concluir por alcaldía.',
    '<b>Daño autodeclarado:</b> predice la declaración, no el daño medido.',
    '<b>No es causal:</b> no dice que el relevo reduzca el daño.',
    '<b>Otra población:</b> se evaluó con datos nacionales; con datos del piloto hay que compararlo de nuevo contra la regla.',
    '<b>Lo que no se muestra:</b> con este objetivo no existen las curvas por cupo, la calibración, la importancia de variables ni los coeficientes de la logística. Las versiones anteriores usaban «algún daño» y salieron de esta pestaña.',
    '<b>Datos personales:</b> la regla de horas es la opción con menos tratamiento de datos.',
    '<b>Revisión:</b> los scripts 26 y 27 no tienen doble revisión de otra persona.'
  ].map(function(t){return '<li>'+t+'</li>'}).join('');
  $('#src-v2').innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional (ENASIC 2022). No sirve para concluir por alcaldía',Objetivo:'DANO_SALUD3: salud física, cansancio o sueño (DEC-OBJ-002, preregistrado el 1 nov 2026)',Método:'Validación por UPM (5 × 20), métricas ponderadas con FAC_CUI, misma tasa de selección que la regla; diferencia con IC 90 % por bootstrap por UPM',Estado:esc(V.version),Archivo:esc(V.fuente)+'; '+esc(DG.fuente)});
})();
