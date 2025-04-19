const { ethers } = require("ethers");

// Use any Ethereum provider — replace with your actual provider URL
const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/q4Yxz7w6Xy5AnJUlkVwIWHuIIeafZLij");

const contractAddress = "0x68B76bdD2d3E285dc76f5FDBD3cf63072561A3A6";

async function getContractDeploymentBlock() {
  const txCount = await provider.getTransactionCount(contractAddress);
  if (txCount === 0) {
    console.log("This contract might be self-destructed or never deployed.");
    return;
  }

  // Scan backwards to find the deployment tx (usually the first one)
  const history = await provider.getHistory(contractAddress);
  if (history.length > 0) {
    const deploymentTx = history[0];
    const receipt = await provider.getTransactionReceipt(deploymentTx.hash);
    console.log(`Contract deployed at block number: ${receipt.blockNumber}`);
  } else {
    console.log("No transaction history found for this address.");
  }
}

getContractDeploymentBlock();