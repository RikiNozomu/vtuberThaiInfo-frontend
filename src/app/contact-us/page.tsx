import Ads from "@/components/ads";
import { Divider, Image } from "@mantine/core";
import { Metadata } from "next";
import { Logo } from "@/svg/Logo";
import SocialTag from "@/components/socialTag";
import { description, images } from "@/constants";
import Headline from "@/components/headline";
import Link from "next/link";

const title = "VtuberThaiInfo.com - ติดต่อทีมงาน | Contact Us";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  title,
  description,
  openGraph: {
    title,
    description,
    images,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images,
  },
  robots: "all",
};

export default async function ContactUs() {
  return (
    <div className="flex-1 flex flex-col text-primary items-center p-4 gap-4 container self-center bg-white">
      <Headline
        title={<h1 className="flex gap-2">ติดต่อทีมงาน (Contact us)</h1>}
      />
      <Ads
        className={"w-full max-w-[970px] h-[90px] text-xl aspect-square"}
        slot={"8662753725"}
      />
      <article className="w-full shadow-inner bg-primary/10 rounded-xl p-4 flex sm:flex-row flex-col">
        <div className="flex-1 flex w-full items-center flex-col gap-6">
          <div className="flex flex-col items-center">
            <div className="md:text-2xl text-[21px] pb-4 text-center">
              ช่องทางการติดต่อหลักของ{" "}
              <b>
                V<span className="text-red-500">T</span>i
              </b>
            </div>
            <Logo className="md:w-32 w-24 md:h-32 h-24" />
            <h2 className="text-2xl font-bold">
              VTUBER<span className="text-red-500">THAI</span>INFO
            </h2>
          </div>
          <div className="flex sm:flex-col flex-row gap-2 w-full justify-center">
            <SocialTag
              platform={"TWITTER"}
              classNames={{ root: "bg-black" }}
              text={"@VtuberThaiInfo"}
              url={"https://twitter.com/VtuberThaiInfo"}
            />
            <SocialTag
              platform={"YOUTUBE"}
              classNames={{ root: "bg-red-500" }}
              text={"@VtuberThaiInfo"}
              url={"https://www.youtube.com/@VtuberThaiInfo"}
            />
            <SocialTag
              platform={"TIKTOK"}
              classNames={{ root: "bg-black" }}
              text={"@vtuberthaiinfo"}
              url={"https://www.tiktok.com/@vtuberthaiinfo"}
            />
            <SocialTag
              platform={"FACEBOOK"}
              classNames={{ root: "bg-[#0766FE]" }}
              text={"VtuberThaiInfo"}
              url={"https://www.facebook.com/VtuberThaiInfo"}
            />
          </div>
        </div>
        <Divider
          className="mx-4 sm:block hidden"
          orientation="vertical"
          color="#1e4056"
          size={4}
        />
        <Divider className="my-4 sm:hidden block" color="#1e4056" size={4} />
        <div className="flex-1 flex w-full items-center flex-col gap-6">
          <Link className="flex flex-col items-center" href={"/talent/riki"}>
            <div className="text-2xl pb-4 text-center">ผู้จัดทำเว็บไซด์</div>
            <Image
              src={"/img/my_img.jpeg"}
              className="md:w-32 w-24 md:h-32 h-24 rounded-full aspect-square bg-[#995399] text-white md:text-7xl text-5xl font-bold flex justify-center items-center"
            />
            <h2 className="text-2xl">
              <b className="text-[#995399]">RIKI</b> Nozomu
            </h2>
          </Link>
          <div className="flex sm:flex-col flex-row gap-2 w-full justify-center">
            <SocialTag
              platform={"YOUTUBE"}
              classNames={{ root: "bg-red-500" }}
              text={"@RikiVTH"}
              url={"https://www.youtube.com/@RikiVTH"}
            />
            <SocialTag
              platform={"TIKTOK"}
              classNames={{ root: "bg-black" }}
              text={"@RikiVTH"}
              url={"https://www.tiktok.com/@RikiVTH"}
            />
            <SocialTag
              platform={"FACEBOOK"}
              classNames={{ root: "bg-[#0766FE]" }}
              text={"RikiVTH"}
              url={"https://www.facebook.com/RikiVTH"}
            />
            <SocialTag
              platform={"TWITTER"}
              classNames={{ root: "bg-black" }}
              text={"@RikiVTH"}
              url={"https://x.com/RikiVTH"}
            />
          </div>
        </div>
      </article>
    </div>
  );
}
