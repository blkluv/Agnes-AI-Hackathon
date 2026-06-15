import type { BriefStepEvent } from "./types";

export function encodeSseEvent(event: BriefStepEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function createSseStream(
  handler: (
    send: (event: BriefStepEvent) => void,
  ) => Promise<void>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (event: BriefStepEvent) => {
        controller.enqueue(encoder.encode(encodeSseEvent(event)));
      };

      try {
        await handler(send);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        send({
          step: "done",
          label: "Failed",
          data: { briefStatus: "incomplete", error: message },
        });
      } finally {
        controller.close();
      }
    },
  });
}
