import { DurableObject } from "cloudflare:workers";

export class ProgressHub extends DurableObject {
  constructor(state: DurableObjectState, env: unknown) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split("/").filter(Boolean).pop();

    if (!sessionId) {
      return new Response("Missing session id", { status: 400 });
    }

    if (request.method === "GET") {
      const stored = await this.ctx.storage.get(sessionId);
      return Response.json(stored ?? null);
    }

    if (request.method === "POST") {
      const body = await request.json();
      await this.ctx.storage.put(sessionId, body);
      return Response.json({ ok: true });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
