import { twMerge } from "tailwind-merge";
import { Button, Image } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

export default function VVP2024() {
  return (
    <div
      className={twMerge(
        "w-full h-fit relative overflow-clip flex flex-col items-center justify-center p-4 gap-4"
      )}
    >
      <Image
        className="absolute bottom-1/2 translate-y-1/2 left-1/2 -translate-x-1/2 brightness-[60%] h-[100%]"
        src="https://img.vtuberthaiinfo.com/vvp_bg.jpg"
      />

      <div className="flex flex-col gap-1 leading-none items-center text-white z-[1]">
        <b className="text-xl">Thina Borboleta</b>
        <span className="">Present</span>
      </div>

      <div className="flex sm:flex-row flex-col gap-4 items-center z-[1]">
        <Image
          className="sm:h-24 max-w-sm w-full"
          src="https://img.vtuberthaiinfo.com/vvp_logo.png"
        />
        <div className="flex flex-col gap-2 leading-none text-center">
          <b className="text-[#ff5e5e] sm:text-5xl text-4xl">
            Vtuber Valorant Party 2024
          </b>
          <span className="text-white">
            ศึกวาโลแรนต์ของเหล่า 80 วีไทยชื่อดัง
          </span>
        </div>
      </div>

      <b className="text-white sm:text-3xl text-2xl z-[1]">22-28 เมษายน 2024</b>

      <div className="grid sm:grid-cols-2 gap-4 sm:w-fit w-full z-[1]">
        <Button
          className="bg-primary text-white w-full"
          classNames={{ label: "flex flex-row gap-2 justify-center" }}
          component={Link}
          href="https://twitter.com/hashtag/VVP2024"
          target="_blank"
        >
          <FontAwesomeIcon size="xl" icon={faXTwitter} />
          <span>#VVP2024</span>
        </Button>
        <Button
          className="bg-red-500 text-white w-full"
          classNames={{ label: "flex flex-row gap-2 justify-center" }}
          component={Link}
          href="https://www.youtube.com/@ThinaBorboletaCh"
          target="_blank"
        >
          <span>สดทุกคู่ ที่</span>
          <FontAwesomeIcon size="xl" icon={faYoutube} />
          <span>Thina Borboleta Ch.</span>
        </Button>
      </div>
    </div>
  );
}
