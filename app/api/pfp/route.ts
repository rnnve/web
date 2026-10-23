import { profileImages } from "@/app/generated/pfp-images";

export async function GET() {
  return Response.json(profileImages, { headers: { "Cache-Control": "public, max-age=300" } });
}
