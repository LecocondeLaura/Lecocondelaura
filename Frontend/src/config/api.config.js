const raw =
  import.meta.env.VITE_API_URL ?? "http://localhost:5008/api";
// Toujours terminer par /api, sans slash final (évite 405)
let base = (typeof raw === "string" ? raw.trim() : "") || "http://localhost:5008/api";
base = base.replace(/\/+$/, "");
const API_BASE_URL = base.endsWith("/api") ? base : base + "/api";

export default API_BASE_URL;
