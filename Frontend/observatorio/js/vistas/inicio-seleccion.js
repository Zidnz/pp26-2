/* Observatorio del Cuidado · js/vistas/inicio-seleccion.js
   «¿Cuántas personas están en el problema?» como pantalla de selección de personaje (14 oct 2026).
   Reemplaza las cinco escenas 3D y las cinco tarjetas: un escenario grande con la figura de la etapa elegida,
   una ficha sin cajas (cifra que cuenta, barras de atributo y un campo de puntos) y una fila de cinco retratos para elegir.
   Todas las cifras salen de OBS.EMB (D.embudo, vía inicio.js); nada se escribe a mano.
   Las figuras son ilustración, no datos ni personas reales. Mapa (15 oct 2026): reemplaza el campo de 500 puntos; la superficie rellena de México = % de la etapa (contornos de GEO_EST). Mide proporción, no ubicación.
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
  if(i) barras='<div class="barra"><div class="bl"><span>De la etapa anterior</span><b class="num">'+fmt(pa(i),0)+'%</b></div><div class="bt"><i style="--w:'+pa(i).toFixed(2)+'%"></i></div></div>'+barras;
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
  return (i?'<span class="flujo" aria-hidden="true"><b class="num">'+fmt(pa(i),0)+'%</b></span>':'')+
  '<button type="button" role="tab" class="tile" id="sel-t'+i+'" aria-controls="sel-p'+i+'" aria-selected="false" tabindex="-1" data-i="'+i+'" style="--op:'+POS[i]+'">'+
    '<span class="t-in"><img src="'+IL[FIG[i]].src+'" alt="" draggable="false"><span class="t-n mono">'+Z(i+1)+'</span>'+
    '<span class="t-txt"><span class="t-h">'+EH[i]+'</span><span class="t-v num">'+mill(E[i].total)+'</span></span>'+
    '<span class="t-m"><i style="--w:'+Math.max(2,pct(i)).toFixed(1)+'%"></i></span></span></button>';
}

root.innerHTML=
  '<div class="arena" id="sel-arena">'+
    '<div class="stage"><div class="spot"></div><div class="ghost num" aria-hidden="true"></div>'+
      '<div class="figs">'+E.map(function(_,i){return figura(i)}).join('')+'</div>'+
      '<div class="piso" aria-hidden="true"></div><div class="lado mono" id="sel-lado" aria-hidden="true"></div></div>'+
    '<div class="hoja"><div class="paneles">'+E.map(function(_,i){return ficha(i)}).join('')+'</div></div>'+
    '<div class="pts"><canvas id="sel-pts" aria-label="Mapa de México relleno en proporción: la superficie rellena representa a las personas de la etapa elegida; no indica ubicación" role="img"></canvas>'+
      '<div class="pts-l mono"><span><i class="on"></i> la etapa</span><span><i class="fuera"></i> fuera de la etapa anterior</span><span>Superficie rellena = % del total · mide proporción, no ubicación (la ENASIC no permite desagregar por entidad)</span></div></div>'+
  '</div>'+
  '<div class="roster" role="tablist" aria-label="Etapas del embudo" aria-orientation="horizontal">'+E.map(function(_,i){return tile(i)}).join('')+'</div>'+
  '<p class="sel-hint mono" aria-hidden="true">Elige una etapa · ← →</p>';

var tiles=$$('#sel-embudo .tile'), fichas=$$('#sel-embudo .ficha'), figs=$$('#sel-embudo .fig'), ghost=$('#sel-embudo .ghost'),
    lado=$('#sel-lado'), arena=$('#sel-arena'), cv=$('#sel-pts'), cx=cv.getContext('2d');
var act=-1, prevN=T0, flipT=null;

// ---------- mapa de México que se llena ----------
// El relleno mide SUPERFICIE del contorno (no altura): el nivel se calcula para que el área rellena sea igual al % de la etapa.
// Mide proporción, no ubicación: la ENASIC no permite desagregar por entidad, así que el mapa no dice dónde viven esas personas.
var PATHS=[], SIL=null, COV=null, COVT=0, RES=2, BB=null, FIT={s:1,ox:0,oy:0}, W=0,H=0,DPR=1,raf=0;
var LV={a:0,t:0,p:0,tp:0,c:0,tc:0};          // a = fracción rellena; p = fracción de la etapa anterior; c = 0 normal / 1 alerta
var COLR={on:[119,104,157],al:[192,67,90],fuera:[170,149,209],off:[43,48,69]};
function prepara(){ if(COV||!window.GEO_EST||!GEO_EST.entidades) return !!COV;
  var vb=GEO_EST.viewBox.split(' ').map(Number), w=vb[2], h=vb[3];
  PATHS=Object.keys(GEO_EST.entidades).map(function(c){ return new Path2D(GEO_EST.entidades[c].path); });
  SIL=new Path2D(); PATHS.forEach(function(p){ SIL.addPath(p); });
  var oc=document.createElement('canvas'); oc.width=w*RES; oc.height=h*RES; var o=oc.getContext('2d'); o.scale(RES,RES); o.fillStyle='#000'; o.fill(SIL);
  var px=o.getImageData(0,0,oc.width,oc.height).data, x0=1e9,x1=-1,y0=1e9,y1=-1; COV=new Array(oc.height); COVT=0;
  for(var y=0;y<oc.height;y++){ var n=0; for(var x=0;x<oc.width;x++){ if(px[(y*oc.width+x)*4+3]>40){ n++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } } COV[y]=n; COVT+=n; }
  BB={x:x0/RES,y:y0/RES,w:(x1-x0+1)/RES,h:(y1-y0+1)/RES};
  cv.style.aspectRatio=(BB.w/BB.h).toFixed(3); return true; }
// y (en unidades del viewBox) por debajo de la cual queda la fracción f de la superficie, contando desde el sur
function yDe(f){ var meta=Math.max(0,Math.min(1,f))*COVT, acc=0, y=COV.length-1;
  for(;y>=0;y--){ if(acc+COV[y]>=meta) break; acc+=COV[y]; }
  if(y<0) return BB.y; var fr=COV[y]?(meta-acc)/COV[y]:0; return (y+1-fr)/RES; }
function medir(){ DPR=Math.min(2,window.devicePixelRatio||1); var r=cv.getBoundingClientRect(); W=r.width; H=r.height; cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  if(prepara()){ var p=6, s=Math.min((W-2*p)/BB.w,(H-2*p)/BB.h); FIT={s:s,ox:(W-BB.w*s)/2-BB.x*s,oy:(H-BB.h*s)/2-BB.y*s}; } pinta(); }
function pinta(){ cx.setTransform(DPR,0,0,DPR,0,0); cx.clearRect(0,0,W,H); if(!W||!COV) return;
  var yA=yDe(LV.a), yP=yDe(Math.max(LV.p,LV.a)), x=BB.x-6, ww=BB.w+12, yb=BB.y+BB.h+6;
  cx.save(); cx.translate(FIT.ox,FIT.oy); cx.scale(FIT.s,FIT.s);
  cx.fillStyle='rgba('+COLR.off+',.09)'; cx.fill(SIL);                                       // mapa vacío
  cx.save(); cx.clip(SIL);
  if(yA-yP<-.01 || LV.p>LV.a+.002){ cx.fillStyle='rgba('+COLR.fuera+',.38)'; cx.fillRect(x,yP,ww,yA-yP); }   // personas de la etapa anterior que quedaron fuera
  var cc=LV.c, col=[0,1,2].map(function(q){return Math.round(COLR.on[q]+(COLR.al[q]-COLR.on[q])*cc)});
  cx.fillStyle='rgb('+col+')'; cx.fillRect(x,yA,ww,yb-yA);                                    // personas de la etapa
  cx.restore();
  cx.lineWidth=.7; cx.strokeStyle='rgba(255,255,255,.7)'; cx.lineJoin='round'; PATHS.forEach(function(p){ cx.stroke(p); });  // límites de entidad
  cx.restore();
  if(act>=0){ var ty=Math.max(13,FIT.oy+yA*FIT.s-5); cx.font='700 11px "JetBrains Mono",monospace'; cx.textAlign='right';
    cx.fillStyle='rgb('+col+')'; cx.fillText(fmt(pct(act),act?1:0)+'%',W-2,ty); } }
function anima(){ var vivo=false;
  [['a','t'],['p','tp'],['c','tc']].forEach(function(k){ var d=LV[k[1]]-LV[k[0]]; if(Math.abs(d)>.002){ LV[k[0]]+=d*.16; vivo=true; } else LV[k[0]]=LV[k[1]]; });
  pinta(); raf=vivo?requestAnimationFrame(anima):0; }
function fijaMapa(i,ant){ LV.t=E[i].total/T0; LV.tp=i?E[i-1].total/T0:LV.t; LV.tc=i===N-1?1:0;
  if(ant<0||calma){ LV.a=LV.t; LV.p=LV.tp; LV.c=LV.tc; pinta(); return; }
  if(!raf) raf=requestAnimationFrame(anima); }

// ---------- cifra que cuenta ----------
function cuenta(el,de,a){ if(calma){ el.textContent=mill(a); return; } var t0=performance.now(), D=650; el.dataset.run=''+t0;
  (function paso(t){ var u=Math.min(1,(t-t0)/D), e=1-Math.pow(1-u,3); el.textContent=mill(de+(a-de)*e); if(u<1&&el.dataset.run===''+t0) requestAnimationFrame(paso); })(t0); }

// ---------- selección ----------
function elige(i,enfoca){ i=(i+N)%N; if(i===act) return; var ant=act; act=i;
  tiles.forEach(function(b,k){ var on=k===i; b.setAttribute('aria-selected',on); b.tabIndex=on?0:-1; b.classList.toggle('on',on); b.classList.toggle('pasada',k<i); });
  root.querySelectorAll('.flujo').forEach(function(f,k){ f.classList.toggle('on',k+1<=i); });
  fichas.forEach(function(f,k){ f.hidden=k!==i; });
  figs.forEach(function(f,k){ f.style.setProperty('--d',k-i); f.classList.toggle('on',k===i); });
  arena.dataset.etapa=i; arena.classList.toggle('alto',i===N-1);
  ghost.textContent=mill(E[i].total);
  var n=fichas[i].querySelector('.f-n'); cuenta(n,ant<0?E[i].total:E[ant].total,E[i].total);
  fichas[i].querySelectorAll('.bt i').forEach(function(b){ b.style.animation='none'; void b.offsetWidth; b.style.animation=''; });
  fijaMapa(i,ant);
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
function ajusta2(){ ajusta(); requestAnimationFrame(function(){ ajusta(); medir(); }); }
window.addEventListener('resize',ajusta2); window.addEventListener('load',ajusta2);
if('ResizeObserver' in window) new ResizeObserver(medir).observe(cv); else window.addEventListener('resize',medir);
elige(0); ajusta2(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(ajusta2);
})();
