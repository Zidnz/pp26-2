/* Observatorio del Cuidado · js/vistas/inicio-contadores.js
   Contadores de la portada. Va al final porque cuenta alcaldías (T, de territorio.js) y gráficas ya pintadas.
   Importa de OBS: $, $$, T
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,$$=OBS.$$,T=OBS.T;
  var nCharts=$$('[data-chart]').length;
  var ST=[[D.kpis.length,'indicadores con ficha'],[nCharts,'gráficas y mapas'],[D.inventario.length,'fuentes inventariadas'],[Object.keys(T).length,'alcaldías en la capa territorial']];
  $('#stats').innerHTML=ST.map(function(s){return '<div class="stat"><div class="v num">'+s[0]+'</div><div class="l">'+s[1]+'</div></div>'}).join('');
})();
