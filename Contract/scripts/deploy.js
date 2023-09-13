const hre = require("hardhat");

async function main() {

  const addressPriceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

  const fundMe = await hre.ethers.deployContract("FundMe",[addressPriceFeed] );

  await fundMe.waitForDeployment();

  console.log(
    `Contract Address  deployed to ${fundMe.target}`
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
