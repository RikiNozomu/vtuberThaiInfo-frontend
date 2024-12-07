"use client";

import {
  Group,
  Loader,
  LoaderFactory,
  PartialVarsResolver,
  Radio,
  RadioGroup,
} from "@mantine/core";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import VideoCard from "@/components/videoCard/videoCard";
import { VideoWithTalent } from "@/types";
import VideoShortCard from "@/components/videoCard/videoShortCard";
import { useInView } from "react-intersection-observer";
import { useListState } from "@mantine/hooks";
import { IconBug, IconVideoOff } from "@tabler/icons-react";
import Ads from "@/components/ads";

type props = {
  slug: string
};

export default function TalentVideoClientComponent({
  slug,
}: props) {
  const [type, setType] = useState("LIVE");
  const [sort, setSort] = useState("new");
  const [videos, handlers] = useListState<VideoWithTalent>([]);

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  const { data, isError, isLoading, fetchNextPage, hasNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["video-talent", type, sort],
      queryFn: async ({ pageParam = null, signal }) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/talent/${slug}/${type}/${sort}${ pageParam ? '/' + pageParam : ''}`,
          { signal }
        );
        if (res.ok) {
          return (await res.json()) as {
            data: VideoWithTalent[];
            token: string;
          };
        }
        throw new Error("not good.");
      },
      networkMode: "always",
      cacheTime: 1,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      keepPreviousData: false,
      getNextPageParam: (lastPage) => lastPage.token,
    });

  const varsResolver: PartialVarsResolver<LoaderFactory> = () => {
    return {
      root: {
        "--loader-color": "#1f4056",
      },
    };
  };

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    const videos =
      data?.pages.reduce<VideoWithTalent[]>((arr: VideoWithTalent[], now) => {
        return [...arr, ...now.data];
      }, []) || []
    handlers.setState(videos);
  }, [data]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid sm:grid-cols-2 gap-4">
        <RadioGroup
          className="sm:bg-transparent bg-primary/20 rounded sm:p-0 p-4"
          value={type}
          onChange={(value) => {
            setType(value);
            if (value == "SHORT") {
              setSort("new");
            }
          }}
          name="type"
          label="รูปแบบ"
          classNames={{
            label: "pb-2 font-bold",
          }}
        >
          <Group>
            <Radio classNames={{ label: "md:" }} value="LIVE" label="ไลฟ์สด" />
            <Radio
              classNames={{ label: "md:" }}
              value="UPLOADED"
              label="อัพโหลด"
            />
            <Radio classNames={{ label: "md:" }} value="SHORT" label="SHORT" />
          </Group>
        </RadioGroup>
        {type != "SHORT" && (
          <RadioGroup
            className="sm:bg-transparent bg-primary/20 rounded sm:p-0 p-4"
            value={sort}
            onChange={setSort}
            name="sort"
            label="เรียงลำดับ"
            classNames={{
              label: "pb-2 font-bold sm:text-right w-full",
            }}
          >
            <Group className="flex flex-row flex-wrap sm:justify-end">
              <Radio classNames={{ label: "md:" }} value="new" label="ล่าสุด" />
              <Radio
                classNames={{ label: "md:" }}
                value="old"
                label="เก่าที่สุด"
              />
              <Radio
                classNames={{ label: "md:" }}
                value="views"
                label="ยอดนิยม"
              />
            </Group>
          </RadioGroup>
        )}
      </div>
      <div className={`p-4 bg-primary/30 rounded-md overflow-hidden flex-1`}>
        {(videos?.length as number) > 0 && (
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-4">
            {videos.map((item, index) => {
              switch (item.type) {
                case "ADS":
                  return (
                    <Ads
                      className={
                        "w-full h-full rounded sm:aspect-auto aspect-square"
                      }
                      key={index}
                      slot={item.videoId!}
                    />
                  );
                case "SHORT":
                  return (
                    <VideoShortCard
                      data={{ ...item, talents: [] }}
                      key={index}
                    />
                  );
                default:
                  return (
                    <VideoCard data={{ ...item, talents: [] }} key={index} />
                  );
              }
            })}
          </div>
        )}
        {isError && (videos?.length as number) <= 0 && (
          <div className={`gap-2 flex flex-col items-center justify-center`}>
            <IconBug size={96} />
            <span className="text-2xl">พบข้อผิดพลาด ขออภัยในความไม่สะดวก</span>
          </div>
        )}
        {!isError &&
          !isFetching &&
          !isLoading &&
          (videos?.length as number) <= 0 && (
            <div className={`gap-2 flex flex-col items-center justify-center`}>
              <IconVideoOff size={96} />
              <span className="text-2xl">ไม่พบเจอวีดีโอใดๆ</span>
            </div>
          )}
        {(isFetching || hasNextPage) && (
          <div
            ref={ref}
            className="h-[200px] xl:col-span-4 lg:col-span-3 sm:col-span-2 flex items-center justify-center"
          >
            <Loader vars={varsResolver} size="xl" type="bars" />
          </div>
        )}
      </div>
    </div>
  );
}
