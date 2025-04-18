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
  useSwitchChain,
  useWalletClient, // Using wagmi's useWalletClient hook
} from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/wagmi";
import { Hex, createWalletClient, custom, Chain } from "viem";
import { baseSepolia } from "viem/chains";
import CloneNFTAbi from "../artifacts/contracts/CloneNFT.sol/CloneNFT.json";

type ContractContextType = {
  connectWallet: () => void;
  disconnectWallet: () => void;
  account?: ReturnType<typeof useAccount>;
  mintCloneNFT: (metadataURI: string) => Promise<Hex>;
  isCorrectNetwork: boolean;
  currentChainId?: number;
};

const ContractContext = createContext<ContractContextType | null>(null);
const CONTRACT_ADDRESS = "0x5739E77ecDaBA6D6614802465AC6025774D4cfDf";

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const { connect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const account = useAccount();
  const publicClient = usePublicClient();

  // Using wagmi's useWalletClient hook to get the reactive wallet client
  const { data: walletClient } = useWalletClient();

  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number>();

  const connectWallet = async () => {
    try {
      connect({ connector: cbWalletConnector });
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    wagmiDisconnect();
  };

  const verifyNetwork = async () => {
    if (account.chainId === baseSepolia.id) {
      setIsCorrectNetwork(true);
      setCurrentChainId(account.chainId);
      return true;
    }
    setIsCorrectNetwork(false);
    return false;
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: baseSepolia.id });
      return true;
    } catch (error) {
      console.error("Network switch failed:", error);
      return false;
    }
  };

  const mintCloneNFT = async (metadataURI: string): Promise<Hex> => {
    if (!account.address || typeof window === "undefined") {
      throw new Error("Wallet not connected");
    }

    // Verify network and switch if needed
    if (!(await verifyNetwork())) {
      const switched = await handleSwitchNetwork();
      if (!switched) throw new Error("Network switch required");
    }

    // Ensure the wallet client is created and ready
    if (!walletClient) {
      throw new Error("Wallet client not available");
    }

    // Double-check chain after potential switch
    const chainId = await walletClient.getChainId();
    if (chainId !== baseSepolia.id) {
      throw new Error(`Wrong network. Current chain: ${chainId}, Required: ${baseSepolia.id}`);
    }

    if (!publicClient) {
      throw new Error("publicClient is not defined");
    }

    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: CloneNFTAbi.abi,
        functionName: "mintClone",
        args: [account.address, metadataURI],
        account: account.address,
        chain: baseSepolia,
      });

      const txHash = await walletClient.writeContract(request);
      return txHash;
    } catch (error) {
      console.error("Minting error:", error);
      throw error;
    }
  };

  useEffect(() => {
    verifyNetwork();
  }, [account.chainId]);

  return (
    <ContractContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        account,
        mintCloneNFT,
        isCorrectNetwork,
        currentChainId,
      }}
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
