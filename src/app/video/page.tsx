import { Metadata } from "next";
import VideoClientComponent from "./cilent";
import { description, images } from "@/constants";
import { getPinVideos } from "@/actions";
const title = "VtuberThaiInfo.com - วีดีโอ | Videos";

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

export default async function Video() {

  const pinVideo = await getPinVideos()

  return (
    <div className="flex-1 flex justify-center">
      <VideoClientComponent pinVideoTalentIds={pinVideo.talentIds} pinVideoVideoIds={pinVideo.videoIdsList}/>
    </div>
  );
}
