import { Client } from "discord.js"
import dotenv from "dotenv"

import { fetchGas } from "./services"

dotenv.config()

const GAS_POLLING_INTERVAL = 60 * 1000 // 60 seconds

const client = new Client()

client.on("ready", () => {
  console.log(`Bot successfully started as ${client.user?.tag} 🤖`)
})

// Updates token price on bot's nickname every X amount of time
client.setInterval(async () => {
  const data = await fetchGas()

  if (!data) return

  const { gasPriceGwei, gasPriceUsd } = data

  console.log(`Updating gas`);

  client.guilds.cache.forEach(async (guild) => {
    console.log(`Setting nickname in ${guild.me}`);
    const botMember = guild.me
    await botMember?.setNickname(`Gas: ${gasPriceGwei} gwei`)
  })

  client.user?.setActivity(
    `transfer fee: $${gasPriceUsd.toFixed(2)}`,
    { type: "WATCHING" },
  )
}, GAS_POLLING_INTERVAL)

client.login(process.env.DISCORD_API_TOKEN)
