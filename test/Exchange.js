const {expect} = require("chai");
const {ethers} = require("hardhat");

const toWei = (n) => {
    return ethers.utils.parseUnits(n.toString(),"ether")
}

const fromWei = (n) => {
    return ethers.utils.formatUnits(n.toString(),"ether")
}

describe("Exchange", () => {
    let deployer, feeAccount, feePercent, exchange, token1, token2, user1, user2

    beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        feePercent = 10

        const Exchange = await ethers.getContractFactory("Exchange")
        exchange = await Exchange.deploy(feeAccount.address, feePercent)

        const Token = await ethers.getContractFactory("Token")
        token1 = await Token.deploy("mockToken1", "MT1", "100000")
        token2 = await Token.deploy("mockDai", "mDai", "100000")

        user1 = accounts[2]
        user2 = accounts[3]


    })

    describe("Deployment", () => {

        it("Track the fee accounts", async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it("Track the fee percent", async () => {
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    })

    describe("Deposit Tokens", () => {
        let amount, transaction, result;
        amount = toWei(100);

        beforeEach(async () => {
            await token1.connect(deployer).transfer(user1.address, amount)
            await token1.connect(deployer).transfer(user2.address, amount)

            //Approve Tokens
            await token1.connect(user1).approve(exchange.address, amount)

            //Transfer Tokens
            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result = await transaction.wait()

        })

        describe("Success", async() => {
            it("Tracke the token deposits", async () => {
                expect(await exchange.connect(user1).balanceOf(token1.address)).to.equal(amount)
            })
            it("Emit a deposit Event", async() => {
                const event = result.events[2];
                expect(event.event).to.equal("DepositToken");
                const args = event.args;
                expect(args._token).to.equal(token1.address)
                expect(args._user).to.equal(user1.address)
                expect(args._amount).to.equal(amount)
                expect(args._balance).to.equal(amount)
            })
        })

        describe("Failure", async() => {
            it("Rejects without approval", async() => {
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
            })
        })

    })

    describe("Withdraw Tokens", () => {
        let amount, transaction, result;
        amount = toWei(100);

        beforeEach(async () => {

            await token1.connect(deployer).transfer(user1.address, amount)
            await token1.connect(deployer).transfer(user2.address, amount)

            //Approve Tokens
            await token1.connect(user1).approve(exchange.address, amount)

            //Transfer Tokens
            await exchange.connect(user1).depositToken(token1.address, amount)
            
            //withdrawTokens
            transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
            result = await transaction.wait()
        })

        describe("Success", async() => {
            it("Tracke the token withdraw", async () => {
                expect(await exchange.connect(user1).balanceOf(token1.address)).to.equal(0)
                expect(await token1.connect(user1).balanceOf(user1.address)).to.equal(amount)
            })
            it("Emit a Withdraw Event", async() => {
                const event = result.events[1];
                expect(event.event).to.equal("WithdrawToken");
                const args = event.args;
                expect(args._token).to.equal(token1.address)
                expect(args._user).to.equal(user1.address)
                expect(args._amount).to.equal(amount)
                expect(args._balance).to.equal(0)
            })
        })

        describe("Failure", async() => {
            it("fails for insufficient balance", async() => {
                await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted;
            })
        })
    })

    describe("Checking Balances", () => {
        let transaction, result
        let amount = toWei(100)

        beforeEach(async() => {

            await token1.connect(deployer).transfer(user1.address, amount)
            await token1.connect(deployer).transfer(user2.address, amount)

            //Approve Tokens
            await token1.connect(user1).approve(exchange.address, amount)

            //Transfer Tokens
            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result = await transaction.wait()
        })

        it("Tracke the token balance", async () => {
            expect(await exchange.connect(user1).balanceOf(token1.address)).to.equal(amount)
        })
    })

    describe("Making Order", () => {
        let transaction, result
        let amount = toWei(100)

        beforeEach(async() => {

            await token1.connect(deployer).transfer(user1.address, amount)
            await token1.connect(deployer).transfer(user2.address, amount)

            //Approve Tokens
            await token1.connect(user1).approve(exchange.address, amount)

            //Transfer Tokens
            await exchange.connect(user1).depositToken(token1.address, amount)
            
            transaction = await exchange.connect(user1).makeOrder(
                token2.address,
                toWei(1),
                token1.address,
                toWei(1),
            )

            result = await transaction.wait();
        })

        describe("Success", async() => {
            it("Track the newly created order", async () => {
                expect(await exchange.orderCount()).to.equal(1);
            })

            it("Emit a NewOrder Event", async() => {
                const event = result.events[0];
                expect(event.event).to.equal("NewOrder");
                const args = event.args;
                expect(args._id).to.equal(1)
                expect(args._user).to.equal(user1.address)
                expect(args._tokenGet).to.equal(token2.address)
                expect(args._amountGet).to.equal(toWei(1))
                expect(args._tokenGive).to.equal(token1.address)
                expect(args._amountGive).to.equal(toWei(1))
                expect(args._timestamp).to.at.least(1)
            })
        })

        describe("Failure", async() => {
            it("Test with no deposit balance", async() => {
                await expect( exchange.connect(user1).makeOrder(
                    token2.address,
                    toWei(1),
                    token1.address,
                    toWei(101),
                )).to.be.reverted
            })
        })
    })

    describe("Order actions", () => {
        let transaction, result
        let amount = toWei(10)

        beforeEach(async() => {

            await token1.connect(deployer).transfer(user1.address, amount)
            await token1.connect(deployer).transfer(user2.address, toWei(11))
            await token2.connect(deployer).transfer(user1.address, amount)
            await token2.connect(deployer).transfer(user2.address, toWei(11))

            //Approve Tokens
            await token1.connect(user1).approve(exchange.address, amount)

            //Transfer Tokens
            await exchange.connect(user1).depositToken(token1.address, amount)
            
            await exchange.connect(user1).makeOrder(
                token2.address,
                amount,
                token1.address,
                amount,
            )
        })

        describe("Cancel Order", async() => {

            describe("Success", () => {

                beforeEach(async () => {
                    transaction = await exchange.connect(user1).cancelOrder(1);
                    result = await transaction.wait();
                })

                it("update canceled order", async () => {
                    expect(await exchange.orderCanceled(1)).to.equal(true);
                })
    
                it("Emit a CancelOrder Event", async() => {
                    const event = result.events[0];
                    expect(event.event).to.equal("CancelOrder");
                    const args = event.args;
                    expect(args._id).to.equal(1)
                    expect(args._user).to.equal(user1.address)
                    expect(args._tokenGet).to.equal(token2.address)
                    expect(args._amountGet).to.equal(amount)
                    expect(args._tokenGive).to.equal(token1.address)
                    expect(args._amountGive).to.equal(amount)
                    expect(args._timestamp).to.at.least(1)
                })
            })

            describe("Failure", async() => {
                it("Reject invalid order ids", async() => {
                    await expect( exchange.connect(user1).cancelOrder(2)).to.be.reverted
                }),
                it("Reject invalid users", async() => {
                    await expect( exchange.connect(user2).cancelOrder(1)).to.be.reverted
                })
            })
        })

        describe("Fill Order", async() => {

            describe("Success", () => {

                beforeEach(async () => {
                //Approve Tokens
                await token2.connect(user2).approve(exchange.address, toWei(11))

                //Transfer Tokens
                await exchange.connect(user2).depositToken(token2.address, toWei(11))

                transaction = await exchange.connect(user2).fillOrder(1);
                result = await transaction.wait();
                })

                it("Fill Order", async () => {
                    // Token Give
                     expect(await exchange.userBalance(token1.address, user1.address)).to.equal(toWei(0));
                     expect(await exchange.userBalance(token1.address, user2.address)).to.equal(toWei(10));
                     expect(await exchange.userBalance(token1.address, feeAccount.address)).to.equal(toWei(0));
                    // // Token Get
                     expect(await exchange.userBalance(token2.address, user1.address)).to.equal(toWei(10));
                     expect(await exchange.userBalance(token2.address, user2.address)).to.equal(toWei(0));
                     expect(await exchange.userBalance(token2.address, feeAccount.address)).to.equal(toWei(1));
                })

                it("Emit a Trade Event", async() => {
                    const event = result.events[0];
                    expect(event.event).to.equal("Trade");
                    const args = event.args;
                    expect(args._id).to.equal(1)
                    expect(args._user).to.equal(user2.address)
                    expect(args._tokenGet).to.equal(token2.address)
                    expect(args._amountGet).to.equal(amount)
                    expect(args._tokenGive).to.equal(token1.address)
                    expect(args._amountGive).to.equal(amount)
                    expect(args._creator).to.equal(user1.address)
                    expect(args._timestamp).to.at.least(1)
                })

                it("Update field order", async() => {
                    expect(await exchange.orderFilled(1)).to.equal(true)
                })
            })

            describe("Failure", () => {

                beforeEach(async () => {
                //Approve Tokens
                await token2.connect(user2).approve(exchange.address, toWei(11))

                //Transfer Tokens
                await exchange.connect(user2).depositToken(token2.address, toWei(11))

                transaction = await exchange.connect(user2).fillOrder(1);
                result = await transaction.wait();

                })

                it("Reject Invalid Order Ids", async () => {
                    await expect(exchange.connect(user2).fillOrder(2)).to.be.reverted
                })

                it("Reject Cancelled Order Ids", async () => {
                    await exchange.connect(user1).cancelOrder(1);
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
                })

                it("Reject Filles Order Ids", async () => {
                    await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
                })


            })
        })


    })
})