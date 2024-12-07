import { getTalent } from "@/actions";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const data = await getTalent(params.slug);
  return Response.json(
    { data: data.data || null },
    {
      status: data.data ? 200 : 404,
      headers: {
        "Cache-Control": `max-age=3600`,
        "CDN-Cache-Control": `max-age=14400`,
        "Vercel-CDN-Cache-Control": `max-age=21600`,
      },
    }
  );
}
