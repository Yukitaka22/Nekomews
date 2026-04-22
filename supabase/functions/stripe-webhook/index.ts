import { successResponse, errorResponse } from '../_shared/responses.ts';
import { serviceSupabaseClient } from '../_shared/supabase.ts';

/**
 * Stripe Webhook 受信エンドポイント
 *
 * 受信イベント:
 * - payment_intent.succeeded  → booking status を confirmed に
 * - payment_intent.payment_failed → booking status を cancelled に
 * - charge.refunded → booking に refunded_at を記録
 * - account.updated (Connect) → sitter_profiles.stripe_connect_account_id 更新
 *
 * NOTE: MVP 段階ではスケルトン。Stripe SDK を Deno 用に読み込んで署名検証を行う。
 */

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', '', 405);
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const body = await req.text();

    if (!signature || !webhookSecret) {
      console.warn('Stripe webhook: signature or secret missing');
      return errorResponse('UNAUTHORIZED', 'signature missing', 401);
    }

    // TODO: Stripe SDK で署名検証
    // import Stripe from 'https://esm.sh/stripe@16.0.0'
    // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const event = JSON.parse(body);
    const svc = serviceSupabaseClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intentId = event.data.object.id;
        await svc
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('stripe_payment_intent_id', intentId)
          .eq('status', 'accepted');
        break;
      }
      case 'payment_intent.payment_failed': {
        const intentId = event.data.object.id;
        await svc
          .from('bookings')
          .update({
            status: 'cancelled',
            cancellation_reason: 'payment_failed',
            cancelled_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', intentId);
        break;
      }
      case 'charge.refunded':
        // TODO: refund 処理
        console.log('refund received:', event.data.object.id);
        break;
      case 'account.updated':
        // TODO: Connect アカウントの状態反映
        console.log('account updated:', event.data.object.id);
        break;
      default:
        console.log('unhandled event type:', event.type);
    }

    return successResponse({ received: true });
  } catch (e: any) {
    console.error('stripe-webhook error:', e);
    return errorResponse('INTERNAL_ERROR', 'webhook processing failed', 500);
  }
});
