import { getAffiliates, getTalents } from "@/actions";
import Base from "./base";

export default async function ResultTalents() {
  const talents = await getTalents();
  const affiliates = await getAffiliates();

  return <Base datas={{ talents: talents, affiliates: affiliates }} />;
}
