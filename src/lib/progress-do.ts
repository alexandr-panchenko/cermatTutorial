export class ProgressHub {
  state: DurableObjectState;
  storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.storage = state.storage;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.pathname.split("/").filter(Boolean).pop();

    if (!sessionId) {
      return new Response("Missing session id", { status: 400 });
    }

    if (request.method === "GET") {
      const stored = await this.storage.get(sessionId);
      return Response.json(stored ?? null);
    }

    if (request.method === "POST") {
      const body = await request.json();
      await this.storage.put(sessionId, body);
      return Response.json({ ok: true });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
