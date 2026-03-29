import { checkRateLimit, getClientIp, json, supabaseRequest, corsHeaders } from './_lib/supabase.js';

const VOTE_LIMIT = Number(process.env.VOTE_LIMIT_PER_WINDOW || 60);
const WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 3600);

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sanitize(value) {
  return encodeURIComponent(String(value || ''));
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const voteType = payload.vote_type;
    const sightingId = payload.sighting_id;
    const clientId = payload.client_id;

    if (!isUuid(sightingId)) {
      return json(400, { error: 'Invalid sighting_id.' });
    }

    if (voteType !== 'verify' && voteType !== 'flag') {
      return json(400, { error: 'vote_type must be verify or flag.' });
    }

    if (!clientId || typeof clientId !== 'string') {
      return json(400, { error: 'client_id is required.' });
    }

    const ip = getClientIp(event.headers);
    const rate = await checkRateLimit({
      key: `vote:${ip}:${clientId}`,
      limit: VOTE_LIMIT,
      windowSeconds: WINDOW_SECONDS,
    });

    if (rate.limited) {
      return json(429, {
        error: 'Rate limit exceeded for voting. Please wait and try again.',
        limit: rate.limit,
        remaining: rate.remaining,
      });
    }

    const voteRecord = {
      sighting_id: sightingId,
      client_id: clientId,
      vote_type: voteType,
      ip_address: ip,
    };

    try {
      await supabaseRequest('sighting_votes', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: [voteRecord],
      });
    } catch (voteError) {
      if (String(voteError.message).includes('duplicate key')) {
        return json(409, { error: 'You already voted on this report.' });
      }
      throw voteError;
    }

    const sightings = await supabaseRequest(
      `sightings?id=eq.${sanitize(sightingId)}&select=id,verified_count,flagged_count&limit=1`
    );
    const current = Array.isArray(sightings) ? sightings[0] : null;

    if (!current) {
      return json(404, { error: 'Sighting not found.' });
    }

    const nextVerified =
      voteType === 'verify' ? Number(current.verified_count || 0) + 1 : Number(current.verified_count || 0);
    const nextFlagged =
      voteType === 'flag' ? Number(current.flagged_count || 0) + 1 : Number(current.flagged_count || 0);

    const updatedRows = await supabaseRequest(`sightings?id=eq.${sanitize(sightingId)}`, {
      method: 'PATCH',
      body: [{ verified_count: nextVerified, flagged_count: nextFlagged }],
    });

    const updated = Array.isArray(updatedRows) ? updatedRows[0] : null;
    return json(200, { data: updated, remaining: rate.remaining });
  } catch (error) {
    return json(500, { error: error.message || 'Vote failed.' });
  }
};
