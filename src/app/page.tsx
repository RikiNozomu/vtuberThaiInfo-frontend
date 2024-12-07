import Headline from "@/components/headline";
import { Logo } from "@/svg/Logo";
import VideoListHome from "@/app/videoListHome";
import Ads from "@/components/ads";
import { Suspense } from "react";
import NewCommer from "@/components/newComers";
import NewCommerLoading from "@/components/newComers/loading";
import Anniversary from "@/components/anniversary";
import { Loading as AnniversaryLoading } from "@/components/anniversary/loading";
import { Loading as AffiliateLoading } from "@/components/affiliatesHome/loading";
import AffiliatesCarousel from "@/components/affiliatesHome";
import { unstable_cache } from "next/cache";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { Image } from "@mantine/core";
import * as schema from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { VideoPlayer } from "@/components/videoPlayer";
import { getTalentImageUrl } from "@/utils";
import { TalentWithChannel } from "@/types";
import SpotlightTalentHome from "@/components/spotlightTalentHome";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { getPinVideos } from "@/actions";

export const revalidate = 3600;

const spotlightTitle = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    return await db.query.config.findFirst({
      where: eq(schema.config.key, "spotlightTitle"),
    });
  },
  ["spotlightTitle"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  }
);

const spotlightList = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    // spotlight Talent Ids List
    const spotlightRes = await db.query.config.findFirst({
      where: eq(schema.config.key, "spotlightList"),
    });
    const talentids = spotlightRes?.value?.split(",").map((id) => parseInt(id));

    // get Talents
    const queryTalents = talentids?.length
      ? await db.query.talent.findMany({
          where: inArray(schema.talent.id, talentids || []),
          with: {
            youtubeMain: true,
            twitchMain: true,
          },
        })
      : [];
    const talents = talentids?.length
      ? talentids?.map((talentid) =>
          queryTalents.find((item) => item.id == talentid)
        )
      : [];
    return talents?.map((talent) => ({
      ...talent,
      profileImgURL: getTalentImageUrl(talent as TalentWithChannel),
    }));
  },
  ["spotlightList"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  }
);

const urlVideoHomepage = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    return await db.query.config.findFirst({
      where: eq(schema.config.key, "urlVideoHomepage"),
    });
  },
  ["urlVideoHomepage"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  }
);

const staticImage = unstable_cache(
  async () => {
    // get db
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const data = await db.query.config.findMany();
    return {
      title: data.find((item) => item.key == "staticImageTitle")?.value || "",
      url: data.find((item) => item.key == "staticImageLinkURL")?.value || "",
      imgURL:
        data.find((item) => item.key == "staticImageImgURL")?.value || null,
    };
  },
  ["staticImage"],
  {
    tags: ["talent"],
    revalidate: 60 * 60 * 12,
  }
);

export default async function Home() {
  const title = await spotlightTitle();
  const talents = await spotlightList();
  const urlVideo = await urlVideoHomepage();
  const staticImg = await staticImage();
  const pinVideo = await getPinVideos()

  return (
    <main className="h-fit bg-white flex-1 container self-center relative flex flex-col p-2 gap-6">
      <h1 className="-indent-[9999px] absolute">
        VtuberThaiInfo.com - เว็บไซด์แหล่งข้อมูลและจัดอันดับวีทูปเบอร์ไทย | Info
        & Ranking website for Thai Vtuber
      </h1>
      <div className="flex flex-col gap-2">
        <div
          className={twMerge(
            "grid gap-4",
            urlVideo?.value && "lg:grid-cols-2 "
          )}
        >
          <div className="flex flex-col">
            <Headline
              title={
                <h2 className="flex gap-2 flex-row items-center">
                  วีทูปเบอร์ที่เข้าสู่{" "}
                  <Logo className="sm:w-10 w-6 sm:h-10 h-6" /> ล่าสุด
                </h2>
              }
            />
            <Suspense fallback={<NewCommerLoading />}>
              <NewCommer />
            </Suspense>
          </div>
          {urlVideo?.value && (
            <div className="flex flex-col gap-2">
              <Headline
                title={
                  <h2 className="flex flex-row items-center gap-2">
                    วีดีโอใหม่ๆจากทาง{" "}
                    <Logo className="sm:w-10 w-6 sm:h-10 h-6" />
                  </h2>
                }
              />
              <div className="flex flex-row justify-center lg:h-[268px] h-fit lg:mt-2">
                <div className="lg:w-fit w-full aspect-video">
                  <VideoPlayer
                    url={urlVideo?.value || ""}
                    controls
                    muted
                    width="100%"
                    height="100%"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center">
        <Ads
          className={
            "w-full max-w-[970px] sm:h-[90px] text-xl sm:aspect-auto aspect-square"
          }
          slot={"8311399937"}
        />
      </div>
      {(talents?.length as number) > 0 && (
        <div className="flex flex-col gap-2">
          <Headline
            title={
              <h2 className=" flex gap-2">
                {title?.value || "VTuber ไทยที่น่าสนใจ"}
              </h2>
            }
          />
          <SpotlightTalentHome datas={talents as TalentWithChannel[]} />
        </div>
      )}
      {staticImg.imgURL && (
        <div className="flex flex-col gap-2 items-center">
          {staticImg.title && (
            <Headline
              title={<h2 className=" flex gap-2">{staticImg.title}</h2>}
            />
          )}
          {staticImg.url ? (
            <Link
              className="w-full max-w-2xl hover:scale-105 transition-transform rounded-md overflow-hidden"
              href={staticImg.url}
              target="_blank"
            >
              <Image
                className="object-contain"
                src={staticImg.imgURL}
                fallbackSrc="/img/og.jpg"
              />
            </Link>
          ) : (
            <div className="w-full max-w-2xl hover:scale-105 transition-transform rounded-md overflow-hidden">
              <Image
                className=""
                src={staticImg.imgURL}
                fallbackSrc="/img/og.jpg"
              />
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Headline
          title={<h2 className=" flex gap-2">กิจกรรม และ เหตุการณ์ในอดีต</h2>}
        />
        <Suspense fallback={<AnniversaryLoading />}>
          <Anniversary />
        </Suspense>
      </div>
      <div className="flex flex-col gap-2">
        <Headline
          title={<h2 className=" flex gap-2">สังกัดและกลุ่มวีทูปเบอร์ไทย</h2>}
        />
        <Suspense fallback={<AffiliateLoading />}>
          <AffiliatesCarousel />
        </Suspense>
      </div>
      <div className="flex justify-center">
        <Ads
          className={
            "w-full max-w-[970px] sm:h-[90px] text-xl sm:aspect-auto aspect-square"
          }
          slot={"3684909150"}
        />
      </div>

      <div className="flex flex-col gap-2 relative">
        <Headline title={<h2 className=" flex gap-2">วีดีโอทั้งหมด</h2>} />
        <VideoListHome pinVideoTalentIds={pinVideo.talentIds} pinVideoVideoIds={pinVideo.videoIdsList}/>
      </div>
    </main>
  );
}
