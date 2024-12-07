import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import * as schema from "../../../../drizzle/schema";
import { AffiliateFull } from "@/types";
import uniqueRandom from "unique-random";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const verifyEndpoint = process.env.CLOUDFLARE_TURNSTILE_URL || "";
const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET || "";
const random = uniqueRandom(0, 9);

export async function POST(request: Request) {
  try {
    const { data, token, remark } = (await request.json()) as {
      data: AffiliateFull;
      remark: string;
      token: string;
    };

    const res = await fetch(verifyEndpoint, {
      method: "POST",
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const validateData =
      (await res.json()) as TurnstileServerValidationResponse;
    if (!validateData.success) {
      return Response.json({ error: "recaptcha error." }, { status: 400 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const returnData = await db
      .insert(schema.approve)
      .values({
        type: "AFFILIATE",
        talentId: null,
        affiliateId: data.id || null,
        profileImgURL: data.profileImgURL,
        data: data,
        code: `${random()}${random()}${random()}${random()}${random()}${random()}${random()}${random()}`,
        remark,
      })
      .returning();
    await pool.end();
    return Response.json({ code: returnData.at(0)?.code }, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
