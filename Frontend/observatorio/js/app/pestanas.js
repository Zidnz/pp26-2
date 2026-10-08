/* Observatorio del Cuidado · js/app/pestanas.js
   Navegación por pestañas de la barra lateral (teclado: flechas arriba/abajo o izquierda/derecha; hash de la URL; enlaces data-goto) y arranque.
   Importa de OBS: $, $$
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,$$=OBS.$$;
  var TABS=$$('.tabs button').map(function(b){return b.dataset.t});
  function show(t){if(TABS.indexOf(t)<0)t='inicio';
    $$('.tabs button').forEach(function(b){var on=b.dataset.t===t;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;
      if(on&&b.parentNode.scrollWidth>b.parentNode.clientWidth)b.parentNode.scrollLeft=b.offsetLeft-b.parentNode.clientWidth/2+b.offsetWidth/2});
    $$('.view').forEach(function(v){v.classList.toggle('on',v.id==='v-'+t)});
    if(location.hash!=='#'+t)history.replaceState(null,'','#'+t);
    window.scrollTo(0,0);}
  $$('.tabs button').forEach(function(b,i){b.addEventListener('click',function(){show(b.dataset.t)});
    b.addEventListener('keydown',function(e){var k=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:(e.key==='ArrowLeft'||e.key==='ArrowUp')?-1:0;if(k)e.preventDefault();if(k){var n=$$('.tabs button')[(i+k+TABS.length)%TABS.length];n.focus();show(n.dataset.t)}})});
  $$('[data-goto]').forEach(function(b){b.addEventListener('click',function(){show(b.dataset.goto)})});
  $('.brand').addEventListener('click',function(e){e.preventDefault();show('inicio')});
  window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
  show(location.hash.slice(1)||'inicio');
})();
