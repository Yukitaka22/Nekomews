import { z } from 'https://esm.sh/zod@3.23.8';
import { handleCors } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/responses.ts';
import { userSupabaseClient, serviceSupabaseClient, getAuthedUser } from '../_shared/supabase.ts';

const bodySchema = z.object({
  booking_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  photos: z.array(z.string().url()).max(6).optional(),
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
    const { data: booking } = await svc
      .from('bookings')
      .select('*')
      .eq('id', body.booking_id)
      .single();
    if (!booking) return errorResponse('NOT_FOUND', '予約が見つかりませんでした', 404);
    if (!['completed', 'disputed'].includes(booking.status))
      return errorResponse('INVALID_STATE', '完了していない予約にはレビューできません', 400);

    const isOwner = booking.owner_id === user.id;
    const isSitter = booking.sitter_id === user.id;
    if (!isOwner && !isSitter) return errorResponse('FORBIDDEN', '権限がありません', 403);

    const direction = isOwner ? 'owner_to_sitter' : 'sitter_to_owner';
    const revieweeId = isOwner ? booking.sitter_id : booking.owner_id;

    // 既存レビューチェック
    const { data: existing } = await svc
      .from('reviews')
      .select('id')
      .eq('booking_id', body.booking_id)
      .eq('direction', direction)
      .maybeSingle();
    if (existing) return errorResponse('ALREADY_REVIEWED', '既にレビューを送信しています', 409);

    const { data: review, error } = await svc
      .from('reviews')
      .insert({
        booking_id: body.booking_id,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        direction,
        rating: body.rating,
        comment: body.comment ?? null,
        photos: body.photos ?? [],
        // published_at は null のまま（両者揃うか7日経過で公開）
      })
      .select()
      .single();
    if (error) throw error;

    // 反対方向のレビューが既にあれば、両方を同時公開
    const { data: opposite } = await svc
      .from('reviews')
      .select('id')
      .eq('booking_id', body.booking_id)
      .neq('direction', direction)
      .maybeSingle();

    if (opposite) {
      const now = new Date().toISOString();
      await svc
        .from('reviews')
        .update({ published_at: now })
        .eq('booking_id', body.booking_id)
        .is('published_at', null);
    }

    return successResponse({ review });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return errorResponse('VALIDATION_ERROR', e.errors.map((e) => e.message).join(', '));
    }
    if (e.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', '認証が必要です', 401);
    console.error('reviews-submit error:', e);
    return errorResponse('INTERNAL_ERROR', 'サーバーエラーが発生しました', 500);
  }
});
