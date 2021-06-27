const { Client } = require('discord.js')
const dotenv = require('dotenv')

const { fetchData } = require('./fetchData')

dotenv.config()

const client = new Client()

// eslint-disable-next-line
client.on('ready', () => console.log(`Bot successfully started as ${client.user.tag} 🤖`))

// Updates token price on bot's nickname every X amount of time
client.setInterval(async () => {
  const data = await fetchData()

  if (!data) return

  const { gasPriceGwei, gasPriceUsd } = data

  client.guilds.cache.forEach(async (guild) => {
    const botMember = guild.me
    await botMember.setNickname(`Gas: ${gasPriceGwei} gwei`)
  })

  client.user.setActivity(
    `transfer fee: $${parseFloat(gasPriceUsd).toFixed(2)}`,
    { type: 'WATCHING' },
  )
}, 1 * 60 * 1000)

client.login(process.env.DISCORD_API_TOKEN)
