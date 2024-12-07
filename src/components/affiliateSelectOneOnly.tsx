"use client";

import {
  Combobox,
  useCombobox,
  Image,
  Button,
  CloseButton,
} from "@mantine/core";
import { useState } from "react";
import { affiliate } from "../../drizzle/schema";

type props = {
  value: string;
  onChange?: (value: string | null | undefined) => void;
  affiliates?: (typeof affiliate.$inferSelect)[];
};

export function AffiliateSingleSelect({
  value,
  onChange,
  affiliates = [],
}: props) {
  const [search, setSearch] = useState("");

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      combobox.focusTarget();
      setSearch("");
    },

    onDropdownOpen: () => {
      combobox.focusSearchInput();
    },
  });

  const options =
    affiliates
      .filter((item) =>
        item.name?.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .sort((a, b) =>
        (a.name || "").localeCompare(`${b.name}`, "en", {
          sensitivity: "base",
        }),
      )
      .map((item) => (
        <Combobox.Option
          className="flex gap-1"
          value={item.id.toString()}
          key={item.id}
        >
          <Image
            className="w-6 h-6 aspect-square rounded-full overflow-clip"
            src={item.profileImgURL}
            fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
          />
          <span>{item.name}</span>
        </Combobox.Option>
      )) || [];

  return (
    <>
      <Combobox
        store={combobox}
        width={250}
        position="bottom-start"
        withArrow
        onOptionSubmit={(val) => {
          if (onChange) {
            onChange(val);
          }
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target withAriaAttributes={false}>
          <Button.Group className="flex flex-row items-center text-white px-1 bg-primary rounded-full">
            <Button
              className="text-white"
              onClick={() => combobox.openDropdown()}
              classNames={{ label: "flex flex-row gap-1" }}
              variant="transparent"
            >
              {value && (
                <Image
                  className="w-6 h-6 aspect-square rounded-full overflow-clip"
                  src={
                    affiliates.find((x) => x.id.toString() == value)
                      ?.profileImgURL
                  }
                  fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
                />
              )}
              <span>
                {value
                  ? affiliates.find((x) => x.id.toString() == value)?.name
                  : "กรุณาเลือกสังกัด"}
              </span>
            </Button>
            <CloseButton
              className={value ? "text-white" : "hidden"}
              onClick={() => {
                if (onChange) {
                  onChange(null);
                }
              }}
            />
          </Button.Group>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Search
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search Affiliate"
          />
          <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
            {options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
}
