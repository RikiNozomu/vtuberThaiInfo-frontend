import Base from "./base";
import { getTalentsByAffiliateId } from "@/actions";

type props = {
  affiliateId?: number;
  slug?: string;
};

export default async function AffiliateTalentList({
  affiliateId = -1,
  slug = "independent",
}: props) {
  const talents = (await getTalentsByAffiliateId(affiliateId)).sort((a, b) =>
    (a.name || "").localeCompare(`${b.name}`, "th", { sensitivity: "base" }),
  );
  return <Base talents={talents} isIndependent={slug == "independent"} />;
}
