# Evra

**Save an event before you forget it.**

Evra is a mobile-first event tracker that turns screenshots into organised, actionable events.

I built the first version in **one day** as an experiment: *Can I take a real problem I have, scope it down to an MVP, and use AI-assisted development to ship a working product in a day?*

🔗 **[Try Evra](https://evra-event-tracking.lovable.app)**

---

## The problem

I constantly discover events I want to attend across different places — Instagram, LinkedIn, Luma, Eventbrite, event websites, posters and messages.

My usual workflow was:

**see event → screenshot/save it → forget about it**

Even when I remembered the event itself, I could still miss an important registration or ticket deadline.

The information existed, but it was scattered across too many places.

Evra is my attempt to create one event inbox for all of it.

---

## How it works

1. **Upload a screenshot** of an event.
2. Evra uses AI to identify the event and extract its details.
3. **Review and edit** the extracted information before anything is saved.
4. Save the event.
5. Evra automatically organises it chronologically alongside everything else you have saved.

The core interaction is:

**Screenshot → AI extraction → Verify → Save → Organised**

---

## Features

### AI screenshot extraction

Upload an event screenshot and Evra extracts the primary event, including:

* Event name
* Date
* Time
* Location
* Ticket release date/time
* Registration deadline
* Additional useful information as notes

If information is missing, Evra does not invent it.

Unknown times and locations can remain `TBD`, and events without a confirmed date are saved separately under **Date TBD**.

---

### Human verification

AI-extracted information is never saved automatically.

Evra first shows the original screenshot alongside an editable form so the user can verify or correct the information before saving.

---

### Chronological event organisation

Saved events are automatically organised into:

* **Upcoming events**
* **Date TBD**
* **Past events**

Upcoming events are sorted by date and grouped by month.

Evra also supports:

* `TODAY` and `TOMORROW` indicators
* Multi-day events
* All-day events

---

### Ticket tracking

When a ticket release is approaching, Evra surfaces it directly on the event:

**Tickets open in 45 min**

After release:

**Tickets are live**

If a registration deadline exists, the status disappears once registration closes. Otherwise, it remains visible until the event.

V1 intentionally uses in-app states rather than external notifications.

---

### Event details

Each saved event has a dedicated page containing:

* Date and time
* Location
* Ticket release
* Registration deadline
* Editable notes
* Original screenshot

Events can also be edited or deleted after saving.

---

### Non-event detection

If a screenshot does not actually contain an event, Evra stops the extraction flow instead of inventing one.

Users can then:

* Try another screenshot
* Add the event manually

---

## Initial testing

During the one-day build, I tested Evra against **7 real-world event screenshots** across different formats, including:

* Event graphics
* LinkedIn event listings
* Luma
* Eventbrite
* Concert listings
* Theatre listings
* Event posters with limited information

**7/7 produced usable event drafts** without requiring the event to be manually re-entered.

The main product success criterion was simple:

> **Is using Evra faster than manually putting the event into my calendar?**

For the initial test set, it was.

---

## Product decisions

The one-day constraint meant deliberately choosing what **not** to build.

### Included in V1

* Screenshot upload
* AI event extraction
* Human verification
* Persistent event storage
* Manual event creation
* Edit and delete
* Chronological organisation
* Undated events
* Multi-day and all-day events
* Ticket-release states
* Registration-deadline logic
* Mobile-first responsive UI

### Deliberately excluded from V1

* Authentication
* Multiple users
* Calendar view
* Google / Apple Calendar sync
* Push or email notifications
* URL extraction
* Instagram or LinkedIn integrations
* Event recommendations
* Categories and tags
* Search and filters
* Automatic web research
* Multiple events from one screenshot
* Automatic monitoring for newly announced dates or tickets

The goal was to validate the **core capture loop** before expanding the product.

---

## Tech stack

* **React 19**
* **TypeScript**
* **TanStack Start / TanStack Router**
* **Vite**
* **Tailwind CSS**
* **Supabase client**
* **Lovable Cloud**
* **AI-powered image understanding**
* **date-fns**
* **Zod**
* **GitHub** for version control

The product was designed and built using **Lovable** with iterative prompting, testing and manual product decisions throughout the build.

---

## Local development

Clone the repository:

```bash
git clone https://github.com/libzee/evra-event-tracking.git
cd evra-event-tracking
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

---

## What I would build next

Evra V1 answers:

> **Can I reliably turn something I see online into an organised event?**

The next iterations would focus on making that capture even more effortless.

### V2 — Better capture

* Paste an event URL
* Share directly to Evra from another app
* Authentication and personal accounts
* Calendar export / sync
* Push notifications

### V3 — Better organisation

* Tags and categories
* Calendar view
* Search and filtering
* RSVP / attending states
* Location-based organisation

### V4 — Event intelligence

* Monitor undated events and detect when dates are announced
* Detect ticket-sale changes
* Automatically enrich missing event information
* Personalised event recommendations

The longer-term idea is for Evra to evolve from an **event inbox** into a personal event intelligence layer.

---

## Why this project exists

Evra was not originally meant to be a fully developed startup.

It started with a question:

> **Can you actually build a useful product in one day with AI?**

The challenge forced me to think less about how many features I could build and more about:

* identifying the actual user problem
* defining the smallest useful product
* separating structured and unstructured data
* designing AI fallbacks
* handling uncertainty rather than letting AI guess
* testing the product against messy real-world inputs
* prioritising functionality over polish
* deciding what belonged in V1 versus a future iteration

The result is a working first version — and a starting point for continuing to iterate on Evra through a product-management lens.

---

## Project status

**V1 — One-day prototype complete ✓**

Evra is currently a single-user prototype and does not include authentication. The deployed application is intended as a demonstration of the V1 product concept rather than a production multi-user service.

---

Built by **Liaba Zeeshan** as a one-day AI product build.

