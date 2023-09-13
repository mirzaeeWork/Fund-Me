import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const refundButton = document.getElementById("refundButton")
const getOwnerButton = document.getElementById("getOwnerButton")

connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance
refundButton.onclick = refund
getOwnerButton.onclick = getOwner

async function getOwner() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const Response = await contract.getOwner()
      getOwnerButton.innerHTML="owner : " + (Response.substring(0, 4) + '...' + Response.slice(-4))
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }

}
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }    
    const accounts = await ethereum.request({ method: "eth_accounts" })
    connectButton.innerHTML = "Connected : " + (accounts[0].substring(0, 4) + '...' + accounts[0].slice(-4))
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
      contract.once('Withdrawal', (arg1, arg2) => {
        // Handle event data here
        window.alert(`${arg1} owner address withdraw the amount of ${ethers.utils.formatEther(arg2.toString())} 
        Ether of the smart contract`)
      });

    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transactionResponse, provider)
      contract.once('Fund', (arg1, arg2) => {
        // Handle event data here
        window.alert(`${arg2} address sent the amount of ${ethers.utils.formatEther(arg1.toString())} 
        Ether to the smart contract`)
      });
      document.getElementById("ethAmount").value=""
      console.log("Done")
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function refund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`refunding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.refund(ethers.utils.parseEther(ethAmount))
      await listenForTransactionMine(transactionResponse, provider)
      contract.once('Refund', (arg1, arg2) => {
        // Handle event data here
        window.alert(`${arg2} address withdraw the amount of ${ethers.utils.formatEther(arg1.toString())} 
        Ether of the smart contract`)
        document.getElementById("ethAmount").value=""
      });
      console.log("Done")
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}


async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      balanceButton.innerHTML=ethers.utils.formatEther(balance)+ " Eth of smart contract"
      console.log(ethers.utils.formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`)
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        )
        resolve()
      })
    } catch (error) {
      reject(error)
    }
  })
}

