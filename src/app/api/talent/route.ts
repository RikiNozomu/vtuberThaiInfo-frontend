import * as schema from "../../../../drizzle/schema";
import { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import uniqueRandom from "unique-random";
import { inArray } from "drizzle-orm";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import {
  getTwicthChannelByUsername,
  getYoutubeChannelByChannelID,
} from "@/utils";

const verifyEndpoint = process.env.CLOUDFLARE_TURNSTILE_URL || "";
const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET || "";
const random = uniqueRandom(0, 9);

export async function POST(request: Request) {
  try {
    const { data, token, remark } = (await request.json()) as {
      data: typeof schema.talent.$inferSelect & {
        socials: (typeof schema.social.$inferSelect)[];
        infos: (typeof schema.info.$inferSelect)[];
        timelines: (typeof schema.timeline.$inferSelect)[];
        transfers: (typeof schema.transfer.$inferSelect)[];
        hashtags: (typeof schema.hashtag.$inferSelect)[];
        youtubeMain: typeof schema.channel.$inferSelect & {
          hasChannel: boolean;
        };
        twitchMain: typeof schema.channel.$inferSelect & {
          hasChannel: boolean;
        };
        birthDate: {
          hasBirthDate: boolean;
          day: number | null;
          month: number | null;
          year: number | null;
        };
      };
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

    const youtubeMain = await getYoutubeChannelByChannelID(
      data.youtubeMain.channelId || ""
    );
    const twitchMain = await getTwicthChannelByUsername(
      data.twitchMain.username || ""
    );

    let profileImgURL = null;
    if (data.profileImgType == "UPLOADED" && data.profileImgURL) {
      profileImgURL = data.profileImgURL;
    } else if (data.profileImgType == "TWITCH" && twitchMain?.profileImgURL) {
      profileImgURL = twitchMain?.profileImgURL;
    } else if (data.profileImgType == "YOUTUBE" && youtubeMain?.profileImgURL) {
      profileImgURL = youtubeMain?.profileImgURL;
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const affiliateId = data.transfers
      .filter((item) => item.affiliateId! > 0)
      .map((item) => item.affiliateId!);

    const affiliates = affiliateId.length ? await db.query.affiliate.findMany({
      where: inArray(schema.affiliate.id, affiliateId),
    }) : []

    const returnData = await db
      .insert(schema.approve)
      .values({
        type: "TALENT",
        talentId: data.id || null,
        affiliateId: null,
        profileImgURL,
        data: {
          ...data,
          youtubeMain: {
            ...youtubeMain,
            hasChannel: youtubeMain.channelId ? true : false,
          },
          twitchMain: {
            ...twitchMain,
            hasChannel: twitchMain.username ? true : false,
          },
          profileImgURL:
            data.profileImgType == "UPLOADED" ? data.profileImgURL : null,
          transfers: data.transfers.map((item) => ({
            ...item,
            affiliate: {
              id: affiliates.find((x) => x.id == item.affiliateId)?.id || -1,
              name:
                affiliates.find((x) => x.id == item.affiliateId)?.name || null,
              nameHeadline:
                affiliates.find((x) => x.id == item.affiliateId)
                  ?.nameHeadline || null,
              slug:
                affiliates.find((x) => x.id == item.affiliateId)?.slug || null,
              profileImgURL:
                affiliates.find((x) => x.id == item.affiliateId)
                  ?.profileImgURL || null,
              type:
                affiliates.find((x) => x.id == item.affiliateId)?.id ||
                "AFFILIATE",
            },
          })),
        },
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
