import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import {
  eventsQueryOptions,
  groupByMonth,
  pastEvents,
  undatedEvents,
  upcomingEvents,
} from "@/lib/events";


export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Your events — evra" },
      {
        name: "description",
        content: "Every saved event, grouped by month, plus everything you've already been to.",
      },
      { property: "og:title", content: "Your events — evra" },
      {
        property: "og:description",
        content: "Every saved event, grouped by month, plus everything you've already been to.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [], isLoading } = useQuery(eventsQueryOptions);
  const groups = groupByMonth(upcomingEvents(events));
  const undated = undatedEvents(events);
  const past = pastEvents(events);


  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Events</h1>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading your events…</p>
      ) : events.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No events saved yet — add one from the home screen.
        </p>
      ) : null}

      <div className="mt-6 space-y-8">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {group.label}
            </h2>
            <div className="mt-3 space-y-3">
              {group.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {past.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Past events
          </h2>
          <div className="mt-3 space-y-3">
            {past.map((event) => (
              <EventCard key={event.id} event={event} muted />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
