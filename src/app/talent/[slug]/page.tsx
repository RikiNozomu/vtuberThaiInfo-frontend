import * as schema from "../../../../drizzle/schema";
import Headline from "@/components/headline";
import { Image } from "@mantine/core";
import { Anchor } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { convertDate, statusText } from "@/utils";
import { TimelineComp as Timeline } from "@/components/timeline";
import { getTalent } from "@/actions";
import { Metadata } from "next";
import { description } from "@/constants";
import TalentHomeClient from "./client"; 

type props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: props): Promise<Metadata> {
  const { data } = await getTalent(params.slug);
  const title = "VtuberThaiInfo.com - " + data?.name;
  const images =
    process.env.NEXT_PUBLIC_BASE_URL + "/api/og/talent/" + data?.slug;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
    title,
    description: data?.bio ? data?.bio : description,
    openGraph: {
      title,
      description: data?.bio ? data?.bio : description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: data?.bio ? data?.bio : description,
      images,
    },
    robots: "all",
  };
}

export default async function TalentHome({ params }: props) {
  const { data } = await getTalent(params.slug);
  const infos: (typeof schema.info.$inferSelect)[] = [
    {
      id: -4,
      key: "สถานะ",
      value: statusText(data?.statusType),
      link: null,
      talentId: data?.id || null,
      affiliateId: null,
    },
    {
      id: -3,
      key: "รูปแบบ",
      value:
        data?.type
          ?.map((ty) => {
            switch (ty) {
              case schema.TalentType.TWO_D:
                return "2D";
              case schema.TalentType.THREE_D:
                return "3D";
              case schema.TalentType.PNG:
                return "PNG";
              default:
                return "";
            }
          })
          .join(", ") || null,
      link: null,
      talentId: data?.id || null,
      affiliateId: null,
    },
    ...(data?.timelines.find((x) => x.type == "BIRTHDAY")
      ? [
          {
            id: -2,
            key: "วันเกิด",
            value: convertDate(
              data?.timelines.find(
                (x) => x.type == "BIRTHDAY"
              ) as typeof schema.timeline.$inferSelect
            ),
            link: null,
            talentId: data?.id || null,
            affiliateId: null,
          },
        ]
      : []),
    ...(data?.age
      ? [
          {
            id: -1,
            key: "อายุ",
            value: data?.age,
            link: null,
            talentId: data.id,
            affiliateId: null,
          },
        ]
      : []),
    ...(data?.infos || []),
  ];

  return (
    <div className="flex flex-col px-4 pb-4 gap-8 items-center">
      <TalentHomeClient slug={data?.slug || ''}/>
      {(infos.length as number) > 0 && (
        <div className="flex flex-col gap-2 max-w-5xl w-full">
          <Headline title={<h2 className="flex gap-2">ข้อมูลพื้นฐาน</h2>} />
          <div className="divide-y-2 divide-primary md:text-xl flex-col flex">
            {infos.map((info) => (
              <div
                key={info.id}
                className="grid grid-cols-2 [&:not(:first-child)]:pt-2"
              >
                <h3 className="font-bold">{info.key}</h3>
                {!info.link && (
                  <span className="text-right md:text-xl">{info.value}</span>
                )}
                {info.link && (
                  <Anchor
                    className="text-right md:text-xl text-primary"
                    href={info.link}
                    target="_blank"
                  >
                    {info.value}{" "}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </Anchor>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {((data?.transfers.length as number) > 0 ||
        (data?.hashtags.length as number) > 0) && (
        <div className="flex flex-col gap-8 w-full max-w-5xl">
          {(data?.transfers.length as number) > 0 && (
            <div className="flex flex-col gap-2">
              <Headline title={<h2 className=" flex gap-2">สังกัด/กลุ่ม</h2>} />
              <div className="divide-y-2 divide-primary md:text-xl flex-col flex">
                {data?.transfers
                  .filter((x) => x.isActive)
                  .map((info) => (
                    <div
                      key={info.id}
                      className="grid grid-cols-2 [&:not(:first-child)]:pt-2 [&:not(:last-child)]:pb-2"
                    >
                      {!info.affiliateId && (
                        <h3 className="font-bold">{info.affiliateName}</h3>
                      )}
                      {info.affiliateId && (
                        <Anchor
                          className="font-bold md:text-xl text-primary flex gap-1 items-center"
                          href={"/affiliate/" + info.affiliate?.slug}
                        >
                          {info.affiliate?.profileImgURL && <Image
                            className="max-w-[30px] max-h-[30px] w-full rounded-3xl aspect-square"
                            src={info.affiliate?.profileImgURL}
                            fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
                            alt={info.affiliate?.name || ""}
                          />}
                          <h3 className="font-bold">{info.affiliate?.name}</h3>
                        </Anchor>
                      )}
                      <div className="flex flex-col text-right">
                        {info.hasIn && (
                          <span>
                            เริ่ม :{" "}
                            {convertDate({
                              day: info.dayIn,
                              month: info.monthIn,
                              year: info.yearIn,
                            })}
                          </span>
                        )}
                        {info.hasOut && (
                          <span>
                            สิ้นสุด :{" "}
                            {convertDate({
                              day: info.dayOut,
                              month: info.monthOut,
                              year: info.yearOut,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {data?.transfers
                  .filter((x) => !x.isActive)
                  .map((info) => (
                    <div
                      key={info.id}
                      className="grid grid-cols-2 hover:opacity-100 opacity-30 transition-opacity [&:not(:first-child)]:pt-2 [&:not(:last-child)]:pb-2"
                    >
                      {!info.affiliateId && <b>{info.affiliateName}</b>}
                      {info.affiliateId && (
                        <Anchor
                          className="font-bold md:text-xl text-primary flex gap-1 items-center"
                          href={"/affiliate/" + info.affiliate?.slug}
                        >
                          <Image
                            className="max-w-[30px] max-h-[30px] w-full rounded-3xl aspect-square"
                            src={info.affiliate?.profileImgURL}
                            fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
                            alt={info.affiliate?.name || ""}
                          />
                          {info.affiliate?.name}
                        </Anchor>
                      )}
                      <div className="flex flex-col text-right">
                        {info.hasIn && (
                          <span>
                            เริ่ม :{" "}
                            {convertDate({
                              day: info.dayIn,
                              month: info.monthIn,
                              year: info.yearIn,
                            })}
                          </span>
                        )}
                        {info.hasOut && (
                          <span>
                            สิ้นสุด :{" "}
                            {convertDate({
                              day: info.dayOut,
                              month: info.monthOut,
                              year: info.yearOut,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {(data?.hashtags.length as number) > 0 && (
            <div className="flex flex-col gap-2">
              <Headline title={<h2 className="flex gap-2">แฮชแท็ก</h2>} />
              <div className="divide-y-2 divide-primary md:text-xl flex-col flex">
                {data?.hashtags.map((info) => (
                  <div
                    key={info.id}
                    className="grid grid-cols-2 [&:not(:first-child)]:pt-2"
                  >
                    <h3 className="font-bold">{info.text}</h3>
                    <Anchor
                      className="text-right md:text-xl text-primary"
                      href={`https://twitter.com/hashtag/${info.value}`}
                      target="_blank"
                    >
                      {"#"}{info.value}{" "}
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </Anchor>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {data?.bio && (
        <div className="flex flex-col gap-4 w-full">
          <Headline title={<h2 className=" flex gap-2">ประวัติ</h2>} />
          <article
            dangerouslySetInnerHTML={{ __html: `${data.bio}` }}
            className="prose max-w-full p-4 shadow-inner bg-slate-100 rounded md:text-xl"
          />
        </div>
      )}
      {data?.trivia && (
        <div className="flex flex-col gap-4 w-full">
          <Headline title={<h2 className=" flex gap-2">เกร็ดข้อมูล</h2>} />
          <article
            dangerouslySetInnerHTML={{ __html: `${data.trivia}` }}
            className="prose max-w-full p-4 shadow-inner bg-slate-100 rounded md:text-xl"
          />
        </div>
      )}
      {(data?.timelines.filter((x) => x.type != "BIRTHDAY").length as number) >
        0 && (
        <div className="flex flex-col gap-4 w-full">
          <Headline title={<h2 className=" flex gap-2">ไทม์ไลน์</h2>} />
          <Timeline
            data={data?.timelines.filter((x) => x.type != "BIRTHDAY") || []}
          />
        </div>
      )}
    </div>
  );
}
