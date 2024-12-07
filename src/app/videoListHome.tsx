"use client";

import VideoCard from "../components/videoCard/videoCard";
import { Loader, Tabs } from "@mantine/core";
import { useInputState } from "@mantine/hooks";
import CarouselShorts from "../components/carouselShorts";
import { IconBug, IconVideoOff } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { VideoTypeFrontFilter, VideoWithTalent } from "@/types";
import { DateTime } from "luxon";
import { Logo } from "@/svg/Logo";
import _ from "lodash";

type props = {
  pinVideoTalentIds?: number[] | null | undefined;
  pinVideoVideoIds?: string[] | null | undefined;
};

export default function VideoListHome({
  pinVideoTalentIds = [],
  pinVideoVideoIds = [],
}: props) {
  const [videoType, setVideoType] = useInputState<VideoTypeFrontFilter>("LIVE");
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: ["videos-home", videoType],
    queryFn: async ({ signal }) => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/video/" + videoType,
        { signal }
      );
      if (res.ok) {
        return (await res.json()) as { data: VideoWithTalent[] };
      }
      throw new Error("not good.");
    },
    networkMode: "always",
    refetchOnWindowFocus: false,
  });

  const filterVideo = (
    videoType: VideoTypeFrontFilter,
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
    <div className="w-full flex flex-col">
      <Tabs
        className=""
        defaultValue="live"
        value={videoType}
        onChange={(value) => setVideoType(value as VideoTypeFrontFilter)}
      >
        <Tabs.List
          className=" before:hidden rounded-t overflow-hidden bg-primary"
          grow
        >
          <Tabs.Tab
            className="border-b-2 border-r-2 border-white flex gap-2 hover:bg-secondary/50 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tl-sm  rounded-tr-none transition-colors"
            value="LIVE"
          >
            ไลฟ์สด
          </Tabs.Tab>
          <Tabs.Tab
            className="border-b-2 border-r-2 border-white flex gap-2 hover:bg-secondary/50 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tr-sm  rounded-tl-none transition-colors"
            value="UPCOMING"
          >
            เร็วๆนี้
          </Tabs.Tab>
          <Tabs.Tab
            className="border-b-2 sm:border-r-2 border-white flex gap-2 hover:bg-secondary/50 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tr-sm  rounded-tl-none transition-colors"
            value="SHORT"
          >
            SHORT
          </Tabs.Tab>
          <Tabs.Tab
            className="border-b-2 border-white flex gap-2 hover:bg-secondary/50 data-[active]:bg-secondary text-white font-bold ss:text-xl text-base rounded-tr-sm  rounded-tl-none transition-colors"
            value="FINISHED"
          >
            บันทึกไลฟ์/วีดีโออัพโหลด
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {(isLoading || isFetching) && (
        <div className="h-[550px] w-full bg-primary/30 rounded-b-md sm:rounded-t-none rounded-t-md flex items-center justify-center">
          <Loader
            classNames={{
              root: "after:border-t-primary after:border-x-primary after:border-b-transparent",
            }}
          />
        </div>
      )}
      {isError && (
        <div className="h-[550px] w-full bg-primary/30 rounded-b-md sm:rounded-t-none rounded-t-md flex flex-col items-center justify-center">
          <IconBug size={96} />
          <span className="text-2xl">พบข้อผิดพลาด ขออภัยในความไม่สะดวก</span>
        </div>
      )}
      {!isError &&
        !isLoading &&
        !isFetching &&
        (data.data?.filter((item) => filterVideo(videoType, item))
          .length as number) <= 0 && (
          <div className="h-[550px] w-full bg-primary/30 rounded-b-md sm:rounded-t-none rounded-t-md flex flex-col items-center justify-center">
            <IconVideoOff size={96} />
            <span className="text-2xl">ไม่พบเจอวีดีโอใดๆ</span>
          </div>
        )}

      {/* LIVE | UPCOMING | FINISHED */}
      {!isError &&
        !isLoading &&
        !isFetching &&
        videoType != "SHORT" &&
        (data.data?.filter((item) => filterVideo(videoType, item))
          .length as number) > 0 && (
          <div className="w-full flex flex-col gap-4 bg-primary/30">
            {(data.data?.filter((item) => filterVideo(videoType, item, "pin"))
              .length as number) > 0 && (
              <div className="w-full flex flex-col sm:p-4 pt-4">
                <div className="">
                  <b className="px-2 py-1 bg-secondary flex flex-row text-white rounded-t-md gap-2">
                    <span>Recommended by</span> <Logo className="w-6 h-6" />
                  </b>
                </div>
                <div className="grid xl:grid-cols-3 lg:grid-cols-2 sm:rounded-b-md overflow-hidden gap-4 bg-primary p-4 ">
                  {data.data
                    ?.filter((item) => filterVideo(videoType, item, "pin"))
                    .map((item) => <VideoCard data={item} key={item.id} />)}
                </div>
              </div>
            )}
            <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 rounded-b-md sm:rounded-t-none rounded-t-md overflow-hidden gap-4 p-4">
              {data.data
                ?.filter((item) => filterVideo(videoType, item, "notpin"))
                .map((item) => <VideoCard data={item} key={item.id} />)}
            </div>
          </div>
        )}
      {/* SHORT */}
      {!isError &&
        !isLoading &&
        !isFetching &&
        videoType == "SHORT" &&
        (data.data?.length as number) > 0 && (
          <div className="grid bg-primary/30 rounded-b-md sm:rounded-t-none rounded-t-md overflow-hidden md:px-0 px-4">
            <CarouselShorts
              datas={data.data}
              pinVideoTalentIds={pinVideoTalentIds}
              pinVideoVideoIds={pinVideoVideoIds}
            />
          </div>
        )}
    </div>
  );
}
