import { getAffiliates, getTalentsOnly } from "@/actions";
import { MetadataRoute } from "next";

type Metadata = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const talents = await getTalentsOnly();
  const affiliates = await getAffiliates();
  const hostname = "https://vtuberthaiinfo.com";

  const talentDatas = talents.map((talent) => ({
    url: `${hostname}/talent/${talent.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  })) as Metadata[];

  const affiliateDatas = affiliates.map((affiliate) => ({
    url: `${hostname}/affiliate/${affiliate.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  })) as Metadata[];

  return [
    {
      url: `${hostname}`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${hostname}/video`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.5,
    },
    {
      url: `${hostname}/talent`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${hostname}/affiliate`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${hostname}/support-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${hostname}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${hostname}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.1,
    },
    {
      url: `${hostname}/cookie`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.1,
    },
    ...talentDatas,
    ...affiliateDatas
  ];
}
