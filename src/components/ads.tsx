"use client";

import { Adsense } from "@ctrl/react-adsense";
import { twMerge } from "tailwind-merge";
import { Logo } from "@/svg/Logo";
import GoogleAdUnit from "nextjs13_google_adsense";

export default function Ads(props: { className: string; slot: string }) {
  return (
    <div
      className={twMerge(
        `max-w-screen overflow-hidden flex justify-center items-center bg-primary md:text-xl text-sm text-slate-300`,
        props.className
      )}
    >
      <GoogleAdUnit>
        <ins
          className="adsbygoogle w-full h-full"
          style={{ display: "block" }}
          data-ad-client={process.env.NEXT_PUBLIC_AD_CLIENT!}
          data-ad-slot={props.slot}
        >
          <div className="p-4 show-unfilled w-full h-full flex justify-center items-center">
            <Logo className="h-full max-h-[180px]" />
          </div>
        </ins>
      </GoogleAdUnit>
    </div>
  );
}
