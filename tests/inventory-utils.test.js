const test=require('node:test');
const assert=require('node:assert/strict');
const {estimatedProfit,realizedProfit,normalizeItem,summarize,monthlyReport}=require('../inventory-utils.js');

test('estimated profit subtracts acquisition cost and estimated fees',()=>{
 assert.equal(estimatedProfit({sale:42,buy:12,fees:3.5}),26.5);
 assert.equal(estimatedProfit({sale:10,buy:15,fees:1}),-6);
});
test('realized profit prefers actual sale price and actual fees',()=>{
 assert.equal(realizedProfit({sale:40,actualSale:35,buy:10,fees:2,actualFees:4}),21);
});
test('realized profit falls back to target and estimated fees for legacy sold items',()=>{
 assert.equal(realizedProfit({sale:40,buy:10,fees:2}),28);
});
test('normalization preserves old items while adding safe transaction defaults',()=>{
 const x=normalizeItem({title:'  Veste  ',status:'sold',buy:'10',sale:'30',fees:2});
 assert.equal(x.title,'Veste');
 assert.equal(x.buy,10);
 assert.equal(x.actualSale,null);
 assert.equal(x.actualFees,null);
 assert.equal(x.purchaseDate,'');
 assert.equal(x.soldDate,'');
});
test('summary separates current stock from realized sales',()=>{
 const x=summarize([
  {status:'listed',buy:10,sale:30,fees:2},
  {status:'sold',buy:8,sale:25,fees:2,actualSale:22,actualFees:3}
 ]);
 assert.deepEqual(x,{stockCount:1,stockCost:10,potentialProfit:18,soldCount:1,realizedProfit:11,realizedRevenue:22});
});
test('monthly report groups sales by sale month and uses actual amounts when available',()=>{
 const report=monthlyReport([
  {status:'listed',soldDate:'2026-10-03',buy:5,sale:20,fees:1},
  {status:'sold',soldDate:'2026-10-03',buy:10,sale:30,fees:2,actualSale:28,actualFees:3},
  {status:'sold',soldDate:'2026-09-14',buy:4,sale:15,fees:1,actualSale:14,actualFees:2},
  {status:'sold',buy:3,sale:12,fees:1}
 ]);
 assert.deepEqual(report,[
  {month:'2026-10',soldCount:1,revenue:28,acquisitionCost:10,fees:3,netProfit:15,estimatedSalesCount:0},
  {month:'2026-09',soldCount:1,revenue:14,acquisitionCost:4,fees:2,netProfit:8,estimatedSalesCount:0},
  {month:'undated',soldCount:1,revenue:12,acquisitionCost:3,fees:1,netProfit:8,estimatedSalesCount:1}
 ]);
});
test('monthly report labels a sale as estimated if either actual amount is missing',()=>{
 const [row]=monthlyReport([{status:'sold',soldDate:'2026-10-20',buy:8,sale:20,fees:2,actualSale:19}]);
 assert.equal(row.netProfit,9);
 assert.equal(row.estimatedSalesCount,1);
});
