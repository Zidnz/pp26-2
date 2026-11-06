/* Observatorio del Cuidado · js/vistas/inicio.js
   Pestaña Inicio: cuatro tarjetas descriptivas (15 oct 2026; antes, razones con gráfica) y medallón ilustrado del bloque «Los datos que cuidan» y textos y tarjetas del marco «¿Cuántas personas están en
   el problema?», que cierra con el resultado del modelo («Lo que encontramos» se quitó el 8 oct 2026). Las escenas 3D están en inicio-3d.js; los contadores, en inicio-contadores.js.
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
    (c.chips?'<div class="chips">'+c.chips+'</div>':'')+(c.t?'<button type="button" class="fr-go" data-goto="'+c.t+'"'+(c.a?' data-ancla="'+c.a+'"':'')+'>'+(c.b||'Ver la pestaña →')+'</button>':'')+'</article>'}
  function signo(x){return (x>0?'+':'')+fmt(x)}

  // 1 · Los datos que cuidan: cuatro tarjetas DESCRIPTIVAS (15 oct 2026, noche). Sustituyen a las cuatro «razones vivas» con gráfica.
  //     Decisión del equipo: la portada presenta qué es el Observatorio, qué mide y qué no, de dónde sale cada dato y qué tan firme es.
  //     Las gráficas siguen en sus pestañas. Los conteos de la tarjeta 04 se calculan de D.inventario; ninguna cifra se escribe a mano.
  //     Respaldo de la versión anterior (razones con gráfica): _to_delete/backup_pre_descripcion_2026-10-15/inicio.js
  var INV={}; D.inventario.forEach(function(r){INV[r.id]=r});
  function geo(id){ var r=INV[id]; return r?esc(String(r.desagregacion_geografica_maxima).split(' (')[0]):'' }
  // Estado de evidencia: el campo trae texto libre («Confirmado (paquete oficial…)»); se clasifica por su primera palabra.
  var EST=[['Confirmado','ok'],['Probable','mid'],['Desconocido','low'],['No aplica','na']], CUENTA={};
  EST.forEach(function(e){CUENTA[e[0]]=0});
  D.inventario.forEach(function(r){ var s=String(r.estado_evidencia), k=EST.filter(function(e){return s.indexOf(e[0])===0})[0]; if(k) CUENTA[k[0]]++; });
  function barraEstado(){ var tot=D.inventario.length, x=0, W=220, out='';
    EST.forEach(function(e,i){ var n=CUENTA[e[0]]; if(!n) return; var w=W*n/tot;
      out+='<rect x="'+x.toFixed(1)+'" y="0" width="'+Math.max(w-1.5,1.5).toFixed(1)+'" height="12" rx="3" class="rz-seg '+e[1]+' rz-a" style="--d:'+i+'"><title>'+e[0]+': '+n+' de '+tot+'</title></rect>'; x+=w; });
    return '<svg class="rz-viz" viewBox="0 0 220 12" role="img" aria-label="Estado de evidencia de las '+tot+' fuentes inventariadas: '+
      EST.map(function(e){return CUENTA[e[0]]+' '+e[0].toLowerCase()}).join(', ')+'">'+out+'</svg>'; }
  function leyenda(){ return '<ul class="rz-ley">'+EST.map(function(e){ return '<li><i class="'+e[1]+'"></i><b class="num">'+CUENTA[e[0]]+'</b> '+e[0].toLowerCase()+'</li>' }).join('')+'</ul>'; }
  function tarjeta(r,i){
    return '<article class="rz rz-desc" style="--c:'+r.c+';--c2:'+r.c2+'"><div class="rz-h"><span class="rz-i">0'+(i+1)+'</span><h3>'+r.h+'</h3></div>'+
      '<div class="rz-cuerpo">'+r.cuerpo+'</div>'+
      '<div class="rz-f"><span class="rz-p">'+r.pie+'</span>'+(r.t?'<button type="button" class="rz-go" data-goto="'+r.t+'">'+r.b+'</button>':'')+'</div></article>'}
  var RZ=[
    {c:'#2E8A66',c2:'#6FD3A8',h:'Qué es',
     cuerpo:'<p>Un observatorio de <b>datos agregados</b> sobre quien cuida en casa sin pago a personas con discapacidad o de 60 años y más, y sobre la oferta y el territorio en que ese cuidado ocurre.</p>'+
            '<p>Sin datos simulados ni personales.</p>',
     pie:'Cada gráfica trae su fuente y su precisión'},
    {c:'#8B58C9',c2:'#C3A2F0',h:'Qué mide y qué no',t:'metodo',b:'Método →',
     cuerpo:'<ul class="rz-lista"><li class="si"><b>Sí:</b> horas, daño y barreras de las personas cuidadoras. ENASIC 2022 (INEGI), nacional.</li>'+
            '<li class="no"><b>No:</b> cifras por alcaldía ni para la CDMX con la ENASIC; tampoco tendencias, porque es su primera edición.</li>'+
            '<li class="via"><b>El territorio</b> sale de otras fuentes: Censo 2020, DENUE y CONEVAL.</li></ul>',
     pie:'Cada fuente declara qué permite y qué prohíbe afirmar'},
    {c:'#E0455F',c2:'#FF8FA1',h:'De dónde sale cada dato',t:'metodo',b:'Inventario →',
     cuerpo:'<dl class="rz-src">'+
            '<div><dt>Personas cuidadoras</dt><dd>ENASIC 2022 · '+geo('F04')+'</dd></div>'+
            '<div><dt>Oferta de servicios</dt><dd>DENUE · '+geo('F09')+'</dd></div>'+
            '<div><dt>Rezago social</dt><dd>CONEVAL 2020 · '+geo('F20')+'</dd></div></dl>',
     pie:'Una fila = una unidad distinta en cada fuente'},
    {c:'#1E5A47',c2:'#7DD1C1',h:'Qué tan firme es',t:'metodo',b:'Ver las '+D.inventario.length+' fuentes →',
     cuerpo:'<p>De las <b class="num">'+D.inventario.length+'</b> fuentes inventariadas:</p>'+barraEstado()+leyenda()+
            '<p class="rz-nota"><b>Probable</b> = la inferencia está escrita en el inventario. <b>Desconocido</b> = no se pudo verificar, y se dice.</p>',
     pie:'Estado según el inventario de fuentes'}];
  // 15 oct 2026 (noche, más tarde): las cuatro tarjetas pasan a carrusel (‹ ›, números, autoavance con pausa, teclado y deslizar).
  // La ilustración queda a la izquierda. Mismo diseño y colores de tarjeta (.rz). Respaldo: _to_delete/backup_pre_carrusel_2026-10-15/
  var N=RZ.length, DUR=9000;
  var SEC=[].slice.call(document.querySelectorAll('.tabs [role=tab]')).filter(function(b){return b.dataset.t!=='inicio'})
    .map(function(b){var s=b.querySelector('span');return '<button type="button" class="car-chip" data-goto="'+esc(b.dataset.t)+'">'+esc(s?s.textContent:b.dataset.t)+'</button>'}).join('');
  RZ[0].cuerpo+=(SEC?'<div class="car-sec"><span>En el sitio</span><div>'+SEC+'</div></div>':'');
  var car=$('#carrusel');
  car.setAttribute('role','group'); car.setAttribute('aria-roledescription','carrusel'); car.setAttribute('aria-label','Qué es el Observatorio');
  car.innerHTML='<div class="car-vista" aria-live="off">'+RZ.map(function(r,i){
      return '<div class="car-slide" role="group" aria-roledescription="diapositiva" aria-label="'+(i+1)+' de '+N+': '+esc(r.h)+'">'+tarjeta(r,i)+'</div>'}).join('')+'</div>'+
    '<div class="car-ctl"><button type="button" class="car-fl" data-d="-1" aria-label="Anterior"><span aria-hidden="true">‹</span></button>'+
    '<div class="car-pts">'+RZ.map(function(r,i){return '<button type="button" class="car-pt" data-i="'+i+'" aria-label="Ir a: '+esc(r.h)+'" style="--c2:'+r.c2+'"><b>0'+(i+1)+'</b><span class="t">'+r.h+'</span></button>'}).join('')+'</div>'+
    '<button type="button" class="car-fl" data-d="1" aria-label="Siguiente"><span aria-hidden="true">›</span></button></div>';
  (function(){
    var S=[].slice.call(car.querySelectorAll('.car-slide')), P=[].slice.call(car.querySelectorAll('.car-pt')), V=car.querySelector('.car-vista'),
        cur=0, timer=null, manual=false, calma=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function pinta(){ S.forEach(function(s,i){ s.classList.toggle('on',i===cur); if(i===cur) s.removeAttribute('inert'); else s.setAttribute('inert',''); });
      P.forEach(function(p,i){ p.classList.toggle('on',i===cur); if(i===cur) p.setAttribute('aria-current','true'); else p.removeAttribute('aria-current');
        p.classList.remove('lleno'); }); if(timer){ void car.offsetWidth; P[cur].classList.add('lleno'); } }
    function ir(n,dir){ n=(n+N)%N; if(n===cur) return; dir=dir||(n>cur?1:-1);
      var sale=S[cur], entra=S[n];
      entra.classList.add('sin'); entra.style.setProperty('--off',(dir>0?36:-36)+'px'); void entra.offsetWidth; entra.classList.remove('sin');
      sale.style.setProperty('--off',(dir>0?-36:36)+'px'); cur=n; pinta(); }
    function paro(){ if(timer){ clearInterval(timer); timer=null; } car.classList.remove('auto'); P.forEach(function(p){p.classList.remove('lleno')}); }
    function arranca(){ if(calma||manual||timer) return; timer=setInterval(function(){ ir(cur+1,1) },DUR); car.classList.add('auto'); pinta(); }
    function usa(){ manual=true; paro(); V.setAttribute('aria-live','polite'); }   // al usarlo a mano, no vuelve a avanzar solo
    car.addEventListener('click',function(e){ var f=e.target.closest('.car-fl'), p=e.target.closest('.car-pt'); if(!f&&!p) return;
      usa(); if(f) ir(cur+(+f.dataset.d),+f.dataset.d); else ir(+p.dataset.i); });
    car.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'){ usa(); ir(cur+1,1); e.preventDefault(); } else if(e.key==='ArrowLeft'){ usa(); ir(cur-1,-1); e.preventDefault(); } });
    var x0=null; V.addEventListener('pointerdown',function(e){ x0=e.clientX; });
    V.addEventListener('pointerup',function(e){ if(x0===null) return; var dx=e.clientX-x0; x0=null; if(Math.abs(dx)>48){ usa(); ir(cur+(dx<0?1:-1),dx<0?1:-1); } });
    car.addEventListener('pointerenter',function(){ if(!manual) paro(); });
    car.addEventListener('pointerleave',function(){ if(!manual) arranca(); });
    car.addEventListener('focusin',function(){ if(!manual) paro(); });
    car.addEventListener('focusout',function(){ if(!manual) arranca(); });
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ if(es.some(function(e){return e.isIntersecting})) arranca(); else paro(); },{threshold:.4}).observe(car); }
    document.addEventListener('visibilitychange',function(){ if(document.hidden) paro(); });
    pinta();
  })();
  // Entrada: al verse el bloque se dibujan las gráficas y las cifras cuentan desde 0 (sin movimiento si el sistema lo pide).
  (function(){ var calma=window.matchMedia('(prefers-reduced-motion: reduce)').matches, hero=$('#hero-enfoque'); if(!hero) return;
    var cards=hero.querySelectorAll('.rz');
    function cuenta(el){ var v=+el.dataset.n, t0=null, dur=1100;
      function paso(t){ if(!t0) t0=t; var k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=fmt(v*e); if(k<1) requestAnimationFrame(paso); else el.textContent=fmt(v); }
      requestAnimationFrame(paso); }
    function entra(){ hero.classList.add('rz-in'); if(!calma) hero.querySelectorAll('[data-n]').forEach(cuenta); }
    if(calma||!('IntersectionObserver' in window)){ hero.classList.add('rz-in'); }
    else { var io=new IntersectionObserver(function(es){ if(es.some(function(e){return e.isIntersecting})){ io.disconnect(); entra(); } },{threshold:.25}); io.observe(hero.querySelector('#carrusel')); }
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
      // 14 oct 2026: antes las cinco tarjetas llevaban a la misma pestaña (ET=['necesidad','necesidad','necesidad','barreras','necesidad']).
      // Ahora cada botón lleva a la gráfica que muestra su cifra; las etapas 1 y 2 no tienen gráfica propia, así que no llevan botón.
      // Respaldo: _to_delete/backup_pre_anclas_embudo_2026-10-14/
      ET=[null,null,'necesidad','necesidad','necesidad'],
      EA=[null,null,'ch-horas','ch-carga','grupo'],
      EB=[null,null,'Ver distribución de horas →','Ver necesidad vs. daño →','Ver el grupo del problema →'];
  function pa(i){return fmt(100*E[i].total/E[i-1].total,0)}
  $('#embFind').innerHTML='De '+mill(E[0].total)+' de personas que cuidan, <b>≈ '+mill(E[4].total)+'</b> cuidan 40 h o más, dicen "no tuve necesidad" y declaran daño a su salud (salud física, cansancio o sueño).';
  // 14 oct 2026: las cinco tarjetas pasaron al selector de personajes (inicio-seleccion.js); comparte estos datos. Respaldo: _to_delete/backup_pre_seleccion_personajes_2026-10-14/
  OBS.EMB={E:E,EH:EH,ET:ET,EA:EA,EB:EB};
  $('#src-embudo').innerHTML=dl({Fuente:'INEGI, ENASIC 2022, microdatos (TPOB_CUI, FAC_CUI)',Cobertura:'Nacional',Precisión:'grupo final: '+G.precision+' (IC 90% '+fmt(G.li90)+'–'+fmt(G.ls90)+'% del universo)',Archivos:esc(E[0].fuente)+' · '+esc(E[4].fuente)});

  // 3 · «Lo que encontramos» se quitó el 8 oct 2026 (repetía tres de las cuatro razones). Su único hallazgo propio,
  //     el modelo frente a la regla simple, cierra ahora el embudo. Respaldo: _to_delete/backup_pre_dedup_2026-10-08/
  var RG=GL['Regla >= 40 h'];
  /* 3 nov 2026: la tarjeta sale de la versión vigente (DANO_SALUD3, 27_v2_global.csv) y habla del lector, no de la prueba estadística. */
  var G2=((D.modelo_v2||{}).global||[]).filter(function(r){return r.configuracion==='PRIMARIO: DANO_SALUD3, predictores primarios'}),
      V2G=G2.filter(function(r){return r.puntaje==='Regla >= 40 h'})[0],
      V2M=G2.filter(function(r){return r.puntaje!=='Regla >= 40 h'}),
      AZ2=V2G?parseFloat(V2G.cupo):NaN,
      nadaMejor=V2M.length>0&&V2M.every(function(r){return r.dif_li90<=0&&r.dif_ls90>=0});
  $('#embudo-modelo').innerHTML=V2G
    ?'<div class="fm-k">¿A quién atender primero?</div>'+
      '<div class="fm-n num">'+fmt(V2G.cobertura,0)+' <small>de cada 100</small></div>'+
      '<p>Si el relevo se ofrece primero a quien cuida <b>40 h o más</b> a la semana, se llega a '+fmt(V2G.cobertura,0)+' de cada 100 personas con daño a su salud'+(isFinite(AZ2)?' (elegir al azar llegaría a '+fmt(AZ2,0)+')':'')+'. Las otras '+fmt(100-V2G.cobertura,0)+' quedan fuera.'+(nadaMejor?' Probamos modelos más complejos y no se notó que mejoraran esto.':'')+'</p>'+
      '<div class="fm-a"><span class="chip p-noest">Regla simple</span><button type="button" class="fr-go" data-goto="focalizacion">Ver cómo se elige →</button></div>'
    :'<div class="fm-k">¿A quién atender primero?</div><p>Hoy, a quien cuida 40 h o más a la semana.</p>'+
      '<div class="fm-a"><button type="button" class="fr-go" data-goto="focalizacion">Ver cómo se elige →</button></div>';
})();
