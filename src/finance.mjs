export const defaults = {price:330000,down:70000,months:360,rate:10.5,system:'SAC',start:'2026-11-21',income:9500,limit:1900,insurance:65,fee:25,monthly:0,annual:0,strategy:'term',events:[],appraisal:330000,firstHome:true,sfh:true,itbiRate:2,itbiBase:'sale',itbiCustomBase:330000,itbiFirstDiscount:0,registryCost:3000,registryOther:0,appraisalFee:900,certificates:400,otherDocs:0,expenses:4000,budgetBuffer:500,reserveBalance:0,reserveMonths:6,allocationPct:50,caseBudgets:[500,1000,1500],caseStart:1,caseStrategy:'term',appliedCase:'',simulationAmount:1000,comparisonVariations:[],indexer:'NONE',correctionAnnual:0,correctionRates:[],rateType:'effective',insuranceMode:'fixed',mipRate:0,dfiMonthly:0};
export function normalize(p){if(!p||typeof p!=='object'||Array.isArray(p))throw new Error('Cenário inválido.');return {...defaults,...p,appraisal:p.appraisal??p.price??defaults.appraisal,caseStart:Math.min(p.caseStart??1,p.months??defaults.months),comparisonVariations:Array.isArray(p.comparisonVariations)?p.comparisonVariations.map((v,i)=>({...v,frequency:v.frequency??1,title:typeof v.title==='string'?v.title.replace(/\s+/g,' ').trim():`Variação ${i+1}`})):p.comparisonVariations??[]};}
export function documentation(p){
 const taxBase=p.itbiBase==='appraisal'?p.appraisal:p.itbiBase==='custom'?p.itbiCustomBase:p.price;
 const itbiGross=taxBase*p.itbiRate/100;
 const itbiDiscount=p.firstHome?itbiGross*p.itbiFirstDiscount/100:0;
 const registryDiscount=p.firstHome&&p.sfh?p.registryCost*.5:0;
 const registry=p.registryCost-registryDiscount+p.registryOther;
 const itbi=itbiGross-itbiDiscount;
 const total=itbi+registry+p.appraisalFee+p.certificates+p.otherDocs;
 return {taxBase,itbiGross,itbiDiscount,itbi,registryDiscount,registry,total,upfront:p.down+total,ltv:(p.price-p.down)/p.appraisal*100,valuationGap:p.appraisal-p.price};
}
export function validate(p){
 const errors=[];
 if(!['NONE','TR','IPCA'].includes(p.indexer??'NONE'))errors.push('Selecione o indexador do contrato.');
 if(!['effective','nominal'].includes(p.rateType??'effective'))errors.push('Selecione taxa nominal ou efetiva.');
 for(const [key,max] of [['correctionAnnual',50],['mipRate',5],['dfiMonthly',1e7]])if(p[key]!==undefined&&(typeof p[key]!=='number'||!Number.isFinite(p[key])||p[key]<0||p[key]>max))errors.push('Revise correção projetada e taxas do seguro.');
 if(!['fixed','balance'].includes(p.insuranceMode??'fixed'))errors.push('Selecione o modelo do seguro.');
 if(p.correctionRates!==undefined&&(!Array.isArray(p.correctionRates)||p.correctionRates.length>600||p.correctionRates.some(r=>!r||!Number.isInteger(r.month)||r.month<1||r.month>600||typeof r.rate!=='number'||!Number.isFinite(r.rate)||r.rate<((p.indexer==='TR')?0:-10)||r.rate>10)||new Set(p.correctionRates.map(r=>r.month)).size!==p.correctionRates.length))errors.push('Índices mensais: meses únicos de 1 a 600, taxa mensal de -10% a 10% (TR não negativa).');
 const range=(k,min,max,label,int=false)=>{if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<min||p[k]>max||(int&&!Number.isInteger(p[k])))errors.push(label);};
 range('price',1,1e10,'Informe um valor de imóvel positivo.');range('down',0,p.price-0.01,'A entrada deve ser menor que o valor do imóvel.');range('months',1,600,'O prazo deve ser de 1 a 600 meses inteiros.',true);range('rate',0,50,'Use uma taxa entre 0 e 50% a.a.');range('income',1,1e10,'Informe uma renda mensal positiva.');
 for(const k of ['limit','insurance','fee','monthly','annual'])range(k,0,1e10,'Limite, encargos e aportes devem ser valores não negativos.');
 if(!['SAC','PRICE'].includes(p.system)||!['term','payment'].includes(p.strategy))errors.push('Sistema ou estratégia inválidos.');
 if(typeof p.start!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.start)||(!Number.isFinite(Date.parse(p.start+'T12:00:00Z'))||new Date(p.start+'T12:00:00Z').toISOString().slice(0,10)!==p.start)||+p.start.slice(0,4)<1900||+p.start.slice(0,4)>2200)errors.push('Informe uma data válida entre 1900 e 2200.');
 if(!Array.isArray(p.events)||p.events.length>600||p.events.some(e=>!e||!Number.isInteger(e.month)||e.month<1||e.month>p.months||typeof e.value!=='number'||!Number.isFinite(e.value)||e.value<0||e.value>1e10))errors.push('Revise os aportes pontuais: mês entre 1 e o prazo, valor não negativo.');
 for(const k of ['appraisal','itbiCustomBase'])range(k,.01,1e10,'Valor de avaliação e base manual do ITBI devem ser positivos.');
 for(const k of ['registryCost','registryOther','appraisalFee','certificates','otherDocs'])range(k,0,1e10,'Custos de documentação devem ser não negativos.');
 range('itbiRate',0,20,'A alíquota de ITBI deve estar entre 0 e 20%.');range('itbiFirstDiscount',0,100,'O desconto municipal deve estar entre 0 e 100%.');
 if(typeof p.firstHome!=='boolean'||typeof p.sfh!=='boolean'||!['sale','appraisal','custom'].includes(p.itbiBase))errors.push('Revise as opções de documentação.');
 for(const k of ['expenses','budgetBuffer','reserveBalance'])range(k,0,1e10,'Gastos, margem e reserva devem ser não negativos.');
 range('reserveMonths',0,24,'A meta de reserva deve estar entre 0 e 24 meses inteiros.',true);range('allocationPct',0,100,'A parcela da folga deve estar entre 0 e 100%.');
 range('caseStart',1,p.months,'O início dos cenários deve estar entre 1 e 600 meses inteiros.',true);
 if(!Array.isArray(p.caseBudgets)||p.caseBudgets.length!==3||p.caseBudgets.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e7)||!['term','payment'].includes(p.caseStrategy))errors.push('Revise os valores e a estratégia dos cenários.');
 range('simulationAmount',0,1e7,'O aporte mensal da simulação deve estar entre zero e R$ 10 milhões.');
 if(!Array.isArray(p.comparisonVariations)||p.comparisonVariations.length>6||p.comparisonVariations.some(v=>!v||typeof v.id!=='string'||v.id.length>100||typeof v.title!=='string'||!v.title.trim()||v.title.length>60||typeof v.amount!=='number'||!Number.isFinite(v.amount)||v.amount<0||v.amount>1e7||!Number.isInteger(v.start)||v.start<1||v.start>600||!['term','payment'].includes(v.strategy)||![1,6,12].includes(v.frequency??1)))errors.push('Revise as variações adicionadas à comparação.');
 if(Array.isArray(p.comparisonVariations)&&new Set(p.comparisonVariations.map(v=>v?.id)).size!==p.comparisonVariations.length)errors.push('As variações devem ter identificadores únicos.');
 if(Array.isArray(p.comparisonVariations)){const names=p.comparisonVariations.map(v=>typeof v?.title==='string'?v.title.replace(/\s+/g,' ').trim().toLocaleLowerCase('pt-BR'):'');if(new Set(names).size!==names.length||names.includes('sem extras'))errors.push('Use títulos diferentes para as variações, sem o nome reservado Sem extras.');}
 return [...new Set(errors)];
}
export function dateAt(start,m){const [y,mo,d]=start.split('-').map(Number);const target=new Date(y,mo-1+m,1,12);return new Date(target.getFullYear(),target.getMonth(),Math.min(d,new Date(target.getFullYear(),target.getMonth()+1,0).getDate()),12);}
export function payment(p,i,n){return i===0?p/n:p*i/(-Math.expm1(-n*Math.log1p(i)));}
export function parseCorrectionRates(text){
 if(!text.trim())return [];
 const rows=text.trim().split(/\r?\n/).map(line=>{const match=line.trim().match(/^(\d+)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*%?$/);if(!match)throw Error('Use uma linha por mês: mês;taxa mensal %. Ex.: 1;0,15');return {month:Number(match[1]),rate:Number(match[2].replace(',','.'))};});
 return rows;
}
export function simulate(p,{extras=true,system=p.system}={}){
 const errors=validate(p);if(errors.length)throw new Error(errors.join(' '));
 const principal=p.price-p.down,i=p.rateType==='nominal'?p.rate/1200:Math.expm1(Math.log1p(p.rate/100)/12),indexer=p.indexer??'NONE',indexMonthly=indexer==='NONE'?0:Math.expm1(Math.log1p((p.correctionAnnual??0)/100)/12),overrides=new Map((p.correctionRates??[]).map(r=>[r.month,r.rate/100]));let balance=principal,regular=system==='SAC'?principal/p.months:payment(principal,i,p.months);const rows=[];
 for(let month=1;month<=p.months&&balance>0.000001;month++){
  const opening=balance,correctionRate=indexer==='NONE'?0:(overrides.get(month)??indexMonthly),correction=opening*correctionRate;balance+=correction;regular*=1+correctionRate;const corrected=balance,interest=corrected*i;let amort=system==='SAC'?regular:regular-interest;amort=Math.min(balance,Math.max(0,amort));if(month===p.months)amort=balance;
  balance=Math.max(0,balance-amort);
  const wanted=extras?p.monthly+(month%12===0?p.annual:0)+p.events.filter(e=>e.month===month).reduce((a,e)=>a+e.value,0):0;
  const extra=Math.min(balance,wanted);balance=Math.max(0,balance-extra);const insurance=p.insuranceMode==='balance'?corrected*(p.mipRate??0)/100+(p.dfiMonthly??0):p.insurance,charges=insurance+p.fee;
  rows.push({month,date:dateAt(p.start,month-1).toISOString().slice(0,10),opening,corrected,correction,correctionRate,interest,amort,extra,insurance,charges,payment:amort+interest+charges,total:amort+interest+charges+extra,balance});
  if(extra>0&&p.strategy==='payment'&&month<p.months)regular=system==='SAC'?balance/(p.months-month):payment(balance,i,p.months-month);
 }
 const sum=k=>rows.reduce((a,r)=>a+r[k],0);return {rows,principal,rateMonthly:i,interest:sum('interest'),correction:sum('correction'),cost:sum('interest')+sum('correction'),indexMonthly,peak:Math.max(...rows.map(r=>r.payment)),charges:sum('charges'),extras:sum('extra'),total:sum('total'),months:rows.length,first:rows[0].payment,last:rows.at(-1).payment,end:rows.at(-1).date};
}
