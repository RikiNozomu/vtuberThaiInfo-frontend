export async function GET() {
  try {
    const res = await fetch(`${process.env.STREAMLAB_API_URL}?limit=9999`, {
      headers: {
        Authorization: "Bearer " + process.env.STREAMLAB_ACCESS_TOKEN,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      return Response.json({ error: res.statusText }, { status: res.status });
    }
    const data = await res.json();
    return Response.json(data, {
      status: 200,
      headers: {
        "Cache-Control": `max-age=3600`,
        "CDN-Cache-Control": `max-age=14400`,
        "Vercel-CDN-Cache-Control": `max-age=21600`,
      },
    });
  } catch (error: any) {
    return Response.json({ error: error?.message }, { status: 500 });
  }
}
