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
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Events</h1>

      {isLoading ? (
        <div className="mt-6 space-y-3" aria-busy="true" aria-label="Loading your events">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="h-14 w-14 animate-pulse rounded-xl bg-secondary sm:h-16 sm:w-16" />
              <div className="min-w-0 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-secondary" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-base font-medium">No events yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Drop a screenshot on the home screen and evra will remember the details.
          </p>
        </div>
      ) : null}

      <div className="mt-7 space-y-9">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {group.label}
            </h2>
            <div className="mt-3 space-y-2.5">
              {group.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {undated.length > 0 && (
        <section className="mt-9">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Date TBD
          </h2>
          <div className="mt-3 space-y-2.5">
            {undated.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-11 border-t border-border pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Past events
          </h2>
          <div className="mt-3 space-y-2.5">
            {past.map((event) => (
              <EventCard key={event.id} event={event} muted />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
