import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="h-2.5 w-2.5 rounded-full bg-brand" />
      <span className="text-xl font-semibold tracking-tight">Evra</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5">
          <Wordmark />
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/events"
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              Events
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 pb-20 pt-6">{children}</main>
    </div>
  );
}
