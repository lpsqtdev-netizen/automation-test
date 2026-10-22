const api=globalThis.browser??globalThis.chrome;
const $=id=>document.getElementById(id);
const STORE_KEY='inventoryItems';
const money=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(n)||0);
const num=id=>Math.max(0,Number($(id).value)||0);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statuses={draft:'À préparer',listed:'En ligne',sold:'Vendu'};
let items=[];
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200);}
async function load(){const data=await api.storage.local.get(STORE_KEY);items=Array.isArray(data[STORE_KEY])?data[STORE_KEY].map(apiInventory.normalizeItem):[];render();}
async function persist(){await api.storage.local.set({[STORE_KEY]:items});render();}
const apiInventory=globalThis.VintedInventory;
function calcItem(x){return x.status==='sold'?apiInventory.realizedProfit(x):apiInventory.estimatedProfit(x);}
function monthLabel(month){if(month==='undated')return 'Date inconnue';const [year,m]=month.split('-').map(Number);return new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,m-1,1)));}
function renderMonthlyReport(){
 const report=apiInventory.monthlyReport(items);
 $('monthlyRows').innerHTML=report.map(row=>'<tr><td><strong>'+escapeHtml(monthLabel(row.month))+'</strong></td><td>'+row.soldCount+'</td><td>'+money(row.revenue)+'</td><td>'+money(row.acquisitionCost)+'</td><td>'+money(row.fees)+'</td><td class="'+(row.netProfit<0?'negative':'positive')+'">'+money(row.netProfit)+'</td><td>'+(row.estimatedSalesCount?'<span class="estimate-tag">'+row.estimatedSalesCount+' à confirmer</span>':'<span class="confirmed-tag">Saisi</span>')+'</td></tr>').join('');
 $('monthlyEmpty').hidden=report.length>0;
}
function render(){
 const summary=apiInventory.summarize(items);
 $('stockCount').textContent=summary.stockCount;
 $('stockCost').textContent=money(summary.stockCost);
 $('potentialProfit').textContent=money(summary.potentialProfit);
 $('soldCount').textContent=summary.soldCount;
 $('realizedProfit').textContent=money(summary.realizedProfit);
 $('realizedProfit').style.color=summary.realizedProfit<0?'#b44343':'#087f5b';
 renderMonthlyReport();
 const q=$('search').value.trim().toLocaleLowerCase('fr'), filter=$('statusFilter').value;
 const visible=items.filter(x=>(filter==='all'||x.status===filter)&&[x.title,x.brand,x.size,x.sku,x.notes].some(v=>String(v||'').toLocaleLowerCase('fr').includes(q)));
 $('inventoryRows').innerHTML=visible.map(x=>{const p=calcItem(x);return '<tr><td><strong>'+escapeHtml(x.title)+'</strong><div class="product-meta">'+escapeHtml([x.brand,x.size,x.condition,x.sku?'SKU '+x.sku:'',x.purchaseDate?'Achat '+x.purchaseDate:'',x.soldDate?'Vente '+x.soldDate:''].filter(Boolean).join(' · '))+'</div></td><td><span class="status status-'+escapeHtml(x.status)+'">'+statuses[x.status]+'</span></td><td>'+money(x.buy)+'</td><td>'+money(x.status==='sold'&&x.actualSale!=null?x.actualSale:x.sale)+'</td><td class="'+(p<0?'negative':'positive')+'">'+money(p)+(x.status==='sold'?' net':' estimé')+'</td><td><div class="row-actions"><button class="small-btn" data-edit="'+escapeHtml(x.id)+'" title="Modifier">Modifier</button><button class="small-btn" data-delete="'+escapeHtml(x.id)+'" title="Supprimer">×</button></div></td></tr>';}).join('');
 $('emptyState').hidden=visible.length>0;
 document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editItem(b.dataset.edit)));
 document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteItem(b.dataset.delete)));
}
function readForm(){return {id:$('itemId').value||crypto.randomUUID(),title:$('title').value.trim(),brand:$('brand').value.trim(),size:$('size').value.trim(),condition:$('condition').value,status:$('itemStatus').value,buy:num('buy'),sale:num('sale'),fees:num('fees'),actualSale:$('actualSale').value===''?null:num('actualSale'),actualFees:$('actualFees').value===''?null:num('actualFees'),purchaseDate:$('purchaseDate').value,soldDate:$('soldDate').value,sku:$('sku').value.trim(),notes:$('notes').value.trim(),updatedAt:Date.now()};}
function clearForm(){ $('itemForm').reset();$('itemId').value='';$('buy').value='0';$('sale').value='0';$('fees').value='0';$('actualSale').value='';$('actualFees').value='';$('purchaseDate').value='';$('soldDate').value='';$('formTitle').textContent='Nouvel article';$('draftPreview').hidden=true;updateProfit(); }
function editItem(id){const x=items.find(i=>i.id===id);if(!x)return;$('itemId').value=x.id;$('title').value=x.title;$('brand').value=x.brand||'';$('size').value=x.size||'';$('condition').value=x.condition||'Très bon état';$('itemStatus').value=x.status||'draft';$('buy').value=x.buy||0;$('sale').value=x.sale||0;$('fees').value=x.fees||0;$('actualSale').value=x.actualSale??'';$('actualFees').value=x.actualFees??'';$('purchaseDate').value=x.purchaseDate||'';$('soldDate').value=x.soldDate||'';$('sku').value=x.sku||'';$('notes').value=x.notes||'';$('formTitle').textContent='Modifier l’article';updateProfit();$('editor').scrollIntoView({behavior:'smooth',block:'start'});}
async function deleteItem(id){if(!confirm('Supprimer cet article de ton inventaire local ?'))return;items=items.filter(x=>x.id!==id);await persist();toast('Article supprimé.');}
function updateProfit(){const sold=$('itemStatus').value==='sold',sale=sold&&$('actualSale').value!==''?num('actualSale'):num('sale'),fees=sold&&$('actualFees').value!==''?num('actualFees'):num('fees'),profit=sale-num('buy')-fees;$('formProfitLabel').textContent=sold?'Bénéfice réalisé estimé':'Bénéfice estimé';$('formProfit').textContent=money(profit);$('formProfit').style.color=profit<0?'#b44343':'#087f5b';$('formMargin').textContent='Marge sur '+(sold?'vente':'prix cible')+' : '+(sale?(profit/sale*100).toLocaleString('fr-FR',{maximumFractionDigits:1}):0)+' %';}
$('itemForm').addEventListener('submit',async e=>{e.preventDefault();const x=readForm(),index=items.findIndex(i=>i.id===x.id);if(x.status==='sold'&&!x.soldDate)x.soldDate=new Date().toISOString().slice(0,10);if(index>=0)items[index]=apiInventory.normalizeItem({...items[index],...x});else items.unshift(apiInventory.normalizeItem({...x,createdAt:Date.now()}));await persist();clearForm();toast('Article enregistré localement.');});
$('addNew').addEventListener('click',()=>{clearForm();$('editor').scrollIntoView({behavior:'smooth',block:'start'});$('title').focus();});
$('resetForm').addEventListener('click',clearForm);
['buy','sale','fees','actualSale','actualFees'].forEach(id=>$(id).addEventListener('input',updateProfit));$('itemStatus').addEventListener('change',updateProfit);
$('search').addEventListener('input',render);$('statusFilter').addEventListener('change',render);
$('makeDraft').addEventListener('click',()=>{const title=$('title').value.trim(),brand=$('brand').value.trim(),size=$('size').value.trim(),condition=$('condition').value,price=num('sale');if(!title){toast('Ajoute un nom d’article pour préparer le brouillon.');$('title').focus();return;}const suggested=[brand,title,size?'taille '+size:''].filter(Boolean).join(' ').replace(/\s+/g,' ').slice(0,80);const description=[title+(brand?' — '+brand:''), 'État : '+condition+(size?'\nTaille : '+size:''),$('notes').value.trim()?'Informations complémentaires : '+$('notes').value.trim():'',price?'Prix souhaité : '+money(price):'', 'N’hésite pas à me contacter si tu as une question.'].filter(Boolean).join('\n\n');$('suggestedTitle').value=suggested;$('suggestedDescription').value=description;$('draftPreview').hidden=false;});
$('copyDraft').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('suggestedTitle').value+'\n\n'+$('suggestedDescription').value);toast('Brouillon copié.');}catch{ $('suggestedDescription').select();toast('Sélectionne et copie le texte manuellement.');}});
$('exportData').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({format:'vinted-companion-inventory',version:1,exportedAt:new Date().toISOString(),items},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vinted-companion-backup.json';a.click();URL.revokeObjectURL(url);});
$('exportMonthly').addEventListener('click',()=>{const rows=apiInventory.monthlyReport(items),header=['Mois de vente','Nombre de ventes','Chiffre d’affaires EUR','Coût d’achat EUR','Frais EUR','Bénéfice net EUR','Ventes à confirmer'];const csv=[header,...rows.map(r=>[r.month==='undated'?'Date inconnue':r.month,r.soldCount,r.revenue.toFixed(2),r.acquisitionCost.toFixed(2),r.fees.toFixed(2),r.netProfit.toFixed(2),r.estimatedSalesCount])].map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(';')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vinted-companion-rentabilite-mensuelle.csv';a.click();URL.revokeObjectURL(url);toast('Rapport CSV exporté.');});
$('importData').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());const incoming=Array.isArray(data)?data:data.items;if(!Array.isArray(incoming)||incoming.some(x=>!x||typeof x.title!=='string'||!['draft','listed','sold'].includes(x.status)))throw Error('invalid');if(!confirm('Importer '+incoming.length+' article(s) ? Les références déjà présentes seront remplacées.'))return;const byId=new Map(items.map(x=>[x.id,x]));for(const x of incoming){const safeItem=apiInventory.normalizeItem({...x,id:String(x.id||crypto.randomUUID())});if(!safeItem.title)throw Error('invalid-title');byId.set(safeItem.id,safeItem);}items=[...byId.values()];await persist();toast('Import terminé.');}catch{alert('Fichier invalide. Sélectionne un export JSON Vinted Companion valide.');}finally{e.target.value='';}});
load();updateProfit();
