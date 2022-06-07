import {
  USE_DESIGN_MODE,
  BACKGROUND_TYPE,
  CHAT_AT_TOP,
  CHAT_MARGIN,
  CHAT_MAX_WIDTH,
  USE_SHADOWS,
} from "../params";

export function setStyles() {
  const classList = document.body.classList;

  classList.toggle("design", USE_DESIGN_MODE);
  classList.add("background", BACKGROUND_TYPE);
  classList.toggle("top", CHAT_AT_TOP);
  classList.toggle("shadow", USE_SHADOWS);

  const styles = [`--margin: ${CHAT_MARGIN}px`];

  if (CHAT_MAX_WIDTH !== undefined) styles.push(`--bound: ${CHAT_MAX_WIDTH}px`);

  document.body.setAttribute("style", styles.join(";"));
}
