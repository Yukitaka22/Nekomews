import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

/**
 * リクエストの Authorization ヘッダーから Supabase クライアントを構築
 * RLS が適用される（呼び出し元ユーザーとして動く）
 */
export function userSupabaseClient(req: Request): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
}

/**
 * service_role クライアント（RLS を無視）
 * 必要な範囲でのみ使用
 */
export function serviceSupabaseClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function getAuthedUser(client: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new Error('UNAUTHORIZED');
  return user;
}
