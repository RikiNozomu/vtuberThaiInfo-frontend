"use client";

import {
  Checkbox,
  CloseButton,
  Group,
  Loader,
  LoaderFactory,
  PartialVarsResolver,
  Radio,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue, useListState, useToggle } from "@mantine/hooks";
import { IconBrandTwitch, IconBrandYoutubeFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { AffiliateMultiSelect } from "../affiliateSelect";
import { TalentCardType } from "@/types";
import { TalentType, affiliate } from "../../../drizzle/schema";
import { useInView } from "react-intersection-observer";
import TalentCard from "@/components/talentCard";
import { sendGTMEvent } from "@next/third-parties/google";
import { Logo } from "@/svg/Logo";

type props = {
  datas: {
    talents: TalentCardType[];
    affiliates: (typeof affiliate.$inferSelect)[];
  };
};

export default function Base({ datas }: props) {
  const [amount, setAmout] = useState(20);
  const [order, setOrder] = useToggle(["id", "subs", "views", "twitch"]);
  const [type, handlersType] = useListState(["TWO_D", "THREE_D", "PNG"]);
  const [status, handlersStatus] = useListState(["ACTIVE", "RETIRED"]);
  const [value, setValue] = useState("");
  const [affiliates, setAffiliates] = useState<string[]>([]);
  const [keyword] = useDebouncedValue(value, 500);

  const [transferFiltered, setTransferFiltered] = useState(datas.talents);
  const [isMounted, setIsMounted] = useState(false);

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
    const filterd = datas.talents
      .filter((talent) => {
        // type
        let isShow = false;
        if (!type.length) {
          return false;
        }
        for (const ty of talent.type as TalentType[]) {
          if (type.includes(ty.toString())) {
            isShow = true;
            break;
          }
        }
        if (!isShow) {
          return false;
        }

        // talent status

        if (!status.length) {
          return false;
        }
        if (!status.includes(talent.statusType || "")) {
          return false;
        }

        // name filter
        if (
          keyword.length &&
          !talent.name
            ?.toLocaleLowerCase()
            .includes(keyword.toLocaleLowerCase())
        ) {
          return false;
        }

        // affiliate filter
        if (affiliates.length) {
          isShow = false;
          for (const affiliate of affiliates) {
            if (
              affiliate == "-1" &&
              !talent.transfers?.filter((x) => x.affiliateId)?.length
            ) {
              isShow = true;
              break;
            } else if (
              talent.transfers?.findIndex(
                (item) => item.affiliateId?.toString() == affiliate
              ) != -1
            ) {
              isShow = true;
              break;
            }
          }
          if (!isShow) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (order) {
          case "subs":
            return (b?.youtubeMain?.subs || 0) - (a?.youtubeMain?.subs || 0);
          case "views":
            return (b?.youtubeMain?.views || 0) - (a?.youtubeMain?.views || 0);
          case "twitch":
            return (b?.twitchMain?.subs || 0) - (a?.twitchMain?.subs || 0);
          case "id":
            return (b?.id || 0) - (a?.id || 0);
          default:
            return (a?.name || "").localeCompare(`${b?.name}`, "th", {
              sensitivity: "base",
            });
        }
      });

    if (keyword.trim().length) {
      sendGTMEvent({
        event: "search",
        search_term: keyword.trim(),
        where: "talent-list",
      });
    }

    /*const total = Math.floor(filterd.length / 99)
    for (let i = 1; i <= total; i++) {
      filterd.splice((i*99)+(i-1), 0, {
        name: "โฆษณาสนับสนุนเว็บไซด์",
        slug: "6375485826",
        type: [],
        statusType: "ADS"
      })
    }*/

    setTransferFiltered(filterd);
    setAmout(20);
    setIsMounted(true);
  }, [order, type, status, keyword, affiliates]);

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <div className="sm:grid flex flex-col sm:grid-cols-3 gap-4 w-full">
        <TextInput
          className="p-4 bg-primary/20 rounded"
          value={value}
          label="ชื่อวีทูปเบอร์ที่ต้องการค้นหา"
          placeholder="กรุณาพิมพ์ชื่อวีทูปเบอร์เพื่อค้นหา"
          onChange={(event) => setValue(event.currentTarget.value)}
          rightSectionPointerEvents="all"
          rightSection={
            <CloseButton
              className={value ? "" : "hidden"}
              onClick={() => setValue("")}
            />
          }
        />
        <div className="p-4 bg-primary/20 rounded flex flex-col gap-1 overflow-auto sm:col-span-2">
          <label className="text-sm">สังกัด/กลุ่ม</label>
          <AffiliateMultiSelect
            affiliates={datas.affiliates}
            value={affiliates}
            setValue={setAffiliates}
          />
        </div>
        <Checkbox.Group
          label="รูปแบบ"
          className="p-4 bg-primary/20 rounded"
          value={type}
          onChange={(value: string[]) => handlersType.setState(value)}
        >
          <Group mt="xs">
            <Checkbox value="TWO_D" label="2D" />
            <Checkbox value="THREE_D" label="3D" />
            <Checkbox value="PNG" label="PNG" />
          </Group>
        </Checkbox.Group>
        <Checkbox.Group
          label="สถานะ"
          className="p-4 bg-primary/20 rounded"
          value={status}
          onChange={(value: string[]) => handlersStatus.setState(value)}
        >
          <Group mt="xs">
            <Checkbox value="ACTIVE" label="วีทูปเบอร์" />
            <Checkbox value="RETIRED" label="ยุติบทบาท" />
            <Checkbox value="INACTIVE_AS_VTUBER" label="พักการเป็นวีทูปเบอร์" />
          </Group>
        </Checkbox.Group>
        <Radio.Group
          label="ลำดับตาม"
          value={order}
          onChange={(value: string) => setOrder(value)}
          className="p-4 bg-primary/20 rounded"
        >
          <Group mt="xs">
            <Radio
              classNames={{ body: "items-center gap-2", label: "px-0" }}
              value="id"
              label={
                <div className="flex items-center gap-1">
                  การเข้าสู่ <Logo className="w-6 h-6" /> ล่าสุด
                </div>
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
        {isMounted &&
          transferFiltered
            .slice(0, amount)
            .map((item, index) => (
              <TalentCard
                isActive={true}
                className="md:max-w-none max-w-[240px] ss:h-full"
                key={index}
                talent={item}
                Tag={"h2"}
                searchTerm={keyword.trim()}
                searchWhere="talent-list"
              />
            ))}
        {(!isMounted || amount < transferFiltered.length) && (
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
