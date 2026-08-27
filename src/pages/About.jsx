import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import CategoryLinks from "@/components/seo/CategoryLinks";
import { SITE, absolute } from "@/lib/seo";

const FAQ = [
  {
    q: "What is Gems24?",
    a: "Gems24 is a global marketplace and professional network for the gemstone trade. Dealers, cutters, suppliers, jewellers and buyers publish listings for natural coloured stones, build a professional profile and deal with each other directly.",
  },
  {
    q: "Who uses Gems24?",
    a: "Gemstone traders and dealers who sell stones, suppliers moving parcels, and buyers — jewellers, designers and collectors — sourcing natural material. Membership grades set how many stones a trader can list at once.",
  },
  {
    q: "How do listings work?",
    a: "A trader publishes a stone with its carat weight, colour, treatment disclosure, origin and laboratory certificate where one exists. Buyers browse the marketplace, open a listing and message the trader through Gems24.",
  },
  {
    q: "Is contact information public?",
    a: "No. Phone numbers are never shown to other users, and contact details are only revealed to traders you have accepted a connection with. Everything else stays inside the platform's messaging.",
  },
];

export default function About() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Gems24",
      url: absolute("/about"),
      description: SITE.description,
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: SITE.logo },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="px-4 pt-5 pb-6 max-w-lg mx-auto space-y-6">
      <Seo canonical={absolute("/about")} jsonLd={jsonLd} />

      <header>
        <h1 className="text-[1.5rem] font-bold leading-tight">
          Gems24: a global marketplace and network for the gemstone trade
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-foreground/85">
          Gems24 exists so that the people who actually move coloured stones can find each other without a middleman.
          Traders list natural gemstones with the details the trade cares about — weight, colour, treatment, origin and
          certification — and buyers deal with the dealer directly.
        </p>
      </header>

      <section aria-labelledby="how" className="space-y-2">
        <h2 id="how" className="text-lg font-semibold">
          How Gems24 works
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every member builds a professional profile: where they are based, how long they have traded and what material
          they specialise in. Verified traders publish stones to the{" "}
          <Link to="/gemstones" className="text-primary">gemstone marketplace</Link>, buyers browse by type, carat
          weight, treatment and origin, and conversations happen inside the platform. Connections are mutual, so
          contact details are only exchanged once both sides agree.
        </p>
      </section>

      <section aria-labelledby="faq" className="space-y-3">
        <h2 id="faq" className="text-lg font-semibold">
          Frequently asked questions
        </h2>
        {FAQ.map((f) => (
          <div key={f.q}>
            <h3 className="text-sm font-semibold">{f.q}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </section>

      <CategoryLinks />

      <p className="text-xs leading-relaxed text-muted-foreground">
        Read the <Link to="/terms" className="text-primary">Gems24 terms of service</Link> and{" "}
        <Link to="/privacy" className="text-primary">privacy policy</Link>.
      </p>
    </div>
  );
}