// context/ContractContext.tsx
"use client";
import { cbWalletConnector } from "@/wagmi";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { baseSepolia } from "viem/chains";
import CloneNFTAbi from "@/artifacts/contracts/CloneNFT.sol/CloneNFT.json";
import { Abi, Address, Hex } from "viem";

export type CloneData = {
  tokenId: bigint;
  metadata: string;
};

type ContractContextType = {
  connectWallet: () => void;
  disconnectWallet: () => void;
  account?: ReturnType<typeof useAccount>;
  mintCloneNFT: (metadataURI: string) => Promise<Hex>;
  getOwnedClones: () => Promise<CloneData[]>;
  isCorrectNetwork: boolean;
  currentChainId?: number;
  contractAddress: Address;
  publicClient?: ReturnType<typeof usePublicClient>;
};

const ContractContext = createContext<ContractContextType | null>(null);
const CONTRACT_ADDRESS = "0x68B76bdD2d3E285dc76f5FDBD3cf63072561A3A6" as Address;
const CONTRACT_VERSION = "v2.1";

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
  
    const cacheKey = `clones-${CONTRACT_VERSION}-${account.address}`;
    try {
      // Check cache with BigInt revival
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached, (key, value) => {
          if (key === 'tokenId' && typeof value === 'string') {
            return BigInt(value);
          }
          return value;
        });
      }

      // Fetch fresh data
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CloneNFTAbi.abi as Abi,
        functionName: 'balanceOf',
        args: [account.address],
      });

      const clones: CloneData[] = [];
      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CloneNFTAbi.abi as Abi,
          functionName: 'tokenOfOwnerByIndex',
          args: [account.address, BigInt(i)],
        }) as bigint;
    
        const metadata = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CloneNFTAbi.abi as Abi,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string;

        clones.push({ tokenId, metadata });
      }

      // Store with BigInt serialization
      const serializableClones = clones.map(clone => ({
        ...clone,
        tokenId: clone.tokenId.toString()
      }));
      localStorage.setItem(cacheKey, JSON.stringify(serializableClones));

      return clones;
    } catch (error) {
      console.error("Error fetching clones:", error);
      localStorage.removeItem(cacheKey);
      return [];
    }
  };

  const mintCloneNFT = async (metadataURI: string): Promise<Hex> => {
    if (!account.address) throw new Error("Wallet not connected");
    if (!(await verifyNetwork()) && !(await handleSwitchNetwork())) {
      throw new Error("Network switch required");
    }

    if (!walletClient || !publicClient) {
      throw new Error("Wallet connection error");
    }

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: CloneNFTAbi.abi as Abi,
      functionName: "mintClone",
      args: [account.address, metadataURI],
      account: account.address,
    });

    // Clear relevant caches
    localStorage.removeItem(`clones-${CONTRACT_VERSION}-${account.address}`);
    
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
      contractAddress: CONTRACT_ADDRESS,
      publicClient,
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