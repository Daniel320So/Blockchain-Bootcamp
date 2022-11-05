const { BigNumber } = require("ethers");
const hre = require("hardhat");

async function main() {

    const accounts = await hre.ethers.getSigners();
    const Token = await hre.ethers.getContractFactory("Token");
    const Exchange = await hre.ethers.getContractFactory("Exchange")
    
    const deployer = accounts[0];
    const user1 = accounts[1];
    const tokenA = Token.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    const mETH = Token.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
    const exchange = Exchange.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");

    const amount = hre.ethers.utils.parseEther("100");

    ///deposit tokens
    await tokenA.connect(deployer).transfer(user1.address, amount)
    await tokenA.connect(user1).approve(exchange.address, amount)
    await exchange.connect(user1).depositToken(tokenA.address, amount)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
