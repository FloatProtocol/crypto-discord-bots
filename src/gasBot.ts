import { Client } from "discord.js"
import WebSocket from "ws"
import { logReadiness, respondToReport } from "./commands/helpers"

const BOT_NAME = "gas-bot"
const GAS_NOW_WS ="wss://www.gasnow.org/ws"
const RECONNECT_INTERVAL = 60 * 1000

interface GasData {
  gasPrices: {
    rapid: number;
    fast: number;
    standard: number;
    slow: number;
  }
}

function fromGwei(gwei: number): string {
  return (gwei / 1e9).toFixed(2)
}

function updateGasPrice(bot: Client, gasData: GasData) {
  const prices = gasData.gasPrices
  bot.guilds.cache.forEach(async (guild) => {
    console.log(`[gas-bot] Setting gas ${fromGwei(prices.standard)} in ${guild.me}`)
    const botMember = guild.me
    await botMember?.setNickname(`⛽ ${fromGwei(prices.standard)} gwei`)
  })

  bot.user?.setActivity(
    `🐢 ${fromGwei(prices.slow)} || 🐇 ${fromGwei(prices.rapid)}`,
    { type: "PLAYING" },
  )
}

export const newGasBot = (): Client => {
  const bot = new Client()
  logReadiness(bot, BOT_NAME)
  respondToReport(bot, BOT_NAME)

  const connect = function() {
    const ws = new WebSocket(GAS_NOW_WS)
    ws.onopen = () => {
      console.log(`[${BOT_NAME}] Connection open to ${GAS_NOW_WS}...`)
    }
  
    ws.onmessage = (evt) => {
      const dataStr = evt.data
      const data = JSON.parse(dataStr.toString())
  
      if (data.type) {
        updateGasPrice(bot, data.data)
      }
    }
  
    ws.onclose = () => {
      console.warn("Gas socket closed, restarting...")
      setTimeout(connect, RECONNECT_INTERVAL)
    }
  }

  bot.on("ready", () => {
    console.log(`[${BOT_NAME}] Starting WS connection`)
    connect()
  })
 

  return bot
}