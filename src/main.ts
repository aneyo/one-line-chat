import { ChatClient } from "@twurple/chat";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { encode } from "html-entities";
import "./style.scss";

const channel = document.location.hash.slice(1) || "xqcow";
const viewTime = 5000;

console.log("connecting to", channel);
document.title = "#" + channel;

const block = document.getElementById("shower")!;
const chat = new ChatClient({ channels: [channel] });

chat.onConnect(() => console.log("connected to chat."));
chat.onJoin((e) => console.log("joined", e));

let messages: TwitchPrivateMessage[] = [];
let current: TwitchPrivateMessage | undefined = undefined;
let showing = false;
let showTimer = -1;

chat.onMessage((_, __, ___, data) => {
  messages.push(data);
  if (!showing) nextMessage();
});

chat.onMessageRemove((_, id) => {
  messages = messages.filter((msg) => msg.id !== id);
  if (current && current.id === id) {
    clearTimeout(showTimer);
    hideMessage(current);
  }
});

chat.onBan((_, user) => onBan(user));
chat.onTimeout((_, user) => onBan(user));

chat.onChatClear(() => {
  messages = [];
  if (current) {
    clearTimeout(showTimer);
    hideMessage(current);
  }
});

function onBan(user: string) {
  messages = messages.filter((msg) => msg.userInfo.userName !== user);
  if (current && current.userInfo.userName === user) {
    clearTimeout(showTimer);
    hideMessage(current);
  }
}

function nextMessage() {
  if (messages.length < 1) {
    showing = false;
    return;
  }

  showing = true;

  current = messages.shift()!;
  showMessage(current);

  showTimer = window.setTimeout(() => {
    hideMessage(current!);
    showing = false;

    if (messages.length > 0) nextMessage();
  }, viewTime);
}

function showMessage(message: TwitchPrivateMessage) {
  const el = document.createElement("div");

  const badgesString = [...message.userInfo.badges.entries()].map((b) => {
    if (!badgesMap.has(b[0])) return "";
    const badge = badgesMap.get(b[0])!;
    if (!badge[b[1]]) return "";
    return `<span class="badge ${b[0]}" style="background-image: url(${
      badge[b[1]]
    })"></span>`;
  });
  if (badgesString.length > 0)
    console.log(message.userInfo.userName, badgesString);

  const prefix =
    badgesString.length > 0
      ? `<span class="badges">${badgesString.join("")}</span>`
      : "";

  const username = `<span class="name" style="color: ${message.userInfo.color}">${message.userInfo.userName}</span>`;

  const content = parseContent(message);
  console.log(content);

  el.innerHTML = `<span class="user">${prefix}${username}</span><span class="message"><span class="content">${content}</span></span>`;
  el.className = "line show";
  el.setAttribute("id", message.id);

  block.appendChild(el);
}
function hideMessage(message: TwitchPrivateMessage) {
  // TODO:
  const el = document.getElementById(message.id)!;
  el.classList.remove("show");
  el.addEventListener("animationend", () => block.removeChild(el));
  el.classList.add("hide");
}

let badgesMap = new Map<string, { [size: string]: string }>();
let emotesMap = new Map<string, string>();

function parseContent(data: TwitchPrivateMessage) {
  const parsed = data.parseEmotes();
  const message = parsed.map((part) => {
    if (part.type === "emote")
      return `<span class="emote" style="background-image: url(https://static-cdn.jtvnw.net/emoticons/v2/${part.id}/static/light/1.0)"></span>`;

    if (part.type === "cheer") return part.name;

    return encode(part.text)
      .trim()
      .replace(/\w+/gi, (sub, o, str: string) => {
        console.log(sub, o, str);

        if (!emotesMap.has(sub)) return sub;
        const emote = emotesMap.get(sub)!;
        let template = `<span class="emote" style="background-image: url(${emote})"></span>`;
        template =
          str.charAt(o + sub.length) === " " ? template + "&nbsp;" : template;

        return template;
      });
  });

  return message.join("&nbsp;");
}

async function prepare() {
  const channel_data = (await (
    await fetch(
      `https://nightdev.com/api/1/kapchat/channels/${channel}/bootstrap`
    )
  ).json()) as {
    badges: { [badge: string]: { [size: string]: string } };
    channel: { id: string };
  };

  badgesMap = new Map(Object.entries(channel_data.badges));

  const bttvEmotesData = (await (
    await fetch(
      `https://api.betterttv.net/3/cached/users/twitch/${channel_data.channel.id}`
    )
  ).json()) as {
    channelEmotes: { id: string; code: string; imageType: string }[];
    sharedEmotes: { id: string; code: string; imageType: string }[];
  };

  const bttvEmotes = [
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
      `https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${channel_data.channel.id}`
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
  console.log(emotesMap);

  await chat.connect();
}

prepare();
