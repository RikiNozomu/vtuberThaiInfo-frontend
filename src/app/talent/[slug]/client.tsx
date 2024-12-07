"use client";

import { useEffect } from "react";

export default function TalentHomeClient({ slug }: { slug: string }) {
  useEffect(() => {
    if (slug) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/fetch/${slug}`);
    }
  }, [slug]);

  return <div></div>;
}
