import Base from "./base";
import { getAffiliates } from "@/actions";

export default async function AffiliatesCarousel() {
  const affiliates = await getAffiliates();
  return <Base datas={affiliates} />;
}
