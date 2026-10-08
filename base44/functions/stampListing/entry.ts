import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { effectiveLimit, isActiveListing, listingStamp } from '../../shared/traders.ts';

/**
 * Runs after a listing is created, changes status or changes owner (see the
 * ListingGuard workflow). The browser can't be trusted with any of this:
 *
 *  - the listing must belong to a trader account owned by whoever created it;
 *  - the trader must have room on their plan (a scheduled downgrade's lower
 *    limit already counts);
 *  - name, country, grade and verified badge are copied from the trader here.
 *
 * Safe to call directly: it only ever enforces the rules on the given listing.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { listing_id, event_type } = await req.json().catch(() => ({}));
    const listing = (
      await base44.asServiceRole.entities.Listing.filter({ id: String(listing_id || '') })
    )?.[0];
    if (!listing) return Response.json({ ok: true, skipped: 'not found' });

    const isCreate = event_type === 'create';
    const trader = (
      await base44.asServiceRole.entities.Trader.filter({ id: listing.trader_id })
    )?.[0];
    const owns =
      !!trader &&
      ((!!listing.created_by_id && listing.created_by_id === trader.created_by_id) ||
        (!!listing.created_by && listing.created_by === trader.user_email));

    if (!owns || trader.account_type !== 'trader') {
      await base44.asServiceRole.entities.Listing.delete(listing.id);
      console.warn(`stampListing: removed listing=${listing.id} (not owned by a trader account)`);
      return Response.json({ ok: true, removed: 'not_owner' });
    }

    if (isActiveListing(listing)) {
      const rows = await base44.asServiceRole.entities.Listing.filter({ trader_id: trader.id });
      const active = (rows || []).filter(isActiveListing).length;
      if (active > effectiveLimit(trader)) {
        if (isCreate) {
          await base44.asServiceRole.entities.Listing.delete(listing.id);
        } else {
          await base44.asServiceRole.entities.Listing.update(listing.id, { status: 'sold' });
        }
        console.warn(`stampListing: over capacity trader=${trader.id} listing=${listing.id}`);
        return Response.json({ ok: true, removed: 'over_capacity' });
      }
    }

    const stamp = listingStamp(trader, listing);
    if (Object.entries(stamp).some(([k, v]) => listing[k] !== v)) {
      await base44.asServiceRole.entities.Listing.update(listing.id, stamp);
    }
    return Response.json({ ok: true });
  } catch (error: any) {
    console.error('stampListing failed', error);
    return Response.json({ error: 'Could not check listing.' }, { status: 500 });
  }
}
