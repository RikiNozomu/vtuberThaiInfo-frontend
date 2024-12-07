"use client";

import {
  PillsInput,
  Pill,
  Combobox,
  useCombobox,
  Image,
  CloseButton,
} from "@mantine/core";
import { Dispatch, SetStateAction, useState } from "react";
import { affiliate } from "../../drizzle/schema";

type props = {
  affiliates: (typeof affiliate.$inferSelect)[];
  value: string[];
  setValue: Dispatch<SetStateAction<string[]>>;
};

export function AffiliateMultiSelect({
  affiliates = [],
  value,
  setValue,
}: props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");

  const handleValueSelect = (val: string) => {
    setValue((current) =>
      current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val]
    );
    setSearch("");
  };

  const handleValueRemove = (val: string) =>
    setValue((current) => current.filter((v) => v !== val));

  const values = value.map((item) => (
    <Pill
      className="py-1 items-center h-fit flex-none hover:cursor-pointer"
      classNames={{ label: "flex gap-1 w-fit", remove: "w-min" }}
      key={item}
      withRemoveButton
      onRemove={() => handleValueRemove(item)}
    >
      {affiliates.find((x) => x.id.toString() == item)?.profileImgURL && <Image
        className="w-6 h-6 items-center aspect-square rounded-full overflow-clip"
        src={affiliates.find((x) => x.id.toString() == item)?.profileImgURL}
        fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
      />}
      <span className="w-fit">
        {affiliates.find((x) => x.id.toString() == item)?.name}
      </span>
    </Pill>
  ));

  const options = affiliates
    .filter((item) =>
      item.name?.toLowerCase().includes(search.trim().toLowerCase())
    )
    .filter((item) => !value.includes(item.id.toString()))
    .map((item) => (
      <Combobox.Option
        className="flex gap-1"
        value={item.id.toString()}
        key={item.id}
        active={value.includes(item.id.toString())}
      >
        {item.profileImgURL && <Image
          className="w-6 h-6 aspect-square rounded-full overflow-clip"
          src={item.profileImgURL}
          fallbackSrc="https://img.vtuberthaiinfo.com/no_logo_group.png"
        />}
        <span>{item.name}</span>
      </Combobox.Option>
    ));

  return (
    <Combobox
      classNames={{}}
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          rightSection={
            value.length > 0 && (
              <CloseButton
                size="sm"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setValue([])}
                aria-label="Clear value"
              />
            )
          }
        >
          <Pill.Group>
            {values}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={
                  value.length > 0
                    ? ""
                    : "กรุณาเลือกสังกัด/กลุ่ม เพื่อคัดกรองข้อมูล"
                }
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options className="overflow-y-auto max-h-[250px]">
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
