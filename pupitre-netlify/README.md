# Pupitre en Netlify

Web estática en `public/` y una API pequeña en `netlify/functions/` que guarda los datos en **Netlify DB** (Postgres de Neon).

## Qué hace la API

| Ruta | Para qué |
|---|---|
| `/api/sync` | Presencia en vivo: quién está, en qué sala, dónde y qué hace. Cada navegador la llama una vez por segundo dentro de la sala y cada 6 segundos fuera. |
| `/api/chat` | Chat por sala. Máximo un mensaje cada 2 segundos por persona. Se borran a los 2 días. |
| `/api/study` | Minutos estudiados hoy por cada persona, para el total común. |
| `/api/nadie` | Respuestas de Nadie más, para calcular la rareza con las de todo el mundo. |

Las tablas se crean solas la primera vez que se llama a cada función.

## Publicarlo (una vez)

Netlify Drop (arrastrar la carpeta) **no sirve**, porque no despliega funciones. Hazlo con Git o con la consola.

### Opción A: con GitHub
1. Sube esta carpeta a un repositorio de GitHub.
2. En Netlify: **Add new project → Import an existing project** y elige el repositorio. La configuración ya está en `netlify.toml` (carpeta `public`, funciones en `netlify/functions`), así que no hay que tocar nada.
3. Crea la base de datos. En la carpeta del proyecto, con la consola:
   ```
   npm install
   npx netlify login
   npx netlify link
   npx netlify db init
   ```
   Esto crea la base de datos y añade la variable `NETLIFY_DATABASE_URL` al proyecto.
4. Vuelve a desplegar (Deploys → Trigger deploy).

### Opción B: solo con la consola
```
npm install
npx netlify login
npx netlify init
npx netlify db init
npx netlify deploy --prod
```

**Importante:** Netlify DB crea la base de datos en Neon y hay que reclamarla en Neon (desde el panel de Netlify DB) en los primeros 7 días. Si no, se borra.

### Probar en tu ordenador
```
npx netlify dev
```
Abre `http://localhost:8888`. Usa la misma base de datos del proyecto enlazado.

## Límites a tener en cuenta

- **Sin websockets.** Netlify no tiene conexiones en tiempo real, así que la sala se sincroniza cada segundo por HTTP y los demás personajes se mueven interpolando. Para una clase o un grupo de amigos va bien.
- **Coste.** Cada persona dentro de la sala hace unas 3.600 llamadas a funciones por hora. Revisa el plan de Netlify antes de abrirlo al público. Si crece, el paso natural es mover la presencia y el chat a un servicio en tiempo real (por ejemplo, Supabase Realtime) y dejar Netlify DB para lo demás. El código está preparado: todo pasa por el objeto `Net` en el HTML.
- **Identidad anónima.** Cada navegador recibe un identificador aleatorio guardado en el propio navegador. No hay cuentas ni contraseñas.
- **Moderación.** El chat filtra insultos y enlaces y permite silenciar a alguien, pero si va a usarlo público joven hará falta moderación de verdad (reportes, bloqueo en servidor).

## Estructura
```
public/index.html          la web completa
public/assets/             fotos de Más o menos y las dos pistas de música
netlify/functions/*.mjs    sync, chat, study, nadie
netlify/lib/db.mjs         conexión a Netlify DB y creación de tablas
netlify.toml               configuración de Netlify
package.json               dependencia @netlify/neon
```

Créditos: diccionario an-array-of-spanish-words (MIT), three.js (MIT), datos y fotos de Wikipedia y Wikimedia Commons (cada foto muestra su autoría y licencia), tipografías Archivo, Poppins, Silkscreen y VT323 (OFL).
