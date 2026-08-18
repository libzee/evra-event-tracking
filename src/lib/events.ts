export type EvraEvent = {
  id: string;
  name: string;
  start: string; // ISO
  end?: string;
  location: string;
  ticketRelease?: string;
  registrationDeadline?: string;
  notes?: string;
  screenshot?: string;
};

export const mockEvents: EvraEvent[] = [
  {
    id: "night-market",
    name: "Kensington Night Market",
    start: "2026-09-04T19:00:00",
    end: "2026-09-04T23:00:00",
    location: "Kensington Ave, Toronto",
    ticketRelease: "Free entry — no ticket needed",
    registrationDeadline: "None",
    notes: "Bring cash. Meet Sam by the bandstand at 7:15.",
  },
  {
    id: "design-week",
    name: "Design Week Opening Party",
    start: "2026-09-12T18:30:00",
    end: "2026-09-12T22:00:00",
    location: "The Assembly, 45 Sterling Rd",
    ticketRelease: "Aug 25, 10:00 AM",
    registrationDeadline: "Sep 10, 11:59 PM",
    notes: "RSVP list closes early most years — set a reminder.",
  },
  {
    id: "lakeside-run",
    name: "Lakeside 10K",
    start: "2026-10-03T08:00:00",
    end: "2026-10-03T11:00:00",
    location: "Ontario Place, Toronto",
    ticketRelease: "Registration open now",
    registrationDeadline: "Sep 26, 6:00 PM",
    notes: "Early bird pricing until September 1.",
  },
  {
    id: "ceramics",
    name: "Ceramics Studio Intro",
    start: "2026-10-19T17:30:00",
    end: "2026-10-19T20:00:00",
    location: "Clayworks, 210 Dundas St W",
    ticketRelease: "Sep 30, 12:00 PM",
    registrationDeadline: "Oct 15",
    notes: "Only 12 spots per session.",
  },
  {
    id: "film-fest",
    name: "Open Air Film Festival",
    start: "2026-07-11T20:30:00",
    location: "Christie Pits Park",
    ticketRelease: "Was free",
    notes: "Loved it — check next year's lineup.",
  },
  {
    id: "jazz-loft",
    name: "Jazz Loft Session",
    start: "2026-06-22T21:00:00",
    location: "The Loft, 88 Ossington",
    notes: "Small room, arrive early.",
  },
];

export const getEvent = (id: string) => mockEvents.find((e) => e.id === id);

const now = () => new Date();

export const isPast = (e: EvraEvent) => new Date(e.end ?? e.start) < now();

export const upcomingEvents = () =>
  mockEvents
    .filter((e) => !isPast(e))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

export const pastEvents = () =>
  mockEvents.filter(isPast).sort((a, b) => +new Date(b.start) - +new Date(a.start));

export const groupByMonth = (events: EvraEvent[]) => {
  const groups: { key: string; label: string; events: EvraEvent[] }[] = [];
  for (const e of events) {
    const d = new Date(e.start);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label, events: [] };
      groups.push(g);
    }
    g.events.push(e);
  }
  return groups;
};

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { day: "numeric" });

export const formatWeekday = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
