import type { APIRoute } from "astro";

type RuntimeLocals = {
  runtime?: {
    env?: {
      PROGRESS_HUB?: DurableObjectNamespace;
    };
  };
};

async function forwardToProgressHub(
  namespace: DurableObjectNamespace,
  sessionId: string,
  request: Request
) {
  const id = namespace.idFromName(sessionId);
  const stub = namespace.get(id);
  const targetUrl = new URL(`/progress/${sessionId}`, request.url).toString();

  return stub.fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text()
  });
}

export const GET: APIRoute = async ({ params, locals, request }) => {
  const sessionId = params.sessionId;
  const namespace = (locals as RuntimeLocals).runtime?.env?.PROGRESS_HUB;

  if (!sessionId || !namespace) {
    return Response.json(
      { ok: false, message: "Durable Object binding not configured" },
      { status: 501 }
    );
  }

  return forwardToProgressHub(namespace, sessionId, request);
};

export const POST: APIRoute = async ({ params, locals, request }) => {
  const sessionId = params.sessionId;
  const namespace = (locals as RuntimeLocals).runtime?.env?.PROGRESS_HUB;

  if (!sessionId || !namespace) {
    return Response.json(
      { ok: false, message: "Durable Object binding not configured" },
      { status: 501 }
    );
  }

  return forwardToProgressHub(namespace, sessionId, request);
};
