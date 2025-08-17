import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getState, setState, clearState } from "../../../src/lib/state";
import { sendText, askButtons } from "../../../src/lib/wa";
import { registerSeller } from "../../../src/lib/wp";

const VERIFY_TOKEN = process.env.VERIFY_TOKEN!;

function norm(wa?: string) {
  return String(wa || "").replace(/\D+/g, "");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      return res.status(403).send("forbidden");
    }

    if (req.method === "POST") {
      const entry = (req.body as any)?.entry?.[0];
      const msg = entry?.changes?.[0]?.value?.messages?.[0];
      if (!msg) return res.status(200).json({ ok: true });

      const from = norm(msg.from);
      const type = msg.type;
      let text = "";

      if (type === "text") text = (msg.text?.body || "").trim();
      if (type === "button") text = (msg.button?.text || "").trim();
      if (type === "interactive" && (msg as any).interactive?.button_reply?.title) {
        text = (msg as any).interactive.button_reply.title.trim();
      }

      if (/^(PUBLICAR|REGISTRAR)$/i.test(text)) {
        await setState(from, { step: "ask_name", data: {} });
        await sendText(from, "¡Perfecto! Vamos a crear tu perfil de vendedor.\n¿Cómo te llamas?");
        return res.status(200).json({ ok: true });
      }

      const state = await getState(from);
      if (state.step === "idle") {
        await askButtons(from, "Hola 👋 Soy BCC. ¿Qué deseas hacer?", ["REGISTRAR", "PUBLICAR", "Ayuda"]);
        return res.status(200).json({ ok: true });
      }

      if (state.step === "ask_name") {
        state.data.name = text;
        state.step = "ask_municipio";
        await setState(from, state);
        await askButtons(from, "¿En qué municipio estás?", ["Caucasia", "Nechí", "El Bagre"]);
        return res.status(200).json({ ok: true });
      }

      if (state.step === "ask_municipio") {
        const map: Record<string, string> = {
          "CAUCASIA": "caucasia",
          "NECHÍ": "nechi",
          "NECHI": "nechi",
          "EL BAGRE": "el-bagre"
        };
        const key = text.toUpperCase();
        const municipio = map[key] || "caucasia";

        await registerSeller({
          name: state.data.name!,
          whatsapp: from,
          municipio
        });

        await clearState(from);
        await sendText(from, `¡Listo, ${state.data.name}! Tu perfil quedó creado.\nMunicipio: ${municipio}\nCuando quieras crear tu primer anuncio, responde: PUBLICAR`);
        return res.status(200).json({ ok: true });
      }

      await askButtons(from, "No te entendí. ¿Quieres REGISTRAR o PUBLICAR?", ["REGISTRAR", "PUBLICAR", "Ayuda"]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).send("Method not allowed");
  } catch (err: any) {
    console.error("ERR webhook:", err?.response?.data || err.message);
    return res.status(200).json({ ok: false });
  }
}
