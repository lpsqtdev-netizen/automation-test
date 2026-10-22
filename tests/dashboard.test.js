const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dashboard=fs.readFileSync(path.join(__dirname,'..','dashboard.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','dashboard.html'),'utf8');
test('dashboard provides local inventory, statuses, profit and import/export',()=>{
 assert.match(html,/id="inventoryRows"/);
 assert.match(html,/id="itemStatus"/);
 assert.match(html,/id="potentialProfit"/);
 assert.match(html,/id="exportData"/);
 assert.match(html,/id="importData"/);
 assert.match(html,/id="actualSale"/);
 assert.match(html,/id="actualFees"/);
 assert.match(html,/id="purchaseDate"/);
 assert.match(html,/id="soldDate"/);
 assert.match(html,/id="realizedProfit"/);
 assert.match(html,/inventory-utils\.js/);
 assert.match(dashboard,/apiInventory\.summarize\(items\)/);
 assert.match(dashboard,/storage\.local/);
 assert.match(dashboard,/function calcItem\(x\)/);
 assert.match(dashboard,/confirm\('Importer '/);
});
test('dashboard never auto-publishes or sends messages',()=>{
 assert.doesNotMatch(dashboard,/tabs\.create\(\{url:.*vinted/i);
 assert.doesNotMatch(dashboard,/sendMessage|fetch\(|XMLHttpRequest/);
});
