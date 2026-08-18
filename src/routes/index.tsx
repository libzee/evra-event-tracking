import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ImageUp, PenLine, Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { eventsQueryOptions, upcomingEvents } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "evra — Save events from a screenshot" },
      {
        name: "description",
        content:
          "Drop a screenshot and evra keeps the date, time and location of every event you want to remember.",
      },
      { property: "og:title", content: "evra — Save events from a screenshot" },
      {
        property: "og:description",
        content:
          "Drop a screenshot and evra keeps the date, time and location of every event you want to remember.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: events = [] } = useQuery(eventsQueryOptions);
  const coming = upcomingEvents(events).slice(0, 3);


  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    toast.success(`Saved “${file.name}” to your drafts`, {
      description: "Event details will be filled in later.",
    });
  };


  return (
    <AppShell>
      <section className="pt-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Never lose an event again
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Screenshot it, drop it here, and evra remembers the details for you.
        </p>
      </section>

      <section
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`mt-6 rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? "border-brand bg-accent" : "border-border bg-surface"
        }`}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Upload className="h-6 w-6" />
        </div>
        <p className="mt-4 text-lg font-medium">Drop an event here</p>
        <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
          Drag and drop a screenshot, or choose a file
        </p>
        <p className="mt-1 text-sm text-muted-foreground sm:hidden">
          Add a screenshot from your camera roll
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="mt-6 flex flex-col items-center gap-3">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => inputRef.current?.click()}>
            <ImageUp className="h-4 w-4" />
            Upload screenshot
          </Button>
          <button
            onClick={() => navigate({ to: "/events/new" })}

            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            <PenLine className="h-3.5 w-3.5" />
            Add manually
          </button>
        </div>
      </section>

      <section className="mt-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 className="truncate text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Coming up
          </h2>
          <Link
            to="/events"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand"
          >
            View all events
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {coming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
