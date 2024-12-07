"use client";

import { Carousel } from "@mantine/carousel";
import { Paper } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "@/components/link";
import { useRef } from "react";
import { Image } from "@mantine/core";
import { TalentWithChannel } from "@/types";
import { getTalentImageUrl } from "@/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function CarouselTalents(props: {
  talents: TalentWithChannel[]
}) {
  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const { isMobile } = useIsMobile()

  return (
    <Carousel
      plugins={[autoplay.current]}
      onMouseEnter={autoplay.current.stop}
      onMouseLeave={autoplay.current.reset}
      height={300}
      align="start"
      slideSize={{
        base: "50%",
        xs: "33.33333%",
        sm: "25%",
        lg: "33.33333%",
        xl: "25%",
      }}
      slidesToScroll={1}
      slideGap={12}
      nextControlIcon={<IconArrowRight style={{ width: 32, height: 32 }} />}
      previousControlIcon={<IconArrowLeft style={{ width: 32, height: 32 }} />}
      loop
      className="w-full"
      classNames={{
        viewport: "w-full",
        container: "max-w-[calc(100vw-4px)]",
        control: "bg-primary text-white w-10 h-10 md:flex hidden",
      }}
    >
      {props.talents?.map((item) => (
        <Carousel.Slide className="py-4" key={item.id}>
          <Paper
            href={"/talent/" + item?.slug}
            component={Link}
            shadow="sm"
            radius="md"
            className="h-full relative group overflow-clip"
            onClick={() => {

            }}
          >
            <Image
              referrerPolicy="no-referrer"
              className={`w-full h-full ${isMobile ? "" : "group-hover:scale-110 transition-all ease-out duration-100"} object-cover bg-white`}
              src={getTalentImageUrl(item)}
              fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
              alt={item.name || ''}
            />
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
