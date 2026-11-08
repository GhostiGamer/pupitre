// Chat por sala: mensajes cortos, máximo uno cada 2 segundos por persona, se guardan 2 días.
import { sql, init, okUid, okColor, json, body, text } from '../lib/db.mjs';

export default async (req) => {
  await init();
  const url = new URL(req.url);
  if (req.method === 'GET') {
    const room = text(url.searchParams.get('room'), 40);
    const since = Math.max(Number(url.searchParams.get('since')) || 0, Date.now() - 6 * 3600e3);
    if (!room) return json({ list: [] });
    const rows = await sql`SELECT uid, nick, color AS c, body AS t, ts FROM chat WHERE room = ${room} AND ts > ${since} ORDER BY ts DESC LIMIT 40`;
    return json({ list: rows.reverse().map((r) => ({ ...r, ts: Number(r.ts) })) });
  }
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  const b = await body(req);
  if (!b || !okUid(b.uid)) return json({ error: 'Datos no válidos' }, 400);
  const room = text(b.room, 40), msg = text(b.t, 140), nick = text(b.nick, 16) || 'Alguien';
  if (!room || !msg) return json({ error: 'Mensaje vacío' }, 400);
  const now = Date.now();
  const [last] = await sql`SELECT ts FROM chat WHERE uid = ${b.uid} ORDER BY ts DESC LIMIT 1`;
  if (last && now - Number(last.ts) < 2000) return json({ error: 'Demasiado rápido' }, 429);
  await sql`INSERT INTO chat (room, uid, nick, color, body, ts) VALUES (${room}, ${b.uid}, ${nick}, ${okColor(b.c)}, ${msg}, ${now})`;
  if (Math.random() < 0.01) await sql`DELETE FROM chat WHERE ts < ${now - 2 * 864e5}`;
  return json({ ok: true, ts: now });
};

export const config = { path: '/api/chat' };
