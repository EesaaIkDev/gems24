import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Camera, Loader2, User } from "lucide-react";

/** Optional profile photo upload, used as the final wizard step. */
export default function PhotoStep({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="neu-inset flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-background">
        {value ? (
          <Image src={value} alt="Profile" className="h-full w-full" />
        ) : (
          <User className="h-10 w-10 text-muted-foreground/50" />
        )}
      </div>
      <label className="neu-raised-sm tap-scale inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-background px-5 text-sm font-medium">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {value ? "Change photo" : "Upload photo"}
        <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} />
      </label>
    </div>
  );
}