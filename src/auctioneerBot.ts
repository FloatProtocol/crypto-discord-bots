import { Client, MessageEmbed, TextChannel } from "discord.js"
import { BigNumber, BigNumberish, Contract, ethers } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import { logReadiness, respondToReport } from "./commands/helpers"

const BOT_NAME = "auctioneer-bot"

const AUCTION_CHANNEL = "844708279803838474"
const AUCTION_HOUSE_ADDRESS = "0x8B114b8f5A7290e6E4f64024DE6714131B4D47CA"
const AUCTION_ABI = [
  "event NewAuction(uint256 indexed round, uint256 allowance, uint256 targetFloatInEth, uint256 startBlock)",
  "function auctions(uint64) view returns (uint8 stabilisationCase, uint256 targetFloatInEth, uint256 marketFloatInEth, uint256 bankInEth, uint256 startWethPrice, uint256 startBankPrice, uint256 endWethPrice, uint256 endBankPrice, uint256 basketFactor, uint256 delta, uint256 allowance)",
  "function step() view returns (uint256)",
  "function round() view returns (uint256)",
]

const STABILISATION_HEADERS = {
  0: "Expansion",
  1: "Expansion / Restock",
  2: "Contraction / Confidence",
  3: "Contraction",
}

interface AdditionalInformation {
  round?: string;
  blockNumber?: string;
}

function formatBigNumber(number: BigNumber, units: BigNumberish, displayDecimals = 4) {
  return parseFloat(formatUnits(number, units)).toLocaleString(undefined, {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  })
}

async function constructEmbed(auctionHouse: Contract, additional?: AdditionalInformation): Promise<MessageEmbed> {
  const round = additional?.round ?? (await auctionHouse.round()).toNumber()
  const latestAuction = await auctionHouse.auctions(round)
  const step = await auctionHouse.step()

  const stabilisationHeader = STABILISATION_HEADERS[latestAuction.stabilisationCase as 0 | 1 | 2 | 3]

  const timeSignal = step >= 150
    ? "🏁"
    : step >= 100
      ? ":hourglass:"
      : ":hourglass_flowing_sand:"

  const embed = new MessageEmbed()
    .setTitle(`${timeSignal} Auction#${round} / ${stabilisationHeader}`)
    .setURL("https://floatprotocol.com/#/auction")
    .setColor("#4600ff")
    .addField("Target Price", `⧫ ${formatBigNumber(latestAuction.targetFloatInEth, 27, 8)}`, true)
    .addField("Market Price", `⧫ ${formatBigNumber(latestAuction.marketFloatInEth, 27, 8)}`, true)
    .addField("Basket Factor", `${formatBigNumber(latestAuction.basketFactor, 25, 2)}%`, true)
    .addField("Allowance", `🟣 ${formatBigNumber(latestAuction.allowance, 18, 0)}`, true)
    .addField("Usage", `🟣 ${formatBigNumber(latestAuction.delta, 18, 0)}`, true)
  
  if (additional?.blockNumber) {
    embed.setFooter(`@ ${Number(additional.blockNumber).toLocaleString()}`)
  }

  return embed
}

async function updateAuctionOrSend(auctionHouse: Contract, channel: TextChannel, bot: Client, additional?: AdditionalInformation) {
  const embed = await constructEmbed(auctionHouse, additional)
  channel.messages.fetch({ limit: 5 }).then(messages => {
    const lastMessage = messages.find((message) => message.author.discriminator === bot.user?.discriminator)

    const lastMessageWasThisRound = additional?.round && lastMessage?.embeds?.[0]?.title?.includes(additional.round)
    if (lastMessage && lastMessageWasThisRound) {
      lastMessage.edit(embed)
    } else {
      channel.send(embed)
    }
  })
}

export const newAuctioneerBot = (): Client | undefined => {
  const bot = new Client()
  logReadiness(bot, BOT_NAME)
  respondToReport(bot, BOT_NAME)
  
  if (!process.env.ETH_WS_URI) {
    console.error(`[${BOT_NAME}] Missing ETH_WS_URI`)
    return
  }

  const provider = new ethers.providers.WebSocketProvider(process.env.ETH_WS_URI)
  const auctionHouseContract = new ethers.Contract(AUCTION_HOUSE_ADDRESS, AUCTION_ABI, provider)

  auctionHouseContract.on("NewAuction", async (round, _1, _2, startBlock) => {
    const auctionChannel = bot.channels.cache.get(AUCTION_CHANNEL) as TextChannel
    console.log("New Auction Started!")
    await updateAuctionOrSend(auctionHouseContract, auctionChannel, bot, {
      round,
      blockNumber: startBlock,
    })

    const updateFor150Blocks = async (blockNumber: BigNumberish) => {
      console.log(`@ Block ${blockNumber.toLocaleString()}`)
      updateAuctionOrSend(auctionHouseContract, auctionChannel, bot, {
        round,
        blockNumber: startBlock,
      })

      if (BigNumber.from(startBlock).sub(blockNumber).gt(150)) {
        provider.off("block", updateFor150Blocks)
      }
    }

    provider.on("block", updateFor150Blocks)
  })

  bot.on("message", async (message) => {
    if (message.content.startsWith("?auction")) {
      const [,round] = message.content.split(/\s+/)
      console.log(`Received request from '${message.author.username}#${message.author.discriminator}' to check auction to '${round ?? "latest"}'`)
      await updateAuctionOrSend(auctionHouseContract, message.channel as TextChannel, bot, {round})
    }
  })

  bot.on("ready", async () => {
    await bot.channels.fetch(AUCTION_CHANNEL, true)
  })

  return bot
}