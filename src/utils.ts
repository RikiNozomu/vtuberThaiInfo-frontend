import numeral from "numeral";
import { TalentWithChannel } from "./types";
import { DateTime } from "luxon";
import { notifications } from "@mantine/notifications";
import Innertube, { UniversalCache } from "youtubei.js";
import { AppTokenAuthProvider } from "@twurple/auth";
import { ApiClient } from "@twurple/api";

export const decimalNunber = (value: number) => {
  if (value < 1000) {
    return value.toString();
  }

  if (value < 10000) {
    return numeral(value).format("0.00a", Math.floor).toUpperCase();
  }

  if (value < 100000) {
    return numeral(value).format("0.0a", Math.floor).toUpperCase();
  }

  if (value < 1000000) {
    return numeral(value).format("0a", Math.floor).toUpperCase();
  }

  if (value < 10000000) {
    return numeral(value).format("0.0a", Math.floor).toUpperCase();
  }

  return numeral(value).format("0a", Math.floor).toUpperCase();
};

export const commaNunber = (value: number) => {
  return numeral(value).format("0,0");
};

export const getTalentImageUrl = (talent: TalentWithChannel | undefined) => {
  switch (talent?.profileImgType) {
    case "TWITCH":
      return talent.twitchMain?.profileImgURL;
    case "YOUTUBE":
      return talent.youtubeMain?.profileImgURL;
    default:
      return talent?.profileImgURL || null;
  }
};

export const convertDate = (data: {
  day: number | null;
  month: number | null;
  year: number | null;
}) => {
  if (!data.day && !data.month && !data.year) {
    return "";
  }

  const dt = DateTime.fromObject({
    month: data.month || 1,
    year: data.year || 0,
    day: data.day || 1,
  });
  if (data.day && data.month && data.year) {
    return dt.setLocale("th").toFormat("d LLL yyyy");
  }
  if (data.day && data.month && !data.year) {
    return dt.setLocale("th").toFormat("d LLL");
  }
  if (!data.day && data.month && data.year) {
    return dt.setLocale("th").toFormat("LLL yyyy");
  }
  if (!data.day && !data.month && data.year) {
    return dt.setLocale("th").toFormat("yyyy");
  }

  return "";
};

export const convertTimelineType = (str: string) => {
  let type = null;
  switch (str) {
    case "DEBUT":
      type = "เดบิว";
      break;
    case "INACTIVE":
      type = "พักการเป็นวีทูปเบอร์";
      break;
    case "MOVE":
      type = "โยกย้าย";
      break;
    case "NEWMODEL":
      type = "โมเดลใหม่";
      break;
    case "REACTIVE":
      type = "กลับมาเป็นวีทูปเบอร์";
      break;
    case "REDEBUT":
      type = "รีเดบิว";
      break;
    case "REMODEL":
      type = "รีโมเดล";
      break;
    case "RETIRED":
      type = "ยุติบทบาท";
      break;
    default:
      break;
  }
  return type;
};

export const reorder = (list: any[], startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const removeItem = (list: any[], index: any) => {
  const result = Array.from(list);
  result.splice(index, 1);
  return result;
};

export const alertNotification = (str: string) => {
  notifications.show({
    color: "white",
    title: str,
    message: "",
    classNames: {
      root: "bg-red-500",
      title: "text-white text-xl font-bold",
      description: "text-white text-xl font-bold",
      closeButton: "text-white hover:text-red-500",
    },
  });
};

export const convertTextToNumberal = (txt: string) => {
  if (!txt) {
    return 0;
  } else if (txt.includes("K")) {
    return Math.round((numeral(txt).value() || 0) * 1000);
  } else if (txt.includes("M")) {
    return Math.round((numeral(txt).value() || 0) * 1000000);
  } else {
    return Math.round(numeral(txt).value() || 0);
  }
};

export const getYoutubeChannelByChannelID = async (channelId: string) => {
  try {
    if (!channelId) {
      throw null;
    }
    const yt = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });
    const resData = await yt.getChannel(channelId);
    const headerData = resData.header as {
      author: {
        id: string;
        name: string;
        thumbnails: {
          url: string;
          width: number;
          height: number;
        }[];
      };
      channel_handle: {
        toString(): string;
      };
    };
    const channelData = resData?.has_about
      ? ((await resData.getAbout()) as {
          metadata: {
            subscriber_count?: string;
            view_count?: string;
          };
        })
      : null;

    if (headerData) {
      return {
        id: -1,
        username: headerData.channel_handle.toString(),
        channelName: headerData.author.name,
        channelId: headerData.author.id,
        platform: "YOUTUBE",
        profileImgURL: headerData.author.thumbnails
          .at(0)
          ?.url.replace("s176", "s900"),
        subs: convertTextToNumberal(
          channelData?.metadata.subscriber_count?.replace(" subscribers", "") ||
            "0"
        ),
        views: convertTextToNumberal(
          channelData?.metadata.view_count?.replace(" views", "") || "0"
        ),
      };
    }
  } catch (error) {}
  return {
    id: -1,
    username: "",
    channelName: "",
    channelId,
    platform: "YOUTUBE",
    profileImgURL: "",
    subs: 0,
    views: 0,
  };
};

export const getTwicthChannelByUsername = async (username: string) => {
  try {
    if (!username) {
      throw null;
    }
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const authProvider = new AppTokenAuthProvider(
      clientId || "",
      clientSecret || ""
    );
    const apiClient = new ApiClient({ authProvider });
    const resData = await apiClient.users.getUserByName(username);

    if (resData) {
      const followers = await apiClient.channels.getChannelFollowerCount(
        resData?.id
      );
      return {
        id: -1,
        username: resData.name,
        channelName: resData.displayName,
        channelId: resData.id,
        platform: "TWITCH",
        profileImgURL: resData.profilePictureUrl,
        subs: followers || 0,
        views: 0,
      };
    }
  } catch (error) {}
  return {
    id: -1,
    username,
    channelName: "",
    channelId: "",
    platform: "TWITCH",
    profileImgURL: "",
    subs: 0,
    views: 0,
  };
};

export const getURLVideo = (video: {
  platform: "TWITCH" | "YOUTUBE";
  status: string | null;
  videoId: string | null;
  type: string | null;
  channel: {
    username: string | null;
  } | null;
}) => {
  let url = null;
  switch (video.platform) {
    case "TWITCH":
      {
        if (video.status == "FINISHED" && video.videoId) {
          url = "https://www.twitch.tv/videos/" + video.videoId;
        } else {
          url = "https://www.twitch.tv/" + video.channel?.username;
        }
      }
      break;
    default:
      {
        if (video.type == "SHORT") {
          url = "https://www.youtube.com/shorts/" + video.videoId;
        } else {
          url = "https://www.youtube.com/watch?v=" + video.videoId;
        }
      }
      break;
  }
  return url;
};

export const convertToObjectQuery = (searchParams: URLSearchParams) => {
  const query = searchParams.entries();
  const items = Array.from(query);
  let obj: any = {};
  for (const item of items) {
    obj[item[0]] = item[1].includes(",") ? item[1].split(",") : item[1];
  }
  return obj;
};

export const statusApproveText = (
  status: "ACCEPTED" | "REJECTED" | "WAITING"
) => {
  switch (status) {
    case "ACCEPTED":
      return "ข้อมูลเข้าสู่ระบบแล้ว";
    case "REJECTED":
      return "ปฏิเสธการนำเข้าสู่ระบบ";
    default:
      return "กำลังอยู่ในการตรวจสอบ";
  }
};

export const statusText = (status: any) => {
  switch (status) {
    case "ACTIVE":
      return "วีทูปเบอร์";
    case "INACTIVE_AS_VTUBER":
      return "พักการเป็นวีทูปเบอร์ชั่วคราว";
    case "RETIRED":
      return "ยุติบทบาท";
    case "DELIST":
      return "ถูกถอดออกจากระบบ";
    default:
      return null;
  }
};
