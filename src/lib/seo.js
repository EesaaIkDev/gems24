/** Single source of truth for Gems24 search metadata. */

export const SITE = {
  name: "Gems24",
  url: "https://gems24.base44.app",
  logo: "https://media.base44.com/images/public/6a661583e07cf311ecceee39/497267ee2_Gems24-logo.png",
  socialImage:
    "https://media.base44.com/images/public/6a661583e07cf311ecceee39/497267ee2_Gems24-logo.png",
  description:
    "Gems24 is a global marketplace and professional network for the gemstone trade, where dealers, suppliers and buyers list natural coloured gemstones and connect directly.",
  locale: "en",
};

export const absolute = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/** Gemstone categories that the marketplace genuinely holds listings for. */
export const CATEGORIES = [
  {
    slug: "sapphire",
    type: "sapphire",
    name: "Sapphire",
    title: "Sapphires for Sale — Natural Sapphire Marketplace",
    description:
      "Browse natural sapphires listed by verified gemstone dealers on Gems24, from Ceylon blues to unheated fancy colours, with carat weight, origin and certificate details.",
    intro:
      "Sapphire is the most traded coloured stone on Gems24. Listings come directly from dealers and cutters, so each stone is described with its carat weight, colour, treatment status, origin and laboratory certificate where one exists. Unheated Ceylon material, Madagascan blues and fancy colours such as pink, yellow and padparadscha all appear here.",
  },
  {
    slug: "ruby",
    type: "ruby",
    name: "Ruby",
    title: "Rubies for Sale — Natural Ruby Marketplace",
    description:
      "Find natural rubies from gemstone traders worldwide on Gems24, with carat weight, colour, heat treatment and origin stated on every listing.",
    intro:
      "Ruby listings on Gems24 come from dealers working Burmese, Mozambican and East African material. Because colour and treatment drive ruby value, every listing states whether the stone is heated or unheated alongside its origin and any laboratory report.",
  },
  {
    slug: "emerald",
    type: "emerald",
    name: "Emerald",
    title: "Emeralds for Sale — Natural Emerald Marketplace",
    description:
      "Browse natural emeralds offered by gemstone suppliers on Gems24, with clarity, origin, treatment and certificate information on each listing.",
    intro:
      "Emerald trades on colour saturation and clarity character rather than flawlessness. Gems24 listings identify origin — Colombian, Zambian or Brazilian — along with treatment disclosure, so buyers can compare stones on the terms the trade actually uses.",
  },
  {
    slug: "spinel",
    type: "spinel",
    name: "Spinel",
    title: "Spinel for Sale — Natural Spinel Marketplace",
    description:
      "Natural spinel from gemstone dealers on Gems24, including Burmese reds, greys and pastel colours, listed with carat weight and origin.",
    intro:
      "Spinel has moved from a collector's stone to a mainstream trade item, and Gems24 reflects that: vivid Burmese reds, cobalt blues, greys and pastels appear alongside larger commercial parcels, almost always untreated.",
  },
  {
    slug: "garnet",
    type: "garnet",
    name: "Garnet",
    title: "Garnet for Sale — Natural Garnet Marketplace",
    description:
      "Browse natural garnet listings on Gems24, from rhodolite and spessartite to colour-change material, with weights and origins supplied by dealers.",
    intro:
      "The garnet group covers a wide colour range, and Gems24 listings name the variety where the seller knows it — rhodolite, spessartite, tsavorite or colour-change material — so buyers are not left guessing from a photograph.",
  },
];

export const categoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);

const slugify = (s = "") =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Human-readable listing headline, e.g. "Natural Blue Sapphire — 3.25 ct — Ceylon". */
export const listingTitle = (l) =>
  [
    ["Natural", l.color, l.gemstone_type].filter(Boolean).join(" "),
    `${l.weight_carats} ct`,
    l.origin,
  ]
    .filter(Boolean)
    .join(" — ")
    .replace(/\b\w/g, (c, i) => (i === 0 ? c.toUpperCase() : c));

/** Descriptive alt text built only from attributes the seller supplied. */
export const listingAlt = (l) =>
  [l.color, "natural", l.gemstone_type, `${l.weight_carats} carat`, l.origin ? `from ${l.origin}` : ""]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");

/** Clean, descriptive listing URL — slug for readers, id for lookup. */
export const listingPath = (l) =>
  `/listing/${slugify([l.gemstone_type, l.weight_carats && `${l.weight_carats}ct`, l.origin].filter(Boolean).join("-")) || "gemstone"}/${l.id}`;

/**
 * Route-level defaults. Anything private is explicitly noindex so member
 * areas never reach a search index, and every public entry has its own copy.
 */
const ROUTES = {
  "/": {
    title: "Gems24 — Global Gemstone Marketplace & Trader Network",
    description:
      "Gems24 connects gemstone dealers, suppliers and buyers worldwide. Browse natural coloured gemstone listings, follow the trade and message traders directly.",
  },
  "/welcome": {
    title: "Gems24 — Where the Gemstone Trade Connects",
    description:
      "Join Gems24, the global marketplace and professional network for gemstone dealers, suppliers, jewellers and buyers of natural coloured stones.",
  },
  "/gemstones": {
    title: "Gemstone Marketplace — Buy & Sell Natural Gemstones",
    description:
      "Search the Gems24 gemstone marketplace by stone type, carat weight, treatment and origin, and find the dealers and suppliers behind each listing.",
  },
  "/about": {
    title: "About Gems24 — The Gemstone Trading Network",
    description:
      "Learn how Gems24 works: a global marketplace and networking platform where gemstone traders publish listings, verify their identity and deal directly.",
  },
  "/terms": { title: "Terms of Service — Gems24", description: "The terms that govern use of the Gems24 gemstone marketplace and networking platform." },
  "/privacy": { title: "Privacy Policy — Gems24", description: "How Gems24 collects, uses and protects the information of gemstone traders and buyers on the platform." },
  "/join": { title: "Join Gems24 with an Invite Code", description: "Use a trader's invite code to join Gems24, the global gemstone marketplace and trade network.", robots: "noindex, follow" },
};

/** Member-only areas — crawlable links may exist, but nothing here is indexed. */
const PRIVATE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/messages",
  "/settings",
  "/profile",
  "/connections",
  "/subscription",
  "/onboarding",
  "/add",
  "/my-listings",
];

export function routeSeo(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return { title: `${SITE.name}`, description: SITE.description, robots: "noindex, nofollow", canonical: null };
  }
  const hit = ROUTES[path];
  if (hit) return { ...hit, canonical: absolute(path) };
  return { title: `${SITE.name} — Global Gemstone Marketplace`, description: SITE.description, canonical: absolute(path) };
}