import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ImagePlus, Camera, X, Loader2 } from "lucide-react";
import { haptic } from "@/lib/despia";

export default function PhotoUploader({ photos = [], onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    onChange([...photos, ...urls]);
    setUploading(false);
    haptic("success");
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((url) => (
        <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
          <Image src={url} alt="Gemstone" className="w-full h-full" />
          <button
            type="button"
            onClick={() => onChange(photos.filter((p) => p !== url))}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/90 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors">
        {uploading ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <>
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
            <span className="text-[0.625rem] text-muted-foreground">Add photo</span>
          </>
        )}
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
      </label>
      <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors">
        <Camera className="w-5 h-5 text-muted-foreground" />
        <span className="text-[0.625rem] text-muted-foreground">Camera</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFiles}
          disabled={uploading}
        />
      </label>
    </div>
  );
}