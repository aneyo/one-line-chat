export const query = new URLSearchParams(document.location.search);

export enum NameDisplayModeEnum {
  LocalizedName = "local",
  JustUsername = "login",
  BothNames = "combo",
  Default = "default",
}

export enum BackgroundTypeEnum {
  None = "none",
  Gradient = "gradient",
  Solid = "solid",
  Shadow = "shadow",
}

export enum EmotesQualityEnum {
  SD = "sd",
  HD = "hd",
}

export enum EmotesModesEnum {
  None = "none",
}

export type EmotesModeEnum = EmotesQualityEnum | EmotesModesEnum;

export enum BadgesModeEnum {
  None = "none",
  OnDemand = "ondemand",
  Preload = "preload",
}

export enum UserColorEnum {
  None = "none",
  Author = "author",
  Mention = "mention",
  Both = "both",
}

////////////////////////////////////////////////////////////

export const CHAT_CHANNEL = query.has("channel") ? query.get("channel")! : null;

export async function getPopularDefaultChannel() {
  try {
    const res = await fetch("https://nightdev.com/api/1/kapchat/stream");
    const data = (await res.json()) as {
      channel: string;
    };
    if (!data.channel) throw {};
    console.log(
      `current popular channel is %c${data.channel}`,
      "font-weight:bold"
    );
    return data.channel;
  } catch {
    return "xqcow";
  }
}

/* main */
export const MESSAGE_TIMEOUT = query.has("timeout")
  ? +query.get("timeout")!
  : 5000;
export const MESSAGE_SCROLL_SPEED = query.has("speed")
  ? +query.get("speed")!
  : 80;
export const NAME_DISPAY_MODE = query.has("display")
  ? (query.get("display") as NameDisplayModeEnum) || NameDisplayModeEnum.Default
  : NameDisplayModeEnum.Default;

/* style */
export const USE_DESIGN_MODE = query.has("design");
export const CHAT_MARGIN = () =>
  query.has("margin") ? +query.get("margin")! : 8;
export const CHAT_MAX_WIDTH = () =>
  query.has("bound") ? +query.get("bound")! : undefined;

/* background */
export const BACKGROUND_TYPE = query.has("bg")
  ? (query.get("bg") as BackgroundTypeEnum) || BackgroundTypeEnum.Gradient
  : BackgroundTypeEnum.Gradient;

/* gosu */
export const USE_GOSU = query.has("gosu")
  ? query.get("gosu")! || "ws://127.0.0.1:24050/ws"
  : false;
export const GOSU_ADDR = query.get("gosu")! || "ws://127.0.0.1:24050/ws";

/* misc */
export const EMOTES_MODE: EmotesModeEnum = query.has("emotes")
  ? (query.get("emotes") as EmotesModeEnum) || EmotesQualityEnum.SD
  : EmotesQualityEnum.SD;
export const BADGES_MODE: BadgesModeEnum = query.has("badges")
  ? (query.get("badges") as BadgesModeEnum) || BadgesModeEnum.OnDemand
  : BadgesModeEnum.OnDemand;
export const LOAD_EMOTES = EMOTES_MODE !== EmotesModesEnum.None;
export const LOAD_BADGES = BADGES_MODE !== BadgesModeEnum.None;
export const PRELOAD_BADGES = BADGES_MODE === BadgesModeEnum.Preload;
export const USERCOLOR = query.has("usercolor")
  ? (query.get("usercolor") as UserColorEnum) || UserColorEnum.Both
  : UserColorEnum.Both;
export const USE_USER_COLOR = USERCOLOR !== UserColorEnum.None;
export const USE_USER_COLOR_IN_AUTHORS =
  USE_USER_COLOR && USERCOLOR !== UserColorEnum.Mention;
export const USE_USER_COLOR_IN_MESSAGES =
  USE_USER_COLOR && USERCOLOR !== UserColorEnum.Author;
