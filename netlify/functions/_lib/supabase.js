const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function requireEnv() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export function getClientIp(headers = {}) {
  const netlifyIp = headers['x-nf-client-connection-ip'];
  if (netlifyIp) return netlifyIp;

  const forwarded = headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}

export async function supabaseRequest(path, { method = 'GET', body, headers = {} } = {}) {
  requireEnv();

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || data?.error || 'Supabase request failed.';
    throw new Error(message);
  }

  return data;
}

export async function checkRateLimit({ key, limit, windowSeconds }) {
  const now = Date.now();
  const windowStart = new Date(now - windowSeconds * 1000).toISOString();

  const existing = await supabaseRequest(
    `api_rate_limits?key=eq.${encodeURIComponent(key)}&select=key,count,window_started_at&limit=1`
  );

  let count = 1;
  let startedAt = new Date(now).toISOString();

  if (Array.isArray(existing) && existing.length > 0) {
    const row = existing[0];
    const rowStartedAt = row.window_started_at;

    if (rowStartedAt && rowStartedAt > windowStart) {
      count = Number(row.count || 0) + 1;
      startedAt = rowStartedAt;
    }
  }

  await supabaseRequest('api_rate_limits?on_conflict=key', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: [{ key, count, window_started_at: startedAt }],
  });

  return {
    limited: count > limit,
    remaining: Math.max(limit - count, 0),
    limit,
    count,
  };
}
