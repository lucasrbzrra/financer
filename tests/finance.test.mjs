import test from 'node:test';import assert from 'node:assert/strict';import {defaults,simulate,validate,dateAt,payment} from '../src/finance.mjs';
const close=(a,b,t=.01)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
for(const system of ['SAC','PRICE']){
 test(`${system}: principal, prazo e juros`,()=>{const s=simulate({...defaults,system});assert.equal(s.months,360);close(s.rows.reduce((n,r)=>n+r.amort,0),260000);close(s.rows.at(-1).balance,0);if(system==='PRICE')close(s.first,s.last);else assert.ok(s.first>s.last);close(s.total,s.principal+s.interest+s.charges);});
 test(`${system}: taxa zero e encargos`,()=>{const s=simulate({...defaults,system,rate:0,months:10});close(s.first,26090);close(s.interest,0);close(s.total,260900);});
 test(`${system}: redução de prazo`,()=>{const p={...defaults,system,monthly:600,annual:3000,events:[{month:6,value:10000}]};const s=simulate(p),base=simulate(p,{extras:false});assert.ok(s.months<base.months);assert.ok(s.interest<base.interest);close(s.rows.reduce((a,r)=>a+r.amort+r.extra,0),s.principal);assert.ok(s.rows.every(r=>r.balance>=0));});
 test(`${system}: redução de prestação`,()=>{const p={...defaults,system,strategy:'payment',events:[{month:1,value:20000}]};const s=simulate(p);assert.equal(s.months,360);assert.ok(s.rows[1].payment<s.rows[0].payment);close(s.rows.at(-1).balance,0);});
 test(`${system}: extra maior que saldo`,()=>{const s=simulate({...defaults,system,monthly:1e9});assert.equal(s.months,1);close(s.rows[0].amort+s.rows[0].extra,260000);});
}
test('Price fórmula conhecida',()=>close(payment(100000,.01,12),8884.8788678));
test('data de fim do mês não transborda',()=>assert.equal(dateAt('2027-01-31',1).getDate(),28));
test('validação bloqueia NaN e valores inválidos',()=>{assert.ok(validate({...defaults,rate:NaN}).length);assert.ok(validate({...defaults,down:330000}).length);assert.ok(validate({...defaults,events:[{month:361,value:1}]}).length);});
test('aportes anuais e pontuais são somados',()=>{const s=simulate({...defaults,monthly:10,annual:500,events:[{month:12,value:50},{month:12,value:40}]});close(s.rows[11].extra,600);});
test('datas impossíveis são rejeitadas',()=>assert.ok(validate({...defaults,start:'2027-02-31'}).length));

test('documentação: primeiro imóvel SFH reduz apenas emolumentos elegíveis',async()=>{const {documentation}=await import('../src/finance.mjs');const p={...defaults,registryOther:300};const d=documentation(p);close(d.itbi,6600);close(d.registry,1800);close(d.registryDiscount,1500);close(d.total,9700);close(d.upfront,79700);});
test('documentação: sem primeiro imóvel ou sem SFH não há desconto registral',async()=>{const {documentation}=await import('../src/finance.mjs');for(const opt of [{firstHome:false},{sfh:false}]){const d=documentation({...defaults,...opt});close(d.registry,3000);close(d.itbi,6600);close(d.registryDiscount,0);}});
test('ITBI: benefício municipal independente do desconto registral',async()=>{const {documentation}=await import('../src/finance.mjs');close(documentation({...defaults,itbiFirstDiscount:25}).itbi,4950);close(documentation({...defaults,itbiFirstDiscount:25,firstHome:false}).itbi,6600);});
test('avaliação independente da venda e bases tributárias configuráveis',async()=>{const {documentation}=await import('../src/finance.mjs');const p={...defaults,appraisal:400000};close(simulate(p).principal,260000);close(documentation(p).itbi,6600);close(documentation(p).ltv,65);close(documentation({...p,itbiBase:'appraisal'}).itbi,8000);close(documentation({...p,itbiBase:'custom',itbiCustomBase:300000}).itbi,6000);});
test('cenários antigos migram sem perder parâmetros ou aportes',async()=>{const {normalize}=await import('../src/finance.mjs');const p=normalize({price:420000,down:90000,monthly:100,events:[{month:5,value:50}]});assert.equal(p.appraisal,420000);assert.equal(p.monthly,100);assert.equal(p.events[0].value,50);assert.equal(validate(p).length,0);});
test('documentação rejeita taxas ou avaliação inválidas',()=>{for(const patch of [{itbiRate:21},{itbiFirstDiscount:101},{registryCost:-1},{appraisal:0},{firstHome:'sim'}])assert.ok(validate({...defaults,...patch}).length);});
