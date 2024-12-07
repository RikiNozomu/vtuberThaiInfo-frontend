"use client";

import { Arbum } from "@/svg/Arbum";
import { Mastodon } from "@/svg/Mastodon";
import { Misskey } from "@/svg/Misskey";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Combobox, useCombobox, InputBase } from "@mantine/core";

type props = {
  value?: string;
  onChange?: (
    value:
      | "YOUTUBE"
      | "TWITCH"
      | "WWW"
      | "TWITTER"
      | "FACEBOOK"
      | "TIKTOK"
      | "INSTAGRAM"
      | "GITHUB"
      | "DISCORD"
      | "ARBUM"
      | "PIXIV"
      | "STEAM"
      | "DEVIANART"
      | "SOUNDCLOUD"
      | "MASTODON"
      | "MISSKEY"
      | null,
  ) => void;
};

export function SocialSelect({ value = "WWW", onChange }: props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const socials = [
    { value: "WWW", icon: <FontAwesomeIcon size="xl" icon={faGlobe} /> },
    { value: "YOUTUBE", icon: <FontAwesomeIcon size="xl" icon={faYoutube} /> },
    { value: "TWITCH", icon: <FontAwesomeIcon size="xl" icon={faTwitch} /> },
    { value: "TWITTER", icon: <FontAwesomeIcon size="xl" icon={faXTwitter} /> },
    {
      value: "FACEBOOK",
      icon: <FontAwesomeIcon size="xl" icon={faFacebook} />,
    },
    { value: "TIKTOK", icon: <FontAwesomeIcon size="xl" icon={faTiktok} /> },
    {
      value: "INSTAGRAM",
      icon: <FontAwesomeIcon size="xl" icon={faInstagram} />,
    },
    { value: "GITHUB", icon: <FontAwesomeIcon size="xl" icon={faGithub} /> },
    { value: "DISCORD", icon: <FontAwesomeIcon size="xl" icon={faDiscord} /> },
    { value: "ARBUM", icon: <Arbum className="w-[24px] h-[24px]" /> },
    { value: "PIXIV", icon: <FontAwesomeIcon size="xl" icon={faPixiv} /> },
    { value: "STEAM", icon: <FontAwesomeIcon size="xl" icon={faSteam} /> },
    {
      value: "DEVIANART",
      icon: <FontAwesomeIcon size="xl" icon={faDeviantart} />,
    },
    {
      value: "SOUNDCLOUD",
      icon: <FontAwesomeIcon size="xl" icon={faSoundcloud} />,
    },
    { value: "MASTODON", icon: <Mastodon className="w-[24px] h-[24px]" /> },
    { value: "MISSKEY", icon: <Misskey className="w-[24px] h-[24px]" /> },
  ];

  const options = socials.map((item) => (
    <Combobox.Option
      className="flex justify-center"
      value={item.value}
      key={item.value}
    >
      {item.icon}
    </Combobox.Option>
  ));

  return (
    <Combobox
      classNames={{}}
      store={combobox}
      onOptionSubmit={(val) => {
        if (onChange) {
          onChange(
            val as
              | "YOUTUBE"
              | "TWITCH"
              | "WWW"
              | "TWITTER"
              | "FACEBOOK"
              | "TIKTOK"
              | "INSTAGRAM"
              | "GITHUB"
              | "DISCORD"
              | "ARBUM"
              | "PIXIV"
              | "STEAM"
              | "DEVIANART"
              | "SOUNDCLOUD"
              | "MASTODON"
              | "MISSKEY"
              | null,
          );
        }
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          classNames={{ input: "border-0" }}
          className="w-12 flex justify-center"
          component="button"
          type="button"
          pointer
          onClick={() => combobox.toggleDropdown()}
        >
          {socials.find((x) => x.value == value)?.icon || "-"}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
