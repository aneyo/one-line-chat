let emotesMap = new Map<string, string>();

export async function fetchEmotes(channel: string) {
  const bttvGlobalEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/emotes/global`)
  ).json()) as { code: string; id: string }[];

  const bttvEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/users/twitch/${channel}`)
  ).json()) as {
    channelEmotes: { id: string; code: string; imageType: string }[];
    sharedEmotes: { id: string; code: string; imageType: string }[];
  };

  const bttvEmotes = [
    ...bttvGlobalEmotesData.map((emote) => [
      emote.code,
      `https://cdn.betterttv.net/emote/${emote.id}/1x`,
    ]),
    ...bttvEmotesData.channelEmotes.map((emote) => [
      emote.code,
      `https://cdn.betterttv.net/emote/${emote.id}/1x`,
    ]),
    ...bttvEmotesData.sharedEmotes.map((emote) => [
      emote.code,
      `https://cdn.betterttv.net/emote/${emote.id}/1x`,
    ]),
  ];

  const ffzGlobalEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/frankerfacez/emotes/global`)
  ).json()) as {
    code: string;
    images: { "1x": string; "2x": string | null; "4x": string | null };
  }[];

  const ffzUserEmotesData = (await (
    await fetch(
      `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${channel}`
    )
  ).json()) as {
    code: string;
    images: { "1x": string; "2x": string | null; "4x": string | null };
  }[];

  const ffzEmotes = [
    ...ffzGlobalEmotesData.map((emote) => [emote.code, emote.images["1x"]]),
    ...ffzUserEmotesData.map((emote) => [emote.code, emote.images["1x"]]),
  ];

  emotesMap = new Map([...bttvEmotes, ...ffzEmotes] as [string, string][]);
  console.log("fetched", emotesMap.size, "emotes");
  return emotesMap;
}

export function isEmote(sub: string) {
  return emotesMap.has(sub);
}

export function getEmote(code: string) {
  return emotesMap.get(code)!;
}

export function useTwitchEmote(code: string, size = "1") {
  return `https://static-cdn.jtvnw.net/emoticons/v2/${code}/static/light/${
    size || "1"
  }.0`;
}
