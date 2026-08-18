import { supabase } from "@/integrations/supabase/client";

export const SCREENSHOT_BUCKET = "screenshots";

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const extensionFor = (file: File) => {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type === "image/png" ? "png" : "jpg";
};

export type UploadedScreenshot = {
  path: string;
  previewUrl: string;
};

/** Upload a screenshot to Lovable Cloud storage and return its path + a viewable URL. */
export const uploadScreenshot = async (file: File): Promise<UploadedScreenshot> => {
  if (!file.type.startsWith("image/") || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Please choose a PNG, JPG or WEBP image.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("That image is larger than 10MB. Try a smaller screenshot.");
  }

  const path = `${crypto.randomUUID()}.${extensionFor(file)}`;

  const { error } = await supabase.storage
    .from(SCREENSHOT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message || "Upload failed. Please try again.");

  const { data, error: signError } = await supabase.storage
    .from(SCREENSHOT_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signError || !data?.signedUrl) {
    throw new Error("Uploaded, but the preview could not be loaded.");
  }

  return { path, previewUrl: data.signedUrl };
};

/** Refresh a viewable URL for a stored screenshot path. */
export const getScreenshotUrl = async (path: string) => {
  const { data } = await supabase.storage
    .from(SCREENSHOT_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? null;
};
