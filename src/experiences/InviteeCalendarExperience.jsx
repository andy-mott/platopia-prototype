import { useState, useEffect, useRef, useMemo } from "react";
import { COLORS, GRADIENTS, FONTS } from "../shared/styles";

// --- Mock Gathering Data (same as InviteeExperience) ---
const MOCK_GATHERING = {
  title: "Q1 Community Planning Session",
  hostName: "Sarah Chen",
  description: "Quarterly planning session to align on community priorities and resource allocation.",
  duration: 120,
  format: "in-person",
  quorum: 5,
  capacity: 20,
  overflow: true,
  responsesReceived: 3,
  totalInvited: 12,
};

const ALL_LOCATIONS = [
  { name: "Community Center \u2014 Room A", address: "142 Main St" },
  { name: "Downtown Library \u2014 Meeting Room 3", address: "88 Elm Ave" },
];

const MOCK_OPTIONS = [
  { id: "opt-1", date: "2026-03-05", timeStart: "9:00 AM", timeEnd: "11:00 AM", locationName: "Community Center \u2014 Room A", locationAddr: "142 Main St" },
  { id: "opt-2", date: "2026-03-05", timeStart: "9:00 AM", timeEnd: "11:00 AM", locationName: "Downtown Library \u2014 Meeting Room 3", locationAddr: "88 Elm Ave" },
  { id: "opt-3", date: "2026-03-06", timeStart: "9:00 AM", timeEnd: "11:00 AM", locationName: "Community Center \u2014 Room A", locationAddr: "142 Main St" },
  { id: "opt-4", date: "2026-03-06", timeStart: "9:00 AM", timeEnd: "11:00 AM", locationName: "Downtown Library \u2014 Meeting Room 3", locationAddr: "88 Elm Ave" },
  { id: "opt-5", date: "2026-03-10", timeStart: "2:00 PM", timeEnd: "4:00 PM", locationName: "Community Center \u2014 Room A", locationAddr: "142 Main St" },
  { id: "opt-6", date: "2026-03-10", timeStart: "2:00 PM", timeEnd: "4:00 PM", locationName: "Downtown Library \u2014 Meeting Room 3", locationAddr: "88 Elm Ave" },
  { id: "opt-7", date: "2026-03-12", timeStart: "2:00 PM", timeEnd: "4:00 PM", locationName: "Community Center \u2014 Room A", locationAddr: "142 Main St" },
  { id: "opt-8", date: "2026-03-12", timeStart: "2:00 PM", timeEnd: "4:00 PM", locationName: "Downtown Library \u2014 Meeting Room 3", locationAddr: "88 Elm Ave" },
];

const TIMESLOTS = (() => {
  const map = {};
  for (const opt of MOCK_OPTIONS) {
    const key = `${opt.date}|${opt.timeStart}|${opt.timeEnd}`;
    if (!map[key]) {
      map[key] = { id: `ts-${Object.keys(map).length + 1}`, date: opt.date, timeStart: opt.timeStart, timeEnd: opt.timeEnd, locations: [] };
    }
    map[key].locations.push({ name: opt.locationName, address: opt.locationAddr });
  }
  return Object.values(map);
})();

const TIMESLOT_WINDOWS = {
  "ts-1": { windowStart: "8:00 AM", windowEnd: "2:00 PM", hostEarliestStart: 8.5, hostLatestEnd: 13.5 },
  "ts-2": { windowStart: "8:00 AM", windowEnd: "2:00 PM", hostEarliestStart: 8.5, hostLatestEnd: 13.5 },
  "ts-3": { windowStart: "12:00 PM", windowEnd: "6:00 PM", hostEarliestStart: 12.33, hostLatestEnd: 17.67 },
  "ts-4": { windowStart: "12:00 PM", windowEnd: "6:00 PM", hostEarliestStart: 12.33, hostLatestEnd: 17.67 },
};

const TIMESLOT_COMMITMENTS = { "ts-1": 4, "ts-2": 2, "ts-3": 3, "ts-4": 1 };

const DETERMINISTIC_EVENTS = {
  "2026-03-05": [
    { start: 9, end: 10, title: "Team standup", color: "#4285f4" },
    { start: 12, end: 13, title: "Lunch", color: "#7986cb" },
  ],
  "2026-03-06": [
    { start: 7.5, end: 8.5, title: "Morning workout", color: "#0b8043" },
    { start: 12, end: 13, title: "Lunch with friend", color: "#7986cb" },
    { start: 14, end: 15, title: "Design review", color: "#e67c73" },
  ],
  "2026-03-10": [
    { start: 10, end: 11, title: "All-hands meeting", color: "#4285f4" },
    { start: 13.5, end: 14.5, title: "Client call", color: "#e67c73" },
    { start: 14.5, end: 16, title: "Strategy planning", color: "#f4511e" },
    { start: 16, end: 17, title: "Errands", color: "#0b8043" },
  ],
  "2026-03-12": [
    { start: 10, end: 11, title: "Product review", color: "#e67c73" },
    { start: 14, end: 15, title: "Interview panel", color: "#4285f4" },
    { start: 16, end: 17, title: "Gym", color: "#0b8043" },
  ],
};

const INVITEE_COMMUTE_DEFAULTS = {
  "Community Center \u2014 Room A": 25,
  "Downtown Library \u2014 Meeting Room 3": 15,
};

// --- Utility Functions ---
function formatTimePrecise(h) {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const ampm = hr >= 12 ? "PM" : "AM";
  const display = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${display}:${String(min).padStart(2, "0")} ${ampm}`;
}

function parseTimeToHour(timeStr) {
  if (!timeStr) return 9;
  const [time, ampm] = timeStr.split(" ");
  let [hr, min] = time.split(":").map(Number);
  if (ampm === "PM" && hr !== 12) hr += 12;
  if (ampm === "AM" && hr === 12) hr = 0;
  return hr + min / 60;
}

// Calendar helpers
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function toDateKey(year, month, day) { return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; }
function isPast(year, month, day) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(year, month, day) < today;
}

// Derived data
const AVAILABLE_DATES = new Set(MOCK_OPTIONS.map(opt => opt.date));
const DATES_BY_KEY = (() => {
  const m = {};
  for (const ts of TIMESLOTS) {
    if (!m[ts.date]) m[ts.date] = [];
    m[ts.date].push(ts);
  }
  return m;
})();

// Slot carving: non-overlapping contiguous slots from the effective window
function carveSlotsForDate(dateKey) {
  const timeslots = DATES_BY_KEY[dateKey] || [];
  const durationHrs = MOCK_GATHERING.duration / 60;
  const allSlots = [];

  for (const ts of timeslots) {
    const win = TIMESLOT_WINDOWS[ts.id];
    if (!win) continue;
    const effectiveStart = win.hostEarliestStart;
    const effectiveEnd = win.hostLatestEnd;
    let cursor = effectiveStart;
    let idx = 0;
    while (cursor + durationHrs <= effectiveEnd + 0.001) {
      allSlots.push({
        id: `${dateKey}_${ts.id}_${idx}`,
        timeslotId: ts.id,
        date: dateKey,
        start: cursor,
        end: cursor + durationHrs,
        startLabel: formatTimePrecise(cursor),
        endLabel: formatTimePrecise(cursor + durationHrs),
        locations: ts.locations,
      });
      cursor += durationHrs;
      idx++;
    }
  }
  return allSlots;
}

// Conflict detection for a single slot
function getSlotConflicts(dateKey, slotStart, slotEnd) {
  const events = DETERMINISTIC_EVENTS[dateKey] || [];
  const overlapping = [];
  let busyMinutes = 0;
  const slotDuration = (slotEnd - slotStart) * 60;

  for (const ev of events) {
    const overlapStart = Math.max(ev.start, slotStart);
    const overlapEnd = Math.min(ev.end, slotEnd);
    if (overlapStart < overlapEnd) {
      busyMinutes += (overlapEnd - overlapStart) * 60;
      overlapping.push({
        title: ev.title,
        color: ev.color,
        overlapStart,
        overlapEnd,
        startLabel: formatTimePrecise(overlapStart),
        endLabel: formatTimePrecise(overlapEnd),
      });
    }
  }

  const busyFraction = slotDuration > 0 ? busyMinutes / slotDuration : 0;
  const level = busyFraction === 0 ? "free" : busyFraction >= 0.99 ? "full" : "partial";
  return { level, busyFraction, overlapping };
}

// Get best availability level for a date (for calendar dot color)
function getDateAvailabilityLevel(dateKey) {
  const slots = carveSlotsForDate(dateKey);
  if (slots.length === 0) return null;
  let hasFree = false;
  let hasPartial = false;
  for (const s of slots) {
    const c = getSlotConflicts(s.date, s.start, s.end);
    if (c.level === "free") hasFree = true;
    else if (c.level === "partial") hasPartial = true;
  }
  return hasFree ? "green" : hasPartial ? "amber" : "red";
}

// Check if a slot's timeline has been adjusted from its original position
function isSlotAdjusted(slot, adjustedStart, maxCommuteMins) {
  if (adjustedStart == null) return false;
  const win = TIMESLOT_WINDOWS[slot.timeslotId];
  if (!win) return false;
  const durationHrs = MOCK_GATHERING.duration / 60;
  const commuteHrs = maxCommuteMins / 60;
  const minStart = win.hostEarliestStart + commuteHrs;
  const maxStart = win.hostLatestEnd - durationHrs - commuteHrs;
  const currentStart = Math.max(minStart, Math.min(maxStart, adjustedStart));
  return Math.abs(currentStart - slot.start) > 0.08;
}

const CONFLICT_BAR_COLORS = { free: "#43a047", partial: "#f9a825", full: "#e53935" };
const CONFLICT_LABELS = { free: "No conflicts", partial: "Partial conflict", full: "Fully busy" };

const RANK_COLORS = [
  { bg: "#fffde7", border: "#f9a825", badge: "#f9a825", label: "1st choice" },
  { bg: "#fafafa", border: "#90a4ae", badge: "#78909c", label: "2nd choice" },
  { bg: "#fef6f0", border: "#bc8f6f", badge: "#a1887f", label: "3rd choice" },
];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getTomorrowDate() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getMaxExpiration() {
  const d = new Date(); d.setDate(d.getDate() + 60);
  return d.toISOString().split("T")[0];
}

function getDefaultExpiration() {
  const d = new Date(); d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

// --- SVG Icons ---
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const QuestionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.5 5.25C5.5 4.42 6.17 3.75 7 3.75C7.83 3.75 8.5 4.42 8.5 5.25C8.5 6.08 7.83 6.5 7 7V7.75"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="10" r="0.75" fill="currentColor"/>
  </svg>
);

const SparkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="currentColor"/>
  </svg>
);

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

const ChevronDown = ({ size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={style}>
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M8 1C5.24 1 3 3.24 3 6c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="8" cy="6" r="1.5" fill="currentColor"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 4.5V8L10.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BackArrow = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
    <path d="M2 7H14" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5 1.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M11 1.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const CheckboxIcon = ({ checked }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="16" height="16" rx="4" stroke={checked ? "#43a047" : "#b0bac5"} strokeWidth="1.5" fill={checked ? "#43a047" : "none"} />
    {checked && <path d="M5 9L8 12L13 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>
);

const CommuteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 9.5H11.5V7L10 4H4L2.5 7V9.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    <path d="M2.5 7H11.5" stroke="currentColor" strokeWidth="1"/>
    <circle cx="4.5" cy="8.5" r="0.6" fill="currentColor"/>
    <circle cx="9.5" cy="8.5" r="0.6" fill="currentColor"/>
    <path d="M3 9.5V11" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <path d="M11 9.5V11" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const PeopleSmallIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <circle cx="5.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1 13C1 10.5 3 9 5.5 9C8 9 10 10.5 10 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="11" cy="5" r="1.5" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 9C13.5 9.5 15 11 15 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

// --- Sub-Components ---

function CalendarDayPreview({ dateKey }) {
  const events = (DETERMINISTIC_EVENTS[dateKey] || []).sort((a, b) => a.start - b.start);
  const slots = carveSlotsForDate(dateKey);
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dateLabel = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div style={styles.dayPreview}>
      <div style={styles.dayPreviewHeader}>
        <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.text }}>{dateLabel}</span>
        <span style={styles.dayPreviewBadge}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: 3 }}>
            <circle cx="5" cy="5" r="4" stroke="#4285f4" strokeWidth="1.2"/>
            <path d="M5 3V5.5L6.5 6.5" stroke="#4285f4" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Your Calendar
        </span>
      </div>
      {events.length > 0 ? (
        <div style={styles.dayPreviewEvents}>
          {events.map((ev, i) => (
            <div key={i} style={styles.dayPreviewEvent}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, flexShrink: 0, marginTop: 3 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{ev.title}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                  {formatTimePrecise(ev.start)} {"\u2013"} {formatTimePrecise(ev.end)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "10px 14px", fontSize: 12, color: "#43a047", fontWeight: 500 }}>
          No conflicts {"\u2713"}
        </div>
      )}
      <div style={styles.dayPreviewFooter}>
        <ClockIcon />
        <span>{slots.length} available slot{slots.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

function SlotTimeline({ slot, inviteeCommuteMins, adjustedStart, onPositionChange }) {
  const barRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [barWidth, setBarWidth] = useState(300);
  const dragStartRef = useRef(null);

  const win = TIMESLOT_WINDOWS[slot.timeslotId];
  if (!win) return null;

  const effectiveStartHr = win.hostEarliestStart;
  const effectiveEndHr = win.hostLatestEnd;
  const effectiveHrs = effectiveEndHr - effectiveStartHr;
  const durationHrs = MOCK_GATHERING.duration / 60;
  const commuteHrs = inviteeCommuteMins / 60;

  // Drag bounds: within effective window, constrained by commute
  const minStart = effectiveStartHr + commuteHrs;
  const maxStart = effectiveEndHr - durationHrs - commuteHrs;
  const fits = durationHrs + commuteHrs * 2 <= effectiveHrs + 0.01;

  const currentStart = adjustedStart != null
    ? Math.max(minStart, Math.min(maxStart, adjustedStart))
    : Math.max(minStart, Math.min(maxStart, slot.start));

  const isAdjusted = isSlotAdjusted(slot, adjustedStart, inviteeCommuteMins);

  const toPercent = (h) => ((h - effectiveStartHr) / effectiveHrs) * 100;

  const calEvents = (DETERMINISTIC_EVENTS[slot.date] || []).filter(
    ev => ev.end > effectiveStartHr && ev.start < effectiveEndHr
  );

  // Measure bar
  useEffect(() => {
    if (barRef.current) setBarWidth(barRef.current.offsetWidth);
    const onResize = () => { if (barRef.current) setBarWidth(barRef.current.offsetWidth); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pxPerHour = barWidth / effectiveHrs;

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e) => {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dHrs = dx / pxPerHour;
      let newStart = dragStartRef.current.startPos + dHrs;
      newStart = Math.max(minStart, Math.min(maxStart, newStart));
      newStart = Math.round(newStart * 12) / 12; // snap to 5 min
      onPositionChange(newStart);
    };
    const onMouseUp = () => setDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, pxPerHour, minStart, maxStart, onPositionChange]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = { clientX: e.clientX, startPos: currentStart };
    setDragging(true);
  };

  if (!fits) {
    return (
      <div style={styles.slotTimelineWrap}>
        <div style={styles.slotTimelineWarning}>
          Your commute ({inviteeCommuteMins} min each way) doesn't fit within this window.
        </div>
      </div>
    );
  }

  const blockWidthPct = (durationHrs / effectiveHrs) * 100;
  const showBlockLabel = (blockWidthPct / 100) * barWidth > 100;

  return (
    <div style={styles.slotTimelineWrap}>
      <div style={styles.slotTimelineHeader}>
        <span style={styles.slotTimelineLabel}>
          {isAdjusted ? "Your adjusted time" : "Host suggested time"}
        </span>
        {isAdjusted && (
          <button
            onClick={(e) => { e.stopPropagation(); onPositionChange(null); }}
            style={styles.slotTimelineReset}
          >
            Reset
          </button>
        )}
      </div>
      <div ref={barRef} style={styles.slotTimelineBar}>
        {/* Ghost outline at original position when adjusted */}
        {isAdjusted && (
          <div style={{
            position: "absolute",
            left: `${toPercent(slot.start)}%`,
            width: `${(durationHrs / effectiveHrs) * 100}%`,
            top: 4, bottom: 4,
            border: "2px dashed #b0bac5",
            borderRadius: 6,
            zIndex: 1,
            opacity: 0.5,
          }} />
        )}
        {/* Commute buffer before */}
        {commuteHrs > 0 && (
          <div style={{
            position: "absolute",
            left: `${toPercent(currentStart - commuteHrs)}%`,
            width: `${(commuteHrs / effectiveHrs) * 100}%`,
            top: 0, bottom: 0,
            background: COLORS.blueLight,
            opacity: 0.2,
            borderRadius: "6px 0 0 6px",
            zIndex: 2,
          }} />
        )}
        {/* Gathering block (draggable) */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "absolute",
            left: `${toPercent(currentStart)}%`,
            width: `${blockWidthPct}%`,
            top: 3, bottom: 3,
            background: COLORS.blueLight,
            borderRadius: 6,
            cursor: dragging ? "grabbing" : "grab",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 10, fontWeight: 600,
            overflow: "hidden", whiteSpace: "nowrap",
            userSelect: "none",
            zIndex: 3,
            transition: dragging ? "none" : "left 0.15s ease",
            boxShadow: dragging ? "0 2px 8px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {showBlockLabel && (
            <span style={{ padding: "0 4px" }}>
              {formatTimePrecise(currentStart)} {"\u2013"} {formatTimePrecise(currentStart + durationHrs)}
            </span>
          )}
        </div>
        {/* Commute buffer after */}
        {commuteHrs > 0 && (
          <div style={{
            position: "absolute",
            left: `${toPercent(currentStart + durationHrs)}%`,
            width: `${(commuteHrs / effectiveHrs) * 100}%`,
            top: 0, bottom: 0,
            background: COLORS.blueLight,
            opacity: 0.2,
            borderRadius: "0 6px 6px 0",
            zIndex: 2,
          }} />
        )}
      </div>
      {/* Busy events below */}
      {calEvents.length > 0 && (
        <div style={styles.slotBusyRow}>
          {calEvents.map((ev, i) => {
            const evS = Math.max(ev.start, effectiveStartHr);
            const evE = Math.min(ev.end, effectiveEndHr);
            return (
              <div key={i} title={ev.title} style={{
                position: "absolute",
                left: `${toPercent(evS)}%`,
                width: `${((evE - evS) / effectiveHrs) * 100}%`,
                top: 0,
                height: 4,
                background: "#e53935",
                borderRadius: 2,
                opacity: 0.85,
              }} />
            );
          })}
        </div>
      )}
      {/* Time labels */}
      <div style={styles.slotTimelineLabels}>
        <span>{formatTimePrecise(effectiveStartHr)}</span>
        <span style={{ color: COLORS.blueLight, fontWeight: 600 }}>{formatTimePrecise(currentStart)}</span>
        <span>{formatTimePrecise(effectiveEndHr)}</span>
      </div>
    </div>
  );
}

function ExpandedSlotPanel({ slot, inviteeCommutes, slotLocationExclusions, onToggleLocation }) {
  const exclusions = slotLocationExclusions[slot.id] || new Set();

  return (
    <div style={styles.expandedPanel}>
      {slot.locations.map((loc) => {
        const isIncluded = !exclusions.has(loc.name);
        const commuteMins = inviteeCommutes[loc.name] || 0;

        return (
          <button
            key={loc.name}
            onClick={() => onToggleLocation(slot.id, loc.name)}
            style={{
              ...styles.locRow,
              ...(isIncluded ? {} : styles.locRowExcluded),
            }}
          >
            <CheckboxIcon checked={isIncluded} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: isIncluded ? COLORS.text : COLORS.textLight,
              }}>
                {loc.name}
              </div>
            </div>
            {isIncluded && (
              <span style={styles.locCommutePill}>
                <CommuteIcon /> {commuteMins} min
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SlotCard({ slot, status, onSetStatus, conflicts, isExpanded, onToggleExpand, inviteeCommutes, slotLocationExclusions, onToggleLocation, timelineAdjustment, onTimelineChange }) {
  const commitCount = TIMESLOT_COMMITMENTS[slot.timeslotId] || 0;
  const isWorks = status === "works";
  const isDoesntWork = status === "doesnt-work";
  const isProposed = status === "proposed";
  const exclusions = slotLocationExclusions[slot.id] || new Set();
  const includedLocs = slot.locations.filter(loc => !exclusions.has(loc.name));
  const includedCount = includedLocs.length;
  const maxCommuteMins = includedCount > 0
    ? Math.max(...includedLocs.map(loc => inviteeCommutes[loc.name] || 0))
    : 0;
  const adjusted = isSlotAdjusted(slot, timelineAdjustment, maxCommuteMins);

  // Compute adjusted time labels
  const durationHrs = MOCK_GATHERING.duration / 60;
  const adjustedStartLabel = adjusted ? formatTimePrecise(timelineAdjustment) : null;
  const adjustedEndLabel = adjusted ? formatTimePrecise(timelineAdjustment + durationHrs) : null;

  return (
    <div style={{
      ...styles.slotCard,
      ...(isWorks ? styles.slotCardWorks : {}),
      ...(isDoesntWork ? styles.slotCardDoesntWork : {}),
      ...(isProposed ? styles.slotCardProposed : {}),
    }}>
      {/* Main row */}
      <div style={styles.slotMainRow} onClick={onToggleExpand}>
        {/* Availability bar */}
        <div style={{ ...styles.slotAvailBar, background: CONFLICT_BAR_COLORS[conflicts.level] }} />

        {/* Time info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.slotTimeRow}>
            <span style={{
              ...styles.slotTime,
              ...(adjusted ? { textDecoration: "line-through", opacity: 0.5 } : {}),
            }}>
              {slot.startLabel} {"\u2013"} {slot.endLabel}
            </span>
            {adjusted && (
              <>
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.blueLight, marginLeft: 6 }}>
                  {adjustedStartLabel} {"\u2013"} {adjustedEndLabel}
                </span>
                <span style={styles.adjustedBadge}>ADJUSTED</span>
              </>
            )}
          </div>
          <div style={styles.slotMetaRow}>
            <span style={styles.slotLocCount}>{includedCount} location{includedCount !== 1 ? "s" : ""}</span>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: CONFLICT_BAR_COLORS[conflicts.level] }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: CONFLICT_BAR_COLORS[conflicts.level] }}>
                {CONFLICT_LABELS[conflicts.level]}
              </span>
            </div>
            <span style={styles.slotMetaSep}>&middot;</span>
            <span style={styles.slotCommitCount}>
              <PeopleSmallIcon /> {commitCount}/{MOCK_GATHERING.quorum}
            </span>
          </div>
        </div>

        {/* Toggle buttons */}
        <div style={styles.slotToggles} onClick={(e) => e.stopPropagation()}>
          {adjusted ? (
            <button
              onClick={() => onSetStatus(slot.id, isProposed ? null : "proposed")}
              style={{
                ...styles.slotToggleBtn,
                ...(isProposed ? styles.slotToggleBtnProposed : {}),
              }}
              title="Propose this adjusted time"
            >
              <QuestionIcon />
            </button>
          ) : (
            <button
              onClick={() => onSetStatus(slot.id, isWorks ? null : "works")}
              style={{
                ...styles.slotToggleBtn,
                ...(isWorks ? styles.slotToggleBtnWorks : {}),
              }}
              title="Works for me"
            >
              <CheckIcon />
            </button>
          )}
          <button
            onClick={() => onSetStatus(slot.id, isDoesntWork ? null : "doesnt-work")}
            style={{
              ...styles.slotToggleBtn,
              ...(isDoesntWork ? styles.slotToggleBtnDoesntWork : {}),
            }}
            title="Doesn't work"
          >
            <XIcon />
          </button>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          size={18}
          style={{
            color: COLORS.textLight,
            transition: "transform 0.2s",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
            marginLeft: 2,
          }}
        />
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <>
          <ExpandedSlotPanel
            slot={slot}
            inviteeCommutes={inviteeCommutes}
            slotLocationExclusions={slotLocationExclusions}
            onToggleLocation={onToggleLocation}
          />
          <SlotTimeline
            slot={slot}
            inviteeCommuteMins={maxCommuteMins}
            adjustedStart={timelineAdjustment}
            onPositionChange={(pos) => onTimelineChange(slot.id, pos)}
          />
        </>
      )}
    </div>
  );
}

function CalendarMonth({ viewYear, viewMonth, onPrevMonth, onNextMonth, availableDates, selectedDate, onSelectDate, slotStatuses }) {
  const [hoveredDate, setHoveredDate] = useState(null);
  const hoverTimerRef = useRef(null);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Count "works" + "proposed" slots per date for badge
  const worksCountByDate = {};
  for (const [slotId, val] of Object.entries(slotStatuses)) {
    if (val !== "works" && val !== "proposed") continue;
    const parts = slotId.split("_");
    const dk = parts[0];
    worksCountByDate[dk] = (worksCountByDate[dk] || 0) + 1;
  }

  const handleDayHover = (dateKey) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredDate(dateKey), 300);
  };

  const handleDayLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredDate(null);
  };

  useEffect(() => {
    return () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); };
  }, []);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} />);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = toDateKey(viewYear, viewMonth, day);
    const hasAvail = availableDates.has(dateKey);
    const isSelected = selectedDate === dateKey;
    const past = isPast(viewYear, viewMonth, day);
    const worksCount = worksCountByDate[dateKey] || 0;
    const availLevel = hasAvail && !past ? getDateAvailabilityLevel(dateKey) : null;
    const dotColor = availLevel === "green" ? "#43a047" : availLevel === "amber" ? "#f9a825" : availLevel === "red" ? "#e53935" : null;

    cells.push(
      <button
        key={day}
        onClick={() => hasAvail && !past && onSelectDate(dateKey)}
        onMouseEnter={() => hasAvail && !past && handleDayHover(dateKey)}
        onMouseLeave={handleDayLeave}
        style={{
          ...styles.dayCell,
          color: past ? "#ccc" : hasAvail ? COLORS.text : "#b0b8c2",
          cursor: hasAvail && !past ? "pointer" : "default",
          fontWeight: hasAvail ? 700 : 400,
          background: isSelected ? COLORS.blueLight : "transparent",
          ...(isSelected ? { color: "#fff", borderRadius: 10 } : {}),
        }}
      >
        <span>{day}</span>
        {dotColor && !isSelected && (
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: dotColor, marginTop: 2 }} />
        )}
        {worksCount > 0 && !isSelected && (
          <div style={styles.dayBadge}>{worksCount}</div>
        )}
        {worksCount > 0 && isSelected && (
          <div style={{ ...styles.dayBadge, background: "#fff", color: COLORS.blueLight }}>{worksCount}</div>
        )}
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={styles.calHeader}>
        <button onClick={onPrevMonth} style={styles.calNavBtn}><ChevronLeft /></button>
        <span style={styles.calTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={onNextMonth} style={styles.calNavBtn}><ChevronRight /></button>
      </div>
      <div style={styles.calDowRow}>
        {DAYS_OF_WEEK.map(d => <div key={d} style={styles.calDow}>{d}</div>)}
      </div>
      <div style={styles.calGrid}>{cells}</div>

      {/* Hover preview */}
      {hoveredDate && hoveredDate !== selectedDate && (
        <CalendarDayPreview dateKey={hoveredDate} />
      )}
    </div>
  );
}

function DaySidebar({ dateKey, slots, slotStatuses, onSetStatus, expandedSlot, onToggleExpand, inviteeCommutes, slotLocationExclusions, onToggleLocation, timelineAdjustments, onTimelineChange }) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dateLabel = dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const locations = slots.length > 0 ? slots[0].locations : [];

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.sidebarDate}>{dateLabel}</h3>
      <div style={styles.locationPills}>
        {locations.map(loc => (
          <div key={loc.name} style={styles.locationPill}>
            <MapPinIcon /> <span>{loc.name.split(" \u2014 ")[0]}</span>
          </div>
        ))}
      </div>
      <div style={styles.slotsHeader}>
        <ClockIcon />
        <span>Available slots ({slots.length})</span>
      </div>
      <div style={styles.slotsList}>
        {slots.map(slot => {
          const conflicts = getSlotConflicts(slot.date, slot.start, slot.end);
          return (
            <SlotCard
              key={slot.id}
              slot={slot}
              status={slotStatuses[slot.id] || null}
              onSetStatus={onSetStatus}
              conflicts={conflicts}
              isExpanded={expandedSlot === slot.id}
              onToggleExpand={() => onToggleExpand(slot.id)}
              inviteeCommutes={inviteeCommutes}
              slotLocationExclusions={slotLocationExclusions}
              onToggleLocation={onToggleLocation}
              timelineAdjustment={timelineAdjustments[slot.id] ?? null}
              onTimelineChange={onTimelineChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function SelectionSummary({ worksCount, doesntWorkCount, proposedCount, onContinue }) {
  const canContinue = worksCount > 0 || proposedCount > 0;
  const parts = [];
  if (worksCount > 0) parts.push(<span key="w" style={{ fontWeight: 700, color: "#43a047" }}>{worksCount} work{worksCount === 1 ? "s" : ""}</span>);
  if (proposedCount > 0) parts.push(<span key="p" style={{ fontWeight: 700, color: "#f9a825" }}>{proposedCount} proposed</span>);
  if (doesntWorkCount > 0) parts.push(<span key="d" style={{ fontWeight: 600, color: "#e53935" }}>{doesntWorkCount} don't work</span>);

  return (
    <div style={styles.summaryBar}>
      <div style={styles.summaryText}>
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && <span style={{ color: COLORS.textLight }}> {"\u00B7"} </span>}
            {part}
          </span>
        ))}
      </div>
      <button
        onClick={onContinue}
        style={{ ...styles.submitBtn, ...(!canContinue ? styles.submitBtnDisabled : {}) }}
        disabled={!canContinue}
      >
        Continue
      </button>
    </div>
  );
}

function RankScreen({ allCarvedSlots, slotStatuses, timelineAdjustments, slotLocationExclusions, inviteeCommutes, rankings, onRankToggle, onUnassignSlot, expirationDate, onSetExpirationDate, notes, onSetNotes, onBack, onSubmit }) {
  const rankableSlots = allCarvedSlots.filter(s =>
    slotStatuses[s.id] === "works" || slotStatuses[s.id] === "proposed"
  );
  const maxRanks = Math.min(3, rankableSlots.length);
  const filledRanks = rankings.filter(Boolean).length;
  const canSubmit = filledRanks >= 1;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ padding: "0 28px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: "0 0 4px" }}>Rank your preferences</h2>
          <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 20px" }}>
            Tap timeslots to assign your top {maxRanks > 1 ? maxRanks : ""} choice{maxRanks !== 1 ? "s" : ""}.
          </p>

          {/* Rank slots */}
          <div style={styles.rankSlotsRow}>
            {Array.from({ length: maxRanks }).map((_, i) => {
              const slotId = rankings[i];
              const slot = slotId ? allCarvedSlots.find(s => s.id === slotId) : null;
              const rc = RANK_COLORS[i];
              const slotIsProposed = slot && slotStatuses[slot.id] === "proposed";
              const slotCC = slot ? (TIMESLOT_COMMITMENTS[slot.timeslotId] || 0) : 0;
              const slotReachesQuorum = slot && !slotIsProposed && slotCC === MOCK_GATHERING.quorum - 1;
              const adj = slot && timelineAdjustments[slot.id];
              const durationHrs = MOCK_GATHERING.duration / 60;
              const slotTimeLabel = slot && slotIsProposed && adj != null
                ? `${formatTimePrecise(adj)}\u2013${formatTimePrecise(adj + durationHrs)}`
                : slot ? `${slot.startLabel}\u2013${slot.endLabel}` : "";

              return (
                <div
                  key={i}
                  onClick={() => slotId && onUnassignSlot(i)}
                  style={{
                    ...styles.rankSlot,
                    ...(slot ? { ...styles.rankSlotFilled, borderColor: rc.border, background: rc.bg, cursor: "pointer" } : {}),
                  }}
                >
                  <div style={{ ...styles.rankSlotLabel, color: rc.badge }}>{rc.label}</div>
                  {slot ? (
                    <div style={styles.rankSlotContent}>
                      <div>{formatDate(slot.date)}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{slotTimeLabel}</div>
                      {slotIsProposed ? (
                        <div style={{ fontSize: 10, color: "#f57f17", fontWeight: 700, marginTop: 2 }}>Proposed</div>
                      ) : slotReachesQuorum ? (
                        <div style={{ fontSize: 10, color: "#f9a825", fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                          <SparkIcon /> Quorum!
                        </div>
                      ) : (
                        <div style={{ fontSize: 10, color: COLORS.textLight, marginTop: 2 }}>{slotCC + 1}/{MOCK_GATHERING.quorum} committed</div>
                      )}
                    </div>
                  ) : (
                    <div style={styles.rankSlotEmpty}>Tap below</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rankable slots list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {rankableSlots.map(slot => {
              const rankIndex = rankings.indexOf(slot.id);
              const isRanked = rankIndex !== -1;
              const allSlotsFull = rankings.slice(0, maxRanks).every(Boolean);
              const rc = isRanked ? RANK_COLORS[rankIndex] : null;
              const slotIsProposed = slotStatuses[slot.id] === "proposed";
              const exclusions = slotLocationExclusions[slot.id] || new Set();
              const includedLocs = slot.locations.filter(loc => !exclusions.has(loc.name));
              const cc = TIMESLOT_COMMITMENTS[slot.timeslotId] || 0;
              const reachesQuorum = !slotIsProposed && cc === MOCK_GATHERING.quorum - 1;
              const adj = timelineAdjustments[slot.id];
              const durationHrs = MOCK_GATHERING.duration / 60;
              const displayTime = slotIsProposed && adj != null
                ? `${formatTimePrecise(adj)}\u2013${formatTimePrecise(adj + durationHrs)}`
                : `${slot.startLabel}\u2013${slot.endLabel}`;

              return (
                <button
                  key={slot.id}
                  onClick={() => onRankToggle(slot.id)}
                  style={{
                    ...styles.rankOptionCard,
                    ...(isRanked ? { borderColor: rc.border, background: rc.bg } : {}),
                    ...(slotIsProposed && !isRanked ? { borderColor: "#ffe082", background: "#fffde7" } : {}),
                    ...(!isRanked && allSlotsFull ? { opacity: 0.45, cursor: "default" } : {}),
                  }}
                >
                  {isRanked && (
                    <div style={{ ...styles.rankBadge, background: rc.badge }}>{rankIndex + 1}</div>
                  )}
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                      {formatDate(slot.date)} {"\u00B7"} {displayTime}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span>{includedLocs.map(l => l.name.split(" \u2014 ")[0]).join(", ")}</span>
                      {slotIsProposed ? (
                        <span style={styles.proposedNewBadge}>New option</span>
                      ) : reachesQuorum ? (
                        <span style={{ color: "#f9a825", fontWeight: 700, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <SparkIcon /> Reaches quorum
                        </span>
                      ) : (
                        <span style={{ color: COLORS.textLight, fontSize: 11 }}>{cc + 1}/{MOCK_GATHERING.quorum}</span>
                      )}
                    </div>
                  </div>
                  {isRanked && (
                    <div style={{ color: COLORS.textLight, fontSize: 11 }}>tap to remove</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Expiration date */}
          <div style={{ marginBottom: 16 }}>
            <label style={styles.fieldLabel}>Availability expires</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => onSetExpirationDate(e.target.value)}
              min={getTomorrowDate()}
              max={getMaxExpiration()}
              style={styles.dateInput}
            />
            <p style={styles.fieldNote}>After this date, the host will know your selections may no longer be valid.</p>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={styles.fieldLabel}>Notes <span style={styles.fieldHint}>(optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => onSetNotes(e.target.value)}
              placeholder="Any constraints or preferences the host should know about..."
              style={styles.textArea}
            />
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navRow}>
          <button onClick={onBack} style={styles.navBackBtn}>
            <BackArrow /> Back
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => canSubmit && onSubmit()}
            style={{ ...styles.publishBtn, ...(canSubmit ? {} : styles.submitBtnDisabled) }}
            disabled={!canSubmit}
          >
            Submit Response
          </button>
        </div>
      </div>
    </div>
  );
}

function GatheringOverview({ gathering, timeslots, inviteeCommutes, onUpdateCommute }) {
  const responseFraction = gathering.responsesReceived / gathering.totalInvited;

  // Find if any timeslot is 1 response away from quorum
  const nearestGap = timeslots.reduce((best, ts) => {
    const committed = TIMESLOT_COMMITMENTS[ts.id] || 0;
    const remaining = gathering.quorum - committed;
    return remaining > 0 && remaining < best ? remaining : best;
  }, Infinity);

  return (
    <div style={styles.overviewSection}>
      {/* Response progress */}
      <div style={styles.overviewBlock}>
        <div style={styles.responseHeader}>
          <span>
            <span style={styles.responseCount}>{gathering.responsesReceived} of {gathering.totalInvited}</span> responded
          </span>
        </div>
        <div style={styles.responseBarTrack}>
          <div style={{ ...styles.responseBarFill, width: `${responseFraction * 100}%` }} />
        </div>
      </div>

      {/* Quorum progress per timeslot */}
      <div style={styles.overviewBlock}>
        <div style={styles.quorumHeader}>
          <PeopleSmallIcon />
          <span>Quorum: <strong>{gathering.quorum}</strong> needed per timeslot</span>
        </div>
        <div style={styles.quorumBarList}>
          {timeslots.map(ts => {
            const committed = TIMESLOT_COMMITMENTS[ts.id] || 0;
            const fraction = Math.min(committed / gathering.quorum, 1);
            const [y, mo, d] = ts.date.split("-").map(Number);
            const dayLabel = new Date(y, mo - 1, d).toLocaleDateString("en-US", { weekday: "short" });
            const nearQuorum = committed === gathering.quorum - 1;

            return (
              <div key={ts.id} style={styles.quorumBarRow}>
                <span style={styles.quorumBarDayLabel}>{dayLabel}</span>
                <div style={styles.quorumBarTrack}>
                  <div style={{
                    ...styles.quorumBarFill,
                    width: `${fraction * 100}%`,
                    background: nearQuorum ? "#f9a825" : COLORS.blueLight,
                  }} />
                </div>
                <span style={{
                  ...styles.quorumBarCount,
                  color: nearQuorum ? "#f9a825" : COLORS.textMuted,
                  fontWeight: nearQuorum ? 700 : 600,
                }}>
                  {committed}/{gathering.quorum}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quorum callout */}
      {nearestGap === 1 && (
        <div style={styles.overviewCallout}>
          <SparkIcon />
          <span>A timeslot is 1 response away from quorum {"\u2014"} your vote could confirm the gathering!</span>
        </div>
      )}

      {/* Locations */}
      <div style={{ marginTop: 16 }}>
        <div style={styles.overviewLocLabel}>Locations</div>
        <div style={styles.overviewLocList}>
          {ALL_LOCATIONS.map(loc => {
            const commuteMins = inviteeCommutes[loc.name] || 0;
            return (
              <div key={loc.name} style={styles.overviewLocCard}>
                <div style={styles.overviewLocCheck}>
                  <CheckboxIcon checked />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.overviewLocName}>{loc.name}</div>
                  <div style={styles.overviewLocAddr}>{loc.address}</div>
                  <span style={styles.overviewLocDirections}>Directions</span>
                </div>
                <div style={styles.commuteInputWrap}>
                  <CommuteIcon />
                  <input
                    type="number"
                    value={commuteMins}
                    onChange={(e) => onUpdateCommute(loc.name, e.target.value)}
                    style={styles.commuteInputField}
                    min={0}
                    max={999}
                  />
                  <span style={styles.commuteInputUnit}>min</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ConfirmationScreen({ worksCount, proposedCount, rankings, allCarvedSlots, slotStatuses, timelineAdjustments, onStartOver }) {
  const filledRanks = rankings.filter(Boolean).length;
  const worksSlots = allCarvedSlots.filter(s => slotStatuses[s.id] === "works");
  const durationHrs = MOCK_GATHERING.duration / 60;

  // First pick info
  const firstPick = rankings[0] ? allCarvedSlots.find(s => s.id === rankings[0]) : null;
  const firstPickIsProposed = firstPick && slotStatuses[firstPick.id] === "proposed";
  const firstPickAdj = firstPick && timelineAdjustments[firstPick.id];
  const firstPickLabel = firstPick
    ? `${formatDate(firstPick.date)}, ${firstPickIsProposed && firstPickAdj != null
        ? `${formatTimePrecise(firstPickAdj)}\u2013${formatTimePrecise(firstPickAdj + durationHrs)}`
        : `${firstPick.startLabel}\u2013${firstPick.endLabel}`}`
    : "\u2014";

  // Best quorum progress
  const bestCC = worksSlots.length > 0
    ? Math.max(...worksSlots.map(s => (TIMESLOT_COMMITMENTS[s.timeslotId] || 0) + 1))
    : 0;

  const reachesQuorum = worksSlots.some(s => (TIMESLOT_COMMITMENTS[s.timeslotId] || 0) === MOCK_GATHERING.quorum - 1);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.confirmBody}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2705"}</div>
          <h2 style={styles.confirmTitle}>Response Submitted!</h2>
          <p style={styles.confirmSub}>
            {worksCount > 0 && <>You ranked <strong>{filledRanks} timeslot preference{filledRanks !== 1 ? "s" : ""}</strong> from {worksCount} available slot{worksCount !== 1 ? "s" : ""}.</>}
            {proposedCount > 0 && <>{worksCount > 0 ? " " : ""}You proposed <strong>{proposedCount} alternate time{proposedCount !== 1 ? "s" : ""}</strong> that others can vote on.</>}
          </p>
          <div style={styles.confirmStats}>
            {worksCount > 0 && (
              <>
                <div style={styles.confirmStat}>
                  <span style={styles.confirmStatLabel}>Your #1 pick</span>
                  <span style={{ ...styles.confirmStatValue, fontSize: 14 }}>{firstPickLabel}</span>
                </div>
                <div style={styles.confirmStatDivider} />
                <div style={styles.confirmStat}>
                  <span style={styles.confirmStatLabel}>Best quorum progress</span>
                  <span style={styles.confirmStatValue}>{bestCC} / {MOCK_GATHERING.quorum}</span>
                </div>
              </>
            )}
            {proposedCount > 0 && (
              <>
                {worksCount > 0 && <div style={styles.confirmStatDivider} />}
                <div style={styles.confirmStat}>
                  <span style={styles.confirmStatLabel}>Proposed times</span>
                  <span style={{ ...styles.confirmStatValue, color: "#f9a825" }}>{proposedCount}</span>
                </div>
              </>
            )}
          </div>
          {reachesQuorum ? (
            <div style={{ ...styles.quorumCallout, marginTop: 20, justifyContent: "center" }}>
              <SparkIcon />
              <span>Your response reaches quorum on a timeslot! The host can now confirm the gathering.</span>
            </div>
          ) : proposedCount > 0 && worksCount === 0 ? (
            <p style={{ fontSize: 14, color: "#f57f17", lineHeight: 1.6, marginTop: 16, fontWeight: 500 }}>
              Your proposed times will be added as new options for others to vote on.
            </p>
          ) : (
            <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6, marginTop: 16 }}>
              The host will notify you when quorum is reached and the gathering is confirmed.
            </p>
          )}
          <button onClick={onStartOver} style={{ ...styles.backToHomeBtn, marginTop: 24 }}>Start Over</button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function InviteeCalendarExperience({ onBack }) {
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(2); // March = index 2
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotStatuses, setSlotStatuses] = useState({}); // { slotId: "works" | "doesnt-work" }
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [inviteeCommutes, setInviteeCommutes] = useState({ ...INVITEE_COMMUTE_DEFAULTS });
  const [slotLocationExclusions, setSlotLocationExclusions] = useState({}); // { slotId: Set<locName> }
  const [timelineAdjustments, setTimelineAdjustments] = useState({}); // { slotId: startHour }
  const [screen, setScreen] = useState(1); // 1=select, 2=rank, 3=confirm
  const [rankings, setRankings] = useState([null, null, null]);
  const [expirationDate, setExpirationDate] = useState(getDefaultExpiration());
  const [notes, setNotes] = useState("");

  const worksCount = Object.values(slotStatuses).filter(v => v === "works").length;
  const doesntWorkCount = Object.values(slotStatuses).filter(v => v === "doesnt-work").length;
  const proposedCount = Object.values(slotStatuses).filter(v => v === "proposed").length;

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return carveSlotsForDate(selectedDate);
  }, [selectedDate]);

  // All carved slots across all available dates (for rank screen)
  const allCarvedSlots = useMemo(() => {
    const all = [];
    for (const dateKey of AVAILABLE_DATES) {
      all.push(...carveSlotsForDate(dateKey));
    }
    return all;
  }, []);

  const rankableCount = allCarvedSlots.filter(s =>
    slotStatuses[s.id] === "works" || slotStatuses[s.id] === "proposed"
  ).length;

  // Auto-cleanup stale rankings when statuses change
  useEffect(() => {
    const rankableIds = new Set(
      allCarvedSlots.filter(s => slotStatuses[s.id] === "works" || slotStatuses[s.id] === "proposed").map(s => s.id)
    );
    setRankings(prev => prev.map(id => (id && !rankableIds.has(id)) ? null : id));
  }, [rankableCount, allCarvedSlots, slotStatuses]);

  const handleSetStatus = (slotId, status) => {
    setSlotStatuses(prev => {
      const next = { ...prev };
      if (status === null) {
        delete next[slotId];
      } else {
        next[slotId] = status;
      }
      return next;
    });
  };

  const handleToggleExpand = (slotId) => {
    setExpandedSlot(prev => prev === slotId ? null : slotId);
  };

  const handleRankToggle = (slotId) => {
    const maxRanks = Math.min(3, rankableCount);
    const currentIndex = rankings.indexOf(slotId);
    if (currentIndex !== -1) {
      const next = [...rankings];
      next[currentIndex] = null;
      setRankings(next);
    } else {
      const emptyIndex = rankings.findIndex((r, i) => r === null && i < maxRanks);
      if (emptyIndex !== -1) {
        const next = [...rankings];
        next[emptyIndex] = slotId;
        setRankings(next);
      }
    }
  };

  const handleUnassignSlot = (slotIndex) => {
    const next = [...rankings];
    next[slotIndex] = null;
    setRankings(next);
  };

  const handleStartOver = () => {
    setScreen(1);
    setSlotStatuses({});
    setExpandedSlot(null);
    setSlotLocationExclusions({});
    setTimelineAdjustments({});
    setRankings([null, null, null]);
    setExpirationDate(getDefaultExpiration());
    setNotes("");
    setSelectedDate(null);
    setInviteeCommutes({ ...INVITEE_COMMUTE_DEFAULTS });
  };

  const handleTimelineChange = (slotId, position) => {
    setTimelineAdjustments(prev => {
      const next = { ...prev };
      if (position === null) {
        delete next[slotId];
      } else {
        next[slotId] = position;
      }
      return next;
    });
    // Auto-clear "works" when dragged (they should use ? propose instead)
    if (position !== null) {
      setSlotStatuses(prev => {
        if (prev[slotId] === "works") {
          const next = { ...prev };
          delete next[slotId];
          return next;
        }
        return prev;
      });
    }
    // Auto-clear "proposed" when reset to original
    if (position === null) {
      setSlotStatuses(prev => {
        if (prev[slotId] === "proposed") {
          const next = { ...prev };
          delete next[slotId];
          return next;
        }
        return prev;
      });
    }
  };

  const handleUpdateCommute = (locName, mins) => {
    const val = Math.max(0, Math.min(999, parseInt(mins, 10) || 0));
    setInviteeCommutes(prev => ({ ...prev, [locName]: val }));
  };

  const handleToggleLocation = (slotId, locName) => {
    setSlotLocationExclusions(prev => {
      const current = prev[slotId] || new Set();
      const next = new Set(current);
      if (next.has(locName)) next.delete(locName);
      else next.add(locName);
      return { ...prev, [slotId]: next };
    });
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  if (screen === 3) {
    return (
      <ConfirmationScreen
        worksCount={worksCount}
        proposedCount={proposedCount}
        rankings={rankings}
        allCarvedSlots={allCarvedSlots}
        slotStatuses={slotStatuses}
        timelineAdjustments={timelineAdjustments}
        onStartOver={handleStartOver}
      />
    );
  }

  if (screen === 2) {
    return (
      <RankScreen
        allCarvedSlots={allCarvedSlots}
        slotStatuses={slotStatuses}
        timelineAdjustments={timelineAdjustments}
        slotLocationExclusions={slotLocationExclusions}
        inviteeCommutes={inviteeCommutes}
        rankings={rankings}
        onRankToggle={handleRankToggle}
        onUnassignSlot={handleUnassignSlot}
        expirationDate={expirationDate}
        onSetExpirationDate={setExpirationDate}
        notes={notes}
        onSetNotes={setNotes}
        onBack={() => setScreen(1)}
        onSubmit={() => setScreen(3)}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}><BackArrow /></button>
          <div>
            <h1 style={styles.title}>{MOCK_GATHERING.title}</h1>
            <div style={styles.hostLine}>
              Hosted by <span style={{ fontWeight: 600 }}>{MOCK_GATHERING.hostName}</span>
              {" \u00B7 "}{MOCK_GATHERING.duration} min {" \u00B7 "}{MOCK_GATHERING.format}
            </div>
          </div>
        </div>

        {/* Calendar connected indicator */}
        <div style={styles.calConnected}>
          <CalIcon />
          <span>Google Calendar connected</span>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#43a047" }} />
        </div>

        {/* Description */}
        <p style={styles.description}>{MOCK_GATHERING.description}</p>

        {/* Instruction */}
        <div style={styles.instruction}>
          Select the days and time slots that work for you. Your calendar conflicts are shown on each slot.
        </div>

        {/* Gathering overview */}
        <GatheringOverview
          gathering={MOCK_GATHERING}
          timeslots={TIMESLOTS}
          inviteeCommutes={inviteeCommutes}
          onUpdateCommute={handleUpdateCommute}
        />

        {/* Main content: calendar + sidebar */}
        <div style={styles.contentRow}>
          <div style={styles.calendarPanel}>
            <CalendarMonth
              viewYear={viewYear}
              viewMonth={viewMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              availableDates={AVAILABLE_DATES}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              slotStatuses={slotStatuses}
            />
          </div>
          {selectedDate ? (
            <DaySidebar
              dateKey={selectedDate}
              slots={slotsForSelectedDate}
              slotStatuses={slotStatuses}
              onSetStatus={handleSetStatus}
              expandedSlot={expandedSlot}
              onToggleExpand={handleToggleExpand}
              inviteeCommutes={inviteeCommutes}
              slotLocationExclusions={slotLocationExclusions}
              onToggleLocation={handleToggleLocation}
              timelineAdjustments={timelineAdjustments}
              onTimelineChange={handleTimelineChange}
            />
          ) : (
            <div style={styles.sidebarPlaceholder}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>{"\uD83D\uDCC5"}</div>
              <div>Select a highlighted day to see available time slots</div>
            </div>
          )}
        </div>

        {/* Selection summary */}
        {(worksCount > 0 || doesntWorkCount > 0 || proposedCount > 0) && (
          <SelectionSummary
            worksCount={worksCount}
            doesntWorkCount={doesntWorkCount}
            proposedCount={proposedCount}
            onContinue={() => (worksCount > 0 || proposedCount > 0) && setScreen(2)}
          />
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: {
    minHeight: "100vh",
    background: GRADIENTS.background,
    display: "flex",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: FONTS.base,
  },
  card: {
    background: COLORS.cardBg,
    borderRadius: 20,
    maxWidth: 780,
    width: "100%",
    padding: "28px 0",
    boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
    alignSelf: "flex-start",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "0 28px",
    marginBottom: 12,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: COLORS.textMuted,
    padding: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.text,
    margin: 0,
    lineHeight: 1.3,
  },
  hostLine: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  calConnected: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    margin: "8px 28px",
    padding: "5px 12px",
    borderRadius: 20,
    background: "#f0faf0",
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: 500,
  },
  description: {
    fontSize: 13,
    color: COLORS.textBody,
    lineHeight: 1.6,
    padding: "0 28px",
    margin: "8px 0 4px",
  },
  instruction: {
    fontSize: 12,
    color: COLORS.textLight,
    padding: "0 28px",
    margin: "0 0 16px",
    fontStyle: "italic",
  },
  contentRow: {
    display: "flex",
    gap: 0,
    minHeight: 360,
    borderTop: `1px solid ${COLORS.borderLight}`,
  },
  calendarPanel: {
    flex: "0 0 300px",
    padding: "20px 20px",
    borderRight: `1px solid ${COLORS.borderLight}`,
  },
  // Calendar styles
  calHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calNavBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: COLORS.textMuted,
    padding: 4,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
  },
  calTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: COLORS.text,
  },
  calDowRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 0,
    marginBottom: 4,
  },
  calDow: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: 600,
    color: COLORS.textLight,
    padding: "4px 0",
    textTransform: "uppercase",
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 2,
  },
  dayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 0",
    minHeight: 40,
    border: "none",
    background: "transparent",
    fontFamily: FONTS.base,
    fontSize: 13,
    position: "relative",
  },
  dayBadge: {
    position: "absolute",
    top: 1,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#43a047",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Day hover preview
  dayPreview: {
    marginTop: 8,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
    overflow: "hidden",
    animation: "fadeIn 0.15s ease",
  },
  dayPreviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafbfc",
  },
  dayPreviewBadge: {
    display: "flex",
    alignItems: "center",
    fontSize: 10,
    color: "#4285f4",
    fontWeight: 600,
    background: "#e8f0fe",
    padding: "2px 8px",
    borderRadius: 10,
  },
  dayPreviewEvents: {
    padding: "8px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  dayPreviewEvent: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
  },
  dayPreviewFooter: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderTop: "1px solid #f0f0f0",
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.textMuted,
    background: "#fafbfc",
  },
  // Sidebar styles
  sidebar: {
    flex: 1,
    minWidth: 280,
    padding: "20px 20px",
    overflowY: "auto",
    maxHeight: 520,
  },
  sidebarPlaceholder: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    color: COLORS.textLight,
    fontSize: 13,
    textAlign: "center",
  },
  sidebarDate: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.text,
    margin: "0 0 8px",
  },
  locationPills: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  locationPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    borderRadius: 8,
    background: COLORS.fieldBg,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: 500,
    border: `1px solid ${COLORS.borderLight}`,
  },
  slotsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  slotsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  // Slot card styles (enhanced, matching InviteeExperience)
  slotCard: {
    borderRadius: 14,
    border: `1.5px solid ${COLORS.borderLight}`,
    background: "#fff",
    overflow: "hidden",
    transition: "all 0.2s",
  },
  slotCardWorks: {
    borderColor: "#a5d6a7",
    background: "#f1f8e9",
  },
  slotCardDoesntWork: {
    borderColor: "#ffcdd2",
    background: "#fff5f5",
    opacity: 0.65,
  },
  slotMainRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    cursor: "pointer",
    userSelect: "none",
  },
  slotAvailBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
    flexShrink: 0,
  },
  slotTimeRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.text,
  },
  slotMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  slotLocCount: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  slotMetaSep: {
    fontSize: 12,
    color: "#d0d8e0",
  },
  slotCommitCount: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: 500,
  },
  slotToggles: {
    display: "flex",
    gap: 5,
    flexShrink: 0,
  },
  slotToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: `1.5px solid ${COLORS.border}`,
    background: COLORS.fieldBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7a8a9a",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: FONTS.base,
    padding: 0,
  },
  slotToggleBtnWorks: {
    borderColor: "#43a047",
    background: "#43a047",
    color: "#fff",
  },
  slotToggleBtnDoesntWork: {
    borderColor: "#e53935",
    background: "#e53935",
    color: "#fff",
  },
  slotToggleBtnProposed: {
    borderColor: "#f9a825",
    background: "#f9a825",
    color: "#fff",
  },
  slotCardProposed: {
    borderColor: "#ffe082",
    background: "#fffde7",
  },
  adjustedBadge: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.blueLight,
    background: "#e3f0ff",
    padding: "1px 6px",
    borderRadius: 4,
    marginLeft: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  // Expanded panel
  expandedPanel: {
    borderTop: `1px solid ${COLORS.borderLight}`,
    padding: "8px 14px 10px 24px",
    background: "#fafbfc",
  },
  locRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "7px 10px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    fontFamily: FONTS.base,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  locRowExcluded: {
    opacity: 0.6,
  },
  locCommutePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: "#eef2f7",
    color: "#5a6a7a",
    flexShrink: 0,
  },
  // Slot timeline
  slotTimelineWrap: {
    padding: "10px 14px 12px 24px",
    borderTop: `1px solid ${COLORS.borderLight}`,
    background: "#f5f7fa",
  },
  slotTimelineHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  slotTimelineLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  slotTimelineReset: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.blueLight,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: FONTS.base,
    padding: "2px 6px",
    borderRadius: 4,
  },
  slotTimelineWarning: {
    fontSize: 12,
    color: "#e65100",
    background: "#fff8f0",
    border: "1px solid #ffe0b2",
    borderRadius: 8,
    padding: "8px 12px",
    lineHeight: 1.4,
  },
  slotTimelineBar: {
    position: "relative",
    height: 32,
    borderRadius: 8,
    background: "#e8ecf0",
    overflow: "hidden",
  },
  slotBusyRow: {
    position: "relative",
    height: 6,
    marginTop: 2,
  },
  slotTimelineLabels: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
    padding: "0 2px",
  },
  // Gathering overview
  overviewSection: {
    padding: "0 28px 20px",
    marginBottom: 0,
  },
  overviewBlock: {
    marginBottom: 14,
  },
  responseHeader: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  responseCount: {
    fontWeight: 700,
    color: COLORS.text,
    fontSize: 14,
  },
  responseBarTrack: {
    height: 6,
    borderRadius: 3,
    background: "#e8ecf0",
    overflow: "hidden",
  },
  responseBarFill: {
    height: "100%",
    borderRadius: 3,
    background: COLORS.blueLight,
    transition: "width 0.3s ease",
  },
  quorumHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  quorumBarList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  quorumBarRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  quorumBarDayLabel: {
    width: 30,
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.textMuted,
    textAlign: "right",
  },
  quorumBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    background: "#e8ecf0",
    overflow: "hidden",
  },
  quorumBarFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  quorumBarCount: {
    width: 28,
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.textMuted,
    textAlign: "right",
  },
  overviewCallout: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    background: "#fffde7",
    border: "1.5px solid #ffe082",
    fontSize: 13,
    fontWeight: 600,
    color: "#f57f17",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  overviewLocLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  overviewLocList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  overviewLocCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid ${COLORS.borderLight}`,
    background: "#fafbfc",
  },
  overviewLocCheck: {
    flexShrink: 0,
  },
  overviewLocName: {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: 1,
  },
  overviewLocAddr: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  overviewLocDirections: {
    fontSize: 12,
    color: COLORS.blueLight,
    fontWeight: 500,
    borderBottom: `1px dashed ${COLORS.blueLight}`,
    cursor: "pointer",
  },
  commuteInputWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 10px",
    borderRadius: 8,
    border: `1.5px solid ${COLORS.border}`,
    background: "#fff",
    flexShrink: 0,
  },
  commuteInputField: {
    width: 34,
    border: "none",
    outline: "none",
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
    background: "transparent",
    color: COLORS.text,
    fontFamily: FONTS.base,
    MozAppearance: "textfield",
  },
  commuteInputUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: 500,
  },
  // Summary bar
  summaryBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    borderTop: `1px solid ${COLORS.borderLight}`,
    marginTop: 0,
  },
  summaryText: {
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  submitBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    background: GRADIENTS.greenBtn,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONTS.base,
  },
  submitBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  backToHomeBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    background: GRADIENTS.primaryBtn,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONTS.base,
  },
  // Rank screen styles
  rankSlotsRow: { display: "flex", gap: 10, marginBottom: 20 },
  rankSlot: { flex: 1, padding: "12px 10px", borderRadius: 12, border: "2px dashed #d0d8e0", minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", transition: "all 0.2s" },
  rankSlotFilled: { borderStyle: "solid" },
  rankSlotLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  rankSlotContent: { fontSize: 12, fontWeight: 600, color: COLORS.text, lineHeight: 1.4 },
  rankSlotEmpty: { fontSize: 12, color: "#b0bac5", fontStyle: "italic" },
  rankOptionCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${COLORS.borderLight}`, background: "#fff", cursor: "pointer", fontFamily: FONTS.base, transition: "all 0.2s", width: "100%", textAlign: "left" },
  rankBadge: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 },
  proposedNewBadge: { fontSize: 10, fontWeight: 700, color: "#f57f17", background: "#fff8e1", padding: "1px 6px", borderRadius: 4 },
  // Form inputs
  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 },
  fieldHint: { fontWeight: 400, color: COLORS.textLight },
  fieldNote: { fontSize: 12, color: COLORS.textLight, marginTop: 6, lineHeight: 1.4 },
  dateInput: { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontWeight: 500, color: COLORS.text, background: COLORS.fieldBg, fontFamily: FONTS.base, outline: "none", boxSizing: "border-box" },
  textArea: { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.fieldBg, fontFamily: FONTS.base, outline: "none", minHeight: 80, resize: "vertical", lineHeight: 1.5, boxSizing: "border-box" },
  // Navigation row
  navRow: { display: "flex", alignItems: "center", padding: "16px 28px", borderTop: `1px solid ${COLORS.borderLight}`, gap: 12 },
  navBackBtn: { display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, fontSize: 14, fontWeight: 500, fontFamily: FONTS.base, padding: "8px 4px" },
  publishBtn: { padding: "10px 24px", borderRadius: 10, border: "none", background: GRADIENTS.greenBtn, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONTS.base },
  // Confirmation styles
  confirmBody: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 32px", textAlign: "center" },
  confirmTitle: { fontSize: 22, fontWeight: 700, color: COLORS.text, margin: "0 0 10px" },
  confirmSub: { fontSize: 15, color: COLORS.textMuted, lineHeight: 1.6, maxWidth: 400, margin: "0 0 24px" },
  confirmStats: { display: "flex", gap: 24, alignItems: "center" },
  confirmStat: { display: "flex", flexDirection: "column", gap: 4, alignItems: "center" },
  confirmStatLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: 500 },
  confirmStatValue: { fontSize: 20, fontWeight: 700, color: COLORS.text },
  confirmStatDivider: { width: 1, height: 32, background: "#e8ecf0" },
  quorumCallout: { display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "#fffde7", border: "1.5px solid #ffe082", fontSize: 13, fontWeight: 600, color: "#f57f17", lineHeight: 1.4 },
};
