# Single orchestrator route for Shop Brief generation

All Agnes API calls run server-side in one `POST /api/shop-brief` route handler. The handler streams Brief Step events to the client as each step completes. API keys stay in server env; fallback logic (cached trends, cached video, Demo Brief) lives in one place.
