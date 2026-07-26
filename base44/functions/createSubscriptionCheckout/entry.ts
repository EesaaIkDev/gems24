import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.5.0';
import { secrets } from 'base44:runtime';
import { TIER_PRICE_IDS } from '../../shared/tierPrices.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const { tier, traderId, email, successUrl, cancelUrl } = await req.json();

    const priceId = TIER_PRICE_IDS[tier];
    if (!priceId) return Response.json({ error: 'Unknown plan' }, { status: 400 });
    if (!traderId) return Response.json({ error: 'Missing trader profile' }, { status: 400 });

    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { trader_id: traderId, tier },
      },
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        trader_id: traderId,
        tier,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionCheckout error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}