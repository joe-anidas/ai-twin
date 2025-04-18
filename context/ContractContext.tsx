// context/ContractContext.tsx
"use client";
import { cbWalletConnector } from "@/wagmi";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { baseSepolia } from "viem/chains";
import CloneNFTAbi from "../artifacts/contracts/CloneNFT.sol/CloneNFT.json";
import { Hex, createWalletClient, custom, Chain } from "viem";

type CloneData = {
  tokenId: bigint;
  metadata: string;
};

type ContractContextType = {
  connectWallet: () => void;
  disconnectWallet: () => void;
  account?: ReturnType<typeof useAccount>;
  mintCloneNFT: (metadataURI: string) => Promise<`0x${string}`>;
  getOwnedClones: () => Promise<CloneData[]>;
  isCorrectNetwork: boolean;
  currentChainId?: number;
};

const ContractContext = createContext<ContractContextType | null>(null);
const CONTRACT_ADDRESS = "0xC1494157287e86b2b29006127967a5D8e6773025";

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const { connect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const account = useAccount();
  const publicClient = usePublicClient();
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
    const correct = account.chainId === baseSepolia.id;
    setIsCorrectNetwork(correct);
    setCurrentChainId(account.chainId);
    return correct;
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

  const getOwnedClones = async (): Promise<CloneData[]> => {
    if (!publicClient || !account.address) return [];
  
    try {
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CloneNFTAbi.abi,
        functionName: 'balanceOf',
        args: [account.address],
      });
  
      const clones: CloneData[] = [];
      for (let i = 0; i < Number(balance); i++) {
        const tokenId: bigint = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CloneNFTAbi.abi,
          functionName: 'tokenOfOwnerByIndex',
          args: [account.address, BigInt(i)],
        }) as bigint;  // Type casting tokenId to bigint
    
        // Use tokenURI to get the metadata URI
        const metadata: string = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CloneNFTAbi.abi,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string;  // Type casting metadata to string
  
        clones.push({ tokenId, metadata });
      }
      return clones;
    } catch (error) {
      console.error("Error fetching clones:", error);
      return [];
    }
  };
    

  const mintCloneNFT = async (metadataURI: string): Promise<`0x${string}`> => {
    if (!account.address) throw new Error("Wallet not connected");
    if (!(await verifyNetwork()) && !(await handleSwitchNetwork())) {
      throw new Error("Network switch required");
    }

    if (!walletClient) throw new Error("Wallet client not available");
    if (!publicClient) {
      throw new Error("publicClient is not initialized");
    }     
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: CloneNFTAbi.abi,
      functionName: "mintClone",
      args: [account.address, metadataURI],
      account: account.address,
    });

    return walletClient.writeContract(request);
  };

  useEffect(() => { verifyNetwork(); }, [account.chainId]);

  return (
    <ContractContext.Provider value={{
      connectWallet,
      disconnectWallet,
      account,
      mintCloneNFT,
      getOwnedClones,
      isCorrectNetwork,
      currentChainId,
    }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) throw new Error("useContract must be used within a ContractProvider");
  return context;
};