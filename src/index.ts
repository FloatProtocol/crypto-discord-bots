
import dotenv from "dotenv"

import { newGasBot } from "./gasBot";

dotenv.config()

const gasBot = newGasBot()
gasBot.login(process.env.GAS_BOT_API_KEY)
