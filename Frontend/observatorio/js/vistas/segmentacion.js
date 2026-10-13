/* Observatorio del Cuidado · js/vistas/segmentacion.js
   Filtro de segmentación (script 12): barra de filtro, tarjetas, comparador de segmentos y refresco de las pestañas.
   Importa de OBS: $, $$, C_INK, DIMS_S, F, FAINT, MONO, SG, dl, ent, esc, fmt, hatchDef, isWeak, lv, prec, ramp, renderPref, renderRaz, segName, svg
   Exporta a OBS:  — */
(function(){
  var $=OBS.$,$$=OBS.$$,C_INK=OBS.C_INK,DIMS_S=OBS.DIMS_S,F=OBS.F,FAINT=OBS.FAINT
      ,MONO=OBS.MONO,SG=OBS.SG,dl=OBS.dl,ent=OBS.ent,esc=OBS.esc,fmt=OBS.fmt
      ,hatchDef=OBS.hatchDef,isWeak=OBS.isWeak,lv=OBS.lv,prec=OBS.prec,ramp=OBS.ramp
      ,renderPref=OBS.renderPref,renderRaz=OBS.renderRaz,segName=OBS.segName
      ,svg=OBS.svg;
  function renderFB(){
    $$('[data-fb]').forEach(function(fb){
      fb.innerHTML='<span class="lbl">Segmentar por</span><div class="seg">'+DIMS_S.map(function(d){return '<button data-d="'+d+'" aria-pressed="'+(F.dim===d)+'">'+d+'</button>'}).join('')+'</div>'+
        (F.dim!=='Total'?'<div class="seg">'+lv(F.dim).map(function(g){return '<button data-g="'+esc(g)+'" aria-pressed="'+(F.seg===g)+'">'+esc(g.replace('>=','≥ '))+'</button>'}).join('')+'</div>':'')+
        '<span class="note">Nacional · una dimensión a la vez</span>';
      fb.querySelectorAll('[data-d]').forEach(function(b){b.addEventListener('click',function(){F.dim=b.dataset.d;F.seg=lv(F.dim)[0];refreshSeg()})});
      fb.querySelectorAll('[data-g]').forEach(function(b){b.addEventListener('click',function(){F.seg=b.dataset.g;refreshSeg()})});
    });
  }
  function tiles(el,keys){
    $(el).innerHTML=keys.filter(function(k){return SG(k)}).map(function(k){var r=SG(k),t=SG(k,'Total','Total'),weak=isWeak(r.precision),msg,cls='eq';
      if(F.dim==='Total')msg='Total nacional';
      else if(weak)msg='Precisión baja: no se compara';
      else if(r.dif_significativa){cls=r.dif_pp>0?'up':'down';msg=(r.dif_pp>0?'+':'')+fmt(r.dif_pp)+' pp frente al resto del grupo (significativa)'}
      else msg='Sin diferencia significativa con el resto';
      return '<div class="card tile"'+(weak?' style="border-style:dashed"':'')+'><div class="kicker" style="margin:0">'+esc(segName())+'</div><div class="big num" style="font-size:30px;'+(weak?'color:var(--ink-faint)':'')+'">'+fmt(r.pct)+'%</div><div class="lbl">'+esc(r.indicador)+'</div><div class="chips">'+prec(r.precision)+(F.dim!=='Total'?'<span class="chip p-noest">total '+fmt(t.pct)+'%</span>':'')+'</div><div class="delta '+cls+'">'+msg+'</div></div>'}).join('');
  }
  /* Comparar segmentos: mapa de calor indicadores × segmentos (script 12). Sin selectores: todos los indicadores a la vista.
     Color = % del segmento entre el mínimo y el máximo de su renglón. ▲▼ = diferencia significativa (IC 90%) contra el resto de su dimensión.
     Rayado = precisión baja: no se compara. Clic en una columna filtra la pestaña; "Total" quita el filtro. */
  var SHORT={'Cuida discapacidad':'Discap.','Solo 60+ sin discapacidad':'Solo 60+','>=40 h':'≥ 40 h','<20 h':'< 20 h'};
  function comparador(el,keys){
    var rows=keys.filter(function(k){return SG(k,'Total','Total')});
    var cols=[{d:'Total',g:'Total',lbl:'Total',gr:'Total'}];
    DIMS_S.forEach(function(d){if(d!=='Total')lv(d).forEach(function(g){cols.push({d:d,g:g,lbl:SHORT[g]||g.replace('>=','≥ ').replace('<','< '),gr:d})})});
    var W=1100,lab=214,pr=6,gapG=10,hh=54,rowH=50,groups=[];
    cols.forEach(function(c){if(!groups.length||groups[groups.length-1].gr!==c.gr)groups.push({gr:c.gr,n:0});groups[groups.length-1].n++});
    var cw=(W-lab-pr-(groups.length-1)*gapG)/cols.length,x=lab,gi=-1,lastG=null;
    cols.forEach(function(c){if(c.gr!==lastG){if(lastG!==null)x+=gapG;lastG=c.gr;gi++;groups[gi].x0=x}c.x=x;x+=cw;groups[gi].x1=x});
    var H=hh+rows.length*rowH+34,s=svg(W,H,'Mapa de calor: indicadores por segmento')+'<defs>'+hatchDef('hmH','#b7aed0')+'</defs>';
    groups.forEach(function(g){if(g.gr==='Total')return;s+='<text x="'+((g.x0+g.x1)/2)+'" y="13" text-anchor="middle" font-size="10" font-weight="700" fill="#77689d" letter-spacing=".08em">'+esc(g.gr.toUpperCase())+'</text><line x1="'+(g.x0+3)+'" x2="'+(g.x1-3)+'" y1="21" y2="21" stroke="rgba(63,71,96,.2)"/>'});
    rows.forEach(function(k,ri){var y=hh+ri*rowH;
      s+='<text x="0" y="'+(y+rowH/2+4)+'" font-size="12.5" font-weight="600" fill="'+C_INK+'">'+esc(CMPL[k]||k)+'</text>'});
    cols.forEach(function(c){
      var sel=F.dim===c.d&&F.seg===c.g;
      s+='<g data-d="'+esc(c.d)+'" data-g="'+esc(c.g)+'" style="cursor:pointer"><title>'+(c.d==='Total'?'Total nacional: clic para quitar el filtro':esc(c.d+': '+c.g)+': clic para filtrar la pestaña')+'</title>';
      s+='<rect x="'+c.x+'" y="26" width="'+cw+'" height="'+(H-26-24)+'" fill="transparent"/>';
      s+='<text x="'+(c.x+cw/2)+'" y="'+(hh-9)+'" text-anchor="middle" font-size="11.5" font-weight="'+(sel||c.d==='Total'?700:500)+'" fill="'+C_INK+'">'+esc(c.lbl)+'</text>';
      rows.forEach(function(k,ri){
        var r=SG(k,c.d,c.g),y=hh+ri*rowH,mxr=0,mnr=1e9;
        cols.forEach(function(c2){var q=SG(k,c2.d,c2.g);if(q&&q.pct!=null&&!isWeak(q.precision)){mxr=Math.max(mxr,q.pct);mnr=Math.min(mnr,q.pct)}});
        if(!r||r.pct==null){s+='<text x="'+(c.x+cw/2)+'" y="'+(y+rowH/2+4)+'" text-anchor="middle" font-size="11" fill="'+FAINT+'" opacity=".6">—</text><title>No aplica</title>';return}
        var weak=isWeak(r.precision),u=mxr>mnr?.06+.94*(r.pct-mnr)/(mxr-mnr):.5,sig=!weak&&c.d!=='Total'&&(r.dif_significativa===true||r.dif_significativa==='True'),dark=u>.55;
        s+='<rect x="'+(c.x+1.5)+'" y="'+(y+2)+'" width="'+(cw-3)+'" height="'+(rowH-4)+'" rx="5" fill="'+(weak?'url(#hmH)':ramp(u))+'"'+(weak?' stroke="#b7aed0"':'')+'><title>'+esc(CMPL[k]||k)+' · '+esc(c.d==='Total'?'Total':c.g)+': '+fmt(r.pct)+'% (IC 90%: '+fmt(r.li90)+'–'+fmt(r.ls90)+') · n = '+ent(r.n_muestra_dominio)+' · precisión '+esc(r.precision)+(weak?'. No se compara.':(c.d!=='Total'&&r.dif_pp!=null?'. Frente al resto de la dimensión: '+(r.dif_pp>0?'+':'−')+fmt(Math.abs(r.dif_pp))+' pp'+(sig?' (significativa)':' (no significativa)'):''))+'</title></rect>';
        s+='<text x="'+(c.x+cw/2)+'" y="'+(y+rowH/2+4.5)+'" text-anchor="middle" '+MONO+' font-size="12.5" font-weight="'+(sig||c.d==='Total'?700:500)+'" fill="'+(weak?FAINT:dark?'#fff':C_INK)+'">'+fmt(r.pct)+'</text>';
        if(sig){var up=r.dif_pp>0;s+='<circle cx="'+(c.x+cw-9)+'" cy="'+(y+10)+'" r="6.5" fill="#fff" stroke="'+(up?'#c0435a':'#23806f')+'" stroke-width="1.2"/><text x="'+(c.x+cw-9)+'" y="'+(y+13.2)+'" text-anchor="middle" font-size="8.5" font-weight="700" fill="'+(up?'#c0435a':'#23806f')+'">'+(up?'▲':'▼')+'</text>'}
      });
      if(sel)s+='<rect x="'+(c.x+.5)+'" y="'+(hh-1)+'" width="'+(cw-1)+'" height="'+(rows.length*rowH+2)+'" rx="6" fill="none" stroke="'+C_INK+'" stroke-width="2"/>';
      s+='</g>'});
    s+='<text x="0" y="'+(H-6)+'" font-size="11" fill="'+FAINT+'">Más oscuro = más alto dentro de cada renglón (de mínimo a máximo)  ·  ▲ ▼ significativamente más alto o más bajo que el resto de su dimensión (IC 90%)  ·  rayado = precisión baja, no se compara</text>';
    $(el).innerHTML=s+'</svg>';
    $$(el+' [data-d]').forEach(function(gx){gx.addEventListener('click',function(){F.dim=gx.dataset.d;F.seg=gx.dataset.g;refreshSeg()})});
  }
  var CMP={nec:['horas40','dano','dano_sinnec','raz_necesidad'],bar:['raz_hogar','pref_casa','pref_no','norma_familia','unas_horas','no_residencia']};
  var CMPL={horas40:'Cuida 40 h o más',dano:'Algún daño',dano_sinnec:'Daño entre "sin necesidad"',raz_necesidad:'"No tuve necesidad"',raz_hogar:'"El hogar cuida"',pref_casa:'Prefiere en casa',pref_no:'No contrataría',norma_familia:'La familia debe cuidar',unas_horas:'Acepta "unas horas"',no_residencia:'Rechaza residencia'};
  function cmpDraw(t){comparador('#ch-cmp-'+t,CMP[t])}
  $$('.seg-src').forEach(function(x){x.innerHTML=dl({Universo:'Personas cuidadoras de persona con discapacidad o 60+, nacional',Método:'Diseño muestral, IC al 90%; diferencia de cada segmento contra el resto de su misma dimensión',Advertencia:'Una dimensión a la vez; los cruces dejan muestras demasiado chicas',Lectura:'Color: % del segmento relativo al máximo de su renglón. ▲▼ marcan diferencia significativa contra el resto de la misma dimensión (IC 90%). Sin diferencia significativa no significa igual: con muestras chicas el intervalo es ancho. Son varias comparaciones al 90%, así que alguna marca puede ser casualidad. En dimensiones de dos categorías las dos columnas son espejo y no cuentan como dos hallazgos.',Archivo:esc(D.seg_fuente)})});
  function refreshSeg(){renderFB();tiles('#segTiles-nec',CMP.nec);/* 8 oct 2026: sin cajas en Barreras */
    cmpDraw('nec');cmpDraw('bar');renderRaz();renderPref();}
  refreshSeg();
})();
