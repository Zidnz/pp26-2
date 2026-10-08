/* Observatorio del Cuidado · js/vistas/metodo.js
   Pestaña Método: inventario, pares oferta–necesidad, fichas, calidad, variables y diccionario.
   Importa de OBS: $, esc
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,esc=OBS.esc;
  $('#tinv tbody').innerHTML=D.inventario.map(function(r){return '<tr><td class="mono">'+esc(r.id)+'</td><td style="min-width:240px"><b>'+esc(r.fuente)+'</b></td><td style="min-width:140px">'+esc(r.emisor)+'</td><td style="min-width:140px">'+esc(r.desagregacion_geografica_maxima)+'</td><td style="min-width:110px">'+esc(r.periodo_cubierto)+'</td><td style="min-width:160px">'+esc(r.estado_evidencia)+'</td></tr>'}).join('');
  $('#tpares tbody').innerHTML=D.pares.map(function(p){return '<tr><td>'+esc(p.id_oferta)+'</td><td>'+esc(p.id_necesidad)+'</td><td>'+esc(p.poblacion_compatible)+'</td><td>'+esc(p.territorio_compatible)+'</td><td>'+esc(p.unidad_compatible)+'</td><td>'+esc(p.periodo_compatible)+'</td><td><b>'+esc(p.decision)+'</b><div class="muted" style="font-size:11.5px">'+esc(p.motivo)+'</div></td></tr>'}).join('');
  $('#tfichas tbody').innerHTML=D.fichas.map(function(f){return '<tr><td><b>'+esc(f.archivo)+'</b></td><td>'+esc(f.unidad_observacion)+'</td><td>'+esc(f.medida)+'</td><td>'+esc(f.anio)+'</td><td>'+esc(f.productor)+'</td></tr>'}).join('');
  $('#calidad').innerHTML=D.calidad_datos.map(function(c){return '<li><b>'+esc(c.archivo)+':</b> '+esc(c.chequeo)+' = '+esc(c.valor)+'. '+esc(c.nota)+'.</li>'}).join('');
  var VARS=[['Horas de cuidado','Horas semanales (tope 168)','P6.7 + P6.26'],['Actividades básicas','Comer, vestir, pañales, bañar, acostar','P6.2.01–04, 08'],['Tareas clínicas','Medicamentos, curaciones, terapia, tratamientos','P6.2.10–13'],['Cuida discapacidad','Frente a solo 60+','FILTRO6.1'],['Cuida menores','Además a menores de 18','FILTRO6.2–6.3'],['Años cuidando','Solo bloque de discapacidad','P6.6.1'],['Capacitación','Recibió capacitación','P6.3 / P6.23'],['Apoyo de la familia','Apoyo económico','P6.8 / P6.27'],['Requiere apoyo','Necesita que otra persona le ayude','P6.9.4 / P6.28.4'],['Falta de fuerza','Le falta fuerza física','P6.9.1 / P6.28.1'],['Sexo, edad, escolaridad','Datos de registro','SEXO, EDAD, NIVEL'],['Quintil de ingreso','Mismos cortes que el script 04','THOGAR P3A.4–P3A.5']];
  $('#tvars tbody').innerHTML=VARS.map(function(v){return '<tr><td><b>'+v[0]+'</b></td><td>'+v[1]+'</td><td class="mono" style="font-size:11.5px">'+v[2]+'</td></tr>'}).join('');

  $('#tdic tbody').innerHTML=D.diccionario.map(function(v){return '<tr><td class="mono" style="font-size:11.5px;white-space:nowrap"><b>'+esc(v.nombre)+'</b></td><td style="min-width:300px">'+esc(v.definicion)+'</td><td class="mono" style="font-size:11px">'+esc(v.origen)+'</td></tr>'}).join('');
  $('#dicLink').textContent=D.diccionario_fuente; $('#dicLink').href='../../'+D.diccionario_fuente;
})();
