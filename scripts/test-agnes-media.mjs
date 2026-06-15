const apiKey = process.env.AGNES_API_KEY;
const baseURL = process.env.AGNES_BASE_URL ?? "https://apihub.agnes-ai.com/v1";

if (!apiKey) {
  console.error("No AGNES_API_KEY");
  process.exit(1);
}

async function testImage() {
  console.log("\n=== IMAGE TEST ===");
  const res = await fetch(`${baseURL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "agnes-image-2.1-flash",
      prompt: "Vitamin C serum bottle, premium skincare product photo, soft light",
      size: "1024x1024",
      n: 1,
    }),
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log(text.slice(0, 800));
}

async function testVideo() {
  console.log("\n=== VIDEO CREATE TEST ===");
  const res = await fetch(`${baseURL}/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "agnes-video-v2.0",
      prompt: "Close-up vitamin C serum bottle, warm lighting, 5 second hook",
      height: 720,
      width: 1280,
      num_frames: 25,
      frame_rate: 24,
    }),
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log(text.slice(0, 800));
}

await testImage();
await testVideo();
