import { z } from 'https://esm.sh/zod@3.23.8';
import { handleCors } from '../_shared/cors.ts';
import { successResponse, errorResponse } from '../_shared/responses.ts';
import { userSupabaseClient, serviceSupabaseClient, getAuthedUser } from '../_shared/supabase.ts';

const bodySchema = z.object({
  sitter_id: z.string().uuid(),
  cat_ids: z.array(z.string().uuid()).min(1),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  service_type: z.enum(['visit', 'boarding']),
  notes: z.string().max(500).optional(),
  insurance_opt_in: z.boolean().default(true),
});

const PLATFORM_FEE_RATE = 0.15;
const INSURANCE_FEE = 200;

Deno.serve(async (req) => {
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  try {
    if (req.method !== 'POST') return errorResponse('METHOD_NOT_ALLOWED', '', 405);

    const supaUser = userSupabaseClient(req);
    const user = await getAuthedUser(supaUser);

    const raw = await req.json();
    const body = bodySchema.parse(raw);

    // 日程バリデーション
    const start = new Date(body.start_at);
    const end = new Date(body.end_at);
    if (end <= start) return errorResponse('VALIDATION_ERROR', '終了日時は開始日時より後にしてください');
    if (start.getTime() - Date.now() < 24 * 60 * 60 * 1000)
      return errorResponse('VALIDATION_ERROR', '24時間以降の日程を指定してください');

    // シッターの受付状況
    const svc = serviceSupabaseClient();
    const { data: sitter, error: sitterErr } = await svc
      .from('sitter_profiles')
      .select('acceptance_status, base_rate, user_id')
      .eq('user_id', body.sitter_id)
      .single();
    if (sitterErr || !sitter) return errorResponse('SITTER_NOT_FOUND', 'シッターが見つかりませんでした', 404);
    if (sitter.acceptance_status !== 'active')
      return errorResponse('SITTER_NOT_AVAILABLE', '現在受付を停止中です', 400);

    // 日程重複チェック
    const { count } = await svc
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('sitter_id', body.sitter_id)
      .in('status', ['accepted', 'confirmed'])
      .lt('start_at', body.end_at)
      .gt('end_at', body.start_at);
    if ((count ?? 0) > 0) return errorResponse('TIME_CONFLICT', 'その時間帯は予約できません', 409);

    // 見積もり計算
    const hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    const baseFee = Math.round(sitter.base_rate * hours);
    const insuranceFee = body.insurance_opt_in ? INSURANCE_FEE : 0;
    const subtotal = baseFee + insuranceFee;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
    const total = subtotal + platformFee;

    // 予約INSERT
    const { data: booking, error: insertErr } = await svc
      .from('bookings')
      .insert({
        owner_id: user.id,
        sitter_id: body.sitter_id,
        cat_ids: body.cat_ids,
        start_at: body.start_at,
        end_at: body.end_at,
        service_type: body.service_type,
        base_fee: baseFee,
        insurance_fee: insuranceFee,
        platform_fee: platformFee,
        total_amount: total,
        notes: body.notes ?? null,
        status: 'requested',
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    // TODO: プッシュ通知送信（expo-server-sdk）
    // await sendPush({ toUserId: body.sitter_id, title: '新着の予約依頼', ... });

    return successResponse({ booking });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return errorResponse('VALIDATION_ERROR', e.errors.map((e) => e.message).join(', '), 400);
    }
    if (e.message === 'UNAUTHORIZED') return errorResponse('UNAUTHORIZED', '認証が必要です', 401);
    console.error('bookings-create error:', e);
    return errorResponse('INTERNAL_ERROR', 'サーバーエラーが発生しました', 500);
  }
});
