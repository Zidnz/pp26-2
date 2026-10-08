/* Observatorio del Cuidado · js/graficas/motor-3d.js
   Motor 3D de la portada, sobre three.js r128 (vendor/three.min.js, licencia MIT, sin CDN para que abra con file://).
   Escenario con piso que refleja (la escena se dibuja reflejada y encima va un piso semitransparente del color del marco),
   materiales tipo gomita, caja redondeada, sombra difusa, texto en textura y los personajes de la portada.
   Los personajes son ilustración: no son datos ni personas reales.
   Si el navegador no tiene THREE, exporta M3D=null y la portada se queda solo con las tarjetas.
   Importa de OBS: —
   Exporta a OBS:  M3D */
(function(){
"use strict";
if(!window.THREE){ OBS.M3D=null; return; }
const T=THREE;
const lin=hex=>new T.Color(hex).convertSRGBToLinear();
const UP=new T.Vector3(0,1,0);
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function roundedBox(w,h,d,r,s){
  s=s||5; const g=new T.BoxGeometry(w,h,d,s,s,s), p=g.attributes.position, n=g.attributes.normal;
  const inner=new T.Vector3(w/2-r,h/2-r,d/2-r), neg=inner.clone().negate(), v=new T.Vector3(), c=new T.Vector3(), nn=new T.Vector3();
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); c.copy(v).clamp(neg,inner); nn.copy(v).sub(c); if(nn.lengthSq()<1e-9) nn.fromBufferAttribute(n,i); nn.normalize();
    p.setXYZ(i,c.x+nn.x*r,c.y+nn.y*r,c.z+nn.z*r); n.setXYZ(i,nn.x,nn.y,nn.z); }
  return g;
}
function blobTexture(){ const cv=document.createElement("canvas"); cv.width=cv.height=128; const x=cv.getContext("2d");
  const g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,"rgba(30,32,50,.36)"); g.addColorStop(.55,"rgba(30,32,50,.13)"); g.addColorStop(1,"rgba(30,32,50,0)");
  x.fillStyle=g; x.fillRect(0,0,128,128); return new T.CanvasTexture(cv); }

// Escenario: un canvas, una cámara, piso que refleja. o.fov, o.onResize(cam,rect), o.floorVar (variable CSS del color del piso).
function makeStage(canvas,o){
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=T.sRGBEncoding; renderer.autoClear=false; renderer.setClearColor(0x000000,0);
  const scene=new T.Scene(), floorScene=new T.Scene();
  const camera=new T.PerspectiveCamera(o.fov||26,1,0.1,300);
  const envScene=new T.Scene();
  envScene.add(new T.Mesh(new T.SphereGeometry(20,32,16),new T.MeshBasicMaterial({color:0x9a93ad,side:T.BackSide})));
  [[-6,8,6,10,4],[7,5,4,6,6],[0,-6,8,12,2]].forEach(([x,y,z,w,h])=>{ const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide})); m.position.set(x,y,z); m.lookAt(0,0,0); envScene.add(m); });
  const pm=new T.PMREMGenerator(renderer); scene.environment=pm.fromScene(envScene,0.04).texture; pm.dispose();
  scene.add(new T.HemisphereLight(0xffffff,0x7f7a92,0.32));
  const dl=new T.DirectionalLight(0xffffff,0.55); dl.position.set(-4,9,7); scene.add(dl);
  const root=new T.Group(); scene.add(root);
  const floorMat=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.82,depthWrite:false});
  const floor=new T.Mesh(new T.PlaneGeometry(200,200),floorMat); floor.rotation.x=-Math.PI/2; floorScene.add(floor);
  const fc=getComputedStyle(canvas).getPropertyValue(o.floorVar||"--fr-bg").trim()||"#ece8f4";
  floorMat.color.copy(lin(fc));
  const btex=blobTexture();
  const blob=(x,z,rx,rz)=>{ const m=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:btex,transparent:true,depthWrite:false})); m.rotation.x=-Math.PI/2; m.position.set(x,0.01,z); m.scale.set(rx,rz||rx,1); floorScene.add(m); return m; };
  let mats=[];
  // Los materiales con userData.ladoFijo (planos de doble cara, p. ej. las figuras 2D) no cambian de lado en el reflejo.
  const collect=()=>{ const s=new Set(); root.traverse(x=>{ if(x.material&&!x.material.userData.ladoFijo) s.add(x.material); }); mats=[...s]; };
  let visible=false; const ticks=[];
  new IntersectionObserver(es=>{ visible=es[0].isIntersecting; },{rootMargin:"120px"}).observe(canvas);
  const resize=()=>{ const r=canvas.getBoundingClientRect(); if(!r.width||!r.height) return; renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height; if(o.onResize) o.onResize(camera,r); camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(canvas);
  const loop=(now)=>{ requestAnimationFrame(loop); if(!visible) return; ticks.forEach(f=>f(now));
    renderer.clear();
    root.scale.y=-1; mats.forEach(m=>m.side=T.BackSide); renderer.render(scene,camera);
    root.scale.y=1; mats.forEach(m=>m.side=T.FrontSide);
    renderer.clearDepth(); renderer.render(floorScene,camera);
    renderer.clearDepth(); renderer.render(scene,camera); };
  requestAnimationFrame(loop);
  return {renderer,scene,camera,root,blob,collect,resize,tick:f=>ticks.push(f),canvas};
}
const gummy=(hex,o)=>new T.MeshPhysicalMaterial(Object.assign({color:lin(hex),roughness:0.24,metalness:0,clearcoat:0.8,clearcoatRoughness:0.18,envMapIntensity:0.6},o||{}));

// Texto en una textura (etiquetas de las escenas). fs0: tamaño inicial en px; se reduce hasta caber. Se vuelve a dibujar cuando carga Archivo.
function txt(t,w,col,fs0){ const cv=document.createElement("canvas"); cv.width=512; cv.height=128; const x=cv.getContext("2d");
  const tex=new T.CanvasTexture(cv); tex.encoding=T.sRGBEncoding;
  const draw=()=>{ x.clearRect(0,0,512,128); let fs=fs0||58; x.font="700 "+fs+"px Archivo, system-ui, sans-serif";
    while(x.measureText(t).width>496 && fs>20){ fs-=2; x.font="700 "+fs+"px Archivo, system-ui, sans-serif"; }
    x.fillStyle=col||"#2b3045"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(t,256,66); tex.needsUpdate=true; };
  draw(); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(draw);
  return new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false})); }

// Personajes (ilustración, no datos). Devuelve {eyes, make:{rosa,jorge,mateo,sofia,daniel,lupe (pareja),lupeSola,ernesto}}.
function buildFigures(){
  const cache={};
  const mat=(hex,kind)=>{ const k=hex+kind; if(cache[k]) return cache[k];
    let m;
    if(kind==="cloth"){ m=new T.MeshPhysicalMaterial({color:lin(hex),roughness:.82,metalness:0,envMapIntensity:.45}); m.sheen=new T.Color(.22,.22,.24); }
    else if(kind==="skin") m=new T.MeshPhysicalMaterial({color:lin(hex),roughness:.55,metalness:0,clearcoat:.15,clearcoatRoughness:.5,envMapIntensity:.45});
    else if(kind==="hair") m=new T.MeshPhysicalMaterial({color:lin(hex),roughness:.7,metalness:0,envMapIntensity:.5});
    else if(kind==="gloss") m=new T.MeshPhysicalMaterial({color:lin(hex),roughness:.25,metalness:0,clearcoat:.8,clearcoatRoughness:.15,envMapIntensity:.7});
    else if(kind==="metal") m=new T.MeshPhysicalMaterial({color:lin(hex),roughness:.35,metalness:.55,envMapIntensity:.9});
    else m=new T.MeshPhysicalMaterial({color:lin(hex),roughness:.6,metalness:0,envMapIntensity:.5});
    return cache[k]=m; };
  const Cl=h=>mat(h,"cloth"), Sk=h=>mat(h,"skin"), Hr=h=>mat(h,"hair"), Gl=h=>mat(h,"gloss"), Mt=h=>mat(h,"metal"), Pl=h=>mat(h,"plain");
  const SKIN="#F1C3A0", SKIN2="#D49A72", BLUSH="#F3A3A3", EYE="#1B1416", BROW_D="#3B2A22";
  const V=a=>new T.Vector3(a[0],a[1],a[2]);
  const seg=(a,b,r,m,r2,rs)=>{ const A=V(a),B=V(b),d=B.clone().sub(A),len=d.length(); const s=new T.Mesh(new T.CylinderGeometry(r2==null?r:r2,r,len,rs||20),m);
    s.position.copy(A).add(B).multiplyScalar(.5); s.quaternion.setFromUnitVectors(UP,d.normalize()); return s; };
  const ball=(p,r,m,sc,rot)=>{ const s=new T.Mesh(new T.SphereGeometry(r,32,22),m); s.position.copy(V(p)); if(sc) s.scale.set(sc[0],sc[1],sc[2]); if(rot) s.rotation.set(rot[0],rot[1],rot[2]); return s; };
  const pill=(a,b,r,m,r2)=>{ const g=new T.Group(); g.add(seg(a,b,r,m,r2),ball(a,r2==null?r:r2,m),ball(b,r,m)); return g; };
  const rbox=(w,h,d,p,m,rad)=>{ const s=new T.Mesh(roundedBox(w,h,d,rad||Math.min(w,h,d)*.3,3),m); s.position.copy(V(p)); return s; };
  const torus=(R,r,p,rot,m,arc)=>{ const s=new T.Mesh(new T.TorusGeometry(R,r,12,44,arc||Math.PI*2),m); s.position.copy(V(p)); s.rotation.set(rot[0],rot[1],rot[2]); return s; };
  // Torso con perfil suave (lathe), base y hombros redondeados
  const torso=(rB,rT,h,y0,m,z,sq)=>{ const pts=[]; const N=30;
    for(let i=0;i<=N;i++){ const t=i/N, e=Math.pow(Math.abs(2*t-1),4); pts.push(new T.Vector2(Math.max(.001,(rB+(rT-rB)*t)*Math.sqrt(Math.max(0,1-e))), t*h)); }
    const s=new T.Mesh(new T.LatheGeometry(pts,44),m); s.position.set(0,y0,z||0); s.scale.z=sq||.82; return s; };
  const eyes=[];

  // ---------- Cabeza ----------
  function head(g,p,R,o){
    const [x,y,z]=p, sk=Sk(o.skin||SKIN);
    g.add(ball(p,R,sk,[1,.96,.94]));
    if(!o.hideEars) g.add(ball([x-R*.97,y-R*.08,z-R*.02],R*.16,sk,[.6,1,.8]), ball([x+R*.97,y-R*.08,z-R*.02],R*.16,sk,[.6,1,.8]));
    // ojos: óvalo negro con brillo; el grupo se desplaza para seguir el cursor
    const ex=R*.34, ey=y-R*.04, ez=z+R*.9;
    [-1,1].forEach(s=>{ const eg=new T.Group(); eg.position.set(x+s*ex,ey,ez);
      eg.add(ball([0,0,0],R*.12,new T.MeshBasicMaterial({color:lin(EYE)}),[.78,1,.42]));
      eg.add(ball([R*.035,R*.045,R*.05],R*.035,Pl("#FFFFFF")), ball([-R*.03,-R*.04,R*.05],R*.016,Pl("#FFFFFF")));
      g.add(eg); eyes.push({g,c:eg.position.clone(),er:R*.07,pup:eg,scl:eg});
      // ceja
      g.add(seg([x+s*(ex-R*.11),y+R*.2,z+R*.88],[x+s*(ex+R*.1),y+R*.23,z+R*.84],R*.022,Hr(o.brow||BROW_D),null,10));
    });
    g.add(ball([x,y-R*.17,z+R*.95],R*.055,sk));
    g.add(torus(R*.1,R*.02,[x,y-R*.31,z+R*.92],[.3,0,Math.PI],Pl("#7A3B35"),Math.PI));
    g.add(ball([x-R*.56,y-R*.24,z+R*.74],R*.14,Pl(BLUSH),[1,.65,.3]), ball([x+R*.56,y-R*.24,z+R*.74],R*.14,Pl(BLUSH),[1,.65,.3]));
    if(o.glasses){ const gm=Gl("#6B3E22");
      [-1,1].forEach(s=>{ g.add(torus(R*.2,R*.022,[x+s*ex,ey,z+R*.95],[0,0,0],gm)); g.add(seg([x+s*(ex+R*.2),ey+R*.02,z+R*.9],[x+s*R*.93,ey+R*.06,z+R*.2],R*.016,gm,null,8)); });
      g.add(seg([x-ex+R*.2,ey+R*.03,z+R*.97],[x+ex-R*.2,ey+R*.03,z+R*.97],R*.02,gm,null,8)); }
    if(o.mustache){ const hm=Hr(o.hairColor); g.add(ball([x-R*.12,y-R*.24,z+R*.93],R*.12,hm,[1.2,.5,.5],[0,0,.25]), ball([x+R*.12,y-R*.24,z+R*.93],R*.12,hm,[1.2,.5,.5],[0,0,-.25])); }
    hair(g,p,R,o);
  }
  function hair(g,p,R,o){
    const [x,y,z]=p, hm=Hr(o.hairColor);
    if(o.hair==="bunLow"||o.hair==="short"||o.hair==="pony"||o.hair==="tuft"){
      g.add(ball([x,y+R*.12,z-R*.24],R*1.04,hm,[1.03,1,1.02]));
      const n=o.hair==="short"?3:4, w=o.hair==="short"?.26:.3;
      for(let i=0;i<n;i++){ const t=i-(n-1)/2; g.add(ball([x+t*R*w*.95-R*.06,y+R*.5-Math.abs(t)*R*.06,z+R*.74],R*.28,hm,[1,.42,.5],[-.5,0,-.35-t*.08])); }
      if(o.hair==="bunLow"||o.hair==="pony"){ [-1,1].forEach(s=>g.add(ball([x+s*R*.9,y-R*.12,z+R*.12],R*.3,hm,[.42,1.25,.62],[0,0,s*.12]))); }
      if(o.hair==="bunLow"){ g.add(ball([x-R*.28,y-R*.18,z-R*1.0],R*.4,hm)); g.add(torus(R*.24,R*.06,[x-R*.22,y-R*.15,z-R*.8],[0,.4,0],hm)); }
      if(o.hair==="pony"){ g.add(ball([x,y+R*.32,z-R*1.0],R*.16,Gl("#D2453D"))); g.add(pill([x,y+R*.25,z-R*1.12],[x,y-R*.7,z-R*1.2],R*.18,hm,R*.26)); }
      if(o.hair==="tuft") g.add(torus(R*.14,R*.06,[x,y+R*1.12,z],[0,0,0],hm,Math.PI*1.4));
    }
    if(o.hair==="curlyBun"){
      g.add(ball([x,y+R*.14,z-R*.24],R*1.05,hm));
      for(let i=0;i<22;i++){ const th=(i/22)*Math.PI*2, ph=.35+((i*7)%5)*.18;
        const px=Math.sin(ph)*Math.cos(th), py=Math.cos(ph), pz=Math.sin(ph)*Math.sin(th);
        if(pz>.55 && py<.75) continue;
        g.add(ball([x+px*R*1.04,y+R*.12+py*R*1.04,z-R*.14+pz*R*1.04],R*.27,hm)); }
      for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; g.add(ball([x+Math.cos(a)*R*.22,y+R*1.12,z-R*.38+Math.sin(a)*R*.22],R*.24,hm)); }
      g.add(ball([x,y+R*1.28,z-R*.38],R*.24,hm));
      [-1,1].forEach(s=>g.add(ball([x+s*R*.88,y-R*.05,z+R*.05],R*.26,hm,[.6,1,.8])));
    }
    if(o.hair==="bald"){
      [-1,1].forEach(s=>{ for(let i=0;i<4;i++) g.add(ball([x+s*R*(.86-i*.08),y+R*(.05-i*.02),z-R*(.15+i*.22)],R*.24,hm,[.7,.85,.9])); });
      g.add(ball([x,y,z-R*.86],R*.32,hm,[1.6,.8,.6]));
    }
  }
  function arm(g,sh,hand,cloth,r,o){ o=o||{};
    const el=[sh[0]+(hand[0]-sh[0])*.5,sh[1]+(hand[1]-sh[1])*.5,sh[2]+(hand[2]-sh[2])*.5];
    const cut=o.longSleeve?[hand[0]-(hand[0]-sh[0])*.14,hand[1]-(hand[1]-sh[1])*.14,hand[2]-(hand[2]-sh[2])*.14]:el;
    g.add(ball(sh,r*1.12,Cl(cloth)), seg(sh,cut,r*1.18,Cl(cloth),r*1.22));
    if(o.cuff) g.add(seg(cut,[cut[0]+(hand[0]-cut[0])*.12,cut[1]+(hand[1]-cut[1])*.12,cut[2]+(hand[2]-cut[2])*.12],r*1.2,Cl(o.cuff)));
    g.add(seg(cut,hand,r*.82,Sk(o.skin||SKIN),r*.9));
    g.add(ball(hand,r*1.25,Sk(o.skin||SKIN),[1,1.1,.85]));
    g.add(ball([hand[0]+(hand[0]>0?-1:1)*r*.7,hand[1]+r*.35,hand[2]+r*.5],r*.5,Sk(o.skin||SKIN)));
  }
  function leg(g,top,foot,cloth,r,shoe,o){ o=o||{};
    g.add(pill(top,[foot[0],foot[1]+r*.2,foot[2]],r*1.05,Cl(cloth),r*1.15));
    if(o.sock) g.add(seg([foot[0],foot[1]+r*.6,foot[2]],[foot[0],foot[1]-r*.1,foot[2]],r*.95,Cl(o.sock)));
    const sh=shoe==="sneaker"?Pl("#F7F5F2"):Gl(shoe);
    g.add(ball([foot[0],foot[1]-r*.35,foot[2]+r*.55],r*1.2,sh,[1,.62,1.55]));
    if(shoe==="sneaker") g.add(ball([foot[0],foot[1]-r*.62,foot[2]+r*.55],r*1.28,Pl("#D9D6D2"),[1,.25,1.6]));
  }

  // ---------- Personajes ----------
  function rosa(){ const g=new T.Group(), SC="#2F62C8";
    leg(g,[-.18,.95,0],[-.2,.16,.04],SC,.17,"sneaker"); leg(g,[.18,.95,0],[.2,.16,-.04],SC,.17,"sneaker");
    g.add(torso(.47,.4,.95,.82,Cl(SC)));
    g.add(ball([0,1.66,.24],.15,Sk(SKIN),[1.05,1.25,.3]));
    g.add(seg([-.14,1.74,.25],[0,1.5,.36],.035,Cl("#2754B0")), seg([.14,1.74,.25],[0,1.5,.36],.035,Cl("#2754B0")));
    g.add(rbox(.2,.18,.05,[.2,1.36,.36],Cl("#2A58B6"),.03));
    g.add(seg([-.45,1.0,0],[.45,1.0,0],.05,Cl("#2754B0")).rotateX(0));
    arm(g,[-.44,1.62,0],[-.56,1.02,.3],SC,.12);
    arm(g,[.44,1.62,0],[.62,1.22,.42],SC,.12);
    g.add(seg([0,1.72,0],[0,1.86,0],.13,Sk(SKIN)));
    head(g,[0,2.36,.02],.6,{hair:"bunLow",hairColor:"#5A3826",hideEars:true}); return g; }
  function jorge(){ const g=new T.Group(), SH="#E2853A";
    leg(g,[-.19,.98,0],[-.2,.16,.03],"#3B4D72",.18,"#2D2A2E"); leg(g,[.19,.98,0],[.2,.16,.03],"#3B4D72",.18,"#2D2A2E");
    g.add(torso(.5,.44,1.0,.86,Cl(SH)));
    g.add(rbox(.64,.78,.06,[0,1.25,.4],Cl("#F2A7C0"),.05));
    g.add(seg([-.28,1.62,.3],[-.2,1.86,.1],.025,Cl("#F2A7C0")), seg([.28,1.62,.3],[.2,1.86,.1],.025,Cl("#F2A7C0")));
    g.add(ball([0,1.8,.22],.12,Sk(SKIN2),[1,1,.35]));
    arm(g,[-.48,1.72,0],[-.6,1.08,.28],SH,.13,{skin:SKIN2});
    arm(g,[.48,1.72,0],[.6,1.08,.28],SH,.13,{skin:SKIN2});
    g.add(seg([0,1.82,0],[0,1.96,0],.14,Sk(SKIN2)));
    head(g,[0,2.48,.02],.6,{hair:"short",hairColor:"#241B1E",skin:SKIN2}); return g; }
  function mateo(){ const g=new T.Group(), Y="#F2C14E";
    leg(g,[-.13,.42,0],[-.13,.12,.03],Y,.12,"sneaker"); leg(g,[.13,.42,0],[.13,.12,.03],Y,.12,"sneaker");
    g.add(torso(.33,.28,.55,.32,Cl(Y),0,.9));
    g.add(rbox(.22,.16,.04,[0,.6,.27],Cl("#E9AE33"),.04));
    arm(g,[-.27,.78,0],[-.46,1.05,.12],Y,.085); arm(g,[.27,.78,0],[.46,1.05,.12],Y,.085);
    head(g,[0,1.3,.02],.48,{hair:"tuft",hairColor:"#241B1E"}); return g; }
  function sofia(){ const g=new T.Group();
    leg(g,[-.14,.66,0],[-.14,.12,.03],SKIN,.11,"#2D2A2E",{sock:"#F5F3F0"}); leg(g,[.14,.66,0],[.14,.12,.03],SKIN,.11,"#2D2A2E",{sock:"#F5F3F0"});
    g.add(torso(.44,.3,.5,.55,Cl("#2C3557"),0,.85));
    g.add(torso(.32,.29,.55,.92,Cl("#F6F4F1")));
    g.add(ball([0,1.4,.2],.07,Cl("#D2453D"),[1.6,.8,.5]));
    arm(g,[-.34,1.36,0],[-.44,.86,.14],"#F6F4F1",.09); arm(g,[.34,1.36,0],[.44,.86,.14],"#F6F4F1",.09);
    g.add(rbox(.56,.62,.26,[0,1.12,-.38],Cl("#D2453D"),.1)); g.add(rbox(.38,.22,.08,[0,.96,-.54],Cl("#B53830"),.04));
    g.add(seg([-.22,1.42,-.24],[-.22,.92,-.26],.035,Cl("#B53830")), seg([.22,1.42,-.24],[.22,.92,-.26],.035,Cl("#B53830")));
    g.add(seg([0,1.44,0],[0,1.56,0],.11,Sk(SKIN)));
    head(g,[0,1.98,.02],.5,{hair:"pony",hairColor:"#241B1E"}); return g; }
  function daniel(){ const g=new T.Group(), TIRE=Pl("#2B2A30"), RIM=Mt("#A6ABB2"), FR=Mt("#B9BDC4"), SEAT=Gl("#2F2E35");
    [-.62,.62].forEach(x=>{ g.add(torus(.6,.085,[x,.64,-.12],[0,Math.PI/2,0],TIRE)); g.add(torus(.5,.03,[x*1.05,.64,-.12],[0,Math.PI/2,0],RIM));
      g.add(cyl0(.09,.08,[x,.64,-.12],TIRE));
      for(let k=0;k<4;k++){ const a=k*Math.PI/4; g.add(seg([x,.64+Math.sin(a)*.5,-.12+Math.cos(a)*.5],[x,.64-Math.sin(a)*.5,-.12-Math.cos(a)*.5],.022,TIRE,null,8)); }
      g.add(torus(.14,.055,[x*.84,.15,.7],[0,Math.PI/2,0],TIRE)); g.add(seg([x*.84,.3,.7],[x*.84,.9,.5],.04,FR));
      g.add(seg([x*.84,.9,-.42],[x*.84,1.78,-.5],.042,FR)); g.add(seg([x*.84,1.78,-.5],[x*.84,1.8,-.74],.06,TIRE));
      g.add(seg([x*.84,.92,.3],[x*.84,1.2,.3],.035,FR)); g.add(rbox(.14,.09,.62,[x*.84,1.24,.0],SEAT,.04));
      g.add(seg([x*.84,.9,.5],[x*.84,.92,-.42],.04,FR)); });
    g.add(rbox(1.05,.14,.86,[0,.94,.02],SEAT,.06)); g.add(rbox(1.0,.78,.1,[0,1.38,-.48],SEAT,.05));
    g.add(rbox(.66,.06,.28,[0,.22,.86],SEAT,.03)); g.add(seg([0,.24,.74],[0,.6,.5],.035,FR));
    const TQ="#3E9A92", DN="#3B4D72";
    g.add(torso(.44,.4,.85,.98,Cl(TQ),-.16));
    g.add(ball([0,1.78,.08],.11,Sk(SKIN2),[1,1,.35]));
    [-.2,.2].forEach(x=>{ g.add(pill([x,1.08,-.08],[x,1.08,.56],.17,Cl(DN))); g.add(pill([x,1.06,.62],[x,.38,.76],.14,Cl(DN)));
      g.add(ball([x,.28,.88],.16,Gl("#2D2A2E"),[1,.6,1.5])); });
    arm(g,[-.44,1.7,-.16],[-.24,1.18,.48],TQ,.11,{skin:SKIN2,longSleeve:true,cuff:"#358880"});
    arm(g,[.44,1.7,-.16],[.22,1.2,.5],TQ,.11,{skin:SKIN2,longSleeve:true,cuff:"#358880"});
    g.add(seg([0,1.8,-.14],[0,1.94,-.12],.13,Sk(SKIN2)));
    head(g,[0,2.44,-.08],.58,{hair:"short",hairColor:"#241B1E",skin:SKIN2}); return g; }
  function cyl0(r,h,p,m){ const s=new T.Mesh(new T.CylinderGeometry(r,r,h,24),m); s.position.copy(V(p)); s.rotation.z=Math.PI/2; return s; }
  function lupe(){ const g=new T.Group(), LI="#B497D9", CR="#F3E9D6", SK="#7B5A44";
    leg(g,[-.15,.5,0],[-.15,.14,.03],"#E9D9C3",.11,"#7A4D33"); leg(g,[.15,.5,0],[.15,.14,.03],"#E9D9C3",.11,"#7A4D33");
    g.add(torso(.6,.42,.72,.28,Cl(SK),0,.85));
    g.add(torso(.42,.38,.75,.9,Cl(LI)));
    g.add(rbox(.24,.66,.06,[0,1.28,.34],Cl(CR),.04));
    [-1,1].forEach(s=>g.add(rbox(.08,.7,.07,[s*.15,1.26,.35],Cl("#A486CC"),.03)));
    [1.48,1.3,1.12].forEach(yy=>g.add(ball([.17,yy,.39],.03,Gl("#EDE7F6"))));
    arm(g,[-.42,1.56,0],[-.54,1.06,.24],LI,.11,{longSleeve:true,cuff:"#A486CC"});
    arm(g,[.42,1.56,0],[.52,1.04,.3],LI,.11,{longSleeve:true,cuff:"#A486CC"});
    g.add(seg([0,1.62,0],[0,1.74,0],.12,Sk(SKIN)));
    head(g,[0,2.22,.02],.56,{hair:"curlyBun",hairColor:"#D9D5D8",brow:"#A8A3A6",glasses:true,hideEars:true}); return g; }
  function ernesto(){ const g=new T.Group(), OL="#7E8A55";
    leg(g,[-.18,.95,0],[-.18,.15,.03],"#6C6E78",.16,"#6E4A34"); leg(g,[.18,.95,0],[.18,.15,.03],"#6C6E78",.16,"#6E4A34");
    g.add(torso(.47,.42,.95,.82,Cl("#F3F1EC")));
    g.add(torso(.49,.43,.8,.84,Cl(OL)));
    [-1,1].forEach(s=>g.add(ball([s*.1,1.7,.3],.1,Cl("#F3F1EC"),[1,.5,.4],[0,0,s*.5])));
    arm(g,[-.45,1.62,0],[-.54,1.06,.24],"#F3F1EC",.12,{longSleeve:true});
    arm(g,[.45,1.62,0],[.64,1.04,.34],"#F3F1EC",.12,{longSleeve:true});
    g.add(seg([0,1.7,0],[0,1.84,0],.13,Sk(SKIN)));
    head(g,[0,2.32,.02],.56,{hair:"bald",hairColor:"#D9D5D8",brow:"#A8A3A6",glasses:true,mustache:true});
    const W=Gl("#7A4E2A"); g.add(seg([.72,.02,.46],[.68,1.02,.36],.045,W)); g.add(torus(.11,.045,[.57,1.03,.36],[0,Math.PI,0],W,Math.PI)); return g; }
  function couple(){ const g=new T.Group(); const a=lupe(); a.position.x=-.6; const b=ernesto(); b.position.x=.6; g.add(a,b); return g; }
  return {eyes, make:{rosa,jorge,mateo,sofia,daniel,lupe:couple,lupeSola:lupe,ernesto}};
}

OBS.M3D={T,lin,reduce,roundedBox,blobTexture,makeStage,gummy,txt,buildFigures};
})();
