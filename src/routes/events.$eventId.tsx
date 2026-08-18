import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock, MapPin, Pencil, Ticket, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatFullDate, formatTime, getEvent } from "@/lib/events";
import screenshot from "@/assets/event-screenshot.jpg";
import { toast } from "sonner";
import type { ReactNode } from "react";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = getEvent(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Event not found — Evra" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.event.name} — Evra`;
    const description = `${formatFullDate(loaderData.event.start)} · ${loaderData.event.location}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
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
  const { event } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <AppShell>
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All events
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{event.name}</h1>

      <div className="mt-5 rounded-2xl border border-border bg-card px-4">
        <Row
          icon={<CalendarDays className="h-4 w-4" />}
          label="Date"
          value={formatFullDate(event.start)}
        />
        <Row
          icon={<Clock className="h-4 w-4" />}
          label="Time"
          value={
            event.end
              ? `${formatTime(event.start)} – ${formatTime(event.end)}`
              : formatTime(event.start)
          }
        />
        <Row icon={<MapPin className="h-4 w-4" />} label="Location" value={event.location} />
        <Row
          icon={<Ticket className="h-4 w-4" />}
          label="Ticket release"
          value={event.ticketRelease ?? "Not tracked"}
        />
        <Row
          icon={<CalendarDays className="h-4 w-4" />}
          label="Registration deadline"
          value={event.registrationDeadline ?? "None"}
        />
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Notes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {event.notes ?? "No notes yet."}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Original screenshot
        </h2>
        <img
          src={screenshot}
          alt={`Screenshot saved for ${event.name}`}
          loading="lazy"
          width={768}
          height={1024}
          className="mt-2 w-full max-w-xs rounded-2xl border border-border object-cover"
        />
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button className="sm:w-auto" onClick={() => toast("Editing coming soon")}>
          <Pencil className="h-4 w-4" />
          Edit event
        </Button>
        <Button
          variant="outline"
          className="sm:w-auto"
          onClick={() => {
            toast.success("Event deleted");
            navigate({ to: "/events" });
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </AppShell>
  );
}
