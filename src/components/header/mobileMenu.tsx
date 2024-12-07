"use client";

import { Logo } from "@/svg/Logo";
import { ActionIcon, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMenu2 } from "@tabler/icons-react";
import { Link } from "@/components/link";
import { usePathname } from "next/navigation";

export default function MobileMenu() {
  const pathname = usePathname();
  const [opened, handlers] = useDisclosure(false);

  return (
    <nav>
      <ActionIcon className="md:hidden block" size={35} onClick={handlers.open}>
        <IconMenu2 size={35} />
      </ActionIcon>
      <Drawer
        classNames={{
          content: "bg-primary",
          header: "bg-primary",
          close: "text-white",
          body: "flex-col flex px-0 text-white",
        }}
        closeButtonProps={{ size: 48 }}
        opened={opened}
        onClose={handlers.close}
        title={
          <div className="gap-2 flex ss:flex-row flex-col text-white">
            <Logo className="ss:w-12 w-24 ss:h-12 h-24" />
            <div className="flex-1 flex flex-col">
              <b className="text-lg">
                VTUBER<span className="text-red-500">THAI</span>INFO.COM
              </b>
              <span className="text-sm">
                เว็บไซด์ข้อมูลและจัดอันดับวีทูปเบอร์ไทย
              </span>
            </div>
          </div>
        }
        position="right"
      >
        <Link 
          onClick={() => handlers.close()}
          className={`click-header p-4 text-right ${pathname == "/" ? "bg-secondary" : "hover:bg-[#92434e]"} `}
          href={"/"}
        >
          หน้าแรก
        </Link>
        <Link 
          onClick={() => handlers.close()}
          className={`click-header p-4 text-right ${pathname.startsWith("/video") ? "bg-secondary" : "hover:bg-[#92434e]"}`}
          href={"/video"}
        >
          วีดีโอ
        </Link>
        <Link 
          onClick={() => handlers.close()}
          className={`click-header p-4 text-right ${pathname.startsWith("/talent") ? "bg-secondary" : "hover:bg-[#92434e]"}`}
          href={"/talent"}
        >
          วีทูปเบอร์
        </Link>
        <Link 
          onClick={() => handlers.close()}
          className={`click-header p-4 text-right ${pathname.startsWith("/affiliate") ? "bg-secondary" : "hover:bg-[#92434e]"}`}
          href={"/affiliate"}
        >
          สังกัด/กลุ่ม
        </Link>
        <Link 
          onClick={() => handlers.close()}
          className={`click-header p-4 text-right ${pathname.startsWith("/support-us") ? "bg-secondary" : "hover:bg-[#92434e]"}`}
          href={"/support-us"}
        >
          สนับสนุนเว็บไซด์
        </Link>
        <Link 
          onClick={() => handlers.close()}
          className={`click-header p-4 text-right ${pathname.startsWith("/contact-us") ? "bg-secondary" : "hover:bg-[#92434e]"}`}
          href={"/contact-us"}
        >
          ติดต่อทีมงาน
        </Link>
      </Drawer>
    </nav>
  );
}
