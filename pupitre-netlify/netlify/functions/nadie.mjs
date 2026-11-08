// Nadie más: respuestas del día de cada persona; la rareza se calcula en el navegador con todas.
import { sql, init, okUid, okDay, json, body, clipJson } from '../lib/db.mjs';

export default async (req) => {
  await init();
  if (req.method === 'GET') {
    const day = new URL(req.url).searchParams.get('day');
    if (!okDay(day)) return json({ list: [] });
    const list = await sql`SELECT a FROM nadie WHERE day = ${day} LIMIT 5000`;
    return json({ list });
  }
  const b = await body(req);
  if (!b || !okUid(b.uid) || !okDay(b.day) || typeof b.a !== 'object') return json({ error: 'Datos no válidos' }, 400);
  const a = {};
  for (const [k, v] of Object.entries(b.a)) if (/^p\d$/.test(k) && Number.isInteger(v) && v >= 0 && v < 1000) a[k] = v;
  await sql`INSERT INTO nadie (uid, day, a) VALUES (${b.uid}, ${b.day}, ${clipJson(a, 500)}::jsonb)
            ON CONFLICT (uid, day) DO NOTHING`;
  return json({ ok: true });
};

export const config = { path: '/api/nadie' };
