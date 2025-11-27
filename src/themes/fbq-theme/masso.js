(() => {
  const mk = (tag, props={}, children=[]) => {
    const el = document.createElement(tag);
    for (const [k,v] of Object.entries(props)) {
      if (k === 'class') el.className = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    }
    (Array.isArray(children)?children:[children]).filter(Boolean).forEach(c=>{
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  };

  const pill = document.createElement('span');
  pill.id = 'massoDirty'; pill.className = 'masso-pill'; pill.textContent = 'Checking…';
  const btnDetach = document.createElement('button'); btnDetach.id='btnDetach'; btnDetach.className='masso-btn secondary'; btnDetach.textContent='Detach';
  btnDetach.addEventListener('click', ()=>run('/shim/detach'));
  const btnCommit = document.createElement('button'); btnCommit.id='btnCommit'; btnCommit.className='masso-btn'; btnCommit.textContent='Sync to USB'; btnCommit.disabled=true;
  btnCommit.addEventListener('click', ()=>run('/shim/commit'));
  const btnAttach = document.createElement('button'); btnAttach.id='btnAttach'; btnAttach.className='masso-btn secondary'; btnAttach.textContent='Attach';
  btnAttach.addEventListener('click', ()=>run('/shim/attach'));

  const card = document.createElement('div'); card.id='massoCard'; card.className='masso-card';
  const title = document.createElement('div'); title.className='masso-title'; title.textContent='USB Controls';
  const row = document.createElement('div'); row.className='masso-row'; row.append(btnDetach, btnCommit, btnAttach);
  card.append(title, pill, row);

  function mount(){
    const old = document.getElementById('massoCard');
    if (old && old.parentElement) old.parentElement.removeChild(old);

    const sidebar = document.querySelector('nav#sidebar');
    if (!sidebar) return;

    const sources = sidebar.querySelector('.sidebar-scroll-list .sources');
    if (sources && sources.parentElement) {
      sources.parentElement.insertBefore(card, sources.nextSibling);
    } else {
      const buffer = sidebar.querySelector('.buffer');
      (buffer || sidebar).appendChild(card);
    }
    refreshStatus();
  }

  async function refreshStatus(){
    try{
      const r = await fetch('/shim/status',{cache:'no-store'});
      const js = await r.json();
      if(js.dirty){
        pill.textContent = 'Dirty';
        pill.style.background = '#fde68a';
        btnCommit.disabled = false;
      }else{
        pill.textContent = 'Up to date';
        pill.style.background = '#ffffff';
        btnCommit.disabled = true;
      }
    }catch(e){
      pill.textContent = 'Status error';
      pill.style.background = '#fecaca';
      btnCommit.disabled = false;
    }
  }

  async function run(path){
    const prev = pill.textContent;
    [btnDetach, btnCommit, btnAttach].forEach(b => b.disabled = true);
    pill.textContent = 'Working…';
    try{
      const r = await fetch(path, {method:'POST'});
      if(!r.ok) throw new Error(await r.text());
      await new Promise(res => setTimeout(res, 800));
      await refreshStatus();
    }catch(e){
      alert('Action failed: ' + e.message);
    }finally{
      try{
        const s = await fetch('/shim/status',{cache:'no-store'}).then(r=>r.json());
        btnCommit.disabled = !s.dirty;
      }catch(_){ btnCommit.disabled = false; }
      btnDetach.disabled = false; btnAttach.disabled = false;
      if (prev !== 'Working…') pill.textContent = prev;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    mount();
    const obs = new MutationObserver(() => {
      if (!document.getElementById('massoCard')) mount();
    });
    obs.observe(document.body, {childList:true, subtree:true});
    setInterval(refreshStatus, 3000);
  });
})();
