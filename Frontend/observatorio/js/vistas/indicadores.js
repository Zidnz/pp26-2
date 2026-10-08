/* Observatorio del Cuidado · js/vistas/indicadores.js
   Pestaña Indicadores: tarjetas filtrables y tabla completa.
   Importa de OBS: $, ent, esc, fmt, prec, seg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,ent=OBS.ent,esc=OBS.esc,fmt=OBS.fmt,prec=OBS.prec,seg=OBS.seg;
  var DIMS=['Todas'];D.kpis.forEach(function(k){if(DIMS.indexOf(k.dimension)<0)DIMS.push(k.dimension)});
  $('#segKpi').innerHTML=DIMS.map(function(d,i){return '<button data-d="'+d+'" aria-pressed="'+(i===0)+'">'+d+'</button>'}).join('');
  function valK(k){if(k.valor==null)return 'No medible';var u=k.unidad;return u.indexOf('%')===0?fmt(k.valor)+'%':u==='$ por hora'?'$'+fmt(k.valor,2):u==='veces'?fmt(k.valor,2)+'×':ent(k.valor)}
  function renderKpi(d){
    var L=D.kpis.filter(function(k){return d==='Todas'||k.dimension===d});
    $('#kpiTiles').innerHTML=L.map(function(k){var nm=k.valor==null;return '<div class="card tile"'+(nm?' style="border-style:dashed"':'')+'><div class="kicker" style="margin:0">'+k.dimension+'</div><div class="big num" style="font-size:'+(nm?'20px;color:var(--alert)':'30px')+'">'+valK(k)+'</div><div class="lbl"><b style="color:var(--ink)">'+esc(k.nombre)+'</b><br>'+esc(k.universo)+'</div><div class="chips">'+(nm?'':prec(k.precision.split(' (')[0]))+'<span class="chip ev">'+esc(k.evidencia.split(/[ :(]/)[0])+'</span></div></div>'}).join('');
  }
  seg('#segKpi','d',renderKpi); renderKpi('Todas');
  $('#tkpi tbody').innerHTML=D.kpis.map(function(k,i){return '<tr><td class="n">'+(i+1)+'</td><td>'+k.dimension+'</td><td><b>'+esc(k.nombre)+'</b></td><td style="min-width:220px">'+esc(k.definicion)+'</td><td style="min-width:150px">'+esc(k.universo)+'</td><td style="min-width:150px">'+esc(k.evidencia)+'</td><td class="mono muted" style="font-size:10.5px;min-width:180px;word-break:break-all">'+esc(k.fuente)+'</td></tr>'}).join('');
})();
