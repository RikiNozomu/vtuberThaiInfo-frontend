"use client";

import { AffiliateFull, TalentFull } from "@/types";
import { Button } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import TalentEditModal from "@/components/editModal/talent";
import { useState } from "react";

type props = {
  talent: TalentFull;
  affiliates: AffiliateFull[];
};

export default function Base({ talent, affiliates }: props) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <TalentEditModal
        talent={talent}
        opened={opened}
        onClose={() => setOpened(false)}
        affiliates={affiliates}
      />
      <Button
        onClick={() => setOpened(true)}
        className="bg-secondary text-xl gap-2"
      >
        <IconEdit />
        แก้ไขข้อมูล
      </Button>
    </>
  );
}
