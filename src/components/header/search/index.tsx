import * as schema from "../../../../drizzle/schema";
import { unstable_cache } from "next/cache";
import { getTalentImageUrl } from "@/utils";
import { TalentWithChannel, searchData } from "@/types";
import Modal from "./modal";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const getSearchDatas = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    // Get All Talents & Affiliate
    const talents = await db.query.talent.findMany({
      with: { youtubeMain: true, twitchMain: true },
    });
    const affiliates = await db.query.affiliate.findMany();
    await pool.end();

    const talentSearchDatas = talents.map((item) => {
      return {
        id: item.id,
        type: "talent",
        name: item.name,
        desc: [item.firstName, item.middleName, item.lastName]
          .filter((x) => x)
          .join(" "),
        slug: item.slug,
        profileImgURL: getTalentImageUrl(item as TalentWithChannel),
      };
    }) as searchData[];
    const affiliateSearchDatas = affiliates.map((item) => {
      return {
        id: item.id,
        type: "affiliate",
        name: item.name,
        desc: "",
        slug: item.slug,
        profileImgURL: item.profileImgURL,
      };
    }) as searchData[];

    return [
      ...talentSearchDatas,
      {
        id: -1,
        type: "affiliate",
        name: "วีทูปเบอร์อิสระ",
        desc: "IIndependent",
        slug: "independent",
        profileImgURL: null,
      } as searchData,
      ...affiliateSearchDatas,
    ];
  },
  ["search"],
  {
    tags: ["search"],
    revalidate: 60 * 60 * 12,
  },
);

export default async function Search() {
  const latestTalents = await getSearchDatas();
  return <Modal datas={latestTalents} />;
}
