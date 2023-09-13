const { network } = require("hardhat")

//دو متغیر زیر تعریف شده constructor برای ورودی های 
//در فایل node_modules/@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol
const DECIMALS = "8"
const INITIAL_PRICE = "200000000000" // 2000*100000000 ==>eth/usd قیمت پایه برای 
//با 8 تا صفر usd در واقع 2000 
module.exports = async ({ getNamedAccounts, deployments }) => {
    //خط بالا را به صورت زیر هم می توان نوشت
    //module.exports = async (hre) => {
    //const { getNamedAccounts, deployments }=hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() //اولین اکانت در اینجا قرار می گیرد
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `npx hardhat console` to interact with the deployed smart contracts!"
        )
        log("------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
