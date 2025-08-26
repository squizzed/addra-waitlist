const $ = (s)=>document.querySelector(s);
document.getElementById('year').textContent = new Date().getFullYear();

// Simple starfield
(function stars(){
  const c = document.getElementById('stars'); if(!c) return;
  const ctx = c.getContext('2d'); const dpr = devicePixelRatio||1;
  const draw = ()=>{ c.width = innerWidth*dpr; c.height = innerHeight*dpr; ctx.clearRect(0,0,c.width,c.height);
    for(let i=0;i<120;i++){ const x=Math.random()*c.width,y=Math.random()*c.height,r=(Math.random()*2+0.3)*dpr;
      ctx.globalAlpha = Math.random()*0.7; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=['#9ecbff','#afffea','#c3b8ff'][i%3]; ctx.fill(); } };
  addEventListener('resize', draw, {passive:true}); draw();
})();

// Persistent count
(async()=>{
  try{ const r=await fetch('/.netlify/functions/stats',{cache:'no-store'}); const j=await r.json();
    if(typeof j.count==='number') $('#count').textContent=new Intl.NumberFormat().format(j.count);
  }catch{}
})();

// Join form
const form = $('#wl'), msg = $('#msg'), btn = $('#joinBtn');
form?.addEventListener('submit', async (e)=>{
  e.preventDefault(); msg.textContent=''; btn.classList.add('loading'); btn.disabled=true;
  const name = (document.getElementById('name').value||'').trim();
  const email = (document.getElementById('email').value||'').trim();
  try{
    const res = await fetch('/.netlify/functions/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email})});
    const j = await res.json().catch(()=>({}));
    if(!res.ok || !j.ok) throw new Error(j.error||'Failed');
    msg.style.color='#7fffd4'; msg.textContent='Submitted! Check your email.'; form.reset();
    try{ const r=await fetch('/.netlify/functions/stats',{cache:'no-store'}); const d=await r.json(); if(typeof d.count==='number') $('#count').textContent=new Intl.NumberFormat().format(d.count);}catch{}
  }catch(err){ console.error(err); msg.style.color='#ff9b9b'; msg.textContent='Something went wrong. Please try again.'; }
  finally{ btn.classList.remove('loading'); btn.disabled=false; }
});
