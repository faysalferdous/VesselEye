import { readFileSync } from 'node:fs';
async function regression(app,v4,html){
const results=[];function check(n,v){if(!v)throw Error("FAIL "+n);results.push(n)}
const ids=new Map();class Node {constructor(tag){this.tag=tag;this.children=[];this.childNodes=this.children;this.dataset={};this.style={};this.attributes={};this.value='';this.textContent='';this.disabled=false;this.hidden=false;const set=new Set();this.classList={add:x=>set.add(x),remove:x=>set.delete(x),toggle:(x,on)=>{const b=on===undefined?!set.has(x):on;b?set.add(x):set.delete(x);return b},contains:x=>set.has(x)}}
set id(x){this._id=x;ids.set(x,this)}get id(){return this._id}set innerHTML(s){for(const m of s.matchAll(/<(select|button|div|p|input)\b[^>]*\bid="([^"]+)"/g)){let n=new Node(m[1]);n.id=m[2];this.append(n)}this.content={textContent:s.replace(/<[^>]*>/g,'')}}append(...xs){this.children.push(...xs);if(this.tag==='select'&&!this.value&&xs[0])this.value=xs[0].value}prepend(...xs){this.children.unshift(...xs)}replaceChildren(...xs){this.children.length=0;this.append(...xs)}before(){}after(){}setAttribute(k,v){this.attributes[k]=v}removeAttribute(k){delete this.attributes[k]}cloneNode(){const n=new Node(this.tag);n.value=this.value;n.textContent=this.textContent;return n}querySelector(q){if(!this.sub)this.sub={};return this.sub[q]??=new Node(q)}get childElementCount(){return this.children.length}scrollIntoView(){}requestSubmit(){return this.onsubmit({preventDefault(){}})}click(){}remove(){}}
for(const m of html.matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"/gi)){const n=new Node(m[1]);n.id=m[2]}
const get=id=>ids.get(id),sidebar=new Node('aside'),nav=new Node('nav'),top=new Node('div'),side=new Node('div'),body=new Node('body'),markers=Array.from({length:3},()=>new Node('g'));side.childNodes=[{nodeType:3,textContent:'Release 4.0.1'}];
const doc={createElement:t=>new Node(t),getElementById:get,documentElement:new Node('html'),body,querySelector:q=>q==='.sidebar nav'?nav:q==='.topright'?top:q==='.sidebottom'?side:q==='.printonly'?body.children.find(x=>x.className==='printonly')||null:null,querySelectorAll:q=>q==='.marker'?markers:q==='tr[data-index]'?get('rows').children:[]};
let printCount=0;const window={print:()=>printCount++};let store=new Map(),storageFail=false;const storage={getItem:k=>store.get(k)||null,setItem:(k,v)=>{if(storageFail)throw Error('denied');store.set(k,v)}};
const commercial={id:'Q104378621',name:'Ever Given',description:'container ship',imo:['9811000'],mmsi:['353136000'],type:['container ship'],flag:['Panama'],owner:['Shoei Kisen'],manufacturer:['Imabari Shipbuilding'],registryPort:['Panama City'],inception:['+2018-00-00T00:00:00Z'],length:[{amount:'+399.94',unit:'http://www.wikidata.org/entity/Q11573'}],beam:[{amount:'+58.8',unit:'http://www.wikidata.org/entity/Q11573'}]};
let mode='normal',pendingResolve=null,weatherMode='normal',weatherResolve=null,weatherUrl='';
const fetch=async u=>{u=String(u);if(u.includes('marine-api')){weatherUrl=u;const time=[new Date(Date.now()-3600000),new Date(Date.now()+3600000),new Date(Date.now()+7200000)].map(d=>d.toISOString().slice(0,16));const payload={hourly:{time,wave_height:weatherMode==='missing'?[null,null,null]:[3,1.2,null],wave_period:weatherMode==='missing'?[null,null,null]:[5,7,8]}};if(weatherMode==='pending')return new Promise(r=>weatherResolve=()=>r({ok:true,json:async()=>payload}));return {ok:weatherMode!=='fail',json:async()=>payload}}if(mode==='pending')return new Promise(r=>pendingResolve=()=>r({ok:true,json:async()=>({status:'success',results:[commercial]})}));if(mode==='fail')throw Error('offline');return {ok:true,json:async()=>mode==='null'?null:{status:'success',results:mode==='empty'?[]:[commercial]}}};
class AC{constructor(){this.signal={aborted:false}}abort(){this.signal.aborted=true}}
class Params{constructor(o){this.o=o}toString(){return Object.entries(this.o).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&')}}
const U=class{constructor(s){if(!String(s).startsWith('https://'))throw Error();this.href=s;this.protocol='https:';this.hostname=s.split('/')[2];this.pathname='/'+s.split('/').slice(3).join('/')}static createObjectURL(){return 'blob:test'}static revokeObjectURL(){}};
const code=app+'\n'+v4+'\nreturn {current:()=>current,report:()=>report(),select:v=>select(v),fromApi,csvCell,normalizeQuery,restoreRecord,records:()=>records};';
const exec=new Function('document','window','navigator','localStorage','fetch','AbortController','URLSearchParams','URL','setTimeout','clearTimeout','setInterval','confirm',code);
const e=exec(doc,window,{},storage,fetch,AC,Params,U,()=>0,()=>{},()=>{},()=>true);
check('initial historical records',e.records().length===3&&e.current().historical);
check('module initialization',get('v4ports').children.length===4&&get('v4region').children.length===5);
const search=q=>{get('query').value=q;return get('search').requestSubmit()};
await search('IMO 9811000');check('IMO search and normalization',e.current().imo==='9811000'&&e.records().length===2);
check('dimension normalization',e.current().length==='399.94 m');
check('report source fields',e.report().record.owner==='Shoei Kisen'&&e.report().sourceQuality.populated===10);
check('reject military categories',e.fromApi({...commercial,description:'naval vessel'},'9811000','')===null);
check('reject mismatched exact IMO',e.fromApi(commercial,'1234567','')===null);
check('CSV formula neutralization',e.csvCell('=1+1').startsWith("\"'="));
get('saveRecord').onclick();check('saved record persistence',JSON.parse(store.get('vesseleye.saved.v1')).length===1);
storageFail=true;get('clearSaved').onclick();check('storage failure visible',get('status').textContent.includes('may remain'));storageFail=false;
get('themeToggle').onclick();check('theme toggle persistence',doc.documentElement.dataset.theme==='dark'&&store.get('vesseleye.theme.v3')==='dark');
mode='pending';const pending=search('Unknown vessel');check('pending query clears unrelated record',e.current()===null&&get('export').disabled&&get('v4print').disabled);
await search('!');check('invalid input clears and cancels',get('status').textContent.includes('valid vessel')&&e.current()===null);pendingResolve();await pending;check('stale API response discarded',e.current()===null&&get('status').textContent.includes('valid vessel'));
mode='fail';await search('9811000');check('offline historical fallback',e.current().historical&&get('status').textContent.includes('unavailable'));
mode='null';await search('Unknown vessel');check('malformed API response fallback',e.current()===null&&get('export').disabled);
mode='normal';await search('9811000');e.select({...e.current(),owner:'  ',flag:' unknown '});check('completeness blank and sentinel consistency',e.report().sourceQuality.populated===8&&e.report().sourceQuality.missing.includes('owner')&&e.report().sourceQuality.missing.includes('flag'));
get('v4mapLoad').onclick();check('map embed generated',get('v4map').children[0].src.includes('openstreetmap.org'));get('v4region').onchange();check('map clears on region change',get('v4map').children[0].textContent.includes('Region changed'));
await get('v4weatherLoad').onclick();check('forecast excludes past data and handles missing fields',get('v4weather').children.length===2&&get('v4weather').children[1].children[1].textContent.includes('Unavailable')&&weatherUrl.includes('cell_selection=sea'));
weatherMode='pending';const wp=get('v4weatherLoad').onclick();get('v4weatherRegion').onchange();weatherResolve();await wp;check('stale weather response discarded',get('v4weather').children.length===0&&get('v4weatherStatus').textContent.includes('Region changed'));
weatherMode='missing';await get('v4weatherLoad').onclick();check('all-missing forecast rejected',get('v4weather').children.length===0&&get('v4weatherStatus').textContent.includes('unavailable'));
weatherMode='fail';await get('v4weatherLoad').onclick();check('weather provider failure',get('v4weatherStatus').textContent.includes('unavailable'));
get('v4caseFilter').value='2015';get('v4caseFilter').oninput();check('incident filter',get('v4cases').children.length===1&&get('v4cases').children[0].children[0].textContent.includes('El Faro'));
await get('v4aiRun').onclick();check('security-paused AI fallback',get('v4aiStatus').textContent.includes('unavailable'));
get('v4print').onclick();check('professional report print action',printCount===1&&body.children[0].children.some(n=>n.textContent==='03 / Limitations'));
get('demo').onclick();check('fictional AI exclusion',get('v4aiRun').disabled&&e.current().demo&&markers[0].classList.contains('selected'));
get('menuBtn').onclick();check('mobile navigation toggle',get('sidebar').classList.contains('open')&&get('menuBtn').attributes['aria-expanded']==='true');
check('cache-busted scripts',html.includes('app.js?v=4.0.2')&&html.includes('v4.js?v=4.0.2'));
check('CSP denies remote scripts',html.includes("script-src 'self'")&&html.includes("object-src 'none'")&&html.includes("worker-src 'none'")&&!html.includes("script-src 'self' https:"));
check('remote AI import removed',!v4.includes('https://esm.run/')&&!v4.includes('await import('));
check('CSV fullwidth formula neutralization',e.csvCell('＝1+1').startsWith("\"'"));
check('CSV leading newline neutralization',e.csvCell('\nhello').startsWith("\"'"));
check('oversized record name bounded',e.fromApi({...commercial,name:'a'.repeat(400)},'9811000','').name.length===180);
check('malformed record id rejected',e.fromApi({...commercial,id:123},'9811000','')===null);
check('stored arbitrary record rejected',e.restoreRecord({recordId:'arbitrary',name:'x'})===null);
const restored=e.restoreRecord({recordId:'wiki-Q104378621',name:'Ever Given',type:'container ship',imo:'9811000',url:'https://invalid.example/',verified:true});
check('stored provenance canonicalized',restored.url==='https://www.wikidata.org/wiki/Q104378621'&&restored.verified===false);
check('stored historical record canonicalized',e.restoreRecord({recordId:'history-ever-given',name:'changed'}).name==='Ever Given');
get('v4mapLoad').onclick();check('map sandbox and no referrer',get('v4map').children[0].attributes.sandbox==='allow-scripts allow-same-origin'&&get('v4map').children[0].referrerPolicy==='no-referrer');
return results;
}
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const results=await regression(read('app.js'),read('v4.js'),read('index.html'));for(const n of results)console.log('PASS '+n);console.log(`${results.length} checks passed (simulated DOM / fixtures).`);
