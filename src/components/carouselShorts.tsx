"use client";

import { Carousel } from "@mantine/carousel";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { DateTime } from "luxon";
import VideoShortCarouselCard from "@/components/videoCard/VideoShortCarouselCard";
import { VideoWithTalent } from "@/types";
import _ from "lodash";

export default function CarouselShorts(props: {
  datas: VideoWithTalent[] | undefined;
  pinVideoTalentIds?: number[] | null | undefined;
  pinVideoVideoIds?: string[] | null | undefined;
}) {
  return (
    <Carousel
      height={550}
      align="start"
      slideSize={`${Math.floor((550 * 9) / 18) + 28}px`}
      slidesToScroll={1}
      slideGap={12}
      nextControlIcon={<IconArrowRight style={{ width: 32, height: 32 }} />}
      previousControlIcon={<IconArrowLeft style={{ width: 32, height: 32 }} />}
      loop
      className="w-full"
      classNames={{
        viewport: "w-full md:w-[calc(100%-128px)] md:ml-16",
        container: "md:max-w-[calc(100vw-4px)] max-w-[calc(100vw-36px)]",
        control: "bg-primary text-white w-10 h-10 md:flex hidden",
      }}
    >
      {props.datas
        ?.filter((item) => item.type == "SHORT")
        .sort((a, b) => {
          const date1 = a.datetime
            ? DateTime.fromSQL(a.datetime)
            : DateTime.now();
          const date2 = b.datetime
            ? DateTime.fromSQL(b.datetime)
            : DateTime.now();
          return date2.toMillis() - date1.toMillis();
        })
        .sort((a, b) => {
          const isAPin =
            _.intersection(
              a.talents.map((tl) => tl.id),
              props.pinVideoTalentIds
            ).length > 0 ||
            props.pinVideoVideoIds?.includes(a.videoId || "noVid");

          const isBPin =
            _.intersection(
              b.talents.map((tl) => tl.id),
              props.pinVideoTalentIds
            ).length > 0 ||
            props.pinVideoVideoIds?.includes(b.videoId || "noVid");

          if ((isAPin && isBPin) || (!isAPin && !isBPin)) {
            return 0;
          } else if (isAPin && !isBPin) {
            return -1;
          } else if (!isAPin && isBPin) {
            return 1;
          }
          return 0;
        })
        .map((item, index) => (
          <VideoShortCarouselCard
            data={item}
            key={index}
            isPin={
              _.intersection(
                item.talents.map((tl) => tl.id),
                props.pinVideoTalentIds
              ).length > 0 ||
              props.pinVideoVideoIds?.includes(item.videoId || "noVid")
            }
          />
        ))}
    </Carousel>
  );
}
