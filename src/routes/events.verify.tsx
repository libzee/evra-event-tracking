import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createEvent, toDatetimeLocal, toTimeInput } from "@/lib/events";
import type { ExtractedEvent } from "@/lib/extract-event.functions";

export const Route = createFileRoute("/events/verify")({
  head: () => ({
    meta: [
      { title: "Check the extracted event — evra" },
      {
        name: "description",
        content:
          "Review and edit the event details evra pulled from your screenshot before saving them.",
      },
      { property: "og:title", content: "Check the extracted event — evra" },
      {
        property: "og:description",
        content: "Review and edit the details evra pulled from your screenshot before saving.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifyPage,
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
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function VerifyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [ready, setReady] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState("TBD");
  const [ticketRelease, setTicketRelease] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const shot = sessionStorage.getItem("evra:pending-screenshot");
    const extracted = sessionStorage.getItem("evra:pending-extraction");
    if (!extracted) {
      toast.error("Nothing to verify — upload a screenshot first.");
      navigate({ to: "/" });
      return;
    }
    if (shot) {
      try {
        setScreenshotUrl((JSON.parse(shot) as { previewUrl?: string }).previewUrl ?? null);
      } catch {
        setScreenshotUrl(null);
      }
    }
    try {
      const e = JSON.parse(extracted) as ExtractedEvent;
      setEventName(e.event_name ?? "");
      setStartDate(e.start_date ?? "");
      setEndDate(e.end_date ?? "");
      setStartTime(toTimeInput(e.start_time));
      setEndTime(toTimeInput(e.end_time));
      setIsAllDay(Boolean(e.is_all_day));
      setLocation(e.location ?? "TBD");
      setTicketRelease(toDatetimeLocal(e.ticket_release_datetime));
      setRegistrationDeadline(toDatetimeLocal(e.registration_deadline));
      setNotes(e.notes ?? "");
    } catch {
      toast.error("Couldn't read the extracted details.");
      navigate({ to: "/" });
      return;
    }
    setReady(true);
  }, [navigate]);

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async () => {
      sessionStorage.removeItem("evra:pending-extraction");
      sessionStorage.removeItem("evra:pending-screenshot");
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event saved");
      navigate({ to: "/" });
    },
    onError: () => toast.error("Couldn't save that event. Try again."),
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
      screenshot_url: screenshotUrl,
    });
  };


  const cancel = () => {
    sessionStorage.removeItem("evra:pending-extraction");
    navigate({ to: "/" });
  };

  if (!ready) {
    return (
      <AppShell>
        <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        Extracted from your screenshot
      </div>

      <h1 className="mt-4 text-[1.6rem] font-semibold leading-tight tracking-tight sm:text-3xl">
        Check the details
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        Nothing is saved yet — edit anything that looks off, then save.
      </p>

      {screenshotUrl && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
          <img
            src={screenshotUrl}
            alt="Original event screenshot"
            className="max-h-[38vh] w-full bg-secondary object-contain sm:max-h-[45vh]"
          />
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <Field label="Event name" htmlFor="event_name">
          <Input
            id="event_name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Start date"
            htmlFor="start_date"
            hint={startDate ? "" : "TBD — add an exact date if you know it"}
          >

            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field label="End date" htmlFor="end_date" hint="Multi-day events only">
            <Input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
        </div>


        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium">All-day event</p>
            <p className="text-xs text-muted-foreground">No specific start time</p>
          </div>
          <Switch checked={isAllDay} onCheckedChange={setIsAllDay} aria-label="All-day event" />
        </div>

        {!isAllDay && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start time" htmlFor="start_time" hint="TBD if it wasn't in the screenshot">
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

        <Field label="Location" htmlFor="location" hint="TBD if it wasn't in the screenshot">
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
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
          />
        </Field>



        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save event"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
