/* Observatorio del Cuidado · js/app/coachmark.js
   Sustituye la ficha plegable de cada tarjeta («Lectura, fuente y precisión») por un recorrido guiado:
   el botón ⓘ se resalta con un anillo y abre debajo un globo oscuro de 3 pasos (Cómo leerla → De dónde sale → Qué tan precisa es).
   El <details class="src"> original se queda en el DOM, oculto: las vistas y los filtros lo siguen reescribiendo por id,
   y el globo lee su contenido cada vez que se abre, así que nunca muestra una ficha vieja.
   Debe correr después de pintar todas las vistas (va antes de plegables.js en index.html).
   Importa de OBS: $$
   Exporta a OBS:  — */
(function(){
  var $$=OBS.$$;
  /* Renglones de la ficha que van al paso «Qué tan precisa es». El resto va a «De dónde sale». */
  var PRECISION=/^(Precisi|Advertencia|M[eé]todo|Validaci|Nota|L[ií]mite|Supuesto)/i;
  var abierto=null; /* {btn, pop, steps, i} */

  function filas(dl, cuales){
    var out=document.createElement('dl');out.className='cm-dl';var n=0;
    Array.prototype.forEach.call(dl.querySelectorAll('dt'),function(dt){
      var dd=dt.nextElementSibling;if(!dd||dd.tagName!=='DD')return;
      var esPrec=PRECISION.test(dt.textContent.trim());
      if(cuales==='prec'?esPrec:!esPrec){out.appendChild(dt.cloneNode(true));out.appendChild(dd.cloneNode(true));n++}
    });
    return n?out:null;
  }
  function nota(t){var p=document.createElement('p');p.className='cm-nota';p.textContent=t;return p}

  /* El texto de los pasos se arma al abrir, desde la ficha vigente. */
  function pasos(det){
    var s=[],find=det.querySelector('.find'),dl=det.querySelector('dl');
    if(find&&find.textContent.trim()){var p=document.createElement('p');p.innerHTML=find.innerHTML;s.push({t:'Cómo leerla',b:p})}
    s.push({t:'De dónde sale',b:(dl&&filas(dl,'fuente'))||nota('La ficha de esta tarjeta no registra fuente.')});
    /* Notas sueltas que otras piezas meten en la ficha (p. ej. #relIng, vía plegables.js) van con la precisión. */
    var prec=document.createElement('div'),pf=dl&&filas(dl,'prec');if(pf)prec.appendChild(pf);
    Array.prototype.forEach.call(det.children,function(el){
      if(el.tagName==='SUMMARY'||el.tagName==='DL'||el.classList.contains('find')||!el.textContent.trim())return;
      var c=el.cloneNode(true);c.removeAttribute('id');c.removeAttribute('style');c.className='cm-extra';prec.appendChild(c)});
    s.push({t:'Qué tan precisa es',b:prec.childNodes.length?prec:nota('La ficha de esta tarjeta no registra precisión ni advertencias propias. Revisa los chips de precisión de la gráfica, si los tiene.')});
    return s;
  }

  function pintar(){
    var a=abierto,st=a.steps[a.i],last=a.i===a.steps.length-1,pop=a.pop;
    pop.querySelector('.cm-step').textContent='Paso '+(a.i+1)+' de '+a.steps.length;
    pop.querySelector('.cm-title').textContent=st.t;
    var body=pop.querySelector('.cm-body');body.innerHTML='';body.appendChild(st.b.cloneNode(true));body.scrollTop=0;
    var dots=pop.querySelector('.cm-dots');dots.innerHTML='';
    a.steps.forEach(function(x,k){var d=document.createElement('button');d.type='button';d.className='cm-dot'+(k===a.i?' is-on':'');
      d.setAttribute('aria-label','Ir al paso '+(k+1)+': '+x.t);if(k===a.i)d.setAttribute('aria-current','step');
      d.addEventListener('click',function(){a.i=k;pintar()});dots.appendChild(d)});
    var nx=pop.querySelector('.cm-next');nx.textContent=last?'Listo':'Siguiente';
  }

  /* Si el globo se sale por la derecha, se recorre a la izquierda y la muesca sigue apuntando al botón.
     Divide entre el zoom de .content (pantallas anchas, ver layout.css) para trabajar en px de CSS. */
  function encuadrar(pop){
    pop.style.left='0px';pop.style.setProperty('--cm-arrow','18px');
    var r=pop.getBoundingClientRect(),z=r.width/pop.offsetWidth||1,sobra=r.right-(window.innerWidth-12);
    if(sobra>0){var dx=Math.min(sobra,r.left-12)/z;pop.style.left=(-dx)+'px';pop.style.setProperty('--cm-arrow',(18+dx)+'px')}
  }

  function cerrar(){
    if(!abierto)return;var a=abierto;abierto=null;
    a.pop.remove();a.btn.classList.remove('is-lit');a.btn.setAttribute('aria-expanded','false');
    document.removeEventListener('keydown',tecla);document.removeEventListener('pointerdown',fuera,true);
    a.btn.focus({preventScroll:true});
  }
  function tecla(e){if(e.key==='Escape'){e.preventDefault();cerrar()}}
  function fuera(e){if(abierto&&!abierto.pop.contains(e.target)&&!abierto.btn.contains(e.target))cerrar()}

  function abrir(btn,det,ancla){
    cerrar();
    var pop=document.createElement('div');pop.className='cm-pop';pop.id='cm-pop';
    pop.setAttribute('role','dialog');pop.setAttribute('aria-label',btn.textContent.trim());
    pop.innerHTML='<span class="cm-arrow" aria-hidden="true"></span>'+
      '<p class="cm-step"></p><h4 class="cm-title"></h4><div class="cm-body"></div>'+
      '<div class="cm-foot"><div class="cm-dots"></div><div class="cm-acts">'+
      '<button type="button" class="cm-skip">Omitir</button><button type="button" class="cm-next"></button></div></div>';
    ancla.appendChild(pop);
    abierto={btn:btn,pop:pop,steps:pasos(det),i:0};
    btn.classList.add('is-lit');btn.setAttribute('aria-expanded','true');btn.setAttribute('aria-controls','cm-pop');
    pop.querySelector('.cm-skip').addEventListener('click',cerrar);
    pop.querySelector('.cm-next').addEventListener('click',function(){
      if(abierto.i<abierto.steps.length-1){abierto.i++;pintar()}else cerrar()});
    pintar();encuadrar(pop);
    if(pop.getBoundingClientRect().bottom>window.innerHeight)pop.scrollIntoView({block:'nearest',behavior:'smooth'});
    document.addEventListener('keydown',tecla);document.addEventListener('pointerdown',fuera,true);
    pop.querySelector('.cm-next').focus({preventScroll:true});
  }

  $$('.card').forEach(function(c){
    var det=c.querySelector(':scope > details.src');if(!det)return;
    var find=c.querySelector(':scope > .find');
    if(find)det.insertBefore(find,det.querySelector('dl')); /* la lectura sale de la tarjeta, como antes */
    det.hidden=true;det.classList.add('cm-fuente');
    var ancla=document.createElement('div');ancla.className='cm-anchor';
    var btn=document.createElement('button');btn.type='button';btn.className='cm-trigger';
    btn.setAttribute('aria-haspopup','dialog');btn.setAttribute('aria-expanded','false');
    btn.textContent=find?'Lectura, fuente y precisión':'Fuente y precisión';
    btn.addEventListener('click',function(){abierto&&abierto.btn===btn?cerrar():abrir(btn,det,ancla)});
    ancla.appendChild(btn);c.insertBefore(ancla,det);
  });
  /* Cambiar de pestaña con el ratón cierra el globo (clic fuera). */
  window.addEventListener('resize',function(){if(abierto)encuadrar(abierto.pop)});
  OBS.cerrarCoachmark=cerrar;
})();
