/* Observatorio del Cuidado · js/vistas/indicadores.js
   Pestaña Indicadores (rediseño 15 oct 2026): HUD con conteo por clase de evidencia, minimapa de los indicadores, filtros que reacomodan
   las fichas y un inspector que muestra la ficha completa. Ninguna cifra va escrita aquí: todo sale de D.kpis.
   21 oct 2026: ilustración decorativa (ilustraciones/guia_idea.webp) al pie del inspector, junto a las flechas. No es dato ni persona real.
   Con ?ind=clasico se ve la cuadrícula anterior. Con prefers-reduced-motion no hay conteo, trazado ni reacomodo animado.
   Importa de OBS: $, ent, esc, fmt, prec, seg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,ent=OBS.ent,esc=OBS.esc,fmt=OBS.fmt,prec=OBS.prec,seg=OBS.seg,K=D.kpis;
  /* 22–23 oct 2026: sin rutas de archivo a la vista; la ruta queda en el title. Ver OBS.origen en util.js */
  function orig(f){return OBS.origen(f)||esc(f)}
  var EV={confirmado:{t:'Confirmado',c:'e-c'},probable:{t:'Probable',c:'e-p'},desconocido:{t:'Desconocido',c:'e-d'},otro:{t:'Sin clasificar',c:'e-p'}};
  function evC(k){var e=k.evidencia.split(/[ :(]/)[0];return EV[e]?e:'otro'}
  function valK(k){if(k.valor==null)return 'No medible';var u=k.unidad;return u.indexOf('%')===0?fmt(k.valor)+'%':u==='$ por hora'?'$'+fmt(k.valor,2):u==='veces'?fmt(k.valor,2)+'×':ent(k.valor)}
  var modo=(/[?&]ind=(\w+)/.exec(location.search)||[])[1];
  if(modo==='clasico')clasico();else moderno();

  /* ---------- tabla completa (igual en las dos vistas) ---------- */
  $('#tkpi tbody').innerHTML=K.map(function(k,i){return '<tr><td class="n">'+(i+1)+'</td><td>'+k.dimension+'</td><td><b>'+esc(k.nombre)+'</b></td><td style="min-width:220px">'+esc(k.definicion)+'</td><td style="min-width:150px">'+esc(k.universo)+'</td><td style="min-width:150px">'+esc(k.evidencia)+'</td><td class="muted" style="font-size:12px;min-width:180px" title="'+esc(k.fuente)+'">'+orig(k.fuente)+'</td></tr>'}).join('');

  /* ---------- vista anterior ---------- */
  function clasico(){
    var DIMS=['Todas'];K.forEach(function(k){if(DIMS.indexOf(k.dimension)<0)DIMS.push(k.dimension)});
    $('#segKpi').innerHTML=DIMS.map(function(d,i){return '<button data-d="'+d+'" aria-pressed="'+(i===0)+'">'+d+'</button>'}).join('');
    function renderKpi(d){
      var L=K.filter(function(k){return d==='Todas'||k.dimension===d});
      $('#kpiTiles').innerHTML=L.map(function(k){var nm=k.valor==null;return '<div class="card tile"'+(nm?' style="border-style:dashed"':'')+'><div class="kicker" style="margin:0">'+k.dimension+'</div><div class="big num" style="font-size:'+(nm?'20px;color:var(--alert)':'30px')+'">'+valK(k)+'</div><div class="lbl"><b style="color:var(--ink)">'+esc(k.nombre)+'</b><br>'+esc(k.universo)+'</div><div class="chips">'+(nm?'':prec(k.precision.split(' (')[0]))+'<span class="chip ev">'+esc(k.evidencia.split(/[ :(]/)[0])+'</span></div></div>'}).join('');
    }
    seg('#segKpi','d',renderKpi);renderKpi('Todas');
  }

  /* ---------- vista nueva ---------- */
  function moderno(){
    var calma=window.matchMedia('(prefers-reduced-motion: reduce)').matches, anim=!calma&&('IntersectionObserver' in window);
    var box=$('#kpiTiles'), tabsEl=$('#segKpi');
    var DIMS=['Todas'];K.forEach(function(k){if(DIMS.indexOf(k.dimension)<0)DIMS.push(k.dimension)});
    var cnt={};K.forEach(function(k){var e=evC(k);cnt[e]=(cnt[e]||0)+1});
    var st={dim:'Todas',ev:null,sel:0};
    function pad(n){return (n<10?'0':'')+n}
    function unidad(k){var u=k.unidad;if(u==='%'||u==='no medible'||u==='veces')return '';if(u.indexOf('% ')===0)return u.slice(2);if(u==='$ por hora')return 'por hora';return u}
    var SV='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var ICO={personas:SV+'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.4 0 4 1.5 4.5 4.3"/></svg>',
      establecimientos:SV+'<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/><path d="M3 20h18"/></svg>'};
    var LOCK=SV+'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    function glyph(k){
      if(k.valor==null)return '<span class="ind-ico">'+LOCK+'</span>';
      if(k.unidad.indexOf('%')===0){var v=Math.max(0,Math.min(100,k.valor));return '<svg class="ind-ring" viewBox="0 0 72 72" aria-hidden="true"><circle class="rg-bg" cx="36" cy="36" r="29"/><circle class="rg-fg" cx="36" cy="36" r="29" pathLength="100" style="--off:'+(100-v).toFixed(2)+'"/></svg>'}
      return '<span class="ind-ico">'+(ICO[k.unidad]||(k.unidad==='$ por hora'?'$':k.unidad==='veces'?'×':'#'))+'</span>'}

    /* HUD: conteo vivo + filtro por evidencia + minimapa */
    var hud='<div class="ind-hud"><div class="ind-hudtop"><div class="ind-cnt"><b id="indN">'+K.length+'</b><span>de '+K.length+' indicadores a la vista</span></div>'+
      '<div class="ind-ev" role="group" aria-label="Filtrar por clase de evidencia">'+['confirmado','probable','desconocido'].filter(function(e){return cnt[e]}).map(function(e){return '<button type="button" class="ind-evb '+EV[e].c+'" data-e="'+e+'" aria-pressed="false"><i></i><b>'+cnt[e]+'</b><span>'+EV[e].t+(cnt[e]===1?'':(e==='desconocido'?'s':'s'))+'</span></button>'}).join('')+'</div></div>'+
      '<div class="ind-map" role="group" aria-label="Mapa de indicadores: un bloque por indicador">'+K.map(function(k,i){return '<button type="button" class="ind-pip '+EV[evC(k)].c+'" data-i="'+i+'" aria-label="'+pad(i+1)+' '+esc(k.nombre)+' ('+EV[evC(k)].t+')" title="'+pad(i+1)+' · '+esc(k.nombre)+'"></button>'}).join('')+'</div>'+
      '<div class="ind-leg">Cada bloque es un indicador y su color es la clase de evidencia, no un puntaje. Pulsa uno para verlo.</div></div>';
    tabsEl.insertAdjacentHTML('beforebegin',hud);
    tabsEl.className='ind-tabs';tabsEl.removeAttribute('style');
    tabsEl.innerHTML=DIMS.map(function(d,i){return '<button type="button" class="ind-tab'+(i===0?' on':'')+'" data-d="'+d+'" aria-pressed="'+(i===0)+'">'+d+'</button>'}).join('')+'<span class="ind-ind" aria-hidden="true"></span>';

    /* fichas */
    box.className='ind-grid'+(anim?' ind-js':'');
    box.innerHTML=K.map(function(k,i){
      var e=evC(k),nm=k.valor==null,u=unidad(k);
      return '<button type="button" class="ind-card '+EV[e].c+(nm?' nm':'')+'" data-i="'+i+'" aria-pressed="false" style="--i:'+i+'">'+
        '<span class="ind-top"><span class="ind-dim">'+esc(k.dimension)+'</span><span class="ind-no">'+pad(i+1)+'</span></span>'+
        '<span class="ind-body">'+glyph(k)+'<span class="ind-val"><b class="ind-v">'+valK(k)+'</b>'+(u?'<small>'+esc(u)+'</small>':'')+'</span></span>'+
        '<span class="ind-nm">'+esc(k.nombre)+'</span><span class="ind-un">'+esc(k.universo)+'</span>'+
        '<span class="ind-chips"><span class="chip ind-evc">'+EV[e].t+'</span>'+(nm?'':prec(k.precision.split(' (')[0]))+'</span></button>'}).join('')+
      '<p class="ind-empty" hidden>Ningún indicador cumple ese filtro. Quita uno para ver más.</p>';
    var cards=[].slice.call(box.querySelectorAll('.ind-card')), pips=[].slice.call(document.querySelectorAll('.ind-pip')), empty=box.querySelector('.ind-empty');

    /* inspector */
    var main=document.createElement('div');main.className='ind-main';box.parentNode.insertBefore(main,box);main.appendChild(box);
    var insp=document.createElement('aside');insp.className='ind-insp';insp.setAttribute('aria-live','polite');insp.setAttribute('aria-label','Ficha del indicador seleccionado');main.appendChild(insp);
    function field(l,t){return '<div class="ind-f"><span class="ind-fl">'+l+'</span><div>'+t+'</div></div>'}
    function inspHtml(k,i){
      var e=evC(k),nm=k.valor==null,u=unidad(k);
      return '<div class="ind-ih"><span class="ind-ik">'+esc(k.dimension)+' · '+pad(i+1)+'/'+pad(K.length)+'</span><h3>'+esc(k.nombre)+'</h3></div>'+
        '<div class="ind-ib">'+glyph(k)+'<span class="ind-val"><b class="ind-v">'+valK(k)+'</b>'+(u?'<small>'+esc(u)+'</small>':'')+'</span></div>'+
        '<div class="ind-chips"><span class="chip ind-evc">'+EV[e].t+'</span>'+(nm?'':prec(k.precision.split(' (')[0]))+'</div>'+
        field('Definición',esc(k.definicion))+field('Universo',esc(k.universo))+field('Evidencia',esc(k.evidencia))+(nm?'':field('Precisión',esc(k.precision)))+
        field('Origen','<span title="'+esc(k.fuente)+'">'+orig(k.fuente)+'</span>')+
        '<div class="ind-nav"><img class="ind-guia" src="ilustraciones/guia_idea.webp" width="321" height="300" alt="" aria-hidden="true" onerror="this.remove()"><span class="ind-navb"><button type="button" class="ind-ar ind-fx" aria-label="Cómo se calcula este indicador" aria-expanded="false" title="Cómo se calcula">ƒ</button><button type="button" class="ind-ar" data-d="-1" aria-label="Indicador anterior">‹</button><button type="button" class="ind-ar" data-d="1" aria-label="Indicador siguiente">›</button></span></div>'}
    /* «Cómo se calcula» (23 oct 2026): caja temporal dentro de la ficha. Se cierra con ✕, Esc, un clic fuera o al cambiar de indicador. Ver indicadores-formulas.js */
    function fxHtml(k){
      var f=OBS.formula&&OBS.formula(k);
      if(!f)return '<div class="ind-fxh">Cómo se calcula</div><p>Este indicador todavía no tiene su operación documentada aquí.</p>';
      var mml=f.mm&&window.CSS&&CSS.supports&&CSS.supports('display','math');
      return '<div class="ind-fxh">Operación</div>'+(mml?'<math display="block" class="ind-mm" alttext="'+esc(f.op)+'">'+f.mm+'</math>':'<p>'+esc(f.op)+'</p>')+
        (f.datos?'<div class="ind-fxh">Con los datos</div><p class="ind-fxd">'+esc(f.datos)+'</p>':'')+
        '<div class="ind-fxh">Medida DAX en Power BI</div>'+(f.dax?'<code>'+esc(f.dax)+'</code><p class="ind-fxs">Esta medida no calcula el indicador: lee el valor que ya calculó el script en Python.</p>':'<p class="ind-fxs">Sin medida propia para este indicador en el modelo actual (revisado el 23 oct 2026 en PowerBI/generar_pbip.py).</p>')+
        (f.nota?'<div class="ind-fxh">Ojo</div><p class="ind-fxs">'+esc(f.nota)+'</p>':'')}
    var fxCierra=null;
    function cableaFx(k){
      var b=insp.querySelector('.ind-fx'),box=null,vel=null;if(!b)return;
      function cierra(){if(box){box.remove();box=null}if(vel){vel.remove();vel=null}b.setAttribute('aria-expanded','false');document.removeEventListener('keydown',tecla);fxCierra=null}
      function tecla(e){if(e.key==='Escape'){cierra();b.focus()}}
      b.addEventListener('click',function(){
        if(box){cierra();return}
        vel=document.createElement('div');vel.className='ind-fxv';vel.addEventListener('pointerdown',function(){cierra()});
        box=document.createElement('div');box.className='ind-fxp';box.setAttribute('role','dialog');box.setAttribute('aria-label','Cómo se calcula: '+k.nombre);
        box.innerHTML='<button type="button" class="ind-fxx" aria-label="Cerrar">✕</button><div class="ind-fxt">'+esc(k.nombre)+'</div>'+fxHtml(k);
        document.body.appendChild(vel);document.body.appendChild(box);b.setAttribute('aria-expanded','true');fxCierra=cierra;
        box.querySelector('.ind-fxx').addEventListener('click',function(){cierra();b.focus()});
        document.addEventListener('keydown',tecla)});
    }
    function visibles(){return cards.filter(function(c){return !c.hidden}).map(function(c){return +c.dataset.i})}
    function elige(i,desplaza){
      if(fxCierra)fxCierra();
      st.sel=i;
      cards.forEach(function(c){var on=+c.dataset.i===i;c.setAttribute('aria-pressed',on);c.classList.toggle('sel',on)});
      pips.forEach(function(p){p.classList.toggle('sel',+p.dataset.i===i)});
      insp.className='ind-insp '+EV[evC(K[i])].c; insp.innerHTML=inspHtml(K[i],i);
      cableaFx(K[i]);
      [].forEach.call(insp.querySelectorAll('.ind-ar[data-d]'),function(b){b.addEventListener('click',function(){var v=visibles(),j=v.indexOf(st.sel);if(!v.length)return;elige(v[(j+(+b.dataset.d)+v.length)%v.length])})});
      if(desplaza&&window.innerWidth<1100)insp.scrollIntoView({behavior:calma?'auto':'smooth',block:'start'});
    }

    /* filtros (dimensión × evidencia) con reacomodo animado */
    function ok(k){return (st.dim==='Todas'||k.dimension===st.dim)&&(!st.ev||evC(k)===st.ev)}
    function aplica(){
      var antes=new Map();cards.forEach(function(c){if(!c.hidden)antes.set(c,c.getBoundingClientRect())});
      var n=0;cards.forEach(function(c){var v=ok(K[+c.dataset.i]);c.hidden=!v;if(v)n++});
      $('#indN').textContent=n;empty.hidden=n>0;
      if(!calma)cards.forEach(function(c){if(c.hidden)return;var b=antes.get(c),a=c.getBoundingClientRect();
        if(b){var dx=b.left-a.left,dy=b.top-a.top;if(dx||dy)c.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}
        else c.animate([{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'none'}],{duration:320,easing:'ease-out'})});
      [].forEach.call(tabsEl.querySelectorAll('.ind-tab'),function(t){var on=t.dataset.d===st.dim;t.classList.toggle('on',on);t.setAttribute('aria-pressed',on)});
      [].forEach.call(document.querySelectorAll('.ind-evb'),function(b){b.setAttribute('aria-pressed',b.dataset.e===st.ev)});
      pips.forEach(function(p){p.classList.toggle('off',!ok(K[+p.dataset.i]))});
      colocaInd();
      var v=visibles();if(v.length&&v.indexOf(st.sel)<0)elige(v[0]);
    }
    [].forEach.call(tabsEl.querySelectorAll('.ind-tab'),function(t){t.addEventListener('click',function(){st.dim=t.dataset.d;aplica()})});
    [].forEach.call(document.querySelectorAll('.ind-evb'),function(b){b.addEventListener('click',function(){st.ev=st.ev===b.dataset.e?null:b.dataset.e;aplica()})});
    cards.forEach(function(c){c.addEventListener('click',function(){elige(+c.dataset.i,true)})});
    pips.forEach(function(p){p.addEventListener('click',function(){var i=+p.dataset.i;if(!ok(K[i])){st.dim='Todas';st.ev=null;aplica()}elige(i);cards[i].scrollIntoView({behavior:calma?'auto':'smooth',block:'nearest'})})});

    /* indicador deslizante de las pestañas (se mide cuando el bloque es visible) */
    var ind=tabsEl.querySelector('.ind-ind');
    function colocaInd(){var t=tabsEl.querySelector('.ind-tab.on');if(!t||!t.offsetWidth)return;ind.style.width=t.offsetWidth+'px';ind.style.transform='translateX('+t.offsetLeft+'px)'}
    if('ResizeObserver' in window)new ResizeObserver(colocaInd).observe(tabsEl);else window.addEventListener('resize',colocaInd);

    /* efecto de luz que sigue al cursor sobre las fichas */
    if(!calma&&window.matchMedia('(hover:hover)').matches)cards.forEach(function(c){c.addEventListener('pointermove',function(e){var b=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-b.left)/b.width*100).toFixed(0)+'%');c.style.setProperty('--my',((e.clientY-b.top)/b.height*100).toFixed(0)+'%')})});

    /* entrada: las fichas aparecen escalonadas, los anillos se trazan y las cifras cuentan hasta su valor */
    function cuenta(c){var k=K[+c.dataset.i],el=c.querySelector('.ind-v');if(k.valor==null)return;var t0=null;function paso(t){if(t0===null)t0=t;var p=Math.min((t-t0)/1000,1),e=1-Math.pow(1-p,3);el.textContent=p<1?valK({valor:k.valor*e,unidad:k.unidad}):valK(k);if(p<1)requestAnimationFrame(paso)}requestAnimationFrame(paso)}
    function entra(){cards.forEach(function(c){c.classList.add('in');if(!calma)cuenta(c)})}
    elige(0);aplica();
    if(anim){var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){io.disconnect();entra()}},{threshold:.1});io.observe(box)}
    else entra();
  }
})();
