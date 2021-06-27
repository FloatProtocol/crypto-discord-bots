const dotenv = require('dotenv')
const fetch = require('node-fetch')

dotenv.config()

exports.fetchGas = async () => {
  try {
    const { result: { ProposeGasPrice: gasPriceGwei } } = await (await fetch(
      `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${process.env.ETHERSCAN_API_KEY}`,
    )).json()

    const { result: { ethusd: ethPrice } } = await (await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`,
    )).json()

    const gasPriceUsd = +gasPriceGwei * 0.000000001 + ethPrice * 21000

    return { gasPriceGwei, gasPriceUsd }
  } catch (err) {
    console.log(err)
    return undefined
  }
}
