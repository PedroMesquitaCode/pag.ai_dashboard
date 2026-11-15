const KEY='gastos-v1';
const clone=o=>JSON.parse(JSON.stringify(o));
const _d=new Date(),hoje=_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');
const DP=[{id:'p1',n:'Pedro'},{id:'p2',n:'Gladison'}];
const def={cards:[],people:DP,fat:[],skip:[],cats:['Alimentação','Compras','Assinaturas','Transporte','Lazer','Saúde','Educação','Outros'].map(n=>({n,b:0})),mes:hoje.slice(0,7)};
const norm=o=>{
 o.cards=o.cards||[];o.people=o.people||clone(DP);o.fat=o.fat||[];o.skip=o.skip||[];o.cats=o.cats||clone(def.cats);
 o.fat.forEach(x=>{if(x.pt==null){const m=/\s*\((\d+)\/(\d+)\)\s*$/.exec(x.s||'');if(m){x.pa=+m[1];x.pt=+m[2];x.s=x.s.slice(0,m.index)}}});
 const gm={};
 o.fat.forEach(x=>{if(x.pt>0&&!x.sid){const k=[x.c,x.p,x.s,x.pt].join('|');x.sid=gm[k]=gm[k]||Math.random().toString(36).slice(2,9)}});
 fixSeries(o);return o};
let S;
try{S=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){S=null}
if(!S||typeof S!=='object')S=clone(def);
S=norm(S);
const $=id=>document.getElementById(id);
let _t;const msg=t=>{const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(_t);_t=setTimeout(()=>e.classList.remove('on'),3200)};
window.alert=msg;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));$('warn').hidden=true}catch(e){$('warn').hidden=false}};
const f=n=>(+n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const mon=()=>S.mes||hoje.slice(0,7);
const addM=(ym,i)=>{const [y,m]=ym.split('-').map(Number),d=new Date(y,m-1+i,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const sv=a=>a.reduce((s,x)=>s+(+x.v||0),0);
const rd=n=>Math.round(n*100)/100;
const fm=()=>S.fat.filter(x=>x.m===mon());
const FL={c:'',g:'',s:''};
const fmF=()=>fm().filter(x=>(!FL.c||x.c===FL.c)&&(!FL.g||x.g===FL.g)&&(!FL.s||(FL.s==='o')===!!x.ok));
const cOpts=sel=>S.cards.map(c=>`<option value="${c.id}" ${c.id===sel?'selected':''}>${esc(c.n)}</option>`).join('');
const pOpts=sel=>S.people.map(p=>`<option value="${p.id}" ${p.id===sel?'selected':''}>${esc(p.n)}</option>`).join('');
const gOpts=sel=>'<option value="">Categoria…</option>'+S.cats.map(c=>`<option ${c.n===sel?'selected':''}>${esc(c.n)}</option>`).join('')+(sel&&!S.cats.some(c=>c.n===sel)?`<option selected>${esc(sel)}</option>`:'');
const dueInfo=c=>{const [y,m]=mon().split('-').map(Number),t0=new Date();t0.setHours(0,0,0,0);
 const day=Math.min(Math.max(+c.d||1,1),new Date(y,m,0).getDate());
 return{day,m,df:Math.round((new Date(y,m-1,day)-t0)/864e5)}};

/* ---- parcelas ---- */
function fixSeries(o){
 const mi=s=>{const [y,m]=s.split('-').map(Number);return y*12+m},grp={},drop=new Set();
 o.fat.forEach(x=>{if(x.sid&&x.pt>0)(grp[x.sid]=grp[x.sid]||[]).push(x)});
 Object.values(grp).forEach(g=>{
  g.sort((a,b)=>a.m.localeCompare(b.m));
  const b=g[0];
  g.forEach(x=>{x.pt=b.pt;x.pa=(b.pa||1)+mi(x.m)-mi(b.m);if(x.pa>x.pt||x.pa<1)drop.add(x)});
 });
 if(drop.size)o.fat=o.fat.filter(x=>!drop.has(x));
}
function anchorSeries(x){
 if(!x.sid)return;
 const mi=s=>{const [y,m]=s.split('-').map(Number);return y*12+m};
 S.fat=S.fat.filter(z=>{
  if(z===x||z.sid!==x.sid)return true;
  z.pt=x.pt;z.pa=x.pa+mi(z.m)-mi(x.m);
  return z.pa>=1&&z.pa<=z.pt;
 });
}
function ensureP(){
 const M=mon(),mi=s=>{const [y,m]=s.split('-').map(Number);return y*12+m},grp={};
 S.fat.forEach(x=>{if(x.sid&&x.pt>0)(grp[x.sid]=grp[x.sid]||[]).push(x)});
 let ch=0;
 Object.keys(grp).forEach(k=>{
  const g=grp[k];
  if(g.some(x=>x.m===M)||S.skip.includes(k+'|'+M))return;
  const b=g.filter(x=>x.m<M).sort((a,c)=>c.m.localeCompare(a.m))[0];
  if(!b)return;
  const pa=(b.pa||0)+mi(M)-mi(b.m);
  if(pa>b.pt)return;
  S.fat.push({...b,id:uid(),m:M,pa,ok:false});ch++;
 });
 if(ch)save();
}

/* ---- telas ---- */
function kpis(){
 const a=fm(),t=sv(a),pg=sv(a.filter(x=>x.ok)),ab=rd(t-pg);let nx=null;
 S.cards.forEach(c=>{const it=a.filter(x=>x.c===c.id);if(!it.length||it.every(x=>x.ok))return;const d=dueInfo(c);if(!nx||d.df<nx.df)nx={...d,n:c.n}});
 $('kpis').innerHTML=`<div class="k"><small>Total das faturas</small><b>${f(t)}</b></div>
 <div class="k"><small>Pago</small><b class="pos">${f(pg)}</b></div>
 <div class="k"><small>Faturas em aberto</small><b class="${ab>0?'neg':'pos'}">${f(ab)}</b></div>
 <div class="k"><small>Próximo vencimento</small><b>${nx?String(nx.day).padStart(2,'0')+'/'+String(nx.m).padStart(2,'0'):'—'}</b>${nx?`<small>${esc(nx.n)}</small>`:''}</div>`;
}
function cards(){
 const it=fm();
 $('cl').innerHTML=S.cards.length?S.cards.map(c=>{
  const a=it.filter(x=>x.c===c.id),tot=sv(a),pago=a.length>0&&a.every(x=>x.ok),d=dueInfo(c);
  let st,cl='';
  if(!a.length)st='sem lançamentos';
  else if(pago){st='fatura paga ✓';cl='pos'}
  else if(d.df<0){st=`venceu há ${-d.df} dia${d.df===-1?'':'s'}`;cl='neg'}
  else if(d.df===0){st='vence hoje';cl='neg'}
  else{st=`vence em ${d.df} dia${d.df===1?'':'s'}`;if(d.df<=5)cl='amb'}
  return `<div class="ci2" data-id="${c.id}"><input data-f="n" value="${esc(c.n)}" placeholder="Nome do cartão"><label>dia <input type="number" min="1" max="31" data-f="d" value="${c.d||''}"></label><div><b>${f(tot)}</b><br><small class="${cl}">${String(d.day).padStart(2,'0')}/${String(d.m).padStart(2,'0')} · ${st}</small></div><button class="s" data-pay="1" title="Marcar ou desmarcar toda a fatura como paga">${pago?'Desfazer':'Pagar'}</button><button class="x" data-dc="1" title="Remover cartão">×</button></div>`}).join('')
 :'<div class="empty">Nenhum cartão ainda. Clique em “+ Cartão”.</div>';
}
function people(){
 const it=fmF();
 $('pl').innerHTML=S.people.length?S.people.map(p=>{
  const a=it.filter(x=>x.p===p.id);
  const rows=a.map(x=>`<tr data-id="${x.id}"><td><select data-k="c">${cOpts(x.c)}</select></td><td><input data-k="s" value="${esc(x.s)}"></td><td><input data-k="par" value="${x.pt?x.pa+'/'+x.pt:''}" placeholder="—" style="width:68px;text-align:center" title="Parcela atual/total, ex.: 3/10"></td><td><select data-k="g">${gOpts(x.g)}</select></td><td><input type="number" step="0.01" min="0" data-k="v" value="${x.v}"></td><td><select data-k="p">${pOpts(x.p)}</select></td><td><input type="checkbox" data-k="ok" style="width:auto" title="Pago" ${x.ok?'checked':''}></td><td><input type="number" min="1" max="60" data-rep="1" placeholder="meses" style="width:70px" title="Repetir esta conta nos próximos N meses (Enter)"></td><td><button class="x" data-di="1" title="Excluir">×</button></td></tr>`).join('');
  return `<div class="pb" data-p="${p.id}"><div class="ph"><input data-f="pn" value="${esc(p.n)}"><span data-pt="${p.id}"></span><button class="x" data-dp="1" title="Remover pessoa">×</button></div>`+(a.length?`<div class="sc"><table style="min-width:800px"><tr><th>Cartão</th><th>Descrição</th><th>Parcela</th><th>Categoria</th><th>Valor</th><th>Pessoa</th><th>Pago</th><th>Repetir</th><th></th></tr>${rows}</table></div>`:'<div class="empty">Sem contas neste mês.</div>')+'</div>'}).join('')
 :'<div class="empty">Nenhuma pessoa. Clique em “+ Pessoa”.</div>';
}
function sums(){
 const it=fmF();let T=0,P=0;
 S.people.forEach(p=>{
  const a=it.filter(x=>x.p===p.id),t=sv(a),pg=sv(a.filter(x=>x.ok));T+=t;P+=pg;
  const e=document.querySelector(`[data-pt="${p.id}"]`),fl=rd(t-pg);
  if(e)e.innerHTML=`Total <b>${f(t)}</b> · pago ${f(pg)} · falta <b class="${fl>0?'neg':'pos'}">${f(fl)}</b>`;
 });
 const fl=rd(T-P);
 $('ft').innerHTML=`Total${(FL.c||FL.g||FL.s)?' (filtrado)':''}: <b>${f(T)}</b> · pago ${f(P)} · falta <b class="${fl>0?'neg':'pos'}">${f(fl)}</b>`;
 cards();catsView();kpis();
}
function catsView(){
 const cf=$('cf'),ov=cf.value||'all';
 cf.innerHTML='<option value="all">Todas as pessoas</option>'+S.people.map(p=>`<option value="${p.id}">${esc(p.n)}</option>`).join('');
 cf.value=[...cf.options].some(o=>o.value===ov)?ov:'all';
 const a=fm().filter(x=>cf.value==='all'||x.p===cf.value).map(x=>({c:x.g||'Sem categoria',v:x.v}));
 const names=S.cats.map(c=>({n:c.n,b:+c.b||0}));
 a.forEach(t=>{if(!names.some(x=>x.n===t.c))names.push({n:t.c,b:0})});
 const rows=names.map(c=>({n:c.n,b:c.b,v:sv(a.filter(t=>t.c===c.n))})).filter(x=>x.v>0||x.b>0);
 if(!rows.length){$('cats').innerHTML='<div class="empty">Sem contas neste mês.</div>';return}
 const mx=Math.max(...rows.map(x=>Math.max(x.v,x.b)),1);
 $('cats').innerHTML=rows.sort((x,y)=>y.v-x.v).map(x=>{
  const over=x.b>0&&x.v>x.b,w=x.b>0?Math.min(100,x.v/x.b*100):x.v/mx*100;
  return `<div class="cr"><div><span>${esc(x.n)}</span><span class="${over?'neg':''}">${f(x.v)}${x.b?` / ${f(x.b)}`:''}</span></div><div class="bar ${over?'o':''}"><i style="width:${w}%"></i></div></div>`}).join('');
}
function cedit(){
 $('cedit').innerHTML=S.cats.map((c,i)=>`<div class="ci" data-i="${i}"><input data-f="n" value="${esc(c.n)}"><input type="number" min="0" step="10" data-f="b" value="${c.b||0}" placeholder="Meta"><button class="x" data-dc="1" title="Remover">×</button></div>`).join('')
 +'<p class="hint" style="margin:4px 0 10px">Meta 0 = sem limite. Renomear uma categoria atualiza as contas.</p>';
}
function selects(){
 const ov=[$('fc').value,$('fp').value,$('fg').value];
 $('fc').innerHTML=cOpts();$('fp').innerHTML=pOpts();$('fg').innerHTML=gOpts();
 if(ov[0])$('fc').value=ov[0];if(ov[1])$('fp').value=ov[1];if(ov[2])$('fg').value=ov[2];
 $('flc').innerHTML='<option value="">Todos os cartões</option>'+cOpts(FL.c);
 $('flg').innerHTML='<option value="">Todas as categorias</option>'+S.cats.map(c=>`<option ${c.n===FL.g?'selected':''}>${esc(c.n)}</option>`).join('');
 const orp=$('rp').value;$('rp').innerHTML='<option value="all">Todas as pessoas</option>'+pOpts();if(orp)$('rp').value=orp;
 catsView();
}
function cartoes(){selects();people();sums()}
function all(){ensureP();kpis();cartoes();cedit()}

/* ---- ações ---- */
$('mes').value=mon();
$('mes').onchange=e=>{S.mes=e.target.value||hoje.slice(0,7);save();all()};
const shift=i=>{S.mes=addM(mon(),i);$('mes').value=S.mes;save();all()};
$('mp').onclick=()=>shift(-1);$('mn').onclick=()=>shift(1);
$('addcard').onclick=()=>{S.cards.push({id:uid(),n:'Novo cartão',d:10});save();cartoes()};
const newP=()=>{
 const id=uid();S.people.push({id,n:'Pessoa '+(S.people.length+1)});save();cartoes();$('fp').value=id;
 const i=document.querySelector(`[data-p="${id}"] input[data-f="pn"]`);
 if(i){i.scrollIntoView({block:'center'});i.focus();i.select()}
};
$('addp').onclick=newP;$('fpn').onclick=newP;
$('flc').onchange=e=>{FL.c=e.target.value;people();sums()};
$('flg').onchange=e=>{FL.g=e.target.value;people();sums()};
$('fls').onchange=e=>{FL.s=e.target.value;people();sums()};
$('cf').onchange=()=>catsView();
$('fadd').onclick=()=>{
 if(!S.cards.length){alert('Cadastre um cartão primeiro.');return}
 if(!S.people.length){alert('Cadastre uma pessoa primeiro.');return}
 const v=parseFloat($('fv').value);if(!(v>0)){$('fv').focus();return}
 const n=Math.min(60,Math.max(1,parseInt($('fn').value)||1)),a0=Math.min(n,Math.max(1,parseInt($('fa').value)||1)),s=$('fs').value.trim(),SID=uid();
 for(let i=a0;i<=n;i++)S.fat.push({id:uid(),m:addM(mon(),i-a0),c:$('fc').value,p:$('fp').value,s,pa:n>1?i:0,pt:n>1?n:0,sid:n>1?SID:'',v,g:$('fg').value,ok:false});
 $('fs').value='';$('fv').value='';$('fn').value='';$('fa').value='';save();people();sums();
};
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('.fadd'))$('fadd').click()});
$('cl').addEventListener('change',e=>{
 const r=e.target.closest('[data-id]');if(!r)return;
 const c=S.cards.find(x=>x.id===r.dataset.id),k=e.target.dataset.f;if(!c||!k)return;
 c[k]=k==='d'?Math.min(31,Math.max(1,parseInt(e.target.value)||1)):(e.target.value.trim()||c.n);
 save();selects();people();sums();
});
$('cl').addEventListener('click',e=>{
 const id=e.target.closest('[data-id]')?.dataset.id;
 if(e.target.dataset.pay){
  const a=fm().filter(x=>x.c===id);
  if(!a.length){msg('Esse cartão não tem contas neste mês.');return}
  const v=!a.every(x=>x.ok);a.forEach(x=>x.ok=v);save();people();sums();return;
 }
 if(!e.target.dataset.dc)return;
 if(S.fat.some(x=>x.c===id)){alert('Este cartão tem contas lançadas. Exclua-as antes.');return}
 S.cards=S.cards.filter(c=>c.id!==id);save();cartoes();
});
$('pl').addEventListener('change',e=>{
 if(e.target.dataset.rep){
  const tr=e.target.closest('tr'),x=S.fat.find(z=>z.id===tr.dataset.id),n=Math.min(60,parseInt(e.target.value)||0);
  if(!x||!n)return;
  let made=0;
  for(let i=1;i<=n;i++){
   let pa=0;if(x.pt){pa=(x.pa||0)+i;if(pa>x.pt)break}
   const m=addM(x.m,i);
   if(S.fat.some(z=>z.m===m&&z.c===x.c&&z.p===x.p&&(z.s||'')===(x.s||'')&&(z.pa||0)===pa&&+z.v===+x.v))continue;
   S.fat.push({id:uid(),m,c:x.c,p:x.p,s:x.s||'',pa,pt:x.pt||0,sid:x.sid||'',v:x.v,g:x.g,ok:false});made++;
  }
  save();people();sums();
  msg(made?`Repetida em mais ${made} mês(es).`:'Nada a repetir: já existe nesses meses.');return;
 }
 if(e.target.dataset.f==='pn'){
  const p=S.people.find(x=>x.id===e.target.closest('[data-p]').dataset.p);
  p.n=e.target.value.trim()||p.n;save();selects();return;
 }
 const tr=e.target.closest('tr[data-id]'),k=e.target.dataset.k;if(!tr||!k)return;
 const x=S.fat.find(z=>z.id===tr.dataset.id);if(!x)return;
 if(k==='par'){
  const m=/^\s*(\d+)\s*(?:\/|de)\s*(\d+)\s*$/.exec(e.target.value);
  if(m&&+m[2]>0&&+m[1]>=1&&+m[1]<=+m[2]){x.pa=+m[1];x.pt=+m[2];if(!x.sid)x.sid=uid();anchorSeries(x)}
  else{x.pa=0;x.pt=0;x.sid='';if(e.target.value.trim())msg('Use o formato 3/10.')}
 }else x[k]=k==='v'?(parseFloat(e.target.value)||0):k==='ok'?e.target.checked:e.target.value;
 save();if(k==='p'||k==='par')people();sums();
});
$('pl').addEventListener('click',e=>{
 if(e.target.dataset.di){
  const id=e.target.closest('tr').dataset.id,it0=S.fat.find(x=>x.id===id);
  if(it0&&it0.sid)S.skip.push(it0.sid+'|'+it0.m);
  S.fat=S.fat.filter(x=>x.id!==id);save();people();sums();
 }else if(e.target.dataset.dp){
  const id=e.target.closest('[data-p]').dataset.p;
  if(S.fat.some(x=>x.p===id)){alert('Esta pessoa tem contas lançadas. Exclua-as antes.');return}
  S.people=S.people.filter(p=>p.id!==id);save();cartoes();
 }
});
$('cedit').addEventListener('change',e=>{
 const row=e.target.closest('.ci');if(!row)return;
 const c=S.cats[row.dataset.i],fl=e.target.dataset.f;
 if(fl==='n'){const nn=e.target.value.trim()||c.n;S.fat.forEach(x=>{if(x.g===c.n)x.g=nn});c.n=nn}
 else c.b=parseFloat(e.target.value)||0;
 save();cartoes();cedit();
});
$('cedit').addEventListener('click',e=>{
 if(!e.target.dataset.dc||S.cats.length<2)return;
 S.cats.splice(+e.target.closest('.ci').dataset.i,1);save();cartoes();cedit();
});
$('addc').onclick=()=>{S.cats.push({n:'Nova categoria '+(S.cats.length+1),b:0});save();cartoes();cedit()};
$('gen').onclick=async()=>{
 $('bk').value=JSON.stringify(S);$('bk').select();
 try{await navigator.clipboard.writeText($('bk').value)}catch(e){}
};
$('res').onclick=()=>{
 try{const o=JSON.parse($('bk').value);if(!o||typeof o!=='object')throw 0;
  S=norm(o);save();$('mes').value=mon();all();$('bk').value='';msg('Backup restaurado.');
 }catch(e){alert('Backup inválido.')}
};
$('clr').onclick=()=>{
 const b=$('clr');
 if(!b.dataset.arm){b.dataset.arm=1;b.textContent='Clique de novo para confirmar';setTimeout(()=>{delete b.dataset.arm;b.textContent='Apagar tudo'},4000);return}
 delete b.dataset.arm;b.textContent='Apagar tudo';
 S=clone(def);save();$('mes').value=mon();all();msg('Dados apagados.');
};
$('tema').onclick=()=>{
 const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
 r.dataset.theme=dark?'light':'dark';
};
addEventListener('storage',e=>{
 if(e.key!==KEY)return;
 try{S=norm(JSON.parse(e.newValue));$('mes').value=mon();all()}catch(x){}
});
/* ---- relatório ---- */
const cn=id=>(S.cards.find(c=>c.id===id)||{n:'?'}).n;
const money=n=>f(n).replace(/\u00a0/g,' ');
const parc=x=>x.pt?x.pa+'/'+x.pt:'-';
function relData(){
 const sel=$('rp').value,it=fm(),[y,m]=mon().split('-').map(Number);
 const ppl=S.people.filter(p=>!sel||sel==='all'||p.id===sel);
 const grp=ppl.map(p=>{
  const a=it.filter(x=>x.p===p.id).sort((x,z)=>cn(x.c).localeCompare(cn(z.c))||(x.s||'').localeCompare(z.s||''));
  return{n:p.n,a,t:sv(a),pg:sv(a.filter(x=>x.ok))};
 }).filter(g=>g.a.length);
 const its=grp.flatMap(g=>g.a);
 const crd=S.cards.map(c=>{const a=its.filter(x=>x.c===c.id),d=dueInfo(c);return{n:c.n,ven:String(d.day).padStart(2,'0')+'/'+String(d.m).padStart(2,'0'),t:sv(a),pg:sv(a.filter(x=>x.ok)),k:a.length}}).filter(c=>c.k);
 const label=new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 return{grp,crd,label,who:ppl.length===1?ppl[0].n:'Todas as pessoas',T:sv(its),P:sv(its.filter(x=>x.ok))};
}
function relHtml(){
 const d=relData(),hd=new Date().toLocaleDateString('pt-BR');
 if(!d.grp.length)return `<h1>Relatório de faturas</h1><p class="m">Nenhuma conta em ${esc(d.label)}.</p>`;
 return `<h1>Relatório de faturas - ${esc(d.label)}</h1><p class="m">${esc(d.who)} · gerado em ${hd}</p><h2>Resumo</h2><table><tr><th>Cartão</th><th>Vencimento</th><th class="r">Total</th><th class="r">Pago</th><th class="r">Falta</th></tr>`
 +d.crd.map(c=>`<tr><td>${esc(c.n)}</td><td>${c.ven}</td><td class="r">${money(c.t)}</td><td class="r">${money(c.pg)}</td><td class="r">${money(rd(c.t-c.pg))}</td></tr>`).join('')
 +`<tr class="t"><td colspan="2">Total geral</td><td class="r">${money(d.T)}</td><td class="r">${money(d.P)}</td><td class="r">${money(rd(d.T-d.P))}</td></tr></table>`
 +d.grp.map(g=>`<h2>${esc(g.n)} - total ${money(g.t)} · falta ${money(rd(g.t-g.pg))}</h2><table><tr><th>Cartão</th><th>Descrição</th><th>Parcela</th><th>Categoria</th><th class="r">Valor</th><th>Situação</th></tr>`
  +g.a.map(x=>`<tr><td>${esc(cn(x.c))}</td><td>${esc(x.s)}</td><td>${parc(x)}</td><td>${esc(x.g||'-')}</td><td class="r">${money(x.v)}</td><td>${x.ok?'Pago':'Pendente'}</td></tr>`).join('')
  +`<tr class="t"><td colspan="4">Subtotal</td><td class="r">${money(g.t)}</td><td></td></tr></table>`).join('');
}
$('prnb').onclick=()=>{
 $('rel').innerHTML=relHtml();
 try{window.print()}catch(e){msg('A impressão foi bloqueada aqui. Use “Salvar em PDF”.')}
};
$('pdfb').onclick=async()=>{
 const d=relData();
 if(!d.grp.length){msg('Não há contas neste mês para o relatório.');return}
 const J=window.jspdf&&window.jspdf.jsPDF;
 if(!J){msg('A biblioteca de PDF não carregou (sem internet?). Abrindo a impressão: escolha “Salvar como PDF”.');$('prnb').click();return}
 let dl=null;try{dl=window.claude&&await claude.use('downloads')}catch(e){}
 const doc=new J({unit:'mm',format:'a4'}),L=14,R=196;let y=18;
 const np=h=>{if(y+h>282){doc.addPage();y=18}};
 const cut=(t,w)=>{t=String(t??'');while(t.length>1&&doc.getTextWidth(t)>w)t=t.slice(0,-1);return t};
 const row=(cells,xs,ws,al,bold)=>{np(7);doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(9);
  cells.forEach((c,i)=>{const t=cut(c,ws[i]);if(al[i]==='r')doc.text(t,xs[i]+ws[i],y,{align:'right'});else doc.text(t,xs[i],y)});y+=6};
 const rule=()=>{doc.setDrawColor(150);doc.line(L,y-4.6,R,y-4.6)};
 const H=(s,sz)=>{np(12);doc.setFont('helvetica','bold');doc.setFontSize(sz);doc.setTextColor(0);doc.text(s,L,y);y+=sz*0.5+3};
 const hd=new Date().toLocaleDateString('pt-BR');
 H('Relatório de faturas - '+d.label,16);
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(90);doc.text(d.who+' · gerado em '+hd,L,y);doc.setTextColor(0);y+=9;
 H('Resumo',12);
 const x1=[14,72,100,134,166],w1=[56,26,28,28,30],a1=['l','l','r','r','r'];
 row(['Cartão','Vencimento','Total','Pago','Falta'],x1,w1,a1,true);rule();
 d.crd.forEach(c=>row([c.n,c.ven,money(c.t),money(c.pg),money(rd(c.t-c.pg))],x1,w1,a1));
 rule();row(['Total geral','',money(d.T),money(d.P),money(rd(d.T-d.P))],x1,w1,a1,true);y+=4;
 const x2=[14,42,98,116,148,178],w2=[26,54,16,30,26,18],a2=['l','l','l','l','r','l'];
 d.grp.forEach(g=>{
  H(g.n+' - total '+money(g.t)+' · falta '+money(rd(g.t-g.pg)),11);
  row(['Cartão','Descrição','Parcela','Categoria','Valor','Situação'],x2,w2,a2,true);rule();
  g.a.forEach(x=>row([cn(x.c),x.s||'',parc(x),x.g||'-',money(x.v),x.ok?'Pago':'Pendente'],x2,w2,a2));
  rule();row(['Subtotal','','','',money(g.t),''],x2,w2,a2,true);y+=4;
 });
 const n=doc.getNumberOfPages();
 for(let i=1;i<=n;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(120);doc.text(`Página ${i}/${n}`,R,290,{align:'right'})}
 const blob=doc.output('blob'),fn=`faturas-${mon()}.pdf`;
 if(!dl){
  try{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);msg('Baixando o PDF… Se nada acontecer, use Imprimir e escolha “Salvar como PDF”.')}
  catch(e){$('prnb').click()}
  return;
 }
 try{await dl.save({filename:fn,data:blob});msg('PDF salvo.')}
 catch(e){msg(e&&e.code==='declined'?'Download cancelado.':'Não consegui salvar o PDF. Use Imprimir e escolha “Salvar como PDF”.')}
};
save();all();
