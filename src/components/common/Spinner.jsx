import React from "react";
import GemLoader from "@/components/common/GemLoader";

export default function Spinner({ className = "" }) {
  return (
    <div role="status" aria-label="Loading" className={`flex justify-center py-16 ${className}`}>
      <GemLoader />
    </div>
  );
}