export const revalidate = 900

import Ads from "@/components/ads";
import { Divider } from "@mantine/core";
import { Link } from "@/components/link";
import numeral from "numeral";
import { Metadata } from "next";
import { description, images } from "@/constants";
import Headline from "@/components/headline";

const title = "VtuberThaiInfo.com - สนับสนุนเว็บไซด์ | Support Us";

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

const getDonators = async () => {
  try {
    const res = await fetch(`${process.env.STREAMLAB_API_URL}?limit=9999`, {
      headers: {
        Authorization: "Bearer " + process.env.STREAMLAB_ACCESS_TOKEN,
        Accept: "application/json",
      },
    });
    return res.ok
      ? ((await res.json()) as {
          data: {
            donation_id: number;
            created_at: number;
            currency: string;
            amount: number;
            name: string;
            message: string | null;
            email: string | null;
          }[];
        })
      : { data: [] };
  } catch (error) {
    return { data: [] };
  }
};

export default async function Privacy() {
  const data = await getDonators();

  return (
    <div className="flex flex-col text-primary items-center p-4 gap-4 container self-center bg-white">
      <Headline
        title={<h1 className="flex gap-2">สนับสนุนเว็บไซด์ (Support us)</h1>}
      />
      <Ads
        className={
          "w-full max-w-[970px] h-[90px] text-xl"
        }
        slot={"8897228456"}
      />
      <article className="prose max-w-full shadow-inner bg-primary/10 rounded-xl p-4 text-center">
        <p className="md:my-2 my-4">
          ทาง <b>VtuberThaiInfo</b>{" "}
          ขอขอบคุณทุกๆท่านที่เข้ามาเยี่ยมชมเว็บไซด์ของเรามาโดยตลอดมาและยินดีอย่างยิ่งที่ทุกๆท่านยังสามารถเข้ามาใช้เว็บไซด์นี้{" "}
          <u>โดยไม่มีค่าใช้จ่ายใดๆในการเข้าเยี่ยมชมเว็บไซด์</u>
        </p>
        <p className="md:my-2 my-4">
          แต่ต้องเรียนตามความเป็นจริงว่าเว็บไซด์นี้{" "}
          <u>มีค่าใช้จ่ายในการจัดเว็บไซด์และทำระบบภายในทั้งหมด</u>
        </p>
        <p className="md:my-2 my-4">
          ทาง VtuberThaiInfo จึงทำการเปิดช่องทางในการสนับสนุนเว็บไซด์ของเรา
          ตามช่องทางข้างล่างนี้
        </p>
        <div className="flex md:flex-row flex-col items-center justify-center w-full gap-4">
          <Link  target="_blank" href={"https://tipme.in.th/vtuberthaiinfo"}>
            <img className="w-full m-0" src="https://img.vtuberthaiinfo.com/donate-tipme-v2.jpg" />
          </Link>
        </div>
        <div className="py-4">
          <Divider size={2} />
        </div>
        <div className="flex w-full justify-center">
          <div className="flex flex-col w-full max-w-3xl border-2 border-primary rounded overflow-clip">
            <div className="w-full bg-primary p-2 text-xl text-white text-center font-bold">
              รายชื่อผู้สนับสนุนเว็บไซด์
            </div>
            <div className="flex flex-col w-full divide-y-2 divide-primary">
              {data.data?.map((item) => (
                <div key={item.donation_id} className="flex px-2">
                  <b className="flex-1 text-left">{item.name}</b>
                  <span className="">
                    {numeral(item.amount).format("0,0[.]00")}{" "}
                    {item.currency == "THB" ? "บาท" : item.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
