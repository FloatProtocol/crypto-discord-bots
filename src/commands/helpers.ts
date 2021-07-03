import { Client } from "discord.js"

export const ADMIN_ROLE = "Admin"

export function logReadiness(bot: Client, botName: string): void {
  bot.on("ready", () => {
    console.log(`[${botName}] Bot successfully started as '${bot.user?.tag}' 🤖`)
  })
}

export function respondToReport(bot: Client, botName: string): void {
  bot.on("message", message => {
    if (message.content === "!report" && message.member?.roles.cache.find(r => r.name === ADMIN_ROLE)) {
      message.channel.send(`🖖 [${botName}] Reporting for duty.`)
    }
  })
}