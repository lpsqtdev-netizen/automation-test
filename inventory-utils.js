(function(root){
  const moneyNumber=value=>Number.isFinite(Number(value))?Number(value):0;
  function estimatedProfit(item){return moneyNumber(item.sale)-moneyNumber(item.buy)-moneyNumber(item.fees);}
  function realizedProfit(item){
    const sale=item.actualSale===undefined||item.actualSale===null||item.actualSale===''?item.sale:item.actualSale;
    const fees=item.actualFees===undefined||item.actualFees===null||item.actualFees===''?item.fees:item.actualFees;
    return moneyNumber(sale)-moneyNumber(item.buy)-moneyNumber(fees);
  }
  function normalizeItem(item){
    const status=['draft','listed','sold'].includes(item?.status)?item.status:'draft';
    return {...item,
      id:String(item?.id||''),
      title:String(item?.title||'').trim().slice(0,160),
      status,
      buy:Math.max(0,moneyNumber(item?.buy)),
      sale:Math.max(0,moneyNumber(item?.sale)),
      fees:Math.max(0,moneyNumber(item?.fees)),
      actualSale:item?.actualSale===''||item?.actualSale==null?null:Math.max(0,moneyNumber(item.actualSale)),
      actualFees:item?.actualFees===''||item?.actualFees==null?null:Math.max(0,moneyNumber(item.actualFees)),
      purchaseDate:typeof item?.purchaseDate==='string'?item.purchaseDate:'',
      soldDate:typeof item?.soldDate==='string'?item.soldDate:''
    };
  }
  function summarize(items){
    const active=items.filter(item=>item.status!=='sold');
    const sold=items.filter(item=>item.status==='sold');
    return {
      stockCount:active.length,
      stockCost:active.reduce((sum,item)=>sum+moneyNumber(item.buy),0),
      potentialProfit:active.reduce((sum,item)=>sum+estimatedProfit(item),0),
      soldCount:sold.length,
      realizedProfit:sold.reduce((sum,item)=>sum+realizedProfit(item),0),
      realizedRevenue:sold.reduce((sum,item)=>sum+(item.actualSale==null?moneyNumber(item.sale):moneyNumber(item.actualSale)),0)
    };
  }
  function monthlyReport(items){
    const months=new Map();
    for(const item of items){
      if(item.status!=='sold')continue;
      const key=/^\d{4}-\d{2}$/.test(String(item.soldDate||'').slice(0,7))?String(item.soldDate).slice(0,7):'undated';
      if(!months.has(key))months.set(key,{month:key,soldCount:0,revenue:0,acquisitionCost:0,fees:0,netProfit:0,estimatedSalesCount:0});
      const row=months.get(key);
      const hasActualSale=item.actualSale!==undefined&&item.actualSale!==null&&item.actualSale!=='';
      const hasActualFees=item.actualFees!==undefined&&item.actualFees!==null&&item.actualFees!=='';
      const revenue=moneyNumber(hasActualSale?item.actualSale:item.sale);
      const fees=moneyNumber(hasActualFees?item.actualFees:item.fees);
      row.soldCount++;
      row.revenue+=revenue;
      row.acquisitionCost+=moneyNumber(item.buy);
      row.fees+=fees;
      row.netProfit+=revenue-moneyNumber(item.buy)-fees;
      if(!hasActualSale||!hasActualFees)row.estimatedSalesCount++;
    }
    return [...months.values()].sort((a,b)=>{
      if(a.month==='undated')return 1;
      if(b.month==='undated')return -1;
      return b.month.localeCompare(a.month);
    });
  }
  const api={estimatedProfit,realizedProfit,normalizeItem,summarize,monthlyReport};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.VintedInventory=api;
})(typeof globalThis!=='undefined'?globalThis:this);
