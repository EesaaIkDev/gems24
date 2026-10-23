import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ChatImage({ uri }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 })
      .then(({ signed_url }) => !cancelled && setUrl(signed_url))
      .catch(() => {});
    return () => { cancelled = true; };
  }, [uri]);

  if (!url) return <div className="mb-1.5 h-40 w-52 max-w-full animate-pulse rounded-xl bg-black/10" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mb-1.5 block">
      <img src={url} alt="Shared photo" className="max-h-72 w-full rounded-xl object-cover" />
    </a>
  );
}