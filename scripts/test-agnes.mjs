async function main() {
  const apiKey = process.env.AGNES_API_KEY;
  const baseURL = process.env.AGNES_BASE_URL ?? "https://apihub.agnes-ai.com/v1";

  if (!apiKey) {
    console.error("AGNES_API_KEY not found in .env.local");
    process.exit(1);
  }

  console.log("Testing Agnes chat API...");
  const started = Date.now();

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "agnes-2.0-flash",
      messages: [{ role: "user", content: "Reply with exactly: API_OK" }],
      max_tokens: 20,
    }),
  });

  const elapsed = Date.now() - started;
  const body = await response.text();

  console.log(`Status: ${response.status} (${elapsed}ms)`);
  console.log(body.slice(0, 500));

  if (!response.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
