/* Observatorio del Cuidado · js/nucleo/filtro-segmento.js
   Estado del filtro de segmentación (F) y lectura de estimaciones del script 12 (SG, lv, segName). Lo comparten Necesidad, Barreras y Segmentación.
   Importa de OBS: —
   Exporta a OBS:  DIMS_S, F, RAZK, SG, S2, S2L, lv, segName, alSeg, filtroAplica
   14 oct 2026: S2 lee las series completas por segmento (D.seg2, sección 12b) para que el filtro aplique a toda la pestaña.
   Cada vista registra en OBS.alSeg la función que redibuja sus gráficas; segmentacion.js las llama al cambiar el filtro. */
(function(){
  var SEGD=D.seg, F={dim:'Total',seg:'Total'};
  var DIMS_S=[];SEGD.forEach(function(r){if(DIMS_S.indexOf(r.dimension)<0)DIMS_S.push(r.dimension)});
  function lv(dim){var o=[];SEGD.forEach(function(r){if(r.dimension===dim&&o.indexOf(r.segmento)<0)o.push(r.segmento)});return o}
  function SG(k,dim,sg){dim=dim||F.dim;sg=sg||F.seg;return SEGD.filter(function(r){return r.dimension===dim&&r.segmento===sg&&r.clave===k})[0]}
  function segName(){return F.dim==='Total'?'Total nacional':F.dim+': '+F.seg.replace('>=','≥ ')}
  var RAZK=['raz_necesidad','raz_hogar','raz_familia','raz_lejania','raz_caros','raz_desconoce','raz_desconfianza','raz_maltrato'];
  OBS.DIMS_S=DIMS_S;OBS.F=F;OBS.RAZK=RAZK;OBS.SG=SG;OBS.lv=lv;
  OBS.segName=segName;
  var S2D=D.seg2||[];
  // Una fila de la serie para el filtro actual (o para dim/sg explícitos)
  function S2(serie,cat,dim,sg){dim=dim||F.dim;sg=sg||F.seg;return S2D.filter(function(r){return r.dimension===dim&&r.segmento===sg&&r.serie===serie&&r.categoria===cat})[0]}
  // Todas las filas de una serie, en el orden del archivo
  function S2L(serie,dim,sg){dim=dim||F.dim;sg=sg||F.seg;return S2D.filter(function(r){return r.dimension===dim&&r.segmento===sg&&r.serie===serie})}
  // ¿Esta gráfica cambia con el filtro actual? 'no' = otro universo; 'horas' = cortada por horas (no aplica con Intensidad)
  function filtroAplica(tipo){return F.dim==='Total'?false:tipo==='si'?true:tipo==='horas'?F.dim!=='Intensidad':false}
  OBS.S2=S2;OBS.S2L=S2L;OBS.alSeg=[];OBS.filtroAplica=filtroAplica;
})();
