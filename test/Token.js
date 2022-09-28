const {expect} = require("chai");
const {ethers} = require("hardhat");
  
  describe("Token", function () {

    let token, accounts, deployer, receiver1;

    const name = "Dapp University";
    const symbol = "DAPP";
    const deciamls = 18;
    const totalSupply = 100000;

    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    const deployToken = async(name, symbol, totalSupply) => {
        const Token = await ethers.getContractFactory("Token");
        const token = await Token.deploy(name, symbol, totalSupply);
        return token
    }

    const toWei = (n) => {
        return ethers.utils.parseUnits(n.toString(),"ether")
    }

    const fromWei = (n) => {
        return ethers.utils.formatUnits(n.toString(),"ether")
    }

    beforeEach(async() => {
        token = await deployToken("Dapp University", "DAPP", "100000") ;
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        receiver1 = accounts[1];
    })

  
    describe("Deployment", function () {

      it("Should have a correct name", async() => {
        expect(await token.name()).to.equal(name);
      });
      it("Should have a correct symbol", async() => { 
        expect(await token.symbol()).to.equal(symbol);
      });
      it("Should have a correct decimals", async() => { 
        expect(await token.decimals()).to.equal(deciamls);
      });
      it("Should have a correct total supply", async() => {
        expect(await token.totalSupply()).to.equal(toWei(totalSupply));
      });
      it("Should assign total supply to deployer", async() => {
        expect(await token.balanceOf(deployer.address)).to.equal(toWei(totalSupply));
      });
    });

    describe("Sending Token", () => {
        let amount, transaction, result;

        describe("Success", () => {
            it("Transfers token balances", async() => {
                amount = 100;
                const deployerAmount0 = await token.balanceOf(deployer.address);
                const receiverAmount0 = await token.balanceOf(receiver1.address);
                transaction = await token.connect(deployer).transfer(receiver1.address, toWei(amount));
                result = await transaction.wait()
                const deployerAmount1 = await token.balanceOf(deployer.address);
                const receiverAmount1 = await token.balanceOf(receiver1.address);
                expect(deployerAmount1).to.equal(toWei(Number(fromWei(deployerAmount0))-amount))
                expect(receiverAmount1).to.equal(toWei(Number(fromWei(receiverAmount0))+amount))
            });
            it("Emits a Transfer Event", async() => {
                const event = result.events[0];
                expect(event.event).to.equal("Transfer");
                const args = event.args;
                expect(args._from).to.equal(deployer.address)
                expect(args._to).to.equal(receiver1.address)
                expect(Number(fromWei(args._value))).to.equal(amount)
            })
        })

        describe("Failure", () => {
            it("Rejects insufficient balance", async() => {
                const deployerAmount0 = await token.balanceOf(deployer.address);
                await expect(token.connect(deployer).transfer(receiver1.address, toWei(Number(fromWei(deployerAmount0))+1))).to.be.reverted;
            })
            it("Rejects invalid address", async() => {
                await expect(token.connect(deployer).transfer("0x0000000000000000000000000000000000000000", 1)).to.be.reverted;
            })
        })

    })
  });
  