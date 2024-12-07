"use client";

import { Carousel, Embla } from "@mantine/carousel";
import { Divider, Paper } from "@mantine/core";
import { useRef, useState } from "react";
import { Image } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { Link } from "@/components/link";
import { Anniversary } from "@/types";
import { convertTimelineType, getTalentImageUrl } from "@/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { twMerge } from "tailwind-merge";
import Autoplay from "embla-carousel-autoplay";
import { specialTimeline } from "../../../drizzle/schema";

type Props = {
  data: {
    date: string | null;
    label: string | null;
    labelWithYear: string | null;
    special: (typeof specialTimeline.$inferSelect)[];
    today: Anniversary[];
    onThisDay: Anniversary[];
    birthday: Anniversary[];
  }[];
};

type SubProps = { data: Anniversary; isShowTime: boolean; className?: string };

const SpecialEvent = ({
  data,
}: {
  data: typeof specialTimeline.$inferSelect;
}) => {
  const { hovered, ref } = useHover();
  const { isMobile } = useIsMobile();

  return (
    <Paper
      ref={ref}
      shadow="lg"
      radius="md"
      className={twMerge(
        "opacity-100 bg-white flex w-full hover:cursor-pointer overflow-hidden transition-all ease-out duration-100",
        !isMobile && "group-hover:opacity-50",
        hovered && "z-[1] group-hover:opacity-100 scale-105"
      )}
    >
      <div className="shadow-inner flex sm:flex-row flex-col w-full">
        <Image
          className={twMerge("w-full xl:max-w-[500px] md:max-w-[300px] sm:max-w-[200px]")}
          src={data.imgUrl || "/img/og.png"}
          fallbackSrc="/img/og.png"
        />
        <div className="flex flex-col items-center justify-center flex-1 p-4 sm:gap-1 gap-0.5 text-center">
          <span className="leading-none sm:text-lg text-sm">{data.time}</span>
          <span className="leading-none lg:text-6xl md:text-5xl sm:text-4xl text-2xl font-bold">{data.title}</span>
          <span className="leading-none md:text-2xl sm:text-xl text-lg">{data.desc}</span>
        </div>
      </div>
    </Paper>
  );
};

const Talent = ({ data, isShowTime, className }: SubProps) => {
  const { hovered, ref } = useHover();
  const talent = data.talent;
  const type = convertTimelineType(data.type as string);
  const { isMobile } = useIsMobile();

  return (
    <Link
      className={twMerge(className || "")}
      href={"/talent/" + talent?.slug}
      onClick={() => {}}
    >
      <Paper
        ref={ref}
        shadow="lg"
        radius="md"
        className={`${hovered && !isMobile ? "z-[1]" : isMobile ? "" : "group-hover:opacity-50"} opacity-100 bg-white flex w-full hover:cursor-pointer overflow-hidden ${isMobile ? "" : "hover:scale-105"} transition-all ease-out duration-100`}
      >
        <Image
          src={getTalentImageUrl(talent)}
          referrerPolicy="no-referrer"
          className="bg-white w-24 aspect-square"
          fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
          alt={talent?.name || ""}
        />
        <div className="text-center px-4 shadow-inner flex-1 flex flex-col justify-center items-center">
          {isShowTime && "year" in data && data.year && (
            <span className="text-sm">{data.year}</span>
          )}
          <span className="text-2xl font-bold">{talent?.name}</span>
          {type && <span className="text-xl">{type}</span>}
          {"value" in data && data.value && (
            <span className="">{data.value}</span>
          )}
        </div>
      </Paper>
    </Link>
  );
};

export default function Base({ data }: Props) {
  const [indexDate, setIndexDate] = useState(7);
  const [embla, setEmbla] = useState<Embla | null>(null);

  return (
    <div className="w-full">
      <Carousel
        height={50}
        initialSlide={7}
        slideSize="200px"
        slideGap="8px"
        align="center"
        getEmblaApi={setEmbla}
        onSlideChange={(index) => setIndexDate(index)}
        classNames={{
          viewport: "mx-16 overflow-hidden",
          container: "ss:max-w-none max-w-[calc(100vw-144px)]",
        }}
      >
        {data.map((item, index) => (
          <Carousel.Slide
            onClick={() => embla?.scrollTo(index)}
            key={index}
            className={`text-primary flex text-xl transition-opacity justify-center items-center ${index != indexDate ? "opacity-60 font-base" : "opacity-100 font-bold"} hover:cursor-pointer`}
          >
            {item.label}
          </Carousel.Slide>
        ))}
      </Carousel>
      <Divider size="md" my={8} />
      <div className="flex flex-col gap-4">
        <div className="w-full flex-col">
          <h3 className="px-2 ss:w-fit w-full text-center bg-primary text-white text-lg rounded-t-md font-bold">
            กิจกรรมที่เกิดขึ้น ณ วันที่ {data[indexDate]?.labelWithYear}
          </h3>
          {((data[indexDate]?.today.length as number) > 0 ||
            (data[indexDate]?.special.length as number) > 0) && (
            <div className="border-2 border-primary bg-primary/10 ss:rounded-r rounded-b p-2 grid xl:grid-cols-3 md:grid-cols-2 gap-2 group">
              {data[indexDate]?.special.map((item, index) =>
                item.url ? (
                  <Link className="xl:col-span-3 md:col-span-2" key={index} href={item.url} target="_blank">
                    <SpecialEvent data={item} />
                  </Link>
                ) : (
                  <div key={index} className="xl:col-span-3 md:col-span-2">
                    <SpecialEvent data={item} />
                  </div>
                )
              )}
              {data[indexDate]?.today.map((item, index) => (
                <Talent
                  className=""
                  data={item}
                  key={index}
                  isShowTime={false}
                />
              ))}
            </div>
          )}
          {(data[indexDate]?.today.length as number) <= 0 && (data[indexDate]?.special.length as number) <= 0 && (
            <div className="border-2 border-primary bg-primary/10 ss:rounded-r rounded-b p-4 flex justify-center items-center text-center">
              ไม่มีกิจกรรมใดๆ ณ วันที่ {data[indexDate]?.labelWithYear}
            </div>
          )}
        </div>
        <div className="w-full flex-col">
          <h3 className="px-2 ss:w-fit w-full text-center bg-primary text-white text-lg rounded-t-md font-bold">
            เหตุการณ์ในอดีต ณ วันที่ {data[indexDate]?.label}
          </h3>
          {(data[indexDate]?.onThisDay.length as number) > 0 && (
            <div className="border-2 border-primary bg-primary/10 ss:rounded-r rounded-b p-2 grid xl:grid-cols-3 md:grid-cols-2 gap-2 group">
              {data[indexDate]?.onThisDay
                .sort((a, b) => (a.year || 0) - (b.year || 0))
                .map((item, index) => (
                  <Talent data={item} key={index} isShowTime={true} />
                ))}
            </div>
          )}
          {(data[indexDate]?.onThisDay.length as number) <= 0 && (
            <div className="border-2 border-primary bg-primary/10 ss:rounded-r rounded-b p-4 flex justify-center items-center text-center">
              ไม่มีกิจกรรมใดๆ ณ วันที่ {data[indexDate]?.label}
            </div>
          )}
        </div>
        <div className="w-full flex-col">
          <h3 className="px-2 ss:w-fit w-full text-center bg-primary text-white text-lg rounded-t-md font-bold">
            วีทูปเบอร์ไทย ที่เกิด ณ วันที่ {data[indexDate]?.label}
          </h3>
          {(data[indexDate]?.birthday.length as number) > 0 && (
            <div className="border-2 border-primary bg-primary/10 ss:rounded-r rounded-b p-2 grid xl:grid-cols-3 md:grid-cols-2 gap-2 group">
              {data[indexDate]?.birthday.map((item, index) => (
                <Talent data={item} key={index} isShowTime={true} />
              ))}
            </div>
          )}
          {(data[indexDate]?.birthday.length as number) <= 0 && (
            <div className="border-2 border-primary bg-primary/10 ss:rounded-r rounded-b p-4 flex justify-center items-center text-center">
              ไม่มีใครเกิด ณ วันที่ {data[indexDate]?.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
