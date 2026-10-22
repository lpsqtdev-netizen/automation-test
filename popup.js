const $ = id => document.getElementById(id);
const SUPPORTED_VINTED_HOST = /(^|\.)vinted\.(fr|be|de|es|it|nl|pl|pt)$/i;
let currentItems = [];
const money = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n || 0);
const safe = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function switchTab(name){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===name));}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
async function getActiveTab(){return (await chrome.tabs.query({active:true,currentWindow:true}))[0];}
async function collectVisible(){
  $('status').textContent='Lecture des annonces visibles…';
  try{
    const tab=await getActiveTab();
    if(!tab?.id) throw Error('no-active-tab');
    const activeUrl = new URL(tab.url || '');
    if(activeUrl.protocol !== 'https:' || !SUPPORTED_VINTED_HOST.test(activeUrl.hostname)) throw Error('not-vinted');
    const response=await chrome.tabs.sendMessage(tab.id,{type:'VINTED_COMPANION_COLLECT'});
    currentItems=response?.items||[];
    const drops=await recordPriceObservations(currentItems);
    renderCurrent();
    $('status').textContent=currentItems.length?currentItems.length+' annonce(s) détectée(s).'+(drops.length?' Baisse(s) détectée(s) : '+drops.slice(0,3).join(', ')+'.':''):'Aucune annonce reconnue. Essaie une page de résultats et fais défiler la page.';
    if(drops.length)$('watchStatus').textContent='Baisse(s) observée(s) : '+drops.slice(0,4).join(' · ');
    renderWatchlist();
  }catch(e){currentItems=[];renderCurrent();$('status').textContent=e?.message==='not-vinted'?'Ouvre un domaine Vinted pris en charge pour analyser les annonces.':'Impossible de lire cette page. Recharge Vinted et relance l’analyse ; si le problème persiste, vérifie que l’extension est activée.';}
}
async function recordPriceObservations(items){
  const {watchlist=[]}=await chrome.storage.local.get('watchlist');
  const now=Date.now(), drops=[];
  const updated=watchlist.map(w=>{
    const seen=items.find(x=>x.id===w.id);
    if(!seen)return w;
    const history=Array.isArray(w.priceHistory)?w.priceHistory:[];
    const last=history[history.length-1];
    if(last&&Number(last.price)!==Number(seen.price)&&Number(seen.price)<Number(last.price))drops.push(w.title+' ('+money(Number(last.price)-Number(seen.price))+')');
    if(!last||Number(last.price)!==Number(seen.price)||now-last.at>6*60*60*1000)history.push({price:Number(seen.price),at:now});
    return {...w,price:Number(seen.price),lastSeenAt:now,priceHistory:history.slice(-100)};
  });
  await chrome.storage.local.set({watchlist:updated});
  return drops;
}
function visibleFiltered(){const q=$('filterInput').value.trim().toLocaleLowerCase('fr');return currentItems.filter(x=>!q||[x.title,String(x.price),money(x.price),x.url].some(v=>String(v||'').toLocaleLowerCase('fr').includes(q)));}
function renderCurrent(){
  const prices=currentItems.map(x=>x.price).filter(Number.isFinite);
  $('count').textContent=currentItems.length;
  $('average').textContent=prices.length?money(prices.reduce((a,b)=>a+b,0)/prices.length):'—';
  $('minimum').textContent=prices.length?money(Math.min(...prices)):'—';
  const visible=visibleFiltered();
  $('items').innerHTML=visible.slice(0,30).map(itemHtml).join('')||'<div class="empty">Aucune annonce correspondante. Lance une analyse ou modifie le filtre.</div>';
  document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();chrome.tabs.create({url:a.dataset.open});}));
  document.querySelectorAll('[data-track]').forEach(b=>b.addEventListener('click',()=>addToWatchlist(currentItems.find(x=>x.id===b.dataset.track))));
}
function itemHtml(x,tracked=false){
  const hist=Array.isArray(x.priceHistory)?x.priceHistory:[];
  const previous=hist.length>1?hist[hist.length-2].price:null;
  const change=previous!==null&&Number(previous)!==Number(x.price)?'<div class="price-change '+(x.price<previous?'down':'up')+'">'+(x.price<previous?'↓ ':'↑ ')+money(Math.abs(x.price-previous))+' depuis la dernière observation</div>':'';
  return '<div class="item">'+(x.image?'<img class="thumb" src="'+safe(x.image)+'" alt="">':'<div class="thumb"></div>')+'<div class="item-info"><div class="item-title">'+safe(x.title)+'</div><div class="item-price">'+money(x.price)+'</div>'+change+'<a class="item-link" href="#" data-open="'+safe(x.url)+'">Voir l’annonce ↗</a></div><button class="remove" title="'+(tracked?'Retirer du suivi':'Ajouter au suivi')+'" '+(tracked?'data-remove':'data-track')+'="'+safe(x.id)+'">'+(tracked?'×':'＋')+'</button></div>';
}
async function addToWatchlist(item){
  if(!item)return;
  const {watchlist=[]}=await chrome.storage.local.get('watchlist');
  const existing=watchlist.find(x=>x.id===item.id);
  const next=existing?watchlist.map(x=>x.id===item.id?{...x,...item,priceHistory:x.priceHistory||[{price:item.price,at:Date.now()}]}:x):[{...item,priceHistory:[{price:item.price,at:Date.now()}],lastSeenAt:Date.now()},...watchlist];
  await chrome.storage.local.set({watchlist:next.slice(0,300)});
  $('watchStatus').textContent=existing?'Annonce déjà suivie : informations actualisées.':'Annonce ajoutée au suivi local.';
  renderWatchlist();
}
$('refresh').addEventListener('click',collectVisible);
$('filterInput').addEventListener('input',renderCurrent);
$('saveVisible').addEventListener('click',async()=>{for(const item of visibleFiltered())await addToWatchlist(item);$('status').textContent=visibleFiltered().length+' annonce(s) ajoutée(s) ou actualisée(s) dans le suivi.';});
function downloadCsv(filename,rows){
  if(rows.length<=1){$('status').textContent='Aucune donnée à exporter.';return;}
  const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('exportCsv').addEventListener('click',()=>downloadCsv('vinted-annonces.csv',[['Titre','Prix EUR','URL','Date de détection'],...visibleFiltered().map(x=>[x.title,x.price,x.url,new Date(x.seenAt||Date.now()).toISOString()])]));
$('exportWatch').addEventListener('click',async()=>{const{watchlist=[]}=await chrome.storage.local.get('watchlist');downloadCsv('vinted-suivi.csv',[['Titre','Prix actuel EUR','URL','Dernière observation','Historique prix (JSON)'],...watchlist.map(x=>[x.title,x.price,x.url,x.lastSeenAt?new Date(x.lastSeenAt).toISOString():'',JSON.stringify(x.priceHistory||[])])]);});
async function renderWatchlist(){
  const {watchlist=[]}=await chrome.storage.local.get('watchlist');
  $('watchCount').textContent=watchlist.length?'('+watchlist.length+')':'';
  $('watchItems').innerHTML=watchlist.map(x=>itemHtml(x,true)).join('')||'<div class="empty">Ton suivi est vide. Ajoute des annonces depuis l’onglet Analyse.</div>';
  document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();chrome.tabs.create({url:a.dataset.open});}));
  document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',async()=>{const{watchlist=[]}=await chrome.storage.local.get('watchlist');await chrome.storage.local.set({watchlist:watchlist.filter(x=>x.id!==b.dataset.remove)});renderWatchlist();}));
}
$('clearWatchlist').addEventListener('click',async()=>{if(confirm('Effacer toutes les annonces suivies et leur historique local ?')){await chrome.storage.local.set({watchlist:[]});renderWatchlist();$('watchStatus').textContent='Suivi et historique effacés.';}});
function calc(){const sale=Number($('salePrice').value)||0,buy=Number($('buyPrice').value)||0,cost=Number($('costs').value)||0;const profit=sale-buy-cost;$('profit').textContent=money(profit);$('margin').textContent='Marge : '+(sale?Math.round(profit/sale*100):0)+' % du prix de revente';$('profit').style.color=profit<0?'#b04444':'#087f5b';}
['salePrice','buyPrice','costs'].forEach(id=>$(id).addEventListener('input',calc));
collectVisible();renderWatchlist();calc();
