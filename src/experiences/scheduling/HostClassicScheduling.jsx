import { useState, useRef, useEffect } from "react";

// ── Mock event details (hardcoded for prototype) ──────────
const MOCK_EVENT = {
  title: "Q1 Community Planning Session",
  description: "Quarterly planning session to align on community initiatives and set priorities for the next quarter.",
  hosts: ["You", "Sarah K."],
};

// ── Mock location data ────────────────────────────────────
const LOCATIONS = [
  { id: "loc1", name: "Community Center — Room A", address: "142 Main St", capacity: 40 },
  { id: "loc2", name: "Downtown Library — Meeting Room 3", address: "88 Elm Ave", capacity: 30 },
];

const LOCATION_EVENTS = {
  loc1: {
    recurring: [
      { dayOfWeek: 1, start: 9, end: 11, title: "Yoga class" },
      { dayOfWeek: 1, start: 14, end: 16, title: "Senior social" },
      { dayOfWeek: 3, start: 10, end: 12, title: "Art workshop" },
      { dayOfWeek: 3, start: 13, end: 15, title: "Community meeting" },
      { dayOfWeek: 5, start: 9, end: 10.5, title: "Pilates" },
      { dayOfWeek: 5, start: 18, end: 20, title: "Dance class" },
      { dayOfWeek: 6, start: 10, end: 14, title: "Kids program" },
    ],
    oneOff: [
      { daysFromNow: 3, start: 11, end: 15, title: "Private event" },
      { daysFromNow: 8, start: 9, end: 17, title: "All-day booking" },
      { daysFromNow: 14, start: 13, end: 16, title: "Workshop rental" },
      { daysFromNow: 21, start: 10, end: 12, title: "Board meeting" },
    ],
  },
  loc2: {
    recurring: [
      { dayOfWeek: 1, start: 10, end: 11.5, title: "Book club" },
      { dayOfWeek: 2, start: 14, end: 16, title: "Tutoring session" },
      { dayOfWeek: 2, start: 17, end: 19, title: "ESL class" },
      { dayOfWeek: 4, start: 10, end: 12, title: "Writer's group" },
      { dayOfWeek: 4, start: 15, end: 17, title: "Study group" },
      { dayOfWeek: 6, start: 11, end: 13, title: "Story time" },
    ],
    oneOff: [
      { daysFromNow: 2, start: 9, end: 12, title: "Staff training" },
      { daysFromNow: 5, start: 13, end: 17, title: "Author reading" },
      { daysFromNow: 10, start: 9, end: 17, title: "Maintenance" },
      { daysFromNow: 16, start: 14, end: 18, title: "Community forum" },
      { daysFromNow: 25, start: 10, end: 14, title: "Library board" },
    ],
  },
};

// ── Mock Google Calendar data ─────────────────────────────
const MOCK_EVENTS_WEEKDAY = [
  { start: 9, end: 9.5, title: "Team standup", color: "#4285f4" },
  { start: 10, end: 11, title: "Project sync", color: "#4285f4" },
  { start: 12, end: 13, title: "Lunch", color: "#7986cb" },
  { start: 14, end: 15, title: "Design review", color: "#e67c73" },
  { start: 16, end: 16.5, title: "1:1 with manager", color: "#f4511e" },
];

const MOCK_EVENTS_VARIANTS = [
  [
    { start: 8.5, end: 9.5, title: "Leadership sync", color: "#4285f4" },
    { start: 10, end: 11.5, title: "Sprint planning", color: "#e67c73" },
    { start: 12, end: 13, title: "Lunch", color: "#7986cb" },
    { start: 15, end: 16, title: "Customer call", color: "#f4511e" },
  ],
  [
    { start: 9, end: 9.5, title: "Team standup", color: "#4285f4" },
    { start: 12, end: 13, title: "Lunch", color: "#7986cb" },
    { start: 13.5, end: 14.5, title: "Roadmap review", color: "#e67c73" },
    { start: 15, end: 16.5, title: "Workshop", color: "#0b8043" },
    { start: 17, end: 17.5, title: "Wrap-up", color: "#4285f4" },
  ],
  [
    { start: 10, end: 10.5, title: "Check-in", color: "#4285f4" },
    { start: 12, end: 13, title: "Lunch", color: "#7986cb" },
  ],
  [
    { start: 8, end: 9, title: "Early sync", color: "#f4511e" },
    { start: 9.5, end: 10.5, title: "Product review", color: "#e67c73" },
    { start: 11, end: 12, title: "Interviews", color: "#0b8043" },
    { start: 12, end: 13, title: "Lunch", color: "#7986cb" },
    { start: 13.5, end: 15, title: "Strategy session", color: "#4285f4" },
    { start: 15.5, end: 16.5, title: "Stakeholder update", color: "#e67c73" },
    { start: 17, end: 18, title: "Retro", color: "#f4511e" },
  ],
];

const MOCK_EVENTS_WEEKEND = [
  { start: 10, end: 11, title: "Farmers market", color: "#0b8043" },
];

// ── Constants ─────────────────────────────────────────────
const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM",
];

const DURATIONS = [30, 45, 60, 90, 120, 150, 180];

const SET_COLORS = [
  { bg: "#eaf4fb", border: "#2e86c1", accent: "#2e86c1", light: "#d4eaf8" },
  { bg: "#fef3e2", border: "#e67e22", accent: "#e67e22", light: "#fde8c8" },
  { bg: "#f0e6f6", border: "#8e44ad", accent: "#8e44ad", light: "#e0cced" },
  { bg: "#e8f5e9", border: "#43a047", accent: "#43a047", light: "#c8e6c9" },
  { bg: "#fce4ec", border: "#c62828", accent: "#c62828", light: "#f8bbd0" },
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MODES = [
  { id: "classic", label: "Classic" },
  { id: "smart", label: "Smart Match" },
  { id: "ai", label: "AI Suggest" },
];

const RANK_COLORS = [
  { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", badge: "#F59E0B" },
  { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151", badge: "#9CA3AF" },
  { bg: "#FEF3E2", border: "#D97706", text: "#78350F", badge: "#D97706" },
];

// ── Helper functions ──────────────────────────────────────
function seededRandom(dateKey) {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) { h = ((h << 5) - h + dateKey.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function getMockEventsForDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay();
  if (dow === 0 || dow === 6) {
    return seededRandom(dateKey) % 3 === 0 ? MOCK_EVENTS_WEEKEND : [];
  }
  const seed = seededRandom(dateKey);
  if (seed % 5 === 0) return MOCK_EVENTS_WEEKDAY;
  return MOCK_EVENTS_VARIANTS[seed % MOCK_EVENTS_VARIANTS.length];
}

function formatHour(h) {
  const hr = Math.floor(h);
  const min = h % 1 === 0.5 ? "30" : "00";
  const ampm = hr >= 12 ? "PM" : "AM";
  const display = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${display}:${min} ${ampm}`;
}

function formatTimePrecise(h) {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const ampm = hr >= 12 ? "PM" : "AM";
  const display = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${display}:${String(min).padStart(2, "0")} ${ampm}`;
}

function formatDurationLabel(d) {
  if (d < 60) return `${d} min`;
  return `${Math.floor(d / 60)}${d % 60 ? '.5' : ''} hr${d >= 120 ? 's' : ''}`;
}

function parseTimeToHour(timeStr) {
  if (!timeStr) return 9;
  const [time, ampm] = timeStr.split(" ");
  let [hr, min] = time.split(":").map(Number);
  if (ampm === "PM" && hr !== 12) hr += 12;
  if (ampm === "AM" && hr === 12) hr = 0;
  return hr + min / 60;
}

function computeEndTime(startTimeStr, durationMinutes) {
  const startHr = parseTimeToHour(startTimeStr);
  const endHr = startHr + durationMinutes / 60;
  return formatTimePrecise(endHr);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayKey() {
  const t = new Date();
  return toDateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

function isPast(year, month, day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(year, month, day);
  return d < today;
}

function getSlotAvailabilityInfo(dateKey, startHr, endHr) {
  const events = getMockEventsForDate(dateKey);
  const overlapping = events.filter(e => e.end > startHr && e.start < endHr);

  const items = [];
  let cursor = startHr;
  const sorted = [...overlapping].sort((a, b) => a.start - b.start);
  let totalBusy = 0;

  for (const ev of sorted) {
    const evStart = Math.max(ev.start, startHr);
    const evEnd = Math.min(ev.end, endHr);
    if (evStart > cursor) {
      items.push({ type: "green", label: `${formatHour(cursor)}–${formatHour(evStart)} — Free` });
    }
    items.push({ type: "red", label: `${formatHour(evStart)}–${formatHour(evEnd)} — ${ev.title}` });
    totalBusy += evEnd - Math.max(evStart, cursor);
    cursor = Math.max(cursor, evEnd);
  }
  if (cursor < endHr) {
    items.push({ type: "green", label: `${formatHour(cursor)}–${formatHour(endHr)} — Free` });
  }

  if (items.length === 0) {
    items.push({ type: "green", label: `${formatHour(startHr)}–${formatHour(endHr)} — Free` });
  }

  const slotDuration = endHr - startHr;
  let level;
  if (totalBusy === 0) level = "green";
  else if (totalBusy >= slotDuration - 0.01) level = "red";
  else level = "amber";

  return { level, items };
}

function getLocationEventsForDate(locationId, dateKey) {
  const config = LOCATION_EVENTS[locationId];
  if (!config) return [];
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay();
  const events = [];
  for (const ev of config.recurring) {
    if (ev.dayOfWeek === dow) events.push({ start: ev.start, end: ev.end, title: ev.title });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const ev of config.oneOff) {
    const evDate = new Date(today);
    evDate.setDate(today.getDate() + ev.daysFromNow);
    const evKey = toDateKey(evDate.getFullYear(), evDate.getMonth(), evDate.getDate());
    if (evKey === dateKey) events.push({ start: ev.start, end: ev.end, title: ev.title });
  }
  return events;
}

function getLocationSlotAvail(locationId, dateKey, startHr, endHr) {
  const events = getLocationEventsForDate(locationId, dateKey);
  const overlapping = events.filter(e => e.end > startHr && e.start < endHr);
  if (overlapping.length === 0) return "green";
  const slotDuration = endHr - startHr;
  let totalBusy = 0;
  for (const ev of overlapping) {
    totalBusy += Math.min(ev.end, endHr) - Math.max(ev.start, startHr);
  }
  return totalBusy >= slotDuration - 0.01 ? "red" : "amber";
}

function getLocationOverallAvail(locationId, groupings, durationMinutes) {
  const allDates = groupings.flatMap(g => {
    const startHr = parseTimeToHour(g.startTime);
    const endHr = startHr + durationMinutes / 60;
    return g.dates.map(dateKey => ({
      dateKey,
      time: g.startTime,
      level: getLocationSlotAvail(locationId, dateKey, startHr, endHr),
    }));
  });

  if (allDates.length === 0) return { level: null, dates: [] };
  const greenCount = allDates.filter(d => d.level === "green").length;
  const amberCount = allDates.filter(d => d.level === "amber").length;
  let level;
  if (greenCount === allDates.length) level = "green";
  else if (greenCount + amberCount > 0) level = "amber";
  else level = "red";
  return { level, dates: allDates };
}

function formatDateList(dateKeys) {
  if (dateKeys.length === 0) return "No dates selected";
  const sorted = [...dateKeys].sort();
  return sorted.map((k) => {
    const [y, m, d] = k.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }).join(", ");
}

function createEmptyGrouping() {
  return { id: Date.now(), startTime: "10:00 AM", dates: [] };
}

// ── SVG Icons ─────────────────────────────────────────────
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 4H12M5 4V2.5C5 2.22 5.22 2 5.5 2H8.5C8.78 2 9 2.22 9 2.5V4M10.5 4V11.5C10.5 11.78 10.28 12 10 12H4C3.72 12 3.5 11.78 3.5 11.5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M2 7H16" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M6 1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M12 1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M9 5V9L12 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 16C9 16 15 11.5 15 7C15 3.68629 12.3137 1 9 1C5.68629 1 3 3.68629 3 7C3 11.5 9 16 9 16Z" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="9" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="6.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 15C1 12 3.5 10 6.5 10C9.5 10 12 12 12 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="12.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M14 10.5C15.5 11 17 12.5 17 15" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);
const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2L11.1 6.6L16 7.2L12.5 10.5L13.3 15.4L9 13L4.7 15.4L5.5 10.5L2 7.2L6.9 6.6L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);
const DirectionsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6.7 1.3L10.7 5.3C11.1 5.7 11.1 6.3 10.7 6.7L6.7 10.7C6.3 11.1 5.7 11.1 5.3 10.7L1.3 6.7C0.9 6.3 0.9 5.7 1.3 5.3L5.3 1.3C5.7 0.9 6.3 0.9 6.7 1.3Z" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M4.5 6.5L6 5L7.5 6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 5V8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);

// ── DayPopover (specific time slot) ──────────────────────
function DayPopover({ dateKey, startHr, endHr, style }) {
  const info = getSlotAvailabilityInfo(dateKey, startHr, endHr);
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dayLabel = dt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const bulletColors = { green: "#43a047", amber: "#f9a825", red: "#e53935" };

  return (
    <div style={{ ...styles.popover, ...style }} onClick={(e) => e.stopPropagation()}>
      <div style={styles.popoverHeader}>
        <span style={styles.popoverTitle}>{dayLabel}</span>
        <span style={styles.popoverBadge}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: 4 }}>
            <circle cx="5" cy="5" r="4" stroke="#4285f4" strokeWidth="1.2"/><path d="M5 3V5.5L6.5 6.5" stroke="#4285f4" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Google Calendar
        </span>
      </div>
      <div style={styles.popoverWindow}>
        <span>{formatHour(startHr)} — {formatHour(endHr)}</span>
      </div>
      <ul style={styles.popoverList}>
        {info.items.map((item, i) => (
          <li key={i} style={styles.popoverListItem}>
            <div style={{ ...styles.popoverBullet, background: bulletColors[item.type] }} />
            <span style={styles.popoverItemText}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── CalendarWidget (for specific time slot) ──────────────
function CalendarWidget({ selectedDates, onToggleDate, accentColor, startHr, endHr }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const hoverTimeout = useRef(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const today = todayKey();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };
  const canGoPrev = viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth > now.getMonth());

  const yearOptions = [];
  for (let y = now.getFullYear(); y <= now.getFullYear() + 3; y++) yearOptions.push(y);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handleMouseEnter = (key) => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoveredDate(key), 300);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoveredDate(null), 200);
  };
  useEffect(() => () => clearTimeout(hoverTimeout.current), []);

  const hasSlot = startHr != null && endHr != null;

  return (
    <div style={{ position: "relative" }}>
      <div style={styles.calNavRow}>
        <button onClick={prevMonth} style={{ ...styles.calNavBtn, ...(canGoPrev ? {} : { opacity: 0.3, cursor: "default" }) }} disabled={!canGoPrev}>
          <ChevronLeft />
        </button>
        <button onClick={() => setShowYearPicker(!showYearPicker)} style={styles.calMonthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
          <ChevronDown />
        </button>
        <button onClick={nextMonth} style={styles.calNavBtn}>
          <ChevronRight />
        </button>
      </div>
      {showYearPicker && (
        <div style={styles.yearPickerRow}>
          {yearOptions.map((y) => (
            <button key={y} onClick={() => { setViewYear(y); setShowYearPicker(false); }}
              style={{ ...styles.yearChip, ...(viewYear === y ? styles.yearChipActive : {}) }}>
              {y}
            </button>
          ))}
        </div>
      )}
      <div style={styles.calDayHeaders}>
        {DAYS_OF_WEEK.map((d) => <div key={d} style={styles.calDayHeader}>{d}</div>)}
      </div>
      <div style={styles.calGrid}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} style={styles.calEmpty} />;
          const key = toDateKey(viewYear, viewMonth, day);
          const selected = selectedDates.includes(key);
          const past = isPast(viewYear, viewMonth, day);
          const isToday = key === today;
          const isWeekend = (i % 7 === 0) || (i % 7 === 6);
          const info = !past && hasSlot ? getSlotAvailabilityInfo(key, startHr, endHr) : null;
          const barColor = info ? (info.level === "green" ? "#43a047" : info.level === "amber" ? "#f9a825" : "#e53935") : null;
          return (
            <div key={key} style={{ position: "relative" }}
              onMouseEnter={() => !past && hasSlot && handleMouseEnter(key)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => !past && onToggleDate(key)}
                disabled={past}
                style={{
                  ...styles.calCell,
                  ...(past ? styles.calCellPast : {}),
                  ...(isWeekend && !selected && !past ? styles.calCellWeekend : {}),
                  ...(isToday && !selected ? styles.calCellToday : {}),
                  ...(selected ? { ...styles.calCellSelected, background: accentColor, borderColor: accentColor } : {}),
                  width: "100%",
                  paddingBottom: barColor ? 10 : undefined,
                }}
              >
                {day}
              </button>
              {barColor && (
                <div style={{ ...styles.calBar, background: barColor }} />
              )}
              {hoveredDate === key && !past && (
                <DayPopover dateKey={key} startHr={startHr} endHr={endHr}
                  style={{ position: "absolute", zIndex: 100, left: "50%", transform: "translateX(-50%)", bottom: "calc(100% + 8px)" }}
                />
              )}
            </div>
          );
        })}
      </div>
      {hasSlot && (
        <div style={styles.calLegend}>
          <div style={styles.calLegendItem}><div style={{ ...styles.calLegendBar, background: "#43a047" }} /><span>Free</span></div>
          <div style={styles.calLegendItem}><div style={{ ...styles.calLegendBar, background: "#f9a825" }} /><span>Partial conflict</span></div>
          <div style={styles.calLegendItem}><div style={{ ...styles.calLegendBar, background: "#e53935" }} /><span>Busy</span></div>
        </div>
      )}
    </div>
  );
}

// ── TimeslotGrouping ─────────────────────────────────────
function TimeslotGrouping({ grouping, index, colors, duration, onToggleDate, onChangeStartTime, onRemove, canRemove, collapsed, onExpand }) {
  const startHr = parseTimeToHour(grouping.startTime);
  const endHr = duration ? startHr + duration / 60 : null;
  const endTimeLabel = duration ? computeEndTime(grouping.startTime, duration) : "—";

  if (collapsed) {
    return (
      <div style={{ ...styles.setCard, borderColor: colors.border, background: "#fff", cursor: "pointer" }} onClick={onExpand}>
        <div style={{ ...styles.setHeader, background: colors.bg }}>
          <div style={styles.setHeaderLeft}>
            <div style={{ ...styles.setDot, background: colors.accent }} />
            <span style={styles.setTitle}>Time slot {index + 1}</span>
            <span style={styles.setDateCount}>{grouping.dates.length} date{grouping.dates.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {canRemove && (
              <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={styles.setRemoveBtn}><TrashIcon /></button>
            )}
            <div style={{ color: "#9aa5b4", transform: "rotate(-90deg)", display: "flex" }}><ChevronDown /></div>
          </div>
        </div>
        <div style={styles.collapsedBody}>
          <div style={styles.collapsedRow}>
            <ClockIcon />
            <span style={styles.collapsedText}>{grouping.startTime} — {endTimeLabel}</span>
          </div>
          <div style={styles.collapsedRow}>
            <CalendarIcon />
            <span style={styles.collapsedText}>{formatDateList(grouping.dates)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.setCard, borderColor: colors.border, background: "#fff" }}>
      <div style={{ ...styles.setHeader, background: colors.bg }}>
        <div style={styles.setHeaderLeft}>
          <div style={{ ...styles.setDot, background: colors.accent }} />
          <span style={styles.setTitle}>Time slot {index + 1}</span>
          <span style={styles.setDateCount}>{grouping.dates.length} date{grouping.dates.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {canRemove && (
            <button onClick={onRemove} style={styles.setRemoveBtn}><TrashIcon /></button>
          )}
        </div>
      </div>
      <div style={styles.setSection}>
        <label style={styles.setSectionLabel}>Meeting time</label>
        <div style={styles.timeRange}>
          <div style={styles.timeField}>
            <label style={styles.fieldLabelSmall}>Start</label>
            <div style={styles.selectWrap}>
              <select value={grouping.startTime} onChange={(e) => onChangeStartTime(e.target.value)} style={styles.select}>
                {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <div style={styles.selectArrow}><ChevronDown /></div>
            </div>
          </div>
          <div style={styles.timeDash}>—</div>
          <div style={styles.timeField}>
            <label style={styles.fieldLabelSmall}>End</label>
            <div style={{ ...styles.endTimeDisplay, borderColor: colors.border, background: colors.bg }}>
              {endTimeLabel}
            </div>
          </div>
        </div>
      </div>
      <div style={styles.setSection}>
        <label style={styles.setSectionLabel}>Select dates</label>
        <CalendarWidget
          selectedDates={grouping.dates}
          onToggleDate={onToggleDate}
          accentColor={colors.accent}
          startHr={startHr}
          endHr={endHr}
        />
      </div>
    </div>
  );
}

// ── DirectionsLink ───────────────────────────────────────
function DirectionsLink({ address }) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={styles.directionsLink}>
      <DirectionsIcon /> Directions
    </a>
  );
}

// ── Main Component ───────────────────────────────────────
export default function HostClassicScheduling({ onBack }) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("classic");
  const [duration, setDuration] = useState(null);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [groupings, setGroupings] = useState([createEmptyGrouping()]);
  const [expandedGrouping, setExpandedGrouping] = useState(0);

  // Step 1: Location & Capacity
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [quorum, setQuorum] = useState(5);
  const [capacity, setCapacity] = useState(20);
  const [overflow, setOverflow] = useState(false);

  // Step 2: Rankings
  const [rankings, setRankings] = useState({});
  const [published, setPublished] = useState(false);

  // Default capacity to min of selected locations when entering step 1
  useEffect(() => {
    if (step === 1 && selectedLocations.length > 0) {
      const selectedLocs = LOCATIONS.filter(l => selectedLocations.includes(l.id));
      const minCap = Math.min(...selectedLocs.map(l => l.capacity));
      setCapacity(minCap);
    }
  }, [step]);

  const totalSelectedDates = groupings.reduce((sum, g) => sum + g.dates.length, 0);

  const toggleLocation = (id) => {
    const scrollY = window.scrollY;
    setSelectedLocations((prev) => prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]);
    requestAnimationFrame(() => window.scrollTo(0, scrollY));
  };

  const toggleDateInGrouping = (groupingIndex, dateStr) => {
    setGroupings((prev) => prev.map((g, i) =>
      i === groupingIndex ? { ...g, dates: g.dates.includes(dateStr) ? g.dates.filter(d => d !== dateStr) : [...g.dates, dateStr] } : g
    ));
  };

  const changeStartTime = (groupingIndex, value) => {
    setGroupings((prev) => prev.map((g, i) => i === groupingIndex ? { ...g, startTime: value } : g));
  };

  const addGrouping = () => {
    if (groupings.length < 5) {
      setGroupings((prev) => [...prev, createEmptyGrouping()]);
      setExpandedGrouping(groupings.length);
    }
  };

  const removeGrouping = (index) => {
    setGroupings((prev) => prev.filter((_, i) => i !== index));
    setExpandedGrouping((prev) => {
      if (prev === index) return Math.max(0, index - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  // Compute viable locations
  const viableLocations = selectedLocations.filter(id => {
    const loc = LOCATIONS.find(l => l.id === id);
    return loc && capacity <= loc.capacity;
  });
  const exceededLocations = selectedLocations.map(id => LOCATIONS.find(l => l.id === id)).filter(loc => loc && capacity > loc.capacity);

  // Build all slots for the ranking step
  const allSlots = groupings.flatMap((g, gi) =>
    g.dates.map(dateKey => ({
      key: `${gi}-${dateKey}`,
      groupingIndex: gi,
      dateKey,
      startTime: g.startTime,
      endTime: duration ? computeEndTime(g.startTime, duration) : "—",
      startHr: parseTimeToHour(g.startTime),
      endHr: duration ? parseTimeToHour(g.startTime) + duration / 60 : null,
    }))
  ).sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.startHr - b.startHr);

  const handleRankToggle = (slotKey) => {
    setRankings(prev => {
      if (prev[slotKey] != null) {
        // Remove this rank and re-sequence
        const removedRank = prev[slotKey];
        const next = {};
        for (const [k, v] of Object.entries(prev)) {
          if (k === slotKey) continue;
          next[k] = v > removedRank ? v - 1 : v;
        }
        return next;
      } else {
        // Assign next rank
        const maxRank = Object.values(prev).length > 0 ? Math.max(...Object.values(prev)) : 0;
        return { ...prev, [slotKey]: maxRank + 1 };
      }
    });
  };

  const steps = [
    { label: "Schedule", icon: <CalendarIcon /> },
    { label: "Location", icon: <MapPinIcon /> },
    { label: "Rank", icon: <StarIcon /> },
  ];

  const canAdvance = () => {
    if (step === 0) {
      return duration != null && totalSelectedDates > 0;
    }
    if (step === 1) {
      return selectedLocations.length > 0 && viableLocations.length > 0;
    }
    if (step === 2) {
      return Object.keys(rankings).length > 0;
    }
    return false;
  };

  if (published) {
    const rankedSlots = allSlots
      .filter(s => rankings[s.key] != null)
      .sort((a, b) => rankings[a.key] - rankings[b.key]);

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
            <h2 style={styles.publishedTitle}>Gathering Published!</h2>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#1a2332", margin: "0 0 4px" }}>{MOCK_EVENT.title}</p>
            <p style={styles.publishedSub}>
              {rankedSlots.length} preferred time slot{rankedSlots.length !== 1 ? "s" : ""} ranked across {selectedLocations.length} location{selectedLocations.length !== 1 ? "s" : ""}.
              Invitees will rank their top 3 preferences.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 360, marginBottom: 24 }}>
              {rankedSlots.slice(0, 5).map((slot) => {
                const rank = rankings[slot.key];
                const rc = RANK_COLORS[Math.min(rank - 1, 2)] || RANK_COLORS[2];
                const [y, m, d] = slot.dateKey.split("-").map(Number);
                const dt = new Date(y, m - 1, d);
                const dateLabel = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                return (
                  <div key={slot.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "#f5f7fa", border: "1px solid #e8ecf0" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: rc.badge, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2332" }}>{dateLabel}</div>
                      <div style={{ fontSize: 12, color: "#7a8a9a" }}>{slot.startTime} — {slot.endTime}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button style={{ ...styles.primaryBtn, maxWidth: 240 }} onClick={() => {
              setPublished(false); setStep(0); setDuration(null); setShowCustomDuration(false); setCustomHours(""); setCustomMinutes("");
              setGroupings([createEmptyGrouping()]); setSelectedLocations([]);
              setRankings({}); setQuorum(5); setCapacity(20); setOverflow(false);
            }}>
              Start New Gathering
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          {onBack && (
            <button onClick={onBack} style={styles.backToHub}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginRight: 6 }}>
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              All Experiences
            </button>
          )}
          <div style={styles.logoRow}>
            <div style={styles.logo}>Q</div>
            <span style={styles.logoText}>Quorum</span>
          </div>
          <p style={styles.subtitle}>Schedule your gathering</p>
        </div>

        {/* Step indicator */}
        <div style={styles.stepRow}>
          {steps.map((st, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{ ...styles.stepDot, ...(i < step ? styles.stepDotDone : {}), ...(i === step ? styles.stepDotActive : {}) }}>
                {i < step ? <CheckIcon /> : st.icon}
              </div>
              <span style={{ ...styles.stepLabel, ...(i === step ? styles.stepLabelActive : {}), ...(i < step ? styles.stepLabelDone : {}) }}>
                {st.label}
              </span>
              {i < steps.length - 1 && <div style={{ ...styles.stepLine, ...(i < step ? styles.stepLineDone : {}) }} />}
            </div>
          ))}
        </div>

        <div style={styles.stepContent}>
          {/* Mock event details card — always visible */}
          <div style={styles.eventSummaryCard}>
            <div style={styles.eventSummaryBody}>
              <div style={styles.eventSummaryTitle}>{MOCK_EVENT.title}</div>
              <div style={styles.eventSummaryDesc}>{MOCK_EVENT.description}</div>
              <div style={styles.eventSummaryMeta}>
                <span style={styles.eventSummaryMetaItem}>
                  <UsersIcon />
                  {MOCK_EVENT.hosts.join(", ")}
                </span>
                {duration && (
                  <span style={styles.eventSummaryMetaItem}>
                    <ClockIcon />
                    {formatDurationLabel(duration)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Step 0: Schedule ── */}
          {step === 0 && (
            <div>
              <h3 style={styles.stepTitle}>Choose your time slots</h3>
              <p style={styles.stepDesc}>Pick specific meeting times and select dates for each. Your calendar availability is shown automatically.</p>

              {/* Mode tabs */}
              <div style={styles.modeTabs}>
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => m.id === "classic" && setMode(m.id)}
                    style={{
                      ...styles.modeTab,
                      ...(mode === m.id ? styles.modeTabActive : {}),
                      ...(m.id !== "classic" ? styles.modeTabDisabled : {}),
                    }}
                    disabled={m.id !== "classic"}
                  >
                    {m.label}
                    {m.id !== "classic" && <span style={styles.comingSoonBadge}>Soon</span>}
                  </button>
                ))}
              </div>

              {/* Duration selector */}
              <div style={{ ...styles.durationSection, marginBottom: 20 }}>
                <label style={styles.fieldLabel}>Duration</label>
                <div style={styles.durationGrid}>
                  {DURATIONS.map((d) => (
                    <button key={d} onClick={() => { setDuration(d); setShowCustomDuration(false); setCustomHours(""); setCustomMinutes(""); }} style={{ ...styles.durationChip, ...(!showCustomDuration && duration === d ? styles.durationChipActive : {}) }}>
                      {formatDurationLabel(d)}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setShowCustomDuration(true);
                      // Pre-fill from current custom duration if it was already custom
                      if (duration && !DURATIONS.includes(duration)) {
                        setCustomHours(String(Math.floor(duration / 60)));
                        setCustomMinutes(String(duration % 60));
                      }
                    }}
                    style={{ ...styles.durationChip, ...(showCustomDuration ? styles.durationChipActive : {}) }}
                  >
                    Custom
                  </button>
                </div>
                {showCustomDuration && (
                  <div style={styles.customDurationRow}>
                    <div style={styles.customDurationField}>
                      <label style={styles.fieldLabelSmall}>Hours</label>
                      <input
                        type="number"
                        value={customHours}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") { setCustomHours(""); return; }
                          const n = parseInt(v);
                          if (!isNaN(n) && n >= 0 && n <= 12) setCustomHours(String(n));
                        }}
                        placeholder="0"
                        min="0"
                        max="12"
                        style={styles.customDurationInput}
                      />
                    </div>
                    <span style={styles.customDurationSep}>:</span>
                    <div style={styles.customDurationField}>
                      <label style={styles.fieldLabelSmall}>Minutes</label>
                      <input
                        type="number"
                        value={customMinutes}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") { setCustomMinutes(""); return; }
                          const n = parseInt(v);
                          if (!isNaN(n) && n >= 0 && n <= 59) setCustomMinutes(String(n));
                        }}
                        placeholder="0"
                        min="0"
                        max="59"
                        step="5"
                        style={styles.customDurationInput}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const h = parseInt(customHours) || 0;
                        const m = parseInt(customMinutes) || 0;
                        const total = h * 60 + m;
                        if (total >= 10) setDuration(total);
                      }}
                      style={{
                        ...styles.customDurationApply,
                        ...((parseInt(customHours) || 0) * 60 + (parseInt(customMinutes) || 0) >= 10 ? {} : styles.primaryBtnDisabled),
                      }}
                      disabled={(parseInt(customHours) || 0) * 60 + (parseInt(customMinutes) || 0) < 10}
                    >
                      Apply
                    </button>
                  </div>
                )}
                {showCustomDuration && duration && !DURATIONS.includes(duration) && (
                  <div style={styles.customDurationActive}>
                    <ClockIcon />
                    <span>{formatDurationLabel(duration)}</span>
                  </div>
                )}
              </div>

              {/* Timeslot groupings */}
              <div style={duration ? {} : styles.scheduleDisabled}>
                {groupings.map((g, i) => (
                  <TimeslotGrouping
                    key={g.id}
                    grouping={g}
                    index={i}
                    colors={SET_COLORS[i % SET_COLORS.length]}
                    duration={duration}
                    onToggleDate={(dateStr) => toggleDateInGrouping(i, dateStr)}
                    onChangeStartTime={(val) => changeStartTime(i, val)}
                    onRemove={() => removeGrouping(i)}
                    canRemove={groupings.length > 1}
                    collapsed={i !== expandedGrouping}
                    onExpand={() => setExpandedGrouping(i)}
                  />
                ))}
                {groupings.length < 5 && (
                  <button onClick={addGrouping} style={styles.addSetBtn}>
                    <PlusIcon /> Add another time slot
                  </button>
                )}
              </div>

              {totalSelectedDates > 0 && duration && (
                <div style={styles.setsSummary}>
                  <CalendarIcon />
                  <span>{totalSelectedDates} date{totalSelectedDates !== 1 ? "s" : ""} across {groupings.filter(g => g.dates.length > 0).length} time slot{groupings.filter(g => g.dates.length > 0).length !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Location & Capacity ── */}
          {step === 1 && (
            <div>
              <h3 style={styles.stepTitle}>Where could this happen?</h3>
              <p style={styles.stepDesc}>Locations are matched like participants — Quorum checks their availability for your chosen time slots.</p>

              <div style={styles.locationList}>
                {LOCATIONS.map((loc) => {
                  const selected = selectedLocations.includes(loc.id);
                  const locAvail = totalSelectedDates > 0 ? getLocationOverallAvail(loc.id, groupings, duration) : { level: null, dates: [] };
                  const overallColor = locAvail.level === "green" ? "#43a047" : locAvail.level === "amber" ? "#f9a825" : locAvail.level === "red" ? "#e53935" : null;
                  const overallLabel = locAvail.level === "green" ? "Available for all slots" : locAvail.level === "amber" ? "Partially available" : locAvail.level === "red" ? "No availability" : "Availability synced";
                  return (
                    <div key={loc.id} style={{ ...styles.locationCard, ...(selected ? styles.locationCardSelected : {}), flexDirection: "column", cursor: "pointer" }} onClick={() => toggleLocation(loc.id)}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={styles.locationCheck}>
                          <div style={{ ...styles.checkbox, ...(selected ? styles.checkboxChecked : {}) }}>{selected && <CheckIcon />}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={styles.locationName}>{loc.name}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={styles.locationAddr}>{loc.address}</span>
                            <DirectionsLink address={loc.address} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                            <div style={{ ...styles.locationAvail }}>
                              <span style={{ ...styles.availDot, background: overallColor || "#43a047" }} />
                              {overallLabel}
                            </div>
                            <span style={styles.capacityBadge}>Cap: {loc.capacity}</span>
                          </div>
                        </div>
                      </div>
                      {locAvail.dates.length > 0 && (
                        <div style={styles.locDateList}>
                          {locAvail.dates.map((d) => {
                            const [y, m, day] = d.dateKey.split("-").map(Number);
                            const dt = new Date(y, m - 1, day);
                            const label = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                            const c = d.level === "green" ? "#43a047" : d.level === "amber" ? "#f9a825" : "#e53935";
                            return (
                              <div key={`${d.dateKey}-${d.time}`} style={styles.locDateItem}>
                                <div style={{ ...styles.locDateDot, background: c }} />
                                <span style={styles.locDateLabel}>{label} {d.time}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Capacity section */}
              <div style={{ marginTop: 28 }}>
                <h3 style={{ ...styles.stepTitle, fontSize: 16 }}>Attendance thresholds</h3>
                <p style={styles.stepDesc}>Quorum locks in the gathering once the minimum is reached.</p>
                <div style={styles.capacityRow}>
                  <div style={styles.capacityField}>
                    <label style={styles.fieldLabel}>Quorum <span style={styles.fieldHint}>(minimum)</span></label>
                    <input type="number" value={quorum === "" ? "" : quorum} onChange={(e) => { const v = e.target.value; if (v === "") { setQuorum(""); return; } const n = parseInt(v); if (!isNaN(n)) setQuorum(n); }} onBlur={() => { if (!quorum || quorum < 2) setQuorum(2); }} style={styles.numberInput} min="2" />
                    <p style={styles.fieldNote}>Gathering confirms when this many accept</p>
                  </div>
                  <div style={styles.capacityField}>
                    <label style={styles.fieldLabel}>Capacity <span style={styles.fieldHint}>(maximum)</span></label>
                    <input type="number" value={capacity === "" ? "" : capacity} onChange={(e) => { const v = e.target.value; if (v === "") { setCapacity(""); return; } const n = parseInt(v); if (!isNaN(n)) setCapacity(n); }} onBlur={() => { const min = quorum || 2; if (!capacity || capacity < min) setCapacity(min); }} style={styles.numberInput} min={quorum || 2} />
                    <p style={styles.fieldNote}>Waitlist starts after this number</p>
                  </div>
                </div>

                {exceededLocations.length > 0 && (
                  <div style={{
                    padding: "12px 16px", borderRadius: 12, marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10,
                    border: `1.5px solid ${viableLocations.length === 0 ? "#ffcdd2" : "#ffe0b2"}`,
                    background: viableLocations.length === 0 ? "#fff5f5" : "#fff8f0",
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{viableLocations.length === 0 ? "\u26A0\uFE0F" : "\u2139\uFE0F"}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: viableLocations.length === 0 ? "#c62828" : "#e65100" }}>
                        {viableLocations.length === 0
                          ? "Capacity exceeds all selected locations"
                          : `Capacity exceeds ${exceededLocations.length} of ${selectedLocations.length} location${selectedLocations.length !== 1 ? "s" : ""}`}
                      </div>
                      <div style={{ fontSize: 12, color: "#5a6a7a", lineHeight: 1.6 }}>
                        {exceededLocations.map(loc => (
                          <div key={loc.id}>{loc.name} — max capacity {loc.capacity}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div style={styles.overflowToggle}>
                  <button onClick={() => setOverflow(!overflow)} style={styles.toggleRow}>
                    <div style={{ ...styles.toggle, ...(overflow ? styles.toggleOn : {}) }}>
                      <div style={{ ...styles.toggleKnob, ...(overflow ? styles.toggleKnobOn : {}) }} />
                    </div>
                    <div>
                      <div style={styles.toggleLabel}>Enable overflow gatherings</div>
                      <div style={styles.toggleDesc}>Automatically offer remaining slots to waitlisted invitees.</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Rank Preferences ── */}
          {step === 2 && (
            <div>
              <h3 style={styles.stepTitle}>Rank your preferences</h3>
              <p style={styles.stepDesc}>Click time slots to rank them in order of preference. Your top choices will be prioritized during matching.</p>

              <div style={styles.rankList}>
                {allSlots.map((slot) => {
                  const rank = rankings[slot.key];
                  const isRanked = rank != null;
                  const rc = isRanked ? (RANK_COLORS[Math.min(rank - 1, 2)] || RANK_COLORS[2]) : null;
                  const [y, m, d] = slot.dateKey.split("-").map(Number);
                  const dt = new Date(y, m - 1, d);
                  const dateLabel = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  const colors = SET_COLORS[slot.groupingIndex % SET_COLORS.length];

                  // Location availability for this slot
                  const locAvails = selectedLocations.map(locId => {
                    const loc = LOCATIONS.find(l => l.id === locId);
                    const level = slot.endHr ? getLocationSlotAvail(locId, slot.dateKey, slot.startHr, slot.endHr) : null;
                    return { loc, level };
                  });

                  return (
                    <button key={slot.key} onClick={() => handleRankToggle(slot.key)} style={{
                      ...styles.rankCard,
                      ...(isRanked ? { borderColor: rc.border, background: rc.bg } : {}),
                    }}>
                      <div style={styles.rankBadge}>
                        {isRanked ? (
                          <div style={{ ...styles.rankNumber, background: rc.badge }}>{rank}</div>
                        ) : (
                          <div style={styles.rankEmpty} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ ...styles.rankGroupDot, background: colors.accent }} />
                          <span style={styles.rankDateLabel}>{dateLabel}</span>
                        </div>
                        <div style={styles.rankTimeLabel}>{slot.startTime} — {slot.endTime}</div>
                        <div style={styles.rankLocations}>
                          {locAvails.map(({ loc, level }) => {
                            const c = level === "green" ? "#43a047" : level === "amber" ? "#f9a825" : "#e53935";
                            return (
                              <div key={loc.id} style={styles.rankLocItem}>
                                <div style={{ ...styles.rankLocDot, background: c }} />
                                <span>{loc.name.split("—")[0].trim()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={styles.rankSummary}>
                <span style={{ fontWeight: 600, color: "#1a2332" }}>{Object.keys(rankings).length}</span>
                <span style={{ color: "#7a8a9a" }}> of {allSlots.length} slots ranked</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.navRow}>
          {step > 0 && <button onClick={() => setStep(step - 1)} style={styles.backBtn}>Back</button>}
          <div style={{ flex: 1 }} />
          {step < 2 ? (
            <button onClick={() => canAdvance() && setStep(step + 1)} style={{ ...styles.primaryBtn, ...(canAdvance() ? {} : styles.primaryBtnDisabled) }} disabled={!canAdvance()}>Continue</button>
          ) : (
            <button onClick={() => canAdvance() && setPublished(true)} style={{ ...styles.publishBtn, ...(canAdvance() ? {} : styles.primaryBtnDisabled) }} disabled={!canAdvance()}>Publish Gathering</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────
const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(145deg, #0f1923 0%, #1a2a3a 40%, #0d2137 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", fontFamily: "'DM Sans', 'Avenir', 'Segoe UI', sans-serif" },
  card: { background: "#fff", borderRadius: 20, maxWidth: 660, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)", overflow: "hidden" },
  header: { padding: "32px 32px 20px", borderBottom: "1px solid #f0f0f0" },
  backToHub: { display: "flex", alignItems: "center", background: "none", border: "none", color: "#7a8a9a", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "0 0 14px", fontFamily: "'DM Sans', 'Avenir', 'Segoe UI', sans-serif", transition: "color 0.2s" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  logo: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, letterSpacing: -0.5 },
  logoText: { fontSize: 20, fontWeight: 700, color: "#1a2332", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: "#7a8a9a", margin: "4px 0 0" },

  // Step indicator
  stepRow: { display: "flex", alignItems: "center", padding: "24px 32px 8px", gap: 0 },
  stepItem: { display: "flex", alignItems: "center", flex: 1, gap: 8 },
  stepDot: { width: 36, height: 36, borderRadius: "50%", border: "2px solid #dde3ea", display: "flex", alignItems: "center", justifyContent: "center", color: "#b0bac5", flexShrink: 0, transition: "all 0.3s" },
  stepDotActive: { borderColor: "#2e86c1", color: "#2e86c1", background: "#eaf4fb" },
  stepDotDone: { borderColor: "#43a047", background: "#43a047", color: "#fff" },
  stepLabel: { fontSize: 12, fontWeight: 500, color: "#b0bac5", whiteSpace: "nowrap" },
  stepLabelActive: { color: "#1a2332", fontWeight: 600 },
  stepLabelDone: { color: "#43a047" },
  stepLine: { flex: 1, height: 2, background: "#e8ecf0", margin: "0 8px", borderRadius: 1, transition: "background 0.3s" },
  stepLineDone: { background: "#43a047" },
  stepContent: { padding: "24px 32px", minHeight: 300 },
  stepTitle: { fontSize: 18, fontWeight: 700, color: "#1a2332", margin: "0 0 6px", letterSpacing: -0.3 },
  stepDesc: { fontSize: 14, color: "#7a8a9a", margin: "0 0 24px", lineHeight: 1.5 },

  // Event summary card
  eventSummaryCard: { borderRadius: 14, border: "1.5px solid #e0e5eb", background: "#f5f7fa", marginBottom: 20, overflow: "hidden" },
  eventSummaryBody: { padding: "14px 18px" },
  eventSummaryTitle: { fontSize: 16, fontWeight: 700, color: "#1a2332", letterSpacing: -0.2, marginBottom: 4 },
  eventSummaryDesc: { fontSize: 13, color: "#5a6a7a", lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  eventSummaryMeta: { display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#7a8a9a" },
  eventSummaryMetaItem: { display: "flex", alignItems: "center", gap: 5 },

  // Mode tabs
  modeTabs: { display: "flex", gap: 8, marginBottom: 20 },
  modeTab: { padding: "9px 20px", borderRadius: 10, border: "1.5px solid #e0e5eb", background: "#fafbfc", fontSize: 13, fontWeight: 600, color: "#4a5568", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', 'Avenir', 'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 6 },
  modeTabActive: { borderColor: "#2e86c1", background: "#eaf4fb", color: "#1a5276" },
  modeTabDisabled: { opacity: 0.5, cursor: "default" },
  comingSoonBadge: { fontSize: 10, fontWeight: 700, color: "#9aa5b4", background: "#eef1f5", padding: "2px 6px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5 },

  // Duration
  durationSection: { padding: "18px 20px", borderRadius: 14, border: "1.5px solid #e0e5eb", background: "#fafbfc" },
  durationGrid: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 },
  durationChip: { padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e0e5eb", background: "#fafbfc", fontSize: 14, fontWeight: 500, color: "#4a5568", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" },
  durationChipActive: { borderColor: "#2e86c1", background: "#eaf4fb", color: "#1a5276", fontWeight: 600 },
  customDurationRow: { display: "flex", alignItems: "flex-end", gap: 10, marginTop: 14, padding: "14px 16px", background: "#fff", borderRadius: 12, border: "1.5px solid #d4eaf8" },
  customDurationField: { flex: 1 },
  customDurationInput: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e5eb", fontSize: 15, fontWeight: 500, color: "#1a2332", outline: "none", fontFamily: "inherit", background: "#fafbfc", textAlign: "center", boxSizing: "border-box" },
  customDurationSep: { paddingBottom: 12, fontSize: 18, fontWeight: 600, color: "#b0bac5" },
  customDurationApply: { padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 },
  customDurationActive: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "8px 14px", background: "#eaf4fb", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#1a5276" },
  scheduleDisabled: { opacity: 0.35, pointerEvents: "none", filter: "grayscale(0.5)" },

  // Shared field styles
  fieldLabel: { fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 },
  fieldLabelSmall: { fontSize: 12, fontWeight: 600, color: "#6a7585", display: "block", marginBottom: 4 },
  fieldHint: { fontWeight: 400, color: "#9aa5b4" },
  fieldNote: { fontSize: 12, color: "#9aa5b4", marginTop: 6 },
  numberInput: { width: 90, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e5eb", fontSize: 15, fontWeight: 500, color: "#1a2332", outline: "none", fontFamily: "inherit", background: "#fafbfc" },

  // Timeslot grouping / set card
  setCard: { borderRadius: 14, border: "1.5px solid #e0e5eb", marginBottom: 16, overflow: "hidden" },
  setHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" },
  setHeaderLeft: { display: "flex", alignItems: "center", gap: 10 },
  setDot: { width: 10, height: 10, borderRadius: "50%" },
  setTitle: { fontSize: 13, fontWeight: 700, color: "#1a2332" },
  setDateCount: { fontSize: 12, color: "#7a8a9a", fontWeight: 500 },
  setRemoveBtn: { padding: "6px 8px", borderRadius: 8, border: "none", background: "transparent", color: "#b0bac5", cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.2s" },
  collapsedBody: { padding: "10px 16px 12px", display: "flex", flexDirection: "column", gap: 6 },
  collapsedRow: { display: "flex", alignItems: "center", gap: 8, color: "#5a6a7a", fontSize: 13 },
  collapsedText: { lineHeight: 1.4 },
  setSection: { padding: "14px 16px" },
  setSectionLabel: { fontSize: 12, fontWeight: 600, color: "#6a7585", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  addSetBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 20px", borderRadius: 12, border: "2px dashed #d0d8e0", background: "transparent", fontSize: 14, fontWeight: 600, color: "#6a7585", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", marginBottom: 16 },
  setsSummary: { display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#f5f7fa", borderRadius: 10, fontSize: 13, color: "#5a6a7a", lineHeight: 1.4 },

  // Time range
  timeRange: { display: "flex", alignItems: "flex-end", gap: 12 },
  timeField: { flex: 1 },
  timeDash: { paddingBottom: 12, color: "#b0bac5", fontWeight: 500 },
  selectWrap: { position: "relative" },
  select: { width: "100%", padding: "10px 36px 10px 14px", borderRadius: 10, border: "1.5px solid #e0e5eb", fontSize: 14, fontWeight: 500, color: "#1a2332", background: "#fafbfc", appearance: "none", outline: "none", fontFamily: "inherit", cursor: "pointer" },
  selectArrow: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9aa5b4", pointerEvents: "none" },
  endTimeDisplay: { padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e5eb", fontSize: 14, fontWeight: 600, color: "#1a5276" },

  // Calendar
  calNavRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calNavBtn: { width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e0e5eb", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", transition: "all 0.15s", fontFamily: "inherit" },
  calMonthLabel: { fontSize: 15, fontWeight: 700, color: "#1a2332", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", fontFamily: "inherit", padding: "4px 8px", borderRadius: 8, transition: "background 0.15s" },
  yearPickerRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 },
  yearChip: { padding: "6px 16px", borderRadius: 8, border: "1.5px solid #e0e5eb", background: "#fafbfc", fontSize: 13, fontWeight: 600, color: "#4a5568", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  yearChipActive: { borderColor: "#2e86c1", background: "#eaf4fb", color: "#1a5276" },
  calDayHeaders: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 },
  calDayHeader: { textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9aa5b4", textTransform: "uppercase", padding: "4px 0" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 },
  calEmpty: { aspectRatio: "1", minHeight: 36 },
  calCell: { aspectRatio: "1", minHeight: 36, borderRadius: 8, border: "1.5px solid #e8ecf0", background: "#fff", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#1a2332", display: "flex", alignItems: "center", justifyContent: "center" },
  calCellPast: { opacity: 0.3, cursor: "default", background: "#f5f5f5" },
  calCellWeekend: { background: "#f9f9fb", borderColor: "#eaeaea" },
  calCellToday: { borderColor: "#2e86c1", borderWidth: 2 },
  calCellSelected: { color: "#fff", borderWidth: 2 },
  calBar: { position: "absolute", bottom: 2, left: 3, right: 3, height: 3, borderRadius: 2 },
  calLegend: { display: "flex", gap: 14, marginTop: 10, justifyContent: "center" },
  calLegendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#7a8a9a" },
  calLegendBar: { width: 16, height: 3, borderRadius: 2 },

  // Popover
  popover: { width: 260, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)", padding: 0, overflow: "hidden", cursor: "default" },
  popoverHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f0f0f0", background: "#fafbfc" },
  popoverTitle: { fontSize: 13, fontWeight: 700, color: "#1a2332" },
  popoverBadge: { display: "flex", alignItems: "center", fontSize: 10, color: "#4285f4", fontWeight: 600, background: "#e8f0fe", padding: "2px 8px", borderRadius: 10 },
  popoverWindow: { padding: "6px 14px", background: "#f5f7fa", fontSize: 11, color: "#6a7585", fontWeight: 600, borderBottom: "1px solid #f0f0f0" },
  popoverList: { listStyle: "none", padding: "8px 14px 10px", margin: 0, display: "flex", flexDirection: "column", gap: 5 },
  popoverListItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#1a2332", lineHeight: 1.3 },
  popoverBullet: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  popoverItemText: { fontSize: 11, color: "#4a5568" },

  // Location
  locationList: { display: "flex", flexDirection: "column", gap: 12 },
  locationCard: { display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderRadius: 14, border: "1.5px solid #e8ecf0", background: "#fafbfc", cursor: "pointer", transition: "all 0.2s", textAlign: "left", fontFamily: "inherit" },
  locationCardSelected: { borderColor: "#2e86c1", background: "#eaf4fb" },
  locationCheck: { paddingTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 6, border: "2px solid #ccd3dc", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all 0.2s" },
  checkboxChecked: { borderColor: "#2e86c1", background: "#2e86c1" },
  locationName: { fontSize: 14, fontWeight: 600, color: "#1a2332", marginBottom: 2 },
  locationAddr: { fontSize: 13, color: "#7a8a9a" },
  locationAvail: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5a6a7a", fontWeight: 500 },
  availDot: { width: 7, height: 7, borderRadius: "50%", background: "#43a047" },
  capacityBadge: { fontSize: 11, color: "#7a8a9a", fontWeight: 600, background: "#eef1f5", padding: "2px 8px", borderRadius: 6 },
  locDateList: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid #eef1f5" },
  locDateItem: { display: "flex", alignItems: "center", gap: 5, padding: "3px 10px 3px 7px", borderRadius: 8, background: "#f5f7fa", fontSize: 11, color: "#4a5568" },
  locDateDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  locDateLabel: { whiteSpace: "nowrap" },
  directionsLink: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#2e86c1", textDecoration: "none", padding: "2px 0", borderBottom: "1px dashed #2e86c1", transition: "opacity 0.15s", lineHeight: 1 },

  // Capacity
  capacityRow: { display: "flex", gap: 24, marginBottom: 24 },
  capacityField: { flex: 1 },
  overflowToggle: { marginBottom: 24 },
  toggleRow: { display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderRadius: 14, border: "1.5px solid #e8ecf0", background: "#fafbfc", cursor: "pointer", textAlign: "left", fontFamily: "inherit", width: "100%" },
  toggle: { width: 44, height: 24, borderRadius: 12, background: "#d5dbe3", position: "relative", flexShrink: 0, transition: "background 0.2s", marginTop: 2 },
  toggleOn: { background: "#2e86c1" },
  toggleKnob: { width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" },
  toggleKnobOn: { left: 22 },
  toggleLabel: { fontSize: 14, fontWeight: 600, color: "#1a2332", marginBottom: 4 },
  toggleDesc: { fontSize: 13, color: "#7a8a9a", lineHeight: 1.5 },

  // Rank step
  rankList: { display: "flex", flexDirection: "column", gap: 10 },
  rankCard: { display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderRadius: 14, border: "1.5px solid #e8ecf0", background: "#fafbfc", cursor: "pointer", transition: "all 0.2s", textAlign: "left", fontFamily: "'DM Sans', 'Avenir', 'Segoe UI', sans-serif", width: "100%" },
  rankBadge: { flexShrink: 0, paddingTop: 2 },
  rankNumber: { width: 28, height: 28, borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 },
  rankEmpty: { width: 28, height: 28, borderRadius: "50%", border: "2px dashed #ccd3dc", display: "flex", alignItems: "center", justifyContent: "center" },
  rankGroupDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  rankDateLabel: { fontSize: 14, fontWeight: 600, color: "#1a2332" },
  rankTimeLabel: { fontSize: 13, color: "#5a6a7a", marginBottom: 6 },
  rankLocations: { display: "flex", flexWrap: "wrap", gap: 8 },
  rankLocItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#5a6a7a" },
  rankLocDot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  rankSummary: { marginTop: 16, padding: "12px 16px", background: "#f5f7fa", borderRadius: 10, fontSize: 13, textAlign: "center" },

  // Navigation
  navRow: { display: "flex", alignItems: "center", padding: "16px 32px 28px", gap: 12 },
  backBtn: { padding: "11px 24px", borderRadius: 10, border: "1.5px solid #e0e5eb", background: "#fff", fontSize: 14, fontWeight: 600, color: "#4a5568", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" },
  primaryBtn: { padding: "11px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(26,82,118,0.25)" },
  primaryBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  publishBtn: { padding: "11px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #1e7e34 0%, #43a047 100%)", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(30,126,52,0.25)" },

  // Published state
  publishedState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 32px", textAlign: "center" },
  publishedIcon: { marginBottom: 20 },
  publishedTitle: { fontSize: 22, fontWeight: 700, color: "#1a2332", margin: "0 0 10px" },
  publishedSub: { fontSize: 15, color: "#7a8a9a", lineHeight: 1.6, maxWidth: 400, margin: "0 0 24px" },
};
