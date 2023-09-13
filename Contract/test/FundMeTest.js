const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
    let fundMe
    let mockV3Aggregator
    let deployer
    const startTime = 10 // 10 seconds
    const endTime = 315 // 120 seconds
    const allowedTime=100 //100 seconds
    // const sendValue = ethers.utils.parseUnit("1", "ether")
    const sendValue = hre.ethers.parseEther("1");
    beforeEach(async () => {
      // const accounts = await ethers.getSigners()
      // deployer = accounts[0]
      deployer = (await getNamedAccounts()).deployer
      //اجرا می شود deploy توسط خط زیر تمام فایلهای داخل پوشه 
      await deployments.fixture(["all"])
      fundMe = await ethers.getContract("FundMe", deployer)
      mockV3Aggregator = await ethers.getContract(
        "MockV3Aggregator",
        deployer
      )
    })

    describe("constructor", function () {
      it("sets the aggregator addresses correctly", async () => {

        const response = await fundMe.getPriceFeed()
        assert.equal(response, mockV3Aggregator.target)
      })
    })

    describe("owner", function () {
      it("sets address owner correctly", async () => {

        const response = await fundMe.getOwner()
        assert.equal(response, deployer)
      })
    })

    describe("fund", function () {
      // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
      // could also do assert.fail
      it("Fails if you don't send enough ETH", async () => {
        await expect(fundMe.fund()).to.be.revertedWith(
          "You need to spend more ETH!"
        )
      })

      it("Fails if  the fund time has not started", async () => {
        await expect(fundMe.fund({ value: sendValue })).to.be.revertedWith(
          "The fund time has not started"
        )
      })

      it("Fails if time is over", async () => {
        ethers.provider.send("evm_increaseTime", [startTime + endTime])
        ethers.provider.send("evm_mine")      // mine the next block
        await expect(fundMe.fund({ value: sendValue })).to.be.revertedWith(
          "time is over"
        )
      })

      it("Updates the amount funded data structure", async () => {
        ethers.provider.send("evm_increaseTime", [startTime])
        ethers.provider.send("evm_mine")      // mine the next block
        await fundMe.fund({ value: sendValue })
        const response = await fundMe.getAddressToAmountFunded(
          deployer
        )
        assert.equal(response.toString(), sendValue.toString())
      })
      it("Adds funder to array of funders", async () => {
        ethers.provider.send("evm_increaseTime", [startTime])
        ethers.provider.send("evm_mine")      // mine the next block
        await fundMe.fund({ value: sendValue })
        const response = await fundMe.getFunder(0)
        assert.equal(response, deployer)
      })
    })

    describe("refund", function () {
      beforeEach(async () => {
        ethers.provider.send("evm_increaseTime", [startTime])
        ethers.provider.send("evm_mine")      // mine the next block
        await fundMe.fund({ value: sendValue })
      })


      it("Fails if The value entered is not valid", async () => {
        const amount = hre.ethers.parseEther("1.1");
        await expect(fundMe.refund(amount)).to.be.revertedWith(
          "The value entered is not valid"
        )
      })

      it("Fails if time is over", async () => {
        ethers.provider.send("evm_increaseTime", [endTime])
        ethers.provider.send("evm_mine")      // mine the next block
        const amount = hre.ethers.parseEther("0.5");
        await expect(fundMe.refund(amount)).to.be.revertedWith(
          'time is over'
        )
      })


      it("Updates the amount refunded data structure", async () => {
        const amount = hre.ethers.parseEther("0.5");
        await expect(fundMe.refund(amount)).to.emit(fundMe, "Refund")
          .withArgs(amount, deployer);
      })

    })



    describe("withdraw", function () {
      beforeEach(async () => {
        ethers.provider.send("evm_increaseTime", [startTime])
        ethers.provider.send("evm_mine")      // mine the next block
        await fundMe.fund({ value: sendValue })
      })
      it("Fails if time is not over", async () => {
        ethers.provider.send("evm_increaseTime", [allowedTime])
        ethers.provider.send("evm_mine")      // mine the next block
        await expect(fundMe.withdraw()).to.be.revertedWith(
          "Time is not over"
        )
      })

      it("withdraws ETH from a single funder", async () => {
        // Arrange
        ethers.provider.send("evm_increaseTime", [endTime])
        ethers.provider.send("evm_mine")      // mine the next block
        const startingFundMeBalance =
          await fundMe.getBalance(fundMe.target)
        const startingDeployerBalance =
          await fundMe.getBalance(deployer)

        // Act
        const transactionResponse = await fundMe.withdraw()
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, gasPrice } = transactionReceipt
        console.log("gasPrice : ", gasPrice)
        const gasCost = gasUsed * gasPrice

        const endingFundMeBalance = await fundMe.getBalance(fundMe.target)
        const endingDeployerBalance = await fundMe.getBalance(deployer)

        // Assert
        // Maybe clean up to understand the testing
        assert.equal(endingFundMeBalance, 0)
        assert.equal(
          (startingFundMeBalance + startingDeployerBalance).toString(),
          (endingDeployerBalance + gasCost).toString()
        )
      })

      //   this test is overloaded. Ideally we'd split it into multiple tests
      //   but for simplicity we left it as one
      it("is allows us to withdraw with multiple funders", async () => {
        // Arrange
        ethers.provider.send("evm_increaseTime", [startTime])
        ethers.provider.send("evm_mine")      // mine the next block
        const accounts = await ethers.getSigners()
        for (i = 1; i < 6; i++) {
          await fundMe.connect(accounts[i]).fund({ value: sendValue })
        }
        const startingFundMeBalance =
          await fundMe.getBalance(fundMe.target)
        const startingDeployerBalance =
          await fundMe.getBalance(deployer)

        // Act
        ethers.provider.send("evm_increaseTime", [endTime])
        ethers.provider.send("evm_mine")      // mine the next block
        const transactionResponse = await fundMe.cheaperWithdraw()
        // Let's comapre gas costs :)
        // const transactionResponse = await fundMe.withdraw()
        const transactionReceipt = await transactionResponse.wait()
        const { gasUsed, gasPrice } = transactionReceipt
        const withdrawGasCost = gasUsed * gasPrice
        console.log(`GasCost: ${withdrawGasCost}`)
        console.log(`GasUsed: ${gasUsed}`)
        console.log(`GasPrice: ${gasPrice}`)
        const endingFundMeBalance = await fundMe.getBalance(
          fundMe.target
        )
        const endingDeployerBalance =
          await fundMe.getBalance(deployer)
        // Assert
        assert.equal(
          (startingFundMeBalance + startingDeployerBalance).toString(),
          (endingDeployerBalance + withdrawGasCost).toString()
        )
        // Make a getter for storage variables
        await expect(fundMe.getFunder(0)).to.be.reverted

        for (i = 1; i < 6; i++) {
          assert.equal(
            await fundMe.getAddressToAmountFunded(
              accounts[i].address
            ),
            0
          )
        }
      })
      it("Only allows the owner to withdraw", async function () {
        const accounts = await ethers.getSigners()
        //deployer == accounts[0]
        ethers.provider.send("evm_increaseTime", [endTime])
        ethers.provider.send("evm_mine")      // mine the next block
        await expect(
          fundMe.connect(accounts[1]).withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
      })
    })
  })



