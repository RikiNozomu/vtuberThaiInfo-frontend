import Headline from "@/components/headline";
import { Anchor, Loader } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { notFound } from "next/navigation";
import { AffiliateFull } from "@/types";
import Header from "./header";
import SocialTag from "@/components/socialTag";
import { Suspense } from "react";
import AffiliateTalentList from "@/components/affiliateTalentList";
import {
  getAffiliate,
  getTalentsByAffiliateId,
} from "@/actions";
import { Metadata } from "next";
import { description } from "@/constants";
import { ProfilePage, WithContext } from "schema-dts";

type props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: props): Promise<Metadata> {
  const data = await getAffiliate(params.slug);
  const title = "VtuberThaiInfo.com - " + data?.name;
  const images =
    process.env.NEXT_PUBLIC_BASE_URL + "/api/og/affiliate/" + data?.slug;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
    robots: "all",
  };
}

/*export async function generateStaticParams() {
  const data = await getAffiliates();
  return data.map((item) => ({
    slug: item.slug,
  }));
}*/

export default async function AffiliateDetail({ params }: props) {
  const data = await getAffiliate(params.slug);

  if (!data) {
    notFound();
  }

  const talents = (await getTalentsByAffiliateId(data?.id)).sort((a, b) =>
    (a.name || "").localeCompare(`${b.name}`, "th", { sensitivity: "base" })
  );

  const jsonLd: WithContext<ProfilePage> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@id": "#affiliate-" + data.slug,
      "@type": "Organization",
      name: data.name!,
      logo:
        data.profileImgURL ||
        process.env.NEXT_PUBLIC_BASE_URL + "https://img.vtuberthaiinfo.com/no_logo_group.png",
      url: data.socials.map((item) => `${item.link}`),
      alumni: talents
        .filter((item) => item.isActive!)
        .map((item) => ({
          "@type": "Person",
          name: item.name,
          image:
            item.profileImgURL ||
            process.env.NEXT_PUBLIC_BASE_URL + "https://img.vtuberthaiinfo.com/people_notfound.png",
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/talent/${item.slug}`,
        })),
      member: talents
        .filter((item) => item.isActive)
        .map((item) => ({
          "@type": "Person",
          name: item.name,
          image:
            item.profileImgURL ||
            process.env.NEXT_PUBLIC_BASE_URL + "https://img.vtuberthaiinfo.com/people_notfound.png",
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/talent/${item.slug}`,
        })),
    },
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-primary overflow-hidden">
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
      <Header affiliate={data as AffiliateFull} />
      <div className="w-screen h-fit bg-[#a5b2bb] flex justify-center z-[1] flex-1">
        <div className="md:container w-full bg-white flex flex-col gap-4">
          {(data?.socials.length as number) > 0 && (
            <div className="w-full border-primary border-b-2 sm:text-xl text-lg flex flex-row">
              <h2 className="bg-primary text-white font-bold p-2 flex items-center">
                โซเชียลมีเดีย
              </h2>
              <div className="flex-1 flex-wrap flex flex-row sm:gap-2 gap-1 p-2 items-center">
                {data?.socials.map((social) => (
                  <SocialTag
                    key={social.id}
                    platform={social.platform as string}
                    text={`${social.text}`}
                    url={`${social.link}`}
                    Tag={"h3"}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col px-4 py-4 gap-8">
            { data.infos.length as number > 0 && <div className="flex-col flex gap-4 items-center">
              <Headline title={<h2 className="flex gap-2">ข้อมูลพื้นฐาน</h2>} />
              <div className="divide-y-2 divide-primary md:text-xl flex flex-col max-w-5xl w-full">
                {data?.infos.map((info) => (
                  <div
                    key={info.id}
                    className="grid grid-cols-2 [&:not(:first-child)]:pt-2"
                  >
                    <h3 className="font-bold">{info.key}</h3>
                    {!info.link && (
                      <span className="text-right md:text-xl">
                        {info.value}
                      </span>
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
            </div>}
            <div className="flex-col flex gap-4 items-center">
              <Headline
                title={
                  <h2 className="flex gap-2">สมาชิกวีทูปเบอร์ไทยทั้งหมด</h2>
                }
              />
              <Suspense
                fallback={<Loader color="blue" type="bars" size={48} />}
              >
                <AffiliateTalentList
                  affiliateId={data.id}
                  slug={`${data.slug}`}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
