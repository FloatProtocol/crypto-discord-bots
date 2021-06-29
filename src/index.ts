
import dotenv from "dotenv"
import { newBlockNumberBot } from "./blockNumberBot"

import { newGasBot } from "./gasBot"
import { newMarketCapBot } from "./marketCapBot"
import { newPriceBot } from "./priceBot"

dotenv.config()

const BANK_ID = "float-protocol"
const FLOAT_ID = "float-protocol-float"

const gasBot = newGasBot()
const blockBot = newBlockNumberBot()
const bankMarketCapBot = newMarketCapBot(BANK_ID)
const bankPriceBot = newPriceBot(BANK_ID)
const floatMarketCapBot = newMarketCapBot(FLOAT_ID)
const floatPriceBot = newPriceBot(FLOAT_ID)

// const auctionBot = newAuctioneerBot()

// Logins
gasBot.login(process.env.GAS_BOT_API_KEY)
blockBot.login(process.env.BLOCK_BOT_API_KEY)

bankMarketCapBot.login(process.env.BANK_MC_BOT_API_KEY)
floatMarketCapBot.login(process.env.FLOAT_MC_BOT_API_KEY)

bankPriceBot.login(process.env.BANK_PRICE_BOT_API_KEY)
floatPriceBot.login(process.env.FLOAT_PRICE_BOT_API_KEY)

// auctionBot.login(process.env.AUCTIONEER_BOT_API_KEY)