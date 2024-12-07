import { getAnniversaries } from "@/actions";
import Base from "./base";

export default async function Anniversary() {
  const data = await getAnniversaries();
  return <Base data={data} />;
}
