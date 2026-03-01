import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS, GRADIENTS, FONTS } from "../shared/styles";
import { QuorumCheckIcon, LocationMatchIcon, OverflowIcon, CalendarClockIcon } from "../shared/icons";
import EXPERIENCES from "../experiences/manifest";

// ── Icons ───────────────────────────────────────────────────

const BackArrow = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StepIcon = ({ number, filled }) => (
  <div style={{
    width: 32, height: 32, borderRadius: 16,
    background: filled ? COLORS.blueLight : "rgba(255,255,255,0.1)",
    color: filled ? "#fff" : "rgba(255,255,255,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  }}>
    {number}
  </div>
);

const SimpleScaleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="10" cy="16" r="3" stroke={COLORS.blueLight} strokeWidth="2" fill="none"/>
    <circle cx="22" cy="16" r="3" stroke={COLORS.blueLight} strokeWidth="2" fill="none"/>
    <circle cx="16" cy="8" r="3" stroke={COLORS.blueLight} strokeWidth="2" fill="none"/>
    <circle cx="16" cy="24" r="3" stroke={COLORS.blueLight} strokeWidth="2" fill="none"/>
    <path d="M13 14L14 10" stroke={COLORS.blueLight} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M19 14L18 10" stroke={COLORS.blueLight} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M13 18L14 22" stroke={COLORS.blueLight} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M19 18L18 22" stroke={COLORS.blueLight} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

// ── Data ────────────────────────────────────────────────────

const SOLUTIONS = [
  {
    icon: QuorumCheckIcon,
    title: "Quorum-based confirmation",
    desc: "Set a minimum attendance threshold. When enough people say yes, the gathering locks in \u2014 no more waiting for stragglers. And no one gets left behind: when a gathering fills to capacity, overflow sessions spin up automatically from remaining availability.",
  },
  {
    icon: LocationMatchIcon,
    title: "Locations as a first-class dimension",
    desc: "Venues have schedules too. Whether you control the space or it\u2019s a public resource, Quorum integrates location availability directly into the scheduling process \u2014 matching people, times, and places across all three dimensions at once.",
  },
  {
    icon: SimpleScaleIcon,
    title: "Radically simple for everyone",
    desc: "We require minimum input through intuitive interfaces and shift the complexity burden from humans to software. Whether it\u2019s a quick meetup or 200 people across 15 sessions and 5 time zones \u2014 the experience stays frictionless for hosts and participants alike.",
  },
];

const STEPS = [
  { num: 1, label: "Create", desc: "Host describes the gathering: title, duration, quorum threshold, capacity" },
  { num: 2, label: "Invite", desc: "Share a link. Invitees rank their preferred times and locations with minimal friction" },
  { num: 3, label: "Confirm", desc: "Quorum met? The gathering locks in. Excess demand spins up new sessions automatically" },
];

const VENUE_STAGES = [
  {
    stage: "Today",
    text: "Hosts can connect spaces they control \u2014 a living room, a community center, a coworking space \u2014 and Quorum manages their availability, automatically reserving slots when gatherings confirm.",
  },
  {
    stage: "Next",
    text: "Quorum expands into public spaces, starting with library meeting rooms in select cities. Every branch uses different booking software. Our agentic AI navigates each system so the host doesn\u2019t have to \u2014 discovering available rooms, comparing options, and booking automatically.",
  },
  {
    stage: "Future",
    text: "A robust venue network where spaces of all kinds \u2014 libraries, coworking hubs, community centers, private studios \u2014 are discoverable, bookable, and integrated into every scheduling decision.",
  },
];

const COMING_SOON = [
  "Calendar integration with popular platforms \u2014 availability informs options automatically",
  "Multi-timezone coordination for distributed groups with co-hosts",
  "Recurring and limited series that adapt as schedules shift",
  "Expanded venue network across cities",
];

// ── Helpers ─────────────────────────────────────────────────

const quorumExperiences = EXPERIENCES.filter((e) => e.app === "quorum");
const scenarioExps = quorumExperiences.filter((e) => e.category === "scenario");
const coreHostDemos = quorumExperiences.filter((e) => e.persona === "host" && !e.isExploration);
const explorationDemos = quorumExperiences.filter((e) => e.persona === "host" && e.isExploration);
const inviteeDemos = quorumExperiences.filter((e) => e.persona === "invitee");

// ── Components ──────────────────────────────────────────────

function SolutionBlock({ solution }) {
  const Icon = solution.icon;
  return (
    <div style={styles.solutionBlock}>
      <div style={styles.solutionIconWrap}>
        <Icon />
      </div>
      <div style={styles.solutionContent}>
        <h3 style={styles.solutionTitle}>{solution.title}</h3>
        <p style={styles.solutionDesc}>{solution.desc}</p>
      </div>
    </div>
  );
}

function DemoCard({ exp, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = exp.icon;
  return (
    <button
      onClick={() => onClick(exp.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.demoCard,
        ...(hovered ? styles.demoCardHover : {}),
      }}
    >
      <div style={styles.demoIconWrap}>
        <Icon />
      </div>
      <div style={styles.demoInfo}>
        <h4 style={styles.demoTitle}>{exp.pitchTitle || exp.title}</h4>
        <p style={styles.demoDesc}>{exp.pitchDescription || exp.description}</p>
      </div>
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────

export default function QuorumPitchPage() {
  const navigate = useNavigate();

  const handleExpClick = (expId) => {
    navigate(`/app/quorum/${expId}`);
  };

  return (
    <div style={styles.container}>
      {/* Back bar */}
      <div style={styles.backBar}>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          <BackArrow />
          <span>Back to Platopia</span>
        </button>
      </div>

      {/* ─── A. Hero ─── */}
      <section style={styles.hero}>
        <div style={styles.heroIconWrap}>
          <CalendarClockIcon />
        </div>
        <h1 style={styles.heroName}>Quorum</h1>
        <p style={styles.heroTagline}>Gathering potential.</p>
        <p style={styles.heroSubtitle}>
          Smart scheduling that brings groups together — effortlessly.
        </p>
      </section>

      {/* ─── B. The Problem ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionHeading}>
            Getting people in a room together shouldn't be this hard
          </h2>
          <div style={styles.problemContent}>
            <p style={styles.problemParagraph}>
              We're lonelier and more disconnected than ever. The antidote is simple — gather in
              person. But the tools we have make it needlessly difficult.
            </p>
            <p style={styles.problemParagraph}>
              Scheduling polls like Doodle and When2meet create endless back-and-forth that rarely
              resolves. They optimize for consensus — trying to find the one time that works for
              everyone — which means events die in planning limbo waiting for responses that never come.
            </p>
            <p style={styles.problemParagraph}>
              And none of them think about <em>where</em>. Venue availability is a whole separate
              problem — navigating coworking space calendars, library booking systems, or just texting
              a friend who has a living room. People and places are coordinated in parallel, by hand,
              by the host.
            </p>
            <p style={styles.problemClosing}>
              It doesn't have to be this way.
            </p>
          </div>
        </div>
      </section>

      {/* ─── C. Our Insight ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.insightCard}>
            <h2 style={styles.insightHeading}>
              Most gatherings don't need everyone — they need enough people
            </h2>
            <p style={styles.insightQuote}>
              Traditional scheduling tools ask: <span style={styles.quoteOld}>"When can everyone make it?"</span>
            </p>
            <p style={styles.insightQuote}>
              Quorum asks: <span style={styles.quoteNew}>"When can enough people make it?"</span>
            </p>
            <p style={styles.insightText}>
              This is a fundamentally different model. Instead of optimizing for consensus, Quorum
              optimizes for participation — getting the most people into actual gatherings, not stuck
              in polling purgatory.
            </p>
          </div>
        </div>
      </section>

      {/* ─── D. The Solution ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionHeading}>
            Quorum brings together people, times, and places
          </h2>
          <div style={styles.solutionList}>
            {SOLUTIONS.map((s) => (
              <SolutionBlock key={s.title} solution={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── E. How It Works ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionHeading}>How it works</h2>
          <div style={styles.stepsContainer}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={styles.stepRow}>
                <StepIcon number={step.num} filled={true} />
                {i < STEPS.length - 1 && <div style={styles.stepConnector} />}
                <div style={styles.stepContent}>
                  <span style={styles.stepLabel}>{step.label}</span>
                  <span style={styles.stepDesc}>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={styles.behindTheScenes}>
            Behind the scenes, Quorum cross-references people, schedules, and venue availability to
            surface the best possible options — so hosts don't have to.
          </p>
        </div>
      </section>

      {/* ─── F. Venue Intelligence ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionHeading}>Venue Intelligence</h2>
          <p style={styles.sectionSub}>
            Quorum treats spaces as active participants in the scheduling process.
          </p>
          <div style={styles.venueCard}>
            {VENUE_STAGES.map((v, i) => (
              <div key={v.stage} style={styles.venueStage}>
                <div style={styles.venueStageHeader}>
                  <span style={{
                    ...styles.venueStageLabel,
                    background: i === 0 ? "rgba(67,160,71,0.15)" : i === 1 ? "rgba(46,134,193,0.15)" : "rgba(171,71,188,0.15)",
                    color: i === 0 ? "#66bb6a" : i === 1 ? COLORS.blueLight : "#ba68c8",
                  }}>
                    {v.stage}
                  </span>
                </div>
                <p style={styles.venueStageText}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── G. AI in the Background ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.aiCard}>
            <h2 style={styles.aiHeading}>
              AI in the Background, Humans in the Room
            </h2>
            <p style={styles.aiText}>
              Quorum is AI-native — not because we want to talk about AI, but because it makes things
              possible that weren't before. As complexity grows — more people, more time zones, more
              constraints — the scheduling engine handles it. AI optimizes slot selection, predicts
              attendance patterns, suggests configurations, and books venues across disparate systems.
            </p>
            <p style={styles.aiClosing}>
              The technology is invisible. The gatherings are real.
            </p>
          </div>
        </div>
      </section>

      {/* ─── H. See It In Action ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionHeading}>See it in action</h2>
          <p style={styles.sectionSub}>
            Walk through real scheduling scenarios from start to finish
          </p>

          {/* S-01 hero card */}
          {scenarioExps.map((exp) => (
            <ScenarioHeroCard key={exp.id} exp={exp} onClick={handleExpClick} />
          ))}
        </div>
      </section>

      {/* ─── I. Explore the Product ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionHeading}>Explore the product</h2>
          <p style={styles.sectionSub}>
            Hands-on prototypes of key screens
          </p>

          {/* Core host experience */}
          <h3 style={styles.personaHeading}>Host Experience</h3>
          <div style={styles.demoList}>
            {coreHostDemos.map((exp) => (
              <DemoCard key={exp.id} exp={exp} onClick={handleExpClick} />
            ))}
          </div>

          {/* Invitee demos */}
          <h3 style={styles.personaHeading}>Invitee Experience</h3>
          <div style={styles.demoList}>
            {inviteeDemos.map((exp) => (
              <DemoCard key={exp.id} exp={exp} onClick={handleExpClick} />
            ))}
          </div>

          {/* Feature explorations */}
          <h3 style={styles.explorationHeading}>Feature Explorations</h3>
          <p style={styles.explorationSub}>
            These prototypes explore individual scheduling features we're evaluating.
            Each one tests a specific capability in isolation.
          </p>
          <div style={styles.demoList}>
            {explorationDemos.map((exp) => (
              <DemoCard key={exp.id} exp={exp} onClick={handleExpClick} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── J. Where This Is Going ─── */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <h2 style={styles.sectionHeading}>Where this is going</h2>
          <p style={styles.roadmapIntro}>
            Quorum is the first app on <strong style={{ color: "rgba(255,255,255,0.8)" }}>Platopia</strong> — a
            platform for organizing group experiences. It's our proof of concept for a broader ecosystem
            where getting people together is the easy part, not the hard part.
          </p>
          <h3 style={styles.comingSoonHeading}>Coming soon</h3>
          <ul style={styles.comingSoonList}>
            {COMING_SOON.map((item, i) => (
              <li key={i} style={styles.comingSoonItem}>
                <span style={styles.comingSoonBullet} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── K. Footer ─── */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <button onClick={() => navigate("/")} style={styles.footerLink}>
            <BackArrow />
            <span>Back to Platopia</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

// ── Scenario Hero Card (extracted for clarity) ──────────────

function ScenarioHeroCard({ exp, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onClick(exp.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.scenarioCard,
        ...(hovered ? styles.scenarioCardHover : {}),
      }}
    >
      <div style={styles.scenarioTop}>
        <span style={styles.scenarioBadge}>Interactive simulation</span>
      </div>
      <h3 style={styles.scenarioTitle}>
        {exp.pitchTitle || exp.title}
      </h3>
      <p style={styles.scenarioMeta}>
        1 host · 12 invitees · 3 timeslots · 2 venues
      </p>
      <p style={styles.scenarioDesc}>
        {exp.pitchDescription || exp.description}
      </p>
      <div style={styles.scenarioCta}>
        <span>Walk through this scenario</span>
        <ArrowRight />
      </div>
    </button>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = {
  container: {
    minHeight: "100vh",
    background: GRADIENTS.background,
    fontFamily: FONTS.base,
  },

  // Back bar
  backBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    background: "rgba(15, 25, 35, 0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    paddingLeft: 16,
    zIndex: 9999,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONTS.base,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
  },

  // Hero
  hero: {
    paddingTop: 100,
    paddingBottom: 60,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    background: "rgba(46,134,193,0.15)",
    border: "2px solid rgba(46,134,193,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "scale(2)",
    transformOrigin: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  heroName: {
    fontSize: 48,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 8px",
    letterSpacing: -1.5,
  },
  heroTagline: {
    fontSize: 24,
    fontWeight: 600,
    color: COLORS.blueLight,
    margin: "0 0 12px",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.5)",
    margin: 0,
    maxWidth: 420,
    lineHeight: 1.6,
  },

  // Sections
  section: {
    padding: "0 16px",
    marginBottom: 48,
  },
  sectionInner: {
    maxWidth: 700,
    margin: "0 auto",
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 8px",
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    margin: "0 0 24px",
    lineHeight: 1.5,
  },

  // Problem
  problemContent: {
    marginTop: 20,
  },
  problemParagraph: {
    fontSize: 15,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
    margin: "0 0 16px",
  },
  problemClosing: {
    fontSize: 16,
    fontWeight: 600,
    fontStyle: "italic",
    color: COLORS.blueLight,
    margin: "24px 0 0",
  },

  // Insight
  insightCard: {
    background: "rgba(46,134,193,0.06)",
    border: "1.5px solid rgba(46,134,193,0.2)",
    borderRadius: 18,
    padding: "32px 28px",
  },
  insightHeading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 20px",
    letterSpacing: -0.3,
  },
  insightQuote: {
    fontSize: 17,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.6,
    margin: "0 0 8px",
  },
  quoteOld: {
    color: "rgba(255,255,255,0.4)",
    textDecoration: "line-through",
    textDecorationColor: "rgba(255,255,255,0.2)",
  },
  quoteNew: {
    color: COLORS.blueLight,
    fontWeight: 700,
    fontSize: 18,
  },
  insightText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.65,
    margin: "20px 0 0",
  },

  // Solution
  solutionList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 20,
  },
  solutionBlock: {
    display: "flex",
    gap: 16,
    padding: "24px 22px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
  },
  solutionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "rgba(46,134,193,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  solutionContent: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 8px",
  },
  solutionDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    margin: 0,
  },

  // Steps
  stepsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    marginTop: 24,
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    position: "relative",
    paddingBottom: 24,
  },
  stepConnector: {
    position: "absolute",
    left: 15,
    top: 36,
    width: 2,
    height: "calc(100% - 36px)",
    background: "rgba(46,134,193,0.3)",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingTop: 5,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.blueLight,
  },
  stepDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.5,
  },
  behindTheScenes: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
    lineHeight: 1.6,
    margin: "4px 0 0",
    paddingLeft: 48,
  },

  // Venue Intelligence
  venueCard: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  venueStage: {
    padding: "20px 22px",
    background: "rgba(255,255,255,0.03)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  venueStageHeader: {
    marginBottom: 8,
  },
  venueStageLabel: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  venueStageText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    margin: 0,
  },

  // AI section
  aiCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: "32px 28px",
  },
  aiHeading: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 16px",
    letterSpacing: -0.3,
  },
  aiText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.65,
    margin: "0 0 20px",
  },
  aiClosing: {
    fontSize: 16,
    fontWeight: 600,
    fontStyle: "italic",
    color: COLORS.blueLight,
    margin: 0,
  },

  // Roadmap / Coming Soon
  roadmapIntro: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.65,
    margin: "8px 0 24px",
  },
  comingSoonHeading: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
    margin: "0 0 14px",
  },
  comingSoonList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  comingSoonItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.5,
  },
  comingSoonBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    background: "rgba(46,134,193,0.5)",
    marginTop: 7,
    flexShrink: 0,
  },

  // Scenario hero card
  scenarioCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    padding: "28px 28px 24px",
    background: "rgba(46,134,193,0.08)",
    border: "2px solid rgba(46,134,193,0.25)",
    borderRadius: 18,
    textAlign: "left",
    fontFamily: FONTS.base,
    cursor: "pointer",
    transition: "all 0.25s ease",
    marginBottom: 16,
    boxSizing: "border-box",
  },
  scenarioCardHover: {
    background: "rgba(46,134,193,0.12)",
    borderColor: COLORS.blueLight,
    transform: "translateY(-2px)",
    boxShadow: "0 12px 40px rgba(46,134,193,0.15)",
  },
  scenarioTop: {
    marginBottom: 12,
  },
  scenarioBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 6,
    background: "rgba(67,160,71,0.15)",
    color: "#66bb6a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scenarioTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 6px",
  },
  scenarioMeta: {
    fontSize: 14,
    fontWeight: 600,
    color: COLORS.blueLight,
    margin: "0 0 10px",
  },
  scenarioDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.55,
    margin: "0 0 18px",
  },
  scenarioCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    color: COLORS.blueLight,
  },

  // Persona heading
  personaHeading: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    margin: "24px 0 12px",
  },
  explorationHeading: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    margin: "36px 0 6px",
    paddingTop: 24,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  explorationSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    lineHeight: 1.5,
    margin: "0 0 12px",
  },

  // Demo cards
  demoList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  demoCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
    padding: "16px 20px",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    textAlign: "left",
    fontFamily: FONTS.base,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  demoCardHover: {
    background: "rgba(255,255,255,0.07)",
    borderColor: "rgba(46,134,193,0.3)",
    transform: "translateX(4px)",
  },
  demoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(46,134,193,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  demoInfo: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 3px",
  },
  demoDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.4,
    margin: 0,
  },

  // Footer
  footer: {
    padding: "40px 16px 60px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerInner: {
    maxWidth: 700,
    margin: "0 auto",
    textAlign: "center",
  },
  footerLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONTS.base,
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: 8,
  },
};
