import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';
import { secrets } from 'base44:runtime';
import { tierForPriceId } from '../../shared/tierPrices.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      secrets.get('STRIPE_WEBHOOK_SECRET')
    );

    const setTier = async (traderId, tier) => {
      if (!traderId) return;
      await base44.asServiceRole.entities.Trader.update(traderId, { subscription_tier: tier });
      const listings = await base44.asServiceRole.entities.Listing.filter({ trader_id: traderId });
      if (listings.length) {
        await base44.asServiceRole.entities.Listing.bulkUpdate(
          listings.map((l) => ({ id: l.id, trader_tier: tier }))
        );
      }
    };

    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      await setTier(s.metadata?.trader_id, s.metadata?.tier);
    } else if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const tier = tierForPriceId(sub.items?.data?.[0]?.price?.id) || sub.metadata?.tier;
      const active = ['active', 'trialing'].includes(sub.status);
      await setTier(sub.metadata?.trader_id, active ? tier : 'none');
    } else if (event.type === 'customer.subscription.deleted') {
      await setTier(event.data.object.metadata?.trader_id, 'none');
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook error', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}