import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server';
 
export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  if(searchParams.get('secret') != process.env.REVALIDATE_SERECT){
    return Response.json({ error : 'Access denine.'}, { status : 401 })
  }
  params.tag == 'support-us' ? revalidatePath('/support-us', 'page') : revalidateTag(params.tag)
  return Response.json({ revalidated: true, now: Date.now() })
}