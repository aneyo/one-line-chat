import { ChatClient, ChatUser } from "@twurple/chat";
import { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { encode } from "html-entities";
import { fetchBadges, getBadge, isKnownBadge } from "./assets/badges";
import {
  fetchEmotes,
  getEmote,
  isEmote,
  useTwitchEmote,
} from "./assets/emotes";
import { checkForUserColor, getUserColor, setUserColor } from "./assets/users";
import { connectToGOSUMEM, onGameStatusChanged } from "./misc/gosu";
import {
  CHAT_CHANNEL,
  NAME_DISPAY_MODE,
  MESSAGE_SCROLL_SPEED,
  MESSAGE_TIMEOUT,
  USE_GOSU,
  LOAD_EMOTES,
  LOAD_BADGES,
  getPopularDefaultChannel,
  NameDisplayModeEnum,
  USE_USER_COLOR_IN_MESSAGES,
  USE_USER_COLOR_IN_AUTHORS,
} from "./params";

import "./styles/main.scss";
import "./styles/debug.scss";
import "./styles/background.scss";
import { setStyles } from "./assets/style";

const block = document.getElementById("chat")!;
const chat = new ChatClient({});

chat.onConnect(() => console.log("connected to chat."));
chat.onJoin((e) => console.log("joined", e));

let messages: TwitchPrivateMessage[] = [];
let current: TwitchPrivateMessage | undefined = undefined;
let showing = false;
let showTimer = -1;

function messageHandler(
  _: string,
  __: string,
  ___: string,
  data: TwitchPrivateMessage
) {
  messages.push(data);
  if (!showing) nextMessage();
}

chat.onAction(messageHandler);
chat.onMessage(messageHandler);

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

  document.body.classList.toggle("hide", isInGame);
  setUserColor(message.userInfo.userName, message.userInfo.color);

  const badgesStringJoined = LOAD_BADGES
    ? [...message.userInfo.badges.entries()].map(([badgeName, badgeType]) => {
        if (!isKnownBadge(badgeName)) return "";
        const badge = getBadge(badgeName, badgeType);
        if (!badge) return "";

        return `<img class="badge ${badgeName}" src="${badge}"/>`;
      })
    : [];

  const userPrefix =
    badgesStringJoined.length > 0
      ? `<span class="badges">${badgesStringJoined.join("")}</span>`
      : "";

  const userNameString = USE_USER_COLOR_IN_AUTHORS
    ? `<span class="name" style="color: ${
        message.userInfo.color
      }">${resolveUsername(message.userInfo)}</span>`
    : `<span class="name">${resolveUsername(message.userInfo)}</span>`;

  const messageContent = parseContent(message);

  el.innerHTML = `<span class="user">${userPrefix}${userNameString}</span><span class="message"><div class="content">${messageContent}</div></span>`;

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
    }, MESSAGE_TIMEOUT);
    return;
  }

  const path = cl - ml;

  // set animation
  const speed = (path / MESSAGE_SCROLL_SPEED) * 1000;
  const halfTimeout = MESSAGE_TIMEOUT / 2;
  const scrollStart = Date.now();

  contel.setAttribute("style", `--dur: ${speed}ms; --target: ${path}px`);
  contel.addEventListener(
    "animationend",
    () => {
      // end of scrolling animation
      const scrollTime = Date.now() - scrollStart;
      const scrollTimeout =
        scrollTime > halfTimeout
          ? halfTimeout
          : halfTimeout + (halfTimeout - scrollTime);

      showTimer = window.setTimeout(() => {
        hideMessage(current!);

        if (messages.length > 0) nextMessage();
      }, scrollTimeout);
    },
    {
      once: true,
    }
  );

  contel.classList.add("scroll");
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
  document.body.classList.toggle("hide", messages.length < 1);

  showing = false;
}

function resolveUsername(user: ChatUser) {
  switch (NAME_DISPAY_MODE) {
    case NameDisplayModeEnum.JustUsername:
      return user.userName;

    case NameDisplayModeEnum.BothNames:
      if (user.displayName.toLocaleLowerCase() === user.userName)
        return user.displayName;
      else return `@${user.displayName} (${user.displayName})`;

    case NameDisplayModeEnum.LocalizedName:
    default:
      return user.displayName || user.userName;
  }
}

function parseContent(data: TwitchPrivateMessage) {
  // * eh
  data.content.value = data.content.value.replaceAll(/\u0001(\w+)?/gi, "");

  if (!LOAD_EMOTES) return data.content.value;

  const parsed = data.parseEmotes();
  const message = parsed.map((part) => {
    if (part.type === "emote")
      return `<img class="emote" src="${useTwitchEmote(part.id)}"/>`;

    if (part.type === "cheer") return part.name;

    return (
      encode(part.text)
        /* parse emotes */
        .replace(/:\w+:|\w+/gi, (sub) => {
          if (!isEmote(sub)) return sub;
          const emote = getEmote(sub);
          return `<img class="emote" src="${emote}"/>`;
        })
        /* match eligible twitch nicknames with(or without) at sign */
        .replace(/@?\w{4,25}/gi, (sub) => {
          const nick = sub[0] === "@" ? sub.slice(1) : sub;
          if (USE_USER_COLOR_IN_MESSAGES && checkForUserColor(nick))
            return `<b style="color: ${getUserColor(nick)}">${sub}</b>`;
          else if (sub[0] === "@") return `<b>${sub}</b>`;
          else return sub;
        })
        /* trim spaces */
        .replace(/\s+/, " ")
        /* haha, replace spaces between nodes with HTML encoded ones */
        .replace(/>\s</, ">&nbsp;<")
    );
  });

  return message.join("");
}

setStyles();

// * hide background at start
document.body.classList.toggle("hide", true);

let isInGame = false;
onGameStatusChanged((inGame) => {
  isInGame = inGame;
  if (showing || messages.length > 0)
    document.body.classList.toggle("hide", inGame);
  else document.body.classList.toggle("hide", true);
});

chat.onConnect(async function () {
  const channel = (
    CHAT_CHANNEL ?? (await getPopularDefaultChannel())
  ).toLocaleLowerCase();

  document.title = "#" + channel;
  console.log(`fetching data for %c${channel}`, "font-weight:bold");

  const channelID = await fetchBadges(channel);
  await fetchEmotes(channelID);

  chat.join(channel);
});

console.log("connecting to chat...");
await chat.connect();
if (USE_GOSU) connectToGOSUMEM();
