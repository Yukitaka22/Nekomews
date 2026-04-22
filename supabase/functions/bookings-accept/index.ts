import { z } from 'https://esm.sh/zod@3.23.8';
import { handleCors } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/responses.ts';
import { userSupabaseClient, serviceSupabaseClient, getAuthedUser } from '../_shared/supabase.ts';

const bodySchema = z.object({
  booking_id: z.string().uuid(),
  action: z.enum(['accept', 'decline']),
});

Deno.serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    if (req.method !== 'POST') return errorResponse('METHOD_NOT_ALLOWED', '', 405);
    const supaUser = userSupabaseClient(req);
    const user = await getAuthedUser(supaUser);
    const body = bodySchema.parse(await req.json());

    const svc = serviceSupabaseClient();
    const { data: booking, error } = await svc
      .from('bookings')
      .select('*')
      .eq('id', body.booking_id)
      .single();
    if (error || !booking) return errorResponse('NOT_FOUND', '予約が見つかりませんでした', 404);
    if (booking.sitter_id !== user.id)
      return errorResponse('FORBIDDEN', '権限がありません', 403);
    if (booking.status !== 'requested')
      return errorResponse('INVALID_STATE', 'この予約は処理済みです', 400);

    const update =
      body.action === 'accept'
        ? { status: 'accepted' as const }
        : {
            status: 'declined' as const,
            cancelled_at: new Date().toISOString(),
            cancelled_by: user.id,
          };

    const { data: updated, error: updErr } = await svc
      .from('bookings')
      .update(update)
      .eq('id', body.booking_id)
      .select()
      .single();
    if (updErr) throw updErr;

    // TODO: 飼い主にプッシュ通知

    return successResponse({ booking: updated });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return errorResponse('VALIDATION_ERROR', e.errors.map((e) => e.message).join(', '));
    }
    if (e.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', '認証が必要です', 401);
    console.error('bookings-accept error:', e);
    return errorResponse('INTERNAL_ERROR', 'サーバーエラーが発生しました', 500);
  }
});
