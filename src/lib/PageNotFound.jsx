import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Seo from "@/components/seo/Seo";
import CategoryLinks from "@/components/seo/CategoryLinks";
import { LOGO_URL } from "@/lib/gems";

/** Branded, non-indexable 404 that routes visitors back into the marketplace. */
export default function PageNotFound() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <Seo
        title="Page not found — Gems24"
        description="This Gems24 page could not be found. Browse the gemstone marketplace or return to the homepage."
        robots="noindex, follow"
        canonical={null}
      />
      <img src={LOGO_URL} alt="Gems24" className="h-14 w-14" />
      <h1 className="mt-5 text-2xl font-bold">This page could not be found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nothing lives at <span className="font-medium text-foreground">{pathname}</span>. The listing may have been sold
        or removed.
      </p>
      <div className="mt-6 flex w-full flex-col gap-2.5">
        <Button asChild size="lg">
          <Link to="/gemstones">Browse the gemstone marketplace</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/">Go to the Gems24 homepage</Link>
        </Button>
      </div>
      <div className="mt-8 w-full text-left">
        <CategoryLinks />
      </div>
    </div>
  );
}