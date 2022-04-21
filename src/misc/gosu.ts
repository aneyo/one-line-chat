import { BACKGROUND_TYPE, GOSU_ADDR } from "../params";

let ws: WebSocket | undefined = undefined;

export function connectToGOSUMEM() {
  if (!!ws) return console.warn("already connected to gosu!");
  if (BACKGROUND_TYPE === "none")
    return console.warn(
      "background type is 'none', so no need to connect to gosu!"
    );

  console.log("connecting to gosu...");

  ws = new WebSocket(GOSU_ADDR);
  ws.addEventListener("message", (e) => {
    const isInGame =
      (JSON.parse(e.data) as { menu: { state: number } }).menu.state === 2;

    if (action) action(isInGame);
  });

  ws.addEventListener("error", () => ws!.close());
  ws.addEventListener("open", () => {
    console.log("connected to gosu!");
    ws!.removeEventListener("error", () => ws!.close());
  });
}

let action: (inGame: boolean) => any | undefined;

export function onGameStatusChanged(func: (inGame: boolean) => any) {
  action = func;
}
