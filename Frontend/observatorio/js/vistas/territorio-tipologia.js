/* Observatorio del Cuidado · js/vistas/territorio-tipologia.js
   Pestaña «¿Dónde?», tercera parte: tipología de AGEB urbanas (segundo modelo, notebook D, sección 18).
   Mapa de AGEB con cuatro capas (tipo, brecha de oferta, sin internet, personas de 60+), perfil del tipo elegido,
   tres gráficas para la decisión del piloto, brechas por alcaldía y validación del modelo. Todo sale de D.tipologia
   y GEO_AGEB (build_datos.py); ninguna cifra está escrita a mano.
   Importa de OBS: $, $$, FAINT, MONO, dl, ent, esc, fmt, seg, svg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,$$=OBS.$$,FAINT=OBS.FAINT,MONO=OBS.MONO,dl=OBS.dl,ent=OBS.ent,esc=OBS.esc,fmt=OBS.fmt,seg=OBS.seg,svg=OBS.svg;
  var TP=D.tipologia,CAMPOS=TP.campos_ageb,INK='#2b3045';
  /* Colores de los tipos: los mismos de las figuras f11–f14 del notebook D (paleta categórica validada, orden fijo). */
  var TC={1:'#2a78d6',2:'#eb6834',3:'#1baf7a',4:'#eda100'},SEQ=['#efeaf7','#d3c8e8','#b09fd3','#8a76b8','#5d4d8f'],GRIS='#e4e1ea';
  var TIPOS={};TP.tipos.forEach(function(t){TIPOS[t.tipo]=t});
  var DEC={};TP.decision.forEach(function(t){DEC[t.tipo]=t});
  var AG=TP.ageb.map(function(r){var o={};CAMPOS.forEach(function(c,i){o[c]=r[i]});return o});
  var POR={};AG.forEach(function(a){POR[a.cvegeo]=a});
  var capa='tipo',selTipo=null,selAgeb=null;
  function nom(t){return t+'. '+TIPOS[t].nombre}
  function quint(v){var s=v.slice().sort(function(a,b){return a-b}),q=[];for(var i=1;i<5;i++)q.push(s[Math.round(i*s.length/5)-1]);return q}
  function claseQ(v,q){var i=0;while(i<4&&v>q[i])i++;return i}
  var Q_INT=quint(AG.map(function(a){return a.pct_sin_int})),Q_60=quint(AG.map(function(a){return a.n_60}));
  var CAPA={
    tipo:{t:'Tipo de zona',d:'Cada AGEB urbana pertenece a uno de cuatro tipos según 9 indicadores del Censo 2020 (demanda de cuidado, quién puede cuidar en el hogar, capacidad de pago y acceso). Clic en un tipo para resaltarlo.',
      col:function(a){return TC[a.tipo]}},
    brecha:{t:'Brecha de oferta',d:'AGEB en el cuartil alto de personas de 60+ y en el cuartil alto de distancia en línea recta a una residencia o centro de día (puntos). Exploratorio: no mide capacidad, precio ni transporte.',
      col:function(a){return a.brecha?TC[a.tipo]:GRIS}},
    sin_int:{t:'Viviendas sin internet',d:'% de las viviendas de la AGEB sin internet. La app de dos perfiles supone conexión en casa.',
      col:function(a){return SEQ[claseQ(a.pct_sin_int,Q_INT)]},q:Q_INT,u:'%'},
    p60:{t:'Personas de 60 años y más',d:'Número de personas de 60+ en la AGEB (conteo, no porcentaje): el piloto atiende personas.',
      col:function(a){return SEQ[claseQ(a.n_60,Q_60)]},q:Q_60,u:''}
  };

  /* ---------- Mapa: se dibuja una vez; al cambiar de capa o de tipo solo se repintan los rellenos ---------- */
  function dibujaMapa(){
    var s='<svg viewBox="'+GEO_AGEB.viewBox+'" role="img" aria-label="Mapa de AGEB urbanas de la CDMX por tipo de zona" style="width:100%;height:auto;display:block">';
    s+='<g class="ag">';
    AG.forEach(function(a){s+='<path d="'+GEO_AGEB.ageb[a.cvegeo]+'" data-g="'+a.cvegeo+'"><title>'+esc(a.alcaldia)+' · AGEB '+a.cvegeo.slice(-4)+'\n'+esc(nom(a.tipo))+(a.frontera?' (frontera con otro tipo)':'')+'\n'+ent(a.n_60)+' personas de 60+ ('+fmt(a.pct_60)+'%) · '+fmt(a.pct_sin_int)+'% de viviendas sin internet\nOferta núcleo más cercana: '+fmt(a.dist_oferta_km,2)+' km</title></path>'});
    s+='</g><g class="alc">';
    Object.keys(GEO_AGEB.alcaldias).forEach(function(k){s+='<path d="'+GEO_AGEB.alcaldias[k]+'"><title>'+esc(k)+'</title></path>'});
    s+='</g><g class="of" style="display:none">';
    GEO_AGEB.oferta.forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.4"/>'});
    $('#mapTipo').innerHTML=s+'</g></svg>';
    $$('#mapTipo g.ag path').forEach(function(p){p.addEventListener('click',function(){selAgeb=p.dataset.g;selTipo=POR[selAgeb].tipo;pinta();perfil()})});
  }
  function pinta(){
    var c=CAPA[capa];
    $$('#mapTipo g.ag path').forEach(function(p){var a=POR[p.dataset.g];p.setAttribute('fill',c.col(a));
      p.setAttribute('opacity',selTipo&&capa!=='brecha'&&a.tipo!==selTipo?.18:1);p.classList.toggle('sel',p.dataset.g===selAgeb)});
    $('#mapTipo g.of').style.display=capa==='brecha'?'':'none';
    $('#tipoDef').textContent=c.d;
    var lg='';
    if(capa==='tipo'||capa==='brecha'){lg=TP.tipos.map(function(t){return '<span><i style="background:'+TC[t.tipo]+'"></i>'+esc(nom(t.tipo))+(capa==='brecha'?': '+DEC[t.tipo].ageb_brecha+' AGEB':'')+'</span>'}).join('');
      if(capa==='brecha')lg+='<span><i style="background:'+INK+';border-radius:50%;width:8px;height:8px"></i>Residencia o centro de día (DENUE, '+GEO_AGEB.oferta.length+')</span><span><i style="background:'+GRIS+'"></i>Sin brecha</span>'}
    else{var vs=AG.map(function(x){return capa==='sin_int'?x.pct_sin_int:x.n_60}).sort(function(a,b){return a-b}),lim=[vs[0]].concat(c.q).concat([vs[vs.length-1]]);
      for(var i=0;i<5;i++)lg+='<span><i style="background:'+SEQ[i]+(i?'':';box-shadow:inset 0 0 0 1px #b09fd3')+'"></i>'+(capa==='sin_int'?fmt(lim[i])+'–'+fmt(lim[i+1])+'%':ent(lim[i])+'–'+ent(lim[i+1]))+'</span>';
      lg+='<span class="muted">quintiles de las AGEB · más oscuro = más alto</span>'}
    $('#tipoLegend').innerHTML=lg;
    $$('#tipoLista button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.t===selTipo)});
  }

  /* ---------- Lista de tipos y perfil del tipo (o de la AGEB) elegido ---------- */
  var VARS=[['pct_60','% de 60 años y más','%'],['pct_disc','% con discapacidad','%'],['pct_0a14','% de 0 a 14 años','%'],['prom_ocup','Ocupantes por vivienda',''],
            ['part_fem','% de mujeres activas (12+)','%'],['pct_jef_f','% de hogares con jefa','%'],['pct_sinder','% sin afiliación a salud','%'],
            ['graproes','Escolaridad promedio (años)',''],['pct_sin_int','% de viviendas sin internet','%']];
  function lista(){
    $('#tipoLista').innerHTML=TP.tipos.map(function(t){return '<button data-t="'+t.tipo+'" aria-pressed="false" style="--c:'+TC[t.tipo]+'"><i></i><span><b>'+esc(nom(t.tipo))+'</b><br><span class="muted">'+ent(t.n_ageb)+' AGEB · '+fmt(t.pct_pob_cdmx,0)+'% de la población · '+fmt(t.pct_de_las_60,0)+'% de las personas de 60+</span></span></button>'}).join('');
    $$('#tipoLista button').forEach(function(b){b.addEventListener('click',function(){var t=+b.dataset.t;selTipo=selTipo===t?null:t;selAgeb=null;pinta();perfil()})});
  }
  function perfil(){
    if(!selTipo){$('#tipoPerfil').innerHTML='<p class="muted" style="font-size:12.5px;margin-top:10px">Elige un tipo (o haz clic en una AGEB del mapa) para ver su perfil frente a la mediana de la CDMX.</p>';return}
    var t=TIPOS[selTipo],M=TP.medianas_cdmx,a=selAgeb?POR[selAgeb]:null;
    /* Gráfica de puntos: por variable, las medianas de los 4 tipos (tenues), la del tipo elegido (fuerte) y la de la CDMX (raya). */
    var W=380,rh=27,pl=158,pr=46,H=rh*VARS.length+26;
    var g=svg(W,H,'Perfil del tipo '+selTipo+' frente a los otros tipos y a la CDMX');
    VARS.forEach(function(v,i){var y=10+i*rh,k=v[0],vals=TP.tipos.map(function(x){return x.medianas[k]}).concat([M[k]]),lo=Math.min.apply(null,vals),hi=Math.max.apply(null,vals),pad=(hi-lo)*.08||1;
      var X=function(x){return pl+(W-pl-pr)*(x-lo+pad)/(hi-lo+2*pad)};
      g+='<text x="0" y="'+(y+4)+'" font-size="11.5" fill="'+INK+'">'+esc(v[1])+'</text>';
      g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'" stroke="rgba(63,71,96,.15)" stroke-width="1"/>';
      g+='<line x1="'+X(M[k])+'" x2="'+X(M[k])+'" y1="'+(y-7)+'" y2="'+(y+7)+'" stroke="'+INK+'" stroke-width="2"><title>Mediana de la CDMX: '+fmt(M[k])+v[2]+'</title></line>';
      TP.tipos.forEach(function(x){if(x.tipo===selTipo)return;g+='<circle cx="'+X(x.medianas[k])+'" cy="'+y+'" r="4" fill="'+TC[x.tipo]+'" opacity=".35"><title>'+esc(nom(x.tipo))+': '+fmt(x.medianas[k])+v[2]+'</title></circle>'});
      g+='<circle cx="'+X(t.medianas[k])+'" cy="'+y+'" r="6.5" fill="'+TC[selTipo]+'" stroke="#fff" stroke-width="1.5"><title>'+esc(nom(selTipo))+': '+fmt(t.medianas[k])+v[2]+'</title></circle>';
      g+='<text x="'+(W-pr+8)+'" y="'+(y+4)+'" '+MONO+' font-size="11" font-weight="700" fill="'+INK+'">'+fmt(t.medianas[k])+'</text>'});
    g+='<text x="0" y="'+(H-4)+'" font-size="10.5" fill="'+FAINT+'">Punto grande: mediana del tipo · puntos tenues: otros tipos · raya: CDMX</text>';
    var cab='<h4 style="margin:12px 0 6px;font-size:14px"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+TC[selTipo]+';margin-right:6px"></span>'+esc(nom(selTipo))+'</h4>';
    var ag=a?'<p class="find" style="margin:0 0 8px">AGEB '+a.cvegeo.slice(-4)+' de '+esc(a.alcaldia)+': '+ent(a.poblacion)+' habitantes, '+ent(a.n_60)+' de 60+ ('+fmt(a.pct_60)+'%), '+fmt(a.pct_sin_int)+'% de viviendas sin internet, oferta núcleo a '+fmt(a.dist_oferta_km,2)+' km.'+(a.frontera?' <b>Está en la frontera con otro tipo:</b> revisarla contra los dos.':'')+(a.brecha?' <b>Es AGEB con brecha de oferta.</b>':'')+'</p>':'';
    $('#tipoPerfil').innerHTML=cab+ag+g+'</svg>';
  }

  /* ---------- Barras horizontales por tipo, con el color del tipo y un subtítulo con el conteo ---------- */
  function barrasTipo(vals,o){
    var W=o.W||360,pr=58,hasRef=vals.some(function(e){return e.ref!=null}),rh=hasRef?58:52,H=rh*vals.length+(o.nota?24:6),mx=o.max;
    function X(v){return (W-pr)*Math.min(v,mx)/mx}
    var g=svg(W,H,o.aria);
    vals.forEach(function(e,i){var y=2+i*rh;
      g+='<text x="0" y="'+(y+11)+'" font-size="11.5" font-weight="650" fill="'+INK+'">'+esc(nom(e.t))+'</text>';
      g+='<rect x="0" y="'+(y+16)+'" width="'+Math.max(1.5,X(e.v)).toFixed(1)+'" height="14" rx="3" fill="'+TC[e.t]+'"><title>'+esc(nom(e.t))+': '+o.f(e.v)+(e.sub?' · '+esc(e.sub):'')+'</title></rect>';
      g+='<text x="'+(X(e.v)+6)+'" y="'+(y+27.5)+'" '+MONO+' font-size="12" font-weight="700" fill="'+INK+'">'+o.f(e.v)+'</text>';
      var ys=y+43;
      if(hasRef&&e.ref!=null){g+='<rect x="0" y="'+(y+33)+'" width="'+Math.max(1.5,X(e.ref)).toFixed(1)+'" height="5" rx="2" fill="#b8b3c9"><title>'+esc(o.refLbl)+': '+o.f(e.ref)+'</title></rect>';ys=y+50}
      if(e.sub)g+='<text x="0" y="'+ys+'" font-size="10.5" fill="'+FAINT+'">'+esc(e.sub)+(hasRef&&e.ref!=null?' · '+esc(o.refLbl.toLowerCase())+': '+o.f(e.ref):'')+'</text>'});
    if(o.nota)g+='<text x="0" y="'+(H-5)+'" font-size="10.5" fill="'+FAINT+'">'+esc(o.nota)+'</text>';
    return g+'</svg>'}

  /* ---------- Línea por k (silueta y estabilidad), con dos decimales ---------- */
  function lineaK(series,o){
    var W=400,H=230,pl=40,pr=12,pt=14,pb=34,K=TP.seleccion_k.map(function(r){return r.k}),k0=K[0],k1=K[K.length-1];
    function X(k){return pl+(W-pl-pr)*(k-k0)/(k1-k0)} function Y(v){return pt+(H-pt-pb)*(1-(v-o.min)/(o.max-o.min))}
    var g=svg(W,H,o.aria);
    o.ticks.forEach(function(t){g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="rgba(63,71,96,.1)"/><text x="'+(pl-6)+'" y="'+(Y(t)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+fmt(t,2)+'</text>'});
    K.forEach(function(k){g+='<text x="'+X(k)+'" y="'+(H-pb+16)+'" text-anchor="middle" '+MONO+' font-size="10.5" fill="'+FAINT+'">'+k+'</text>'});
    g+='<text x="'+(W-pr)+'" y="'+(H-4)+'" text-anchor="end" font-size="10.5" fill="'+FAINT+'">número de tipos (k) →</text>';
    if(o.banda)g+='<rect x="'+pl+'" y="'+Y(o.max)+'" width="'+(W-pl-pr)+'" height="'+(Y(o.banda)-Y(o.max))+'" fill="rgba(35,128,111,.10)"/><text x="'+(W-pr-4)+'" y="'+(Y(o.banda)-5)+'" text-anchor="end" font-size="10" fill="#23806f">criterio de estabilidad (≥ '+fmt(o.banda,2)+')</text>';
    var kk=TP.seleccion_k.filter(function(r){return r.estable}).map(function(r){return r.k}).pop();
    g+='<line x1="'+X(kk)+'" x2="'+X(kk)+'" y1="'+pt+'" y2="'+(H-pb)+'" stroke="'+INK+'" stroke-dasharray="4 3" opacity=".5"/><text x="'+(X(kk)+5)+'" y="'+(H-pb-6)+'" font-size="10.5" fill="'+INK+'">k elegido = '+kk+'</text>';
    series.forEach(function(sr){var d='';TP.seleccion_k.forEach(function(r,i){d+=(i?'L':'M')+X(r.k).toFixed(1)+','+Y(r[sr.c]).toFixed(1)});
      g+='<path d="'+d+'" fill="none" stroke="'+sr.col+'" stroke-width="2.4"'+(sr.dash?' stroke-dasharray="5 4"':'')+'/>';
      TP.seleccion_k.forEach(function(r){g+='<circle cx="'+X(r.k)+'" cy="'+Y(r[sr.c])+'" r="4.5" fill="'+sr.col+'" stroke="#fff" stroke-width="1.5"><title>'+esc(sr.n)+', k = '+r.k+': '+fmt(r[sr.c],3)+'</title></circle>'})});
    return g+'</svg><div class="legend">'+series.map(function(sr){return '<span><i style="background:'+sr.col+'"></i>'+esc(sr.n)+'</span>'}).join('')+'</div>'}

  /* ---------- Render ---------- */
  var T=TP.tipos,DC=TP.decision,BT=TP.brecha_total,SI=TP.sin_internet_total;
  var masAg=T.slice().sort(function(a,b){return b.pct_60-a.pct_60})[0],masN=T.slice().sort(function(a,b){return b.pct_de_las_60-a.pct_de_las_60})[0];
  var masInt=DC.slice().sort(function(a,b){return b.pct_viv_sin_int-a.pct_viv_sin_int})[0];
  $('#tipoFind').innerHTML='El tipo más envejecido en porcentaje (<b>'+esc(nom(masAg.tipo))+'</b>, '+fmt(masAg.pct_60)+'% de 60+) concentra solo el <b>'+fmt(masAg.pct_de_las_60)+'%</b> de las personas de 60+ de la ciudad; el <b>'+fmt(masN.pct_de_las_60)+'%</b> vive en el tipo '+masN.tipo+' ('+esc(masN.nombre.toLowerCase())+'). Los tipos son una partición estable de un gradiente, no zonas «naturales» (ver la validación abajo).';
  lista();dibujaMapa();pinta();perfil();
  seg('#segTipo','k',function(k){capa=k;pinta()});
  var CQ=TP.calidad.filter(function(r){return /en el modelo/.test(r.chequeo)})[0];
  $('#src-tipo').innerHTML=dl({Fuente:'INEGI, Censo de Población y Vivienda 2020, principales resultados por AGEB urbana (CDMX); Marco Geoestadístico 2025 (contornos, simplificados a 15 m); DENUE 05_2026 (residencias y centros de día, clases núcleo).',
    Universo:ent(AG.length)+' AGEB urbanas con 100 habitantes o más y sin datos suprimidos ('+fmt(CQ.pct_poblacion_cdmx)+'% de la población de la CDMX).',
    Modelo:'k-means con 4 tipos sobre 9 indicadores estandarizados. k elegido por estabilidad en 50 submuestras del 80% (criterio declarado antes de ver resultados).',
    Lectura:'Es una tipología de zonas, no de personas: que una AGEB sea de un tipo no dice nada de una persona que viva ahí. La ENASIC no tiene AGEB: no se cruza con el modelo de focalización.',
    Archivo:esc(TP.fuente)});

  /* Tres gráficas para la decisión */
  $('#ch-t60').innerHTML=barrasTipo(T.map(function(t){return {t:t.tipo,v:t.pct_de_las_60,ref:t.pct_pob_cdmx,sub:ent(t.n_60)+' personas de 60+'}}),
    {max:Math.ceil(Math.max.apply(null,T.map(function(t){return Math.max(t.pct_de_las_60,t.pct_pob_cdmx)}))/10)*10,f:function(v){return fmt(v)+'%'},refLbl:'Población total',aria:'Distribución de las personas de 60+ por tipo',nota:'Barra gris: % de la población total que vive en el tipo.'});
  $('#t60Find').innerHTML='El <b>'+fmt(masN.pct_de_las_60)+'%</b> de las personas de 60+ vive en zonas del tipo '+masN.tipo+'. Elegir sede por el % de 60+ llevaría al tipo '+masAg.tipo+', que concentra el '+fmt(masAg.pct_de_las_60)+'%.';
  $('#ch-tint').innerHTML=barrasTipo(DC.map(function(d){return {t:d.tipo,v:d.pct_viv_sin_int,sub:ent(d.viviendas_sin_internet)+' viviendas sin internet'}}),
    {max:Math.ceil(masInt.pct_viv_sin_int/10)*10,f:function(v){return fmt(v)+'%'},aria:'Viviendas sin internet por tipo'});
  $('#tIntFind').innerHTML='En la CDMX, <b>'+ent(SI.viviendas)+'</b> viviendas ('+fmt(SI.pct)+'%) no tienen internet. En el tipo '+masInt.tipo+' son <b>'+fmt(masInt.pct_viv_sin_int)+'%</b>: la app sola deja fuera a una de cada '+Math.round(100/masInt.pct_viv_sin_int)+' viviendas. Hace falta un canal sin internet o declarar la exclusión.';
  var masLej=DC.slice().sort(function(a,b){return b.pct_60_a_mas_de_1km-a.pct_60_a_mas_de_1km})[0];
  $('#ch-tlej').innerHTML=barrasTipo(DC.map(function(d){return {t:d.tipo,v:d.pct_60_a_mas_de_1km,sub:'mediana '+fmt(d.dist_mediana_km,2)+' km a la más cercana'}}),
    {max:Math.ceil(masLej.pct_60_a_mas_de_1km/10)*10,f:function(v){return fmt(v)+'%'},aria:'Personas de 60+ a más de 1 km de la oferta núcleo, por tipo',nota:'Línea recta del centro de la AGEB; no es tiempo de traslado.'});
  $('#tLejFind').innerHTML='% de las personas de 60+ que viven a más de 1 km de una residencia o centro de día. En el tipo '+masLej.tipo+' es <b>'+fmt(masLej.pct_60_a_mas_de_1km)+'%</b>. Cercanía no es acceso: la oferta no incluye precio ni cupo.';

  /* Brechas por alcaldía: personas de 60+ en AGEB con brecha, apiladas por tipo */
  var PA=TP.por_alcaldia.filter(function(r){return r.n_60_brecha>0}).sort(function(a,b){return b.n_60_brecha-a.n_60_brecha});
  var bt={};AG.forEach(function(a){if(!a.brecha)return;bt[a.alcaldia]=bt[a.alcaldia]||{};bt[a.alcaldia][a.tipo]=(bt[a.alcaldia][a.tipo]||0)+a.n_60});
  (function(){var W=980,rh=24,pl=160,pr=130,H=rh*PA.length+26,mx=PA[0].n_60_brecha;
    function X(v){return pl+(W-pl-pr)*v/mx}
    var g=svg(W,H,'Personas de 60+ en AGEB con brecha de oferta, por alcaldía y tipo');
    PA.forEach(function(r,i){var y=4+i*rh,x=pl;
      g+='<text x="'+(pl-8)+'" y="'+(y+13)+'" text-anchor="end" font-size="11.5" fill="'+INK+'">'+esc(r.alcaldia)+'</text>';
      [1,2,3,4].forEach(function(t){var v=(bt[r.alcaldia]||{})[t]||0;if(!v)return;var w=X(v)-pl;
        g+='<rect x="'+x.toFixed(1)+'" y="'+(y+3)+'" width="'+Math.max(1,w-1.5).toFixed(1)+'" height="14" rx="2" fill="'+TC[t]+'"><title>'+esc(r.alcaldia)+' · '+esc(nom(t))+': '+ent(v)+' personas de 60+</title></rect>';x+=w});
      g+='<text x="'+(x+6)+'" y="'+(y+14)+'" '+MONO+' font-size="11" font-weight="700" fill="'+INK+'">'+ent(r.n_60_brecha)+'<tspan font-weight="400" fill="'+FAINT+'"> · '+r.ageb_brecha+' AGEB</tspan></text>'});
    $('#ch-tbrecha').innerHTML=g+'</svg><div class="legend">'+T.map(function(t){return '<span><i style="background:'+TC[t.tipo]+'"></i>'+esc(nom(t.tipo))+'</span>'}).join('')+'</div>'})();
  var dosA=PA.slice(0,2);
  $('#tBrFind').innerHTML='<b>'+ent(BT.ageb)+'</b> AGEB con <b>'+ent(BT.n_60)+'</b> personas de 60+ tienen muchas personas mayores y la oferta formal lejos. '+esc(dosA[0].alcaldia)+' y '+esc(dosA[1].alcaldia)+' concentran más. Con terciles en vez de cuartiles serían '+ent(DC.reduce(function(s,d){return s+d.ageb_brecha_terciles},0))+' AGEB: el umbral es una convención.';
  $('#src-tbrecha').innerHTML=dl({Definición:'AGEB en el cuartil alto de personas de 60+ y en el cuartil alto de distancia en línea recta desde su centro a la residencia o centro de día más cercano (DENUE, clases SCIAN 623311, 623312, 624121 y 624122).',
    'No mide':'Capacidad (cupos), precio, calidad ni tiempo de traslado. «Sin brecha» no significa «con acceso».',Archivo:esc(TP.fuente)});

  /* Validación */
  var SK=TP.seleccion_k,k4=SK.filter(function(r){return r.estable}).pop(),CO=TP.comparacion,mod=CO[CO.length-1],idx=CO[1],reg=CO[0],DF=TP.dejar_fuera,FR=TP.frontera;
  $('#ch-tsil').innerHTML='<h4 class="mini">Separación de los grupos (silueta)</h4>'+lineaK([{c:'silueta',n:'Datos reales',col:'#5d4d8f'},{c:'silueta_nula_p95',n:'Referencia sin grupos (p95)',col:'#b8b3c9',dash:true}],
    {min:.1,max:.35,ticks:[.1,.15,.2,.25,.3,.35],aria:'Silueta por número de tipos frente a una referencia sin grupos'});
  $('#ch-tari').innerHTML='<h4 class="mini">Estabilidad en 50 submuestras (ARI)</h4>'+lineaK([{c:'ari_promedio',n:'Promedio',col:'#5d4d8f'},{c:'ari_min',n:'Mínimo',col:'#c0435a'}],
    {min:.4,max:1,banda:.9,ticks:[.4,.5,.6,.7,.8,.9,1],aria:'Estabilidad por número de tipos'});
  $('#tConfFind').innerHTML='Con k = '+k4.k+' la asignación casi no cambia entre submuestras (ARI promedio '+fmt(k4.ari_promedio,2)+'); con más tipos se vuelve inestable. La silueta real ('+fmt(k4.silueta,2)+') apenas supera a la de datos sin grupos ('+fmt(k4.silueta_nula_p95,2)+'): <b>la ciudad es un gradiente y la tipología lo parte en tramos estables</b>. Frente a un índice de una sola dimensión, el modelo explica un poco más ('+fmt(mod.r2_9_variables,2)+' contra '+fmt(idx.r2_9_variables,2)+'). Al dejar fuera cada alcaldía, clasifica sus AGEB igual en el '+fmt(DF.coincidencia_ponderada)+'% de los casos.';
  $('#tcomp tbody').innerHTML=CO.map(function(r,i){return '<tr'+(i===CO.length-1?' style="font-weight:650"':'')+'><td>'+esc(r.particion)+'</td><td class="n">'+fmt(r.r2_9_variables,2)+'</td><td class="n">'+fmt(r.ari_promedio,2)+'</td><td class="n">'+fmt(r.cramer_v_rezago_coneval,2)+'</td><td class="n">'+fmt(r.eta2_pct_limitacion,3)+'</td><td class="n">'+fmt(r.eta2_log_distancia_oferta,3)+'</td><td class="n">'+fmt(100*r.vecinos_mismo_grupo,1)+'%</td></tr>'}).join('');
  $('#trob tbody').innerHTML=TP.robustez.map(function(r){return '<tr><td>'+esc(r.variante)+'</td><td class="n">'+fmt(r.ari,2)+'</td></tr>'}).join('');
  $('#limTipo').innerHTML=[
    '<b>Es de zonas, no de personas.</b> No dice nada de una cuidadora concreta (falacia ecológica) ni se cruza con el modelo de focalización: la ENASIC no tiene AGEB.',
    '<b>Censo de marzo de 2020.</b> Con el conteo de 2025 o el censo de 2030 se vuelve a ajustar; no se reutilizan los centros.',
    '<b>Frontera.</b> '+ent(FR.n)+' AGEB ('+fmt(FR.pct)+'%, '+ent(FR.poblacion)+' habitantes) quedan casi a la misma distancia de dos tipos. Una sede ahí se revisa contra los dos.',
    '<b>Otro algoritmo corta distinto.</b> Ward y la mezcla gaussiana coinciden poco con k-means (tabla de robustez): es lo esperable en un gradiente.',
    '<b>Sin validación de resultado.</b> No hay un dato de cuidado por AGEB contra el cual probarla; la coincidencia con el rezago del CONEVAL es en parte circular (comparten indicadores del Censo).',
    '<b>La discapacidad casi no la estructura.</b> No sustituye un análisis de discapacidad.'
  ].map(function(t){return '<li>'+t+'</li>'}).join('');
})();
