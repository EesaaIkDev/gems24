import { toast } from "@/components/ui/use-toast";

const MAX_MB = 15;
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/**
 * Returns the file renamed with a standard image ending (the server only
 * accepts .jpg/.jpeg/.png/.webp photos), or null after warning the user when
 * it isn't a JPG, PNG or WebP photo under the size limit.
 */
export function toPhotoFile(file) {
  const ext = EXT[file?.type];
  if (!ext) {
    toast({ title: "Only photos can be uploaded", description: "Please choose a JPG, PNG or WebP image." });
    return null;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    toast({ title: "Photo is too large", description: `Please choose a photo under ${MAX_MB} MB.` });
    return null;
  }
  return new File([file], `photo.${ext}`, { type: file.type });
}