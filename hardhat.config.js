require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: "https://base-sepolia.g.alchemy.com/v2/q4Yxz7w6Xy5AnJUlkVwIWHuIIeafZLij", // Base Sepolia RPC URL
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
