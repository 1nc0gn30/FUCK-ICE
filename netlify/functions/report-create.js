import { checkRateLimit, getClientIp, json, supabaseRequest, corsHeaders } from './_lib/supabase.js';

const REPORT_LIMIT = Number(process.env.REPORT_LIMIT_PER_WINDOW || 5);
const WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 3600);

function validate(payload) {
  const required = ['location', 'description', 'date', 'time'];
  for (const key of required) {
    if (!payload[key] || typeof payload[key] !== 'string') {
      return `${key} is required.`;
    }
  }

  if (!payload.client_id || typeof payload.client_id !== 'string') {
    return 'client_id is required.';
  }

  if (payload.location.length > 180) return 'location is too long.';
  if (payload.description.length > 5000) return 'description is too long.';
  if (payload.vehicle_details && payload.vehicle_details.length > 280) return 'vehicle_details is too long.';
  if (payload.image_url && typeof payload.image_url !== 'string') return 'image_url must be a string.';
  if (payload.image_path && typeof payload.image_path !== 'string') return 'image_path must be a string.';

  return null;
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
    const validationError = validate(payload);
    if (validationError) {
      return json(400, { error: validationError });
    }

    const ip = getClientIp(event.headers);
    const rateKey = `report:${ip}:${payload.client_id}`;
    const rate = await checkRateLimit({
      key: rateKey,
      limit: REPORT_LIMIT,
      windowSeconds: WINDOW_SECONDS,
    });

    if (rate.limited) {
      return json(429, {
        error: 'Rate limit exceeded for report submissions. Please wait and try again.',
        limit: rate.limit,
        remaining: rate.remaining,
      });
    }

    const rows = await supabaseRequest('sightings', {
      method: 'POST',
      body: [
        {
          location: payload.location,
          description: payload.description,
          date: payload.date,
          time: payload.time,
          vehicle_details: payload.vehicle_details || null,
          verified_count: 0,
          flagged_count: 0,
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          image_url: payload.image_url || null,
          image_path: payload.image_path || null,
        },
      ],
    });

    const created = Array.isArray(rows) ? rows[0] : null;
    return json(200, { data: created, remaining: rate.remaining });
  } catch (error) {
    return json(500, { error: error.message || 'Failed to create report.' });
  }
};
