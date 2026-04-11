const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL;

/**
 * Obtiene los últimos posts de Instagram desde la Cloud Function
 * (que cachea en Firestore para evitar rate-limits).
 */
export const getInstagramPosts = async (limit = 4) => {
  const res = await fetch(`${FUNCTIONS_URL}/instagramFeed?limit=${limit}`);
  if (!res.ok) throw new Error("Error al obtener el feed de Instagram");
  const data = await res.json();
  return data.posts || [];
};
