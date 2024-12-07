"use client";
import { useEffect, useState } from "react";
import { getSelectorsByUserAgent } from "react-device-detect";

export const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const { isMobile } = getSelectorsByUserAgent(window.navigator.userAgent);
    setMobile(isMobile);
  }, []);

  return {
    isMobile: mobile,
  };
};
