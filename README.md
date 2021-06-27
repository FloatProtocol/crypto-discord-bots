<div align="center">
  <img src="https://user-images.githubusercontent.com/77080072/123562132-a18e5480-d7a4-11eb-9684-edb6be686142.png" width="100">
  <img src="https://user-images.githubusercontent.com/77080072/123562136-a7843580-d7a4-11eb-8311-f3287d1aa0fa.png" width="100">
  <img src="https://user-images.githubusercontent.com/77080072/123562141-ac48e980-d7a4-11eb-9145-a74e9a6f0bbc.png" width="100">
  <img src="https://user-images.githubusercontent.com/77080072/123562151-bbc83280-d7a4-11eb-9968-d777f3218f21.png" width="100">
</div>

<h1 align="center">Crypto Discord Bots</h1>

<h3 align="center">
  See it in action @ <a href="https://discord.gg/nVCZacJJqM">Float Protocol</a>
</h3>

There are many great discord bots out there ([ETH Price Gas Bot](https://github.com/hernandoagf/eth-gas-price-bot) inspired this!), however we wanted to cover a few more common usecases and provide a jumping block for new creative bots.

## Quickstart

<a href="https://heroku.com/deploy?template=https://github.com/floatprotocol/yellow-submarine">
<img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>

[See this guide on how to obtain a DISCORD_API_KEY](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token).

## Example: Gas Bot
![example](https://user-images.githubusercontent.com/77080072/123562351-32b1fb00-d7a6-11eb-95fb-e7a47a17dcd5.gif)

Live Gas Bot, uses GasNow Web Socket for an update every 8s. This works out of the box without any custom deployments.

1. Add Gas Bot to your server with [OAuth](https://discord.com/oauth2/authorize?client_id=858714564803166248&scope=bot&permissions=67109888).
2. Setup a new "Role" e.g. "On Stage" which you can add your bots to and ensure they can access all the channels you want the bots to be displayed on.
