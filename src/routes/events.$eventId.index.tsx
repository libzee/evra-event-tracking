import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, MapPin, Pencil, Ticket, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  deleteEvent,
  displayLocation,
  displayTime,
  eventQueryOptions,
  formatDateTime,
  formatFullDate,
} from "@/lib/events";
import { toast } from "sonner";
import type { ReactNode } from "react";

export const Route = createFileRoute("/events/$eventId/")({
  head: () => ({
    meta: [
      { title: "Event details — evra" },
      { name: "description", content: "Date, time, location and notes for your saved event." },
      { property: "og:title", content: "Event details — evra" },
      {
        property: "og:description",
        content: "Date, time, location and notes for your saved event.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventDetail,
});

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 border-b border-border py-3.5 last:border-b-0">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function EventDetail() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useQuery(eventQueryOptions(eventId));

  const removeEvent = useMutation({
    mutationFn: () => deleteEvent(eventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted");
      navigate({ to: "/events" });
    },
    onError: () => toast.error("Couldn't delete that event."),
  });

  return (
    <AppShell>
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All events
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : !event ? (
        <p className="mt-6 text-sm text-muted-foreground">That event no longer exists.</p>
      ) : (
        <>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {event.event_name}
          </h1>

          <div className="mt-5 rounded-2xl border border-border bg-card px-4">
            <Row
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date"
              value={`${formatFullDate(event.start_date)}${
                event.end_date ? ` – ${formatFullDate(event.end_date)}` : ""
              }${event.date_is_estimated ? " (estimated)" : ""}`}
            />
            <Row icon={<Clock className="h-4 w-4" />} label="Time" value={displayTime(event)} />
            <Row
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={displayLocation(event)}
            />
            <Row
              icon={<Ticket className="h-4 w-4" />}
              label="Ticket release"
              value={formatDateTime(event.ticket_release_datetime) ?? "Not tracked"}
            />
            <Row
              icon={<CalendarDays className="h-4 w-4" />}
              label="Registration deadline"
              value={formatDateTime(event.registration_deadline) ?? "None"}
            />
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Notes
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {event.notes ?? "No notes yet."}
            </p>
          </section>

          {event.screenshot_url && (
            <section className="mt-6">
              <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Original screenshot
              </h2>
              <img
                src={event.screenshot_url}
                alt={`Screenshot saved for ${event.event_name}`}
                loading="lazy"
                className="mt-2 w-full max-w-xs rounded-2xl border border-border object-cover"
              />
            </section>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="sm:w-auto"
              onClick={() => navigate({ to: "/events/$eventId/edit", params: { eventId } })}
            >
              <Pencil className="h-4 w-4" />
              Edit event
            </Button>
            <Button
              variant="outline"
              className="sm:w-auto"
              disabled={removeEvent.isPending}
              onClick={() => removeEvent.mutate()}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
