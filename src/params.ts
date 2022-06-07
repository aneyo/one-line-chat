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

export enum ChatPositionEnum {
  Bottom = "bottom",
  Top = "top",
}

////////////////////////////////////////////////////////////

function getParameter<T>(key: string, defaults: T) {
  if (!query.has(key)) return defaults;
  return (query.get(key) as unknown as T) ?? defaults;
}

function getNumberParameter(key: string, defaults?: number) {
  if (!query.has(key)) return defaults;
  const value = query.get(key);
  if (value == null) return defaults;
  if (isNaN(+value)) return defaults;
  return +value;
}

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

export const CHAT_CHANNEL = query.has("channel") ? query.get("channel")! : null;

/* main */
export const MESSAGE_TIMEOUT = getNumberParameter("timeout", 5000)!;
export const MESSAGE_SCROLL_SPEED = getNumberParameter("speed", 80)!;
export const NAME_DISPAY_MODE = getParameter<NameDisplayModeEnum>(
  "display",
  NameDisplayModeEnum.Default
);

/* style */
export const USE_DESIGN_MODE = query.has("design");
export const CHAT_MARGIN = getNumberParameter("margin", 8);
export const CHAT_MAX_WIDTH = getNumberParameter("bound");

/* background */
export const BACKGROUND_TYPE = getParameter<BackgroundTypeEnum>(
  "bg",
  BackgroundTypeEnum.Gradient
);

/* gosu */
export const USE_GOSU = query.has("gosu");
export const GOSU_ADDR = getParameter<string>(
  "gosu",
  "ws://127.0.0.1:24050/ws"
);

/* misc */
export const EMOTES_MODE = getParameter<EmotesModeEnum>(
  "emotes",
  EmotesQualityEnum.SD
);
export const BADGES_MODE = getParameter<BadgesModeEnum>(
  "badges",
  BadgesModeEnum.OnDemand
);
export const USERCOLOR = getParameter<UserColorEnum>(
  "usercolor",
  UserColorEnum.Both
);
export const CHAT_POS = getParameter<ChatPositionEnum>(
  "pos",
  ChatPositionEnum.Bottom
);
export const LOAD_EMOTES = EMOTES_MODE !== EmotesModesEnum.None;
export const LOAD_BADGES = BADGES_MODE !== BadgesModeEnum.None;
export const PRELOAD_BADGES = BADGES_MODE === BadgesModeEnum.Preload;
export const USE_USER_COLOR = USERCOLOR !== UserColorEnum.None;
export const USE_USER_COLOR_IN_AUTHORS =
  USE_USER_COLOR && USERCOLOR !== UserColorEnum.Mention;
export const USE_USER_COLOR_IN_MESSAGES =
  USE_USER_COLOR && USERCOLOR !== UserColorEnum.Author;
export const CHAT_AT_TOP = CHAT_POS === ChatPositionEnum.Top;
