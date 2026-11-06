(() => {
const $ = s => document.querySelector(s);
const views = ["homeView","categoriesView","peopleView","personProfileView","challengesView","gameView","resultsView","leaderboardView","adminView","profileView"];
let currentCategory=null,currentItems=[],currentIndex=0,ranked={},lastResult=null,soundOn=false;
let currentPerson=null,currentPersonRole=null,currentBatch=0;
const store={get(k,f){try{return JSON.parse(localStorage.getItem("br_"+k))??f}catch{return f}},set(k,v){localStorage.setItem("br_"+k,JSON.stringify(v))}};
let catalogue=store.get("catalogue",null)||window.BLIND_RANK_DATA;
let history=store.get("history",[]);
let player=store.get("player",{name:"Guest Player"});
function persist(){store.set("catalogue",catalogue);store.set("history",history)}
function show(id){views.forEach(v=>$("#"+v).classList.toggle("active",v===id));window.scrollTo({top:0,behavior:"smooth"});if(id==="leaderboardView")renderLeaderboard();if(id==="profileView")renderProfile();if(id==="adminView")renderAdmin()}
function toast(msg){let t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
function categoryById(id){return catalogue.find(c=>c.id===id)}
function renderCategories(){let grid=$("#categoryGrid");grid.innerHTML="";catalogue.forEach((c,i)=>{let b=document.createElement("button");b.className="category-card";b.style.setProperty("--glow",["#a65bff","#e35f9a","#f0a84f","#579fe4"][i%4]);b.innerHTML=`<div class="cat-icon">${c.icon||"🎬"}</div><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.tamil||c.desc||"Tamil cinema challenge")}</p><span class="card-arrow">↗</span>`;b.onclick=()=>{if(["actors","actresses","directors"].includes(c.id))openPeople(c.id);else openCategory(c.id)};grid.append(b)})}
function openPeople(role){
 currentPersonRole=role;
 const labels={actors:"Actors",actresses:"Actresses",directors:"Directors"};
 $("#peopleTitle").textContent=labels[role]||"Tamil Cinema People";
 $("#peopleEyebrow").textContent=(labels[role]||role).toUpperCase()+" / PEOPLE DIRECTORY";
 $("#peopleDescription").textContent="Choose an individual artist. Each person has a separate filmography and independent ranking batches.";
 $("#peopleSearch").value="";
 renderPeople();
 show("peopleView");
}
function renderPeople(){
 const list=(window.BLIND_RANK_PEOPLE?.[currentPersonRole]||[]);
 const q=($("#peopleSearch")?.value||"").trim().toLowerCase();
 const filtered=list.filter(p=>p[1].toLowerCase().includes(q));
 $("#peopleCount").textContent=filtered.length+" PEOPLE";
 $("#peopleGrid").innerHTML="";
 filtered.forEach(p=>{
  const b=document.createElement("button");b.className="person-card";
  b.innerHTML=`<span class="person-avatar small">${escapeHtml(p[1].split(/\\s+/).map(x=>x[0]).slice(0,2).join(""))}</span><span class="person-card-copy"><strong>${escapeHtml(p[1])}</strong><small>${escapeHtml(p[2])} · ${(p[4]||[]).length} films</small></span><span class="card-arrow">↗</span>`;
  b.onclick=()=>openPersonProfile(p);$("#peopleGrid").append(b);
 });
 if(!filtered.length)$("#peopleGrid").innerHTML='<p class="empty-state">No matching names. Try another search.</p>';
}
function personPlayedIds(personId){return store.get("played_"+personId,[])}
function openPersonProfile(p){
 currentPerson={id:p[0],name:p[1],role:p[2],bio:p[3],films:p[4]||[]};
 $("#personAvatar").textContent=p[1].split(/\\s+/).map(x=>x[0]).slice(0,2).join("");
 $("#personName").textContent=p[1];$("#personRole").textContent=p[2].toUpperCase()+" / TAMIL CINEMA";
 $("#personBio").textContent=p[3];
 renderBatches();show("personProfileView");
}
function renderBatches(){
 const played=personPlayedIds(currentPerson.id),films=currentPerson.films;
 const remaining=films.filter(f=>!played.includes(f[0]));
 const grid=$("#batchGrid");grid.innerHTML="";
 const batchCount=Math.ceil(remaining.length/10);
 for(let i=0;i<batchCount;i++){
  const batch=remaining.slice(i*10,(i+1)*10);
  const b=document.createElement("button");b.className="batch-card";
  b.innerHTML=`<span class="batch-number">BATCH ${String(i+1).padStart(2,"0")}</span><strong>${i===0&&played.length===0?"Top 10":i===1?"Next 10":"Next "+batch.length+" Films"}</strong><small>${batch.length} films · ${batch[0]?.[1]||""}${batch.length>1?" – "+batch[batch.length-1][1]:""}</small><span class="batch-cta">RANK THESE FILMS →</span>`;
  b.disabled=batch.length<10;
  if(batch.length<10)b.title="Fewer than 10 unrated films remain.";
  b.onclick=()=>startPersonBatch(batch,i+1);
  grid.append(b);
 }
 $("#filmographyNote").textContent=`${films.length} film records in this starter profile · ${played.length} already ranked · ${remaining.length} remaining. ${remaining.length%10? "The final partial batch is shown but needs 10 films to play.":""}`;
}
function startPersonBatch(batch,batchNo){
 if(batch.length!==10){toast("This batch needs exactly 10 films. Add more verified filmography records in the database.");return}
 currentBatch=batchNo;currentItems=[...batch];currentIndex=0;ranked={};
 lastResult={category:currentPerson.role,challenge:currentPerson.name+" — Filmography Batch "+batchNo,personId:currentPerson.id,batchNo};
 $("#roundLabel").textContent=(currentPerson.name+" / BATCH "+batchNo).toUpperCase();
 renderSlots();renderCurrentItem();show("gameView");
}
function openCategory(id){currentCategory=categoryById(id);if(!currentCategory)return;$("#challengeEyebrow").textContent=(currentCategory.name+" / CHOOSE YOUR CHALLENGE").toUpperCase();$("#challengeTitle").textContent=currentCategory.name;$("#challengeDescription").textContent=currentCategory.desc||"Choose your challenge.";let g=$("#challengeGrid");g.innerHTML="";(currentCategory.challenges||["Top 10 Tamil Cinema Picks"]).forEach((ch,i)=>{let b=document.createElement("button");b.className="challenge-card";b.innerHTML=`<small>CHALLENGE 0${i+1}</small><h3>${escapeHtml(ch)}</h3><p>Ten mystery reveals. Rank each one from 1 to 10.</p><span>10 ITEMS · START ROUND →</span>`;b.onclick=()=>startGame(ch);g.append(b)});show("challengesView")}
function startGame(challenge){if(!currentCategory.items||currentCategory.items.length<10){toast("This category needs at least 10 items. Add more in Admin Studio.");return}currentItems=[...currentCategory.items].sort(()=>Math.random()-.5).slice(0,10);currentIndex=0;ranked={};lastResult={category:currentCategory.name,challenge};$("#roundLabel").textContent=(currentCategory.name+" / "+challenge).toUpperCase();renderSlots();renderCurrentItem();show("gameView")}
function renderCurrentItem(){let item=currentItems[currentIndex];if(!item)return;$("#progressText").textContent=`REVEAL ${String(currentIndex+1).padStart(2,"0")} / 10`;$("#progressPercent").textContent=Math.round((currentIndex+1)*10)+"%";$("#progressBar").style.width=((currentIndex+1)*10)+"%";$("#itemName").textContent=item[0];$("#itemMeta").textContent=`TAMIL CINEMA • ${item[1]||"YEAR UNKNOWN"}`;$("#itemDescription").textContent=item[2]||"Make your choice.";$("#itemInitial").textContent=(item[0]||"?").trim().charAt(0).toUpperCase();$("#itemArt").style.background=`radial-gradient(circle at 50% 40%, ${["#744493","#38517a","#7d3e4f","#76602e"][currentIndex%4]}, #21162f 58%, #100c18)`;$("#slotCount").textContent=Object.keys(ranked).length+" / 10"}
function renderSlots(){let el=$("#rankSlots");el.innerHTML="";for(let n=1;n<=10;n++){let b=document.createElement("button");b.className="rank-slot";let item=ranked[n];b.disabled=!!item;if(item)b.innerHTML=`<span class="rank-num">${String(n).padStart(2,"0")}</span><span><strong>${escapeHtml(item[0])}</strong><small>${item[1]||"Tamil Cinema"}</small></span>`;else b.innerHTML=`<span class="rank-num">${String(n).padStart(2,"0")}</span><span class="slot-empty">Tap to place here</span>`;b.onclick=()=>placeRank(n);el.append(b)}$("#slotCount").textContent=Object.keys(ranked).length+" / 10"}
function placeRank(n){if(ranked[n])return;ranked[n]=currentItems[currentIndex];renderSlots();if(soundOn)beep();if(currentIndex<9){currentIndex++;renderCurrentItem()}else finishGame()}
function finishGame(){let ordered=Array.from({length:10},(_,i)=>ranked[i+1]);if(lastResult.personId){let played=personPlayedIds(lastResult.personId);ordered.forEach(it=>{if(it&&!played.includes(it[0]))played.push(it[0])});store.set("played_"+lastResult.personId,played)}let historyEntry={date:new Date().toISOString(),category:lastResult.category,challenge:lastResult.challenge,items:ordered};history.unshift(historyEntry);history=history.slice(0,50);persist();renderResults(ordered);show("resultsView")}
function renderResults(items){let list=$("#resultList");list.innerHTML="";items.forEach((it,i)=>{let row=document.createElement("div");row.className="result-item";row.innerHTML=`<span class="result-rank">${String(i+1).padStart(2,"0")}</span><span class="result-name">${escapeHtml(it[0])}</span><span class="result-year">${it[1]||""}</span>`;list.append(row)});$("#resultScore").textContent="—"}
function renderLeaderboard(){let rows=history.slice(0,10);let target=$("#leaderRows");if(!rows.length){target.innerHTML='<div class="leader-row"><span>—</span><span>No rounds yet — play your first game!</span><span>0</span><span>—</span></div>';return}target.innerHTML=rows.map((r,i)=>`<div class="leader-row"><span>${String(i+1).padStart(2,"0")}</span><span>${escapeHtml(player.name||"Guest Player")} · ${escapeHtml(r.category)}</span><span>1</span><span>—</span></div>`).join("")}
function renderProfile(){$("#profileName").textContent=player.name||"Guest Player";$("#profileStats").textContent=`${history.length} rounds played on this device.`;$("#historyList").innerHTML=history.length?history.map(h=>`<div class="history-entry"><b>${escapeHtml(h.challenge)}</b><div>${escapeHtml(h.category)} · ${new Date(h.date).toLocaleDateString()}</div></div>`).join(""):"No rounds played yet. Your completed games will appear here."}
function renderAdmin(){let sel=$("#adminCategory");sel.innerHTML=catalogue.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");let recent=catalogue.flatMap(c=>(c.items||[]).slice(-2).map(it=>({cat:c.name,item:it[0]}))).slice(-12).reverse();$("#adminItems").innerHTML=recent.map(x=>`<div class="admin-item"><span>${escapeHtml(x.item)} <small>· ${escapeHtml(x.cat)}</small></span><span>Seed item</span></div>`).join("")}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function csvParse(text){let lines=text.trim().split(/\r?\n/);let parse=line=>{let out=[],cur="",q=false;for(let i=0;i<line.length;i++){let c=line[i];if(c==='"'&&line[i+1]==='"'&&q){cur+='"';i++}else if(c==='"')q=!q;else if(c===","&&!q){out.push(cur);cur=""}else cur+=c}out.push(cur);return out};let headers=parse(lines.shift()).map(x=>x.trim().toLowerCase());return lines.filter(Boolean).map(line=>{let vals=parse(line),o={};headers.forEach((h,i)=>o[h]=vals[i]||"");return o})}
function beep(){try{let C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=660;g.gain.value=.035;o.start();o.stop(c.currentTime+.08)}catch{}}
function setSound(){soundOn=!soundOn;$("#soundToggle").innerHTML=`♪ <span>Sound ${soundOn?"on":"off"}</span>`;$("#gameSound").textContent=soundOn?"♫":"♪";toast("Sound "+(soundOn?"enabled":"muted"))}
document.querySelectorAll("[data-home]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();show("homeView")}));
document.querySelectorAll("[data-categories]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();renderCategories();show("categoriesView")}));
document.querySelectorAll("[data-leaderboard]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();show("leaderboardView")}));
document.querySelectorAll("[data-back-categories]").forEach(b=>b.onclick=()=>show("categoriesView"));
document.querySelectorAll("[data-admin]").forEach(b=>b.onclick=()=>show("adminView"));
document.querySelectorAll("[data-profile]").forEach(b=>b.onclick=()=>show("profileView"));
$("#startPlaying").onclick=()=>{renderCategories();show("categoriesView")};
$("#howToPlay").onclick=()=>$("#modal").classList.add("open");
$("#modalClose").onclick=()=>$("#modal").classList.remove("open");
$("#modalStart").onclick=()=>{$("#modal").classList.remove("open");renderCategories();show("categoriesView")};
$("#quitGame").onclick=()=>{if(confirm("Exit this round? Your current ranking will be lost."))show(lastResult?.personId?"personProfileView":"categoriesView")};
$("#backToPeople").onclick=()=>show("peopleView");
$("#peopleSearch").addEventListener("input",renderPeople);
$("#playAgain").onclick=()=>{if(lastResult?.personId){let played=personPlayedIds(lastResult.personId);let remaining=currentPerson.films.filter(f=>!played.includes(f[0]));if(remaining.length>=10)startPersonBatch(remaining.slice(0,10),Math.floor(played.length/10)+1);else toast("No full batch of 10 remains. Return to profile.");}else startGame(lastResult.challenge)};
$("#soundToggle").onclick=setSound;$("#gameSound").onclick=setSound;
$("#userButton").onclick=()=>show("profileView");
$("#shareResults").onclick=async()=>{let txt=`My BLIND RANK — Tamil Cinema Edition result\\n${lastResult.category}: ${lastResult.challenge}\\n`+Array.from({length:10},(_,i)=>`${i+1}. ${ranked[i+1]?.[0]||""}`).join("\\n");try{await navigator.clipboard.writeText(txt);toast("Result summary copied!")}catch{toast("Clipboard not available in this browser.")}};
$("#itemForm").onsubmit=e=>{e.preventDefault();let c=categoryById($("#adminCategory").value);let name=$("#adminName").value.trim();if(!name)return;c.items=c.items||[];c.items.push([name,Number($("#adminYear").value)||"",$("#adminDescription").value.trim()]);persist();e.target.reset();renderAdmin();toast("Item added to local catalogue.")};
$("#downloadCsv").onclick=()=>{let blob=new Blob(["category,name,year,description\\nActors,Example Actor,2024,Sample description\\n"],{type:"text/csv"});let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="blind-rank-items-template.csv";a.click();URL.revokeObjectURL(a.href)};
$("#csvInput").onchange=async e=>{let f=e.target.files[0];if(!f)return;let rows=csvParse(await f.text()),added=0;rows.forEach(r=>{let c=catalogue.find(x=>x.id===r.category.toLowerCase().replace(/[^a-z0-9]+/g,"").replace("musicdirectors","music").replace("bestmovieclimax","climax").replace("moviepairings","pairings").replace("iconicscenes","scenes").replace("massmoments","mass").replace("cinematographers","cinematographers"))||catalogue.find(x=>x.name.toLowerCase()===r.category.toLowerCase());if(c&&r.name){c.items=c.items||[];c.items.push([r.name,Number(r.year)||"",r.description||""]);added++}});persist();$("#adminMessage").textContent=`Imported ${added} item(s).`;renderAdmin();e.target.value=""};
$("#menuToggle").onclick=()=>{let choice=prompt("Type: play, leaderboard, profile, or admin");if(!choice)return;({play:()=>{renderCategories();show("categoriesView")},leaderboard:()=>show("leaderboardView"),profile:()=>show("profileView"),admin:()=>show("adminView")}[choice.toLowerCase()]||(()=>toast("Choose play, leaderboard, profile or admin.")))()};
renderCategories();renderAdmin();
})();