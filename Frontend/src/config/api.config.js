const raw =
  import.meta.env.VITE_API_URL || "http://localhost:5008/api";
// Toujours terminer par /api (évite 405 si VITE_API_URL est défini sans /api)
const API_BASE_URL = raw.endsWith("/api") ? raw : raw.replace(/\/?$/, "") + "/api";

export default API_BASE_URL;
