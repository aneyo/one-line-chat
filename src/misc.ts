export const query = new URLSearchParams(document.location.search);
export const DESIGN = query.has("design");
export const GOSU = query.has("gosu");

export const CHANNEL = query.has("channel") ? query.get("channel")! : "xqcow";
export const TIMEOUT = query.has("timeout") ? +query.get("timeout")! : 5000;
export const SCROLL_SPEED = query.has("speed") ? +query.get("speed")! : 80;
export const USE_GRADIENT = !query.has("nobg");
export const USE_HD_EMOTES = query.has("hd");

if (!USE_GRADIENT) document.body.classList.add("nobg");
else if (GOSU) {
  const ws = new WebSocket("ws://127.0.0.1:24050/ws");
  ws.onmessage = (e) => {
    const isInGame =
      (JSON.parse(e.data) as { menu: { state: number } }).menu.state === 2;

    document.body.classList.toggle("ingame", isInGame);
  };

  ws.addEventListener("error", close);
  ws.onopen = () => {
    ws.removeEventListener("error", close);
  };

  function close() {
    ws.close();
  }
}
