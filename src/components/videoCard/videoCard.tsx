"use client";

import { VideoWithTalent } from "@/types";
import { faTwitch, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Image, Modal, Tooltip } from "@mantine/core";
import { useDisclosure, useHover, useMediaQuery } from "@mantine/hooks";
import { IconEye, IconPlayerPlay } from "@tabler/icons-react";
import { DateTime } from "luxon";
import { Link } from "@/components/link";
import numeral from "numeral";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { motion } from "framer-motion";
import { sendGTMEvent } from "@next/third-parties/google";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function VideoCard(props: { data: VideoWithTalent }) {
  const data = props.data;
  const [timeCount, setTimeCount] = useState(0);
  const [liveTime, setLiveTime] = useState("0:00");
  const { isMobile } = useIsMobile();
  const { hovered, ref } = useHover();
  const [opened, { open, close }] = useDisclosure(false);
  const { hovered: hoveredTxt, ref: refTxt } = useHover();
  const matches = useMediaQuery("(min-width: 620px)");

  useEffect(() => {
    let interval: any = null;
    if (data.status == "LIVE" && data.datetime) {
      setTimeCount(
        Math.abs(
          Math.floor(
            DateTime.fromSQL(data.datetime).diffNow(["seconds"]).seconds
          )
        )
      );
      interval = setInterval(() => {
        if (data.datetime) {
          setTimeCount(
            Math.abs(
              Math.floor(
                DateTime.fromSQL(data.datetime).diffNow(["seconds"]).seconds
              )
            )
          );
        }
      }, 1000);
      return () => clearInterval(interval);
    } else if (data.status == "FINISHED" || data.status == "UNAVAILABLE") {
      setTimeCount(data.durations || 0);
    }
  }, []);

  useEffect(() => {
    const min = Math.floor((timeCount % 3600) / 60);
    const sec = Math.floor(timeCount % 60);
    setLiveTime(
      (timeCount >= 3600 ? `${Math.floor(timeCount / 3600)}:` : ``) +
        (min >= 10 || timeCount < 3600 ? `${min}:` : `0${min}:`) +
        (sec >= 10 ? `${sec}` : `0${sec}`)
    );
  }, [timeCount]);

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
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className=" bg-white rounded-md overflow-hidden w-full gap-2 flex flex-col pb-2"
    >
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="1024px"
        overlayProps={{
          backgroundOpacity: 0.75,
          blur: 3,
        }}
        classNames={{ title: "w-full", body: "flex flex-col gap-2" }}
        title={
          <div
            className={`flex ${matches ? "gap-2 text-xl" : "flex-col text-sm"}`}
          >
            <div className={`flex items-center gap-2`}>
              {data.platform == "YOUTUBE" && (
                <FontAwesomeIcon size="2x" icon={faYoutube} />
              )}
              {data.platform == "TWITCH" && (
                <FontAwesomeIcon size="2x" icon={faTwitch} />
              )}
              {data.status == "LIVE" && (
                <div className="bg-red-500 px-1.5 py-0.5 text-white font-bold rounded-xl flex items-center gap-1">
                  LIVE | {liveTime} | <IconEye size={20} />
                  {numeral(data.views).format("0,0")}
                </div>
              )}
              {data.status == "UPCOMING" && (
                <div className="bg-primary px-1.5 py-0.5 text-white font-bold rounded-xl flex items-center gap-1">
                  UPCOMING
                </div>
              )}
              {data.status == "FINISHED" && (
                <div className="bg-primary px-1.5 py-0.5 text-white font-bold rounded-xl flex items-center gap-1">
                  {liveTime} | <IconEye size={20} />
                  {numeral(data.views).format("0,0")}
                </div>
              )}
            </div>
            {data.datetime && (
              <span
                className={`items-center flex flex-1 ${matches ? "justify-end" : ""}`}
              >
                {DateTime.fromSQL(data.datetime)
                  .setZone(process.env.NEXT_PUBLIC_TIMEZONE)
                  .setLocale("th-TH")
                  .toFormat("DD T")}
              </span>
            )}
          </div>
        }
      >
        {(isMobile || !data.url) && (
          <Link  className="relative" href={data.url || "#"} target="_blank">
            <IconPlayerPlay
              className={`text-white w-36 h-36 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[1] opacity-70`}
            />
            <Image
              className="aspect-video brightness-75"
              src={data.thumbnail}
              referrerPolicy="no-referrer"
              fallbackSrc="https://img.vtuberthaiinfo.com/thumbnail_notfound.jpg"
            />
          </Link>
        )}
        {!isMobile && data.url && (
          <div className="w-full aspect-video">
            <ReactPlayer
              height="100%"
              width="100%"
              url={data.url}
              playing
              controls
            />
          </div>
        )}
        <b className="md:text-xl sm:text-lg text-base">{data.title}</b>
        <Divider size={"md"} />
        <div className="flex flex-wrap gap-2">
          {data.talents?.map((talent, index) => (
            <Link 
              key={index}
              className="group flex gap-1 items-center"
              href={`/talent/${talent.slug}`}
            >
              <Image
                referrerPolicy="no-referrer"
                className={`sm:w-14 w-10 sm:h-14 h-10 object-cover rounded shadow bg-white`}
                src={talent.profileImgURL}
                fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
                alt={talent.name || ""}
              />
              <span className="group-hover:underline sm:text-2xl text-lg">
                {talent.name}
              </span>
            </Link>
          ))}
        </div>
      </Modal>
      <div
        ref={ref}
        className="w-full h-fit relative peer hover:cursor-pointer"
      >
        <IconPlayerPlay
          onClick={open}
          className={`text-white w-36 h-36 ${(hovered || hoveredTxt) && !isMobile ? "opacity-50 scale-110" : "opacity-0"} absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[1] transition-all ease-out duration-100`}
        />
        <Image
          onClick={open}
          src={data.thumbnail}
          className={`${(hovered || hoveredTxt) && !isMobile ? "brightness-50" : ""} aspect-video w-full transition-all ease-out duration-100`}
          referrerPolicy="no-referrer"
          fallbackSrc="https://img.vtuberthaiinfo.com/thumbnail_notfound.jpg"
        />
        {/* LIVE */}
        {data.status == "LIVE" && (
          <div className="absolute right-2 bottom-2 bg-red-500/70 py-0.5 pl-1 pr-1.5 text-white text-sm font-semibold rounded-xl flex items-center gap-0.5">
            <IconEye size={20} />
            {numeral(data.views).format("0,0")}
          </div>
        )}
        {data.status == "LIVE" && (
          <div className="absolute left-2 top-2 bg-red-500 px-1.5 py-0.5 text-white font-bold rounded-xl flex items-center">
            LIVE | {liveTime}
          </div>
        )}

        {/* UPCOMING */}
        {data.status == "UPCOMING" && (
          <div className="absolute left-2 top-2 bg-white px-1.5 py-0.5 text-primary font-bold rounded-xl flex items-center">
            UPCOMING
          </div>
        )}

        {/* FINISHED */}
        {data.status == "FINISHED" && data.durations > 0 && (
          <div className="absolute left-2 top-2 bg-primary px-1.5 py-0.5 text-white font-bold rounded-xl flex items-center">
            {liveTime}
          </div>
        )}
        {data.status == "FINISHED" && (
          <div className="absolute right-2 bottom-2 bg-primary py-0.5 pl-1 pr-1.5 text-white text-sm font-semibold rounded-xl flex items-center gap-0.5">
            <IconEye size={20} />
            {numeral(data.views).format("0,0")}
          </div>
        )}
      </div>
      <b
        onClick={open}
        ref={refTxt}
        title={`${data.title}`}
        className={`line-clamp-3 break-words px-2 overflow-clip min-h-[72px] hover:cursor-pointer ${isMobile ? "" : "hover:underline peer-hover:underline"}`}
      >
        {data.title}
      </b>
      <div className="flex gap-1 px-2">
        <div className="flex-1 flex gap-1 items-center group hover:cursor-pointer">
          {data.talents?.slice(0, 3).map((talent, index) => (
            <Link  key={index} href={`/talent/${talent.slug}`}>
              <Tooltip
                className="bg-primary/70 font-semibold"
                label={talent.name}
                disabled={(data.talents?.length as number) == 1}
              >
                <Image
                  referrerPolicy="no-referrer"
                  className={`w-10 h-10 object-cover rounded bg-white`}
                  src={talent.profileImgURL}
                  fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
                  alt={talent.name || ""}
                />
              </Tooltip>
            </Link>
          ))}
          {(data.talents?.length as number) == 1 && (
            <Link 
              className={`${isMobile ? "" : "group-hover:underline"} line-clamp-1`}
              href={`/talent/${data.talents?.at(0)?.slug}`}
            >
              {data.talents?.at(0)?.name}
            </Link>
          )}
          {(data.talents?.length as number) >= 4 && (
            <div className="w-10 h-10 flex justify-center items-center bg-primary/50 text-white rounded">
              +{(data.talents?.length as number) - 3}
            </div>
          )}
        </div>
        {data.datetime && (
          <div className="flex flex-col text-right ss:text-sm text-xs text-slate-500 justify-end">
            <span>
              {DateTime.fromSQL(data.datetime)
                .setZone(process.env.NEXT_PUBLIC_TIMEZONE)
                .setLocale("th-TH")
                .toFormat("DD")}
            </span>
            <span>
              {DateTime.fromSQL(data.datetime)
                .setZone(process.env.NEXT_PUBLIC_TIMEZONE)
                .setLocale("th-TH")
                .toFormat("T")}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
