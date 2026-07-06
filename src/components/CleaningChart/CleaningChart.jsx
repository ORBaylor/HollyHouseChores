import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════════
   DATE / WEEK HELPERS
══════════════════════════════════════════════════════════════════ */
function getTodayString() {
  return new Date().toISOString().split("T")[0]; // "2026-07-05"
}

function getISOWeekKey() {
  const now = new Date();
  const tmp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${weekNo}`;
}

function dailyKey(person, idx)  { return `chore_d_${person}_${idx}_${getTodayString()}`; }
function weeklyKey(person, idx) { return `chore_w_${person}_${idx}_${getISOWeekKey()}`; }

function readLS(key)        { try { return localStorage.getItem(key) === "1"; } catch { return false; } }
function writeLS(key, val)  { try { localStorage.setItem(key, val ? "1" : "0"); } catch {} }

/* ══════════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════ */
const DAYS    = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const UP_DAYS = [0, 2, 4];
const DN_DAYS = [1, 3, 5, 6];

const WEEKS = {
  1: {
    up: [
      {
        person: "Miranda", role: "Bathroom",
        daily:  [{ icon:"faucet",  text:"Wipe the faucet" }, { icon:"toilet", text:"Wipe outside of toilet" },
                 { icon:"button",  text:"Wipe the flush button" }, { icon:"seat", text:"Wipe the top of the seat" },
                 { icon:"broom",   text:"Sweep bathroom floor" }],
        weekly: [{ icon:"shower",  text:"Clean shower & curtain" }],
        kitchen: null,
      },
      {
        person: "Ariel", role: "Floor",
        daily:  [{ icon:"broom",   text:"Sweep: Front door → Kitchen" }],
        weekly: [{ icon:"mop",     text:"Mop floor & bathroom" }],
        kitchen: UP_DAYS,
      },
    ],
    dn: [
      {
        person: "Brandon", role: "Bathroom",
        daily:  [{ icon:"faucet",  text:"Wipe the faucet" }, { icon:"toilet", text:"Wipe outside of toilet" },
                 { icon:"button",  text:"Wipe the flush button" }, { icon:"seat", text:"Wipe the top of the seat" },
                 { icon:"broom",   text:"Sweep bathroom floor" }],
        weekly: [{ icon:"shower",  text:"Clean shower & curtain" }],
        kitchen: null,
      },
      {
        person: "Omar", role: "Floor",
        daily:  [{ icon:"broom",   text:"Sweep: Back door → Garage" }],
        weekly: [{ icon:"mop",     text:"Mop floor & bathroom" }],
        kitchen: DN_DAYS,
      },
    ],
    kUp: "Ariel", kDn: "Omar",
  },
  2: {
    up: [
      {
        person: "Ariel", role: "Bathroom",
        daily:  [{ icon:"faucet",  text:"Wipe the faucet" }, { icon:"toilet", text:"Wipe outside of toilet" },
                 { icon:"button",  text:"Wipe the flush button" }, { icon:"seat", text:"Wipe the top of the seat" },
                 { icon:"broom",   text:"Sweep bathroom floor" }],
        weekly: [{ icon:"shower",  text:"Clean shower & curtain" }],
        kitchen: null,
      },
      {
        person: "Miranda", role: "Floor",
        daily:  [{ icon:"broom",   text:"Sweep: Front door → Kitchen" }],
        weekly: [{ icon:"mop",     text:"Mop floor & bathroom" }],
        kitchen: UP_DAYS,
      },
    ],
    dn: [
      {
        person: "Omar", role: "Bathroom",
        daily:  [{ icon:"faucet",  text:"Wipe the faucet" }, { icon:"toilet", text:"Wipe outside of toilet" },
                 { icon:"button",  text:"Wipe the flush button" }, { icon:"seat", text:"Wipe the top of the seat" },
                 { icon:"broom",   text:"Sweep bathroom floor" }],
        weekly: [{ icon:"shower",  text:"Clean shower & curtain" }],
        kitchen: null,
      },
      {
        person: "Brandon", role: "Floor",
        daily:  [{ icon:"broom",   text:"Sweep: Back door → Garage" }],
        weekly: [{ icon:"mop",     text:"Mop floor & bathroom" }],
        kitchen: DN_DAYS,
      },
    ],
    kUp: "Miranda", kDn: "Brandon",
  },
};

const BATHROOM_SUPPLIES = [
  { icon:"wipe",     label:"Clorox Wipe",              color:"#2a6d99" },
  { icon:"scrubber", label:"Electric Shower Scrubber",  color:"#2a6d99" },
  { icon:"foam",     label:"Foaming Shower Scrub",      color:"#2a6d99" },
];
const FLOOR_SUPPLIES = [
  { icon:"purpleSwiffer", label:"Purple Swiffer (Mopping/Sweeping)",  color:"#7c3aed" },
  { icon:"greenSwiffer",  label:"Green Swiffer (Sweeping)",   color:"#15803d" },
  { icon:"mopBucket",     label:"Mop & Bucket",    color:"#8a5a10" },
];

const roleMeta = {
  Bathroom: { bg:"#eef6fb", text:"#2a6d99", border:"#c5dff0", dot:"#4a9fd4" },
  Floor:    { bg:"#fdf4e7", text:"#8a5a10", border:"#f0d49a", dot:"#d4930a" },
};

/* ══════════════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════════════ */
function Icon({ name, color="#888", size=22 }) {
  const s = { width:size, height:size, flexShrink:0 };
  switch(name) {
    case "faucet":     return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M4 11h16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M6 11c0 4 2.5 7 6 7s6-3 6-7" stroke={color} strokeWidth="1.5"/><path d="M9 11V6a1 1 0 011-1h1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="5" r="1" fill={color}/></svg>;
    case "toilet":     return <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="8" height="5" rx="1.5" stroke={color} strokeWidth="1.5"/><path d="M5 10c0-1 1-2 2-2h8c1 0 2 1 2 2v2c0 3-2 7-6 7s-6-4-6-7v-2z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
    case "button":     return <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="5" y="5" width="14" height="14" rx="4" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="12" r="3" fill={color}/></svg>;
    case "seat":       return <svg style={s} viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="13" rx="7" ry="8" stroke={color} strokeWidth="1.5"/><ellipse cx="12" cy="13" rx="3.6" ry="5" stroke={color} strokeWidth="1.2"/></svg>;
    case "broom":      return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M14 3l6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M14 3L7 10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M7 10l-3 7c-.3.7.4 1.4 1.1 1.1l7-3" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/><path d="M4 17l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
    case "mop":        return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M12 3v10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M7 21c0-3 2-5 5-5s5 2 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M7 21l1-3M10 21l.5-3M14 21l-.5-3M17 21l-1-3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
    case "shower":     return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M4 14a8 8 0 0116 0" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="6" r="2" stroke={color} strokeWidth="1.5"/><path d="M12 8v6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="17" r="1" fill={color}/><circle cx="12" cy="18" r="1" fill={color}/><circle cx="16" cy="17" r="1" fill={color}/></svg>;
    case "wipe":       return <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="11" rx="2" stroke={color} strokeWidth="1.5"/><path d="M4 8h16" stroke={color} strokeWidth="1.5"/><path d="M9 17l1.5 3h3L15 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "scrubber":   return <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="10" rx="3" stroke={color} strokeWidth="1.5"/><path d="M12 13v5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><ellipse cx="12" cy="19" rx="4" ry="2" stroke={color} strokeWidth="1.3"/><path d="M7 7h2M15 7h2" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>;
    case "foam":       return <svg style={s} viewBox="0 0 24 24" fill="none"><rect x="7" y="9" width="10" height="12" rx="2" stroke={color} strokeWidth="1.5"/><path d="M10 9V7a2 2 0 014 0v2" stroke={color} strokeWidth="1.5"/><circle cx="9" cy="5" r="1.2" fill={color} opacity="0.6"/><circle cx="12" cy="4" r="1.5" fill={color} opacity="0.7"/><circle cx="15" cy="5" r="1.2" fill={color} opacity="0.6"/><path d="M10 14h4M10 17h4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>;
    case "purpleSwiffer": return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 5l10 10" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/><rect x="13" y="13" width="7" height="4" rx="1.5" transform="rotate(45 13 13)" stroke="#7c3aed" strokeWidth="1.5" fill="#ede9fe"/><path d="M15 16l2 2" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round"/></svg>;
    case "greenSwiffer":  return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M5 5l10 10" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/><rect x="13" y="13" width="7" height="4" rx="1.5" transform="rotate(45 13 13)" stroke="#15803d" strokeWidth="1.5" fill="#dcfce7"/><path d="M15 16l2 2" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round"/></svg>;
    case "mopBucket":     return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M13 3v8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M9 14c0-2 1.8-3 4-3s4 1 4 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M9 14l1-2.5M12 14l.3-2.5M15 14l-.5-2.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/><rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5"/><path d="M4 17h6" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>;
    case "speaker":    return <svg style={s} viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 5V4L8 9H4z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill={color}/><path d="M16.5 8.5a5 5 0 010 7" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><path d="M19 6a8.5 8.5 0 010 12" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/></svg>;
    default: return null;
  }
}

/* ══════════════════════════════════════════════════════════════════
   TTS
══════════════════════════════════════════════════════════════════ */
function buildSpokenText(p) {
  const daily  = p.daily.map(t => t.text).join(". ");
  const weekly = p.weekly.map(t => t.text).join(". ");
  const kit    = p.kitchen ? `Kitchen floor days: ${DAYS.filter((_,i) => p.kitchen.includes(i)).join(", ")}.` : "";
  return `${p.person}. Daily tasks: ${daily}. Weekly tasks: ${weekly}. ${kit}`;
}
function speak(text) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

/* ══════════════════════════════════════════════════════════════════
   COMPLETION HOOK
══════════════════════════════════════════════════════════════════ */
function useCompletion(person, dailyCount, weeklyCount) {
  const initState = useCallback(() => {
    const d = Array.from({ length: dailyCount },  (_, i) => readLS(dailyKey(person, i)));
    const w = Array.from({ length: weeklyCount }, (_, i) => readLS(weeklyKey(person, i)));
    return { daily: d, weekly: w };
  }, [person, dailyCount, weeklyCount]);

  const [state, setState] = useState(initState);

  // Refresh if person changes (week toggle)
  useEffect(() => { setState(initState()); }, [initState]);

  // Auto-reset check at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const t = setTimeout(() => setState(initState()), msUntilMidnight);
    return () => clearTimeout(t);
  }, [initState]);

  const dailyDone  = state.daily.every(Boolean);
  const weeklyDone = state.weekly.every(Boolean);

  function toggleDaily() {
    const next = !dailyDone;
    state.daily.forEach((_, i) => writeLS(dailyKey(person, i), next));
    setState(prev => ({ ...prev, daily: prev.daily.map(() => next) }));
  }

  function toggleWeekly() {
    const next = !weeklyDone;
    state.weekly.forEach((_, i) => writeLS(weeklyKey(person, i), next));
    setState(prev => ({ ...prev, weekly: prev.weekly.map(() => next) }));
  }

  return { dailyDone, weeklyDone, toggleDaily, toggleWeekly };
}

/* ══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════════ */
function RoleBadge({ role }) {
  const m = roleMeta[role];
  return (
    <span style={{
      fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
      fontFamily:"system-ui,sans-serif", padding:"3px 10px", borderRadius:20,
      background:m.bg, color:m.text, border:`1px solid ${m.border}`,
      display:"flex", alignItems:"center", gap:5,
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot, flexShrink:0 }}/>
      {role}
    </span>
  );
}

function SectionLabel({ text }) {
  return (
    <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#bbb", margin:"10px 0 5px", fontFamily:"system-ui,sans-serif" }}>
      {text}
    </p>
  );
}

function TaskRow({ iconName, text, color, allDone }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"5px 0", borderBottom:"1px solid #f3f1ec" }}>
      <Icon name={iconName} color={allDone ? "#ccc" : color} size={20}/>
      <span style={{
        fontSize:14, fontWeight:600, color: allDone ? "#bbb" : "#222",
        fontFamily:"system-ui,sans-serif", lineHeight:1.3, flex:1,
        textDecoration: allDone ? "line-through" : "none",
        transition:"color 0.2s",
      }}>
        {text}
      </span>
    </div>
  );
}

function BigDoneButton({ allDone, color, onToggle }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        aria-label={allDone ? "Mark as not done" : "Mark done"}
        style={{
          width:36, height:36, borderRadius:"50%",
          border: `2.5px solid ${allDone ? "#16a34a" : color}`,
          background: allDone ? "#16a34a" : "transparent",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.25s", outline:"none", flexShrink:0,
          boxShadow: allDone ? "0 0 0 4px #dcfce7" : "none",
        }}
      >
        {allDone ? (
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M3.5 8.5l3.5 3.5 6.5-6.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M3.5 8.5l3.5 3.5 6.5-6.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
          </svg>
        )}
      </button>
      <span style={{
        fontSize:11, fontWeight:700, fontFamily:"system-ui,sans-serif",
        color: allDone ? "#16a34a" : "#bbb", letterSpacing:"0.04em", textTransform:"uppercase",
        transition:"color 0.25s", whiteSpace:"nowrap",
      }}>
        {allDone ? "✅ Done!" : "Tap when done"}
      </span>
    </div>
  );
}

function KitchenDays({ kitchen, m }) {
  if (!kitchen) return null;
  const dayNames = DAYS.filter((_, i) => kitchen.includes(i));
  return (
    <div style={{ borderTop:"1px solid #f0ede7", paddingTop:8, marginTop:8 }}>
      <SectionLabel text="Kitchen floor days"/>
      <div>
        {dayNames.map(d => (
          <span key={d} style={{
            display:"inline-block", fontSize:11, fontWeight:600, fontFamily:"system-ui,sans-serif",
            padding:"3px 8px", borderRadius:20, marginRight:4, marginBottom:4,
            background:m.bg, color:m.text, border:`1px solid ${m.border}`,
          }}>{d}</span>
        ))}
      </div>
    </div>
  );
}

function SupplyRow({ supply }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12, padding:"8px 10px",
      borderRadius:10, background:"#fff", marginBottom:7, border:"1px solid #e8e5df",
    }}>
      <Icon name={supply.icon} color={supply.color} size={26}/>
      <span style={{ fontSize:14, fontWeight:600, fontFamily:"system-ui,sans-serif", color:"#222" }}>
        {supply.label}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PERSON CARD
══════════════════════════════════════════════════════════════════ */
function PersonCard({ p, isFlipped, onToggle }) {
  const m        = roleMeta[p.role];
  const supplies = p.role === "Bathroom" ? BATHROOM_SUPPLIES : FLOOR_SUPPLIES;
  const spoken   = buildSpokenText(p);
  const { dailyDone, weeklyDone, toggleDaily, toggleWeekly } =
    useCompletion(p.person, p.daily.length, p.weekly.length);

  return (
    <div
      style={{ perspective:1400, cursor:"pointer" }}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${p.person} ${p.role} card. Tap to ${isFlipped ? "see tasks" : "see supplies"}.`}
      onKeyDown={e => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); onToggle(); } }}
    >
      <div style={{
        position:"relative", width:"100%", height:430,
        transformStyle:"preserve-3d",
        transition:"transform 0.55s cubic-bezier(.4,.2,.2,1)",
        transform: isFlipped ? "rotateY(180deg)" : "none",
      }}>

        {/* ── FRONT ── */}
        <div style={{
          position:"absolute", inset:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
          borderRadius:14, padding:"16px 18px", background:"#fff", border:"1px solid #e8e5df",
          display:"flex", flexDirection:"column", boxSizing:"border-box", overflowY:"auto",
        }}>
          {/* header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <p style={{ fontFamily:"'Georgia',serif", fontWeight:700, fontSize:17, margin:0, color:"#111" }}>
              {p.person}
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <RoleBadge role={p.role}/>
              <button
                onClick={e => { e.stopPropagation(); speak(spoken); }}
                aria-label="Listen out loud"
                style={{ border:"none", background:"transparent", cursor:"pointer", padding:4, borderRadius:8 }}
              >
                <Icon name="speaker" color={m.text} size={18}/>
              </button>
            </div>
          </div>

          {/* daily section */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:4 }}>
            <SectionLabel text="Daily"/>
            <BigDoneButton allDone={dailyDone} color={m.dot} onToggle={toggleDaily}/>
          </div>
          {p.daily.map((t, i) => (
            <TaskRow key={i} iconName={t.icon} text={t.text} color={m.dot} allDone={dailyDone}/>
          ))}

          {/* weekly section */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
            <SectionLabel text="Weekly"/>
            <BigDoneButton allDone={weeklyDone} color={m.dot} onToggle={toggleWeekly}/>
          </div>
          {p.weekly.map((t, i) => (
            <TaskRow key={i} iconName={t.icon} text={t.text} color={m.dot} allDone={weeklyDone}/>
          ))}

          {/* kitchen days */}
          <KitchenDays kitchen={p.kitchen} m={m}/>

          <p style={{ fontSize:11, color:"#c9c5bc", fontFamily:"system-ui,sans-serif", margin:"auto 0 0", paddingTop:8, textAlign:"right" }}>
            Tap card for supplies ›
          </p>
        </div>

        {/* ── BACK — supplies ── */}
        <div style={{
          position:"absolute", inset:0, backfaceVisibility:"hidden", WebkitBackfaceVisibility:"hidden",
          borderRadius:14, padding:"16px 18px", background:m.bg, border:`1px solid ${m.border}`,
          display:"flex", flexDirection:"column", boxSizing:"border-box",
          transform:"rotateY(180deg)",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <p style={{ fontFamily:"'Georgia',serif", fontWeight:700, fontSize:17, margin:0, color:"#111" }}>
              {p.person}
            </p>
            <RoleBadge role={p.role}/>
          </div>

          <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:m.text, margin:"0 0 10px", fontFamily:"system-ui,sans-serif", opacity:0.7 }}>
            What to use
          </p>

          {supplies.map((s, i) => <SupplyRow key={i} supply={s}/>)}

          <p style={{ fontSize:11, fontFamily:"system-ui,sans-serif", margin:"auto 0 0", color:m.text, opacity:0.6, textAlign:"right" }}>
            ‹ Tap card for tasks
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   WEEK BUTTON
══════════════════════════════════════════════════════════════════ */
function WeekButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"7px 22px", borderRadius:10,
      border: active ? "1.5px solid #333" : "1px solid #ddd",
      background: active ? "#111" : "transparent",
      color: active ? "#fff" : "#888",
      fontSize:13, fontWeight: active ? 700 : 400,
      fontFamily:"system-ui,sans-serif", cursor:"pointer",
      letterSpacing:"0.02em", transition:"all 0.15s",
    }}>{label}</button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   KITCHEN SCHEDULE
══════════════════════════════════════════════════════════════════ */
function KitchenSchedule({ week }) {
  const d = WEEKS[week];
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e5df", borderRadius:14, padding:"18px 20px", marginTop:8 }}>
      <p style={{ fontFamily:"'Georgia',serif", fontWeight:700, fontSize:15, margin:0, color:"#111" }}>
        Kitchen floor sweep schedule
      </p>
      <p style={{ fontSize:12, color:"#aaa", fontFamily:"system-ui,sans-serif", margin:"4px 0 0" }}>
        Floor persons only — every day covered
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:6, marginTop:12 }}>
        {DAYS.map((day, i) => {
          const isUp = UP_DAYS.includes(i);
          const who  = day === "Sun" ? "Omar" : isUp ? d.kUp : d.kDn;
          const bg   = isUp ? "#eef6fb" : "#fdf4e7";
          const tc   = isUp ? "#2a6d99"  : "#8a5a10";
          return (
            <div key={day} style={{ textAlign:"center", background:bg, borderRadius:10, padding:"10px 2px" }}>
              <p style={{ fontSize:11, fontWeight:700, fontFamily:"system-ui,sans-serif", color:tc, margin:"0 0 3px", letterSpacing:"0.04em" }}>{day}</p>
              <p style={{ fontSize:11, fontFamily:"system-ui,sans-serif", color:tc, margin:0 }}>{who}</p>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize:11, color:"#bbb", fontFamily:"system-ui,sans-serif", margin:"10px 0 0" }}>
        Days flip automatically when roles rotate. Omar always covers Sunday.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════════════ */
function getCurrentChartWeek() {
  return Math.ceil(new Date().getDate() / 7) % 2 === 0 ? 2 : 1;
}

export default function CleaningChart() {
  const [week, setWeekState] = useState(getCurrentChartWeek);
  const [flipped, setFlipped] = useState({});
  const d = WEEKS[week];

  function selectWeek(w) { setWeekState(w); setFlipped({}); }
  function toggleFlip(name) { setFlipped(prev => ({ ...prev, [name]: !prev[name] })); }

  const sectionStyle = { fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#999", marginBottom:10, fontFamily:"system-ui,sans-serif" };
  const gridStyle    = { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:12, marginBottom:20 };

  return (
    <div style={{ fontFamily:"'Georgia',serif", background:"#faf9f6", minHeight:"100vh", padding:"2rem 1rem" }}>
      <div style={{ maxWidth:780, margin:"0 auto" }}>

        <div style={{ marginBottom:"2rem" }}>
          <h1 style={{ fontFamily:"'Georgia',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.5px", margin:"0 0 4px", color:"#111" }}>
            Cleaning Chart
          </h1>
          <p style={{ fontSize:13, color:"#888", margin:0, fontFamily:"system-ui,sans-serif" }}>
            Tap the circle to mark a chore done · tap the card to flip for supplies · 🔊 to listen
          </p>
          <div style={{ display:"flex", gap:6, marginTop:20 }}>
            <WeekButton label="Week 1" active={week===1} onClick={() => selectWeek(1)}/>
            <WeekButton label="Week 2" active={week===2} onClick={() => selectWeek(2)}/>
          </div>
        </div>

        <p style={sectionStyle}>⬆ Upstairs</p>
        <div style={gridStyle}>
          {d.up.map(p => (
            <PersonCard key={p.person} p={p} isFlipped={!!flipped[p.person]} onToggle={() => toggleFlip(p.person)}/>
          ))}
        </div>

        <p style={sectionStyle}>⬇ Downstairs</p>
        <div style={gridStyle}>
          {d.dn.map(p => (
            <PersonCard key={p.person} p={p} isFlipped={!!flipped[p.person]} onToggle={() => toggleFlip(p.person)}/>
          ))}
        </div>

        <KitchenSchedule week={week}/>
      </div>
    </div>
  );
}