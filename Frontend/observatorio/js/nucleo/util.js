/* Observatorio del Cuidado · js/nucleo/util.js
   Utilidades de formato y DOM compartidas: $, $$, fmt, ent, mxn, mill, esc, dl, seg, svg y constantes de texto SVG.
   Importa de OBS: —
   Exporta a OBS:  $, $$, FAINT, MONO, dl, ent, esc, fmt, isWeak, mill, mxn, prec, seg, svg */
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
  function dl(o){return Object.keys(o).map(function(k){return '<dt>'+k+'</dt><dd>'+o[k]+'</dd>'}).join('')}
  function seg(sel,attr,cb){$$(sel+' button').forEach(function(b){b.addEventListener('click',function(){$$(sel+' button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});cb(b.dataset[attr])})})}
  function svg(W,H,lbl){return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="'+lbl+'">'}
  var MONO='font-family="JetBrains Mono,monospace"', FAINT='rgba(43,48,69,.56)';
  OBS.$=$;OBS.$$=$$;OBS.FAINT=FAINT;OBS.MONO=MONO;OBS.dl=dl;OBS.ent=ent;
  OBS.esc=esc;OBS.fmt=fmt;OBS.isWeak=isWeak;OBS.mill=mill;OBS.mxn=mxn;
  OBS.prec=prec;OBS.seg=seg;OBS.svg=svg;
})();
