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
import { getTalentImageUrl } from "@/utils";
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

export default async function VVP2024Final() {
  const talentPudthai = await getTalents([
    "vermillionorcus",
    "leox",
    "laven",
    "xaniel",
    "ryouta",
  ]);

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
        "w-full relative overflow-clip flex flex-col items-center justify-center gap-4"
      )}
    >
      <Image
        className="absolute bottom-1/2 translate-y-1/2 left-1/2 -translate-x-1/2 brightness-[60%] h-[100%] -z-[1]"
        src="https://img.vtuberthaiinfo.com/vvp_bg.jpg"
      />

      <div className="flex flex-row">
        {talentPudthai.map((talent) => (
          <Link
            key={talent.slug}
            className="flex-1 hover:scale-110 transition-transform"
            href={"/talent/" + talent.slug}
          >
            <Image
              className="h-[100px]"
              src={getTalentImageUrl(talent as TalentWithChannel)}
            />
          </Link>
        ))}
      </div>
      <div className="flex flex-col text-center text-white gap-2">
        <b className="text-3xl">Phud Thai Dai Nid Noi</b>
        <Link className="underline text-xl" target="_blank" href={"https://twitter.com/hashtag/%E0%B8%9E%E0%B8%B9%E0%B8%94%E0%B9%84%E0%B8%97%E0%B8%A2No%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87"}>#พูดไทยNoหนึ่ง</Link>
      </div>

      <div className="flex sm:flex-row flex-col gap-4 items-center z-[1]">
        <Image
          className="sm:h-24 max-w-sm w-full"
          src="https://img.vtuberthaiinfo.com/vvp_logo.png"
        />
        <div className="flex flex-col gap-2 leading-none text-center">
          <b className="text-white sm:text-5xl text-4xl">
            FINAL | วันนี้ 21:00
          </b>
          <div className="grid sm:grid-cols-2 gap-4 sm:w-fit w-full z-[1]">
            <Button
              className="bg-primary text-white w-full"
              classNames={{ label: "flex flex-row gap-2 justify-center" }}
              component={Link}
              href="https://twitter.com/hashtag/VVP2024"
              target="_blank"
            >
              <FontAwesomeIcon size="xl" icon={faXTwitter} />
              <span>#VVP2024</span>
            </Button>
            <Button
              className="bg-red-500 text-white w-full"
              classNames={{ label: "flex flex-row gap-2 justify-center" }}
              component={Link}
              href="https://www.youtube.com/watch?v=lld5br5LD28"
              target="_blank"
            >
              <span>ถ่ายทอดสด ที่</span>
              <FontAwesomeIcon size="xl" icon={faYoutube} />
              <span>Thina Borboleta Ch.</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col text-center text-white gap-2">
        <Link className="underline text-xl" target="_blank" href={"https://twitter.com/hashtag/%E0%B9%80%E0%B8%9A%E0%B8%B5%E0%B8%A2%E0%B8%A7No%E0%B8%AB%E0%B8%99%E0%B8%B6%E0%B9%88%E0%B8%87"}>#เบียวNoหนึ่ง</Link>
        <b className="text-3xl">ไม่ได้เบียวแต่เป็นหนึ่งเดียวกับความมืด</b>
      </div>


      <div className="flex flex-row">
        {talentByou.map((talent) => (
          <Link
            key={talent.slug}
            className="flex-1 hover:scale-110 transition-transform"
            href={"/talent/" + talent.slug}
          >
            <Image
              className="h-[100px]"
              src={getTalentImageUrl(talent as TalentWithChannel)}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
