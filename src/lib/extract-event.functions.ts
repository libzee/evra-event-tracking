import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  imageUrl: z.string().url(),
  today: z.string().min(8),
});

export type ExtractedEvent = {
  event_name: string;
  start_date: string | null;
  end_date: string | null;
  time: string;
  is_all_day: boolean;
  location: string;
  ticket_release_datetime: string | null;
  registration_deadline: string | null;
  notes: string | null;
};


export const extractEventFromScreenshot = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ExtractedEvent> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const imageRes = await fetch(data.imageUrl);
    if (!imageRes.ok) throw new Error("Could not read the uploaded screenshot.");
    const contentType = imageRes.headers.get("content-type") ?? "image/png";
    const bytes = new Uint8Array(await imageRes.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    const dataUrl = `data:${contentType};base64,${btoa(binary)}`;

    const prompt = `You extract ONE event from a screenshot. Today's date is ${data.today}.

Rules:
- Identify only the single most prominent event. If prominence is unclear, use the first clearly identifiable event.
- Never invent factual information.
- time: free text like "7:00 PM" or "7 PM - 11 PM". If unavailable, use "TBD". If the event is all day, set is_all_day true and time "All day".
- location: text. If unavailable, use "TBD".
- ticket_release_datetime and registration_deadline: ISO 8601 datetime strings, or null if not shown.
- notes: useful extra info (ticket price, doors open, age restrictions, schedule, description, instructions), or null.
- start_date / end_date: "YYYY-MM-DD". end_date only for multi-day events, otherwise null.
- If no year is shown but the day/month is, infer the next plausible occurrence relative to today.
- NEVER invent an exact date. If there is no exact or confidently inferable date, set start_date and end_date to null.
- If there is no exact date but vague timing is stated (e.g. "Coming this fall", "Summer 2027", "This winter", "Coming soon"), leave start_date null and preserve that wording at the start of notes.

Respond with ONLY a JSON object with keys: event_name, start_date, end_date, time, is_all_day, location, ticket_release_datetime, registration_deadline, notes.`;


    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
      if (res.status === 402)
        throw new Error("AI credits are exhausted. Add credits in Lovable to keep extracting.");
      throw new Error(`Extraction failed (${res.status}). ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = json.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Couldn't read event details from that screenshot.");

    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

    const startDate = str(parsed["start_date"])?.slice(0, 10) ?? null;

    return {
      event_name: str(parsed["event_name"]) ?? "",
      start_date: startDate,
      end_date: startDate ? (str(parsed["end_date"])?.slice(0, 10) ?? null) : null,
      time: str(parsed["time"]) ?? "TBD",
      is_all_day: parsed["is_all_day"] === true,
      location: str(parsed["location"]) ?? "TBD",
      ticket_release_datetime: str(parsed["ticket_release_datetime"]),
      registration_deadline: str(parsed["registration_deadline"]),
      notes: str(parsed["notes"]),
    };

  });
