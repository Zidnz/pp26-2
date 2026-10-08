  /* Comparar segmentos: tres vistas tipo Tableau sobre D.seg (script 12).
     div = barras divergentes (diferencia contra el resto, con IC)
     lol = lollipop ordenado (% del segmento, con línea y banda del total)
     tab = tabla de calor (% con color secuencial + diferencia con ▲▼=)
     Ninguna cifra se escribe a mano: todo sale de SG(k,dim,seg). */
  function comparador(el,k,v){
    v=v||'div';
    var UP='#c0435a',DN='#23806f',NS='#b7aed0',NSI='#77689d',INK='#2b3045';
    var COL={up:UP,down:DN,eq:NS,weak:NSI},SYC={up:UP,down:DN,eq:NSI,weak:FAINT},SYM={up:'▲',down:'▼',eq:'=',weak:'–'};
    var t=SG(k,'Total','Total'),rows=[];
    DIMS_S.forEach(function(d){if(d!=='Total')lv(d).forEach(function(g){var r=SG(k,d,g);if(r)rows.push({d:d,g:g,r:r})})});
    if(!t||!rows.length){$(el).innerHTML='<p class="muted">Sin datos para este indicador.</p>';return}
    var anyMod=false,anyWeak=false;
    rows.forEach(function(x){var r=x.r;
      x.weak=isWeak(r.precision);x.hasDif=!x.weak&&r.dif_pp!=null;x.mod=r.precision==='moderada';
      x.st=!x.hasDif?'weak':(r.dif_significativa===true||r.dif_significativa==='True')?(r.dif_pp>0?'up':'down'):'eq';
      x.sel=x.d===F.dim&&x.g===F.seg;if(x.mod)anyMod=true;if(x.weak)anyWeak=true});
    function sg(n){return (n>0?'+':n<0?'−':'')+fmt(Math.abs(n))}
    function nm(x){return x.g.replace('>=','≥ ').replace('<','< ')}
    function tip(x){var r=x.r;
      return esc(x.d+' · '+nm(x))+': '+fmt(r.pct)+'% (IC 90%: '+fmt(r.li90)+'–'+fmt(r.ls90)+')'+
        (x.hasDif?'. Frente al resto de la dimensión: '+sg(r.dif_pp)+' pp (IC '+sg(r.dif_li90)+' a '+sg(r.dif_ls90)+')':'. No se compara: precisión baja')+
        '. n = '+ent(r.n_muestra_dominio)+' · precisión '+esc(r.precision)}
    function hit(x,y,h,W,inner){
      return '<g data-d="'+esc(x.d)+'" data-g="'+esc(x.g)+'" style="cursor:pointer"><title>'+tip(x)+'</title><rect x="0" y="'+y+'" width="'+W+'" height="'+h+'" rx="4" fill="'+(x.sel?'rgba(119,104,157,.14)':'transparent')+'"/>'+inner+'</g>'}
    function capIC(a,b,cy,col,w,op){
      return '<g stroke="'+col+'" stroke-width="'+w+'" opacity="'+op+'"><line x1="'+a+'" x2="'+b+'" y1="'+cy+'" y2="'+cy+'"/><line x1="'+a+'" x2="'+a+'" y1="'+(cy-4)+'" y2="'+(cy+4)+'"/><line x1="'+b+'" x2="'+b+'" y1="'+(cy-4)+'" y2="'+(cy+4)+'"/></g>'}
    function totRow(W,x0,x1,txt){
      var on=F.dim==='Total';
      return '<g data-d="Total" data-g="Total" style="cursor:pointer"><title>Total nacional: clic para quitar el filtro</title><rect x="0" y="0" width="'+W+'" height="26" rx="4" fill="'+(on?'rgba(119,104,157,.14)':'rgba(63,71,96,.05)')+'"/>'+
        '<text x="10" y="17" font-size="12.5" font-weight="700" fill="'+INK+'">Total nacional</text>'+
        '<text x="'+x0+'" y="17" font-size="11" fill="'+FAINT+'">'+txt+'</text>'+
        '<text x="'+(x1+22)+'" y="17" '+MONO+' font-size="11.5" font-weight="700" fill="'+INK+'">'+fmt(t.pct)+'%</text></g>'}
    function rightCols(x,cy,x1,dx){
      var r=x.r;
      return '<text x="'+(x1+22)+'" y="'+(cy+4)+'" '+MONO+' font-size="11.5" font-weight="'+(x.weak?400:700)+'" fill="'+(x.weak?FAINT:INK)+'">'+fmt(r.pct)+'%</text>'+
        (x.hasDif?'<text x="'+(x1+dx)+'" y="'+(cy+4)+'" '+MONO+' font-size="11.5" fill="'+INK+'"><tspan fill="'+SYC[x.st]+'" font-weight="700">'+SYM[x.st]+'</tspan> '+sg(r.dif_pp)+'</text>':'')}
    function colHead(x1,dx,y){
      return '<text x="'+(x1+22)+'" y="'+y+'" '+MONO+' font-size="9.5" letter-spacing=".06em" fill="'+FAINT+'">% SEGMENTO</text><text x="'+(x1+dx)+'" y="'+y+'" '+MONO+' font-size="9.5" letter-spacing=".06em" fill="'+FAINT+'">DIF. VS RESTO (PP)</text>'}

    /* ---------- 1. barras divergentes ---------- */
    function vDiv(){
      var W=1100,rowH=26,gap=12,lab=240,x0=lab+16,x1=W-200,top=36,dx=100,ext=0;
      rows.forEach(function(x){if(x.hasDif)ext=Math.max(ext,Math.abs(x.r.dif_li90),Math.abs(x.r.dif_ls90))});
      var mx=Math.max(10,Math.ceil(ext/10)*10),step=mx>40?20:10;
      function X(d){return x0+(x1-x0)*(d+mx)/(2*mx)}
      var y=top+20,body='',prev=null;
      rows.forEach(function(x){var r=x.r;
        if(x.d!==prev){if(prev!==null)y+=gap;body+='<text x="0" y="'+(y+9)+'" font-size="10" font-weight="700" fill="#77689d" letter-spacing=".08em">'+esc(x.d.toUpperCase())+'</text>';y+=16;prev=x.d}
        var cy=y+rowH/2,inner='<text x="10" y="'+(cy+4)+'" font-size="12.5" font-weight="'+(x.sel?700:400)+'" fill="'+(x.weak?FAINT:INK)+'">'+esc(nm(x))+(x.mod?' †':'')+'</text>';
        if(x.hasDif){
          var a=X(0),b=X(r.dif_pp);
          inner+='<rect x="'+Math.min(a,b)+'" y="'+(cy-7)+'" width="'+Math.max(1.5,Math.abs(b-a))+'" height="14" rx="2" fill="'+COL[x.st]+'"/>'+capIC(X(r.dif_li90),X(r.dif_ls90),cy,INK,1.3,.75);
        }else inner+='<text x="'+(X(0)+10)+'" y="'+(cy+4)+'" font-size="11" font-style="italic" fill="'+FAINT+'">precisión baja: no se compara</text>';
        body+=hit(x,y,rowH,W,inner+rightCols(x,cy,x1,dx));
        y+=rowH});
      var H=y+40,s=svg(W,H,'Diferencia de cada segmento frente al resto de su dimensión')+totRow(W,x0,x1,'IC 90%: '+fmt(t.li90)+'–'+fmt(t.ls90)+'%')+colHead(x1,dx,top+8);
      for(var g=-mx;g<=mx;g+=step)s+='<line x1="'+X(g)+'" x2="'+X(g)+'" y1="'+(top+16)+'" y2="'+(H-30)+'" stroke="'+(g===0?'rgba(43,48,69,.55)':'rgba(63,71,96,.08)')+'" stroke-width="'+(g===0?1.5:1)+'"/><text x="'+X(g)+'" y="'+(H-16)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+(g>0?'+':g<0?'−':'')+Math.abs(g)+'</text>';
      s+='<text x="'+x0+'" y="'+(H-2)+'" font-size="11" fill="'+FAINT+'">← más bajo que el resto</text><text x="'+x1+'" y="'+(H-2)+'" text-anchor="end" font-size="11" fill="'+FAINT+'">más alto que el resto →</text>';
      return s+body+'</svg>'}

    /* ---------- 2. lollipop ordenado ---------- */
    function vLol(){
      var W=1100,rowH=26,lab=300,x0=lab+10,x1=W-200,top=36,dx=100;
      var ord=rows.slice().sort(function(a,b){return b.r.pct-a.r.pct});
      var mx=Math.min(100,Math.max(10,Math.ceil(Math.max.apply(null,ord.map(function(x){return x.r.ls90}).concat([t.ls90]))/10)*10)),step=mx>50?25:10;
      function X(p){return x0+(x1-x0)*Math.max(0,Math.min(p,mx))/mx}
      var y0=top+20,H=y0+ord.length*rowH+40,s=svg(W,H,'Porcentaje por segmento, ordenado')+totRow(W,x0,x1,'línea punteada y banda: total nacional con su IC 90%')+colHead(x1,dx,top+8);
      for(var g=0;g<=mx;g+=step)s+='<line x1="'+X(g)+'" x2="'+X(g)+'" y1="'+(top+16)+'" y2="'+(H-30)+'" stroke="rgba(63,71,96,.08)"/><text x="'+X(g)+'" y="'+(H-16)+'" text-anchor="middle" '+MONO+' font-size="10" fill="'+FAINT+'">'+g+'%</text>';
      s+='<rect x="'+X(t.li90)+'" y="'+(top+16)+'" width="'+Math.max(1,X(t.ls90)-X(t.li90))+'" height="'+(H-30-top-16)+'" fill="rgba(43,48,69,.07)"><title>IC 90% del total: '+fmt(t.li90)+'–'+fmt(t.ls90)+'%</title></rect><line x1="'+X(t.pct)+'" x2="'+X(t.pct)+'" y1="'+(top+16)+'" y2="'+(H-30)+'" stroke="'+INK+'" stroke-dasharray="4 3" opacity=".6"/>';
      ord.forEach(function(x,i){var r=x.r,y=y0+i*rowH,cy=y+rowH/2,sc=x.st==='eq'?NSI:COL[x.st];
        var inner='<text x="10" y="'+(cy+4)+'" font-size="12.5" font-weight="'+(x.sel?700:400)+'" fill="'+(x.weak?FAINT:INK)+'"><tspan fill="'+FAINT+'" font-size="10">'+esc(x.d)+' · </tspan>'+esc(nm(x))+(x.mod?' †':'')+'</text>'+
          '<line x1="'+X(0)+'" x2="'+X(r.pct)+'" y1="'+cy+'" y2="'+cy+'" stroke="#c3c2b7" stroke-width="1.5"/>'+
          '<line x1="'+X(r.li90)+'" x2="'+X(r.ls90)+'" y1="'+cy+'" y2="'+cy+'" stroke="'+sc+'" stroke-width="5" stroke-linecap="round" opacity=".38"/>'+
          '<circle cx="'+X(r.pct)+'" cy="'+cy+'" r="6" fill="'+(x.weak?'#fff':COL[x.st])+'" stroke="'+sc+'" stroke-width="'+(x.weak||x.st==='eq'?2:1.5)+'"/>';
        s+=hit(x,y,rowH,W,inner+rightCols(x,cy,x1,dx))});
      return s+'</svg>'}

    /* ---------- 3. tabla de calor ---------- */
    function vTab(){
      var all=[{d:'Total',g:'Total',lbl:'Total nacional',r:t,weak:false,hasDif:false,st:'weak',sel:F.dim==='Total',tot:true}].concat(rows);
      var ps=all.filter(function(x){return !x.weak}).map(function(x){return x.r.pct}),lo=Math.min.apply(null,ps),hi=Math.max.apply(null,ps);
      function heat(p){var u=hi>lo?(p-lo)/(hi-lo):.5,a=[239,234,247],b=[93,77,143];
        return {bg:'rgb('+a.map(function(c,i){return Math.round(c+(b[i]-c)*u)}).join(',')+')',fg:u>.5?'#fff':INK}}
      var TINT={up:'rgba(192,67,90,.13)',down:'rgba(35,128,111,.13)',eq:'transparent',weak:'transparent'};
      var prev=null,h='<div class="scroll-x"><table class="click"><thead><tr><th>Dimensión</th><th>Segmento</th><th class="n">% del segmento</th><th class="n">IC 90%</th><th class="n">Frente al resto (pp)</th><th class="n">n</th><th>Precisión</th></tr></thead><tbody>';
      all.forEach(function(x){var r=x.r,hc=x.weak?null:heat(r.pct),first=x.d!==prev;prev=x.d;
        h+='<tr data-d="'+esc(x.d)+'" data-g="'+esc(x.g)+'" class="'+(x.sel?'sel':'')+'" title="'+(x.tot?'Total nacional: '+fmt(r.pct)+'% (IC 90%: '+fmt(r.li90)+'–'+fmt(r.ls90)+'). Clic para quitar el filtro':tip(x).replace(/"/g,'&quot;'))+'">'+
          '<td style="'+(x.sel?'box-shadow:inset 3px 0 0 var(--accent);':'')+'font-weight:'+(first?700:400)+';color:'+(first?'var(--ink)':'transparent')+'">'+esc(x.d)+'</td>'+
          '<td'+(x.sel?' style="font-weight:700"':'')+'>'+esc(x.tot?x.lbl:nm(x))+(x.mod?' †':'')+'</td>'+
          '<td class="n" style="'+(hc?'background:'+hc.bg+';color:'+hc.fg+';font-weight:700':'background:repeating-linear-gradient(135deg,rgba(119,104,157,.3) 0 3px,#fff 3px 6px);color:var(--ink-faint)')+'">'+fmt(r.pct)+'%</td>'+
          '<td class="n muted">'+fmt(r.li90)+'–'+fmt(r.ls90)+'</td>'+
          '<td class="n" style="background:'+TINT[x.st]+'">'+(x.tot?'<span class="muted">—</span>':x.hasDif?'<span style="color:'+SYC[x.st]+';font-weight:700">'+SYM[x.st]+'</span> '+sg(r.dif_pp)+' <span class="muted">('+sg(r.dif_li90)+' a '+sg(r.dif_ls90)+')</span>':'<span class="muted">no se compara</span>')+'</td>'+
          '<td class="n">'+ent(r.n_muestra_dominio)+'</td><td>'+prec(r.precision)+'</td></tr>'});
      return h+'</tbody></table></div>'}

    var KEY='<span><i style="background:'+UP+'"></i>▲ Más alto que el resto</span><span><i style="background:'+DN+'"></i>▼ Más bajo</span><span><i style="background:'+NS+'"></i>= Sin diferencia significativa</span>';
    var leg=v==='tab'?'<span><i style="background:linear-gradient(90deg,#efeaf7,#5d4d8f);width:34px"></i>% del segmento: bajo → alto</span>'+KEY.replace('background:'+UP,'background:rgba(192,67,90,.35)').replace('background:'+DN,'background:rgba(35,128,111,.35)'):KEY;
    if(anyWeak)leg+=v==='lol'?'<span><i style="background:#fff;border:2px solid '+NSI+';border-radius:50%"></i>Precisión baja: no se compara</span>':v==='div'?'<span>Renglón sin barra: precisión baja, no se compara</span>':'<span><i style="background:repeating-linear-gradient(135deg,rgba(119,104,157,.5) 0 2px,#fff 2px 4px)"></i>Precisión baja</span>';
    if(anyMod)leg+='<span>† precisión moderada: leer con cautela</span>';
    var note={div:'Barra: diferencia, en puntos porcentuales, entre el segmento y el resto de su misma dimensión; línea negra: IC 90% de esa diferencia. En dimensiones de dos categorías las dos barras son espejo una de la otra.',
      lol:'Punto: % del segmento; trazo translúcido: su IC 90%; banda gris: IC 90% del total nacional. El color compara contra el resto de la dimensión, no contra el total.',
      tab:'Color de la celda de %: más oscuro, más alto. Fondo de la diferencia: significativa al 90% contra el resto de la dimensión.'}[v]+' Sin diferencia significativa no significa igual: con muestras chicas el intervalo es ancho. Son varias comparaciones al 90%; alguna «significativa» puede ser casualidad.';
    $(el).innerHTML=(v==='lol'?vLol():v==='tab'?vTab():vDiv())+'<div class="legend">'+leg+'</div><p class="muted" style="font-size:12px;margin-top:6px">'+note+'</p>';
    $$(el+' [data-d]').forEach(function(gx){gx.addEventListener('click',function(){F.dim=gx.dataset.d;F.seg=gx.dataset.g;refreshSeg()})});
  }
