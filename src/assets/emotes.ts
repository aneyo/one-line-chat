import { EMOTES_QUALITY } from "../params";
import { preloadImages } from "./preload";

let emotesMap = new Map<string, string>();

interface BTTVEmote {
  id: string;
  code: string;
  imageType: string;
}
interface FFZEmote {
  code: string;
  images: { "1x": string; "2x": string | null; "4x": string | null };
}

const TWITCH_EMOTE_SIZE = {
  sd: "1.0",
  hd: "3.0",
};

const BTTV_EMOTE_SIZE = {
  sd: "1x",
  hd: "3x",
};

export async function fetchEmotes(channel: string) {
  if (EMOTES_QUALITY === "hd") console.log("fetching HD emotes.");

  const bttvGlobalEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/emotes/global`)
  ).json()) as BTTVEmote[];

  const bttvUserData = await fetchBTTVUserEmotes(channel);

  const bttvEmotes = [
    ...bttvGlobalEmotesData,
    ...bttvUserData.channelEmotes,
    ...bttvUserData.sharedEmotes,
  ].map((emote) => [
    emote.code,
    `https://cdn.betterttv.net/emote/${emote.id}/${BTTV_EMOTE_SIZE[EMOTES_QUALITY]}`,
  ]);

  const ffzGlobalEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/frankerfacez/emotes/global`)
  ).json()) as FFZEmote[];

  const ffzUserEmotesData = (await (
    await fetch(
      `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${channel}`
    )
  ).json()) as FFZEmote[];

  const ffzEmotes = [...ffzGlobalEmotesData, ...ffzUserEmotesData].map(
    (emote) => [
      emote.code,
      EMOTES_QUALITY === "hd"
        ? emote.images["4x"] || emote.images["2x"] || emote.images["1x"]
        : emote.images["1x"],
    ]
  );

  emotesMap = new Map([...bttvEmotes, ...ffzEmotes] as [string, string][]);
  console.log("fetched", emotesMap.size, "emotes");

  await preloadEmotes();

  return emotesMap;
}

const bttvDefaultData = {
  channelEmotes: [],
  sharedEmotes: [],
};

async function fetchBTTVUserEmotes(channel: string) {
  try {
    const bttvEmotesData = (await (
      await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channel}`)
    ).json()) as {
      channelEmotes: BTTVEmote[];
      sharedEmotes: BTTVEmote[];
      message?: string;
    };

    if (bttvEmotesData.message) return bttvDefaultData;

    return bttvEmotesData;
  } catch {
    return bttvDefaultData;
  }
}

export function isEmote(sub: string) {
  return emotesMap.has(sub);
}

export function getEmote(code: string) {
  return emotesMap.get(code)!;
}

export function useTwitchEmote(
  code: string,
  format: "default" | "static" | "animated" = "default",
  theme: "dark" | "light" = "dark"
) {
  return `https://static-cdn.jtvnw.net/emoticons/v2/${code}/${format}/${theme}/${TWITCH_EMOTE_SIZE[EMOTES_QUALITY]}`;
}

export async function preloadEmotes() {
  console.log("preloading emotes...");
  const preloaded = await preloadImages([...emotesMap.values()]);
  console.log("preloaded", preloaded, "emotes.");
}
