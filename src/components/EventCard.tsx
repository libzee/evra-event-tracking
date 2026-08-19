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
      className={`relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 transition-[background-color,border-color,transform] duration-150 hover:border-brand/40 hover:bg-accent/30 active:scale-[0.99] sm:gap-4 sm:p-4 ${
        muted ? "opacity-65" : ""
      }`}
    >
      {/* Desktop badges — top-right corner */}
      <div className="absolute right-3.5 top-3.5 hidden flex-col items-end gap-1.5 md:flex">
        {urgency && (
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand">
            {urgency}
          </span>
        )}
        {status && (
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[0.65rem] font-medium text-brand">
            {status}
          </span>
        )}
      </div>
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-accent px-1.5 text-center text-accent-foreground sm:h-16 sm:w-16">
        <span className="text-[0.7rem] font-semibold uppercase leading-tight tracking-widest">
          {eventDateLabel(event)}
        </span>
      </div>

      <div className="min-w-0 md:pr-16">
        <h3 className="truncate text-[0.975rem] font-semibold leading-snug sm:text-base">
          {event.event_name}
        </h3>
        {/* Mobile badges — below title, above time */}
        {(urgency || status) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2 md:hidden">
            {urgency && (
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-brand">
                {urgency}
              </span>
            )}
            {status && (
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[0.65rem] font-medium text-brand">
                {status}
              </span>
            )}
          </div>
        )}
        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {displayTime(event)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{displayLocation(event)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
