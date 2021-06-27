import dotenv from "dotenv"
import fetch from "node-fetch"

dotenv.config()

interface Gas {
  gasPriceUsd: number;
  gasPriceGwei: number;
}

export async function fetchGas(): Promise<Gas>  {
  try {
    const {
      result: { ProposeGasPrice: gasPriceGwei },
    } = await (
      await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`,
      )
    ).json()

    const {
      result: { ethusd: ethPrice },
    } = await (
      await fetch(
        `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`,
      )
    ).json()

    const gasPriceUsd = +gasPriceGwei * 0.000000001 + ethPrice * 21000

    return { gasPriceGwei, gasPriceUsd }
  } catch (err) {
    console.log(err)
    Promise.reject(err)
  }

  return Promise.reject();
}

export default {}
