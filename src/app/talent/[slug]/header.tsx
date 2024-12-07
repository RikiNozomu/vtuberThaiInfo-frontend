import { TalentFull } from "@/types";
import { Button, Image } from "@mantine/core";
import { getTalentImageUrl } from "@/utils";
import Ads from "@/components/ads";
import TalentEditButton from "@/components/editModal/button/talent";
import { Suspense } from "react";
import { IconEdit } from "@tabler/icons-react";

type props = {
  talent: TalentFull;
};

export default function Header({ talent }: props) {
  const profileImgUrl = getTalentImageUrl(talent);

  return (
    <div
      id="name-header"
      className="z-[1] text-white py-6 relative container grid xl:grid-cols-2 gap-4 items-center justify-center"
    >
      <div className="absolute left-[50%] -translate-x-[50%] top-[50%] -translate-y-[49%] whitespace-nowrap font-bold text-white/20 text-[330px] uppercase select-none -z-10">
        {talent.nameHeadline}
      </div>
      <div className="flex xl:flex-row flex-col gap-4 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            referrerPolicy="no-referrer"
            className="max-w-[200px] max-h-[200px] w-full rounded-3xl aspect-square bg-white"
            src={profileImgUrl}
            fallbackSrc="https://img.vtuberthaiinfo.com/people_notfound.png"
            alt={talent.name || ""}
          />
          <Suspense
            fallback={
              <Button loading className="bg-secondary text-xl gap-2">
                <IconEdit />
                แก้ไขข้อมูล
              </Button>
            }
          >
            <TalentEditButton talentId={talent.id} />
          </Suspense>
        </div>

        <h1 className="flex-1 shrink-0 flex flex-col sm:text-3xl text-lg sm:gap-1 justify-center xl:min-h-[200px] break-keep">
          {talent.firstName && (
            <div
              className={`${talent.bigName == "FIRST" ? "sm:text-6xl text-3xl font-bold" : ""} xl:text-left text-center `}
            >
              {talent.firstName}
            </div>
          )}
          {talent.middleName && (
            <div
              className={`${talent.bigName == "MIDDLE" ? "sm:text-6xl text-3xl font-bold" : ""} xl:text-left text-center `}
            >
              {talent.middleName}
            </div>
          )}
          {talent.lastName && (
            <div
              className={`${talent.bigName == "LAST" ? "sm:text-6xl text-3xl font-bold" : ""} xl:text-left text-center `}
            >
              {talent.lastName}
            </div>
          )}
        </h1>
      </div>
      <Ads
        className={
          "w-full max-w-[728px] xl:h-[200px] h-[90px] bg-slate-50 text-primary"
        }
        slot={"1641022138"}
      />
    </div>
  );
}
