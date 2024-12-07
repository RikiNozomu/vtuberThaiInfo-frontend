import { twMerge } from "tailwind-merge";
import { Button, Image } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { Pool } from "pg";
import * as schema from "../../../drizzle/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { inArray, or } from "drizzle-orm";
import TalentTab from "./talentTab";
import { TalentWithChannel } from "@/types";

const getTalents = unstable_cache(
  async (listSlugs: string[]) => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const talents = await db.query.talent.findMany({
      where: inArray(schema.talent.slug, listSlugs),
      with: {
        youtubeMain: true,
        twitchMain: true,
      },
    });
    return talents;
  },
  ["getPudThaiTalent"],
  {
    tags: ["vvp2024"],
    revalidate: 60 * 60 * 24,
  }
);

export default async function VVP2024ChampionByou() {
  const talentByou = await getTalents([
    "akitoqch",
    "mirinku",
    "peace",
    "riku",
    "stateflush",
    "callidora-angeni",
  ]);

  return (
    <div
      className={twMerge(
        "w-full relative overflow-clip xl:grid xl:grid-cols-2 flex flex-col items-center justify-center gap-4"
      )}
    >
      <Image
        className="absolute bottom-1/2 translate-y-1/2 left-1/2 -translate-x-1/2 brightness-[60%] h-[100%] -z-[1]"
        src="https://img.vtuberthaiinfo.com/vvp_bg.jpg"
      />

      <div className="md:flex md:flex-row grid grid-cols-3 relative">
        {talentByou.map((talent) => <TalentTab key={talent.slug} talent={talent as TalentWithChannel}/> )}
      </div>
      <div className="flex flex-col gap-4 justify-center items-center z-[1] relative text-white xl:p-4 p-8">
        <div className="flex flex-row items-center gap-2">
          <Image
            className="sm:w-[150px] w-[100px]"
            src="https://img.vtuberthaiinfo.com/vvp_logo.png"
          />
          <span className="text-white sm:text-3xl text-lg break-all">CHAMPION</span>
        </div>

        <div className="flex flex-col leading-none text-center">
          <b className="sm:text-5xl text-4xl">ไม่ได้เบียวแต่เป็นหนึ่งเดียวกับความมืด</b>
          <Link className="underline sm:text-2xl text-xl" target="_blank" href={"https://twitter.com/hashtag/%E0%B9%80%E0%B8%9A%E0%B8%B5%E0%B8%A2%E0%B8%A7No%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87"}>#เบียวNoหนึ่ง</Link>
        </div>

        <div className="flex flex-col gap-2 leading-none text-center sm:w-fit w-full">
          <div className="grid sm:grid-cols-2 gap-4 sm:w-fit w-full z-[1]">
            <Button
              className="bg-primary text-white w-full"
              classNames={{ label: "flex flex-row gap-2 justify-center sm:text-base text-xs" }}
              component={Link}
              href="https://twitter.com/hashtag/VVP2024"
              target="_blank"
            >
              <FontAwesomeIcon size="xl" icon={faXTwitter} />
              <span>#VVP2024</span>
            </Button>
            <Button
              className="bg-red-500 text-white w-full"
              classNames={{ label: "flex flex-row gap-2 justify-center sm:text-base text-xs" }}
              component={Link}
              href="https://www.youtube.com/@ThinaBorboletaCh"
              target="_blank"
            >
              <FontAwesomeIcon size="xl" icon={faYoutube} />
              <span>Thina Borboleta Ch.</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
