import Ads from "@/components/ads";
import Headline from "@/components/headline";
import { Suspense } from "react";
import Loading from "@/components/resultTalent/loading";
import ResultTalents from "../../components/resultTalent";
import { Metadata } from "next";
import { description, images } from "@/constants";

const title =
  "VtuberThaiInfo.com - วีทูปเบอร์ไทยทั้งหมด | All Talents of Thai Vtuber";

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

export default async function Talent() {
  return (
    <div className="flex-1 flex justify-center">
      <div className="container bg-white p-2 items-center flex flex-col gap-4">
        <Headline
          title={<h1 className="flex gap-2">วีทูปเบอร์ไทยทั้งหมด</h1>}
        />
        <Ads
          className={
            "w-full max-w-[970px] h-[90px] text-xl"
          }
          slot={"9213418069"}
        />
        <Suspense fallback={<Loading />}>
          <ResultTalents />
        </Suspense>
      </div>
    </div>
  );
}
