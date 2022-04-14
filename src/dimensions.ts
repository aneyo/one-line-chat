import { DESIGN, query } from "./misc";

export const MARGIN = () => (query.has("margin") ? +query.get("margin")! : 8);
export const BOUND_WIDTH = () =>
  query.has("bound")
    ? +query.get("bound")!
    : document.documentElement.clientWidth - MARGIN() * 2;

export function setStyles() {
  document.body.classList.toggle("design", DESIGN);
  document.body.setAttribute(
    "style",
    [
      `--margin: ${MARGIN()}px`,
      query.has("bound") ? `--bound:${BOUND_WIDTH()}px` : null,
    ]
      .filter((s) => !!s)
      .join(";")
  );
}
