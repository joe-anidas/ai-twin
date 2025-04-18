const hre = require("hardhat");

async function main() {
  // const monadVerifierAddress = "0x16a4B85001795F7aD3dA8c1157A24d895998521e";

  const CloneNFT = await hre.ethers.getContractFactory("CloneNFT");
  const cloneNFT = await CloneNFT.deploy();

  await cloneNFT.waitForDeployment();

  // Use .target to get the contract address
  console.log("CloneNFT deployed to:", cloneNFT.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});