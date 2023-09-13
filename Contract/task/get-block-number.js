const {task}=require("hardhat/config")

task("block-number","print Block Number").setAction(
    async (taskArgs,hre)=>{
        const BlockNumber = await hre.ethers.provider.getBlockNumber()
        console.log(`Current Block Number : ${BlockNumber}`)
    }
)
module.exports={}