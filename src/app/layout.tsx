import "./globals.css";

import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import type { Metadata } from "next";
import Script from "next/script";
import RQProvider from "./RQProvider";
import { config as configAwesome } from "@fortawesome/fontawesome-svg-core";
import Main from "./main";
import { Notifications } from "@mantine/notifications";
import Consent from "@/components/consent";
import { description, images, title } from "@/constants";
import { ReactNode } from "react";
configAwesome.autoAddCss = false;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL!),
  title,
  description,
  openGraph: {
    title,
    description,
    images,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images,
  },
  robots: "all",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_AD_CLIENT}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className={`flex flex-col w-screen min-h-full bg-primary/40`}>
        <RQProvider>
          <MantineProvider
            theme={{
              fontFamily:
                "'LINE Seed Sans TH', 'sans-serif'",
              breakpoints: {
                xs: "425px",
                sm: "640px",
                md: "768px",
                lg: "1024px",
                xl: "1280px",
              },
            }}
          >
            <Notifications position="top-center" />
            <Main children={children} />
            <Consent />
          </MantineProvider>
        </RQProvider>
      </body>
    </html>
  );
}
