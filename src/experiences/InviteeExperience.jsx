import { useState, useEffect } from "react";
import { COLORS, GRADIENTS, FONTS } from "../shared/styles";

// --- Mock Gathering Data (what the host published) ---
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

// --- Mock Invitee Calendar Data ---
const INVITEE_EVENTS_WEEKDAY = [
  { start: 8.5, end: 9.5, title: "Morning workout", color: "#0b8043" },
  { start: 11, end: 12, title: "Client call", color: "#4285f4" },
  { start: 12.5, end: 13, title: "Lunch", color: "#7986cb" },
  { start: 15, end: 16, title: "Team retro", color: "#e67c73" },
];

const INVITEE_EVENTS_VARIANTS = [
  [
    { start: 9, end: 10.5, title: "All-hands meeting", color: "#4285f4" },
    { start: 11, end: 12, title: "Dentist appointment", color: "#f4511e" },
    { start: 12.5, end: 13, title: "Lunch", color: "#7986cb" },
    { start: 14, end: 15, title: "Design sync", color: "#e67c73" },
  ],
  [
    { start: 9.5, end: 10, title: "Standup", color: "#4285f4" },
    { start: 12, end: 13, title: "Lunch with friend", color: "#0b8043" },
    { start: 13.5, end: 15, title: "Deep work block", color: "#7986cb" },
    { start: 15.5, end: 17, title: "Workshop", color: "#e67c73" },
  ],
  [
    { start: 10, end: 10.5, title: "Quick sync", color: "#4285f4" },
    { start: 12, end: 12.5, title: "Lunch", color: "#7986cb" },
  ],
  [
    { start: 8, end: 9.5, title: "Yoga class", color: "#0b8043" },
    { start: 10, end: 11, title: "Product review", color: "#e67c73" },
    { start: 11.5, end: 12.5, title: "Interview panel", color: "#4285f4" },
    { start: 13, end: 14, title: "Lunch meeting", color: "#7986cb" },
    { start: 14.5, end: 16, title: "Strategy planning", color: "#f4511e" },
    { start: 16.5, end: 17.5, title: "Errands", color: "#0b8043" },
  ],
];

const INVITEE_EVENTS_WEEKEND = [
  { start: 9, end: 10.5, title: "Gym", color: "#0b8043" },
  { start: 14, end: 15, title: "Grocery run", color: "#7986cb" },
];

// --- Utility functions ---
function seededRandom(dateKey) {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) { h = ((h << 5) - h + dateKey.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function formatHour(h) {
  const hr = Math.floor(h);
  const min = h % 1 === 0.5 ? "30" : "00";
  const ampm = hr >= 12 ? "PM" : "AM";
  const display = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${display}:${min} ${ampm}`;
}

function parseTimeToHour(timeStr) {
  if (!timeStr) return 9;
  const [time, ampm] = timeStr.split(" ");
  let [hr, min] = time.split(":").map(Number);
  if (ampm === "PM" && hr !== 12) hr += 12;
  if (ampm === "AM" && hr === 12) hr = 0;
  return hr + min / 60;
}

function getFreeGaps(events, windowStart, windowEnd) {
  const sorted = [...events].filter(e => e.end > windowStart && e.start < windowEnd).sort((a, b) => a.start - b.start);
  const gaps = [];
  let cursor = windowStart;
  for (const ev of sorted) {
    if (ev.start > cursor) gaps.push({ start: cursor, end: ev.start });
    cursor = Math.max(cursor, ev.end);
  }
  if (cursor < windowEnd) gaps.push({ start: cursor, end: windowEnd });
  return gaps;
}

function getInviteeMockEventsForDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay();
  if (dow === 0 || dow === 6) {
    return seededRandom(dateKey + "inv") % 3 === 0 ? INVITEE_EVENTS_WEEKEND : [];
  }
  const seed = seededRandom(dateKey + "inv");
  if (seed % 5 === 0) return INVITEE_EVENTS_WEEKDAY;
  return INVITEE_EVENTS_VARIANTS[seed % INVITEE_EVENTS_VARIANTS.length];
}

function getOptionAvailability(option) {
  const events = getInviteeMockEventsForDate(option.date);
  const startHr = parseTimeToHour(option.timeStart);
  const endHr = parseTimeToHour(option.timeEnd);
  const gaps = getFreeGaps(events, startHr, endHr);
  const durationHours = MOCK_GATHERING.duration / 60;
  const totalFreeHours = gaps.reduce((sum, g) => sum + (g.end - g.start), 0);
  const windowHours = endHr - startHr;
  const fullyFree = totalFreeHours >= windowHours - 0.01;
  const fitsOnce = gaps.some(g => (g.end - g.start) >= durationHours);

  let level;
  if (fullyFree) level = "green";
  else if (fitsOnce) level = "amber";
  else level = "red";

  const items = [];
  let cursor = startHr;
  const sorted = [...events].filter(e => e.end > startHr && e.start < endHr).sort((a, b) => a.start - b.start);
  for (const ev of sorted) {
    const evStart = Math.max(ev.start, startHr);
    const evEnd = Math.min(ev.end, endHr);
    if (evStart > cursor) {
      const gapDur = evStart - cursor;
      const fits = gapDur >= durationHours;
      items.push({ type: fits ? "green" : "amber", label: `${formatHour(cursor)}\u2013${formatHour(evStart)} \u2014 Free (${Math.round(gapDur * 60)} min)` });
    }
    items.push({ type: "red", label: `${formatHour(evStart)}\u2013${formatHour(evEnd)} \u2014 ${ev.title}` });
    cursor = Math.max(cursor, evEnd);
  }
  if (cursor < endHr) {
    const gapDur = endHr - cursor;
    const fits = gapDur >= durationHours;
    items.push({ type: fits ? "green" : "amber", label: `${formatHour(cursor)}\u2013${formatHour(endHr)} \u2014 Free (${Math.round(gapDur * 60)} min)` });
  }

  return { level, items };
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getDefaultExpiration() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getMaxExpiration() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}

// --- Icons ---
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

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M9 5V9L12 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M9 16C9 16 15 11.5 15 7C15 3.68629 12.3137 1 9 1C5.68629 1 3 3.68629 3 7C3 11.5 9 16 9 16Z" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="9" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <circle cx="6.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 15C1 12 3.5 10 6.5 10C9.5 10 12 12 12 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="12.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M14 10.5C15.5 11 17 12.5 17 15" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const RANK_COLORS = [
  { bg: "#fffde7", border: "#f9a825", badge: "#f9a825", label: "1st choice" },
  { bg: "#fafafa", border: "#90a4ae", badge: "#78909c", label: "2nd choice" },
  { bg: "#fef6f0", border: "#bc8f6f", badge: "#a1887f", label: "3rd choice" },
];

const BULLET_COLORS = { green: "#43a047", amber: "#f9a825", red: "#e53935" };

// --- Sub-components ---

function AvailabilityPopover({ option, style }) {
  const info = getOptionAvailability(option);
  return (
    <div style={{ ...styles.popover, ...style }} onClick={(e) => e.stopPropagation()}>
      <div style={styles.popoverHeader}>
        <span style={styles.popoverTitle}>{formatDate(option.date)}</span>
        <span style={styles.popoverBadge}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: 4 }}>
            <circle cx="5" cy="5" r="4" stroke="#4285f4" strokeWidth="1.2"/><path d="M5 3V5.5L6.5 6.5" stroke="#4285f4" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Your Calendar
        </span>
      </div>
      <div style={styles.popoverWindow}>
        <span>{option.timeStart} \u2014 {option.timeEnd}</span>
      </div>
      <ul style={styles.popoverList}>
        {info.items.map((item, i) => (
          <li key={i} style={styles.popoverListItem}>
            <div style={{ ...styles.popoverBullet, background: BULLET_COLORS[item.type] }} />
            <span style={styles.popoverItemText}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OptionCard({ option, selection, onSelect, calendarConnected }) {
  const [showPopover, setShowPopover] = useState(false);
  const avail = calendarConnected ? getOptionAvailability(option) : null;
  const isWorks = selection === "works";
  const isDoesntWork = selection === "doesnt-work";

  const availPillStyle = avail ? (
    avail.level === "green" ? styles.availPillGreen :
    avail.level === "amber" ? styles.availPillAmber : styles.availPillRed
  ) : null;

  const availLabel = avail ? (
    avail.level === "green" ? "Fully free" :
    avail.level === "amber" ? "Conflict, but fits" : "Busy during this time"
  ) : null;

  return (
    <div style={{
      ...styles.optionCard,
      ...(isWorks ? styles.optionCardWorks : {}),
      ...(isDoesntWork ? styles.optionCardDoesntWork : {}),
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ color: "#7a8a9a", marginTop: 2 }}><MapPinIcon /></div>
        <div style={{ flex: 1 }}>
          <div style={styles.optionLocName}>{option.locationName}</div>
          <div style={styles.optionLocAddr}>{option.locationAddr}</div>
          {avail && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{ ...styles.availPill, ...availPillStyle, cursor: "pointer" }}
                onMouseEnter={() => setShowPopover(true)}
                onMouseLeave={() => setShowPopover(false)}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: BULLET_COLORS[avail.level] }} />
                {availLabel}
              </div>
              {showPopover && (
                <AvailabilityPopover option={option} style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, zIndex: 100 }} />
              )}
            </div>
          )}
        </div>
      </div>
      <div style={styles.toggleRow}>
        <button
          onClick={() => onSelect(option.id, isWorks ? null : "works")}
          style={{ ...styles.toggleBtn, ...(isWorks ? styles.toggleBtnWorks : {}) }}
        >
          <CheckIcon /> Works
        </button>
        <button
          onClick={() => onSelect(option.id, isDoesntWork ? null : "doesnt-work")}
          style={{ ...styles.toggleBtn, ...(isDoesntWork ? styles.toggleBtnDoesntWork : {}) }}
        >
          <XIcon /> Doesn't work
        </button>
      </div>
    </div>
  );
}

// --- Main component ---
export default function InviteeExperience({ onBack }) {
  const [screen, setScreen] = useState(1);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarSkipped, setCalendarSkipped] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selections, setSelections] = useState({});
  const [rankings, setRankings] = useState([null, null, null]);
  const [expirationDate, setExpirationDate] = useState(getDefaultExpiration());
  const [notes, setNotes] = useState("");

  const worksOptions = MOCK_OPTIONS.filter(opt => selections[opt.id] === "works");
  const worksCount = worksOptions.length;
  const doesntWorkCount = Object.values(selections).filter(v => v === "doesnt-work").length;

  // Group options by date
  const optionsByDate = {};
  for (const opt of MOCK_OPTIONS) {
    if (!optionsByDate[opt.date]) optionsByDate[opt.date] = [];
    optionsByDate[opt.date].push(opt);
  }
  const sortedDates = Object.keys(optionsByDate).sort();

  // Adapt rank slot count to available options
  const maxRanks = Math.min(3, worksCount);

  // Clear invalid rankings when works selections change
  useEffect(() => {
    const worksIds = new Set(worksOptions.map(o => o.id));
    setRankings(prev => prev.map(id => (id && !worksIds.has(id)) ? null : id));
  }, [worksCount]);

  const handleSelect = (optionId, value) => {
    setSelections(prev => ({ ...prev, [optionId]: value }));
  };

  const handleConnectGoogle = () => {
    setCalendarLoading(true);
    setTimeout(() => {
      setCalendarConnected(true);
      setCalendarLoading(false);
    }, 800);
  };

  const handleRankToggle = (optionId) => {
    const currentIndex = rankings.indexOf(optionId);
    if (currentIndex !== -1) {
      const next = [...rankings];
      next[currentIndex] = null;
      setRankings(next);
    } else {
      const emptyIndex = rankings.findIndex((r, i) => r === null && i < maxRanks);
      if (emptyIndex !== -1) {
        const next = [...rankings];
        next[emptyIndex] = optionId;
        setRankings(next);
      }
    }
  };

  const handleUnassignSlot = (slotIndex) => {
    const next = [...rankings];
    next[slotIndex] = null;
    setRankings(next);
  };

  const filledRanks = rankings.filter(Boolean).length;
  const canContinue = worksCount >= 1;
  const canSubmit = filledRanks >= 1;

  const quorumProgress = MOCK_GATHERING.responsesReceived / MOCK_GATHERING.quorum;

  // --- Confirmation state ---
  if (screen === 3) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.confirmBody}>
            <div style={{ marginBottom: 20 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#E8F5E9" stroke="#43A047" strokeWidth="2"/>
                <path d="M15 25L21 31L33 17" stroke="#43A047" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={styles.confirmTitle}>Response Submitted!</h2>
            <p style={styles.confirmSub}>
              You ranked <strong>{filledRanks} preference{filledRanks !== 1 ? "s" : ""}</strong> from {worksCount} available option{worksCount !== 1 ? "s" : ""}.
              {expirationDate && <><br/>Your availability expires <strong>{new Date(expirationDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.</>}
            </p>
            <div style={styles.confirmStats}>
              <div style={styles.confirmStat}>
                <span style={styles.confirmStatLabel}>Quorum progress</span>
                <span style={styles.confirmStatValue}>{MOCK_GATHERING.responsesReceived + 1} / {MOCK_GATHERING.quorum}</span>
              </div>
              <div style={styles.confirmStatDivider} />
              <div style={styles.confirmStat}>
                <span style={styles.confirmStatLabel}>Your #1 pick</span>
                <span style={{ ...styles.confirmStatValue, fontSize: 14 }}>
                  {rankings[0] ? (() => {
                    const opt = MOCK_OPTIONS.find(o => o.id === rankings[0]);
                    return opt ? `${formatDate(opt.date)}, ${opt.locationName.split(" \u2014 ")[0]}` : "";
                  })() : "\u2014"}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6, marginTop: 16 }}>
              The host will notify you when quorum is reached and the gathering is confirmed.
            </p>
            <button
              style={{ ...styles.primaryBtn, marginTop: 24, maxWidth: 240 }}
              onClick={() => { setScreen(1); setSelections({}); setRankings([null, null, null]); setExpirationDate(getDefaultExpiration()); setNotes(""); }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
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
          <p style={styles.subtitle}>Respond to your invitation</p>
        </div>

        {/* Step indicator */}
        <div style={styles.stepRow}>
          <div style={styles.stepItem}>
            <div style={{ ...styles.stepDot, ...(screen === 1 ? styles.stepDotActive : styles.stepDotDone) }}>
              {screen > 1 ? <CheckIcon /> : <span style={{ fontSize: 13, fontWeight: 700 }}>1</span>}
            </div>
            <span style={{ ...styles.stepLabel, ...(screen === 1 ? styles.stepLabelActive : styles.stepLabelDone) }}>Select</span>
          </div>
          <div style={{ ...styles.stepLine, ...(screen > 1 ? styles.stepLineDone : {}) }} />
          <div style={styles.stepItem}>
            <div style={{ ...styles.stepDot, ...(screen === 2 ? styles.stepDotActive : {}) }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>2</span>
            </div>
            <span style={{ ...styles.stepLabel, ...(screen === 2 ? styles.stepLabelActive : {}) }}>Rank</span>
          </div>
        </div>

        {/* Content */}
        <div style={styles.stepContent}>
          {/* Gathering info header (both screens) */}
          <div style={styles.gatheringInfo}>
            <div style={styles.gatheringTitle}>{MOCK_GATHERING.title}</div>
            <div style={styles.gatheringMeta}>
              <span style={styles.gatheringMetaItem}><ClockIcon /> {MOCK_GATHERING.duration} min</span>
              <span style={styles.gatheringMetaItem}><MapPinIcon /> {MOCK_GATHERING.format}</span>
              <span style={styles.gatheringMetaItem}><UsersIcon /> Hosted by {MOCK_GATHERING.hostName}</span>
            </div>
            <div style={styles.quorumRow}>
              <span style={styles.quorumLabel}>{MOCK_GATHERING.responsesReceived} of {MOCK_GATHERING.quorum} responses needed</span>
              <div style={styles.quorumBar}>
                <div style={{ ...styles.quorumBarFill, width: `${Math.min(100, quorumProgress * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Screen 1: Selection */}
          {screen === 1 && (
            <div>
              {/* Google Calendar section */}
              {!calendarSkipped && !calendarConnected && (
                <div style={styles.calSection}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <GoogleIcon />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>Connect your calendar</div>
                      <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.4 }}>See your availability against each option to make better decisions.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button onClick={handleConnectGoogle} style={styles.googleBtn} disabled={calendarLoading}>
                      <GoogleIcon />
                      {calendarLoading ? "Connecting..." : "Sign in with Google"}
                    </button>
                    <button onClick={() => setCalendarSkipped(true)} style={styles.skipBtn}>Skip for now</button>
                  </div>
                </div>
              )}

              {calendarConnected && (
                <div style={styles.calSectionConnected}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#43a047", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckIcon />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#2e7d32" }}>Connected as alex.johnson@gmail.com</span>
                    </div>
                    <button onClick={() => { setCalendarConnected(false); setCalendarSkipped(true); }} style={{ ...styles.skipBtn, color: "#5a6a7a", textDecoration: "none", fontSize: 12 }}>Disconnect</button>
                  </div>
                </div>
              )}

              <h3 style={styles.screenTitle}>What works for you?</h3>
              <p style={styles.screenDesc}>Review each option and mark whether it works for your schedule.</p>

              {sortedDates.map((date, dateIdx) => {
                const opts = optionsByDate[date];
                const accent = ["#2e86c1", "#e67e22", "#8e44ad", "#43a047"][dateIdx % 4];
                return (
                  <div key={date} style={{ marginBottom: 20 }}>
                    <div style={{ ...styles.dateGroupHeader, borderLeft: `3px solid ${accent}`, paddingLeft: 12 }}>
                      <span style={styles.dateLabel}>{formatDate(date)}</span>
                      <span style={styles.dateTime}>{opts[0].timeStart} \u2013 {opts[0].timeEnd}</span>
                    </div>
                    {opts.map(opt => (
                      <OptionCard
                        key={opt.id}
                        option={opt}
                        selection={selections[opt.id] || null}
                        onSelect={handleSelect}
                        calendarConnected={calendarConnected}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Screen 2: Ranking */}
          {screen === 2 && (
            <div>
              <h3 style={styles.screenTitle}>Rank your preferences</h3>
              <p style={styles.screenDesc}>Tap options to assign your top {maxRanks > 1 ? maxRanks : ""} choice{maxRanks !== 1 ? "s" : ""}.</p>

              {/* Rank slots */}
              <div style={styles.rankSlotsRow}>
                {Array.from({ length: maxRanks }).map((_, i) => {
                  const optId = rankings[i];
                  const opt = optId ? MOCK_OPTIONS.find(o => o.id === optId) : null;
                  const rc = RANK_COLORS[i];
                  return (
                    <div
                      key={i}
                      onClick={() => optId && handleUnassignSlot(i)}
                      style={{
                        ...styles.rankSlot,
                        ...(opt ? { ...styles.rankSlotFilled, borderColor: rc.border, background: rc.bg, cursor: "pointer" } : {}),
                      }}
                    >
                      <div style={{ ...styles.rankSlotLabel, color: rc.badge }}>{rc.label}</div>
                      {opt ? (
                        <div style={styles.rankSlotContent}>
                          <div>{formatDate(opt.date)}</div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{opt.locationName.split(" \u2014 ")[0]}</div>
                        </div>
                      ) : (
                        <div style={styles.rankSlotEmpty}>Tap below</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rankable options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {worksOptions.map(opt => {
                  const rankIndex = rankings.indexOf(opt.id);
                  const isRanked = rankIndex !== -1;
                  const allSlotsFull = rankings.slice(0, maxRanks).every(Boolean);
                  const rc = isRanked ? RANK_COLORS[rankIndex] : null;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleRankToggle(opt.id)}
                      style={{
                        ...styles.rankOptionCard,
                        ...(isRanked ? { borderColor: rc.border, background: rc.bg } : {}),
                        ...(!isRanked && allSlotsFull ? { opacity: 0.45, cursor: "default" } : {}),
                      }}
                    >
                      {isRanked && (
                        <div style={{ ...styles.rankBadge, background: rc.badge }}>{rankIndex + 1}</div>
                      )}
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                          {formatDate(opt.date)} &middot; {opt.timeStart} \u2013 {opt.timeEnd}
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{opt.locationName}</div>
                      </div>
                      {isRanked && (
                        <div style={{ color: COLORS.textLight, fontSize: 11 }}>tap to remove</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Expiration */}
              <div style={styles.expirationSection}>
                <label style={styles.fieldLabel}>My availability expires on</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={getTomorrowDate()}
                  max={getMaxExpiration()}
                  style={styles.dateInput}
                />
                <p style={styles.fieldNote}>After this date, the host will know your selections may no longer be valid.</p>
              </div>

              {/* Notes */}
              <div style={{ marginTop: 20 }}>
                <label style={styles.fieldLabel}>Notes <span style={styles.fieldHint}>(optional)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any constraints or preferences the host should know about..."
                  style={styles.textArea}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={styles.navRow}>
          {screen === 2 && <button onClick={() => setScreen(1)} style={styles.backBtn}>Back</button>}
          <div style={{ flex: 1 }} />
          {screen === 1 ? (
            <button
              onClick={() => canContinue && setScreen(2)}
              style={{ ...styles.primaryBtn, ...(canContinue ? {} : styles.primaryBtnDisabled) }}
              disabled={!canContinue}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => canSubmit && setScreen(3)}
              style={{ ...styles.publishBtn, ...(canSubmit ? {} : styles.primaryBtnDisabled) }}
              disabled={!canSubmit}
            >
              Submit Response
            </button>
          )}
        </div>

        {/* Selection summary footer (Screen 1) */}
        {screen === 1 && (worksCount > 0 || doesntWorkCount > 0) && (
          <div style={styles.selectionFooter}>
            <div style={styles.selectionCount}>
              {worksCount > 0 && <span style={{ color: "#43a047", fontWeight: 600 }}>{worksCount} work{worksCount !== 1 ? "" : "s"}</span>}
              {doesntWorkCount > 0 && <span style={{ color: "#e53935", fontWeight: 600 }}>{doesntWorkCount} don't work</span>}
            </div>
            <span style={{ fontSize: 12, color: COLORS.textLight }}>{MOCK_OPTIONS.length - worksCount - doesntWorkCount} remaining</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: { minHeight: "100vh", background: GRADIENTS.background, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", fontFamily: FONTS.base },
  card: { background: COLORS.cardBg, borderRadius: 20, maxWidth: 660, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)", overflow: "hidden" },
  header: { padding: "32px 32px 20px", borderBottom: "1px solid #f0f0f0" },
  backToHub: { display: "flex", alignItems: "center", background: "none", border: "none", color: COLORS.textMuted, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "0 0 14px", fontFamily: FONTS.base, transition: "color 0.2s" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  logo: { width: 36, height: 36, borderRadius: 10, background: GRADIENTS.primaryBtn, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, letterSpacing: -0.5 },
  logoText: { fontSize: 20, fontWeight: 700, color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, margin: "4px 0 0" },

  // Step indicator
  stepRow: { display: "flex", alignItems: "center", padding: "24px 32px 8px", gap: 0 },
  stepItem: { display: "flex", alignItems: "center", gap: 8 },
  stepDot: { width: 36, height: 36, borderRadius: "50%", border: "2px solid #dde3ea", display: "flex", alignItems: "center", justifyContent: "center", color: "#b0bac5", flexShrink: 0, transition: "all 0.3s" },
  stepDotActive: { borderColor: "#2e86c1", color: "#2e86c1", background: "#eaf4fb" },
  stepDotDone: { borderColor: "#43a047", background: "#43a047", color: "#fff" },
  stepLabel: { fontSize: 12, fontWeight: 500, color: "#b0bac5", whiteSpace: "nowrap" },
  stepLabelActive: { color: COLORS.text, fontWeight: 600 },
  stepLabelDone: { color: "#43a047" },
  stepLine: { flex: 1, height: 2, background: "#e8ecf0", margin: "0 8px", borderRadius: 1, transition: "background 0.3s" },
  stepLineDone: { background: "#43a047" },
  stepContent: { padding: "24px 32px", minHeight: 300 },

  // Gathering info
  gatheringInfo: { padding: "16px 20px", background: "#f5f7fa", borderRadius: 14, marginBottom: 20 },
  gatheringTitle: { fontSize: 17, fontWeight: 700, color: COLORS.text, margin: "0 0 8px", letterSpacing: -0.2 },
  gatheringMeta: { display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#5a6a7a", marginBottom: 12 },
  gatheringMetaItem: { display: "flex", alignItems: "center", gap: 5 },
  quorumRow: { display: "flex", alignItems: "center", gap: 10 },
  quorumLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: 500, whiteSpace: "nowrap" },
  quorumBar: { flex: 1, height: 4, borderRadius: 2, background: "#e0e5eb", overflow: "hidden" },
  quorumBarFill: { height: "100%", borderRadius: 2, background: COLORS.blueLight, transition: "width 0.3s" },

  // Google Calendar
  calSection: { padding: "16px 18px", borderRadius: 14, border: `1.5px solid ${COLORS.borderLight}`, background: COLORS.fieldBg, marginBottom: 20 },
  calSectionConnected: { padding: "12px 18px", borderRadius: 14, border: "1.5px solid #a5d6a7", background: "#e8f5e9", marginBottom: 20 },
  googleBtn: { display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 10, border: "1.5px solid #dadce0", background: "#fff", fontSize: 14, fontWeight: 500, color: "#3c4043", cursor: "pointer", fontFamily: FONTS.base, transition: "all 0.2s" },
  skipBtn: { background: "none", border: "none", fontSize: 13, color: COLORS.textMuted, cursor: "pointer", fontFamily: FONTS.base, textDecoration: "underline" },

  // Screen titles
  screenTitle: { fontSize: 17, fontWeight: 700, color: COLORS.text, margin: "0 0 6px", letterSpacing: -0.2 },
  screenDesc: { fontSize: 14, color: COLORS.textMuted, margin: "0 0 16px", lineHeight: 1.5 },

  // Date groups
  dateGroupHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0 8px 0", marginBottom: 8 },
  dateLabel: { fontSize: 14, fontWeight: 700, color: COLORS.text },
  dateTime: { fontSize: 13, color: COLORS.textMuted, fontWeight: 500 },

  // Option cards
  optionCard: { padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${COLORS.borderLight}`, background: "#fff", marginBottom: 8, transition: "all 0.2s" },
  optionCardWorks: { borderColor: "#a5d6a7", background: "#f1f8e9" },
  optionCardDoesntWork: { borderColor: "#ffcdd2", background: "#fff5f5", opacity: 0.65 },
  optionLocName: { fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 2 },
  optionLocAddr: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6 },

  // Availability pill
  availPill: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, marginBottom: 8 },
  availPillGreen: { background: "#e8f5e9", color: "#2e7d32" },
  availPillAmber: { background: "#fff8e1", color: "#f57f17" },
  availPillRed: { background: "#ffebee", color: "#c62828" },

  // Popover
  popover: { width: 260, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)", padding: 0, overflow: "hidden", cursor: "default" },
  popoverHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #f0f0f0", background: "#fafbfc" },
  popoverTitle: { fontSize: 13, fontWeight: 700, color: COLORS.text },
  popoverBadge: { display: "flex", alignItems: "center", fontSize: 10, color: "#4285f4", fontWeight: 600, background: "#e8f0fe", padding: "2px 8px", borderRadius: 10 },
  popoverWindow: { padding: "6px 14px", background: "#f5f7fa", fontSize: 11, color: "#6a7585", fontWeight: 600, borderBottom: "1px solid #f0f0f0" },
  popoverList: { listStyle: "none", padding: "8px 14px 10px", margin: 0, display: "flex", flexDirection: "column", gap: 5 },
  popoverListItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.text, lineHeight: 1.3 },
  popoverBullet: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  popoverItemText: { fontSize: 11, color: "#4a5568" },

  // Toggle buttons
  toggleRow: { display: "flex", gap: 8, marginTop: 10 },
  toggleBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, background: COLORS.fieldBg, fontSize: 13, fontWeight: 600, color: "#4a5568", cursor: "pointer", fontFamily: FONTS.base, transition: "all 0.2s" },
  toggleBtnWorks: { borderColor: "#43a047", background: "#43a047", color: "#fff" },
  toggleBtnDoesntWork: { borderColor: "#e53935", background: "#e53935", color: "#fff" },

  // Selection footer
  selectionFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 32px 16px", borderTop: "1px solid #f0f0f0", background: "#f9fafb" },
  selectionCount: { display: "flex", gap: 16, fontSize: 13 },

  // Rank slots
  rankSlotsRow: { display: "flex", gap: 10, marginBottom: 20 },
  rankSlot: { flex: 1, padding: "12px 10px", borderRadius: 12, border: "2px dashed #d0d8e0", minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", transition: "all 0.2s" },
  rankSlotFilled: { borderStyle: "solid" },
  rankSlotLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  rankSlotContent: { fontSize: 12, fontWeight: 600, color: COLORS.text, lineHeight: 1.4 },
  rankSlotEmpty: { fontSize: 12, color: "#b0bac5", fontStyle: "italic" },

  // Rank option cards
  rankOptionCard: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${COLORS.borderLight}`, background: "#fff", cursor: "pointer", fontFamily: FONTS.base, transition: "all 0.2s", width: "100%", textAlign: "left" },
  rankBadge: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 },

  // Expiration & notes
  expirationSection: { marginTop: 24, paddingTop: 20, borderTop: "1px solid #eef1f5" },
  fieldLabel: { fontSize: 13, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 6 },
  fieldHint: { fontWeight: 400, color: COLORS.textLight },
  fieldNote: { fontSize: 12, color: COLORS.textLight, marginTop: 6 },
  dateInput: { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, fontWeight: 500, color: COLORS.text, background: COLORS.fieldBg, fontFamily: FONTS.base, outline: "none" },
  textArea: { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 14, color: COLORS.text, background: COLORS.fieldBg, fontFamily: FONTS.base, outline: "none", minHeight: 80, resize: "vertical", lineHeight: 1.5 },

  // Navigation
  navRow: { display: "flex", alignItems: "center", padding: "16px 32px 28px", gap: 12 },
  backBtn: { padding: "11px 24px", borderRadius: 10, border: `1.5px solid ${COLORS.border}`, background: "#fff", fontSize: 14, fontWeight: 600, color: "#4a5568", cursor: "pointer", fontFamily: FONTS.base, transition: "all 0.2s" },
  primaryBtn: { padding: "11px 28px", borderRadius: 10, border: "none", background: GRADIENTS.primaryBtn, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: FONTS.base, transition: "all 0.2s", boxShadow: "0 2px 8px rgba(26,82,118,0.25)" },
  primaryBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  publishBtn: { padding: "11px 28px", borderRadius: 10, border: "none", background: GRADIENTS.greenBtn, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: FONTS.base, transition: "all 0.2s", boxShadow: "0 2px 8px rgba(30,126,52,0.25)" },

  // Confirmation
  confirmBody: { display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 32px", textAlign: "center" },
  confirmTitle: { fontSize: 22, fontWeight: 700, color: COLORS.text, margin: "0 0 10px" },
  confirmSub: { fontSize: 15, color: COLORS.textMuted, lineHeight: 1.6, maxWidth: 400, margin: "0 0 24px" },
  confirmStats: { display: "flex", gap: 24, alignItems: "center" },
  confirmStat: { display: "flex", flexDirection: "column", gap: 4, alignItems: "center" },
  confirmStatLabel: { fontSize: 12, color: COLORS.textLight, fontWeight: 500 },
  confirmStatValue: { fontSize: 20, fontWeight: 700, color: COLORS.text },
  confirmStatDivider: { width: 1, height: 32, background: "#e8ecf0" },
};
