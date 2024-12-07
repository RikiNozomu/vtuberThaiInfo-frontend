import Ads from "@/components/ads";
import Headline from "@/components/headline";
import AffiliateCard from "@/components/affiliateCard";
import { getAffiliates } from "@/actions";
import { Metadata } from "next";
import { description, images } from "@/constants";

const title = "VtuberThaiInfo.com - ค่ายวีทูปเบอร์ไทย | Affiliates of Thai Vtuber"

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

export default async function Affiliate() {
  // get db
  const affiliates = await getAffiliates();
  return (
    <div className="flex-1 flex justify-center">
      <div className="container bg-white p-2 items-center flex flex-col gap-4">
        <Headline
          title={
            <h1 className="flex gap-2">สังกัดและกลุ่มวีทูปเบอร์ไทยทั้งหมด</h1>
          }
        />
        <Ads
          className={
            "w-full max-w-[970px] h-[90px] text-xl"
          }
          slot={"1908314122"}
        />
        <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4 pb-4">
          {affiliates.map((affiliate, index) => (
            <AffiliateCard className="md:max-w-none max-w-[240px] ss:h-full" key={index} affiliate={affiliate} />
          ))}
        </div>
      </div>
    </div>
  );
}
