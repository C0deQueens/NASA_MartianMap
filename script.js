
{
const D=[
 [1,2742,"Apr 23, 2020",137.380693,-4.73570825,-4180.65,"clay",-47,0,4.2,"Sample clay-bearing rock from the valley floor"],
 [1,2904,"Oct 6, 2020",137.3911437,-4.72931905,-4232.4,"clay",-41,54,5.5,"Compare clay layers at the lowest point"],
 [1,3013,"Jan 26, 2021",137.402401,-4.73388018,-4124.14,"clay",-37,63,9.4,"Document how minerals change upslope"],
 [1,3047,"Mar 2, 2021",137.412504,-4.73485601,-4069,"clay",-38,54,7.4,"Finish clay-unit observations"],
 [2,3141,"Jun 6, 2021",137.4078226,-4.74006506,-4043.79,"clay",-66,0,4.7,"Record the contact between units"],
 [2,3195,"Aug 2, 2021",137.4013424,-4.74224742,-3987.56,"ped",-50,22,3.5,"Survey the pediment's sandstone cap"],
 [2,3222,"Aug 30, 2021",137.3963642,-4.74397952,-4010.07,"ped",-46,0,3.7,"Check footing across the pediment edge"],
 [2,3284,"Nov 1, 2021",137.3951411,-4.74655489,-3966.8,"ped",-64,0,4.9,"Find a stable way toward the ridge"],
 [3,3333,"Dec 21, 2021",137.3943651,-4.74982983,-3957,"gediz",-27,8,6.5,"Inspect deposits on the ridge approach"],
 [3,3472,"May 13, 2022",137.3955739,-4.75266781,-3917,"gediz",-43,0,3.6,"Study ridge material and erosion"],
 [3,3549,"Jul 31, 2022",137.3978448,-4.75772527,-3900,"gediz",-35,1,5,"Collect representative ridge samples"],
 [3,3703,"Jan 5, 2023",137.3971689,-4.76198291,-3859.67,"gediz",-55,0,4,"Final observation and return decision"]
].map((r,i)=>({i,seg:r[0],sol:r[1],date:r[2],lon:r[3],lat:r[4],el:r[5],unit:r[6],t:r[7],uv:r[8],vis:r[9],goal:r[10]}));
 
const UNIT={clay:{n:"Clay-bearing unit",c:"var(--clay)",p:5,h:"Sand patches, uneven bedrock"},
 ped:{n:"Greenheugh Pediment",c:"var(--ped)",p:15,h:"Sharp, jagged sandstone"},
 gediz:{n:"Gediz Vallis Ridge approach",c:"var(--gediz)",p:15,h:"Loose rock and boulders"}};
const SEG=[{n:"Whole route"},{n:"Segment 1 · Clay unit",c:"var(--clay)"},{n:"Segment 2 · Greenheugh",c:"var(--ped)"},{n:"Segment 3 · Gediz Vallis",c:"var(--gediz)"}];
const R=3389500,RAD=0.67,SPEED=2;
const rad=d=>d*Math.PI/180;
const hav=(a,b)=>{const h=Math.sin(rad(b.lat-a.lat)/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lon-a.lon)/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const lat0=D[0].lat,lon0=D[0].lon,k=Math.cos(rad(lat0))*R*Math.PI/180,kl=R*Math.PI/180;
let cum=0;
D.forEach((p,i)=>{p.x=(p.lon-lon0)*k;p.y=(p.lat-lat0)*kl;
  if(i){const q=D[i-1];p.leg=hav(q,p);cum+=p.leg;p.dz=p.el-q.el}else{p.leg=0;p.dz=0}
  p.cum=cum;});
D.forEach((p,i)=>{const a=i?D[i-1]:D[0],b=i?p:D[1];p.slope=Math.abs(Math.atan2(b.el-a.el,hav(a,b))*180/Math.PI)});
const TOTAL=cum;
 
function safety(p){
  const s=p.slope<5?0:p.slope<10?10:p.slope<15?20:35;
  const t=p.t>=-40?0:p.t>=-60?5:15;
  const v=p.vis>=4?0:10;
  const u=UNIT[p.unit].p;
  const score=100-s-t-v-u;
  return {s,t,v,u,score,st:score>=80?"Safe":score>=50?"Caution":"Danger",c:score>=80?"var(--ok)":score>=50?"var(--warn)":"var(--bad)"};
}
D.forEach(p=>{p.sf=safety(p);
  const h=[UNIT[p.unit].h];
  if(p.slope>=10)h.push(`steep leg (${p.slope.toFixed(1)}°)`);
  if(p.vis<4)h.push(`low visibility (${p.vis} km)`);
  if(p.t<-60)h.push(`extreme cold (${p.t} °C)`);
  p.haz=h.join(" · ");});
 
const st={seg:0,sel:0,me:0};
const $=id=>document.getElementById(id);
const km=m=>m>=1000?(m/1000).toFixed(2)+" km":Math.round(m)+" m";
const num=n=>n.toLocaleString("en-US",{maximumFractionDigits:1});
 
function tabs(){$("tabs").innerHTML=SEG.map((s,i)=>`<button aria-pressed="${st.seg===i}" data-s="${i}">${s.c?`<span class="dot" style="background:${s.c}"></span>`:""}${s.n}</button>`).join("")}
$("tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;st.seg=+b.dataset.s;
  if(st.seg&&D[st.sel].seg!==st.seg)st.sel=D.find(p=>p.seg===st.seg).i;render()});
 
function drawMap(){
  const s=$("map"),W=s.clientWidth,H=s.clientHeight;if(!W)return;
  const vis=st.seg?D.filter(p=>p.seg===st.seg):D;
  const xs=vis.map(p=>p.x),ys=vis.map(p=>p.y);
  let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const pad=W<520?44:64,sc=Math.min((W-2*pad)/Math.max(x1-x0,150),(H-2*pad)/Math.max(y1-y0,150));
  const cx=(x0+x1)/2,cy=(y0+y1)/2;
  const X=x=>W/2+(x-cx)*sc,Y=y=>H/2-(y-cy)*sc;
  const step=[50,100,250,500,1000].find(v=>v*sc>=70)||1000;
  let g="";
  for(let v=Math.floor((cx-W/2/sc)/step)*step;v<cx+W/2/sc;v+=step)g+=`<line x1="${X(v)}" x2="${X(v)}" y1="0" y2="${H}" stroke="var(--grid)"/>`;
  for(let v=Math.floor((cy-H/2/sc)/step)*step;v<cy+H/2/sc;v+=step)g+=`<line y1="${Y(v)}" y2="${Y(v)}" x1="0" x2="${W}" stroke="var(--grid)"/>`;
  let r="";
  D.forEach((p,i)=>{if(!i)return;const q=D[i-1],dim=st.seg&&p.seg!==st.seg;
    r+=`<line x1="${X(q.x)}" y1="${Y(q.y)}" x2="${X(p.x)}" y2="${Y(p.y)}" stroke="${SEG[p.seg].c}" stroke-width="${dim?3:7}" stroke-linecap="round" opacity="${dim?.25:.85}"/>`});
  const me=D[st.me],sel=D[st.sel];
  let t="";
  if(st.me!==st.sel){const mx=(X(me.x)+X(sel.x))/2,my=(Y(me.y)+Y(sel.y))/2,lab=km(hav(me,sel));
    t=`<line x1="${X(me.x)}" y1="${Y(me.y)}" x2="${X(sel.x)}" y2="${Y(sel.y)}" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6 6"/>
    <rect x="${mx-34}" y="${my-13}" width="68" height="24" rx="6" fill="var(--ink)"/><text x="${mx}" y="${my+4}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--bg)">${lab}</text>`}
  let w="";
  D.forEach(p=>{const dim=st.seg&&p.seg!==st.seg,x=X(p.x),y=Y(p.y),on=p.i===st.sel;
    w+=`<g data-i="${p.i}" style="cursor:pointer" opacity="${dim?.35:1}" tabindex="0" role="button" aria-label="Stop ${p.i+1}, sol ${p.sol}">
    ${on?`<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${p.sf.c}" stroke-width="3" class="pulse"/>`:""}
    <circle cx="${x}" cy="${y}" r="${on?15:12}" fill="${p.sf.c}" stroke="${UNIT[p.unit].c}" stroke-width="4"/>
    <text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${p.i+1}</text></g>`});
  const mX=X(me.x),mY=Y(me.y);
  const you=`<g pointer-events="none"><path d="M${mX} ${mY-30}l9 12h-18z" fill="var(--rust)"/><rect x="${mX-20}" y="${mY-50}" width="40" height="19" rx="5" fill="var(--rust)"/><text x="${mX}" y="${mY-36}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">YOU</text></g>`;
  const sb=step*sc;
  const scale=`<g transform="translate(16 ${H-22})"><rect width="${sb}" height="6" fill="var(--ink)"/><text y="-6" font-size="13" fill="var(--mute)">${km(step)}</text></g>
  <g transform="translate(${W-30} 34)"><path d="M0 -16l8 20-8-5-8 5z" fill="var(--ink)"/><text y="20" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">N</text></g>`;
  s.innerHTML=g+r+t+w+you+scale;
}
$("map").addEventListener("click",e=>{const g=e.target.closest("[data-i]");if(g){st.sel=+g.dataset.i;render()}});
$("map").addEventListener("keydown",e=>{const g=e.target.closest("[data-i]");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();st.sel=+g.dataset.i;render()}});
 
function card(){
  const p=D[st.sel],me=D[st.me],u=UNIT[p.unit],f=p.sf;
  const straight=hav(me,p),route=Math.abs(p.cum-me.cum),hrs=route/1000/SPEED,dz=p.el-me.el;
 
  const tPct=Math.max(0,Math.min(100,(p.t+80)/80*100));
  $("card").innerHTML=`
  <div class="top"><div><h3>Stop ${p.i+1} · Sol ${p.sol}</h3><div class="meta">${p.date} · Segment ${p.seg}</div></div>
  <span class="chip" style="background:${u.c}">${u.n}</span></div>
  <div class="gauges">
   <div class="vg"><span class="lab">Safety</span>
    <div class="vbar"><i style="height:${f.score}%;background:${f.c}"></i></div>
    <b style="color:${f.c}">${f.score}</b><span class="unit">${f.st}</span></div>
   <div class="vg"><span class="lab">Temperature</span>
    <div class="tgauge"><div class="vbar temp"><i style="bottom:${tPct}%"></i></div>
     <div class="tticks"><span>Warm<br>0 °</span><span>−40 °</span><span>Cold<br>−80 °</span></div></div>
    <b>${p.t} °C</b><span class="unit">${Math.round(p.t*9/5+32)} °F</span></div>
   <div class="vg"><span class="lab">Distance</span>
    <div class="vbar"><i style="height:${route/TOTAL*100}%;background:var(--rust)"></i></div>
    <b>${st.me===st.sel?"Here":km(route)}</b><span class="unit">${st.me===st.sel?"You are here":"from you"}</span></div>
  </div>
  <p class="gnote">Safety: Slope −${f.s} · Temperature −${f.t} · Visibility −${f.v} · Terrain −${f.u}</p>
  <p class="gnote">Temperature: the colored part rises with the temperature, from cold (dark purple) to warm (cream)</p>
  <p class="gnote">Distance is along the route, out of ${km(TOTAL)} total · straight line ${km(straight)}</p>
  <dl class="nums">
   <div><dt>Elevation</dt><dd>${num(p.el)} m</dd></div>
   <div><dt>Climb from you</dt><dd>${dz>0?"+":""}${num(dz)} m</dd></div>
   <div><dt>Slope (leg in)</dt><dd>${p.slope.toFixed(1)}°</dd></div>
   <div><dt>Walk time</dt><dd>${hrs<.017?"0 min":hrs<1?Math.round(hrs*60)+" min":hrs.toFixed(1)+" h"}</dd></div>
   <div><dt>Visibility</dt><dd>${p.vis} km</dd></div>
   <div><dt>UV level</dt><dd>${p.uv}</dd></div>
   <div><dt>Radiation</dt><dd>${RAD} mSv/day</dd></div>
   <div><dt>Dose for walk</dt><dd>${(hrs*RAD/24).toFixed(3)} mSv</dd></div>
   <div><dt>Latitude</dt><dd>${p.lat.toFixed(5)}°</dd></div>
   <div><dt>Longitude</dt><dd>${p.lon.toFixed(5)}° E</dd></div>
  </dl>
  <div class="haz"><b>Hazards:</b> ${p.haz}<br><b>Science goal:</b> ${p.goal}</div>
  <div class="acts">
   <button class="btn" id="prev" ${st.sel===0?"disabled":""}>‹ Previous</button>
   <button class="btn" id="next" ${st.sel===D.length-1?"disabled":""}>Next ›</button>
   <button class="btn pri" id="here" ${st.me===st.sel?"disabled":""}>I'm at this stop</button>
  </div>`;
  $("prev").onclick=()=>{st.sel--;fix();render()};
  $("next").onclick=()=>{st.sel++;fix();render()};
  $("here").onclick=()=>{st.me=st.sel;render()};
}
function fix(){if(st.seg&&D[st.sel].seg!==st.seg)st.seg=D[st.sel].seg}
 
function drawProf(){
  const s=$("prof"),W=s.clientWidth,H=s.clientHeight;if(!W)return;
  const l=W<520?46:62,rr=18,tp=18,b=34;
  const e0=Math.min(...D.map(p=>p.el))-20,e1=Math.max(...D.map(p=>p.el))+20;
  const X=v=>l+v/TOTAL*(W-l-rr),Y=v=>tp+(e1-v)/(e1-e0)*(H-tp-b);
  let g="";
  for(let v=Math.ceil(e0/100)*100;v<=e1;v+=100)g+=`<line x1="${l}" x2="${W-rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--grid)"/><text x="${l-6}" y="${Y(v)+4}" text-anchor="end" font-size="13" fill="var(--mute)">${W<520?v/1000+"k":v}</text>`;
  const stepK=W<520?1000:500;
  for(let v=0;v<=TOTAL;v+=stepK)g+=`<text x="${X(v)}" y="${H-12}" text-anchor="middle" font-size="13" fill="var(--mute)">${v/1000} km</text>`;
  let ln="";D.forEach((p,i)=>{if(i){const q=D[i-1];ln+=`<line x1="${X(q.cum)}" y1="${Y(q.el)}" x2="${X(p.cum)}" y2="${Y(p.el)}" stroke="${SEG[p.seg].c}" stroke-width="4" stroke-linecap="round"/>`}});
  const pts=D.map(p=>`<circle data-i="${p.i}" cx="${X(p.cum)}" cy="${Y(p.el)}" r="${p.i===st.sel?9:6}" fill="${p.sf.c}" stroke="var(--panel)" stroke-width="2" style="cursor:pointer"/>`).join("");
  const me=D[st.me];
  s.innerHTML=g+ln+pts+`<path d="M${X(me.cum)} ${Y(me.el)-14}l7 -10h-14z" fill="var(--rust)"/>`;
}
$("prof").addEventListener("click",e=>{const c=e.target.closest("[data-i]");if(c){st.sel=+c.dataset.i;fix();render()}});
 
 
function render(){tabs();drawMap();card();drawProf()}
new ResizeObserver(()=>{drawMap();drawProf()}).observe($("mapBox"));
new ResizeObserver(drawProf).observe($("prof"));
render();
}
 