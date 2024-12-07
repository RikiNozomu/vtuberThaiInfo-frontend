"use client";

import { VideoWithTalent } from "@/types";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Image } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconEye, IconPlayerPlay } from "@tabler/icons-react";
import { DateTime } from "luxon";
import { Link } from "@/components/link";
import numeral from "numeral";
import { Dispatch, SetStateAction } from "react";
import ReactPlayer from "react-player";
import { useIsMobile } from "@/hooks/useIsMobile";

type props = {
  data: VideoWithTalent;
  opened: boolean;
  fnOpened: Dispatch<SetStateAction<boolean>>;
};

export default function ModalVideoShort({ data, opened, fnOpened }: props) {
  const matches = useMediaQuery("(min-width: 620px)");
  const { isMobile } = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={() => {
        fnOpened(false);
      }}
      centered
      size="1024px"
      overlayProps={{
        backgroundOpacity: 0.75,
        blur: 3,
      }}
      classNames={{
        title: "w-full",
        body: "flex flex-col gap-4 flex-1 h-full",
        content: "flex flex-col h-full",
      }}
      title={
        <div
          className={`flex ${matches ? "gap-2 text-xl" : "flex-col text-sm"}`}
        >
          <div className={`flex items-center gap-2`}>
            <FontAwesomeIcon size="2x" icon={faYoutube} />
            <div className="bg-primary px-1.5 py-0.5 text-white font-bold rounded-xl flex items-center gap-1">
              <IconEye size={20} />
              {numeral(data.views).format("0,0")}
            </div>
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
        <Link 
          className="relative h-full flex flex-col items-center overflow-hidden"
          href={data.url || "#"}
          target="_blank"
        >
          <IconPlayerPlay
            className={`text-white w-24 h-24 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[1] opacity-70`}
          />
          <div className="bg-red-500 h-full aspect-[9/16] relative">
            <Image
              className="brightness-75 absolute h-full"
              src={data.thumbnail}
              referrerPolicy="no-referrer"
              fallbackSrc="https://img.vtuberthaiinfo.com/thumbnail_notfound.jpg"
            />
          </div>
        </Link>
      )}
      {!isMobile && data.url && (
        <div className="relative h-full flex flex-col items-center overflow-hidden">
          <div className="bg-red-500 h-full aspect-[9/16] relative">
            <ReactPlayer height="100%" width="100%" url={data.url} playing />
          </div>
        </div>
      )}
      <div className="flex flex-col-reverse ss:flex-col gap-2 ss:justify-center">
        <div className="flex flex-col gap-2">
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
        <b className="md:text-xl sm:text-lg text-base">{data.title}</b>
      </div>
    </Modal>
  );
}
