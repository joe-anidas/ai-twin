import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { type Chain } from "viem";

// Explicit type for chains array
const supportedChains: [Chain, ...Chain[]] = [baseSepolia];

export const cbWalletConnector = coinbaseWallet({
  appName: "AI Twin NFT",
  preference: "smartWalletOnly",
});


export const config = createConfig({
  chains: supportedChains,
  connectors: [cbWalletConnector],
  transports: {
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL || 
      "https://base-sepolia.g.alchemy.com/v2/q4Yxz7w6Xy5AnJUlkVwIWHuIIeafZLij"
    ),
  },
  ssr: true,
  multiInjectedProviderDiscovery: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}