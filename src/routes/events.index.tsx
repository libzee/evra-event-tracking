import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { groupByMonth, pastEvents, upcomingEvents } from "@/lib/events";

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
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const groups = groupByMonth(upcomingEvents());
  const past = pastEvents();

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Events</h1>

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
