/* Observatorio del Cuidado · js/vistas/territorio.js
   Pestaña «¿Dónde?»: escala de la CDMX, mapa de alcaldías (GEO) y dispersión.
   Importa de OBS: $, $$, FAINT, MONO, dl, ent, esc, fmt, seg, svg
   Exporta a OBS:  T */
(function(){
  var $=OBS.$,$$=OBS.$$,FAINT=OBS.FAINT,MONO=OBS.MONO,dl=OBS.dl,ent=OBS.ent
      ,esc=OBS.esc,fmt=OBS.fmt,seg=OBS.seg,svg=OBS.svg;
  var DM=D.dimension_cdmx;
  var NC=D.relevo_enigh.necesidad_cdmx_det;
  $('#dimTiles').innerHTML='<div class="card tile" style="border-color:var(--teal)"><div class="big num" style="font-size:30px;color:var(--teal)">≈ '+ent(NC.total)+'</div><div class="lbl">Hogares CDMX con persona de 60+ o con discapacidad: <b>'+fmt(NC.pct)+'%</b> (IC 90% '+fmt(NC.li90)+'–'+fmt(NC.ls90)+')</div><div class="chips"><span class="chip ev">confirmado</span><span class="chip">ENIGH 2022 · medición directa</span></div></div>'
    +DM.map(function(r,i){return '<div class="card tile"><div class="big num" style="font-size:30px">'+(i?'≈ ':'≥ ')+ent(r.valor)+'</div><div class="lbl">'+esc(r.nivel)+(i?'':'. La ENIGH mide '+fmt(NC.total/r.valor*100-100,0)+'% más.')+'</div><div class="chips"><span class="chip ev">'+esc(r.evidencia)+'</span><span class="chip p-noest">inferido de tasas nacionales</span></div></div>'}).join('');
  var T=D.territorio.alcaldias,TT=D.territorio.totales,key='idx_asilos',sel='Iztapalapa';
  var IDX=[[0.5,'#c0435a','< 0.5'],[0.9,'#e59aa8','0.5–0.9'],[1.1001,'#d9d3e6','0.9–1.1'],[1.75,'#9fd9cc','1.1–1.75'],[1e9,'#23806f','> 1.75']];
  var SEQ=['#efeaf7','#d3c8e8','#b09fd3','#8a76b8','#5d4d8f'];
  var DEF={
    idx_asilos:{t:'Asilos frente a población de 60+',d:'Índice = % de los asilos de la ciudad ÷ % de la población 60+. 1 = proporcional.',f:'idx',c:function(a){return a.asilos},cc:'Asilos',cv:'Índice',brk:IDX,dig:2,sh:function(a){return 100*a.asilos/TT.asilos},shl:'% de los asilos',of:'INEGI, DENUE 05/2026, SCIAN 623311/2'},
    idx_centros:{t:'Centros de día frente a población de 60+',d:'Índice = % de los centros de día ÷ % de la población 60+. La clase SCIAN no distingue cuidado de recreación.',f:'idx',c:function(a){return a.centros_dia},cc:'Centros',cv:'Índice',brk:IDX,dig:2,sh:function(a){return 100*a.centros_dia/TT.centros_dia},shl:'% de los centros de día',of:'INEGI, DENUE 05/2026, SCIAN 624121/2'},
    ql_plazas:{t:'Plazas en residencias privadas',d:'Cociente de localización de plazas frente a población 60+. Sin dato en algunas alcaldías: no se sabe si valen cero.',f:'ql',c:function(a){return a.plazas},cc:'Plazas',cv:'QL',brk:IDX,dig:2,sh:null,of:'CSV de capacidad en residencias privadas (productor y año desconocidos)'},
    dep_pct:{t:'Personas con dependencia severa',d:'Participación de cada alcaldía en quienes necesitan ayuda para actividades diarias (todas las edades). Es un conteo, no una tasa.',f:'dep',c:function(a){return a.dep_total},cc:'Personas',cv:'% CDMX',brk:[[3,SEQ[0],'< 3%'],[5,SEQ[1],'3–5%'],[8,SEQ[2],'5–8%'],[12,SEQ[3],'8–12%'],[1e9,SEQ[4],'≥ 12%']],dig:1,sh:function(a){return a.dep_pct},shl:'% de la dependencia severa',of:'CSV "Población con discapacidad que necesita ayuda…" (productor y año sin documentar)'},
    pob65_pct:{t:'Pobreza en población de 65 y más (2020)',d:'Contexto de vulnerabilidad económica, no necesidad de cuidado.',f:'pob',c:function(a){return a.pob65_n},cc:'Pob. 65+',cv:'% pobreza',brk:[[10,SEQ[0],'< 10%'],[17,SEQ[1],'10–17%'],[24,SEQ[2],'17–24%'],[31,SEQ[3],'24–31%'],[1e9,SEQ[4],'≥ 31%']],dig:1,sh:null,pct:true,of:'CONEVAL, Pobreza por grupos poblacionales a escala municipal 2010–2020'},
    rez_pct:{t:'Población en AGEB con rezago social medio o mayor (2020)',d:'Contexto de vulnerabilidad, no necesidad de cuidado. Se excluyen '+D.territorio.rezago_calidad.suprimidas+' AGEB con datos suprimidos ('+D.territorio.rezago_calidad.alto_suprimidas+' de ellas aparecían como rezago alto o muy alto con menos de 10 habitantes).',f:'rez',c:function(a){return a.rez_nageb},cc:'AGEB medio o más',cv:'% de la población',brk:[[1,SEQ[0],'< 1%'],[5,SEQ[1],'1–5%'],[10,SEQ[2],'5–10%'],[20,SEQ[3],'10–20%'],[1e9,SEQ[4],'≥ 20%']],dig:1,sh:null,pct:true,of:'CONEVAL, Índice de Rezago Social 2020 por AGEB urbana (grado de rezago)'},
    sds_pct:{t:'Población sin derechohabiencia a servicios de salud (2020)',d:'Promedio de las AGEB urbanas ponderado por población. Dentro de cada alcaldía la variación entre AGEB es grande (p10–p90 en la tabla).',f:'rez',c:function(a){return a.pob_ageb},cc:'Población en AGEB',cv:'% sin derechohabiencia',brk:[[22,SEQ[0],'< 22%'],[25,SEQ[1],'22–25%'],[28,SEQ[2],'25–28%'],[31,SEQ[3],'28–31%'],[1e9,SEQ[4],'≥ 31%']],dig:1,sh:null,pct:true,of:'CONEVAL, Índice de Rezago Social 2020 por AGEB urbana (indicador i_sdsalud)'}
  };
  /* Frase corta bajo cada tarjeta «Valor más alto / más bajo»: unidad y advertencia de la capa. */
  function pocos(n,que){return n<30?' Son '+ent(n)+' '+que+': uno o dos cambian el orden.':''}
  var FR={
    idx_asilos:function(n,a){if(!a.asilos)return 'Cero asilos registrados en el DENUE (no necesariamente cero asilos), con el '+fmt(a.pct_pob60)+'% de la población 60+ de la ciudad.';return fmt(100*a.asilos/TT.asilos)+'% de los asilos de la ciudad frente al '+fmt(a.pct_pob60)+'% de su población 60+.'+(a.asilos?pocos(a.asilos,'asilos'):' Cero asilos registrados en el DENUE, no necesariamente cero asilos.')},
    idx_centros:function(n,a){return fmt(100*a.centros_dia/TT.centros_dia)+'% de los centros de día frente al '+fmt(a.pct_pob60)+'% de su población 60+.'+(a.centros_dia?pocos(a.centros_dia,'centros'):' Cero registrados en el DENUE.')},
    ql_plazas:function(n,a){return ent(a.plazas)+' plazas en residencias privadas.'},
    dep_pct:function(n,a){return ent(a.dep_total)+' personas. Es un conteo: pesa el tamaño de la alcaldía.'},
    pob65_pct:function(n,a){return 'De '+ent(a.pob65_n)+' personas de 65+. Contexto, no necesidad de cuidado.'},
    rez_pct:function(n,a){return ent(a.rez_nageb)+' AGEB con rezago medio o mayor.'},
    sds_pct:function(n,a){return 'Entre sus AGEB va de '+fmt(a.sds_p10)+'% a '+fmt(a.sds_p90)+'%.'}
  };
  function silueta(n,fill){var f=GEO.features.filter(function(x){return x.properties.nombre===n})[0],xs=[],ys=[];
    f.geometry.coordinates.forEach(function(p){p.forEach(function(r){r.forEach(function(c){xs.push(c[0]);ys.push(c[1])})})});
    var x0=Math.min.apply(null,xs),x1=Math.max.apply(null,xs),y0=Math.min.apply(null,ys),y1=Math.max.apply(null,ys),k=Math.cos((y0+y1)/2*Math.PI/180),w=(x1-x0)*k,h=y1-y0,e=Math.min(116/w,84/h),ox=(120-w*e)/2,oy=(88-h*e)/2,d='';
    f.geometry.coordinates.forEach(function(p){p.forEach(function(r){d+='M'+r.map(function(c){return (ox+(c[0]-x0)*k*e).toFixed(1)+','+(oy+(y1-c[1])*e).toFixed(1)}).join('L')+'Z'})});
    return '<svg viewBox="0 0 120 88" aria-hidden="true"><path d="'+d+'" fill="'+fill+'" stroke="rgba(43,48,69,.35)" stroke-width="1"/></svg>'}
  function color(v,brk){if(v==null)return 'url(#hatch)';for(var i=0;i<brk.length;i++)if(v<brk[i][0])return brk[i][1];return brk[brk.length-1][1]}
  var lons=[],lats=[];GEO.features.forEach(function(f){f.geometry.coordinates.forEach(function(p){p.forEach(function(r){r.forEach(function(c){lons.push(c[0]);lats.push(c[1])})})})});
  var minX=Math.min.apply(null,lons),maxX=Math.max.apply(null,lons),minY=Math.min.apply(null,lats),maxY=Math.max.apply(null,lats);
  var kx=Math.cos((minY+maxY)/2*Math.PI/180),MW=460,sc=MW/((maxX-minX)*kx),MH=(maxY-minY)*sc;
  function Pt(c){return ((c[0]-minX)*kx*sc).toFixed(1)+','+((maxY-c[1])*sc).toFixed(1)}
  function renderT(){
    var df=DEF[key],brk=df.brk;
    $('#tTitle').textContent=df.t; $('#mapDef').textContent=df.d;
    var s='<svg viewBox="-4 -4 '+(MW+8)+' '+(MH+8)+'"><defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#ebe8f2"/><line x1="0" y1="0" x2="0" y2="6" stroke="#aaa3bd" stroke-width="2"/></pattern></defs>';
    GEO.features.forEach(function(f){var n=f.properties.nombre,d='';f.geometry.coordinates.forEach(function(poly){poly.forEach(function(ring){d+='M'+ring.map(Pt).join('L')+'Z'})});
      s+='<path d="'+d+'" fill="'+color(T[n][key],brk)+'" data-n="'+esc(n)+'"'+(n===sel?' class="sel"':'')+'><title>'+esc(n)+': '+(T[n][key]==null?'sin dato':fmt(T[n][key],df.dig))+'</title></path>'});
    $('#map').innerHTML=s+'</svg>';
    $$('#map path').forEach(function(p){p.addEventListener('click',function(){sel=p.dataset.n;renderT()})});
    $('#mapLegend').innerHTML=brk.map(function(b){return '<span><i style="background:'+b[1]+'"></i>'+b[2]+'</span>'}).join('')+(key==='ql_plazas'?'<span><i style="background:repeating-linear-gradient(45deg,#aaa3bd 0 2px,#ebe8f2 2px 5px)"></i>sin dato</span>':'');
    /* dispersión: % 60+ contra % de la capa (o valor de la capa) */
    var pts=Object.keys(T).map(function(n){var a=T[n];return {n:n,abr:a.abr,x:a.pct_pob60,y:df.sh?df.sh(a):a[key]}}).filter(function(p){return p.y!=null});
    var W=440,H=330,pl=40,pb=36,pt=12,pr=12,mxX=Math.ceil(Math.max.apply(null,pts.map(function(p){return p.x}))/5)*5,mxY=df.sh?Math.max(mxX,Math.ceil(Math.max.apply(null,pts.map(function(p){return p.y}))/5)*5):Math.ceil(Math.max.apply(null,pts.map(function(p){return p.y}))*1.1*10)/10;
    function X(v){return pl+(W-pl-pr)*v/mxX} function Y(v){return pt+(H-pt-pb)*(1-v/mxY)}
    var g=svg(W,H,'Dispersión por alcaldía');
    for(var t=0;t<=mxX;t+=5)g+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+pt+'" y2="'+(H-pb)+'" stroke="rgba(63,71,96,.08)"/><text x="'+X(t)+'" y="'+(H-pb+14)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+t+'%</text>';
    var stepY=df.sh?5:(mxY>10?10:mxY>2?0.5:0.25);
    for(var u=0;u<=mxY+1e-9;u+=stepY)g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(u)+'" y2="'+Y(u)+'" stroke="rgba(63,71,96,.08)"/><text x="'+(pl-6)+'" y="'+(Y(u)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+(df.sh||df.pct?Math.round(u)+'%':fmt(u,2))+'</text>';
    if(df.sh)g+='<line x1="'+X(0)+'" x2="'+X(Math.min(mxX,mxY))+'" y1="'+Y(0)+'" y2="'+Y(Math.min(mxX,mxY))+'" stroke="#23806f" stroke-dasharray="5 4" stroke-width="1.5"/><text x="'+X(Math.min(mxX,mxY))+'" y="'+(Y(Math.min(mxX,mxY))+14)+'" text-anchor="end" font-size="11" fill="#23806f">proporcional</text>';
    else if(!df.pct)g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(1)+'" y2="'+Y(1)+'" stroke="#23806f" stroke-dasharray="5 4" stroke-width="1.5"/>';
    var placed=[];
    pts.slice().sort(function(a,b){return Y(a.y)-Y(b.y)}).forEach(function(p){var lx=X(p.x)+8,ly=Y(p.y)+3.5,tries=0;
      while(tries<6&&placed.some(function(q){return Math.abs(q[0]-lx)<p.abr.length*6+4&&Math.abs(q[1]-ly)<10})){ly+=11;tries++}
      placed.push([lx,ly]);p.lx=lx;p.ly=ly});
    pts.forEach(function(p){var c=color(T[p.n][key],brk);g+='<circle cx="'+X(p.x)+'" cy="'+Y(p.y)+'" r="'+(p.n===sel?7:5.5)+'" fill="'+c+'" stroke="'+(p.n===sel?'#2b3045':'#fff')+'" stroke-width="1.5" data-n="'+esc(p.n)+'" style="cursor:pointer"><title>'+esc(p.n)+'</title></circle><text x="'+p.lx+'" y="'+p.ly+'" '+MONO+' font-size="9.5" fill="rgba(43,48,69,.7)">'+p.abr+'</text>'});
    g+='<text x="'+(W-pr)+'" y="'+(H-4)+'" text-anchor="end" font-size="11" fill="'+FAINT+'">% de la población 60+ de la CDMX →</text>';
    g+='<text x="'+pl+'" y="'+(pt-2)+'" font-size="11" fill="'+FAINT+'">↑ '+(df.sh?df.shl:df.cv)+'</text>';
    $('#ch-scatter').innerHTML=g+'</svg>';
    $$('#ch-scatter circle').forEach(function(c){c.addEventListener('click',function(){sel=c.dataset.n;renderT()})});
    $('#scNote').textContent=df.sh?'Arriba de la diagonal: la alcaldía tiene más de lo que le tocaría por su población 60+.':(key==='ql_plazas'?'Línea: cociente igual a 1 (proporcional).':'Cada punto es una alcaldía.');
    var vals=Object.keys(T).filter(function(n){return T[n][key]!=null}).sort(function(a,b){return T[b][key]-T[a][key]});
    var hi=vals[0],lo=vals[vals.length-1];
    var suf=df.cv.indexOf('%')>-1?'%':'',nv=vals.length,sd=Object.keys(T).length-nv;
    $('#ext').innerHTML=[[hi,'Valor más alto'],[lo,'Valor más bajo']].map(function(e){return '<div><div class="hd"><div class="sil">'+silueta(e[0],color(T[e[0]][key],brk))+'</div><div><div class="kicker" style="margin:0 0 4px">'+e[1]+'</div><b class="num">'+fmt(T[e[0]][key],df.dig)+suf+'</b><div style="font-size:13px;margin-top:4px">'+esc(e[0])+'</div></div></div><div class="ext-fr">'+FR[key](e[0],T[e[0]])+(sd?' Entre '+nv+' alcaldías con dato.':'')+'</div></div>'}).join('');
    $('#thV').textContent=df.cv; $('#thC').textContent=df.cc;
    var rows=Object.keys(T).map(function(n){var a=T[n];return {n:n,v:a[key],c:df.c(a),p:a.pct_pob60}}).sort(function(a,b){return (b.v==null?-1e9:b.v)-(a.v==null?-1e9:a.v)});
    $('#tterr tbody').innerHTML=rows.map(function(r){return '<tr data-n="'+esc(r.n)+'"'+(r.n===sel?' class="sel"':'')+'><td>'+esc(r.n)+'</td><td class="n">'+(r.v==null?'s/d':fmt(r.v,df.dig))+(key==='sds_pct'?'<div class="muted" style="font-size:10.5px">p10–p90: '+fmt(T[r.n].sds_p10)+'–'+fmt(T[r.n].sds_p90)+'</div>':'')+'</td><td class="n">'+(r.c==null?'s/d':ent(r.c))+'</td><td class="n">'+fmt(r.p)+'%</td></tr>'}).join('');
    $$('#tterr tbody tr').forEach(function(tr){tr.addEventListener('click',function(){sel=tr.dataset.n;renderT()})});
    $('#src-terr').innerHTML=dl({Fuente:df.of,'Población 60+':'CSV por alcaldía (año no confirmado)',Advertencia:'Ningún par oferta–necesidad cumple la regla de compatibilidad; no es indicador de cobertura.',Archivo:esc(D.territorio.fuentes[df.f])});
  }
  seg('#segMap','k',function(k){key=k;renderT()}); renderT();
  OBS.T=T;
})();
