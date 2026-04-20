const admin = require("firebase-admin");
const https = require("https");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const IG_GRAPH_URL = "https://graph.instagram.com";
const CACHE_DOC    = "settings/instagramFeed";
const TOKEN_DOC    = "settings/instagramToken";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

/* ── Helpers ─────────────────────────────────────────── */

/** Fetch JSON desde una URL (usa módulo nativo https) */
const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    }).on("error", reject);
  });

/** Renueva el long-lived token (válido 60 días) */
const refreshToken = async (currentToken) => {
  const url =
    `${IG_GRAPH_URL}/refresh_access_token` +
    `?grant_type=ig_refresh_token&access_token=${currentToken}`;

  const data = await fetchJson(url);
  if (data.error) throw new Error(data.error.message);

  await db.doc(TOKEN_DOC).set({
    accessToken: data.access_token,
    expiresIn:   data.expires_in,
    refreshedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return data.access_token;
};

/** Obtiene el token actualizado de Firestore */
const getToken = async () => {
  const snap = await db.doc(TOKEN_DOC).get();
  if (!snap.exists) throw new Error("Token de Instagram no configurado. Guardalo en Firestore: settings/instagramToken");

  const { accessToken, refreshedAt } = snap.data();

  // Si pasaron más de 50 días, renovar (el token dura 60)
  let refreshedMs = 0;
  if (refreshedAt?.toMillis) {
    refreshedMs = refreshedAt.toMillis();
  } else if (refreshedAt) {
    refreshedMs = new Date(refreshedAt).getTime() || 0;
  }
  const daysSinceRefresh = (Date.now() - refreshedMs) / (1000 * 60 * 60 * 24);

  if (daysSinceRefresh > 50) {
    return refreshToken(accessToken);
  }

  return accessToken;
};

/* ── Cloud Function ──────────────────────────────────── */

const instagramFeed = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 4, 25);

    // 1) Verificar caché
    const cacheSnap = await db.doc(CACHE_DOC).get();
    if (cacheSnap.exists) {
      const cache = cacheSnap.data();
      const age   = Date.now() - (cache.updatedAt?.toMillis?.() || 0);

      if (age < CACHE_TTL_MS && cache.posts?.length >= limit) {
        return res.json({ posts: cache.posts.slice(0, limit), cached: true });
      }
    }

    // 2) Fetch desde Instagram Graph API
    const token = await getToken();
    const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const url = `${IG_GRAPH_URL}/me/media?fields=${fields}&limit=${limit}&access_token=${token}`;

    const data = await fetchJson(url);
    if (data.error) throw new Error(data.error.message);

    // Filtrar solo IMAGE y CAROUSEL_ALBUM (no videos)
    const posts = (data.data || [])
      .filter((p) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM")
      .slice(0, limit)
      .map((p) => ({
        id:        p.id,
        caption:   (p.caption || "").substring(0, 200),
        mediaUrl:  p.media_url,
        permalink: p.permalink,
        timestamp: p.timestamp,
        mediaType: p.media_type,
      }));

    // 3) Guardar en caché
    await db.doc(CACHE_DOC).set({
      posts,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({ posts, cached: false });
  } catch (err) {
    console.error("instagramFeed error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { instagramFeed };
