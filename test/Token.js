const {expect} = require("chai");
const {ethers} = require("hardhat");
  
  describe("Token", function () {

    let token, accounts, deployer, receiver1;

    const name = "Dapp University";
    const symbol = "DAPP";
    const deciamls = 18;
    const totalSupply = 100000;

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
        exchange = accounts[2];
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
                let deployerAmount0 = await token.balanceOf(deployer.address);
                let receiverAmount0 = await token.balanceOf(receiver1.address);
                transaction = await token.connect(deployer).transfer(receiver1.address, toWei(amount));
                result = await transaction.wait()
                let deployerAmount1 = await token.balanceOf(deployer.address);
                let receiverAmount1 = await token.balanceOf(receiver1.address);
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

    describe("Approving Token", () => {
      let amount, transaction, result;

      beforeEach(async() => {
        amount = toWei(100)
        transaction = await token.connect(deployer).approve(exchange.address,amount)
        result = await transaction.wait()
      })

      describe("Success", async() => {
        it("Allocation an allowance", async() => {
          expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
        })

        it("Emits an Approval Event", async() => {
          const event = result.events[0];
          expect(event.event).to.equal("Approval");
          const args = event.args;
          expect(args._owner).to.equal(deployer.address)
          expect(args._spender).to.equal(exchange.address)
          expect(args._value).to.equal(amount)
        })

      })

      describe("Failure", () => {
        it("Rejects invalid address", async() => {
          await expect(token.connect(deployer).approve("0x0000000000000000000000000000000000000000", amount)).to.be.reverted;
      })
      })
    })

    describe("Transfer Token with Delegation", () => {
      let amount, transaction, result;

      beforeEach(async() => {
        amount = toWei(100)
        await token.connect(deployer).approve(exchange.address,amount)
      })

      describe("Success", async() => {
        it("Transfer Success", async() => {
          let deployerAmount0 = await token.balanceOf(deployer.address);
          let receiverAmount0 = await token.balanceOf(receiver1.address);
          let allowance = await token.allowance(deployer.address, exchange.address);
          transaction = await token.connect(exchange).transferFrom(deployer.address,receiver1.address, amount);
          result = await transaction.wait()
          let deployerAmount1 = await token.balanceOf(deployer.address);
          let receiverAmount1 = await token.balanceOf(receiver1.address);
          expect(deployerAmount1).to.equal(ethers.BigNumber.from(deployerAmount0).sub(amount))
          expect(receiverAmount1).to.equal(ethers.BigNumber.from(receiverAmount0).add(amount))
          expect( await token.allowance(deployer.address, exchange.address)).to.equal(ethers.BigNumber.from(allowance).sub(amount));
        })

        it("Emit a Transfer Event", async() => {
          const event = result.events[0];
          expect(event.event).to.equal("Transfer");
          const args = event.args;
          expect(args._from).to.equal(deployer.address)
          expect(args._to).to.equal(receiver1.address)
          expect(args._value).to.equal(amount)
        })
      }),

      describe("Failure", async() => {
        it("Rejects without approval", async() => {
          await expect(token.connect(exchange).transferFrom(deployer.address,receiver1.address, amount+1)).to.be.reverted;
        })
      })

    })
  });
  