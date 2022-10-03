const hre = require("hardhat");

async function main() {

  const accounts = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("Token");
  const Exchange = await hre.ethers.getContractFactory("Exchange")
  
  const token1 = await Token.deploy("TokenA", "TokenA", "100000");
  await token1.deployed()

  const token2 = await Token.deploy("mDai", "mDai", "100000")
  await token2.deployed()

  const token3 = await Token.deploy("mETH", "mETH", "100000")
  await token3.deployed()

  const exchange = await Exchange.deploy(accounts[1].address, 1)
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
