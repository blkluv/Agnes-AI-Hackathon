import { isAgnesConfigured } from "@/lib/agnes";

export async function GET() {
  return Response.json({
    agnesConfigured: isAgnesConfigured(),
    baseUrl: process.env.AGNES_BASE_URL ?? "https://apihub.agnes-ai.com/v1",
  });
}
