"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, X, Trash2, Pencil, CalendarDays, Pin, Users, FileText, Filter } from "lucide-react";

const GOLD = "#B08D57", CREAM = "#F5F0E8", DARK = "#2A2A2A";
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTHS_S = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const SCOPES: any = {
  junta:  { label: "Junta", icon: Users, color: "#6B8CAE" },
  evento: { label: "Evento", icon: Pin, color: "#C77966" },
  mes:    { label: "Mes", icon: CalendarDays, color: "#7C9885" },
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (k: string) => { const [y,m,d] = k.split("-").map(Number); return `${d} ${MONTHS_S[m-1]} ${y}`; };
const fmtMonth = (ym: string) => { if(!ym) return ""; const [y,m] = ym.split("-").map(Number); return `${MONTHS[m-1]} ${y}`; };

export default function Minutas({ events = [] }: any) {
  const [minutes, setMinutes] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [fTitle, setFTitle] = useState("");
  const [fScope, setFScope] = useState("junta");
  const [fEvent, setFEvent] = useState<string | null>(null);
  const [fMonth, setFMonth] = useState("");
  const [fDate, setFDate] = useState(todayISO());
  const [fBody, setFBody] = useState("");

  const fetchMinutes = async () => { const { data } = await supabase.from("minutes").select("*").order("date", { ascending: false }); setMinutes(data || []); };

  useEffect(() => {
    fetchMinutes();
    const ch = supabase.channel("minutes").on("postgres_changes", { event: "*", schema: "public", table: "minutes" }, fetchMinutes).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const eventById = (id: string) => events.find((e: any) => e.id === id);

  const newMinute = () => { setEditId(null); setFTitle(""); setFScope("junta"); setFEvent(null); setFMonth(""); setFDate(todayISO()); setFBody(""); setOpen(true); };
  const editMinute = (m: any) => { setEditId(m.id); setFTitle(m.title); setFScope(m.scope); setFEvent(m.event_id || null); setFMonth(m.month || ""); setFDate(m.date); setFBody(m.body || ""); setOpen(true); };

  const save = async () => {
    if (!fTitle.trim()) return;
    const row = { title: fTitle.trim(), scope: fScope, event_id: fScope === "evento" ? fEvent : null, month: fScope === "mes" ? (fMonth || null) : null, date: fDate, body: fBody };
    if (editId) await supabase.from("minutes").update(row).eq("id", editId);
    else await supabase.from("minutes").insert(row);
    await fetchMinutes();
    setOpen(false);
  };
  const del = async (id: string) => { await supabase.from("minutes").delete().eq("id", id); await fetchMinutes(); };

  const list = filter === "all" ? minutes : minutes.filter(m => m.scope === filter);
  const inp = { background: CREAM, color: DARK } as any;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter size={15} color={GOLD} />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={{ background: "#fff", border: `1px solid ${GOLD}55`, color: DARK }}>
            <option value="all">Todas</option>
            <option value="junta">Juntas</option>
            <option value="evento">De un evento</option>
            <option value="mes">De un mes</option>
          </select>
        </div>
        <button onClick={newMinute} className="rounded-xl px-3 py-2 text-sm font-medium text-white flex items-center gap-1" style={{ background: GOLD }}><Plus size={15} /> Nueva minuta</button>
      </div>

      {list.length === 0 && <p className="text-sm text-center py-10" style={{ color: "#999" }}>Aún no hay minutas. Crea la primera con "Nueva minuta".</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map(m => {
          const sc = SCOPES[m.scope] || SCOPES.junta; const SIcon = sc.icon;
          const ev = m.event_id ? eventById(m.event_id) : null;
          return (
            <div key={m.id} className="rounded-2xl bg-white p-4 shadow-sm flex flex-col" style={{ border: `1px solid ${GOLD}22` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs" style={{ background: `${sc.color}22`, color: sc.color }}><SIcon size={11} /> {sc.label}</span>
                <span className="text-xs" style={{ color: "#999" }}>{fmtDate(m.date)}</span>
                <div className="flex-1" />
                <button onClick={() => editMinute(m)} className="opacity-50 hover:opacity-100"><Pencil size={14} color={DARK} /></button>
                <button onClick={() => del(m.id)} className="opacity-50 hover:opacity-100"><Trash2 size={14} color="#C77966" /></button>
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: DARK }}>{m.title}</h3>
              {m.scope === "evento" && ev && <p className="text-xs mb-1" style={{ color: sc.color }}>📌 {ev.title} · {fmtDate(ev.date)}</p>}
              {m.scope === "mes" && m.month && <p className="text-xs mb-1" style={{ color: sc.color }}>🗓 {fmtMonth(m.month)}</p>}
              {m.body && <p className="text-sm whitespace-pre-wrap" style={{ color: "#555" }}>{m.body}</p>}
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: "#0006" }} onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2" style={{ color: DARK }}><FileText size={17} color={GOLD} /> {editId ? "Editar minuta" : "Nueva minuta"}</h2>
              <button onClick={() => setOpen(false)}><X size={18} color={DARK} /></button>
            </div>
            <div className="flex flex-col gap-2">
              <input value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Título (ej. Junta de planeación, Insights de Junio...)" className="rounded-lg px-3 py-2 text-sm outline-none" style={inp} />
              <div>
                <p className="text-xs mb-1" style={{ color: DARK }}>¿De qué es esta minuta?</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(SCOPES).map(([k, v]: any) => { const on = fScope === k; const I = v.icon; return (
                    <button key={k} onClick={() => setFScope(k)} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs transition" style={{ background: on ? v.color : "#fff", color: on ? "#fff" : v.color, border: `1.5px solid ${v.color}` }}><I size={12} /> {v.label}</button>
                  ); })}
                </div>
              </div>
              {fScope === "evento" && (
                <select value={fEvent || ""} onChange={e => setFEvent(e.target.value || null)} className="rounded-lg px-2 py-2 text-sm" style={inp}>
                  <option value="">Elige un evento...</option>
                  {[...events].sort((a: any, b: any) => a.date.localeCompare(b.date)).map((e: any) => <option key={e.id} value={e.id}>{e.title} — {fmtDate(e.date)}</option>)}
                </select>
              )}
              {fScope === "mes" && (
                <input type="month" value={fMonth} onChange={e => setFMonth(e.target.value)} className="rounded-lg px-2 py-2 text-sm" style={inp} />
              )}
              <div>
                <label className="text-xs" style={{ color: DARK }}>Fecha</label>
                <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="w-full rounded-lg px-2 py-2 text-sm" style={inp} />
              </div>
              <textarea value={fBody} onChange={e => setFBody(e.target.value)} placeholder="Escribe aquí la minuta: acuerdos, insights, pendientes, responsables..." rows={8} className="rounded-lg px-3 py-2 text-sm outline-none resize-y" style={inp} />
              <div className="flex gap-2">
                <button onClick={save} className="flex-1 rounded-xl py-2 text-sm font-medium text-white flex items-center justify-center gap-1" style={{ background: GOLD }}><Plus size={15} /> {editId ? "Guardar cambios" : "Guardar minuta"}</button>
                {editId && <button onClick={() => { del(editId); setOpen(false); }} className="rounded-xl px-3 text-sm" style={{ background: CREAM, color: "#C77966" }}>Eliminar</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}