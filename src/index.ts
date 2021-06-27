import { Client } from "discord.js"
import dotenv from "dotenv"

import { fetchGas } from "./services"

dotenv.config()

const GAS_POLLING_INTERVAL = 60 * 1000 // 60 seconds

const gasBot = new Client()

gasBot.on("ready", () => {
  console.log(`Bot successfully started as ${gasBot.user?.tag} 🤖`)
})

// Updates token price on bot's nickname every X amount of time
gasBot.setInterval(async () => {
  const data = await fetchGas()

  if (!data) return

  const { gasPriceGwei, gasPriceUsd } = data

  console.log(`Updating gas`);

  gasBot.guilds.cache.forEach(async (guild) => {
    console.log(`Setting nickname in ${guild.me}`);
    const botMember = guild.me
    await botMember?.setNickname(`Gas: ${gasPriceGwei} gwei`)
  })

  gasBot.user?.setActivity(
    `transfer fee: $${gasPriceUsd.toFixed(2)}`,
    { type: "WATCHING" },
  )
}, GAS_POLLING_INTERVAL)

gasBot.login(process.env.DISCORD_API_TOKEN)
