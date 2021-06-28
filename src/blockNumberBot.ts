import { Client } from "discord.js"
import fetch from "node-fetch"

const ETHERSCAN_BLOCK_NUMBER = `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`;

const POLLING_INTERVAL = Number(process.env.POLLING_INTERVAL) || 60 * 1000;

function fromHex(block: string): string {
  return parseInt(block, 16).toLocaleString();
}

function updateBlock(bot: Client, blockNumber?: string) {
  if (!blockNumber) {
    return
  }

  bot.guilds.cache.forEach(async (guild) => {
    console.log(`[block-bot] Setting block ${fromHex(blockNumber)} in ${guild.me}`);
    const botMember = guild.me
    await botMember?.setNickname(`⧫ ${fromHex(blockNumber)}`)
  })

  bot.user?.setActivity(
    `Block Number`,
    { type: "PLAYING" },
  )
}

export const newBlockNumberBot = (): Client => {
  const bot = new Client()
  // Init logs
  bot.on("ready", () => {
    console.log(`[gas-bot] Bot successfully started as '${bot.user?.tag}' 🤖`)
  })

  bot.setInterval(async () => {
    if (!bot.readyAt) {
      return;
    }

    try {
      const data = await (await fetch(ETHERSCAN_BLOCK_NUMBER)).json();
      
      updateBlock(bot, data?.result);
    } catch (err) {
      console.error(err);
    }
  }, POLLING_INTERVAL)

  return bot
}