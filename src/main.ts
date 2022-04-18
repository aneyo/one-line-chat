import { ChatClient } from "@twurple/chat";
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
import { setStyles } from "./dimensions";
import { CHANNEL, SCROLL_SPEED, TIMEOUT, USE_HD_EMOTES } from "./misc";
import "./style.scss";

document.title = "#" + CHANNEL;
console.log("will join", "#" + CHANNEL, "shortly");

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

  setUserColor(message.userInfo.userName, message.userInfo.color);

  const badgesStringJoined = [...message.userInfo.badges.entries()].map(
    ([badgeName, badgeType]) => {
      if (!isKnownBadge(badgeName)) return "";
      const badge = getBadge(badgeName, badgeType);
      if (!badge) return "";

      return `<img class="badge ${badgeName}" src="${badge}"/>`;
    }
  );

  const userPrefix =
    badgesStringJoined.length > 0
      ? `<span class="badges">${badgesStringJoined.join("")}</span>`
      : "";

  const userName = `<span class="name" style="color: ${
    message.userInfo.color
  }">${message.userInfo.displayName || message.userInfo.userName}</span>`;

  const messageContent = parseContent(message);

  el.innerHTML = `<span class="user">${userPrefix}${userName}</span><span class="message"><div class="content">${messageContent}</div></span>`;

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

function parseContent(data: TwitchPrivateMessage) {
  const parsed = data.parseEmotes();
  const message = parsed.map((part) => {
    if (part.type === "emote")
      return `<img class="emote" src="${useTwitchEmote(
        part.id,
        USE_HD_EMOTES ? "3" : "1"
      )}"/>`;

    if (part.type === "cheer") return part.name;

    return (
      encode(part.text.trim())
        /* parse emotes */
        .replace(/:\w+:|\w+/gi, (sub) => {
          if (!isEmote(sub)) return sub;
          const emote = getEmote(sub);
          return `<img class="emote" src="${emote}"/>`;
        })
        /* match eligible twitch nicknames with(or without) at sign */
        .replace(/@?\w{4,25}/gi, (sub) => {
          const nick = sub[0] === "@" ? sub.slice(1) : sub;
          if (checkForUserColor(nick))
            return `<b style="color: ${getUserColor(nick)}">${sub}</b>`;
          else if (sub[0] === "@") return `<b>${sub}</b>`;
          else return sub;
        })
    );
  });

  return message.join("&nbsp;");
}

setStyles();
const channelID = await fetchBadges(CHANNEL);
await fetchEmotes(channelID);
console.log("connecting to chat...");
await chat.connect();
