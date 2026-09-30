const http=require("http"),fs=require("fs"),path=require("path");
const rooms=new Map();
const get=c=>{let r=rooms.get(c);if(!r){r={v:0,setup:null,seats:[null,null,null,null],picks:[{},{},{},{}],t:Date.now()};rooms.set(c,r)}r.t=Date.now();return r};
const view=(r,t)=>({v:r.v,setup:r.setup,seats:r.seats.map(x=>!!x),me:r.seats.indexOf(t),picks:r.picks});
setInterval(()=>{for(const[k,r]of rooms)if(Date.now()-r.t>864e5)rooms.delete(k)},36e5);
function act(r,p,b){const t=String(b.t||"");if(!t)return"Bad request";
 const me=r.seats.indexOf(t);
 if(p==="new"){if(!b.setup||!b.setup.offers||!b.setup.own)return"Bad setup";r.setup=b.setup;r.seats=[null,null,null,null];r.picks=[{},{},{},{}]}
 else if(p==="seat"){const s=+b.s;if(!(s>=0&&s<4)||me>=0||r.seats[s]||!r.setup)return"Can't take that seat";r.seats[s]=t}
 else if(p==="leave"){if(me<0)return;r.seats[me]=null;r.picks[me]={}}
 else if(p==="pick"){if(me<0||!r.setup)return"No seat";const c=+b.c,o=r.setup.offers[(me%2)+"_"+c];
  if(!r.setup.own[me].includes(c)||!o||!o.includes(b.x)||c in r.picks[me])return"Invalid pick";r.picks[me][c]=b.x}
 r.v++}
http.createServer((q,res)=>{
 const u=new URL(q.url,"http://x"),m=u.pathname.match(/^\/api\/([A-Za-z0-9]{1,12})\/(\w+)$/);
 if(m){const r=get(m[1].toUpperCase()),send=o=>{res.setHeader("Content-Type","application/json");res.end(JSON.stringify(o))};
  if(q.method==="GET")return send(view(r,u.searchParams.get("t")||""));
  let d="";q.on("data",c=>{d+=c;if(d.length>2e5)q.destroy()});
  return q.on("end",()=>{let b={};try{b=JSON.parse(d)}catch(e){}const err=act(r,m[2],b);send(err?{error:err}:view(r,String(b.t||"")))})}
 fs.readFile(path.join(__dirname,"public","index.html"),(e,h)=>{res.setHeader("Content-Type","text/html");res.end(h)})
}).listen(process.env.PORT||3000,()=>console.log("Running on port "+(process.env.PORT||3000)));
