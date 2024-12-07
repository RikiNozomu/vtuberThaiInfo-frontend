import { AffiliateFull } from "@/types";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/affiliate/" + params.slug
  );
  if (res.status > 299 || !res.ok) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            fontFamily: '"LineTH"',
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <img
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
            }}
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/img/og.jpg`}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const { data } = (await res.json()) as { data: AffiliateFull };

  const fontTHBold = await fetch(
    new URL(
      "../../../../../../assets/fonts/line-seed-th/LINESeedSansTH_Bd.ttf",
      import.meta.url
    )
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          fontFamily: '"LineTH"',
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {params.slug != "independent" && (
          <img
            height="630px"
            src={
              data.profileImgURL ||
              `${process.env.NEXT_PUBLIC_BASE_URL}https://img.vtuberthaiinfo.com/no_logo_group.png`
            }
            style={{
              position: "absolute",
              left: -40,
              top: -42,
            }}
          />
        )}
        {params.slug == "independent" && (
          <img
            width="100%"
            height="100%"
            style={{
              position: "absolute",
              left: -140,
              top: 0,
            }}
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/img/og.jpg`}
          />
        )}
        <img
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
          }}
          src={`${process.env.NEXT_PUBLIC_BASE_URL}/img/og-bg.png`}
        />

        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "end",
            right: 30,
            top: 30,
            width: 600,
            height: 530,
            color: "white",
            fontSize: params.slug == "independent" ? 85 : 96,
            lineHeight: 0.8,
          }}
        >
          <span>{data.name}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "LineTH",
          data: fontTHBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
