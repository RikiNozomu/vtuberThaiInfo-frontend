"use client";

import { TalentCardType } from "@/types";
import { decimalNunber } from "@/utils";
import { faTwitch, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Anchor,
  Avatar,
  Card,
  CardSection,
  Image,
  Tooltip,
} from "@mantine/core";
import { Link } from "@/components/link";
import { sendGTMEvent } from "@next/third-parties/google";
import Ads from "./ads";
import { useIsMobile } from "@/hooks/useIsMobile";

type props = {
  talent: TalentCardType;
  className?: string;
  isActive?: boolean;
  Tag?: keyof JSX.IntrinsicElements;
  searchTerm?: string;
  searchWhere?: string;
};

export default function TalentCard({
  talent,
  className,
  isActive = true,
  Tag = "div",
  searchTerm = "",
  searchWhere = "talent",
}: props) {
  const { isMobile } = useIsMobile();

  return (
    <Card
      className={`${
        isMobile ? "" : "hover:scale-125 hover:z-[2]"
      } group transition divide-y-2 ${className ? className : ""} ${
        isActive ? "" : "brightness-75 opacity-50 hover:opacity-100"
      }`}
      shadow="sm"
      padding="none"
      radius="md"
      withBorder
    >
      {talent.statusType != "ADS" ? (
        <CardSection
          className="relative"
          component={Link}
          href={`/talent/${talent.slug}`}
        >
          <div
            className={`absolute bottom-0 h-32 w-full bg-gradient-to-t from-black ${
              isMobile
                ? ""
                : "group-hover:opacity-100 opacity-0 transition-all ease-out duration-100"
            }`}
          ></div>
          <div
            className={`${
              isMobile
                ? "opacity-100"
                : "ease-out duration-100 group-hover:opacity-100 opacity-0 transition-opacity"
            } absolute grid grid-cols-2 bottom-2 left-0 px-2 w-full text-white font-bold text-3xl`}
          >
            <div
              className={`flex justify-end items-start flex-col ${
                talent.youtubeMain ? "" : "opacity-0"
              }`}
            >
              <FontAwesomeIcon icon={faYoutube} />
              <div className="text-xl">
                {decimalNunber(talent.youtubeMain?.subs || 0)}
                <span className="text-sm font-medium">Subs</span>
              </div>
              <div className="text-xl">
                {decimalNunber(talent.youtubeMain?.views || 0)}
                <span className="text-sm font-medium">Views</span>
              </div>
            </div>
            <div
              className={`flex justify-end flex-col items-end gap-2 ${
                talent.twitchMain ? "" : "opacity-0"
              }`}
            >
              <FontAwesomeIcon icon={faTwitch} />
              <div className="text-xl flex flex-col text-right leading-[15px]">
                {decimalNunber(talent.twitchMain?.subs || 0)}
                <span className="text-sm font-medium">Followers</span>
              </div>
            </div>
          </div>
          <Image
            referrerPolicy="no-referrer"
            className="w-full aspect-square object-cover bg-white"
            src={talent.profileImgURL}
            fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
            alt={talent.name || ""}
          />
        </CardSection>
      ) : (
        <Ads className={"w-full h-full"} slot={talent.slug} />
      )}
      <div className="flex flex-col p-2 divide-y-2">
        {talent.statusType != "ADS" ? (
          <Anchor
            className="text-xl break-words text-primary font-bold pb-2"
            href={`/talent/${talent.slug}`}
            onClick={() => {
              sendGTMEvent({
                event: "search-select",
                name: talent.name,
                type: "talent",
                where: searchWhere,
                search_term: searchTerm || null,
              });
            }}
          >
            <Tag>{talent.name}</Tag>
          </Anchor>
        ) : (
          <span className="text-xl break-words text-primary font-bold pb-2">
            {talent.name}
          </span>
        )}
        {(talent.transfers?.length as number) == 1 &&
          talent.transfers?.at(0)?.affiliate && (
            <Link
              className="flex hover:underline flex-row items-center gap-1 line-clamp-1 pt-2"
              href={"/affiliate/" + talent.transfers?.at(0)?.affiliate?.slug}
            >
              {talent.transfers.at(0)?.affiliate?.profileImgURL && (
                <Image
                  className="w-[32px] aspect-square object-cover rounded-full"
                  src={talent.transfers.at(0)?.affiliate?.profileImgURL}
                  fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
                  alt={talent.transfers.at(0)?.affiliate?.name || ""}
                />
              )}
              <b>{talent.transfers.at(0)?.affiliate?.name}</b>
            </Link>
          )}
        {(talent.transfers?.length as number) == 1 &&
          !talent.transfers?.at(0)?.affiliate && (
            <div className="flex flex-row line-clamp-1 pt-2">
              <b>{talent.transfers?.at(0)?.affiliateName}</b>
            </div>
          )}
        {(talent.transfers?.length as number) > 1 && (
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            {talent.transfers?.map((transfer) => {
              if (transfer.affiliate) {
                return (
                  <Tooltip key={transfer.id} label={transfer.affiliate.name}>
                    <Link href={"/affiliate/" + transfer.affiliate?.slug}>
                      {transfer.affiliate.profileImgURL ? (
                        <Image
                          className="w-[32px] aspect-square object-cover rounded-full"
                          src={transfer.affiliate?.profileImgURL}
                          fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
                          alt={transfer.affiliate.name || ""}
                        />
                      ) : (
                        <Avatar size={32}>
                          {transfer.affiliate.name?.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                    </Link>
                  </Tooltip>
                );
              }
              return (
                <Tooltip label={transfer.affiliateName}>
                  <Avatar size={32}>
                    {transfer.affiliateName?.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
