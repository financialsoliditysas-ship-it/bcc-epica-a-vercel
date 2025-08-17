import axios from "axios";

const GRAPH = "https://graph.facebook.com/v20.0";

const WA_TOKEN = process.env.WA_TOKEN!;
const WA_PHONE_ID = process.env.WA_PHONE_ID!;

export async function sendText(to: string, body: string) {
  return axios.post(
    `${GRAPH}/${WA_PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    },
    { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
  );
}

export async function askButtons(to: string, body: string, labels: string[]) {
  const buttons = labels.slice(0, 3).map((title, i) => ({
    type: "reply",
    reply: { id: `opt_${i + 1}`, title }
  }));
  return axios.post(
    `${GRAPH}/${WA_PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: { buttons }
      }
    },
    { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
  );
}
