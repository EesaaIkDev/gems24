import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SITE = 'https://gems24.base44.app';
const CATEGORIES = ['sapphire', 'ruby', 'emerald', 'spinel', 'garnet'];

const slugify = (s) =>
  String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const listingPath = (l) =>
  `/listing/${slugify([l.gemstone_type, l.weight_carats ? `${l.weight_carats}ct` : '', l.origin].filter(Boolean).join('-')) || 'gemstone'}/${l.id}`;

const urlNode = (loc, changefreq, priority, lastmod) =>
  `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

/** Dynamic sitemap: static public pages + every live public listing. */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const statics = [
      urlNode(`${SITE}/`, 'daily', '1.0'),
      urlNode(`${SITE}/gemstones`, 'daily', '0.9'),
      ...CATEGORIES.map((c) => urlNode(`${SITE}/gemstones/${c}`, 'daily', '0.8')),
      urlNode(`${SITE}/about`, 'monthly', '0.6'),
      urlNode(`${SITE}/welcome`, 'monthly', '0.5'),
      urlNode(`${SITE}/terms`, 'yearly', '0.2'),
      urlNode(`${SITE}/privacy`, 'yearly', '0.2'),
    ];

    // Only unsold listings — sold stones are no longer useful search results.
    const listings = await base44.asServiceRole.entities.Listing.list('-updated_date', 1000);
    const listingNodes = (listings || [])
      .filter((l) => l.status !== 'sold')
      .map((l) => urlNode(`${SITE}${listingPath(l)}`, 'weekly', '0.7', l.updated_date));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...statics, ...listingNodes].join('\n')}\n</urlset>\n`;

    return new Response(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}