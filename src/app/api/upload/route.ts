import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import { extension } from "mime-types";

export async function POST(request: Request) {
  const { contentType } = await request.json();
  try {
    const R2 = new S3Client({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY || "",
      },
    });

    const filename = `${DateTime.now().toFormat("yyyymmddHHmmss")}-${uuidv4()}.${extension(contentType)}`;

    const url = await getSignedUrl(
      R2,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: filename,
        ContentType: contentType as string,
      }),
      { expiresIn: 3600 },
    );
    return Response.json({ url, filename });
  } catch (error: any) {
    return Response.json({ error: error.message });
  }
}
