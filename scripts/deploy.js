const hre = require("hardhat");

async function main() {
  const CloneNFT = await hre.ethers.getContractFactory("CloneNFT");
  const cloneNFT = await CloneNFT.deploy();
  await cloneNFT.deployed();

  console.log("CloneNFT deployed to:", cloneNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
