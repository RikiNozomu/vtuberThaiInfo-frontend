"use client";

import { Link } from "@/components/link";
import { usePathname } from "next/navigation";

export default function DesktopMenu() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-row w-full h-fit bg-primary text-white justify-center">
      <Link 
        className={`click-header py-1 px-4 ${pathname == "/" ? "bg-secondary" : "hover:bg-secondary/50"} `}
        href={"/"}
      >
        หน้าแรก
      </Link>
      <Link 
        className={`click-header py-1 px-4 ${pathname.startsWith("/video") ? "bg-secondary" : "hover:bg-secondary/50"} `}
        href={"/video"}
      >
        วีดีโอ
      </Link>
      <Link 
        className={`click-header py-1 px-4 ${pathname.startsWith("/talent") ? "bg-secondary" : "hover:bg-secondary/50"} `}
        href={"/talent"}
      >
        วีทูปเบอร์
      </Link>
      <Link 
        className={`click-header py-1 px-4 ${pathname.startsWith("/affiliate") ? "bg-secondary" : "hover:bg-secondary/50"} `}
        href={"/affiliate"}
      >
        สังกัด/กลุ่ม
      </Link>
      <Link 
        className={`click-header py-1 px-4 ${pathname.startsWith("/support-us") ? "bg-secondary" : "hover:bg-secondary/50"} `}
        href={"/support-us"}
      >
        สนับสนุนเว็บไซด์
      </Link>
      <Link 
        className={`click-header py-1 px-4 ${pathname.startsWith("/contact-us") ? "bg-secondary" : "hover:bg-secondary/50"} `}
        href={"/contact-us"}
      >
        ติดต่อทีมงาน
      </Link>
    </nav>
  );
}
