"use client";

import { Anchor, Card, CardSection, Image } from "@mantine/core";
import { Link } from "@/components/link";
import Ads from "../ads";
import { useIsMobile } from "@/hooks/useIsMobile";
import { twMerge } from "tailwind-merge";

type props = {
  affiliate: {
    id: number;
    name: string | null;
    nameHeadline: string | null;
    slug: string | null;
    profileImgURL: string | null;
    type: "AFFILIATE" | "GROUP" | "ADS";
  };
  className?: string;
};

export default function AffiliateCard({ affiliate, className = "" }: props) {
  const { isMobile } = useIsMobile();

  return (
    <Card
      className={twMerge(
        `${isMobile ? "" : "hover:scale-125 hover:z-[2]"} transition divide-y-2`,
        className
      )}
      shadow="sm"
      padding="none"
      radius="md"
      withBorder
    >
      <CardSection component={Link} href={`/affiliate/${affiliate.slug}`}>
        {affiliate.profileImgURL ? (
          <Image
            className="w-full aspect-square object-cover"
            src={affiliate.profileImgURL}
            fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
            alt={affiliate.name || ""}
          />
        ) : (
          <div
            className={twMerge(
              "w-full aspect-square text-white flex justify-center items-center text-4xl text-center font-bold bg-primary break-all",
              affiliate.slug == "independent" && "bg-secondary text-8xl"
            )}
          >
            { affiliate.slug == "independent" ? "อิสระ" : affiliate.name }
          </div>
        )}
      </CardSection>
      <div className="flex flex-col p-2 divide-y-2">
        <Anchor
          className="text-xl break-words text-primary font-bold pb-2"
          href={`/affiliate/${affiliate.slug}`}
        >
          <h2>{affiliate.name}</h2>
        </Anchor>
      </div>
    </Card>
  );
}
