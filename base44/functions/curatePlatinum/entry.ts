import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { listingStamp, restampListings } from '../../shared/traders.ts';

/**
 * One-off clean-up for "Platinum is for businesses only". Admin only.
 *
 *   { "confirm": "RUN" }
 *     1. Deletes Ravi Perera ("Ceylon Blue Gems") with his listings, chats,
 *        connections and verification records.
 *     2. Moves Nasma Riyaz from Platinum to Gold as an individual trader.
 *     3. Adds 5 sample businesses on Platinum with 6 listings each
 *        (is_demo, never verified, no photos). Skips any already added.
 *     Any other Platinum account that isn't a business is reported, not changed.
 *
 *   { "action": "remove_demo", "confirm": "REMOVE" }
 *     Deletes every sample business and its listings (run before launch).
 *
 * Safe to run again: finished steps are skipped.
 */

const RAVI = { id: '6a661a334a05abbcc5e2c5e3', full_name: 'Ravi Perera' };
const NASMA = { id: '6aba8238ae2f27b4f625ef14', full_name: 'Nasma Riyaz' };
const SAMPLE_NOTE = 'Sample business account for demonstration.';

type Stone = [string, number, string, string, string, string];
const BUSINESSES: Array<{ trader: Record<string, unknown>; stones: Stone[] }> = [
  {
    trader: {
      full_name: 'Dilan Wickramasinghe', contact_role: 'Managing Director',
      legal_business_name: 'Ratnapura Heritage Gems (Pvt) Ltd', business_name: 'Ratnapura Heritage Gems',
      business_type: 'private_limited', year_founded: 1987, team_size: '11-50',
      country: 'Sri Lanka', city: 'Ratnapura', years_experience: 37,
      specialties: ['sapphire', 'padparadscha', 'spinel'],
      bio: `${SAMPLE_NOTE} Family-run mine owner and cutter in Ratnapura supplying unheated Ceylon sapphires to the trade.`,
    },
    stones: [
      ['sapphire', 3.12, 'Royal blue', 'unheated', 'Ratnapura, Sri Lanka', 'GRS'],
      ['sapphire', 2.05, 'Cornflower blue', 'unheated', 'Ratnapura, Sri Lanka', ''],
      ['sapphire', 1.48, 'Padparadscha pink-orange', 'unheated', 'Sri Lanka', 'GIA'],
      ['spinel', 2.6, 'Hot pink', 'unheated', 'Sri Lanka', ''],
      ['sapphire', 4.4, 'Yellow', 'heated', 'Sri Lanka', ''],
      ['garnet', 3.9, 'Hessonite orange', 'unheated', 'Sri Lanka', ''],
    ],
  },
  {
    trader: {
      full_name: 'Shiran Fernando', contact_role: 'Director of Sales',
      legal_business_name: 'Lanka Sapphire Exports (Pvt) Ltd', business_name: 'Lanka Sapphire Exports',
      business_type: 'private_limited', year_founded: 2004, team_size: '51-200',
      country: 'Sri Lanka', city: 'Colombo', years_experience: 20,
      specialties: ['sapphire', 'ruby', 'calibrated parcels'],
      bio: `${SAMPLE_NOTE} Colombo exporter of calibrated sapphire parcels and single stones for jewellery manufacturers.`,
    },
    stones: [
      ['sapphire', 1.02, 'Blue', 'heated', 'Sri Lanka', ''],
      ['sapphire', 5.2, 'Velvet blue', 'heated', 'Sri Lanka', 'GIA'],
      ['ruby', 1.35, 'Pinkish red', 'heated', 'Sri Lanka', ''],
      ['sapphire', 2.75, 'Teal', 'unheated', 'Madagascar', ''],
      ['sapphire', 0.95, 'Pink', 'heated', 'Sri Lanka', ''],
      ['sapphire', 3.3, 'Purple', 'unheated', 'Sri Lanka', ''],
    ],
  },
  {
    trader: {
      full_name: 'Anan Chaiyaporn', contact_role: 'Owner',
      legal_business_name: 'Siam Gem House Co., Ltd.', business_name: 'Siam Gem House',
      business_type: 'private_limited', year_founded: 1995, team_size: '11-50',
      country: 'Thailand', city: 'Bangkok', years_experience: 29,
      specialties: ['ruby', 'spinel', 'sapphire'],
      bio: `${SAMPLE_NOTE} Bangkok gem house trading Burmese and Mozambique rubies and fine spinel.`,
    },
    stones: [
      ['ruby', 2.01, 'Pigeon blood red', 'unheated', 'Mozambique', 'GRS'],
      ['ruby', 1.18, 'Red', 'heated', 'Myanmar', ''],
      ['spinel', 3.05, 'Red', 'unheated', 'Myanmar', ''],
      ['spinel', 1.75, 'Cobalt blue', 'unheated', 'Vietnam', ''],
      ['sapphire', 2.4, 'Green', 'heated', 'Thailand', ''],
      ['garnet', 4.1, 'Rhodolite purple-red', 'unheated', 'Tanzania', ''],
    ],
  },
  {
    trader: {
      full_name: 'Omar Al Mansoori', contact_role: 'General Manager',
      legal_business_name: 'Al Noor Precious Stones LLC', business_name: 'Al Noor Precious Stones',
      business_type: 'private_limited', year_founded: 2011, team_size: '2-10',
      country: 'United Arab Emirates', city: 'Dubai', years_experience: 15,
      specialties: ['emerald', 'ruby', 'sapphire'],
      bio: `${SAMPLE_NOTE} Dubai wholesaler of Colombian and Zambian emeralds for the Gulf jewellery trade.`,
    },
    stones: [
      ['emerald', 2.5, 'Vivid green', 'other', 'Colombia', 'GIA'],
      ['emerald', 1.65, 'Green', 'other', 'Zambia', ''],
      ['emerald', 4.02, 'Bluish green', 'other', 'Zambia', ''],
      ['ruby', 1.9, 'Red', 'heated', 'Mozambique', ''],
      ['sapphire', 3.6, 'Blue', 'heated', 'Sri Lanka', ''],
      ['garnet', 2.2, 'Tsavorite green', 'unheated', 'Kenya', ''],
    ],
  },
  {
    trader: {
      full_name: 'Grace Leung', contact_role: 'Director',
      legal_business_name: 'Victoria Harbour Gems Ltd', business_name: 'Victoria Harbour Gems',
      business_type: 'private_limited', year_founded: 2001, team_size: '11-50',
      country: 'Hong Kong', city: 'Hong Kong', years_experience: 23,
      specialties: ['sapphire', 'spinel', 'emerald'],
      bio: `${SAMPLE_NOTE} Hong Kong dealer supplying matched pairs and layouts to Asian jewellery houses.`,
    },
    stones: [
      ['sapphire', 2.02, 'Blue (matched pair)', 'heated', 'Sri Lanka', ''],
      ['spinel', 1.4, 'Lavender', 'unheated', 'Sri Lanka', ''],
      ['emerald', 1.12, 'Green', 'other', 'Colombia', ''],
      ['sapphire', 6.1, 'Blue', 'heated', 'Madagascar', 'GRS'],
      ['ruby', 0.85, 'Red', 'heated', 'Thailand', ''],
      ['other', 3.25, 'Aquamarine blue', 'heated', 'Brazil', ''],
    ],
  },
];

const PAGE = 200;
async function all(entity: any, query: Record<string, unknown> = {}) {
  const rows: any[] = [];
  for (let skip = 0; ; skip += PAGE) {
    const page = Object.keys(query).length
      ? await entity.filter(query, 'created_date', PAGE, skip)
      : await entity.list('created_date', PAGE, skip);
    rows.push(...(page || []));
    if (!page || page.length < PAGE) return rows;
  }
}

async function deleteTrader(svc: any, trader: any) {
  const counts = { listings: 0, conversations: 0, messages: 0, connections: 0 };
  for (const l of await all(svc.Listing, { trader_id: trader.id })) {
    await svc.Listing.delete(l.id);
    counts.listings++;
  }
  const convos = [
    ...(await all(svc.Conversation, { participant_a_id: trader.id })),
    ...(await all(svc.Conversation, { participant_b_id: trader.id })),
  ];
  for (const c of convos) {
    for (const m of await all(svc.Message, { conversation_id: c.id })) {
      await svc.Message.delete(m.id);
      counts.messages++;
    }
    await svc.Conversation.delete(c.id);
    counts.conversations++;
  }
  const connections = [
    ...(await all(svc.Connection, { requester_id: trader.id })),
    ...(await all(svc.Connection, { recipient_id: trader.id })),
  ];
  for (const k of connections) {
    await svc.Connection.delete(k.id);
    counts.connections++;
  }
  for (const v of await all(svc.Verification, { trader_id: trader.id })) await svc.Verification.delete(v.id);
  for (const a of await all(svc.VerificationAttempt, { trader_id: trader.id })) await svc.VerificationAttempt.delete(a.id);
  await svc.Trader.delete(trader.id);
  return counts;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me().catch(() => null);
    if (admin?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { action, confirm } = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;

    if (action === 'remove_demo') {
      if (confirm !== 'REMOVE') return Response.json({ error: 'Send confirm: "REMOVE"' }, { status: 400 });
      const demo = (await all(svc.Trader)).filter((t: any) => t.is_demo === true);
      let listings = 0;
      for (const t of demo) listings += (await deleteTrader(svc, t)).listings;
      return Response.json({ ok: true, removed: { businesses: demo.length, listings } });
    }

    if (confirm !== 'RUN') return Response.json({ error: 'Send confirm: "RUN"' }, { status: 400 });
    const report: Record<string, unknown> = {};

    const ravi = (await svc.Trader.filter({ id: RAVI.id }))?.[0];
    report.ravi = ravi && ravi.full_name === RAVI.full_name
      ? { deleted: await deleteTrader(svc, ravi) }
      : 'already removed';

    const nasma = (await svc.Trader.filter({ id: NASMA.id }))?.[0];
    if (nasma && nasma.full_name === NASMA.full_name && nasma.subscription_tier === 'platinum') {
      const patch = { subscription_tier: 'gold', trader_kind: 'individual', pending_tier: '', pending_tier_at: null };
      await svc.Trader.update(nasma.id, patch);
      await restampListings(base44, { ...nasma, ...patch });
      report.nasma = 'moved to Gold';
    } else {
      report.nasma = nasma ? `unchanged (${nasma.subscription_tier})` : 'not found';
    }

    const traders = await all(svc.Trader);
    const existing = new Set(traders.filter((t: any) => t.is_demo).map((t: any) => t.legal_business_name));
    const added: string[] = [];
    for (const b of BUSINESSES) {
      if (existing.has(b.trader.legal_business_name)) continue;
      const trader = await svc.Trader.create({
        ...b.trader,
        user_email: '',
        account_type: 'trader',
        trader_kind: 'business',
        subscription_tier: 'platinum',
        is_demo: true,
        verified: false,
        read_receipts: true,
      });
      for (const [gemstone_type, weight_carats, color, treatment, origin, certificate_lab] of b.stones) {
        const listing = {
          trader_id: trader.id,
          gemstone_type,
          weight_carats,
          color,
          treatment,
          origin,
          certificate_lab,
          status: 'available',
          photos: [],
          is_demo: true,
          description: `${weight_carats} ct ${color.toLowerCase()} ${gemstone_type === 'other' ? 'gemstone' : gemstone_type} from ${origin}. Sample listing for demonstration.`,
        };
        const created = await svc.Listing.create(listing);
        await svc.Listing.update(created.id, listingStamp(trader, created));
      }
      added.push(String(b.trader.business_name));
    }
    report.sample_businesses_added = added;

    // Anything else still on Platinum without being a business is flagged, never touched.
    report.other_platinum_individuals = (await all(svc.Trader))
      .filter((t: any) => t.subscription_tier === 'platinum' && t.trader_kind !== 'business')
      .map((t: any) => ({ id: t.id, name: t.business_name || t.full_name }));

    console.log('curatePlatinum', JSON.stringify(report));
    return Response.json({ ok: true, ...report });
  } catch (error: any) {
    console.error('curatePlatinum failed', error);
    return Response.json({ error: 'Clean-up failed' }, { status: 500 });
  }
}
