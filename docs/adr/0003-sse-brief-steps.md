# SSE streaming for Brief Step progress

The `/api/shop-brief` orchestrator streams Brief Step events to the client via Server-Sent Events (`text/event-stream`). Each event carries one step's output so the UI can cascade results while later steps still run.
