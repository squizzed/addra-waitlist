// netlify/functions/join.js
import { getStore } from '@netlify/blobs';

export async function handler(event) {
  try {
    const store = getStore('waitlist'); // create/reuse store

    const stats = (await store.getJSON('stats')) || { count: 0 };

    // GET ?mode=count
    if (event.httpMethod === 'GET' && event.queryStringParameters?.mode === 'count') {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ count: stats.count || 0 }),
      };
    }

    // POST { name, email }
    if (event.httpMethod === 'POST') {
      const { name, email } = JSON.parse(event.body || '{}');
      if (!name || !email) return { statusCode: 400, body: 'Missing name or email' };

      // store signup
      await store.setJSON(`users/${Date.now()}_${email}`, { name, email, ts: Date.now() });

      // update counter
      stats.count = (stats.count || 0) + 1;
      await store.setJSON('stats', stats);

      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: true, count: stats.count }),
      };
    }

    return { statusCode: 405, body: 'Method not allowed' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
}
