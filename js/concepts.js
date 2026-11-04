/* Ручная лента: перетаскивание мышкой, нативный свайп, стрелки; оригиналы без потерь качества. */
(() => {
  const section = document.querySelector('.concepts');
  if (!section) return;
  const viewport = section.querySelector('.concepts-viewport');
  const frame = section.querySelector('.concepts-window');
  const cards = [...section.querySelectorAll('.concept-card')];
  const dialog = document.querySelector('.concept-dialog');
  const big = dialog.querySelector('.concept-dialog-image');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, lastFocus = null, drag = null, dragged = false, motion = 0;
  const update = () => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    frame.classList.toggle('has-before', viewport.scrollLeft > 2);
    frame.classList.toggle('has-after', viewport.scrollLeft < max - 2);
    section.querySelector('[data-step="-1"]').disabled = viewport.scrollLeft < 2;
    section.querySelector('[data-step="1"]').disabled = viewport.scrollLeft >= max - 2;
  };
  const glideTo = (left, duration = 450) => {
    cancelAnimationFrame(motion);
    const from=viewport.scrollLeft, to=Math.max(0,Math.min(left,viewport.scrollWidth-viewport.clientWidth));
    if(reduce.matches){viewport.scrollLeft=to;return;}
    const began=performance.now();
    const tick=now=>{const t=Math.min(1,(now-began)/duration);viewport.scrollLeft=from+(to-from)*(1-Math.pow(1-t,3));if(t<1)motion=requestAnimationFrame(tick);};
    motion=requestAnimationFrame(tick);
  };
  const step = direction => glideTo(viewport.scrollLeft+direction*(cards[0].offsetWidth+24));
  viewport.addEventListener('touchstart',()=>cancelAnimationFrame(motion),{passive:true});
  viewport.addEventListener('wheel',()=>cancelAnimationFrame(motion),{passive:true});
  section.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => step(Number(b.dataset.step))));
  viewport.addEventListener('scroll', update, {passive:true});
  new ResizeObserver(update).observe(viewport);
  viewport.addEventListener('keydown', e => { if (e.key==='ArrowLeft'||e.key==='ArrowRight') {e.preventDefault();step(e.key==='ArrowRight'?1:-1);} });
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType!=='mouse'||e.button!==0) return;
    cancelAnimationFrame(motion);drag={x:e.clientX,left:viewport.scrollLeft,lastX:e.clientX,time:performance.now(),velocity:0};dragged=false;
  });
  viewport.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx=e.clientX-drag.x;
    if (Math.abs(dx)>4&&!dragged) {dragged=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('is-dragging');}
    if (dragged) {e.preventDefault();const now=performance.now();drag.velocity=(e.clientX-drag.lastX)/Math.max(1,now-drag.time);drag.lastX=e.clientX;drag.time=now;viewport.scrollLeft=drag.left-dx;}
  });
  const endDrag=()=>{const velocity=drag&&performance.now()-drag.time<80?Math.max(-2,Math.min(2,drag.velocity)):0;drag=null;viewport.classList.remove('is-dragging');if(dragged)glideTo(viewport.scrollLeft-velocity*140,500);update();};
  viewport.addEventListener('pointerup',endDrag);
  viewport.addEventListener('pointercancel',endDrag);
  viewport.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();dragged=false;}},true);
  const show=n=>{
    index=(n+cards.length)%cards.length;
    const img=cards[index].querySelector('img');
    big.src=img.src;big.alt=img.alt;dialog.querySelector('.concept-dialog-caption').textContent=img.alt;
    const selected=index,full=new Image();full.onload=()=>{if(dialog.open&&index===selected)big.src=full.src;};full.src=img.dataset.full||img.src;
  };
  cards.forEach((card,i)=>card.querySelector('button').addEventListener('click',e=>{lastFocus=e.currentTarget;show(i);dialog.showModal();document.body.style.overflow='hidden';}));
  dialog.querySelector('.concept-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>show(index+Number(b.dataset.step))));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));}});
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus({preventScroll:true});});
  update();
})();
