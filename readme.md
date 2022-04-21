# [**one-liner chat widget**](https://aneyo.github.io/one-line-chat)

![](./poggers.png)

## Options _(as query string parameters)_

- `channel=<string>` - Twitch channel to join. _defaults to `xqcow` for testing purposes._

- `timeout=<number>` - For how long (in milliseconds) the message should stay on screen. _defaults to `5000` milliseconds._

- `speed=<number>` - The speed of scrolling message in pixels per second. _defaults to `80` px/s._

- `display=<local|login|combo>` - How user nickname should be displayed. _defaults to `local`._

  - `login` - will display user `ayaya` as it is.
  - `local` - will display user `ayaya` as `あやや` or `aYAYA`.
  - `combo` - will display user `ayaya` as `あやや (ayaya)` or `aYAYA`.

- `bg=<gradient|solid|none>` - Set widget background. could be overwritten using the `body.background.<bg>::before` css selector. _defaults to `gradient`._

- `gosu=<addr?>` - Use [**gosumemory**](https://github.com/l3lackShark/gosumemory) to hide background gradient while playing. works only with `bg` set to `gradient|solid`. if no address specified, use default `ws://127.0.0.1:24050/ws`. _turned off by default._

- `badges=<preload|ondemand|none>` - Should widget preload all available(for current channel) twitch badges or load them on demand. `preload` may cause slow startup and some memory usage but will show badges instantly. if set to `none`, badges will be hidden. _defaults to `ondemand`._

- `emotes=<none|sd|hd>` - Set emotes quality to `SD/HD` when possible. if set to `none`, no emotes will be parsed. _defaults to `sd`._

- `margin=<number>` - Message line margin in pixels. _defaults to `8` pixels._

- `bound=<number>` - Maximum width of the message line in pixels. if message is wider than bound, use scrolling. _defaults to the width of viewport minus `margin*2`._

- `design` - Show message line maximum width with color. used for debug. _turned off by default._

## Examples

- [`https://aneyo.github.io/one-line-chat/?channel=pondelinp&bound=815&margin=12&bg=none`](https://aneyo.github.io/one-line-chat/?channel=pondelinp&bound=815&margin=12&bg=none)
- [`https://aneyo.github.io/one-line-chat/?channel=aneyuu&bound=500&margin=15&gosu&emotes=hd`](https://aneyo.github.io/one-line-chat/?channel=aneyuu&bound=500&margin=15&gosu&emotes=hd)

## Background overwriting

CSS Template:

```css
/* bg=gradient */
body.background.gradient::before {
  content: "";

  width: 100vw;
  height: 100vh;

  top: 0;
  left: 0;
  position: absolute;

  z-index: -1;

  opacity: 1;
  transition: opacity 250ms ease-in-out;

  background-image: linear-gradient(
    hsla(0, 0%, 0%, 0) 50%,
    hsla(0, 0%, 0%, 0.9) 95%,
    #000 105%
  );
}

/* bg=solid */
body.background.solid::before {
  content: "";

  width: 100vw;
  height: calc(var(--margin) * 2 + 1.25em);

  left: 0;
  bottom: 0;
  position: absolute;

  z-index: -1;

  opacity: 1;
  transition: opacity 250ms ease-in-out;

  background-color: hsla(0, 0%, 0%, 0.5);
}

/* when background is hidden */
body.background.hide::before {
  opacity: 0;
}
```
