"use client";

import { Menu, MenuTarget, Button, MenuDropdown } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserPlus, IconFlagPlus } from "@tabler/icons-react";
import TalentEditModal from "@/components/editModal/talent";
import AffiliateEditModal from "@/components/editModal/affiliate";
import { AffiliateFull } from "@/types";

type Props = {
  affiliates: AffiliateFull[];
};

export default function Base({ affiliates = [] }: Props) {
  const [talent, talentModalHandles] = useDisclosure();
  const [affiliate, affiliateModalHandles] = useDisclosure();

  return (
    <Menu shadow="md" width={280} position="bottom-end">
      <TalentEditModal
        opened={talent}
        onClose={talentModalHandles.close}
        affiliates={affiliates}
      />
      <AffiliateEditModal
        opened={affiliate}
        onClose={affiliateModalHandles.close}
      />

      <MenuTarget>
        <div>
          <Button className="bg-secondary text-xl block sm:hidden">
            เพิ่มข้อมูล
          </Button>
          <Button className="bg-secondary text-xl hidden sm:block">
            เพิ่มข้อมูลวีทูปเบอร์ไทย
          </Button>
        </div>
      </MenuTarget>

      <MenuDropdown>
        <Menu.Item
          onClick={() => talentModalHandles.open()}
          classNames={{
            itemLabel: "flex flex-row justify-end text-base",
            item: "hover:bg-primary hover:text-white",
          }}
        >
          เพิ่มข้อมูลทาเลนท์ใหม่
          <IconUserPlus />
        </Menu.Item>
        <Menu.Item
          onClick={() => affiliateModalHandles.open()}
          classNames={{
            itemLabel: "flex flex-row justify-end text-base",
            item: "hover:bg-primary hover:text-white",
          }}
        >
          เพิ่มข้อมูลสังกัด/กลุ่มใหม่
          <IconFlagPlus />
        </Menu.Item>
      </MenuDropdown>
    </Menu>
  );
}
