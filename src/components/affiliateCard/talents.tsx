"use client";

import { getTalentsByAffiliateId } from "@/actions";
import * as schema from "../../../drizzle/schema";
import { Tooltip, Image } from "@mantine/core";
import { Link } from "../link";

type props = {
  affiliate: typeof schema.affiliate.$inferSelect;
};

export default async function Talents({ affiliate }: props) {
  const talents = (await getTalentsByAffiliateId(affiliate.id)).sort((a, b) => {
    const AisActive = a.statusType == "ACTIVE" && a.isActive;
    const BisActive = b.statusType == "ACTIVE" && b.isActive;
    if (BisActive && !AisActive) {
      return 1;
    }
    if (AisActive && !BisActive) {
      return -1;
    }
    if ((b.youtubeMain?.subs || 0) != (a.youtubeMain?.subs || 0)) {
      return (b.youtubeMain?.subs || 0) - (a.youtubeMain?.subs || 0);
    } else if ((b.twitchMain?.subs || 0) != (a.twitchMain?.subs || 0)) {
      return (b.twitchMain?.subs || 0) - (a.twitchMain?.subs || 0);
    }
    return 0;
  });

  return (
    <div className="pt-2 flex flex-row">
      {talents.slice(0, 6).map((talent) => (
        <Tooltip className="" key={talent.slug} label={talent?.name} withArrow>
          <Link 
            className="[&:not(:first-child)]:-ml-4 hover:z-[2]"
            href={"/talent/" + talent.slug}
          >
            <Image
              referrerPolicy="no-referrer"
              className={`bg-white w-[46px] aspect-square rounded-full border-2 border-white ${talent.isActive ? "" : "brightness-50"}`}
              src={talent.profileImgURL}
              fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
              alt={talent.name || ''}
            />
          </Link>
        </Tooltip>
      ))}
      {talents.length == 7 && (
        <Tooltip className="" label={talents.at(6)?.name} withArrow>
          <Link 
            className="[&:not(:first-child)]:-ml-4 hover:z-[2]"
            href={"/talent/" + talents.at(6)?.slug}
          >
            <Image
              referrerPolicy="no-referrer"
              className={`bg-white w-[46px] aspect-square rounded-full border-2 border-white ${talents.at(6)?.isActive ? "" : "brightness-50"}`}
              src={talents.at(6)?.profileImgURL}
              fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
              alt={talents.at(6)?.name || ''}
            />
          </Link>
        </Tooltip>
      )}
      {talents.length > 7 && (
        <Tooltip
          label={
            <div className="flex flex-col">
              {talents.slice(6, 12).map((talent) => (
                <span key={talent.slug}>{talent.name}</span>
              ))}
              {talents.length > 12 && (
                <span>...และอีก {talents.length - 12}</span>
              )}
            </div>
          }
          withArrow
        >
          <Link 
            href={`/affiliate/${affiliate.slug}`}
            className="[&:not(:first-child)]:-ml-4 flex items-center border-2 border-white hover:z-[2] z-[1] justify-center w-[46px] aspect-square text-center bg-[#f3f4f5] text-[#868e96] rounded-full font-bold text-lg"
          >
            +{talents.length - 6}
          </Link>
        </Tooltip>
      )}
    </div>
  );
}
