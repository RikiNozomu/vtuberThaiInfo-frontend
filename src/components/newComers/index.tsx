import { getLatestTalents } from "@/actions";
import CarouselTalents from "./carouselTalents";
import { TalentWithChannel } from "@/types";

export default async function NewCommer() {
  const latestTalents = await getLatestTalents();
  return <CarouselTalents talents={latestTalents as TalentWithChannel[]} />;
}
