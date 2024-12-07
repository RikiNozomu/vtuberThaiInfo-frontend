"use client";

import { ActionIcon, Image, rem } from "@mantine/core";
import { Spotlight, /*SpotlightActionData, */spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { searchData } from "@/types";
import { useDebouncedValue } from "@mantine/hooks";
import { sendGTMEvent } from "@next/third-parties/google";

type Props = {
  datas?: searchData[];
};

export default function Modal({ datas = [] }: Props) {
  const [query, setQuery] = useState("");
  const [keyword] = useDebouncedValue(query, 500);
  const router = useRouter();

  useEffect(() => {
    if (keyword.trim().length) {
      sendGTMEvent({
        event: "search",
        search_term: keyword.trim(),
        where: "header",
      });
    }
  }, [keyword]);

  return (
    <>
      <ActionIcon
        onClick={() => {
          spotlight.open();
        }}
      >
        <IconSearch />
      </ActionIcon>
      <Spotlight
        classNames={{
          action:
            "hover:bg-primary/20 data-[selected=true]:bg-primary data-[selected=true]:text-white ",
          actionSection: "opacity-100",
        }}
        actions={datas?.map((item) => {
          return {
            id: item.id.toString(),
            label: item.name,
            description: item.desc || "",
            onClick: () => {
              sendGTMEvent({
                event: "search-select",
                search_term: query.trim(),
                where: "header",
                name: item.name,
                type: item.type,
              });
              router.push("/" + item.type + "/" + item.slug);
            },
            ...(item.slug != "independent"
              ? {
                  leftSection: (
                    <Image
                      src={item.profileImgURL}
                      referrerPolicy="no-referrer"
                      className="w-12 aspect-square rounded bg-white"
                      fallbackSrc={
                        item.type == "talent"
                          ? "https://img.vtuberthaiinfo.com/people_notfound.png"
                          : "https://img.vtuberthaiinfo.com/no_logo_group.png"
                      }
                      alt={item.name}
                    />
                  ),
                }
              : {}),
          };
        })}
        nothingFound={
          query.trim().length <= 0 || query != keyword ? "" : "ไม่พบเจออะไร"
        }
        highlightQuery
        limit={query.trim().length <= 0 || query != keyword ? 0 : 10}
        onQueryChange={setQuery}
        query={query}
        filter={(query, actions /*: SpotlightActionData[]*/) => {
          return actions.filter(
            (item: any) =>
              item.label
                ?.toLocaleLowerCase()
                .includes(keyword.trim().toLocaleLowerCase()) ||
              item.description
                ?.toLocaleLowerCase()
                .includes(keyword.trim().toLocaleLowerCase())
          );
        }}
        searchProps={{
          leftSection: (
            <IconSearch
              style={{ width: rem(20), height: rem(20) }}
              stroke={1.5}
            />
          ),
          placeholder: "พิมพ์เพื่อค้นหา",
        }}
      />
    </>
  );
}
