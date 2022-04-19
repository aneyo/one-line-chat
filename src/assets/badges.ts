import { PRELOAD_BADGES } from "../params";
import { preloadImages } from "./preload";

let badgesMap = new Map<string, { [size: string]: string }>();

export async function fetchBadges(channel: string) {
  const data = (await (
    await fetch(
      `https://nightdev.com/api/1/kapchat/channels/${channel}/bootstrap`
    )
  ).json()) as {
    badges: { [badge: string]: { [type: string]: string } };
    channel: { id: string };
  };

  badgesMap = new Map(Object.entries(data.badges));
  console.log("fetched", badgesMap.size, "badges");

  if (PRELOAD_BADGES) await preloadBadges();

  return data.channel.id;
}

export function isKnownBadge(badge: string) {
  return badgesMap.has(badge);
}

export function getBadge(code: string, type: string) {
  return badgesMap.get(code)![type];
}

async function preloadBadges() {
  console.log("preloading badges...");
  const toPreload = [...badgesMap.values()]
    .map((badge) => [...Object.values(badge)])
    .flat(1);

  console.log("found", toPreload.length, "badge images to preload.");

  const preloaded = await preloadImages(toPreload);
  console.log("preloaded", preloaded, "badges.");
}
