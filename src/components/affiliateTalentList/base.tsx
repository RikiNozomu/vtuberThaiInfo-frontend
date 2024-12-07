"use client";

import { TalentCardType } from "@/types";
import {
  Checkbox,
  Group,
  Loader,
  LoaderFactory,
  PartialVarsResolver,
  Radio,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useListState, useToggle } from "@mantine/hooks";
import { IconBrandTwitch, IconBrandYoutubeFilled } from "@tabler/icons-react";
import TalentCard from "../talentCard";

type props = {
  talents: TalentCardType[];
  isIndependent: boolean;
};

export default function Base({
  talents,
  isIndependent = false
}: props) {
  const [amount, setAmout] = useState(20);
  const [order, setOrder] = useToggle(["alphabet", "subs", "views", "twitch"]);
  const [type, handlersType] = useListState(["TWO_D", "THREE_D", "PNG"]);
  const [status, handlersStatus] = useListState([
    "ACTIVE",
    "RETIRED",
    "INACTIVE_AS_VTUBER",
  ]);
  const [transferStatus, handlersTransferStatus] = useListState([
    "ACTIVE",
    "INACTIVE",
  ]);

  const [transferFiltered, setTransferFiltered] = useState(talents);

  const itemPerPage = 20;
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  const varsResolver: PartialVarsResolver<LoaderFactory> = (theme, props) => {
    return {
      root: {
        "--loader-color": "#1f4056",
      },
    };
  };

  useEffect(() => {
    if (inView) {
      setAmout(amount + itemPerPage);
    }
  }, [inView]);

  useEffect(() => {
    const filterd = talents
      .filter((talent) => {
        // type
        let isShow = false;
        if (!talent.type) {
          return status;
        }
        for (const ty of talent.type) {
          if (type.includes(ty.toString())) {
            isShow = true;
            break;
          }
        }
        if (!isShow) {
          return false;
        }

        // talent status
        if (!talent.statusType) {
          return false;
        }
        if (!status.includes(talent.statusType)) {
          return false;
        }

        // talent transfer status
        if (
          talent.isActive &&
          talent.statusType == "ACTIVE" &&
          !transferStatus.includes("ACTIVE")
        ) {
          return false;
        }
        if (
          (!talent.isActive || talent.statusType != "ACTIVE") &&
          !transferStatus.includes("INACTIVE")
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (order) {
          case "subs":
            return (b.youtubeMain?.subs || 0) - (a.youtubeMain?.subs || 0);
          case "views":
            return (b.youtubeMain?.views || 0) - (a.youtubeMain?.views || 0);
          case "twitch":
            return (b.twitchMain?.subs || 0) - (a.twitchMain?.subs || 0);
          default:
            return (a.name || "").localeCompare(`${b.name}`, "th", {
              sensitivity: "base",
            });
        }
      });

    /*const total = Math.floor(filterd.length / 19);
    for (let i = 1; i <= total; i++) {
      filterd.splice(i * 19 + (i - 1), 0, {
        name: "โฆษณาสนับสนุนเว็บไซด์",
        slug: "6375485826",
        type: [],
        statusType: "ADS",
      });
    }*/
    setTransferFiltered(filterd);
    setAmout(20);
  }, [type, status, transferStatus, order]);

  return (
    <div className="flex flex-col divide-y-2 divide-primary w-full items-center">
      <div className="grid md:grid-cols-3 gap-4 pb-4">
        <Checkbox.Group
          label="รูปแบบ"
          classNames={{ label: "font-bold text-lg" }}
          className="py-2 px-4 bg-primary/20 rounded"
          value={type}
          onChange={(value: string[]) => handlersType.setState(value)}
        >
          <Group mt="xs" gap={8}>
            <Checkbox value="TWO_D" label="2D" />
            <Checkbox value="THREE_D" label="3D" />
            <Checkbox value="PNG" label="PNG" />
          </Group>
        </Checkbox.Group>
        <div className="py-2 px-4 bg-primary/20 rounded flex flex-col gap-6">
          {isIndependent && (
            <Checkbox.Group
              label="สถานะวีทูปเบอร์"
              className=""
              classNames={{ label: "font-bold text-lg" }}
              value={status}
              onChange={(value: string[]) => handlersStatus.setState(value)}
            >
              <Group mt="xs" gap={8}>
                <Checkbox value="ACTIVE" label="วีทูปเบอร์" />
                <Checkbox value="RETIRED" label="ยุติบทบาท" />
                <Checkbox
                  value="INACTIVE_AS_VTUBER"
                  label="พักการเป็นวีทูปเบอร์"
                />
              </Group>
            </Checkbox.Group>
          )}
          {!isIndependent && (
            <Checkbox.Group
              label="สถานะการเป็นสมาชิก"
              className=""
              classNames={{ label: "font-bold text-lg" }}
              value={transferStatus}
              onChange={(value: string[]) =>
                handlersTransferStatus.setState(value)
              }
            >
              <Group mt="xs" gap={8}>
                <Checkbox value="ACTIVE" label="สมาชิกปัจจุบัน" />
                <Checkbox
                  value="INACTIVE"
                  label="อดีตสมาชิก/ยุติบทบาทวีทูปเบอร์"
                />
              </Group>
            </Checkbox.Group>
          )}
        </div>

        <Radio.Group
          label="ลำดับตาม"
          value={order}
          onChange={(value: string) => setOrder(value)}
          className="py-2 px-4 bg-primary/20 rounded"
          classNames={{ label: "font-bold text-lg" }}
        >
          <Group mt="xs" gap={8}>
            <Radio
              classNames={{ body: "items-center gap-2", label: "px-0" }}
              value="alphabet"
              label={
                <div className="flex items-center gap-1">เรียงตามตัวอักษร</div>
              }
            />
            <Radio
              classNames={{ body: "items-center gap-2", label: "px-0" }}
              value="subs"
              label={
                <div className="flex items-center gap-1">
                  <IconBrandYoutubeFilled /> ผู้ติดตาม
                </div>
              }
            />
            <Radio
              classNames={{ body: "items-center gap-2", label: "px-0" }}
              value="views"
              label={
                <div className="flex items-center gap-1">
                  <IconBrandYoutubeFilled /> ยอดเข้าชม
                </div>
              }
            />
            <Radio
              classNames={{ body: "items-center gap-2", label: "px-0" }}
              value="twitch"
              label={
                <div className="flex items-center gap-1">
                  <IconBrandTwitch />
                </div>
              }
            />
          </Group>
        </Radio.Group>
      </div>
      <div className="grid xl:grid-cols-5 lg:grid-cols-4 sm:grid-cols-3 ss:grid-cols-2 gap-4 pb-12 items-center pt-4">
        {transferFiltered.slice(0, amount).map((item, index) => (
          <TalentCard
            isActive={
              isIndependent ||
              ((item.isActive as boolean) && item.statusType == "ACTIVE")
            }
            className="ss:max-w-none max-w-[240px] ss:h-full"
            key={index}
            talent={item}
            Tag={"h3"}
            searchTerm={""}
            searchWhere={"affiliate-" + item.slug}
          />
        ))}
        {amount < transferFiltered.length && (
          <div
            ref={ref}
            className="h-[200px] xl:col-span-5 lg:col-span-4 sm:col-span-3 ss:col-span-2 w-full flex items-center justify-center"
          >
            <Loader vars={varsResolver} size="xl" type="bars" />
          </div>
        )}
      </div>
    </div>
  );
}
