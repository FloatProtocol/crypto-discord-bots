import { Client } from "discord.js"
import fetch from "node-fetch"
import { logReadiness, respondToReport } from "./commands/helpers"

const COINGECKO_COIN_ENDPOINT = "https://api.coingecko.com/api/v3/coins/{{COIN-ID}}?localization=false&market_data=true&community_data=false&developer_data=false&sparkline=false"

const POLLING_INTERVAL = Number(process.env.POLLING_INTERVAL) || 60 * 1000

interface Prices {
  eth: number;
  usd: number;
}

function updatePrice(bot: Client, id: string, prices: Prices) {
  if (!prices) {
    return
  }

  bot.guilds.cache.forEach(async (guild) => {
    console.log(`[market-cap-bot: ${id}] Setting market cap $${Number(prices.usd).toLocaleString()} in ${guild.me}`)
    const botMember = guild.me
    await botMember?.setNickname(`$${Number(prices.usd).toLocaleString()}`)
  })

  bot.user?.setActivity(
    "Market Cap",
    { type: "PLAYING" },
  )
}

export const newMarketCapBot = (id: string): Client => {
  const bot = new Client()
  const botName = `market-cap-bot: ${id}`
  logReadiness(bot, botName)
  respondToReport(bot, botName)

  bot.setInterval(async () => {
    if (!bot.readyAt) {
      return
    }

    try {
      const data = await (await fetch(COINGECKO_COIN_ENDPOINT.replace("{{COIN-ID}}", id))).json()

      updatePrice(bot, id, data?.market_data?.market_cap)
    } catch (err) {
      console.error(err)
    }
  }, POLLING_INTERVAL)

  return bot
}