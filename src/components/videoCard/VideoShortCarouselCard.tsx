"use client";

import { VideoWithTalent } from "@/types";
import { Carousel } from "@mantine/carousel";
import { Paper, Tooltip, Image, AspectRatio } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { motion } from "framer-motion";
import ModalVideoShort from "../modalShortVideo";
import { useEffect, useState } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Link } from "../link";
import { Logo } from "@/svg/Logo";

export default function VideoShortCarouselCard(props: {
  data: VideoWithTalent;
  isPin?: boolean | undefined
}) {
  const data = props.data;
  const { hovered, ref } = useHover();
  const [opened, setOpened] = useState(false);
  const { isMobile } = useIsMobile();

  useEffect(() => {
    if (opened) {
      sendGTMEvent({
        event: "video-select",
        video_type: data.type,
        video_id: data.videoId,
        stream_id: data.streamId,
        platform: data.platform,
      });

      for (const talent of data.talents) {
        sendGTMEvent({
          event: "video-select-by-talent",
          video_type: data.type,
          video_id: data.videoId,
          stream_id: data.streamId,
          platform: data.platform,
          talent_id: talent.id,
          talent_slug: talent.slug,
          talent_name: talent.name,
        });
      }
    }
  }, [opened]);

  return (
    <Carousel.Slide className="py-4" key={data.id}>
      <ModalVideoShort data={data} opened={opened} fnOpened={setOpened} />
      <AspectRatio ratio={9 / 16}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpened(true)}
          shadow="sm"
          radius="md"
          className="h-full relative group overflow-clip hover:cursor-pointer"
        >
          {props.isPin && (
            <b className="px-2 py-1 absolute top-0 w-full bg-secondary text-white flex flex-row z-10 rounded-t-md gap-2 items-center text-center justify-center">
              <span>Recommended by</span> <Logo className="w-8 h-8" />
            </b>
          )}
          <Image
            referrerPolicy="no-referrer"
            className={`w-full h-full ${isMobile ? "" : "group-hover:scale-110 transition-all ease-out duration-100"} object-cover`}
            src={data.thumbnail}
            fallbackSrc="https://img.vtuberthaiinfo.com/thumbnail_notfound.jpg"
          />
          <div
            className={`absolute bottom-0 h-48 w-full bg-gradient-to-t from-black ${isMobile ? "" : "group-hover:opacity-100 opacity-0 transition-all ease-out duration-100"}`}
          ></div>
          {data.talents?.length == 1 && (
            <div
              className={`flex items-end w-full gap-2 px-2 left-0 ${isMobile ? "bottom-2" : "group-hover:opacity-100 opacity-0 group-hover:bottom-2 bottom-0 transition-all ease-out duration-100"} absolute text-white`}
            >
              <div ref={ref}>
                <Link  href={`/talent/${data.talents[0].slug}`}>
                  <Image
                    referrerPolicy="no-referrer"
                    className={`w-12 h-12 object-cover rounded bg-white`}
                    src={data.talents.at(0)?.profileImgURL}
                    fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
                    alt={data.talents.at(0)?.name || ""}
                  />
                </Link>
              </div>
              <div className="flex-1 text-right text-2xl font-bold">
                <Link 
                  className={`${isMobile ? "" : "hover:underline"} ${hovered && !isMobile ? "underline" : ""}`}
                  href={`/talent/${data.talents[0].slug}`}
                >
                  {data.talents[0].name}
                </Link>
              </div>
            </div>
          )}
          {(data.talents?.length as number) > 1 && (
            <div
              className={`flex items-end w-full gap-2 px-2 left-0 ${isMobile ? "bottom-2" : "group-hover:opacity-100 opacity-0 group-hover:bottom-2 bottom-0 transition-all ease-out duration-100"} absolute text-white`}
            >
              {data.talents?.slice(0, 3).map((talent) => (
                <Link  href={`/talent/${talent.slug}`}>
                  <Tooltip
                    className="bg-primary/70 font-semibold"
                    label={talent.name}
                  >
                    <Image
                      referrerPolicy="no-referrer"
                      className={`w-12 h-12 object-cover rounded bg-white`}
                      src={talent.profileImgURL}
                      fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
                      alt={talent.name || ""}
                    />
                  </Tooltip>
                </Link>
              ))}
              {data.talents && data.talents.length >= 4 && (
                <span className="flex-1 text-right text-xl">
                  ...more +{data.talents.length - 3}
                </span>
              )}
            </div>
          )}
        </Paper>
      </AspectRatio>
    </Carousel.Slide>
  );
}
