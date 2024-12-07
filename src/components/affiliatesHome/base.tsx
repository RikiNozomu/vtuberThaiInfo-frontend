"use client";

import { Carousel } from "@mantine/carousel";
import { Paper } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "@/components/link";
import { useRef } from "react";
import { Image } from "@mantine/core";
import * as schema from "../../../drizzle/schema";
import { useIsMobile } from "@/hooks/useIsMobile";

type props = {
  datas: (typeof schema.affiliate.$inferSelect)[];
};

export default function Base({ datas }: props) {
  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const { isMobile } = useIsMobile();

  return (
    <Carousel
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      height={300}
      align="start"
      slideSize={{
        base: "100%",
        xs: "50%",
        sm: "33.33333%",
        lg: "25%",
        xl: "16.66666%",
      }}
      slidesToScroll={1}
      slideGap={12}
      nextControlIcon={<IconArrowRight style={{ width: 32, height: 32 }} />}
      previousControlIcon={<IconArrowLeft style={{ width: 32, height: 32 }} />}
      loop
      className="w-full"
      classNames={{
        viewport: "w-full md:w-[calc(100%-128px)] md:ml-16",
        container: "max-w-[calc(100vw-4px)]",
        control: "bg-primary text-white w-10 h-10 md:flex hidden",
      }}
    >
      {datas?.map((item) => (
        <Carousel.Slide className="py-4" key={item.id}>
          <Paper
            href={"/affiliate/" + item?.slug}
            component={Link}
            shadow="sm"
            radius="md"
            className="h-full relative group overflow-clip"
          >
            {item.profileImgURL ? (
              <Image
                referrerPolicy="no-referrer"
                className={`w-full h-full ${isMobile ? "" : "group-hover:scale-110 transition-all ease-out duration-100"} object-cover`}
                src={item.profileImgURL}
                fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
                alt={item.name || ""}
              />
            ) : (
              <div
                className={`${item.slug == "independent" ? "bg-secondary" : "bg-primary"} text-white text-5xl font-bold h-full w-full flex items-center justify-center text-center ${isMobile ? "" : "group-hover:scale-110 transition-all ease-out duration-100"} object-cover break-all`}
              >
                {item.nameHeadline}
              </div>
            )}
            <div
              className={`absolute bottom-0 h-20 w-full bg-gradient-to-t from-black ${isMobile ? "" : "group-hover:opacity-100 opacity-0 transition-all ease-out duration-100"}`}
            ></div>
            <h3
              className={`text-lg font-bold left-2 ${isMobile ? "bottom-1" : "group-hover:opacity-100 opacity-0 group-hover:bottom-1 -bottom-1 transition-all ease-out duration-100"} absolute text-white`}
            >
              {item.name}
            </h3>
          </Paper>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
