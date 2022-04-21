export const query = new URLSearchParams(document.location.search);

export type NameDisplayMode = "local" | "login" | "combo" | "default";
export type BackgroundType = "gradient" | "solid" | "none";
export type EmoteQuality = "sd" | "hd";
export type EmotesMode = "none" | EmoteQuality;
export type BadgesMode = "none" | "ondemand" | "preload";

export const CHAT_CHANNEL = query.has("channel")
  ? query.get("channel")!
  : "xqcow";

/* main */
export const MESSAGE_TIMEOUT = query.has("timeout")
  ? +query.get("timeout")!
  : 5000;
export const MESSAGE_SCROLL_SPEED = query.has("speed")
  ? +query.get("speed")!
  : 80;
export const NAME_DISPAY_MODE = query.has("display")
  ? (query.get("display") as NameDisplayMode) || "default"
  : "default";

/* style */
export const USE_DESIGN_MODE = query.has("design");
export const CHAT_MARGIN = () =>
  query.has("margin") ? +query.get("margin")! : 8;
export const CHAT_MAX_WIDTH = () =>
  query.has("bound") ? +query.get("bound")! : undefined;

/* background */
export const BACKGROUND_TYPE = query.has("bg")
  ? (query.get("bg") as BackgroundType) || "gradient"
  : "gradient";

/* gosu */
export const USE_GOSU = query.has("gosu")
  ? query.get("gosu")! || "ws://127.0.0.1:24050/ws"
  : false;
export const GOSU_ADDR = query.get("gosu")! || "ws://127.0.0.1:24050/ws";

/* misc */
export const EMOTES_MODE: EmotesMode = query.has("emotes")
  ? (query.get("emotes") as EmotesMode) || "sd"
  : "sd";
export const BADGES_MODE: BadgesMode = query.has("badges")
  ? (query.get("badges") as BadgesMode) || "ondemand"
  : "ondemand";
export const LOAD_EMOTES = EMOTES_MODE !== "none";
export const LOAD_BADGES = BADGES_MODE !== "none";
export const PRELOAD_BADGES = BADGES_MODE === "preload";
