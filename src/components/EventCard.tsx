import { Link } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import {
  displayLocation,
  displayTime,
  eventDateLabel,
  eventUrgencyLabel,
  ticketStatus,
  type EvraEvent,
} from "@/lib/events";

export function EventCard({ event, muted = false }: { event: EvraEvent; muted?: boolean }) {
  const urgency = eventUrgencyLabel(event);
  const status = ticketStatus(event);
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className={`relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-accent/40 ${
        muted ? "opacity-70" : ""
      }`}
    >
      {/* Desktop badges — top-right corner */}
      <div className="absolute right-3 top-3 hidden flex-col items-end gap-1 md:flex">
        {urgency && (
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand">
            {urgency}
          </span>
        )}
        {status && (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.65rem] font-medium text-brand">
            {status}
          </span>
        )}
      </div>
      <div className="flex min-h-14 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-accent px-2 py-2 text-center text-accent-foreground">
        <span className="text-[0.7rem] font-semibold uppercase leading-tight tracking-widest">
          {eventDateLabel(event)}
        </span>
        {event.date_is_estimated && (
          <span className="mt-0.5 text-[0.55rem] font-medium uppercase tracking-wider text-muted-foreground">
            Estimated
          </span>
        )}
      </div>
      <div className="min-w-0 md:pr-14">
        <h3 className="truncate text-base font-semibold">{event.event_name}</h3>
        {/* Mobile badges — below title, above time */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 md:hidden">
          {urgency && (
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand">
              {urgency}
            </span>
          )}
          {status && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.65rem] font-medium text-brand">
              {status}
            </span>
          )}
        </div>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {displayTime(event)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{displayLocation(event)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
