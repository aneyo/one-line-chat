import { ChatClient } from "@twurple/chat";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { encode } from "html-entities";
import { setStyles } from "./dimensions";
import { CHANNEL, SCROLL_SPEED, TIMEOUT } from "./misc";
import "./style.scss";

console.log("connecting to", CHANNEL);
document.title = "#" + CHANNEL;

const block = document.getElementById("chat")!;
const chat = new ChatClient({ channels: [CHANNEL] });

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

function nextMessage(): any {
  if (messages.length < 1) {
    showing = false;
    return;
  }

  showing = true;

  current = messages.shift()!;

  showMessage(current);
}

function showMessage(message: TwitchPrivateMessage) {
  const el = document.createElement("div");

  userColors.set(message.userInfo.userName, message.userInfo.color || "");

  const badgesString = [...message.userInfo.badges.entries()].map((b) => {
    if (!badgesMap.has(b[0])) return "";
    const badge = badgesMap.get(b[0])!;
    if (!badge[b[1]]) return "";
    return `<span class="badge ${b[0]}" style="background-image: url(${
      badge[b[1]]
    })"></span>`;
  });

  const prefix =
    badgesString.length > 0
      ? `<span class="badges">${badgesString.join("")}</span>`
      : "";

  const username = `<span class="name" style="color: ${message.userInfo.color}">${message.userInfo.userName}</span>`;

  const content = parseContent(message);

  el.innerHTML = `<span class="user">${prefix}${username}</span><span class="message"><div class="content">${content}</div></span>`;
  el.className = "line show";
  el.setAttribute("id", message.id);

  block.appendChild(el);

  // * check if text is wider than bounds

  const contel = el.getElementsByClassName("content")[0];
  const cl = contel.scrollWidth;
  const ml = el.getElementsByClassName("message")[0].clientWidth;

  if (cl <= ml) {
    showTimer = window.setTimeout(() => {
      hideMessage(current!);

      if (messages.length > 0) nextMessage();
    }, TIMEOUT);
    return;
  }

  const path = cl - ml;

  // set animation
  const speed = (path / SCROLL_SPEED) * 1000;
  const timeout = cl / ml;

  contel.setAttribute("style", `--dur: ${speed}ms; --target: ${path}px`);
  contel.addEventListener(
    "animationend",
    () => {
      contel.addEventListener(
        "animationend",
        () => {
          // end with timer
          showTimer = window.setTimeout(() => {
            hideMessage(current!);

            if (messages.length > 0) nextMessage();
          }, TIMEOUT / 2 / timeout);
          return;
        },
        {
          once: true,
        }
      );

      showTimer = window.setTimeout(() => {
        // set second animation
        contel.classList.remove("scroll");
        contel.classList.add("scroll-return");
      }, 1500);
    },
    {
      once: true,
    }
  );

  showTimer = window.setTimeout(() => contel.classList.add("scroll"), 1500);
}
function hideMessage(message: TwitchPrivateMessage) {
  const el = document.getElementById(message.id);
  if (!el) return;

  el.addEventListener("animationend", () =>
    el
      ? block.removeChild(el)
      : console.warn("cannot remove", el, "from", block)
  );
  el.className = "line hide";

  showing = false;
}

let badgesMap = new Map<string, { [size: string]: string }>();
let emotesMap = new Map<string, string>();
let userColors = new Map<string, string>();

function parseContent(data: TwitchPrivateMessage) {
  const parsed = data.parseEmotes();
  const message = parsed.map((part) => {
    if (part.type === "emote")
      return `<span class="emote" style="background-image: url(https://static-cdn.jtvnw.net/emoticons/v2/${part.id}/static/light/1.0)"></span>`;

    if (part.type === "cheer") return part.name;

    return encode(part.text)
      .trim()
      .replace(/:\w+:|\w+/gi, (sub, o, str: string) => {
        if (!emotesMap.has(sub)) return sub;
        const emote = emotesMap.get(sub)!;
        let template = `<span class="emote" style="background-image: url(${emote})"></span>`;
        template =
          str.charAt(o + sub.length) === " " ? template + "&nbsp;" : template;

        return template;
      })
      .replace(/@\w+/gi, (sub) => {
        if (userColors.has(sub.slice(1)))
          return `<b style="color: ${userColors.get(sub.slice(1))}">${sub}</b>`;
        return `<b>${sub}</b>`;
      });
  });

  return message.join("&nbsp;");
}

async function prepare() {
  const channel_data = (await (
    await fetch(
      `https://nightdev.com/api/1/kapchat/channels/${CHANNEL}/bootstrap`
    )
  ).json()) as {
    badges: { [badge: string]: { [size: string]: string } };
    channel: { id: string };
  };

  badgesMap = new Map(Object.entries(channel_data.badges));

  const bttvGlobalEmotesData = (await (
    await fetch(`https://api.betterttv.net/3/cached/emotes/global`)
  ).json()) as { code: string; id: string }[];

  const bttvEmotesData = (await (
    await fetch(
      `https://api.betterttv.net/3/cached/users/twitch/${channel_data.channel.id}`
    )
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

  await chat.connect();
}

setStyles();
prepare();
