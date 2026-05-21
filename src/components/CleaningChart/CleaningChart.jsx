import { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const UP_DAYS = [0, 2, 4];
const DN_DAYS = [1, 3, 5];

const WEEKS = {
  1: {
    up: [
      {
        person: "Ariel", returns: "--", role: "Bathroom",
        daily: ["Wipe down sink", "Wipe down toilet"],
        weekly: ["Clean shower & curtain"], kitchen: null,
      },
      {
        person: "Miranda", returns: "--", role: "Floor",
        daily: ["Sweep bathroom floor", "Sweep front door → kitchen section"],
        weekly: ["Mop floor section"], kitchen: UP_DAYS,
      },
    ],
    dn: [
      {
        person: "Brandon", returns: "--", role: "Bathroom",
        daily: ["Wipe down sink", "Wipe down toilet"],
        weekly: ["Clean shower & curtain"], kitchen: null,
      },
      {
        person: "Omar", returns: "--", role: "Floor",
        daily: ["Sweep downstairs floor section"],
        weekly: ["Mop floor section"], kitchen: DN_DAYS,
      },
    ],
    kUp: "B", kDn: "D",
  },
  2: {
    up: [
      {
        person: "Ariel", returns: "--", role: "Floor",
        daily: ["Sweep bathroom floor", "Sweep front door → kitchen section"],
        weekly: ["Mop floor section"], kitchen: UP_DAYS,
      },
      {
        person: "Miranda", returns: "--", role: "Bathroom",
        daily: ["Wipe down sink", "Wipe down toilet"],
        weekly: ["Clean shower & curtain"], kitchen: null,
      },
    ],
    dn: [
      {
        person: "Brandon", returns: "--", role: "Floor",
        daily: ["Sweep downstairs floor section"],
        weekly: ["Mop floor section"], kitchen: DN_DAYS,
      },
      {
        person: "Omar", returns: "--", role: "Bathroom",
        daily: ["Wipe down sink", "Wipe down toilet"],
        weekly: ["Clean shower & curtain"], kitchen: null,
      },
    ],
    kUp: "A", kDn: "C",
  },
};

const styles = {
  wrapper: {
    fontFamily: "'Georgia', serif",
    background: "#faf9f6",
    minHeight: "100vh",
    padding: "2rem 1rem",
    color: "#1a1a1a",
  },
  container: {
    maxWidth: 780,
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontFamily: "'Georgia', serif",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    margin: "0 0 4px",
    color: "#111",
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    margin: 0,
    fontFamily: "system-ui, sans-serif",
  },
  weekToggle: {
    display: "flex",
    gap: 6,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#999",
    marginBottom: 10,
    fontFamily: "system-ui, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  card: {
    background: "#fff",
    border: "1px solid #e8e5df",
    borderRadius: 14,
    padding: "18px 20px",
    transition: "box-shadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  personName: {
    fontFamily: "'Georgia', serif",
    fontWeight: 700,
    fontSize: 16,
    margin: 0,
    color: "#111",
  },
  returnTime: {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 16,
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  taskGroupLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#bbb",
    margin: "0 0 6px",
    fontFamily: "system-ui, sans-serif",
  },
  taskItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 13,
    color: "#333",
    padding: "3px 0",
    fontFamily: "system-ui, sans-serif",
    lineHeight: 1.4,
  },
  kitchenDaysBox: {
    borderTop: "1px solid #f0ede7",
    paddingTop: 12,
    marginTop: 12,
  },
  kitchenDayPill: {
    display: "inline-block",
    fontSize: 11,
    fontFamily: "system-ui, sans-serif",
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 20,
    marginRight: 4,
    marginBottom: 4,
  },
  kitchenSection: {
    background: "#fff",
    border: "1px solid #e8e5df",
    borderRadius: 14,
    padding: "18px 20px",
    marginTop: 8,
  },
  kitchenGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    marginTop: 12,
  },
  kitchenCell: {
    textAlign: "center",
    borderRadius: 10,
    padding: "10px 4px",
  },
  kitchenCellDay: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "system-ui, sans-serif",
    margin: "0 0 3px",
    letterSpacing: "0.04em",
  },
  kitchenCellWho: {
    fontSize: 11,
    fontFamily: "system-ui, sans-serif",
    margin: 0,
  },
  note: {
    fontSize: 11,
    color: "#bbb",
    fontFamily: "system-ui, sans-serif",
    margin: "10px 0 0",
  },
};

const roleMeta = {
  Bathroom: {
    bg: "#eef6fb",
    text: "#2a6d99",
    border: "#c5dff0",
    dot: "#4a9fd4",
    checkColor: "#4a9fd4",
  },
  Floor: {
    bg: "#fdf4e7",
    text: "#8a5a10",
    border: "#f0d49a",
    dot: "#d4930a",
    checkColor: "#d4930a",
  },
};

function RoleBadge({ role }) {
  const m = roleMeta[role];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: 20,
        background: m.bg,
        color: m.text,
        border: `1px solid ${m.border}`,
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: m.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {role}
    </span>
  );
}

function CheckIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="7" cy="7" r="6.5" stroke={color} strokeWidth="1" />
      <path d="M4 7l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="#bbb" strokeWidth="1" />
      <path d="M1.5 5.5h11" stroke="#bbb" strokeWidth="1" />
      <path d="M4.5 1v2M9.5 1v2" stroke="#bbb" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5.5" stroke="#ccc" strokeWidth="1" />
      <path d="M6 3.5V6l1.5 1.5" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PersonCard({ p }) {
  const m = roleMeta[p.role];
  const kitchenDayNames = p.kitchen ? DAYS.filter((_, i) => p.kitchen.includes(i)) : [];

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <p style={styles.personName}>{p.person}</p>
        <RoleBadge role={p.role} />
      </div>

      <p style={styles.returnTime}>
        <ClockIcon />
        {p.returns}
      </p>

      <p style={styles.taskGroupLabel}>Daily</p>
      {p.daily.map((t) => (
        <div key={t} style={styles.taskItem}>
          <CheckIcon color={m.checkColor} />
          {t}
        </div>
      ))}

      <p style={{ ...styles.taskGroupLabel, marginTop: 12 }}>Once a week</p>
      {p.weekly.map((t) => (
        <div key={t} style={styles.taskItem}>
          <CalIcon />
          {t}
        </div>
      ))}

      {p.kitchen && (
        <div style={styles.kitchenDaysBox}>
          <p style={styles.taskGroupLabel}>Kitchen floor days</p>
          <div>
            {kitchenDayNames.map((d) => (
              <span
                key={d}
                style={{
                  ...styles.kitchenDayPill,
                  background: m.bg,
                  color: m.text,
                  border: `1px solid ${m.border}`,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeekButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 22px",
        borderRadius: 10,
        border: active ? "1.5px solid #333" : "1px solid #ddd",
        background: active ? "#111" : "transparent",
        color: active ? "#fff" : "#888",
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        fontFamily: "system-ui, sans-serif",
        cursor: "pointer",
        letterSpacing: "0.02em",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function KitchenSchedule({ week }) {
  const d = WEEKS[week];
  return (
    <div style={styles.kitchenSection}>
      <p
        style={{
          fontFamily: "'Georgia', serif",
          fontWeight: 700,
          fontSize: 15,
          margin: 0,
          color: "#111",
        }}
      >
        Kitchen floor sweep schedule
      </p>
      <p style={{ fontSize: 12, color: "#aaa", fontFamily: "system-ui, sans-serif", margin: "4px 0 0" }}>
        Swept by floor persons only — every day covered
      </p>
      <div style={styles.kitchenGrid}>
        {DAYS.map((day, i) => {
          const isUp = UP_DAYS.includes(i);
          let who = "";// ` ${isUp ? (d.kUp == "A" ? "Brandon" : "Omar") : ((d.kDn == "D"  "Ariel" : "Miranda")}`;
          if (isUp) {
            switch (d.kUp) {
              case "A":
                who = "Ariel"
                break;
              case "B":
                who = "Miranda"
                break;

            }
          }
          else {
            switch (d.kDn) {
              case "C":
                who = "Brandon"
                break;
              case "D":
                who = "Omar"
                break;

            }
          }

          if (day == "Sun") {
            who = "Omar";
          }


          const bg = isUp ? "#eef6fb" : "#fdf4e7";
          const tc = isUp ? "#2a6d99" : "#8a5a10";
          return (
            <div key={day} style={{ ...styles.kitchenCell, background: bg }}>
              <p style={{ ...styles.kitchenCellDay, color: tc }}>{day}</p>
              <p style={{ ...styles.kitchenCellWho, color: tc }}>{who}</p>
            </div>
          );
        })}
      </div>
      <p style={styles.note}>Days flip automatically when roles rotate each week.</p>
    </div>
  );
}

export default function CleaningChart() {
  const [week, setWeek] = useState(1);
  const d = WEEKS[week];

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Cleaning Chart</h1>
          <p style={styles.subtitle}>All tasks done after returning home from work</p>
          <div style={styles.weekToggle}>
            <WeekButton label="Week 1" active={week === 1} onClick={() => setWeek(1)} />
            <WeekButton label="Week 2" active={week === 2} onClick={() => setWeek(2)} />
          </div>
        </div>

        <p style={styles.sectionLabel}>⬆ Upstairs</p>
        <div style={styles.grid}>
          {d.up.map((p) => (
            <PersonCard key={p.person} p={p} />
          ))}
        </div>

        <p style={styles.sectionLabel}>⬇ Downstairs</p>
        <div style={styles.grid}>
          {d.dn.map((p) => (
            <PersonCard key={p.person} p={p} />
          ))}
        </div>

        <KitchenSchedule week={week} />
      </div>
    </div>
  );
}
