/* Observatorio del Cuidado · js/vistas/territorio-estados.js
   Pestaña «¿Dónde?», segunda parte: mapa de las 32 entidades y la CDMX frente al país (ENIGH 2022, CONAPO 2020).
   (23 oct 2026: se quitó la gráfica de zonas por alcaldía, AGEB de CONEVAL 2020; respaldo en _respaldo_graficas_2026-10-23/)
   Importa de OBS: $, $$, FAINT, MONO, dl, ent, esc, fmt, prec, seg, svg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,$$=OBS.$$,FAINT=OBS.FAINT,MONO=OBS.MONO,dl=OBS.dl,ent=OBS.ent,esc=OBS.esc,fmt=OBS.fmt,prec=OBS.prec,seg=OBS.seg,svg=OBS.svg;
  var E=D.estados.entidades,NAL=D.estados.nacional,DEF=D.estados.definiciones,SEQ=['#efeaf7','#d3c8e8','#b09fd3','#8a76b8','#5d4d8f'];
  var CL=Object.keys(E),key='pobreza60',sel='9';
  var NOMC={'9':'CDMX','15':'Edo. Méx.','30':'Veracruz','5':'Coahuila','16':'Michoacán','3':'BCS','24':'SLP'};
  function corto(c){return NOMC[c]||E[c].nombre}
  var CAPA={
    pobreza60:{t:'Personas de 60+ en situación de pobreza',u:'% de las personas de 60+',nota:'Medición multidimensional del CONEVAL (ingreso y carencias).'},
    segsoc60:{t:'Personas de 60+ sin acceso a la seguridad social',u:'% de las personas de 60+',nota:'El CONEVAL cuenta como cubierta a quien recibe una pensión no contributiva; por eso el nivel es bajo para este grupo.'},
    salud60:{t:'Personas de 60+ sin acceso a servicios de salud',u:'% de las personas de 60+',nota:'Carencia por acceso a los servicios de salud (CONEVAL).'},
    sola60:{t:'Personas de 60+ que viven solas',u:'% de las personas de 60+',nota:'Hogar unipersonal. No dice si recibe ayuda ni si comparte vivienda con otro hogar.'},
    hog60:{t:'Hogares con al menos una persona de 60+',u:'% de los hogares',nota:'Es población potencial, no necesidad de cuidado: la mayoría de las personas de 60+ no depende de otra.'},
    pct_pob60:{t:'Peso de la población de 60+',u:'% de la población',nota:'Qué tan envejecida está la entidad.'},
    im:{t:'Marginación (CONAPO 2020)',u:'Índice de marginación',nota:'Ojo con el sentido: un índice MÁS BAJO significa MÁS marginación. Censo 2020, sin error muestral. Contexto, no necesidad de cuidado.',inv:true}
  };
  function val(c){return E[c][key].v}
  /* orden «peor primero»: mayor % arriba; en marginación, menor índice (más marginada) arriba */
  function orden(){var c=CAPA[key];return CL.slice().sort(function(a,b){return c.inv?val(a)-val(b):val(b)-val(a)})}
  function cortes(){var v=CL.map(val).sort(function(a,b){return a-b}),q=[];for(var i=1;i<5;i++)q.push(v[Math.round(i*v.length/5)-1]);return q}
  function color(c,q){var v=val(c),i=0;while(i<4&&v>q[i])i++;return CAPA[key].inv?SEQ[4-i]:SEQ[i]}
  var VB=GEO_EST.viewBox.split(' ').map(Number);
  function silEst(c,fill){var p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',GEO_EST.entidades[c].path);
    var g=document.createElementNS('http://www.w3.org/2000/svg','svg');g.style.position='absolute';g.style.visibility='hidden';g.appendChild(p);document.body.appendChild(g);var b=p.getBBox();document.body.removeChild(g);
    var pad=Math.max(b.width,b.height)*.06;return '<svg viewBox="'+(b.x-pad)+' '+(b.y-pad)+' '+(b.width+2*pad)+' '+(b.height+2*pad)+'" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><path d="'+GEO_EST.entidades[c].path+'" fill="'+fill+'" stroke="rgba(43,48,69,.35)" stroke-width="'+(Math.max(b.width,b.height)/60)+'"/></svg>'}
  function lugar(c){return orden().indexOf(c)+1}
  function frase(c){var r=E[c][key],ca=CAPA[key];
    if(key==='im')return 'Grado '+esc(r.grado).toLowerCase()+'. Lugar '+lugar(c)+' de 32 en marginación (1 = la más marginada).';
    return 'IC 90 % '+fmt(r.li)+'–'+fmt(r.ls)+'. Lugar '+lugar(c)+' de 32.'}
  function render(){
    var ca=CAPA[key],q=cortes(),o=orden(),pct=key!=='im',dig=pct?1:1;
    $('#eTitle').textContent=ca.t; $('#eDef').textContent=ca.nota;
    /* mapa */
    var s='<svg viewBox="'+GEO_EST.viewBox+'" role="img" aria-label="Mapa de entidades">';
    CL.forEach(function(c){s+='<path d="'+GEO_EST.entidades[c].path+'" fill="'+color(c,q)+'" data-c="'+c+'"'+(c===sel?' class="sel"':'')+'><title>'+esc(E[c].nombre)+': '+fmt(val(c),dig)+(pct?'%':'')+'</title></path>'});
    $('#mapEst').innerHTML=s+'</svg>';
    $$('#mapEst path').forEach(function(p){p.addEventListener('click',function(){sel=p.dataset.c;render()})});
    var vs=CL.map(val).sort(function(a,b){return a-b}),lims=[vs[0]].concat(q).concat([vs[vs.length-1]]);
    var leg=[];for(var i=0;i<5;i++)leg.push('<span><i style="background:'+(ca.inv?SEQ[4-i]:SEQ[i])+'"></i>'+fmt(lims[i],dig)+'–'+fmt(lims[i+1],dig)+'</span>');
    $('#mapEstLegend').innerHTML=leg.join('')+'<span class="muted">quintiles de las 32 entidades'+(ca.inv?' · más oscuro = más marginación':' · más oscuro = más alto')+'</span>';
    /* CDMX frente al país: puntos con IC 90 % */
    var W=440,rh=13,pt=22,pb=30,pl=96,pr=16,H=pt+pb+rh*32,mx=Math.max.apply(null,CL.map(function(c){return pct?E[c][key].ls:val(c)})),mn=pct?0:Math.min.apply(null,CL.map(val));
    mx=pct?Math.ceil(mx/10)*10:Math.ceil(mx+1);mn=pct?0:Math.floor(mn-1);
    function X(v){return pl+(W-pl-pr)*(v-mn)/(mx-mn)}
    var g=svg(W,H,'Entidades ordenadas, con intervalo de confianza');var step=pct?(mx>40?10:5):2;
    for(var t=mn;t<=mx+1e-9;t+=step)g+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+(pt-4)+'" y2="'+(H-pb)+'" stroke="rgba(63,71,96,.08)"/><text x="'+X(t)+'" y="'+(H-pb+14)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+t+(pct?'%':'')+'</text>';
    if(pct){var nv=NAL[key];g+='<rect x="'+X(nv.li)+'" y="'+(pt-4)+'" width="'+Math.max(1,X(nv.ls)-X(nv.li))+'" height="'+(H-pb-pt+4)+'" fill="rgba(35,128,111,.12)"/><line x1="'+X(nv.v)+'" x2="'+X(nv.v)+'" y1="'+(pt-4)+'" y2="'+(H-pb)+'" stroke="#23806f" stroke-dasharray="4 3" stroke-width="1.4"/><text x="'+X(nv.v)+'" y="'+(pt-8)+'" text-anchor="middle" font-size="10.5" fill="#23806f">Nacional '+fmt(nv.v)+'%</text>';}
    o.forEach(function(c,i){var y=pt+i*rh+rh/2,r=E[c][key],hi=c===sel,cd=c==='9';
      g+='<g data-c="'+c+'" style="cursor:pointer"><rect x="0" y="'+(y-rh/2)+'" width="'+W+'" height="'+rh+'" fill="'+(hi?'rgba(170,149,209,.18)':'transparent')+'"/>';
      g+='<text x="'+(pl-8)+'" y="'+(y+3.5)+'" text-anchor="end" font-size="10.5" font-weight="'+(cd||hi?700:400)+'" fill="'+(cd?'#2b3045':'rgba(43,48,69,.72)')+'">'+esc(corto(c))+'</text>';
      if(pct)g+='<line x1="'+X(r.li)+'" x2="'+X(r.ls)+'" y1="'+y+'" y2="'+y+'" stroke="'+(cd?'#2b3045':'#8a76b8')+'" stroke-width="2" opacity=".55"/>';
      g+='<circle cx="'+X(r.v)+'" cy="'+y+'" r="'+(cd||hi?4.6:3.4)+'" fill="'+(cd?'#2b3045':color(c,q))+'" stroke="'+(cd?'#fff':'#5d4d8f')+'" stroke-width="1"><title>'+esc(E[c].nombre)+': '+fmt(r.v)+(pct?'% (IC 90% '+fmt(r.li)+'–'+fmt(r.ls)+')':'')+'</title></circle></g>'});
    g+='<text x="'+(W-pr)+'" y="'+(H-4)+'" text-anchor="end" font-size="11" fill="'+FAINT+'">'+esc(ca.u)+' →</text>';
    $('#ch-estados').innerHTML=g+'</svg>';
    $$('#ch-estados g[data-c]').forEach(function(n){n.addEventListener('click',function(){sel=n.dataset.c;render()})});
    /* lectura de la CDMX: solo se afirma diferencia si los IC 90 % no se traslapan */
    var cd=E['9'][key],txt;
    if(pct){var nv2=NAL[key],dif=cd.ls<nv2.li?'menor que':cd.li>nv2.ls?'mayor que':null;
      txt='<b>CDMX: '+fmt(cd.v)+'%</b> (IC 90 % '+fmt(cd.li)+'–'+fmt(cd.ls)+'), lugar '+lugar('9')+' de 32. '+(dif?'Es claramente '+dif+' el promedio nacional ('+fmt(nv2.v)+'%): los intervalos no se traslapan.':'Su intervalo se traslapa con el nacional ('+fmt(nv2.v)+'%): no se puede decir que sea distinta.')+' Las barras horizontales son el IC 90 %; dos entidades cuyos intervalos se traslapan no se deben ordenar entre sí.';}
    else txt='<b>CDMX: índice '+fmt(cd.v,2)+'</b>, grado '+esc(cd.grado).toLowerCase()+'; lugar '+lugar('9')+' de 32 en marginación'+(lugar('9')>=31?' (menos marginadas: '+orden().slice(lugar('9')).map(function(c){return esc(E[c].nombre)}).join(', ')+')':'')+'. No hay intervalo: es un dato censal.';
    $('#eCdmx').innerHTML=txt;
    /* tarjetas existentes (.ext): valor más alto y más bajo, con silueta */
    var hi=o[0],lo=o[o.length-1],lab=ca.inv?['Más marginada','Menos marginada']:['Valor más alto','Valor más bajo'];
    $('#extEst').innerHTML=[[hi,lab[0]],[lo,lab[1]],[sel,'Seleccionada']].filter(function(e,i){return i<2||(sel!==hi&&sel!==lo)}).map(function(e){return '<div><div class="hd"><div class="sil">'+silEst(e[0],color(e[0],q))+'</div><div><div class="kicker" style="margin:0 0 4px">'+e[1]+'</div><b class="num">'+fmt(val(e[0]),pct?1:2)+(pct?'%':'')+'</b><div style="font-size:13px;margin-top:4px">'+esc(E[e[0]].nombre)+'</div></div></div><div class="ext-fr">'+frase(e[0])+(pct?' Muestra: '+ent(E[e[0]][key].n)+' '+(key==='hog60'?'hogares':key==='pct_pob60'?'personas':'personas de 60+')+'. '+prec(E[e[0]][key].prec):'')+'</div></div>'}).join('');
    $('#src-est').innerHTML=dl({Fuente:key==='im'?'CONAPO, Índice de marginación por entidad federativa 2020':'INEGI, ENIGH 2022; programa de cálculo de la pobreza del CONEVAL (pobreza22.csv)',Definición:esc(key==='im'?'IM_2020 y GM_2020 de CONAPO':DEF[key]),
      Precisión:key==='im'?'Censo: sin error muestral.':'IC 90 % por diseño (estratos est_dis, UPM upm, factor de hogar; linealización de Taylor). Todas las entidades tienen CV menor a 15 % (precisión alta).',
      Validación:D.estados.validacion.map(function(v){return esc(v.chequeo)+': '+fmt(v.calculado)+'% calculado vs. '+fmt(v.publicado)+'% publicado ('+esc(v.fuente)+')'}).join('<br>'),
      'No permite':'Tendencias (un solo año), cifras por alcaldía o municipio, ni necesidad de cuidado.',
      Mapa:'@svg-maps/mexico 2.0.0, Victor Cazanave, CC BY 4.0. Dibujo esquemático, no cartografía oficial.',
      Archivo:esc(key==='im'?D.estados.fuentes.im:D.estados.fuentes.enigh)});
  }
  seg('#segEst','k',function(k){key=k;render()}); render();

})();
