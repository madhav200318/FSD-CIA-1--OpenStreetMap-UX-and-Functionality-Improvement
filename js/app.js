const $=s=>document.querySelector(s);
const form=$('#searchForm'),input=$('#q'),clearBtn=$('#clear'),msg=$('#msg'),sug=$('#sug'),results=$('#results'),preview=$('#preview'),go=$('#go'),about=$('#about');
let ctrl=null,items=[],sel=-1,act=-1,lastQ='',sugList=[],markers=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const flag=cc=>cc?cc.toUpperCase().replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt())):'🌐';
const cap=s=>String(s||'place').replace(/_/g,' ').replace(/^./,c=>c.toUpperCase());

/* Full-screen background map (Leaflet + OpenStreetMap tiles) */
const map=L.map('map',{zoomControl:false}).setView([12.97,77.59],11);
L.control.zoom({position:'topright'}).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
const layer=L.layerGroup().addTo(map);
const pinIcon=on=>L.divIcon({className:'',html:`<div class="pin ${on?'on':''}"></div>`,iconSize:on?[28,28]:[18,18],iconAnchor:on?[14,28]:[9,18]});

function validate(q){
  if(!q)return'Please enter a place name, street or address.';
  if(q.length<2)return'Type at least 2 characters to search.';
  if(q.length>100)return'Your search is too long. Keep it under 100 characters.';
  return'';
}
function showMsg(t){msg.textContent=t;input.setAttribute('aria-invalid',!!t)}

/* EVENT 1: input — instant suggestions from local JSON */
input.addEventListener('input',()=>{
  const q=input.value.trim().toLowerCase();
  clearBtn.classList.toggle('hidden',!input.value);showMsg('');act=-1;
  if(!q){sug.classList.add('hidden');return}
  sugList=LOCAL_PLACES.map(p=>{const n=p.name.toLowerCase(),c=(p.region+' '+p.country).toLowerCase();
    return{p,s:n.startsWith(q)?3:n.includes(q)?2:c.includes(q)?1:0}}).filter(x=>x.s).sort((a,b)=>b.s-a.s).slice(0,6).map(x=>x.p);
  renderSug();
});
function renderSug(){
  if(!sugList.length){sug.classList.add('hidden');return}
  sug.innerHTML=sugList.map((p,i)=>`<li role="option" data-i="${i}" class="sug-item px-4 py-2.5 cursor-pointer flex justify-between gap-3 ${i===act?'on':''}">
   <span><b>${esc(p.name)}</b><span class="block text-xs text-blue-300">${esc(p.region)}, ${esc(p.country)}</span></span><span class="chip self-center">${esc(p.type)}</span></li>`).join('');
  sug.classList.remove('hidden');
}
sug.addEventListener('mousedown',e=>{const li=e.target.closest('li');if(li){e.preventDefault();pick(+li.dataset.i)}});
function pick(i){const p=sugList[i];input.value=`${p.name}, ${p.region}`;sug.classList.add('hidden');form.requestSubmit()}
input.addEventListener('keydown',e=>{
  if(sug.classList.contains('hidden'))return;
  if(e.key==='ArrowDown'){e.preventDefault();act=(act+1)%sugList.length;renderSug()}
  else if(e.key==='ArrowUp'){e.preventDefault();act=(act-1+sugList.length)%sugList.length;renderSug()}
  else if(e.key==='Enter'&&act>=0){e.preventDefault();pick(act)}
  else if(e.key==='Escape')sug.classList.add('hidden');
});
input.addEventListener('blur',()=>setTimeout(()=>sug.classList.add('hidden'),120));
clearBtn.addEventListener('click',()=>{input.value='';clearBtn.classList.add('hidden');sug.classList.add('hidden');showMsg('');reset();state('idle');input.focus()});
function reset(){items=[];sel=-1;layer.clearLayers();markers=[];resetPreview()}

/* EVENT 2: submit — validate, then fetch real data from Nominatim */
form.addEventListener('submit',e=>{
  e.preventDefault();const q=input.value.trim(),err=validate(q);
  if(err){showMsg(err);input.focus();return}
  showMsg('');search(q);
});

function state(type){
  const box=(icon,title,sub,btn)=>`<div class="glass p-6 text-center fade"><div class="text-3xl mb-2">${icon}</div><p class="font-display font-semibold">${title}</p>${sub?`<p class="text-sm text-blue-300 mt-1">${sub}</p>`:''}${btn||''}</div>`;
  results.innerHTML={
    idle:box('🧭','Start typing to explore places','Try “Springfield”, “Paris” or “Cambridge” to compare similar-named places.'),
    loading:`<div class="glass p-6 flex flex-col items-center gap-3" role="status"><div class="spinner"></div><p>Searching for locations…</p></div>`,
    empty:box('🔍','No locations found. Try a different name or address.'),
    error:box('⚠️','We couldn\'t load locations. Check your connection and try again.','','<button id="retry" class="btn mt-4">Retry</button>')
  }[type];
  const r=$('#retry');if(r)r.onclick=()=>lastQ?search(lastQ):state('idle');
}

async function search(q){
  lastQ=q;if(ctrl)ctrl.abort();ctrl=new AbortController();
  go.disabled=true;reset();state('loading');
  try{
    const res=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&addressdetails=1&limit=8`,{signal:ctrl.signal,headers:{Accept:'application/json'}});
    if(!res.ok)throw new Error(res.status);
    items=await res.json();
    items.length?renderCards():state('empty');
  }catch(err){if(err.name==='AbortError')return;state('error')}
  finally{go.disabled=false}
}

function renderCards(){
  const counts={};items.forEach(r=>{const n=(r.name||r.display_name.split(',')[0]).toLowerCase();counts[n]=(counts[n]||0)+1});
  results.innerHTML=`<p class="text-xs text-blue-300 mb-2">${items.length} matching location${items.length>1?'s':''} — select one</p><div class="grid gap-2.5">`+items.map((r,i)=>{
    const name=r.name||r.display_name.split(',')[0],a=r.address||{},dup=counts[name.toLowerCase()]>1;
    const where=[a.city||a.town||a.village||a.county,a.state,a.country].filter(Boolean).join(', ');
    return`<button type="button" data-i="${i}" class="result glass p-3.5" aria-pressed="false">
     <div class="flex items-start justify-between gap-2"><h3 class="font-display font-semibold text-sm">${flag(a.country_code)} ${esc(name)}</h3><span class="chip shrink-0">${esc(cap(r.type))}</span></div>
     <p class="text-sm text-blue-200 mt-1">${esc(where||r.display_name)}</p>
     <p class="text-xs text-blue-400 mt-1">${esc(r.display_name)}</p>
     ${dup?'<span class="chip c mt-2 inline-block">Similar name — check region</span>':''}</button>`}).join('')+'</div>';
  layer.clearLayers();
  markers=items.map((r,i)=>L.marker([+r.lat,+r.lon],{icon:pinIcon(false),title:r.display_name}).on('click',()=>select(i)).addTo(layer));
  map.fitBounds(L.featureGroup(markers).getBounds().pad(.3),{maxZoom:13,paddingTopLeft:[innerWidth>768?420:0,0]});
}
/* EVENT 3: click — select a result card, highlight it and update preview + map */
results.addEventListener('click',e=>{const c=e.target.closest('.result');if(c)select(+c.dataset.i,true)});
function select(i,fromCard){
  sel=i;
  results.querySelectorAll('.result').forEach(n=>{const on=+n.dataset.i===i;n.classList.toggle('sel',on);n.setAttribute('aria-pressed',on);if(on&&!fromCard)n.scrollIntoView({block:'nearest',behavior:'smooth'})});
  markers.forEach((m,k)=>m.setIcon(pinIcon(k===i)).setZIndexOffset(k===i?1000:0));
  const r=items[i];map.flyTo([+r.lat,+r.lon],15,{duration:1});showPreview(r);
}
function resetPreview(){preview.innerHTML=''}
function showPreview(r){
  const lat=+r.lat,lon=+r.lon,name=r.name||r.display_name.split(',')[0];
  preview.innerHTML=`<div class="glass p-4 mb-4 fade border-cyan-300/50"><span class="chip c">✓ Selected location</span>
   <h3 class="font-display font-bold text-lg mt-2">${esc(name)}</h3>
   <p class="text-sm text-blue-200 mt-1">${esc(r.display_name)}</p>
   <p class="text-xs text-blue-400 mt-2">${esc(cap(r.category))} · ${esc(cap(r.type))} · ${lat.toFixed(5)}, ${lon.toFixed(5)}</p>
   <div class="flex flex-wrap gap-2 mt-3"><a class="btn2" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}">Open in OSM</a>
   <a class="btn2" target="_blank" rel="noopener" href="https://www.openstreetmap.org/directions?route=%3B${lat}%2C${lon}">Plan route here</a></div></div>`;
}

/* Panel collapse + About modal + state demos */
$('#toggle').addEventListener('click',()=>{const b=$('#body');b.classList.toggle('hidden');$('#toggle').textContent=b.classList.contains('hidden')?'▾':'▴'});
const setAbout=o=>about.classList.toggle('hidden',!o);
$('#openAbout').addEventListener('click',()=>setAbout(true));
$('#closeAbout').addEventListener('click',()=>setAbout(false));
addEventListener('keydown',e=>{if(e.key==='Escape')setAbout(false)});
document.querySelectorAll('[data-state]').forEach(b=>b.addEventListener('click',()=>{
  const s=b.dataset.state;setAbout(false);reset();
  if(s==='success'){const mk=(st,la,lo)=>({name:'Springfield',type:'city',category:'place',lat:la,lon:lo,display_name:`Springfield, ${st}, United States`,address:{city:'Springfield',state:st,country:'United States',country_code:'us'}});
    items=[mk('Illinois',39.78,-89.65),mk('Massachusetts',42.10,-72.59),mk('Missouri',37.21,-93.29)];renderCards()}
  else state(s);
}));
state('idle');
