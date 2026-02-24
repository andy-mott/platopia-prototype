import {
  CalendarIcon,
  EnvelopeIcon,
  CalendarClockIcon,
  CombinedFormIcon,
} from "../shared/icons";

const EXPERIENCES = [
  {
    id: "host-scheduling",
    title: "Host Scheduling Form",
    description: "Create and configure a group gathering with smart multi-dimensional scheduling across people, times, and places.",
    category: "scheduling",
    icon: CalendarIcon,
    status: "active",
    load: () => import("./scheduling/HostSchedulingForm.jsx"),
  },
  {
    id: "invitee-response",
    title: "Invitee Response",
    description: "Respond to a gathering invite by ranking your top preferences and marking times you're unavailable.",
    category: "scheduling",
    icon: EnvelopeIcon,
    status: "active",
    load: () => import("./scheduling/InviteeExperience.jsx"),
  },
  {
    id: "invitee-calendar",
    title: "Invitee Calendar View",
    description: "Respond to a gathering invite using an interactive calendar that shows available days and lets you pick specific time slots.",
    category: "scheduling",
    icon: CalendarClockIcon,
    status: "active",
    load: () => import("./scheduling/InviteeCalendarExperience.jsx"),
  },
  {
    id: "host-combined",
    title: "Host Combined Form",
    description: "Create a gathering with schedule, location, and commute buffer combined into a single streamlined step.",
    category: "scheduling",
    icon: CombinedFormIcon,
    status: "active",
    load: () => import("./scheduling/HostCombinedForm.jsx"),
  },
];

export const CATEGORIES = [
  { id: "scheduling", label: "Scheduling", description: "Smart group scheduling experiences" },
  { id: "messaging", label: "Messaging", description: "Communication and notification flows" },
  { id: "social", label: "Social", description: "Social interaction experiences" },
];

export default EXPERIENCES;
