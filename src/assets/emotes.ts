import { USE_HD_EMOTES } from "../misc";

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

export async function fetchEmotes(channel: string) {
  const emoteSize = USE_HD_EMOTES ? "3" : "1";

  const bttvGlobalEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/emotes/global`)
  ).json()) as BTTVEmote[];

  const bttvEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channel}`)
  ).json()) as {
    channelEmotes: BTTVEmote[];
    sharedEmotes: BTTVEmote[];
  };

  const bttvEmotes = [
    ...bttvGlobalEmotesData,
    ...bttvEmotesData.channelEmotes,
    ...bttvEmotesData.sharedEmotes,
  ].map((emote) => [
    emote.code,
    `https://cdn.betterttv.net/emote/${emote.id}/${emoteSize}x`,
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
      USE_HD_EMOTES
        ? emote.images["4x"] || emote.images["2x"] || emote.images["1x"]
        : emote.images["1x"],
    ]
  );

  emotesMap = new Map([...bttvEmotes, ...ffzEmotes] as [string, string][]);
  console.log("fetched", emotesMap.size, "emotes");

  await preloadEmotes();

  return emotesMap;
}

export function isEmote(sub: string) {
  return emotesMap.has(sub);
}

export function getEmote(code: string) {
  return emotesMap.get(code)!;
}

export function useTwitchEmote(
  code: string,
  size = "1",
  format: "default" | "static" | "animated" = "default",
  theme: "dark" | "light" = "dark"
) {
  return `https://static-cdn.jtvnw.net/emoticons/v2/${code}/${format}/${theme}/${
    size || "1"
  }.0`;
}

let preloaded = [];

export async function preloadEmotes() {
  console.log("preloading emotes...");

  preloaded = (
    (await Promise.allSettled(
      [...emotesMap.values()].map((emote) => asyncImageLoader(emote))
    )) as { status: string; value: HTMLImageElement }[]
  )
    .filter((emote) => emote.status === "fulfilled")
    .map((emote) => emote.value);

  console.log("preloaded", preloaded.length, "emotes.");
}

function asyncImageLoader(url: string) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
  });
}
