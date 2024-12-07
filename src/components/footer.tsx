import { Logo } from "@/svg/Logo";
import {
  faYoutube,
  faFacebookF,
  faXTwitter,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@/components/link";
import { IconBrandBluesky } from "@tabler/icons-react";

export default function Footer() {
  return (
    <div className={`bg-primary w-full text-white flex justify-center`}>
      <div className="container px-2 py-4 ss:gap-2 gap-6 flex-col flex items-start ss:items-center">
        <div className="flex flex-row items-center divide-x-2 divide-white">
          <Logo className="ss:w-16 ss:h-16 w-12 h-12 ss:pr-4 pr-2" />
          <div className="ss:pl-4 pl-2 flex flex-row gap-4 ss:text-4xl text-3xl">
            <Link 
              href={"https://www.youtube.com/@VtuberThaiInfo"}
              target="_blank"
            >
              <FontAwesomeIcon icon={faYoutube} />
            </Link>
            <Link  href={"https://twitter.com/VtuberThaiInfo"} target="_blank">
              <FontAwesomeIcon icon={faXTwitter} />
            </Link>
            <Link 
              href={"https://www.facebook.com/vtuberthaiinfo"}
              target="_blank"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </Link>
            <Link 
              href={"https://www.tiktok.com/@vtuberthaiinfo"}
              target="_blank"
            >
              <FontAwesomeIcon icon={faTiktok} />
            </Link>
            
          </div>
        </div>

        <div className="flex ss:flex-wrap ss:flex-row flex-col ss:gap-y-2 gap-y-1 ss:divide-x-2 divide-white justify-center">
          <span className="flex gap-2 items-center ss:px-2 first:pl-0 last:pr-0 ">
            © 2024 VtuberThaiInfo
          </span>
          <Link 
            className="flex gap-2 items-center ss:px-2 first:pl-0 last:pr-0 hover:underline"
            href="/privacy"
          >
            นโยบายความเป็นส่วนตัวของข้อมูล
          </Link>
          <Link 
            className="flex gap-2 items-center ss:px-2 first:pl-0 last:pr-0 hover:underline"
            href="/cookie"
          >
            นโยบายการใช้คุกกี้
          </Link>
        </div>

        <span className="text-sm ss:text-center">
          ข้อมูลภายในเว็บไซด์ส่วนหนึ่ง เป็นการรวบรวมจาก API ของ Youtube และ
          Twitch ทางเราขอสงวนสิทธิ์ในการไม่รับผิดชอบต่อความไม่ถูกต้องใดๆ
          บนเว็บไซต์ รวมไปถึงความเสียหายใดๆ ที่เกิดจากการใช้เนื้อหาบนเว็บไซต์
        </span>

        <span className="text-sm ss:text-center">
          VtuberThaiInfo.com ไม่มีส่วนเกี่ยวข้องหรือเป็นพันธมิตรกับ Twitch และ
          Youtube
        </span>

        <span className="text-sm ss:text-center">
          เครื่องหมายการค้าที่ปรากฎทั้งหมด เป็นทรัพย์สินของเจ้าของที่เกี่ยวข้อง
        </span>
      </div>
    </div>
  );
}
