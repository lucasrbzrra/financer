import {defaults,normalize,validate} from './finance.mjs';
const MAX_ENCODED=24000;
const message='Link de simulação inválido ou incompatível. Seus parâmetros locais foram preservados.';
function packEvents(events){const runs=[];for(let i=0;i<events.length;){const first=events[i],step=i+1<events.length?events[i+1].month-first.month:1;let count=1;while(i+count<events.length&&events[i+count].value===first.value&&events[i+count].month===first.month+step*count)count++;runs.push([first.month,step,count,first.value]);i+=count;}return runs;}
function unpackEvents(runs){if(!Array.isArray(runs)||runs.length>600)throw Error();const events=[];for(const run of runs){if(!Array.isArray(run)||run.length!==4)throw Error();const [month,step,count,value]=run;if(!Number.isInteger(month)||!Number.isInteger(step)||!Number.isInteger(count)||count<1||events.length+count>600||typeof value!=='number'||!Number.isFinite(value))throw Error();for(let i=0;i<count;i++)events.push({month:month+step*i,value});}return events;}
export function encodeScenario(parameters){
 const clean=Object.fromEntries(Object.keys(defaults).map(k=>[k,parameters[k]??defaults[k]]));
 if(validate(normalize(clean)).length)throw Error('Revise os parâmetros antes de compartilhar.');
 const {events,...packed}=clean;
 const bytes=new TextEncoder().encode(JSON.stringify({v:1,p:packed,e:packEvents(events)}));
 const encoded=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 if(encoded.length>MAX_ENCODED)throw Error('Este cenário tem muitos aportes para um link. Use Exportar cenário para compartilhar o arquivo.');
 return encoded;
}
export function decodeScenario(encoded){
 try{
  if(!encoded||encoded.length>MAX_ENCODED||!/^[A-Za-z0-9_-]+$/.test(encoded))throw Error();
  const binary=atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));
  const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0))));
  if(data?.v!==1||!data.p||typeof data.p!=='object'||Array.isArray(data.p))throw Error();
  const clean=Object.fromEntries(Object.keys(defaults).filter(k=>Object.hasOwn(data.p,k)).map(k=>[k,data.p[k]]));
  if(Object.hasOwn(data,'e'))clean.events=unpackEvents(data.e);
  const parameters=normalize(clean);
  if(validate(parameters).length)throw Error();
  return parameters;
 }catch{throw Error(message)}
}
export function scenarioURL(href,parameters){const url=new URL(href);url.hash='sim='+encodeScenario(parameters);return url.href;}
export function initialScenario(hash,localText){
 let local={...defaults};try{if(localText){const candidate=normalize(JSON.parse(localText));if(!validate(candidate).length)local=candidate;}}catch{}
 if(!hash.startsWith('#sim='))return {parameters:local,shared:false,error:''};
 try{return {parameters:decodeScenario(hash.slice(5)),shared:true,error:''}}catch{return {parameters:local,shared:false,error:message}}
}
