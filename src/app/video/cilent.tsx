"use client";

import { ActionIcon, Divider, Loader, Switch, Tabs } from "@mantine/core";
import {
  useDisclosure,
  useInputState,
  useMediaQuery,
  useSetState,
} from "@mantine/hooks";
import Headline from "@/components/headline";
import Ads from "@/components/ads";
import { useState } from "react";
import { Carousel, Embla } from "@mantine/carousel";
import { DateTime, Interval } from "luxon";
import { useQuery } from "@tanstack/react-query";
import { VideoWithTalent } from "@/types";
import VideoCard from "@/components/videoCard/videoCard";
import { IconReload, IconVideoOff } from "@tabler/icons-react";
import { IconBug } from "@tabler/icons-react";
import VideoShortCard from "@/components/videoCard/videoShortCard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { twMerge } from "tailwind-merge";
import _ from "lodash";
import { Logo } from "@/svg/Logo";

type propsDateSelect = {
  onUpdate: (index: number) => void;
  value: number;
  dates: {
    day: number | undefined;
    month: number | undefined;
    label: string | undefined;
    labelWithYear: string | undefined;
    iso: string | null | undefined;
  }[];
  initValue: number;
  className?: string;
};

const DateSelect = ({
  onUpdate,
  value,
  dates,
  initValue,
  className,
}: propsDateSelect) => {
  const [embla, setEmbla] = useState<Embla | null>(null);

  return (
    <div
      className={
        className ||
        "w-full flex flex-col bg-primary/30 rounded-t-md md:rounded-t-none"
      }
    >
      <Carousel
        height={50}
        initialSlide={initValue}
        slideSize="200px"
        slideGap="8px"
        align="center"
        getEmblaApi={setEmbla}
        onSlideChange={onUpdate}
        classNames={{
          viewport: "mx-16 overflow-hidden",
          container: "ss:max-w-none max-w-[calc(100vw-144px)]",
          control: "data-[inactive]:opacity-0",
        }}
      >
        {dates.map((item, index) => (
          <Carousel.Slide
            onClick={() => embla?.scrollTo(index)}
            key={index}
            className={`text-primary flex text-xl transition-opacity justify-center items-center ${index != value ? "opacity-60 font-base" : "opacity-100 font-bold"} hover:cursor-pointer`}
          >
            {item.label}
          </Carousel.Slide>
        ))}
      </Carousel>
      <Divider size="md" my={8} />
    </div>
  );
};

type props = {
  pinVideoTalentIds?: number[] | null | undefined;
  pinVideoVideoIds?: string[] | null | undefined;
};

export default function VideoClientComponent({
  pinVideoTalentIds = [],
  pinVideoVideoIds = [],
}: props) {
  const [videoType, setVideoType] = useInputState("LIVE");
  const [indexDate, setIndexDate] = useSetState({
    finished: 7,
    upcoming: 0,
    short: 7,
  });
  const [isOnlyFuture, handlersOnlyFuture] = useDisclosure(true);
  const matches = useMediaQuery("(min-width: 640px)");

  const { isMobile } = useIsMobile();

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["video", videoType, indexDate],
    queryFn: async () => {
      let endpoint = "";
      switch (videoType) {
        case "UPCOMING":
          endpoint =
            process.env.NEXT_PUBLIC_API_BASE_URL +
            "/video/" +
            videoType +
            "/" +
            datesFuture[indexDate.upcoming].iso;
          break;
        case "SHORT":
          endpoint =
            process.env.NEXT_PUBLIC_API_BASE_URL +
            "/video/" +
            videoType +
            "/" +
            datesPast[indexDate.short].iso;
          break;
        case "FINISHED":
          endpoint =
            process.env.NEXT_PUBLIC_API_BASE_URL +
            "/video/" +
            videoType +
            "/" +
            datesPast[indexDate.finished].iso;
          break;
        default:
          endpoint = process.env.NEXT_PUBLIC_API_BASE_URL + "/video/LIVE";
          break;
      }
      const feed = await fetch(endpoint);
      const { data: videos } = (await feed.json()) as {
        data: VideoWithTalent[];
      };
      return videos;
    },
    networkMode: "always",
    refetchOnWindowFocus: false,
  });

  // for UPCOMING
  const datesFuture = Interval.fromDateTimes(
    DateTime.now().setZone(process.env.NEXT_PUBLIC_TIMEZONE).startOf("day"),
    DateTime.now()
      .setZone(process.env.NEXT_PUBLIC_TIMEZONE)
      .endOf("day")
      .plus({ day: 7 })
  )
    .splitBy({ day: 1 })
    .map((item) => ({
      day: item.start?.day,
      month: item.start?.month,
      label: item.start?.setLocale("TH").toFormat("d LLLL"),
      labelWithYear: item.start?.setLocale("TH").toFormat("d LLLL yyyy"),
      iso: item.start?.toISODate(),
    }));

  // for SHORT & FINISHED
  const datesPast = Interval.fromDateTimes(
    DateTime.now()
      .setZone(process.env.NEXT_PUBLIC_TIMEZONE)
      .startOf("day")
      .minus({ day: 7 }),
    DateTime.now().setZone(process.env.NEXT_PUBLIC_TIMEZONE).endOf("day")
  )
    .splitBy({ day: 1 })
    .map((item) => ({
      day: item.start?.day,
      month: item.start?.month,
      label: item.start?.setLocale("TH").toFormat("d LLLL"),
      labelWithYear: item.start?.setLocale("TH").toFormat("d LLLL yyyy"),
      iso: item.start?.toISODate(),
    }));

  const filterVideo = (
    videoType: string,
    item: VideoWithTalent,
    pinAllNot = "all"
  ) => {
    if (
      pinAllNot == "all" &&
      (videoType != "UPCOMING" ||
        (item.datetime &&
          DateTime.fromSQL(item.datetime).diffNow(["seconds"]).seconds > 0))
    ) {
      return true;
    } else if (
      pinAllNot == "pin" &&
      (_.intersection(
        item.talents.map((tl) => tl.id),
        pinVideoTalentIds || []
      ).length > 0 ||
        pinVideoVideoIds?.includes(item.videoId || "noIDs"))
    ) {
      return true;
    } else if (
      pinAllNot == "notpin" &&
      (videoType != "UPCOMING" ||
        (item.datetime &&
          DateTime.fromSQL(item.datetime).diffNow(["seconds"]).seconds > 0)) &&
      _.intersection(
        item.talents.map((tl) => tl.id),
        pinVideoTalentIds || []
      ).length <= 0 &&
      !pinVideoVideoIds?.includes(item.videoId || "noIDs")
    ) {
      return true;
    }
    return false;
  };

  return (
    <main className="container bg-white flex flex-col p-2 items-center relative">
      <div className="absolute right-2 w-fit h-fit sm:block hidden">
        <ActionIcon
          disabled={isFetching || isLoading}
          size={matches ? 45 : 20}
          onClick={() => refetch()}
          className="disabled:opacity-50 "
        >
          <IconReload
            style={{ width: "100%", height: "100%" }}
            className={`text-primary ${isFetching || isLoading ? "animate-spin" : ""}`}
          />
        </ActionIcon>
      </div>
      <Headline
        title={<h1 className="flex gap-2">วีดีโอวีทูปเบอร์ไทยทั้งหมด</h1>}
      />
      <Ads
        className={"w-full max-w-[970px] h-[90px] text-xl mt-4"}
        slot={"3891479638"}
      />

      <div className="w-full pt-4 flex flex-col flex-1">
        <Tabs defaultValue="LIVE" value={videoType} onChange={setVideoType}>
          <Tabs.List
            className=" before:hidden rounded-t overflow-hidden bg-primary"
            grow
          >
            <Tabs.Tab
              className={twMerge(
                "border-b-2 border-r-2 border-white flex gap-2 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tl-sm  rounded-tr-none transition-colors",
                !isMobile && "hover:bg-secondary/50"
              )}
              value="LIVE"
            >
              ไลฟ์สด
            </Tabs.Tab>
            <Tabs.Tab
              className={twMerge(
                "border-b-2 border-r-2 border-white flex gap-2 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tr-sm  rounded-tl-none transition-colors",
                !isMobile && "hover:bg-secondary/50"
              )}
              value="UPCOMING"
            >
              เร็วๆนี้
            </Tabs.Tab>
            <Tabs.Tab
              className={twMerge(
                "border-b-2 sm:border-r-2 border-white flex gap-2 hover:bg-secondary/50 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tr-sm  rounded-tl-none transition-colors",
                !isMobile && "hover:bg-secondary/50"
              )}
              value="SHORT"
            >
              SHORT
            </Tabs.Tab>
            <Tabs.Tab
              className={twMerge(
                "border-b-2 border-white flex gap-2 hover:bg-secondary/50 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tr-sm  rounded-tl-none transition-colors",
                !isMobile && "hover:bg-secondary/50"
              )}
              value="FINISHED"
            >
              บันทึกไลฟ์/วีดีโออัพโหลด
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        {videoType == "UPCOMING" && (
          <DateSelect
            initValue={0}
            onUpdate={(index: number) => setIndexDate({ upcoming: index })}
            value={indexDate.upcoming}
            dates={datesFuture}
          />
        )}
        {videoType == "SHORT" && (
          <DateSelect
            initValue={7}
            onUpdate={(index: number) => setIndexDate({ short: index })}
            value={indexDate.short}
            dates={datesPast}
          />
        )}
        {videoType == "FINISHED" && (
          <DateSelect
            initValue={7}
            onUpdate={(index: number) => setIndexDate({ finished: index })}
            value={indexDate.finished}
            dates={datesPast}
          />
        )}
        {videoType == "UPCOMING" && indexDate.upcoming == 0 && (
          <div className="bg-primary/30 px-4 flex flex-row justify-end">
            <Switch
              classNames={{
                track: isOnlyFuture
                  ? "bg-primary border-0 hover:cursor-pointer"
                  : "border-0 hover:cursor-pointer",
                label: "hover:cursor-pointer text-lg",
              }}
              checked={isOnlyFuture}
              onChange={handlersOnlyFuture.toggle}
              size="md"
              label="เฉพาะกำหนดการณ์ในอนาคต"
            />
          </div>
        )}

        {(isLoading || isFetching) && (
          <div
            className={`flex-1 w-full bg-primary/30 rounded-b-md ${videoType == "LIVE" ? "rounded-t-md md:rounded-t-none" : "rounded-t-none"} flex items-center justify-center`}
          >
            <Loader
              classNames={{
                root: "after:border-t-primary after:border-x-primary after:border-b-transparent",
              }}
            />
          </div>
        )}
        {!isError &&
          !isFetching &&
          !isLoading &&
          (data?.length as number) <= 0 && (
            <div
              className={`gap-2 flex-1 w-full bg-primary/30 rounded-b-md ${videoType == "LIVE" ? "rounded-t-md md:rounded-t-none" : "rounded-t-none"} flex flex-col items-center justify-center`}
            >
              <IconVideoOff size={96} />
              <span className="text-2xl">ไม่พบเจอวีดีโอใดๆ</span>
            </div>
          )}
        {isError && (
          <div
            className={`gap-2 flex-1 w-full bg-primary/30 rounded-b-md ${videoType == "LIVE" ? "rounded-t-md md:rounded-t-none" : "rounded-t-none"} flex flex-col items-center justify-center`}
          >
            <IconBug size={96} />
            <span className="text-2xl">พบข้อผิดพลาด ขออภัยในความไม่สะดวก</span>
          </div>
        )}

        {!isError &&
          !isFetching &&
          !isLoading &&
          videoType != "SHORT" &&
          (data?.length as number) > 0 && (
            <div className="w-full flex flex-col gap-4 bg-primary/30">
              {(data?.filter((item) => filterVideo(videoType, item, "pin"))
                .length as number) > 0 && (
                <div className="w-full flex flex-col sm:p-4 pt-4">
                  <div className="">
                    <b className="px-2 py-1 bg-secondary flex flex-row text-white rounded-t-md gap-2">
                      <span>Recommended by</span> <Logo className="w-6 h-6" />
                    </b>
                  </div>
                  <div className="grid xl:grid-cols-3 lg:grid-cols-2 sm:rounded-b-md overflow-hidden gap-4 bg-primary p-4 ">
                    {data
                      ?.filter((item) => filterVideo(videoType, item, "pin"))
                      .map((item) => <VideoCard data={item} key={item.id} />)}
                  </div>
                </div>
              )}
              <div
                className={`grid p-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 rounded-b-md ${videoType == "LIVE" ? "rounded-t-md md:rounded-t-none" : "rounded-t-none"} overflow-hidden gap-4`}
              >
                {data
                  ?.filter(
                    (item) =>
                      !isOnlyFuture || filterVideo(videoType, item, "notpin")
                  )
                  .map((item, index) => <VideoCard data={item} key={index} />)}
              </div>
            </div>
          )}
        {!isError &&
          !isFetching &&
          !isLoading &&
          videoType == "SHORT" &&
          (data?.length as number) > 0 && (
            <div className="grid p-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-4 bg-primary/30 rounded-b-md sm:rounded-t-none rounded-t-md overflow-hidden">
              {data
                ?.sort((a, b) => {
                  const isAPin =
                    _.intersection(
                      a.talents.map((tl) => tl.id),
                      pinVideoTalentIds
                    ).length > 0 ||
                    pinVideoVideoIds?.includes(a.videoId || "noVid");

                  const isBPin =
                    _.intersection(
                      b.talents.map((tl) => tl.id),
                      pinVideoTalentIds
                    ).length > 0 ||
                    pinVideoVideoIds?.includes(b.videoId || "noVid");

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
                  <VideoShortCard
                    data={item}
                    key={index}
                    isPin={
                      _.intersection(
                        item.talents.map((tl) => tl.id),
                        pinVideoTalentIds
                      ).length > 0 ||
                      pinVideoVideoIds?.includes(item.videoId || "noVid")
                    }
                  />
                ))}
            </div>
          )}
      </div>
    </main>
  );
}
