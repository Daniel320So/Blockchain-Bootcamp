const hre = require("hardhat");
const ethers = require("ethers");
const exchangeContract = require("../artifacts/contracts/Exchange.sol/Exchange.json")
const tokenContract = require("../artifacts/contracts/Token.sol/Token.json")


const rpc = "https://data-seed-prebsc-1-s3.binance.org:8545"
const privateKey = "f1310fa932f768e410a57251f526186c27e4a28607b2db868b463354c55ba365" //This key is for testnet only

async function main() {

  const provider = new ethers.providers.JsonRpcProvider(rpc)

  const wallet = new ethers.Wallet(privateKey, provider)

  const Token = new ethers.ContractFactory(tokenContract.abi, tokenContract.bytecode, wallet)
  const Exchange = new ethers.ContractFactory(exchangeContract.abi, exchangeContract.bytecode, wallet)

   const token1 = await Token.deploy("Daniel", "DAN", "100000");
  await token1.deployed()
  console.log(await token1.symbol())
  

  const token2 = await Token.deploy("mDai", "mDai", "100000")
  await token2.deployed()

  const token3 = await Token.deploy("mETH", "mETH", "100000")
  await token3.deployed()

  const exchange = await Exchange.deploy(wallet.address, 1)
  await exchange.deployed()
 

  console.log(
    token1.address,
    token2.address,
    token3.address,
    exchange.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
