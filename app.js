'use strict';
const $=id=>document.getElementById(id);
const API_BASE='https://vesseleye-api.lol-to-me-9.workers.dev';
const sources=[['VesselEye API','Cloudflare · Wikidata lookup',API_BASE],['Wikidata','Public identity lookup · integrated','https://www.wikidata.org/'],['IMO GISIS','Ship and company records · external','https://gisis.imo.org/Public/Default.aspx'],['Equasis','Safety and ownership · free registration','https://www.equasis.org/'],['Global Fishing Watch','Public maritime research · external','https://globalfishingwatch.org/'],['NOAA Marine Cadastre','Historical US AIS data · external','https://hub.marinecadastre.gov/pages/vesseltraffic'],['NTSB','Public safety investigation records','https://www.ntsb.gov/investigations/Pages/default.aspx'],['Department of Shipping','Bangladesh public maritime services','https://dos.gov.bd/']];
const ports=[['Chattogram Port','Commercial port authority public portal','https://cpa.gov.bd/'],['Mongla Port','Commercial port authority public portal','https://mpa.gov.bd/'],['Payra Port','Commercial port authority public portal','https://ppa.gov.bd/']];
const historical=[
{name:'Ever Given',type:'Container ship',imo:'9811000',length:'399.94 m (2021 record)',source:'Historical public case study · 2021',url:'https://topsectorlogistiek.nl/wp-content/uploads/2024/05/TSL52.61.005-01-Case-Study-Ever-Given-Accident-report.pdf',historical:true,asOf:'2021',recordId:'history-ever-given'},
{name:'Dali',type:'Container ship',imo:'9697428',flag:'Singapore (2024 record)',length:'984 ft (2024 record)',source:'NTSB public investigation · 2024',url:'https://www.ntsb.gov/investigations/Pages/DCA24MM031.aspx',historical:true,asOf:'2024',recordId:'history-dali'},
{name:'El Faro',type:'Cargo ship',imo:'7395351',flag:'United States (2015 record)',source:'NTSB public investigation · 2015',url:'https://www.ntsb.gov/investigations/pages/dca16mm001.aspx',historical:true,asOf:'2015 · lost vessel',recordId:'history-el-faro'}];
const demos=['Horizon','Meridian','Sundar'].map((name,i)=>({name:'MV Demo '+name,type:['Container ship','Bulk carrier','General cargo'][i],imo:'Not assigned',flag:'Example only',owner:'Demo Shipping',length:['180 m','160 m','120 m'][i]+' (fictional)',source:'Fictional sample · not a real vessel',demo:true,recordId:'demo-'+i}));
const checks=['Confirm the IMO identifier with a registry','Check publication date and record freshness','Cross-check vessel type and registered ownership','Identify missing or conflicting information','Confirm no sensitive or personal data is included'];
const storageKey='vesseleye.saved.v1';let saved=[],reviews=new Map(),current=null,records=[],zoom=1,searchRun=0,controller=null;
try{const data=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(data))saved=data.filter(x=>x&&typeof x.name==='string'&&typeof x.recordId==='string').slice(0,100)}catch{}
function el(tag,txt,cls){const e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e}
function link(label,url){const a=el('a',label);try{const u=new URL(url);if(u.protocol!=='https:')throw Error();a.href=u.href;a.target='_blank';a.rel='noopener noreferrer'}catch{a.removeAttribute('href')}return a}
function button(label,action){const b=el('button',label,'btn');b.type='button';b.onclick=action;return b}
function status(msg){$('status').textContent=msg}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved));return true}catch{return false}}
function rowsFor(v){return [['Vessel type',v.type],['IMO number',v.imo],['MMSI',v.mmsi],['Flag / registry',v.flag],['Owner',v.owner],['Manufacturer',v.manufacturer],['Registry port',v.registryPort],['Inception / year',v.inception],['Length',v.length],['Beam',v.beam],['Record date',v.asOf],['Verification',v.demo?'Fictional':'Not independently verified'],['Position','Unavailable — no live AIS'],['Captain / crew','Not collected']]}
function fillDetails(node,v){node.replaceChildren();for(const [label,value] of rowsFor(v)){const d=el('div');d.append(el('dt',label),el('dd',value||'Not available'));node.append(d)}if(v.url){const d=el('div'),dd=el('dd');dd.append(link('View source ↗',v.url));d.append(el('dt','Source record'),dd);node.append(d)}if(v.photoSource){const d=el('div'),dd=el('dd');dd.append(link('View photograph & license ↗',v.photoSource));d.append(el('dt','Photography'),dd);node.append(d)}}
function select(v){current=v;$('name').textContent=v.name;$('origin').textContent=v.source;$('profileMode').textContent=v.demo?'FICTIONAL':v.historical?'HISTORICAL':'PUBLIC RECORD';fillDetails($('details'),v);document.querySelectorAll('tr[data-index]').forEach((r,i)=>r.classList.toggle('selected',records[i]===v));document.querySelectorAll('.marker').forEach((m,i)=>m.classList.toggle('selected',demos[i]===v));$('saveRecord').textContent=saved.some(s=>s.recordId===v.recordId)?'Remove saved':'Save record';renderChecks()}
function list(items,description){records=items;$('rows').replaceChildren();$('recordCount').textContent=String(items.length).padStart(2,'0');$('recordLabel').textContent=description;$('tableSub').textContent=description+' · select a record to inspect';items.forEach((v,i)=>{const tr=el('tr');tr.dataset.index=i;tr.tabIndex=0;for(const t of [v.name,v.type||'Unknown',v.imo||'Unknown',v.demo?'Demo':v.historical?'Historical':'Wikidata'])tr.append(el('td',t));tr.onclick=()=>select(v);tr.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(v)}};$('rows').append(tr)});if(items.length)select(items[0]);else{const tr=el('tr'),td=el('td','No matching records','empty');td.colSpan=4;tr.append(td);$('rows').append(tr)}}
function cancelSearch(){searchRun++;controller?.abort();$('search').querySelector('button[type="submit"],button:not([type])').disabled=false}
function showDemos(){cancelSearch();$('results').replaceChildren();list(demos,'Fictional sample records');status('Simulation only · all sample vessels and map positions are fictional.')}
function showHistory(){cancelSearch();$('results').replaceChildren();list(historical,'Historical public records');status('Offline historical records. Search by name or IMO to find a record, or use Wikidata for additional identities.')}
function renderSaved(){const node=$('savedList');node.replaceChildren();$('savedCount').textContent=saved.length;if(!saved.length)node.append(el('p','No saved records. Open a vessel profile and select Save record.','help'));for(const v of saved){const row=el('div',undefined,'saveditem');row.append(button(v.name+' · '+(v.imo||'No IMO'),()=>{select(v);$('profile').scrollIntoView({behavior:'smooth'})}),button('Remove',()=>{saved=saved.filter(s=>s.recordId!==v.recordId);persist();renderSaved();if(current)select(current)}));node.append(row)}}
function renderChecks(){const node=$('checkList');node.replaceChildren();if(!current)return;const set=reviews.get(current.recordId)||new Set();reviews.set(current.recordId,set);checks.forEach((c,i)=>{const label=el('label',undefined,'checkrow'),input=el('input');input.type='checkbox';input.checked=set.has(i);input.onchange=()=>{input.checked?set.add(i):set.delete(i);$('reviewStatus').textContent=`${set.size} of ${checks.length} review steps marked complete.`};label.append(input,el('span',c));node.append(label)});$('reviewStatus').textContent=`${set.size} of ${checks.length} review steps marked complete.`}
function download(name,content,type){const u=URL.createObjectURL(new Blob([content],{type}));const a=el('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function report(){return {schema:'vesseleye-report-v1',record:current,position:null,captain:null,crew:null,exportedAt:new Date().toISOString(),notice:'Independent civilian research prototype; not verified current data; not for navigation.'}}
function exportReport(){if(current)download('vesseleye-report.json',JSON.stringify(report(),null,2),'application/json')}
function printReport(){if(!current)return;let node=document.querySelector('.printonly');if(!node){node=el('section',undefined,'printonly');document.body.append(node)}node.replaceChildren(el('h1','VesselEye — Vessel research report'),el('p','Independent Bangladesh maritime research prototype · '+new Date().toISOString()),el('h2',current.name),el('p',current.source));const dl=el('dl');fillDetails(dl,current);node.append(dl,el('p','Historical or community-maintained identity data. Not verified current registry data. Not for navigation.'));window.print()}
function csvCell(v){let s=String(v??'');if(/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
function csvExport(){const cols=['name','type','imo','mmsi','flag','owner','manufacturer','registryPort','inception','length','beam','photoSource','asOf','source','url'];download('vesseleye-directory.csv','\ufeff'+[cols.map(csvCell).join(','),...records.map(v=>cols.map(k=>csvCell(v[k])).join(','))].join('\r\n'),'text/csv;charset=utf-8')}
function updateZoom(){ $('maplayer').style.transform=`scale(${zoom})`}
for(const [n,d,u] of sources){const a=link('',u);a.innerHTML='<span class="sourceicon"><svg class="ico"><use href="#db"/></svg></span><span><strong></strong><small></small></span><svg class="ico"><use href="#external"/></svg>';a.querySelector('strong').textContent=n;a.querySelector('small').textContent=d;$('sourceList').append(a)}$('sourceCount').textContent=String(sources.length).padStart(2,'0');
for(const [n,d,u] of ports){const a=link('',u);a.className='portcard';a.append(el('strong',n),el('small',d),el('span','Visit public website ↗'));$('portList').append(a)}
$('demo').onclick=showDemos;$('resetList').onclick=showHistory;$('export').onclick=$('topExport').onclick=exportReport;$('printReport').onclick=printReport;$('csvExport').onclick=csvExport;
$('saveRecord').onclick=()=>{if(!current)return;const existing=saved.some(v=>v.recordId===current.recordId);if(existing)saved=saved.filter(v=>v.recordId!==current.recordId);else if(saved.length<100)saved.push({...current});else{status('Saved record limit reached (100). Remove a record first.');return}const ok=persist();renderSaved();select(current);status(ok?(existing?'Record removed from local storage.':'Record saved in this browser.'):'Storage unavailable; record retained for this session only.')};
$('clearSaved').onclick=()=>{if(saved.length&&confirm('Remove all locally saved vessel records?')){saved=[];persist();renderSaved();if(current)select(current)}};
$('reviewExport').onclick=()=>{if(current){const set=reviews.get(current.recordId)||new Set();download('vesseleye-review.json',JSON.stringify({...report(),review:checks.map((item,i)=>({item,markedComplete:set.has(i)})),reviewNotice:'Self-reviewed checklist, not an official verification.'},null,2),'application/json')}};
$('zoomIn').onclick=()=>{zoom=Math.min(2.5,zoom+.25);updateZoom()};$('zoomOut').onclick=()=>{zoom=Math.max(1,zoom-.25);updateZoom()};$('resetMap').onclick=()=>{zoom=1;updateZoom()};
document.querySelectorAll('.marker').forEach((m,i)=>{function choose(){showDemos();select(demos[i])}m.onclick=choose;m.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}}});
function normalizeQuery(s){return s.trim().replace(/^(IMO|MMSI)\s*[:#-]?\s*(?=\d)/i,'').trim()}
const strings=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'&&x.trim()):[];
const joined=v=>strings(v).join(' · ')||undefined;
function dimension(v){return Array.isArray(v)?v.filter(x=>x&&typeof x.amount==='string'&&/^[-+]?\d+(?:\.\d+)?$/.test(x.amount)).map(x=>x.amount.replace(/^\+/,'')+(String(x.unit).endsWith('/Q11573')?' m':' (source unit: '+String(x.unit||'unknown')+')')).join(' · ')||undefined:undefined}
function photoLink(s){try{const u=new URL(s);return u.protocol==='https:'&&u.hostname==='commons.wikimedia.org'&&u.pathname.startsWith('/wiki/File:')?u.href:undefined}catch{return undefined}}
function fromApi(x,q,retrieved){if(!x||!/^Q\d+$/.test(x.id||''))return null;const imo=strings(x.imo).filter(v=>/^\d{7}$/.test(v)),mmsi=strings(x.mmsi).filter(v=>/^\d{9}$/.test(v)),types=strings(x.type);if(!imo.length||!types.some(t=>/^(cargo ship|container ship|bulk carrier|oil tanker|general cargo ship|chemical tanker|product tanker|crude oil tanker|liquefied natural gas carrier|ro-ro ship|vehicle carrier|passenger ship|cruise ship|ferry)$/i.test(t)))return null;if(/\b(warship|military|naval|submarine|frigate|destroyer|corvette|patrol vessel|patrol boat|missile boat|aircraft carrier)\b/i.test([x.name,x.description,...types].join(' ')))return null;if(/^\d{7}$/.test(q)&&!imo.includes(q)||/^\d{9}$/.test(q)&&!mmsi.includes(q))return null;return {name:typeof x.name==='string'?x.name:x.id,type:types.join(' · '),imo:imo.join(' · '),mmsi:mmsi.join(' · '),flag:joined(x.flag),owner:joined(x.owner),manufacturer:joined(x.manufacturer),registryPort:joined(x.registryPort),inception:strings(x.inception).map(t=>t.match(/^\+?(\d{4})-/)?.[1]||t).join(' · '),length:dimension(x.length),beam:dimension(x.beam),photoSource:photoLink(x.photoSource),asOf:'Undated source statements; retrieved '+String(retrieved||'unknown'),source:'Wikidata via VesselEye API · unverified',url:'https://www.wikidata.org/wiki/'+x.id,recordId:'wiki-'+x.id,verified:false}}
$('search').onsubmit=async e=>{e.preventDefault();const q=normalizeQuery($('query').value);if(!/^[\p{L}\p{N} .'-]{2,80}$/u.test(q)){status('Enter a valid vessel name, IMO or MMSI (2–80 characters).');return}cancelSearch();const run=searchRun;controller=new AbortController();const signal=controller.signal;$('results').replaceChildren();const local=historical.filter(v=>v.name.toLowerCase().includes(q.toLowerCase())||v.imo===q);if(local.length)list(local,'Matching historical records');status('Searching VesselEye cloud API…');const submit=$('search').querySelector('button[type="submit"],button:not([type])');submit.disabled=true;const activeController=controller;const timer=setTimeout(()=>activeController.abort(),20000);try{const r=await fetch(API_BASE+'/search?'+new URLSearchParams({q}).toString(),{headers:{Accept:'application/json'},signal});if(!r.ok)throw Error('API unavailable');const data=await r.json();if(data.status!=='success'||!Array.isArray(data.results))throw Error('Invalid API response');if(run!==searchRun)return;const found=new Map();for(const x of data.results){const v=fromApi(x,q,data.retrievedAt);if(v)found.set(v.recordId,v)}const results=[...found.values(),...local];list(results,results.length?'Matching public identity records':'No matching records');status(results.length?`${found.size} online records · ${local.length} historical records · independent verification required.`:'No matching supported commercial vessel records. Try an exact name or IMO.');}catch{if(run!==searchRun)return;list(local,'Offline historical results');status(local.length?'Cloud API unavailable. Matching historical records remain available.':'Cloud API unavailable or timed out. Try again or use historical records.')}finally{clearTimeout(timer);if(run===searchRun)submit.disabled=false}};
$('menuBtn').onclick=()=>{const open=$('sidebar').classList.toggle('open');$('menuBtn').setAttribute('aria-expanded',String(open))};document.querySelectorAll('nav a').forEach(a=>a.onclick=()=>{document.querySelectorAll('nav a').forEach(b=>b.classList.remove('active'));a.classList.add('active');$('sidebar').classList.remove('open');$('menuBtn').setAttribute('aria-expanded','false')});
function tick(){$('clock').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())+' BST (UTC+6)'}tick();setInterval(tick,1000);showHistory();renderSaved();


/* VesselEye 3.0 — public civilian research interface */
(() => {
  const themeKey = 'vesseleye.theme.v3';
  const theme = button('Dark mode', () => setTheme(document.documentElement.dataset.theme !== 'dark'));
  theme.id = 'themeToggle'; theme.setAttribute('aria-label','Toggle dark mode');
  function setTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    theme.textContent = dark ? 'Light mode' : 'Dark mode';
    theme.setAttribute('aria-pressed',String(dark));
    try { localStorage.setItem(themeKey,dark?'dark':'light'); } catch {}
  }
  let dark = false; try { dark = localStorage.getItem(themeKey)==='dark'; } catch {}
  document.querySelector('.topright').prepend(theme); setTheme(dark);
  const side = document.querySelector('.sidebottom');
  for (const n of side.childNodes) if(n.nodeType===3) n.textContent=n.textContent.replace('Release 2.0','Release 3.0');
  const shortcuts = el('div',undefined,'v3shortcuts');
  shortcuts.append(el('span','Try a commercial vessel:'), ...['9811000','Ever Given','Dali'].map(q=>button(q,()=>{$('query').value=q;$('search').requestSubmit()})));
  $('search').after(shortcuts);
  const photo = el('figure',undefined,'v3photo'), quality = el('section',undefined,'v3quality'), summary = el('section',undefined,'v3summary');
  photo.id='vesselPhoto'; quality.id='sourceQuality'; summary.id='smartSummary';
  $('details').before(photo,quality); $('details').after(summary);
  let photoRun=0, photoController=null;
  const metadataCache=new Map();
  function httpsHost(s,host) { try { const u=new URL(s); return u.protocol==='https:'&&u.hostname===host&&!u.username&&!u.password ? u.href:null; } catch { return null; } }
  function plain(s) { const t=document.createElement('template'); t.innerHTML=String(s||''); return (t.content.textContent||'').trim().slice(0,500); }
  function showPhoto(v) {
    const run=++photoRun; photoController?.abort(); photo.replaceChildren();
    const source=photoLink(v?.photoSource); photo.hidden=!source;
    if(!source) return;
    let title; try { title=decodeURIComponent(new URL(source).pathname.slice('/wiki/'.length)); } catch {photo.append(link('Open original photograph ↗',source));return;}
    photo.append(el('figcaption','Loading photograph and license…'));
    const fallback=()=>{photo.replaceChildren(el('figcaption','Preview unavailable. '),link('Open original photograph and license ↗',source));};
    function display(info) {
      if(run!==photoRun) return;
      const meta=info?.extmetadata||{}, author=plain(meta.Artist?.value), license=plain(meta.LicenseShortName?.value), src=httpsHost(info?.thumburl,'upload.wikimedia.org');
      const allowed=/^(CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC0(?: 1\.0)?|Public domain)$/i.test(license);
      if(!src||!allowed||(!author&&!/^(CC0|Public domain)/i.test(license))||!/^image\/(jpeg|png|webp|gif)$/.test(info?.mime||'')) {fallback();return;}
      const img=el('img'); img.alt='Photograph associated with '+v.name+' in Wikidata'; img.referrerPolicy='no-referrer'; img.loading='lazy'; img.onerror=()=>{if(run===photoRun) fallback()};
      const cap=el('figcaption', (author?author+' · ':'')+license+' · Wikimedia Commons. '); cap.append(link('File and license ↗',source));
      photo.replaceChildren(img,cap); img.src=src;
    }
    if(metadataCache.has(source)){display(metadataCache.get(source));return;}
    photoController=new AbortController(); const c=photoController; const timer=setTimeout(()=>c.abort(),10000);
    const params=new URLSearchParams({action:'query',titles:title,prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'640',iiextmetadatafilter:'Artist|LicenseShortName',format:'json',formatversion:'2',origin:'*'});
    fetch('https://commons.wikimedia.org/w/api.php?'+params,{signal:c.signal,credentials:'omit',referrerPolicy:'no-referrer'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{const info=d.query?.pages?.[0]?.imageinfo?.[0]; if(info){if(metadataCache.size>=30)metadataCache.clear();metadataCache.set(source,info)}display(info)}).catch(()=>{if(run===photoRun)fallback()}).finally(()=>clearTimeout(timer));
  }
  const fields=['imo','mmsi','type','flag','owner','manufacturer','registryPort','inception','length','beam'];
  function qualityFor(v) {
    const populated=fields.filter(k=>typeof v[k]==='string'&&v[k].trim()&&!/^(not assigned|not available|unknown)$/i.test(v[k])).length;
    const missing=fields.filter(k=>!v[k]||/^(not assigned|not available|unknown)$/i.test(v[k]));
    return {populated,missing,total:fields.length,verification:v.demo?'Fictional':v.historical?'Historical snapshot':'Unverified public record'};
  }
  function summaryFor(v) {
    const q=qualityFor(v); if(v.demo)return 'Fictional sample only. No real vessel is represented.';
    return v.name+(v.imo?' (IMO '+v.imo+')':'')+' is listed as '+(v.type||'an unspecified vessel type')+' in '+(v.source||'the selected source')+'. '+(v.flag?'Reported flag / registry: '+v.flag+'. ':'')+(v.owner?'Reported owner: '+v.owner+'. ':'')+(v.manufacturer?'Reported manufacturer: '+v.manufacturer+'. ':'')+q.populated+' of '+q.total+' profile fields are populated. '+(v.historical?'This is a historical snapshot. ':'Source statements may be outdated. ')+'No live position or crew data. Verify with an authoritative registry before relying on these details.';
  }
  function enhance(v) {
    quality.replaceChildren(); summary.replaceChildren();
    if(!v){++photoRun;photoController?.abort();photo.hidden=true;quality.hidden=true;summary.hidden=true;return;}
    quality.hidden=false; summary.hidden=false; showPhoto(v);
    const q=qualityFor(v); const head=el('div',undefined,'v3qualityhead'); head.append(el('strong','Source quality'),el('span',q.verification));
    const meter=el('progress');meter.max=q.total;meter.value=v.demo?0:q.populated;meter.setAttribute('aria-label','Profile field completeness');
    quality.append(head,meter,el('p',v.demo?'Fictional data; excluded from quality assessment.':q.populated+'/'+q.total+' fields present · completeness is not accuracy or verification.'));
    if(!v.demo&&q.missing.length)quality.append(el('p','Missing fields: '+q.missing.join(', ')+'.'));
    summary.append(el('h4','Automatic research summary'),el('p',summaryFor(v)),el('small','Rule-based, not AI. Generated locally from the selected record.'));
    const copy=button('Copy summary',async()=>{try{await navigator.clipboard.writeText(summaryFor(v));status('Summary copied.')}catch{status('Clipboard unavailable. Use report export instead.')}});
    summary.append(copy);
  }
  const originalSelect=select;
  select=function(v){originalSelect(v);enhance(v);for(const id of ['saveRecord','export','topExport','printReport','reviewExport'])$(id).disabled=false;};
  const originalList=list;
  list=function(items,description){originalList(items,description);if(!items.length){current=null;$('name').textContent='No matching vessel';$('origin').textContent='Try another name or identifier';$('profileMode').textContent='NO RECORD';$('details').replaceChildren();$('checkList').replaceChildren();$('reviewStatus').textContent='No selected record.';enhance(null)};for(const id of ['saveRecord','export','topExport','printReport','reviewExport'])$(id).disabled=!current;};
  const originalReport=report;
  report=function(){return {...originalReport(),summary:current?summaryFor(current):null,sourceQuality:current?qualityFor(current):null,summaryMethod:'Local rule-based generation; not independent verification'};};
  $('printReport').onclick=()=>{if(!current)return;let node=document.querySelector('.printonly');if(!node){node=el('section',undefined,'printonly');document.body.append(node)}node.replaceChildren(el('h1','VesselEye — Vessel research report'),el('p',new Date().toISOString()+' · independent civilian research prototype'),el('h2',current.name),el('p',current.source));const dl=el('dl');fillDetails(dl,current);node.append(dl,el('h2','Automatic research summary'),el('p',summaryFor(current)),el('p','Rule-based summary. Not independently verified; not for navigation.'));window.print()};
  if(current)enhance(current);
})();
