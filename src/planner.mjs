import {simulate} from './finance.mjs';
export const frequencies=[{months:1,label:'Todo mês',color:'#26775c'},{months:6,label:'A cada 6 meses',color:'#b28a3d'},{months:12,label:'A cada ano',color:'#6385b8'}];
export function roundedBudget(n){return n>=10?Math.floor((n+1e-8)/10)*10:Math.floor(Math.max(0,n)*100)/100;}
export function budgetAnalysis(p){
 const base=simulate(p,{extras:false});const living=p.expenses+base.first;
 const surplus=p.income-living,free=surplus-p.budgetBuffer;
 const target=living*p.reserveMonths,shortfall=Math.max(0,target-p.reserveBalance);
 const wait=shortfall<=.005?0:free>0?Math.ceil(shortfall/free):Infinity;
 const suggested=roundedBudget(Math.max(0,free)*p.allocationPct/100);
 const start=wait+1,canSuggest=suggested>0&&start<=p.months;
 return {base,living,surplus,free,target,shortfall,wait,suggested,start,canSuggest};
}
export function periodicEvents(p,budget,frequency,start=1){
 if(![1,6,12].includes(frequency)||!Number.isFinite(budget)||budget<0||budget>1e7||!Number.isInteger(start)||start<1)throw Error('Cenário de aportes inválido.');
 const events=[];for(let m=start+frequency-1;m<=p.months;m+=frequency)if(budget>0)events.push({month:m,value:budget*frequency});return events;
}
export function caseParameters(p,budget,frequency,start=p.caseStart,strategy=p.caseStrategy){return {...p,monthly:0,annual:0,events:periodicEvents(p,budget,frequency,start),strategy};}
export function compareCases(p){
 const analysis=budgetAnalysis(p),base=analysis.base;
 return p.caseBudgets.flatMap((budget,index)=>frequencies.map(f=>{
  const parameters=caseParameters(p,budget,f.months);
  const result=simulate(parameters);
  const firstEvent=parameters.events[0]?.month;
  const remaining=result.rows.map(r=>p.income-p.expenses-r.payment-p.budgetBuffer-(r.month>=p.caseStart?budget:0));
  const headroom=remaining.length?Math.min(...remaining):analysis.free;
  const contributes=result.extras>.005;
  return {key:`${budget}-${f.months}-${p.caseStart}-${p.caseStrategy}`,index,budget,frequency:f.months,color:f.color,label:f.label,perEvent:budget*f.months,firstEvent,parameters,result,savings:base.interest-result.interest,monthsSaved:base.months-result.months,headroom,affordable:headroom>=-.005,contributes};
 }));
}
export function suggestedComparison(p,a=budgetAnalysis(p)){
 if(!a.canSuggest)return null;const parameters=caseParameters(p,a.suggested,1,a.start,'term');
 return {parameters,result:simulate(parameters)};
}
export function suggestedBudgets(free,suggested){return [.5,1,1.5].map(m=>roundedBudget(Math.min(Math.max(0,free),suggested*m)));}
export function compareWindows(p,budget,frequency=1){
 const offsets=[...new Set([0,12,60,p.caseStart-1])].sort((a,b)=>a-b);
 return offsets.filter(offset=>offset<p.months).map(offset=>{
  const start=offset+1,parameters=caseParameters(p,budget,frequency,start);
  return {offset,start,label:offset===0?'Desde o começo':offset===12?'Após 1 ano':offset===60?'Após 5 anos':`Após ${offset} ${offset===1?'mês':'meses'}`,result:simulate(parameters)};
 });
}

// Direct, user-built comparisons: one amount, one start and one objective per line.
export function variationSignature(v){return `${v.amount.toFixed(2)}:${v.start}:${v.strategy}:${v.frequency??1}`;}
export function evaluateVariation(p,v){
 if(!v||!Number.isFinite(v.amount)||v.amount<0||v.amount>1e7||!Number.isInteger(v.start)||v.start<1||v.start>600||!['term','payment'].includes(v.strategy)||![1,6,12].includes(v.frequency??1))throw Error('Variação inválida.');
 const frequency=v.frequency??1,monthlySaving=v.amount/frequency,firstEvent=v.start+frequency-1,events=[];
 for(let month=firstEvent;month<=p.months;month+=frequency)if(v.amount>0)events.push({month,value:v.amount});
 const parameters={...p,monthly:0,annual:0,events,strategy:v.strategy},result=simulate(parameters);
 const headroom=Math.min(...result.rows.map(r=>p.income-p.expenses-p.budgetBuffer-r.payment-(r.month>=v.start?monthlySaving:0)));
 return {...v,frequency,monthlySaving,firstEvent,parameters,result,headroom,affordable:headroom>=-.005,signature:variationSignature(v)};
}
export function directAdvice(p,a=budgetAnalysis(p)){
 const capacity=roundedBudget(Math.max(0,a.free));
 const possible=capacity>0&&a.start<=p.months;
 const plan=possible?evaluateVariation(p,{amount:capacity,start:a.start,strategy:'term'}):null;
 const immediate=capacity>0?evaluateVariation(p,{amount:capacity,start:1,strategy:'term'}):null;
 return {capacity,possible,start:a.start,plan,immediate};
}
export function projectionValues(result,horizon){
 let interest=0,total=0;const values=[{month:0,balance:result.principal,interest:0,total:0}];
 for(let month=1;month<=horizon;month++){const row=result.rows[month-1];if(row){interest+=row.interest;total+=row.total;}values.push({month,balance:row?.balance??0,interest,total});}
 return values;
}
