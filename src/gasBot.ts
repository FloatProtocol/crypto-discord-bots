import { Client } from "discord.js"
import WebSocket from "ws"

const GAS_NOW_WS ='wss://www.gasnow.org/ws';

interface GasData {
  gasPrices: {
    rapid: number;
    fast: number;
    standard: number;
    slow: number;
  }
}

function fromGwei(gwei: number): string {
  return (gwei / 1e9).toFixed(2);
}

function updateGasPrice(bot: Client, gasData: GasData) {
  const prices = gasData.gasPrices;
  bot.guilds.cache.forEach(async (guild) => {
    console.log(`[gas-bot] Setting gas ${fromGwei(prices.standard)} in ${guild.me}`);
    const botMember = guild.me
    await botMember?.setNickname(`⛽ ${fromGwei(prices.standard)} gwei`)
  })

  bot.user?.setActivity(
    `🐢 ${fromGwei(prices.slow)} || 🐇 ${fromGwei(prices.rapid)}`,
    { type: "PLAYING" },
  )
}

export const newGasBot = (): Client => {
  const gasBot = new Client()
  const gasWs = new WebSocket(GAS_NOW_WS)

  // Init logs
  gasBot.on("ready", () => {
    console.log(`[gas-bot] Bot successfully started as '${gasBot.user?.tag}' 🤖`)
  })
  gasWs.onopen = (evt) => {
    console.log(`[gas-bot] Connection open to ${GAS_NOW_WS}...`);
  };

  gasWs.onmessage = (evt) => {
    const dataStr = evt.data;
    const data = JSON.parse(dataStr.toString());

    if (data.type) {
      updateGasPrice(gasBot, data.data);
    }
  }

  return gasBot
}