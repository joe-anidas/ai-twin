require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://sepolia.base.org", // Base Sepolia RPC URL
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
