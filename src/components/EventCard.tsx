import { Link } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import {
  displayDateLabel,
  displayLocation,
  displayTime,
  type EvraEvent,
} from "@/lib/events";

export function EventCard({ event, muted = false }: { event: EvraEvent; muted?: boolean }) {
  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className={`relative flex justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40 hover:bg-accent/40 ${
        muted ? "opacity-70" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold">{event.event_name}</h3>
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
      <div className="grid min-h-14 w-16 shrink-0 place-items-center rounded-xl bg-accent px-2 py-2 text-center text-accent-foreground">
        <span className="text-[0.7rem] font-semibold uppercase leading-tight tracking-widest">
          {displayDateLabel(event)}
        </span>
      </div>
    </Link>
  );
}
