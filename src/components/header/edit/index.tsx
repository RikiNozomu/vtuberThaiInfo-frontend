import Base from "./base";
import { getAffiliates } from "@/actions";

export default async function EditMenu() {
  const affiliate = await getAffiliates();
  return <Base affiliates={affiliate} />;
}
