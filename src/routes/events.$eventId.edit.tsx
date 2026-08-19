import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  eventQueryOptions,
  toDatetimeLocal,
  toTimeInput,
  updateEvent,
} from "@/lib/events";

export const Route = createFileRoute("/events/$eventId/edit")({
  head: () => ({
    meta: [
      { title: "Edit event — evra" },
      {
        name: "description",
        content: "Update the details of a saved event.",
      },
      { property: "og:title", content: "Edit event — evra" },
      {
        property: "og:description",
        content: "Update the details of a saved event.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditEventPage,
});

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function EditEventPage() {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useQuery(eventQueryOptions(eventId));

  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [ticketRelease, setTicketRelease] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!event || prefilled) return;
    setEventName(event.event_name);
    setStartDate(event.start_date ?? "");
    setEndDate(event.end_date ?? "");
    setIsAllDay(event.is_all_day);
    setStartTime(event.is_all_day ? "" : toTimeInput(event.start_time));
    setEndTime(event.is_all_day ? "" : toTimeInput(event.end_time));
    setLocation(event.location ?? "");
    setTicketRelease(toDatetimeLocal(event.ticket_release_datetime));
    setRegistrationDeadline(toDatetimeLocal(event.registration_deadline));
    setNotes(event.notes ?? "");
    setPrefilled(true);
  }, [event, prefilled]);

  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof updateEvent>[1]) => updateEvent(eventId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["events", eventId] });
      toast.success("Event updated");
      navigate({ to: "/events/$eventId", params: { eventId } });
    },
    onError: () => toast.error("Couldn't update that event. Try again."),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      toast.error("Event name is required");
      return;
    }
    mutation.mutate({
      event_name: eventName.trim(),
      start_date: startDate || null,
      end_date: endDate || null,
      start_time: isAllDay ? null : startTime || null,
      end_time: isAllDay ? null : endTime || null,
      time: null,
      is_all_day: isAllDay,
      location: location.trim() || "TBD",
      ticket_release_datetime: ticketRelease ? new Date(ticketRelease).toISOString() : null,
      registration_deadline: registrationDeadline
        ? new Date(registrationDeadline).toISOString()
        : null,
      notes: notes.trim() || null,
    });
  };


  return (
    <AppShell>
      <Link
        to="/events/$eventId"
        params={{ eventId }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Edit event</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Update the details below, then save your changes.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : !event ? (
        <p className="mt-6 text-sm text-muted-foreground">That event no longer exists.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <Field label="Event name" htmlFor="event_name">
            <Input
              id="event_name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Design Week Opening Party"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start date" htmlFor="start_date" hint="Leave empty if the date is TBD">
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>

            <Field label="End date" htmlFor="end_date" hint="Optional">
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5">
            <div>
              <p className="text-sm font-medium">All-day event</p>
              <p className="text-xs text-muted-foreground">No specific start time</p>
            </div>
            <Switch
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
              aria-label="All-day event"
            />
          </div>

          {!isAllDay && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Start time" htmlFor="start_time" hint="Leave empty if TBD">
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </Field>
              <Field label="End time" htmlFor="end_time" hint="Optional">
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </Field>
            </div>
          )}

          <Field label="Location" htmlFor="location" hint="Defaults to TBD">
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="The Assembly, 45 Sterling Rd"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ticket release" htmlFor="ticket_release" hint="Optional">
              <Input
                id="ticket_release"
                type="datetime-local"
                value={ticketRelease}
                onChange={(e) => setTicketRelease(e.target.value)}
              />
            </Field>
            <Field label="Registration deadline" htmlFor="registration_deadline" hint="Optional">
              <Input
                id="registration_deadline"
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Notes" htmlFor="notes" hint="Optional">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Anything worth remembering"
            />
          </Field>



          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: "/events/$eventId", params: { eventId } })}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
