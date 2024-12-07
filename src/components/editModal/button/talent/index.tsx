import { unstable_cache } from "next/cache";
import * as schema from "../../../../../drizzle/schema";
import Base from "./base";
import { eq } from "drizzle-orm";
import { TalentFull } from "@/types";
import { getAffiliates } from "@/actions";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const getTalent = unstable_cache(
  async (id: number) => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    // Latest Talents
    const talent = await db.query.talent.findFirst({
      where: eq(schema.talent.id, id),
      with: {
        socials: true,
        hashtags: true,
        infos: true,
        timelines: true,
        transfers: {
          with: {
            affiliate: true,
          },
        },
        youtubeMain: true,
        twitchMain: true,
      },
    });
    await pool.end();
    return talent as TalentFull;
  },
  ["talent"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  },
);

type Props = {
  talentId: number;
};

export default async function TalentEditButton({ talentId }: Props) {
  const affiliates = await getAffiliates();
  const talent = await getTalent(talentId);
  return <Base talent={talent} affiliates={affiliates} />;
}
