require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require('hardhat-deploy');
require("hardhat-deploy-ethers")
require("./task/get-block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.Infura_API_KEY}`,
      accounts: [process.env.Account_PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.Infura_API_KEY}`,
      accounts: [process.env.Account_PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6
    },
    localhost: {
      url: `http://127.0.0.1:8545/`,
      chainId: 31337,
    },

  },
  etherscan: {
    apiKey: process.env.Etherscan_ApiKey,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    // noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,//https://pro.coinmarketcap.com/account در سایت روبرو بدست می آید
    // token:"AVAX"
}


};
