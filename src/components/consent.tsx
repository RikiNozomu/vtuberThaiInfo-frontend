"use client";
import CookieConsent, { getCookieConsentValue } from "react-cookie-consent";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { useEffect } from "react";
import { Link } from "./link";

export default function Consent() {
  useEffect(() => {
    if (!getCookieConsentValue("CookieConsentUpdate2024")) {
      gtag("consent", "default", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
  }, []);

  return (
    <div>
      {getCookieConsentValue("CookieConsentUpdate2024") == "true" && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAGS_ID!} />
      )}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_GA4_ID!} />
      <CookieConsent
        /*enableDeclineButton*/
        location="bottom"
        buttonText="ยอมรับ"
        //declineButtonText="ปฎิเสธ"
        cookieName="CookieConsentUpdate2024"
        style={{
          background: "#1f4056",
          padding: 8,
          margin: 0,
          borderTop: "solid 2px white",
        }}
        buttonStyle={{ background: "#FFFFFF", color: "#1f4056" }}
        //declineButtonStyle={{ background: "#ff0000", color: "#FFFFFF" }}
        onAccept={() => {
          gtag("consent", "update", {
            ad_storage: "granted",
            analytics_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
          });
        }}
      >
        เราใช้คุกกี้เพื่อพัฒนาประสิทธิภาพ
        และประสบการณ์ที่ดีในการใช้เว็บไซต์ของคุณ คุณสามารถศึกษารายละเอียดได้ที่{" "}
        <Link
          className="font-bold hover:underline underline-offset-2"
          href={`/privacy`}
        >
          นโยบายความเป็นส่วนตัว
        </Link>
      </CookieConsent>
    </div>
  );
}
