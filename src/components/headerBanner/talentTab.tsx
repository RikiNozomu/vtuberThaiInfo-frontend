"use client";

import Link from "next/link";
import { Image } from "@mantine/core";
import { getTalentImageUrl } from "@/utils";
import { TalentWithChannel } from "@/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { twMerge } from "tailwind-merge";

export default function TalentTab({ talent }: { talent: TalentWithChannel }) {
  const { isMobile } = useIsMobile();

  return (
    <Link
      key={talent.slug}
      className={twMerge(
        "flex-1 relative group overflow-clip w-full",
        isMobile ?  "" : "hover:z-[1] hover:mix-blend-normal mix-blend-luminosity"
      )}
      href={"/talent/" + talent.slug}
    >
      <Image
        className={twMerge(
          "md:h-[300px]",
          isMobile ? "" : "group-hover:scale-110 transition-transform"
        )}
        src={getTalentImageUrl(talent)}
      />
      <div
        className={twMerge(
          "absolute bottom-0 w-full bg-gradient-to-t from-black sm:h-20 h-10 opacity-0",
          isMobile
            ? "opacity-100"
            : "group-hover:opacity-100 transition-opacity"
        )}
      ></div>
      <b
        className={twMerge(
          "sm:text-base text-xs absolute bottom-0 left-0 p-2 text-white w-full",
          isMobile
            ? "opacity-100"
            : "group-hover:opacity-100 opacity-0 transition-opacity"
        )}
      >
        {talent.name}
      </b>
    </Link>
  );
}
