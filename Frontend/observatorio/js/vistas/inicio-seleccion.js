/* Observatorio del Cuidado · js/vistas/inicio-seleccion.js
   «¿Cuántas personas están en el problema?» como pantalla de selección de personaje (14 oct 2026).
   Reemplaza las cinco escenas 3D y las cinco tarjetas: un escenario grande con la figura de la etapa elegida,
   una ficha sin cajas (cifra que cuenta, barras de atributo y un campo de puntos) y una fila de cinco retratos para elegir.
   Todas las cifras salen de OBS.EMB (D.embudo, vía inicio.js); nada se escribe a mano.
   Las figuras son ilustración, no datos ni personas reales.
   11 nov 2026 · sin mapa (antes: superficie de México rellena en proporción; confundía porque no mide ubicación). El escenario y la ficha
   ocupan las dos columnas y el % de paso vive dentro de cada retrato y nombra su etapa de origen («58% de la etapa 04»).
   Se probaron dos variantes (a: esta; b: embudo de barras) y se eligió la a. Respaldo: _to_delete/backup_pre_variantes_embudo_2026-11-11/
   Teclado: ← → cambian de etapa. Con prefers-reduced-motion no hay giro, rebotes ni conteo animado.
   Importa de OBS: $, $$, EMB, G, ILU, esc, fmt, mill
   Exporta a OBS:  — */
(function(){
"use strict";
var $=OBS.$,$$=OBS.$$,esc=OBS.esc,fmt=OBS.fmt,mill=OBS.mill,EMB=OBS.EMB,IL=OBS.ILU,G=OBS.G;
var root=$('#sel-embudo'); if(!root||!EMB||!IL) return;
var E=EMB.E,EH=EMB.EH,N=E.length,T0=E[0].total;
var calma=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FIG=['familia','cuidadoraSilla','agotada','dobleJornada','oficina'];   // figura de cada etapa; la 5.ª tiene dorso: dolorHogar
var POS=['50% 18%','50% 20%','45% 22%','50% 18%','50% 20%'];              // encuadre del retrato en el selector
var pct=function(i){return 100*E[i].total/T0};
var pa=function(i){return i?100*E[i].total/E[i-1].total:100};
var Z=function(n){return n<10?'0'+n:''+n};

function figura(i){
  var f=function(k,c){return '<img class="'+c+'" src="'+IL[k].src+'" alt="" draggable="false">'};
  var acc='';
  if(i===2) acc='<span class="acc acc-reloj" aria-hidden="true"><b>40 h +</b></span>';
  if(i===3) acc='<span class="acc acc-globo" aria-hidden="true">«no tuve necesidad»</span>';
  if(i===4) return '<div class="fig fig-flip" data-i="4"><div class="flip"><div class="cara">'+f('oficina','art')+'</div><div class="cara dorso">'+f('dolorHogar','art')+'</div></div></div>';
  return '<div class="fig" data-i="'+i+'">'+f(FIG[i],'art')+acc+'</div>';
}
function ficha(i){
  var e=E[i], ultimo=i===N-1, t=EMB.ET[i];
  var barras='<div class="barra"><div class="bl"><span>Del total de personas que cuidan</span><b class="num">'+fmt(pct(i),i?1:0)+'%</b></div><div class="bt"><i style="--w:'+pct(i).toFixed(2)+'%"></i></div></div>';
  if(i) barras='<div class="barra"><div class="bl"><span>'+'De la etapa '+Z(i)+' · '+EH[i-1]+'</span><b class="num">'+fmt(pa(i),0)+'%</b></div><div class="bt"><i style="--w:'+pa(i).toFixed(2)+'%"></i></div></div>'+barras;
  var prec=ultimo?'<span class="chip p-moderada">precisión '+esc(G.precision)+'</span> <span class="chip p-noest">IC 90% '+fmt(G.li90)+'–'+fmt(G.ls90)+'% del universo</span>':
    '<span class="muted">Intervalo de confianza solo calculado para el grupo final.</span>';
  return '<div class="ficha" role="tabpanel" id="sel-p'+i+'" aria-labelledby="sel-t'+i+'" hidden>'+
    '<div class="f-k mono">ETAPA '+Z(i+1)+' / '+Z(N)+'</div>'+
    '<h3 class="f-h">'+EH[i]+'</h3>'+
    '<div class="f-n num'+(ultimo?' alto':'')+'" data-v="'+e.total+'">'+mill(e.total)+'</div>'+
    '<div class="f-u">personas de 15 años y más</div>'+
    '<div class="barras">'+barras+'</div>'+
    '<p class="f-p">'+esc(e.etapa)+'.</p>'+
    '<div class="f-prec">'+prec+'</div>'+
    '<div class="f-acc">'+(t?'<button type="button" class="sel-go" data-goto="'+t+'"'+(EMB.EA[i]?' data-ancla="'+EMB.EA[i]+'"':'')+'>'+(EMB.EB[i]||'Ver la pestaña →')+'</button>':'')+
    '<button type="button" class="sel-next" data-next>'+(ultimo?'Volver a la primera etapa ↺':'Siguiente etapa →')+'</button></div>'+
  '</div>';
}
function tile(i){
  return '<button type="button" role="tab" class="tile" id="sel-t'+i+'" aria-controls="sel-p'+i+'" aria-selected="false" tabindex="-1" data-i="'+i+'" style="--op:'+POS[i]+'">'+
    '<span class="t-in"><img src="'+IL[FIG[i]].src+'" alt="" draggable="false"><span class="t-n mono">'+Z(i+1)+'</span>'+
    '<span class="t-txt"><span class="t-h">'+EH[i]+'</span>'+(i?'<span class="t-v"><b>'+fmt(pa(i),0)+'%</b><span> de la etapa '+Z(i)+'</span></span>':'')+'</span>'   /* 3 nov 2026: sin la cifra; ya está en la ficha de la etapa */+
    '<span class="t-m"><i style="--w:'+Math.max(2,pct(i)).toFixed(1)+'%"></i></span></span></button>';
}

root.innerHTML=
  '<div class="arena" id="sel-arena">'+
    '<div class="stage"><div class="spot"></div><div class="ghost num" aria-hidden="true"></div>'+
      '<div class="figs">'+E.map(function(_,i){return figura(i)}).join('')+'</div>'+
      '<div class="piso" aria-hidden="true"></div><div class="lado mono" id="sel-lado" aria-hidden="true"></div></div>'+
    '<div class="hoja"><div class="paneles">'+E.map(function(_,i){return ficha(i)}).join('')+'</div></div>'+
  '</div>'+
  '<div class="roster" role="tablist" aria-label="Etapas del embudo" aria-orientation="horizontal">'+E.map(function(_,i){return tile(i)}).join('')+'</div>'+
  '<p class="sel-hint mono" aria-hidden="true">Elige una etapa · ← →</p>';

var tiles=$$('#sel-embudo .tile'), fichas=$$('#sel-embudo .ficha'), figs=$$('#sel-embudo .fig'), ghost=$('#sel-embudo .ghost'),
    lado=$('#sel-lado'), arena=$('#sel-arena');
var act=-1, prevN=T0, flipT=null;

// ---------- cifra que cuenta ----------
function cuenta(el,de,a){ if(calma){ el.textContent=mill(a); return; } var t0=performance.now(), D=650; el.dataset.run=''+t0;
  (function paso(t){ var u=Math.min(1,(t-t0)/D), e=1-Math.pow(1-u,3); el.textContent=mill(de+(a-de)*e); if(u<1&&el.dataset.run===''+t0) requestAnimationFrame(paso); })(t0); }

// ---------- selección ----------
function elige(i,enfoca){ i=(i+N)%N; if(i===act) return; var ant=act; act=i;
  tiles.forEach(function(b,k){ var on=k===i; b.setAttribute('aria-selected',on); b.tabIndex=on?0:-1; b.classList.toggle('on',on); b.classList.toggle('pasada',k<i); });
  fichas.forEach(function(f,k){ f.hidden=k!==i; });
  figs.forEach(function(f,k){ f.style.setProperty('--d',k-i); f.classList.toggle('on',k===i); });
  arena.dataset.etapa=i; arena.classList.toggle('alto',i===N-1);
  ghost.textContent='';   // 3 nov 2026: el número grande repetía la ficha de la etapa
  var n=fichas[i].querySelector('.f-n'); cuenta(n,ant<0?E[i].total:E[ant].total,E[i].total);
  fichas[i].querySelectorAll('.bt i').forEach(function(b){ b.style.animation='none'; void b.offsetWidth; b.style.animation=''; });
  clearInterval(flipT); var fl=figs[4].querySelector('.flip'); fl.classList.remove('vuelta'); lado.textContent='';
  if(i===4){ lado.textContent='DAÑO EN EL TRABAJO'; if(!calma) flipT=setInterval(function(){ var v=fl.classList.toggle('vuelta'); lado.textContent=v?'DAÑO A LA SALUD':'DAÑO EN EL TRABAJO'; },3800); }
  if(enfoca) tiles[i].focus();
}
tiles.forEach(function(b,i){ b.addEventListener('click',function(){ elige(i); });
  b.addEventListener('keydown',function(e){ var d=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:(e.key==='ArrowLeft'||e.key==='ArrowUp')?-1:0; if(e.key==='Home') d=-N; if(e.key==='End') d=N; if(!d) return; e.preventDefault(); elige(Math.max(0,Math.min(N-1,i+d)),true); }); });
root.addEventListener('click',function(e){ if(e.target.closest('[data-next]')) elige(act+1); });
// los botones data-goto se crean aquí, después de que pestanas.js enlazó los suyos: se enlazan a mano con el mismo efecto
(function(){ var tabs=$$('.tabs button'); root.querySelectorAll('.sel-go').forEach(function(b){ b.addEventListener('click',function(){
  var t=tabs.filter(function(x){return x.dataset.t===b.dataset.goto})[0]; if(t) t.click();
  var id=b.dataset.ancla; if(id) setTimeout(function(){ var el=document.getElementById(id); if(!el) return; var c=el.closest('.card')||el;
    c.scrollIntoView({block:'center',behavior:calma?'auto':'smooth'}); c.classList.remove('ancla-on'); void c.offsetWidth; c.classList.add('ancla-on'); },60); }); }); })();

// ---------- inclinación hacia el cursor ----------
if(!calma){ arena.addEventListener('pointermove',function(e){ var r=arena.getBoundingClientRect(), x=((e.clientX-r.left)/r.width-.5), y=((e.clientY-r.top)/r.height-.5);
    arena.style.setProperty('--ry',(x*16).toFixed(2)+'deg'); arena.style.setProperty('--rx',(-y*7).toFixed(2)+'deg'); arena.style.setProperty('--px',(x*-26).toFixed(1)+'px'); arena.style.setProperty('--py',(y*-12).toFixed(1)+'px'); });
  arena.addEventListener('pointerleave',function(){ ['--ry','--rx','--px','--py'].forEach(function(p){ arena.style.setProperty(p,'0'); }); }); }

// Cabe en una pantalla: la altura del escenario es lo que sobra de la ventana después del encabezado, los retratos, el modelo y la fuente.
var fr=$('#fr-embudo');
function ajusta(){ var ancho=root.getBoundingClientRect().width;
  if(ancho<900){ root.style.removeProperty('--ah'); return; }
  // con zoom de CSS (pantallas anchas) las medidas del navegador y los px de CSS difieren: z es ese factor
  var ah=arena.getBoundingClientRect().height, z=ah/(parseFloat(getComputedStyle(arena).height)||ah)||1,
      resto=fr.getBoundingClientRect().height-ah, libre=(window.innerHeight-resto-14)/z;
  root.style.setProperty('--ah',Math.round(Math.max(270,Math.min(640,libre)))+'px'); }
function ajusta2(){ ajusta(); requestAnimationFrame(ajusta); }
window.addEventListener('resize',ajusta2); window.addEventListener('load',ajusta2);
elige(0); ajusta2(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(ajusta2);
})();
