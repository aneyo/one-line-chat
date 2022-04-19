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

- `bg=<gradient|solid|none>` - Set widget background. could be overwritten using the `body.background.<bg>` class. _defaults to `gradient`._

- `gosu=<addr?>` - Use [**gosumemory**](https://github.com/l3lackShark/gosumemory) to hide background gradient while playing, unless `nobg` is presented. if no address specified, use default `ws://127.0.0.1:24050/ws`. _turned off by default._

- `badges=<preload|ondemand>` - Should widget preload all available(for current channel) twitch badges or load them on demand. `preload` may cause slow startup and some memory usage but will show badges instantly. _defaults to `ondemand`._

- `emotes=<sd|hd>` - Set emotes quality to `SD/HD` when possible. _defaults to `sd`._

- `margin=<number>` - Message line margin in pixels. _defaults to `8` pixels._

- `bound=<number>` - Maximum width of the message line in pixels. if message is wider than bound, use scrolling. _defaults to the width of viewport minus `margin*2`._

- `design` - Show message line maximum width with color. _turned off by default._

## Examples

- [`https://aneyo.github.io/one-line-chat/?channel=pondelinp&bound=815&margin=12&bg=none`](https://aneyo.github.io/one-line-chat/?channel=pondelinp&bound=815&margin=12&bg=none)
- [`https://aneyo.github.io/one-line-chat/?channel=aneyuu&bound=500&margin=15&gosu&emotes=hd`](https://aneyo.github.io/one-line-chat/?channel=aneyuu&bound=500&margin=15&gosu&emotes=hd)
