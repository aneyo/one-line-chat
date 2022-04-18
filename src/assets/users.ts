let userColors = new Map<string, string>();

export function setUserColor(user: string, color = "inherit") {
  userColors.set(user.toLocaleLowerCase(), color);
}
export function checkForUserColor(user: string) {
  return userColors.has(user.toLocaleLowerCase());
}

export function getUserColor(user: string) {
  return userColors.get(user.toLocaleLowerCase()) || "inherit";
}
