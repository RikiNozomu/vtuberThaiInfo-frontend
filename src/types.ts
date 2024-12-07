import {
  talent,
  channel,
  transfer,
  affiliate,
  video,
  timeline,
  social,
  info,
  hashtag,
  TalentType,
  approve,
} from "../drizzle/schema";

export type TalentWithChannel = typeof talent.$inferSelect & {
  youtubeMain?: typeof channel.$inferSelect;
  twitchMain?: typeof channel.$inferSelect;
  transfers?: (typeof transfer.$inferSelect & {
    affiliate?: typeof affiliate.$inferSelect;
  })[];
  rank?: number;
};

export type TalentFull = typeof talent.$inferSelect & {
  youtubeMain?: typeof channel.$inferSelect;
  twitchMain?: typeof channel.$inferSelect;
  transfers?: (typeof transfer.$inferSelect & {
    affiliate?: typeof affiliate.$inferSelect;
  })[];
  socials?: (typeof social.$inferSelect)[];
  infos?: (typeof info.$inferSelect)[];
  hashtags?: (typeof hashtag.$inferSelect)[];
  timelines?: (typeof timeline.$inferSelect)[];
};

export type AffiliateFull = typeof affiliate.$inferSelect & {
  socials?: (typeof social.$inferSelect)[];
  infos?: (typeof info.$inferSelect)[];
};

export type searchData = {
  id: number;
  type: "affiliate" | "talent";
  name: string;
  desc?: string;
  slug: string;
  profileImgURL?: string | undefined | null;
};

export type VideoWithTalent = {
  id: number;
  videoId?: string;
  streamId?: string;
  title: string;
  thumbnail?: string;
  durations: number;
  datetime?: string;
  platform: "TWITCH" | "YOUTUBE";
  type: "UPLOADED" | "LIVE" | "SHORT" | "ADS";
  status: "FINISHED" | "UPCOMING" | "LIVE" | "UNAVAILABLE";
  views: number;
  url?: string;
  talents: {
    id: number;
    name: string;
    profileImgURL?: string;
    slug: string;
  }[];
};

export type Anniversary = typeof timeline.$inferSelect & {
  talent?: TalentWithChannel;
};

export type VideoWithChannelRawId = typeof video.$inferSelect & {
  channelRawId?: string;
};

export type transferWithTalent = typeof transfer.$inferSelect & {
  talent?: TalentWithChannel;
};

export type AffiliateCardType = {
  id: number;
  name: string;
  profileImgURL: string | null;
  type: "AFFILIATE" | "GROUP";
  slug: string;
  talents: {
    name: string;
    slug: string;
    profileImgURL: string | null;
    isActive: boolean;
  }[];
};

export type TalentWithChannelStat = {
  name: string;
  slug: string;
  profileImgURL: string | null;
  sub: number;
};

export type TalentCardType = {
  id: number;
  name: string;
  slug: string; // also be as ads-slot-id
  profileImgURL?: string;
  type: TalentType[];
  statusType: "ACTIVE" | "INACTIVE_AS_VTUBER" | "RETIRED" | "DELIST" | "ADS";
  youtubeMain?: typeof channel.$inferSelect;
  twitchMain?: typeof channel.$inferSelect;
  isActive?: boolean;
  transfers?: (typeof transfer.$inferSelect & {
    affiliate?: typeof affiliate.$inferSelect;
  })[];
};

export type AffiliateFormType = Omit<typeof affiliate.$inferSelect, "id"> & {
  id: number | null;
  socials: (typeof social.$inferSelect)[];
  infos: (typeof info.$inferSelect)[];
};

export type TalentFormType = Omit<
  typeof talent.$inferSelect,
  "id" | "youtubeMainId" | "twitchMainId"
> & {
  id: number | null;
  birthDate: {
    hasBirthDate: boolean;
    year: number | null;
    month: number | null;
    day: number | null;
  };
  socials: (typeof social.$inferSelect)[];
  infos: (typeof info.$inferSelect)[];
  youtubeMain: typeof channel.$inferSelect & { hasChannel: boolean };
  twitchMain: typeof channel.$inferSelect & { hasChannel: boolean };
  transfers: (typeof transfer.$inferSelect & {
    affiliate?: typeof affiliate.$inferSelect | undefined | null;
    isAffiliate: boolean;
  })[];
  hashtags: (typeof hashtag.$inferSelect)[];
  timelines: (typeof timeline.$inferSelect)[];
};

export type ApproveFull = Omit<typeof approve.$inferSelect, "data"> & {
  data: AffiliateFormType | TalentFormType;
  createdAt: string;
  talent?: typeof talent.$inferSelect & {
    youtubeMain?: typeof channel.$inferSelect;
    twitchMain?: typeof channel.$inferSelect;
  };
  affiliate?: typeof affiliate.$inferSelect;
};

export type VideoType = "UPLOADED" | "LIVE" | "SHORT";
export type VideoStatus = "FINISHED" | "UPCOMING" | "LIVE" | "UNAVAILABLE";
export type VideoTypeFrontFilter = "LIVE" | "FINISHED" | "UPCOMING" | "SHORT";

export type DeviceDetect = {
  browserName: string;
  browserVersion: string;
  deviceType: string;
  engineName: string;
  engineVersion: string;
  fullBrowserVersion: string;
  getUA: string;
  isAndroid: boolean;
  isBrowser: boolean;
  isChrome: boolean;
  isChromium: boolean;
  isConsole: boolean;
  isDesktop: boolean;
  isEdge: boolean;
  isEdgeChromium: boolean;
  isElectron: boolean;
  isEmbedded: boolean;
  isFirefox: boolean;
  isIE: boolean;
  isIOS: boolean;
  isIOS13: boolean;
  isIPad13: boolean;
  isIPhone13: boolean;
  isIPod13: boolean;
  isLegacyEdge: boolean;
  isMIUI: boolean;
  isMacOs: boolean;
  isMobile: boolean;
  isMobileOnly: boolean;
  isMobileSafari: boolean;
  isOpera: boolean;
  isSafari: boolean;
  isSamsungBrowser: boolean;
  isSmartTV: boolean;
  isTablet: boolean;
  isWearable: boolean;
  isWinPhone: boolean;
  isWindows: boolean;
  isYandex: boolean;
  mobileModel: string;
  mobileVendor: string;
  osName: string;
  osVersion: string;
};
