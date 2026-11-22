'use strict';
const $ = selector => document.querySelector(selector);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
$('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  document.body.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
function setMotion(value) { paused = value; document.body.classList.toggle('pause-motion', paused); $('#motionToggle').textContent = paused ? 'Resume motion' : 'Pause motion'; $('#motionToggle').setAttribute('aria-pressed', String(paused)); }
setMotion(paused);
$('#motionToggle').addEventListener('click', () => setMotion(!paused));
reduced.addEventListener('change', event => setMotion(event.matches));
$('#copyEmail').addEventListener('click', async () => { try { await navigator.clipboard.writeText('adam.aakif.00@gmail.com'); $('#copyStatus').textContent = 'Email copied.'; } catch { $('#copyStatus').textContent = 'adam.aakif.00@gmail.com'; } });

const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stat = (value,label) => `<div class="stat"><strong>${escapeHTML(value)}</strong><span>${escapeHTML(label)}</span></div>`;
const bar = (name,value,max) => `<div class="bar-row"><span>${escapeHTML(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,Math.min(100,value/max*100))}%"></div></div><span>${escapeHTML(Number(value.toFixed(2)))}</span></div>`;
const dialog = $('#demoDialog');
document.querySelectorAll('[data-demo]').forEach(button=>button.addEventListener('click',()=>{openDemo(button.dataset.demo);dialog.showModal();}));
$('#closeDemo').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
function openDemo(type){if(type==='football')footballDemo();else if(type==='text')textDemo();else dataDemo();}
function footballDemo(){
  const players=[{name:'The Finisher',goals:28,assists:6,matches:32},{name:'The Creator',goals:12,assists:21,matches:34},{name:'The All-rounder',goals:19,assists:13,matches:30}];
  $('#demoContent').innerHTML=`<h2>Touchline</h2><p>Different roles. Different strengths. Explore the numbers behind a playing style.</p><p class="demo-disclaimer">Fictional sample players and season data, created for this demo. No live sports feed.</p><div class="demo-controls"><div><label for="playerSelect">Playing style</label><select id="playerSelect">${players.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('')}</select></div><div><label for="metricSelect">Compare everyone by</label><select id="metricSelect"><option value="goals">Goals per match</option><option value="assists">Assists per match</option><option value="combined">Contributions per match</option></select></div></div><div id="footballStats" class="demo-results" aria-live="polite"></div><h3>Player comparison · per match</h3><div id="footballChart" class="demo-chart" aria-live="polite"></div>`;
  function update(){const p=players[Number($('#playerSelect').value)],metric=$('#metricSelect').value;$('#footballStats').innerHTML=stat(p.goals,'Season goals')+stat(p.assists,'Season assists')+stat(((p.goals+p.assists)/p.matches).toFixed(2),'Contributions / match');const values=players.map(p=>({name:p.name,value:(metric==='combined'?p.goals+p.assists:p[metric])/p.matches}));const max=Math.max(...values.map(p=>p.value),1);$('#footballChart').innerHTML=values.map(p=>bar(p.name,p.value,max)).join('');}
  $('#playerSelect').addEventListener('change',update);$('#metricSelect').addEventListener('change',update);update();
}
function textDemo(){
  $('#demoContent').innerHTML=`<h2>Between the Lines</h2><p>Find the patterns hiding in plain text. Everything is processed locally in your browser.</p><label for="textInput">Your text</label><textarea id="textInput" maxlength="20000">I love building useful software. Learning is a good challenge, and every new idea creates an opportunity to improve. I love learning through building.</textarea><div id="textResults" class="demo-results" aria-live="polite"></div><h3>Most frequent words</h3><div id="wordList" class="word-list"></div><p id="sentiment"></p><p class="demo-method">Method: Unicode word counting, estimated reading time at 200 words/minute, and a small English positive/negative word list. This is a rule-based exploration, not a trained NLP model; sarcasm, context, and negation are not understood.</p>`;
  const stop=new Set('the a an and or but to of in is it i me my you your we our for on with that this be as at by are was'.split(' '));
  const positive=new Set('love good great useful happy excellent amazing wonderful improve opportunity success enjoy best'.split(' ')),negative=new Set('bad hate terrible poor sad awful difficult failure worse worst broken angry'.split(' '));
  function analyze(){const words=($('#textInput').value.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu)||[]),freq=new Map();let pos=0,neg=0;words.forEach(w=>{if(!stop.has(w)&&w.length>1)freq.set(w,(freq.get(w)||0)+1);if(positive.has(w))pos++;if(negative.has(w))neg++;});$('#textResults').innerHTML=stat(words.length,'Words')+stat(new Set(words).size,'Unique words')+stat(words.length?`${Math.max(1,Math.ceil(words.length/200))} min`:'0 min','Estimated reading time');const sorted=[...freq].sort((a,b)=>b[1]-a[1]).slice(0,8);$('#wordList').innerHTML=sorted.length?sorted.map(([w,n])=>`<span>${escapeHTML(w)} · ${n}</span>`).join(''):'<p>Add some text to see its patterns.</p>';$('#sentiment').textContent=`English word-list cues: ${pos} positive · ${neg} negative. ${pos+neg===0?'No matching cues found.':pos>neg?'More positive cues.':neg>pos?'More negative cues.':'Balanced matching cues.'}`;}
  $('#textInput').addEventListener('input',analyze);analyze();
}
function parseCSV(text){
  const rows=[];let row=[],field='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(!quoted&&field.length)throw Error('Unexpected quote in an unquoted field.');else quoted=!quoted;}else if(c===','&&!quoted){row.push(field.trim());field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field.trim());if(row.some(v=>v!==''))rows.push(row);row=[];field='';}else field+=c;}
  if(quoted)throw Error('A quoted field is not closed.');row.push(field.trim());if(row.some(v=>v!==''))rows.push(row);
  if(rows.length<2)throw Error('Add a header and at least one data row.');if(rows[0].length<2)throw Error('Use comma-separated data with at least two columns.');if(rows.slice(1).some(r=>r.length!==rows[0].length))throw Error('Every row must have the same number of columns.');return rows;
}
function dataDemo(){
  $('#demoContent').innerHTML=`<h2>Flow State</h2><p>Explore a small CSV, choose a metric, and turn rows into a clearer picture.</p><p class="demo-disclaimer">The initial dataset is fictional. Your pasted or uploaded data stays in this browser. Up to 200 KB; comma-separated CSV.</p><label for="csvInput">CSV data</label><textarea id="csvInput" maxlength="200000">Month,Revenue,Orders\nJanuary,1200,18\nFebruary,1650,24\nMarch,1420,21\nApril,2100,30\nMay,2450,35\nJune,2800,42</textarea><label for="csvFile">Or open a CSV file</label><input id="csvFile" type="file" accept=".csv,text/csv"><button class="demo-button" id="loadCSV">Explore data</button><p id="csvError" class="demo-error" role="alert"></p><div id="csvOutput"></div>`;
  let rows;
  function load(){try{rows=parseCSV($('#csvInput').value);const numeric=rows[0].map((name,i)=>({name,i})).filter(c=>rows.slice(1).every(r=>r[c.i]!==''&&Number.isFinite(Number(r[c.i]))));if(!numeric.length)throw Error('Include at least one fully numeric column, without empty cells.');$('#csvError').textContent='';$('#csvOutput').innerHTML=`<label for="columnSelect">Numeric column</label><select id="columnSelect">${numeric.map(c=>`<option value="${c.i}">${escapeHTML(c.name)}</option>`).join('')}</select><div id="csvStats" class="demo-results"></div><div id="csvChart" class="demo-chart"></div><p class="demo-method">Statistics include all rows. The chart shows the first 12 rows; bars show magnitude and labels preserve negative values. No aggregation or currency assumptions.</p>`;$('#columnSelect').addEventListener('change',render);render();}catch(error){$('#csvError').textContent=error.message;$('#csvOutput').replaceChildren();}}
  function render(){const col=Number($('#columnSelect').value),values=rows.slice(1).map(r=>Number(r[col])),sum=values.reduce((s,v)=>s+v,0),format=v=>Number(v.toFixed(2)).toLocaleString('en-US');$('#csvStats').innerHTML=stat(values.length,'Data rows')+stat(format(sum),'Total')+stat(format(sum/values.length),'Average');const max=Math.max(...values.map(Math.abs),1);$('#csvChart').innerHTML=values.slice(0,12).map((v,i)=>bar(rows[i+1][0]||`Row ${i+1}`,Math.abs(v),max).replace(`<span>${escapeHTML(Number(Math.abs(v).toFixed(2)))}</span></div>`,`<span>${escapeHTML(Number(v.toFixed(2)))}</span></div>`)).join('');}
  $('#loadCSV').addEventListener('click',load);$('#csvFile').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;if(file.size>200000){$('#csvError').textContent='Choose a CSV smaller than 200 KB.';return;}try{$('#csvInput').value=await file.text();load();}catch{$('#csvError').textContent='This file could not be read.';}});load();
}
