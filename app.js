(function(){
  const $=s=>document.querySelector(s);
  const fmt=ts=>ts?new Date(ts).toLocaleString():'-';
  const dur=ms=>{if(ms<0)ms=0;const s=Math.floor(ms/1000)%60,m=Math.floor(ms/60000)%60,h=Math.floor(ms/3600000);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;};

  // Tabs
  document.querySelectorAll('nav button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); $('#tab-'+btn.dataset.tab).classList.add('active');
    });
  });

  // Fasting
  let fasting={mode:'idle',startedAt:null,targetAt:null,fastHours:16,eatHours:8,log:[]};
  function fSave(){localStorage.setItem('se_fast',JSON.stringify(fasting));}
  function fLoad(){try{fasting=JSON.parse(localStorage.getItem('se_fast'))||fasting;}catch{}}
  function fRender(){ $('#f-status').textContent=fasting.mode; $('#f-phase').textContent=fasting.mode; $('#f-started').textContent=fmt(fasting.startedAt); $('#f-target').textContent=fmt(fasting.targetAt); const ul=$('#f-log'); ul.innerHTML=''; fasting.log.forEach(it=>{const li=document.createElement('li');li.textContent=`${fmt(it.ts)} — ${it.event}`;ul.appendChild(li);});}
  function fStart(){fasting.mode='fasting';fasting.startedAt=Date.now();fasting.targetAt=fasting.startedAt+fasting.fastHours*3600000;fasting.log.unshift({ts:Date.now(),event:`Start fasting ${fasting.fastHours}h`});fSave();fRender();}
  function fStop(){fasting.mode='eating';fasting.startedAt=Date.now();fasting.targetAt=fasting.startedAt+fasting.eatHours*3600000;fasting.log.unshift({ts:Date.now(),event:`Start eating ${fasting.eatHours}h`});fSave();fRender();}
  function fTick(){if(!fasting.targetAt){$('#f-countdown').textContent='--:--:--';return;}const left=fasting.targetAt-Date.now();$('#f-countdown').textContent=dur(left);if(left<=0){if(fasting.mode==='fasting')fStop();else fStart();}}
  $('#f-protocol').addEventListener('change',e=>{if(e.target.value==='custom'){$('#f-custom-f').classList.remove('hidden');$('#f-custom-e').classList.remove('hidden');}else{$('#f-custom-f').classList.add('hidden');$('#f-custom-e').classList.add('hidden');const [f,eat]=e.target.value.split(':').map(Number);fasting.fastHours=f;fasting.eatHours=eat;fSave();}});
  $('#f-start').addEventListener('click',fStart); $('#f-stop').addEventListener('click',fStop);

  // Tracker
  let tracker={log:[]}; function tSave(){localStorage.setItem('se_track',JSON.stringify(tracker));} function tLoad(){try{tracker=JSON.parse(localStorage.getItem('se_track'))||tracker;}catch{}}
  function tRender(){const ul=$('#t-log'); ul.innerHTML=''; tracker.log.forEach(it=>{const li=document.createElement('li');li.textContent=`${fmt(it.ts)} — ${it.weight||''}kg ${it.mood||''} ${it.note||''}`; ul.appendChild(li);});}
  $('#t-add').addEventListener('click',()=>{tracker.log.unshift({ts:Date.now(),weight:$('#t-weight').value,mood:$('#t-mood').value,note:$('#t-note').value});tSave();tRender();});
  $('#t-export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(tracker)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='tracker.json';a.click();});
  $('#t-import').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{tracker=JSON.parse(r.result);tSave();tRender();}catch{}};r.readAsText(f);});

  // Init
  fLoad();fRender();setInterval(fTick,1000); tLoad();tRender();
})();