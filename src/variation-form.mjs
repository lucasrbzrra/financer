export function confirmVariation(saved,draft,{months}){
 const title=String(draft.title??'').replace(/\s+/g,' ').trim();
 if(!title)throw Error('Dê um título à variação antes de confirmar.');
 if(title.length>60)throw Error('O título pode ter até 60 caracteres.');
 const name=title.toLocaleLowerCase('pt-BR');
 if(name==='sem extras'||saved.some(v=>v.id!==draft.id&&v.title.toLocaleLowerCase('pt-BR')===name))throw Error('Já existe uma linha com esse título. Escolha outro nome.');
 if(typeof draft.amount!=='number'||!Number.isFinite(draft.amount)||draft.amount<0||draft.amount>1e7)throw Error('Informe um aporte entre zero e R$ 10 milhões.');
 if(!Number.isInteger(draft.start)||draft.start<1||draft.start>months)throw Error('Escolha um início dentro do prazo do financiamento.');
 if(!['term','payment'].includes(draft.strategy))throw Error('Escolha reduzir prazo ou prestação.');
 if(![1,6,12].includes(draft.frequency??1))throw Error('Escolha a frequência do aporte.');
 const entry={id:draft.id,title,amount:Math.round(draft.amount*100)/100,start:draft.start,frequency:draft.frequency??1,strategy:draft.strategy};
 if(saved.some(v=>v.id===entry.id))return saved.map(v=>v.id===entry.id?entry:v);
 if(saved.length>=6)throw Error('O limite é de seis variações. Remova uma antes de adicionar outra.');
 return [...saved,entry];
}
export function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function csvCell(value){let text=String(value??'');if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}
