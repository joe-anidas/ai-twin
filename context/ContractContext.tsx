"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
} from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/wagmi";
import { Hex, createWalletClient, custom, parseAbi } from "viem";
import { sepolia } from "viem/chains";

type ContractContextType = {
  connectWallet: () => void;
  disconnectWallet: () => void;
  account?: ReturnType<typeof useAccount>;
  mintTwinNFT: (metadataURI: string) => Promise<void>;
};

const ContractContext = createContext<ContractContextType | null>(null);

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
const ABI = parseAbi([
  "function mintModelNFT(address to, string memory metadataURI) public",
]);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const { connect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const account = useAccount();
  const publicClient = usePublicClient();

  const [signature, setSignature] = useState<Hex | undefined>();
  const [message, setMessage] = useState<SiweMessage | undefined>();
  const [valid, setValid] = useState<boolean | undefined>();

  const connectWallet = async () => {
    connect({ connector: cbWalletConnector });
    if (account?.address) {
      const chainId = account.chainId;
      const newMessage = new SiweMessage({
        domain: window.location.host,
        address: account.address,
        chainId,
        uri: window.location.origin,
        version: "1",
        statement: "Smart Wallet SIWE Example",
        nonce: "12345678",
      });
      setMessage(newMessage);
    }
  };

  const disconnectWallet = async () => {
    wagmiDisconnect();
    setSignature(undefined);
    setMessage(undefined);
    setValid(undefined);
  };

  const mintTwinNFT = async (metadataURI: string) => {
    if (!account.address || typeof window === "undefined") return;

    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom((window as any).ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "mintModelNFT",
      args: [account.address, metadataURI],
      account: account.address,
    });

    const tx = await walletClient.writeContract(request);
    console.log("Transaction Hash:", tx);
  };

  return (
    <ContractContext.Provider
      value={{ connectWallet, disconnectWallet, account, mintTwinNFT }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};
