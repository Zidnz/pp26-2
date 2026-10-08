/* Observatorio del Cuidado · js/nucleo/filtro-segmento.js
   Estado del filtro de segmentación (F) y lectura de estimaciones del script 12 (SG, lv, segName). Lo comparten Necesidad, Barreras y Segmentación.
   Importa de OBS: —
   Exporta a OBS:  DIMS_S, F, RAZK, SG, lv, segName */
(function(){
  var SEGD=D.seg, F={dim:'Total',seg:'Total'};
  var DIMS_S=[];SEGD.forEach(function(r){if(DIMS_S.indexOf(r.dimension)<0)DIMS_S.push(r.dimension)});
  function lv(dim){var o=[];SEGD.forEach(function(r){if(r.dimension===dim&&o.indexOf(r.segmento)<0)o.push(r.segmento)});return o}
  function SG(k,dim,sg){dim=dim||F.dim;sg=sg||F.seg;return SEGD.filter(function(r){return r.dimension===dim&&r.segmento===sg&&r.clave===k})[0]}
  function segName(){return F.dim==='Total'?'Total nacional':F.dim+': '+F.seg.replace('>=','≥ ')}
  var RAZK=['raz_necesidad','raz_hogar','raz_familia','raz_lejania','raz_caros','raz_desconoce','raz_desconfianza','raz_maltrato'];
  OBS.DIMS_S=DIMS_S;OBS.F=F;OBS.RAZK=RAZK;OBS.SG=SG;OBS.lv=lv;
  OBS.segName=segName;
})();
