/* Observatorio del Cuidado · js/nucleo/util.js
   Utilidades de formato y DOM compartidas: $, $$, fmt, ent, mxn, mill, esc, dl, seg, svg y constantes de texto SVG.
   Importa de OBS: —
   Exporta a OBS:  $, $$, FAINT, MONO, dl, ent, esc, fmt, isWeak, mill, mxn, prec, seg, svg, tile */
(function(){
  function $(s){return document.querySelector(s)}
  function $$(s){return [].slice.call(document.querySelectorAll(s))}
  function fmt(x,d){d=d==null?1:d;return x==null?'s/d':Number(x).toLocaleString('es-MX',{minimumFractionDigits:d,maximumFractionDigits:d})}
  function ent(x){return x==null?'s/d':Math.round(x).toLocaleString('es-MX')}
  function mxn(x){return '$'+ent(x)}
  function mill(x){return x>=1e6?fmt(x/1e6,1)+' M':Math.round(x/1000).toLocaleString('es-MX')+' mil'}
  function isWeak(p){return p==='baja'||p==='no estimable'}
  function prec(p){var c=p==='alta'?'p-alta':p==='moderada'?'p-moderada':(p&&p.indexOf('baja')===0)?'p-baja':'p-noest';return '<span class="chip '+c+'">'+(p||'s/d')+'</span>'}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  /* «Archivo» → «Origen» (22–23 oct 2026): las fichas no muestran rutas ni nombres internos de análisis. Cada número de análisis se traduce
     a los datos públicos de los que sale; se agrega «cálculo del equipo». La ruta original queda en el title del renglón.
     Tabla escrita a mano: revisar contra cada análisis y completarla cuando se agregue uno (si un número no está, se muestra el texto original). */
  var EN='ENASIC 2022',CE='Censo 2020',DE='DENUE 2026',EG='ENIGH 2022',CO='CONEVAL 2020',CP='CONAPO 2020',MG='Marco Geoestadístico 2025';
  var ORG={'01':[DE],'02':['archivos de investigación del proyecto'],'03':[EN],'04':[EN],'05':[EN,CE],'06':[EN,'PEF 2026'],'07':[EN],'08':['archivos de investigación del proyecto'],'09':[CO],'10':[EN],'11':[EN],'12':[EN],'12b':[EN],'13':[CO],'14':[EG],'16':[EN],'17':[EG,CP],'18':[CE,DE,MG],'19':['anuncios de empleo','Ley Federal del Trabajo'],'21':[EN],'22':[EN],'23':[EN]};
  function origen(raw){
    var s=String(raw).replace(/&[a-z#0-9]+;/gi,' '),L=[],m,re=/(?:^|[\/\s,;(·])(\d{2}b?)_[A-Za-zÁ-ú…{*]/g,solo=null;
    function add(k){(ORG[k]||[]).forEach(function(x){if(L.indexOf(x)<0)L.push(x)})}
    while((m=re.exec(s)))add(m[1]);
    var r2=/sección (\d{2}b?)/g; while((m=r2.exec(s)))add(m[1]);
    if(/20_(modelo|sostenibilidad)/.test(s))solo='modelo financiero del equipo';
    if(/diccionario_observatorio/.test(s))solo='diccionario del Observatorio';
    if(/pares_oferta_necesidad/.test(s))solo='inventario de fuentes del proyecto';
    if(/indice_por_tipo_servicio/.test(s))add('01');
    if(solo&&!L.length)return solo;
    if(!L.length)return null;
    var f=L.length>1?L.slice(0,-1).join(', ')+' y '+L[L.length-1]:L[0];
    return f+' · '+(solo||'cálculo del equipo');
  }
  function dl(o){return Object.keys(o).map(function(k){var v=o[k],lb=(k==='Archivo'||k==='Archivos')?origen(v):null;
    return lb?'<dt>Origen</dt><dd title="'+String(v).replace(/"/g,'&quot;')+'">'+lb+'</dd>':'<dt>'+k+'</dt><dd>'+v+'</dd>'}).join('')}
  function seg(sel,attr,cb){$$(sel+' button').forEach(function(b){b.addEventListener('click',function(){$$(sel+' button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});cb(b.dataset[attr])})})}
  function svg(W,H,lbl){return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="'+lbl+'">'}
  /* 2 nov 2026: tarjeta de indicador única (regla del equipo). Al frente SOLO etiqueta + número (y, si hace falta, una línea corta bajo el número).
     La etiqueta debe decir qué se cuenta, de quién y en qué unidad. La explicación larga, el IC, la precisión, el segmento y la fuente van en
     «detalle» (<details>, sin JS, se abre con clic o teclado). Una tarjeta nueva se escribe con esta función, no a mano.
     o: k etiqueta · v valor (texto o html) · v2 línea corta bajo el número · det html del detalle · fuente texto · est true si es estimación con IC
        weak precisión baja (borde rayado, número gris) · na no aplica · sinvalor valor no medible · color · borde · luz (punto de color) · fs tamaño · plano sin .card */
  function tile(o){
    var sty=(o.weak||o.na||o.sinvalor?'border-style:dashed;':'')+(o.borde?'border-color:'+o.borde+';':'');
    var col=(o.weak||o.na)?'var(--ink-faint)':o.sinvalor?'var(--alert)':(o.color||'');
    var fs=o.fs||(o.sinvalor?20:null);
    var kk='<div class="kicker" style="margin:0">'+o.k+'</div>';
    var k=o.luz?'<div class="light"><i style="background:'+o.luz+'"></i>'+kk+'</div>':kk;
    var det=(o.det||'')+(o.fuente?'<div class="tdet-f"><b>Fuente</b> '+o.fuente+'</div>':'');
    return '<div class="'+(o.plano?'':'card ')+'tile tile-min"'+(sty?' style="'+sty+'"':'')+'>'+k+
      '<div class="big num" style="'+(fs?'font-size:'+fs+'px;':'')+(col?'color:'+col+';':'')+'">'+o.v+'</div>'+(o.v2?'<div class="tile-v2">'+o.v2+'</div>':'')+
      (det?'<details class="tdet"><summary>'+(o.est?'Rango probable y fuente':'Detalle')+'</summary><div class="tdet-in">'+det+'</div></details>':'')+'</div>';
  }
  var MONO='font-family="Archivo,system-ui,sans-serif"', FAINT='rgba(43,48,69,.56)';
  OBS.$=$;OBS.$$=$$;OBS.FAINT=FAINT;OBS.MONO=MONO;OBS.dl=dl;OBS.ent=ent;
  OBS.esc=esc;OBS.fmt=fmt;OBS.isWeak=isWeak;OBS.mill=mill;OBS.mxn=mxn;
  OBS.prec=prec;OBS.seg=seg;OBS.svg=svg;OBS.origen=origen;OBS.tile=tile;
})();
