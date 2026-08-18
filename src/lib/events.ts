import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { queryOptions } from "@tanstack/react-query";

export type EvraEvent = Database["public"]["Tables"]["events"]["Row"];
export type NewEvraEvent = Database["public"]["Tables"]["events"]["Insert"];

/** Parse a `YYYY-MM-DD` date as local time (avoids UTC off-by-one). */
export const parseDate = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

export const eventsQueryOptions = queryOptions({
  queryKey: ["events"],
  queryFn: async (): Promise<EvraEvent[]> => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const eventQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["events", id],
    queryFn: async (): Promise<EvraEvent | null> => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const createEvent = async (input: NewEvraEvent) => {
  const { data, error } = await supabase.from("events").insert(input).select().single();
  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string) => {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
};

export const updateEvent = async (id: string, input: Omit<NewEvraEvent, "id">) => {
  const { data, error } = await supabase.from("events").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

const pad2 = (n: number) => n.toString().padStart(2, "0");

/** Convert an ISO datetime back into the local `datetime-local` input format. */
export const toDatetimeLocal = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const isPast = (e: EvraEvent) => parseDate(e.end_date ?? e.start_date) < startOfToday();

export const upcomingEvents = (events: EvraEvent[]) =>
  events
    .filter((e) => !isPast(e))
    .sort((a, b) => +parseDate(a.start_date) - +parseDate(b.start_date));

export const pastEvents = (events: EvraEvent[]) =>
  events.filter(isPast).sort((a, b) => +parseDate(b.start_date) - +parseDate(a.start_date));

export const groupByMonth = (events: EvraEvent[]) => {
  const groups: { key: string; label: string; events: EvraEvent[] }[] = [];
  for (const e of events) {
    const d = parseDate(e.start_date);
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

export const formatDay = (date: string) =>
  parseDate(date).toLocaleDateString("en-US", { day: "numeric" });

export const formatWeekday = (date: string) =>
  parseDate(date).toLocaleDateString("en-US", { weekday: "short" });

const daysFromToday = (date: string) =>
  Math.round((+parseDate(date) - +startOfToday()) / 86_400_000);

const shortMonth = (date: string) =>
  parseDate(date).toLocaleDateString("en-US", { month: "short" }).toUpperCase();

/**
 * Compact date badge for an event: SEP 12 / SEP 12–15.
 */
export const eventDateLabel = (e: EvraEvent) => {
  const start = e.start_date.slice(0, 10);
  const end = e.end_date?.slice(0, 10);
  const isRange = !!end && end !== start;

  if (isRange) {
    const sameMonth = shortMonth(start) === shortMonth(end!);
    return sameMonth
      ? `${shortMonth(start)} ${formatDay(start)}–${formatDay(end!)}`
      : `${shortMonth(start)} ${formatDay(start)} – ${shortMonth(end!)} ${formatDay(end!)}`;
  }

  return `${shortMonth(start)} ${formatDay(start)}`;
};

/**
 * TODAY / TOMORROW indicator for an event, or null.
 */
export const eventUrgencyLabel = (e: EvraEvent) => {
  const start = e.start_date.slice(0, 10);
  const diff = daysFromToday(start);
  if (diff === 0) return "TODAY";
  if (diff === 1) return "TOMORROW";
  return null;
};

export const formatFullDate = (date: string) =>
  parseDate(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export const formatDateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

export const displayTime = (e: EvraEvent) =>
  e.is_all_day ? "All day" : (e.time?.trim() || "TBD");

export const displayLocation = (e: EvraEvent) => e.location?.trim() || "TBD";
