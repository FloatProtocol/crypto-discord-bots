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
    console.log(`[price-bot: ${id}] Setting price $${prices.usd} in ${guild.me}`)
    const botMember = guild.me
    await botMember?.setNickname(`$${prices.usd}`)
  })

  bot.user?.setActivity(
    `${prices.eth}Ξ`,
    { type: "PLAYING" },
  )
}

export const newPriceBot = (id: string): Client => {
  const bot = new Client()
  const botName = `price-bot: ${id}`
  logReadiness(bot, botName)
  respondToReport(bot, botName)
  
  bot.setInterval(async () => {
    if (!bot.readyAt) {
      return
    }

    try {
      const { market_data } = await (await fetch(COINGECKO_COIN_ENDPOINT.replace("{{COIN-ID}}", id))).json()
      updatePrice(bot, id, market_data?.current_price)
    } catch (err) {
      console.error(err)
    }
  }, POLLING_INTERVAL)

  return bot
}