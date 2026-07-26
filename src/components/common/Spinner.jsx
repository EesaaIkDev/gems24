import React from "react";

export default function Spinner({ className = "" }) {
  return (
    <div className={`flex justify-center py-16 ${className}`}>
      <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}