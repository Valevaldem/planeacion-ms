"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Minutas from "@/components/Minutas";
import { ChevronLeft, ChevronRight, Plus, X, Star, Clock, CheckSquare, Users, Calendar as CalIcon, List, Trash2, Pencil, Filter, Check, Tag, Megaphone, Hammer, Truck, ShoppingBag, PartyPopper, Cpu, Briefcase, Gem, Camera, Sparkles, Package, Wrench, Flag, Globe, Heart, Bookmark } from "lucide-react";

const GOLD = "#B08D57", CREAM = "#F5F0E8", DARK = "#2A2A2A";
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTHS_S = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const WD = ["L","M","M","J","V","S","D"];
const PALETTE = ["#B08D57","#7C9885","#C77966","#6B8CAE","#A87CA0","#D4A03C","#5B8A72","#C0607A","#8A6FBF","#4E9A9A","#B5703A","#536B78"];
const ICONS: any = { Tag, Megaphone, Hammer, Truck, ShoppingBag, PartyPopper, Cpu, Briefcase, Gem, Camera, Sparkles, Package, Wrench, Flag, Globe, Heart, Bookmark };
const ICON_KEYS = Object.keys(ICONS);
const Ico = ({ name, ...p }: any) => { const C = ICONS[name] || Tag; return <C {...p} />; };
const TYPES: any = { importante: { label: "Día importante", icon: Star }, deadline: { label: "Deadline", icon: Clock }, tarea: { label: "Tarea", icon: CheckSquare } };

const DEFAULT_PEOPLE = ["Sofi","Maru","Dany","Nina","Fernanda","Dennise","Diana","Mónica"].map((n,i)=>({ name:n, color:PALETTE[i%PALETTE.length] }));
const DEFAULT_THEMES = [
  { name:"Marketing", color:"#C0607A", icon:"Megaphone" },
  { name:"Producción", color:"#B5703A", icon:"Hammer" },
  { name:"Logística", color:"#6B8CAE", icon:"Truck" },
  { name:"Ventas", color:"#5B8A72", icon:"ShoppingBag" },
  { name:"Eventos", color:"#A87CA0", icon:"PartyPopper" },
  { name:"Tecnología", color:"#4E9A9A", icon:"Cpu" },
  { name:"Administración", color:"#536B78", icon:"Briefcase" },
];

const pad = (n:number) => String(n).padStart(2,"0");
const dkey = (y:number,m:number,d:number) => `${y}-${pad(m+1)}-${pad(d)}`;
const todayKey = () => { const t=new Date(); return dkey(t.getFullYear(),t.getMonth(),t.getDate()); };
const endOf = (e:any) => e.end_date || e.date;
const inRange = (e:any,k:string) => e.date <= k && k <= endOf(e);
const dayCount = (e:any) => { const a=new Date(e.date), b=new Date(endOf(e)); return Math.round((+b-+a)/86400000)+1; };
const shortDate = (k:string) => { const [,m,d]=k.split("-").map(Number); return `${d} ${MONTHS_S[m-1]}`; };

function colorsToBg(colors:string[]) {
  if (!colors || colors.length===0) return "#bbb";
  if (colors.length===1) return colors[0];
  const step = 100/colors.length;
  const stops = colors.map((c,i)=>`${c} ${(i*step).toFixed(2)}% ${((i+1)*step).toFixed(2)}%`).join(", ");
  return `linear-gradient(135deg, ${stops})`;
}

function MonthGrid({ year, month, events, colorsOf, themeById, onDayClick }: any) {
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
                  const th = themeById(e.theme_id);
                  const br = multi ? { borderTopLeftRadius:start?4:0, borderBottomLeftRadius:start?4:0, borderTopRightRadius:end?4:0, borderBottomRightRadius:end?4:0 } : { borderRadius:4 };
                  return (
                    <div key={e.id} className="truncate px-1 text-white flex items-center gap-0.5"
                      style={{ background:colorsToBg(colorsOf(e.person_ids)), fontSize:"9px", lineHeight:"13px",
                        borderLeft: e.type==="deadline"&&start?"3px solid #fff":"none", textShadow:"0 0 2px rgba(0,0,0,0.35)", ...br }}>
                      {start && th && <Ico name={th.icon} size={8} className="shrink-0" />}
                      {start && !th && e.type==="importante" && <Star size={8} className="shrink-0" />}
                      {start && !th && e.type==="deadline" && <Clock size={8} className="shrink-0" />}
                      <span className="truncate">{e.title}</span>
                      {multi && !end && <ChevronRight size={8} className="ml-auto shrink-0" />}
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
  const [themes, setThemes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [startY, setStartY] = useState(new Date().getFullYear());
  const [startM, setStartM] = useState(new Date().getMonth());
  const [view, setView] = useState("calendar");
  const [filterPerson, setFilterPerson] = useState("all");
  const [filterTheme, setFilterTheme] = useState("all");
  const [groupBy, setGroupBy] = useState("month");

  const [dayModal, setDayModal] = useState<string|null>(null);
  const [teamModal, setTeamModal] = useState(false);
  const [themeModal, setThemeModal] = useState(false);

  const [editId, setEditId] = useState<string|null>(null);
  const [fTitle, setFTitle] = useState("");
  const [fType, setFType] = useState("tarea");
  const [fTheme, setFTheme] = useState<string|null>(null);
  const [fPersons, setFPersons] = useState<string[]>([]);
  const [fDate, setFDate] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [fNotes, setFNotes] = useState("");

  const [newName, setNewName] = useState(""); const [newColor, setNewColor] = useState(PALETTE[0]);
  const [newThName, setNewThName] = useState(""); const [newThColor, setNewThColor] = useState(PALETTE[2]); const [newThIcon, setNewThIcon] = useState("Tag");

  const fetchPeople = async () => { const { data } = await supabase.from("people").select("*").order("created_at"); setPeople(data||[]); };
  const fetchThemes = async () => { const { data } = await supabase.from("themes").select("*").order("created_at"); setThemes(data||[]); };
  const fetchEvents = async () => { const { data } = await supabase.from("events").select("*").order("date"); setEvents(data||[]); };

  useEffect(() => {
    (async () => {
      let { data: pp } = await supabase.from("people").select("*").order("created_at");
      if (pp && pp.length===0) { await supabase.from("people").insert(DEFAULT_PEOPLE); ({ data: pp } = await supabase.from("people").select("*").order("created_at")); }
      setPeople(pp||[]);
      let { data: tt } = await supabase.from("themes").select("*").order("created_at");
      if (tt && tt.length===0) { await supabase.from("themes").insert(DEFAULT_THEMES); ({ data: tt } = await supabase.from("themes").select("*").order("created_at")); }
      setThemes(tt||[]);
      const { data: ee } = await supabase.from("events").select("*").order("date");
      setEvents(ee||[]);
      setLoaded(true);
    })();
    const ch = supabase.channel("planner")
      .on("postgres_changes", { event:"*", schema:"public", table:"people" }, fetchPeople)
      .on("postgres_changes", { event:"*", schema:"public", table:"themes" }, fetchThemes)
      .on("postgres_changes", { event:"*", schema:"public", table:"events" }, fetchEvents)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const months:any[] = [];
  for (let i=0;i<6;i++){ let m=startM+i,y=startY; while(m>11){m-=12;y++;} months.push({y,m}); }
  const rangeLabel = `${MONTHS_S[months[0].m]} ${months[0].y} – ${MONTHS_S[months[5].m]} ${months[5].y}`;
  const shift = (dir:number) => { let m=startM+dir*6,y=startY; while(m>11){m-=12;y++;} while(m<0){m+=12;y--;} setStartM(m); setStartY(y); };

  const visibleEvents = events.filter((e:any) =>
    (filterPerson==="all" || (e.person_ids||[]).includes(filterPerson)) &&
    (filterTheme==="all" || (e.theme_id||null) === (filterTheme==="none"?null:filterTheme)));
  const personById = (id:string) => people.find(p=>p.id===id);
  const themeById = (id:string) => themes.find(t=>t.id===id) || null;
  const colorsOf = (ids:string[]) => (ids||[]).map(id=>personById(id)?.color).filter(Boolean) as string[];
  const namesOf = (ids:string[]) => (ids||[]).map(id=>personById(id)).filter(Boolean);

  const openDay = (k:string) => { setDayModal(k); setEditId(null); setFTitle(""); setFType("tarea"); setFTheme(null); setFPersons([]); setFDate(k); setFEnd(""); setFNotes(""); };
  const loadEvent = (e:any) => { setEditId(e.id); setFTitle(e.title); setFType(e.type); setFTheme(e.theme_id||null); setFPersons(e.person_ids||[]); setFDate(e.date); setFEnd(e.end_date&&e.end_date!==e.date?e.end_date:""); setFNotes(e.notes||""); };
  const togglePerson = (id:string) => setFPersons(a => a.includes(id) ? a.filter(x=>x!==id) : [...a,id]);

  const saveEvent = async () => {
    if (!fTitle.trim()) return;
    let start=fDate, end:string|null = fEnd && fEnd>fDate ? fEnd : null;
    if (fEnd && fEnd<fDate) { start=fEnd; end=fDate; }
    const row = { title:fTitle.trim(), type:fType, theme_id:fTheme, person_ids:fPersons, date:start, end_date:end, notes:fNotes };
    if (editId) await supabase.from("events").update(row).eq("id", editId);
    else await supabase.from("events").insert(row);
    await fetchEvents();
    setEditId(null); setFTitle(""); setFType("tarea"); setFTheme(null); setFPersons([]); setFEnd(""); setFNotes("");
  };
  const delEvent = async (id:string) => { await supabase.from("events").delete().eq("id", id); await fetchEvents(); };

  const addPerson = async () => { if(!newName.trim()) return; await supabase.from("people").insert({ name:newName.trim(), color:newColor }); setNewName(""); setNewColor(PALETTE[people.length%PALETTE.length]); await fetchPeople(); };
  const delPerson = async (id:string) => { await supabase.from("people").delete().eq("id",id); await fetchPeople(); };
  const setPColor = async (id:string,c:string) => { await supabase.from("people").update({color:c}).eq("id",id); await fetchPeople(); };

  const addTheme = async () => { if(!newThName.trim()) return; await supabase.from("themes").insert({ name:newThName.trim(), color:newThColor, icon:newThIcon }); setNewThName(""); setNewThColor(PALETTE[(themes.length+2)%PALETTE.length]); setNewThIcon("Tag"); await fetchThemes(); };
  const delTheme = async (id:string) => { await supabase.from("themes").delete().eq("id",id); await fetchThemes(); await fetchEvents(); };
  const setThColor = async (id:string,c:string) => { await supabase.from("themes").update({color:c}).eq("id",id); await fetchThemes(); };
  const setThIcon = async (id:string,ic:string) => { await supabase.from("themes").update({icon:ic}).eq("id",id); await fetchThemes(); };

  const sortedList = [...visibleEvents].sort((a,b)=> a.date.localeCompare(b.date) || endOf(a).localeCompare(endOf(b)));
  const fmtDate = (k:string) => { const [y,m,d]=k.split("-").map(Number); return `${d} de ${MONTHS[m-1]} ${y}`; };
  const btn = "rounded-xl px-3 py-2 text-sm font-medium transition";

  const PeopleDots = ({ ids, size=14 }: any) => {
    const ns = namesOf(ids);
    if (ns.length===0) return <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ background:"#bbb" }} />;
    return <span className="flex -space-x-1">{ns.map((p:any)=><span key={p.id} className="rounded-full border border-white" style={{ width:size, height:size, background:p.color }} title={p.name} />)}</span>;
  };
  const ThemeTag = ({ id }: any) => { const t = themeById(id); if(!t) return null; return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs shrink-0" style={{ background:`${t.color}22`, color:t.color }}><Ico name={t.icon} size={11} />{t.name}</span>; };

  const renderRow = (e:any) => {
    const TIcon = TYPES[e.type].icon; const ns = namesOf(e.person_ids); const multi = endOf(e)!==e.date;
    return (
      <div className="flex items-center gap-2 py-2" key={e.id}>
        <div className="w-1.5 h-9 rounded-full shrink-0" style={{ background:colorsToBg(colorsOf(e.person_ids)) }} />
        <div className="w-24 shrink-0 text-xs leading-tight" style={{ color:DARK }}>
          {multi ? <span>{shortDate(e.date)} <span style={{ color:GOLD }}>→</span> {shortDate(endOf(e))}<br /><span style={{ color:"#999" }}>{dayCount(e)} días</span></span> : shortDate(e.date)}
        </div>
        <TIcon size={14} color={GOLD} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color:DARK }}>{e.title}</div>
          {e.notes && <div className="text-xs truncate" style={{ color:"#999" }}>{e.notes}</div>}
        </div>
        {e.theme_id && <span className="hidden sm:inline-flex"><ThemeTag id={e.theme_id} /></span>}
        <div className="hidden md:flex flex-wrap gap-1 justify-end max-w-40 shrink-0">{ns.map((p:any)=><span key={p.id} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background:p.color }}>{p.name}</span>)}</div>
        <span className="md:hidden shrink-0"><PeopleDots ids={e.person_ids} /></span>
        <button onClick={()=>{ openDay(e.date); setTimeout(()=>loadEvent(e),0); }} className="opacity-50 hover:opacity-100"><Pencil size={14} color={DARK} /></button>
        <button onClick={()=>delEvent(e.id)} className="opacity-50 hover:opacity-100"><Trash2 size={14} color="#C77966" /></button>
      </div>
    );
  };

  let groups:any[] = [];
  if (groupBy==="theme") {
    const order = [...themes.map(t=>t.id), null];
    groups = order.map(tid => ({ key:tid||"none", theme:themeById(tid as string), items:sortedList.filter(e=>(e.theme_id||null)===tid) })).filter(g=>g.items.length);
  } else {
    const map:any = {};
    sortedList.forEach(e=>{ const key=e.date.slice(0,7); (map[key]=map[key]||[]).push(e); });
    groups = Object.keys(map).sort().map(key=>({ key, monthLabel:`${MONTHS[Number(key.split("-")[1])-1]} ${key.split("-")[0]}`, items:map[key] }));
  }
  const dayEvents = dayModal ? visibleEvents.filter(e=>inRange(e,dayModal)) : [];

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
            <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ background:"#fff", border:`1px solid ${GOLD}55`, color:DARK }}>
              <option value="all">Todo el equipo</option>{people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filterTheme} onChange={e=>setFilterTheme(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ background:"#fff", border:`1px solid ${GOLD}55`, color:DARK }}>
              <option value="all">Todos los temas</option>{themes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}<option value="none">Sin tema</option>
            </select>
          </div>
        </div>
      )}

      {view !== "minutas" && (
        <div className="flex flex-wrap gap-3 mb-3 text-xs" style={{ color:DARK }}>
          <span className="flex items-center gap-1"><Star size={12} color={GOLD} /> Día importante</span>
          <span className="flex items-center gap-1"><Clock size={12} color={GOLD} /> Deadline</span>
          <span style={{ color:GOLD }}>· Color de fondo = persona · Ícono/etiqueta = tema</span>
        </div>
      )}

      {view==="calendar" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {months.map(({y,m}:any)=><MonthGrid key={`${y}-${m}`} year={y} month={m} events={visibleEvents} colorsOf={colorsOf} themeById={themeById} onDayClick={openDay} />)}
        </div>
      )}

      {view==="list" && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span style={{ color:DARK }}>Agrupar por:</span>
            <button onClick={()=>setGroupBy("month")} className="rounded-lg px-3 py-1" style={{ background:groupBy==="month"?GOLD:"#fff", color:groupBy==="month"?"#fff":DARK, border:`1px solid ${GOLD}55` }}>Mes</button>
            <button onClick={()=>setGroupBy("theme")} className="rounded-lg px-3 py-1" style={{ background:groupBy==="theme"?GOLD:"#fff", color:groupBy==="theme"?"#fff":DARK, border:`1px solid ${GOLD}55` }}>Tema</button>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border:`1px solid ${GOLD}22` }}>
            {groups.length===0 && <p className="text-sm text-center py-6" style={{ color:"#999" }}>Nada apuntado todavía. Pícale a un día en el calendario.</p>}
            {groups.map((g:any)=>(
              <div key={g.key}>
                <div className="text-xs font-semibold mt-3 mb-1 pb-1 flex items-center gap-1.5" style={{ color:g.theme?g.theme.color:GOLD, borderBottom:`1px solid ${(g.theme?g.theme.color:GOLD)}33` }}>
                  {groupBy==="theme" ? (g.theme ? <><Ico name={g.theme.icon} size={13} /> {g.theme.name}</> : "Sin tema") : g.monthLabel}
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
                {dayEvents.map((e:any)=>{ const TIcon=TYPES[e.type].icon; const multi=endOf(e)!==e.date; return (
                  <div key={e.id} className="flex items-center gap-2 rounded-lg p-2" style={{ background:CREAM }}>
                    <div className="w-1.5 h-6 rounded-full" style={{ background:colorsToBg(colorsOf(e.person_ids)) }} />
                    <TIcon size={13} color={GOLD} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block" style={{ color:DARK }}>{e.title}{multi && <span className="text-xs ml-1" style={{ color:GOLD }}>· {shortDate(e.date)}→{shortDate(endOf(e))}</span>}</span>
                      {e.theme_id && <ThemeTag id={e.theme_id} />}
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
              <select value={fType} onChange={e=>setFType(e.target.value)} className="rounded-lg px-2 py-2 text-sm" style={{ background:CREAM, color:DARK }}>{Object.entries(TYPES).map(([k,v]:any)=><option key={k} value={k}>{v.label}</option>)}</select>
              <div>
                <p className="text-xs mb-1" style={{ color:DARK }}>Tema</p>
                <div className="flex flex-wrap gap-1.5">{themes.map(t=>{ const on=fTheme===t.id; return (
                  <button key={t.id} onClick={()=>setFTheme(on?null:t.id)} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition" style={{ background:on?t.color:"#fff", color:on?"#fff":t.color, border:`1.5px solid ${t.color}` }}><Ico name={t.icon} size={11} /> {t.name}</button>); })}</div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1"><label className="text-xs" style={{ color:DARK }}>Del</label><input type="date" value={fDate} onChange={e=>setFDate(e.target.value)} className="w-full rounded-lg px-2 py-2 text-sm" style={{ background:CREAM, color:DARK }} /></div>
                <div className="flex-1"><label className="text-xs" style={{ color:DARK }}>al <span style={{ color:"#999" }}>(opcional)</span></label><input type="date" value={fEnd} min={fDate} onChange={e=>setFEnd(e.target.value)} className="w-full rounded-lg px-2 py-2 text-sm" style={{ background:CREAM, color:DARK }} /></div>
                {fEnd && <button onClick={()=>setFEnd("")} className="rounded-lg px-2 py-2 text-xs mb-0.5" style={{ background:CREAM, color:GOLD }}>1 día</button>}
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color:DARK }}>Asignar a {fPersons.length>0 && <span style={{ color:GOLD }}>({fPersons.length})</span>}</p>
                <div className="flex flex-wrap gap-1.5">{people.map(p=>{ const on=fPersons.includes(p.id); return (
                  <button key={p.id} onClick={()=>togglePerson(p.id)} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition" style={{ background:on?p.color:"#fff", color:on?"#fff":DARK, border:`1.5px solid ${p.color}` }}>{on?<Check size={11} />:<span className="w-2.5 h-2.5 rounded-full" style={{ background:p.color }} />}{p.name}</button>); })}</div>
              </div>
              <textarea value={fNotes} onChange={e=>setFNotes(e.target.value)} placeholder="Notas (opcional)" rows={2} className="rounded-lg px-3 py-2 text-sm outline-none resize-none" style={{ background:CREAM, color:DARK }} />
              <div className="flex gap-2">
                <button onClick={saveEvent} className="flex-1 rounded-xl py-2 text-sm font-medium text-white flex items-center justify-center gap-1" style={{ background:GOLD }}><Plus size={15} /> {editId?"Guardar cambios":"Agregar"}</button>
                {editId && <button onClick={()=>{ setEditId(null); setFTitle(""); setFTheme(null); setFPersons([]); setFEnd(""); setFNotes(""); }} className="rounded-xl px-3 text-sm" style={{ background:CREAM, color:DARK }}>Cancelar</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {themeModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background:"#0006" }} onClick={()=>setThemeModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold flex items-center gap-2" style={{ color:DARK }}><Tag size={17} color={GOLD} /> Temas</h2><button onClick={()=>setThemeModal(false)}><X size={18} color={DARK} /></button></div>
            <div className="flex flex-col gap-2 mb-4">{themes.map(t=>(
              <div key={t.id} className="rounded-lg p-2" style={{ background:CREAM }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{ background:t.color }}><Ico name={t.icon} size={14} color="#fff" /></span>
                  <span className="flex-1 text-sm font-medium" style={{ color:DARK }}>{t.name}</span>
                  <select value={t.icon} onChange={e=>setThIcon(t.id,e.target.value)} className="rounded-lg px-1 py-1 text-xs" style={{ background:"#fff", color:DARK, border:`1px solid ${GOLD}55` }}>{ICON_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
                  <button onClick={()=>delTheme(t.id)}><Trash2 size={14} color="#C77966" /></button>
                </div>
                <div className="flex gap-1 flex-wrap">{PALETTE.map(c=><button key={c} onClick={()=>setThColor(t.id,c)} className="w-4 h-4 rounded-full" style={{ background:c, outline:t.color===c?`2px solid ${DARK}`:"none", outlineOffset:"1px" }} />)}</div>
              </div>))}
            </div>
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop:`1px solid ${GOLD}22` }}>
              <p className="text-xs font-medium" style={{ color:GOLD }}>Agregar tema</p>
              <div className="flex gap-2">
                <input value={newThName} onChange={e=>setNewThName(e.target.value)} placeholder="Nombre del tema" className="flex-1 rounded-lg px-3 py-2 text-sm outline-none" style={{ background:CREAM, color:DARK }} />
                <select value={newThIcon} onChange={e=>setNewThIcon(e.target.value)} className="rounded-lg px-2 py-2 text-xs" style={{ background:CREAM, color:DARK }}>{ICON_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
              </div>
              <div className="flex flex-wrap gap-1.5">{PALETTE.map(c=><button key={c} onClick={()=>setNewThColor(c)} className="w-6 h-6 rounded-full" style={{ background:c, outline:newThColor===c?`2px solid ${DARK}`:"none", outlineOffset:"2px" }} />)}</div>
              <button onClick={addTheme} className="rounded-xl py-2 text-sm font-medium text-white flex items-center justify-center gap-1" style={{ background:GOLD }}><Plus size={15} /> Agregar tema</button>
            </div>
          </div>
        </div>
      )}

      {teamModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background:"#0006" }} onClick={()=>setTeamModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h2 className="font-semibold flex items-center gap-2" style={{ color:DARK }}><Users size={17} color={GOLD} /> Equipo</h2><button onClick={()=>setTeamModal(false)}><X size={18} color={DARK} /></button></div>
            <div className="flex flex-col gap-2 mb-4">{people.map(p=>(
              <div key={p.id} className="flex items-center gap-2 rounded-lg p-2" style={{ background:CREAM }}>
                <div className="w-5 h-5 rounded-full shrink-0" style={{ background:p.color }} />
                <span className="flex-1 text-sm" style={{ color:DARK }}>{p.name}</span>
                <div className="flex gap-1 flex-wrap justify-end">{PALETTE.map(c=><button key={c} onClick={()=>setPColor(p.id,c)} className="w-4 h-4 rounded-full" style={{ background:c, outline:p.color===c?`2px solid ${DARK}`:"none", outlineOffset:"1px" }} />)}</div>
                <button onClick={()=>delPerson(p.id)}><Trash2 size={14} color="#C77966" /></button>
              </div>))}
            </div>
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop:`1px solid ${GOLD}22` }}>
              <p className="text-xs font-medium" style={{ color:GOLD }}>Agregar persona</p>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nombre" className="rounded-lg px-3 py-2 text-sm outline-none" style={{ background:CREAM, color:DARK }} />
              <div className="flex flex-wrap gap-1.5">{PALETTE.map(c=><button key={c} onClick={()=>setNewColor(c)} className="w-6 h-6 rounded-full" style={{ background:c, outline:newColor===c?`2px solid ${DARK}`:"none", outlineOffset:"2px" }} />)}</div>
              <button onClick={addPerson} className="rounded-xl py-2 text-sm font-medium text-white flex items-center justify-center gap-1" style={{ background:GOLD }}><Plus size={15} /> Agregar al equipo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}