import { createSseStream } from "@/lib/sse";
import { parseProduct, runShopBriefPipeline } from "@/lib/orchestrator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let product;

  try {
    product = parseProduct(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid input";
    return Response.json({ error: message }, { status: 400 });
  }

  const stream = createSseStream((send) => runShopBriefPipeline(product, send));

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
