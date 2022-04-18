# [**one-liner chat widget**](https://aneyo.github.io/one-line-chat)

## Options (as query string parameters)

- `channel=<string>` - Twitch channel to join. _defaults to `xqcow` for testing purposes._

- `timeout=<number>` - For how long (in milliseconds) the message should stay on screen. _defaults to `5000`._

- `speed=<number>` - The speed of scrolling message. _defaults to `80`._

- `nobg` - Hide background gradient. _turned off by default._

- `gosu` - Use [gosumemory](https://github.com/l3lackShark/gosumemory) to hide background gradient while playing, unless `nobg` is presented. _turned off by default._

- `hd` - Use **HD** emotes when possible. _turned off by default._

- `margin=<number>` - Message line margin in pixels. _defaults to `8` pixels._

- `bound=<number>` - Maximum width of the message line in pixels. if message is wider than bound, use scrolling. _defaults to the width of viewport._

- `design` - Show message line maximum width with color. _turned off by default._
