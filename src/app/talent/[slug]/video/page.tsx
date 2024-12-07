import { getTalent } from "@/actions";
import TalentVideoClientComponent from "./client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { description } from "@/constants";

type props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: props): Promise<Metadata> {
  const { data } = await getTalent(params.slug);
  const title = "VtuberThaiInfo.com - วีดีโอทั้งหมดของ " + data?.name
  const images = process.env.NEXT_PUBLIC_BASE_URL + "/api/og/talent/" + data?.slug
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
    title,
    description : data?.bio ? data?.bio : description,
    openGraph: {
      title,
      description : data?.bio ? data?.bio : description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description : data?.bio ? data?.bio : description,
      images,
    },
    robots: "all",
  }
}

export default async function TalentVideo({ params }: props) {
  const { data } = await getTalent(params.slug);
  if(!data){
    notFound()
  }
  return (
    <div className="px-4 pb-4 h-full">
      <TalentVideoClientComponent slug={params.slug} />
    </div>
  );
}
