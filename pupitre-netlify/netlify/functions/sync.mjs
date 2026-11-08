// Presencia: cada navegador manda su estado y recibe el de quien ha dado señales en los últimos 12 segundos.
import { sql, init, okUid, json, body, clipJson, text } from '../lib/db.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Usa POST' }, 405);
  const b = await body(req);
  if (!b || !okUid(b.uid)) return json({ error: 'Datos no válidos' }, 400);
  await init();
  if (b.leave) { await sql`DELETE FROM presence WHERE uid = ${b.uid}`; return json({ ok: true }); }
  const room = b.room ? text(b.room, 40) : null;
  await sql`INSERT INTO presence (uid, room, lobby, state, updated_at)
            VALUES (${b.uid}, ${room}, ${clipJson(b.lobby, 1500)}::jsonb, ${clipJson(b.state, 2500)}::jsonb, now())
            ON CONFLICT (uid) DO UPDATE SET room = EXCLUDED.room, lobby = EXCLUDED.lobby, state = EXCLUDED.state, updated_at = now()`;
  if (Math.random() < 0.02) await sql`DELETE FROM presence WHERE updated_at < now() - interval '15 minutes'`;
  const peers = await sql`SELECT uid, room, lobby, CASE WHEN room IS NOT NULL AND room = ${room} THEN state ELSE NULL END AS state
                          FROM presence WHERE updated_at > now() - interval '12 seconds' LIMIT 400`;
  return json({ peers });
};

export const config = { path: '/api/sync' };
