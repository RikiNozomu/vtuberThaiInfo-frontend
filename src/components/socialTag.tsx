"use client";

import { Arbum } from "@/svg/Arbum";
import { Mastodon } from "@/svg/Mastodon";
import { Misskey } from "@/svg/Misskey";
import {
  faDeviantart,
  faDiscord,
  faFacebook,
  faGithub,
  faInstagram,
  faPixiv,
  faSoundcloud,
  faSteam,
  faTiktok,
  faTwitch,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Link } from "@/components/link";
import { IconBrandBluesky } from "@tabler/icons-react";

type props = {
  platform: string;
  text: string;
  url: string;
  classNames?: {
    root?: string;
    label?: string;
  };
  Tag?: any
};

export default function SocialTag({
  platform = "WWW",
  text,
  url,
  classNames,
  Tag = 'span'
}: props) {
  const matches = useMediaQuery("(min-width: 640px)");

  return (
    <Tooltip label={text} disabled={matches}>
      <Button
        component={Link}
        variant="filled"
        className={classNames?.root || "bg-primary flex"}
        classNames={{
          root: "px-1",
          label: "flex flex-row sm:gap-2 items-center",
        }}
        href={url}
        target="_blank"
      >
        {platform == "WWW" && <FontAwesomeIcon size="xl" icon={faGlobe} />}
        {platform == "YOUTUBE" && (
          <FontAwesomeIcon size="xl" icon={faYoutube} />
        )}
        {platform == "TWITCH" && <FontAwesomeIcon size="xl" icon={faTwitch} />}
        {platform == "TWITTER" && (
          <FontAwesomeIcon size="xl" icon={faXTwitter} />
        )}
        {platform == "FACEBOOK" && (
          <FontAwesomeIcon size="xl" icon={faFacebook} />
        )}
        {platform == "TIKTOK" && <FontAwesomeIcon size="xl" icon={faTiktok} />}
        {platform == "INSTAGRAM" && (
          <FontAwesomeIcon size="xl" icon={faInstagram} />
        )}
        {platform == "GITHUB" && <FontAwesomeIcon size="xl" icon={faGithub} />}
        {platform == "DISCORD" && (
          <FontAwesomeIcon size="xl" icon={faDiscord} />
        )}
        {platform == "ARBUM" && <Arbum className="w-[24px] h-[24px]" />}
        {platform == "PIXIV" && <FontAwesomeIcon size="xl" icon={faPixiv} />}
        {platform == "STEAM" && <FontAwesomeIcon size="xl" icon={faSteam} />}
        {platform == "DEVIANART" && (
          <FontAwesomeIcon size="xl" icon={faDeviantart} />
        )}
        {platform == "SOUNDCLOUD" && (
          <FontAwesomeIcon size="xl" icon={faSoundcloud} />
        )}
        {platform == "MASTODON" && <Mastodon className="w-[24px] h-[24px]" />}
        {platform == "MISSKEY" && <Misskey className="w-[24px] h-[24px]" />}
        {platform == "BLUESKY" && <IconBrandBluesky className="w-[24px] h-[24px]" />}
        <Tag className={classNames?.label || "sm:block hidden"}>{text}</Tag>
      </Button>
    </Tooltip>
  );
}
