const api=globalThis.browser??globalThis.chrome;
const $=id=>document.getElementById(id);
const STORE_KEY='inventoryItems';
const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const num=id=>Math.max(0,Number($(id).value)||0);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statuses={draft:'À préparer',listed:'En ligne',sold:'Vendu'};
let items=[];
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200);}
async function load(){const data=await api.storage.local.get(STORE_KEY);items=Array.isArray(data[STORE_KEY])?data[STORE_KEY]:[];render();}
async function persist(){await api.storage.local.set({[STORE_KEY]:items});render();}
function calcItem(x){return Number(x.sale||0)-Number(x.buy||0)-Number(x.fees||0);}
function render(){
 const active=items.filter(x=>x.status!=='sold');
 $('stockCount').textContent=active.length;
 $('stockCost').textContent=money(active.reduce((s,x)=>s+Number(x.buy||0),0));
 $('potentialProfit').textContent=money(active.reduce((s,x)=>s+calcItem(x),0));
 $('soldCount').textContent=items.filter(x=>x.status==='sold').length;
 const q=$('search').value.trim().toLocaleLowerCase('fr'), filter=$('statusFilter').value;
 const visible=items.filter(x=>(filter==='all'||x.status===filter)&&[x.title,x.brand,x.size,x.sku,x.notes].some(v=>String(v||'').toLocaleLowerCase('fr').includes(q)));
 $('inventoryRows').innerHTML=visible.map(x=>{const p=calcItem(x);return '<tr><td><strong>'+escapeHtml(x.title)+'</strong><div class="product-meta">'+escapeHtml([x.brand,x.size,x.condition,x.sku?'SKU '+x.sku:''].filter(Boolean).join(' · '))+'</div></td><td><span class="status status-'+escapeHtml(x.status)+'">'+statuses[x.status]+'</span></td><td>'+money(x.buy)+'</td><td>'+money(x.sale)+'</td><td class="'+(p<0?'negative':'positive')+'">'+money(p)+'</td><td><div class="row-actions"><button class="small-btn" data-edit="'+escapeHtml(x.id)+'" title="Modifier">Modifier</button><button class="small-btn" data-delete="'+escapeHtml(x.id)+'" title="Supprimer">×</button></div></td></tr>';}).join('');
 $('emptyState').hidden=visible.length>0;
 document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editItem(b.dataset.edit)));
 document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteItem(b.dataset.delete)));
}
function readForm(){return {id:$('itemId').value||crypto.randomUUID(),title:$('title').value.trim(),brand:$('brand').value.trim(),size:$('size').value.trim(),condition:$('condition').value,status:$('itemStatus').value,buy:num('buy'),sale:num('sale'),fees:num('fees'),sku:$('sku').value.trim(),notes:$('notes').value.trim(),updatedAt:Date.now()};}
function clearForm(){ $('itemForm').reset();$('itemId').value='';$('buy').value='0';$('sale').value='0';$('fees').value='0';$('formTitle').textContent='Nouvel article';$('draftPreview').hidden=true;updateProfit(); }
function editItem(id){const x=items.find(i=>i.id===id);if(!x)return;$('itemId').value=x.id;$('title').value=x.title;$('brand').value=x.brand||'';$('size').value=x.size||'';$('condition').value=x.condition||'Très bon état';$('itemStatus').value=x.status||'draft';$('buy').value=x.buy||0;$('sale').value=x.sale||0;$('fees').value=x.fees||0;$('sku').value=x.sku||'';$('notes').value=x.notes||'';$('formTitle').textContent='Modifier l’article';updateProfit();$('editor').scrollIntoView({behavior:'smooth',block:'start'});}
async function deleteItem(id){if(!confirm('Supprimer cet article de ton inventaire local ?'))return;items=items.filter(x=>x.id!==id);await persist();toast('Article supprimé.');}
function updateProfit(){const profit=num('sale')-num('buy')-num('fees'),sale=num('sale');$('formProfit').textContent=money(profit);$('formProfit').style.color=profit<0?'#b44343':'#087f5b';$('formMargin').textContent='Marge sur prix de vente : '+(sale?(profit/sale*100).toLocaleString('fr-FR',{maximumFractionDigits:1}):0)+' %';}
$('itemForm').addEventListener('submit',async e=>{e.preventDefault();const x=readForm(),index=items.findIndex(i=>i.id===x.id);if(index>=0)items[index]= {...items[index],...x};else items.unshift({...x,createdAt:Date.now()});await persist();clearForm();toast('Article enregistré localement.');});
$('addNew').addEventListener('click',()=>{clearForm();$('editor').scrollIntoView({behavior:'smooth',block:'start'});$('title').focus();});
$('resetForm').addEventListener('click',clearForm);
['buy','sale','fees'].forEach(id=>$(id).addEventListener('input',updateProfit));
$('search').addEventListener('input',render);$('statusFilter').addEventListener('change',render);
$('makeDraft').addEventListener('click',()=>{const title=$('title').value.trim(),brand=$('brand').value.trim(),size=$('size').value.trim(),condition=$('condition').value,price=num('sale');if(!title){toast('Ajoute un nom d’article pour préparer le brouillon.');$('title').focus();return;}const suggested=[brand,title,size?'taille '+size:''].filter(Boolean).join(' ').replace(/\s+/g,' ').slice(0,80);const description=[title+(brand?' — '+brand:''), 'État : '+condition+(size?'\nTaille : '+size:''),$('notes').value.trim()?'Informations complémentaires : '+$('notes').value.trim():'',price?'Prix souhaité : '+money(price):'', 'N’hésite pas à me contacter si tu as une question.'].filter(Boolean).join('\n\n');$('suggestedTitle').value=suggested;$('suggestedDescription').value=description;$('draftPreview').hidden=false;});
$('copyDraft').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('suggestedTitle').value+'\n\n'+$('suggestedDescription').value);toast('Brouillon copié.');}catch{ $('suggestedDescription').select();toast('Sélectionne et copie le texte manuellement.');}});
$('exportData').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({format:'vinted-companion-inventory',version:1,exportedAt:new Date().toISOString(),items},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vinted-companion-backup.json';a.click();URL.revokeObjectURL(url);});
$('importData').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());const incoming=Array.isArray(data)?data:data.items;if(!Array.isArray(incoming)||incoming.some(x=>!x||typeof x.title!=='string'||!['draft','listed','sold'].includes(x.status)))throw Error('invalid');if(!confirm('Importer '+incoming.length+' article(s) ? Les références déjà présentes seront remplacées.'))return;const byId=new Map(items.map(x=>[x.id,x]));for(const x of incoming){const safeItem={...x,id:String(x.id||crypto.randomUUID()),title:x.title.slice(0,160),buy:Math.max(0,Number(x.buy)||0),sale:Math.max(0,Number(x.sale)||0),fees:Math.max(0,Number(x.fees)||0)};byId.set(safeItem.id,safeItem);}items=[...byId.values()];await persist();toast('Import terminé.');}catch{alert('Fichier invalide. Sélectionne un export JSON Vinted Companion valide.');}finally{e.target.value='';}});
load();updateProfit();