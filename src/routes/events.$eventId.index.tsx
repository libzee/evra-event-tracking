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
  ticketStatus,
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

function Row({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string | null;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3.5 border-b border-border/70 py-4 last:border-b-0">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-[0.95rem] font-medium leading-snug">{value}</p>
        {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
      </div>
    </div>
  );
}


function EventDetail() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useQuery(eventQueryOptions(eventId));
  const status = event ? ticketStatus(event) : null;

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
        <div className="mt-6 space-y-4" aria-busy="true" aria-label="Loading event">
          <div className="h-7 w-2/3 animate-pulse rounded-full bg-secondary" />
          <div className="h-56 animate-pulse rounded-2xl bg-secondary/70" />
        </div>
      ) : !event ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-base font-medium">Event not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            That event no longer exists or has been deleted.
          </p>
        </div>
      ) : (
        <>
          <h1 className="mt-4 text-[1.6rem] font-semibold leading-tight tracking-tight sm:text-3xl">
            {event.event_name}
          </h1>

          {status && (
            <span className="mt-2.5 inline-flex w-fit items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              {status}
            </span>
          )}

          <div className="mt-5 rounded-2xl border border-border bg-card px-4 sm:px-5">
            <Row
              icon={<CalendarDays className="h-4 w-4" />}
              label="Date"
              value={
                event.start_date
                  ? `${formatFullDate(event.start_date)}${
                      event.end_date ? ` – ${formatFullDate(event.end_date)}` : ""
                    }`
                  : "TBD"
              }
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

          <section className="mt-7">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Notes
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
              {event.notes ?? "No notes yet."}
            </p>
          </section>

          {event.screenshot_url && (
            <section className="mt-7">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Original screenshot
              </h2>
              <div className="mt-2.5 overflow-hidden rounded-2xl border border-border bg-secondary">
                <img
                  src={event.screenshot_url}
                  alt={`Screenshot saved for ${event.event_name}`}
                  loading="lazy"
                  className="max-h-[50vh] w-full object-contain"
                />
              </div>
            </section>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate({ to: "/events/$eventId/edit", params: { eventId } })}
            >
              <Pencil className="h-4 w-4" />
              Edit event
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              disabled={removeEvent.isPending}
              onClick={() => removeEvent.mutate()}
            >
              <Trash2 className="h-4 w-4" />
              {removeEvent.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
