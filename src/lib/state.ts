import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export type Step = "idle" | "ask_name" | "ask_municipio";

export interface ConvoState {
  step: Step;
  data: {
    name?: string;
    municipio?: string;
  };
}

const KEY = (wa: string) => `bcc:convo:${wa}`;

export async function getState(wa: string): Promise<ConvoState> {
  return (await redis.get<ConvoState>(KEY(wa))) || { step: "idle", data: {} };
}

export async function setState(wa: string, state: ConvoState) {
  await redis.set(KEY(wa), state, { ex: 60 * 30 });
}

export async function clearState(wa: string) {
  await redis.del(KEY(wa));
}
