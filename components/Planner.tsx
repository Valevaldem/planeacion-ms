"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Minutas from "@/components/Minutas";
import { ChevronLeft, ChevronRight, Plus, X, Users, Calendar as CalIcon, List, Trash2, Pencil, Filter, Check, Tag, Sparkles, Megaphone, Hammer, Truck, ShoppingBag, PartyPopper, Cpu, Briefcase, Gem, Camera, Package, Wrench, Flag, Globe, Heart, Bookmark, Star, Clock, Gift } from "lucide-react";

const GOLD = "#B08D57", CREAM = "#F5F0E8", DARK = "#2A2A2A", NEUTRAL = "#9A958C";
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTHS_S = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const WD = ["L","M","M","J","V","S","D"];
const PALETTE = ["#B08D57","#7C9885","#C77966","#6B8CAE","#A87CA0","#D4A03C","#5B8A72","#C0607A","#8A6FBF","#4E9A9A","#B5703A","#536B78"];
const ICONS: any = { Tag, Megaphone, Hammer, Truck, ShoppingBag, PartyPopper, Cpu, Briefcase, Gem, Camera, Sparkles, Package, Wrench, Flag, Globe, Heart, Bookmark, Star, Clock, Gift, Users };
const ICON_KEYS = Object.keys(ICONS);
const Ico = ({ name, ...p }: any) => { const C = ICONS[name] || Tag; return <C {...p} />; };

const DEFAULT_PEOPLE = ["Sofi","Maru","Dany","Nina","Fernanda","Dennise","Diana","Mónica"].map((n,i)=>({ name:n, color:PALETTE[i%PALETTE.length] }));
const DEFAULT_CATEGORIES = [
  { name:"Cierre de pedidos", color:"#C0607A", icon:"ShoppingBag" },
  { name:"Vuelo / viaje", color:"#6B8CAE", icon:"Globe" },
  { name:"Junta", color:"#536B78", icon:"Users" },
  { name:"Entrega", color:"#5B8A72", icon:"Truck" },
  { name:"Deadline", color:"#C77966", icon:"Clock" },
];
const DEFAULT_THEMES = [
  { name:"Navidad", color:"#5B8A72", icon:"Gift" },
  { name:"San Valentín", color:"#C0607A", icon:"Heart" },
  { name:"Marketing", color:"#A87CA0", icon:"Megaphone" },
];

const pad = (n:number) => String(n).padStart(2,"0");
const dkey = (y:number,m:number,d:number) => `${y}-${pad(m+1)}-${pad(d)}`;
const todayKey = () => { const t=new Date(); return dkey(t.getFullYear(),t.getMonth(),t.getDate()); };
const endOf = (e:any) => e.end_date || e.date;
const inRange = (e:any,k:string) => e.date <= k && k <= endOf(e);
const dayCount = (e:any) => { const a=new Date(e.date), b=new Date(endOf(e)); return Math.round((+b-+a)/86400000)+1; };
const shortDate = (k:string) => { const [,m,d]=k.split("-").map(Number); return `${d} ${MONTHS_S[m-1]}`; };

function MonthGrid({ year, month, events, colorsOf, catById, themeById, onDayClick }: any) {
  const firstDow = (new Date(year,month,1).getDay()+6)%7;
  const days = new Date(year,month+1,0).getDate();
  const cells:any[] = [];
  for (let i=0;i<firstDow;i++) cells.push(null);
  for (let d=1;d<=days;d++) cells.push(d);
  const tk = todayKey();
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm" style={{ border:`1px solid ${GOLD}22` }}>
      <div className="mb-2 text-center font-semibold" style={{ color:DARK }}>{MONTHS[month]} <span style={{ color:GOLD }}>{year}</span></div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">{WD.map((w,i)=><div key={i} className="text-center text-xs font-medium py-0.5" style={{ color:GOLD }}>{w}</div>)}</div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d,i)=>{
          if (d===null) return <div key={i} />;
          const k = dkey(year,month,d);
          const dayEv = events.filter((e:any)=>inRange(e,k));
          const isToday = k===tk;
          return (
            <button key={i} onClick={()=>onDayClick(k)} className="min-h-12 rounded-lg p-1 text-left transition hover:opacity-80 flex flex-col"
              style={{ background:isToday?`${GOLD}1f`:CREAM, border:isToday?`1.5px solid ${GOLD}`:"1px solid transparent" }}>
              <span className="text-xs font-medium" style={{ color:DARK }}>{d}</span>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {dayEv.slice(0,3).map((e:any)=>{
                  const multi = endOf(e)!==e.date, start = e.date===k, end = endOf(e)===k;
                  const cat = catById(e.category_id);
                  const th = themeById(e.theme_id);
                  const color = cat ? cat.color : NEUTRAL;
                  const iconName = cat ? cat.icon : (th ? th.icon : null);
                  const pcs = colorsOf(e.person_ids);
                  const br = multi ? { borderTopLeftRadius:start?4:0, borderBottomLeftRadius:start?4:0, borderTopRightRadius:end?4:0, borderBottomRightRadius:end?4:0 } : { borderRadius:4 };
                  return (
                    <div key={e.id} className="truncate px-1 text-white flex items-center gap-0.5"
                      style={{ background:color, fontSize:"9px", lineHeight:"13px", textShadow:"0 0 2px rgba(0,0,0,0.35)", ...br }}>
                      {start && iconName && <Ico name={iconName} size={8} className="shrink-0" />}
                      <span className="truncate">{e.title}</span>
                      {start && pcs.length>0 && <span className="flex ml-auto shrink-0" style={{ gap:"1px" }}>{pcs.slice(0,3).map((c:string,idx:number)=><span key={idx} style={{ width:5, height:5, background:c, borderRadius:"9999px", border:"1px solid #fff" }} />)}</span>}
                      {multi && !end && <ChevronRight size={8} className="shrink-0" />}
                    </div>
                  );
                })}
                {dayEv.length>3 && <span style={{ fontSize:"9px", color:GOLD }}>+{dayEv.length-3} más</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Planner() {
  const [people, setPeople] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [startY, setStartY] = useState(new Date().getFullYear());
  const [startM, setStartM] = useState(new Date().getMonth());
  const [view, setView] = useState("calendar");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterTheme, setFilterTheme] = useState("all");
  const [groupBy, setGroupBy] = useState("month");

  const [dayModal, setDayModal] = useState<string|null>(null);
  const [teamModal, setTeamModal] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [themeModal, setThemeModal] = useState(false);

  const [editId, setEditId] = useState<string|null>(null);
  const [fTitle, setFTitle] = useState("");
  const [fCat, setFCat] = useState<string|null>(null);
  const [fTheme, setFTheme] = useState<string|null>(null);
  const [fPersons, setFPersons] = useState<string[]>([]);
  const [fDate, setFDate] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [fNotes, setFNotes] = useState("");

  const [newName, setNewName] = useState(""); const [newColor, setNewColor] = useState(PALETTE[0]);
  const [newCatName, setNewCatName] = useState(""); const [newCatColor, setNewCatColor] = useState(PALETTE[2]); const [newCatIcon, setNewCatIcon] = useState("Tag");
  const [newThName, setNewThName] = useState(""); const [newThColor, setNewThColor] = useState(PALETTE[4]); const [newThIcon, setNewThIcon] = useState("Tag");

  const fetchPeople = async () => { const { data } = await supabase.from("people").select("*").order("created_at"); setPeople(data||[]); };
  const fetchCats = async () => { const { data } = await supabase.from("categories").select("*").order("created_at"); setCats(data||[]); };
  const fetchThemes = async () => { const { data } = await supabase.from("themes").select("*").order("created_at"); setThemes(data||[]); };
  const fetchEvents = async () => { const { data } = await supabase.from("events").select("*").order("date"); setEvents(data||[]); };

  useEffect(() => {
    (async () => {
      let { data: pp } = await supabase.from("people").select("*").order("created_at");
      if (pp && pp.length===0) { await supabase.from("people").insert(DEFAULT_PEOPLE); ({ data: pp } = await supabase.from("people").select("*").order("created_at")); }
      setPeople(pp||[]);
      let { data: cc } = await supabase.from("categories").select("*").order("created_at");
      if (cc && cc.length===0) { await supabase.from("categories").insert(DEFAULT_CATEGORIES); ({ data: cc } = await supabase.from("categories").select("*").order("created_at")); }
      setCats(cc||[]);
      let { data: tt } = await supabase.from("themes").select("*").order("created_at");
      if (tt && tt.length===0) { await supabase.from("themes").insert(DEFAULT_THEMES); ({ data: tt } = await supabase.from("themes").select("*").order("created_at")); }
      setThemes(tt||[]);
      const { data: ee } = await supabase.from("events").select("*").order("date");
      setEvents(ee||[]);
      setLoaded(true);
    })();
    const ch = supabase.channel("planner")
      .on("postgres_changes", { event:"*", schema:"public", table:"people" }, fetchPeople)
      .on("postgres_changes", { event:"*", schema:"public", table:"categories" }, fetchCats)
      .on("postgres_changes", { event:"*", schema:"public", table:"themes" }, fetchThemes)
      .on("postgres_changes", { event:"*", schema:"public", table:"events" }, fetchEvents)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const months:any[] = [];
  for (let i=0;i<6;i++){ let m=startM+i,y=startY; while(m>11){m-=12;y++;} months.push({y,m}); }
  const rangeLabel = `${MONTHS_S[months[0].m]} ${months[0].y} – ${MONTHS_S[months[5].m]} ${months[5].y}`;
  const shift = (dir:number) => { let m=startM+dir,y=startY; while(m>11){m-=12;y++;} while(m<0){m+=12;y--;} setStartM(m); setStartY(y); };

  const visibleEvents = events.filter((e:any) =>
    (filterPerson==="all" || (e.person_ids||[]).includes(filterPerson)) &&
    (filterCat==="all" || (e.category_id||null) === (filterCat==="none"?null:filterCat)) &&
    (filterTheme==="all" || (e.theme_id||null) === (filterTheme==="none"?null:filterTheme)));
  const personById = (id:string) => people.find(p=>p.id===id);
  const catById = (id:string) => cats.find(c=>c.id===id) || null;
  const themeById = (id:string) => themes.find(t=>t.id===id) || null;
  const catColorOf = (id:string) => catById(id)?.color || NEUTRAL;
  const colorsOf = (ids:string[]) => (ids||[]).map(id=>personById(id)?.color).filter(Boolean) as string[];
  const namesOf = (ids:string[]) => (ids||[]).map(id=>personById(id)).filter(Boolean);

  const openDay = (k:string) => { setDayModal(k); setEditId(null); setFTitle(""); setFCat(null); setFTheme(null); setFPersons([]); setFDate(k); setFEnd(""); setFNotes(""); };
  const loadEvent = (e:any) => { setEditId(e.id); setFTitle(e.title); setFCat(e.category_id||null); setFTheme(e.theme_id||null); setFPersons(e.person_ids||[]); setFDate(e.date); setFEnd(e.end_date&&e.end_date!==e.date?e.end_date:""); setFNotes(e.notes||""); };
  const togglePerson = (id:string) => setFPersons(a => a.includes(id) ? a.filter(x=>x!==id) : [...a,id]);

  const saveEvent = async () => {
    if (!fTitle.trim()) return;
    let start=fDate, end:string|null = fEnd && fEnd>fDate ? fEnd : null;
    if (fEnd && fEnd<fDate) { start=fEnd; end=fDate; }
    const row = { title:fTitle.trim(), category_id:fCat, theme_id:fTheme, person_ids:fPersons, date:start, end_date:end, notes:fNotes };
    if (editId) await supabase.from("events").update(row).eq("id", editId);
    else await supabase.from("events").insert(row);
    await fetchEvents();
    setEditId(null); setFTitle(""); setFCat(null); setFTheme(null); setFPersons([]); setFEnd(""); setFNotes("");
  };
  const delEvent = async (id:string) => { await supabase.from("events").delete().eq("id", id); await fetchEvents(); };

  const addPerson = async () => { if(!newName.trim()) return; await supabase.from("people").insert({ name:newName.trim(), color:newColor }); setNewName(""); setNewColor(PALETTE[people.length%PALETTE.length]); await fetchPeople(); };
  const delPerson = async (id:string) => { await supabase.from("people").delete().eq("id",id); await fetchPeople(); };
  const setPColor = async (id:string,c:string) => { await supabase.from("people").update({color:c}).eq("id",id); await fetchPeople(); };

  const addCat = async () => { if(!newCatName.trim()) return; await supabase.from("categories").insert({ name:newCatName.trim(), color:newCatColor, icon:newCatIcon }); setNewCatName(""); setNewCatColor(PALETTE[(cats.length+2)%PALETTE.length]); setNewCatIcon("Tag"); await fetchCats(); };
  const delCat = async (id:string) => { await supabase.from("categories").delete().eq("id",id); await fetchCats(); await fetchEvents(); };
  const setCatColor = async (id:string,c:string) => { await supabase.from("categories").update({color:c}).eq("id",id); await fetchCats(); };
  const setCatIcon = async (id:string,ic:string) => { await supabase.from("categories").update({icon:ic}).eq("id",id); await fetchCats(); };
  const setCatName = async (id:string,name:string) => { await supabase.from("categories").update({name}).eq("id",id); await fetchCats(); };

  const addTheme = async () => { if(!newThName.trim()) return; await supabase.from("themes").insert({ name:newThName.trim(), color:newThColor, icon:newThIcon }); setNewThName(""); setNewThColor(PALETTE[(themes.length+4)%PALETTE.length]); setNewThIcon("Tag"); await fetchThemes(); };
  const delTheme = async (id:string) => { await supabase.from("themes").delete().eq("id",id); await fetchThemes(); await fetchEvents(); };
  const setThColor = async (id:string,c:string) => { await supabase.from("themes").update({color:c}).eq("id",id); await fetchThemes(); };
  const setThIcon = async (id:string,ic:string) => { await supabase.from("themes").update({icon:ic}).eq("id",id); await fetchThemes(); };
  const setThName = async (id:string,name:string) => { await supabase.from("themes").update({name}).eq("id",id); await fetchThemes(); };

  const sortedList = [...visibleEvents].sort((a,b)=> a.date.localeCompare(b.date) || endOf(a).localeCompare(endOf(b)));
  const fmtDate = (k:string) => { const [y,m,d]=k.split("-").map(Number); return `${d} de ${MONTHS[m-1]} ${y}`; };
  const btn = "rounded-xl px-3 py-2 text-sm font-medium transition";

  const PeopleDots = ({ ids, size=14 }: any) => {
    const ns = namesOf(ids);
    if (ns.length===0) return <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ background:"#bbb" }} />;
    return <span className="flex -space-x-1">{ns.map((p:any)=><span key={p.id} className="rounded-full border border-white" style={{ width:size, height:size, background:p.color }} title={p.name} />)}</span>;
  };
  const Pill = ({ item }: any) => item ? <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs shrink-0" style={{ background:`${item.color}22`, color:item.color }}><Ico name={item.icon} size={11} />{item.name}</span> : null;

  const renderRow = (e:any) => {
    const ns = namesOf(e.person_ids); const multi = endOf(e)!==e.date;
    return (
      <div className="flex items-center gap-2 py-2" key={e.id}>
        <div className="w-1.5 h-9 rounded-full shrink-0" style={{ background:catColorOf(e.category_id) }} />
        <div className="w-24 shrink-0 text-xs leading-tight" style={{ color:DARK }}>
          {multi ? <span>{shortDate(e.date)} <span style={{ color:GOLD }}>→</span> {shortDate(endOf(e))}<br /><span style={{ color:"#999" }}>{dayCount(e)} días</span></span> : shortDate(e.date)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color:DARK }}>{e.title}</div>
          {e.notes && <div className="text-xs truncate" style={{ color:"#999" }}>{e.notes}</div>}
        </div>
        <span className="hidden sm:inline-flex"><Pill item={catById(e.category_id)} /></span>
        <span className="hidden lg:inline-flex"><Pill item={themeById(e.theme_id)} /></span>
        <div className="hidden md:flex flex-wrap gap-1 justify-end max-w-36 shrink-0">{ns.map((p:any)=><span key={p.id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background:p.color }}>{p.name}</span>)}</div>
        <span className="md:hidden shrink-0"><PeopleDots ids={e.person_ids} /></span>
        <button onClick={()=>{ openDay(e.date); setTimeout(()=>loadEvent(e),0); }} className="opacity-50 hover:opacity-100"><Pencil size={14} color={DARK} /></button>
        <button onClick={()=>delEvent(e.id)} className="opacity-50 hover:opacity-100"><Trash2 size={14} color="#C77966" /></button>
      </div>
    );
  };

  let groups:any[] = [];
  if (groupBy==="cat") {
    const order = [...cats.map(c=>c.id), null];
    groups = order.map(cid => ({ key:cid||"none", head:catById(cid as string), items:sortedList.filter(e=>(e.category_id||null)===cid) })).filter(g=>g.items.length);
  } else if (groupBy==="theme") {
    const order = [...themes.map(t=>t.id), null];
    groups = order.map(tid => ({ key:tid||"none", head:themeById(tid as string), items:sortedList.filter(e=>(e.theme_id||null)===tid) })).filter(g=>g.items.length);
  } else {
    const map:any = {};
    sortedList.forEach(e=>{ const key=e.date.slice(0,7); (map[key]=map[key]||[]).push(e); });
    groups = Object.keys(map).sort().map(key=>({ key, monthLabel:`${MONTHS[Number(key.split("-")[1])-1]} ${key.split("-")[0]}`, items:map[key] }));
  }
  const dayEvents = dayModal ? visibleEvents.filter(e=>inRange(e,dayModal)) : [];

  const ManagerModal = ({ title, icon, list, onName, onColor, onIcon, onDel, nName, setNName, nColor, setNColor, nIcon, setNIcon, onAdd, addPlaceholder, onClose, renameable }: any) => (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background:"#0006" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3"><h2 className="font-semibold flex items-center gap-2" style={{ color:DARK }}>{icon} {title}</h2><button onClick={onClose}><X size={18} color={DARK} /></button></div>
        <div className="flex flex-col gap-2 mb-4">{list.map((t:any)=>(
          <div key={t.id} className="rounded-lg p-2" style={{ background:CREAM }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0" style={{ background:t.color }}><Ico name={t.icon} size={14} color="#fff" /></span>
              {renameable
                ? <input defaultValue={t.name} onBlur={e=>{ const v=e.target.value.trim(); if(v && v!==t.name) onName(t.id,v); }} className="flex-1 text-sm font-medium bg-transparent outline-none rounded px-1 py-0.5" style={{ color:DARK }} title="Click para renombrar" />
                : <span className="flex-1 text-sm font-medium" style={{ color:DARK }}>{t.name}</span>}
              <select value={t.icon} onChange={e=>onIcon(t.id,e.target.value)} className="rounded-lg px-1 py-1 text-xs" style={{ background:"#fff", color:DARK, border:`1px solid ${GOLD}55` }}>{ICON_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
              <button onClick={()=>onDel(t.id)}><Trash2 size={14} color="#C77966" /></button>
            </div>
            <div className="flex gap-1 flex-wrap items-center">{PALETTE.map(c=><button key={c} onClick={()=>onColor(t.id,c)} className="w-4 h-4 rounded-full" style={{ background:c, outline:t.color===c?`2px solid ${DARK}`:"none", outlineOffset:"1px" }} />)}<input type="color" value={t.color} onChange={e=>onColor(t.id,e.target.value)} title="Color personalizado" className="w-5 h-5 rounded cursor-pointer p-0" style={{ border:`1px solid ${GOLD}55`, background:"transparent" }} /></div>
          </div>))}
        </div>
        <div className="flex flex-col gap-2 pt-2" style={{ borderTop:`1px solid ${GOLD}22` }}>
          <p className="text-xs font-medium" style={{ color:GOLD }}>Agregar</p>
          <div className="flex gap-2">
            <input value={nName} onChange={e=>setNName(e.target.value)} placeholder={addPlaceholder} className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={{ background:CREAM, color:DARK }} />
            <select value={nIcon} onChange={e=>setNIcon(e.target.value)} className="rounded-lg px-2 py-2 text-xs" style={{ background:CREAM, color:DARK }}>{ICON_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">{PALETTE.map(c=><button key={c} onClick={()=>setNColor(c)} className="w-6 h-6 rounded-full" style={{ background:c, outline:nColor===c?`2px solid ${DARK}`:"none", outlineOffset:"2px" }} />)}<input type="color" value={nColor} onChange={e=>setNColor(e.target.value)} title="Color personalizado" className="w-7 h-7 rounded cursor-pointer p-0" style={{ border:`1px solid ${GOLD}55`, background:"transparent" }} /></div>
          <button onClick={onAdd} className="rounded-xl py-2 text-sm font-medium text-white flex items-center justify-center gap-1" style={{ background:GOLD }}><Plus size={15} /> Agregar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:CREAM, fontFamily:"system-ui, sans-serif", minHeight:"100vh" }} className="p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color:DARK }}>Planeación Semestral</h1>
          <p className="text-xs flex items-center gap-1" style={{ color:GOLD }}>María Salinas <span style={{ color:"#7C9885" }}>· En vivo</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl overflow-hidden" style={{ border:`1px solid ${GOLD}55` }}>
            <button onClick={()=>setView("calendar")} className={btn+" flex items-center gap-1"} style={{ background:view==="calendar"?GOLD:"#fff", color:view==="calendar"?"#fff":DARK }}><CalIcon size={15} /> Calendario</button>
            <button onClick={()=>setView("list")} className={btn+" flex items-center gap-1"} style={{ background:view==="list"?GOLD:"#fff", color:view==="list"?"#fff":DARK }}><List size={15} /> Lista</button>
            <button onClick={()=>setView("minutas")} className={btn+" flex items-center gap-1"} style={{ background:view==="minutas"?GOLD:"#fff", color:view==="minutas"?"#fff":DARK }}><Bookmark size={15} /> Minutas</button>
          </div>
          <button onClick={()=>setCatModal(true)} className={btn+" flex items-center gap-1"} style={{ background:"#fff", color:DARK, border:`1px solid ${GOLD}55` }}><Sparkles size={15} /> Tipos</button>
          <button onClick={()=>setThemeModal(true)} className={btn+" flex items-center gap-1"} style={{ background:"#fff", color:DARK, border:`1px solid ${GOLD}55` }}><Tag size={15} /> Temas</button>
          <button onClick={()=>setTeamModal(true)} className={btn+" flex items-center gap-1"} style={{ background:"#fff", color:DARK, border:`1px solid ${GOLD}55` }}><Users size={15} /> Equipo</button>
        </div>
      </div>

      {view !== "minutas" && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={()=>shift(-1)} className="rounded-lg p-2" style={{ background:"#fff", border:`1px solid ${GOLD}55` }}><ChevronLeft size={16} color={DARK} /></button>
            <span className="font-semibold text-sm" style={{ color:DARK }}>{rangeLabel}</span>
            <button onClick={()=>shift(1)} className="rounded-lg p-2" style={{ background:"#fff", border:`1px solid ${GOLD}55` }}><ChevronRight size={16} color={DARK} /></button>
            <button onClick={()=>{ setStartY(new Date().getFullYear()); setStartM(new Date().getMonth()); }} className="rounded-lg px-2 py-2 text-xs" style={{ background:"#fff", border:`1px solid ${GOLD}55`, color:GOLD }}>Hoy</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={15} color={GOLD} />
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ background:"#fff", border:`1px solid ${GOLD}55`, color:DARK }}>
              <option value="all">Todos los tipos</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}<option value="none">Sin tipo</option>
            </select>
            <select value={filterTheme} onChange={e=>setFilterTheme(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ background:"#fff", border:`1px solid ${GOLD}55`, color:DARK }}>
              <option value="all">Todos los temas</option>{themes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}<option value="none">Sin tema</option>
            </select>
            <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ background:"#fff", border:`1px solid ${GOLD}55`, color:DARK }}>
              <option value="all">Todo el equipo</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      )}

      {view !== "minutas" && (
        <div className="flex flex-wrap gap-3 mb-3 text-xs items-center" style={{ color:DARK }}>
          <span style={{ color:GOLD }}>Color = tipo · Puntos = responsables · Tema = agrupa/filtra ·</span>
          {cats.map(c=>(
            <span key={c.id} className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background:c.color }} /> {c.name}</span>
          ))}
        </div>
      )}

      {view==="calendar" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {months.map(({y,m}:any)=><MonthGrid key={`${y}-${m}`} year={y} month={m} events={visibleEvents} colorsOf={colorsOf} catById={catById} themeById={themeById} onDayClick={openDay} />)}
        </div>
      )}

      {view==="list" && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm flex-wrap">
            <span style={{ color:DARK }}>Agrupar por:</span>
            {[["month","Mes"],["cat","Tipo"],["theme","Tema"]].map(([k,l])=>(
              <button key={k} onClick={()=>setGroupBy(k)} className="rounded-lg px-3 py-1" style={{ background:groupBy===k?GOLD:"#fff", color:groupBy===k?"#fff":DARK, border:`1px solid ${GOLD}55` }}>{l}</button>
            ))}
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border:`1px solid ${GOLD}22` }}>
            {groups.length===0 && <p className="text-sm text-center py-6" style={{ color:"#999" }}>Nada apuntado todavía. Pícale a un día en el calendario.</p>}
            {groups.map((g:any)=>(
              <div key={g.key}>
                <div className="text-xs font-semibold mt-3 mb-1 pb-1 flex items-center gap-1.5" style={{ color:g.head?g.head.color:GOLD, borderBottom:`1px solid ${(g.head?g.head.color:GOLD)}33` }}>
                  {(groupBy==="cat"||groupBy==="theme") ? (g.head ? <><Ico name={g.head.icon} size={13} /> {g.head.name}</> : (groupBy==="cat"?"Sin tipo":"Sin tema")) : g.monthLabel}
                  <span style={{ color:"#bbb" }}>· {g.items.length}</span>
                </div>
                {g.items.map(renderRow)}
              </div>
            ))}
          </div>
        </div>
      )}

      {view==="minutas" && <Minutas events={events} />}

      {dayModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background:"#0006" }} onClick={()=>setDayModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold" style={{ color:DARK }}>{fmtDate(dayModal)}</h2><button onClick={()=>setDayModal(null)}><X size={18} color={DARK} /></button></div>
            {dayEvents.length>0 && (
              <div className="mb-4 flex flex-col gap-1.5">
                {dayEvents.map((e:any)=>{ const multi=endOf(e)!==e.date; return (
                  <div key={e.id} className="flex items-center gap-2 rounded-lg p-2" style={{ background:CREAM }}>
                    <div className="w-1.5 h-6 rounded-full" style={{ background:catColorOf(e.category_id) }} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block" style={{ color:DARK }}>{e.title}{multi && <span className="text-xs ml-1" style={{ color:GOLD }}>· {shortDate(e.date)}→{shortDate(endOf(e))}</span>}</span>
                      <span className="flex gap-1 flex-wrap mt-0.5"><Pill item={catById(e.category_id)} /><Pill item={themeById(e.theme_id)} /></span>
                    </div>
                    <PeopleDots ids={e.person_ids} size={13} />
                    <button onClick={()=>loadEvent(e)}><Pencil size={13} color={DARK} /></button>
                    <button onClick={()=>delEvent(e.id)}><Trash2 size={13} color="#C77966" /></button>
                  </div>); })}
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop:`1px solid ${GOLD}22` }}>
              <p className="text-xs font-medium" style={{ color:GOLD }}>{editId?"Editando":"Agregar nuevo"}</p>
              <input value={fTitle} onChange={e=>setFTitle(e.target.value)} placeholder="¿Qué pasa este día?" className="rounded-lg px-3 py-2 text-sm outline-none" style={{ background:CREAM, color:DARK }} />
              <div>
                <p className="text-xs mb-1" style={{ color:DARK }}>Tipo <span style={{ color:"#999" }}>(define el color)</span></p>
                <div className="flex flex-wrap gap-1.5">{cats.map(c=>{ const on=fCat===c.id; return (
                  <button key={c.id} onClick={()=>setFCat(on?null:c.id)} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition" style={{ background:on?c.color:"#fff", color:on?"#fff":c.color, border:`1.5px solid ${c.color}` }}><Ico name={c.icon} size={11} /> {c.name}</button>); })}</div>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color:DARK }}>Tema <span style={{ color:"#999" }}>(campaña, no cambia el color)</span></p>
                <div className="flex flex-wrap gap-1.5">{themes.map(t=>{ const on=fTheme===t.id; return (
                  <button key={t.id} onClick={()=>setFTheme(on?null:t.id)} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition" style={{ background:on?t.color:"#fff", color:on?"#fff":t.color, border:`1.5px solid ${t.color}` }}><Ico name={t.icon} size={11} /> {t.name}</button>); })}</div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1"><label className="text-xs" style={{ color:DARK }}>Del</label><input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} className="w-full rounded-lg px-2 py-2 text-sm" style={{ background:CREAM, color:DARK }} /></div>
                <div className="flex-1"><label className="text-xs" style={{ color:DARK }}>al <span style={{ color:"#999" }}>(opcional)</span></label><input type="date" value={fEnd} min={fDate} onChange={e=>setFEnd(e.target.value)} className="w-full rounded-lg px-2 py-2 text-sm" style={{ background:CREAM, color:DARK }} /></div>
                {fEnd && <button onClick={()=>setFEnd("")} className="rounded-lg px-2 py-2 text-xs mb-0.5" style={{ background:CREAM, color:GOLD }}>1 día</button>}
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color:DARK }}>Responsable(s) {fPersons.length>0 && <span style={{ color:GOLD }}>({fPersons.length})</span>}</p>
                <div className="flex flex-wrap gap-1.5">{people.map(p=>{ const on=fPersons.includes(p.id); return (
                  <button key={p.id} onClick={()=>togglePerson(p.id)} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition" style={{ background:on?p.color:"#fff", color:on?"#fff":DARK, border:`1.5px solid ${p.color}` }}>{on?<Check size={11} />:<span className="w-2.5 h-2.5 rounded-full" style={{ background:p.color }} />}{p.name}</button>); })}</div>
              </div>
              <textarea value={fNotes} onChange={e=>setFNotes(e.target.value)} placeholder="Notas (opcional)" rows={2} className="rounded-lg px-3 py-2 text-sm outline-none resize-none" style={{ background:CREAM, color:DARK }} />
              <div className="flex gap-2">
                <button onClick={saveEvent} className="flex-1 rounded-xl py-2 text-sm font-medium text-white flex items-center justify-center gap-1" style={{ background:GOLD }}><Plus size={15} /> {editId?"Guardar cambios":"Agregar"}</button>
                {editId && <button onClick={()=>{ setEditId(null); setFTitle(""); setFCat(null); setFTheme(null); setFPersons([]); setFEnd(""); setFNotes(""); }} className="rounded-xl px-3 text-sm" style={{ background:CREAM, color:DARK }}>Cancelar</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {catModal && <ManagerModal title="Tipos de evento" icon={<Sparkles size={17} color={GOLD} />} list={cats} renameable
        onName={setCatName} onColor={setCatColor} onIcon={setCatIcon} onDel={delCat}
        nName={newCatName} setNName={setNewCatName} nColor={newCatColor} setNColor={setNewCatColor} nIcon={newCatIcon} setNIcon={setNewCatIcon}
        onAdd={addCat} addPlaceholder="Nombre del tipo (ej. Vuelo, Cierre...)" onClose={()=>setCatModal(false)} />}

      {themeModal && <ManagerModal title="Temas / campañas" icon={<Tag size={17} color={GOLD} />} list={themes} renameable
        onName={setThName} onColor={setThColor} onIcon={setThIcon} onDel={delTheme}
        nName={newThName} setNName={setNewThName} nColor={newThColor} setNColor={setNewThColor} nIcon={newThIcon} setNIcon={setNewThIcon}
        onAdd={addTheme} addPlaceholder="Nombre del tema (ej. Navidad)" onClose={()=>setThemeModal(false)} />}

      {teamModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background:"#0006" }} onClick={()=>setTeamModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold flex items-center gap-2" style={{ color:DARK }}><Users size={17} color={GOLD} /> Equipo</h2><button onClick={()=>setTeamModal(false)}><X size={18} color={DARK} /></button></div>
            <div className="flex flex-col gap-2 mb-4">{people.map(p=>(
              <div key={p.id} className="flex items-center gap-2 rounded-lg p-2" style={{ background:CREAM }}>
                <div className="w-5 h-5 rounded-full shrink-0" style={{ background:p.color }} />
                <span className="flex-1 text-sm" style={{ color:DARK }}>{p.name}</span>
                <div className="flex gap-1 flex-wrap justify-end items-center">{PALETTE.map(c=><button key={c} onClick={()=>setPColor(p.id,c)} className="w-4 h-4 rounded-full" style={{ background:c, outline:p.color===c?`2px solid ${DARK}`:"none", outlineOffset:"1px" }} />)}<input type="color" value={p.color} onChange={e=>setPColor(p.id,e.target.value)} title="Color personalizado" className="w-5 h-5 rounded cursor-pointer p-0" style={{ border:`1px solid ${GOLD}55`, background:"transparent" }} /></div>
                <button onClick={()=>delPerson(p.id)}><Trash2 size={14} color="#C77966" /></button>
              </div>))}
            </div>
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop:`1px solid ${GOLD}22` }}>
              <p className="text-xs font-medium" style={{ color:GOLD }}>Agregar persona</p>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nombre" className="rounded-lg px-3 py-2 text-sm outline-none" style={{ background:CREAM, color:DARK }} />
              <div className="flex flex-wrap gap-1.5 items-center">{PALETTE.map(c=><button key={c} onClick={()=>setNewColor(c)} className="w-6 h-6 rounded-full" style={{ background:c, outline:newColor===c?`2px solid ${DARK}`:"none", outlineOffset:"2px" }} />)}<input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} title="Color personalizado" className="w-7 h-7 rounded cursor-pointer p-0" style={{ border:`1px solid ${GOLD}55`, background:"transparent" }} /></div>
              <button onClick={addPerson} className="rounded-xl py-2 text-sm font-medium text-white flex items-center justify-center gap-1" style={{ background:GOLD }}><Plus size={15} /> Agregar al equipo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
