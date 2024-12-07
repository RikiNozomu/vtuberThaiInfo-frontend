"use client";

import { ButtonGroup, Button } from "@mantine/core";
import { Link } from "@/components/link";
import { usePathname } from "next/navigation";

type props = {
  slug: string;
};

export default function Menu({ slug }: props) {
  const pathname = usePathname();

  return (
    <div className="flex justify-center px-4 w-full">
      <ButtonGroup
        borderWidth={4}
        classNames={{
          group: "w-full grid grid-cols-2",
        }}
      >
        <Button
          component={Link}
          classNames={{ root: "border-2 border-primary" }}
          href={`/talent/${slug}`}
          className={`md:text-xl ${pathname.endsWith("/video") ? "" : "bg-primary text-white"}`}
          variant="default"
        >
          ประวัติและข้อมูล
        </Button>
        <Button
          component={Link}
          classNames={{ root: "border-2 border-primary" }}
          href={`/talent/${slug}/video`}
          className={`md:text-xl ${pathname.endsWith("/video") ? "bg-primary text-white" : ""}`}
          variant="default"
        >
          วีดีโอ
        </Button>
      </ButtonGroup>
    </div>
  );
}
