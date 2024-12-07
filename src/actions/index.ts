import {
  TalentWithChannel,
  Anniversary,
  TalentCardType,
} from "@/types";
import { getTalentImageUrl } from "@/utils";
import {
  eq,
  and,
  isNotNull,
  inArray,
  desc,
  ne,
} from "drizzle-orm";
import { unstable_cache } from "next/cache";
import * as schema from "../../drizzle/schema";
import { Interval, DateTime } from "luxon";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const getAffiliate = async (slug: string) => {
  const fn = unstable_cache(
    async () => {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const db = drizzle(pool, { schema });

      const data =
        slug != "independent"
          ? await db.query.affiliate.findFirst({
              where: eq(schema.affiliate.slug, slug),
              with: {
                infos: true,
                socials: true,
              },
            })
          : {
              id: -1,
              nameHeadline: "Independent",
              name: "วีทูปเบอร์ไทยอิสระ",
              profileImgURL: null,
              slug: "independent",
              infos: [],
              socials: [],
            };
      await pool.end();
      return data;
    },
    ["affiliate-" + slug],
    {
      tags: ["affiliate-" + slug],
      revalidate: 60 * 60 * 12,
    }
  );

  return await fn();
};

const getAffiliates = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    // Affiliates List
    const affiliates = await db.query.affiliate.findMany({
      orderBy: (affiliate, { asc }) => [asc(affiliate.name)],
    });
    await pool.end();
    return [
      {
        id: -1,
        name: "วีทูปเบอร์อิสระ",
        profileImgURL: null,
        type: "GROUP",
        slug: "independent",
        nameHeadline: "อิสระ",
      },
      ...affiliates,
    ] as (typeof schema.affiliate.$inferSelect)[];
  },
  ["affiliate"],
  {
    tags: ["affiliate"],
    revalidate: 60 * 60 * 12,
  }
);

const getAnniversaries = unstable_cache(
  async () => {
    const dates = Interval.fromDateTimes(
      DateTime.now()
        .setZone(process.env.NEXT_PUBLIC_TIMEZONE)
        .startOf("day")
        .minus({ day: 7 }),
      DateTime.now()
        .setZone(process.env.NEXT_PUBLIC_TIMEZONE)
        .endOf("day")
        .plus({ day: 7 })
    )
      .splitBy({ day: 1 })
      .map((x) => x.start);

    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const data = await Promise.all(
      dates.map(async (date) => {
        const isoDate = date?.toISODate();
        const label = date?.setLocale("TH").toFormat("d LLLL");
        const labelWithYear = date?.setLocale("TH").toFormat("d LLLL yyyy");

        const day = DateTime.fromISO(`${isoDate}`).day;
        const month = DateTime.fromISO(`${isoDate}`).month;
        const year = DateTime.fromISO(`${isoDate}`).year;

        const res = await db.query.timeline.findMany({
          where: and(
            eq(schema.timeline.day, day),
            eq(schema.timeline.month, month)
          ),
          with: {
            talent: {
              with: {
                youtubeMain: true,
                twitchMain: true,
              },
            },
          },
        });

        const resSpecial = await db.query.specialTimeline.findMany({
          where: and(
            eq(schema.specialTimeline.day, day),
            eq(schema.specialTimeline.month, month),
            eq(schema.specialTimeline.year, year),
            eq(schema.specialTimeline.isActive, true),
          )
        });

        return {
          date: isoDate,
          label,
          labelWithYear,
          special: resSpecial,
          today: res.filter(
            (item) => item.year == year && item.type != "BIRTHDAY"
          ),
          onThisDay: res.filter(
            (item) => item.year != year && item.type != "BIRTHDAY"
          ),
          birthday: res.filter((item) => item.type == "BIRTHDAY"),
        };
      })
    );

    await pool.end();
    return data as {
      date: string | null;
      label: string | null;
      labelWithYear: string | null;
      special: (typeof schema.specialTimeline.$inferSelect)[],
      today: Anniversary[];
      onThisDay: Anniversary[];
      birthday: Anniversary[];
    }[];
  },
  ["anniversaries"],
  {
    tags: ["talent"],
    revalidate: 60 * 60,
  }
);

const getLatestTalents = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    // Latest Talents
    const latestTalents = await db.query.talent.findMany({
      orderBy: [desc(schema.talent.id)],
      limit: 30,
      with: { youtubeMain: true, twitchMain: true },
    });
    await pool.end();
    return latestTalents;
  },
  ["latestTalents"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  }
);

const getTalent = async (slug: string) => {
  const fn = unstable_cache(
    async () => {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const db = drizzle(pool, { schema });

      const data = await db.query.talent.findFirst({
        where: eq(schema.talent.slug, slug),
        with: {
          infos: true,
          socials: true,
          transfers: {
            with: {
              affiliate: true,
            },
          },
          youtubeMain: true,
          twitchMain: true,
          timelines: true,
          hashtags: true,
        },
      });

      let channelIds: number[] = [];
      if (data?.youtubeMainId) {
        channelIds.push(data?.youtubeMainId);
      }
      if (data?.twitchMainId) {
        channelIds.push(data?.twitchMainId);
      }
      let hasVideo: any = null;
      if (channelIds.length) {
        hasVideo = await db.query.video.findFirst({
          where: and(
            inArray(schema.video.channelId, channelIds),
            ne(schema.video.status,'UNAVAILABLE')
          )
        });
      }

      await pool.end();
      return {
        data,
        hasVideo: hasVideo ? true : false,
      };
    },
    ["talent-" + slug],
    {
      tags: ["talent-" + slug],
      revalidate: 60 * 60 * 12,
    }
  );

  return await fn();
};

const getTalents = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    const talents = await db.query.talent.findMany({
      with: {
        youtubeMain: true,
        twitchMain: true,
        transfers: {
          with: {
            affiliate: true,
          },
          where: eq(schema.transfer.isActive, true),
        },
      },
    });
    await pool.end();
    return talents.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      profileImgURL: getTalentImageUrl(item as TalentWithChannel),
      type: item.type,
      statusType: item.statusType,
      youtubeMain: item.youtubeMain || null,
      twitchMain: item.twitchMain || null,
      transfers: item.transfers,
      isActive: true,
    })) as TalentCardType[];
  },
  ["talents"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  }
);

const getTalentsOnly = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    const talents = await db.query.talent.findMany();
    await pool.end();
    return talents;
  },
  ["talentsonly"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  }
);

const getTalentsByAffiliateId = async (affiliateId: number) => {
  const fn = unstable_cache(
    async () => {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const db = drizzle(pool, { schema });

      if (affiliateId != -1) {
        const transfers = await db.query.transfer.findMany({
          where: eq(schema.transfer.affiliateId, affiliateId),
          with: {
            talent: {
              with: {
                youtubeMain: true,
                twitchMain: true,
              },
            },
          },
        });
        await pool.end();
        return transfers.map((item) => ({
          id: item.talent.id,
          name: item.talent.name,
          slug: item.talent.slug,
          profileImgURL: getTalentImageUrl(item.talent as TalentWithChannel),
          type: item.talent.type,
          statusType: item.talent.statusType,
          youtubeMain: item.talent.youtubeMain || null,
          twitchMain: item.talent.twitchMain || null,
          isActive: item.isActive && item.talent.statusType == "ACTIVE",
        })) as TalentCardType[];
      } else {
        const talentWithoutAffiliate = (
          await db.query.talent.findMany({
            with: {
              transfers: {
                where: and(
                  eq(schema.transfer.isActive, true),
                  isNotNull(schema.transfer.affiliateId)
                ),
              },
              twitchMain: true,
              youtubeMain: true,
            },
          })
        ).filter((talent) => !talent.transfers.length);
        await pool.end();

        return talentWithoutAffiliate.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          profileImgURL: getTalentImageUrl(item as TalentWithChannel),
          type: item.type,
          statusType: item.statusType,
          youtubeMain: item.youtubeMain || null,
          twitchMain: item.twitchMain || null,
          isActive: true,
        })) as TalentCardType[];
      }
    },
    [
      "affiliate-" +
        (affiliateId > 0 ? affiliateId : "independent") +
        "-talent",
    ],
    {
      tags: [
        "affiliate-" +
          (affiliateId > 0 ? affiliateId : "independent") +
          "-talent",
      ],
      revalidate: 60 * 60 * 12,
    }
  );

  return await fn();
};

const getPinVideos = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const talentIds =  await db.query.config.findFirst({
      where: eq(schema.config.key, "videoTalentsList"),
    });

    const videoIdsList =  await db.query.config.findFirst({
      where: eq(schema.config.key, "videoIdsList"),
    });

    return {
      talentIds : talentIds?.value?.split(",").map((id) => parseInt(id)) || [],
      videoIdsList : videoIdsList?.value?.split(",") || []
    }
  },
  ["pinVideo"],
  {
    tags: ["video"],
    revalidate: 60 * 60 * 12,
  }
);

export {
  getAffiliates,
  getAnniversaries,
  getAffiliate,
  getTalentsByAffiliateId,
  getTalents,
  getTalent,
  getLatestTalents,
  getTalentsOnly,
  getPinVideos
};
