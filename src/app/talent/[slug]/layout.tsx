import Header from "./header";
import { TalentFull, TalentWithChannel } from "@/types";
import Menu from "./menu";
import SocialTag from "@/components/socialTag";
import { decimalNunber, getTalentImageUrl } from "@/utils";
import { getTalent } from "@/actions";
import { notFound } from "next/navigation";
import { ProfilePage, WithContext } from "schema-dts";

type props = {
  params: {
    slug: string;
  };
  children: React.ReactNode;
};

export default async function TalentLayout({ params, children }: props) {
  const { data } = await getTalent(params.slug);

  if (!data) {
    notFound();
  }

  const jsonLd: WithContext<ProfilePage> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@id": "#talent-" + data.slug,
      "@type": "Person",
      name: data.name!,
      image:
        getTalentImageUrl(data as TalentWithChannel) ||
        process.env.NEXT_PUBLIC_BASE_URL + "https://img.vtuberthaiinfo.com/people_notfound.png",
      jobTitle: "Thai Virtual Youtuber",
      url: [
        ...data.socials.map((item) => `${item.link}`),
        ...(data.youtubeMain
          ? [`https://youtube.com/${data.youtubeMain.username}`]
          : []),
        ...(data.twitchMain
          ? [`https://twitch.tv/${data.twitchMain.username}`]
          : []),
      ],
      affiliation: data.transfers
        .filter((item) => item.isActive)
        .map((item) => ({
          "@type": "Organization",
          name: item.affiliate?.name || item.affiliateName || "",
        })),
      alumniOf: data.transfers
        .filter((item) => item.isActive!)
        .map((item) => ({
          "@type": "Organization",
          name: item.affiliate?.name || item.affiliateName || "",
        })),
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: {
            "@type": "ViewAction",
          },
          name: "Total Views in Youtube Channel",
          interactionService: {
            "@type": "WebSite",
            url: `https://youtube.com/${data.youtubeMain?.username || ""}`,
          },
          userInteractionCount: data.youtubeMain?.views || 0,
        },
        {
          "@type": "InteractionCounter",
          interactionType: {
            "@type": "SubscribeAction",
          },
          name: "Total Subscriber in Youtube Channel",
          interactionService: {
            "@type": "WebSite",
            url: `https://youtube.com/${data.youtubeMain?.username || ""}`,
          },
          userInteractionCount: data.youtubeMain?.subs || 0,
        },
        {
          "@type": "InteractionCounter",
          interactionType: {
            "@type": "FollowAction",
          },
          name: "Total Follower in Twitch Channel",
          interactionService: {
            "@type": "WebSite",
            url: `https://twitch.tv/${data.twitchMain?.username || ""}`,
          },
          userInteractionCount: data.twitchMain?.subs || 0,
        },
      ],
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center bg-primary overflow-hidden">
      <section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
      <Header talent={data as TalentFull} />
      <div className="w-screen h-fit bg-[#a5b2bb] flex justify-center z-[1] flex-1">
        <div className="md:container w-full bg-white flex flex-col gap-4">
          {(data?.youtubeMain || data?.twitchMain || data?.socials.length) && (
            <div className="w-full border-primary border-b-2 sm:text-xl text-lg flex flex-row">
              <h2 className="bg-primary text-white font-bold p-2 flex items-center">
                โซเชียลมีเดีย
              </h2>
              <div className="flex-1 flex-wrap flex flex-row sm:gap-2 gap-1 p-2 items-center">
                {data?.youtubeMain && (
                  <SocialTag
                    classNames={{ root: "flex bg-red-500" }}
                    key={-1}
                    platform={"YOUTUBE"}
                    text={
                      (data.youtubeMain.channelName || `Youtube`) +
                      " | " +
                      decimalNunber(data.youtubeMain.subs || 0) +
                      " Subs | " +
                      decimalNunber(data.youtubeMain.views || 0) +
                      " Views"
                    }
                    url={`https://youtube.com/${data.youtubeMain.username}`}
                  />
                )}
                {data?.twitchMain && (
                  <SocialTag
                    classNames={{ root: "flex bg-purple-500" }}
                    key={-2}
                    platform={"TWITCH"}
                    text={
                      (data.twitchMain.channelName || `Twitch`) +
                      " | " +
                      decimalNunber(data.twitchMain.subs || 0) +
                      " Followers"
                    }
                    url={`https://twitch.tv/${data.twitchMain.username}`}
                    Tag={"h3"}
                  />
                )}
                {data?.socials.map((social) => (
                  <SocialTag
                    key={social.id}
                    platform={social.platform as string}
                    text={`${social.text}`}
                    url={`${social.link}`}
                  />
                ))}
              </div>
            </div>
          )}
          <Menu slug={params.slug} />
          {children}
        </div>
      </div>
    </div>
  );
}
