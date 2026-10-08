/* Observatorio del Cuidado · js/vistas/inicio.js
   Pestaña Inicio: razones y medallón ilustrado del bloque «Los datos que cuidan» y textos y tarjetas de los marcos «¿Cuántas personas están en
   el problema?» y «Lo que encontramos». Las escenas 3D están en inicio-3d.js; los contadores, en inicio-contadores.js.
   Todas las cifras salen de D (build_datos.py); ninguna se escribe a mano.
   Importa de OBS: $, C, G, GL, K, R, REL, des, dl, esc, fmt, mill, prec, r40, r6
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,C=OBS.C,G=OBS.G,GL=OBS.GL,K=OBS.K,R=OBS.R,REL=OBS.REL,des=OBS.des,dl=OBS.dl,esc=OBS.esc
      ,fmt=OBS.fmt,mill=OBS.mill,prec=OBS.prec,r40=OBS.r40,r6=OBS.r6;
  var M=D.modelo, LG=GL['Regresión logística'];
  var SINPREST='<span class="chip p-moderada">sin prestaciones</span><span class="chip p-noest">sin varianza</span>';
  // Tarjeta del marco: título, cifra, texto, chips de precisión y botón a la pestaña (pestanas.js enlaza [data-goto]).
  function card(c){return '<article class="fr-card"><h3>'+c.h+'</h3><span class="fr-num num'+(c.alto?' alto':'')+'">'+c.n+'</span><p>'+c.p+'</p>'+
    (c.chips?'<div class="chips">'+c.chips+'</div>':'')+'<button type="button" class="fr-go" data-goto="'+c.t+'">Ver la pestaña →</button></article>'}
  function signo(x){return (x>0?'+':'')+fmt(x)}

  // 1 · Los datos que cuidan: cuatro razones del enfoque (versión «razones vivas», 8 oct 2026).
  //     Cada tarjeta lleva su cifra, una micrográfica dibujada con esa misma cifra (o con la serie de la que sale),
  //     su intervalo y su n. Nada se escribe a mano. Respaldo de la versión anterior y sus textos originales:
  //     _to_delete/backup_pre_razones_vivas_2026-10-08/inicio.js
  var NEC=R.todas.filter(function(e){return e.etiqueta==='No tuvo necesidad'})[0];
  var PAQ=REL.filter(function(f){return f.salario===REL[0].salario});
  function ic(e){return 'IC 90% '+fmt(e.li90)+'–'+fmt(e.ls90)}
  function lab(s){return esc(String(s).replace('>=','≥').replace('-','–'))}
  // a) Daño por horas de cuidado: barras con bigote del IC 90%
  function vzHoras(){ var x0=44,sc=1.36;
    return '<svg class="rz-viz" viewBox="0 0 220 74" role="img" aria-label="Porcentaje con daño por horas de cuidado: '+
      C.dano.map(function(e,i){return lab(C.segmentos[i])+' '+fmt(e.pct)+'%'}).join(', ')+'">'+
      C.dano.map(function(e,i){var y=i*24;
        return '<text x="0" y="'+(y+12)+'" class="rz-t">'+lab(C.segmentos[i])+'</text>'+
          '<rect x="'+x0+'" y="'+(y+3)+'" width="'+(100*sc)+'" height="12" rx="3" class="rz-track"/>'+
          '<rect x="'+x0+'" y="'+(y+3)+'" width="'+(e.pct*sc)+'" height="12" rx="3" class="rz-bar rz-a'+(i===2?' on':'')+'" style="--d:'+i+'"/>'+
          '<line x1="'+(x0+e.li90*sc)+'" x2="'+(x0+e.ls90*sc)+'" y1="'+(y+9)+'" y2="'+(y+9)+'" class="rz-ic"/>'+
          '<text x="220" y="'+(y+12)+'" text-anchor="end" class="rz-v'+(i===2?'':' dim')+'">'+fmt(e.pct)+'%</text>'}).join('')+
      '<text x="'+x0+'" y="73" class="rz-t">línea blanca = IC 90%</text></svg>'}
  // b) Diez personas; el relleno avanza exactamente hasta la cifra. Debajo, el IC 90%.
  function vzFamilia(e){ var p='', W=220, s=W/10;
    for(var i=0;i<10;i++){var cx=i*s+s/2; p+='<circle cx="'+cx+'" cy="9" r="5"/><path d="M'+(cx-8)+' 34v-6a8 8 0 0 1 16 0v6z"/>'}
    return '<svg class="rz-viz" viewBox="0 0 220 52" role="img" aria-label="'+fmt(e.pct)+' de cada 100 dicen que la familia debe cuidar">'+
      '<defs><clipPath id="rz-clip"><rect class="rz-a" x="0" y="0" width="'+(W*e.pct/100)+'" height="36"/></clipPath></defs>'+
      '<g class="rz-ppl">'+p+'</g><g class="rz-ppl on" clip-path="url(#rz-clip)">'+p+'</g>'+
      '<path class="rz-brk" d="M'+(W*e.li90/100)+' 42v4H'+(W*e.ls90/100)+'v-4"/>'+
      '<text x="'+(W*e.li90/100-4)+'" y="49" text-anchor="end" class="rz-t">IC 90%</text></svg>'}
  // c) Hogares que gastarían ≤ 20 % de su ingreso, por paquete de horas (el salto a 40 h va separado)
  function vzPrecio(){ var H=46, xs=[14,52,90,128,198];
    return '<svg class="rz-viz" viewBox="0 0 220 76" role="img" aria-label="Hogares que gastarían 20% o menos de su ingreso: '+
      PAQ.map(function(f){return f.horas+' h '+fmt(f.u20)+'%'}).join(', ')+'">'+
      PAQ.map(function(f,i){var x=xs[i], h=H*f.u20/100, on=f.horas===6||f.horas===40;
        return '<rect x="'+(x-11)+'" y="'+(12+H-h)+'" width="22" height="'+Math.max(h,1.5)+'" rx="3" class="rz-col rz-a'+(on?' on':'')+'" style="--d:'+i+'"/>'+
          '<text x="'+x+'" y="'+(8+H-h)+'" text-anchor="middle" class="rz-v'+(on?'':' dim')+'">'+fmt(f.u20,0)+'</text>'+
          '<text x="'+x+'" y="72" text-anchor="middle" class="rz-t">'+f.horas+' h</text>'}).join('')+
      '<line x1="0" x2="220" y1="'+(12+H)+'" y2="'+(12+H)+'" class="rz-base"/>'+
      '<text x="163" y="'+(H)+'" text-anchor="middle" class="rz-t">···</text></svg>'}
  // d) 100 puntos: «no tuvo necesidad» (redondeado) frente a «no sabe que existen» (redondeado)
  function vzDesconoce(){ var n1=Math.round(NEC.pct), n2=Math.max(1,Math.round(des.pct)), out='';
    for(var i=0;i<100;i++){var c=i%20, r=Math.floor(i/20), k=i<n1?'a':i<n1+n2?'hot':'z';
      out+='<circle cx="'+(c*11+5.5)+'" cy="'+(r*10+5)+'" r="3.6" class="rz-dot '+k+'" style="--d:'+i+'"/>'}
    return '<svg class="rz-viz" viewBox="0 0 220 76" role="img" aria-label="De cada 100 personas cuidadoras, '+n1+' dicen que no tuvieron necesidad y '+n2+' que no saben que existen los servicios">'+out+
      '<circle cx="8" cy="59" r="3" class="rz-dot a" style="--d:0"/><text x="15" y="62" class="rz-t">no tuvo necesidad ('+n1+')</text>'+
      '<circle cx="8" cy="70" r="3" class="rz-dot hot" style="--d:0"/><text x="15" y="73" class="rz-t">no sabe que existen ('+n2+')</text></svg>'}

  function razon(r,i){
    return '<article class="rz" style="--c:'+r.c+';--c2:'+r.c2+'"><div class="rz-h"><span class="rz-i">0'+(i+1)+'</span><h3>'+r.h+'</h3></div>'+
      '<div class="rz-m"><b class="rz-n num"><span data-n="'+r.n+'">'+fmt(r.n)+'</span><small>%</small></b><p>'+r.p+'</p></div>'+r.viz+
      '<div class="rz-f"><span class="rz-p">'+r.pie+'</span><button type="button" class="rz-go" data-goto="'+r.t+'">Evidencia →</button></div></article>'}
  var RZ=[
    {c:'#2E8A66',c2:'#6FD3A8',h:'Empezamos por quien cuida',n:C.dano[2].pct,t:'necesidad',viz:vzHoras(),
     p:'de quienes cuidan 40 h o más y dicen «no tuve necesidad» declara daño a su salud o su trabajo.',
     pie:ic(C.dano[2])+' · n='+C.dano[2].n+' · precisión '+C.dano[2].precision},
    {c:'#8B58C9',c2:'#C3A2F0',h:'Sin quitarle el cuidado a la familia',n:K.familia.pct,t:'barreras',viz:vzFamilia(K.familia),
     p:'dice que la familia debe cuidar. Nuestra lectura: relevo por horas, no reemplazo.',
     pie:ic(K.familia)+' · n='+K.familia.n+' · precisión '+K.familia.precision},
    {c:'#E0455F',c2:'#FF8FA1',h:'Por horas, el precio cabe',n:r6.u20,t:'relevo',viz:vzPrecio(),
     p:'de los hogares con necesidad de cuidado gastaría ≤ 20 % de su ingreso en 6 h/semana de relevo. Jornada completa: '+fmt(r40.u20)+'%.',
     pie:'Nacional · sin prestaciones · sin varianza de diseño · n='+PAQ[0].n},
    {c:'#1E5A47',c2:'#7DD1C1',h:'Informar no basta',n:des.pct,t:'barreras',viz:vzDesconoce(),
     p:'no busca servicios por no saber que existen; '+fmt(NEC.pct)+'% dice que no tuvo necesidad. Un directorio no resuelve el problema.',
     pie:ic(des)+' · todas las cuidadoras · n='+des.n+' · precisión '+des.precision}];
  $('#reasons-a').innerHTML=RZ.slice(0,2).map(razon).join('');
  $('#reasons-b').innerHTML=RZ.slice(2).map(function(r,i){return razon(r,i+2)}).join('');
  // Entrada: al verse el bloque se dibujan las gráficas y las cifras cuentan desde 0 (sin movimiento si el sistema lo pide).
  (function(){ var calma=window.matchMedia('(prefers-reduced-motion: reduce)').matches, hero=$('#hero-enfoque'); if(!hero) return;
    var cards=hero.querySelectorAll('.rz');
    function cuenta(el){ var v=+el.dataset.n, t0=null, dur=1100;
      function paso(t){ if(!t0) t0=t; var k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=fmt(v*e); if(k<1) requestAnimationFrame(paso); else el.textContent=fmt(v); }
      requestAnimationFrame(paso); }
    function entra(){ hero.classList.add('rz-in'); if(!calma) hero.querySelectorAll('[data-n]').forEach(cuenta); }
    if(calma||!('IntersectionObserver' in window)){ hero.classList.add('rz-in'); }
    else { var io=new IntersectionObserver(function(es){ if(es.some(function(e){return e.isIntersecting})){ io.disconnect(); entra(); } },{threshold:.25}); io.observe(hero.querySelector('.reasons')); }
    // Foco de luz que sigue al cursor dentro de cada tarjeta
    if(!calma) Array.prototype.forEach.call(cards,function(c){ c.addEventListener('pointermove',function(ev){ var b=c.getBoundingClientRect();
      c.style.setProperty('--px',(ev.clientX-b.left)+'px'); c.style.setProperty('--py',(ev.clientY-b.top)+'px'); }); });
  })();
  // Emblema: gira hasta 9° hacia el cursor mientras este pasa por el bloque oscuro.
  (function(){ var md=$('#medallon'), hero=$('#hero-enfoque'); if(!md||!hero) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function pon(rx,ry,mx,my){ md.style.setProperty('--rx',rx+'deg'); md.style.setProperty('--ry',ry+'deg'); md.style.setProperty('--mx',mx+'%'); md.style.setProperty('--my',my+'%'); }
    hero.addEventListener('pointermove',function(e){ var r=md.getBoundingClientRect(); if(!r.width) return;
      var dx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/(r.width*1.2))), dy=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/(r.height*1.2)));
      pon((-dy*9).toFixed(2),(dx*9).toFixed(2),(50+dx*35).toFixed(1),(50+dy*35).toFixed(1)); });
    hero.addEventListener('pointerleave',function(){ pon(0,0,30,22); });
  })();

  // 2 · ¿Cuántas personas están en el problema? (embudo en cinco escenas)
  var E=D.embudo, EH=['Cuidan','Discapacidad o 60+','40 h o más','«No tuve necesidad»','Con daño'],
      ET=['necesidad','necesidad','necesidad','barreras','necesidad'];
  function pa(i){return fmt(100*E[i].total/E[i-1].total,0)}
  $('#embFind').innerHTML='De '+mill(E[0].total)+' de personas que cuidan, <b>≈ '+mill(E[4].total)+'</b> cuidan 40 h o más, dicen "no tuve necesidad" y declaran daño a su salud o su trabajo.';
  $('#cards-embudo').innerHTML=E.map(function(e,i){return card({h:EH[i],n:mill(e.total)+(i?' · '+pa(i)+'%':''),alto:i===E.length-1,t:ET[i],
    p:esc(e.etapa)+'.'+(i?' '+pa(i)+'% de la etapa anterior.':'')})}).join('');
  $('#src-embudo').innerHTML=dl({Fuente:'INEGI, ENASIC 2022, microdatos (TPOB_CUI, FAC_CUI)',Cobertura:'Nacional',Precisión:'grupo final: '+G.precision+' (IC 90% '+fmt(G.li90)+'–'+fmt(G.ls90)+'% del universo)',Archivos:esc(E[0].fuente)+' · '+esc(E[4].fuente)});

  // 3 · Lo que encontramos (un hallazgo por pestaña)
  $('#cards-hallazgos').innerHTML=[
    {h:'¿Quién lo carga?',n:fmt(C.dano[2].pct)+'%',t:'necesidad',chips:prec(C.dano[2].precision),
     p:'de quienes cuidan 40 h o más y dicen «no tuve necesidad» declara daño; con menos de 20 h, '+fmt(C.dano[0].pct)+'%.'},
    {h:'¿Por qué no se contrata?',n:fmt(des.pct)+'%',t:'barreras',chips:prec(des.precision),
     p:'dice no saber que existen los servicios: la información no es la barrera.'},
    {h:'¿Cuánto cuesta?',n:fmt(r6.u20)+'%',t:'relevo',chips:SINPREST,
     p:'de los hogares podría pagar 6 h/semana de cuidado; la jornada completa, '+fmt(r40.u20)+'%.'},
    {h:'¿A quién primero?',n:signo(LG.dif_cobertura_vs_regla)+' pp',t:'focalizacion',chips:'<span class="chip p-noest">IC incluye 0</span>',
     p:'de cobertura gana el modelo frente a la regla de 40 h: diferencia no demostrable (IC 90% '+fmt(LG.dif_li90)+' a '+fmt(LG.dif_ls90)+' pp).'}
  ].map(card).join('');
  $('#src-hallazgos').innerHTML=dl({Fuente:'INEGI, ENASIC 2022, microdatos; modelo del notebook 11',Cobertura:'Nacional',
    Objetos:'Cada objeto se dibuja con la cifra de su tarjeta: columnas a escala ('+fmt(C.dano[0].pct)+'% y '+fmt(C.dano[2].pct)+'%), una esfera distinta entre 100 ('+fmt(des.pct)+'% redondeado a '+Math.round(des.pct)+'), aros con el arco proporcional y una balanza que oscila dentro del IC 90%.',
    Archivos:esc(C.fuente)+' · '+esc(R.fuente)+' · '+esc(D.relevo.fuente)+' · '+esc(M.fuente)});
})();
