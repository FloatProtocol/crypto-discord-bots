
import { Client } from "discord.js"
import dotenv from "dotenv"

import { newBlockNumberBot } from "./blockNumberBot"
import { newGasBot } from "./gasBot"
import { newMarketCapBot } from "./marketCapBot"
import { newPriceBot } from "./priceBot"
import { newAuctioneerBot } from "./auctioneerBot"

dotenv.config()

const BANK_ID = "float-protocol"
const FLOAT_ID = "float-protocol-float"

interface BotFactory {
  init(...args: unknown[]): Client | undefined;
  args?: unknown[];
  key?: string;
}

const BOT_FACTORIES: BotFactory[] = [
  {
    init: newGasBot,
    key: process.env.GAS_BOT_API_KEY,
  },
  {
    init: newBlockNumberBot,
    key: process.env.BLOCK_BOT_API_KEY,
  },
  {
    init: newMarketCapBot,
    args: [BANK_ID],
    key: process.env.BANK_MC_BOT_API_KEY
  },
  {
    init: newMarketCapBot,
    args: [FLOAT_ID],
    key: process.env.FLOAT_MC_BOT_API_KEY
  },
  {
    init: newPriceBot,
    args: [BANK_ID],
    key: process.env.BANK_PRICE_BOT_API_KEY
  },
  {
    init: newPriceBot,
    args: [FLOAT_ID],
    key: process.env.FLOAT_PRICE_BOT_API_KEY
  },
  {
    init: newAuctioneerBot,
    key: process.env.AUCTIONEER_BOT_API_KEY
  }
]

function buildBot(factory: BotFactory) {
  if (!factory.key) {
    return
  } 

  const bot = factory.init(factory.args)

  if (!bot) {
    return
  }

  bot.login(factory.key)
  return bot
}

BOT_FACTORIES.forEach(buildBot)