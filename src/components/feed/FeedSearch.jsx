import React from "react";
import GlassSearch from "@/components/common/GlassSearch";

/** Frosted search field for the Home feed. */
export default function FeedSearch({ value, onChange }) {
  return <GlassSearch value={value} onChange={onChange} placeholder="Search feed" label="Search the feed" />;
}