import axios from "axios";

const WP_BASE = process.env.WP_BASE!;
const WP_USER = process.env.WP_USER!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

const wp = axios.create({
  baseURL: `${WP_BASE}/wp-json`,
  auth: { username: WP_USER, password: WP_APP_PASSWORD }
});

export async function registerSeller(payload: {
  name: string;
  whatsapp: string;
  municipio: string;
}) {
  const { data } = await wp.post("/bcc/v1/seller/register", payload);
  return data;
}
