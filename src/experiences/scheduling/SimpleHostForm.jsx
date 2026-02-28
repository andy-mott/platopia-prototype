import { useState } from "react";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "90 min", value: 90 },
  { label: "2 hr", value: 120 },
  { label: "3 hr", value: 180 },
];

const TIME_OF_DAY = [
  { label: "Morning", value: "morning", hint: "Before noon" },
  { label: "Afternoon", value: "afternoon", hint: "Noon \u2013 5 pm" },
  { label: "Evening", value: "evening", hint: "After 5 pm" },
  { label: "Flexible", value: "flexible", hint: "Any time" },
];

function formatDate(d) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function durationLabel(mins) {
  const d = DURATIONS.find((x) => x.value === mins);
  return d ? d.label : `${mins} min`;
}

// ── Calendar ────────────────────────────────────────────────

function MiniCalendar({ selectedDates, onToggleDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const dateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isSelected = (day) => selectedDates.includes(dateKey(viewYear, viewMonth, day));
  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={styles.cal}>
      <div style={styles.calHeader}>
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          style={{ ...styles.calNav, ...(canGoPrev ? {} : styles.calNavDisabled) }}
        >
          &lsaquo;
        </button>
        <span style={styles.calMonth}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={styles.calNav}>&rsaquo;</button>
      </div>
      <div style={styles.calGrid}>
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} style={styles.calDayLabel}>{d}</div>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <div key={`e${i}`} />
          ) : (
            <button
              key={day}
              disabled={isPast(day)}
              onClick={() => !isPast(day) && onToggleDate(dateKey(viewYear, viewMonth, day))}
              style={{
                ...styles.calDay,
                ...(isPast(day) ? styles.calDayPast : {}),
                ...(isSelected(day) ? styles.calDaySelected : {}),
              }}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function SimpleHostForm({ onBack }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(null);
  const [timePref, setTimePref] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [quorum, setQuorum] = useState(5);
  const [showCapacity, setShowCapacity] = useState(false);
  const [capacity, setCapacity] = useState(20);
  const [published, setPublished] = useState(false);

  const toggleTimePref = (val) => {
    if (val === "flexible") {
      setTimePref(timePref.includes("flexible") ? [] : ["flexible"]);
      return;
    }
    const without = timePref.filter((v) => v !== "flexible");
    setTimePref(
      without.includes(val) ? without.filter((v) => v !== val) : [...without, val]
    );
  };

  const toggleDate = (key) => {
    setSelectedDates((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const canPublish = title.trim() && duration && timePref.length > 0 && selectedDates.length > 0;

  // ── Published state ─────────────────────────────────────

  if (published) {
    const sortedDates = [...selectedDates].sort();
    const displayDates = sortedDates.map((d) => {
      const [y, m, day] = d.split("-").map(Number);
      return formatDate(new Date(y, m - 1, day));
    });

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.publishedState}>
            <div style={styles.publishedIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#E8F5E9" stroke="#43A047" strokeWidth="2"/>
                <path d="M15 25L21 31L33 17" stroke="#43A047" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={styles.publishedTitle}>Gathering Created!</h2>
            <p style={styles.publishedEventName}>{title}</p>
            <p style={styles.publishedSub}>
              Invitees will be asked to rank their preferred dates. Your gathering
              confirms once <strong>{quorum} people</strong> accept.
            </p>
            <div style={styles.publishedDetails}>
              <div style={styles.publishedStat}>
                <span style={styles.publishedStatLabel}>Duration</span>
                <span style={styles.publishedStatValue}>{durationLabel(duration)}</span>
              </div>
              <div style={styles.publishedStatDivider} />
              <div style={styles.publishedStat}>
                <span style={styles.publishedStatLabel}>Dates offered</span>
                <span style={styles.publishedStatValue}>{selectedDates.length}</span>
              </div>
              <div style={styles.publishedStatDivider} />
              <div style={styles.publishedStat}>
                <span style={styles.publishedStatLabel}>Quorum</span>
                <span style={styles.publishedStatValue}>{quorum}</span>
              </div>
              {showCapacity && (
                <>
                  <div style={styles.publishedStatDivider} />
                  <div style={styles.publishedStat}>
                    <span style={styles.publishedStatLabel}>Capacity</span>
                    <span style={styles.publishedStatValue}>{capacity}</span>
                  </div>
                </>
              )}
            </div>
            <div style={styles.publishedDates}>
              <span style={styles.publishedDatesLabel}>Dates:</span>
              <span style={styles.publishedDatesText}>{displayDates.join(" \u00b7 ")}</span>
            </div>
            <div style={styles.publishedTimePref}>
              <span style={styles.publishedDatesLabel}>Time preference:</span>
              <span style={styles.publishedDatesText}>
                {timePref.map((v) => TIME_OF_DAY.find((t) => t.value === v)?.label).join(", ")}
              </span>
            </div>
            <button
              style={styles.primaryBtn}
              onClick={() => {
                setPublished(false);
                setTitle("");
                setDescription("");
                setDuration(null);
                setTimePref([]);
                setSelectedDates([]);
                setQuorum(5);
                setShowCapacity(false);
                setCapacity(20);
              }}
            >
              Start New Gathering
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          {onBack && (
            <button onClick={onBack} style={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Quorum
            </button>
          )}
          <div style={styles.logoRow}>
            <div style={styles.logo}>Q</div>
            <span style={styles.logoText}>Quorum</span>
          </div>
          <p style={styles.subtitle}>Create a gathering</p>
        </div>

        {/* Form body */}
        <div style={styles.body}>

          {/* ─ Title & Description ─ */}
          <div style={styles.section}>
            <label style={styles.label}>
              What's the gathering?
              <span style={styles.required}>*</span>
            </label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Team dinner, Book club, Planning session"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            />
            <textarea
              style={styles.textarea}
              placeholder="Add a short description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              rows={2}
            />
          </div>

          {/* ─ Duration ─ */}
          <div style={styles.section}>
            <label style={styles.label}>How long will it last?</label>
            <div style={styles.chipRow}>
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  style={{
                    ...styles.chip,
                    ...(duration === d.value ? styles.chipActive : {}),
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─ Time of day ─ */}
          <div style={styles.section}>
            <label style={styles.label}>What time of day works?</label>
            <p style={styles.hint}>Select one or more</p>
            <div style={styles.chipRow}>
              {TIME_OF_DAY.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleTimePref(t.value)}
                  style={{
                    ...styles.chip,
                    ...(timePref.includes(t.value) ? styles.chipActive : {}),
                  }}
                >
                  <span>{t.label}</span>
                  <span style={styles.chipHint}>{t.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ─ Date picker ─ */}
          <div style={styles.section}>
            <label style={styles.label}>Pick some dates</label>
            <p style={styles.hint}>Tap dates to add or remove them</p>
            <MiniCalendar selectedDates={selectedDates} onToggleDate={toggleDate} />
            {selectedDates.length > 0 && (
              <div style={styles.selectedSummary}>
                <span style={styles.selectedCount}>{selectedDates.length} date{selectedDates.length !== 1 ? "s" : ""} selected</span>
                <span style={styles.selectedList}>
                  {[...selectedDates].sort().map((d) => {
                    const [y, m, day] = d.split("-").map(Number);
                    return formatDate(new Date(y, m - 1, day));
                  }).join(" \u00b7 ")}
                </span>
              </div>
            )}
          </div>

          {/* ─ Quorum ─ */}
          <div style={styles.section}>
            <label style={styles.label}>
              How many people need to say yes?
            </label>
            <div style={styles.quorumRow}>
              <button
                style={styles.quorumBtn}
                onClick={() => setQuorum(Math.max(2, quorum - 1))}
              >
                &minus;
              </button>
              <span style={styles.quorumValue}>{quorum}</span>
              <button
                style={styles.quorumBtn}
                onClick={() => setQuorum(Math.min(99, quorum + 1))}
              >
                +
              </button>
              <span style={styles.quorumUnit}>people</span>
            </div>
            <p style={styles.quorumHelper}>
              Your gathering confirms once {quorum} invitee{quorum !== 1 ? "s" : ""} accept &mdash; no need to wait for everyone.
            </p>
          </div>

          {/* ─ Optional capacity ─ */}
          <div style={styles.section}>
            <button
              style={styles.toggleRow}
              onClick={() => setShowCapacity(!showCapacity)}
            >
              <div style={{
                ...styles.toggleBox,
                ...(showCapacity ? styles.toggleBoxChecked : {}),
              }}>
                {showCapacity && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={styles.toggleLabel}>Set a maximum capacity</span>
            </button>
            {showCapacity && (
              <div style={styles.capacityRow}>
                <button
                  style={styles.quorumBtn}
                  onClick={() => setCapacity(Math.max(quorum, capacity - 1))}
                >
                  &minus;
                </button>
                <span style={styles.quorumValue}>{capacity}</span>
                <button
                  style={styles.quorumBtn}
                  onClick={() => setCapacity(Math.min(500, capacity + 1))}
                >
                  +
                </button>
                <span style={styles.quorumUnit}>max attendees</span>
              </div>
            )}
          </div>

          {/* ─ Publish button ─ */}
          <button
            onClick={() => canPublish && setPublished(true)}
            disabled={!canPublish}
            style={{
              ...styles.publishBtn,
              ...(!canPublish ? styles.publishBtnDisabled : {}),
            }}
          >
            Create Gathering
          </button>

          {!canPublish && (
            <p style={styles.publishHint}>
              {!title.trim() ? "Add a title" : !duration ? "Pick a duration" : timePref.length === 0 ? "Select a time preference" : "Pick at least one date"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #0f1923 0%, #1a2a3a 40%, #0d2137 100%)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "'DM Sans', 'Avenir', 'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  header: {
    padding: "28px 28px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "none",
    border: "none",
    color: "#7a8a9a",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    padding: "0 0 14px",
    fontFamily: "inherit",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: -0.5,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1a2332",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#7a8a9a",
    margin: "4px 0 0",
  },
  body: {
    padding: "24px 28px 32px",
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#1a2332",
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  required: {
    color: "#e53935",
    marginLeft: 3,
  },
  hint: {
    fontSize: 13,
    color: "#9aa5b4",
    margin: "-4px 0 10px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e0e5eb",
    fontSize: 14,
    fontWeight: 500,
    color: "#1a2332",
    background: "#fafbfc",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e0e5eb",
    fontSize: 14,
    color: "#1a2332",
    background: "#fafbfc",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.5,
    boxSizing: "border-box",
  },

  // Chips
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: 10,
    border: "1.5px solid #e0e5eb",
    background: "#fafbfc",
    fontSize: 14,
    fontWeight: 500,
    color: "#4a5568",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
    gap: 2,
  },
  chipActive: {
    borderColor: "#2e86c1",
    background: "#eaf4fb",
    color: "#1a5276",
    fontWeight: 600,
  },
  chipHint: {
    fontSize: 11,
    fontWeight: 400,
    color: "#9aa5b4",
  },

  // Calendar
  cal: {
    border: "1.5px solid #e0e5eb",
    borderRadius: 14,
    background: "#fafbfc",
    overflow: "hidden",
  },
  calHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #eef1f4",
  },
  calMonth: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1a2332",
  },
  calNav: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid #e0e5eb",
    background: "#fff",
    fontSize: 20,
    color: "#4a5568",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  },
  calNavDisabled: {
    opacity: 0.3,
    cursor: "default",
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    padding: "8px 12px 12px",
    gap: 2,
  },
  calDayLabel: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 600,
    color: "#9aa5b4",
    padding: "4px 0 8px",
    textTransform: "uppercase",
  },
  calDay: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: 500,
    color: "#1a2332",
    background: "none",
    border: "2px solid transparent",
    borderRadius: 8,
    padding: "8px 0",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  calDayPast: {
    color: "#d0d5dc",
    cursor: "default",
  },
  calDaySelected: {
    background: "#eaf4fb",
    borderColor: "#2e86c1",
    color: "#1a5276",
    fontWeight: 700,
  },

  // Selected dates summary
  selectedSummary: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 12,
    padding: "10px 14px",
    background: "#f5f9ff",
    borderRadius: 10,
    border: "1px solid #d4e4f7",
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a5276",
  },
  selectedList: {
    fontSize: 12,
    color: "#5a7a99",
    lineHeight: 1.4,
  },

  // Quorum
  quorumRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  quorumBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1.5px solid #e0e5eb",
    background: "#fff",
    fontSize: 18,
    color: "#4a5568",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
  quorumValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1a2332",
    minWidth: 36,
    textAlign: "center",
  },
  quorumUnit: {
    fontSize: 14,
    color: "#7a8a9a",
    marginLeft: 4,
  },
  quorumHelper: {
    fontSize: 13,
    color: "#7a8a9a",
    lineHeight: 1.5,
    marginTop: 10,
  },

  // Capacity toggle
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    padding: 0,
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid #d0d5dc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  toggleBoxChecked: {
    background: "#2e86c1",
    borderColor: "#2e86c1",
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#4a5568",
  },
  capacityRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    paddingLeft: 32,
  },

  // Publish
  publishBtn: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "opacity 0.2s",
    marginTop: 8,
  },
  publishBtnDisabled: {
    opacity: 0.4,
    cursor: "default",
  },
  publishHint: {
    textAlign: "center",
    fontSize: 13,
    color: "#b0bac5",
    marginTop: 10,
  },

  // Published state
  publishedState: {
    padding: "48px 28px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  publishedIcon: {
    marginBottom: 16,
  },
  publishedTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1a2332",
    margin: "0 0 8px",
  },
  publishedEventName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#1a2332",
    margin: "0 0 8px",
  },
  publishedSub: {
    fontSize: 14,
    color: "#7a8a9a",
    lineHeight: 1.6,
    maxWidth: 380,
    margin: "0 0 24px",
  },
  publishedDetails: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 20px",
    background: "#f5f7fa",
    borderRadius: 12,
    marginBottom: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  publishedStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  publishedStatLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9aa5b4",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  publishedStatValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1a2332",
  },
  publishedStatDivider: {
    width: 1,
    height: 28,
    background: "#e0e5eb",
  },
  publishedDates: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 8,
  },
  publishedTimePref: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginBottom: 20,
  },
  publishedDatesLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#9aa5b4",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  publishedDatesText: {
    fontSize: 14,
    color: "#4a5568",
  },
  primaryBtn: {
    padding: "12px 28px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    maxWidth: 240,
  },
};
