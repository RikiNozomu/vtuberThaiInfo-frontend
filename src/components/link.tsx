"use client";

import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { AnchorHTMLAttributes, forwardRef } from "react";

type LinkProps = NextLinkProps & AnchorHTMLAttributes<any>;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { prefetch, ...props },
  ref,
) {
  return <NextLink ref={ref} prefetch={false} {...props} />;
});
