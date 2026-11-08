// Minutos estudiados hoy: uno por persona y día. El inicio y la sala suman los de todos.
import { sql, init, okUid, okDay, json, body, text } from '../lib/db.mjs';

export default async (req) => {
  await init();
  if (req.method === 'GET') {
    const day = new URL(req.url).searchParams.get('day');
    if (!okDay(day)) return json({ list: [] });
    const list = await sql`SELECT min, nick FROM study WHERE day = ${day} LIMIT 2000`;
    return json({ list });
  }
  const b = await body(req);
  if (!b || !okUid(b.uid) || !okDay(b.day)) return json({ error: 'Datos no válidos' }, 400);
  const min = Math.max(0, Math.min(1440, Math.round(Number(b.min) || 0)));
  await sql`INSERT INTO study (uid, day, min, nick) VALUES (${b.uid}, ${b.day}, ${min}, ${text(b.nick, 16)})
            ON CONFLICT (uid, day) DO UPDATE SET min = EXCLUDED.min, nick = EXCLUDED.nick`;
  return json({ ok: true });
};

export const config = { path: '/api/study' };
