/* Observatorio del Cuidado · js/graficas/componentes.js
   Componentes de gráfica reutilizables: lolli, dona, waffle, anillos, líneas, rampa de color y rayado. Todo sale de D.
   Importa de OBS: FAINT, MONO, esc, fmt, isWeak, prec, svg
   Exporta a OBS:  C_INK, anillos, barrasGrupo, columnasGrupo, figurasSexo, barrasH, columnas, dona, figura, filaFiguras, hatchDef, iconosDano, lineas, lolli, pict, ramp, rayado, waffle */
(function(){
  var FAINT=OBS.FAINT,MONO=OBS.MONO,esc=OBS.esc,fmt=OBS.fmt,isWeak=OBS.isWeak
      ,prec=OBS.prec,svg=OBS.svg;
  function pict(k,n,on,off){var s='<svg viewBox="0 0 '+(n*30)+' 40" style="width:100%;max-width:330px;height:auto;display:block" aria-label="'+k+' de '+n+'">';
    for(var i=0;i<n;i++){var c=i<k?on:off,x=i*30;s+='<circle cx="'+(x+13)+'" cy="8" r="6" fill="'+c+'"/><path d="M'+(x+4)+' 38 v-12 a9 9 0 0 1 18 0 v12 z" fill="'+c+'"/>'}return s+'</svg>'}
  function barras(list,max){
    return list.map(function(e){
      var sc=100/max;
      return '<div class="bar'+(isWeak(e.precision)?' weak':'')+'"><div class="lab"><span>'+esc(e.etiqueta)+'</span><span class="v">'+fmt(e.pct)+'% '+prec(e.precision)+'</span></div><div class="track"><div class="fill" style="width:'+Math.min(100,e.pct*sc)+'%"></div>'+
        (e.li90!=null?'<div class="ci" style="left:'+Math.max(0,e.li90*sc)+'%;width:'+Math.max(0,(Math.min(max,e.ls90)-Math.max(0,e.li90))*sc)+'%"></div>':'')+'</div></div>';
    }).join('');
  }

  /* ===== componentes de gráfica (v2, 7 oct 2026): variedad en lugar de barras. Todo sale de D, nada a mano. ===== */
  var C_INK='#2b3045';
  function polar(cx,cy,r,a){return (cx+r*Math.cos(a)).toFixed(2)+','+(cy+r*Math.sin(a)).toFixed(2)}
  function arco(cx,cy,r0,r1,a0,a1){var big=a1-a0>Math.PI?1:0;
    return 'M'+polar(cx,cy,r1,a0)+'A'+r1+','+r1+' 0 '+big+' 1 '+polar(cx,cy,r1,a1)+'L'+polar(cx,cy,r0,a1)+'A'+r0+','+r0+' 0 '+big+' 0 '+polar(cx,cy,r0,a0)+'Z'}
  function hatchDef(id,col){return '<pattern id="'+id+'" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="'+col+'" stroke-width="2.4"/></pattern>'}
  function ramp(u){u=Math.max(0,Math.min(1,u));var a=[239,234,247],b=[93,77,143];return 'rgb('+a.map(function(c,i){return Math.round(c+(b[i]-c)*u)}).join(',')+')'}

  /* piruleta con intervalo (dot plot) */
  function lolli(list,max){
    if(!max)max=Math.min(100,Math.max(10,Math.ceil(Math.max.apply(null,list.map(function(e){return e.ls90!=null?e.ls90:e.pct}))/10)*10));
    var W=520,rowH=34,lab=200,x0=lab+6,x1=W-86,top=6,H=top+list.length*rowH+24;
    function X(v){return x0+(x1-x0)*Math.max(0,Math.min(v,max))/max}
    var s=svg(W,H,'Porcentaje por respuesta con intervalo de confianza');
    [0,.25,.5,.75,1].forEach(function(f){var v=max*f;s+='<line x1="'+X(v)+'" x2="'+X(v)+'" y1="'+top+'" y2="'+(H-20)+'" stroke="rgba(63,71,96,.08)"/><text x="'+X(v)+'" y="'+(H-6)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+Math.round(v)+'%</text>'});
    list.forEach(function(e,i){var cy=top+i*rowH+rowH/2,weak=isWeak(e.precision),col=weak?'#c0435a':'#5d4d8f';
      s+='<g><title>'+esc(e.etiqueta)+': '+fmt(e.pct)+'%'+(e.li90!=null?' (IC 90%: '+fmt(e.li90)+'–'+fmt(e.ls90)+')':'')+' · precisión '+esc(e.precision||'s/d')+'</title>';
      s+='<text x="0" y="'+(cy+4)+'" font-size="12.5" fill="'+(weak?FAINT:C_INK)+'">'+esc(e.etiqueta)+'</text>';
      s+='<line x1="'+X(0)+'" x2="'+X(e.pct)+'" y1="'+cy+'" y2="'+cy+'" stroke="#d6d0e6" stroke-width="2"/>';
      if(e.li90!=null)s+='<g stroke="'+C_INK+'" stroke-width="1.2" opacity=".55"><line x1="'+X(e.li90)+'" x2="'+X(e.ls90)+'" y1="'+cy+'" y2="'+cy+'"/><line x1="'+X(e.li90)+'" x2="'+X(e.li90)+'" y1="'+(cy-4)+'" y2="'+(cy+4)+'"/><line x1="'+X(e.ls90)+'" x2="'+X(e.ls90)+'" y1="'+(cy-4)+'" y2="'+(cy+4)+'"/></g>';
      s+='<circle cx="'+X(e.pct)+'" cy="'+cy+'" r="6.5" fill="'+(weak?'#fff':col)+'" stroke="'+(weak?col:'#fff')+'" stroke-width="2"/>';
      s+='<text x="'+(x1+14)+'" y="'+(cy+4)+'" '+MONO+' font-size="12" font-weight="'+(weak?400:700)+'" fill="'+(weak?FAINT:C_INK)+'">'+fmt(e.pct)+'%'+(weak?'<tspan font-size="9.5"> baja</tspan>':e.precision==='moderada'?'<tspan font-size="9.5" fill="'+FAINT+'"> mod.</tspan>':'')+'</text></g>'});
    return s+'</svg>'}

  /* dona: solo para categorías que suman 100 (respuesta única). Vertical: cabe en tarjetas angostas */
  function dona(list,conResto){
    var it=list.map(function(e){return {l:e.etiqueta,v:e.pct,w:isWeak(e.precision)}});
    if(conResto){var sm=it.reduce(function(a,e){return a+e.v},0);it.sort(function(a,b){return b.v-a.v});if(sm<99.5)it.push({l:'Otras respuestas',v:100-sm,w:false,r:true})}
    var W=340,cx=170,cy=100,R=92,r=60,a=-Math.PI/2,COLS=['#5d4d8f','#8a76b8','#b09fd3','#cfc5e6','#e6e0f1'],H=cy+R+18+it.length*25;
    var s=svg(W,H,'Distribución de respuestas')+'<defs>'+hatchDef('dnH','#c0435a')+'</defs>';
    it.forEach(function(e,i){e.col=e.r?'#e3e0ea':COLS[Math.min(i,COLS.length-1)];var da=Math.min(2*Math.PI-.002,2*Math.PI*e.v/100);
      s+='<path d="'+arco(cx,cy,r,R,a,a+da)+'" fill="'+(e.w?'url(#dnH)':e.col)+'" stroke="#fff" stroke-width="2"><title>'+esc(e.l)+': '+fmt(e.v)+'%</title></path>';a+=da});
    s+='<text x="'+cx+'" y="'+(cy+10)+'" text-anchor="middle" font-size="30" font-weight="740" fill="'+C_INK+'">'+fmt(it[0].v)+'%</text>';
    it.forEach(function(e,i){var y=cy+R+30+i*25;
      s+='<circle cx="10" cy="'+(y-4)+'" r="6" fill="'+(e.w?'#fff':e.col)+'" stroke="'+(e.w?'#c0435a':e.col)+'" stroke-width="'+(e.w?2:0)+'"/><text x="24" y="'+y+'" font-size="12.5" fill="'+(e.w?FAINT:C_INK)+'">'+esc(e.l)+'</text><text x="'+(W-4)+'" y="'+y+'" text-anchor="end" '+MONO+' font-size="12" font-weight="700" fill="'+(e.w?FAINT:C_INK)+'">'+fmt(e.v)+'%</text>'});
    return s+'</svg>'}

  /* waffle: cada cuadro ≈ 1% (redondeo por mayor resto) */
  function waffle(list){
    var it=list.map(function(e){return {l:e.etiqueta,v:e.pct,w:isWeak(e.precision)}}),sm=it.reduce(function(a,e){return a+e.v},0);
    if(sm<99.5)it.push({l:'Otras razones o sin especificar',v:100-sm,w:false,r:true});
    var cnt=it.map(function(e){return Math.floor(e.v)}),tot=cnt.reduce(function(a,b){return a+b},0);
    it.map(function(e,i){return [e.v-Math.floor(e.v),i]}).sort(function(a,b){return b[0]-a[0]}).forEach(function(p){if(tot<100){cnt[p[1]]++;tot++}});
    var COLS=['#5d4d8f','#8a76b8','#b09fd3','#d98a9a','#e0b25b','#cfc5e6'],cell=16,gap=3,W=340,gw=10*(cell+gap)-gap,x0=(W-gw)/2,H=gw+14+it.length*27+6;
    var s=svg(W,H,'Razón principal; un cuadro es aproximadamente 1%')+'<defs>'+hatchDef('wfH','#c0435a')+'</defs>',n=0;
    it.forEach(function(e,i){e.col=e.r?'#e3e0ea':COLS[Math.min(i,COLS.length-1)];
      for(var k=0;k<cnt[i];k++,n++){var x=x0+(n%10)*(cell+gap),y=Math.floor(n/10)*(cell+gap);
        s+='<rect x="'+x+'" y="'+y+'" width="'+cell+'" height="'+cell+'" rx="3" fill="'+(e.w?'url(#wfH)':e.col)+'"'+(e.w?' stroke="#c0435a" stroke-width="1"':'')+'><title>'+esc(e.l)+': '+fmt(e.v)+'%</title></rect>'}});
    it.forEach(function(e,i){var y=gw+32+i*27;
      s+='<rect x="2" y="'+(y-12)+'" width="14" height="14" rx="3" fill="'+(e.w?'url(#wfH)':e.col)+'"'+(e.w?' stroke="#c0435a"':'')+'/><text x="24" y="'+y+'" font-size="12.5" fill="'+(e.w?FAINT:C_INK)+'">'+esc(e.l)+'</text><text x="'+(W-4)+'" y="'+y+'" text-anchor="end" '+MONO+' font-size="12" font-weight="700" fill="'+(e.w?FAINT:C_INK)+'">'+fmt(e.v)+'%</text>'});
    return s+'</svg>'}

  /* anillos: una proporción por grupo (no son partes de un todo) */
  function anillos(list){
    var W=340,H=190,r=36,C=2*Math.PI*r,s=svg(W,H,'Proporción por grupo');
    list.forEach(function(e,i){var cx=57+i*113,cy=62,weak=isWeak(e.precision),L=C*e.pct/100;
      s+='<g><title>'+esc(e.etiqueta)+': '+fmt(e.pct)+'%'+(e.li90!=null?' (IC 90%: '+fmt(e.li90)+'–'+fmt(e.ls90)+')':'')+'</title>';
      s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="#ece8f5" stroke-width="12"/>';
      s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+(weak?'#d98a9a':'#7c6bb0')+'" stroke-width="12" stroke-dasharray="'+L.toFixed(2)+' '+(C-L).toFixed(2)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
      s+='<text x="'+cx+'" y="'+(cy+6)+'" text-anchor="middle" font-size="17" font-weight="740" fill="'+C_INK+'">'+fmt(e.pct)+'%</text>';
      s+='<text x="'+cx+'" y="'+(cy+r+26)+'" text-anchor="middle" font-size="12.5" font-weight="650" fill="'+C_INK+'">'+esc(e.etiqueta)+'</text>';
      if(e.li90!=null)s+='<text x="'+cx+'" y="'+(cy+r+42)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">IC 90%: '+fmt(e.li90,0)+'–'+fmt(e.ls90,0)+'</text>';
      s+='</g>'});
    return s+'</svg>'}

  /* líneas sobre categorías ordenadas; intervalos como barras finas o banda */
  function lineas(o){
    var W=o.W||560,H=o.H||270,pl=44,pr=o.pr||130,pt=24,pb=o.pb||56,n=o.cats.length,mx=o.max;
    function X(i){return pl+(W-pl-pr)*(i+.5)/n} function Y(v){return pt+(H-pt-pb)*(1-v/mx)}
    var s=svg(W,H,o.aria),U=o.unit||'';
    o.ticks.forEach(function(t){s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="rgba(63,71,96,.1)"/><text x="'+(pl-8)+'" y="'+(Y(t)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+t+U+'</text>'});
    o.cats.forEach(function(c,i){s+='<text x="'+X(i)+'" y="'+(H-pb+36)+'" text-anchor="middle" font-size="12.5" font-weight="650" fill="'+C_INK+'">'+esc(c)+'</text>'+(o.sub&&o.sub[i]?'<text x="'+X(i)+'" y="'+(H-pb+52)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+esc(o.sub[i])+'</text>':'')});
    var top=o.cats.map(function(c,i){var b=0,by=-1;o.series.forEach(function(sr,j){var p=sr.pts[i];if(p&&p.y!=null&&p.y>by){by=p.y;b=j}});return b});
    o.series.forEach(function(sr,j){
      var path='',up='',lo='',allCI=sr.pts.every(function(p){return p&&p.li!=null});
      sr.pts.forEach(function(p,i){if(p&&p.y!=null)path+=(path?'L':'M')+X(i).toFixed(1)+','+Y(p.y).toFixed(1)});
      if(o.band&&allCI){sr.pts.forEach(function(p,i){up+=(up?'L':'M')+X(i).toFixed(1)+','+Y(p.ls).toFixed(1)});for(var i=sr.pts.length-1;i>=0;i--)lo+='L'+X(i).toFixed(1)+','+Y(sr.pts[i].li).toFixed(1);
        s+='<path d="'+up+lo+'Z" fill="'+sr.col+'" opacity=".14"/>'}
      s+='<path d="'+path+'" fill="none" stroke="'+sr.col+'" stroke-width="2.5" stroke-linejoin="round" opacity=".9"/>';
      sr.pts.forEach(function(p,i){if(!p||p.y==null)return;var x=X(i),pc=p.col||sr.col;
        if(!o.band&&p.li!=null)s+='<g stroke="'+C_INK+'" stroke-width="1.2" opacity=".5"><line x1="'+x+'" x2="'+x+'" y1="'+Y(p.ls)+'" y2="'+Y(p.li)+'"/><line x1="'+(x-5)+'" x2="'+(x+5)+'" y1="'+Y(p.ls)+'" y2="'+Y(p.ls)+'"/><line x1="'+(x-5)+'" x2="'+(x+5)+'" y1="'+Y(p.li)+'" y2="'+Y(p.li)+'"/></g>';
        s+='<circle cx="'+x+'" cy="'+Y(p.y)+'" r="6" fill="'+(p.weak?'#fff':pc)+'" stroke="'+(p.weak?pc:'#fff')+'" stroke-width="'+(p.weak?2.5:2)+'"><title>'+esc(sr.nombre?sr.nombre+' · ':'')+esc(o.cats[i])+': '+fmt(p.y)+U+(p.li!=null?' (IC 90%: '+fmt(p.li)+'–'+fmt(p.ls)+')':'')+(p.tip?' · '+esc(p.tip):'')+'</title></circle>';
        var above=o.series.length===1||top[i]===j,ty=above?Y(!o.band&&p.ls!=null?p.ls:p.y)-(p.ls!=null&&!o.band?7:11):Y(!o.band&&p.li!=null?p.li:p.y)+(p.li!=null&&!o.band?17:20);
        s+='<text x="'+x+'" y="'+ty+'" text-anchor="middle" '+MONO+' font-size="11.5" font-weight="700" fill="'+(p.weak?FAINT:C_INK)+'">'+fmt(p.y)+'</text>'})});
    var ends=[];o.series.forEach(function(sr,j){if(!sr.nombre)return;var p=sr.pts[n-1];if(p&&p.y!=null)ends.push({y:Y(p.y)+4,sr:sr})});
    ends.sort(function(a,b){return a.y-b.y});for(var k=1;k<ends.length;k++)if(ends[k].y-ends[k-1].y<16)ends[k].y=ends[k-1].y+16;
    ends.forEach(function(e){s+='<circle cx="'+(X(n-1)+22)+'" cy="'+(e.y-4)+'" r="5" fill="'+e.sr.col+'"/><text x="'+(X(n-1)+32)+'" y="'+e.y+'" font-size="12.5" font-weight="650" fill="'+C_INK+'">'+esc(e.sr.nombre)+'</text>'});
    return s+'</svg>'}

  /* ===== v3 (7 oct 2026, noche): gráficas más comunes a pedido de Omar. Mismos datos de D. ===== */
  var C_RED='#c0435a',C_PUR='#5d4d8f',C_REF='#b8b3c9',C_OFF='#dcd7e8';
  function rayado(id){return '<pattern id="'+id+'" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#eceaf1"/><line x1="0" y1="0" x2="0" y2="5" stroke="#b5afc6" stroke-width="2"/></pattern>'}
  /* figura de persona en una caja de 22×40; dano=true agrega venda en la cabeza y grieta en el torso */
  function figura(x,y,col,dano,extra){
    var s='<circle cx="'+(x+11)+'" cy="'+(y+8)+'" r="6.5" fill="'+col+'"'+(extra||'')+'/><path d="M'+(x+2)+' '+(y+40)+' v-13 a9 9 0 0 1 18 0 v13 z" fill="'+col+'"'+(extra||'')+'/>';
    if(dano)s+='<g transform="rotate(38 '+(x+13.5)+' '+(y+5)+')"><rect x="'+(x+8.5)+'" y="'+(y+3.3)+'" width="10" height="3.6" rx="1.4" fill="#fff" opacity=".95"/><rect x="'+(x+12.2)+'" y="'+(y+3.3)+'" width="2.6" height="3.6" fill="'+col+'" opacity=".35"/></g>'+
      '<path d="M'+(x+12.5)+' '+(y+22)+' l-3.2 5 l4 2.2 l-3.4 6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>';
    return s}
  /* fila de n figuras; pct de 0 a 100; la figura del resto se rellena en parte */
  function filaFiguras(x0,y,pct,n,on,off,cid,paso){
    paso=paso||26;var k=pct/100*n,full=Math.floor(k),fr=k-full,s='';
    for(var i=0;i<n;i++){var x=x0+i*paso;
      if(i<full)s+=figura(x,y,on,true);
      else if(i===full&&fr>0.02){s+='<clipPath id="'+cid+i+'"><rect x="'+x+'" y="'+y+'" width="'+(22*fr).toFixed(1)+'" height="41"/></clipPath>'+figura(x,y,off,false)+'<g clip-path="url(#'+cid+i+')">'+figura(x,y,on,false)+'</g>'}
      else s+=figura(x,y,off,false)}
    return s}
  /* pictograma por filas: necesidad declarada (barra corta) y, de esas personas, cuántas declaran daño (10 figuras) */
  function iconosDano(rows){
    var W=660,top=46,rowH=66,H=top+rows.length*rowH+8,xN=128,wN=96,xF=262,xV=532;
    var s=svg(W,H,'De cada 10 personas que dicen no haber tenido necesidad, cuántas declaran daño, por horas de cuidado');
    s+='<text x="0" y="16" font-size="11" font-weight="700" fill="#77689d" letter-spacing=".06em">HORAS</text>';
    s+='<text x="'+xN+'" y="16" font-size="11" font-weight="700" fill="#77689d" letter-spacing=".06em">DICE «NO TUVE</text><text x="'+xN+'" y="30" font-size="11" font-weight="700" fill="#77689d" letter-spacing=".06em">NECESIDAD»</text>';
    s+='<text x="'+xF+'" y="16" font-size="11" font-weight="700" fill="#77689d" letter-spacing=".06em">DE CADA 10 QUE LO DICEN, CUÁNTAS DECLARAN DAÑO</text><text x="'+xF+'" y="30" font-size="11" fill="'+FAINT+'">a su salud o a su trabajo</text>';
    s+='<line x1="0" x2="'+W+'" y1="'+(top-6)+'" y2="'+(top-6)+'" stroke="rgba(63,71,96,.15)"/>';
    rows.forEach(function(r,i){var y=top+i*rowH,cy=y+rowH/2;
      s+='<text x="0" y="'+(cy-2)+'" font-size="15" font-weight="700" fill="'+C_INK+'">'+esc(r.lbl)+'</text><text x="0" y="'+(cy+15)+'" font-size="11" fill="'+FAINT+'">a la semana</text>';
      s+='<g><title>Dice «no tuve necesidad»: '+fmt(r.nec.pct)+'% (IC 90%: '+fmt(r.nec.li90)+'–'+fmt(r.nec.ls90)+')</title><rect x="'+xN+'" y="'+(cy-12)+'" width="'+wN+'" height="8" rx="4" fill="#ece8f5"/><rect x="'+xN+'" y="'+(cy-12)+'" width="'+(wN*r.nec.pct/100).toFixed(1)+'" height="8" rx="4" fill="#8a76b8"/>';
      s+='<text x="'+xN+'" y="'+(cy+14)+'" '+MONO+' font-size="13" font-weight="700" fill="'+C_INK+'">'+fmt(r.nec.pct)+'%</text></g>';
      s+='<g><title>Declara daño: '+fmt(r.dano.pct)+'% (IC 90%: '+fmt(r.dano.li90)+'–'+fmt(r.dano.ls90)+') · n = '+r.dano.n+'</title>'+filaFiguras(xF,y+12,r.dano.pct,10,C_RED,C_OFF,'cf'+i+'_')+'</g>';
      s+='<text x="'+(xV)+'" y="'+(cy+2)+'" '+MONO+' font-size="22" font-weight="760" fill="'+C_RED+'">'+fmt(r.dano.pct)+'%</text>';
      s+='<text x="'+(xV)+'" y="'+(cy+18)+'" '+MONO+' font-size="10" fill="'+FAINT+'">IC 90%: '+fmt(r.dano.li90,0)+'–'+fmt(r.dano.ls90,0)+'</text>';
      if(i<rows.length-1)s+='<line x1="0" x2="'+W+'" y1="'+(y+rowH)+'" y2="'+(y+rowH)+'" stroke="rgba(63,71,96,.07)"/>'});
    var lg='<div class="legend"><span><svg width="14" height="22" viewBox="0 0 22 40" style="vertical-align:-6px;margin-right:5px">'+figura(0,0,C_RED,true)+'</svg>Declara daño a su salud o a su trabajo</span><span><svg width="14" height="22" viewBox="0 0 22 40" style="vertical-align:-6px;margin-right:5px">'+figura(0,0,C_OFF,false)+'</svg>No declara daño</span><span>1 figura = 10% · la última se llena en parte</span></div>';
    return s+'</svg>'+lg}
  /* barras horizontales con IC; precisión baja = rayado gris; o.max, o.col, o.nota */
  function barrasH(list,o){o=o||{};
    var mx=o.max||Math.min(100,Math.max(10,Math.ceil(Math.max.apply(null,list.map(function(e){return e.ls90!=null?e.ls90:e.pct}))/10)*10));
    var up=!!o.arriba,W=o.W||(up?340:520),rowH=o.rowH||(up?46:32),lab=o.lab||188,x0=up?10:lab+8,x1=W-(up?62:78),top=4,H=top+list.length*rowH+(o.nota?(up?54:40):24),col=o.col||C_PUR;
    function X(v){return x0+(x1-x0)*Math.max(0,Math.min(v,mx))/mx}
    var s=svg(W,H,o.aria||'Porcentaje por respuesta')+'<defs>'+rayado('bhR')+'</defs>';
    for(var t=0;t<=mx;t+=mx/4)s+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+top+'" y2="'+(top+list.length*rowH)+'" stroke="rgba(63,71,96,'+(t?'.08':'.3')+')"/><text x="'+X(t)+'" y="'+(top+list.length*rowH+14)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+Math.round(t)+'%</text>';
    list.forEach(function(e,i){var cy=top+i*rowH+rowH/2,weak=isWeak(e.precision),mod=e.precision==='moderada';
      s+='<g><title>'+esc(e.etiqueta)+': '+fmt(e.pct)+'%'+(e.li90!=null?' (IC 90%: '+fmt(e.li90)+'–'+fmt(e.ls90)+')':'')+' · precisión '+esc(e.precision||'s/d')+'</title>';
      if(up){s+='<text x="0" y="'+(cy-9)+'" font-size="12.5" fill="'+(weak?FAINT:C_INK)+'">'+esc(e.etiqueta)+'</text>';cy+=7}
      else s+='<text x="0" y="'+(cy+4)+'" font-size="12.5" fill="'+(weak?FAINT:C_INK)+'">'+esc(e.etiqueta)+'</text>';
      s+='<rect x="'+X(0)+'" y="'+(cy-8)+'" width="'+Math.max(1.5,X(e.pct)-X(0)).toFixed(1)+'" height="16" rx="3" fill="'+(weak?'url(#bhR)':col)+'"'+(weak?' stroke="#b5afc6"':'')+(mod?' opacity=".72"':'')+'/>';
      if(e.li90!=null&&!weak)s+='<g stroke="'+C_INK+'" stroke-width="1.2" opacity=".6"><line x1="'+X(e.li90)+'" x2="'+X(e.ls90)+'" y1="'+cy+'" y2="'+cy+'"/><line x1="'+X(e.li90)+'" x2="'+X(e.li90)+'" y1="'+(cy-4)+'" y2="'+(cy+4)+'"/><line x1="'+X(e.ls90)+'" x2="'+X(e.ls90)+'" y1="'+(cy-4)+'" y2="'+(cy+4)+'"/></g>';
      var xv=Math.max(X(e.pct),e.ls90!=null&&!weak?X(e.ls90):0)+8;
      s+='<text x="'+xv+'" y="'+(cy+4)+'" '+MONO+' font-size="12" font-weight="'+(weak?400:700)+'" fill="'+(weak?FAINT:C_INK)+'">'+fmt(e.pct)+'%'+(weak?'<tspan font-size="9.5"> baja</tspan>':mod?'<tspan font-size="9.5" fill="'+FAINT+'" font-weight="400"> mod.</tspan>':'')+'</text></g>'});
    if(o.nota){var ln=up?o.nota.split('. ').map(function(t,i,a){return t+(i<a.length-1?'.':'')}):[o.nota];ln.forEach(function(t,i){s+='<text x="0" y="'+(H-4-(ln.length-1-i)*14)+'" font-size="11" fill="'+FAINT+'">'+esc(t)+'</text>'})}
    return s+'</svg>'}
  /* columnas verticales con IC y línea de referencia (total) */
  function columnas(list,o){o=o||{};
    var W=340,H=250,pl=34,pt=26,pb=44,mx=o.max||60,n=list.length,gw=(W-pl-10)/n,bw=Math.min(74,gw*.5);
    function Y(v){return pt+(H-pt-pb)*(1-v/mx)}
    var s=svg(W,H,o.aria||'Porcentaje por grupo');
    for(var t=0;t<=mx;t+=mx/4)s+='<line x1="'+pl+'" x2="'+W+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="rgba(63,71,96,'+(t?'.08':'.3')+')"/><text x="'+(pl-6)+'" y="'+(Y(t)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+Math.round(t)+'%</text>';
    list.forEach(function(e,i){var cx=pl+gw*(i+.5),x=cx-bw/2;
      s+='<g><title>'+esc(e.etiqueta)+': '+fmt(e.pct)+'% (IC 90%: '+fmt(e.li90)+'–'+fmt(e.ls90)+')</title><rect x="'+x+'" y="'+Y(e.pct)+'" width="'+bw+'" height="'+(Y(0)-Y(e.pct))+'" rx="4" fill="'+(e.col||C_PUR)+'"/>';
      s+='<g stroke="'+C_INK+'" stroke-width="1.2" opacity=".6"><line x1="'+cx+'" x2="'+cx+'" y1="'+Y(e.ls90)+'" y2="'+Y(e.li90)+'"/><line x1="'+(cx-5)+'" x2="'+(cx+5)+'" y1="'+Y(e.ls90)+'" y2="'+Y(e.ls90)+'"/><line x1="'+(cx-5)+'" x2="'+(cx+5)+'" y1="'+Y(e.li90)+'" y2="'+Y(e.li90)+'"/></g>';
      s+='<text x="'+cx+'" y="'+(Y(e.pct)+(Y(0)-Y(e.pct))/2+6)+'" text-anchor="middle" '+MONO+' font-size="17" font-weight="760" fill="#fff">'+fmt(e.pct)+'%</text>';
      s+='<text x="'+cx+'" y="'+(H-pb+18)+'" text-anchor="middle" font-size="12.5" font-weight="650" fill="'+C_INK+'">'+esc(e.etiqueta)+'</text></g>'});
    if(o.ref){s+='<line x1="'+pl+'" x2="'+W+'" y1="'+Y(o.ref.pct)+'" y2="'+Y(o.ref.pct)+'" stroke="'+C_INK+'" stroke-dasharray="5 4" opacity=".7"/>';
      s+='<text x="'+W+'" y="'+(H-6)+'" text-anchor="end" font-size="11" fill="'+FAINT+'">- - - '+esc(o.ref.etiqueta)+': '+fmt(o.ref.pct)+'%</text>'}
    return s+'</svg>'}
  OBS.figura=figura;OBS.filaFiguras=filaFiguras;OBS.iconosDano=iconosDano;OBS.barrasH=barrasH;OBS.columnas=columnas;OBS.rayado=rayado;
  /* barras horizontales agrupadas: una etiqueta por categoría y una barra por serie (con IC) */
  function barrasGrupo(cats,series,o){o=o||{};
    var W=o.W||340,bh=14,gapS=5,lblH=21,gapC=16,x0=0,x1=W-66,mx=o.max||100,top=4,nS=series.length;
    var catH=lblH+nS*(bh+gapS),H=top+cats.length*(catH+gapC)+18+(o.nota?32:0);
    function X(v){return x0+(x1-x0)*Math.max(0,Math.min(v,mx))/mx}
    var s=svg(W,H,o.aria||'Barras agrupadas')+'<defs>'+rayado('bgR')+'</defs>',y=top;
    var yEnd=top+cats.length*(catH+gapC)-gapC;
    for(var t=0;t<=mx;t+=mx/4)s+='<line x1="'+X(t)+'" x2="'+X(t)+'" y1="'+(top+lblH-4)+'" y2="'+yEnd+'" stroke="rgba(63,71,96,'+(t?'.08':'.3')+')"/><text x="'+X(t)+'" y="'+(yEnd+14)+'" text-anchor="'+(t?'middle':'start')+'" '+MONO+' font-size="10" fill="'+FAINT+'">'+Math.round(t)+'%</text>';
    cats.forEach(function(c,ci){
      s+='<text x="0" y="'+(y+13)+'" font-size="12.5" font-weight="650" fill="'+C_INK+'">'+esc(c)+'</text>';var yb=y+lblH;
      series.forEach(function(sr){var e=sr.vals[ci];if(!e){yb+=bh+gapS;return}var weak=isWeak(e.precision),cy=yb+bh/2;
        s+='<g><title>'+esc(sr.nombre)+' · '+esc(c)+': '+fmt(e.pct)+'%'+(e.li90!=null?' (IC 90%: '+fmt(e.li90)+'–'+fmt(e.ls90)+')':'')+' · precisión '+esc(e.precision||'s/d')+'</title>';
        s+='<rect x="'+X(0)+'" y="'+yb+'" width="'+Math.max(1.5,X(e.pct)-X(0)).toFixed(1)+'" height="'+bh+'" rx="2.5" fill="'+(weak?'url(#bgR)':sr.col)+'"'+(weak?' stroke="#b5afc6"':'')+'/>';
        if(e.li90!=null&&!weak)s+='<g stroke="'+C_INK+'" stroke-width="1.1" opacity=".55"><line x1="'+X(e.li90)+'" x2="'+X(e.ls90)+'" y1="'+cy+'" y2="'+cy+'"/><line x1="'+X(e.li90)+'" x2="'+X(e.li90)+'" y1="'+(cy-3.5)+'" y2="'+(cy+3.5)+'"/><line x1="'+X(e.ls90)+'" x2="'+X(e.ls90)+'" y1="'+(cy-3.5)+'" y2="'+(cy+3.5)+'"/></g>';
        var xv=Math.max(X(e.pct),e.ls90!=null&&!weak?X(e.ls90):0)+7;
        s+='<text x="'+xv+'" y="'+(cy+4)+'" '+MONO+' font-size="11" font-weight="'+(weak?400:700)+'" fill="'+(weak?FAINT:C_INK)+'">'+fmt(e.pct)+'%'+(weak?'<tspan font-size="9"> baja</tspan>':'')+'</text></g>';
        yb+=bh+gapS});
      y+=catH+gapC});
    if(o.nota){var nl=o.nota.split(' | ');nl.forEach(function(t,i){s+='<text x="0" y="'+(H-3-(nl.length-1-i)*14)+'" font-size="10.5" fill="'+FAINT+'">'+esc(t)+'</text>'})}
    var lg='<div class="legend">'+series.map(function(sr){return '<span><i style="background:'+sr.col+'"></i>'+esc(sr.nombre)+'</span>'}).join('')+'</div>';
    return s+'</svg>'+lg}
  OBS.barrasGrupo=barrasGrupo;
  /* columnas verticales agrupadas (una o varias series) con IC; etiquetas largas en varias líneas */
  function partir(t,n){var w=String(t).split(' '),L=[],c='';w.forEach(function(p){if((c+' '+p).trim().length>n&&c){L.push(c);c=p}else c=(c+' '+p).trim()});if(c)L.push(c);return L}
  function columnasGrupo(cats,series,o){o=o||{};
    var nS=series.length,W=o.W||520,pl=36,pr=6,pt=30,lines=cats.map(function(c){return partir(c,o.corte||14)}),nl=Math.max.apply(null,lines.map(function(l){return l.length}));
    var pb=16+nl*15+(o.nota?10+o.nota.split(' | ').length*14:0),H=(o.H||300)+pb-40,mx=o.max||100,gw=(W-pl-pr)/cats.length,bw=Math.min(o.bw||44,gw*.72/nS),gap=4;
    function Y(v){return pt+(H-pt-pb)*(1-Math.max(0,Math.min(v,mx))/mx)}
    var s=svg(W,H,o.aria||'Columnas')+'<defs>'+rayado('cgR')+'</defs>';
    for(var t=0;t<=mx;t+=mx/4)s+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(t)+'" y2="'+Y(t)+'" stroke="rgba(63,71,96,'+(t?'.08':'.3')+')"/><text x="'+(pl-6)+'" y="'+(Y(t)+3.5)+'" text-anchor="end" '+MONO+' font-size="10" fill="'+FAINT+'">'+Math.round(t)+'%</text>';
    cats.forEach(function(c,ci){var cx=pl+gw*(ci+.5),x0=cx-(nS*bw+(nS-1)*gap)/2,allWeak=series.every(function(sr){var e=sr.vals[ci];return !e||isWeak(e.precision)});
      series.forEach(function(sr,si){var e=sr.vals[ci];if(!e)return;var weak=isWeak(e.precision),mod=e.precision==='moderada',x=x0+si*(bw+gap),bx=x+bw/2,hasCI=e.li90!=null&&!weak;
        s+='<g><title>'+(nS>1?esc(sr.nombre)+' · ':'')+esc(c)+': '+fmt(e.pct)+'%'+(e.li90!=null?' (IC 90%: '+fmt(e.li90)+'–'+fmt(e.ls90)+')':'')+' · precisión '+esc(e.precision||'s/d')+'</title>';
        s+='<rect x="'+x.toFixed(1)+'" y="'+Y(e.pct).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1.5,Y(0)-Y(e.pct)).toFixed(1)+'" rx="3" fill="'+(weak?'url(#cgR)':sr.col)+'"'+(weak?' stroke="#b5afc6"':'')+(mod&&nS===1?' opacity=".72"':'')+'/>';
        if(hasCI)s+='<g stroke="'+C_INK+'" stroke-width="1.2" opacity=".55"><line x1="'+bx+'" x2="'+bx+'" y1="'+Y(e.ls90)+'" y2="'+Y(e.li90)+'"/><line x1="'+(bx-4)+'" x2="'+(bx+4)+'" y1="'+Y(e.ls90)+'" y2="'+Y(e.ls90)+'"/><line x1="'+(bx-4)+'" x2="'+(bx+4)+'" y1="'+Y(e.li90)+'" y2="'+Y(e.li90)+'"/></g>';
        var ty=Y(hasCI?e.ls90:e.pct)-7;
        s+='<text x="'+bx+'" y="'+ty+'" text-anchor="middle" '+MONO+' font-size="'+(nS>1?11:12.5)+'" font-weight="'+(weak?400:700)+'" fill="'+(weak?FAINT:C_INK)+'">'+fmt(e.pct)+'%</text>';
        if(weak||(mod&&nS===1))s+='<text x="'+bx+'" y="'+(ty-13)+'" text-anchor="middle" font-size="9.5" fill="'+FAINT+'">'+(weak?'baja':'mod.')+'</text>';
        s+='</g>'});
      lines[ci].forEach(function(l,li){s+='<text x="'+cx+'" y="'+(Y(0)+17+li*15)+'" text-anchor="middle" font-size="12" font-weight="650" fill="'+(allWeak?FAINT:C_INK)+'">'+esc(l)+'</text>'})});
    if(o.nota){var nn=o.nota.split(' | ');nn.forEach(function(t,i){s+='<text x="0" y="'+(H-3-(nn.length-1-i)*14)+'" font-size="10.5" fill="'+FAINT+'">'+esc(t)+'</text>'})}
    var lg=nS>1?'<div class="legend">'+series.map(function(sr){return '<span><i style="background:'+sr.col+'"></i>'+esc(sr.nombre)+'</span>'}).join('')+'</div>':'';
    return s+'</svg>'+lg}
  OBS.columnasGrupo=columnasGrupo;
  /* figuras de mujer y hombre que se llenan de abajo hacia arriba según el % (escala 0–100 = alto de la figura) */
  function siluetaSexo(x,y,muj){var h='<circle cx="'+(x+30)+'" cy="'+(y+14)+'" r="13"/>';
    if(muj)return h+'<path d="M'+(x+18)+' '+(y+32)+' H'+(x+42)+' Q'+(x+46)+' '+(y+33)+' '+(x+47)+' '+(y+38)+' L'+(x+55)+' '+(y+92)+' H'+(x+5)+' L'+(x+13)+' '+(y+38)+' Q'+(x+14)+' '+(y+33)+' '+(x+18)+' '+(y+32)+' Z"/><rect x="'+(x+19)+'" y="'+(y+92)+'" width="8" height="28" rx="3"/><rect x="'+(x+33)+'" y="'+(y+92)+'" width="8" height="28" rx="3"/>';
    return h+'<rect x="'+(x+13)+'" y="'+(y+32)+'" width="34" height="56" rx="10"/><rect x="'+(x+16)+'" y="'+(y+80)+'" width="12" height="40" rx="4"/><rect x="'+(x+32)+'" y="'+(y+80)+'" width="12" height="40" rx="4"/>'}
  function figurasSexo(cats,mv,hv,o){o=o||{};
    var COLM=o.colM||'#e0709b',COLH=o.colH||'#3b7dd8',fw=60,fh=120,gap=14,W=o.W||520,n=cats.length,gw=W/n,top=36,H=top+fh+70+(o.nota?32:0);
    var s=svg(W,H,o.aria||'Figuras por sexo')+'<defs>'+rayado('fsR')+'</defs>',uid='fs'+Math.random().toString(36).slice(2,7);
    cats.forEach(function(c,ci){var cx=gw*(ci+.5),x0=cx-fw-gap/2;
      [[mv[ci],true,COLM,'Mujeres'],[hv[ci],false,COLH,'Hombres']].forEach(function(p,k){var e=p[0];if(!e)return;var x=x0+k*(fw+gap),weak=isWeak(e.precision),id=uid+ci+k,fy=top+fh*(1-Math.max(0,Math.min(e.pct,100))/100);
        s+='<g><title>'+p[3]+' que cuidan · '+esc(c)+': '+fmt(e.pct)+'%'+(e.li90!=null?' (IC 90%: '+fmt(e.li90)+'–'+fmt(e.ls90)+')':'')+' · precisión '+esc(e.precision||'s/d')+'</title>';
        s+='<clipPath id="'+id+'"><rect x="'+x+'" y="'+fy.toFixed(1)+'" width="'+fw+'" height="'+(top+fh-fy+1).toFixed(1)+'"/></clipPath>';
        s+='<g fill="#e7e3ef">'+siluetaSexo(x,top,p[1])+'</g><g fill="'+(weak?'url(#fsR)':p[2])+'" clip-path="url(#'+id+')">'+siluetaSexo(x,top,p[1])+'</g>';
        s+='<line x1="'+(x-3)+'" x2="'+(x+fw+3)+'" y1="'+fy.toFixed(1)+'" y2="'+fy.toFixed(1)+'" stroke="'+(weak?FAINT:p[2])+'" stroke-width="1.2" stroke-dasharray="3 2" opacity=".8"/>';
        s+='<text x="'+(x+fw/2)+'" y="'+(top-10)+'" text-anchor="middle" '+MONO+' font-size="14" font-weight="'+(weak?400:760)+'" fill="'+(weak?FAINT:p[2])+'">'+fmt(e.pct)+'%</text>';
        if(weak)s+='<text x="'+(x+fw/2)+'" y="'+(top+fh+14)+'" text-anchor="middle" font-size="9.5" fill="'+FAINT+'">precisión baja</text>';
        s+='</g>'});
      partir(c,16).forEach(function(l,li){s+='<text x="'+cx+'" y="'+(top+fh+34+li*15)+'" text-anchor="middle" font-size="12.5" font-weight="650" fill="'+C_INK+'">'+esc(l)+'</text>'})});
    if(o.nota){var nn=o.nota.split(' | ');nn.forEach(function(t,i){s+='<text x="0" y="'+(H-3-(nn.length-1-i)*14)+'" font-size="10.5" fill="'+FAINT+'">'+esc(t)+'</text>'})}
    var lg='<div class="legend"><span><i style="background:'+COLM+'"></i>Mujeres que cuidan</span><span><i style="background:'+COLH+'"></i>Hombres que cuidan</span><span>Figura llena = 100%</span></div>';
    return s+'</svg>'+lg}
  OBS.figurasSexo=figurasSexo;
  OBS.C_INK=C_INK;OBS.anillos=anillos;OBS.dona=dona;OBS.hatchDef=hatchDef;
  OBS.lineas=lineas;OBS.lolli=lolli;OBS.pict=pict;OBS.ramp=ramp;
  OBS.waffle=waffle;
})();
