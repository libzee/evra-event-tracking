import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2 rounded-full transition-opacity hover:opacity-80 ${className}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-brand" />
      <span className="text-lg font-semibold tracking-tight sm:text-xl">evra</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <Wordmark />
          <nav className="flex items-center gap-1 text-sm">
            <Link
              to="/events"
              className="rounded-full px-3.5 py-2 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:bg-secondary"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              Events
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-5 sm:px-6 sm:pt-8">{children}</main>
    </div>
  );
}
