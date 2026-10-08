/* Observatorio del Cuidado · js/nucleo/alias.js
   Atajos a los bloques de D que usan varias pestañas (K, C, G, REL, R, OD, CT, P, M…) y sus búsquedas auxiliares.
   Importa de OBS: —
   Exporta a OBS:  C, CT, G, GL, K, M, OD, P, Q, R, REL, SN, car, des, gr, r40, r6, tm */
(function(){
  var K=D.clave, C=D.carga, G=K.grupo_problema, REL=D.relevo.filas, SAL0=REL[0].salario;
  function rel(sal,h){return REL.filter(function(r){return r.salario===sal&&r.horas===h})[0]}
  var r6=rel(SAL0,6), r40=rel(SAL0,40), r3=rel(SAL0,3);
  var R=D.razones, OD=D.oferta_declarada, CT=D.contratacion, P=D.pago;
  var des=R.todas.filter(function(e){return e.etiqueta==='No saben que existen'})[0];
  var car=R.obj.filter(function(e){return e.etiqueta==='Son caros'})[0];
  var tm=D.p711.filter(function(e){return e.etiqueta==='Tratan mal a las personas'})[0];
  function Q(q,t){return D.quintil.filter(function(r){return r.quintil===q&&r.servicio.indexOf(t)>-1})[0]}
  var M=D.modelo, GL={}; M.global.forEach(function(r){GL[r.puntaje]=r});
  var SN={}; M.sensibilidad.forEach(function(r){SN[r.puntaje]=r});
  function gr(dim,g,p){return M.grupos.filter(function(r){return r.dimension===dim&&r.grupo===g&&r.puntaje===p})[0]}
  OBS.C=C;OBS.CT=CT;OBS.G=G;OBS.GL=GL;OBS.K=K;OBS.M=M;OBS.OD=OD;OBS.P=P;OBS.Q=Q;
  OBS.R=R;OBS.REL=REL;OBS.SN=SN;OBS.car=car;OBS.des=des;OBS.gr=gr;OBS.r40=r40;
  OBS.r6=r6;OBS.tm=tm;
})();
