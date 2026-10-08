/* Observatorio del Cuidado · js/app/plegables.js
   Pasa la guía de cada pestaña a un bloque plegable. Debe correr después de pintar todas las vistas.
   La advertencia «Poder pagar no es querer contratar» (#relNo) queda visible desde el 7 oct 2026 (noche).
   Importa de OBS: $, $$
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,$$=OBS.$$;
  /* Las fichas de las tarjetas ya no son plegables: las convierte en recorrido js/app/coachmark.js (7 oct 2026, noche). */
  $$('.vhead').forEach(function(v){var p=v.querySelector(':scope > p');if(!p)return;var d=document.createElement('details');d.className='src';d.innerHTML='<summary>Cómo leer esta pestaña</summary>';p.style.margin='4px 0 0';d.appendChild(p);v.appendChild(d)});
  (function(){var d=$('#src-relevo').parentNode;d.appendChild($('#relIng'))})();
})();
