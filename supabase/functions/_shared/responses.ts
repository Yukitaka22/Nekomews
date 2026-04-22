import { corsHeaders } from './cors.ts';

export function successResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400,
  requestId?: string
): Response {
  return new Response(
    JSON.stringify({
      error: { code, message, request_id: requestId ?? crypto.randomUUID() },
    }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
