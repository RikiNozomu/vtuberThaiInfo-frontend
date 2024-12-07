import { Logo } from "@/svg/Logo";
import { Link } from "@/components/link";
import DesktopMenu from "./desktopMenu";
import MobileMenu from "./mobileMenu";
import Search from "./search";
import EditMenu from "./edit";
import { Suspense } from "react";
import { IconRotateClockwise2 } from "@tabler/icons-react";

export default function Header() {
  return (
    <div
      className="z-10 flex flex-col w-full h-fit divide-y-2 divide-white sticky top-0 border-b-2 border-white"
    >
      <div className="flex flex-row py-1 px-2 items-center gap-2 flex-1 bg-primary text-white">
        <Link  className="gap-2 flex" href={"/"}>
          <Logo className="w-10 h-10" />
          <b className="text-2xl pt-1 hidden sm:flex">
            VTUBER<span className="text-red-500">THAI</span>INFO
          </b>
        </Link>
        <Suspense
          fallback={<IconRotateClockwise2 className="animate-spin" size={32} />}
        >
          <Search />
        </Suspense>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Suspense
            fallback={
              <IconRotateClockwise2 className="animate-spin" size={28} />
            }
          >
            <EditMenu />
          </Suspense>
          <MobileMenu />
        </div>
      </div>
      <DesktopMenu />
    </div>
  );
}
