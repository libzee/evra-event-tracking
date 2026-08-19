import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ImageUp, Loader2, PenLine, Sparkles, Upload, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { eventsQueryOptions, upcomingEvents } from "@/lib/events";
import { uploadScreenshot } from "@/lib/screenshots";
import { extractEventFromScreenshot } from "@/lib/extract-event.functions";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<{ path: string; previewUrl: string } | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [noEvent, setNoEvent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: events = [] } = useQuery(eventsQueryOptions);
  const coming = upcomingEvents(events).slice(0, 3);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    setNoEvent(false);
    setExtractError(null);
    setUploading(true);
    try {
      const uploaded = await uploadScreenshot(file);
      setScreenshot(uploaded);
      // Keep it around so it can be attached to an event later.
      sessionStorage.setItem("evra:pending-screenshot", JSON.stringify(uploaded));
      toast.success("Screenshot uploaded");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleExtract = async () => {
    if (!screenshot) return;
    setExtractError(null);
    setNoEvent(false);
    setExtracting(true);
    try {
      const extracted = await extractEventFromScreenshot({
        data: { imageUrl: screenshot.previewUrl, today: new Date().toISOString().slice(0, 10) },
      });
      if (!extracted.is_event) {
        sessionStorage.removeItem("evra:pending-extraction");
        setNoEvent(true);
        return;
      }
      sessionStorage.setItem("evra:pending-extraction", JSON.stringify(extracted));
      navigate({ to: "/events/verify" });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Couldn't extract the event. Please try again.";
      setExtractError(message);
      toast.error(message);
    } finally {
      setExtracting(false);
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setError(null);
    setExtractError(null);
    setNoEvent(false);
    sessionStorage.removeItem("evra:pending-screenshot");
  };

  return (
    <AppShell>
      <section className="pt-1 text-center">
        <h1 className="text-[1.6rem] font-semibold leading-tight tracking-tight sm:text-3xl">
          Never lose an event again
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground sm:max-w-sm">
          Screenshot it, drop it here, and evra remembers the details for you.
        </p>
      </section>

      {screenshot ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 px-4 py-3">
            <p className="truncate text-sm font-medium">Screenshot uploaded</p>
            <button
              onClick={clearScreenshot}
              aria-label="Remove screenshot"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:bg-secondary"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>
          <img
            src={screenshot.previewUrl}
            alt="Uploaded event screenshot preview"
            className="max-h-[52vh] w-full bg-secondary object-contain sm:max-h-[60vh]"
          />
          <div className="flex flex-col gap-2.5 px-4 py-4">

            {noEvent ? (
              <>
                <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-4 text-center">
                  <p className="text-base font-medium">No event found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This screenshot doesn&apos;t appear to contain an event.
                  </p>
                </div>
                <Button size="lg" className="w-full" onClick={() => inputRef.current?.click()}>
                  <ImageUp className="h-4 w-4" />
                  Try another screenshot
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate({ to: "/events/new" })}
                >
                  <PenLine className="h-4 w-4" />
                  Add manually
                </Button>
              </>
            ) : (
              <>
                {extractError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                  >
                    {extractError}
                  </p>
                )}
                <Button
                  size="lg"
                  className="w-full"
                  disabled={extracting}
                  onClick={() => void handleExtract()}
                >
                  {extracting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {extracting ? "Extracting event…" : "Extract event"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={extracting}
                  onClick={() => inputRef.current?.click()}
                >
                  <ImageUp className="h-4 w-4" />
                  Replace screenshot
                </Button>
              </>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </section>
      ) : (
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`mt-6 rounded-2xl border border-dashed px-5 py-10 text-center transition-colors sm:px-6 sm:py-14 ${
            dragging ? "border-brand bg-accent" : "border-border bg-surface"
          }`}
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>
          <p className="mt-4 text-base font-semibold sm:text-lg">
            {uploading ? "Uploading screenshot…" : "Drop an event here"}
          </p>
          <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
            Drag and drop a screenshot, or choose a file
          </p>
          <p className="mt-1 text-sm text-muted-foreground sm:hidden">
            Add a screenshot from your camera roll
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />

          {error && (
            <p
              role="alert"
              className="mx-auto mt-4 max-w-sm rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-col items-center gap-3.5">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageUp className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload screenshot"}
            </Button>
            <button
              onClick={() => navigate({ to: "/events/new" })}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <PenLine className="h-3.5 w-3.5" />
              Add manually
            </button>
          </div>
        </section>
      )}

      <section className="mt-11">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Coming up
          </h2>
          <Link
            to="/events"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand transition-opacity hover:opacity-80"
          >
            View all events
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 space-y-2.5">
          {coming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing saved yet — add your first event.
            </p>
          ) : (
            coming.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      </section>
    </AppShell>
  );
}
