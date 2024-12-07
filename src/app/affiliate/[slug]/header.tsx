"use client";

import { AffiliateFull } from "@/types";
import { Button, Image } from "@mantine/core";
import Ads from "@/components/ads";
import { IconEdit } from "@tabler/icons-react";
import { useState } from "react";
import AffiliateEditModal from "@/components/editModal/affiliate";

type props = {
  affiliate: AffiliateFull | null | undefined;
};

export default function Header({ affiliate }: props) {
  const [opened, setOpened] = useState(false);

  return (
    <div
      id="name-header"
      className="z-[1] text-white py-6 relative container grid xl:grid-cols-2 gap-4 items-center justify-center"
    >
      {affiliate?.id && (
        <AffiliateEditModal
          affiliate={affiliate}
          opened={opened}
          onClose={() => setOpened(false)}
        />
      )}
      <div className="absolute left-[50%] -translate-x-[50%] top-[50%] -translate-y-[49%] whitespace-nowrap font-bold text-white/20 text-[330px] uppercase select-none -z-10">
        {affiliate?.nameHeadline}
      </div>
      <div className="flex xl:flex-row flex-col gap-4 items-center justify-center">
        {affiliate?.profileImgURL && (
          <div className="flex flex-col items-center gap-4">
            <Image
              className="max-w-[200px] max-h-[200px] w-full rounded-3xl aspect-square bg-white"
              src={affiliate?.profileImgURL}
              fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
              alt={affiliate.name || ""}
            />
            <Button
              onClick={() => setOpened(true)}
              className="bg-secondary text-xl gap-2"
            >
              <IconEdit />
              แก้ไขข้อมูล
            </Button>
          </div>
        )}
        <div className="flex-1 shrink-0 flex flex-col sm:text-3xl text-lg break-all justify-center xl:min-h-[200px] gap-2 items-center xl:items-start">
          <h1
            className={`sm:text-6xl text-3xl font-bold xl:text-left text-center break-keep`}
          >
            {affiliate?.name}
          </h1>
          {!affiliate?.profileImgURL && affiliate?.slug != 'independent' && <Button
            onClick={() => setOpened(true)}
            className="bg-secondary text-xl gap-2 w-fit"
          >
            <IconEdit />
            แก้ไขข้อมูล
          </Button>}
        </div>
      </div>
      <Ads
        className={
          "w-full max-w-[728px] xl:h-[200px] h-[90px] bg-slate-50 text-primary"
        }
        slot={"3173008922"}
      />
    </div>
  );
}
