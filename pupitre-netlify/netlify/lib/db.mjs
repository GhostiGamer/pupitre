// Conexión a Netlify DB (Postgres de Neon). La URL llega sola en NETLIFY_DATABASE_URL.
import { neon } from '@netlify/neon';

export const sql = neon();

let ready;
// Crea las tablas la primera vez que se usa cada función (no hace falta ejecutar migraciones a mano).
export function init() {
  return (ready ||= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS presence (uid text PRIMARY KEY, room text, lobby jsonb, state jsonb, updated_at timestamptz NOT NULL DEFAULT now())`;
    await sql`CREATE INDEX IF NOT EXISTS presence_updated ON presence (updated_at)`;
    await sql`CREATE TABLE IF NOT EXISTS chat (id bigserial PRIMARY KEY, room text NOT NULL, uid text NOT NULL, nick text, color text, body text NOT NULL, ts bigint NOT NULL)`;
    await sql`CREATE INDEX IF NOT EXISTS chat_room_ts ON chat (room, ts)`;
    await sql`CREATE TABLE IF NOT EXISTS study (uid text NOT NULL, day text NOT NULL, min integer NOT NULL DEFAULT 0, nick text, PRIMARY KEY (uid, day))`;
    await sql`CREATE TABLE IF NOT EXISTS nadie (uid text NOT NULL, day text NOT NULL, a jsonb NOT NULL, PRIMARY KEY (uid, day))`;
  })().catch((e) => { ready = null; throw e; }));
}

export const okUid = (u) => typeof u === 'string' && /^[a-z0-9-]{8,48}$/.test(u);
export const okDay = (d) => typeof d === 'string' && /^[a-z0-9-]{4,24}$/i.test(d);
export const okColor = (c) => (typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c) ? c : '');
export const text = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u200b-\u200f\u202a-\u202e]/g, '').trim().slice(0, max);
export const clipJson = (o, max) => { const s = JSON.stringify(o ?? {}); return s.length > max ? '{}' : s; };
export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export async function body(req) { try { return JSON.parse(await req.text()); } catch { return null; } }
