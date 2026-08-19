ALTER TABLE public.events ALTER COLUMN start_date DROP NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS date_label text;